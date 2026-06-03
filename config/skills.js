/**
 * @file Combat Skills (Kỹ Năng Chiến Đấu) Configuration
 * @description Các kỹ năng chiến đấu phân theo loại: Attack, Defense, Buff, Debuff, Heal, Ultimate
 *
 * type: 'attack' | 'defense' | 'buff' | 'debuff' | 'heal' | 'ultimate'
 * element: nguyên tố (fire, water, thunder, ice, wind, earth, dark, light, chaos, neutral)
 * grade: Phàm < Linh < Bảo < Thánh < Tiên < Thần
 * damage_multiplier: hệ số sát thương (1.0 = 100% ATK)
 * cooldown: số lượt hồi chiêu
 * mana_cost: tiêu hao mana
 * min_realm: cảnh giới tối thiểu để học
 */

const skills = [
  // ═══════════════════════════════════════════
  //  ATTACK SKILLS (Kỹ Năng Tấn Công)
  // ═══════════════════════════════════════════
  {
    id: 'hoa_cau_thuat',
    name: 'Hỏa Cầu Thuật',
    type: 'attack',
    element: 'fire',
    grade: 'pham',
    damage_multiplier: 1.2,
    cooldown: 1,
    mana_cost: 15,
    min_realm: 1,
    emoji: '🔥',
    target: 'single',
    description: 'Phóng ra một quả cầu lửa tấn công mục tiêu. Kỹ năng cơ bản nhất của tu sĩ Hỏa hệ.',
  },
  {
    id: 'kiem_quang',
    name: 'Kiếm Quang',
    type: 'attack',
    element: 'neutral',
    grade: 'pham',
    damage_multiplier: 1.3,
    cooldown: 1,
    mana_cost: 12,
    min_realm: 1,
    emoji: '⚔️',
    target: 'single',
    description: 'Phóng kiếm khí tấn công kẻ địch. Không thuộc tính nguyên tố, phù hợp mọi tu sĩ.',
  },
  {
    id: 'loi_kich',
    name: 'Lôi Kích',
    type: 'attack',
    element: 'thunder',
    grade: 'linh',
    damage_multiplier: 1.5,
    cooldown: 2,
    mana_cost: 25,
    min_realm: 2,
    emoji: '⚡',
    target: 'single',
    extra_effect: { stun_chance: 15 },
    description: 'Triệu hồi sấm sét đánh xuống kẻ thù. Có 15% cơ hội choáng mục tiêu 1 lượt.',
  },
  {
    id: 'bang_tru',
    name: 'Băng Trụ',
    type: 'attack',
    element: 'ice',
    grade: 'linh',
    damage_multiplier: 1.4,
    cooldown: 2,
    mana_cost: 22,
    min_realm: 2,
    emoji: '🧊',
    target: 'single',
    extra_effect: { slow_chance: 25, slow_duration: 2 },
    description: 'Tạo cột băng đâm xuyên kẻ địch. Có 25% cơ hội làm chậm mục tiêu 2 lượt.',
  },
  {
    id: 'phong_nhan',
    name: 'Phong Nhận',
    type: 'attack',
    element: 'wind',
    grade: 'linh',
    damage_multiplier: 1.3,
    cooldown: 1,
    mana_cost: 18,
    min_realm: 2,
    emoji: '🌪️',
    target: 'aoe',
    description: 'Tạo lưỡi gió sắc bén tấn công toàn bộ kẻ địch. Sát thương thấp hơn nhưng đánh diện rộng.',
  },
  {
    id: 'am_anh_tru',
    name: 'Âm Ảnh Trảm',
    type: 'attack',
    element: 'dark',
    grade: 'bao',
    damage_multiplier: 1.8,
    cooldown: 3,
    mana_cost: 40,
    min_realm: 5,
    emoji: '🌑',
    target: 'single',
    extra_effect: { life_steal_percent: 10 },
    description: 'Chém bằng kiếm khí bóng tối, hút 10% sát thương thành HP. Ma Đạo sát chiêu.',
  },
  {
    id: 'dia_liet_chuong',
    name: 'Địa Liệt Chưởng',
    type: 'attack',
    element: 'earth',
    grade: 'bao',
    damage_multiplier: 1.7,
    cooldown: 3,
    mana_cost: 35,
    min_realm: 4,
    emoji: '🪨',
    target: 'aoe',
    extra_effect: { def_break_percent: 10, duration: 2 },
    description: 'Đập nát mặt đất, gây sát thương diện và giảm 10% phòng ngự mục tiêu 2 lượt.',
  },
  {
    id: 'thien_hoa_lien',
    name: 'Thiên Hỏa Liên',
    type: 'attack',
    element: 'fire',
    grade: 'thanh',
    damage_multiplier: 2.2,
    cooldown: 4,
    mana_cost: 60,
    min_realm: 8,
    emoji: '🌋',
    target: 'single',
    extra_effect: { burn_damage_percent: 5, burn_duration: 3 },
    description: 'Thiên hỏa liên hoàn, cháy rực tam giới. Gây thêm 5% ATK thiêu đốt trong 3 lượt.',
  },

  // ═══════════════════════════════════════════
  //  DEFENSE SKILLS (Kỹ Năng Phòng Thủ)
  // ═══════════════════════════════════════════
  {
    id: 'kim_chung_trao',
    name: 'Kim Chung Tráo',
    type: 'defense',
    element: 'neutral',
    grade: 'linh',
    effect: { def_bonus_percent: 30, duration: 3 },
    cooldown: 4,
    mana_cost: 25,
    min_realm: 2,
    emoji: '🔔',
    target: 'self',
    description: 'Triệu hồi chuông vàng hộ thể, tăng 30% phòng ngự trong 3 lượt.',
  },
  {
    id: 'tho_thuan',
    name: 'Thổ Thuẫn',
    type: 'defense',
    element: 'earth',
    grade: 'pham',
    effect: { shield_flat: 50, duration: 2 },
    cooldown: 3,
    mana_cost: 15,
    min_realm: 1,
    emoji: '🛡️',
    target: 'self',
    description: 'Tạo lá chắn đất hấp thụ 50 sát thương trong 2 lượt.',
  },
  {
    id: 'thuy_tinh_ket_gioi',
    name: 'Thủy Tinh Kết Giới',
    type: 'defense',
    element: 'water',
    grade: 'bao',
    effect: { damage_reduction_percent: 40, duration: 2, reflect_percent: 10 },
    cooldown: 5,
    mana_cost: 45,
    min_realm: 5,
    emoji: '🌊',
    target: 'self',
    description: 'Kết giới thủy tinh bao quanh, giảm 40% sát thương và phản 10% về kẻ tấn công.',
  },

  // ═══════════════════════════════════════════
  //  BUFF SKILLS (Kỹ Năng Tăng Cường)
  // ═══════════════════════════════════════════
  {
    id: 'tang_toc_thuat',
    name: 'Tăng Tốc Thuật',
    type: 'buff',
    element: 'wind',
    grade: 'pham',
    effect: { speed_bonus_percent: 25, duration: 3 },
    cooldown: 4,
    mana_cost: 15,
    min_realm: 1,
    emoji: '💨',
    target: 'self',
    description: 'Tăng 25% tốc độ trong 3 lượt. Hành động trước đối thủ.',
  },
  {
    id: 'cuong_chien',
    name: 'Cuồng Chiến',
    type: 'buff',
    element: 'neutral',
    grade: 'linh',
    effect: { atk_bonus_percent: 30, def_reduction_percent: 15, duration: 4 },
    cooldown: 5,
    mana_cost: 30,
    min_realm: 3,
    emoji: '😡',
    target: 'self',
    description: 'Bùng phát chiến ý, tăng 30% ATK nhưng giảm 15% DEF trong 4 lượt. Đánh đổi phòng ngự lấy sức mạnh.',
  },
  {
    id: 'linh_ap',
    name: 'Linh Áp',
    type: 'buff',
    element: 'neutral',
    grade: 'bao',
    effect: { all_stats_bonus_percent: 15, duration: 5 },
    cooldown: 6,
    mana_cost: 50,
    min_realm: 5,
    emoji: '🌟',
    target: 'self',
    description: 'Bùng phát toàn bộ linh lực, tăng 15% toàn chỉ số trong 5 lượt.',
  },

  // ═══════════════════════════════════════════
  //  DEBUFF SKILLS (Kỹ Năng Suy Yếu)
  // ═══════════════════════════════════════════
  {
    id: 'phong_an_thuat',
    name: 'Phong Ấn Thuật',
    type: 'debuff',
    element: 'neutral',
    grade: 'linh',
    effect: { seal_skills: true, duration: 2 },
    cooldown: 5,
    mana_cost: 30,
    min_realm: 3,
    emoji: '🔒',
    target: 'single',
    description: 'Phong ấn kỹ năng kẻ địch trong 2 lượt. Chúng chỉ có thể đánh thường.',
  },
  {
    id: 'doc_vu',
    name: 'Độc Vụ',
    type: 'debuff',
    element: 'wood',
    grade: 'linh',
    effect: { poison_damage_percent: 5, poison_duration: 4, atk_reduction_percent: 10 },
    cooldown: 3,
    mana_cost: 20,
    min_realm: 2,
    emoji: '☠️',
    target: 'aoe',
    description: 'Phun sương độc diện rộng, gây 5% ATK sát thương độc mỗi lượt và giảm 10% ATK kẻ địch.',
  },
  {
    id: 'tam_ma_thuat',
    name: 'Tâm Ma Thuật',
    type: 'debuff',
    element: 'dark',
    grade: 'bao',
    effect: { confuse_chance: 30, atk_reduction_percent: 20, duration: 3 },
    cooldown: 5,
    mana_cost: 40,
    min_realm: 5,
    emoji: '😈',
    target: 'single',
    description: 'Gieo tâm ma vào kẻ địch, 30% cơ hội gây hoang mang (tự đánh bản thân) và giảm 20% ATK.',
  },

  // ═══════════════════════════════════════════
  //  HEAL SKILLS (Kỹ Năng Hồi Phục)
  // ═══════════════════════════════════════════
  {
    id: 'tri_lieu_thuat',
    name: 'Trị Liệu Thuật',
    type: 'heal',
    element: 'wood',
    grade: 'pham',
    effect: { heal_percent: 15 },
    cooldown: 3,
    mana_cost: 20,
    min_realm: 1,
    emoji: '💚',
    target: 'self',
    description: 'Hồi phục 15% HP tối đa. Kỹ năng trị thương cơ bản.',
  },
  {
    id: 'hoi_xuan',
    name: 'Hồi Xuân',
    type: 'heal',
    element: 'water',
    grade: 'linh',
    effect: { heal_percent: 25, hot_percent: 5, hot_duration: 3 },
    cooldown: 4,
    mana_cost: 35,
    min_realm: 3,
    emoji: '🌸',
    target: 'self',
    description: 'Hồi 25% HP tức thì và 5% HP mỗi lượt trong 3 lượt. Xuân về, vạn vật phục hồi.',
  },
  {
    id: 'tinh_hoa_linh_tuyen',
    name: 'Tinh Hoa Linh Tuyền',
    type: 'heal',
    element: 'water',
    grade: 'bao',
    effect: { heal_percent: 40, cleanse: true },
    cooldown: 5,
    mana_cost: 50,
    min_realm: 6,
    emoji: '🌊',
    target: 'self',
    description: 'Hồi phục 40% HP và tẩy sạch mọi debuff. Nước suối linh thiêng tịnh hóa thân thể.',
  },

  // ═══════════════════════════════════════════
  //  ULTIMATE SKILLS (Tuyệt Chiêu)
  // ═══════════════════════════════════════════
  {
    id: 'cuu_kiem_quy_nhat',
    name: 'Cửu Kiếm Quy Nhất',
    type: 'ultimate',
    element: 'neutral',
    grade: 'thanh',
    damage_multiplier: 3.5,
    cooldown: 8,
    mana_cost: 80,
    min_realm: 7,
    emoji: '🗡️',
    target: 'single',
    extra_effect: { ignore_def_percent: 30 },
    description: 'Chín kiếm khí hợp nhất, một kiếm chém tất cả. Bỏ qua 30% phòng ngự. Tuyệt chiêu kiếm đạo.',
  },
  {
    id: 'thien_loi',
    name: 'Thiên Lôi',
    type: 'ultimate',
    element: 'thunder',
    grade: 'thanh',
    damage_multiplier: 3.0,
    cooldown: 7,
    mana_cost: 75,
    min_realm: 7,
    emoji: '🌩️',
    target: 'aoe',
    extra_effect: { stun_chance: 25, stun_duration: 1 },
    description: 'Triệu hồi thiên lôi giáng xuống toàn trường. Sát thương diện rộng, 25% choáng.',
  },
  {
    id: 'bat_hoang_diet_the_kiem',
    name: 'Bát Hoang Diệt Thế Kiếm',
    type: 'ultimate',
    element: 'chaos',
    grade: 'tien',
    damage_multiplier: 5.0,
    cooldown: 10,
    mana_cost: 150,
    min_realm: 12,
    emoji: '⚔️',
    target: 'single',
    extra_effect: { ignore_def_percent: 50, crit_rate_bonus: 30 },
    description: 'Nhất kiếm diệt bát hoang. Sát thương tối thượng bỏ qua 50% phòng ngự, tăng 30% bạo kích.',
  },
  {
    id: 'van_phat_quy_tong',
    name: 'Vạn Pháp Quy Tông',
    type: 'ultimate',
    element: 'chaos',
    grade: 'than',
    damage_multiplier: 8.0,
    cooldown: 15,
    mana_cost: 300,
    min_realm: 20,
    emoji: '🌀',
    target: 'aoe',
    extra_effect: { ignore_def_percent: 70, ignore_shield: true },
    description: 'Vạn pháp thiên hạ, quy về một mối. Kỹ năng tối thượng hủy diệt mọi thứ, bỏ qua phòng ngự và hộ thuẫn.',
  },
];

module.exports = {
  skills,
  list: skills, // Alias for menu compatibility

  /**
   * Lấy kỹ năng theo id
   */
  getSkillById(id) {
    return skills.find(s => s.id === id);
  },

  /**
   * Lấy kỹ năng theo loại
   */
  getByType(type) {
    return skills.filter(s => s.type === type);
  },

  /**
   * Lấy kỹ năng theo nguyên tố
   */
  getByElement(element) {
    return skills.filter(s => s.element === element);
  },

  /**
   * Lấy kỹ năng có thể học tại realm
   */
  getAvailableAt(realmOrder) {
    return skills.filter(s => s.min_realm <= realmOrder);
  },

  /**
   * Lấy kỹ năng theo grade
   */
  getByGrade(grade) {
    return skills.filter(s => s.grade === grade);
  },
};
