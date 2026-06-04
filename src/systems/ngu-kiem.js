/**
 * @file Ngự Kiếm — Sword Riding / Exploration System
 * @description Hệ thống ngự kiếm phi hành & khám phá map:
 *   - Mở khóa khi có Kiếm Tu path
 *   - Khám phá locations trên bản đồ
 *   - Trigger Kỳ Ngộ khi bay
 *   - Mỗi location có quái, NPC, sự kiện riêng
 *   - Tốc độ bay phụ thuộc realm + weapon type
 *
 * Game gốc: ngự kiếm phi hành là cốt lõi gameplay
 */

const db = require('../database/connection');
const { randomInt, chance } = require('../utils/helpers');

// ═══════════════════════════════════════════
//  LOCATIONS MAP
// ═══════════════════════════════════════════

const LOCATIONS = [
  // ═══ CÁC KHU VỰC MỚI BẮT ĐẦU ═══
  {
    id: 'tieu_nhan_tran',
    name: '🏘️ Tiểu Nhân Trấn',
    description: 'Nơi bắt đầu hành trình tu tiên. Có thương nhân, NPC, và quái cấp thấp.',
    realm_required: 0,
    emoji: '🏘️',
    features: ['shop', 'npc', 'hunt'],
    ky_ngo_chance: 5,
    monsters_realm: [0, 1],
  },
  {
    id: 'van_thu_lam',
    name: '🌲 Vạn Thụ Lâm',
    description: 'Rừng cổ thụ đầy linh khí. Nơi tu luyện lý tưởng cho Mộc hệ.',
    realm_required: 0,
    emoji: '🌲',
    features: ['hunt', 'gather', 'ky_ngo'],
    ky_ngo_chance: 12,
    monsters_realm: [0, 2],
    element_bonus: 'wood',
  },
  {
    id: 'bach_vu_son',
    name: '⛰️ Bạch Vụ Sơn',
    description: 'Ngọn núi quanh năm sương mù. Ẩn chứa nhiều bí ẩn.',
    realm_required: 1,
    emoji: '⛰️',
    features: ['hunt', 'boss', 'ky_ngo'],
    ky_ngo_chance: 15,
    monsters_realm: [1, 3],
  },
  {
    id: 'thanh_phong_coc',
    name: '🏯 Thanh Phong Cốc',
    description: 'Thung lũng yên bình, nơi các tông phái thường tập hợp.',
    realm_required: 2,
    emoji: '🏯',
    features: ['shop', 'sect', 'luan_dao', 'ti_vo'],
    ky_ngo_chance: 8,
    monsters_realm: [2, 4],
  },

  // ═══ TRUNG CẤP ═══
  {
    id: 'huyet_ngoc_dong',
    name: '🔴 Huyết Ngọc Động',
    description: 'Hang động đầy máu ngọc. Ma Đạo tu sĩ tụ tập.',
    realm_required: 3,
    emoji: '🔴',
    features: ['hunt', 'boss', 'gather'],
    ky_ngo_chance: 18,
    monsters_realm: [3, 5],
    element_bonus: 'dark',
    danger_level: 'high',
  },
  {
    id: 'thien_loi_trach',
    name: '⚡ Thiên Lôi Trạch',
    description: 'Đầm sét liên tục! Lý tưởng cho Lôi hệ tu luyện.',
    realm_required: 4,
    emoji: '⚡',
    features: ['hunt', 'tribulation', 'ky_ngo'],
    ky_ngo_chance: 20,
    monsters_realm: [4, 6],
    element_bonus: 'thunder',
    danger_level: 'extreme',
  },
  {
    id: 'kiem_mu_son',
    name: '🗡️ Kiếm Mộ Sơn',
    description: 'Ngọn núi chôn vùi hàng vạn thanh kiếm cổ. Kiếm ý ngút trời.',
    realm_required: 5,
    emoji: '🗡️',
    features: ['hunt', 'boss', 'ky_ngo', 'sword_treasure'],
    ky_ngo_chance: 25,
    monsters_realm: [5, 7],
    weapon_bonus: 'Kiếm',
  },

  // ═══ CAO CẤP ═══
  {
    id: 'cuu_u_hai',
    name: '🌊 Cửu U Hải',
    description: 'Biển sâu thăm thẳm, ẩn chứa rồng cổ và thần bảo.',
    realm_required: 6,
    emoji: '🌊',
    features: ['hunt', 'boss', 'gather', 'ky_ngo'],
    ky_ngo_chance: 22,
    monsters_realm: [6, 8],
    element_bonus: 'water',
    danger_level: 'extreme',
  },
  {
    id: 'hon_don_bi_canh',
    name: '🌀 Hỗn Độn Bí Cảnh',
    description: 'Không gian hỗn độn, quy luật bất ổn. Chỉ dành cho đỉnh cao.',
    realm_required: 8,
    emoji: '🌀',
    features: ['boss', 'ky_ngo', 'legendary_treasure'],
    ky_ngo_chance: 35,
    monsters_realm: [8, 10],
    danger_level: 'death',
  },
  {
    id: 'thuong_gioi',
    name: '☁️ Thượng Giới',
    description: 'Cánh cổng dẫn đến thế giới bên trên. Phi thăng cực đỉnh.',
    realm_required: 10,
    emoji: '☁️',
    features: ['boss', 'ky_ngo', 'ascension'],
    ky_ngo_chance: 40,
    monsters_realm: [10, 12],
    danger_level: 'divine',
  },
];

// ═══════════════════════════════════════════
//  TRAVEL SYSTEM
// ═══════════════════════════════════════════

/**
 * Lấy danh sách locations có thể đi
 * @param {Object} player - Player DB row
 * @returns {Array} Available locations
 */
function getAvailableLocations(player) {
  return LOCATIONS.filter(loc => (player.realm_index || 0) >= loc.realm_required);
}

/**
 * Tính thời gian bay (phút)
 * @param {Object} player - Player DB row
 * @param {Object} fromLoc - Location hiện tại
 * @param {Object} toLoc - Location đích
 * @returns {number} Phút
 */
function calculateTravelTime(player, fromLoc, toLoc) {
  const baseTime = Math.abs(
    (LOCATIONS.indexOf(toLoc) || 0) - (LOCATIONS.indexOf(fromLoc) || 0)
  ) * 5; // 5 phút per khoảng cách

  let speedMult = 1.0;

  // Realm reduces travel time
  speedMult -= (player.realm_index || 0) * 0.05;

  // Kiếm Tu gets bonus speed
  if (player.weapon_type === 'Kiếm') speedMult -= 0.15;

  // Speed stat
  speedMult -= Math.min(0.3, (player.speed || 0) / 500);

  return Math.max(1, Math.floor(baseTime * Math.max(0.2, speedMult)));
}

/**
 * Lấy location hiện tại của player
 */
function getPlayerLocation(playerId) {
  const row = db.prepare(
    'SELECT current_location FROM players WHERE id = ?'
  ).get(playerId);
  const locId = row?.current_location || 'tieu_nhan_tran';
  return LOCATIONS.find(l => l.id === locId) || LOCATIONS[0];
}

/**
 * Set player location
 */
function setPlayerLocation(playerId, locationId) {
  db.prepare('UPDATE players SET current_location = ? WHERE id = ?').run(locationId, playerId);
}

/**
 * Check encounters khi bay qua location
 */
function checkTravelEncounter(player, location) {
  const kyNgoChance = location.ky_ngo_chance || 10;
  const vanKhiBonus = ((player.van_khi || 80) - 80) * 0.1;
  return chance(kyNgoChance + vanKhiBonus);
}

/**
 * Lấy bonus element cho location
 */
function getLocationBonus(location, player) {
  const bonuses = {};
  if (location.element_bonus && player.element === location.element_bonus) {
    bonuses.exp_mult = 1.2;
    bonuses.gather_mult = 1.3;
  }
  if (location.weapon_bonus && player.weapon_type === location.weapon_bonus) {
    bonuses.damage_mult = 1.15;
    bonuses.ky_ngo_bonus = 5;
  }
  return bonuses;
}

module.exports = {
  LOCATIONS,
  getAvailableLocations,
  calculateTravelTime,
  getPlayerLocation,
  setPlayerLocation,
  checkTravelEncounter,
  getLocationBonus,
};
