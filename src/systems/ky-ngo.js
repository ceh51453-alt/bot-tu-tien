/**
 * @file Kỳ Ngộ — Random Encounter / Event System
 * @description Hệ thống sự kiện ngẫu nhiên khi tu luyện:
 *   - Di tích cổ xưa
 *   - Gặp tiên nhân / ẩn sĩ
 *   - Thiên tài địa bảo
 *   - Nguy hiểm / bẫy
 *   - Câu đố / thách thức
 *
 * Trigger: khi tu luyện, khi đi mạo hiểm, khi AFK
 * Phần thưởng: skill mới, tăng Ngộ Tính, item hiếm, tăng Đạo Tâm
 */

const db = require('../database/connection');
const { randomInt, chance } = require('../utils/helpers');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { COLORS } = require('../utils/constants');

// ═══════════════════════════════════════════
//  KỲ NGỘ EVENTS
// ═══════════════════════════════════════════

const KY_NGO_EVENTS = [
  // ═══ THIÊN CƠ (Cơ duyên trời cho) ═══
  {
    id: 'co_truyen_bi_ky',
    name: '📜 Cổ Truyền Bí Kỹ',
    description: 'Bạn tình cờ phát hiện một cuốn bí tịch bị chôn vùi dưới gốc cây cổ thụ.',
    rarity: 'rare',
    weight: 15,
    emoji: '📜',
    rewards: [
      { type: 'exp', value: { min: 500, max: 2000 }, text: '📈 Tu vi tăng mạnh' },
      { type: 'ngo_tinh', value: { min: 3, max: 8 }, text: '🧠 Ngộ tính tăng' },
    ],
    choices: [
      { label: '📖 Đọc kỹ và nghiên cứu', effect: { exp_mult: 1.5, ngo_tinh_bonus: 5 }, risk: 0 },
      { label: '💪 Cưỡng hành tu luyện', effect: { exp_mult: 2.0, hp_loss_percent: 20 }, risk: 30 },
    ],
  },
  {
    id: 'tien_nhan_chi_diem',
    name: '🧙 Tiên Nhân Chỉ Điểm',
    description: 'Một vị tiên nhân bí ẩn xuất hiện và chỉ điểm con đường tu hành.',
    rarity: 'epic',
    weight: 8,
    emoji: '🧙',
    rewards: [
      { type: 'exp', value: { min: 1000, max: 5000 }, text: '📈 Khai sáng tu vi' },
      { type: 'dao_tam', value: { min: 50, max: 200 }, text: '🧘 Đạo tâm kiên cố' },
      { type: 'ngo_tinh', value: { min: 5, max: 15 }, text: '🧠 Ngộ tính đại tăng' },
    ],
    choices: [
      { label: '🙇 Cung kính thụ giáo', effect: { all_rewards: true, dao_tam_bonus: 100 }, risk: 0 },
      { label: '🤔 Hỏi bí mật trường sinh', effect: { exp_mult: 3.0, dao_tam_loss: 50 }, risk: 20 },
    ],
  },
  {
    id: 'thien_tai_dia_bao',
    name: '💎 Thiên Tài Địa Bảo',
    description: 'Phát hiện linh mạch thiên nhiên, linh khí dồi dào vô tận!',
    rarity: 'rare',
    weight: 12,
    emoji: '💎',
    rewards: [
      { type: 'linh_thach', value: { min: 500, max: 3000 }, text: '💎 Linh thạch bùng nổ' },
      { type: 'exp', value: { min: 300, max: 1500 }, text: '📈 Tu vi tăng nhẹ' },
    ],
    choices: [
      { label: '⛏️ Khai thác cẩn thận', effect: { linh_thach_mult: 1.0 }, risk: 0 },
      { label: '💥 Phá hủy toàn bộ mạch', effect: { linh_thach_mult: 3.0, van_khi_loss: 5 }, risk: 40 },
    ],
  },
  {
    id: 'dong_phu_co_nhan',
    name: '🏛️ Động Phủ Cổ Nhân',
    description: 'Bạn vô tình phát hiện động phủ của một vị tiền bối đã vẫn truyền nhiều đời.',
    rarity: 'epic',
    weight: 6,
    emoji: '🏛️',
    rewards: [
      { type: 'exp', value: { min: 2000, max: 8000 }, text: '📈 Truyền thừa tiền bối' },
      { type: 'danh_vong', value: { min: 100, max: 500 }, text: '🏆 Danh vọng tăng vọt' },
      { type: 'random_skill_upgrade', text: '⬆️ Nâng cấp kỹ năng ngẫu nhiên' },
    ],
    choices: [
      { label: '🔍 Thám hiểm kỹ lưỡng', effect: { all_rewards: true, time_cost: 2 }, risk: 0 },
      { label: '⚡ Lấy hết rồi chạy', effect: { exp_mult: 0.5, linh_thach_bonus: 2000, van_khi_loss: 10 }, risk: 50 },
    ],
  },

  // ═══ NGUY HIỂM ═══
  {
    id: 'doc_vu',
    name: '☠️ Độc Vụ',
    description: 'Bạn lạc vào vùng sương độc! Linh khí bị ô nhiễm nặng.',
    rarity: 'common',
    weight: 20,
    emoji: '☠️',
    rewards: [
      { type: 'exp', value: { min: 100, max: 500 }, text: '📈 Kinh nghiệm từ nguy hiểm' },
    ],
    choices: [
      { label: '🏃 Bỏ chạy', effect: { hp_loss_percent: 10 }, risk: 0 },
      { label: '🧘 Dùng nội lực giải độc', effect: { exp_mult: 2.0, ngo_tinh_bonus: 3 }, risk: 35 },
      { label: '💀 Lợi dụng độc để tu luyện', effect: { exp_mult: 5.0, hp_loss_percent: 40 }, risk: 60 },
    ],
  },
  {
    id: 'ma_thu_rung',
    name: '🐺 Ma Thú Rừng',
    description: 'Một con ma thú cấp cao chặn đường! Phải chiến đấu hoặc bỏ chạy.',
    rarity: 'common',
    weight: 18,
    emoji: '🐺',
    rewards: [
      { type: 'exp', value: { min: 300, max: 1200 }, text: '📈 Chiến đấu kinh nghiệm' },
      { type: 'linh_thach', value: { min: 100, max: 500 }, text: '💎 Linh thạch từ vật liệu' },
    ],
    choices: [
      { label: '🏃 Bỏ chạy (an toàn)', effect: {}, risk: 0 },
      { label: '⚔️ Chiến đấu', effect: { all_rewards: true, hp_loss_percent: 15 }, risk: 25 },
      { label: '🐾 Thu phục làm linh thú', effect: { dao_tam_bonus: 30, van_khi_cost: 10 }, risk: 45 },
    ],
  },

  // ═══ THÁCH THỨC ═══
  {
    id: 'cau_do_dao',
    name: '❓ Câu Đố Đại Đạo',
    description: 'Một tấm bia đá cổ khắc câu đố về đại đạo. Trả lời đúng sẽ nhận ân huệ.',
    rarity: 'uncommon',
    weight: 15,
    emoji: '❓',
    rewards: [
      { type: 'dao_tam', value: { min: 30, max: 150 }, text: '🧘 Đạo tâm thăng hoa' },
      { type: 'ngo_tinh', value: { min: 2, max: 8 }, text: '🧠 Ngộ tính mở rộng' },
    ],
    choices: [
      { label: '🧠 Suy ngẫm cẩn thận', effect: { dao_tam_mult: 1.5, ngo_tinh_bonus: 5 }, risk: 0 },
      { label: '💬 Trả lời theo trực giác', effect: { dao_tam_mult: 3.0 }, risk: 50 },
    ],
  },
  {
    id: 'luan_dao_stranger',
    name: '🗣️ Luận Đạo Khách Lạ',
    description: 'Gặp một tu sĩ bí ẩn muốn luận đạo, bàn về thiên đạo.',
    rarity: 'uncommon',
    weight: 12,
    emoji: '🗣️',
    rewards: [
      { type: 'dao_tam', value: { min: 50, max: 200 }, text: '🧘 Đạo tâm khai minh' },
      { type: 'exp', value: { min: 200, max: 1000 }, text: '📈 Kiến giải đại đạo' },
    ],
    choices: [
      { label: '🙏 Hòa nhã luận đạo', effect: { all_rewards: true }, risk: 0 },
      { label: '💪 Thách thức quan điểm', effect: { dao_tam_mult: 2.0, exp_mult: 2.0 }, risk: 30 },
    ],
  },

  // ═══ ĐẶC BIỆT ═══
  {
    id: 'thien_kiep_du_bo',
    name: '⛈️ Thiên Kiếp Dư Bổ',
    description: 'Bạn tình cờ hấp thụ năng lượng dư thừa từ thiên kiếp của người khác!',
    rarity: 'legendary',
    weight: 3,
    emoji: '⛈️',
    rewards: [
      { type: 'exp', value: { min: 5000, max: 20000 }, text: '📈 Tu vi bùng nổ!' },
      { type: 'ngo_tinh', value: { min: 10, max: 25 }, text: '🧠 Ngộ tính đại ngộ' },
      { type: 'dao_tam', value: { min: 100, max: 500 }, text: '🧘 Đạo tâm kiên cố' },
    ],
    choices: [
      { label: '🧘 Bình tĩnh hấp thụ', effect: { all_rewards: true }, risk: 0 },
      { label: '⚡ Tham lam hấp thụ toàn bộ', effect: { exp_mult: 3.0, ngo_tinh_bonus: 20 }, risk: 70 },
    ],
  },
  {
    id: 'bi_canh',
    name: '🌌 Bí Cảnh Xuất Hiện',
    description: 'Một không gian bí ẩn bất ngờ mở ra trước mặt, kéo bạn vào.',
    rarity: 'legendary',
    weight: 2,
    emoji: '🌌',
    rewards: [
      { type: 'exp', value: { min: 3000, max: 15000 }, text: '📈 Bí cảnh tu luyện' },
      { type: 'linh_thach', value: { min: 1000, max: 5000 }, text: '💎 Linh mạch phong phú' },
      { type: 'tien_thach', value: { min: 1, max: 5 }, text: '✨ Tiên Thạch hiếm!' },
      { type: 'danh_vong', value: { min: 200, max: 1000 }, text: '🏆 Danh vọng vang dội' },
    ],
    choices: [
      { label: '🔍 Khám phá từ từ', effect: { all_rewards: true, time_cost: 3 }, risk: 0 },
      { label: '🗡️ Xông vào trung tâm', effect: { exp_mult: 2.0, linh_thach_mult: 2.0 }, risk: 55 },
    ],
  },
];

// ═══════════════════════════════════════════
//  WEIGHT-BASED RANDOM SELECTION
// ═══════════════════════════════════════════

function rollKyNgo(vanKhi) {
  const vanKhiBonus = (vanKhi - 80) / 200; // vận khí cao → weight rare tăng
  const weighted = KY_NGO_EVENTS.map(e => {
    let w = e.weight;
    if (e.rarity === 'legendary') w += Math.max(0, vanKhiBonus * 5);
    if (e.rarity === 'epic') w += Math.max(0, vanKhiBonus * 10);
    if (e.rarity === 'rare') w += Math.max(0, vanKhiBonus * 15);
    return { event: e, weight: w };
  });

  const totalWeight = weighted.reduce((s, w) => s + w.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const w of weighted) {
    roll -= w.weight;
    if (roll <= 0) return w.event;
  }
  return weighted[weighted.length - 1].event;
}

// ═══════════════════════════════════════════
//  TRIGGER KỲ NGỘ
// ═══════════════════════════════════════════

/**
 * Check và trigger kỳ ngộ
 * @param {Object} player - Player DB row
 * @returns {Object|null} Event hoặc null nếu không trigger
 */
function checkKyNgoTrigger(player) {
  const vanKhi = player.van_khi || 80;
  // Base chance: 8%, +0.1% per vận khí trên 80
  const triggerChance = 8 + Math.max(0, (vanKhi - 80) * 0.1);
  if (!chance(triggerChance)) return null;
  return rollKyNgo(vanKhi);
}

/**
 * Tính phần thưởng cho event
 * @param {Object} event - Event data
 * @param {Object} player - Player DB row
 * @param {number} choiceIndex - Index lựa chọn
 * @returns {Object} { rewards, risk_failed, log }
 */
function calculateRewards(event, player, choiceIndex) {
  const choice = event.choices[choiceIndex] || event.choices[0];
  const effect = choice.effect || {};
  const realmMult = 1 + (player.realm_index || 0) * 0.3;

  const rewards = {};
  const log = [];

  // Check risk failure
  const riskFailed = choice.risk > 0 && !chance(100 - choice.risk);

  if (riskFailed) {
    log.push('❌ **Thất bại!** Hành động mạo hiểm không thành công!');
    if (effect.hp_loss_percent) {
      const hpLoss = Math.floor(player.max_hp * effect.hp_loss_percent / 100);
      rewards.hp_loss = hpLoss;
      log.push(`  💔 Mất ${hpLoss} HP`);
    }
    if (effect.van_khi_loss) {
      rewards.van_khi_loss = effect.van_khi_loss;
      log.push(`  🍀 Vận khí giảm ${effect.van_khi_loss}`);
    }
    return { rewards, risk_failed: true, log };
  }

  // Success
  log.push('✅ **Thành công!**');

  for (const reward of event.rewards) {
    if (!effect.all_rewards && reward.type === 'random_skill_upgrade') continue;

    switch (reward.type) {
      case 'exp': {
        let val = randomInt(reward.value.min, reward.value.max);
        val = Math.floor(val * realmMult * (effect.exp_mult || 1.0));
        rewards.exp = (rewards.exp || 0) + val;
        log.push(`  ${reward.text}: +${val}`);
        break;
      }
      case 'linh_thach': {
        let val = randomInt(reward.value.min, reward.value.max);
        val = Math.floor(val * realmMult * (effect.linh_thach_mult || 1.0));
        rewards.linh_thach = (rewards.linh_thach || 0) + val;
        log.push(`  ${reward.text}: +${val}`);
        break;
      }
      case 'tien_thach': {
        const val = randomInt(reward.value.min, reward.value.max);
        rewards.tien_thach = (rewards.tien_thach || 0) + val;
        log.push(`  ${reward.text}: +${val}`);
        break;
      }
      case 'ngo_tinh': {
        let val = randomInt(reward.value.min, reward.value.max);
        val += (effect.ngo_tinh_bonus || 0);
        rewards.ngo_tinh = (rewards.ngo_tinh || 0) + val;
        log.push(`  ${reward.text}: +${val}`);
        break;
      }
      case 'dao_tam': {
        let val = randomInt(reward.value.min, reward.value.max);
        val = Math.floor(val * (effect.dao_tam_mult || 1.0));
        val += (effect.dao_tam_bonus || 0);
        rewards.dao_tam = (rewards.dao_tam || 0) + val;
        log.push(`  ${reward.text}: +${val}`);
        break;
      }
      case 'danh_vong': {
        const val = randomInt(reward.value.min, reward.value.max);
        rewards.danh_vong = (rewards.danh_vong || 0) + val;
        log.push(`  ${reward.text}: +${val}`);
        break;
      }
      case 'random_skill_upgrade': {
        rewards.random_skill_upgrade = true;
        log.push(`  ${reward.text}`);
        break;
      }
    }
  }

  // Extra from effect
  if (effect.linh_thach_bonus) {
    rewards.linh_thach = (rewards.linh_thach || 0) + effect.linh_thach_bonus;
    log.push(`  💎 Bonus: +${effect.linh_thach_bonus} linh thạch`);
  }
  if (effect.hp_loss_percent) {
    const hpLoss = Math.floor(player.max_hp * effect.hp_loss_percent / 100);
    rewards.hp_loss = hpLoss;
    log.push(`  💔 Trả giá: -${hpLoss} HP`);
  }
  if (effect.dao_tam_loss) {
    rewards.dao_tam_loss = effect.dao_tam_loss;
    log.push(`  🧘 Mất ${effect.dao_tam_loss} Đạo Tâm`);
  }
  if (effect.van_khi_loss) {
    rewards.van_khi_loss = effect.van_khi_loss;
    log.push(`  🍀 Vận khí giảm ${effect.van_khi_loss}`);
  }

  return { rewards, risk_failed: false, log };
}

/**
 * Apply rewards vào DB
 */
function applyRewards(playerId, rewards) {
  const updates = [];
  const params = [];

  if (rewards.exp) { updates.push('exp = exp + ?'); params.push(rewards.exp); }
  if (rewards.linh_thach) { updates.push('linh_thach = linh_thach + ?'); params.push(rewards.linh_thach); }
  if (rewards.tien_thach) { updates.push('tien_thach = tien_thach + ?'); params.push(rewards.tien_thach); }
  if (rewards.ngo_tinh) { updates.push('ngo_tinh = MIN(ngo_tinh + ?, 999)'); params.push(rewards.ngo_tinh); }
  if (rewards.dao_tam) { updates.push('dao_tam = dao_tam + ?'); params.push(rewards.dao_tam); }
  if (rewards.danh_vong) { updates.push('danh_vong = danh_vong + ?'); params.push(rewards.danh_vong); }
  if (rewards.hp_loss) { updates.push('hp = MAX(1, hp - ?)'); params.push(rewards.hp_loss); }
  if (rewards.dao_tam_loss) { updates.push('dao_tam = MAX(0, dao_tam - ?)'); params.push(rewards.dao_tam_loss); }
  if (rewards.van_khi_loss) { updates.push('van_khi = MAX(1, van_khi - ?)'); params.push(rewards.van_khi_loss); }

  if (updates.length > 0) {
    params.push(playerId);
    db.prepare(`UPDATE players SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  }

  // Random skill upgrade
  if (rewards.random_skill_upgrade) {
    const slot = db.prepare(
      'SELECT * FROM player_skill_slots WHERE player_id = ? ORDER BY RANDOM() LIMIT 1'
    ).get(playerId);
    if (slot) {
      db.prepare(
        'UPDATE player_skill_slots SET skill_level = MIN(skill_level + 1, 10) WHERE player_id = ? AND slot_type = ?'
      ).run(playerId, slot.slot_type);
    }
  }
}

// ═══════════════════════════════════════════
//  DISCORD UI
// ═══════════════════════════════════════════

/**
 * Hiển thị kỳ ngộ event cho player
 */
function buildKyNgoEmbed(event, player) {
  const rarityColors = {
    common: '#808080',
    uncommon: '#2ecc71',
    rare: '#3498db',
    epic: '#9b59b6',
    legendary: '#f39c12',
  };

  const rarityNames = {
    common: '⚪ Thường',
    uncommon: '🟢 Phi Thường',
    rare: '🔵 Hiếm',
    epic: '🟣 Sử Thi',
    legendary: '🟡 Huyền Thoại',
  };

  const embed = new EmbedBuilder()
    .setColor(rarityColors[event.rarity] || '#808080')
    .setTitle(`${event.emoji} KỲ NGỘ — ${event.name}`)
    .setDescription(
      `${rarityNames[event.rarity] || 'Không xác định'}\n\n` +
      `*${event.description}*\n\n` +
      `**Phần thưởng tiềm năng:**\n` +
      event.rewards.map(r => `  ${r.text}`).join('\n')
    )
    .setFooter({ text: `Vận Khí: ${player.van_khi || 80} | Ngộ Tính: ${player.ngo_tinh || 100}` })
    .setTimestamp();

  return embed;
}

/**
 * Tạo nút lựa chọn cho kỳ ngộ
 */
function buildKyNgoButtons(event) {
  const row = new ActionRowBuilder();
  event.choices.forEach((choice, i) => {
    const riskText = choice.risk > 0 ? ` (${choice.risk}% rủi ro)` : ' (An toàn)';
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`ky_ngo:choose:${event.id}:${i}`)
        .setLabel(`${choice.label}${riskText}`)
        .setStyle(choice.risk > 30 ? ButtonStyle.Danger : choice.risk > 0 ? ButtonStyle.Primary : ButtonStyle.Success)
    );
  });

  row.addComponents(
    new ButtonBuilder()
      .setCustomId('ky_ngo:skip')
      .setLabel('🚶 Bỏ qua')
      .setStyle(ButtonStyle.Secondary)
  );

  return row;
}

module.exports = {
  KY_NGO_EVENTS,
  checkKyNgoTrigger,
  calculateRewards,
  applyRewards,
  buildKyNgoEmbed,
  buildKyNgoButtons,
  rollKyNgo,
};
