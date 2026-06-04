/**
 * @file Thần Thông (Divine Skills) Configuration
 * @description Kỹ năng ultimate — triệu hồi kiếm thánh, cự kiếm, v.v.
 *
 * Bám sát game Quỷ Cốc Bát Hoang:
 *   - Vạn Thần Kiếm: Triệu hồi Kiếm Thánh bay quanh, giảm CD Võ Kỹ
 *   - Sậu Thiên Kiếm: Cự Kiếm, 1 kiếm ảnh = 20 cự kiếm rơi, hiệu ứng Vô Địch
 *   - Binh Nhận Chuyên Tinh (Nghịch Thiên) → bỏ qua weapon_restriction
 *   - Phân thân có thể tự dùng Thần Thông (không tốn mana, không CD)
 */

const thanThongList = [
  // ═══════════════════════════════════════
  //  VẠN THẦN KIẾM — Triệu hồi Kiếm Thánh
  // ═══════════════════════════════════════
  {
    id: 'van_than_kiem',
    name: 'Vạn Thần Kiếm',
    type: 'trieu_hoi',
    weapon_restriction: 'kiem', // Cần Binh Nhận Chuyên Tinh nếu không phải Kiếm Tu
    grade: 'thanh',
    emoji: '🗡️✨',
    cooldown_turns: 8,
    mana_cost: 100,
    min_realm: 5,
    effect: {
      summon_type: 'kiem_thanh',
      summon_count: 3,                    // 3 Kiếm Thánh bay quanh
      summon_damage_per_turn_percent: 50, // Mỗi Kiếm Thánh gây 50% ATK/lượt
      summon_duration_turns: 4,
      cd_vo_ky_reduction_percent: 50,     // BÁM SÁT GAME: -50% CD Võ Kỹ!
    },
    // BÁM SÁT: Kiếm Thánh thu thập kiếm hồn
    kiem_hon_mechanic: {
      description: 'Kiếm Thánh thu thập kiếm hồn từ kẻ địch bị hạ. Càng nhiều kiếm hồn, sát thương càng cao.',
      damage_per_kiem_hon: 5, // +5% damage per kiếm hồn
    },
    rollable_options: [
      { id: 'summon_count', name: 'Thêm Kiếm Thánh', max_red: 2, unit: '' },
      { id: 'cd_vo_ky', name: 'Giảm CD Võ Kỹ thêm', max_red: 20, unit: '%' },
      { id: 'summon_damage', name: 'Sát thương Kiếm Thánh', max_red: 30, unit: '%' },
      { id: 'cd_reduction', name: 'Giảm CD Thần Thông', max_red: -3, unit: ' lượt' },
      { id: 'duration_up', name: 'Thời gian triệu hồi', max_red: 2, unit: ' lượt' },
    ],
    description: 'Triệu hồi 3 Kiếm Thánh bay quanh người. Giảm 50% CD Võ Kỹ! Mỗi Kiếm Thánh gây 50% ATK/lượt.',
  },

  // ═══════════════════════════════════════
  //  SẬU THIÊN KIẾM — Cự Kiếm + Vô Địch
  // ═══════════════════════════════════════
  {
    id: 'sau_thien_kiem',
    name: 'Sậu Thiên Kiếm',
    type: 'trieu_hoi',
    weapon_restriction: null, // Ai cũng dùng được
    grade: 'thanh',
    emoji: '⚔️🌟',
    cooldown_turns: 10,
    mana_cost: 120,
    min_realm: 5,
    effect: {
      summon_type: 'cu_kiem',
      // BÁM SÁT GAME: 1 kiếm ảnh → 20 cự kiếm rơi xuống
      kiem_anh_to_cu_kiem_ratio: 20,
      cu_kiem_damage_percent: 80,          // Mỗi cự kiếm gây 80% ATK
      // VD: 4 phân thân = 4 kiếm ảnh → 80 cự kiếm → 80 × 80% ATK
      vo_dich: true,                        // BÁM SÁT: Hiệu ứng Vô Địch
      vo_dich_duration_turns: 1,
      slow_enemy_percent: 30,               // Giảm tốc kẻ địch
      slow_duration_turns: 2,
    },
    // Phân thân (từ Thủy Thân Pháp) CÓ THỂ tự dùng Thần Thông này
    clone_can_cast: true,
    clone_cast_free: true, // Phân thân dùng → không tốn mana, không CD
    rollable_options: [
      { id: 'vo_dich_duration', name: 'Thời gian Vô Địch', max_red: 1, unit: ' lượt' },
      { id: 'cu_kiem_damage', name: 'Sát thương Cự Kiếm', max_red: 30, unit: '%' },
      { id: 'slow_percent', name: 'Giảm tốc kẻ địch', max_red: 40, unit: '%' },
      { id: 'cd_reduction', name: 'Giảm CD Thần Thông', max_red: -3, unit: ' lượt' },
    ],
    description: 'Triệu hồi Cự Kiếm! Mỗi kiếm ảnh = 20 cự kiếm rơi. Hiệu ứng Vô Địch miễn nhiễm sát thương!',
  },

  // ═══════════════════════════════════════
  //  THIÊN PHONG TRẢM — Thần Thông Đao
  // ═══════════════════════════════════════
  {
    id: 'thien_phong_tram',
    name: 'Thiên Phong Trảm',
    type: 'tan_cong',
    weapon_restriction: 'dao',
    grade: 'thanh',
    emoji: '🌪️🔪',
    cooldown_turns: 8,
    mana_cost: 90,
    min_realm: 5,
    effect: {
      damage_mult: 6.0,
      target: 'aoe',
      hit_count: 3,
      lifesteal_percent: 25,        // Hút 25% damage gây ra
      execute_threshold: 20,         // Tiêu diệt kẻ địch < 20% HP
    },
    rollable_options: [
      { id: 'damage_up', name: 'Tăng damage', max_red: 40, unit: '%' },
      { id: 'lifesteal', name: 'Hút máu', max_red: 15, unit: '%' },
      { id: 'execute_threshold', name: 'Ngưỡng tiêu diệt', max_red: 10, unit: '%' },
      { id: 'cd_reduction', name: 'Giảm CD', max_red: -3, unit: ' lượt' },
    ],
    description: 'Đao quang chém 3 lần, hút 25% damage. Tử sát kẻ địch < 20% HP!',
  },

  // ═══════════════════════════════════════
  //  CỬU LONG THĂNG THIÊN — Thần Thông Thương
  // ═══════════════════════════════════════
  {
    id: 'cuu_long_thang_thien',
    name: 'Cửu Long Thăng Thiên',
    type: 'tan_cong',
    weapon_restriction: 'thuong',
    grade: 'thanh',
    emoji: '🐉🔱',
    cooldown_turns: 9,
    mana_cost: 110,
    min_realm: 5,
    effect: {
      damage_mult: 8.0,
      target: 'single',
      hit_count: 9,                  // 9 mũi thương
      ignore_def_percent: 50,        // Bỏ qua 50% phòng ngự
      guaranteed_crit: true,         // 100% bạo kích
    },
    rollable_options: [
      { id: 'damage_up', name: 'Tăng damage', max_red: 50, unit: '%' },
      { id: 'ignore_def', name: 'Bỏ qua phòng ngự', max_red: 20, unit: '%' },
      { id: 'crit_damage', name: 'Sát thương bạo kích', max_red: 50, unit: '%' },
      { id: 'cd_reduction', name: 'Giảm CD', max_red: -3, unit: ' lượt' },
    ],
    description: '9 mũi rồng thăng thiên! Bỏ qua 50% DEF, 100% bạo kích. Single target ultimate.',
  },

  // ═══════════════════════════════════════
  //  VẠN PHẬT CHU THIÊN — Thần Thông Quyền
  // ═══════════════════════════════════════
  {
    id: 'van_phat_chu_thien',
    name: 'Vạn Phật Chu Thiên',
    type: 'buff_tan_cong',
    weapon_restriction: 'quyen',
    grade: 'thanh',
    emoji: '🙏👊',
    cooldown_turns: 8,
    mana_cost: 80,
    min_realm: 5,
    effect: {
      transform: true,              // Biến thân
      transform_duration: 5,
      atk_bonus_percent: 60,        // +60% ATK
      speed_bonus_percent: 40,
      counterattack: true,           // Phản đòn mọi đòn tấn công nhận
      counterattack_damage: 30,      // 30% ATK
    },
    rollable_options: [
      { id: 'atk_bonus', name: 'Tăng ATK', max_red: 30, unit: '%' },
      { id: 'transform_duration', name: 'Thời gian biến thân', max_red: 2, unit: ' lượt' },
      { id: 'counter_damage', name: 'Sát thương phản đòn', max_red: 20, unit: '%' },
      { id: 'cd_reduction', name: 'Giảm CD', max_red: -3, unit: ' lượt' },
    ],
    description: 'Biến thân Vạn Phật! +60% ATK, +40% speed, phản đòn 30% ATK trong 5 lượt.',
  },

  // ═══════════════════════════════════════
  //  VẠN PHẬT TRẤN — Thần Thông Chưởng
  // ═══════════════════════════════════════
  {
    id: 'van_phat_tran',
    name: 'Vạn Phật Trấn',
    type: 'khong_che',
    weapon_restriction: 'chuong',
    grade: 'thanh',
    emoji: '🔔🖐️',
    cooldown_turns: 10,
    mana_cost: 100,
    min_realm: 5,
    effect: {
      prison: true,                  // Nhốt kẻ địch
      prison_duration: 3,
      damage_over_time_percent: 20,  // 20% ATK/lượt khi bị nhốt
      stat_reduction_all: 25,        // Giảm 25% toàn chỉ số
    },
    rollable_options: [
      { id: 'prison_duration', name: 'Thời gian nhốt', max_red: 2, unit: ' lượt' },
      { id: 'dot_damage', name: 'Sát thương khi nhốt', max_red: 15, unit: '%' },
      { id: 'stat_reduction', name: 'Giảm chỉ số', max_red: 15, unit: '%' },
      { id: 'cd_reduction', name: 'Giảm CD', max_red: -3, unit: ' lượt' },
    ],
    description: 'Nhốt kẻ địch trong Phật Trấn 3 lượt! 20% ATK/lượt, giảm 25% toàn chỉ số.',
  },

  // ═══════════════════════════════════════
  //  THIÊN CƠ CHỈ — Thần Thông Chỉ
  // ═══════════════════════════════════════
  {
    id: 'thien_co_chi',
    name: 'Thiên Cơ Chỉ',
    type: 'tan_cong',
    weapon_restriction: 'chi',
    grade: 'thanh',
    emoji: '🌌☝️',
    cooldown_turns: 7,
    mana_cost: 85,
    min_realm: 5,
    effect: {
      damage_mult: 5.0,
      target: 'single',
      hit_count: 36,                 // 36 điểm huyệt
      guaranteed_crit_on_sealed: true, // 100% crit nếu mục tiêu bị phong ấn
      reset_cooldowns: true,          // Reset tất cả CD sau khi dùng
    },
    rollable_options: [
      { id: 'hit_count', name: 'Số điểm huyệt', max_red: 12, unit: '' },
      { id: 'damage_up', name: 'Tăng damage', max_red: 40, unit: '%' },
      { id: 'crit_damage', name: 'Sát thương bạo kích', max_red: 40, unit: '%' },
      { id: 'cd_reduction', name: 'Giảm CD', max_red: -2, unit: ' lượt' },
    ],
    description: '36 chỉ Thiên Cơ! 100% crit nếu đã phong ấn. Reset tất cả CD sau khi dùng.',
  },
];

module.exports = {
  thanThongList,
  list: thanThongList,

  getThanThongById(id) {
    return thanThongList.find(t => t.id === id);
  },

  getByWeaponRestriction(weaponType) {
    return thanThongList.filter(t =>
      t.weapon_restriction === weaponType || t.weapon_restriction === null
    );
  },

  getAvailableAt(realmOrder, weaponType, hasIgnoreRestriction = false) {
    return thanThongList.filter(t => {
      if (t.min_realm > realmOrder) return false;
      if (hasIgnoreRestriction) return true; // Binh Nhận Chuyên Tinh
      return t.weapon_restriction === weaponType || t.weapon_restriction === null;
    });
  },
};
