const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { COLORS } = require('../utils/constants');
const daoTamConfig = require('../../config/dao-tam');

/**
 * Hiển thị menu Đạo Tâm
 */
async function showDaoTamMenu(interaction, player) {
  const db = require('../database/connection');
  const playerDaoTam = db.prepare('SELECT * FROM player_dao_tam WHERE player_id = ?').get(player.id);

  let embed;
  if (!playerDaoTam) {
    embed = new EmbedBuilder()
      .setColor(COLORS.cultivation)
      .setTitle('🧘 Đạo Tâm')
      .setDescription(
        `**${player.name}** chưa hình thành Đạo Tâm.\n\n` +
        `Đạo Tâm là ý chí tu luyện, quyết định con đường tu tiên của bạn.\n` +
        `Mỗi Đạo Tâm mang lại **buff passive** riêng và mở khóa **Nghịch Thiên Cải Mệnh** đặc thù.\n\n` +
        `⚠️ Yêu cầu: Cảnh giới **Trúc Cơ** trở lên.\n\n` +
        `Chọn một Đạo Tâm bên dưới để bắt đầu:`
      );
  } else {
    const dt = daoTamConfig.getDaoTamById(playerDaoTam.dao_tam_id);
    const state = daoTamConfig.getStateFromKienDinh(playerDaoTam.kien_dinh);
    const buffs = daoTamConfig.getPassiveBuff(playerDaoTam.dao_tam_id, playerDaoTam.kien_dinh);

    const buffText = Object.entries(buffs)
      .filter(([k, v]) => v && k !== 'no_breakthrough')
      .map(([k, v]) => {
        const sign = v > 0 ? '+' : '';
        const name = {
          di_toc_percent: 'Tốc độ di chuyển',
          cooldown_reduction_percent: 'Giảm CD',
          range_percent: 'Tầm bắn',
          niem_luc_cost_reduction_percent: 'Giảm niệm lực',
          damage_taken_reduction_percent: 'Giảm sát thương nhận',
          van_khi_bonus: 'May mắn',
          summon_damage_percent: 'Triệu hoán damage',
          damage_percent: 'Sát thương',
          damage_taken_percent: 'Sát thương nhận',
          atk_percent: 'Công kích',
          def_percent: 'Phòng ngự',
          hp_percent: 'Sinh lực',
          hp_regen_percent: 'Hồi sinh lực',
          mana_regen_percent: 'Hồi linh lực',
          speed_percent: 'Tốc độ',
          dodge_percent: 'Né tránh',
          ho_tam_bonus: 'Hộ tâm',
          ngo_tinh_bonus: 'Ngộ tính',
          exp_bonus_percent: 'Tu vi bonus',
          crit_rate: 'Bạo kích',
        }[k] || k;
        return `  ${name}: **${sign}${v}${k.includes('percent') || k.includes('rate') ? '%' : ''}**`;
      })
      .join('\n');

    // Progress bar kiên định
    const kd = playerDaoTam.kien_dinh;
    const bar = createProgressBar(Math.max(0, kd), 100, 15);

    embed = new EmbedBuilder()
      .setColor(state.order >= 1 ? COLORS.cultivation : COLORS.error)
      .setTitle(`${dt.emoji} Đạo Tâm: ${dt.name}`)
      .setDescription(
        `**${player.name}** — ${dt.description}\n\n` +
        `━━━ Trạng Thái ━━━\n\n` +
        `${state.emoji} **${state.name}** — ${state.desc}\n` +
        `Kiên Định: ${bar} **${kd}/100**\n\n` +
        `━━━ Buff Passive ━━━\n\n` +
        (buffText || '_Không có buff (đạo tâm quá yếu)_') +
        (buffs.no_breakthrough ? '\n\n❌ **Không thể đột phá!**' : '') +
        `\n\n━━━━━━━━━━━━━━━━━━━━`
      );
  }

  const components = [];

  // Nút chọn/đổi đạo tâm
  const realms = require('../../config/realms');
  const currentRealm = realms.list[player.realm_index];
  const canSelect = currentRealm && currentRealm.order >= 2; // Trúc Cơ+

  if (canSelect && !playerDaoTam) {
    // Chưa có → hiện select menu chọn đạo tâm
    const selectOptions = daoTamConfig.getSelectableList().map(dt => ({
      label: dt.name,
      value: dt.id,
      emoji: dt.emoji,
      description: dt.description.slice(0, 80),
    }));

    // Discord giới hạn 25 options
    const selectMenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select:dao_tam')
        .setPlaceholder('🧘 Chọn Đạo Tâm...')
        .addOptions(selectOptions.slice(0, 25))
    );
    components.push(selectMenu);
  }

  if (playerDaoTam) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('dao_tam:meditate').setLabel('🧘 Tĩnh Tọa (+Kiên Định)').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('dao_tam:change').setLabel('🔄 Cải Biến Đạo Tâm').setStyle(ButtonStyle.Danger),
    );
    components.push(row);
  }

  components.push(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('menu:cultivation').setLabel('🔙 Tu Luyện').setStyle(ButtonStyle.Secondary),
    )
  );

  if (interaction.replied || interaction.deferred) {
    return interaction.editReply({ embeds: [embed], components });
  }
  return interaction.update({ embeds: [embed], components });
}

/**
 * Chọn Đạo Tâm lần đầu
 */
async function selectDaoTam(interaction, player, daoTamId) {
  const db = require('../database/connection');
  const dt = daoTamConfig.getDaoTamById(daoTamId);
  if (!dt) {
    return interaction.update({
      embeds: [new EmbedBuilder().setColor(COLORS.error).setTitle('❌ Đạo tâm không tồn tại')],
      components: [],
    });
  }

  // Kiểm tra đặc thù
  if (dt.special) {
    return interaction.update({
      embeds: [new EmbedBuilder().setColor(COLORS.error).setTitle('❌ Đạo tâm đặc thù').setDescription('Cần gia nhập tông môn đặc biệt để chọn đạo tâm này.')],
      components: [],
    });
  }

  // Insert
  db.prepare('INSERT OR REPLACE INTO player_dao_tam (player_id, dao_tam_id, kien_dinh, trang_thai) VALUES (?, ?, 50, ?)')
    .run(player.id, daoTamId, 'moi_sinh');

  const embed = new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle(`${dt.emoji} Đạo Tâm Đã Hình Thành!`)
    .setDescription(
      `**${player.name}** đã lĩnh ngộ **${dt.name}**!\n\n` +
      `_${dt.description}_\n\n` +
      `Kiên Định: **50/100** (Mới Sinh 🌱)\n\n` +
      `💡 Tĩnh tọa, thắng trận, lĩnh ngộ đạo pháp sẽ tăng kiên định.\n` +
      `⚠️ Thua trận, chết, đột phá thất bại sẽ giảm kiên định.`
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('dao_tam:menu').setLabel('🧘 Xem Đạo Tâm').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('menu:cultivation').setLabel('🔙 Tu Luyện').setStyle(ButtonStyle.Secondary),
  );

  return interaction.update({ embeds: [embed], components: [row] });
}

/**
 * Tĩnh tọa — tăng kiên định
 */
async function handleMeditate(interaction, player) {
  const db = require('../database/connection');
  const { formatTime } = require('../utils/helpers');

  // Cooldown 30 phút
  const MEDITATE_CD = 1800000;
  const cooldown = db.prepare("SELECT * FROM cooldowns WHERE player_id = ? AND action_type = 'meditate'").get(player.id);
  if (cooldown && Date.now() < cooldown.expires_at) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.warning)
      .setTitle('⏳ Đang Tĩnh Tọa')
      .setDescription(`Cần chờ **${formatTime(cooldown.expires_at - Date.now())}** để tĩnh tọa tiếp.`);
    return interaction.update({ embeds: [embed], components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('dao_tam:menu').setLabel('🔙 Đạo Tâm').setStyle(ButtonStyle.Secondary)
      )
    ]});
  }

  const playerDaoTam = db.prepare('SELECT * FROM player_dao_tam WHERE player_id = ?').get(player.id);
  if (!playerDaoTam) {
    return interaction.update({
      embeds: [new EmbedBuilder().setColor(COLORS.error).setTitle('❌ Chưa có đạo tâm')],
      components: [],
    });
  }

  const gain = daoTamConfig.KIEN_DINH_EVENTS.MEDITATION;
  const newKd = Math.min(100, playerDaoTam.kien_dinh + gain);

  db.prepare('UPDATE player_dao_tam SET kien_dinh = ?, trang_thai = ? WHERE player_id = ?')
    .run(newKd, daoTamConfig.getStateFromKienDinh(newKd).id, player.id);
  db.prepare("INSERT OR REPLACE INTO cooldowns (player_id, action_type, expires_at) VALUES (?, 'meditate', ?)")
    .run(player.id, Date.now() + MEDITATE_CD);

  const state = daoTamConfig.getStateFromKienDinh(newKd);
  const dt = daoTamConfig.getDaoTamById(playerDaoTam.dao_tam_id);

  const embed = new EmbedBuilder()
    .setColor(COLORS.success)
    .setTitle('🧘 Tĩnh Tọa Thành Công')
    .setDescription(
      `**${player.name}** tĩnh tâm tu luyện...\n\n` +
      `${dt.emoji} Đạo Tâm **${dt.name}**\n` +
      `Kiên Định: **${playerDaoTam.kien_dinh}** → **${newKd}** (+${gain})\n` +
      `Trạng thái: ${state.emoji} **${state.name}**\n\n` +
      `⏳ Cooldown: **${formatTime(MEDITATE_CD)}**`
    );

  return interaction.update({ embeds: [embed], components: [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('dao_tam:menu').setLabel('🧘 Đạo Tâm').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('menu:cultivation').setLabel('🔙 Tu Luyện').setStyle(ButtonStyle.Secondary),
    )
  ]});
}

/**
 * Cải biến Đạo Tâm (đổi sang loại khác)
 */
async function handleChangeDaoTam(interaction, player) {
  const db = require('../database/connection');
  const playerDaoTam = db.prepare('SELECT * FROM player_dao_tam WHERE player_id = ?').get(player.id);
  if (!playerDaoTam) return;

  const currentDt = daoTamConfig.getDaoTamById(playerDaoTam.dao_tam_id);

  // Chi phí: 5000 linh thạch
  const COST = 5000;

  const embed = new EmbedBuilder()
    .setColor(COLORS.warning)
    .setTitle('🔄 Cải Biến Đạo Tâm')
    .setDescription(
      `Đạo tâm hiện tại: ${currentDt.emoji} **${currentDt.name}**\n\n` +
      `⚠️ **Cải biến sẽ:**\n` +
      `• Reset kiên định về 50\n` +
      `• Xóa toàn bộ NTCM theo đạo tâm cũ\n` +
      `• Chi phí: **${COST.toLocaleString()}** 💎 linh thạch\n\n` +
      `Chọn đạo tâm mới bên dưới:`
    );

  const selectOptions = daoTamConfig.getSelectableList()
    .filter(dt => dt.id !== playerDaoTam.dao_tam_id)
    .map(dt => ({
      label: dt.name,
      value: dt.id,
      emoji: dt.emoji,
      description: dt.description.slice(0, 80),
    }));

  const selectMenu = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('select:change_dao_tam')
      .setPlaceholder('🔄 Chọn Đạo Tâm mới...')
      .addOptions(selectOptions.slice(0, 25))
  );

  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('dao_tam:menu').setLabel('🔙 Hủy').setStyle(ButtonStyle.Secondary),
  );

  return interaction.update({ embeds: [embed], components: [selectMenu, backRow] });
}

/**
 * Xác nhận đổi đạo tâm
 */
async function confirmChangeDaoTam(interaction, player, newDaoTamId) {
  const db = require('../database/connection');
  const COST = 5000;

  if (player.linh_thach < COST) {
    return interaction.update({
      embeds: [new EmbedBuilder().setColor(COLORS.error).setTitle('❌ Không đủ linh thạch').setDescription(`Cần **${COST.toLocaleString()}** 💎 linh thạch.`)],
      components: [new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('dao_tam:menu').setLabel('🔙 Đạo Tâm').setStyle(ButtonStyle.Secondary)
      )],
    });
  }

  const dt = daoTamConfig.getDaoTamById(newDaoTamId);
  if (!dt || dt.special) return;

  // Trừ linh thạch
  db.prepare('UPDATE players SET linh_thach = linh_thach - ? WHERE id = ?').run(COST, player.id);
  // Update đạo tâm
  db.prepare('UPDATE player_dao_tam SET dao_tam_id = ?, kien_dinh = 50, trang_thai = ? WHERE player_id = ?')
    .run(newDaoTamId, 'moi_sinh', player.id);
  // Xóa NTCM theo đạo tâm (giữ lại NTCM thường)
  // TODO: Logic filter NTCM theo đạo tâm khi implement đầy đủ

  const embed = new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle(`${dt.emoji} Cải Biến Đạo Tâm Thành Công!`)
    .setDescription(
      `**${player.name}** đã chuyển sang **${dt.name}**!\n\n` +
      `_${dt.description}_\n\n` +
      `Kiên Định: **50/100** (Mới Sinh 🌱)\n` +
      `Chi phí: **-${COST.toLocaleString()}** 💎 linh thạch`
    );

  return interaction.update({ embeds: [embed], components: [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('dao_tam:menu').setLabel('🧘 Xem Đạo Tâm').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary),
    )
  ]});
}

/**
 * Cập nhật kiên định khi có sự kiện (gọi từ các hệ thống khác)
 */
function updateKienDinh(playerId, eventType) {
  const db = require('../database/connection');
  const playerDaoTam = db.prepare('SELECT * FROM player_dao_tam WHERE player_id = ?').get(playerId);
  if (!playerDaoTam) return null;

  const change = daoTamConfig.KIEN_DINH_EVENTS[eventType] || 0;
  if (change === 0) return null;

  const newKd = Math.max(-100, Math.min(100, playerDaoTam.kien_dinh + change));
  const newState = daoTamConfig.getStateFromKienDinh(newKd);

  db.prepare('UPDATE player_dao_tam SET kien_dinh = ?, trang_thai = ? WHERE player_id = ?')
    .run(newKd, newState.id, playerId);

  return { oldKd: playerDaoTam.kien_dinh, newKd, change, state: newState };
}

/**
 * Helper: Progress bar
 */
function createProgressBar(current, max, size = 10) {
  const filled = Math.round((current / max) * size);
  const empty = size - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

module.exports = {
  showDaoTamMenu,
  selectDaoTam,
  handleMeditate,
  handleChangeDaoTam,
  confirmChangeDaoTam,
  updateKienDinh,
};
