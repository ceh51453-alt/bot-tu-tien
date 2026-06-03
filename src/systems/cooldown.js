/**
 * @file Cooldown Manager
 * @description Quản lý cooldown tập trung — sử dụng bảng `cooldowns`
 *
 * Bảng cooldowns: (player_id, action_type, expires_at)
 *   - expires_at lưu dạng unix timestamp (ms)
 *   - Flag vĩnh viễn dùng expires_at = 9999999999999
 */

const db = require('../database/connection');

// ═══════════════════════════════════════════
//  Prepared statements (cache 1 lần duy nhất)
// ═══════════════════════════════════════════

/** Lấy thời gian hết hạn cooldown */
const stmtGet = db.prepare(
  'SELECT expires_at FROM cooldowns WHERE player_id = ? AND action_type = ?',
);

/** Thêm hoặc cập nhật cooldown */
const stmtSet = db.prepare(
  'INSERT OR REPLACE INTO cooldowns (player_id, action_type, expires_at) VALUES (?, ?, ?)',
);

/** Xóa cooldown */
const stmtDel = db.prepare(
  'DELETE FROM cooldowns WHERE player_id = ? AND action_type = ?',
);

// Giá trị timestamp rất lớn dùng cho flag vĩnh viễn
const PERMANENT_EXPIRES = 9999999999999;

// ═══════════════════════════════════════════
//  API chính
// ═══════════════════════════════════════════

/**
 * Kiểm tra cooldown của người chơi cho một hành động
 * @param {number} playerId - ID người chơi (players.id)
 * @param {string} actionType - Loại hành động (VD: 'cultivate', 'tribulation')
 * @returns {{ onCooldown: boolean, remainingMs: number }}
 */
function checkCooldown(playerId, actionType) {
  const row = stmtGet.get(playerId, actionType);
  if (!row) return { onCooldown: false, remainingMs: 0 };

  const remaining = row.expires_at - Date.now();
  if (remaining <= 0) {
    // Cooldown đã hết → tự động dọn dẹp
    stmtDel.run(playerId, actionType);
    return { onCooldown: false, remainingMs: 0 };
  }

  return { onCooldown: true, remainingMs: remaining };
}

/**
 * Đặt cooldown cho người chơi
 * @param {number} playerId - ID người chơi
 * @param {string} actionType - Loại hành động
 * @param {number} durationMs - Thời gian cooldown (mili giây)
 */
function setCooldown(playerId, actionType, durationMs) {
  const expiresAt = Date.now() + durationMs;
  stmtSet.run(playerId, actionType, expiresAt);
}

/**
 * Xóa cooldown (mở khóa hành động ngay lập tức)
 * @param {number} playerId - ID người chơi
 * @param {string} actionType - Loại hành động
 */
function clearCooldown(playerId, actionType) {
  stmtDel.run(playerId, actionType);
}

/**
 * Đặt flag vĩnh viễn (dùng expires_at cực lớn)
 * Ví dụ: đánh dấu đã vượt kiếp nạn tại cảnh giới X
 * @param {number} playerId - ID người chơi
 * @param {string} flagName - Tên flag (VD: 'tribulation_passed:4')
 */
function setFlag(playerId, flagName) {
  stmtSet.run(playerId, flagName, PERMANENT_EXPIRES);
}

/**
 * Kiểm tra flag vĩnh viễn có tồn tại không
 * @param {number} playerId - ID người chơi
 * @param {string} flagName - Tên flag
 * @returns {boolean}
 */
function hasFlag(playerId, flagName) {
  const row = stmtGet.get(playerId, flagName);
  if (!row) return false;
  return row.expires_at > Date.now();
}

module.exports = {
  checkCooldown,
  setCooldown,
  clearCooldown,
  setFlag,
  hasFlag,
};
