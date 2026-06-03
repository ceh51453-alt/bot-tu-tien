/**
 * @file Equipment Management System
 * @description Quản lý trang bị — xem, trang bị, tháo, cường hóa
 *
 * showEquipmentMenu — hiển thị 4 slot trang bị + stats tổng
 * handleEquipItem   — trang bị item từ inventory vào slot
 * handleUnequipItem — tháo trang bị trả về inventory
 * handleEnhance     — cường hóa trang bị (+1), có tỉ lệ thành công
 * getEquippedStats  — tính tổng stats từ tất cả trang bị (cho combat/profile)
 */

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require('discord.js');
const db = require('../database/connection');
const equipConfig = require('../../config/equipment');
const itemsConfig = require('../../config/items');
const { COLORS } = require('../utils/constants');
const { formatNumber, chance } = require('../utils/helpers');

// ═══════════════════════════════════════════
//  Prepared Statements (cache 1 lần duy nhất)
// ═══════════════════════════════════════════

/** Lấy tất cả trang bị đang mặc */
const stmtGetAllEquipped = db.prepare(
  'SELECT * FROM player_equipment WHERE player_id = ?',
);

/** Lấy trang bị theo slot */
const stmtGetSlot = db.prepare(
  'SELECT * FROM player_equipment WHERE player_id = ? AND slot = ?',
);

/** Trang bị item vào slot (INSERT OR REPLACE vì PK là player_id + slot) */
const stmtEquipItem = db.prepare(
  'INSERT OR REPLACE INTO player_equipment (player_id, slot, equipment_id, enhance_level) VALUES (?, ?, ?, ?)',
);

/** Tháo trang bị */
const stmtUnequip = db.prepare(
  'DELETE FROM player_equipment WHERE player_id = ? AND slot = ?',
);

/** Cập nhật enhance_level */
const stmtUpdateEnhance = db.prepare(
  'UPDATE player_equipment SET enhance_level = ? WHERE player_id = ? AND slot = ?',
);

/** Giảm Linh Thạch */
const stmtSpendLinhThach = db.prepare(
  'UPDATE players SET linh_thach = linh_thach - ? WHERE id = ? AND linh_thach >= ?',
);

/** Lấy số lượng item từ inventory */
const stmtGetInvItem = db.prepare(
  'SELECT quantity FROM inventory WHERE player_id = ? AND item_id = ?',
);

/** Thêm item vào inventory */
const stmtAddInvItem = db.prepare(
  'INSERT INTO inventory (player_id, item_id, quantity) VALUES (?, ?, ?)',
);

/** Cập nhật số lượng item trong inventory */
const stmtUpdateInvItem = db.prepare(
  'UPDATE inventory SET quantity = quantity + ? WHERE player_id = ? AND item_id = ?',
);

/** Giảm số lượng item trong inventory */
const stmtReduceInvItem = db.prepare(
  'UPDATE inventory SET quantity = quantity - ? WHERE player_id = ? AND item_id = ?',
);

/** Xóa item khỏi inventory */
const stmtDeleteInvItem = db.prepare(
  'DELETE FROM inventory WHERE player_id = ? AND item_id = ? AND quantity <= 0',
);

// Hạng tiếng Việt
const GRADE_NAME = {
  pham: 'Phàm',
  linh: 'Linh',
  bao: 'Bảo',
  thanh: 'Thánh',
  tien: 'Tiên',
  than: 'Thần',
};

// Map slot tiếng Việt
const SLOT_NAME = {
  weapon: '🗡️ Vũ Khí',
  armor: '🛡️ Giáp Trụ',
  accessory: '💍 Phụ Kiện',
  artifact: '🔮 Pháp Bảo',
};

// ═══════════════════════════════════════════
//  getEquippedStats — Tính tổng chỉ số từ trang bị
// ═══════════════════════════════════════════

/**
 * Tính tổng chỉ số cộng thêm từ tất cả trang bị đang mặc
 * Mỗi enhance_level tăng 10% chỉ số cơ bản của trang bị đó
 * @param {number} playerId
 * @returns {{ atk: number, def: number, hp: number, speed: number, mana: number }}
 */
function getEquippedStats(playerId) {
  const equipped = stmtGetAllEquipped.all(playerId);
  const total = { atk: 0, def: 0, hp: 0, speed: 0, mana: 0 };

  for (const eq of equipped) {
    const cfg = equipConfig.getEquipmentById(eq.equipment_id) || equipConfig.getById(eq.equipment_id);
    if (!cfg || !cfg.stats) continue;

    const mult = 1 + eq.enhance_level * 0.1;

    for (const [stat, val] of Object.entries(cfg.stats)) {
      let key = stat;
      // Map all_stats
      if (key === 'all_stats') {
        total.atk += Math.floor(val * mult);
        total.def += Math.floor(val * mult);
        total.hp += Math.floor(val * mult * 5); // 1 stat = 5 HP
        total.speed += Math.floor(val * mult * 0.5);
        total.mana += Math.floor(val * mult * 2);
      } else if (total.hasOwnProperty(key)) {
        total[key] += Math.floor(val * mult);
      }
    }
  }

  return total;
}

// ═══════════════════════════════════════════
//  showEquipmentMenu — Hiển thị trang bị đang mặc
// ═══════════════════════════════════════════

/**
 * Hiển thị 4 slot trang bị của người chơi và tổng chỉ số cộng thêm
 * @param {import('discord.js').Interaction} interaction
 * @param {Object} player
 */
async function showEquipmentMenu(interaction, player) {
  const equipped = stmtGetAllEquipped.all(player.id);
  const totalStats = getEquippedStats(player.id);

  const slots = {
    weapon: null,
    armor: null,
    accessory: null,
    artifact: null,
  };

  for (const eq of equipped) {
    slots[eq.slot] = eq;
  }

  const embed = new EmbedBuilder()
    .setColor(COLORS.INVENTORY || '#e67e22')
    .setTitle('🛡️ Trang Bị Bản Thân')
    .setDescription(`**${player.name}** — Cảnh giới: **${player.realm_index}**\n\n`)
    .setTimestamp();

  // Tạo các trường hiển thị cho 4 slot
  for (const [slotKey, name] of Object.entries(SLOT_NAME)) {
    const eq = slots[slotKey];
    if (eq) {
      const cfg = equipConfig.getEquipmentById(eq.equipment_id) || equipConfig.getById(eq.equipment_id);
      if (cfg) {
        const statsStr = Object.entries(cfg.stats)
          .map(([k, v]) => {
            const val = Math.floor(v * (1 + eq.enhance_level * 0.1));
            return `${k.toUpperCase()}: +${val}`;
          })
          .join(', ');
        
        embed.addFields({
          name: `${name}: ${cfg.emoji} **${cfg.name}** [+${eq.enhance_level}]`,
          value: ` Hạng: *${GRADE_NAME[cfg.grade] || cfg.grade}* | Chỉ số: \`${statsStr}\`\n_${cfg.description || ''}_`,
          inline: false,
        });
      } else {
        embed.addFields({ name, value: '❌ Lỗi dữ liệu trang bị.', inline: false });
      }
    } else {
      embed.addFields({ name, value: ' Trống', inline: false });
    }
  }

  // Thêm tổng chỉ số cộng thêm
  const totalStr =
    ` ❤️ HP: **+${formatNumber(totalStats.hp)}**\n` +
    ` ⚔️ ATK: **+${formatNumber(totalStats.atk)}**\n` +
    ` 🛡️ DEF: **+${formatNumber(totalStats.def)}**\n` +
    ` ⚡ SPEED: **+${formatNumber(totalStats.speed)}**\n` +
    ` 🔮 MANA: **+${formatNumber(totalStats.mana)}**`;

  embed.addFields({
    name: '📊 Tổng Chỉ Số Cộng Thêm',
    value: totalStr,
    inline: false,
  });

  // Action rows
  // Hàng 1: Nút tháo trang bị
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('equipment:unequip:weapon')
      .setLabel('Tháo Vũ Khí')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(!slots.weapon),
    new ButtonBuilder()
      .setCustomId('equipment:unequip:armor')
      .setLabel('Tháo Giáp')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(!slots.armor),
    new ButtonBuilder()
      .setCustomId('equipment:unequip:accessory')
      .setLabel('Tháo Phụ Kiện')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(!slots.accessory),
    new ButtonBuilder()
      .setCustomId('equipment:unequip:artifact')
      .setLabel('Tháo Pháp Bảo')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(!slots.artifact),
  );

  // Hàng 2: Nút cường hóa
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('equipment:enhance:weapon')
      .setLabel('⚡ Cường Hóa Vũ Khí')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(!slots.weapon),
    new ButtonBuilder()
      .setCustomId('equipment:enhance:armor')
      .setLabel('⚡ Cường Hóa Giáp')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(!slots.armor),
    new ButtonBuilder()
      .setCustomId('equipment:enhance:accessory')
      .setLabel('⚡ Cường Hóa Phụ Kiện')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(!slots.accessory),
    new ButtonBuilder()
      .setCustomId('equipment:enhance:artifact')
      .setLabel('⚡ Cường Hóa Pháp Bảo')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(!slots.artifact),
  );

  // Hàng 3: Trang bị từ túi đồ + Quay lại
  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('inventory:equipment')
      .setLabel('🎒 Trang Bị Từ Túi Đồ')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('profile:main')
      .setLabel('👤 Thông Tin')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('menu:main')
      .setLabel('🏠 Menu Chính')
      .setStyle(ButtonStyle.Secondary),
  );

  await interaction.update({ embeds: [embed], components: [row1, row2, row3] });
}

// ═══════════════════════════════════════════
//  handleEquipItem — Trang bị vật phẩm
// ═══════════════════════════════════════════

/**
 * Thực hiện trang bị một item từ túi đồ vào slot tương ứng
 * @param {import('discord.js').Interaction} interaction
 * @param {Object} player
 * @param {string} equipmentId
 */
async function handleEquipItem(interaction, player, equipmentId) {
  // Lấy config trang bị
  const cfg = equipConfig.getEquipmentById(equipmentId) || equipConfig.getById(equipmentId);
  if (!cfg) {
    return interaction.reply({ content: 'Không tìm thấy trang bị này.', ephemeral: true });
  }

  // Kiểm tra cảnh giới tối thiểu
  if (player.realm_index < cfg.min_realm) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setTitle('❌ Cảnh Giới Chưa Đủ')
      .setDescription(
        `Trang bị **${cfg.name}** yêu cầu cảnh giới tối thiểu bậc **${cfg.min_realm}**.\n` +
        `Cảnh giới hiện tại của bạn: bậc **${player.realm_index}**.`
      );
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // Kiểm tra có item trong túi đồ không
  const invItem = stmtGetInvItem.get(player.id, equipmentId);
  if (!invItem || invItem.quantity <= 0) {
    return interaction.reply({ content: 'Bạn không có trang bị này trong túi đồ.', ephemeral: true });
  }

  // Lấy trang bị cũ đang mặc ở slot đó
  const oldEq = stmtGetSlot.get(player.id, cfg.slot);

  const equipTransaction = db.transaction(() => {
    // 1. Trừ 1 trang bị trong túi đồ
    stmtReduceInvItem.run(1, player.id, equipmentId);
    stmtDeleteInvItem.run(player.id, equipmentId);

    // 2. Nếu có trang bị cũ, đưa lại vào túi đồ
    if (oldEq) {
      const existing = stmtGetInvItem.get(player.id, oldEq.equipment_id);
      if (existing) {
        stmtUpdateInvItem.run(1, player.id, oldEq.equipment_id);
      } else {
        stmtAddInvItem.run(player.id, oldEq.equipment_id, 1);
      }
    }

    // 3. Mặc trang bị mới vào slot
    stmtEquipItem.run(player.id, cfg.slot, equipmentId, 0); // Bắt đầu ở cường hóa +0
  });

  equipTransaction();

  // Thông báo thành công
  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle('⚔️ Trang Bị Thành Công!')
    .setDescription(
      `Bạn đã trang bị ${cfg.emoji} **${cfg.name}** vào ô **${SLOT_NAME[cfg.slot]}**.\n` +
      (oldEq
        ? `Trang bị cũ đã được tháo ra và chuyển vào túi đồ.`
        : '')
    )
    .setTimestamp();

  // Quay lại menu trang bị
  return showEquipmentMenu(interaction, player);
}

// ═══════════════════════════════════════════
//  handleUnequipItem — Tháo trang bị
// ═══════════════════════════════════════════

/**
 * Tháo trang bị từ ô chỉ định đưa về túi đồ
 * @param {import('discord.js').Interaction} interaction
 * @param {Object} player
 * @param {string} slot
 */
async function handleUnequipItem(interaction, player, slot) {
  // Lấy trang bị đang mặc ở slot
  const eq = stmtGetSlot.get(player.id, slot);
  if (!eq) {
    return interaction.reply({ content: 'Không có trang bị nào ở ô này.', ephemeral: true });
  }

  const cfg = equipConfig.getEquipmentById(eq.equipment_id) || equipConfig.getById(eq.equipment_id);
  if (!cfg) {
    return interaction.reply({ content: 'Lỗi config trang bị.', ephemeral: true });
  }

  const unequipTransaction = db.transaction(() => {
    // 1. Xóa khỏi slot mặc
    stmtUnequip.run(player.id, slot);

    // 2. Thêm lại vào túi đồ
    const existing = stmtGetInvItem.get(player.id, eq.equipment_id);
    if (existing) {
      stmtUpdateInvItem.run(1, player.id, eq.equipment_id);
    } else {
      stmtAddInvItem.run(player.id, eq.equipment_id, 1);
    }
  });

  unequipTransaction();

  // Quay lại menu trang bị
  return showEquipmentMenu(interaction, player);
}

// ═══════════════════════════════════════════
//  handleEnhance — Cường hóa trang bị
// ═══════════════════════════════════════════

/**
 * Cường hóa trang bị ở ô chỉ định, tiêu hao Linh Thạch
 * @param {import('discord.js').Interaction} interaction
 * @param {Object} player
 * @param {string} slot
 */
async function handleEnhance(interaction, player, slot) {
  const eq = stmtGetSlot.get(player.id, slot);
  if (!eq) {
    return interaction.reply({ content: 'Không có trang bị nào ở ô này để cường hóa.', ephemeral: true });
  }

  const cfg = equipConfig.getEquipmentById(eq.equipment_id) || equipConfig.getById(eq.equipment_id);
  if (!cfg) {
    return interaction.reply({ content: 'Lỗi config trang bị.', ephemeral: true });
  }

  const currentLevel = eq.enhance_level || 0;
  const maxEnhance = cfg.enhance_max || 10;

  if (currentLevel >= maxEnhance) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.WARNING)
      .setTitle('⚠️ Cường Hóa Tối Đa')
      .setDescription(`${cfg.emoji} **${cfg.name}** đã đạt cấp cường hóa tối đa (**+${maxEnhance}**).`);
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // Tính chi phí Linh Thạch: 100 * (level + 1)^2
  const cost = 100 * Math.pow(currentLevel + 1, 2);

  if (player.linh_thach < cost) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setTitle('❌ Không Đủ Linh Thạch')
      .setDescription(
        `Cường hóa lên **+${currentLevel + 1}** yêu cầu **${formatNumber(cost)}** 💎 Linh Thạch.\n` +
        `Hiện có: **${formatNumber(player.linh_thach)}** 💎`
      );
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // Tỉ lệ thành công: +1~3: 100%, +4~5: 80%, +6~8: 50%, +9~10+: 20%
  let rate = 100;
  const nextLvl = currentLevel + 1;
  if (nextLvl >= 9) rate = 20;
  else if (nextLvl >= 6) rate = 50;
  else if (nextLvl >= 4) rate = 80;

  const success = chance(rate);

  // Giao dịch cường hóa
  const enhanceTransaction = db.transaction(() => {
    // Trừ Linh Thạch
    stmtSpendLinhThach.run(cost, player.id, cost);

    if (success) {
      stmtUpdateEnhance.run(currentLevel + 1, player.id, slot);
    }
  });

  enhanceTransaction();

  // Lấy dữ liệu người chơi mới để hiển thị Linh Thạch chính xác
  const updatedPlayer = db.prepare('SELECT * FROM players WHERE id = ?').get(player.id);

  const embed = new EmbedBuilder().setTimestamp();

  if (success) {
    embed
      .setColor(COLORS.SUCCESS)
      .setTitle('🎉 Cường Hóa Thành Công!')
      .setDescription(
        `Chúc mừng! ${cfg.emoji} **${cfg.name}** đã được cường hóa lên **+${nextLvl}**!\n\n` +
        `💎 Tiêu hao: **-${formatNumber(cost)}** Linh Thạch\n` +
        `📈 Chỉ số tăng thêm: **+10%** chỉ số cơ bản.`
      )
      .setFooter({ text: `Linh Thạch còn lại: ${formatNumber(updatedPlayer.linh_thach)}` });
  } else {
    embed
      .setColor(COLORS.ERROR)
      .setTitle('💥 Cường Hóa Thất Bại!')
      .setDescription(
        `Rất tiếc, cường hóa lên **+${nextLvl}** thất bại.\n\n` +
        `💎 Tiêu hao: **-${formatNumber(cost)}** Linh Thạch\n` +
        `🛡️ Trang bị giữ nguyên cấp **+${currentLevel}**.`
      )
      .setFooter({ text: `Linh Thạch còn lại: ${formatNumber(updatedPlayer.linh_thach)}` });
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('equipment:menu')
      .setLabel('🔙 Quay Lại Trang Bị')
      .setStyle(ButtonStyle.Primary)
  );

  return interaction.update({ embeds: [embed], components: [row] });
}

module.exports = {
  showEquipmentMenu,
  handleEquipItem,
  handleUnequipItem,
  handleEnhance,
  getEquippedStats,
};