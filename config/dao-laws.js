/**
 * @file Dao Laws (Đạo Pháp) Configuration
 * @description 8 đạo pháp lĩnh ngộ, mỗi đạo có 10 cấp
 *
 * Đạo pháp là luật tắc trời đất mà tu sĩ lĩnh ngộ.
 * Mỗi tu sĩ tối đa lĩnh ngộ 3 đạo pháp.
 * Mỗi cấp đạo pháp cần tu luyện + chiêm ngộ (meditate).
 * dao_path_restriction: null = ai cũng học được, 'ma_dao' = chỉ Ma Đạo
 */

const daoLaws = [
  {
    id: 'hoa_dao',
    name: 'Hỏa Đạo',
    emoji: '🔥',
    min_realm: 5,
    max_level: 10,
    bonuses_per_level: {
      fire_damage: 5,
      atk_percent: 2,
      crit_rate: 0.5,
    },
    special_effect: {
      name: 'Hỏa Đạo Chân Ý',
      description: 'Lv5: Tự động thiêu đốt kẻ địch (3% ATK/lượt, 3 lượt). Lv10: Triệu hoán Chân Hỏa bất diệt, miễn nhiễm Băng.',
      level_5: { burn_on_hit: true, burn_percent: 3, burn_duration: 3 },
      level_10: { fire_immunity: true, ice_immunity: true, burn_percent: 6 },
    },
    dao_path_restriction: null,
    exp_per_level: [1000, 3000, 9000, 27000, 81000, 243000, 729000, 2187000, 6561000, 19683000],
    description: 'Lĩnh ngộ bản chất của lửa - hủy diệt và tái sinh. Hỏa Đạo viên mãn, vạn hỏa không xâm.',
  },
  {
    id: 'thuy_dao',
    name: 'Thủy Đạo',
    emoji: '💧',
    min_realm: 5,
    max_level: 10,
    bonuses_per_level: {
      water_damage: 4,
      hp_percent: 3,
      heal_bonus: 3,
    },
    special_effect: {
      name: 'Thủy Đạo Chân Ý',
      description: 'Lv5: Hồi 2% HP mỗi lượt. Lv10: Thủy Đạo bất diệt - khi HP dưới 10%, hồi 30% HP (1 lần/trận).',
      level_5: { hp_regen_percent: 2 },
      level_10: { emergency_heal_percent: 30, emergency_heal_threshold: 10 },
    },
    dao_path_restriction: null,
    exp_per_level: [1000, 3000, 9000, 27000, 81000, 243000, 729000, 2187000, 6561000, 19683000],
    description: 'Lĩnh ngộ bản chất của nước - nhu nhược thắng cương cường. Thủy Đạo viên mãn, bất tử trường sinh.',
  },
  {
    id: 'loi_dao',
    name: 'Lôi Đạo',
    emoji: '⚡',
    min_realm: 5,
    max_level: 10,
    bonuses_per_level: {
      thunder_damage: 5,
      speed_percent: 2,
      crit_damage: 2,
    },
    special_effect: {
      name: 'Lôi Đạo Chân Ý',
      description: 'Lv5: Tấn công có 10% kích hoạt Lôi Kích phụ (50% ATK). Lv10: Thiên Lôi hộ thể - phản 20% sát thương dạng Lôi.',
      level_5: { chain_lightning_chance: 10, chain_damage_percent: 50 },
      level_10: { thunder_reflect_percent: 20, speed_bonus: 15 },
    },
    dao_path_restriction: null,
    exp_per_level: [1200, 3600, 10800, 32400, 97200, 291600, 874800, 2624400, 7873200, 23619600],
    description: 'Lĩnh ngộ bản chất của sấm sét - tốc độ và hủy diệt. Lôi Đạo viên mãn, thiên lôi bất xâm.',
  },
  {
    id: 'khong_gian_dao',
    name: 'Không Gian Đạo',
    emoji: '🌀',
    min_realm: 10,
    max_level: 10,
    bonuses_per_level: {
      dodge_rate: 2,
      speed_percent: 3,
      all_damage: 1,
    },
    special_effect: {
      name: 'Không Gian Chân Ý',
      description: 'Lv5: Dịch chuyển tức thì, né tránh +20%. Lv10: Không Gian Giam Cầm - nhốt kẻ địch 2 lượt (bỏ qua miễn nhiễm).',
      level_5: { dodge_bonus: 20 },
      level_10: { space_prison_duration: 2, bypass_immunity: true },
    },
    dao_path_restriction: null,
    exp_per_level: [5000, 15000, 45000, 135000, 405000, 1215000, 3645000, 10935000, 32805000, 98415000],
    description: 'Lĩnh ngộ bản chất không gian - đi lại tự tại, co giãn vũ trụ. Cực kỳ hiếm gặp tu sĩ lĩnh ngộ.',
  },
  {
    id: 'thoi_gian_dao',
    name: 'Thời Gian Đạo',
    emoji: '⏳',
    min_realm: 12,
    max_level: 10,
    bonuses_per_level: {
      speed_percent: 4,
      cooldown_reduction: 1,
      exp_bonus: 2,
    },
    special_effect: {
      name: 'Thời Gian Chân Ý',
      description: 'Lv5: Giảm 20% cooldown tất cả kỹ năng. Lv10: Thời Gian Đình Trệ - dừng thời gian 1 lượt (1 lần/trận).',
      level_5: { cooldown_reduction_percent: 20 },
      level_10: { time_stop_turns: 1, uses_per_battle: 1 },
    },
    dao_path_restriction: null,
    exp_per_level: [8000, 24000, 72000, 216000, 648000, 1944000, 5832000, 17496000, 52488000, 157464000],
    description: 'Lĩnh ngộ bản chất thời gian - quá khứ, hiện tại, tương lai. Đạo pháp tối thượng, khó lĩnh ngộ nhất.',
  },
  {
    id: 'tu_vong_dao',
    name: 'Tử Vong Đạo',
    emoji: '💀',
    min_realm: 8,
    max_level: 10,
    bonuses_per_level: {
      dark_damage: 5,
      life_steal: 2,
      atk_percent: 2,
    },
    special_effect: {
      name: 'Tử Vong Chân Ý',
      description: 'Lv5: Hạ gục kẻ địch hồi 15% HP. Lv10: Tử Thần Giáng Lâm - kẻ địch HP dưới 15% bị xử tử tức thì.',
      level_5: { kill_heal_percent: 15 },
      level_10: { execute_threshold: 15 },
    },
    dao_path_restriction: 'ma_dao',
    exp_per_level: [2000, 6000, 18000, 54000, 162000, 486000, 1458000, 4374000, 13122000, 39366000],
    description: 'Lĩnh ngộ bản chất tử vong - sinh tử luân hồi. Chỉ Ma Đạo tu sĩ mới dám lĩnh ngộ con đường chết chóc này.',
  },
  {
    id: 'sang_tao_dao',
    name: 'Sáng Tạo Đạo',
    emoji: '✨',
    min_realm: 10,
    max_level: 10,
    bonuses_per_level: {
      all_damage: 2,
      hp_percent: 2,
      mana_percent: 3,
    },
    special_effect: {
      name: 'Sáng Tạo Chân Ý',
      description: 'Lv5: Luyện đan/chế tạo thành công +20%. Lv10: Sáng Tạo Thế Giới - tạo không gian chiến đấu riêng, tăng 30% toàn chỉ số.',
      level_5: { craft_success_bonus: 20 },
      level_10: { create_domain: true, all_stats_bonus: 30 },
    },
    dao_path_restriction: null,
    exp_per_level: [5000, 15000, 45000, 135000, 405000, 1215000, 3645000, 10935000, 32805000, 98415000],
    description: 'Lĩnh ngộ bản chất sáng tạo - từ hư vô tạo vạn vật. Đạo pháp dành cho những kẻ khao khát sáng tạo.',
  },
  {
    id: 'hon_don_dao',
    name: 'Hỗn Độn Đạo',
    emoji: '🌌',
    min_realm: 15,
    max_level: 10,
    bonuses_per_level: {
      all_damage: 3,
      all_resistance: 2,
      hp_percent: 2,
      atk_percent: 2,
      def_percent: 2,
    },
    special_effect: {
      name: 'Hỗn Độn Chân Ý',
      description: 'Lv5: Mọi kỹ năng gây thêm Hỗn Độn sát thương (5% ATK). Lv10: Hỗn Độn Chủ Tể - miễn nhiễm mọi nguyên tố, sát thương Hỗn Độn bỏ qua mọi kháng.',
      level_5: { chaos_bonus_damage_percent: 5 },
      level_10: { all_element_immunity: true, chaos_ignore_resistance: true },
    },
    dao_path_restriction: null,
    exp_per_level: [10000, 30000, 90000, 270000, 810000, 2430000, 7290000, 21870000, 65610000, 196830000],
    description: 'Đạo pháp tối cao nhất - Hỗn Độn là nguồn gốc vạn vật. Chỉ thiên tài tuyệt thế mới có thể lĩnh ngộ.',
  },
];

module.exports = {
  daoLaws,
  list: daoLaws, // Alias for menu compatibility

  /**
   * Lấy đạo pháp theo id
   */
  getDaoById(id) {
    return daoLaws.find(d => d.id === id);
  },

  /**
   * Lấy đạo pháp khả dụng tại realm
   */
  getAvailableAt(realmOrder, daoPath) {
    return daoLaws.filter(d =>
      d.min_realm <= realmOrder &&
      (d.dao_path_restriction === null || d.dao_path_restriction === daoPath)
    );
  },

  /**
   * Tính exp cần cho cấp tiếp theo
   */
  getExpForLevel(daoId, currentLevel) {
    const dao = daoLaws.find(d => d.id === daoId);
    if (!dao || currentLevel >= dao.max_level) return null;
    return dao.exp_per_level[currentLevel];
  },

  /**
   * Tính bonus tại cấp cụ thể
   */
  getBonusesAtLevel(daoId, level) {
    const dao = daoLaws.find(d => d.id === daoId);
    if (!dao) return {};
    const bonuses = {};
    for (const [key, value] of Object.entries(dao.bonuses_per_level)) {
      bonuses[key] = value * level;
    }
    return bonuses;
  },
};
