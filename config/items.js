/**
 * @file Items (Vật Phẩm) Configuration
 * @description Đan dược, nguyên liệu, sách kỹ năng, và vật phẩm tiêu hao
 *
 * Types:
 *   - pill (đan dược): sử dụng để hồi phục, đột phá, tăng sức
 *   - material (nguyên liệu): dùng để luyện đan, chế tạo
 *   - skill_book (sách kỹ năng): học kỹ năng mới
 *   - consumable (tiêu hao): sử dụng trong chiến đấu
 *   - special (đặc biệt): vật phẩm hiếm có công dụng đặc biệt
 *
 * Grades: Phàm < Linh < Bảo < Thánh < Tiên < Thần
 */

const items = [
  // ═══════════════════════════════════════════
  //  ĐAN DƯỢC — PILLS (Hồi phục & Đột phá)
  // ═══════════════════════════════════════════
  {
    id: 'thu_dan',
    name: 'Thú Đan',
    type: 'pill',
    grade: 'pham',
    emoji: '💊',
    effect: { exp: 50 },
    value: 10,
    stackable: true,
    max_stack: 99,
    description: 'Đan dược cơ bản từ nội đan yêu thú. Cung cấp 50 exp tu luyện.',
  },
  {
    id: 'hoi_khi_dan',
    name: 'Hồi Khí Đan',
    type: 'pill',
    grade: 'pham',
    emoji: '💚',
    effect: { hp_percent: 20 },
    value: 15,
    stackable: true,
    max_stack: 99,
    description: 'Hồi phục 20% HP tối đa. Đan dược hồi phục cơ bản.',
  },
  {
    id: 'hoi_linh_dan',
    name: 'Hồi Linh Đan',
    type: 'pill',
    grade: 'pham',
    emoji: '💙',
    effect: { mana_percent: 20 },
    value: 15,
    stackable: true,
    max_stack: 99,
    description: 'Hồi phục 20% Mana tối đa. Đan dược hồi linh lực cơ bản.',
  },
  {
    id: 'truc_co_dan',
    name: 'Trúc Cơ Đan',
    type: 'pill',
    grade: 'pham',
    emoji: '🟢',
    effect: { breakthrough_bonus: 10, target_realm: 2 },
    value: 100,
    stackable: true,
    max_stack: 10,
    description: 'Tăng 10% tỉ lệ đột phá lên Trúc Cơ. Đan dược đột phá cơ bản.',
  },
  {
    id: 'kim_dan_dan',
    name: 'Kim Đan Đan',
    type: 'pill',
    grade: 'linh',
    emoji: '🟡',
    effect: { breakthrough_bonus: 10, target_realm: 3 },
    value: 500,
    stackable: true,
    max_stack: 10,
    description: 'Tăng 10% tỉ lệ đột phá lên Kim Đan. Linh cấp đan dược.',
  },
  {
    id: 'bao_dan',
    name: 'Bảo Đan',
    type: 'pill',
    grade: 'bao',
    emoji: '🔵',
    effect: { exp: 5000, all_stats_temp: 10, duration: 3600 },
    value: 2000,
    stackable: true,
    max_stack: 10,
    description: 'Đan dược bảo cấp, cung cấp 5000 exp và tăng 10% toàn chỉ số trong 1 giờ.',
  },
  {
    id: 'nguyen_anh_dan',
    name: 'Nguyên Anh Đan',
    type: 'pill',
    grade: 'linh',
    emoji: '🟣',
    effect: { breakthrough_bonus: 15, target_realm: 4 },
    value: 1500,
    stackable: true,
    max_stack: 5,
    description: 'Tăng 15% tỉ lệ đột phá lên Nguyên Anh. Hỗ trợ vượt Tiểu Kiếp.',
  },
  {
    id: 'hop_the_dan',
    name: 'Hợp Thể Đan',
    type: 'pill',
    grade: 'bao',
    emoji: '🔗',
    effect: { breakthrough_bonus: 15, target_realm: 7 },
    value: 5000,
    stackable: true,
    max_stack: 5,
    description: 'Tăng 15% tỉ lệ đột phá lên Hợp Thể. Bảo cấp đan dược quý hiếm.',
  },
  {
    id: 'thanh_dan',
    name: 'Thánh Đan',
    type: 'pill',
    grade: 'thanh',
    emoji: '⭐',
    effect: { exp: 50000, hp_percent: 100, mana_percent: 100 },
    value: 20000,
    stackable: true,
    max_stack: 5,
    description: 'Đan dược thánh cấp, hồi phục toàn bộ HP/Mana và cung cấp 50000 exp.',
  },
  {
    id: 'tien_dan',
    name: 'Tiên Đan',
    type: 'pill',
    grade: 'tien',
    emoji: '🌟',
    effect: { exp: 500000, all_stats_permanent: 5, breakthrough_bonus: 20 },
    value: 100000,
    stackable: true,
    max_stack: 3,
    description: 'Đan dược tiên cấp truyền thuyết, vĩnh viễn tăng 5% toàn chỉ số và 500000 exp.',
  },
  {
    id: 'dai_hoi_xuan_dan',
    name: 'Đại Hồi Xuân Đan',
    type: 'pill',
    grade: 'linh',
    emoji: '🌸',
    effect: { hp_percent: 50, cleanse: true },
    value: 200,
    stackable: true,
    max_stack: 20,
    description: 'Hồi phục 50% HP và tẩy mọi debuff. Đan dược hồi phục cao cấp.',
  },
  {
    id: 'cuong_the_dan',
    name: 'Cường Thể Đan',
    type: 'pill',
    grade: 'linh',
    emoji: '💪',
    effect: { atk_temp: 20, def_temp: 20, duration: 1800 },
    value: 300,
    stackable: true,
    max_stack: 20,
    description: 'Tạm tăng 20% ATK và DEF trong 30 phút. Dùng trước chiến đấu.',
  },

  // ═══════════════════════════════════════════
  //  NGUYÊN LIỆU — MATERIALS
  // ═══════════════════════════════════════════
  {
    id: 'linh_thao',
    name: 'Linh Thảo',
    type: 'material',
    grade: 'pham',
    emoji: '🌿',
    effect: null,
    value: 5,
    stackable: true,
    max_stack: 999,
    description: 'Cỏ linh cơ bản, nguyên liệu luyện đan phàm cấp.',
  },
  {
    id: 'hoa_tinh_thach',
    name: 'Hỏa Tinh Thạch',
    type: 'material',
    grade: 'pham',
    emoji: '🔴',
    effect: null,
    value: 10,
    stackable: true,
    max_stack: 999,
    description: 'Đá chứa hỏa linh lực, nguyên liệu luyện đan và rèn vũ khí Hỏa hệ.',
  },
  {
    id: 'bang_tinh',
    name: 'Băng Tinh',
    type: 'material',
    grade: 'linh',
    emoji: '❄️',
    effect: null,
    value: 50,
    stackable: true,
    max_stack: 999,
    description: 'Tinh thể băng ngàn năm, nguyên liệu Băng hệ quý hiếm.',
  },
  {
    id: 'loi_tinh',
    name: 'Lôi Tinh',
    type: 'material',
    grade: 'linh',
    emoji: '⚡',
    effect: null,
    value: 60,
    stackable: true,
    max_stack: 999,
    description: 'Tinh hoa sấm sét ngưng tụ, nguyên liệu Lôi hệ quý.',
  },
  {
    id: 'thach_tinh',
    name: 'Thạch Tinh',
    type: 'material',
    grade: 'pham',
    emoji: '💎',
    effect: null,
    value: 8,
    stackable: true,
    max_stack: 999,
    description: 'Tinh thạch khoáng sản, nguyên liệu rèn trang bị cơ bản.',
  },
  {
    id: 'lang_nha',
    name: 'Lang Nha',
    type: 'material',
    grade: 'pham',
    emoji: '🦷',
    effect: null,
    value: 12,
    stackable: true,
    max_stack: 999,
    description: 'Nanh sói sắc nhọn, nguyên liệu rèn vũ khí.',
  },
  {
    id: 'xa_dam',
    name: 'Xà Đảm',
    type: 'material',
    grade: 'pham',
    emoji: '💚',
    effect: null,
    value: 15,
    stackable: true,
    max_stack: 999,
    description: 'Mật rắn, nguyên liệu luyện đan độc và giải độc.',
  },
  {
    id: 'doc_nang',
    name: 'Độc Nang',
    type: 'material',
    grade: 'linh',
    emoji: '☠️',
    effect: null,
    value: 30,
    stackable: true,
    max_stack: 999,
    description: 'Túi nọc độc cô đọng, nguyên liệu luyện đan độc.',
  },
  {
    id: 'long_lân',
    name: 'Long Lân',
    type: 'material',
    grade: 'thanh',
    emoji: '🐲',
    effect: null,
    value: 5000,
    stackable: true,
    max_stack: 99,
    description: 'Vảy rồng, nguyên liệu thánh cấp cho rèn giáp và luyện đan.',
  },
  {
    id: 'thuong_co_tinh_huyet',
    name: 'Thượng Cổ Tinh Huyết',
    type: 'material',
    grade: 'tien',
    emoji: '🩸',
    effect: null,
    value: 50000,
    stackable: true,
    max_stack: 10,
    description: 'Tinh huyết thượng cổ dị thú, nguyên liệu tiên cấp cực quý.',
  },
  {
    id: 'than_tinh',
    name: 'Thần Tinh',
    type: 'material',
    grade: 'than',
    emoji: '🌌',
    effect: null,
    value: 500000,
    stackable: true,
    max_stack: 5,
    description: 'Tinh hoa thần cấp, nguyên liệu tối thượng. Cực kỳ hiếm.',
  },
  {
    id: 'linh_moc',
    name: 'Linh Mộc',
    type: 'material',
    grade: 'pham',
    emoji: '🪵',
    effect: null,
    value: 8,
    stackable: true,
    max_stack: 999,
    description: 'Gỗ linh mộc, nguyên liệu chế tạo cung tên và pháp khí Mộc hệ.',
  },
  {
    id: 'am_khi_thach',
    name: 'Âm Khí Thạch',
    type: 'material',
    grade: 'linh',
    emoji: '🌑',
    effect: null,
    value: 40,
    stackable: true,
    max_stack: 999,
    description: 'Đá chứa Âm khí, nguyên liệu Ma Đạo.',
  },
  {
    id: 'hon_don_tinh',
    name: 'Hỗn Độn Tinh',
    type: 'material',
    grade: 'than',
    emoji: '🌀',
    effect: null,
    value: 1000000,
    stackable: true,
    max_stack: 3,
    description: 'Tinh chất Hỗn Độn nguyên thủy, vật liệu thần thoại. Dùng chế tạo thần khí.',
  },

  // ═══════════════════════════════════════════
  //  SÁCH KỸ NĂNG — SKILL BOOKS
  // ═══════════════════════════════════════════
  {
    id: 'hoa_cau_thuat_sach',
    name: 'Sách Hỏa Cầu Thuật',
    type: 'skill_book',
    grade: 'pham',
    emoji: '📕',
    effect: { learn_skill: 'hoa_cau_thuat' },
    value: 50,
    stackable: false,
    max_stack: 1,
    description: 'Học kỹ năng Hỏa Cầu Thuật. Sách kỹ năng cơ bản.',
  },
  {
    id: 'kiem_quang_sach',
    name: 'Sách Kiếm Quang',
    type: 'skill_book',
    grade: 'pham',
    emoji: '📗',
    effect: { learn_skill: 'kiem_quang' },
    value: 50,
    stackable: false,
    max_stack: 1,
    description: 'Học kỹ năng Kiếm Quang. Sách kỹ năng cơ bản.',
  },
  {
    id: 'cuu_kiem_quy_nhat_sach',
    name: 'Bí Tịch Cửu Kiếm Quy Nhất',
    type: 'skill_book',
    grade: 'thanh',
    emoji: '📙',
    effect: { learn_skill: 'cuu_kiem_quy_nhat' },
    value: 50000,
    stackable: false,
    max_stack: 1,
    description: 'Bí tịch thánh cấp, học tuyệt chiêu Cửu Kiếm Quy Nhất.',
  },

  // ═══════════════════════════════════════════
  //  TIÊU HAO — CONSUMABLES
  // ═══════════════════════════════════════════
  {
    id: 'truyen_tong_phu',
    name: 'Truyền Tống Phù',
    type: 'consumable',
    grade: 'linh',
    emoji: '📜',
    effect: { teleport: true },
    value: 100,
    stackable: true,
    max_stack: 20,
    description: 'Bùa truyền tống, dịch chuyển tức thì về thành trì. Sử dụng một lần.',
  },
  {
    id: 'ho_the_phu',
    name: 'Hộ Thể Phù',
    type: 'consumable',
    grade: 'linh',
    emoji: '🛡️',
    effect: { shield_flat: 200, duration: 1 },
    value: 150,
    stackable: true,
    max_stack: 10,
    description: 'Bùa hộ thể, tạo lá chắn 200 HP cho 1 trận chiến.',
  },
  {
    id: 'kiep_loi_phu',
    name: 'Kiếp Lôi Phù',
    type: 'consumable',
    grade: 'bao',
    emoji: '⛈️',
    effect: { tribulation_bonus: 15 },
    value: 5000,
    stackable: true,
    max_stack: 5,
    description: 'Bùa kiếp lôi, tăng 15% tỉ lệ vượt kiếp nạn. Vật phẩm quý.',
  },
  {
    id: 'cuoc_khai_khoang',
    name: 'Cuốc Khai Khoáng',
    type: 'material',
    grade: 'pham',
    emoji: '⛏️',
    value: 50,
    stackable: false,
    description: 'Cuốc khai khoáng bằng sắt, giúp tăng 50% sản lượng và mở khóa cơ hội tìm thấy đá quý.',
  },
];

module.exports = {
  items,
  list: items, // Alias for menu compatibility
  // Indexed breakthrough pills by target realm index for cultivation-menu
  breakthroughPills: items
    .filter(i => i.type === 'pill' && i.effect && i.effect.target_realm)
    .reduce((acc, pill) => { acc[pill.effect.target_realm] = pill; return acc; }, {}),

  /**
   * Lấy item theo id
   */
  getItemById(id) {
    return items.find(i => i.id === id);
  },

  /**
   * Lấy item theo type
   */
  getByType(type) {
    return items.filter(i => i.type === type);
  },

  /**
   * Lấy item theo grade
   */
  getByGrade(grade) {
    return items.filter(i => i.grade === grade);
  },

  /**
   * Lấy danh sách đan dược đột phá
   */
  getBreakthroughPills() {
    return items.filter(i => i.type === 'pill' && i.effect && i.effect.breakthrough_bonus);
  },

  /**
   * Lấy danh sách sách kỹ năng
   */
  getSkillBooks() {
    return items.filter(i => i.type === 'skill_book');
  },
};
