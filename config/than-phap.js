/**
 * @file Thân Pháp (Movement/Dodge Skills) Configuration
 * @description Kỹ năng di chuyển/né tránh phân theo nguyên tố & kiếm
 *
 * Bám sát game Quỷ Cốc Bát Hoang:
 *   - Phong: Bất tử khi bật (100% né), tạo Toàn Phong hút quái
 *   - Thủy: Tạo huyễn ảnh/phân thân, phân thân tự dùng Thần Thông
 *   - Kiếm: Ngự kiếm bay, +damage, giảm CD Võ Kỹ
 *   - Hỏa: Bùng nổ damage xung quanh
 *   - Lôi: Dịch chuyển tức thì, choáng kẻ địch
 *   - Thổ: Giáp đất, siêu tanky
 *   - Mộc: Hồi máu + ràng buộc
 */

const thanPhapList = [
  // ═══════════════════════════════════════
  //  PHONG THÂN PHÁP — Bất tử né tránh
  // ═══════════════════════════════════════
  {
    id: 'phong_than_phap',
    name: 'Phong Thân Pháp',
    element: 'phong',
    grade: 'bao',
    emoji: '🌪️',
    cooldown_turns: 5,
    mana_cost: 40,
    duration_turns: 2,
    effect: {
      type: 'ne_tranh',
      dodge_percent: 100, // Bật lên = không nhận sát thương (game gốc)
      toan_phong: true,   // Tạo vòi rồng hút quái
      toan_phong_damage_per_turn: 15, // % ATK
    },
    min_realm: 3,
    rollable_options: [
      { id: 'cd_reduction', name: 'Giảm hồi chiêu Thân Pháp', max_red: -2, unit: ' lượt' },
      { id: 'toan_phong_damage', name: 'Sát thương Toàn Phong', max_red: 25, unit: '%' },
      { id: 'ho_tam', name: 'Thân pháp hộ tâm (chống sốc)', max_red: 40, unit: '%' },
      { id: 'duration_up', name: 'Tăng thời gian', max_red: 2, unit: ' lượt' },
    ],
    description: 'Bất tử! Bật thân pháp = miễn nhiễm toàn bộ sát thương. Tạo vòi rồng hút quái vào trung tâm.',
  },
  {
    id: 'phong_than_phap_cao',
    name: 'Cuồng Phong Thân Pháp',
    element: 'phong',
    grade: 'thanh',
    emoji: '🌪️✨',
    cooldown_turns: 4,
    mana_cost: 70,
    duration_turns: 3,
    effect: {
      type: 'ne_tranh',
      dodge_percent: 100,
      toan_phong: true,
      toan_phong_damage_per_turn: 25,
      speed_bonus: 50, // +50% tốc độ
    },
    min_realm: 7,
    rollable_options: [
      { id: 'cd_reduction', name: 'Giảm hồi chiêu', max_red: -2, unit: ' lượt' },
      { id: 'toan_phong_damage', name: 'Sát thương Toàn Phong', max_red: 40, unit: '%' },
      { id: 'toan_phong_interval', name: 'Tạo Toàn Phong nhanh hơn', max_red: -1, unit: ' lượt' },
      { id: 'ho_tam', name: 'Hộ tâm chống sốc', max_red: 60, unit: '%' },
    ],
    description: 'Cuồng phong bất tử nâng cao. Tốc độ +50%, vòi rồng sát thương cao hơn.',
  },

  // ═══════════════════════════════════════
  //  THỦY THÂN PHÁP — Huyễn ảnh/phân thân
  // ═══════════════════════════════════════
  {
    id: 'thuy_phan_than',
    name: 'Thủy Phân Thân',
    element: 'thuy',
    grade: 'bao',
    emoji: '💧',
    cooldown_turns: 5,
    mana_cost: 50,
    duration_turns: 3,
    effect: {
      type: 'huyen_anh',
      clone_count: 4,
      clone_damage_percent: 40,     // Phân thân gây 40% damage gốc
      clone_can_use_than_thong: true, // GAME GỐC: phân thân tự dùng Thần Thông!
      on_clone_death_mana_regen: 244, // GAME GỐC: huyễn ảnh tan hồi 244 linh lực
    },
    min_realm: 3,
    rollable_options: [
      { id: 'clone_duration', name: 'Thời gian huyễn ảnh', max_red: 2, unit: ' lượt' },
      { id: 'clone_damage', name: 'Sát thương huyễn ảnh', max_red: 25, unit: '%' },
      { id: 'cd_reduction', name: 'Giảm hồi chiêu Thân Pháp', max_red: -2, unit: ' lượt' },
      { id: 'damage_taken_reduction', name: 'Huyễn ảnh chịu đòn', max_red: 30, unit: '%' },
    ],
    description: 'Tạo 4 huyễn ảnh Thủy. Ảnh tấn công 40% damage, tự dùng Thần Thông! Ảnh tan hồi 244 linh lực.',
  },

  // ═══════════════════════════════════════
  //  KIẾM THÂN PHÁP — Ngự kiếm bay
  // ═══════════════════════════════════════
  {
    id: 'kiem_than_phap',
    name: 'Kiếm Thân Pháp',
    element: 'kiem',
    grade: 'bao',
    emoji: '🗡️💨',
    cooldown_turns: 4,
    mana_cost: 35,
    duration_turns: 3,
    effect: {
      type: 'ngu_kiem',
      speed_bonus_percent: 80,           // +80% tốc
      damage_bonus_while_active: 25,     // +25% damage khi ngự kiếm
      cd_reduction_vo_ky_percent: 20,    // Giảm 20% CD Võ Kỹ
      damage_reduction_percent: 30,      // Giảm 30% sát thương nhận
    },
    min_realm: 3,
    rollable_options: [
      { id: 'cd_vo_ky', name: 'Giảm CD Võ Kỹ thêm', max_red: 15, unit: '%' },
      { id: 'ngu_kiem_damage', name: 'Tăng damage ngự kiếm', max_red: 20, unit: '%' },
      { id: 'duration_up', name: 'Tăng thời gian', max_red: 2, unit: ' lượt' },
      { id: 'cd_reduction', name: 'Giảm hồi chiêu Thân Pháp', max_red: -2, unit: ' lượt' },
      { id: 'tp_5s', name: '+5s thời gian duy trì', max_red: 1, unit: ' lượt' },
    ],
    description: 'Cưỡi kiếm bay! +80% tốc, +25% damage, giảm 20% CD Võ Kỹ, giảm 30% sát thương nhận.',
  },

  // ═══════════════════════════════════════
  //  HỎA THÂN PHÁP — Bùng nổ damage
  // ═══════════════════════════════════════
  {
    id: 'hoa_than_phap',
    name: 'Hỏa Thân Pháp',
    element: 'hoa',
    grade: 'bao',
    emoji: '🔥💨',
    cooldown_turns: 4,
    mana_cost: 45,
    duration_turns: 2,
    effect: {
      type: 'bung_no',
      aoe_damage_on_activate: 80, // 80% ATK damage AOE khi kích hoạt
      burn_dot_percent: 5,        // Thiêu đốt 5% ATK/lượt cho kẻ địch trong vùng
      burn_duration: 3,
      atk_bonus_percent: 20,
    },
    min_realm: 3,
    rollable_options: [
      { id: 'aoe_damage', name: 'Sát thương bùng nổ', max_red: 40, unit: '%' },
      { id: 'burn_damage', name: 'Sát thương thiêu đốt', max_red: 8, unit: '%' },
      { id: 'atk_bonus', name: 'Tăng ATK', max_red: 30, unit: '%' },
      { id: 'cd_reduction', name: 'Giảm hồi chiêu', max_red: -2, unit: ' lượt' },
    ],
    description: 'Bùng nổ hỏa diệm! AOE damage 80% ATK, thiêu đốt kẻ địch, +20% ATK.',
  },

  // ═══════════════════════════════════════
  //  LÔI THÂN PHÁP — Dịch chuyển tức thì
  // ═══════════════════════════════════════
  {
    id: 'loi_than_phap',
    name: 'Lôi Thân Pháp',
    element: 'loi',
    grade: 'bao',
    emoji: '⚡💨',
    cooldown_turns: 3,
    mana_cost: 40,
    duration_turns: 1,
    effect: {
      type: 'dich_chuyen',
      stun_on_arrive: true,       // Choáng kẻ địch khi dịch chuyển tới
      stun_duration: 1,
      speed_bonus_percent: 100,
      damage_bonus_next_hit: 50,  // +50% damage đòn đầu tiên sau dịch chuyển
    },
    min_realm: 3,
    rollable_options: [
      { id: 'stun_duration', name: 'Choáng', max_red: 2, unit: ' lượt' },
      { id: 'damage_bonus', name: 'Damage đòn đầu', max_red: 80, unit: '%' },
      { id: 'cd_reduction', name: 'Giảm hồi chiêu', max_red: -1, unit: ' lượt' },
      { id: 'chain_lightning', name: 'Sấm sét lan', max_red: 3, unit: ' mục tiêu' },
    ],
    description: 'Dịch chuyển tức thì bằng sấm sét! Choáng kẻ địch, +50% damage đòn đầu.',
  },

  // ═══════════════════════════════════════
  //  THỔ THÂN PHÁP — Tank/giáp đất
  // ═══════════════════════════════════════
  {
    id: 'tho_than_phap',
    name: 'Thổ Thân Pháp',
    element: 'tho',
    grade: 'bao',
    emoji: '🪨💨',
    cooldown_turns: 5,
    mana_cost: 35,
    duration_turns: 4,
    effect: {
      type: 'giap_dat',
      shield_percent_max_hp: 30,      // Tạo giáp = 30% max HP
      def_bonus_percent: 50,
      damage_reduction_percent: 25,
      thorns_percent: 10,             // Phản 10% sát thương nhận
    },
    min_realm: 3,
    rollable_options: [
      { id: 'shield_up', name: 'Tăng giáp', max_red: 20, unit: '%' },
      { id: 'thorns', name: 'Phản thương', max_red: 15, unit: '%' },
      { id: 'duration_up', name: 'Tăng thời gian', max_red: 2, unit: ' lượt' },
      { id: 'cd_reduction', name: 'Giảm hồi chiêu', max_red: -2, unit: ' lượt' },
    ],
    description: 'Giáp đất bao quanh! Tạo 30% HP giáp, +50% DEF, phản 10% damage nhận.',
  },

  // ═══════════════════════════════════════
  //  MỘC THÂN PHÁP — Hồi máu & ràng buộc
  // ═══════════════════════════════════════
  {
    id: 'moc_than_phap',
    name: 'Mộc Thân Pháp',
    element: 'moc',
    grade: 'bao',
    emoji: '🌿💨',
    cooldown_turns: 5,
    mana_cost: 40,
    duration_turns: 3,
    effect: {
      type: 'hoi_phuc',
      heal_per_turn_percent: 8,       // Hồi 8% HP/lượt
      root_enemy: true,               // Ràng buộc kẻ địch (không di chuyển)
      root_duration: 2,
      cleanse_debuff: true,            // Tẩy debuff
    },
    min_realm: 3,
    rollable_options: [
      { id: 'heal_up', name: 'Tăng hồi máu', max_red: 5, unit: '%/lượt' },
      { id: 'root_duration', name: 'Ràng buộc', max_red: 2, unit: ' lượt' },
      { id: 'cleanse_all', name: 'Tẩy tất cả debuff', max_red: 1, unit: '' },
      { id: 'cd_reduction', name: 'Giảm hồi chiêu', max_red: -2, unit: ' lượt' },
    ],
    description: 'Mộc khí hồi phục! Hồi 8% HP/lượt, ràng buộc kẻ địch, tẩy debuff.',
  },
];

module.exports = {
  thanPhapList,
  list: thanPhapList,

  getThanPhapById(id) {
    return thanPhapList.find(t => t.id === id);
  },

  getByElement(element) {
    return thanPhapList.filter(t => t.element === element);
  },

  getAvailableAt(realmOrder, element) {
    return thanPhapList.filter(t =>
      t.min_realm <= realmOrder &&
      (!element || t.element === element)
    );
  },
};
