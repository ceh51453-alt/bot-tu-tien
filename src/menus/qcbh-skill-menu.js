/**
 * @file Skill Menu — Chiến Kỹ 4 Slots
 * @description Menu quản lý 4 loại kỹ năng: Võ Kỹ, Thân Pháp, Tuyệt Kỹ, Thần Thông
 */

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { COLORS } = require('../utils/constants');
const db = require('../database/connection');

const voKy = require('../../config/vo-ky');
const thanPhap = require('../../config/than-phap');
const tuyetKy = require('../../config/tuyet-ky');
const thanThong = require('../../config/than-thong');
const optionRoller = require('../utils/option-roller');

const SLOT_CONFIG = {
  vo_ky: { name: 'Võ Kỹ', emoji: '⚔️', config: voKy, getter: 'getVoKyById' },
  than_phap: { name: 'Thân Pháp', emoji: '💨', config: thanPhap, getter: 'getThanPhapById' },
  tuyet_ky: { name: 'Tuyệt Kỹ', emoji: '💫', config: tuyetKy, getter: 'getTuyetKyById' },
  than_thong: { name: 'Thần Thông', emoji: '🌟', config: thanThong, getter: 'getThanThongById' },
};

/**
 * Hiển thị menu chiến kỹ
 */
function showQcbhSkillMenu(interaction, player) {
  // Lấy các skill đã trang bị
  const equipped = db.prepare(
    'SELECT slot_type, skill_id, skill_level, options_json FROM player_skill_slots WHERE player_id = ?'
  ).all(player.id);

  const equippedMap = {};
  for (const row of equipped) {
    equippedMap[row.slot_type] = row;
  }

  let description = `**${player.name}** — Kỹ Năng Tu Luyện\n\n`;

  for (const [slotType, cfg] of Object.entries(SLOT_CONFIG)) {
    const eq = equippedMap[slotType];
    if (eq) {
      const skillData = cfg.config[cfg.getter](eq.skill_id);
      const skillName = skillData ? skillData.name : eq.skill_id;
      const skillEmoji = skillData ? skillData.emoji : '❓';

      // Parse options
      let optionsText = '';
      if (eq.options_json) {
        try {
          const opts = JSON.parse(eq.options_json);
          optionsText = opts.map(o => optionRoller.formatOption(o)).join(' | ');
        } catch (_e) { /* ignore */ }
      }

      description += `${cfg.emoji} **${cfg.name}**: ${skillEmoji} ${skillName} Lv.${eq.skill_level}\n`;
      if (optionsText) description += `  _${optionsText}_\n`;
    } else {
      description += `${cfg.emoji} **${cfg.name}**: ❌ Chưa trang bị\n`;
    }
    description += '\n';
  }

  const embed = new EmbedBuilder()
    .setColor(COLORS.info)
    .setTitle('📜 Chiến Kỹ')
    .setDescription(description)
    .setFooter({ text: 'Chọn loại kỹ năng để xem chi tiết & thay đổi' });

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('qcbh_skill:vo_ky').setLabel('⚔️ Võ Kỹ').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('qcbh_skill:than_phap').setLabel('💨 Thân Pháp').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('qcbh_skill:tuyet_ky').setLabel('💫 Tuyệt Kỹ').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('qcbh_skill:than_thong').setLabel('🌟 Thần Thông').setStyle(ButtonStyle.Primary),
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary),
  );

  return interaction.update({ embeds: [embed], components: [row1, row2] });
}

/**
 * Hiển thị danh sách kỹ năng có thể trang bị cho 1 slot
 */
function showSlotSkills(interaction, player, slotType) {
  const cfg = SLOT_CONFIG[slotType];
  if (!cfg) return interaction.reply({ content: 'Slot không hợp lệ.', ephemeral: true });

  const realmOrder = player.realm_index || 0;
  const weaponType = player.weapon_type;

  let available;
  if (slotType === 'vo_ky') {
    available = voKy.getByWeaponType(weaponType);
    available = available.filter(s => s.min_realm <= realmOrder);
  } else if (slotType === 'than_phap') {
    available = thanPhap.getAvailableAt(realmOrder);
  } else if (slotType === 'tuyet_ky') {
    available = tuyetKy.getAvailableAt(realmOrder, weaponType);
  } else if (slotType === 'than_thong') {
    // Kiểm tra Binh Nhận Chuyên Tinh
    const hasIgnore = db.prepare(
      "SELECT 1 FROM player_nghich_thien WHERE player_id = ? AND trait_id = 'binh_nhan_chuyen_tinh'"
    ).get(player.id);
    available = thanThong.getAvailableAt(realmOrder, weaponType, !!hasIgnore);
  }

  if (!available || available.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.warning)
      .setTitle(`${cfg.emoji} ${cfg.name}`)
      .setDescription('Chưa có kỹ năng nào phù hợp với vũ khí hoặc cảnh giới của bạn.');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('qcbh_skill:menu').setLabel('🔙 Kỹ Năng').setStyle(ButtonStyle.Secondary),
    );

    return interaction.update({ embeds: [embed], components: [row] });
  }

  // Hiện equipped
  const currentEquip = db.prepare(
    'SELECT skill_id FROM player_skill_slots WHERE player_id = ? AND slot_type = ?'
  ).get(player.id, slotType);

  let description = '';
  available.forEach(skill => {
    const isEquipped = currentEquip && currentEquip.skill_id === skill.id;
    description += `${skill.emoji} **${skill.name}** ${isEquipped ? '✅ (Đang dùng)' : ''}\n`;
    description += `  _${skill.description.slice(0, 100)}_\n`;
    description += `  CD: ${skill.cooldown_turns || 0} lượt | Mana: ${skill.mana_cost || 0}\n\n`;
  });

  const embed = new EmbedBuilder()
    .setColor(COLORS.info)
    .setTitle(`${cfg.emoji} Chọn ${cfg.name}`)
    .setDescription(description)
    .setFooter({ text: `Võ khí: ${weaponType || 'chưa chọn'} | Cảnh giới: ${realmOrder}` });

  // Select menu cho skill
  const options = available.slice(0, 25).map(skill => ({
    label: skill.name,
    value: `${slotType}:${skill.id}`,
    emoji: skill.emoji,
    description: (skill.description || '').slice(0, 80),
  }));

  const selectRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('select:qcbh_equip')
      .setPlaceholder(`Chọn ${cfg.name} để trang bị...`)
      .addOptions(options)
  );

  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('qcbh_skill:menu').setLabel('🔙 Kỹ Năng').setStyle(ButtonStyle.Secondary),
  );

  return interaction.update({ embeds: [embed], components: [selectRow, backRow] });
}

/**
 * Trang bị kỹ năng vào slot
 */
function equipQcbhSkill(interaction, player, slotType, skillId) {
  const cfg = SLOT_CONFIG[slotType];
  if (!cfg) return interaction.reply({ content: 'Slot không hợp lệ.', ephemeral: true });

  const skillData = cfg.config[cfg.getter](skillId);
  if (!skillData) return interaction.reply({ content: 'Kỹ năng không tồn tại.', ephemeral: true });

  // Roll options dựa trên Ngộ Tính
  const ngoTinh = player.ngo_tinh || 100;
  let rolledOptions = [];
  if (skillData.rollable_options) {
    rolledOptions = optionRoller.rollSkillOptions(skillData.rollable_options, ngoTinh);
  }

  const optionsJson = JSON.stringify(rolledOptions);

  // Upsert
  db.prepare(`
    INSERT INTO player_skill_slots (player_id, slot_type, skill_id, skill_level, options_json)
    VALUES (?, ?, ?, 1, ?)
    ON CONFLICT(player_id, slot_type) DO UPDATE SET
      skill_id = excluded.skill_id,
      skill_level = 1,
      options_json = excluded.options_json
  `).run(player.id, slotType, skillId, optionsJson);

  // Hiển thị kết quả
  let optionsDisplay = '';
  if (rolledOptions.length > 0) {
    optionsDisplay = rolledOptions.map(o => optionRoller.formatOption(o)).join('\n');
  }

  const embed = new EmbedBuilder()
    .setColor(COLORS.success)
    .setTitle(`✅ Đã trang bị ${cfg.name}!`)
    .setDescription(
      `${skillData.emoji} **${skillData.name}**\n\n` +
      `_${skillData.description}_\n\n` +
      (optionsDisplay ? `🎲 **Options đã roll (Ngộ Tính: ${ngoTinh}):**\n${optionsDisplay}\n\n` : '') +
      `CD: ${skillData.cooldown_turns || 0} lượt | Mana: ${skillData.mana_cost || 0}`
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('qcbh_skill:menu').setLabel('🔙 Kỹ Năng').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary),
  );

  return interaction.update({ embeds: [embed], components: [row] });
}

module.exports = {
  showQcbhSkillMenu,
  showSlotSkills,
  equipQcbhSkill,
};
