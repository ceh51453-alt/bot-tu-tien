/**
 * @file Auction House / Tụ Bảo Các System
 * @description Hệ thống đấu giá vật phẩm — đăng bán, mua đồ đấu giá, rút đồ đấu giá
 */

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../database/connection');
const itemsConfig = require('../../config/items');
const { COLORS } = require('../utils/constants');
const { formatNumber } = require('../utils/helpers');

// Prepared statements
const stmtGetInvItem = db.prepare('SELECT quantity FROM inventory WHERE player_id = ? AND item_id = ?');
const stmtAddInvItem = db.prepare('INSERT INTO inventory (player_id, item_id, quantity) VALUES (?, ?, ?)');
const stmtUpdateInvItem = db.prepare('UPDATE inventory SET quantity = quantity + ? WHERE player_id = ? AND item_id = ?');
const stmtReduceInvItem = db.prepare('UPDATE inventory SET quantity = quantity - ? WHERE player_id = ? AND item_id = ?');
const stmtDeleteInvItem = db.prepare('DELETE FROM inventory WHERE player_id = ? AND item_id = ? AND quantity <= 0');

const stmtGetListing = db.prepare('SELECT * FROM auction_listings WHERE id = ?');
const stmtGetListingOwned = db.prepare('SELECT * FROM auction_listings WHERE id = ? AND seller_id = ?');
const stmtDeleteListing = db.prepare('DELETE FROM auction_listings WHERE id = ?');
const stmtInsertListing = db.prepare('INSERT INTO auction_listings (seller_id, item_id, quantity, price) VALUES (?, ?, ?, ?)');

const stmtAddLinhThach = db.prepare('UPDATE players SET linh_thach = linh_thach + ? WHERE id = ?');
const stmtSpendLinhThach = db.prepare('UPDATE players SET linh_thach = linh_thach - ? WHERE id = ? AND linh_thach >= ?');

/**
 * Hiển thị giao diện menu Tụ Bảo Các
 */
async function showAuctionMenu(interaction, player) {
  const embed = new EmbedBuilder()
    .setColor(0x9b59b6) // Purple color
    .setTitle('🔮 Tụ Bảo Các — Các Chủ Đấu Giá')
    .setDescription(
      `Chào mừng đạo hữu đến với **Tụ Bảo Các**, nơi giao dịch kỳ trân dị bảo giữa các tu sĩ trong thiên hạ.\n\n` +
      `💎 Linh Thạch của đạo hữu: **${formatNumber(player.linh_thach)}**\n\n` +
      `Chọn hành động bên dưới:`
    )
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('trade:auction_view').setLabel('🛒 Mua Đồ Đấu Giá').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('trade:auction_list').setLabel('📦 Đăng Bán Cổ Bảo').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('trade:auction_mylist').setLabel('📋 Cổ Bảo Đang Bán').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('trade:menu').setLabel('🔙 Giao Dịch').setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

/**
 * Xem danh sách vật phẩm đang đấu giá của người khác
 */
async function showAuctionListings(interaction, player) {
  const listings = db.prepare(`
    SELECT al.*, p.name as seller_name 
    FROM auction_listings al 
    JOIN players p ON al.seller_id = p.id 
    WHERE al.seller_id != ? 
    ORDER BY al.created_at DESC 
    LIMIT 25
  `).all(player.id);

  let description = `💎 Linh Thạch của đạo hữu: **${formatNumber(player.linh_thach)}**\n\n` +
    `── **DANH SÁCH BẢO VẬT ĐANG ĐẤU GIÁ** ──\n\n`;

  if (listings.length === 0) {
    description += '_Tụ Bảo Các hiện chưa có bảo vật nào của các tu sĩ khác đăng bán._';
  } else {
    listings.forEach((list, idx) => {
      const itemCfg = itemsConfig.getItemById(list.item_id) || require('../../config/equipment').getEquipmentById(list.item_id) || require('../../config/equipment').getById(list.item_id);
      const name = itemCfg ? itemCfg.name : list.item_id;
      const emoji = itemCfg ? itemCfg.emoji : '📦';
      description += `**${idx + 1}.** ${emoji} **${name}** (x${list.quantity}) — Giá: 💎 **${formatNumber(list.price)}** Linh Thạch\n`;
      description += `  👤 Người bán: **${list.seller_name}**\n\n`;
    });
  }

  const embed = new EmbedBuilder()
    .setColor(0x9b59b6)
    .setTitle('🛒 Mua Đồ Đấu Giá')
    .setDescription(description)
    .setTimestamp();

  const components = [];
  if (listings.length > 0) {
    const options = listings.map(list => {
      const itemCfg = itemsConfig.getItemById(list.item_id) || require('../../config/equipment').getEquipmentById(list.item_id) || require('../../config/equipment').getById(list.item_id);
      const name = itemCfg ? itemCfg.name : list.item_id;
      return {
        label: `${name} (x${list.quantity})`,
        description: `Giá: ${list.price} LT — Người bán: ${list.seller_name}`,
        value: String(list.id),
        emoji: itemCfg ? itemCfg.emoji : '📦',
      };
    });

    const selectRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select:auction_buy')
        .setPlaceholder('Chọn bảo vật muốn mua...')
        .addOptions(options)
    );
    components.push(selectRow);
  }

  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('trade:auction').setLabel('🔙 Quay Lại').setStyle(ButtonStyle.Secondary)
  );
  components.push(buttonRow);

  await interaction.update({ embeds: [embed], components });
}

/**
 * Thực thi mua vật phẩm trên sàn đấu giá
 */
async function executeAuctionBuy(interaction, player, listingId) {
  const lId = parseInt(listingId);
  const list = stmtGetListing.get(lId);

  if (!list) {
    return interaction.reply({ content: 'Mục đấu giá này không còn tồn tại.', ephemeral: true });
  }

  if (list.seller_id === player.id) {
    return interaction.reply({ content: 'Đạo hữu không thể mua đồ của chính mình đăng bán.', ephemeral: true });
  }

  if (player.linh_thach < list.price) {
    return interaction.reply({ content: 'Đạo hữu không đủ Linh Thạch để mua.', ephemeral: true });
  }

  // Giao dịch mua đấu giá
  const buyTx = db.transaction(() => {
    // Trừ Linh Thạch người mua
    const spent = stmtSpendLinhThach.run(list.price, player.id, list.price);
    if (spent.changes === 0) throw new Error('Không đủ Linh Thạch');

    // Cộng Linh Thạch người bán
    stmtAddLinhThach.run(list.price, list.seller_id);

    // Chuyển vật phẩm vào kho người mua
    const existing = stmtGetInvItem.get(player.id, list.item_id);
    if (existing) {
      stmtUpdateInvItem.run(list.quantity, player.id, list.item_id);
    } else {
      stmtAddInvItem.run(player.id, list.item_id, list.quantity);
    }

    // Xóa listing
    stmtDeleteListing.run(lId);
  });

  try {
    buyTx();
  } catch (err) {
    return interaction.reply({ content: `Mua thất bại: ${err.message}`, ephemeral: true });
  }

  const itemCfg = itemsConfig.getItemById(list.item_id) || require('../../config/equipment').getEquipmentById(list.item_id) || require('../../config/equipment').getById(list.item_id);
  
  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle('🎉 Giao Dịch Thành Công')
    .setDescription(
      `Đạo hữu đã mua thành công ${itemCfg ? itemCfg.emoji : '📦'} **${itemCfg ? itemCfg.name : list.item_id}** (x${list.quantity}) qua Tụ Bảo Các.\n\n` +
      `💎 Tiêu hao: **-${formatNumber(list.price)}** Linh Thạch`
    )
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('trade:auction_view').setLabel('🔙 Quay Lại Sàn Đấu Giá').setStyle(ButtonStyle.Primary)
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

/**
 * Hiển thị kho đồ để chọn đăng bán đấu giá
 */
async function handleAuctionListSelectMenu(interaction, player) {
  const allInventory = db.prepare('SELECT * FROM inventory WHERE player_id = ? AND quantity > 0').all(player.id);

  // Chỉ cho đăng bán các vật phẩm có thể giao dịch (loại bỏ thiết bị đang mặc)
  // Thực tế mọi vật phẩm trong kho đồ 'inventory' đều tháo được nên đều bán được
  const sellables = allInventory.map(item => {
    const cfg = itemsConfig.getItemById(item.item_id) || require('../../config/equipment').getEquipmentById(item.item_id) || require('../../config/equipment').getById(item.item_id);
    return cfg ? { ...cfg, quantity: item.quantity } : null;
  }).filter(Boolean);

  let description = `Chọn vật phẩm trong kho đồ đạo hữu muốn ký gửi đăng bán đấu giá:\n` +
    `💡 Lưu ý: Đăng bán sẽ ký gửi **1 cái** vật phẩm lên sàn.\n\n`;

  if (sellables.length === 0) {
    description += '_Hành trang của đạo hữu trống rỗng, không có vật phẩm ký gửi._';
  } else {
    sellables.forEach((item, idx) => {
      description += `**${idx + 1}.** ${item.emoji || '📦'} **${item.name}** (x${item.quantity}) — Base Value: 💎 ${formatNumber(item.value || 0)}\n`;
    });
  }

  const embed = new EmbedBuilder()
    .setColor(0x9b59b6)
    .setTitle('📦 Đăng Bán Cổ Bảo — Ký Gửi')
    .setDescription(description)
    .setTimestamp();

  const components = [];
  if (sellables.length > 0) {
    const options = sellables.slice(0, 25).map(item => ({
      label: `${item.name} (x${item.quantity})`,
      description: `Chọn vật phẩm để đặt mức giá bán`,
      value: item.id,
      emoji: item.emoji || '📦',
    }));

    const selectRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select:auction_list_item')
        .setPlaceholder('Chọn vật phẩm ký gửi...')
        .addOptions(options)
    );
    components.push(selectRow);
  }

  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('trade:auction').setLabel('🔙 Quay Lại').setStyle(ButtonStyle.Secondary)
  );
  components.push(buttonRow);

  await interaction.update({ embeds: [embed], components });
}

/**
 * Xử lý khi chọn vật phẩm ký gửi, mở Modal điền giá
 */
async function handleAuctionListSelect(interaction, player, itemId) {
  const invItem = stmtGetInvItem.get(player.id, itemId);
  if (!invItem || invItem.quantity <= 0) {
    return interaction.reply({ content: 'Đạo hữu không có vật phẩm này.', ephemeral: true });
  }

  const itemCfg = itemsConfig.getItemById(itemId) || require('../../config/equipment').getEquipmentById(itemId) || require('../../config/equipment').getById(itemId);
  
  const modal = new ModalBuilder()
    .setCustomId(`trade:auction_list_submit:${itemId}`)
    .setTitle('🏷️ Đặt Giá Đấu Giá');

  const priceInput = new TextInputBuilder()
    .setCustomId('list_price')
    .setLabel(`Giá Bán (Linh Thạch, Base: ${itemCfg ? itemCfg.value : 0})`)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('ví dụ: 500')
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder().addComponents(priceInput));
  await interaction.showModal(modal);
}

/**
 * Thực thi đăng bán sau khi điền giá qua Modal
 */
async function executeAuctionList(interaction, player, itemId, priceStr) {
  const price = parseInt(priceStr.trim());
  if (isNaN(price) || price <= 0) {
    return interaction.reply({ content: 'Mức giá đấu giá phải là một số nguyên dương hợp lệ.', ephemeral: true });
  }

  const invItem = stmtGetInvItem.get(player.id, itemId);
  if (!invItem || invItem.quantity <= 0) {
    return interaction.reply({ content: 'Không tìm thấy vật phẩm này trong hành trang.', ephemeral: true });
  }

  // Đăng bán 1 cái
  const listTx = db.transaction(() => {
    stmtReduceInvItem.run(1, player.id, itemId);
    stmtDeleteInvItem.run(player.id, itemId);
    stmtInsertListing.run(player.id, itemId, 1, price);
  });

  try {
    listTx();
  } catch (err) {
    return interaction.reply({ content: `Đăng bán thất bại: ${err.message}`, ephemeral: true });
  }

  const itemCfg = itemsConfig.getItemById(itemId) || require('../../config/equipment').getEquipmentById(itemId) || require('../../config/equipment').getById(itemId);

  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle('✅ Đăng Ký Gửi Thành Công')
    .setDescription(
      `Đạo hữu đã ký gửi lên sàn Tụ Bảo Các:\n\n` +
      `📦 Vật phẩm: 1x ${itemCfg ? itemCfg.emoji : '📦'} **${itemCfg ? itemCfg.name : itemId}**\n` +
      `🏷️ Định giá bán: 💎 **${formatNumber(price)}** Linh Thạch\n\n` +
      `*Tu sĩ khác trong thiên hạ đã có thể bái mua cổ bảo này.*`
    )
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('trade:auction').setLabel('🔙 Về Tụ Bảo Các').setStyle(ButtonStyle.Primary)
  );

  await interaction.reply({ embeds: [embed], components: [row] });
}

/**
 * Xem danh sách vật phẩm mình đang bán
 */
async function showMyListings(interaction, player) {
  const listings = db.prepare('SELECT * FROM auction_listings WHERE seller_id = ? ORDER BY created_at DESC').all(player.id);

  let description = `Dưới đây là các vật phẩm đạo hữu đang ký gửi đấu giá:\n\n`;

  if (listings.length === 0) {
    description += '_Đạo hữu hiện chưa ký gửi bán vật phẩm nào._';
  } else {
    listings.forEach((list, idx) => {
      const itemCfg = itemsConfig.getItemById(list.item_id) || require('../../config/equipment').getEquipmentById(list.item_id) || require('../../config/equipment').getById(list.item_id);
      const name = itemCfg ? itemCfg.name : list.item_id;
      const emoji = itemCfg ? itemCfg.emoji : '📦';
      description += `**${idx + 1}.** ${emoji} **${name}** (x${list.quantity}) — Đang bán: 💎 **${formatNumber(list.price)}** Linh Thạch\n`;
    });
  }

  const embed = new EmbedBuilder()
    .setColor(0x9b59b6)
    .setTitle('📋 Cổ Bảo Đang Bán Của Bản Thân')
    .setDescription(description)
    .setTimestamp();

  const components = [];
  if (listings.length > 0) {
    const options = listings.map(list => {
      const itemCfg = itemsConfig.getItemById(list.item_id) || require('../../config/equipment').getEquipmentById(list.item_id) || require('../../config/equipment').getById(list.item_id);
      const name = itemCfg ? itemCfg.name : list.item_id;
      return {
        label: `${name} (x${list.quantity})`,
        description: `Thu hồi/Hủy bán ký gửi — Giá: ${list.price} LT`,
        value: String(list.id),
        emoji: itemCfg ? itemCfg.emoji : '📦',
      };
    });

    const selectRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select:auction_cancel')
        .setPlaceholder('Chọn mục ký gửi muốn thu hồi...')
        .addOptions(options)
    );
    components.push(selectRow);
  }

  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('trade:auction').setLabel('🔙 Quay Lại').setStyle(ButtonStyle.Secondary)
  );
  components.push(buttonRow);

  await interaction.update({ embeds: [embed], components });
}

/**
 * Thu hồi / Hủy đăng ký gửi
 */
async function executeCancelListing(interaction, player, listingId) {
  const lId = parseInt(listingId);
  const list = stmtGetListingOwned.get(lId, player.id);

  if (!list) {
    return interaction.reply({ content: 'Mục đăng ký gửi không tồn tại hoặc không phải của đạo hữu.', ephemeral: true });
  }

  // Giao dịch thu hồi
  const cancelTx = db.transaction(() => {
    // Trả lại đồ về kho
    const existing = stmtGetInvItem.get(player.id, list.item_id);
    if (existing) {
      stmtUpdateInvItem.run(list.quantity, player.id, list.item_id);
    } else {
      stmtAddInvItem.run(player.id, list.item_id, list.quantity);
    }

    // Xóa listing
    stmtDeleteListing.run(lId);
  });

  try {
    cancelTx();
  } catch (err) {
    return interaction.reply({ content: `Thu hồi thất bại: ${err.message}`, ephemeral: true });
  }

  const itemCfg = itemsConfig.getItemById(list.item_id) || require('../../config/equipment').getEquipmentById(list.item_id) || require('../../config/equipment').getById(list.item_id);

  const embed = new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle('📋 Thu Hồi Cổ Bảo Thành Công')
    .setDescription(
      `Đạo hữu đã hủy ký gửi đấu giá và thu hồi ${itemCfg ? itemCfg.emoji : '📦'} **${itemCfg ? itemCfg.name : list.item_id}** (x${list.quantity}) về hành trang.`
    )
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('trade:auction_mylist').setLabel('🔙 Trở lại Danh Sách').setStyle(ButtonStyle.Primary)
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

module.exports = {
  showAuctionMenu,
  showAuctionListings,
  executeAuctionBuy,
  handleAuctionListSelectMenu,
  handleAuctionListSelect,
  executeAuctionList,
  showMyListings,
  executeCancelListing
};
