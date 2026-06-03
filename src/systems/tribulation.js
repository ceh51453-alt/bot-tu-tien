/**
 * @file Tribulation System (Kiếp Nạn)
 * @description Hệ thống vượt kiếp nạn — thử thách khi đột phá cảnh giới
 *
 * Flow:
 *   1. Kiểm tra cảnh giới hiện tại có yêu cầu kiếp nạn không
 *   2. Lấy config kiếp nạn tương ứng (getByRealmTrigger)
 *   3. Tính tỉ lệ thành công dựa trên: base rate + stats + thể chất + đạo
 *   4. Chạy multi-wave auto combat
 *   5. Thành công → cấp thưởng, đặt flag đã vượt
 *   6. Thất bại → penalty (mất exp, hp, có thể rơi cảnh giới hoặc tử vong)
 */

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const db = require('../database/connection');
const tribulations = require('../../config/tribulations');
const realms = require('../../config/realms');
const constitutions = require('../../config/constitutions');
const { COLORS } = require('../utils/constants');
const { formatNumber, progressBar, chance, randomInt } = require('../utils/helpers');
const cooldownManager = require('./cooldown');

// ═══════════════════════════════════════════
//  Hằng số hệ thống
// ═══════════════════════════════════════════

/** Cooldown sau khi thất bại kiếp nạn (1 giờ) */
const TRIBULATION_FAIL_COOLDOWN_MS = 60 * 60 * 1000;

/** Tỉ lệ thành công tối đa (%) */
const MAX_SUCCESS_RATE = 95;

/** Tỉ lệ thành công tối thiểu (%) */
const MIN_SUCCESS_RATE = 5;

/** Hệ số khó hơn cho Ma Đạo */
const MA_DAO_DIFFICULTY_MULT = 1.2;

/** Hệ số thưởng tốt hơn cho Ma Đạo */
const MA_DAO_REWARD_MULT = 1.2;

/** Thời gian delay giữa các wave (ms) — hiển thị animation */
const WAVE_DELAY_MS = 1500;

// ═══════════════════════════════════════════
//  Tính tỉ lệ thành công
// ═══════════════════════════════════════════

/**
 * Tính tỉ lệ thành công vượt kiếp nạn
 *
 * Công thức:
 *   base = tribulation.success_rate_base
 *   + bonusDEF  (DEF / maxHP * 10, tối đa +10)
 *   + bonusHP   (HP hiện tại / maxHP * 5, tối đa +5)
 *   + bonusConst (thể chất hp_percent bonus / 2, tối đa +8)
 *   - Ma Đạo penalty: tổng * 1.2 khó hơn (giảm tỉ lệ)
 *
 * @param {object} player - Dữ liệu người chơi từ DB
 * @param {object} tribulation - Config kiếp nạn
 * @returns {number} Tỉ lệ 0-100
 */
function calculateSuccessRate(player, tribulation) {
  const baseRate = tribulation.success_rate_base;

  // Bonus từ DEF — phòng thủ cao chịu sét tốt hơn
  const defBonus = Math.min(10, Math.floor((player.def / Math.max(player.max_hp, 1)) * 10));

  // Bonus từ HP hiện tại — đầy máu thì có lợi thế
  const hpRatio = player.max_hp > 0 ? player.hp / player.max_hp : 0;
  const hpBonus = Math.min(5, Math.floor(hpRatio * 5));

  // Bonus từ thể chất
  let constBonus = 0;
  if (player.constitution) {
    const constConfig = constitutions.getConstitutionById(player.constitution);
    if (constConfig && constConfig.bonuses) {
      // Thể chất có hp_percent cao → chịu kiếp tốt hơn
      constBonus = Math.min(8, Math.floor((constConfig.bonuses.hp_percent || 0) / 2));
      // Thể chất có def_percent cũng giúp
      constBonus += Math.min(5, Math.floor((constConfig.bonuses.def_percent || 0) / 3));
    }
  }

  let totalRate = baseRate + defBonus + hpBonus + constBonus;

  // Ma Đạo: kiếp nạn khó hơn 20%
  if (player.dao_path === 'ma') {
    totalRate = Math.floor(totalRate / MA_DAO_DIFFICULTY_MULT);
  }

  return Math.max(MIN_SUCCESS_RATE, Math.min(MAX_SUCCESS_RATE, totalRate));
}

// ═══════════════════════════════════════════
//  Xử lý kiếp nạn chính
// ═══════════════════════════════════════════

/**
 * Bắt đầu kiếp nạn cho người chơi
 * @param {import('discord.js').ButtonInteraction} interaction
 * @param {object} player - Dữ liệu người chơi từ DB
 */
async function handleTribulation(interaction, player) {
  // ── 1. Lấy cảnh giới hiện tại ──
  const currentRealm = realms.list[player.realm_index];
  if (!currentRealm) {
    return interaction.reply({
      embeds: [buildErrorEmbed('Không tìm thấy thông tin cảnh giới.')],
      ephemeral: true,
    });
  }

  // ── 2. Kiểm tra cảnh giới có yêu cầu kiếp nạn không ──
  if (!currentRealm.tribulation) {
    return interaction.reply({
      embeds: [buildErrorEmbed('Cảnh giới hiện tại không yêu cầu vượt kiếp nạn.')],
      ephemeral: true,
    });
  }

  // ── 3. Lấy config kiếp nạn ──
  const tribConfig = tribulations.getByRealmTrigger(currentRealm.order);
  if (!tribConfig) {
    return interaction.reply({
      embeds: [buildErrorEmbed('Không tìm thấy dữ liệu kiếp nạn cho cảnh giới này.')],
      ephemeral: true,
    });
  }

  // ── 4. Kiểm tra đã vượt kiếp nạn này chưa ──
  const flagName = `tribulation_passed:${currentRealm.order}`;
  if (cooldownManager.hasFlag(player.id, flagName)) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.INFO)
          .setTitle('✅ Đã Vượt Kiếp Nạn')
          .setDescription(
            `Bạn đã vượt qua **${tribConfig.emoji} ${tribConfig.name}** rồi!\n\n` +
            `Hãy nhấn **Đột Phá** để tiến lên cảnh giới mới.`,
          ),
      ],
      ephemeral: true,
    });
  }

  // ── 5. Kiểm tra cooldown (thất bại trước đó) ──
  const cdKey = `tribulation_fail:${tribConfig.id}`;
  const cdCheck = cooldownManager.checkCooldown(player.id, cdKey);
  if (cdCheck.onCooldown) {
    const minutes = Math.ceil(cdCheck.remainingMs / 60000);
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.WARNING)
          .setTitle('⏳ Đang Hồi Phục')
          .setDescription(
            `Bạn vừa thất bại kiếp nạn và cần thời gian hồi phục.\n\n` +
            `Thử lại sau: **${minutes} phút**`,
          ),
      ],
      ephemeral: true,
    });
  }

  // ── 6. Kiểm tra HP — phải còn sống ──
  if (player.hp <= 0 || player.is_dead) {
    return interaction.reply({
      embeds: [buildErrorEmbed('HP của bạn quá thấp hoặc đã tử vong. Không thể vượt kiếp.')],
      ephemeral: true,
    });
  }

  // ── 7. Bắt đầu kiếp nạn ──
  await interaction.deferUpdate();
  await runTribulation(interaction, player, tribConfig, currentRealm);
}

// ═══════════════════════════════════════════
//  Multi-wave combat
// ═══════════════════════════════════════════

/**
 * Chạy kiếp nạn multi-wave
 * @param {import('discord.js').ButtonInteraction} interaction
 * @param {object} player
 * @param {object} tribConfig
 * @param {object} realm
 */
async function runTribulation(interaction, player, tribConfig, realm) {
  const successRate = calculateSuccessRate(player, tribConfig);
  const isMaDao = player.dao_path === 'ma';

  // HP tracking qua các wave
  let currentHp = player.hp;
  const maxHp = player.max_hp;
  const waveResults = [];
  let survived = true;

  // ── Hiển thị embed khởi đầu ──
  const startEmbed = new EmbedBuilder()
    .setColor(COLORS.COMBAT)
    .setTitle(`${tribConfig.emoji} ${tribConfig.name} Giáng Lâm!`)
    .setDescription(
      `${tribConfig.description}\n\n` +
      `⚡ **Số đợt**: ${tribConfig.waves}\n` +
      `💀 **Sát thương/đợt**: ${tribConfig.hp_damage_per_wave}% HP\n` +
      `📊 **Tỉ lệ thành công**: ${successRate}%\n\n` +
      `${isMaDao ? '😈 **Ma Đạo**: Kiếp nạn khó hơn 20% nhưng thưởng tốt hơn 20%!\n\n' : ''}` +
      `_Kiếp nạn đang giáng xuống..._`,
    )
    .setFooter({ text: `${player.name} — ${realm.emoji} ${realm.name}` });

  await interaction.editReply({ embeds: [startEmbed], components: [] });

  // ── Xử lý từng wave ──
  for (let wave = 1; wave <= tribConfig.waves; wave++) {
    // Delay giữa các wave để tạo hiệu ứng
    await sleep(WAVE_DELAY_MS);

    // Tính sát thương wave này
    let waveDamagePercent = tribConfig.hp_damage_per_wave;

    // Ma Đạo chịu thêm 20% sát thương
    if (isMaDao) {
      waveDamagePercent = Math.floor(waveDamagePercent * MA_DAO_DIFFICULTY_MULT);
    }

    // Special mechanic — kiểm tra wave đặc biệt
    let specialText = '';
    if (tribConfig.special_mechanic) {
      const sm = tribConfig.special_mechanic;
      if (sm.waves_affected && sm.waves_affected.includes(wave)) {
        // Wave đặc biệt — sát thương tăng
        const dmgMult = sm.effect?.damage_multiplier || 1.5;
        waveDamagePercent = Math.floor(waveDamagePercent * dmgMult);
        specialText = `\n⚠️ **${sm.name}** kích hoạt!`;
      }
      // Escalation mechanic (sát thương tăng dần)
      if (sm.escalation_percent) {
        const escalation = 1 + (sm.escalation_percent * (wave - 1)) / 100;
        waveDamagePercent = Math.floor(waveDamagePercent * escalation);
      }
    }

    // Tính sát thương thực tế
    const rawDamage = Math.floor(maxHp * waveDamagePercent / 100);

    // Kháng sát thương dựa vào DEF
    const defReduction = Math.min(0.4, player.def / (player.def + 200));
    const actualDamage = Math.max(1, Math.floor(rawDamage * (1 - defReduction)));

    currentHp -= actualDamage;

    // Kết quả wave
    const waveSuccess = currentHp > 0;
    const hpBarText = progressBar(Math.max(0, currentHp), maxHp, 12);

    waveResults.push({
      wave,
      damage: actualDamage,
      currentHp: Math.max(0, currentHp),
      survived: waveSuccess,
      special: specialText,
    });

    if (!waveSuccess) {
      survived = false;
      break;
    }

    // Cập nhật embed với tiến trình
    const progressEmbed = buildProgressEmbed(
      tribConfig, player, realm, wave, waveResults, currentHp, maxHp, successRate,
    );
    await interaction.editReply({ embeds: [progressEmbed], components: [] });
  }

  // ── Kiểm tra kết quả cuối cùng ──
  if (survived) {
    // Vượt qua tất cả wave → kiểm tra tỉ lệ thành công tổng thể
    const passed = chance(successRate);
    if (passed) {
      await handleSuccess(interaction, player, tribConfig, realm, waveResults, currentHp);
    } else {
      // Sống sót qua các wave nhưng vẫn thất bại (thiên đạo không cho phép)
      await handleFailure(interaction, player, tribConfig, realm, waveResults, false);
    }
  } else {
    // HP hết giữa chừng → thất bại
    await handleFailure(interaction, player, tribConfig, realm, waveResults, false);
  }
}

// ═══════════════════════════════════════════
//  Xử lý thành công
// ═══════════════════════════════════════════

/**
 * Xử lý khi vượt kiếp nạn thành công
 */
async function handleSuccess(interaction, player, tribConfig, realm, waveResults, finalHp) {
  const isMaDao = player.dao_path === 'ma';

  // ── Tính phần thưởng ──
  let spiritStones = tribConfig.rewards.spirit_stones || 0;
  let expMultiplier = tribConfig.rewards.exp_multiplier || 1.0;

  // Ma Đạo: thưởng tốt hơn 20%
  if (isMaDao) {
    spiritStones = Math.floor(spiritStones * MA_DAO_REWARD_MULT);
    expMultiplier *= MA_DAO_REWARD_MULT;
  }

  // Bonus EXP = exp_per_sub hiện tại * exp_multiplier
  const realmConfig = realms.list[player.realm_index];
  const bonusExp = Math.floor((realmConfig?.exp_per_sub || 100) * expMultiplier);

  // ── Cập nhật DB ──
  // Cấp thưởng linh thạch + EXP
  db.prepare(`
    UPDATE players
    SET hp = ?, exp = exp + ?, linh_thach = linh_thach + ?
    WHERE id = ?
  `).run(Math.max(1, finalHp), bonusExp, spiritStones, player.id);

  // Cấp vật phẩm thưởng
  const receivedItems = [];
  if (tribConfig.rewards.items && tribConfig.rewards.items.length > 0) {
    for (const itemReward of tribConfig.rewards.items) {
      if (chance(itemReward.chance * 100)) {
        // Thêm vào inventory
        const existing = db.prepare(
          'SELECT id, quantity FROM inventory WHERE player_id = ? AND item_id = ?',
        ).get(player.id, itemReward.item_id);

        if (existing) {
          db.prepare('UPDATE inventory SET quantity = quantity + ? WHERE id = ?')
            .run(itemReward.count || 1, existing.id);
        } else {
          db.prepare('INSERT INTO inventory (player_id, item_id, quantity) VALUES (?, ?, ?)')
            .run(player.id, itemReward.item_id, itemReward.count || 1);
        }

        receivedItems.push(`• ${itemReward.item_id} x${itemReward.count || 1}`);
      }
    }
  }

  // Đặt flag đã vượt kiếp nạn
  cooldownManager.setFlag(player.id, `tribulation_passed:${realm.order}`);

  // ── Hiển thị embed thành công ──
  await sleep(WAVE_DELAY_MS);

  const lastWaves = waveResults.slice(-3);
  const waveLog = lastWaves
    .map(w => `Đợt ${w.wave}: -${formatNumber(w.damage)} HP ${w.special}`)
    .join('\n');

  const rewardsText = [
    `✨ EXP: **+${formatNumber(bonusExp)}** (x${expMultiplier.toFixed(1)})`,
    `💎 Linh Thạch: **+${formatNumber(spiritStones)}**`,
    ...(receivedItems.length > 0 ? ['📦 Vật phẩm:', ...receivedItems] : []),
    ...(tribConfig.rewards.title ? [`🏅 Danh hiệu: **${tribConfig.rewards.title}**`] : []),
  ].join('\n');

  const successEmbed = new EmbedBuilder()
    .setColor(COLORS.GOLD)
    .setTitle(`🎉 VƯỢT ${tribConfig.name.toUpperCase()} THÀNH CÔNG!`)
    .setDescription(
      `${tribConfig.emoji} **${player.name}** đã vượt qua **${tribConfig.name}**!\n\n` +
      `Thiên Đạo công nhận, kiếp nạn tiêu tán!\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📋 **Diễn biến cuối:**\n${waveLog}\n\n` +
      `❤️ HP còn lại: ${progressBar(Math.max(1, finalHp), player.max_hp, 12)} ` +
      `${formatNumber(Math.max(1, finalHp))}/${formatNumber(player.max_hp)}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🎁 **Phần thưởng:**\n${rewardsText}\n\n` +
      `_Hãy nhấn **Đột Phá** để tiến lên cảnh giới mới!_`,
    )
    .setFooter({ text: `${player.name} — ${realm.emoji} ${realm.name}` })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('cultivation:breakthrough')
      .setLabel('⚡ Đột Phá')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('menu:main')
      .setLabel('🏠 Menu Chính')
      .setStyle(ButtonStyle.Secondary),
  );

  await interaction.editReply({ embeds: [successEmbed], components: [row] });
}

// ═══════════════════════════════════════════
//  Xử lý thất bại
// ═══════════════════════════════════════════

/**
 * Xử lý khi thất bại kiếp nạn
 */
async function handleFailure(interaction, player, tribConfig, realm, waveResults, _forceKill) {
  const penalty = tribConfig.failure_penalty;

  // ── Kiểm tra tử vong ──
  const deathChance = penalty.death_chance || 0;
  const isDead = deathChance > 0 && chance(deathChance);

  if (isDead) {
    // ═══ PERMADEATH ═══
    db.prepare('UPDATE players SET is_dead = 1, hp = 0 WHERE id = ?').run(player.id);

    await sleep(WAVE_DELAY_MS);

    const deathEmbed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle('💀 ĐÃ TỬ VONG — KIẾP NẠN HỦY THỂ')
      .setDescription(
        `${tribConfig.emoji} **${tribConfig.name}** đã nuốt chửng **${player.name}**...\n\n` +
        `Thân thể bị hủy diệt bởi thiên lôi, linh hồn tan vào hư không.\n\n` +
        `💀 **${player.name}** đã vĩnh viễn ngã xuống.\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        `_Bạn có thể **Luân Hồi Chuyển Thế** để tạo nhân vật mới._`,
      )
      .setFooter({ text: 'R.I.P.' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('create:reincarnate')
        .setLabel('🔄 Luân Hồi Chuyển Thế')
        .setStyle(ButtonStyle.Danger),
    );

    await interaction.editReply({ embeds: [deathEmbed], components: [row] });
    return;
  }

  // ═══ THẤT BẠI (sống sót) ═══

  // Mất exp
  const expLoss = Math.floor(player.exp * (penalty.exp_loss_percent || 0) / 100);

  // HP giảm xuống theo penalty
  const hpAfter = Math.max(1, Math.floor(player.max_hp * (1 - (penalty.hp_loss_percent || 0) / 100)));

  // Rơi cảnh giới
  let realmDropText = '';
  let newRealmIndex = player.realm_index;
  if (penalty.realm_drop && penalty.realm_drop_levels) {
    newRealmIndex = Math.max(0, player.realm_index - penalty.realm_drop_levels);
    if (newRealmIndex !== player.realm_index) {
      const droppedRealm = realms.list[newRealmIndex];
      realmDropText = `\n📉 **Rơi cảnh giới**: ${droppedRealm.emoji} ${droppedRealm.name}`;
    }
  }

  // Thời gian bị thương
  const injuryMinutes = penalty.injury_duration_minutes || 60;

  // ── Cập nhật DB ──
  const updateFields = {
    hp: hpAfter,
    exp: Math.max(0, player.exp - expLoss),
    realm_index: newRealmIndex,
  };

  // Nếu rơi cảnh giới thì reset sub_realm về tầng 9 của cảnh giới mới
  if (newRealmIndex !== player.realm_index) {
    const newRealm = realms.list[newRealmIndex];
    updateFields.sub_realm = newRealm ? newRealm.sub_realms : 1;
  }

  db.prepare(`
    UPDATE players
    SET hp = ?, exp = ?, realm_index = ?${newRealmIndex !== player.realm_index ? ', sub_realm = ?' : ''}
    WHERE id = ?
  `).run(
    updateFields.hp,
    updateFields.exp,
    updateFields.realm_index,
    ...(newRealmIndex !== player.realm_index ? [updateFields.sub_realm] : []),
    player.id,
  );

  // Đặt cooldown thất bại
  cooldownManager.setCooldown(player.id, `tribulation_fail:${tribConfig.id}`, TRIBULATION_FAIL_COOLDOWN_MS);

  // Đặt cooldown bị thương (injury)
  if (injuryMinutes > 0) {
    cooldownManager.setCooldown(player.id, 'injury', injuryMinutes * 60 * 1000);
  }

  // ── Hiển thị embed thất bại ──
  await sleep(WAVE_DELAY_MS);

  const lastWaves = waveResults.slice(-3);
  const waveLog = lastWaves
    .map(w => `Đợt ${w.wave}: -${formatNumber(w.damage)} HP ${w.survived ? '✅' : '💀'}${w.special}`)
    .join('\n');

  const failEmbed = new EmbedBuilder()
    .setColor(COLORS.ERROR)
    .setTitle(`❌ THẤT BẠI — ${tribConfig.name.toUpperCase()}`)
    .setDescription(
      `${tribConfig.emoji} **${player.name}** không thể vượt qua **${tribConfig.name}**...\n\n` +
      `Thiên lôi quá mãnh liệt, thân thể bị tổn thương nặng.\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📋 **Diễn biến cuối:**\n${waveLog}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💔 **Hậu quả:**\n` +
      `❤️ HP: ${formatNumber(hpAfter)}/${formatNumber(player.max_hp)}\n` +
      `✨ Mất EXP: **-${formatNumber(expLoss)}** (${penalty.exp_loss_percent}%)` +
      `${realmDropText}\n` +
      `🩹 Bị thương: **${injuryMinutes} phút**\n` +
      `⏳ Cooldown thử lại: **60 phút**\n\n` +
      `_Hãy hồi phục và chuẩn bị kỹ hơn trước khi thử lại!_`,
    )
    .setFooter({ text: `${player.name} — ${realm.emoji} ${realm.name}` })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('menu:main')
      .setLabel('🏠 Menu Chính')
      .setStyle(ButtonStyle.Secondary),
  );

  await interaction.editReply({ embeds: [failEmbed], components: [row] });
}

// ═══════════════════════════════════════════
//  Embed helpers
// ═══════════════════════════════════════════

/**
 * Tạo embed tiến trình từng wave
 */
function buildProgressEmbed(tribConfig, player, realm, currentWave, waveResults, currentHp, maxHp, successRate) {
  const lastWaves = waveResults.slice(-5);
  const waveLog = lastWaves
    .map(w => `⚡ Đợt ${w.wave}: **-${formatNumber(w.damage)}** HP${w.special}`)
    .join('\n');

  const hpBar = progressBar(Math.max(0, currentHp), maxHp, 12);
  const waveBar = progressBar(currentWave, tribConfig.waves, 10);

  return new EmbedBuilder()
    .setColor(COLORS.COMBAT)
    .setTitle(`${tribConfig.emoji} ${tribConfig.name} — Đợt ${currentWave}/${tribConfig.waves}`)
    .setDescription(
      `${waveBar} **${currentWave}/${tribConfig.waves}** đợt\n\n` +
      `${waveLog}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `❤️ HP: ${hpBar} ${formatNumber(Math.max(0, currentHp))}/${formatNumber(maxHp)}\n` +
      `📊 Tỉ lệ thành công: **${successRate}%**`,
    )
    .setFooter({ text: `${player.name} — ${realm.emoji} ${realm.name}` });
}

/**
 * Tạo embed lỗi nhanh
 */
function buildErrorEmbed(message) {
  return new EmbedBuilder()
    .setColor(COLORS.ERROR)
    .setTitle('❌ Không Thể Vượt Kiếp')
    .setDescription(message);
}

// ═══════════════════════════════════════════
//  Tiện ích
// ═══════════════════════════════════════════

/** Promise-based sleep */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  handleTribulation,
  calculateSuccessRate,
};
