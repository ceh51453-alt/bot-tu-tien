/**
 * @file Võ Kỹ (Martial Skills) Configuration
 * @description Kỹ năng tấn công cơ bản phân theo loại võ khí
 *
 * Bám sát game Quỷ Cốc Bát Hoang:
 *   - Mỗi weapon type có 3 võ kỹ ở các grade khác nhau
 *   - base_cooldown: thời gian hồi chiêu (quy đổi lượt)
 *   - projectile_count: số lượng đạn/kiếm bắn ra
 *   - accuracy: tỉ lệ trúng (%)
 *   - stack_build: hiệu ứng stack mà võ kỹ này build lên
 *   - rollable_options: options roll được dựa Ngộ Tính
 */

const voKyList = [
  // ═══════════════════════════════════════
  //  KIẾM VÕ KỸ
  // ═══════════════════════════════════════
  {
    id: 'nguyet_anh_kiem',
    name: 'Nguyệt Ảnh Kiếm',
    weapon_type: 'kiem',
    grade: 'linh',
    emoji: '🌙⚔️',
    base_cooldown_turns: 1,
    projectile_count: 5,
    accuracy: 90,
    base_damage_mult: 1.0,
    stack_build: 'kiem_tram',
    stacks_per_hit: 1, // Mỗi kiếm trúng = 1 stack → 5 kiếm = 5 stack/lượt
    min_realm: 2,
    rollable_options: [
      { id: 'cd_reduction', name: 'Giảm hồi chiêu', max_red: -0.21, unit: 's' },
      { id: 'extra_proj', name: 'Thêm phi kiếm', max_red: 2, unit: '' },
      { id: 'damage_up', name: 'Tăng sát thương', max_red: 30, unit: '%' },
      { id: 'stack_bonus', name: 'Kiếm Trảm tích thêm', max_red: 2, unit: ' tầng' },
    ],
    description: '5 kiếm bắn đồng loạt. Build Kiếm Trảm cực nhanh (5 stack/lượt). Damage ổn định.',
  },
  {
    id: 'co_tinh_kiem',
    name: 'Cô Tinh Kiếm',
    weapon_type: 'kiem',
    grade: 'linh',
    emoji: '⭐⚔️',
    base_cooldown_turns: 0, // Không có CD → bắn liên tục
    projectile_count: 1,
    accuracy: 60,
    base_damage_mult: 0.6,
    stack_build: 'kiem_tram',
    stacks_per_hit: 1,
    special: 'max_speed', // Tốc độ bắn cực nhanh, hợp cận chiến YOLO
    min_realm: 2,
    rollable_options: [
      { id: 'cd_reduction', name: 'Giảm hồi chiêu', max_red: -0.07, unit: 's' },
      { id: 'accuracy_up', name: 'Tăng chính xác', max_red: 25, unit: '%' },
      { id: 'damage_up', name: 'Tăng sát thương', max_red: 20, unit: '%' },
    ],
    description: 'Bắn siêu nhanh (0.2s) nhưng chính xác thấp. Sáp lá cà cận chiến thì 100% trúng!',
  },
  {
    id: 'thanh_phong_kiem',
    name: 'Thanh Phong Kiếm',
    weapon_type: 'kiem',
    grade: 'bao',
    emoji: '🍃⚔️',
    base_cooldown_turns: 0,
    projectile_count: 1,
    accuracy: 80,
    base_damage_mult: 0.8,
    stack_build: 'kiem_tram',
    stacks_per_hit: 1,
    special: 'xuyen_thau', // Xuyên qua nhiều kẻ địch → dọn map
    pierce_count: 3,
    min_realm: 3,
    rollable_options: [
      { id: 'cd_reduction', name: 'Giảm hồi chiêu', max_red: -0.10, unit: 's' },
      { id: 'pierce_count', name: 'Số mục tiêu xuyên', max_red: 4, unit: '' },
      { id: 'damage_up', name: 'Tăng sát thương', max_red: 25, unit: '%' },
    ],
    description: 'Kiếm khí xuyên thấu nhiều kẻ địch. Clear quái cực ngon, hiệu ứng Xuyên Thấu.',
  },

  // ═══════════════════════════════════════
  //  ĐAO VÕ KỸ
  // ═══════════════════════════════════════
  {
    id: 'cuong_phong_dao',
    name: 'Cuồng Phong Đao',
    weapon_type: 'dao',
    grade: 'linh',
    emoji: '🌀🔪',
    base_cooldown_turns: 1,
    projectile_count: 3,
    accuracy: 85,
    base_damage_mult: 1.2,
    stack_build: 'huyet_sat',
    stacks_per_hit: 1,
    min_realm: 2,
    rollable_options: [
      { id: 'cd_reduction', name: 'Giảm hồi chiêu', max_red: -0.15, unit: 's' },
      { id: 'lifesteal_up', name: 'Tăng hút máu', max_red: 8, unit: '%' },
      { id: 'damage_up', name: 'Tăng sát thương', max_red: 25, unit: '%' },
    ],
    description: '3 nhát đao cuồng phong. Huyết Sát stack nhanh, hút máu mạnh.',
  },
  {
    id: 'truong_hong_dao',
    name: 'Trường Hồng Đao',
    weapon_type: 'dao',
    grade: 'bao',
    emoji: '🌈🔪',
    base_cooldown_turns: 2,
    projectile_count: 1,
    accuracy: 95,
    base_damage_mult: 2.0,
    stack_build: 'huyet_sat',
    stacks_per_hit: 3, // 1 nhát = 3 stack
    min_realm: 4,
    rollable_options: [
      { id: 'cd_reduction', name: 'Giảm hồi chiêu', max_red: -1, unit: ' lượt' },
      { id: 'damage_up', name: 'Tăng sát thương', max_red: 35, unit: '%' },
      { id: 'crit_rate', name: 'Bạo kích', max_red: 15, unit: '%' },
    ],
    description: 'Một nhát đao chẻ đôi trời đất. Damage cực cao, build 3 stack Huyết Sát/nhát.',
  },
  {
    id: 'huyet_luu_dao',
    name: 'Huyết Lưu Đao',
    weapon_type: 'dao',
    grade: 'bao',
    emoji: '🩸🔪',
    base_cooldown_turns: 1,
    projectile_count: 2,
    accuracy: 80,
    base_damage_mult: 1.0,
    stack_build: 'huyet_sat',
    stacks_per_hit: 1,
    special: 'huyet_bao', // Hút máu = tăng damage đợt sau
    min_realm: 3,
    rollable_options: [
      { id: 'lifesteal_up', name: 'Tăng hút máu', max_red: 12, unit: '%' },
      { id: 'damage_up', name: 'Tăng sát thương', max_red: 20, unit: '%' },
      { id: 'blood_rage', name: 'Huyết Bạo (hút máu → +ATK)', max_red: 15, unit: '%' },
    ],
    description: 'Đao dính máu. Hút máu chuyển thành buff ATK cho đợt tấn công sau.',
  },

  // ═══════════════════════════════════════
  //  THƯƠNG VÕ KỸ
  // ═══════════════════════════════════════
  {
    id: 'long_khi_thuong',
    name: 'Long Khí Thương',
    weapon_type: 'thuong',
    grade: 'linh',
    emoji: '🐉🔱',
    base_cooldown_turns: 1,
    projectile_count: 1,
    accuracy: 85,
    base_damage_mult: 1.5,
    stack_build: 'xuyen_thau',
    stacks_per_hit: 2,
    min_realm: 2,
    rollable_options: [
      { id: 'cd_reduction', name: 'Giảm hồi chiêu', max_red: -0.15, unit: 's' },
      { id: 'armor_pen', name: 'Xuyên giáp', max_red: 15, unit: '%' },
      { id: 'damage_up', name: 'Tăng sát thương', max_red: 30, unit: '%' },
    ],
    description: 'Thương khí hóa long. Xuyên thấu phòng ngự, build Xuyên Thấu stack nhanh.',
  },
  {
    id: 'phi_long_tai_thien',
    name: 'Phi Long Tại Thiên',
    weapon_type: 'thuong',
    grade: 'bao',
    emoji: '🐲🔱',
    base_cooldown_turns: 2,
    projectile_count: 3,
    accuracy: 80,
    base_damage_mult: 1.8,
    stack_build: 'xuyen_thau',
    stacks_per_hit: 1,
    special: 'burst', // Burst damage cực cao
    min_realm: 4,
    rollable_options: [
      { id: 'damage_up', name: 'Tăng sát thương', max_red: 40, unit: '%' },
      { id: 'armor_pen', name: 'Xuyên giáp', max_red: 20, unit: '%' },
      { id: 'crit_damage', name: 'Sát thương bạo kích', max_red: 30, unit: '%' },
    ],
    description: 'Ba mũi thương phóng ra như rồng bay. Burst damage tối thượng.',
  },

  // ═══════════════════════════════════════
  //  QUYỀN VÕ KỸ
  // ═══════════════════════════════════════
  {
    id: 'lien_hoan_quyen',
    name: 'Liên Hoàn Quyền',
    weapon_type: 'quyen',
    grade: 'linh',
    emoji: '💢👊',
    base_cooldown_turns: 0,
    projectile_count: 1,
    accuracy: 95, // Cận chiến → trúng cao
    base_damage_mult: 0.5,
    stack_build: 'lien_kich',
    stacks_per_hit: 2,
    special: 'rapid_fire', // Đánh cực nhanh
    min_realm: 2,
    rollable_options: [
      { id: 'speed_up', name: 'Tăng tốc đánh', max_red: 30, unit: '%' },
      { id: 'stun_chance', name: 'Choáng', max_red: 10, unit: '%' },
      { id: 'damage_up', name: 'Tăng sát thương', max_red: 20, unit: '%' },
    ],
    description: 'Quyền liên hoàn không ngừng. Cận chiến tốc độ siêu cao, Liên Kích stack rất nhanh.',
  },
  {
    id: 'ba_vương_quyen',
    name: 'Bá Vương Quyền',
    weapon_type: 'quyen',
    grade: 'bao',
    emoji: '👑👊',
    base_cooldown_turns: 2,
    projectile_count: 1,
    accuracy: 90,
    base_damage_mult: 2.5,
    stack_build: 'lien_kich',
    stacks_per_hit: 4,
    special: 'aoe_stun', // AOE choáng
    min_realm: 4,
    rollable_options: [
      { id: 'aoe_range', name: 'Phạm vi AOE', max_red: 3, unit: ' mục tiêu' },
      { id: 'stun_duration', name: 'Thời gian choáng', max_red: 2, unit: ' lượt' },
      { id: 'damage_up', name: 'Tăng sát thương', max_red: 35, unit: '%' },
    ],
    description: 'Một quyền bá vương phá sơn hà. AOE choáng diện rộng, damage khủng.',
  },

  // ═══════════════════════════════════════
  //  CHƯỞNG VÕ KỸ
  // ═══════════════════════════════════════
  {
    id: 'thai_cuc_chuong',
    name: 'Thái Cực Chưởng',
    weapon_type: 'chuong',
    grade: 'linh',
    emoji: '☯️🖐️',
    base_cooldown_turns: 1,
    projectile_count: 2,
    accuracy: 85,
    base_damage_mult: 1.0,
    stack_build: 'tran_ap',
    stacks_per_hit: 1,
    min_realm: 2,
    rollable_options: [
      { id: 'debuff_duration', name: 'Thời gian Trấn Áp', max_red: 3, unit: ' lượt' },
      { id: 'atk_reduction', name: 'Giảm ATK thêm', max_red: 10, unit: '%' },
      { id: 'damage_up', name: 'Tăng sát thương', max_red: 25, unit: '%' },
    ],
    description: 'Chưởng Thái Cực nhu hóa cương. Trấn Áp kẻ địch, giảm sức tấn công.',
  },
  {
    id: 'thien_ma_chuong',
    name: 'Thiên Ma Chưởng',
    weapon_type: 'chuong',
    grade: 'bao',
    emoji: '😈🖐️',
    base_cooldown_turns: 2,
    projectile_count: 1,
    accuracy: 80,
    base_damage_mult: 1.8,
    stack_build: 'tran_ap',
    stacks_per_hit: 3,
    special: 'confuse', // Gây hoang mang
    min_realm: 4,
    rollable_options: [
      { id: 'confuse_chance', name: 'Hoang mang', max_red: 20, unit: '%' },
      { id: 'damage_up', name: 'Tăng sát thương', max_red: 30, unit: '%' },
      { id: 'def_break', name: 'Phá phòng', max_red: 15, unit: '%' },
    ],
    description: 'Chưởng ma đạo. Gây hoang mang kẻ địch, 3 stack Trấn Áp/đòn.',
  },

  // ═══════════════════════════════════════
  //  CHỈ VÕ KỸ
  // ═══════════════════════════════════════
  {
    id: 'nhat_duong_chi',
    name: 'Nhất Dương Chỉ',
    weapon_type: 'chi',
    grade: 'linh',
    emoji: '☀️☝️',
    base_cooldown_turns: 0,
    projectile_count: 1,
    accuracy: 95,
    base_damage_mult: 0.7,
    stack_build: 'diem_huyet',
    stacks_per_hit: 1,
    special: 'precision', // Chính xác cực cao
    min_realm: 2,
    rollable_options: [
      { id: 'crit_rate', name: 'Bạo kích', max_red: 15, unit: '%' },
      { id: 'accuracy_up', name: 'Chính xác', max_red: 10, unit: '%' },
      { id: 'damage_up', name: 'Tăng sát thương', max_red: 20, unit: '%' },
    ],
    description: 'Một ngón tay chỉ ra ánh dương. Chính xác cực cao, Điểm Huyệt mỗi đòn.',
  },
  {
    id: 'luc_mach_than_kiem_chi',
    name: 'Lục Mạch Thần Kiếm Chỉ',
    weapon_type: 'chi',
    grade: 'thanh',
    emoji: '✨☝️',
    base_cooldown_turns: 1,
    projectile_count: 6,
    accuracy: 85,
    base_damage_mult: 0.8,
    stack_build: 'diem_huyet',
    stacks_per_hit: 1, // 6 chỉ = 6 stack
    special: 'kiếm khí từ ngón tay',
    min_realm: 7,
    rollable_options: [
      { id: 'extra_proj', name: 'Thêm kiếm chỉ', max_red: 3, unit: '' },
      { id: 'crit_rate', name: 'Bạo kích', max_red: 20, unit: '%' },
      { id: 'damage_up', name: 'Tăng sát thương', max_red: 30, unit: '%' },
      { id: 'seal_duration', name: 'Phong ấn thêm', max_red: 1, unit: ' lượt' },
    ],
    description: '6 kiếm khí bắn từ ngón tay. 6 stack Điểm Huyệt/lượt, sắp phong ấn!',
  },
];

module.exports = {
  voKyList,
  list: voKyList,

  /**
   * Lấy võ kỹ theo id
   */
  getVoKyById(id) {
    return voKyList.find(v => v.id === id);
  },

  /**
   * Lấy danh sách võ kỹ theo weapon type
   */
  getByWeaponType(weaponType) {
    return voKyList.filter(v => v.weapon_type === weaponType);
  },

  /**
   * Lấy võ kỹ khả dụng tại realm
   */
  getAvailableAt(realmOrder, weaponType) {
    return voKyList.filter(v =>
      v.min_realm <= realmOrder &&
      (!weaponType || v.weapon_type === weaponType)
    );
  },
};
