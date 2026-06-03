/**
 * @file Spiritual Roots (Linh Căn) Configuration
 * @description Hệ thống linh căn - quyết định thiên phú tu luyện
 *
 * Mỗi tu sĩ có 1 loại linh căn (root type) khi tạo nhân vật:
 *   - Đơn Linh Căn: 1 nguyên tố, bonus mạnh nhất (59% chance)
 *   - Song Linh Căn: 2 nguyên tố, bonus vừa (30% chance)
 *   - Tam Linh Căn: 3 nguyên tố, bonus yếu hơn (10% chance)
 *   - Hỗn Độn Linh Căn: tất cả nguyên tố, siêu hiếm (1% chance)
 */

/**
 * @typedef {Object} SpiritualRoot
 * @property {string} id - ID duy nhất
 * @property {string} name - Tên linh căn
 * @property {string} emoji - Emoji đại diện
 * @property {string} element - Nguyên tố
 * @property {Object} bonuses - Các bonus khi sở hữu
 * @property {Object} weaknesses - Điểm yếu
 * @property {string} rarity - Độ hiếm
 * @property {string} dao_path_restriction - Giới hạn đạo (nếu có)
 * @property {string} description - Mô tả
 */

const roots = [
  {
    id: 'hoa',
    name: 'Hỏa Linh Căn',
    emoji: '🔥',
    element: 'fire',
    bonuses: {
      atk_percent: 15,
      fire_damage: 20,
      exp_bonus_fire_technique: 10,
    },
    weaknesses: {
      water_resistance: -15,
      def_percent: -5,
    },
    rarity: 'common',
    roll_weight: 18,
    dao_path_restriction: null,
    description: 'Linh căn thuộc tính Hỏa, thiên phú sát thương cháy bỏng. Tương khắc với Thủy.',
  },
  {
    id: 'thuy',
    name: 'Thủy Linh Căn',
    emoji: '💧',
    element: 'water',
    bonuses: {
      hp_percent: 10,
      water_damage: 20,
      heal_bonus: 15,
      exp_bonus_water_technique: 10,
    },
    weaknesses: {
      fire_resistance: -10,
      atk_percent: -5,
    },
    rarity: 'common',
    roll_weight: 18,
    dao_path_restriction: null,
    description: 'Linh căn thuộc tính Thủy, thiên phú hồi phục và phòng ngự. Tương khắc với Hỏa.',
  },
  {
    id: 'moc',
    name: 'Mộc Linh Căn',
    emoji: '🌿',
    element: 'wood',
    bonuses: {
      hp_regen: 15,
      heal_bonus: 20,
      alchemy_bonus: 15,
      exp_bonus_wood_technique: 10,
    },
    weaknesses: {
      fire_resistance: -15,
      speed_percent: -5,
    },
    rarity: 'common',
    roll_weight: 16,
    dao_path_restriction: null,
    description: 'Linh căn thuộc tính Mộc, thiên phú luyện đan và trị thương. Tương khắc với Kim (Hỏa).',
  },
  {
    id: 'loi',
    name: 'Lôi Linh Căn',
    emoji: '⚡',
    element: 'thunder',
    bonuses: {
      speed_percent: 15,
      thunder_damage: 25,
      crit_rate: 5,
      exp_bonus_thunder_technique: 10,
    },
    weaknesses: {
      def_percent: -10,
      hp_percent: -5,
    },
    rarity: 'uncommon',
    roll_weight: 12,
    dao_path_restriction: null,
    description: 'Linh căn thuộc tính Lôi, tốc độ vượt trội và sát thương bùng nổ. Hiếm và mạnh.',
  },
  {
    id: 'tho',
    name: 'Thổ Linh Căn',
    emoji: '🪨',
    element: 'earth',
    bonuses: {
      def_percent: 20,
      hp_percent: 15,
      earth_damage: 15,
      exp_bonus_earth_technique: 10,
    },
    weaknesses: {
      speed_percent: -10,
      crit_rate: -3,
    },
    rarity: 'common',
    roll_weight: 16,
    dao_path_restriction: null,
    description: 'Linh căn thuộc tính Thổ, phòng ngự vững như bàn thạch. Chậm nhưng khó bị đánh bại.',
  },
  {
    id: 'phong',
    name: 'Phong Linh Căn',
    emoji: '🌪️',
    element: 'wind',
    bonuses: {
      speed_percent: 25,
      dodge_rate: 10,
      wind_damage: 15,
      exp_bonus_wind_technique: 10,
    },
    weaknesses: {
      def_percent: -10,
      hp_percent: -5,
    },
    rarity: 'uncommon',
    roll_weight: 10,
    dao_path_restriction: null,
    description: 'Linh căn thuộc tính Phong, nhanh như gió, lại vô hình. Thiên phú né tránh.',
  },
  {
    id: 'bang',
    name: 'Băng Linh Căn',
    emoji: '❄️',
    element: 'ice',
    bonuses: {
      ice_damage: 20,
      slow_chance: 15,
      mana_percent: 10,
      exp_bonus_ice_technique: 10,
    },
    weaknesses: {
      fire_resistance: -20,
      speed_percent: -5,
    },
    rarity: 'uncommon',
    roll_weight: 10,
    dao_path_restriction: null,
    description: 'Linh căn thuộc tính Băng, đóng băng vạn vật. Kết hợp giữa công và khống chế.',
  },
  {
    id: 'am',
    name: 'Âm Linh Căn',
    emoji: '🌑',
    element: 'dark',
    bonuses: {
      dark_damage: 25,
      life_steal: 10,
      debuff_bonus: 15,
      exp_bonus_dark_technique: 15,
    },
    weaknesses: {
      light_resistance: -20,
      heal_bonus: -10,
    },
    rarity: 'rare',
    roll_weight: 6,
    dao_path_restriction: 'ma_dao',
    description: 'Linh căn thuộc tính Âm, chỉ dành cho Ma Đạo tu sĩ. Hấp thu sinh lực kẻ địch.',
  },
  {
    id: 'quang',
    name: 'Quang Linh Căn',
    emoji: '✨',
    element: 'light',
    bonuses: {
      light_damage: 20,
      heal_bonus: 20,
      purify_chance: 10,
      exp_bonus_light_technique: 15,
    },
    weaknesses: {
      dark_resistance: -15,
      atk_percent: -5,
    },
    rarity: 'rare',
    roll_weight: 6,
    dao_path_restriction: 'chinh_dao',
    description: 'Linh căn thuộc tính Quang, ánh sáng tịnh hóa. Thiên phú trị liệu và tẩy tà.',
  },
  {
    id: 'hon_don',
    name: 'Hỗn Độn Linh Căn',
    emoji: '🌀',
    element: 'chaos',
    bonuses: {
      all_damage: 15,
      all_resistance: 10,
      exp_bonus_all: 10,
      crit_rate: 5,
      crit_damage: 10,
    },
    weaknesses: {},
    rarity: 'mythic',
    roll_weight: 1,
    dao_path_restriction: null,
    description: 'Linh căn tối thượng chứa đựng vạn vật. Thiên tài vạn năm mới xuất hiện một lần. Không có điểm yếu nguyên tố.',
  },
];

/**
 * Loại linh căn (số nguyên tố kết hợp)
 */
const rootTypes = {
  don: {
    id: 'don',
    name: 'Đơn Linh Căn',
    element_count: 1,
    chance: 59,
    bonus_multiplier: 1.0,
    description: 'Một nguyên tố duy nhất, sức mạnh tập trung tối đa.',
  },
  song: {
    id: 'song',
    name: 'Song Linh Căn',
    element_count: 2,
    chance: 30,
    bonus_multiplier: 0.7,
    description: 'Hai nguyên tố kết hợp, linh hoạt nhưng bonus mỗi nguyên tố giảm 30%.',
  },
  tam: {
    id: 'tam',
    name: 'Tam Linh Căn',
    element_count: 3,
    chance: 10,
    bonus_multiplier: 0.5,
    description: 'Ba nguyên tố kết hợp, đa dạng nhất nhưng bonus mỗi nguyên tố giảm 50%.',
  },
  hon_don: {
    id: 'hon_don',
    name: 'Hỗn Độn Linh Căn',
    element_count: 'all',
    chance: 1,
    bonus_multiplier: 0.8,
    description: 'Tất cả nguyên tố, thiên phú tối thượng. Chỉ có Hỗn Độn Linh Căn.',
  },
};

/**
 * Bảng tương khắc nguyên tố
 * key khắc value (gây thêm 25% sát thương)
 */
const elementCounters = {
  fire: 'ice',
  ice: 'wind',
  wind: 'earth',
  earth: 'thunder',
  thunder: 'water',
  water: 'fire',
  wood: 'earth',
  light: 'dark',
  dark: 'light',
  chaos: null, // Hỗn Độn không bị khắc
};

module.exports = {
  roots,
  list: roots, // Alias for menu compatibility
  rootTypes,
  elementCounters,

  /**
   * Lấy linh căn theo id
   * @param {string} id
   */
  getRootById(id) {
    return roots.find(r => r.id === id);
  },

  /**
   * Roll ngẫu nhiên một linh căn
   * @returns {object}
   */
  rollRoot() {
    const totalWeight = roots.reduce((sum, r) => sum + r.roll_weight, 0);
    let roll = Math.random() * totalWeight;
    for (const root of roots) {
      roll -= root.roll_weight;
      if (roll <= 0) return root;
    }
    return roots[0];
  },

  /**
   * Roll loại linh căn
   * @returns {object}
   */
  rollRootType() {
    const roll = Math.random() * 100;
    if (roll < 1) return rootTypes.hon_don;
    if (roll < 11) return rootTypes.tam;
    if (roll < 41) return rootTypes.song;
    return rootTypes.don;
  },
};
