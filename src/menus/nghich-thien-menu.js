/**
 * @file Nghịch Thiên Menu
 * @description Menu quản lý 5 slot Nghịch Thiên Cải Mệnh (passive traits)
 */

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { COLORS } = require('../utils/constants');
const db = require('../database/connection');

const nghichThien = require('../../config/nghich-thien');

/**
 * Hiển thị menu Nghịch Thiên
 */
function showNghichThienMenu(interaction, player) {
  const realmOrder = player.realm_index || 0;
  const unlockedSlots = nghichThien.getUnlockedSlotCount(realmOrder);

  // Lấy traits đã chọn
  const equipped = db.prepare(
    'SELECT slot, trait_id FROM player_nghich_thien WHERE player_id = ? ORDER BY slot'
  ).all(player.id);

  const equippedMap = {};
  const equippedIds = [];
  for (const row of equipped) {
    equippedMap[row.slot] = row.trait_id;
    equippedIds.push(row.trait_id);
  }

  let description = `**${player.name}** — Nghịch Thiên Cải Mệnh\n`;
  description += `Slot đã mở: **${unlockedSlots}/5** | Đã dùng: **${equipped.length}/${unlockedSlots}**\n\n`;

  for (let slot = 1; slot <= 5; slot++) {
    const unlockInfo = nghichThien.SLOT_UNLOCK[slot];
    const isUnlocked = nghichThien.isSlotUnlocked(slot, realmOrder);
    const traitId = equippedMap[slot];

    if (!isUnlocked) {
      description += `🔒 **Slot ${slot}**: _Mở tại ${unlockInfo.realm_name}_\n`;
    } else if (traitId) {
      const trait = nghichThien.getNghichThienById(traitId);
      if (trait) {
        description += `${trait.emoji} **Slot ${slot}**: ${trait.name} (${trait.rating})\n`;
        description += `  _${trait.description.slice(0, 80)}_\n`;
      } else {
        description += `❓ **Slot ${slot}**: ${traitId}\n`;
      }
    } else {
      description += `⬜ **Slot ${slot}**: Trống\n`;
    }
    description += '\n';
  }

  const embed = new EmbedBuilder()
    .setColor(0x9B59B6)
    .setTitle('🔮 Nghịch Thiên Cải Mệnh')
    .setDescription(description)
    .setFooter({ text: 'Chọn trait khi đột phá. Chain traits thay thế nhau khi nâng cấp.' });

  const components = [];

  // Nếu có slot trống → cho chọn
  const emptySlots = [];
  for (let s = 1; s <= 5; s++) {
    if (nghichThien.isSlotUnlocked(s, realmOrder) && !equippedMap[s]) {
      emptySlots.push(s);
    }
  }

  if (emptySlots.length > 0) {
    const available = nghichThien.getAvailableTraits(equippedIds);
    if (available.length > 0) {
      const options = available.slice(0, 25).map(trait => ({
        label: `${trait.name} (${trait.rating})`,
        value: `${emptySlots[0]}:${trait.id}`,
        emoji: trait.emoji,
        description: trait.description.slice(0, 80),
      }));

      components.push(new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select:nghich_thien_equip')
          .setPlaceholder(`Chọn Nghịch Thiên cho Slot ${emptySlots[0]}...`)
          .addOptions(options)
      ));
    }
  }

  components.push(new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary),
  ));

  return interaction.update({ embeds: [embed], components });
}

/**
 * Trang bị Nghịch Thiên trait
 */
function equipNghichThien(interaction, player, slot, traitId) {
  const trait = nghichThien.getNghichThienById(traitId);
  if (!trait) return interaction.reply({ content: 'Trait không tồn tại.', ephemeral: true });

  const realmOrder = player.realm_index || 0;
  if (!nghichThien.isSlotUnlocked(slot, realmOrder)) {
    return interaction.reply({ content: `Slot ${slot} chưa mở!`, ephemeral: true });
  }

  // Kiểm tra prerequisite
  if (trait.prerequisite) {
    const hasPrereq = db.prepare(
      'SELECT 1 FROM player_nghich_thien WHERE player_id = ? AND trait_id = ?'
    ).get(player.id, trait.prerequisite);
    if (!hasPrereq) {
      const prereqData = nghichThien.getNghichThienById(trait.prerequisite);
      return interaction.reply({
        content: `Cần có **${prereqData ? prereqData.name : trait.prerequisite}** trước!`,
        ephemeral: true,
      });
    }
  }

  // Nếu trait có replaces → tìm và thay thế slot cũ
  if (trait.replaces) {
    const oldSlot = db.prepare(
      'SELECT slot FROM player_nghich_thien WHERE player_id = ? AND trait_id = ?'
    ).get(player.id, trait.replaces);
    if (oldSlot) {
      // Thay thế trait cũ bằng trait mới ở cùng slot
      db.prepare(
        'UPDATE player_nghich_thien SET trait_id = ? WHERE player_id = ? AND slot = ?'
      ).run(traitId, player.id, oldSlot.slot);

      const embed = new EmbedBuilder()
        .setColor(COLORS.success)
        .setTitle('⬆️ Nâng cấp Nghịch Thiên!')
        .setDescription(
          `${trait.emoji} **${trait.name}** (${trait.rating})\n\n` +
          `_${trait.description}_\n\n` +
          `Đã thay thế slot ${oldSlot.slot} (nâng cấp từ ${trait.replaces}).`
        );

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('qcbh_skill:nghich_thien').setLabel('🔙 Nghịch Thiên').setStyle(ButtonStyle.Secondary),
      );

      return interaction.update({ embeds: [embed], components: [row] });
    }
  }

  // Insert mới
  db.prepare(
    'INSERT OR REPLACE INTO player_nghich_thien (player_id, slot, trait_id) VALUES (?, ?, ?)'
  ).run(player.id, slot, traitId);

  const embed = new EmbedBuilder()
    .setColor(COLORS.success)
    .setTitle('✅ Đã chọn Nghịch Thiên!')
    .setDescription(
      `${trait.emoji} **${trait.name}** (${trait.rating})\n\n` +
      `_${trait.description}_\n\n` +
      `Slot: **${slot}/5**` +
      (trait.chain ? `\nChuỗi: **${trait.chain}** Tier ${trait.tier}` : '')
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('qcbh_skill:nghich_thien').setLabel('🔙 Nghịch Thiên').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary),
  );

  return interaction.update({ embeds: [embed], components: [row] });
}

module.exports = {
  showNghichThienMenu,
  equipNghichThien,
};
