/**
 * @file Chiến Kỹ Combat Engine — Stack + CD Chain + Summon
 * @description Module overlay cho combat.js, xử lý mechanics chiến kỹ:
 *   - Stack effects (Kiếm Trảm, Huyết Sát, Xuyên Thấu...)
 *   - CD chain (Võ Kỹ → stack → Tuyệt Kỹ giảm CD)
 *   - Summon entities (Kiếm Thánh, phân thân, cự kiếm)
 *   - Nghịch Thiên passive triggers
 *   - Tâm Pháp on-event effects
 *
 * Bám sát cơ chế game gốc:
 *   - Võ Kỹ gây damage + tích stack
 *   - Đủ stack → Tuyệt Kỹ nhận bonus + giảm CD Thân Pháp
 *   - Thần Thông triệu hồi entity tự đánh
 *   - Phân thân (Thủy) dùng Thần Thông miễn phí
 */

const db = require('../database/connection');
const voKyConfig = require('../../config/vo-ky');
const thanPhapConfig = require('../../config/than-phap');
const tuyetKyConfig = require('../../config/tuyet-ky');
const thanThongConfig = require('../../config/than-thong');
const nghichThienConfig = require('../../config/nghich-thien');
const tamPhapConfig = require('../../config/tam-phap');
const weaponTypes = require('../../config/weapon-types');
const { clamp, chance } = require('../utils/helpers');

// ═══════════════════════════════════════════
//  CHIẾN KỸ COMBAT STATE
// ═══════════════════════════════════════════

/**
 * Tạo chiến kỹ combat state cho player
 * @param {Object} player - Player DB row
 * @returns {Object} Chiến Kỹ state
 */
function buildQcbhState(player) {
  // Load skills từ DB
  const skillSlots = db.prepare(
    'SELECT slot_type, skill_id, skill_level, options_json FROM player_skill_slots WHERE player_id = ?'
  ).all(player.id);

  const nghichThienTraits = db.prepare(
    'SELECT trait_id FROM player_nghich_thien WHERE player_id = ?'
  ).all(player.id).map(r => r.trait_id);

  const tamPhapSlots = db.prepare(
    'SELECT slot_type, tam_phap_id, level, options_json FROM player_tam_phap WHERE player_id = ?'
  ).all(player.id);

  const slotMap = {};
  for (const s of skillSlots) {
    const config = getSkillConfig(s.slot_type, s.skill_id);
    slotMap[s.slot_type] = {
      ...s,
      config,
      options: s.options_json ? JSON.parse(s.options_json) : [],
    };
  }

  const tamPhapMap = {};
  for (const tp of tamPhapSlots) {
    tamPhapMap[tp.slot_type] = {
      ...tp,
      config: tamPhapConfig.getTamPhapById(tp.tam_phap_id),
      options: tp.options_json ? JSON.parse(tp.options_json) : [],
    };
  }

  // Load nghịch thiên effects
  const nghichThienEffects = {};
  for (const tid of nghichThienTraits) {
    const trait = nghichThienConfig.getNghichThienById(tid);
    if (trait && trait.effect) {
      Object.assign(nghichThienEffects, trait.effect);
    }
  }

  const weaponType = player.weapon_type;
  const wt = weaponType ? weaponTypes.getWeaponTypeById(weaponType) : null;

  return {
    skills: slotMap,
    tamPhap: tamPhapMap,
    nghichThienTraits,
    nghichThienEffects,
    weaponType,
    weaponConfig: wt,

    // ═══ STACK TRACKING ═══
    stacks: {},           // { stack_type: count }
    stackDurations: {},   // { stack_type: turns_remaining }

    // ═══ COOLDOWNS ═══
    cooldowns: {
      vo_ky: 0,
      than_phap: 0,
      tuyet_ky: 0,
      than_thong: 0,
    },

    // ═══ SUMMON ENTITIES ═══
    summons: [],  // { type, damage_percent, duration, can_cast_than_thong }

    // ═══ PHÂN THÂN ═══
    clones: [],   // { hp, damage_percent, can_use_than_thong, duration }

    // ═══ BUFFS/DEBUFFS ═══
    activeBuffs: [],   // { id, type, value, duration }
    activeDebuffs: [],

    // ═══ COUNTERS ═══
    hitCount: 0,        // Tổng số hit (cho Hồng Trần Kiếm Hạp)
    killCount: 0,       // Số mobs đã hạ (cho on_kill triggers)

    // ═══ THÂN PHÁP STATE ═══
    thanPhapActive: false,
    thanPhapDuration: 0,
    dodgePercent: 0,

    // ═══ TRANSFORM STATE ═══
    isTransformed: false,
    transformDuration: 0,
  };
}

/**
 * Lấy config skill theo slot type
 */
function getSkillConfig(slotType, skillId) {
  switch (slotType) {
    case 'vo_ky': return voKyConfig.getVoKyById(skillId);
    case 'than_phap': return thanPhapConfig.getThanPhapById(skillId);
    case 'tuyet_ky': return tuyetKyConfig.getTuyetKyById(skillId);
    case 'than_thong': return thanThongConfig.getThanThongById(skillId);
    default: return null;
  }
}

// ═══════════════════════════════════════════
//  SKILL EXECUTION
// ═══════════════════════════════════════════

/**
 * Thực thi Võ Kỹ — tấn công + tích stack
 * @returns {Object} { damage, log[], stacksGained }
 */
function executeVoKy(qcbhState, attacker, defender, turnLog) {
  const slot = qcbhState.skills.vo_ky;
  if (!slot || !slot.config) return { damage: 0, log: [] };
  if (qcbhState.cooldowns.vo_ky > 0) return { damage: 0, log: ['⏳ Võ Kỹ đang hồi chiêu'] };

  const skill = slot.config;
  const log = [];

  // Tính damage
  let baseDamage = Math.floor(attacker.atk * (skill.damage_mult || 1.0));
  let hitCount = skill.hit_count || 1;

  // Áp dụng options
  for (const opt of slot.options) {
    if (opt.id === 'damage_bonus') baseDamage = Math.floor(baseDamage * (1 + (opt.value || 0) / 100));
    if (opt.id === 'hit_count') hitCount += Math.floor(opt.value || 0);
  }

  let totalDamage = 0;
  for (let i = 0; i < hitCount; i++) {
    const dmg = Math.max(1, baseDamage - Math.floor(defender.def * 0.3));
    totalDamage += dmg;
    qcbhState.hitCount++;
  }

  log.push(`${skill.emoji} **${skill.name}** x${hitCount} → **${totalDamage}** sát thương!`);

  // ═══ TÍCH STACK ═══
  if (skill.stack_effect) {
    const se = skill.stack_effect;
    let stackGain = se.stacks_per_hit || 1;

    // Bí Quyển bonus
    const biQuyen = qcbhState.tamPhap.bi_quyen;
    if (biQuyen && biQuyen.config && biQuyen.config.base_effects) {
      stackGain += biQuyen.config.base_effects.stack_build_bonus || 0;
    }

    const currentStacks = qcbhState.stacks[se.type] || 0;
    const maxStacks = se.max_stacks || 99;
    const newStacks = Math.min(currentStacks + (stackGain * hitCount), maxStacks);
    qcbhState.stacks[se.type] = newStacks;
    qcbhState.stackDurations[se.type] = se.duration || 10;

    log.push(`  📊 ${se.type}: ${currentStacks} → **${newStacks}** tầng`);

    // Stack thresholds
    if (se.on_threshold) {
      for (const threshold of se.on_threshold) {
        if (newStacks >= threshold.stacks && currentStacks < threshold.stacks) {
          if (threshold.effect.cd_than_phap_reduction) {
            qcbhState.cooldowns.than_phap = Math.max(0,
              qcbhState.cooldowns.than_phap - threshold.effect.cd_than_phap_reduction
            );
            log.push(`  ⚡ ${threshold.stacks} tầng! -${threshold.effect.cd_than_phap_reduction} CD Thân Pháp!`);
          }
          if (threshold.effect.bonus_damage_percent) {
            totalDamage += Math.floor(totalDamage * threshold.effect.bonus_damage_percent / 100);
            log.push(`  💥 +${threshold.effect.bonus_damage_percent}% damage bonus!`);
          }
        }
      }
    }

    // Xuất Huyết (bleed DoT)
    if (se.on_max_bleed && newStacks >= maxStacks) {
      const bleedDmg = Math.floor(attacker.atk * se.on_max_bleed.bleed_percent / 100);
      qcbhState.activeDebuffs.push({
        id: 'xuat_huyet',
        type: 'dot',
        value: bleedDmg,
        duration: se.on_max_bleed.bleed_duration || 3,
        target: 'enemy',
      });
      log.push(`  🩸 Xuất Huyết! ${bleedDmg}/lượt trong ${se.on_max_bleed.bleed_duration} lượt`);
    }
  }

  // Set cooldown
  let cd = skill.cooldown_turns || 0;
  // Đại Pháp CD reduction
  const daiPhap = qcbhState.tamPhap.dai_phap;
  if (daiPhap && daiPhap.config && daiPhap.config.base_effects) {
    const cdRed = daiPhap.config.base_effects.cd_vo_ky_reduction_percent || 0;
    cd = Math.max(0, Math.floor(cd * (1 - cdRed / 100)));
  }
  // Vũ Pháp CD reduction
  if (qcbhState.nghichThienEffects.cooldown_reduction_all_percent) {
    cd = Math.max(0, Math.floor(cd * (1 - qcbhState.nghichThienEffects.cooldown_reduction_all_percent / 100)));
  }
  qcbhState.cooldowns.vo_ky = cd;

  return { damage: totalDamage, log };
}

/**
 * Thực thi Thân Pháp — buff/dodge/clone
 */
function executeThanPhap(qcbhState, attacker, turnLog) {
  const slot = qcbhState.skills.than_phap;
  if (!slot || !slot.config) return { log: [] };
  if (qcbhState.cooldowns.than_phap > 0) return { log: ['⏳ Thân Pháp đang hồi chiêu'] };
  if (attacker.mana < (slot.config.mana_cost || 0)) return { log: ['💔 Không đủ linh lực'] };

  const skill = slot.config;
  const log = [];
  attacker.mana -= skill.mana_cost || 0;

  log.push(`${skill.emoji} **${skill.name}** kích hoạt!`);

  const effect = skill.effect;
  const duration = skill.duration_turns || 2;

  switch (effect.type) {
    case 'ne_tranh': // Phong — bất tử
      qcbhState.thanPhapActive = true;
      qcbhState.thanPhapDuration = duration;
      qcbhState.dodgePercent = effect.dodge_percent || 100;
      log.push(`  🌪️ Bất tử ${duration} lượt! Né 100% sát thương!`);
      if (effect.toan_phong) {
        log.push(`  🌪️ Toàn Phong hút quái! ${effect.toan_phong_damage_per_turn}% ATK/lượt`);
      }
      break;

    case 'huyen_anh': // Thủy — phân thân
      const cloneCount = effect.clone_count || 4;
      for (let i = 0; i < cloneCount; i++) {
        qcbhState.clones.push({
          hp: Math.floor(attacker.maxHp * 0.3),
          damage_percent: effect.clone_damage_percent || 40,
          can_use_than_thong: effect.clone_can_use_than_thong || false,
          duration: duration,
        });
      }
      log.push(`  💧 Tạo ${cloneCount} huyễn ảnh! Damage ${effect.clone_damage_percent}%`);
      if (effect.clone_can_use_than_thong) {
        log.push(`  💧 Huyễn ảnh có thể dùng Thần Thông!`);
      }
      break;

    case 'ngu_kiem': // Kiếm — ngự kiếm bay
      qcbhState.thanPhapActive = true;
      qcbhState.thanPhapDuration = duration;
      qcbhState.activeBuffs.push(
        { id: 'ngu_kiem_speed', type: 'speed_percent', value: effect.speed_bonus_percent || 80, duration },
        { id: 'ngu_kiem_damage', type: 'damage_percent', value: effect.damage_bonus_while_active || 25, duration },
        { id: 'ngu_kiem_dr', type: 'damage_reduction', value: effect.damage_reduction_percent || 30, duration },
      );
      // Giảm CD Võ Kỹ
      if (effect.cd_reduction_vo_ky_percent) {
        qcbhState.cooldowns.vo_ky = Math.max(0,
          Math.floor(qcbhState.cooldowns.vo_ky * (1 - effect.cd_reduction_vo_ky_percent / 100))
        );
        log.push(`  🗡️ -${effect.cd_reduction_vo_ky_percent}% CD Võ Kỹ!`);
      }
      log.push(`  🗡️ Ngự kiếm bay! +${effect.speed_bonus_percent}% speed, +${effect.damage_bonus_while_active}% damage`);
      break;

    case 'bung_no': // Hỏa
      const aoeDmg = Math.floor(attacker.atk * (effect.aoe_damage_on_activate || 80) / 100);
      log.push(`  🔥 Bùng nổ! AOE ${aoeDmg} damage`);
      if (effect.burn_dot_percent) {
        qcbhState.activeDebuffs.push({
          id: 'thieu_dot', type: 'dot',
          value: Math.floor(attacker.atk * effect.burn_dot_percent / 100),
          duration: effect.burn_duration || 3,
          target: 'enemy',
        });
        log.push(`  🔥 Thiêu đốt ${effect.burn_dot_percent}% ATK/${effect.burn_duration} lượt`);
      }
      return { log, aoeDamage: aoeDmg };

    case 'dich_chuyen': // Lôi
      log.push(`  ⚡ Dịch chuyển tức thì!`);
      if (effect.stun_on_arrive) {
        qcbhState.activeDebuffs.push({
          id: 'stun', type: 'stun', value: 1, duration: effect.stun_duration || 1, target: 'enemy',
        });
        log.push(`  ⚡ Choáng ${effect.stun_duration || 1} lượt!`);
      }
      if (effect.damage_bonus_next_hit) {
        qcbhState.activeBuffs.push({
          id: 'loi_first_hit', type: 'damage_next_hit', value: effect.damage_bonus_next_hit, duration: 1,
        });
        log.push(`  ⚡ +${effect.damage_bonus_next_hit}% damage đòn tiếp theo!`);
      }
      break;

    case 'giap_dat': // Thổ
      qcbhState.thanPhapActive = true;
      qcbhState.thanPhapDuration = duration;
      const shieldHp = Math.floor(attacker.maxHp * (effect.shield_percent_max_hp || 30) / 100);
      qcbhState.activeBuffs.push(
        { id: 'giap_dat', type: 'shield', value: shieldHp, duration },
        { id: 'giap_dat_def', type: 'def_percent', value: effect.def_bonus_percent || 50, duration },
      );
      log.push(`  🪨 Giáp đất ${shieldHp} HP! +${effect.def_bonus_percent}% DEF`);
      break;

    case 'hoi_phuc': // Mộc
      const healPerTurn = Math.floor(attacker.maxHp * (effect.heal_per_turn_percent || 8) / 100);
      qcbhState.activeBuffs.push({
        id: 'moc_heal', type: 'hot', value: healPerTurn, duration,
      });
      if (effect.root_enemy) {
        qcbhState.activeDebuffs.push({
          id: 'root', type: 'root', value: 1, duration: effect.root_duration || 2, target: 'enemy',
        });
        log.push(`  🌿 Ràng buộc ${effect.root_duration} lượt!`);
      }
      if (effect.cleanse_debuff) {
        qcbhState.activeDebuffs = qcbhState.activeDebuffs.filter(d => d.target !== 'self');
        log.push(`  🌿 Tẩy debuff!`);
      }
      log.push(`  🌿 Hồi ${healPerTurn} HP/lượt trong ${duration} lượt`);
      break;
  }

  // Thần Công: khi dùng thân pháp → giảm CD tuyệt kỹ
  const thanCong = qcbhState.tamPhap.than_cong;
  if (thanCong && thanCong.config && thanCong.config.base_effects) {
    const cdRedTK = thanCong.config.base_effects.on_than_phap_cd_tuyet_ky || 0;
    if (cdRedTK > 0) {
      qcbhState.cooldowns.tuyet_ky = Math.max(0, qcbhState.cooldowns.tuyet_ky - cdRedTK);
      log.push(`  📕 Thần Công: -${cdRedTK} CD Tuyệt Kỹ!`);
    }
  }

  // Set cooldown
  let cd = skill.cooldown_turns || 0;
  if (qcbhState.nghichThienEffects.cooldown_reduction_all_percent) {
    cd = Math.max(0, Math.floor(cd * (1 - qcbhState.nghichThienEffects.cooldown_reduction_all_percent / 100)));
  }
  // Thần Công CD reduction cho thân pháp
  if (thanCong && thanCong.config && thanCong.config.base_effects) {
    cd = Math.max(0, cd - (thanCong.config.base_effects.cd_than_phap_reduction || 0));
  }
  qcbhState.cooldowns.than_phap = cd;

  return { log };
}

/**
 * Thực thi Tuyệt Kỹ — burst damage + stack interaction
 */
function executeTuyetKy(qcbhState, attacker, defender, turnLog) {
  const slot = qcbhState.skills.tuyet_ky;
  if (!slot || !slot.config) return { damage: 0, log: [] };
  if (qcbhState.cooldowns.tuyet_ky > 0) return { damage: 0, log: ['⏳ Tuyệt Kỹ đang hồi chiêu'] };
  if (attacker.mana < (slot.config.mana_cost || 0)) return { damage: 0, log: ['💔 Không đủ linh lực'] };

  const skill = slot.config;
  const log = [];
  attacker.mana -= skill.mana_cost || 0;

  let baseDamage = Math.floor(attacker.atk * (skill.damage_mult || 3.0));
  const hitCount = skill.hit_count || 1;

  log.push(`${skill.emoji} **${skill.name}** thi triển!`);

  // ═══ STACK INTERACTION ═══
  if (skill.stack_interaction) {
    const si = skill.stack_interaction;
    const currentStacks = qcbhState.stacks[si.stack_type] || 0;

    if (currentStacks >= si.required_stacks) {
      log.push(`  ✅ ${si.stack_type} đủ ${si.required_stacks} tầng!`);

      // Consume stacks nếu cần
      if (si.consume_stacks) {
        qcbhState.stacks[si.stack_type] = 0;
        log.push(`  📊 Tiêu hao ${currentStacks} tầng ${si.stack_type}`);
      }

      // Reward
      const reward = si.reward;
      if (reward.cd_reduction_than_phap) {
        qcbhState.cooldowns.than_phap = Math.max(0,
          qcbhState.cooldowns.than_phap - reward.cd_reduction_than_phap
        );
        log.push(`  ⚡ -${reward.cd_reduction_than_phap} CD Thân Pháp!`);
      }
      if (reward.extra_damage_percent) {
        baseDamage = Math.floor(baseDamage * (1 + reward.extra_damage_percent / 100));
        log.push(`  💥 +${reward.extra_damage_percent}% damage!`);
      }
      if (reward.lifesteal_bonus) {
        qcbhState.activeBuffs.push({
          id: 'lifesteal_bonus', type: 'lifesteal',
          value: reward.lifesteal_bonus,
          duration: reward.lifesteal_duration || 3,
        });
        log.push(`  🩸 +${reward.lifesteal_bonus}% hút máu ${reward.lifesteal_duration} lượt!`);
      }
      if (reward.stun_all) {
        qcbhState.activeDebuffs.push({
          id: 'stun', type: 'stun', value: 1,
          duration: reward.stun_duration || 2, target: 'enemy',
        });
        log.push(`  😵 Choáng ${reward.stun_duration} lượt!`);
      }
    } else {
      log.push(`  ⚠️ ${si.stack_type} chỉ có ${currentStacks}/${si.required_stacks} tầng`);
    }
  }

  // Linh Cộng Sinh: chance bắn thêm
  if (qcbhState.nghichThienEffects.extra_cast_chance) {
    if (chance(qcbhState.nghichThienEffects.extra_cast_chance)) {
      const extraCount = qcbhState.nghichThienEffects.extra_cast_count || 1;
      baseDamage = Math.floor(baseDamage * (1 + extraCount));
      log.push(`  👥 Linh Cộng Sinh! Bắn thêm ${extraCount} lần!`);
    }
  }

  let totalDamage = 0;
  for (let i = 0; i < hitCount; i++) {
    const dmg = Math.max(1, baseDamage - Math.floor(defender.def * 0.3));
    totalDamage += dmg;
    qcbhState.hitCount++;
  }

  log.push(`  💥 Tổng: **${totalDamage}** damage (${hitCount} hit)`);

  // Set cooldown
  let cd = skill.cooldown_turns || 0;
  if (qcbhState.nghichThienEffects.cooldown_reduction_all_percent) {
    cd = Math.max(0, Math.floor(cd * (1 - qcbhState.nghichThienEffects.cooldown_reduction_all_percent / 100)));
  }
  qcbhState.cooldowns.tuyet_ky = cd;

  return { damage: totalDamage, log };
}

/**
 * Thực thi Thần Thông — ultimate
 */
function executeThanThong(qcbhState, attacker, defender, turnLog) {
  const slot = qcbhState.skills.than_thong;
  if (!slot || !slot.config) return { damage: 0, log: [] };
  if (qcbhState.cooldowns.than_thong > 0) return { damage: 0, log: ['⏳ Thần Thông đang hồi chiêu'] };
  if (attacker.mana < (slot.config.mana_cost || 0)) return { damage: 0, log: ['💔 Không đủ linh lực'] };

  const skill = slot.config;
  const log = [];
  attacker.mana -= skill.mana_cost || 0;

  log.push(`${skill.emoji} **${skill.name}** khai mở!`);

  const effect = skill.effect;

  if (skill.type === 'trieu_hoi') {
    // ═══ TRIỆU HỒI ═══
    if (effect.summon_type === 'kiem_thanh') {
      const count = effect.summon_count || 3;
      for (let i = 0; i < count; i++) {
        qcbhState.summons.push({
          type: 'kiem_thanh',
          damage_percent: effect.summon_damage_per_turn_percent || 50,
          duration: effect.summon_duration_turns || 4,
        });
      }
      log.push(`  🗡️ Triệu hồi ${count} Kiếm Thánh! ${effect.summon_damage_per_turn_percent}% ATK/lượt`);

      // Giảm CD Võ Kỹ
      if (effect.cd_vo_ky_reduction_percent) {
        qcbhState.cooldowns.vo_ky = Math.max(0,
          Math.floor(qcbhState.cooldowns.vo_ky * (1 - effect.cd_vo_ky_reduction_percent / 100))
        );
        log.push(`  ⚡ -${effect.cd_vo_ky_reduction_percent}% CD Võ Kỹ!`);
      }
    }

    if (effect.summon_type === 'cu_kiem') {
      // Cự kiếm — mỗi kiếm ảnh (phân thân) = 20 cự kiếm
      const cloneCount = qcbhState.clones.length + 1; // Bản thân + phân thân
      const cuKiemCount = cloneCount * (effect.kiem_anh_to_cu_kiem_ratio || 20);
      const totalDmg = cuKiemCount * Math.floor(attacker.atk * (effect.cu_kiem_damage_percent || 80) / 100);

      log.push(`  ⚔️ ${cloneCount} kiếm ảnh × ${effect.kiem_anh_to_cu_kiem_ratio} = ${cuKiemCount} Cự Kiếm!`);
      log.push(`  ⚔️ Tổng: **${totalDmg}** damage!`);

      if (effect.vo_dich) {
        attacker._invincibleTurns = (attacker._invincibleTurns || 0) + (effect.vo_dich_duration_turns || 1);
        log.push(`  ✨ Vô Địch ${effect.vo_dich_duration_turns} lượt!`);
      }

      // Set cooldown
      let cd = skill.cooldown_turns || 0;
      if (qcbhState.nghichThienEffects.cooldown_reduction_all_percent) {
        cd = Math.max(0, Math.floor(cd * (1 - qcbhState.nghichThienEffects.cooldown_reduction_all_percent / 100)));
      }
      qcbhState.cooldowns.than_thong = cd;

      return { damage: totalDmg, log };
    }
  }

  if (skill.type === 'tan_cong') {
    let totalDmg = Math.floor(attacker.atk * (effect.damage_mult || 5.0));
    const hitCount = effect.hit_count || 1;

    if (effect.ignore_def_percent) {
      const effectiveDef = Math.floor(defender.def * (1 - effect.ignore_def_percent / 100));
      totalDmg = Math.max(1, totalDmg - Math.floor(effectiveDef * 0.3)) * hitCount;
      log.push(`  🔱 Bỏ qua ${effect.ignore_def_percent}% DEF!`);
    } else {
      totalDmg = Math.max(1, totalDmg - Math.floor(defender.def * 0.3)) * hitCount;
    }

    if (effect.guaranteed_crit) {
      totalDmg = Math.floor(totalDmg * 1.5);
      log.push(`  💢 100% BẠO KÍCH!`);
    }

    if (effect.lifesteal_percent) {
      const heal = Math.floor(totalDmg * effect.lifesteal_percent / 100);
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal);
      log.push(`  🩸 Hút ${heal} HP!`);
    }

    log.push(`  💥 Tổng: **${totalDmg}** damage (${hitCount} hit)`);

    // Set cooldown
    let cd = skill.cooldown_turns || 0;
    if (qcbhState.nghichThienEffects.cooldown_reduction_all_percent) {
      cd = Math.max(0, Math.floor(cd * (1 - qcbhState.nghichThienEffects.cooldown_reduction_all_percent / 100)));
    }
    qcbhState.cooldowns.than_thong = cd;

    return { damage: totalDmg, log };
  }

  if (skill.type === 'buff_tan_cong') {
    // Biến thân
    if (effect.transform) {
      qcbhState.isTransformed = true;
      qcbhState.transformDuration = effect.transform_duration || 5;
      qcbhState.activeBuffs.push(
        { id: 'transform_atk', type: 'atk_percent', value: effect.atk_bonus_percent || 60, duration: effect.transform_duration },
        { id: 'transform_speed', type: 'speed_percent', value: effect.speed_bonus_percent || 40, duration: effect.transform_duration },
      );
      log.push(`  🙏 Biến thân! +${effect.atk_bonus_percent}% ATK, +${effect.speed_bonus_percent}% speed, ${effect.transform_duration} lượt`);
      if (effect.counterattack) {
        log.push(`  🙏 Phản đòn ${effect.counterattack_damage}% ATK!`);
      }
    }

    let cd = skill.cooldown_turns || 0;
    qcbhState.cooldowns.than_thong = cd;
    return { damage: 0, log };
  }

  if (skill.type === 'khong_che') {
    // CC: nhốt
    if (effect.prison) {
      qcbhState.activeDebuffs.push({
        id: 'prison', type: 'prison', value: 1,
        duration: effect.prison_duration || 3, target: 'enemy',
      });
      log.push(`  🔔 Nhốt kẻ địch ${effect.prison_duration} lượt!`);
    }

    let cd = skill.cooldown_turns || 0;
    qcbhState.cooldowns.than_thong = cd;
    return { damage: 0, log };
  }

  // Default fallback
  let cd = skill.cooldown_turns || 0;
  qcbhState.cooldowns.than_thong = cd;
  return { damage: 0, log };
}

// ═══════════════════════════════════════════
//  TURN PROCESSING
// ═══════════════════════════════════════════

/**
 * Xử lý summon entities mỗi lượt
 */
function processSummons(qcbhState, attacker, defender, turnLog) {
  let totalDamage = 0;

  // Kiếm Thánh / summons
  qcbhState.summons = qcbhState.summons.filter(s => {
    if (s.duration <= 0) return false;
    const dmg = Math.floor(attacker.atk * s.damage_percent / 100);
    totalDamage += dmg;
    turnLog.push(`  🗡️ Kiếm Thánh → **${dmg}** damage`);
    s.duration--;
    return s.duration > 0;
  });

  // Phân thân
  qcbhState.clones = qcbhState.clones.filter(clone => {
    if (clone.duration <= 0 || clone.hp <= 0) {
      // Huyễn ảnh tan → hồi mana (game gốc: 244)
      const quyet = qcbhState.tamPhap.quyet;
      if (quyet && quyet.config && quyet.config.base_effects && quyet.config.base_effects.mana_regen_on_clone_death) {
        attacker.mana = Math.min(attacker.maxMana, attacker.mana + quyet.config.base_effects.mana_regen_on_clone_death);
        turnLog.push(`  💧 Huyễn ảnh tan → +${quyet.config.base_effects.mana_regen_on_clone_death} linh lực!`);
      }
      return false;
    }
    const dmg = Math.floor(attacker.atk * clone.damage_percent / 100);
    totalDamage += dmg;
    turnLog.push(`  💧 Phân thân → **${dmg}** damage`);
    clone.duration--;
    return true;
  });

  return totalDamage;
}

/**
 * Xử lý buffs/debuffs mỗi lượt
 */
function processBuffsDebuffs(qcbhState, attacker, defender, turnLog) {
  let damageToEnemy = 0;
  let healToSelf = 0;

  // DoTs on enemy
  qcbhState.activeDebuffs = qcbhState.activeDebuffs.filter(d => {
    if (d.duration <= 0) return false;
    if (d.type === 'dot' && d.target === 'enemy') {
      damageToEnemy += d.value;
      turnLog.push(`  🩸 ${d.id}: ${d.value} damage/lượt`);
    }
    d.duration--;
    return d.duration > 0;
  });

  // HoTs on self
  qcbhState.activeBuffs = qcbhState.activeBuffs.filter(b => {
    if (b.duration <= 0) return false;
    if (b.type === 'hot') {
      healToSelf += b.value;
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + b.value);
      turnLog.push(`  💚 Hồi ${b.value} HP`);
    }
    b.duration--;
    return b.duration > 0;
  });

  // Hồi linh quyết — mana regen per turn
  const quyet = qcbhState.tamPhap.quyet;
  if (quyet && quyet.config && quyet.config.base_effects) {
    const manaRegen = quyet.config.base_effects.mana_regen_per_turn || 0;
    if (manaRegen > 0) {
      attacker.mana = Math.min(attacker.maxMana, attacker.mana + manaRegen);
    }
    // Bonus khi thân pháp active
    if (qcbhState.thanPhapActive && quyet.config.base_effects.mana_regen_on_than_phap_per_turn) {
      const bonus = quyet.config.base_effects.mana_regen_on_than_phap_per_turn;
      attacker.mana = Math.min(attacker.maxMana, attacker.mana + bonus);
    }
  }

  // Hồi Sinh Ngang — HP regen per turn
  const ngang = qcbhState.tamPhap.ngang;
  if (ngang && ngang.config && ngang.config.base_effects) {
    const hpRegen = ngang.config.base_effects.hp_regen_per_turn || 0;
    if (hpRegen > 0) {
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + hpRegen);
    }
    if (qcbhState.thanPhapActive && ngang.config.base_effects.hp_regen_on_than_phap_percent) {
      const healPct = ngang.config.base_effects.hp_regen_on_than_phap_percent;
      const heal = Math.floor(attacker.maxHp * healPct / 100);
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal);
    }
  }

  // Thân pháp duration countdown
  if (qcbhState.thanPhapActive) {
    qcbhState.thanPhapDuration--;
    if (qcbhState.thanPhapDuration <= 0) {
      qcbhState.thanPhapActive = false;
      qcbhState.dodgePercent = 0;
      turnLog.push(`  💨 Thân pháp hết hiệu lực!`);
    }
  }

  // Cooldowns tick
  for (const key of Object.keys(qcbhState.cooldowns)) {
    if (qcbhState.cooldowns[key] > 0) qcbhState.cooldowns[key]--;
  }

  // Hồng Trần Kiếm Hạp trigger
  if (qcbhState.nghichThienEffects.on_hit_threshold) {
    const threshold = qcbhState.nghichThienEffects.on_hit_threshold;
    const bonusPct = qcbhState.nghichThienEffects.bonus_damage_on_trigger_percent || 50;
    if (qcbhState.hitCount > 0 && qcbhState.hitCount % threshold === 0) {
      const bonusDmg = Math.floor(attacker.atk * bonusPct / 100);
      damageToEnemy += bonusDmg;
      turnLog.push(`  🌹 Hồng Trần Kiếm Hạp! ${threshold} hit → +${bonusDmg} bonus damage!`);
    }
  }

  // Phi Kiếm debuff
  if (qcbhState.nghichThienEffects.extra_projectile && chance(qcbhState.nghichThienEffects.debuff_chance || 30)) {
    const debuffList = qcbhState.nghichThienEffects.debuff_random || [];
    if (debuffList.length > 0) {
      const randomDebuff = debuffList[Math.floor(Math.random() * debuffList.length)];
      turnLog.push(`  🗡️ Phi Kiếm! Debuff: ${randomDebuff}`);
    }
  }

  return { damageToEnemy, healToSelf };
}

/**
 * AI chọn hành động tối ưu cho 1 lượt
 * Ưu tiên: Thần Thông > Tuyệt Kỹ > Thân Pháp > Võ Kỹ > Basic
 */
function chooseAction(qcbhState, attacker, defender) {
  // 1. Thần Thông ready?
  if (qcbhState.cooldowns.than_thong <= 0 && qcbhState.skills.than_thong &&
    attacker.mana >= (qcbhState.skills.than_thong.config?.mana_cost || 0)) {
    return 'than_thong';
  }

  // 2. Tuyệt Kỹ ready + có stack?
  if (qcbhState.cooldowns.tuyet_ky <= 0 && qcbhState.skills.tuyet_ky) {
    const tk = qcbhState.skills.tuyet_ky.config;
    if (tk && attacker.mana >= (tk.mana_cost || 0)) {
      // Ưu tiên khi đủ stack
      if (tk.stack_interaction) {
        const stacks = qcbhState.stacks[tk.stack_interaction.stack_type] || 0;
        if (stacks >= tk.stack_interaction.required_stacks) {
          return 'tuyet_ky';
        }
      } else {
        return 'tuyet_ky';
      }
    }
  }

  // 3. Thân Pháp ready + chưa active?
  if (qcbhState.cooldowns.than_phap <= 0 && qcbhState.skills.than_phap &&
    !qcbhState.thanPhapActive &&
    attacker.mana >= (qcbhState.skills.than_phap.config?.mana_cost || 0)) {
    // Dùng khi HP < 60% hoặc chưa dùng lần nào
    if (attacker.hp < attacker.maxHp * 0.6 || !qcbhState._thanPhapUsedOnce) {
      qcbhState._thanPhapUsedOnce = true;
      return 'than_phap';
    }
  }

  // 4. Võ Kỹ (luôn available)
  if (qcbhState.cooldowns.vo_ky <= 0 && qcbhState.skills.vo_ky) {
    return 'vo_ky';
  }

  // 5. Basic attack
  return 'basic';
}

module.exports = {
  buildQcbhState,
  executeVoKy,
  executeThanPhap,
  executeTuyetKy,
  executeThanThong,
  processSummons,
  processBuffsDebuffs,
  chooseAction,
  getSkillConfig,
};
