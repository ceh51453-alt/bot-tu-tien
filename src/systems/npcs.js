/**
 * @file NPC Interaction System
 * @description Hệ thống tương tác NPC — nói chuyện, tặng quà (tăng hảo cảm), tiệm shop của NPC
 */

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require('discord.js');
const db = require('../database/connection');
const npcsConfig = require('../../config/npcs');
const itemsConfig = require('../../config/items');
const equipConfig = require('../../config/equipment');
const { COLORS } = require('../utils/constants');
const { formatNumber } = require('../utils/helpers');

// Prepared Statements
const stmtGetAffinity = db.prepare('SELECT affinity FROM npc_affinity WHERE player_id = ? AND npc_id = ?');
const stmtInsertAffinity = db.prepare(`
  INSERT OR REPLACE INTO npc_affinity (player_id, npc_id, affinity) 
  VALUES (?, ?, COALESCE((SELECT affinity FROM npc_affinity WHERE player_id = ? AND npc_id = ?), 0) + ?)
`);
const stmtGetActiveQuest = db.prepare('SELECT * FROM player_quests WHERE player_id = ? AND quest_id = ?');
const stmtSpendLinhThach = db.prepare('UPDATE players SET linh_thach = linh_thach - ? WHERE id = ? AND linh_thach >= ?');
const stmtGetInventoryItem = db.prepare('SELECT quantity FROM inventory WHERE player_id = ? AND item_id = ?');
const stmtReduceInventoryItem = db.prepare('UPDATE inventory SET quantity = quantity - ? WHERE player_id = ? AND item_id = ?');
const stmtDeleteInventoryItem = db.prepare('DELETE FROM inventory WHERE player_id = ? AND item_id = ? AND quantity <= 0');
const stmtAddInventoryItem = db.prepare('INSERT INTO inventory (player_id, item_id, quantity) VALUES (?, ?, ?)');
const stmtUpdateInventoryItem = db.prepare('UPDATE inventory SET quantity = quantity + ? WHERE player_id = ? AND item_id = ?');

/**
 * Hiển thị danh sách NPC có mặt ở thế giới
 */
async function showWorldNpcs(interaction, player) {
  const allNpcs = npcsConfig.list;

  const embed = new EmbedBuilder()
    .setColor(COLORS.WORLD || COLORS.SUCCESS)
    .setTitle('🧑 Gặp Gỡ Tiên Nhân & Dị Nhân')
    .setDescription(
      `Thế giới tu tiên rộng lớn, các vị ẩn cư đại năng hoặc kỳ nhân dị sĩ phân bổ các nơi.\n` +
      `Đạo hữu muốn ghé thăm vị nào bên dưới?`
    )
    .setTimestamp();

  const options = allNpcs.map(npc => ({
    label: npc.name,
    description: `${npc.title} — ${npc.description.slice(0, 50)}`,
    value: npc.id,
    emoji: npc.emoji || '👤',
  }));

  const selectRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('select:talk_npc')
      .setPlaceholder('Chọn NPC để bái kiến...')
      .addOptions(options)
  );

  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('world:menu').setLabel('🔙 Thế Giới').setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [selectRow, backRow] });
}

/**
 * Hiển thị menu chi tiết đối thoại với NPC
 */
async function showNpcMenu(interaction, player, npcId) {
  const npc = npcsConfig.getNpcById(npcId);
  if (!npc) return interaction.reply({ content: 'NPC không tồn tại.', ephemeral: true });

  // Lấy độ hảo cảm
  const affRow = stmtGetAffinity.get(player.id, npcId);
  const affinity = affRow ? affRow.affinity : 0;

  // Lấy lời chào dựa trên hảo cảm
  let greeting = 'Xin chào.';
  const dlg = npc.dialogue;
  if (affinity >= 80 && dlg.affinity_high && dlg.affinity_high.length > 0) {
    greeting = dlg.affinity_high[Math.floor(Math.random() * dlg.affinity_high.length)];
  } else if (dlg.greeting && dlg.greeting.length > 0) {
    greeting = dlg.greeting[Math.floor(Math.random() * dlg.greeting.length)];
  }

  const embed = new EmbedBuilder()
    .setColor(COLORS.WORLD || COLORS.SUCCESS)
    .setTitle(`${npc.emoji || '👤'} ${npc.name}`)
    .setDescription(
      `*${npc.title}*\n` +
      `💖 Hảo cảm: **${affinity}**/${npc.max_affinity}\n\n` +
      `💬 **Lời chào**: "${greeting}"\n\n` +
      `_${npc.description}_`
    )
    .setTimestamp();

  // Tìm các quest khả dụng của NPC này
  const availableQuests = npc.quests.filter(q => {
    if (q.min_realm > player.realm_index) return false;
    if (q.dao_path_required && q.dao_path_required !== player.dao_path) return false;

    // Xem quest đã làm chưa
    const active = stmtGetActiveQuest.get(player.id, q.id);
    if (!active) return true; // Chưa bao giờ làm
    if (active.status === 'active') return false; // Đang làm dở
    if (q.repeatable) {
      if (q.daily_limit && active.completed_at) {
        const compDate = new Date(active.completed_at);
        const today = new Date();
        return compDate.toDateString() !== today.toDateString(); // Làm ngày khác thì ok
      }
      return true; // Lặp lại thoải mái
    }
    return false; // Đã làm và không lặp lại
  });

  // Tìm các quest đang active để nộp
  const activeQuests = npc.quests.filter(q => {
    const active = stmtGetActiveQuest.get(player.id, q.id);
    return active && active.status === 'active';
  });

  // Action Row 1: Hội thoại chính
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`npc:shop:${npcId}`).setLabel('🏪 Cửa Hàng').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`npc:gift_menu:${npcId}`).setLabel('🎁 Tặng Quà').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('world:npc').setLabel('🔙 NPC Khác').setStyle(ButtonStyle.Secondary)
  );

  // Action Row 2: Quest buttons (nếu có)
  const row2 = new ActionRowBuilder();
  
  if (availableQuests.length > 0) {
    row2.addComponents(
      new ButtonBuilder()
        .setCustomId(`npc:quest_accept_list:${npcId}`)
        .setLabel(`📜 Nhận Nhiệm Vụ (${availableQuests.length})`)
        .setStyle(ButtonStyle.Primary)
    );
  }

  if (activeQuests.length > 0) {
    row2.addComponents(
      new ButtonBuilder()
        .setCustomId(`npc:quest_complete_list:${npcId}`)
        .setLabel(`🎉 Trả Nhiệm Vụ (${activeQuests.length})`)
        .setStyle(ButtonStyle.Success)
    );
  }

  const components = [row1];
  if (row2.components.length > 0) {
    components.push(row2);
  }

  await interaction.update({ embeds: [embed], components: components });
}

/**
 * Hiển thị danh sách quest để nhận
 */
async function showNpcQuestsToAccept(interaction, player, npcId) {
  const npc = npcsConfig.getNpcById(npcId);
  if (!npc) return interaction.reply({ content: 'NPC không tồn tại.', ephemeral: true });

  const availableQuests = npc.quests.filter(q => {
    if (q.min_realm > player.realm_index) return false;
    if (q.dao_path_required && q.dao_path_required !== player.dao_path) return false;

    const active = stmtGetActiveQuest.get(player.id, q.id);
    if (!active) return true;
    if (active.status === 'active') return false;
    if (q.repeatable) {
      if (q.daily_limit && active.completed_at) {
        const compDate = new Date(active.completed_at);
        const today = new Date();
        return compDate.toDateString() !== today.toDateString();
      }
      return true;
    }
    return false;
  });

  if (availableQuests.length === 0) {
    return interaction.reply({ content: 'Không còn nhiệm vụ nào khả dụng từ NPC này.', ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setColor(COLORS.SECT)
    .setTitle(`📜 Nhiệm Vụ Khả Dụng từ ${npc.name}`)
    .setDescription('Chọn nhiệm vụ đạo hữu muốn nhận:')
    .setTimestamp();

  const options = availableQuests.map(q => ({
    label: q.name,
    description: q.description.slice(0, 50),
    value: q.id,
    emoji: '📜',
  }));

  const selectRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`select:accept_quest:${npcId}`)
      .setPlaceholder('Chọn nhiệm vụ...')
      .addOptions(options)
  );

  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`npc:talk:${npcId}`).setLabel('🔙 Quay Lại').setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [selectRow, backRow] });
}

/**
 * Hiển thị danh sách quest đang làm để trả
 */
async function showNpcQuestsToComplete(interaction, player, npcId) {
  const npc = npcsConfig.getNpcById(npcId);
  if (!npc) return interaction.reply({ content: 'NPC không tồn tại.', ephemeral: true });

  const activeQuests = npc.quests.filter(q => {
    const active = stmtGetActiveQuest.get(player.id, q.id);
    return active && active.status === 'active';
  });

  if (activeQuests.length === 0) {
    return interaction.reply({ content: 'Không có nhiệm vụ nào của NPC này đang dở.', ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setColor(COLORS.SECT)
    .setTitle(`🎉 Trả Nhiệm Vụ cho ${npc.name}`)
    .setDescription('Chọn nhiệm vụ đạo hữu đã hoàn thành và muốn trả:')
    .setTimestamp();

  const questsHelper = require('./quests');

  const options = activeQuests.map(q => {
    const active = stmtGetActiveQuest.get(player.id, q.id);
    const progress = active ? active.progress : 0;
    const reqText = questsHelper.getQuestRequirementText(q);
    const progressText = q.type === 'hunt' ? ` (${progress}/${q.requirements.kill.count})` : '';

    return {
      label: q.name,
      description: `${reqText}${progressText}`,
      value: q.id,
      emoji: '🎉',
    };
  });

  const selectRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`select:complete_quest:${npcId}`)
      .setPlaceholder('Chọn nhiệm vụ nộp...')
      .addOptions(options)
  );

  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`npc:talk:${npcId}`).setLabel('🔙 Quay Lại').setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [selectRow, backRow] });
}

/**
 * Giao diện cửa hàng của NPC
 */
async function handleNpcShop(interaction, player, npcId) {
  const npc = npcsConfig.getNpcById(npcId);
  if (!npc) return interaction.reply({ content: 'NPC không tồn tại.', ephemeral: true });

  const items = npc.shop_items;

  let description = `💎 Linh Thạch hiện có: **${formatNumber(player.linh_thach)}**\n\n`;

  if (items.length === 0) {
    description += '_Cửa hàng hiện trống rỗng._';
  } else {
    items.forEach((shopItem, idx) => {
      // Look up item configuration
      let itemCfg;
      if (shopItem.type === 'technique') {
        itemCfg = require('../../config/techniques').list.find(t => t.id === shopItem.item_id);
      } else if (shopItem.type === 'equipment') {
        itemCfg = equipConfig.getEquipmentById(shopItem.item_id) || equipConfig.getById(shopItem.item_id);
      } else {
        itemCfg = itemsConfig.getItemById(shopItem.item_id);
      }

      const name = itemCfg ? itemCfg.name : shopItem.item_id;
      const emoji = itemCfg ? itemCfg.emoji : '📦';
      const priceText = shopItem.price === 0 ? 'Miễn Phí' : `💎 ${formatNumber(shopItem.price)}`;
      const note = shopItem.note ? ` (${shopItem.note})` : '';

      description += `**${idx + 1}.** ${emoji} **${name}** — ${priceText}${note}\n`;
      if (itemCfg && itemCfg.description) {
        description += `  _${itemCfg.description}_\n\n`;
      }
    });
  }

  const embed = new EmbedBuilder()
    .setColor(COLORS.GOLD || 0xffd700)
    .setTitle(`🏪 Cửa Hàng — ${npc.name}`)
    .setDescription(description)
    .setTimestamp();

  // Create select menu to buy
  const components = [];
  if (items.length > 0) {
    const selectOptions = items.slice(0, 25).map(shopItem => {
      let itemCfg;
      if (shopItem.type === 'technique') {
        itemCfg = require('../../config/techniques').list.find(t => t.id === shopItem.item_id);
      } else if (shopItem.type === 'equipment') {
        itemCfg = equipConfig.getEquipmentById(shopItem.item_id) || equipConfig.getById(shopItem.item_id);
      } else {
        itemCfg = itemsConfig.getItemById(shopItem.item_id);
      }

      const name = itemCfg ? itemCfg.name : shopItem.item_id;
      const emoji = itemCfg ? itemCfg.emoji : '📦';

      return {
        label: name,
        description: `Giá: ${shopItem.price} Linh Thạch — Type: ${shopItem.type}`,
        value: `${shopItem.item_id}:${shopItem.type}`,
        emoji: emoji,
      };
    });

    const selectRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`select:npc_buy:${npcId}`)
        .setPlaceholder('Chọn vật phẩm muốn mua...')
        .addOptions(selectOptions)
    );
    components.push(selectRow);
  }

  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`npc:talk:${npcId}`).setLabel('🔙 Trở lại NPC').setStyle(ButtonStyle.Secondary)
  );
  components.push(backRow);

  await interaction.update({ embeds: [embed], components: components });
}

/**
 * Thực thi mua hàng
 */
async function executeNpcBuy(interaction, player, npcId, valueStr) {
  const npc = npcsConfig.getNpcById(npcId);
  if (!npc) return interaction.reply({ content: 'NPC không tồn tại.', ephemeral: true });

  const [itemId, type] = valueStr.split(':');
  const shopItem = npc.shop_items.find(i => i.item_id === itemId && i.type === type);

  if (!shopItem) {
    return interaction.reply({ content: 'Vật phẩm không có trong cửa hàng này.', ephemeral: true });
  }

  if (player.linh_thach < shopItem.price) {
    return interaction.reply({ content: 'Bạn không đủ Linh Thạch.', ephemeral: true });
  }

  // Check unique constraints (ví dụ: công pháp chỉ mua 1 lần)
  if (type === 'technique') {
    // Check if player has this technique or technique id is same
    // Techniques are usually switched and recorded directly or in config.
    // For simplicity, let's treat technique books as normal learnable items if they are items,
    // but if it is directly a path: check if player already has it
    if (player.technique_id === itemId) {
      return interaction.reply({ content: 'Đạo hữu đang học công pháp này rồi.', ephemeral: true });
    }
  }

  // Transaction
  const buyTx = db.transaction(() => {
    if (shopItem.price > 0) {
      stmtSpendLinhThach.run(shopItem.price, player.id, shopItem.price);
    }

    // Add to inventory
    // (Note: techniques might be special items, we just add their id to inventory as a skill book or custom item)
    const existing = stmtGetInventoryItem.get(player.id, itemId);
    if (existing) {
      stmtUpdateInventoryItem.run(1, player.id, itemId);
    } else {
      stmtAddInventoryItem.run(player.id, itemId, 1);
    }
  });

  try {
    buyTx();
  } catch (err) {
    return interaction.reply({ content: `Mua thất bại: ${err.message}`, ephemeral: true });
  }

  let itemCfg;
  if (type === 'technique') {
    itemCfg = require('../../config/techniques').list.find(t => t.id === itemId);
  } else if (type === 'equipment') {
    itemCfg = equipConfig.getEquipmentById(itemId) || equipConfig.getById(itemId);
  } else {
    itemCfg = itemsConfig.getItemById(itemId);
  }

  const name = itemCfg ? itemCfg.name : itemId;
  const emoji = itemCfg ? itemCfg.emoji : '📦';

  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle('🛒 Mua Thành Công!')
    .setDescription(
      `Đạo hữu đã mua ${emoji} **${name}** từ cửa hàng của **${npc.name}**.\n\n` +
      `💎 Tiêu hao: **-${formatNumber(shopItem.price)}** Linh Thạch`
    )
    .setTimestamp();

  // Go back to shop menu
  const updatedPlayer = db.prepare('SELECT * FROM players WHERE id = ?').get(player.id);
  
  // Custom update with result embed
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`npc:shop:${npcId}`).setLabel('🔙 Quay Lại Cửa Hàng').setStyle(ButtonStyle.Primary)
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

/**
 * Hiển thị danh sách vật phẩm trong túi đồ để tặng NPC
 */
async function handleNpcGiftMenu(interaction, player, npcId) {
  const npc = npcsConfig.getNpcById(npcId);
  if (!npc) return interaction.reply({ content: 'NPC không tồn tại.', ephemeral: true });

  const allInventory = db.prepare('SELECT * FROM inventory WHERE player_id = ? AND quantity > 0').all(player.id);

  // Chỉ cho tặng các vật phẩm thuộc loại 'material' hoặc 'pill'
  const giftables = allInventory.map(item => {
    const cfg = itemsConfig.list.find(i => i.id === item.item_id);
    return cfg && (cfg.type === 'material' || cfg.type === 'pill') ? { ...cfg, quantity: item.quantity } : null;
  }).filter(Boolean);

  if (giftables.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.WARNING)
      .setTitle('🎁 Tặng Quà cho NPC')
      .setDescription('Đạo hữu không có nguyên liệu hoặc đan dược nào trong túi đồ để tặng.');
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`npc:talk:${npcId}`).setLabel('🔙 Trở Lại').setStyle(ButtonStyle.Secondary)
    );
    return interaction.update({ embeds: [embed], components: [row] });
  }

  const embed = new EmbedBuilder()
    .setColor(COLORS.SECT)
    .setTitle(`🎁 Tặng Quà cho ${npc.name}`)
    .setDescription(
      `Tặng vật phẩm giúp tăng điểm Hảo cảm với NPC.\n` +
      `Điểm Hảo cảm cao mở khóa đối thoại hiếm, giảm giá mua hàng và nhiệm vụ đặc biệt.\n\n` +
      `_Chọn vật phẩm trong túi đồ muốn tặng:_`
    )
    .setTimestamp();

  const options = giftables.slice(0, 25).map(item => {
    const gradeLabel = { pham: 'Phàm', linh: 'Linh', bao: 'Bảo', thanh: 'Thánh', tien: 'Tiên', than: 'Thần' }[item.grade] || item.grade;
    return {
      label: `${item.name} (×${item.quantity})`,
      description: `${gradeLabel} Phẩm — ${item.description.slice(0, 50)}`,
      value: item.id,
      emoji: item.emoji || '🌿',
    };
  });

  const selectRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`select:npc_gift:${npcId}`)
      .setPlaceholder('Chọn vật phẩm dâng tặng...')
      .addOptions(options)
  );

  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`npc:talk:${npcId}`).setLabel('🔙 Trở lại NPC').setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [selectRow, backRow] });
}

/**
 * Thực thi tặng quà
 */
async function executeNpcGift(interaction, player, npcId, itemId) {
  const npc = npcsConfig.getNpcById(npcId);
  if (!npc) return interaction.reply({ content: 'NPC không tồn tại.', ephemeral: true });

  const invItem = stmtGetInventoryItem.get(player.id, itemId);
  if (!invItem || invItem.quantity <= 0) {
    return interaction.reply({ content: 'Bạn không có vật phẩm này.', ephemeral: true });
  }

  const itemCfg = itemsConfig.getItemById(itemId);
  if (!itemCfg) return interaction.reply({ content: 'Vật phẩm không hợp lệ.', ephemeral: true });

  // Tính hảo cảm dựa trên phẩm chất
  // pham: +2, linh: +4, bao: +8, thanh: +15, tien: +30, than: +50
  const giftAffinity = {
    pham: 2,
    linh: 4,
    bao: 8,
    thanh: 15,
    tien: 30,
    than: 50,
  }[itemCfg.grade] || 2;

  // Thực hiện giao dịch
  const giftTx = db.transaction(() => {
    // Trừ 1 vật phẩm
    stmtReduceInventoryItem.run(1, player.id, itemId);
    stmtDeleteInventoryItem.run(player.id, itemId);

    // Cộng hảo cảm
    stmtInsertAffinity.run(player.id, npcId, player.id, npcId, giftAffinity);
  });

  giftTx();

  const affRow = stmtGetAffinity.get(player.id, npcId);
  const totalAffinity = affRow ? affRow.affinity : 0;

  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle('🎁 Tặng Quà Thành Công!')
    .setDescription(
      `Đạo hữu đã tặng **1** ${itemCfg.emoji} **${itemCfg.name}** cho **${npc.name}**.\n\n` +
      `📈 Hảo Cảm tăng thêm: **+${giftAffinity}**\n` +
      `💖 Hảo Cảm hiện tại: **${totalAffinity}**/${npc.max_affinity}\n\n` +
      `🧙 **${npc.name}**: _"Cảm ơn thịnh tình của đạo hữu, món quà này rất có ích cho ta."_`
    )
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`npc:talk:${npcId}`).setLabel('🔙 Trở lại NPC').setStyle(ButtonStyle.Primary)
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

module.exports = {
  showWorldNpcs,
  showNpcMenu,
  showNpcQuestsToAccept,
  showNpcQuestsToComplete,
  handleNpcShop,
  executeNpcBuy,
  handleNpcGiftMenu,
  executeNpcGift,
};
