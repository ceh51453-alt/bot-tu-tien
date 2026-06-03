/**
 * @file Sect / Tông Môn System
 * @description Quản lý tông môn — lập tông, gia nhập, cống hiến, rời tông
 */

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const db = require('../database/connection');
const { COLORS } = require('../utils/constants');
const { formatNumber } = require('../utils/helpers');

// Cost and requirements
const SECT_CREATE_COST = 1000;
const SECT_MIN_REALM = 3; // Kim Đan (Realm Index 3)
const MAX_MEMBERS = 20;

// Prepared SQL statements
const stmtGetPlayerSect = db.prepare(`
  SELECT sm.*, s.name as sect_name, s.level, s.treasury, s.max_members 
  FROM sect_members sm 
  JOIN sects s ON sm.sect_id = s.id 
  WHERE sm.player_id = ?
`);

const stmtGetSectById = db.prepare('SELECT * FROM sects WHERE id = ?');
const stmtGetSectByName = db.prepare('SELECT * FROM sects WHERE name = ?');
const stmtGetAllSects = db.prepare('SELECT * FROM sects LIMIT 25');
const stmtGetSectMembersCount = db.prepare('SELECT COUNT(*) as count FROM sect_members WHERE sect_id = ?');
const stmtGetSectMembers = db.prepare(`
  SELECT sm.*, p.name as player_name, p.realm_index, p.sub_realm 
  FROM sect_members sm 
  JOIN players p ON sm.player_id = p.id 
  WHERE sm.sect_id = ? 
  ORDER BY sm.contribution DESC
`);

const stmtInsertSect = db.prepare(`
  INSERT INTO sects (name, leader_id, level, treasury, max_members) 
  VALUES (?, ?, 1, 0, ?)
`);

const stmtInsertSectMember = db.prepare(`
  INSERT INTO sect_members (player_id, sect_id, role, contribution) 
  VALUES (?, ?, ?, ?)
`);

const stmtDeleteSectMember = db.prepare('DELETE FROM sect_members WHERE player_id = ?');
const stmtDeleteSect = db.prepare('DELETE FROM sects WHERE id = ?');
const stmtSpendLinhThach = db.prepare('UPDATE players SET linh_thach = linh_thach - ? WHERE id = ? AND linh_thach >= ?');
const stmtAddLinhThach = db.prepare('UPDATE players SET linh_thach = linh_thach + ? WHERE id = ?');
const stmtAddSectTreasury = db.prepare('UPDATE sects SET treasury = treasury + ? WHERE id = ?');
const stmtAddPlayerContribution = db.prepare('UPDATE sect_members SET contribution = contribution + ? WHERE player_id = ?');

/**
 * Hiển thị giao diện lập tông môn hoặc kiểm tra yêu cầu
 */
async function handleCreateSect(interaction, player) {
  if (player.realm_index < SECT_MIN_REALM) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setTitle('❌ Cảnh Giới Chưa Đủ')
      .setDescription(`Để lập tông môn, đạo hữu cần đạt cảnh giới tối thiểu **Kim Đan** (bậc ${SECT_MIN_REALM}). Hiện tại đạo hữu mới ở bậc ${player.realm_index}.`);
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (player.linh_thach < SECT_CREATE_COST) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setTitle('❌ Không Đủ Linh Thạch')
      .setDescription(`Lập tông môn cần tiêu hao **${formatNumber(SECT_CREATE_COST)}** Linh Thạch. Đạo hữu hiện chỉ có **${formatNumber(player.linh_thach)}** Linh Thạch.`);
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // Check if player is already in a sect
  const currentSect = stmtGetPlayerSect.get(player.id);
  if (currentSect) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.WARNING)
      .setTitle('⚠️ Đang Ở Trong Tông Môn')
      .setDescription(`Đạo hữu đã là thành viên của tông môn **${currentSect.sect_name}**. Phải rời tông môn hiện tại trước khi lập tông mới.`);
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // Show modal to input name
  const modal = new ModalBuilder()
    .setCustomId(`sect:create_submit`)
    .setTitle('🏗️ Khai Sáng Tông Môn');

  const nameInput = new TextInputBuilder()
    .setCustomId('sect_name')
    .setLabel('Tên Tông Môn (Tối đa 20 ký tự)')
    .setStyle(TextInputStyle.Short)
    .setMinLength(3)
    .setMaxLength(20)
    .setPlaceholder('ví dụ: Thanh Vân Tông')
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder().addComponents(nameInput));
  await interaction.showModal(modal);
}

/**
 * Xác nhận lập tông môn sau khi submit Modal
 */
async function confirmCreateSect(interaction, player, sectName) {
  sectName = sectName.trim();
  if (sectName.length < 3 || sectName.length > 20) {
    return interaction.reply({ content: 'Tên tông môn phải từ 3 đến 20 ký tự.', ephemeral: true });
  }

  // Check unique name
  const exists = stmtGetSectByName.get(sectName);
  if (exists) {
    return interaction.reply({ content: 'Tên tông môn này đã tồn tại trong giang hồ.', ephemeral: true });
  }

  // Transaction for sect creation
  const createTx = db.transaction(() => {
    // Trừ linh thạch
    const spent = stmtSpendLinhThach.run(SECT_CREATE_COST, player.id, SECT_CREATE_COST);
    if (spent.changes === 0) throw new Error('Không đủ Linh Thạch');

    // Tạo tông môn
    const sResult = stmtInsertSect.run(sectName, player.id, MAX_MEMBERS);
    const sectId = sResult.lastInsertRowid;

    // Cho leader gia nhập
    stmtInsertSectMember.run(player.id, sectId, 'leader', 500); // Tặng sẵn 500 cống hiến
  });

  try {
    createTx();
  } catch (err) {
    return interaction.reply({ content: `Thất bại: ${err.message}`, ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle('🎉 KHAI SÁNG TÔNG MÔN THÀNH CÔNG! 🎉')
    .setDescription(
      `Chúc mừng **${player.name}** đã khai sơn lập phái, thành lập **${sectName}**!\n\n` +
      `👑 Chức vụ: **Tông Chủ**\n` +
      `💎 Tiêu hao: **-${formatNumber(SECT_CREATE_COST)}** Linh Thạch\n` +
      `✨ Tặng ngay: **500** Điểm cống hiến`
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

/**
 * Hiển thị thông tin cống hiến tông môn
 */
async function handleDonateSect(interaction, player) {
  const currentSect = stmtGetPlayerSect.get(player.id);
  if (!currentSect) {
    return interaction.reply({ content: 'Bạn chưa gia nhập tông môn.', ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setColor(COLORS.SECT)
    .setTitle(`💎 Cống Hiến Tông Môn — ${currentSect.sect_name}`)
    .setDescription(
      `Đóng góp Linh Thạch giúp phát triển Tông Môn, tăng Ngân khố và nhận điểm Cống hiến tương ứng.\n` +
      `Tỷ lệ quy đổi: **1 Linh Thạch = 1 Điểm Cống Hiến**.\n\n` +
      `💎 Linh Thạch hiện có: **${formatNumber(player.linh_thach)}**\n` +
      `🏵️ Cống hiến tích lũy: **${formatNumber(currentSect.contribution)}**`
    )
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('sect:donate:100').setLabel('💎 Quyên Góp 100').setStyle(ButtonStyle.Primary).setDisabled(player.linh_thach < 100),
    new ButtonBuilder().setCustomId('sect:donate:500').setLabel('💎 Quyên Góp 500').setStyle(ButtonStyle.Primary).setDisabled(player.linh_thach < 500),
    new ButtonBuilder().setCustomId('sect:donate:1000').setLabel('💎 Quyên Góp 1000').setStyle(ButtonStyle.Primary).setDisabled(player.linh_thach < 1000),
    new ButtonBuilder().setCustomId('sect:info').setLabel('🔙 Quay Lại').setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

/**
 * Thực thi cống hiến
 */
async function executeDonateSect(interaction, player, amount) {
  amount = parseInt(amount);
  const currentSect = stmtGetPlayerSect.get(player.id);
  if (!currentSect) return interaction.reply({ content: 'Không tìm thấy tông môn.', ephemeral: true });

  if (player.linh_thach < amount) {
    return interaction.reply({ content: 'Bạn không đủ Linh Thạch.', ephemeral: true });
  }

  const donateTx = db.transaction(() => {
    stmtSpendLinhThach.run(amount, player.id, amount);
    stmtAddSectTreasury.run(amount, currentSect.sect_id);
    stmtAddPlayerContribution.run(amount, player.id);
  });

  donateTx();

  const updatedPlayer = db.prepare('SELECT * FROM players WHERE id = ?').get(player.id);

  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle('🙏 Quyên Góp Thành Công')
    .setDescription(
      `Đạo hữu đã quyên góp **${formatNumber(amount)}** 💎 Linh Thạch vào Kho bạc **${currentSect.sect_name}**.\n` +
      `🏵️ Nhận thêm: **+${formatNumber(amount)}** điểm Cống hiến!`
    )
    .setFooter({ text: `Linh Thạch còn lại: ${formatNumber(updatedPlayer.linh_thach)}` })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('sect:info').setLabel('📋 Xem Tông Môn').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

/**
 * Rời tông môn
 */
async function handleLeaveSect(interaction, player) {
  const currentSect = stmtGetPlayerSect.get(player.id);
  if (!currentSect) {
    return interaction.reply({ content: 'Bạn chưa ở trong tông môn.', ephemeral: true });
  }

  // Nếu là tông chủ, rời tông = giải tán tông môn (hoặc thông báo)
  const isLeader = currentSect.role === 'leader';

  const embed = new EmbedBuilder()
    .setColor(COLORS.WARNING)
    .setTitle(isLeader ? '⚠️ GIẢI TÁN TÔNG MÔN?' : '👋 RỜI KHỎI TÔNG MÔN?')
    .setDescription(
      isLeader
        ? `Đạo hữu đang là **Tông Chủ** của **${currentSect.sect_name}**.\nNếu đạo hữu rời đi, tông môn này sẽ bị **GIẢI TÁN HOÀN TOÀN**, tất cả đệ tử khác cũng sẽ bị trục xuất!\n\nĐạo hữu có chắc chắn muốn thực hiện?`
        : `Đạo hữu có chắc chắn muốn rời khỏi **${currentSect.sect_name}**?\nMọi điểm cống hiến tích lũy sẽ bị xóa bỏ.`
    )
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('sect:leave:confirm').setLabel(isLeader ? '💥 Giải Tán' : '👋 Rời Tông').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('sect:info').setLabel('🔙 Hủy Bỏ').setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

/**
 * Xác nhận rời tông môn
 */
async function confirmLeaveSect(interaction, player) {
  const currentSect = stmtGetPlayerSect.get(player.id);
  if (!currentSect) return interaction.update({ content: 'Không ở trong tông môn.', embeds: [], components: [] });

  const isLeader = currentSect.role === 'leader';

  const leaveTx = db.transaction(() => {
    if (isLeader) {
      // Xóa tất cả thành viên trước
      db.prepare('DELETE FROM sect_members WHERE sect_id = ?').run(currentSect.sect_id);
      // Xóa tông môn
      stmtDeleteSect.run(currentSect.sect_id);
    } else {
      // Chỉ xóa bản thân
      stmtDeleteSectMember.run(player.id);
    }
  });

  leaveTx();

  const embed = new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle(isLeader ? '💥 Tông Môn Đã Giải Tán' : '👋 Rời Tông Thành Công')
    .setDescription(
      isLeader
        ? `Tông môn **${currentSect.sect_name}** đã chính thức tan rã. Đạo hữu trở lại làm tán tu tự do.`
        : `Đạo hữu đã rời khỏi **${currentSect.sect_name}**, trở lại hành trình tu tiên độc hành.`
    )
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Primary)
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

/**
 * Hiển thị danh sách tông môn để xin gia nhập
 */
async function showSectList(interaction, player) {
  const currentSect = stmtGetPlayerSect.get(player.id);
  if (currentSect) {
    return interaction.reply({ content: 'Bạn đang ở trong một tông môn rồi.', ephemeral: true });
  }

  const sects = stmtGetAllSects.all();

  if (sects.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.WARNING)
      .setTitle('🏛️ Danh Sách Tông Môn')
      .setDescription('Chưa có tông môn nào được thành lập. Hãy tự lập tông phái đầu tiên!');
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('sect:create').setLabel('🏗️ Lập Tông').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('menu:main').setLabel('🔙 Quay Lại').setStyle(ButtonStyle.Secondary)
    );
    return interaction.update({ embeds: [embed], components: [row] });
  }

  const options = sects.map(s => {
    const mCount = stmtGetSectMembersCount.get(s.id).count;
    return {
      label: s.name,
      description: `Cấp ${s.level} — Thành viên: ${mCount}/${s.max_members} — Kho: 💎 ${formatNumber(s.treasury)}`,
      value: String(s.id),
      emoji: '🏛️',
    };
  });

  const selectRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('select:join_sect')
      .setPlaceholder('Xin gia nhập tông môn...')
      .addOptions(options)
  );

  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary)
  );

  const embed = new EmbedBuilder()
    .setColor(COLORS.SECT)
    .setTitle('🏛️ Tông Môn Thiên Hạ')
    .setDescription('Chọn một tông phái bên dưới để xin nhập môn học đạo:')
    .setTimestamp();

  await interaction.update({ embeds: [embed], components: [selectRow, backRow] });
}

/**
 * Xử lý gia nhập tông môn
 */
async function executeJoinSect(interaction, player, sectId) {
  const sId = parseInt(sectId);
  const sect = stmtGetSectById.get(sId);
  if (!sect) return interaction.reply({ content: 'Tông môn không tồn tại.', ephemeral: true });

  // Kiểm tra có ở trong tông môn khác không
  const currentSect = stmtGetPlayerSect.get(player.id);
  if (currentSect) {
    return interaction.reply({ content: 'Bạn đang ở trong tông môn rồi.', ephemeral: true });
  }

  // Kiểm tra sĩ số
  const mCount = stmtGetSectMembersCount.get(sId).count;
  if (mCount >= sect.max_members) {
    return interaction.reply({ content: 'Tông môn này đã đầy đệ tử.', ephemeral: true });
  }

  // Gia nhập
  stmtInsertSectMember.run(player.id, sId, 'member', 0);

  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle('🎉 Nhập Môn Thành Công!')
    .setDescription(`Chúc mừng đạo hữu đã gia nhập tông phái **${sect.name}**!\nHãy chăm chỉ cống hiến và làm nhiệm vụ để thăng cấp chức vụ.`)
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('sect:info').setLabel('📋 Giao Diện Tông Môn').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

/**
 * Hiển thị chi tiết tông môn (thành viên, chức vụ, kho bạc)
 */
async function showSectInfo(interaction, player) {
  const membership = stmtGetPlayerSect.get(player.id);
  if (!membership) {
    return showSectList(interaction, player);
  }

  const members = stmtGetSectMembers.all(membership.sect_id);
  const memberListText = members.map((m, i) => {
    const roleLabel = m.role === 'leader' ? '👑 Tông Chủ' : m.role === 'elder' ? '🧙 Trưởng Lão' : '🧑 Đệ Tử';
    const activeText = m.player_id === player.id ? ' **(Bạn)**' : '';
    return `**${i + 1}.** ${m.player_name}${activeText}\n  👉 Chức vụ: \`${roleLabel}\` | Cống hiến: **${formatNumber(m.contribution)}**`;
  }).join('\n\n');

  const embed = new EmbedBuilder()
    .setColor(COLORS.SECT)
    .setTitle(`🏛️ ${membership.sect_name}`)
    .setDescription(
      `**Cấp Tông**: ${membership.level}\n` +
      `**Thành viên**: ${members.length}/${membership.max_members}\n` +
      `**Kho Bạc**: 💎 ${formatNumber(membership.treasury)} Linh Thạch\n\n` +
      `── **DANH SÁCH THÀNH VIÊN** ──\n\n` +
      memberListText
    )
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('sect:donate').setLabel('💎 Quyên Góp').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('sect:leave').setLabel('👋 Rời Tông').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

module.exports = {
  handleCreateSect,
  confirmCreateSect,
  handleDonateSect,
  executeDonateSect,
  handleLeaveSect,
  confirmLeaveSect,
  showSectList,
  executeJoinSect,
  showSectInfo,
};
