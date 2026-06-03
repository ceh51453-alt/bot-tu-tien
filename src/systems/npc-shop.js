/**
 * @file NPC Shop / Tiệm Bách Bảo System
 * @description Hệ thống cửa hàng NPC chung — mua dược phẩm/tiêu hao, bán nguyên liệu tích lũy
 */

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const db = require('../database/connection');
const itemsConfig = require('../../config/items');
const { COLORS } = require('../utils/constants');
const { formatNumber } = require('../utils/helpers');

// Danh sách vật phẩm được bán trong tiệm bách bảo và giá mua tương ứng
const SHOP_ITEMS = [
  { id: 'hoi_khi_dan', price: 15 },
  { id: 'hoi_linh_dan', price: 15 },
  { id: 'truc_co_dan', price: 100 },
  { id: 'kim_dan_dan', price: 500 },
  { id: 'truyen_tong_phu', price: 100 },
  { id: 'ho_the_phu', price: 150 },
  { id: 'cuoc_khai_khoang', price: 100 }
];

// Prepared statements
const stmtGetInvItem = db.prepare('SELECT quantity FROM inventory WHERE player_id = ? AND item_id = ?');
const stmtAddInvItem = db.prepare('INSERT INTO inventory (player_id, item_id, quantity) VALUES (?, ?, ?)');
const stmtUpdateInvItem = db.prepare('UPDATE inventory SET quantity = quantity + ? WHERE player_id = ? AND item_id = ?');
const stmtReduceInvItem = db.prepare('UPDATE inventory SET quantity = quantity - 1 WHERE player_id = ? AND item_id = ?');
const stmtDeleteInvItem = db.prepare('DELETE FROM inventory WHERE player_id = ? AND item_id = ? AND quantity <= 0');
const stmtSpendLinhThach = db.prepare('UPDATE players SET linh_thach = linh_thach - ? WHERE id = ? AND linh_thach >= ?');
const stmtAddLinhThach = db.prepare('UPDATE players SET linh_thach = linh_thach + ? WHERE id = ?');

/**
 * Hiển thị giao diện Mua hàng ở Tiệm Bách Bảo
 */
async function showNpcShop(interaction, player) {
  let description = `Hoan nghênh đạo hữu ghé thăm Tiệm Bách Bảo!\n`;
  description += `💎 Linh Thạch hiện có: **${formatNumber(player.linh_thach)}**\n\n`;

  SHOP_ITEMS.forEach((shopItem, idx) => {
    const cfg = itemsConfig.getItemById(shopItem.id);
    if (cfg) {
      description += `**${idx + 1}.** ${cfg.emoji} **${cfg.name}** — 💎 **${formatNumber(shopItem.price)}** Linh Thạch\n`;
      description += `  _${cfg.description}_\n\n`;
    }
  });

  const embed = new EmbedBuilder()
    .setColor(0xD4AF37) // Gold color
    .setTitle('🏪 Tiệm Bách Bảo — Mua Vật Phẩm')
    .setDescription(description)
    .setTimestamp();

  const options = SHOP_ITEMS.map(shopItem => {
    const cfg = itemsConfig.getItemById(shopItem.id);
    return {
      label: cfg ? cfg.name : shopItem.id,
      description: `Giá: ${shopItem.price} Linh Thạch`,
      value: shopItem.id,
      emoji: cfg ? cfg.emoji : '📦',
    };
  });

  const selectRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('select:npc_shop_buy')
      .setPlaceholder('Chọn vật phẩm muốn mua...')
      .addOptions(options)
  );

  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('trade:npcsell')
      .setLabel('💰 Bán Vật Phẩm')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('trade:menu')
      .setLabel('🔙 Quay Lại')
      .setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [selectRow, buttonRow] });
}

/**
 * Thực thi mua vật phẩm từ Tiệm Bách Bảo
 */
async function executeNpcShopBuy(interaction, player, itemId) {
  const shopItem = SHOP_ITEMS.find(i => i.id === itemId);
  if (!shopItem) {
    return interaction.reply({ content: 'Vật phẩm không được bán ở tiệm này.', ephemeral: true });
  }

  if (player.linh_thach < shopItem.price) {
    return interaction.reply({ content: 'Đạo hữu không đủ Linh Thạch.', ephemeral: true });
  }

  // Giao dịch mua
  const buyTx = db.transaction(() => {
    stmtSpendLinhThach.run(shopItem.price, player.id, shopItem.price);
    const existing = stmtGetInvItem.get(player.id, itemId);
    if (existing) {
      stmtUpdateInvItem.run(1, player.id, itemId);
    } else {
      stmtAddInvItem.run(player.id, itemId, 1);
    }
  });

  try {
    buyTx();
  } catch (err) {
    return interaction.reply({ content: `Mua thất bại: ${err.message}`, ephemeral: true });
  }

  const updatedPlayer = db.prepare('SELECT * FROM players WHERE id = ?').get(player.id);
  const cfg = itemsConfig.getItemById(itemId);

  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle('🛒 Mua Thành Công')
    .setDescription(
      `Đạo hữu đã mua 1 ${cfg ? cfg.emoji : ''} **${cfg ? cfg.name : itemId}**.\n\n` +
      `💎 Tiêu hao: **-${formatNumber(shopItem.price)}** Linh Thạch\n` +
      `💎 Linh Thạch còn lại: **${formatNumber(updatedPlayer.linh_thach)}**`
    )
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('trade:npcshop').setLabel('🔙 Quay lại Tiệm').setStyle(ButtonStyle.Primary)
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

/**
 * Hiển thị giao diện Bán hàng
 */
async function showNpcSellMenu(interaction, player) {
  const allInventory = db.prepare('SELECT * FROM inventory WHERE player_id = ? AND quantity > 0').all(player.id);
  
  // Lấy các item bán được (chỉ đan dược, nguyên liệu, tiêu hao có value > 0)
  const sellables = allInventory.map(item => {
    const cfg = itemsConfig.getItemById(item.item_id) || require('../../config/equipment').getEquipmentById(item.item_id) || require('../../config/equipment').getById(item.item_id);
    if (cfg && cfg.value > 0) {
      const sellPrice = Math.max(1, Math.floor(cfg.value * 0.5));
      return { ...cfg, quantity: item.quantity, sellPrice };
    }
    return null;
  }).filter(Boolean);

  let description = `Đạo hữu muốn thanh lý vật phẩm nào?\n` +
    `Giá thanh lý bằng **50%** giá trị vật phẩm.\n` +
    `💎 Linh Thạch hiện có: **${formatNumber(player.linh_thach)}**\n\n`;

  if (sellables.length === 0) {
    description += '_Túi đồ của đạo hữu không có vật phẩm nào có thể thanh lý._';
  } else {
    sellables.forEach((item, idx) => {
      description += `**${idx + 1}.** ${item.emoji || '📦'} **${item.name}** (×${item.quantity}) — Thu hồi: 💎 **${formatNumber(item.sellPrice)}** Linh Thạch/cái\n`;
    });
  }

  const embed = new EmbedBuilder()
    .setColor(0xD4AF37)
    .setTitle('💰 Tiệm Bách Bảo — Thanh Lý Vật Phẩm')
    .setDescription(description)
    .setTimestamp();

  const components = [];
  if (sellables.length > 0) {
    const options = sellables.slice(0, 25).map(item => ({
      label: `${item.name} (x${item.quantity})`,
      description: `Bán nhận: ${item.sellPrice} Linh Thạch`,
      value: item.id,
      emoji: item.emoji || '📦',
    }));

    const selectRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select:npc_shop_sell')
        .setPlaceholder('Chọn vật phẩm thanh lý (bán 1 cái)...')
        .addOptions(options)
    );
    components.push(selectRow);
  }

  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('trade:npcshop')
      .setLabel('🏪 Mua Vật Phẩm')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('trade:menu')
      .setLabel('🔙 Quay Lại')
      .setStyle(ButtonStyle.Secondary)
  );
  components.push(buttonRow);

  await interaction.update({ embeds: [embed], components });
}

/**
 * Thực thi bán vật phẩm cho Tiệm Bách Bảo
 */
async function executeNpcShopSell(interaction, player, itemId) {
  const invItem = stmtGetInvItem.get(player.id, itemId);
  if (!invItem || invItem.quantity <= 0) {
    return interaction.reply({ content: 'Đạo hữu không có vật phẩm này trong hành trang.', ephemeral: true });
  }

  const itemCfg = itemsConfig.getItemById(itemId) || require('../../config/equipment').getEquipmentById(itemId) || require('../../config/equipment').getById(itemId);
  if (!itemCfg || !(itemCfg.value > 0)) {
    return interaction.reply({ content: 'Vật phẩm không thể thanh lý.', ephemeral: true });
  }

  const sellPrice = Math.max(1, Math.floor(itemCfg.value * 0.5));

  // Giao dịch bán
  const sellTx = db.transaction(() => {
    stmtReduceInvItem.run(player.id, itemId);
    stmtDeleteInvItem.run(player.id, itemId);
    stmtAddLinhThach.run(sellPrice, player.id);
  });

  try {
    sellTx();
  } catch (err) {
    return interaction.reply({ content: `Thanh lý thất bại: ${err.message}`, ephemeral: true });
  }

  const updatedPlayer = db.prepare('SELECT * FROM players WHERE id = ?').get(player.id);

  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle('💰 Thanh Lý Thành Công')
    .setDescription(
      `Đạo hữu đã bán 1 ${itemCfg.emoji || '📦'} **${itemCfg.name}**.\n\n` +
      `💎 Nhận được: **+${formatNumber(sellPrice)}** Linh Thạch\n` +
      `💎 Linh Thạch hiện tại: **${formatNumber(updatedPlayer.linh_thach)}**`
    )
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('trade:npcsell').setLabel('🔙 Tiếp tục Thanh Lý').setStyle(ButtonStyle.Primary)
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

module.exports = {
  showNpcShop,
  executeNpcShopBuy,
  showNpcSellMenu,
  executeNpcShopSell
};
