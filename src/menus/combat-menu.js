/**
 * @file Combat Menu — Chiến Trường
 * @description Săn Quái, Diệt Yêu Thú, Thách Đấu PvP, Quản lý Kỹ Năng
 *
 * Sử dụng combat engine (createPvECombat, createPvPCombat) cho chiến đấu chi tiết.
 * Hỗ trợ permadeath (PvE), cooldown PvP, drop vật phẩm, và nhật ký chiến đấu.
 */

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require('discord.js');
const db = require('../database/connection');
const { COLORS, COOLDOWNS } = require('../utils/constants');
const { formatNumber, progressBar, randomInt, formatTime } = require('../utils/helpers');
const { createPvECombat, createPvPCombat } = require('../systems/combat');
const { checkCooldown, setCooldown } = require('../systems/cooldown');
const monsters = require('../../config/monsters');
const { getItemById } = require('../../config/items');
const { showSkillsMenu } = require('../systems/skills');

// ═══════════════════════════════════════════
//  Prepared Statements
// ═══════════════════════════════════════════

const stmtUpdateHp = db.prepare('UPDATE players SET hp = ? WHERE id = ?');
const stmtKillPlayer = db.prepare('UPDATE players SET hp = 0, is_dead = 1 WHERE id = ?');
const stmtSetHp1 = db.prepare('UPDATE players SET hp = 1 WHERE id = ?');
const stmtAddRewards = db.prepare('UPDATE players SET exp = exp + ?, linh_thach = linh_thach + ? WHERE id = ?');
const stmtGetInvItem = db.prepare('SELECT quantity FROM inventory WHERE player_id = ? AND item_id = ?');
const stmtAddInvItem = db.prepare('UPDATE inventory SET quantity = quantity + 1 WHERE player_id = ? AND item_id = ?');
const stmtInsertInvItem = db.prepare('INSERT INTO inventory (player_id, item_id, quantity) VALUES (?, ?, 1)');
const stmtGetActivePet = db.prepare('SELECT * FROM player_pets WHERE player_id = ? AND is_active = 1');
const stmtGetPlayerByDiscord = db.prepare('SELECT * FROM players WHERE discord_id = ? AND is_dead = 0');
const stmtStealExp = db.prepare('UPDATE players SET exp = CASE WHEN exp >= ? THEN exp - ? ELSE 0 END WHERE id = ?');

// ═══════════════════════════════════════════
//  showCombatMenu — Menu chính chiến trường
// ═══════════════════════════════════════════

/**
 * Hiển thị menu chiến trường chính
 * @param {import('discord.js').ButtonInteraction} interaction
 * @param {Object} player - Dữ liệu người chơi từ DB
 */
async function showCombatMenu(interaction, player) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.combat)
    .setTitle('⚔️ Chiến Trường')
    .setDescription(
      `**${player.name}** — Chiến lực: **${formatNumber(player.atk + player.def + player.speed)}**\n` +
      `❤️ HP: ${progressBar(player.hp, player.max_hp)} ${formatNumber(player.hp)}/${formatNumber(player.max_hp)}\n\n` +
      `Chọn phương thức chiến đấu:`
    )
    .setTimestamp();

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('combat:hunt')
      .setLabel('🐉 Săn Quái')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('combat:beast')
      .setLabel('👹 Diệt Yêu Thú')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('combat:pvp')
      .setLabel('⚔️ Thách Đấu')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('skills:menu')
      .setLabel('💫 Kỹ Năng')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('menu:main')
      .setLabel('🔙 Quay Lại')
      .setStyle(ButtonStyle.Secondary),
  );

  await interaction.update({ embeds: [embed], components: [row1] });
}

// ═══════════════════════════════════════════
//  buildCombatLog — Tạo nhật ký chiến đấu hiển thị
// ═══════════════════════════════════════════

/**
 * Format nhật ký chiến đấu từ combat result
 * @param {Array<Object>} turns - Mảng lượt chiến đấu
 * @param {number} maxLines - Số dòng tối đa hiển thị
 * @returns {string}
 */
function buildCombatLog(turns, maxLines = 8) {
  const lines = [];

  for (const turn of turns) {
    // Sát thương người chơi
    if (turn.playerAction) {
      const skillName = turn.playerAction.skillName || 'Đánh thường';
      lines.push(`⚔️ L${turn.turn}: Bạn dùng ${skillName} gây ${turn.playerAction.damage} sát thương`);
    }

    // Sát thương quái/đối thủ
    if (turn.enemyAction) {
      const enemyName = turn.enemyAction.name || 'Kẻ địch';
      lines.push(`👹 L${turn.turn}: ${enemyName} gây ${turn.enemyAction.damage} sát thương`);
    }

    // Linh thú tấn công
    if (turn.petAction) {
      lines.push(`🐾 L${turn.turn}: Linh thú gây ${turn.petAction.damage} sát thương`);
    }

    // Hiệu ứng phụ
    if (turn.effects && turn.effects.length > 0) {
      for (const eff of turn.effects) {
        lines.push(`✨ L${turn.turn}: ${eff}`);
      }
    }
  }

  // Chỉ lấy maxLines dòng cuối
  return lines.slice(-maxLines).join('\n');
}

/**
 * Tạo nhật ký chiến đấu đơn giản (fallback khi combat engine chưa trả turns)
 * @param {Object} player - Dữ liệu người chơi
 * @param {Object} monster - Dữ liệu quái vật
 * @returns {Object} - Kết quả chiến đấu nội bộ
 */
function runSimpleCombat(player, monster) {
  const scaleFactor = 1 + (player.sub_realm - 1) * 0.05;
  const monsterHp = Math.floor(monster.hp * scaleFactor);
  const monsterAtk = Math.floor(monster.atk * scaleFactor);
  const monsterDef = Math.floor(monster.def * scaleFactor);

  let playerHp = player.hp;
  let mHp = monsterHp;
  let turn = 0;
  const turns = [];

  // Lấy linh thú active
  const activePet = stmtGetActivePet.get(player.id);

  while (playerHp > 0 && mHp > 0 && turn < 30) {
    turn++;
    const turnData = { turn, playerAction: null, enemyAction: null, petAction: null, effects: [] };

    // Người chơi tấn công
    const playerDmg = Math.max(1, player.atk - Math.floor(monsterDef * 0.3) + randomInt(-5, 5));
    mHp -= playerDmg;
    turnData.playerAction = { skillName: 'Đánh thường', damage: playerDmg };

    if (mHp <= 0) { turns.push(turnData); break; }

    // Quái tấn công
    const monsterDmg = Math.max(1, monsterAtk - Math.floor(player.def * 0.3) + randomInt(-5, 5));
    playerHp -= monsterDmg;
    turnData.enemyAction = { name: monster.name, damage: monsterDmg };

    // Linh thú tấn công
    if (activePet) {
      const petDmg = Math.max(1, Math.floor(activePet.atk * 0.5));
      mHp -= petDmg;
      turnData.petAction = { damage: petDmg };
    }

    turns.push(turnData);
  }

  return {
    won: mHp <= 0,
    playerHp: Math.max(0, playerHp),
    monsterHp: Math.max(0, mHp),
    turns,
    totalTurns: turn,
  };
}

// ═══════════════════════════════════════════
//  startHunt — Săn quái PvE (tất cả loại quái)
// ═══════════════════════════════════════════

/**
 * Bắt đầu săn quái — PvE combat với tất cả loại quái
 * @param {import('discord.js').ButtonInteraction} interaction
 * @param {Object} player - Dữ liệu người chơi
 */
async function startHunt(interaction, player) {
  // Kiểm tra HP
  if (player.hp <= 0) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.error)
      .setTitle('💀 Đã tử vong')
      .setDescription('Nhân vật đã chết. Dùng /tutien để tạo nhân vật mới.');
    return interaction.update({ embeds: [embed], components: [] });
  }

  // Lọc quái phù hợp cảnh giới (realm_level <= player realm, >= player realm - 2)
  const availableMonsters = monsters.list.filter(
    m => m.realm_level <= player.realm_index && m.realm_level >= player.realm_index - 2
  );

  if (availableMonsters.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.warning)
      .setTitle('🔍 Không tìm thấy quái vật')
      .setDescription('Khu vực này không có quái vật phù hợp với cảnh giới của bạn.');
    return interaction.update({ embeds: [embed], components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('combat:menu').setLabel('🔙 Quay Lại').setStyle(ButtonStyle.Secondary)
      )
    ]});
  }

  // Chọn quái ngẫu nhiên
  const monster = availableMonsters[Math.floor(Math.random() * availableMonsters.length)];

  // Chạy chiến đấu qua combat engine (fallback nội bộ nếu chưa sẵn sàng)
  let combatResult;
  try {
    const rawResult = createPvECombat(player, monster);
    combatResult = {
      won: rawResult.winner === 'player',
      playerHp: rawResult.playerHpRemaining,
      turns: rawResult.turnLog,
      totalTurns: rawResult.totalTurns
    };
  } catch (_err) {
    // Fallback: chạy combat nội bộ nếu combat engine chưa triển khai
    combatResult = runSimpleCombat(player, monster);
  }

  const { won, playerHp, turns, totalTurns } = combatResult;
  const finalHp = Math.max(0, playerHp);

  // Cập nhật HP người chơi
  stmtUpdateHp.run(finalHp, player.id);

  if (won) {
    // ── Thắng: trao thưởng ──
    const expReward = monster.exp_reward + randomInt(0, Math.floor(monster.exp_reward * 0.2));
    const linhThachReward = randomInt(5, 20) * (player.realm_index + 1);
    stmtAddRewards.run(expReward, linhThachReward, player.id);

    // Cập nhật tiến trình nhiệm vụ
    try {
      const { updateQuestProgress } = require('../systems/quests');
      updateQuestProgress(player.id, 'hunt', monster.id, 1);
    } catch (_err) { /* ignore */ }

    // Xử lý rơi đồ theo drops mới: {item_id, chance}
    let dropText = '';
    if (monster.drops && monster.drops.length > 0) {
      for (const drop of monster.drops) {
        if (Math.random() < drop.chance) {
          const existing = stmtGetInvItem.get(player.id, drop.item_id);
          if (existing) {
            stmtAddInvItem.run(player.id, drop.item_id);
          } else {
            stmtInsertInvItem.run(player.id, drop.item_id);
          }
          // Lấy tên item từ config
          const itemConfig = getItemById(drop.item_id);
          const itemName = itemConfig ? itemConfig.name : drop.item_id;
          dropText += `\n║ 🎁 Rơi vật phẩm: ${itemName}`;
        }
      }
    }

    // Tạo nhật ký chiến đấu
    const combatLog = typeof turns[0] === 'string' ? turns.slice(-8).join('\n') : buildCombatLog(turns, 8);

    const embed = new EmbedBuilder()
      .setColor(COLORS.success)
      .setTitle(`⚔️ CHIẾN THẮNG! — ${monster.emoji} ${monster.name}`)
      .setDescription(
        `╔══════════════════════════════════╗\n` +
        `║ 📜 Nhật Ký Chiến Đấu (${totalTurns} lượt)\n` +
        `${combatLog}\n` +
        `╠══════════════════════════════════╣\n` +
        `║ 📈 EXP: +${formatNumber(expReward)}\n` +
        `║ 💎 Linh Thạch: +${formatNumber(linhThachReward)}` +
        `${dropText}\n` +
        `║ ❤️ HP: ${formatNumber(finalHp)}/${formatNumber(player.max_hp)}\n` +
        `╚══════════════════════════════════╝`
      )
      .setTimestamp();

    return interaction.update({ embeds: [embed], components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('combat:hunt').setLabel('🐉 Tiếp Tục Săn').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('combat:menu').setLabel('🔙 Chiến Trường').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary)
      )
    ]});
  }

  // ── Thua ──
  if (finalHp <= 0) {
    // Permadeath — nhân vật chết vĩnh viễn
    stmtKillPlayer.run(player.id);
    const combatLog = buildCombatLog(turns, 4);

    const embed = new EmbedBuilder()
      .setColor(COLORS.error)
      .setTitle('💀 THÂN TỬ ĐẠO TIÊU')
      .setDescription(
        `**${player.name}** đã bị ${monster.emoji} **${monster.name}** giết chết!\n\n` +
        `${combatLog}\n\n` +
        `💀 **PERMADEATH** — Nhân vật đã mất vĩnh viễn.\n` +
        `_Dùng /tutien để bắt đầu lại._`
      );
    return interaction.update({ embeds: [embed], components: [] });
  }

  // Thua nhưng sống sót
  const combatLog = buildCombatLog(turns, 4);
  const embed = new EmbedBuilder()
    .setColor(COLORS.error)
    .setTitle(`💔 THẤT BẠI — ${monster.emoji} ${monster.name}`)
    .setDescription(
      `${combatLog}\n\n` +
      `❤️ HP còn lại: **${formatNumber(finalHp)}**/${formatNumber(player.max_hp)}\n` +
      `Bạn bỏ chạy kịp thời!`
    );

  return interaction.update({ embeds: [embed], components: [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('combat:menu').setLabel('🔙 Chiến Trường').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary)
    )
  ]});
}

// ═══════════════════════════════════════════
//  startBeastHunt — Diệt Yêu Thú (chỉ type 'yeu_thu')
// ═══════════════════════════════════════════

/**
 * Săn yêu thú — lọc chỉ quái loại yeu_thu
 * @param {import('discord.js').ButtonInteraction} interaction
 * @param {Object} player - Dữ liệu người chơi
 */
async function startBeastHunt(interaction, player) {
  // Kiểm tra HP
  if (player.hp <= 0) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.error)
      .setTitle('💀 Đã tử vong')
      .setDescription('Nhân vật đã chết. Dùng /tutien để tạo nhân vật mới.');
    return interaction.update({ embeds: [embed], components: [] });
  }

  // Lọc quái loại yeu_thu phù hợp cảnh giới
  const availableMonsters = monsters.list.filter(
    m => m.type === 'yeu_thu' &&
         m.realm_level <= player.realm_index &&
         m.realm_level >= player.realm_index - 2
  );

  if (availableMonsters.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.warning)
      .setTitle('🔍 Không tìm thấy yêu thú')
      .setDescription('Khu vực này không có yêu thú phù hợp với cảnh giới của bạn.');
    return interaction.update({ embeds: [embed], components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('combat:menu').setLabel('🔙 Quay Lại').setStyle(ButtonStyle.Secondary)
      )
    ]});
  }

  // Chọn yêu thú ngẫu nhiên
  const monster = availableMonsters[Math.floor(Math.random() * availableMonsters.length)];

  // Chạy chiến đấu
  let combatResult;
  try {
    const rawResult = createPvECombat(player, monster);
    combatResult = {
      won: rawResult.winner === 'player',
      playerHp: rawResult.playerHpRemaining,
      turns: rawResult.turnLog,
      totalTurns: rawResult.totalTurns
    };
  } catch (_err) {
    combatResult = runSimpleCombat(player, monster);
  }

  const { won, playerHp, turns, totalTurns } = combatResult;
  const finalHp = Math.max(0, playerHp);

  // Cập nhật HP
  stmtUpdateHp.run(finalHp, player.id);

  if (won) {
    // ── Thắng yêu thú ──
    const expReward = monster.exp_reward + randomInt(0, Math.floor(monster.exp_reward * 0.2));
    const linhThachReward = randomInt(5, 20) * (player.realm_index + 1);
    stmtAddRewards.run(expReward, linhThachReward, player.id);

    // Cập nhật tiến trình nhiệm vụ
    try {
      const { updateQuestProgress } = require('../systems/quests');
      updateQuestProgress(player.id, 'hunt', monster.id, 1);
    } catch (_err) { /* ignore */ }

    // Rơi đồ
    let dropText = '';
    if (monster.drops && monster.drops.length > 0) {
      for (const drop of monster.drops) {
        if (Math.random() < drop.chance) {
          const existing = stmtGetInvItem.get(player.id, drop.item_id);
          if (existing) {
            stmtAddInvItem.run(player.id, drop.item_id);
          } else {
            stmtInsertInvItem.run(player.id, drop.item_id);
          }
          const itemConfig = getItemById(drop.item_id);
          const itemName = itemConfig ? itemConfig.name : drop.item_id;
          dropText += `\n║ 🎁 Rơi vật phẩm: ${itemName}`;
        }
      }
    }

    const combatLog = typeof turns[0] === 'string' ? turns.slice(-8).join('\n') : buildCombatLog(turns, 8);

    const embed = new EmbedBuilder()
      .setColor(COLORS.success)
      .setTitle(`⚔️ CHIẾN THẮNG! — ${monster.emoji} ${monster.name}`)
      .setDescription(
        `╔══════════════════════════════════╗\n` +
        `║ 📜 Nhật Ký Chiến Đấu (${totalTurns} lượt)\n` +
        `${combatLog}\n` +
        `╠══════════════════════════════════╣\n` +
        `║ 📈 EXP: +${formatNumber(expReward)}\n` +
        `║ 💎 Linh Thạch: +${formatNumber(linhThachReward)}` +
        `${dropText}\n` +
        `║ ❤️ HP: ${formatNumber(finalHp)}/${formatNumber(player.max_hp)}\n` +
        `╚══════════════════════════════════╝`
      )
      .setTimestamp();

    return interaction.update({ embeds: [embed], components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('combat:beast').setLabel('👹 Tiếp Tục Diệt').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('combat:menu').setLabel('🔙 Chiến Trường').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary)
      )
    ]});
  }

  // ── Thua yêu thú ──
  if (finalHp <= 0) {
    // Permadeath
    stmtKillPlayer.run(player.id);
    const combatLog = buildCombatLog(turns, 4);

    const embed = new EmbedBuilder()
      .setColor(COLORS.error)
      .setTitle('💀 THÂN TỬ ĐẠO TIÊU')
      .setDescription(
        `**${player.name}** đã bị ${monster.emoji} **${monster.name}** xé xác!\n\n` +
        `${combatLog}\n\n` +
        `💀 **PERMADEATH** — Nhân vật đã mất vĩnh viễn.\n` +
        `_Dùng /tutien để bắt đầu lại._`
      );
    return interaction.update({ embeds: [embed], components: [] });
  }

  // Thua sống sót
  const combatLogLose = buildCombatLog(turns, 4);
  const embed = new EmbedBuilder()
    .setColor(COLORS.error)
    .setTitle(`💔 THẤT BẠI — ${monster.emoji} ${monster.name}`)
    .setDescription(
      `${combatLogLose}\n\n` +
      `❤️ HP còn lại: **${formatNumber(finalHp)}**/${formatNumber(player.max_hp)}\n` +
      `Bạn bỏ chạy kịp thời!`
    );

  return interaction.update({ embeds: [embed], components: [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('combat:menu').setLabel('🔙 Chiến Trường').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary)
    )
  ]});
}

// ═══════════════════════════════════════════
//  startPvP — Thách đấu PvP
// ═══════════════════════════════════════════

/**
 * Thách đấu PvP — chọn đối thủ từ danh sách thành viên server
 * @param {import('discord.js').ButtonInteraction|StringSelectMenuInteraction} interaction
 * @param {Object} player - Dữ liệu người chơi
 */
async function startPvP(interaction, player) {
  // Kiểm tra HP
  if (player.hp <= 0) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.error)
      .setTitle('💀 Đã tử vong')
      .setDescription('Nhân vật đã chết. Dùng /tutien để tạo nhân vật mới.');
    return interaction.update({ embeds: [embed], components: [] });
  }

  // Kiểm tra cooldown PvP (10 phút)
  const cd = checkCooldown(player.id, 'pvp');
  if (cd.onCooldown) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.warning)
      .setTitle('⏳ Đang hồi chiêu')
      .setDescription(
        `Thách đấu PvP đang trong thời gian hồi.\n` +
        `⏱️ Còn lại: **${formatTime(cd.remainingMs)}**`
      );
    return interaction.update({ embeds: [embed], components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('combat:menu').setLabel('🔙 Chiến Trường').setStyle(ButtonStyle.Secondary)
      )
    ]});
  }

  // Nếu đã chọn đối thủ từ StringSelectMenu
  if (interaction.isStringSelectMenu && interaction.isStringSelectMenu() && interaction.customId === 'select:pvp_target') {
    const targetDiscordId = interaction.values[0];
    return executePvP(interaction, player, targetDiscordId);
  }

  // Hiển thị danh sách đối thủ có thể chọn
  // Lấy danh sách thành viên server đang online có nhân vật
  let members;
  try {
    members = await interaction.guild.members.fetch({ force: false });
  } catch (_err) {
    members = interaction.guild.members.cache;
  }

  // Lọc thành viên có nhân vật (trừ bản thân, trừ bot)
  const potentialTargets = [];
  for (const [memberId, member] of members) {
    if (member.user.bot) continue;
    if (memberId === player.discord_id) continue;

    const targetPlayer = stmtGetPlayerByDiscord.get(memberId);
    if (targetPlayer) {
      potentialTargets.push({
        discordId: memberId,
        name: targetPlayer.name,
        realmIndex: targetPlayer.realm_index,
        hp: targetPlayer.hp,
        maxHp: targetPlayer.max_hp,
      });
    }
  }

  if (potentialTargets.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.warning)
      .setTitle('⚔️ Không có đối thủ')
      .setDescription('Không tìm thấy tu sĩ nào khác trong server để thách đấu.');
    return interaction.update({ embeds: [embed], components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('combat:menu').setLabel('🔙 Chiến Trường').setStyle(ButtonStyle.Secondary)
      )
    ]});
  }

  // Giới hạn 25 lựa chọn (Discord API limit)
  const options = potentialTargets.slice(0, 25).map(t => ({
    label: t.name,
    description: `Cảnh giới: ${t.realmIndex} | HP: ${formatNumber(t.hp)}/${formatNumber(t.maxHp)}`,
    value: t.discordId,
  }));

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('select:pvp_target')
    .setPlaceholder('🎯 Chọn đối thủ thách đấu...')
    .addOptions(options);

  const embed = new EmbedBuilder()
    .setColor(COLORS.combat)
    .setTitle('⚔️ Thách Đấu PvP')
    .setDescription(
      `**${player.name}**, chọn tu sĩ muốn thách đấu:\n\n` +
      `⚠️ PvP **KHÔNG** gây chết vĩnh viễn.\n` +
      `⏱️ Cooldown: **10 phút** sau mỗi trận.\n` +
      `🌙 Ma Đạo thắng sẽ cướp **20% EXP** đối phương.`
    )
    .setTimestamp();

  await interaction.update({
    embeds: [embed],
    components: [
      new ActionRowBuilder().addComponents(selectMenu),
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('combat:menu').setLabel('🔙 Chiến Trường').setStyle(ButtonStyle.Secondary)
      )
    ],
  });
}

/**
 * Thực thi trận PvP sau khi chọn đối thủ
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 * @param {Object} attacker - Dữ liệu người tấn công
 * @param {string} targetDiscordId - Discord ID đối thủ
 */
async function executePvP(interaction, attacker, targetDiscordId) {
  // Lấy thông tin đối thủ
  const defender = stmtGetPlayerByDiscord.get(targetDiscordId);
  if (!defender) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.error)
      .setTitle('❌ Đối thủ không tồn tại')
      .setDescription('Tu sĩ này đã tử vong hoặc không tồn tại.');
    return interaction.update({ embeds: [embed], components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('combat:menu').setLabel('🔙 Chiến Trường').setStyle(ButtonStyle.Secondary)
      )
    ]});
  }

  // Đặt cooldown PvP
  setCooldown(attacker.id, 'pvp', COOLDOWNS.pvp);

  // Chạy PvP combat
  let pvpResult;
  try {
    const rawResult = createPvPCombat(attacker, defender);
    pvpResult = {
      winnerId: rawResult.winner === 'player' ? attacker.id : (rawResult.winner === 'enemy' ? defender.id : null),
      turns: rawResult.turnLog,
      totalTurns: rawResult.totalTurns,
      attackerHp: rawResult.playerHpRemaining,
      defenderHp: rawResult.enemyHpRemaining
    };
  } catch (_err) {
    // Fallback PvP: so sánh đơn giản
    pvpResult = runSimplePvP(attacker, defender);
  }

  const { winnerId, turns, totalTurns, attackerHp, defenderHp } = pvpResult;
  const attackerWon = winnerId === attacker.id;

  // PvP KHÔNG permadeath — người thua HP = 1
  if (attackerWon) {
    stmtUpdateHp.run(Math.max(1, attackerHp), attacker.id);
    stmtSetHp1.run(defender.id);
  } else {
    stmtSetHp1.run(attacker.id);
    stmtUpdateHp.run(Math.max(1, defenderHp), defender.id);
  }

  // Phần thưởng cho người thắng
  const winner = attackerWon ? attacker : defender;
  const loser = attackerWon ? defender : attacker;

  const expReward = Math.floor(loser.exp * 0.05) + randomInt(50, 200);
  const linhThachReward = randomInt(10, 50) * (winner.realm_index + 1);
  stmtAddRewards.run(expReward, linhThachReward, winner.id);

  // Ma Đạo thắng → cướp 20% EXP đối thủ
  let maDaoSteal = '';
  if (winner.dao_path === 'ma_dao') {
    const stolenExp = Math.floor(loser.exp * 0.20);
    if (stolenExp > 0) {
      stmtStealExp.run(stolenExp, stolenExp, loser.id);
      stmtAddRewards.run(stolenExp, 0, winner.id);
      maDaoSteal = `\n║ 🌙 Ma Đạo: Cướp **${formatNumber(stolenExp)}** EXP từ đối thủ!`;
    }
  }

  // Tạo nhật ký chiến đấu
  const combatLog = typeof turns[0] === 'string' ? turns.slice(-8).join('\n') : buildCombatLog(turns, 8);

  const resultTitle = attackerWon
    ? `⚔️ CHIẾN THẮNG! — ${attacker.name} vs ${defender.name}`
    : `💔 THẤT BẠI! — ${attacker.name} vs ${defender.name}`;

  const resultColor = attackerWon ? COLORS.success : COLORS.error;
  const winnerName = attackerWon ? attacker.name : defender.name;

  const embed = new EmbedBuilder()
    .setColor(resultColor)
    .setTitle(resultTitle)
    .setDescription(
      `╔══════════════════════════════════╗\n` +
      `║ 📜 Nhật Ký PvP (${totalTurns} lượt)\n` +
      `${combatLog}\n` +
      `╠══════════════════════════════════╣\n` +
      `║ 🏆 Người thắng: **${winnerName}**\n` +
      `║ 📈 EXP: +${formatNumber(expReward)}\n` +
      `║ 💎 Linh Thạch: +${formatNumber(linhThachReward)}` +
      `${maDaoSteal}\n` +
      `║ ❤️ Người thua HP → 1 (không chết)\n` +
      `╚══════════════════════════════════╝`
    )
    .setTimestamp();

  await interaction.update({ embeds: [embed], components: [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('combat:menu').setLabel('🔙 Chiến Trường').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Secondary)
    )
  ]});
}

/**
 * Fallback PvP đơn giản khi combat engine chưa sẵn sàng
 * @param {Object} attacker - Người tấn công
 * @param {Object} defender - Người phòng thủ
 * @returns {Object}
 */
function runSimplePvP(attacker, defender) {
  let atkHp = attacker.hp;
  let defHp = defender.hp;
  let turn = 0;
  const turns = [];

  while (atkHp > 0 && defHp > 0 && turn < 30) {
    turn++;
    const turnData = { turn, playerAction: null, enemyAction: null, effects: [] };

    // Attacker đánh
    const atkDmg = Math.max(1, attacker.atk - Math.floor(defender.def * 0.3) + randomInt(-5, 5));
    defHp -= atkDmg;
    turnData.playerAction = { skillName: 'Đánh thường', damage: atkDmg };

    if (defHp <= 0) { turns.push(turnData); break; }

    // Defender đánh
    const defDmg = Math.max(1, defender.atk - Math.floor(attacker.def * 0.3) + randomInt(-5, 5));
    atkHp -= defDmg;
    turnData.enemyAction = { name: defender.name, damage: defDmg };

    turns.push(turnData);
  }

  const attackerWon = defHp <= 0;

  return {
    winnerId: attackerWon ? attacker.id : defender.id,
    attackerHp: Math.max(0, atkHp),
    defenderHp: Math.max(0, defHp),
    turns,
    totalTurns: turn,
  };
}

// ═══════════════════════════════════════════
//  Module exports
// ═══════════════════════════════════════════

module.exports = {
  showCombatMenu,
  startHunt,
  startBeastHunt,
  startPvP,
  executePvP,
};
