/**
 * @file Equipment (Trang Bị) Configuration
 * @description Trang bị cho 4 slot: weapon, armor, accessory, artifact
 *
 * Slots:
 *   - weapon (vũ khí): tăng ATK chính
 *   - armor (giáp): tăng DEF và HP
 *   - accessory (phụ kiện): tăng chỉ số phụ
 *   - artifact (pháp khí): hiệu ứng đặc biệt
 *
 * Grades: Phàm < Linh < Bảo < Thánh < Tiên < Thần
 * enhance_max: số lần cường hóa tối đa
 * Mỗi lần cường hóa tăng 5% stats
 */

const equipment = [
  // ═══════════════════════════════════════════
  //  VŨ KHÍ — WEAPONS
  // ═══════════════════════════════════════════
  {
    id: 'sat_kiem',
    name: 'Sắt Kiếm',
    slot: 'weapon',
    grade: 'pham',
    emoji: '🗡️',
    stats: { atk: 10, speed: 2 },
    special_effect: null,
    enhance_max: 5,
    min_realm: 1,
    description: 'Kiếm sắt thông thường, vũ khí cơ bản của tu sĩ mới.',
  },
  {
    id: 'linh_quang_kiem',
    name: 'Linh Quang Kiếm',
    slot: 'weapon',
    grade: 'linh',
    emoji: '⚔️',
    stats: { atk: 30, speed: 5, crit_rate: 3 },
    special_effect: {
      name: 'Linh Quang',
      description: 'Mỗi đòn chém phát ra kiếm quang, 10% gây thêm 20% sát thương.',
      proc_chance: 10,
      bonus_damage_percent: 20,
    },
    enhance_max: 8,
    min_realm: 2,
    description: 'Kiếm linh cấp phát sáng, kiếm khí bén nhọn. Có cơ hội phát kiếm quang.',
  },
  {
    id: 'hoa_van_dao',
    name: 'Hỏa Vân Đao',
    slot: 'weapon',
    grade: 'linh',
    emoji: '🔥',
    stats: { atk: 35, speed: 3, fire_damage: 10 },
    special_effect: {
      name: 'Hỏa Vân',
      description: 'Tấn công có 15% gây thiêu đốt (3% ATK/lượt, 2 lượt).',
      proc_chance: 15,
      burn_percent: 3,
      burn_duration: 2,
    },
    enhance_max: 8,
    min_realm: 3,
    description: 'Đại đao lửa mây, mỗi nhát chém mang theo hỏa diệm.',
  },
  {
    id: 'huyet_kiem',
    name: 'Huyết Kiếm',
    slot: 'weapon',
    grade: 'bao',
    emoji: '🩸',
    stats: { atk: 60, speed: 8, crit_rate: 5, life_steal: 5 },
    special_effect: {
      name: 'Huyết Hấp',
      description: 'Hút 5% sát thương gây ra thành HP.',
      life_steal_percent: 5,
    },
    enhance_max: 10,
    min_realm: 4,
    description: 'Huyết kiếm Ma Đạo, hấp thụ máu tươi. Càng chiến càng khỏe.',
  },
  {
    id: 'thanh_long_kiem',
    name: 'Thanh Long Kiếm',
    slot: 'weapon',
    grade: 'bao',
    emoji: '🐲',
    stats: { atk: 70, speed: 10, crit_rate: 5, crit_damage: 10 },
    special_effect: {
      name: 'Long Khí',
      description: 'Bạo kích gây thêm hiệu ứng Long Khí, tăng 15% ATK 2 lượt.',
      on_crit: { atk_bonus_percent: 15, duration: 2 },
    },
    enhance_max: 10,
    min_realm: 5,
    description: 'Kiếm mang hồn rồng xanh, kiếm khí hóa long. Bảo khí trấn phái.',
  },
  {
    id: 'thien_loi_chuy',
    name: 'Thiên Lôi Chùy',
    slot: 'weapon',
    grade: 'thanh',
    emoji: '🔨',
    stats: { atk: 150, speed: 5, thunder_damage: 25, crit_rate: 8 },
    special_effect: {
      name: 'Thiên Lôi',
      description: 'Mỗi đòn thứ 3 triệu hồi thiên lôi gây 50% ATK sát thương Lôi diện rộng.',
      every_n_hits: 3,
      aoe_damage_percent: 50,
      element: 'thunder',
    },
    enhance_max: 12,
    min_realm: 8,
    description: 'Chùy Thiên Lôi thánh cấp, mỗi cú đập mang theo sấm sét. Sức mạnh hủy diệt.',
  },
  {
    id: 'tien_kiem',
    name: 'Tiên Kiếm Trảm Long',
    slot: 'weapon',
    grade: 'tien',
    emoji: '✨',
    stats: { atk: 350, speed: 20, crit_rate: 12, crit_damage: 20, all_damage: 10 },
    special_effect: {
      name: 'Tiên Kiếm Ý',
      description: 'Kiếm ý tự động tấn công, mỗi lượt gây thêm 30% ATK sát thương. Bỏ qua 20% phòng ngự.',
      passive_damage_percent: 30,
      armor_penetration: 20,
    },
    enhance_max: 15,
    min_realm: 12,
    description: 'Tiên kiếm truyền thuyết, kiếm ý trảm long. Tự chiến đấu theo ý chủ.',
  },

  // ═══════════════════════════════════════════
  //  GIÁP — ARMORS
  // ═══════════════════════════════════════════
  {
    id: 'bo_giap',
    name: 'Bố Giáp',
    slot: 'armor',
    grade: 'pham',
    emoji: '👘',
    stats: { def: 8, hp: 30 },
    special_effect: null,
    enhance_max: 5,
    min_realm: 1,
    description: 'Giáp vải thô sơ, phòng ngự tối thiểu.',
  },
  {
    id: 'linh_giap',
    name: 'Linh Giáp',
    slot: 'armor',
    grade: 'linh',
    emoji: '🛡️',
    stats: { def: 25, hp: 80, speed: 2 },
    special_effect: {
      name: 'Linh Khí Hộ Thể',
      description: 'Tự động hồi 1% HP mỗi lượt chiến đấu.',
      hp_regen_percent: 1,
    },
    enhance_max: 8,
    min_realm: 2,
    description: 'Giáp linh cấp, linh khí bao quanh bảo vệ. Tự hồi phục nhẹ.',
  },
  {
    id: 'huyen_thiet_giap',
    name: 'Huyền Thiết Giáp',
    slot: 'armor',
    grade: 'bao',
    emoji: '⬛',
    stats: { def: 55, hp: 200, speed: -3 },
    special_effect: {
      name: 'Huyền Thiết Bất Phá',
      description: 'Giảm 10% sát thương vật lý nhận vào.',
      physical_damage_reduction: 10,
    },
    enhance_max: 10,
    min_realm: 4,
    description: 'Giáp huyền thiết nặng nề, phòng ngự cực cao nhưng giảm tốc độ.',
  },
  {
    id: 'long_lân_giap',
    name: 'Long Lân Giáp',
    slot: 'armor',
    grade: 'thanh',
    emoji: '🐉',
    stats: { def: 120, hp: 500, speed: 5, all_resistance: 10 },
    special_effect: {
      name: 'Long Lân Hộ Thể',
      description: 'Miễn nhiễm hiệu ứng phụ 1 lần mỗi trận. Kháng mọi nguyên tố +10%.',
      debuff_immunity_once: true,
      all_resistance: 10,
    },
    enhance_max: 12,
    min_realm: 9,
    description: 'Giáp từ vảy rồng, phòng ngự thánh cấp. Kháng mọi nguyên tố.',
  },
  {
    id: 'tien_giap',
    name: 'Tiên Y Cửu Thiên',
    slot: 'armor',
    grade: 'tien',
    emoji: '👗',
    stats: { def: 280, hp: 1200, speed: 15, all_resistance: 20 },
    special_effect: {
      name: 'Cửu Thiên Hộ Thể',
      description: 'Tự hồi 3% HP/lượt. Khi HP dưới 20%, kích hoạt lá chắn hấp thụ 30% max HP.',
      hp_regen_percent: 3,
      emergency_shield_threshold: 20,
      emergency_shield_percent: 30,
    },
    enhance_max: 15,
    min_realm: 13,
    description: 'Tiên y từ chín tầng trời, bất khả xâm phạm. Tự hồi phục và lá chắn khẩn cấp.',
  },

  // ═══════════════════════════════════════════
  //  PHỤ KIỆN — ACCESSORIES
  // ═══════════════════════════════════════════
  {
    id: 'linh_ngoc_boi',
    name: 'Linh Ngọc Bội',
    slot: 'accessory',
    grade: 'pham',
    emoji: '📿',
    stats: { mana: 20, exp_bonus: 3 },
    special_effect: null,
    enhance_max: 5,
    min_realm: 1,
    description: 'Ngọc bội linh lực, tăng nhẹ mana và exp tu luyện.',
  },
  {
    id: 'phong_linh_nhan',
    name: 'Phong Linh Nhẫn',
    slot: 'accessory',
    grade: 'linh',
    emoji: '💍',
    stats: { speed: 15, dodge_rate: 5, mana: 30 },
    special_effect: {
      name: 'Phong Linh',
      description: 'Tăng 5% tỉ lệ né tránh.',
      dodge_bonus: 5,
    },
    enhance_max: 8,
    min_realm: 2,
    description: 'Nhẫn gió, tăng tốc độ và né tránh. Phù hợp tu sĩ Phong hệ.',
  },
  {
    id: 'huyet_ngoc_truyen',
    name: 'Huyết Ngọc Truyền',
    slot: 'accessory',
    grade: 'bao',
    emoji: '🩸',
    stats: { atk: 20, life_steal: 8, crit_rate: 5 },
    special_effect: {
      name: 'Huyết Ngọc',
      description: 'Hút 8% sát thương thành HP. Bạo kích hút thêm 5%.',
      life_steal: 8,
      crit_life_steal_bonus: 5,
    },
    enhance_max: 10,
    min_realm: 5,
    description: 'Vòng huyết ngọc Ma Đạo, hấp thu sinh lực kẻ địch.',
  },
  {
    id: 'thien_menh_ngoc',
    name: 'Thiên Mệnh Ngọc',
    slot: 'accessory',
    grade: 'thanh',
    emoji: '🔮',
    stats: { all_stats: 30, crit_rate: 10, exp_bonus: 15 },
    special_effect: {
      name: 'Thiên Mệnh',
      description: 'Tăng 15% exp tu luyện. Mỗi trận thắng có 5% rơi vật phẩm thêm.',
      exp_bonus: 15,
      extra_drop_chance: 5,
    },
    enhance_max: 12,
    min_realm: 8,
    description: 'Ngọc Thiên Mệnh, người sở hữu được trời ưu ái. Tăng exp và tỉ lệ rơi đồ.',
  },

  // ═══════════════════════════════════════════
  //  PHÁP KHÍ — ARTIFACTS
  // ═══════════════════════════════════════════
  {
    id: 'dan_lo_pham',
    name: 'Đan Lô Phàm Cấp',
    slot: 'artifact',
    grade: 'pham',
    emoji: '🏺',
    stats: { mana: 15 },
    special_effect: {
      name: 'Luyện Đan',
      description: 'Tăng 5% tỉ lệ thành công luyện đan.',
      alchemy_bonus: 5,
    },
    enhance_max: 5,
    min_realm: 1,
    description: 'Đan lô đơn giản, hỗ trợ luyện đan cơ bản.',
  },
  {
    id: 'thu_linh_chuong',
    name: 'Thu Linh Chưởng',
    slot: 'artifact',
    grade: 'linh',
    emoji: '🔔',
    stats: { mana: 30 },
    special_effect: {
      name: 'Thu Linh',
      description: 'Tăng 10% tỉ lệ bắt linh thú.',
      capture_bonus: 10,
    },
    enhance_max: 8,
    min_realm: 2,
    description: 'Chuông thu linh, hỗ trợ bắt thú linh hiệu quả hơn.',
  },
  {
    id: 'phi_kiem',
    name: 'Phi Kiếm Thần Du',
    slot: 'artifact',
    grade: 'bao',
    emoji: '🗡️',
    stats: { atk: 30, speed: 20 },
    special_effect: {
      name: 'Phi Kiếm',
      description: 'Bắt đầu trận gây 50% ATK sát thương tự động.',
      opening_damage_percent: 50,
    },
    enhance_max: 10,
    min_realm: 5,
    description: 'Phi kiếm bảo cấp, tự động tấn công kẻ địch khi bắt đầu trận.',
  },
  {
    id: 'thien_dia_than_lo',
    name: 'Thiên Địa Thần Lô',
    slot: 'artifact',
    grade: 'thanh',
    emoji: '🏺',
    stats: { mana: 100, all_stats: 20 },
    special_effect: {
      name: 'Thiên Địa Luyện Hóa',
      description: 'Luyện đan thành công +25%. Có 5% luyện ra đan dược bậc cao hơn.',
      alchemy_bonus: 25,
      upgrade_chance: 5,
    },
    enhance_max: 12,
    min_realm: 8,
    description: 'Thần lô thiên địa, luyện hóa vạn vật. Pháp khí thánh cấp cho đan sư.',
  },
  {
    id: 'hon_don_thap',
    name: 'Hỗn Độn Tháp',
    slot: 'artifact',
    grade: 'than',
    emoji: '🗼',
    stats: { all_stats: 100, all_resistance: 15 },
    special_effect: {
      name: 'Hỗn Độn Trấn Áp',
      description: 'Thu nhốt kẻ địch vào tháp 2 lượt (1 lần/trận). Giảm 20% toàn chỉ số kẻ địch bị nhốt.',
      prison_duration: 2,
      stat_reduction: 20,
      uses_per_battle: 1,
    },
    enhance_max: 15,
    min_realm: 20,
    description: 'Tháp Hỗn Độn thần cấp, thu nhốt vạn vật. Pháp khí tối thượng.',
  },
];

module.exports = {
  equipment,
  list: equipment, // Alias for menu compatibility

  /**
   * Lấy trang bị theo id
   */
  getEquipmentById(id) {
    return equipment.find(e => e.id === id);
  },

  getById(id) {
    return equipment.find(e => e.id === id);
  },

  /**
   * Lấy trang bị theo slot
   */
  getBySlot(slot) {
    return equipment.filter(e => e.slot === slot);
  },

  /**
   * Lấy trang bị theo grade
   */
  getByGrade(grade) {
    return equipment.filter(e => e.grade === grade);
  },

  /**
   * Lấy trang bị khả dụng tại realm
   */
  getAvailableAt(realmOrder) {
    return equipment.filter(e => e.min_realm <= realmOrder);
  },

  /**
   * Tính stats sau cường hóa
   */
  getEnhancedStats(equipId, enhanceLevel) {
    const equip = equipment.find(e => e.id === equipId);
    if (!equip) return null;
    const enhanced = {};
    for (const [key, value] of Object.entries(equip.stats)) {
      enhanced[key] = Math.floor(value * (1 + enhanceLevel * 0.05));
    }
    return enhanced;
  },

  /** Thứ tự grade */
  gradeOrder: ['pham', 'linh', 'bao', 'thanh', 'tien', 'than'],
};
