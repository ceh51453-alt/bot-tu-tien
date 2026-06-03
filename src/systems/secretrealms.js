/**
 * @file Secret Realms (Bí Cảnh) System
 * @description Hệ thống đi Ải Bí Cảnh vượt ải nhiều wave quái, nhận thưởng hấp dẫn, rủi ro cao (Permadeath)
 */

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require('discord.js');
const db = require('../database/connection');
const monstersConfig = require('../../config/monsters');
const itemsConfig = require('../../config/items');
const equipConfig = require('../../config/equipment');
const { COLORS } = require('../utils/constants');
const { formatNumber } = require('../utils/helpers');
const { createPvECombat } = require('./combat');

// Prepared Statements
const stmtUpdateHp = db.prepare('UPDATE players SET hp = ? WHERE id = ?');
const stmtKillPlayer = db.prepare('UPDATE players SET is_dead = 1, hp = 0 WHERE id = ?');
const stmtAddRewards = db.prepare('UPDATE players SET exp = exp + ?, linh_thach = linh_thach + ? WHERE id = ?');
const stmtGetInvItem = db.prepare('SELECT quantity FROM inventory WHERE player_id = ? AND item_id = ?');
const stmtReduceInvItem = db.prepare('UPDATE inventory SET quantity = quantity - 1 WHERE player_id = ? AND item_id = ?');
const stmtDeleteInvItem = db.prepare('DELETE FROM inventory WHERE player_id = ? AND item_id = ? AND quantity <= 0');
const stmtInsertInvItem = db.prepare('INSERT INTO inventory (player_id, item_id, quantity) VALUES (?, ?, 1)');
const stmtAddInvItem = db.prepare('UPDATE inventory SET quantity = quantity + 1 WHERE player_id = ? AND item_id = ?');
const stmtSpendLinhThach = db.prepare('UPDATE players SET linh_thach = linh_thach - ? WHERE id = ? AND linh_thach >= ?');

// Danh sách Bí Cảnh cấu hình tĩnh
const SECRET_REALMS = [
  {
    id: 'hac_phong_son',
    name: 'Hắc Phong Sơn',
    emoji: '⛰️',
    min_realm: 1, // Luyện Khí
    cost: { type: 'linh_thach', amount: 100 },
    description: 'Bí cảnh gió đen gào rú, thích hợp tu sĩ Luyện Khí kỳ rèn luyện.',
    waves: ['linh_tho', 'hoa_miêu', 'thanh_lang'],
    rewards: {
      exp: 150,
      linh_thach: 100,
      drops: [
        { id: 'thu_dan', chance: 1.0 },
        { id: 'linh_thao', chance: 0.6 },
        { id: 'sat_kiem', chance: 0.15 },
      ]
    }
  },
  {
    id: 'hoa_diem_son',
    name: 'Hỏa Diệm Sơn',
    emoji: '🌋',
    min_realm: 2, // Trúc Cơ
    cost: { type: 'item', amount: 1, item_id: 'truyen_tong_phu', cost_name: 'Truyền Tống Phù' },
    description: 'Bí cảnh lửa đỏ rực rỡ, thích hợp tu sĩ Trúc Cơ kỳ thử thách.',
    waves: ['hoa_miêu', 'doc_xà', 'thach_hùng'],
    rewards: {
      exp: 600,
      linh_thach: 400,
      drops: [
        { id: 'hoa_tinh_thach', chance: 1.0 },
        { id: 'linh_giap', chance: 0.1 },
        { id: 'phong_linh_nhan', chance: 0.1 },
      ]
    }
  },
  {
    id: 'tuyet_son_van_nam',
    name: 'Tuyết Sơn Vạn Năm',
    emoji: '❄️',
    min_realm: 3, // Kim Đan
    cost: { type: 'item', amount: 1, item_id: 'truyen_tong_phu', cost_name: 'Truyền Tống Phù' },
    description: 'Núi tuyết đóng băng ngàn năm, lạnh thấu xương tủy.',
    waves: ['bang_xa', 'bang_ho', 'bang_giao_long'], // Boss ở cuối
    rewards: {
      exp: 2000,
      linh_thach: 1000,
      drops: [
        { id: 'bang_tinh', chance: 1.0 },
        { id: 'huyet_kiem', chance: 0.08 },
        { id: 'huyet_ngoc_truyen', chance: 0.08 },
      ]
    }
  },
  {
    id: 'thuong_co_phe_tich',
    name: 'Thượng Cổ Phế Tích',
    emoji: '🏰',
    min_realm: 4, // Nguyên Anh
    cost: { type: 'item', amount: 1, item_id: 'truyen_tong_phu', cost_name: 'Truyền Tống Phù' },
    description: 'Phế tích hoang tàn chứa đầy cạm bẫy từ thời viễn cổ.',
    waves: ['huyet_lang', 'loi_dieu', 'thuong_co_tao_thien_khuynh'], // Wave 3 boss
    rewards: {
      exp: 8000,
      linh_thach: 3000,
      drops: [
        { id: 'thien_menh_ngoc', chance: 0.05 },
        { id: 'thien_loi_chuy', chance: 0.03 },
        { id: 'thanh_dan', chance: 0.3 },
      ]
    }
  }
];

/**
 * Hiển thị danh sách Bí Cảnh để chọn
 */
async function showSecretRealmsMenu(interaction, player) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.WORLD || COLORS.SUCCESS)
    .setTitle('🗺️ Khám Phá Bí Cảnh')
    .setDescription(
      `Bí cảnh là những không gian phong ấn chứa đầy rủi ro nhưng cũng đầy cơ duyên.\n` +
      `⚠️ **CẢNH BÁO**: Đây là khu vực **Vô Cùng Nguy Hiểm**, nếu đạo hữu **Tử Vong** trong Bí cảnh, nhân vật sẽ bị **XÓA VĨNH VIỄN** (Permadeath).\n\n` +
      `Hãy chọn bí cảnh để tiến vào khi đã chuẩn bị kỹ càng:`
    )
    .setTimestamp();

  const options = SECRET_REALMS.map(sr => {
    const realms = require('../../config/realms');
    const realmCfg = realms.list[sr.min_realm];
    const realmName = realmCfg ? realmCfg.name : `Bậc ${sr.min_realm}`;
    const costText = sr.cost.type === 'linh_thach' 
      ? `💎 ${sr.cost.amount} Linh Thạch` 
      : `🎟️ 1 ${sr.cost.cost_name}`;

    return {
      label: sr.name,
      description: `Yêu cầu: ${realmName} — Phí: ${costText}`,
      value: sr.id,
      emoji: sr.emoji,
    };
  });

  const selectRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('select:enter_realm')
      .setPlaceholder('Chọn Bí Cảnh để tiến vào...')
      .addOptions(options)
  );

  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('world:menu').setLabel('🔙 Thế Giới').setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [selectRow, backRow] });
}

/**
 * Bắt đầu đi bí cảnh
 */
async function startSecretRealm(interaction, player, realmId) {
  const sr = SECRET_REALMS.find(r => r.id === realmId);
  if (!sr) return interaction.reply({ content: 'Bí cảnh không tồn tại.', ephemeral: true });

  // Kiểm tra cảnh giới
  if (player.realm_index < sr.min_realm) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setTitle('❌ Cảnh Giới Chưa Đủ')
      .setDescription(`Bí cảnh **${sr.name}** yêu cầu tu sĩ đạt cảnh giới tối thiểu **${sr.min_realm}**.`);
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // Kiểm tra chi phí
  if (sr.cost.type === 'linh_thach') {
    if (player.linh_thach < sr.cost.amount) {
      return interaction.reply({ content: `Bạn không đủ Linh Thạch để tiến vào (Cần ${sr.cost.amount} Linh Thạch).`, ephemeral: true });
    }
  } else if (sr.cost.type === 'item') {
    const invItem = stmtGetInvItem.get(player.id, sr.cost.item_id);
    if (!invItem || invItem.quantity < sr.cost.amount) {
      return interaction.reply({ content: `Bạn không có **${sr.cost.cost_name}** làm lệnh bài tiến vào.`, ephemeral: true });
    }
  }

  // Thu phí
  const payTx = db.transaction(() => {
    if (sr.cost.type === 'linh_thach') {
      stmtSpendLinhThach.run(sr.cost.amount, player.id, sr.cost.amount);
    } else {
      stmtReduceInvItem.run(player.id, sr.cost.item_id);
      stmtDeleteInvItem.run(player.id, sr.cost.item_id);
    }
  });

  try {
    payTx();
  } catch (err) {
    return interaction.reply({ content: `Gặp lỗi khi thanh toán phí vào cửa: ${err.message}`, ephemeral: true });
  }

  // Lấy lại dữ liệu người chơi mới để đảm bảo HP chính xác
  let currentPlayer = db.prepare('SELECT * FROM players WHERE id = ?').get(player.id);
  
  if (currentPlayer.hp <= 0) {
    return interaction.reply({ content: 'Nhân vật đã tử vong, không thể đi bí cảnh.', ephemeral: true });
  }

  // Bắt đầu mô phỏng đi ải wave-by-wave
  let currentHp = currentPlayer.hp;
  const logs = [];
  let currentWave = 0;
  let wonAll = true;

  logs.push(`🚀 **Bắt đầu tiến vào Bí cảnh: ${sr.name}**`);

  for (const monsterId of sr.waves) {
    currentWave++;
    logs.push(`\n⚔️ **ẢI ${currentWave}/${sr.waves.length}** ⚔️`);

    // Lấy config quái vật
    const monster = monstersConfig.list.find(m => m.id === monsterId);
    if (!monster) {
      logs.push(`❌ Gặp lỗi: Không tìm thấy dữ liệu quái vật ${monsterId}.`);
      wonAll = false;
      break;
    }

    logs.push(`👹 Đột kích bởi: **${monster.name}** (${monster.emoji})`);

    // Chạy combat wave
    const wavePlayer = { ...currentPlayer, hp: currentHp };
    let combatResult;
    try {
      combatResult = createPvECombat(wavePlayer, monster);
    } catch (_err) {
      // Fallback
      combatResult = { winner: 'player', playerHpRemaining: currentHp - 20 };
    }

    currentHp = Math.max(0, combatResult.playerHpRemaining);
    const won = combatResult.winner === 'player';

    if (!won) {
      wonAll = false;
      logs.push(`💀 **Thất bại ở Ải ${currentWave}!** **${player.name}** bị tiêu diệt bởi **${monster.name}**.`);
      break;
    } else {
      logs.push(`✅ Vượt ải thành công! HP còn lại: **${currentHp}/${player.max_hp}**`);
    }
  }

  // Cập nhật HP
  stmtUpdateHp.run(currentHp, player.id);

  if (!wonAll) {
    // Permadeath
    stmtKillPlayer.run(player.id);

    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setTitle(`💀 THÂN TỬ ĐẠO TIÊU TẠI BÍ CẢNH — ${sr.name}`)
      .setDescription(
        `Đạo hữu đã ngã xuống giữa chừng tại bí cảnh nguy hiểm **${sr.name}**.\n\n` +
        `📝 **Nhật ký thám hiểm:**\n` +
        logs.join('\n') +
        `\n\n💀 **PERMADEATH** — Nhân vật đã mất vĩnh viễn.\n` +
        `_Hãy dùng /tutien để bắt đầu hành trình tu sĩ mới._`
      )
      .setTimestamp();

    return interaction.update({ embeds: [embed], components: [] });
  }

  // THẮNG TOÀN BỘ WAVES -> PHÁT THƯỞNG
  const expReward = sr.rewards.exp;
  const linhThachReward = sr.rewards.linh_thach;
  stmtAddRewards.run(expReward, linhThachReward, player.id);

  // Xử lý rơi đồ
  const droppedNames = [];
  if (sr.rewards.drops) {
    for (const drop of sr.rewards.drops) {
      if (Math.random() < drop.chance) {
        const existing = stmtGetInvItem.get(player.id, drop.id);
        if (existing) {
          stmtAddInvItem.run(player.id, drop.id);
        } else {
          stmtInsertInvItem.run(player.id, drop.id);
        }

        const itemCfg = itemsConfig.getItemById(drop.id) || equipConfig.getEquipmentById(drop.id) || equipConfig.getById(drop.id);
        const name = itemCfg ? itemCfg.name : drop.id;
        droppedNames.push(`🎁 **${name}**`);
      }
    }
  }

  // Cập nhật quest giết quái (nếu quái trong bí cảnh có trong nhiệm vụ)
  try {
    const { updateQuestProgress } = require('./quests');
    for (const monsterId of sr.waves) {
      updateQuestProgress(player.id, 'hunt', monsterId, 1);
    }
  } catch (_err) { /* ignore */ }

  const dropText = droppedNames.length > 0 
    ? droppedNames.join('\n') 
    : '_Không nhận được cổ bảo nào_';

  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle(`🏆 CHIẾN THẮNG BÍ CẢNH: ${sr.name} 🏆`)
    .setDescription(
      `Chúc mừng đạo hữu đã vượt qua toàn bộ **${sr.waves.length}** ải thử thách trong **${sr.name}**!\n\n` +
      `📝 **Nhật ký thám hiểm:**\n` +
      logs.join('\n') +
      `\n\n💎 **Kho báu thu hoạch:**\n` +
      `✨ EXP: **+${formatNumber(expReward)}**\n` +
      `💎 Linh Thạch: **+${formatNumber(linhThachReward)}**\n` +
      `❤️ HP hiện tại: **${currentHp}/${player.max_hp}**\n\n` +
      `📦 **Vật phẩm rơi:**\n` +
      dropText
    )
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('world:secretrealm').setLabel('🗺️ Bí Cảnh Khác').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

module.exports = {
  showSecretRealmsMenu,
  startSecretRealm,
};
