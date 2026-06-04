/**
 * @file Tâm Pháp Menu — 6 Slots
 * @description Menu quản lý 6 slot Tâm Pháp
 */

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { COLORS } = require('../utils/constants');
const db = require('../database/connection');

const tamPhap = require('../../config/tam-phap');
const optionRoller = require('../utils/option-roller');

/**
 * Hiển thị menu Tâm Pháp
 */
function showTamPhapMenu(interaction, player) {
  // Lấy tâm pháp đã trang bị
  const equipped = db.prepare(
    'SELECT slot_type, tam_phap_id, level, options_json FROM player_tam_phap WHERE player_id = ?'
  ).all(player.id);

  const equippedMap = {};
  for (const row of equipped) {
    equippedMap[row.slot_type] = row;
  }

  let description = `**${player.name}** — Tâm Pháp Tu Luyện\n\n`;

  for (const [slotId, slotInfo] of Object.entries(tamPhap.TAM_PHAP_SLOTS)) {
    const eq = equippedMap[slotId];
    if (eq) {
      const tpData = tamPhap.getTamPhapById(eq.tam_phap_id);
      const name = tpData ? tpData.name : eq.tam_phap_id;
      const emoji = tpData ? tpData.emoji : '📖';

      let optText = '';
      if (eq.options_json) {
        try {
          const opts = JSON.parse(eq.options_json);
          optText = opts.map(o => optionRoller.formatOption(o)).join(' | ');
        } catch (_e) { /* ignore */ }
      }

      description += `${slotInfo.emoji} **${slotInfo.name}**: ${emoji} ${name} Lv.${eq.level}\n`;
      if (optText) description += `  _${optText}_\n`;
    } else {
      description += `${slotInfo.emoji} **${slotInfo.name}**: ❌ Chưa trang bị\n`;
      description += `  _${slotInfo.description}_\n`;
    }
    description += '\n';
  }

  const embed = new EmbedBuilder()
    .setColor(0x2ECC71)
    .setTitle('📚 Tâm Pháp')
    .setDescription(description)
    .setFooter({ text: 'Chọn loại slot để xem tâm pháp có thể trang bị' });

  // 6 nút cho 6 slot types
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('qcbh_skill:tp_than_cong').setLabel('📕 Thần Công').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('qcbh_skill:tp_dai_phap').setLabel('📗 Đại Pháp').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('qcbh_skill:tp_bi_quyen').setLabel('📘 Bí Quyển').setStyle(ButtonStyle.Primary),
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('qcbh_skill:tp_quyet').setLabel('📙 Quyết').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('qcbh_skill:tp_ngang').setLabel('📓 Ngang').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('qcbh_skill:tp_luc').setLabel('📒 Lục').setStyle(ButtonStyle.Secondary),
  );
  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary),
  );

  return interaction.update({ embeds: [embed], components: [row1, row2, row3] });
}

/**
 * Hiển thị tâm pháp có thể chọn cho 1 slot
 */
function showTamPhapSlot(interaction, player, slotType) {
  const realmOrder = player.realm_index || 0;
  const weaponType = player.weapon_type;

  const available = tamPhap.getAvailableAt(realmOrder, slotType, weaponType);

  if (!available || available.length === 0) {
    const slotInfo = tamPhap.TAM_PHAP_SLOTS[slotType];
    const embed = new EmbedBuilder()
      .setColor(COLORS.warning)
      .setTitle(`${slotInfo ? slotInfo.emoji : '📖'} ${slotInfo ? slotInfo.name : slotType}`)
      .setDescription('Chưa có tâm pháp phù hợp.');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('qcbh_skill:tam_phap').setLabel('🔙 Tâm Pháp').setStyle(ButtonStyle.Secondary),
    );

    return interaction.update({ embeds: [embed], components: [row] });
  }

  const slotInfo = tamPhap.TAM_PHAP_SLOTS[slotType];
  let description = '';
  available.forEach(tp => {
    description += `${tp.emoji} **${tp.name}** (${tp.grade})\n`;
    description += `  _${tp.description.slice(0, 100)}_\n\n`;
  });

  const embed = new EmbedBuilder()
    .setColor(0x2ECC71)
    .setTitle(`${slotInfo.emoji} Chọn ${slotInfo.name}`)
    .setDescription(description);

  const options = available.slice(0, 25).map(tp => ({
    label: tp.name,
    value: `${slotType}:${tp.id}`,
    emoji: tp.emoji,
    description: (tp.description || '').slice(0, 80),
  }));

  const selectRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('select:tam_phap_equip')
      .setPlaceholder(`Chọn ${slotInfo.name}...`)
      .addOptions(options)
  );

  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('qcbh_skill:tam_phap').setLabel('🔙 Tâm Pháp').setStyle(ButtonStyle.Secondary),
  );

  return interaction.update({ embeds: [embed], components: [selectRow, backRow] });
}

/**
 * Trang bị tâm pháp
 */
function equipTamPhap(interaction, player, slotType, tamPhapId) {
  const tpData = tamPhap.getTamPhapById(tamPhapId);
  if (!tpData) return interaction.reply({ content: 'Tâm pháp không tồn tại.', ephemeral: true });

  // Roll options
  const ngoTinh = player.ngo_tinh || 100;
  let rolledOptions = [];
  if (tpData.rollable_options) {
    rolledOptions = optionRoller.rollSkillOptions(tpData.rollable_options, ngoTinh);
  }
  const optionsJson = JSON.stringify(rolledOptions);

  db.prepare(`
    INSERT INTO player_tam_phap (player_id, slot_type, tam_phap_id, level, options_json)
    VALUES (?, ?, ?, 1, ?)
    ON CONFLICT(player_id, slot_type) DO UPDATE SET
      tam_phap_id = excluded.tam_phap_id,
      level = 1,
      options_json = excluded.options_json
  `).run(player.id, slotType, tamPhapId, optionsJson);

  let optionsDisplay = '';
  if (rolledOptions.length > 0) {
    optionsDisplay = rolledOptions.map(o => optionRoller.formatOption(o)).join('\n');
  }

  const embed = new EmbedBuilder()
    .setColor(COLORS.success)
    .setTitle('✅ Đã trang bị Tâm Pháp!')
    .setDescription(
      `${tpData.emoji} **${tpData.name}** (${tpData.grade})\n\n` +
      `_${tpData.description}_\n\n` +
      (optionsDisplay ? `🎲 **Options (Ngộ Tính: ${ngoTinh}):**\n${optionsDisplay}\n\n` : '') +
      `Slot: **${tamPhap.TAM_PHAP_SLOTS[slotType]?.name || slotType}**`
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('qcbh_skill:tam_phap').setLabel('🔙 Tâm Pháp').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary),
  );

  return interaction.update({ embeds: [embed], components: [row] });
}

module.exports = {
  showTamPhapMenu,
  showTamPhapSlot,
  equipTamPhap,
};
