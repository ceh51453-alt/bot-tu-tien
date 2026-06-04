const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder } = require('discord.js');
const { COLORS } = require('../utils/constants');
const { weightedRandom, rollConstitution } = require('../utils/random');
const weaponTypes = require('../../config/weapon-types');
const tienThien = require('../../config/tien-thien');

/**
 * Character Creation System
 * Flow: Chọn Đạo → Nhập Tên → Chọn Linh Căn → Chọn Loại Võ Khí → Roll → Tạo xong
 */

/**
 * Handle Dao Path selection (Chính Đạo / Ma Đạo)
 */
async function handleDaoPathSelect(interaction, daoPath) {
  // Store selection temporarily in customId
  // Show name input modal
  const modal = new ModalBuilder()
    .setCustomId(`create:name:${daoPath}`)
    .setTitle('🐉 Tạo Nhân Vật Tu Tiên');

  const nameInput = new TextInputBuilder()
    .setCustomId('character_name')
    .setLabel('Đạo hiệu (Tên nhân vật)')
    .setPlaceholder('VD: Huyền Vũ, Thiên Long, Lý Bạch...')
    .setMinLength(2)
    .setMaxLength(20)
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder().addComponents(nameInput));

  await interaction.showModal(modal);
}

/**
 * Handle name submission from modal → Show Linh Căn selection
 */
async function handleNameSubmit(interaction, daoPath) {
  const name = interaction.fields.getTextInputValue('character_name');

  // Check if name already exists
  const db = require('../database/connection');
  const existing = db.prepare('SELECT id FROM players WHERE name = ?').get(name);
  if (existing) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.error)
          .setTitle('❌ Đạo hiệu đã tồn tại')
          .setDescription(`Tên **${name}** đã có người sử dụng. Hãy chọn tên khác.`),
      ],
      ephemeral: true,
    });
  }

  const roots = require('../../config/spiritual-roots');
  const { createSpiritualRootSelect } = require('../ui/select-menus');

  const embed = new EmbedBuilder()
    .setColor(COLORS.cultivation)
    .setTitle('🌱 Chọn Linh Căn')
    .setDescription(
      `Hoan nghênh **${name}** bước vào con đường ${daoPath === 'ma' ? '😈 Ma Đạo' : '☀️ Chính Đạo'}!\n\n` +
      `Linh căn quyết định **nguyên tố** và **tốc độ tu luyện** của bạn.\n\n` +
      roots.list
        .filter(r => {
          // Âm Linh Căn chỉ cho Ma Đạo
          if (r.id === 'am' && daoPath !== 'ma') return false;
          // Hỗn Độn cực hiếm, không cho chọn
          if (r.id === 'hon_don') return false;
          return true;
        })
        .map(r => `${r.emoji} **${r.name}** — ${r.element}\n  _${r.description}_`)
        .join('\n\n')
    )
    .setFooter({ text: '1% cơ hội nhận được Hỗn Độn Linh Căn khi random!' });

  const selectRow = createSpiritualRootSelect(daoPath, name);

  await interaction.reply({ embeds: [embed], components: [selectRow], ephemeral: false });
}

/**
 * Handle Linh Căn selection → Roll Thể Chất
 */
async function handleRootSelect(interaction, rootId, daoPath, name) {
  const roots = require('../../config/spiritual-roots');
  const constitutions = require('../../config/constitutions');
  const { chance } = require('../utils/helpers');

  // 1% chance to get Hỗn Độn Linh Căn instead
  let selectedRoot = rootId;
  let rootType = 'don'; // Default đơn linh căn
  let isHonDon = false;

  if (chance(1)) {
    selectedRoot = 'hon_don';
    rootType = 'hon_don';
    isHonDon = true;
  } else if (chance(10)) {
    // 10% chance for tam linh căn (3 elements)
    rootType = 'tam';
  } else if (chance(30)) {
    // 30% chance for song linh căn (2 elements)
    rootType = 'song';
  }

  const root = roots.list.find(r => r.id === selectedRoot);

  // Roll constitution
  const rolledConstitution = rollConstitution();
  const constitution = constitutions.list.find(c => c.id === rolledConstitution);

  const embed = new EmbedBuilder()
    .setColor(isHonDon ? 0xFFD700 : COLORS.success)
    .setTitle(isHonDon ? '🌟 THIÊN MỆNH! Hỗn Độn Linh Căn!' : '🌱 Linh Căn Đã Chọn')
    .setDescription(
      (isHonDon
        ? `✨ **Thiên địa chấn động!** Bạn sở hữu **Hỗn Độn Linh Căn** cực kỳ hiếm có!\n\n`
        : `${root.emoji} **${root.name}** — ${root.element}\n` +
          `Loại: **${rootType === 'don' ? 'Đơn Linh Căn' : rootType === 'song' ? 'Song Linh Căn' : 'Tam Linh Căn'}**\n\n`) +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `💪 **Thể Chất**: ${constitution.name}\n` +
      `Phẩm Cấp: **${constitution.rarity}**\n` +
      `Đặc Tính: _${constitution.special_ability ? constitution.special_ability.name : 'Không có'}_\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `\n\nBước tiếp theo: **Chọn loại Võ Khí**`
    );

  // Chọn Weapon Type thay vì confirm ngay
  const weaponSelect = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`create:weapon:${name}:${selectedRoot}:${rootType}:${rolledConstitution}:${daoPath}`)
      .setPlaceholder('⚔️ Chọn loại Võ Khí tu luyện...')
      .addOptions(
        weaponTypes.list.map(wt => ({
          label: `${wt.name}`,
          value: wt.id,
          emoji: wt.emoji,
          description: wt.description.slice(0, 80),
        }))
      )
  );

  await interaction.update({ embeds: [embed], components: [weaponSelect] });
}

/**
 * Handle weapon type selection → Roll Tiên Thiên → Confirm
 */
async function handleWeaponSelect(interaction, weaponTypeId, name, rootId, rootType, constitutionId, daoPath) {
  const roots = require('../../config/spiritual-roots');
  const constitutions = require('../../config/constitutions');

  const root = roots.list.find(r => r.id === rootId);
  const constitution = constitutions.list.find(c => c.id === constitutionId);
  const weaponType = weaponTypes.getWeaponTypeById(weaponTypeId);

  // Roll Ngộ Tính, Vận Khí, Tiên Thiên
  const ngoTinh = tienThien.rollNgoTinh();
  const vanKhi = tienThien.rollVanKhi();
  const traits = tienThien.rollTraits();
  const traitIds = traits.map(t => t.id).join(',');

  const embed = new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle('🎲 Kết Quả Roll Nhân Vật')
    .setDescription(
      `**${name}** — ${daoPath === 'ma' ? '😈 Ma Đạo' : '☀️ Chính Đạo'}\n\n` +
      `${root ? root.emoji : '🌱'} **Linh Căn**: ${root ? root.name : 'N/A'} (${rootType})\n` +
      `${weaponType.emoji} **Loại Võ Khí**: ${weaponType.name}\n` +
      `💪 **Thể Chất**: ${constitution ? constitution.name : 'Phàm Thể'}\n\n` +
      `━━━━━ 📊 Chỉ Số Ẩn ━━━━━\n\n` +
      `🧠 **Ngộ Tính**: ${ngoTinh} ${ngoTinh >= 140 ? '🔥 Cao!' : ngoTinh >= 100 ? '✅ Tốt' : '⚠️ Thấp'}\n` +
      `🍀 **Vận Khí**: ${vanKhi} ${vanKhi >= 120 ? '🔥 Cao!' : vanKhi >= 80 ? '✅ Tốt' : '⚠️ Thấp'}\n\n` +
      `━━━━ ⭐ Tiên Thiên Khí Vận ━━━━\n\n` +
      (traits.length > 0
        ? traits.map(t => `${t.rarity.emoji} **${t.name}** — _${t.description}_`).join('\n')
        : '⚪ Không có đặc tính đặc biệt') +
      `\n\n━━━━━━━━━━━━━━━━━━━━\n\nXác nhận tạo nhân vật?`
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`create:confirm:${name}:${rootId}:${rootType}:${constitutionId}:${daoPath}:${weaponTypeId}:${ngoTinh}:${vanKhi}:${traitIds}`)
      .setLabel('✅ Xác Nhận')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`create:reroll_all:${name}:${rootId}:${rootType}:${daoPath}`)
      .setLabel('🔄 Roll Lại Toàn Bộ')
      .setStyle(ButtonStyle.Primary),
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

/**
 * Confirm character creation
 */
async function confirmCreation(interaction, name, rootId, rootType, constitutionId, daoPath, weaponTypeId, ngoTinh, vanKhi, traitIds) {
  const db = require('../database/connection');
  const realms = require('../../config/realms');
  const roots = require('../../config/spiritual-roots');
  const constitutions = require('../../config/constitutions');

  const root = roots.list.find(r => r.id === rootId);
  const constitution = constitutions.list.find(c => c.id === constitutionId);
  const startRealm = realms.list[0]; // Luyện Khí

  // Calculate starting stats
  let baseHp = 100, baseAtk = 10, baseDef = 10, baseSpeed = 10, baseMana = 50;

  // Apply root bonuses (fields: atk_percent, def_percent, hp_percent, speed_percent, mana_percent)
  if (root && root.bonuses) {
    const b = root.bonuses;
    if (b.atk_percent) baseAtk += Math.floor(baseAtk * b.atk_percent / 100);
    if (b.def_percent) baseDef += Math.floor(baseDef * b.def_percent / 100);
    if (b.hp_percent) baseHp += Math.floor(baseHp * b.hp_percent / 100);
    if (b.speed_percent) baseSpeed += Math.floor(baseSpeed * b.speed_percent / 100);
    if (b.mana_percent) baseMana += Math.floor(baseMana * b.mana_percent / 100);
  }

  // Apply root weaknesses (negative values like def_percent: -5)
  if (root && root.weaknesses) {
    const w = root.weaknesses;
    if (w.atk_percent) baseAtk += Math.floor(baseAtk * w.atk_percent / 100);
    if (w.def_percent) baseDef += Math.floor(baseDef * w.def_percent / 100);
    if (w.hp_percent) baseHp += Math.floor(baseHp * w.hp_percent / 100);
    if (w.speed_percent) baseSpeed += Math.floor(baseSpeed * w.speed_percent / 100);
  }

  // Apply constitution bonuses
  if (constitution && constitution.bonuses) {
    const b = constitution.bonuses;
    if (b.atk_percent) baseAtk += Math.floor(baseAtk * b.atk_percent / 100);
    if (b.def_percent) baseDef += Math.floor(baseDef * b.def_percent / 100);
    if (b.hp_percent) baseHp += Math.floor(baseHp * b.hp_percent / 100);
    if (b.speed_percent) baseSpeed += Math.floor(baseSpeed * b.speed_percent / 100);
    if (b.mana_percent) baseMana += Math.floor(baseMana * b.mana_percent / 100);
  }

  // Ma Đạo: ATK boost, DEF reduction
  if (daoPath === 'ma') {
    baseAtk = Math.floor(baseAtk * 1.1);
    baseDef = Math.floor(baseDef * 0.95);
  }

  // Áp dụng Tiên Thiên trait bonuses
  const parsedTraitIds = traitIds ? traitIds.split(',').filter(Boolean) : [];
  let bonusNgoTinh = 0, bonusVanKhi = 0, bonusDanhVong = 0;
  for (const tid of parsedTraitIds) {
    const trait = tienThien.getTraitById(tid);
    if (trait && trait.effects) {
      if (trait.effects.atk) baseAtk += trait.effects.atk;
      if (trait.effects.def) baseDef += trait.effects.def;
      if (trait.effects.hp) baseHp += trait.effects.hp;
      if (trait.effects.mana) baseMana += trait.effects.mana;
      if (trait.effects.speed) baseSpeed += trait.effects.speed;
      if (trait.effects.ngo_tinh) bonusNgoTinh += trait.effects.ngo_tinh;
      if (trait.effects.van_khi) bonusVanKhi += trait.effects.van_khi;
      if (trait.effects.danh_vong) bonusDanhVong += trait.effects.danh_vong;
    }
  }

  const finalNgoTinh = (parseInt(ngoTinh) || 100) + bonusNgoTinh;
  const finalVanKhi = (parseInt(vanKhi) || 80) + bonusVanKhi;

  try {
    db.prepare(`
      INSERT INTO players (discord_id, name, spiritual_root, root_type, constitution, dao_path,
        technique_id, realm_index, sub_realm, exp, hp, max_hp, atk, def, speed, mana, max_mana,
        linh_thach, tien_thach, cong_duc, weapon_type, ngo_tinh, van_khi, age, danh_vong, dao_tam,
        created_at, is_dead)
      VALUES (?, ?, ?, ?, ?, ?, 'co_ban_tam_phap', 0, 1, 0, ?, ?, ?, ?, ?, ?, ?, 100, 0, 0,
        ?, ?, ?, 16, ?, 0, ?, 0)
    `).run(
      interaction.user.id, name, rootId, rootType, constitutionId, daoPath,
      baseHp, baseHp, baseAtk, baseDef, baseSpeed, baseMana, baseMana,
      weaponTypeId || null, finalNgoTinh, finalVanKhi, bonusDanhVong,
      Date.now()
    );

    // Lưu Tiên Thiên traits
    const newPlayer = db.prepare('SELECT id FROM players WHERE discord_id = ?').get(interaction.user.id);
    if (newPlayer) {
      // Tiên Thiên Khí Vận
      for (const tid of parsedTraitIds) {
        db.prepare('INSERT OR IGNORE INTO player_tien_thien (player_id, trait_id) VALUES (?, ?)')
          .run(newPlayer.id, tid);
      }

      // Grant starter skills
      db.prepare('INSERT OR IGNORE INTO learned_skills (player_id, skill_id, level) VALUES (?, ?, 1)').run(newPlayer.id, 'kiem_quang');
      db.prepare('INSERT OR IGNORE INTO learned_skills (player_id, skill_id, level) VALUES (?, ?, 1)').run(newPlayer.id, 'tho_thuan');
      db.prepare('INSERT OR IGNORE INTO player_skills (player_id, skill_id, slot, level) VALUES (?, ?, 1, 1)').run(newPlayer.id, 'kiem_quang');
      db.prepare('INSERT OR IGNORE INTO player_skills (player_id, skill_id, slot, level) VALUES (?, ?, 2, 1)').run(newPlayer.id, 'tho_thuan');
    }
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      const embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle('❌ Lỗi')
        .setDescription('Bạn đã có nhân vật rồi! Dùng `/tutien` để mở menu.');
      return interaction.update({ embeds: [embed], components: [] });
    }
    throw err;
  }

  const wt = weaponTypeId ? weaponTypes.getWeaponTypeById(weaponTypeId) : null;

  // Lấy traits đã roll để hiển thị
  const traitsDisplay = parsedTraitIds
    .map(tid => tienThien.getTraitById(tid))
    .filter(Boolean)
    .map(t => `${t.rarity.emoji} ${t.name}`)
    .join(', ') || 'Không có';

  const embed = new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle('🐉 NHÂN VẬT ĐÃ TẠO THÀNH CÔNG!')
    .setDescription(
      `✨ Hoan nghênh **${name}** bước vào thế giới tu tiên!\n\n` +
      `${daoPath === 'ma' ? '😈' : '☀️'} **Đạo**: ${daoPath === 'ma' ? 'Ma Đạo' : 'Chính Đạo'}\n` +
      `${root ? root.emoji : '🌱'} **Linh Căn**: ${root ? root.name : 'N/A'} (${rootType === 'don' ? 'Đơn' : rootType === 'song' ? 'Song' : rootType === 'tam' ? 'Tam' : 'Hỗn Độn'})\n` +
      `${wt ? wt.emoji : '⚔️'} **Võ Khí**: ${wt ? wt.name : 'Chưa chọn'}\n` +
      `💪 **Thể Chất**: ${constitution ? constitution.name : 'Phàm Thể'}\n` +
      `📜 **Công Pháp**: Cơ Bản Tâm Pháp\n` +
      `🏔️ **Cảnh Giới**: ${startRealm.emoji} ${startRealm.name} Tầng 1\n\n` +
      `━━━ 📊 Chỉ Số ━━━\n\n` +
      `⚔️ ATK: **${baseAtk}** | 🛡️ DEF: **${baseDef}**\n` +
      `❤️ HP: **${baseHp}** | 💨 Speed: **${baseSpeed}**\n` +
      `🔮 Mana: **${baseMana}** | 💎 Linh Thạch: **100**\n\n` +
      `━━━ 🧠 Chỉ Số Ẩn ━━━\n\n` +
      `🧠 Ngộ Tính: **${finalNgoTinh}** | 🍀 Vận Khí: **${finalVanKhi}**\n` +
      `⭐ Tiên Thiên: ${traitsDisplay}\n\n` +
      `_Nhấn Menu Chính để bắt đầu hành trình!_`
    )
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('menu:main')
      .setLabel('🏠 Vào Menu Chính')
      .setStyle(ButtonStyle.Success),
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

/**
 * Handle reincarnation (after permadeath)
 */
async function handleReincarnate(interaction) {
  const db = require('../database/connection');
  const discordId = interaction.user.id;

  // Delete old character data
  const player = db.prepare('SELECT id FROM players WHERE discord_id = ?').get(discordId);
  if (player) {
    db.prepare('DELETE FROM player_skills WHERE player_id = ?').run(player.id);
    db.prepare('DELETE FROM learned_skills WHERE player_id = ?').run(player.id);
    db.prepare('DELETE FROM player_pets WHERE player_id = ?').run(player.id);
    db.prepare('DELETE FROM player_dao_laws WHERE player_id = ?').run(player.id);
    db.prepare('DELETE FROM player_equipment WHERE player_id = ?').run(player.id);
    db.prepare('DELETE FROM inventory WHERE player_id = ?').run(player.id);
    db.prepare('DELETE FROM sect_members WHERE player_id = ?').run(player.id);
    db.prepare('DELETE FROM npc_affinity WHERE player_id = ?').run(player.id);
    db.prepare('DELETE FROM cooldowns WHERE player_id = ?').run(player.id);
    // Chiến kỹ tables
    db.prepare('DELETE FROM player_skill_slots WHERE player_id = ?').run(player.id);
    db.prepare('DELETE FROM player_nghich_thien WHERE player_id = ?').run(player.id);
    db.prepare('DELETE FROM player_tam_phap WHERE player_id = ?').run(player.id);
    db.prepare('DELETE FROM player_tien_thien WHERE player_id = ?').run(player.id);
    db.prepare('DELETE FROM player_dao_tam WHERE player_id = ?').run(player.id);
    db.prepare('DELETE FROM player_hau_thien WHERE player_id = ?').run(player.id);
    db.prepare('DELETE FROM players WHERE id = ?').run(player.id);
  }

  // Start fresh character creation
  const embed = new EmbedBuilder()
    .setColor(COLORS.cultivation)
    .setTitle('🔄 Luân Hồi Chuyển Thế')
    .setDescription(
      `Linh hồn của bạn đã tái sinh trong một thân xác mới...\n\n` +
      `Hãy chọn con đường tu luyện:`)
    .setTimestamp();

  const { createDaoPathButtons } = require('../ui/buttons');
  const buttons = createDaoPathButtons();

  await interaction.update({ embeds: [embed], components: [buttons] });
}

module.exports = {
  handleDaoPathSelect,
  handleNameSubmit,
  handleRootSelect,
  handleWeaponSelect,
  confirmCreation,
  handleReincarnate,
};
