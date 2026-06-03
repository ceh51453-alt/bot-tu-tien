/**
 * @file Player Direct Trading System
 * @description Hệ thống giao dịch trực tiếp giữa các tu sĩ — đặt đề xuất, xác nhận giao dịch trên kênh chat
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

const stmtSpendLinhThach = db.prepare('UPDATE players SET linh_thach = linh_thach - ? WHERE id = ? AND linh_thach >= ?');
const stmtAddLinhThach = db.prepare('UPDATE players SET linh_thach = linh_thach + ? WHERE id = ?');

const stmtGetTrade = db.prepare('SELECT * FROM player_trades WHERE id = ?');
const stmtInsertTrade = db.prepare(`
  INSERT INTO player_trades (sender_id, receiver_id, offer_linh_thach, offer_item_id, offer_item_qty, status) 
  VALUES (?, ?, ?, ?, ?, 'pending')
`);
const stmtUpdateTradeStatus = db.prepare('UPDATE player_trades SET status = ? WHERE id = ?');

/**
 * Hiển thị danh sách người chơi khác để chọn đối tác giao dịch
 */
async function showPlayerTradeList(interaction, player) {
  const otherPlayers = db.prepare('SELECT * FROM players WHERE is_dead = 0 AND id != ? LIMIT 25').all(player.id);

  const embed = new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle('🤝 Giao Dịch Tiên Nhân')
    .setDescription(
      `Đạo hữu muốn giao dịch trực tiếp với tu sĩ nào?\n` +
      `Hãy chọn một người chơi bên dưới để thiết lập giao dịch:`
    )
    .setTimestamp();

  if (otherPlayers.length === 0) {
    embed.setDescription('Hiện tại giang hồ không có tu sĩ nào khác trực tuyến để giao dịch.');
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('trade:menu').setLabel('🔙 Quay Lại').setStyle(ButtonStyle.Secondary)
    );
    return interaction.update({ embeds: [embed], components: [row] });
  }

  const options = otherPlayers.map(p => {
    const realms = require('../../config/realms');
    const realmCfg = realms.list[p.realm_index];
    return {
      label: p.name,
      description: `${realmCfg ? realmCfg.name : 'Phàm Nhân'} — T${p.sub_realm}`,
      value: String(p.id),
      emoji: '🧑',
    };
  });

  const selectRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('select:trade_partner')
      .setPlaceholder('Chọn đối tác giao dịch...')
      .addOptions(options)
  );

  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('trade:menu').setLabel('🔙 Giao Dịch').setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [selectRow, buttonRow] });
}

/**
 * Hiển thị tùy chọn đề xuất giao dịch cho đối tác đã chọn
 */
async function handleSelectTradePartner(interaction, player, targetPlayerId) {
  const target = db.prepare('SELECT * FROM players WHERE id = ? AND is_dead = 0').get(targetPlayerId);
  if (!target) {
    return interaction.reply({ content: 'Không tìm thấy tu sĩ này hoặc người này đã tử vong.', ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle(`🤝 Đề Xuất Giao Dịch — ${target.name}`)
    .setDescription(
      `Đạo hữu chuẩn bị giao dịch với **${target.name}**.\n` +
      `Hãy chọn loại đề xuất muốn trao đổi dưới đây:`
    )
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`trade:offer_lt:${target.id}`)
      .setLabel('💎 Đề Xuất Linh Thạch')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`trade:offer_item_menu:${target.id}`)
      .setLabel('📦 Đề Xuất Vật Phẩm')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('trade:player')
      .setLabel('🔙 Quay Lại')
      .setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

/**
 * Mở modal đề xuất Linh Thạch
 */
async function handleTradeOfferLinhThach(interaction, player, targetPlayerId) {
  const modal = new ModalBuilder()
    .setCustomId(`trade:offer_lt_submit:${targetPlayerId}`)
    .setTitle('🤝 Đề Xuất Linh Thạch');

  const amountInput = new TextInputBuilder()
    .setCustomId('offer_amount')
    .setLabel(`Số Linh Thạch muốn trao tặng (Hiện có: ${player.linh_thach})`)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('ví dụ: 100')
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder().addComponents(amountInput));
  await interaction.showModal(modal);
}

/**
 * Xử lý sau khi điền Linh Thạch đề xuất qua Modal
 */
async function executeTradeOfferLinhThachSubmit(interaction, player, targetPlayerId, amountStr) {
  const amount = parseInt(amountStr.trim());
  if (isNaN(amount) || amount <= 0) {
    return interaction.reply({ content: 'Số Linh Thạch đề xuất phải là số nguyên dương hợp lệ.', ephemeral: true });
  }

  if (player.linh_thach < amount) {
    return interaction.reply({ content: 'Đạo hữu không có đủ Linh Thạch.', ephemeral: true });
  }

  return sendTradeRequest(interaction, player, targetPlayerId, amount, null, 0);
}

/**
 * Hiển thị kho đồ để chọn vật phẩm đề xuất
 */
async function handleTradeOfferItemMenu(interaction, player, targetPlayerId) {
  const allInventory = db.prepare('SELECT * FROM inventory WHERE player_id = ? AND quantity > 0').all(player.id);
  
  const sellables = allInventory.map(item => {
    const cfg = itemsConfig.getItemById(item.item_id) || require('../../config/equipment').getEquipmentById(item.item_id) || require('../../config/equipment').getById(item.item_id);
    return cfg ? { ...cfg, quantity: item.quantity } : null;
  }).filter(Boolean);

  let description = `Chọn vật phẩm trong kho đồ đạo hữu muốn đề xuất giao dịch (sẽ giao dịch **1 cái**):\n\n`;

  if (sellables.length === 0) {
    description += '_Hành trang của đạo hữu trống rỗng, không có vật phẩm nào._';
  } else {
    sellables.forEach((item, idx) => {
      description += `**${idx + 1}.** ${item.emoji || '📦'} **${item.name}** (x${item.quantity})\n`;
    });
  }

  const target = db.prepare('SELECT * FROM players WHERE id = ?').get(targetPlayerId);

  const embed = new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle(`📦 Đề Xuất Vật Phẩm cho ${target ? target.name : 'Đối Tác'}`)
    .setDescription(description)
    .setTimestamp();

  const components = [];
  if (sellables.length > 0) {
    const options = sellables.slice(0, 25).map(item => ({
      label: `${item.name} (x${item.quantity})`,
      description: `Đề xuất 1x ${item.name}`,
      value: item.id,
      emoji: item.emoji || '📦',
    }));

    const selectRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`select:trade_item:${targetPlayerId}`)
        .setPlaceholder('Chọn vật phẩm đề xuất...')
        .addOptions(options)
    );
    components.push(selectRow);
  }

  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`trade:select_partner:${targetPlayerId}`).setLabel('🔙 Quay Lại').setStyle(ButtonStyle.Secondary)
  );
  components.push(buttonRow);

  await interaction.update({ embeds: [embed], components });
}

/**
 * Xử lý khi chọn vật phẩm đề xuất
 */
async function executeTradeOfferItemSelect(interaction, player, targetPlayerId, itemId) {
  const invItem = stmtGetInvItem.get(player.id, itemId);
  if (!invItem || invItem.quantity <= 0) {
    return interaction.reply({ content: 'Đạo hữu không có vật phẩm này.', ephemeral: true });
  }

  return sendTradeRequest(interaction, player, targetPlayerId, 0, itemId, 1);
}

/**
 * Gửi lệnh giao dịch lên kênh trò chuyện dưới dạng nút công khai
 */
async function sendTradeRequest(interaction, player, targetPlayerId, linhThach, itemId, qty) {
  const target = db.prepare('SELECT * FROM players WHERE id = ?').get(targetPlayerId);
  if (!target) return interaction.reply({ content: 'Không tìm thấy tu sĩ này.', ephemeral: true });

  // Tạo dòng ghi chép trade pending
  const result = stmtInsertTrade.run(player.id, target.id, linhThach, itemId, qty);
  const tradeId = result.lastInsertRowid;

  let itemDetailsText = '';
  if (itemId) {
    const itemCfg = itemsConfig.getItemById(itemId) || require('../../config/equipment').getEquipmentById(itemId) || require('../../config/equipment').getById(itemId);
    itemDetailsText = `📦 Vật phẩm: **${itemCfg ? itemCfg.emoji : '📦'} ${itemCfg ? itemCfg.name : itemId}** (x${qty})`;
  } else {
    itemDetailsText = `💎 Linh Thạch: **${formatNumber(linhThach)}**`;
  }

  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle('🤝 GIAO DỊCH TIÊN NHÂN 🤝')
    .setDescription(
      `**${player.name}** đề xuất giao dịch với **${target.name}**!\n\n` +
      `🎁 **Lễ Vật Giao Dịch:**\n` +
      `${itemDetailsText}\n\n` +
      `*⚠️ Chỉ đạo hữu **${target.name}** mới có quyền bấm xác nhận giao dịch này.*`
    )
    .setFooter({ text: `Yêu cầu giao dịch #${tradeId}` })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`trade:accept_trade:${tradeId}`)
      .setLabel('🤝 Đồng Ý Giao Dịch')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`trade:reject_trade:${tradeId}`)
      .setLabel('❌ Từ Chối')
      .setStyle(ButtonStyle.Danger)
  );

  // Gửi lệnh giao dịch công khai lên kênh
  // Nếu interaction đã được replied (ví dụ từ modal submit), ta phải sử dụng followUp/reply
  // Hãy reply công khai và fetchReply để lấy thông tin message
  let msg;
  if (interaction.replied || interaction.deferred) {
    msg = await interaction.followUp({ embeds: [embed], components: [row], fetchReply: true });
  } else {
    msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });
  }

  if (msg) {
    try {
      db.prepare('UPDATE player_trades SET channel_id = ?, message_id = ? WHERE id = ?')
        .run(msg.channelId || msg.channel.id, msg.id, tradeId);
    } catch (err) {
      const logger = require('../utils/logger');
      logger.error('Lỗi lưu tin nhắn giao dịch vào DB:', err.message);
    }
  }
}

/**
 * Thực thi khi đối tác Đồng ý giao dịch
 */
async function executeAcceptTrade(interaction, player, tradeId) {
  const tId = parseInt(tradeId);
  const trade = stmtGetTrade.get(tId);

  if (!trade) {
    return interaction.reply({ content: 'Giao dịch này không còn tồn tại.', ephemeral: true });
  }

  if (trade.status !== 'pending') {
    return interaction.reply({ content: 'Giao dịch này đã được hoàn tất hoặc hủy trước đó.', ephemeral: true });
  }

  // Lấy thông tin hai bên
  const sender = db.prepare('SELECT * FROM players WHERE id = ?').get(trade.sender_id);
  const receiver = db.prepare('SELECT * FROM players WHERE id = ?').get(trade.receiver_id);

  if (!sender || !receiver) {
    return interaction.reply({ content: 'Không tìm thấy thông tin nhân vật liên quan.', ephemeral: true });
  }

  // KIỂM TRA ĐÚNG NGƯỜI NHẬN NHẤN NÚT
  if (player.discord_id !== receiver.discord_id) {
    return interaction.reply({ content: `Đạo hữu không phải là đối tượng giao dịch của yêu cầu này. Chỉ **${receiver.name}** mới có thể đồng ý.`, ephemeral: true });
  }

  // KIỂM TRA SENDER CÓ ĐỦ ĐỒ/Linh Thạch KHÔNG
  if (trade.offer_linh_thach > 0 && sender.linh_thach < trade.offer_linh_thach) {
    stmtUpdateTradeStatus.run('rejected', tId);
    return interaction.reply({ content: `Người đề xuất (${sender.name}) hiện tại không còn đủ Linh Thạch để thực hiện giao dịch này. Hủy bỏ.`, ephemeral: true });
  }

  if (trade.offer_item_id) {
    const invQty = stmtGetInvItem.get(sender.id, trade.offer_item_id);
    if (!invQty || invQty.quantity < trade.offer_item_qty) {
      stmtUpdateTradeStatus.run('rejected', tId);
      return interaction.reply({ content: `Người đề xuất (${sender.name}) không còn đủ vật phẩm trong kho đồ để hoàn thành giao dịch. Hủy bỏ.`, ephemeral: true });
    }
  }

  // TIẾN HÀNH GIAO DỊCH
  const tradeTx = db.transaction(() => {
    // 1. Chuyển Linh Thạch
    if (trade.offer_linh_thach > 0) {
      stmtSpendLinhThach.run(trade.offer_linh_thach, sender.id, trade.offer_linh_thach);
      stmtAddLinhThach.run(trade.offer_linh_thach, receiver.id);
    }

    // 2. Chuyển Vật Phẩm
    if (trade.offer_item_id) {
      stmtReduceInvItem.run(trade.offer_item_qty, sender.id, trade.offer_item_id);
      stmtDeleteInvItem.run(sender.id, trade.offer_item_id);

      const existing = stmtGetInvItem.get(receiver.id, trade.offer_item_id);
      if (existing) {
        stmtUpdateInvItem.run(trade.offer_item_qty, receiver.id, trade.offer_item_id);
      } else {
        stmtAddInvItem.run(receiver.id, trade.offer_item_id, trade.offer_item_qty);
      }
    }

    // 3. Cập nhật status
    stmtUpdateTradeStatus.run('accepted', tId);
  });

  try {
    tradeTx();
  } catch (err) {
    return interaction.reply({ content: `Giao dịch lỗi: ${err.message}`, ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle('🤝 GIAO DỊCH HOÀN TẤT 🤝')
    .setDescription(
      `Chúc mừng! Yêu cầu giao dịch của **${sender.name}** và **${receiver.name}** đã thực hiện thành công.\n\n` +
      `🎉 Vật phẩm/Linh Thạch đề xuất đã được chuyển giao hoàn toàn!`
    )
    .setFooter({ text: `Giao dịch #${tId} thành công` })
    .setTimestamp();

  // Cập nhật lại tin nhắn công khai, disable hết các nút bấm
  const disabledRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('dummy_accept').setLabel('Đồng Ý (Thành Công)').setStyle(ButtonStyle.Success).setDisabled(true),
    new ButtonBuilder().setCustomId('dummy_reject').setLabel('Từ Chối').setStyle(ButtonStyle.Danger).setDisabled(true)
  );

  await interaction.update({ embeds: [embed], components: [disabledRow] });
}

/**
 * Từ chối giao dịch
 */
async function executeRejectTrade(interaction, player, tradeId) {
  const tId = parseInt(tradeId);
  const trade = stmtGetTrade.get(tId);

  if (!trade) {
    return interaction.reply({ content: 'Giao dịch không tồn tại.', ephemeral: true });
  }

  if (trade.status !== 'pending') {
    return interaction.reply({ content: 'Giao dịch đã kết thúc trước đó.', ephemeral: true });
  }

  const sender = db.prepare('SELECT * FROM players WHERE id = ?').get(trade.sender_id);
  const receiver = db.prepare('SELECT * FROM players WHERE id = ?').get(trade.receiver_id);

  // Chỉ người gửi hoặc người nhận mới có quyền hủy
  if (player.id !== sender.id && player.id !== receiver.id) {
    return interaction.reply({ content: 'Chỉ các tu sĩ trong cuộc giao dịch này mới có quyền hủy bỏ.', ephemeral: true });
  }

  // Đóng giao dịch
  stmtUpdateTradeStatus.run('rejected', tId);

  const embed = new EmbedBuilder()
    .setColor(COLORS.ERROR)
    .setTitle('❌ GIAO DỊCH BỊ HỦY BỎ ❌')
    .setDescription(`Yêu cầu giao dịch giữa **${sender.name}** và **${receiver.name}** đã bị hủy bỏ bởi **${player.name}**.`)
    .setFooter({ text: `Giao dịch #${tId} đã đóng` })
    .setTimestamp();

  const disabledRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('dummy_accept').setLabel('Đồng Ý').setStyle(ButtonStyle.Success).setDisabled(true),
    new ButtonBuilder().setCustomId('dummy_reject').setLabel('Từ Chối (Đã Hủy)').setStyle(ButtonStyle.Danger).setDisabled(true)
  );

  await interaction.update({ embeds: [embed], components: [disabledRow] });
}

module.exports = {
  showPlayerTradeList,
  handleSelectTradePartner,
  handleTradeOfferLinhThach,
  executeTradeOfferLinhThachSubmit,
  handleTradeOfferItemMenu,
  executeTradeOfferItemSelect,
  sendTradeRequest,
  executeAcceptTrade,
  executeRejectTrade
};
