/**
 * @file Pet Management System
 * @description Quản lý linh thú — cho ăn, đổi pet, tiến hóa, phóng sinh
 *
 * handleFeedPet   — cho ăn pet đang mang, tốn Linh Thạch, tăng EXP
 * handleSwapPet   — hiển thị select menu chọn pet mang theo
 * handleEvolvePet — tiến hóa pet khi đạt max level + có nguyên liệu
 * handleReleasePet — phóng sinh pet, hoàn 50% Linh Thạch đã đầu tư
 * confirmRelease  — xác nhận xóa pet khỏi DB
 * executeSwap     — thực thi đổi pet active
 * getPetStats     — tính chỉ số pet dựa trên level và growth_rate
 */

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require('discord.js');
const db = require('../database/connection');
const petsConfig = require('../../config/pets');
const { checkCooldown, setCooldown } = require('../systems/cooldown');
const { COLORS, COOLDOWNS } = require('../utils/constants');
const { formatNumber, randomInt } = require('../utils/helpers');

// ═══════════════════════════════════════════
//  Prepared Statements (cache 1 lần duy nhất)
// ═══════════════════════════════════════════

/** Lấy tất cả pet của người chơi */
const stmtGetAllPets = db.prepare(
  'SELECT * FROM player_pets WHERE player_id = ?',
);

/** Lấy pet đang mang theo (is_active=1) */
const stmtGetActivePet = db.prepare(
  'SELECT * FROM player_pets WHERE player_id = ? AND is_active = 1',
);

/** Lấy pet theo id bản ghi */
const stmtGetPetById = db.prepare(
  'SELECT * FROM player_pets WHERE id = ? AND player_id = ?',
);

/** Cập nhật EXP, level, stats cho pet */
const stmtUpdatePetStats = db.prepare(
  'UPDATE player_pets SET exp = ?, level = ?, hp = ?, atk = ?, def = ? WHERE id = ?',
);

/** Đặt tất cả pet không active */
const stmtDeactivateAll = db.prepare(
  'UPDATE player_pets SET is_active = 0 WHERE player_id = ?',
);

/** Đặt 1 pet active */
const stmtActivatePet = db.prepare(
  'UPDATE player_pets SET is_active = 1 WHERE id = ? AND player_id = ?',
);

/** Cập nhật pet khi tiến hóa */
const stmtEvolvePet = db.prepare(
  'UPDATE player_pets SET pet_id = ?, name = ?, hp = ?, atk = ?, def = ?, evolved = 1, level = 1, exp = 0 WHERE id = ?',
);

/** Xóa pet (phóng sinh) */
const stmtDeletePet = db.prepare(
  'DELETE FROM player_pets WHERE id = ? AND player_id = ?',
);

/** Trừ Linh Thạch người chơi */
const stmtSpendLinhThach = db.prepare(
  'UPDATE players SET linh_thach = linh_thach - ? WHERE id = ? AND linh_thach >= ?',
);

/** Cộng Linh Thạch cho người chơi */
const stmtAddLinhThach = db.prepare(
  'UPDATE players SET linh_thach = linh_thach + ? WHERE id = ?',
);

/** Lấy item từ inventory (vật liệu tiến hóa) */
const stmtGetInvItem = db.prepare(
  'SELECT quantity FROM inventory WHERE player_id = ? AND item_id = ?',
);

/** Giảm số lượng item */
const stmtReduceItem = db.prepare(
  'UPDATE inventory SET quantity = quantity - 1 WHERE player_id = ? AND item_id = ?',
);

/** Xóa item hết số lượng */
const stmtDeleteItem = db.prepare(
  'DELETE FROM inventory WHERE player_id = ? AND item_id = ? AND quantity <= 0',
);

// ═══════════════════════════════════════════
//  Hằng số
// ═══════════════════════════════════════════

/** Chi phí cho ăn pet mỗi lần */
const FEED_COST = 50;

/** Cooldown cho ăn (ms) — 1 phút */
const FEED_COOLDOWN = 60 * 1000;

/** Tên tier tiếng Việt */
const TIER_NAME = {
  pham: 'Phàm',
  linh: 'Linh',
  bao: 'Bảo',
  thanh: 'Thánh',
  tien: 'Tiên',
  than: 'Thần',
};

// ═══════════════════════════════════════════
//  getPetStats — Tính chỉ số pet tại level hiện tại
// ═══════════════════════════════════════════

/**
 * Tính stats pet dựa trên config base + level + growth_rate
 * @param {Object} petRow - Bản ghi pet từ DB (player_pets)
 * @param {Object} petCfg - Config pet từ pets.js
 * @returns {{ hp: number, atk: number, def: number, speed: number }}
 */
function getPetStats(petRow, petCfg) {
  if (!petRow || !petCfg) return { hp: 0, atk: 0, def: 0, speed: 0 };

  const lvl = petRow.level || 1;
  const gr = petCfg.growth_rate || 1.0;

  return {
    hp: Math.floor(petCfg.base_hp * (1 + (lvl - 1) * gr * 0.1)),
    atk: Math.floor(petCfg.base_atk * (1 + (lvl - 1) * gr * 0.1)),
    def: Math.floor(petCfg.base_def * (1 + (lvl - 1) * gr * 0.1)),
    speed: Math.floor(5 + lvl * 0.5), // Tốc độ tăng nhẹ theo level
  };
}

// ═══════════════════════════════════════════
//  handleFeedPet — Cho ăn pet đang mang theo
// ═══════════════════════════════════════════

/**
 * Cho ăn pet đang mang theo, tốn 50 Linh Thạch, tăng EXP
 * Level up khi EXP >= level * 100, tăng stats theo growth_rate
 * @param {import('discord.js').ButtonInteraction} interaction
 * @param {Object} player - Dữ liệu người chơi từ DB
 */
async function handleFeedPet(interaction, player) {
  // Kiểm tra cooldown
  const cd = checkCooldown(player.id, 'pet_feed');
  if (cd.onCooldown) {
    const seconds = Math.ceil(cd.remainingMs / 1000);
    const embed = new EmbedBuilder()
      .setColor(COLORS.WARNING)
      .setTitle('⏳ Đang Hồi Chiêu')
      .setDescription(`Cho ăn lại sau **${seconds}s** nữa.`);
    return interaction.update({ embeds: [embed], components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('pet:menu').setLabel('🐾 Quản Lý Pet').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary),
      ),
    ]});
  }

  // Kiểm tra có pet đang mang không
  const activePet = stmtGetActivePet.get(player.id);
  if (!activePet) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setTitle('❌ Không Có Pet')
      .setDescription('Bạn chưa mang theo linh thú nào. Hãy đổi pet trước!');
    return interaction.update({ embeds: [embed], components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('pet:swap').setLabel('🔄 Đổi Pet').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('pet:menu').setLabel('🐾 Quản Lý').setStyle(ButtonStyle.Secondary),
      ),
    ]});
  }

  // Kiểm tra Linh Thạch
  if (player.linh_thach < FEED_COST) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setTitle('❌ Không Đủ Linh Thạch')
      .setDescription(
        `Cần **${formatNumber(FEED_COST)}** 💎 Linh Thạch để cho ăn.\n` +
        `Hiện có: **${formatNumber(player.linh_thach)}** 💎`,
      );
    return interaction.update({ embeds: [embed], components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('pet:menu').setLabel('🐾 Quản Lý Pet').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary),
      ),
    ]});
  }

  // Lấy config pet
  const petCfg = petsConfig.getPetById(activePet.pet_id);
  if (!petCfg) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setTitle('❌ Lỗi Config')
      .setDescription('Không tìm thấy dữ liệu linh thú.');
    return interaction.update({ embeds: [embed], components: [] });
  }

  // Kiểm tra max level
  if (activePet.level >= petCfg.max_level) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.WARNING)
      .setTitle('⚠️ Đã Đạt Level Tối Đa')
      .setDescription(
        `${petCfg.emoji} **${activePet.name}** đã đạt Lv.**${petCfg.max_level}** (Max).\n\n` +
        (petCfg.evolves_to
          ? '✨ Hãy thử **Tiến Hóa** để mở khóa sức mạnh mới!'
          : '_Linh thú này không thể tiến hóa thêm._'),
      );
    return interaction.update({ embeds: [embed], components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('pet:evolve').setLabel('✨ Tiến Hóa').setStyle(ButtonStyle.Primary).setDisabled(!petCfg.evolves_to),
        new ButtonBuilder().setCustomId('pet:menu').setLabel('🐾 Quản Lý').setStyle(ButtonStyle.Secondary),
      ),
    ]});
  }

  // Tính EXP nhận được
  const expGain = 10 * (player.realm_index + 1) + randomInt(5, 20);
  let newExp = activePet.exp + expGain;
  let newLevel = activePet.level;
  let newHp = activePet.hp;
  let newAtk = activePet.atk;
  let newDef = activePet.def;
  let leveledUp = false;
  let levelsGained = 0;

  // Kiểm tra level up (có thể lên nhiều level 1 lần)
  const gr = petCfg.growth_rate || 1.0;
  while (newExp >= newLevel * 100 && newLevel < petCfg.max_level) {
    newExp -= newLevel * 100;
    newLevel++;
    levelsGained++;
    leveledUp = true;

    // Tăng stats khi level up
    newHp += Math.floor(petCfg.base_hp * 0.1 * gr);
    newAtk += Math.floor(petCfg.base_atk * 0.1 * gr);
    newDef += Math.floor(petCfg.base_def * 0.1 * gr);
  }

  // Cập nhật DB (transaction)
  const feedTransaction = db.transaction(() => {
    stmtSpendLinhThach.run(FEED_COST, player.id, FEED_COST);
    stmtUpdatePetStats.run(newExp, newLevel, newHp, newAtk, newDef, activePet.id);
  });
  feedTransaction();

  // Đặt cooldown
  setCooldown(player.id, 'pet_feed', FEED_COOLDOWN);

  // Hiển thị kết quả
  const expNeeded = newLevel * 100;
  let description =
    `${petCfg.emoji} **${activePet.name}** đã được cho ăn!\n\n` +
    `💎 Chi phí: **-${formatNumber(FEED_COST)}** Linh Thạch\n` +
    `✨ EXP: **+${formatNumber(expGain)}** (${formatNumber(newExp)}/${formatNumber(expNeeded)})\n`;

  if (leveledUp) {
    description +=
      `\n🎉 **LEVEL UP!** Lv.${activePet.level} → Lv.${newLevel} (+${levelsGained})\n` +
      `❤️ HP: ${formatNumber(activePet.hp)} → **${formatNumber(newHp)}**\n` +
      `⚔️ ATK: ${formatNumber(activePet.atk)} → **${formatNumber(newAtk)}**\n` +
      `🛡️ DEF: ${formatNumber(activePet.def)} → **${formatNumber(newDef)}**\n`;

    // Thông báo nếu đạt max level
    if (newLevel >= petCfg.max_level) {
      description += `\n⭐ Đã đạt **Level tối đa**!`;
      if (petCfg.evolves_to) {
        description += ` Có thể **Tiến Hóa**!`;
      }
    }
  }

  const embed = new EmbedBuilder()
    .setColor(leveledUp ? COLORS.SUCCESS : COLORS.PET)
    .setTitle(leveledUp ? '🎉 Cho Ăn + Level Up!' : '🍖 Cho Ăn Thành Công')
    .setDescription(description)
    .setFooter({ text: `Linh Thạch còn lại: ${formatNumber(player.linh_thach - FEED_COST)}` })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('pet:feed')
      .setLabel('🍖 Cho Ăn Tiếp')
      .setStyle(ButtonStyle.Success)
      .setDisabled(newLevel >= petCfg.max_level),
    new ButtonBuilder()
      .setCustomId('pet:menu')
      .setLabel('🐾 Quản Lý Pet')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('menu:main')
      .setLabel('🏠 Menu Chính')
      .setStyle(ButtonStyle.Secondary),
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

// ═══════════════════════════════════════════
//  handleSwapPet — Hiển thị select menu đổi pet
// ═══════════════════════════════════════════

/**
 * Hiển thị danh sách pet để chọn mang theo
 * @param {import('discord.js').ButtonInteraction} interaction
 * @param {Object} player - Dữ liệu người chơi
 */
async function handleSwapPet(interaction, player) {
  const pets = stmtGetAllPets.all(player.id);

  if (pets.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setTitle('❌ Không Có Pet')
      .setDescription('Bạn chưa có linh thú nào. Hãy đi bắt tại 🌍 Thế Giới!');
    return interaction.update({ embeds: [embed], components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary),
      ),
    ]});
  }

  if (pets.length <= 1) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.WARNING)
      .setTitle('⚠️ Chỉ Có 1 Pet')
      .setDescription('Bạn cần ít nhất 2 linh thú để đổi.');
    return interaction.update({ embeds: [embed], components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('pet:menu').setLabel('🐾 Quản Lý Pet').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary),
      ),
    ]});
  }

  // Tạo select menu
  const options = pets.map(p => {
    const cfg = petsConfig.getPetById(p.pet_id);
    const emoji = cfg ? cfg.emoji : '🐾';
    const name = p.name || (cfg ? cfg.name : 'Unknown');
    const active = p.is_active ? ' ✅ [Đang mang]' : '';
    const tier = cfg ? `[${TIER_NAME[cfg.tier] || cfg.tier}]` : '';

    return {
      label: `${name} Lv.${p.level}${active}`,
      description: `${tier} HP:${p.hp} ATK:${p.atk} DEF:${p.def}`,
      value: String(p.id),
      emoji: emoji,
    };
  });

  const selectRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('select:swap_pet')
      .setPlaceholder('🔄 Chọn linh thú muốn mang theo...')
      .addOptions(options),
  );

  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('pet:menu')
      .setLabel('🔙 Quay Lại')
      .setStyle(ButtonStyle.Secondary),
  );

  const embed = new EmbedBuilder()
    .setColor(COLORS.PET)
    .setTitle('🔄 Đổi Linh Thú')
    .setDescription('Chọn linh thú bạn muốn mang theo chiến đấu:')
    .setTimestamp();

  await interaction.update({ embeds: [embed], components: [selectRow, backRow] });
}

// ═══════════════════════════════════════════
//  executeSwap — Thực thi đổi pet active
// ═══════════════════════════════════════════

/**
 * Đặt 1 pet thành active, tắt active tất cả pet khác
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 * @param {Object} player - Dữ liệu người chơi
 * @param {number|string} petDbId - ID bản ghi pet (player_pets.id)
 */
async function executeSwap(interaction, player, petDbId) {
  const petId = Number(petDbId);
  const pet = stmtGetPetById.get(petId, player.id);

  if (!pet) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setTitle('❌ Không Tìm Thấy')
      .setDescription('Linh thú không tồn tại hoặc không thuộc về bạn.');
    return interaction.update({ embeds: [embed], components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('pet:menu').setLabel('🐾 Quản Lý Pet').setStyle(ButtonStyle.Primary),
      ),
    ]});
  }

  // Đổi active pet (transaction)
  const swapTransaction = db.transaction(() => {
    stmtDeactivateAll.run(player.id);
    stmtActivatePet.run(petId, player.id);
  });
  swapTransaction();

  const cfg = petsConfig.getPetById(pet.pet_id);
  const petName = pet.name || (cfg ? cfg.name : 'Linh Thú');
  const emoji = cfg ? cfg.emoji : '🐾';
  const tier = cfg ? TIER_NAME[cfg.tier] || cfg.tier : '?';

  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle('🔄 Đổi Pet Thành Công!')
    .setDescription(
      `Đang mang theo: ${emoji} **${petName}** (Lv.${pet.level})\n\n` +
      `🏷️ Hạng: **${tier}**\n` +
      `❤️ HP: **${formatNumber(pet.hp)}**\n` +
      `⚔️ ATK: **${formatNumber(pet.atk)}**\n` +
      `🛡️ DEF: **${formatNumber(pet.def)}**`,
    )
    .setTimestamp();

  await interaction.update({ embeds: [embed], components: [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('pet:menu').setLabel('🐾 Quản Lý Pet').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary),
    ),
  ]});
}

// ═══════════════════════════════════════════
//  handleEvolvePet — Tiến hóa pet
// ═══════════════════════════════════════════

/**
 * Tiến hóa pet đang mang theo khi đạt evolve_level
 * Yêu cầu: max level đạt, có nguyên liệu tiến hóa (nếu cần)
 * @param {import('discord.js').ButtonInteraction} interaction
 * @param {Object} player - Dữ liệu người chơi
 */
async function handleEvolvePet(interaction, player) {
  // Lấy pet đang active
  const activePet = stmtGetActivePet.get(player.id);
  if (!activePet) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setTitle('❌ Không Có Pet')
      .setDescription('Bạn chưa mang theo linh thú nào.');
    return interaction.update({ embeds: [embed], components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('pet:swap').setLabel('🔄 Đổi Pet').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('pet:menu').setLabel('🐾 Quản Lý').setStyle(ButtonStyle.Secondary),
      ),
    ]});
  }

  const petCfg = petsConfig.getPetById(activePet.pet_id);
  if (!petCfg) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setTitle('❌ Lỗi Config')
      .setDescription('Không tìm thấy dữ liệu linh thú.');
    return interaction.update({ embeds: [embed], components: [] });
  }

  // Kiểm tra có thể tiến hóa không
  if (!petCfg.evolves_to) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.WARNING)
      .setTitle('⚠️ Không Thể Tiến Hóa')
      .setDescription(`${petCfg.emoji} **${activePet.name}** đã đạt hình thái tối cao, không thể tiến hóa thêm.`);
    return interaction.update({ embeds: [embed], components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('pet:menu').setLabel('🐾 Quản Lý Pet').setStyle(ButtonStyle.Primary),
      ),
    ]});
  }

  // Kiểm tra level đủ chưa
  const evolveLevel = petCfg.evolve_level || petCfg.max_level;
  if (activePet.level < evolveLevel) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.WARNING)
      .setTitle('⚠️ Chưa Đủ Level')
      .setDescription(
        `${petCfg.emoji} **${activePet.name}** cần đạt Lv.**${evolveLevel}** để tiến hóa.\n` +
        `Level hiện tại: **${activePet.level}/${evolveLevel}**\n\n` +
        `_Hãy cho ăn để tăng level!_`,
      );
    return interaction.update({ embeds: [embed], components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('pet:feed').setLabel('🍖 Cho Ăn').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('pet:menu').setLabel('🐾 Quản Lý').setStyle(ButtonStyle.Secondary),
      ),
    ]});
  }

  // Lấy config pet tiến hóa
  const evolvedCfg = petsConfig.getPetById(petCfg.evolves_to);
  if (!evolvedCfg) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setTitle('❌ Lỗi Tiến Hóa')
      .setDescription('Dữ liệu hình thái tiến hóa không tồn tại.');
    return interaction.update({ embeds: [embed], components: [] });
  }

  // Thực hiện tiến hóa — stats của hình thái mới ở level 1
  const newStats = getPetStats({ level: 1 }, evolvedCfg);

  // Transaction: tiến hóa pet
  const evolveTransaction = db.transaction(() => {
    stmtEvolvePet.run(
      evolvedCfg.id,
      evolvedCfg.name,
      newStats.hp,
      newStats.atk,
      newStats.def,
      activePet.id,
    );
  });
  evolveTransaction();

  // Hiển thị kết quả
  const embed = new EmbedBuilder()
    .setColor(COLORS.GOLD)
    .setTitle('✨ TIẾN HÓA THÀNH CÔNG! ✨')
    .setDescription(
      `${petCfg.emoji} **${activePet.name}** đã tiến hóa thành ${evolvedCfg.emoji} **${evolvedCfg.name}**!\n\n` +
      `🏷️ Hạng: **${TIER_NAME[petCfg.tier]}** → **${TIER_NAME[evolvedCfg.tier]}**\n` +
      `📊 Level: Reset về **Lv.1** (Max: ${evolvedCfg.max_level})\n\n` +
      `**Chỉ số mới:**\n` +
      `❤️ HP: ${formatNumber(activePet.hp)} → **${formatNumber(newStats.hp)}**\n` +
      `⚔️ ATK: ${formatNumber(activePet.atk)} → **${formatNumber(newStats.atk)}**\n` +
      `🛡️ DEF: ${formatNumber(activePet.def)} → **${formatNumber(newStats.def)}**\n\n` +
      `📖 _${evolvedCfg.description}_`,
    )
    .setTimestamp();

  await interaction.update({ embeds: [embed], components: [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('pet:feed').setLabel('🍖 Cho Ăn').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('pet:menu').setLabel('🐾 Quản Lý Pet').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary),
    ),
  ]});
}

// ═══════════════════════════════════════════
//  handleReleasePet — Hiển thị select menu phóng sinh
// ═══════════════════════════════════════════

/**
 * Hiển thị danh sách pet để chọn phóng sinh (không cho phóng sinh pet active)
 * @param {import('discord.js').ButtonInteraction} interaction
 * @param {Object} player - Dữ liệu người chơi
 */
async function handleReleasePet(interaction, player) {
  const pets = stmtGetAllPets.all(player.id);

  if (pets.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setTitle('❌ Không Có Pet')
      .setDescription('Bạn chưa có linh thú nào để phóng sinh.');
    return interaction.update({ embeds: [embed], components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary),
      ),
    ]});
  }

  // Lọc bỏ pet đang active (không thể phóng sinh pet đang mang)
  const releasable = pets.filter(p => !p.is_active);

  if (releasable.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.WARNING)
      .setTitle('⚠️ Không Thể Phóng Sinh')
      .setDescription(
        'Không thể phóng sinh pet đang mang theo.\n' +
        'Hãy **đổi pet** trước rồi phóng sinh pet cũ.',
      );
    return interaction.update({ embeds: [embed], components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('pet:swap').setLabel('🔄 Đổi Pet').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('pet:menu').setLabel('🐾 Quản Lý').setStyle(ButtonStyle.Secondary),
      ),
    ]});
  }

  // Tạo select menu
  const options = releasable.map(p => {
    const cfg = petsConfig.getPetById(p.pet_id);
    const emoji = cfg ? cfg.emoji : '🐾';
    const name = p.name || (cfg ? cfg.name : 'Unknown');
    const tier = cfg ? `[${TIER_NAME[cfg.tier] || cfg.tier}]` : '';
    // Tính Linh Thạch hoàn lại (50% tổng đã đầu tư)
    // Ước tính: mỗi lần cho ăn = FEED_COST, số lần ≈ tổng EXP / trung bình EXP/lần
    const investedEstimate = (p.level - 1) * FEED_COST;
    const refund = Math.floor(investedEstimate * 0.5);

    return {
      label: `${name} Lv.${p.level}`,
      description: `${tier} Hoàn lại ~${formatNumber(refund)} 💎`,
      value: String(p.id),
      emoji: emoji,
    };
  });

  const selectRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('select:release_pet')
      .setPlaceholder('👋 Chọn linh thú muốn phóng sinh...')
      .addOptions(options),
  );

  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('pet:menu')
      .setLabel('🔙 Quay Lại')
      .setStyle(ButtonStyle.Secondary),
  );

  const embed = new EmbedBuilder()
    .setColor(COLORS.WARNING)
    .setTitle('👋 Phóng Sinh Linh Thú')
    .setDescription(
      '⚠️ **Phóng sinh là vĩnh viễn!** Linh thú sẽ bị xóa.\n' +
      'Bạn sẽ được hoàn lại **50%** Linh Thạch đã đầu tư.\n\n' +
      '_Chọn linh thú muốn phóng sinh:_',
    )
    .setTimestamp();

  await interaction.update({ embeds: [embed], components: [selectRow, backRow] });
}

// ═══════════════════════════════════════════
//  confirmRelease — Xác nhận phóng sinh (xóa pet)
// ═══════════════════════════════════════════

/**
 * Xác nhận và xóa pet khỏi DB, hoàn 50% Linh Thạch
 * @param {import('discord.js').ButtonInteraction|StringSelectMenuInteraction} interaction
 * @param {Object} player - Dữ liệu người chơi
 * @param {number|string} petDbId - ID bản ghi pet
 */
async function confirmRelease(interaction, player, petDbId) {
  const petId = Number(petDbId);
  const pet = stmtGetPetById.get(petId, player.id);

  if (!pet) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setTitle('❌ Không Tìm Thấy')
      .setDescription('Linh thú không tồn tại.');
    return interaction.update({ embeds: [embed], components: [] });
  }

  // Không được phóng sinh pet đang mang
  if (pet.is_active) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setTitle('❌ Không Thể Phóng Sinh')
      .setDescription('Không thể phóng sinh linh thú đang mang theo. Hãy đổi pet trước!');
    return interaction.update({ embeds: [embed], components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('pet:swap').setLabel('🔄 Đổi Pet').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('pet:menu').setLabel('🐾 Quản Lý').setStyle(ButtonStyle.Secondary),
      ),
    ]});
  }

  // Tính Linh Thạch hoàn lại
  const investedEstimate = (pet.level - 1) * FEED_COST;
  const refund = Math.floor(investedEstimate * 0.5);

  const cfg = petsConfig.getPetById(pet.pet_id);
  const petName = pet.name || (cfg ? cfg.name : 'Linh Thú');
  const emoji = cfg ? cfg.emoji : '🐾';

  // Transaction: xóa pet + hoàn Linh Thạch
  const releaseTransaction = db.transaction(() => {
    stmtDeletePet.run(petId, player.id);
    if (refund > 0) {
      stmtAddLinhThach.run(refund, player.id);
    }
  });
  releaseTransaction();

  const embed = new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle('👋 Phóng Sinh Thành Công')
    .setDescription(
      `${emoji} **${petName}** (Lv.${pet.level}) đã được phóng sinh tự do.\n\n` +
      (refund > 0
        ? `💎 Hoàn lại: **+${formatNumber(refund)}** Linh Thạch`
        : '_Không có Linh Thạch hoàn lại._') +
      `\n\n_Tạm biệt, ${petName}... 🍃_`,
    )
    .setTimestamp();

  await interaction.update({ embeds: [embed], components: [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('pet:menu').setLabel('🐾 Quản Lý Pet').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary),
    ),
  ]});
}

// ═══════════════════════════════════════════
//  Exports
// ═══════════════════════════════════════════

module.exports = {
  handleFeedPet,
  handleSwapPet,
  handleEvolvePet,
  handleReleasePet,
  confirmRelease,
  executeSwap,
  getPetStats,
};
