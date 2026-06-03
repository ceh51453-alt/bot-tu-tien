/**
 * @file Tribulations (Kiếp Nạn) Configuration
 * @description Dữ liệu kiếp nạn - thử thách khi đột phá cảnh giới
 *
 * Mỗi kiếp nạn có:
 *   - waves: số đợt sấm sét / thử thách
 *   - hp_damage_per_wave: % HP thiệt hại mỗi đợt
 *   - success_rate_base: tỉ lệ thành công cơ bản (%)
 *   - rewards: phần thưởng khi vượt qua
 *   - failure_penalty: hậu quả thất bại
 *
 * Kiếp nạn xuất hiện khi tu sĩ cố gắng đột phá lên cảnh giới mới
 * có yêu cầu tribulation trong realms.js
 */

const tribulations = [
  {
    id: 'tieu_kiep',
    name: 'Tiểu Kiếp',
    emoji: '⛈️',
    difficulty: 1,
    realm_trigger: 4,  // Nguyên Anh
    waves: 3,
    hp_damage_per_wave: 15,
    mana_drain_per_wave: 10,
    success_rate_base: 80,
    time_limit_seconds: 60,
    rewards: {
      exp_multiplier: 2.0,
      spirit_stones: 500,
      items: [
        { item_id: 'kiep_loi_tinh', chance: 0.3, count: 1 },
        { item_id: 'bao_dan', chance: 0.2, count: 1 },
      ],
    },
    failure_penalty: {
      exp_loss_percent: 10,
      hp_loss_percent: 50,
      realm_drop: false,
      injury_duration_minutes: 30,
    },
    special_mechanic: null,
    description: 'Tiểu Kiếp - 3 đợt thiên lôi nhẹ. Thử thách đầu tiên trên con đường tu tiên. Thất bại sẽ mất exp và bị thương.',
  },
  {
    id: 'trung_kiep',
    name: 'Trung Kiếp',
    emoji: '🌩️',
    difficulty: 3,
    realm_trigger: 7,  // Hợp Thể
    waves: 5,
    hp_damage_per_wave: 18,
    mana_drain_per_wave: 12,
    success_rate_base: 65,
    time_limit_seconds: 90,
    rewards: {
      exp_multiplier: 3.0,
      spirit_stones: 2000,
      items: [
        { item_id: 'kiep_loi_tinh', chance: 0.4, count: 2 },
        { item_id: 'thanh_dan', chance: 0.15, count: 1 },
      ],
    },
    failure_penalty: {
      exp_loss_percent: 15,
      hp_loss_percent: 70,
      realm_drop: false,
      injury_duration_minutes: 60,
    },
    special_mechanic: {
      name: 'Phong Bão Kiếp',
      description: 'Đợt 3 và 5 kèm theo bão gió giảm tốc, giảm 20% speed.',
      waves_affected: [3, 5],
      effect: { speed_reduction: 20 },
    },
    description: 'Trung Kiếp - 5 đợt sấm sét mãnh liệt. Bao gồm phong bão kiếp ở đợt 3 và 5.',
  },
  {
    id: 'dai_kiep',
    name: 'Đại Kiếp',
    emoji: '⚡',
    difficulty: 5,
    realm_trigger: 8,  // Độ Kiếp
    waves: 7,
    hp_damage_per_wave: 20,
    mana_drain_per_wave: 15,
    success_rate_base: 50,
    time_limit_seconds: 120,
    rewards: {
      exp_multiplier: 4.0,
      spirit_stones: 5000,
      items: [
        { item_id: 'kiep_loi_tinh', chance: 0.5, count: 3 },
        { item_id: 'thanh_dan', chance: 0.2, count: 1 },
        { item_id: 'thanh_long_kiem', chance: 0.05, count: 1 },
      ],
    },
    failure_penalty: {
      exp_loss_percent: 20,
      hp_loss_percent: 80,
      realm_drop: true,
      realm_drop_levels: 1,
      injury_duration_minutes: 120,
    },
    special_mechanic: {
      name: 'Cửu Thiên Lôi',
      description: 'Đợt cuối cùng (7) triệu hồi 9 tia sét liên hoàn, gây gấp 3 sát thương.',
      waves_affected: [7],
      effect: { damage_multiplier: 3.0 },
    },
    description: 'Đại Kiếp - 9 đợt thiên lôi hung dữ. Đợt cuối 9 tia sét liên hoàn. Thất bại có thể rơi cảnh giới!',
  },
  {
    id: 'tien_kiep',
    name: 'Tiên Kiếp',
    emoji: '🌟',
    difficulty: 7,
    realm_trigger: 9,  // Bán Tiên
    waves: 9,
    hp_damage_per_wave: 22,
    mana_drain_per_wave: 18,
    success_rate_base: 40,
    time_limit_seconds: 150,
    rewards: {
      exp_multiplier: 5.0,
      spirit_stones: 15000,
      items: [
        { item_id: 'kiep_loi_tinh', chance: 0.6, count: 5 },
        { item_id: 'tien_dan', chance: 0.15, count: 1 },
        { item_id: 'thuong_co_tinh_huyet', chance: 0.1, count: 1 },
      ],
    },
    failure_penalty: {
      exp_loss_percent: 25,
      hp_loss_percent: 90,
      realm_drop: true,
      realm_drop_levels: 2,
      injury_duration_minutes: 240,
    },
    special_mechanic: {
      name: 'Tiên Giới Thử Thách',
      description: 'Mỗi 3 đợt xuất hiện Kiếp Lôi Thú cần đánh bại. Đợt 9 là Thiên Đạo Lôi.',
      waves_affected: [3, 6, 9],
      effect: { summon_beast: 'kiep_loi_thu', final_wave_bonus: true },
    },
    description: 'Tiên Kiếp - 9 đợt thử thách khắc nghiệt nhất của Phàm Giới. Cửa ải cuối cùng trước khi thành Tiên.',
  },
  {
    id: 'tien_loi_kiep',
    name: 'Tiên Lôi Kiếp',
    emoji: '🔥',
    difficulty: 9,
    realm_trigger: 12,  // Ất Tiên
    waves: 9,
    hp_damage_per_wave: 25,
    mana_drain_per_wave: 20,
    success_rate_base: 35,
    time_limit_seconds: 180,
    rewards: {
      exp_multiplier: 6.0,
      spirit_stones: 50000,
      items: [
        { item_id: 'tien_dan', chance: 0.3, count: 2 },
        { item_id: 'thuong_co_tinh_huyet', chance: 0.2, count: 2 },
        { item_id: 'than_tinh', chance: 0.05, count: 1 },
      ],
    },
    failure_penalty: {
      exp_loss_percent: 30,
      hp_loss_percent: 95,
      realm_drop: true,
      realm_drop_levels: 2,
      injury_duration_minutes: 480,
    },
    special_mechanic: {
      name: 'Tiên Lôi Liên Hoàn',
      description: 'Sét Tiên liên hoàn, mỗi đợt mạnh hơn 10% đợt trước. Đợt 9 là Hỏa Thiên Lôi.',
      escalation_percent: 10,
      final_element: 'fire',
    },
    description: 'Tiên Lôi Kiếp - sấm sét Tiên Giới, mỗi đợt mạnh hơn đợt trước. Hỏa Thiên Lôi ở đợt cuối.',
  },
  {
    id: 'tien_ton_kiep',
    name: 'Tiên Tôn Kiếp',
    emoji: '⭐',
    difficulty: 11,
    realm_trigger: 15,  // Tiên Tôn
    waves: 12,
    hp_damage_per_wave: 22,
    mana_drain_per_wave: 18,
    success_rate_base: 30,
    time_limit_seconds: 240,
    rewards: {
      exp_multiplier: 8.0,
      spirit_stones: 200000,
      items: [
        { item_id: 'tien_dan', chance: 0.5, count: 3 },
        { item_id: 'than_tinh', chance: 0.15, count: 1 },
      ],
    },
    failure_penalty: {
      exp_loss_percent: 30,
      hp_loss_percent: 95,
      realm_drop: true,
      realm_drop_levels: 3,
      injury_duration_minutes: 720,
    },
    special_mechanic: {
      name: 'Tiên Tôn Thử Luyện',
      description: '12 đợt thử thách kết hợp thiên lôi và tâm ma. Đợt 6 và 12 là tâm ma kiếp.',
      waves_affected: [6, 12],
      effect: { mind_attack: true, will_check: true },
    },
    description: 'Tiên Tôn Kiếp - 12 đợt thử thách thể xác và tinh thần. Tâm ma kiếp thử thách ý chí.',
  },
  {
    id: 'thanh_kiep',
    name: 'Thánh Kiếp',
    emoji: '🏛️',
    difficulty: 13,
    realm_trigger: 16,  // Tiên Đế
    waves: 15,
    hp_damage_per_wave: 20,
    mana_drain_per_wave: 15,
    success_rate_base: 25,
    time_limit_seconds: 300,
    rewards: {
      exp_multiplier: 10.0,
      spirit_stones: 500000,
      items: [
        { item_id: 'tien_dan', chance: 0.6, count: 5 },
        { item_id: 'than_tinh', chance: 0.25, count: 2 },
        { item_id: 'hon_don_tinh', chance: 0.03, count: 1 },
      ],
    },
    failure_penalty: {
      exp_loss_percent: 35,
      hp_loss_percent: 99,
      realm_drop: true,
      realm_drop_levels: 3,
      injury_duration_minutes: 1440,
    },
    special_mechanic: {
      name: 'Thánh Đạo Kiếp',
      description: 'Kiếp nạn mở cửa Thánh Giới. 15 đợt bao gồm Thiên Lôi, Hỏa Kiếp, và Phong Kiếp. Đợt 15 tất cả hợp nhất.',
      phases: [
        { waves: [1, 2, 3, 4, 5], type: 'thunder' },
        { waves: [6, 7, 8, 9, 10], type: 'fire' },
        { waves: [11, 12, 13, 14], type: 'wind' },
        { waves: [15], type: 'combined' },
      ],
    },
    description: 'Thánh Kiếp - cửa ải từ Tiên Giới lên Thánh Giới. 15 đợt 3 loại kiếp nạn hợp nhất.',
  },
  {
    id: 'thanh_loi_kiep',
    name: 'Thánh Lôi Kiếp',
    emoji: '🌠',
    difficulty: 15,
    realm_trigger: 19,  // Tiểu Thánh
    waves: 18,
    hp_damage_per_wave: 18,
    mana_drain_per_wave: 12,
    success_rate_base: 20,
    time_limit_seconds: 360,
    rewards: {
      exp_multiplier: 12.0,
      spirit_stones: 1000000,
      items: [
        { item_id: 'than_tinh', chance: 0.4, count: 3 },
        { item_id: 'hon_don_tinh', chance: 0.08, count: 1 },
      ],
    },
    failure_penalty: {
      exp_loss_percent: 40,
      hp_loss_percent: 99,
      realm_drop: true,
      realm_drop_levels: 4,
      injury_duration_minutes: 2880,
    },
    special_mechanic: {
      name: 'Thánh Lôi Cửu Thiên',
      description: 'Sấm sét Thánh cấp, mỗi tia đều mang uy áp thiên đạo. Áp chế mọi pháp thuật dưới Thánh cấp.',
      suppress_skills_below: 'thanh',
    },
    description: 'Thánh Lôi Kiếp - sấm sét thánh cấp áp chế mọi thứ. Cần sức mạnh Thánh cấp mới chống nổi.',
  },
  {
    id: 'thanh_vuong_kiep',
    name: 'Thánh Vương Kiếp',
    emoji: '🦁',
    difficulty: 17,
    realm_trigger: 22,  // Thánh Vương
    waves: 21,
    hp_damage_per_wave: 16,
    mana_drain_per_wave: 10,
    success_rate_base: 15,
    time_limit_seconds: 420,
    rewards: {
      exp_multiplier: 15.0,
      spirit_stones: 5000000,
      items: [
        { item_id: 'than_tinh', chance: 0.6, count: 5 },
        { item_id: 'hon_don_tinh', chance: 0.15, count: 1 },
      ],
    },
    failure_penalty: {
      exp_loss_percent: 45,
      hp_loss_percent: 99,
      realm_drop: true,
      realm_drop_levels: 5,
      injury_duration_minutes: 4320,
    },
    special_mechanic: {
      name: 'Vương Giả Chi Kiếp',
      description: 'Kiếp nạn xứng tầm Vương giả. Thiên Đạo hóa hình thách đấu, phải đánh bại Thiên Đạo Hóa Thân.',
      summon_avatar: true,
      avatar_power_multiplier: 1.5,
    },
    description: 'Thánh Vương Kiếp - Thiên Đạo hóa hình thách đấu Vương giả. Phải đánh bại phân thân Thiên Đạo.',
  },
  {
    id: 'thanh_hoang_kiep',
    name: 'Thánh Hoàng Kiếp',
    emoji: '🐉',
    difficulty: 19,
    realm_trigger: 24,  // Thánh Hoàng
    waves: 27,
    hp_damage_per_wave: 14,
    mana_drain_per_wave: 8,
    success_rate_base: 10,
    time_limit_seconds: 540,
    rewards: {
      exp_multiplier: 20.0,
      spirit_stones: 20000000,
      items: [
        { item_id: 'hon_don_tinh', chance: 0.3, count: 3 },
        { item_id: 'than_tinh', chance: 0.8, count: 10 },
      ],
    },
    failure_penalty: {
      exp_loss_percent: 50,
      hp_loss_percent: 100,
      realm_drop: true,
      realm_drop_levels: 5,
      death_chance: 10,
      injury_duration_minutes: 7200,
    },
    special_mechanic: {
      name: 'Hoàng Đạo Kiếp',
      description: '27 đợt kiếp nạn Hoàng cấp. Đợt cuối triệu hồi Cổ Thiên Đạo hủy diệt. Có 10% tử vong nếu thất bại.',
      final_destruction: true,
      death_on_failure_chance: 10,
    },
    description: 'Thánh Hoàng Kiếp - kiếp nạn hủy diệt thiên hà. 27 đợt, có rủi ro tử vong thật sự.',
  },
  {
    id: 'chi_ton_kiep',
    name: 'Chí Tôn Kiếp',
    emoji: '👁️',
    difficulty: 20,
    realm_trigger: 25,  // Thánh Đế
    waves: 36,
    hp_damage_per_wave: 12,
    mana_drain_per_wave: 5,
    success_rate_base: 5,
    time_limit_seconds: 720,
    rewards: {
      exp_multiplier: 50.0,
      spirit_stones: 100000000,
      items: [
        { item_id: 'hon_don_tinh', chance: 1.0, count: 10 },
        { item_id: 'than_tinh', chance: 1.0, count: 20 },
      ],
      title: 'Chí Tôn',
    },
    failure_penalty: {
      exp_loss_percent: 50,
      hp_loss_percent: 100,
      realm_drop: true,
      realm_drop_levels: 10,
      death_chance: 50,
      injury_duration_minutes: 14400,
    },
    special_mechanic: {
      name: 'Chí Tôn Thiên Kiếp',
      description: '36 đợt - kiếp nạn cuối cùng. Vượt qua sẽ trở thành Chí Tôn. Thất bại: 50% tử vong, 50% rơi 10 cảnh giới.',
      final_tribulation: true,
      death_on_failure_chance: 50,
      all_elements: true,
      heaven_dao_battle: true,
    },
    description: 'Chí Tôn Kiếp - kiếp nạn cuối cùng trong tam giới. 36 đợt, vượt qua trở thành Chí Tôn tuyệt đỉnh. 50% tử vong nếu thất bại.',
  },
];

module.exports = {
  tribulations,
  list: tribulations, // Alias for menu compatibility

  /**
   * Lấy kiếp nạn theo id
   */
  getTribulationById(id) {
    return tribulations.find(t => t.id === id);
  },

  /**
   * Lấy kiếp nạn theo realm trigger
   */
  getByRealmTrigger(realmOrder) {
    return tribulations.find(t => t.realm_trigger === realmOrder);
  },

  /**
   * Tính tỉ lệ thành công sau bonus
   * @param {string} tribId
   * @param {number} bonusPercent - bonus từ đan dược, trang bị, etc.
   * @returns {number} tỉ lệ thành công cuối (0-100)
   */
  calculateSuccessRate(tribId, bonusPercent = 0) {
    const trib = tribulations.find(t => t.id === tribId);
    if (!trib) return 0;
    return Math.min(95, trib.success_rate_base + bonusPercent);
  },

  /**
   * Tính tổng sát thương kiếp nạn
   */
  getTotalDamage(tribId) {
    const trib = tribulations.find(t => t.id === tribId);
    if (!trib) return 0;
    return trib.waves * trib.hp_damage_per_wave;
  },

  /**
   * Sắp xếp theo độ khó
   */
  getByDifficulty() {
    return [...tribulations].sort((a, b) => a.difficulty - b.difficulty);
  },
};
