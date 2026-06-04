const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { COLORS, COOLDOWNS } = require('../utils/constants');
const { progressBar, formatNumber, formatTime } = require('../utils/helpers');
const { getMenuImage } = require('../utils/image-helper');

/**
 * Cultivation Menu — Tu Luyện, Lĩnh Ngộ, Đột Phá, Vượt Kiếp, Bế Quan
 */
async function showCultivationMenu(interaction, player) {
  const realms = require('../../config/realms');
  const techniques = require('../../config/techniques');

  const realm = realms.list[player.realm_index];
  const technique = techniques.list.find(t => t.id === player.technique_id);
  const nextRealm = realms.list[player.realm_index + 1];
  const expNeeded = realm ? realm.exp_per_sub : 0;

  // Check cooldown
  const db = require('../database/connection');
  const cooldown = db.prepare(
    "SELECT * FROM cooldowns WHERE player_id = ? AND action_type = 'cultivate'"
  ).get(player.id);
  const onCooldown = cooldown && Date.now() < cooldown.expires_at;

  // Check bế quan status
  const afkStatus = db.prepare(
    "SELECT * FROM player_afk_cultivation WHERE player_id = ? AND status = 'active'"
  ).get(player.id);
  const isAfk = !!afkStatus;

  const embed = new EmbedBuilder()
    .setColor(COLORS.cultivation)
    .setTitle('🧘 Tu Luyện Các')
    .setDescription(
      `**${player.name}** — ${realm ? realm.emoji : '🌟'} ${realm ? realm.name : 'Chí Tôn'} Tầng ${player.sub_realm}\n\n` +
      `📜 Công Pháp: **${technique ? technique.name : 'Cơ Bản Tâm Pháp'}**\n` +
      `📈 EXP Bonus: **+${technique ? technique.exp_bonus : 0}%**\n\n` +
      `**Tu Vi Tiến Độ**:\n` +
      `${progressBar(player.exp, expNeeded)} ${formatNumber(player.exp)}/${formatNumber(expNeeded)}\n\n` +
      (isAfk
        ? `🏔️ Đang **Bế Quan Tu Luyện**! Nhấn "Xuất Quan" để nhận EXP.`
        : (onCooldown
          ? `⏳ Thời gian hồi: **${formatTime(cooldown.expires_at - Date.now())}**`
          : '✅ Có thể tu luyện!'))
    );

  const img = getMenuImage('cultivation');
  if (img) embed.setImage(`attachment://${img.imageName}`);
  embed.setTimestamp();

  // Check if can breakthrough
  const canBreakthrough = player.exp >= expNeeded && player.sub_realm >= 9 && nextRealm;
  const canSubBreakthrough = player.exp >= expNeeded && player.sub_realm < 9;
  // Check if can comprehend dao laws (Hóa Thần+, realm_index >= 4)
  const canComprehendLaws = player.realm_index >= 4;

  // Check if tribulation is required for next realm
  const needsTribulation = nextRealm && nextRealm.tribulation && player.sub_realm >= 9 && player.exp >= expNeeded;
  // Check if tribulation already passed
  let tribulationPassed = false;
  if (needsTribulation) {
    const { hasFlag } = require('../systems/cooldown');
    tribulationPassed = hasFlag(player.id, `tribulation_passed:${nextRealm.order || player.realm_index + 1}`);
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('cultivation:train')
      .setLabel('🧘 Tu Luyện')
      .setStyle(ButtonStyle.Success)
      .setDisabled(onCooldown || isAfk),
    new ButtonBuilder()
      .setCustomId('cultivation:comprehend')
      .setLabel('📖 Lĩnh Ngộ Pháp Tắc')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(!canComprehendLaws),
    new ButtonBuilder()
      .setCustomId('cultivation:breakthrough')
      .setLabel('⬆️ Đột Phá')
      .setStyle(ButtonStyle.Danger)
      .setDisabled(!canBreakthrough && !canSubBreakthrough),
    new ButtonBuilder()
      .setCustomId('cultivation:tribulation')
      .setLabel('⚡ Vượt Kiếp')
      .setStyle(ButtonStyle.Danger)
      .setDisabled(!needsTribulation || tribulationPassed),
    new ButtonBuilder()
      .setCustomId('menu:main')
      .setLabel('🔙 Quay Lại')
      .setStyle(ButtonStyle.Secondary),
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('technique:menu')
      .setLabel('📜 Đổi Công Pháp')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('cultivation:dao_tam')
      .setLabel('🧘 Đạo Tâm')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(player.realm_index < 1),
    new ButtonBuilder()
      .setCustomId(isAfk ? 'cultivation:xuat_quan' : 'cultivation:be_quan')
      .setLabel(isAfk ? '🏔️ Xuất Quan' : '🏔️ Bế Quan')
      .setStyle(isAfk ? ButtonStyle.Danger : ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('cultivation:khi_van')
      .setLabel('🌟 Khí Vận')
      .setStyle(ButtonStyle.Secondary),
  );

  const imgData = getMenuImage('cultivation');
  const updatePayload = { embeds: [embed], components: [row, row2] };
  if (imgData) updatePayload.files = [imgData.attachment];
  await interaction.update(updatePayload);
}

/**
 * Handle cultivation (tu luyện) action — Bắt đầu interactive session
 */
async function handleCultivation(interaction, player) {
  const db = require('../database/connection');
  const { formatTime } = require('../utils/helpers');

  // Check cooldown
  const cooldown = db.prepare(
    "SELECT * FROM cooldowns WHERE player_id = ? AND action_type = 'cultivate'"
  ).get(player.id);

  if (cooldown && Date.now() < cooldown.expires_at) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.warning)
      .setTitle('⏳ Đang Thiền Định')
      .setDescription(`Bạn cần nghỉ ngơi thêm **${formatTime(cooldown.expires_at - Date.now())}** trước khi tu luyện tiếp.`);
    return interaction.update({ embeds: [embed], components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('cultivation:menu').setLabel('🔙 Quay Lại').setStyle(ButtonStyle.Secondary)
      )
    ]});
  }

  // Bắt đầu interactive cultivation session
  const { startSession, buildRound1 } = require('../systems/interactive-cultivation');
  const session = startSession(player);
  session.round = 1;

  const { embed, components } = buildRound1(session);

  await interaction.update({ embeds: [embed], components });
}

/**
 * Handle interactive cultivation round responses
 */
async function handleInteractiveCultivation(interaction, player, roundData) {
  const {
    getSession, endSession,
    processRound1, processRound2, processRandomEvent,
    buildRound2, buildRandomEventRound,
    calculateFinalResults,
  } = require('../systems/interactive-cultivation');

  const session = getSession(interaction.user.id);
  if (!session) {
    return interaction.update({
      embeds: [new EmbedBuilder().setColor(COLORS.error).setTitle('❌ Phiên tu luyện đã hết hạn').setDescription('Hãy bắt đầu tu luyện lại.')],
      components: [new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('cultivation:menu').setLabel('🔙 Quay Lại').setStyle(ButtonStyle.Secondary)
      )]
    });
  }

  const parts = roundData.split(':');
  const roundType = parts[0]; // r1, r2, r3

  let result;

  // ── Xử lý từng vòng ──
  if (roundType === 'r1') {
    const chosenElement = parts[1];
    result = processRound1(session, chosenElement);

    // Hiển thị kết quả vòng 1 + chuyển sang vòng 2
    const resultEmbed = new EmbedBuilder()
      .setColor(result.color)
      .setTitle('🧘 Vòng 1 — Kết Quả')
      .setDescription(`${result.text}\n\n📊 Điểm: **+${result.score}** (Tổng: ${session.score})`)
      .setTimestamp();

    session.round = 2;
    const round2 = buildRound2(session);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('icultivation:next:2')
        .setLabel('▶️ Tiếp Tục Vòng 2')
        .setStyle(ButtonStyle.Primary)
    );

    return interaction.update({ embeds: [resultEmbed], components: [row] });
  }

  if (roundType === 'r2') {
    const choice = parts[1];
    result = processRound2(session, choice, player);

    session.round = 3;

    const resultEmbed = new EmbedBuilder()
      .setColor(result.color)
      .setTitle('🧘 Vòng 2 — Kết Quả')
      .setDescription(
        `${result.text}\n\n` +
        `📊 Điểm: **${result.score >= 0 ? '+' : ''}${result.score}** (Tổng: ${session.score})` +
        (result.tauHoa ? '\n\n🔥 **CẢNH BÁO: Đã bị tẩu hỏa!** EXP sẽ bị giảm 50%.' : '')
      )
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('icultivation:next:3')
        .setLabel(`▶️ Tiếp Tục Vòng 3`)
        .setStyle(ButtonStyle.Primary)
    );

    return interaction.update({ embeds: [resultEmbed], components: [row] });
  }

  if (roundType === 'r3') {
    // parts: eventId, answerType, answerIndex
    const answerType = parts[2];
    result = processRandomEvent(session, answerType);

    session.round++;

    const resultEmbed = new EmbedBuilder()
      .setColor(result.color)
      .setTitle(`🧘 Vòng ${session.round - 1} — Kết Quả`)
      .setDescription(
        `${result.text}\n\n` +
        `_${result.flavorText}_\n\n` +
        `📊 Điểm: **${result.score >= 0 ? '+' : ''}${result.score}** (Tổng: ${session.score})`
      )
      .setTimestamp();

    // Kiểm tra còn vòng tiếp không
    if (session.round <= session.maxRounds) {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`icultivation:next:${session.round}`)
          .setLabel(`▶️ Tiếp Tục Vòng ${session.round}`)
          .setStyle(ButtonStyle.Primary)
      );
      return interaction.update({ embeds: [resultEmbed], components: [row] });
    }

    // Hết vòng → tính kết quả cuối
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('icultivation:finish')
        .setLabel('📊 Xem Kết Quả')
        .setStyle(ButtonStyle.Success)
    );
    return interaction.update({ embeds: [resultEmbed], components: [row] });
  }

  if (roundType === 'next') {
    // Chuyển sang vòng tiếp theo
    const nextRound = parseInt(parts[1]);

    if (nextRound === 2) {
      const round2 = buildRound2(session);
      return interaction.update({ embeds: [round2.embed], components: round2.components });
    }

    // Vòng 3+: Random event
    const eventRound = buildRandomEventRound(session, nextRound);
    return interaction.update({ embeds: [eventRound.embed], components: eventRound.components });
  }

  if (roundType === 'finish') {
    // Tính kết quả cuối cùng và cập nhật DB
    return finishCultivation(interaction, player, session);
  }
}

/**
 * Hoàn thành session tu luyện — tính EXP, cập nhật DB
 */
async function finishCultivation(interaction, player, session) {
  const db = require('../database/connection');
  const { calculateFinalResults, endSession } = require('../systems/interactive-cultivation');

  const results = calculateFinalResults(session, player);

  // Cập nhật EXP
  db.prepare('UPDATE players SET exp = exp + ? WHERE id = ?').run(results.finalExp, player.id);

  // Tẩu hỏa damage (Ma Đạo, tẩu hỏa rate đã giảm: 3% thay vì 5%)
  let tauHoaDamage = 0;
  if (results.tauHoa) {
    tauHoaDamage = Math.floor(player.max_hp * 0.10); // Giảm từ 15% xuống 10%
    const newHp = Math.max(1, player.hp - tauHoaDamage);
    db.prepare('UPDATE players SET hp = ? WHERE id = ?').run(newHp, player.id);
  }

  // Set cooldown: 15 phút thay vì 30 phút
  const cultivateCooldown = 15 * 60 * 1000; // 15 phút
  const expiresAt = Date.now() + cultivateCooldown;
  db.prepare(
    "INSERT OR REPLACE INTO cooldowns (player_id, action_type, expires_at) VALUES (?, 'cultivate', ?)"
  ).run(player.id, expiresAt);

  // Roll Hậu Thiên Khí Vận
  let khiVanText = '';
  if (results.khiVanRoll) {
    try {
      const { rollRandomKhiVan, applyKhiVan } = require('./khi-van');
      const rolledKhiVan = rollRandomKhiVan('cultivation', player);
      if (rolledKhiVan) {
        applyKhiVan(player.id, rolledKhiVan.id);
        khiVanText = `\n\n🌟 **Khí Vận mới!** ${rolledKhiVan.name}\n_${rolledKhiVan.description}_`;
      }
    } catch (e) {
      // Khí vận system chưa sẵn sàng, bỏ qua
    }
  }

  // Build embed kết quả
  const gradeBar = '⭐'.repeat(
    results.grade === 'perfect' ? 5 :
    results.grade === 'excellent' ? 4 :
    results.grade === 'good' ? 3 :
    results.grade === 'normal' ? 2 : 1
  );

  const embed = new EmbedBuilder()
    .setColor(
      results.grade === 'perfect' ? 0xFFD700 :
      results.grade === 'excellent' ? 0x2ecc71 :
      results.grade === 'good' ? 0x3498db :
      results.tauHoa ? COLORS.ERROR :
      COLORS.INFO
    )
    .setTitle(`${results.gradeEmoji} Tu Luyện Hoàn Tất — ${results.gradeText}!`)
    .setDescription(
      `**${player.name}** hoàn thành ${session.maxRounds} vòng thiền định!\n\n` +
      `📊 **Đánh giá:** ${gradeBar} (${results.score} điểm)\n` +
      `📈 **EXP nhận được:** +**${formatNumber(results.finalExp)}**\n` +
      (results.bonusExp > 0 ? `📜 Bonus từ ${results.technique.name}: +**${formatNumber(results.bonusExp)}**\n` : '') +
      (results.maBonus > 0 ? `😈 Ma Đạo bonus: +**${formatNumber(results.maBonus)}**\n` : '') +
      `🎯 Hệ số: **x${results.multiplier}**\n` +
      (results.tauHoa ? `\n🔥 **Tẩu Hỏa!** Mất **${formatNumber(tauHoaDamage)}** HP\n` : '') +
      `\n⏳ Cooldown: **${formatTime(cultivateCooldown)}**` +
      khiVanText
    )
    .setTimestamp();

  // Cleanup session
  endSession(interaction.user.id);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('cultivation:menu')
      .setLabel('🧘 Tu Luyện Các')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('menu:main')
      .setLabel('🏠 Menu Chính')
      .setStyle(ButtonStyle.Secondary),
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

/**
 * Handle breakthrough (đột phá) — giữ nguyên logic cũ
 */
async function handleBreakthrough(interaction, player) {
  const db = require('../database/connection');
  const realms = require('../../config/realms');
  const items = require('../../config/items');

  const realm = realms.list[player.realm_index];
  const expNeeded = realm ? realm.exp_per_sub : 0;

  if (player.exp < expNeeded) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.error)
      .setTitle('❌ Chưa Đủ Tu Vi')
      .setDescription(`Cần **${formatNumber(expNeeded)}** EXP để đột phá. Hiện có: **${formatNumber(player.exp)}**`);
    return interaction.update({ embeds: [embed], components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('cultivation:menu').setLabel('🔙 Quay Lại').setStyle(ButtonStyle.Secondary)
      )
    ]});
  }

  if (player.sub_realm < 9) {
    // Sub-realm breakthrough — just needs EXP
    db.prepare('UPDATE players SET sub_realm = sub_realm + 1, exp = 0 WHERE id = ?').run(player.id);

    const embed = new EmbedBuilder()
      .setColor(COLORS.success)
      .setTitle('⬆️ Đột Phá Thành Công!')
      .setDescription(
        `**${player.name}** đã đột phá lên **${realm.name} Tầng ${player.sub_realm + 1}**!\n\n` +
        `Cảm giác sức mạnh tràn đầy cơ thể...`
      );

    // Update stats based on realm multiplier
    const statIncrease = Math.floor(realm.stat_multiplier * 5);
    db.prepare(
      'UPDATE players SET max_hp = max_hp + ?, hp = max_hp, atk = atk + ?, def = def + ?, speed = speed + ?, max_mana = max_mana + ?, mana = max_mana WHERE id = ?'
    ).run(statIncrease * 10, statIncrease, statIncrease, Math.floor(statIncrease * 0.5), statIncrease * 3, player.id);

    return interaction.update({ embeds: [embed], components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('cultivation:menu').setLabel('🧘 Tiếp Tục Tu Luyện').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary)
      )
    ]});
  }

  // Major realm breakthrough — needs pill + possibly tribulation
  const nextRealm = realms.list[player.realm_index + 1];
  if (!nextRealm) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.warning)
      .setTitle('🌟 Đã Đạt Đỉnh Phong')
      .setDescription('Bạn đã đạt cảnh giới **Chí Tôn** — đỉnh cao của tu tiên!');
    return interaction.update({ embeds: [embed], components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary)
      )
    ]});
  }

  // Check if tribulation is required
  if (nextRealm.tribulation) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.warning)
      .setTitle('⚡ Cần Vượt Thiên Kiếp!')
      .setDescription(
        `Để đột phá lên **${nextRealm.name}**, bạn cần vượt qua **${nextRealm.tribulation}** trước!\n\n` +
        `Nhấn **⚡ Vượt Kiếp** để bắt đầu.`
      );
    return interaction.update({ embeds: [embed], components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('cultivation:tribulation').setLabel('⚡ Vượt Kiếp').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('cultivation:menu').setLabel('🔙 Quay Lại').setStyle(ButtonStyle.Secondary)
      )
    ]});
  }

  // Check for required pill
  const requiredPill = items.breakthroughPills[player.realm_index + 1];
  if (requiredPill) {
    const hasItem = db.prepare(
      'SELECT * FROM inventory WHERE player_id = ? AND item_id = ? AND quantity > 0'
    ).get(player.id, requiredPill.id);

    if (!hasItem) {
      const embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle('❌ Thiếu Đan Dược')
        .setDescription(
          `Cần **${requiredPill.name}** để đột phá lên **${nextRealm.name}**!\n\n` +
          `Có thể mua tại Tụ Bảo Các hoặc luyện đan.`
        );
      return interaction.update({ embeds: [embed], components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('cultivation:menu').setLabel('🔙 Quay Lại').setStyle(ButtonStyle.Secondary)
        )
      ]});
    }

    // Consume pill
    db.prepare('UPDATE inventory SET quantity = quantity - 1 WHERE player_id = ? AND item_id = ?')
      .run(player.id, requiredPill.id);
  }

  // Perform breakthrough
  db.prepare('UPDATE players SET realm_index = realm_index + 1, sub_realm = 1, exp = 0 WHERE id = ?').run(player.id);

  // Big stat increase for realm change
  const statIncrease = Math.floor(nextRealm.stat_multiplier * 20);
  db.prepare(
    'UPDATE players SET max_hp = max_hp + ?, hp = max_hp, atk = atk + ?, def = def + ?, speed = speed + ?, max_mana = max_mana + ?, mana = max_mana WHERE id = ?'
  ).run(statIncrease * 15, statIncrease * 2, statIncrease * 2, statIncrease, statIncrease * 5, player.id);

  const embed = new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle('🌟 ĐỘT PHÁ THÀNH CÔNG!')
    .setDescription(
      `✨ **${player.name}** đã đột phá lên cảnh giới mới!\n\n` +
      `${nextRealm.emoji} **${nextRealm.name}** — ${nextRealm.tier}\n\n` +
      `Thiên địa chấn động, linh khí cuồn cuộn tụ lại...\n` +
      `Sức mạnh bùng nổ, cảnh giới thăng hoa!\n\n` +
      `⚔️ ATK +${statIncrease * 2} | 🛡️ DEF +${statIncrease * 2} | ❤️ HP +${statIncrease * 15}`
    )
    .setTimestamp();

  return interaction.update({ embeds: [embed], components: [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('cultivation:menu').setLabel('🧘 Tu Luyện').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary)
    )
  ]});
}

module.exports = {
  showCultivationMenu,
  handleCultivation,
  handleBreakthrough,
  handleInteractiveCultivation,
};
