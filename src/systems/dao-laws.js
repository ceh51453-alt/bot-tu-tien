const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require('discord.js');
const db = require('../database/connection');
const daoLawsConfig = require('../../config/dao-laws');
const spiritualRoots = require('../../config/spiritual-roots');
const realmsConfig = require('../../config/realms');
const { COLORS } = require('../utils/constants');
const { formatNumber } = require('../utils/helpers');

// ═══════════════════════════════════════════
// Giới hạn số đạo pháp tối đa
// ═══════════════════════════════════════════
const MAX_DAO_LAWS = 3;
const MAX_DAO_LAWS_HON_DON = 5;

/**
 * Kiểm tra người chơi có Hỗn Độn Linh Căn không
 * @param {Object} player
 * @returns {boolean}
 */
function isHonDonRoot(player) {
  return player.spiritual_root === 'hon_don' || player.root_type === 'hon_don';
}

/**
 * Lấy danh sách đạo pháp của người chơi
 * @param {number} playerId
 * @returns {Array<{law_id: string, level: number}>}
 */
function getPlayerLaws(playerId) {
  return db
    .prepare('SELECT law_id, level FROM player_dao_laws WHERE player_id = ?')
    .all(playerId);
}

/**
 * Lấy giới hạn đạo pháp theo linh căn
 * @param {Object} player
 * @returns {number}
 */
function getMaxLaws(player) {
  return isHonDonRoot(player) ? MAX_DAO_LAWS_HON_DON : MAX_DAO_LAWS;
}

/**
 * Hiển thị menu đạo pháp — liệt kê 8 đạo pháp cùng tiến độ
 * @param {import('discord.js').Interaction} interaction
 * @param {Object} player - Dữ liệu người chơi từ DB
 */
async function showDaoLawsMenu(interaction, player) {
  const realm = realmsConfig.getRealmByOrder(player.realm_index + 1);
  const realmOrder = realm ? realm.order : player.realm_index + 1;

  // Kiểm tra cảnh giới tối thiểu (Hóa Thần+, order >= 5)
  if (realmOrder < 5) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.error)
      .setTitle('🔒 Chưa Đủ Cảnh Giới')
      .setDescription(
        `Cần đạt **Hóa Thần** (cảnh giới thứ 5) trở lên mới có thể lĩnh ngộ Đạo Pháp.\n\n` +
        `Cảnh giới hiện tại: ${realm ? `${realm.emoji} ${realm.name}` : 'Không xác định'}`
      );
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  const playerLaws = getPlayerLaws(player.id);
  const maxLaws = getMaxLaws(player);
  const playerLawMap = new Map(playerLaws.map(l => [l.law_id, l.level]));

  // Lọc đạo pháp khả dụng theo đạo và cảnh giới
  const availableLaws = daoLawsConfig.getAvailableAt(realmOrder, player.dao_path);

  // Xây dựng mô tả embed
  let description = `${isHonDonRoot(player) ? '🌀 **Hỗn Độn Linh Căn** — Giới hạn: ' : '📜 Giới hạn: '}` +
    `**${playerLaws.length}/${maxLaws}** đạo pháp\n\n`;

  // Hiển thị tất cả 8 đạo pháp
  for (const law of daoLawsConfig.daoLaws) {
    const currentLevel = playerLawMap.get(law.id) || 0;
    const isAvailable = realmOrder >= law.min_realm;
    const isRestricted = law.dao_path_restriction && law.dao_path_restriction !== player.dao_path;
    const isLearned = currentLevel > 0;

    // Trạng thái
    let status = '';
    if (isRestricted) {
      status = '🚫 Chỉ Ma Đạo';
    } else if (!isAvailable) {
      const minRealm = realmsConfig.getRealmByOrder(law.min_realm);
      status = `🔒 Cần ${minRealm ? minRealm.name : `Cảnh giới ${law.min_realm}`}`;
    } else if (currentLevel >= law.max_level) {
      status = '✅ Viên Mãn';
    } else {
      const nextCost = daoLawsConfig.getExpForLevel(law.id, currentLevel);
      status = `Lv.${currentLevel}/${law.max_level} — Cần: ${formatNumber(nextCost)} EXP`;
    }

    // Bonus hiện tại
    let bonusText = '';
    if (currentLevel > 0) {
      const bonuses = daoLawsConfig.getBonusesAtLevel(law.id, currentLevel);
      bonusText = Object.entries(bonuses)
        .map(([key, val]) => `+${val} ${key}`)
        .join(', ');
      bonusText = ` ⟹ ${bonusText}`;
    }

    description += `${law.emoji} **${law.name}**${isLearned ? ` ★${currentLevel}` : ''}\n`;
    description += `  ${status}${bonusText}\n\n`;
  }

  const embed = new EmbedBuilder()
    .setColor(COLORS.CULTIVATION)
    .setTitle('☯️ Đạo Pháp Lĩnh Ngộ')
    .setDescription(description)
    .setFooter({ text: `EXP hiện tại: ${formatNumber(player.exp)}` });

  // Xây dựng select menu chỉ với đạo pháp có thể lĩnh ngộ
  const selectableLaws = availableLaws.filter(law => {
    const currentLevel = playerLawMap.get(law.id) || 0;
    // Không cho chọn nếu đã max level
    if (currentLevel >= law.max_level) return false;
    // Không cho chọn nếu dao_path bị hạn chế
    if (law.dao_path_restriction && law.dao_path_restriction !== player.dao_path) return false;
    return true;
  });

  const components = [];

  if (selectableLaws.length > 0) {
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select:dao_law')
      .setPlaceholder('Chọn đạo pháp muốn lĩnh ngộ...')
      .addOptions(
        selectableLaws.map(law => {
          const currentLevel = playerLawMap.get(law.id) || 0;
          const nextCost = daoLawsConfig.getExpForLevel(law.id, currentLevel);
          return {
            label: `${law.name} (Lv.${currentLevel}→${currentLevel + 1})`,
            description: `Cần ${formatNumber(nextCost)} EXP`,
            value: law.id,
            emoji: law.emoji,
          };
        })
      );

    components.push(new ActionRowBuilder().addComponents(selectMenu));
  }

  // Nút quay lại menu chính
  components.push(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('menu:cultivation')
        .setLabel('◀️ Quay Lại')
        .setStyle(ButtonStyle.Secondary)
    )
  );

  // Cập nhật hoặc reply tùy tình huống
  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({ embeds: [embed], components });
  } else {
    await interaction.reply({ embeds: [embed], components });
  }
}

/**
 * Xử lý khi người chơi chọn đạo pháp để lĩnh ngộ
 * @param {import('discord.js').Interaction} interaction
 * @param {Object} player
 * @param {string} lawId
 */
async function handleComprehendSelect(interaction, player, lawId) {
  const law = daoLawsConfig.getDaoById(lawId);
  if (!law) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.error)
          .setTitle('❌ Lỗi')
          .setDescription('Đạo pháp không tồn tại.'),
      ],
      ephemeral: true,
    });
  }

  const realm = realmsConfig.getRealmByOrder(player.realm_index + 1);
  const realmOrder = realm ? realm.order : player.realm_index + 1;

  // ── Kiểm tra cảnh giới ──
  if (realmOrder < law.min_realm) {
    const minRealm = realmsConfig.getRealmByOrder(law.min_realm);
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.error)
          .setTitle('🔒 Chưa Đủ Cảnh Giới')
          .setDescription(
            `Cần đạt **${minRealm ? minRealm.name : `cảnh giới ${law.min_realm}`}** để lĩnh ngộ ${law.emoji} ${law.name}.`
          ),
      ],
      ephemeral: true,
    });
  }

  // ── Kiểm tra dao_path restriction ──
  if (law.dao_path_restriction && law.dao_path_restriction !== player.dao_path) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.error)
          .setTitle('🚫 Đạo Pháp Bị Hạn Chế')
          .setDescription(
            `${law.emoji} **${law.name}** chỉ dành cho **${law.dao_path_restriction === 'ma_dao' ? 'Ma Đạo' : 'Chính Đạo'}** tu sĩ.`
          ),
      ],
      ephemeral: true,
    });
  }

  const playerLaws = getPlayerLaws(player.id);
  const maxLaws = getMaxLaws(player);
  const existingLaw = playerLaws.find(l => l.law_id === lawId);
  const currentLevel = existingLaw ? existingLaw.level : 0;

  // ── Kiểm tra max level ──
  if (currentLevel >= law.max_level) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.warning)
          .setTitle('✅ Đã Viên Mãn')
          .setDescription(`${law.emoji} **${law.name}** đã đạt cấp tối đa (Lv.${law.max_level}).`),
      ],
      ephemeral: true,
    });
  }

  // ── Kiểm tra giới hạn số lượng (chỉ khi học đạo mới) ──
  if (!existingLaw && playerLaws.length >= maxLaws) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.error)
          .setTitle('⚠️ Đạt Giới Hạn Đạo Pháp')
          .setDescription(
            `Bạn đã lĩnh ngộ tối đa **${maxLaws}** đạo pháp.\n` +
            `Không thể học thêm đạo pháp mới.${isHonDonRoot(player) ? '' : '\n\n_💡 Tip: Hỗn Độn Linh Căn có thể lĩnh ngộ tối đa 5 đạo pháp._'}`
          ),
      ],
      ephemeral: true,
    });
  }

  // ── Tính chi phí EXP ──
  const expCost = daoLawsConfig.getExpForLevel(lawId, currentLevel);
  if (expCost === null) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.error)
          .setTitle('❌ Lỗi')
          .setDescription('Không thể tính chi phí lĩnh ngộ.'),
      ],
      ephemeral: true,
    });
  }

  // ── Kiểm tra đủ EXP ──
  if (player.exp < expCost) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.error)
          .setTitle('❌ Không Đủ EXP')
          .setDescription(
            `Cần **${formatNumber(expCost)}** EXP để lĩnh ngộ ${law.emoji} ${law.name} Lv.${currentLevel + 1}.\n` +
            `EXP hiện tại: **${formatNumber(player.exp)}** (thiếu **${formatNumber(expCost - player.exp)}**)`
          ),
      ],
      ephemeral: true,
    });
  }

  // ══════════════════════════════════════
  // Thực hiện lĩnh ngộ — trừ EXP, cập nhật DB
  // ══════════════════════════════════════
  const newLevel = currentLevel + 1;

  const updateTransaction = db.transaction(() => {
    // Trừ EXP
    db.prepare('UPDATE players SET exp = exp - ? WHERE id = ?').run(expCost, player.id);

    // INSERT hoặc UPDATE đạo pháp
    if (existingLaw) {
      db.prepare('UPDATE player_dao_laws SET level = ? WHERE player_id = ? AND law_id = ?')
        .run(newLevel, player.id, lawId);
    } else {
      db.prepare('INSERT INTO player_dao_laws (player_id, law_id, level) VALUES (?, ?, ?)')
        .run(player.id, lawId, newLevel);
    }
  });

  updateTransaction();

  // ── Tính bonus mới ──
  const newBonuses = daoLawsConfig.getBonusesAtLevel(lawId, newLevel);
  const bonusLines = Object.entries(newBonuses)
    .map(([key, val]) => `  +${val} ${key}`)
    .join('\n');

  // ── Kiểm tra special effect ──
  let specialText = '';
  if (law.special_effect) {
    if (newLevel === 5 && law.special_effect.level_5) {
      specialText = `\n\n🌟 **Đặc Hiệu Kích Hoạt!**\n${law.special_effect.description.split('Lv5: ')[1]?.split('. Lv10')[0] || law.special_effect.description}`;
    } else if (newLevel === 10 && law.special_effect.level_10) {
      specialText = `\n\n🌟 **ĐẶC HIỆU TỐI THƯỢNG!**\n${law.special_effect.name}: ${law.special_effect.description.split('Lv10: ')[1] || law.special_effect.description}`;
    }
  }

  const embed = new EmbedBuilder()
    .setColor(newLevel === 10 ? COLORS.GOLD : COLORS.SUCCESS)
    .setTitle(
      newLevel === 10
        ? `🌟 ${law.emoji} ${law.name} — VIÊN MÃN!`
        : `${law.emoji} Lĩnh Ngộ Thành Công!`
    )
    .setDescription(
      `**${law.name}** đã đạt **Lv.${newLevel}**!\n\n` +
      `📊 **Bonus hiện tại:**\n${bonusLines}\n\n` +
      `💰 Tiêu hao: **${formatNumber(expCost)}** EXP\n` +
      `✨ EXP còn lại: **${formatNumber(player.exp - expCost)}**` +
      specialText
    )
    .setFooter({
      text: newLevel < law.max_level
        ? `Cấp tiếp: cần ${formatNumber(daoLawsConfig.getExpForLevel(lawId, newLevel))} EXP`
        : 'Đạo Pháp Viên Mãn — Thiên Đạo Sáng Soi',
    });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('cultivation:comprehend')
      .setLabel('☯️ Tiếp Tục Lĩnh Ngộ')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('menu:cultivation')
      .setLabel('◀️ Quay Lại')
      .setStyle(ButtonStyle.Secondary)
  );

  // Dùng update nếu đang ở select menu, reply nếu không
  if (interaction.isStringSelectMenu()) {
    await interaction.update({ embeds: [embed], components: [row] });
  } else if (interaction.deferred || interaction.replied) {
    await interaction.editReply({ embeds: [embed], components: [row] });
  } else {
    await interaction.reply({ embeds: [embed], components: [row] });
  }
}

module.exports = {
  showDaoLawsMenu,
  handleComprehendSelect,
  getPlayerLaws,
};
