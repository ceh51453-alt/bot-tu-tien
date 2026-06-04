/**
 * @file Luận Đạo — Debate / Philosophical Discussion System
 * @description Luận Đạo là hình thức PvP không chiến đấu:
 *   - So sánh Đạo Tâm + Ngộ Tính
 *   - Người thắng nhận Đạo Tâm + EXP bonus
 *   - Người thua vẫn nhận EXP (ít hơn)
 *   - Cooldown 30 phút
 *
 * Cơ chế gốc: luận đạo dựa trên nền tảng tu vi + tố chất
 */

const db = require('../database/connection');
const { randomInt, chance } = require('../utils/helpers');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { COLORS } = require('../utils/constants');

// ═══════════════════════════════════════════
//  LUẬN ĐẠO TOPICS
// ═══════════════════════════════════════════

const LUAN_DAO_TOPICS = [
  { id: 'thien_dao', name: '🌌 Thiên Đạo', desc: 'Bàn luận về bản chất của thiên đạo', stat: 'dao_tam', mult: 1.2 },
  { id: 'sinh_tu', name: '💀 Sinh Tử', desc: 'Sinh tử luân hồi có ý nghĩa gì?', stat: 'ngo_tinh', mult: 1.0 },
  { id: 'dao_tam', name: '🧘 Đạo Tâm', desc: 'Tu tâm hay tu thể trước?', stat: 'dao_tam', mult: 1.5 },
  { id: 'nhan_qua', name: '⚖️ Nhân Quả', desc: 'Nhân quả có thể thay đổi không?', stat: 'ngo_tinh', mult: 1.3 },
  { id: 'kiem_dao', name: '🗡️ Kiếm Đạo', desc: 'Kiếm đạo tối thượng là gì?', stat: 'dao_tam', mult: 1.1 },
  { id: 'truong_sinh', name: '✨ Trường Sinh', desc: 'Trường sinh có thực sự tồn tại?', stat: 'ngo_tinh', mult: 1.4 },
  { id: 'vo_thien', name: '💭 Vô Thiên', desc: 'Nếu không có trời, ai quyết định vận mệnh?', stat: 'dao_tam', mult: 1.6 },
  { id: 'ma_dao', name: '😈 Ma Đạo', desc: 'Ma đạo có phải tà đạo?', stat: 'ngo_tinh', mult: 1.2 },
];

/**
 * Tính điểm luận đạo
 * @param {Object} player - Player DB row
 * @param {Object} topic - Topic config
 * @returns {number} Điểm
 */
function calculateLuanDaoScore(player, topic) {
  const baseStat = player[topic.stat] || 100;
  const ngoTinh = player.ngo_tinh || 100;
  const daoTam = player.dao_tam || 0;
  const realmBonus = (player.realm_index || 0) * 15;

  // Base score = (stat * mult + ngoTinh/2 + daoTam/10 + realm) ± 20% random
  const base = Math.floor(baseStat * topic.mult + ngoTinh / 2 + daoTam / 10 + realmBonus);
  const variance = Math.floor(base * 0.2);
  return base + randomInt(-variance, variance);
}

/**
 * Thực hiện luận đạo solo (vs NPC)
 * @param {Object} player - Player DB row
 * @returns {Object} { topic, playerScore, npcScore, won, rewards }
 */
function executeSoloLuanDao(player) {
  const topic = LUAN_DAO_TOPICS[Math.floor(Math.random() * LUAN_DAO_TOPICS.length)];

  const playerScore = calculateLuanDaoScore(player, topic);
  const npcScore = calculateLuanDaoScore({
    ngo_tinh: 80 + (player.realm_index || 0) * 10,
    dao_tam: 50 + (player.realm_index || 0) * 20,
    realm_index: player.realm_index || 0,
  }, topic);

  const won = playerScore > npcScore;
  const diff = Math.abs(playerScore - npcScore);

  const rewards = {};
  if (won) {
    rewards.dao_tam = Math.floor(diff * 0.3) + randomInt(10, 50);
    rewards.exp = randomInt(200, 1000) * (1 + (player.realm_index || 0) * 0.2);
    rewards.ngo_tinh = diff > 100 ? randomInt(1, 5) : 0;
  } else {
    rewards.dao_tam = Math.floor(diff * 0.1) + randomInt(5, 20);
    rewards.exp = randomInt(50, 300) * (1 + (player.realm_index || 0) * 0.1);
  }

  return { topic, playerScore, npcScore, won, rewards, diff };
}

/**
 * Thực hiện luận đạo PvP
 */
function executePvPLuanDao(player1, player2) {
  const topic = LUAN_DAO_TOPICS[Math.floor(Math.random() * LUAN_DAO_TOPICS.length)];

  const p1Score = calculateLuanDaoScore(player1, topic);
  const p2Score = calculateLuanDaoScore(player2, topic);
  const diff = Math.abs(p1Score - p2Score);

  const winner = p1Score >= p2Score ? player1 : player2;
  const loser = p1Score >= p2Score ? player2 : player1;

  const winnerRewards = {
    dao_tam: Math.floor(diff * 0.5) + randomInt(20, 80),
    exp: randomInt(300, 1500),
    ngo_tinh: diff > 150 ? randomInt(2, 8) : 0,
  };

  const loserRewards = {
    dao_tam: Math.floor(diff * 0.15) + randomInt(5, 30),
    exp: randomInt(100, 500),
  };

  return { topic, p1Score, p2Score, winner, loser, winnerRewards, loserRewards, diff };
}

/**
 * Apply luận đạo rewards
 */
function applyLuanDaoRewards(playerId, rewards) {
  const updates = [];
  const params = [];

  if (rewards.exp) { updates.push('exp = exp + ?'); params.push(Math.floor(rewards.exp)); }
  if (rewards.dao_tam) { updates.push('dao_tam = dao_tam + ?'); params.push(rewards.dao_tam); }
  if (rewards.ngo_tinh) { updates.push('ngo_tinh = MIN(ngo_tinh + ?, 999)'); params.push(rewards.ngo_tinh); }

  if (updates.length > 0) {
    params.push(playerId);
    db.prepare(`UPDATE players SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  }
}

// ═══════════════════════════════════════════
//  TỈ VÕ — Martial Tournament
// ═══════════════════════════════════════════

/**
 * Tỉ Võ — PvP đấu trường:
 *   - So sánh chiến lực + chiến kỹ
 *   - Có hệ thống xếp hạng (rank)
 *   - Phần thưởng: Danh Vọng, Linh Thạch, EXP
 *   - Không permadeath
 */

const TI_VO_RANKS = [
  { id: 'dong', name: '🥉 Đồng', min_danh_vong: 0, reward_mult: 1.0 },
  { id: 'bac', name: '🥈 Bạc', min_danh_vong: 500, reward_mult: 1.5 },
  { id: 'vang', name: '🥇 Vàng', min_danh_vong: 2000, reward_mult: 2.0 },
  { id: 'bach_kim', name: '💎 Bạch Kim', min_danh_vong: 5000, reward_mult: 3.0 },
  { id: 'kim_cuong', name: '👑 Kim Cương', min_danh_vong: 15000, reward_mult: 5.0 },
  { id: 'truyen_thuyet', name: '🌟 Truyền Thuyết', min_danh_vong: 50000, reward_mult: 8.0 },
];

/**
 * Lấy rank hiện tại của player
 */
function getTiVoRank(danhVong) {
  let rank = TI_VO_RANKS[0];
  for (const r of TI_VO_RANKS) {
    if (danhVong >= r.min_danh_vong) rank = r;
  }
  return rank;
}

/**
 * Tính phần thưởng tỉ võ
 * @param {boolean} won - Thắng hay thua
 * @param {Object} player - Player DB row
 * @param {Object} opponent - Opponent data
 * @returns {Object} rewards
 */
function calculateTiVoRewards(won, player, opponent) {
  const rank = getTiVoRank(player.danh_vong || 0);
  const realmDiff = (opponent.realm_index || 0) - (player.realm_index || 0);
  const challengeBonus = Math.max(1, 1 + realmDiff * 0.3);

  if (won) {
    return {
      danh_vong: Math.floor((randomInt(50, 200) + Math.abs(realmDiff) * 30) * challengeBonus),
      exp: Math.floor(randomInt(200, 800) * rank.reward_mult * challengeBonus),
      linh_thach: Math.floor(randomInt(100, 500) * rank.reward_mult),
    };
  } else {
    return {
      danh_vong: -Math.floor(randomInt(10, 50)),
      exp: Math.floor(randomInt(50, 200) * rank.reward_mult * 0.5),
      linh_thach: 0,
    };
  }
}

/**
 * Apply tỉ võ rewards
 */
function applyTiVoRewards(playerId, rewards) {
  const updates = [];
  const params = [];

  if (rewards.exp) { updates.push('exp = exp + ?'); params.push(Math.floor(rewards.exp)); }
  if (rewards.linh_thach) { updates.push('linh_thach = linh_thach + ?'); params.push(rewards.linh_thach); }
  if (rewards.danh_vong !== undefined) {
    updates.push('danh_vong = MAX(0, danh_vong + ?)');
    params.push(rewards.danh_vong);
  }

  if (updates.length > 0) {
    params.push(playerId);
    db.prepare(`UPDATE players SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  }
}

/**
 * Lấy bảng xếp hạng tỉ võ
 */
function getTiVoLeaderboard(limit = 10) {
  return db.prepare(
    'SELECT name, danh_vong, realm_index, atk, def FROM players WHERE is_dead = 0 ORDER BY danh_vong DESC LIMIT ?'
  ).all(limit);
}

module.exports = {
  // Luận Đạo
  LUAN_DAO_TOPICS,
  executeSoloLuanDao,
  executePvPLuanDao,
  applyLuanDaoRewards,

  // Tỉ Võ
  TI_VO_RANKS,
  getTiVoRank,
  calculateTiVoRewards,
  applyTiVoRewards,
  getTiVoLeaderboard,
};
