/**
 * @file AFK Cultivation (Bế Quan Tu Luyện)
 * @description Hệ thống tu luyện offline — player bế quan, bot tự tích EXP theo thời gian
 *
 * Cơ chế:
 *   - Bế Quan: Player vào trạng thái AFK, mỗi phút tích +X EXP (0.5x rate manual)
 *   - Xuất Quan: Nhận toàn bộ EXP tích lũy
 *   - Giới hạn: Tối đa 8 giờ
 *   - Bonus: Có chance nhận Hậu Thiên Khí Vận khi xuất quan
 */

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { COLORS } = require('../utils/constants');
const { formatNumber, formatTime } = require('../utils/helpers');
const db = require('../database/connection');

const MAX_AFK_HOURS = 8;
const MAX_AFK_MS = MAX_AFK_HOURS * 60 * 60 * 1000;
const EXP_PER_MINUTE = 0.5; // 0.5x base rate

// ═══════════════════════════════════════════
// DB Prepared Statements (Lazy init)
// ═══════════════════════════════════════════

let _stmts = null;
function getStmts() {
  if (!_stmts) {
    _stmts = {
      getAfk: db.prepare("SELECT * FROM player_afk_cultivation WHERE player_id = ? AND status = 'active'"),
      startAfk: db.prepare("INSERT INTO player_afk_cultivation (player_id, started_at, status, base_exp_rate) VALUES (?, ?, 'active', ?)"),
      endAfk: db.prepare("UPDATE player_afk_cultivation SET status = 'completed', ended_at = ?, total_exp = ? WHERE id = ?"),
      addExp: db.prepare("UPDATE players SET exp = exp + ? WHERE id = ?"),
    };
  }
  return _stmts;
}

// ═══════════════════════════════════════════
// BẾ QUAN
// ═══════════════════════════════════════════

/**
 * Bắt đầu bế quan tu luyện
 */
async function startBeQuan(interaction, player) {
  // Check nếu đang bế quan rồi
  const existing = getStmts().getAfk.get(player.id);
  if (existing) {
    const elapsed = Date.now() - existing.started_at;
    const embed = new EmbedBuilder()
      .setColor(COLORS.warning)
      .setTitle('🏔️ Đang Bế Quan')
      .setDescription(
        `Ngươi đã bế quan được **${formatTime(elapsed)}**.\n\n` +
        `Nhấn **Xuất Quan** để nhận EXP tích lũy.`
      );
    return interaction.update({
      embeds: [embed],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('cultivation:xuat_quan').setLabel('🏔️ Xuất Quan').setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId('cultivation:menu').setLabel('🔙 Quay Lại').setStyle(ButtonStyle.Secondary)
        )
      ]
    });
  }

  // Tính base EXP rate từ realm
  const realms = require('../../config/realms');
  const realm = realms.list[player.realm_index];
  const baseRate = Math.max(1, Math.floor((realm ? realm.exp_per_sub : 100) * 0.001));

  getStmts().startAfk.run(player.id, Date.now(), baseRate);

  const embed = new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle('🏔️ Bế Quan Tu Luyện')
    .setDescription(
      `**${player.name}** bắt đầu bế quan tu luyện!\n\n` +
      `📈 Tốc độ: **~${formatNumber(baseRate)}** EXP/phút\n` +
      `⏰ Thời gian tối đa: **${MAX_AFK_HOURS} giờ**\n` +
      `💡 Rate: **0.5x** so với tu luyện thủ công\n\n` +
      `Ngươi có thể đóng Discord và quay lại sau.\n` +
      `Nhấn **Xuất Quan** khi muốn nhận EXP.`
    )
    .setTimestamp();

  return interaction.update({
    embeds: [embed],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('cultivation:xuat_quan').setLabel('🏔️ Xuất Quan').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary)
      )
    ]
  });
}

/**
 * Kết thúc bế quan, nhận EXP
 */
async function endBeQuan(interaction, player) {
  const afk = getStmts().getAfk.get(player.id);
  if (!afk) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.error)
      .setTitle('❌ Chưa Bế Quan')
      .setDescription('Ngươi chưa bế quan, không có gì để xuất quan.');
    return interaction.update({
      embeds: [embed],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('cultivation:menu').setLabel('🔙 Quay Lại').setStyle(ButtonStyle.Secondary)
        )
      ]
    });
  }

  let elapsed = Date.now() - afk.started_at;
  // Cap at max hours
  if (elapsed > MAX_AFK_MS) elapsed = MAX_AFK_MS;

  const minutes = Math.floor(elapsed / 60000);
  const totalExp = Math.max(1, Math.floor(minutes * afk.base_exp_rate * EXP_PER_MINUTE));

  // Update DB
  getStmts().endAfk.run(Date.now(), totalExp, afk.id);
  getStmts().addExp.run(totalExp, player.id);

  // Roll khí vận (10% chance khi bế quan > 2 giờ)
  let khiVanText = '';
  if (minutes >= 120 && Math.random() < 0.15) {
    try {
      const { rollRandomKhiVan, applyKhiVan } = require('./khi-van');
      const rolled = rollRandomKhiVan('be_quan', player);
      if (rolled) {
        applyKhiVan(player.id, rolled.id);
        khiVanText = `\n\n🌟 **Khí Vận mới!** ${rolled.name}\n_${rolled.description}_`;
      }
    } catch (e) {
      // Khí vận system chưa sẵn sàng
    }
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const embed = new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle('🏔️ Xuất Quan Thành Công!')
    .setDescription(
      `**${player.name}** đã kết thúc bế quan tu luyện!\n\n` +
      `⏰ Thời gian bế quan: **${hours > 0 ? `${hours} giờ ` : ''}${mins} phút**\n` +
      `📈 EXP nhận được: **+${formatNumber(totalExp)}**\n` +
      (elapsed >= MAX_AFK_MS ? `\n⚠️ _Đã đạt giới hạn ${MAX_AFK_HOURS} giờ, EXP không tăng thêm._\n` : '') +
      khiVanText
    )
    .setTimestamp();

  return interaction.update({
    embeds: [embed],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('cultivation:train').setLabel('🧘 Tu Luyện Tiếp').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('cultivation:menu').setLabel('🧘 Tu Luyện Các').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary)
      )
    ]
  });
}

module.exports = {
  startBeQuan,
  endBeQuan,
  MAX_AFK_HOURS,
  MAX_AFK_MS,
};
