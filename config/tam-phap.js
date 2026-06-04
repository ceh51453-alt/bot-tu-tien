/**
 * @file Tâm Pháp (Mind Techniques) Configuration — 6 Slots
 * @description Hệ thống tâm pháp 6 loại theo game Quỷ Cốc Bát Hoang
 *
 * 6 slot:
 *   1. Thần Công (📕) — Tâm pháp chính, giảm CD thân pháp/tuyệt kỹ
 *   2. Đại Pháp (📗) — Tâm pháp phụ, giảm CD mạnh cho 1 hệ
 *   3. Bí Quyển (📘) — Buff hiệu ứng stack
 *   4. Quyết (📙) — Hồi linh lực
 *   5. Ngang (📓) — Hồi HP
 *   6. Lục (📒) — Support: đan dược, buff misc
 *
 * Mỗi tâm pháp có rollable_options dựa Ngộ Tính
 * Grade: trang → luc → lam → bao → thanh
 */

const TAM_PHAP_SLOTS = {
  than_cong: {
    id: 'than_cong',
    name: 'Thần Công',
    emoji: '📕',
    description: 'Tâm pháp chính. Giảm CD thân pháp/tuyệt kỹ, tăng damage.',
  },
  dai_phap: {
    id: 'dai_phap',
    name: 'Đại Pháp',
    emoji: '📗',
    description: 'Giảm CD mạnh cho 1 loại kỹ năng (thường -25%).',
  },
  bi_quyen: {
    id: 'bi_quyen',
    name: 'Bí Quyển',
    emoji: '📘',
    description: 'Tăng hiệu ứng stack (Kiếm Trảm, Huyết Sát...).',
  },
  quyet: {
    id: 'quyet',
    name: 'Quyết',
    emoji: '📙',
    description: 'Hồi linh lực theo điều kiện.',
  },
  ngang: {
    id: 'ngang',
    name: 'Ngang',
    emoji: '📓',
    description: 'Hồi HP theo điều kiện.',
  },
  luc: {
    id: 'luc',
    name: 'Lục',
    emoji: '📒',
    description: 'Support: đan dược buff, tăng stats, hiệu ứng đặc biệt.',
  },
};

const tamPhapList = [
  // ═══════════════════════════════════════
  //  THẦN CÔNG (📕) — Giảm CD Thân Pháp/Tuyệt Kỹ
  // ═══════════════════════════════════════
  {
    id: 'kiem_dao_than_cong',
    name: 'Kiếm Đạo Thần Công',
    slot_type: 'than_cong',
    grade: 'thanh',
    emoji: '📕⚔️',
    weapon_affinity: 'kiem',
    min_realm: 3,
    base_effects: {
      cd_than_phap_reduction: 2,    // -2 lượt CD Thân Pháp
      on_than_phap_cd_tuyet_ky: 2,  // Dùng thân pháp → -2 lượt CD Tuyệt Kỹ
      damage_reduction_on_tp: 30,   // Giảm 30% damage khi thân pháp active
    },
    rollable_options: [
      { id: 'cd_than_phap', name: 'Giảm CD Thân Pháp', max_red: -3, unit: ' lượt' },
      { id: 'cd_tuyet_ky_on_tp', name: 'Thân pháp giảm CD Tuyệt Kỹ', max_red: -3, unit: ' lượt' },
      { id: 'damage_reduction', name: 'Giảm sát thương khi thân pháp', max_red: 50, unit: '%' },
      { id: 'damage_bonus', name: 'Tăng damage kiếm', max_red: 25, unit: '%' },
    ],
    description: 'Thần Công kiếm đạo. Thân pháp ↔ tuyệt kỹ chain giảm CD lẫn nhau.',
  },
  {
    id: 'bat_hoang_than_cong',
    name: 'Bát Hoang Thần Công',
    slot_type: 'than_cong',
    grade: 'thanh',
    emoji: '📕👊',
    weapon_affinity: null, // Dùng cho mọi weapon
    min_realm: 4,
    base_effects: {
      cd_than_phap_reduction: 1,
      cd_tuyet_ky_reduction: 1,
      atk_bonus_percent: 15,
      def_bonus_percent: 10,
    },
    rollable_options: [
      { id: 'cd_all_reduction', name: 'Giảm CD tất cả', max_red: -2, unit: ' lượt' },
      { id: 'atk_bonus', name: 'Tăng ATK', max_red: 20, unit: '%' },
      { id: 'def_bonus', name: 'Tăng DEF', max_red: 15, unit: '%' },
      { id: 'hp_bonus', name: 'Tăng HP', max_red: 20, unit: '%' },
    ],
    description: 'Thần Công vạn năng. Giảm CD tổng + tăng toàn diện. Phù hợp mọi build.',
  },
  {
    id: 'dao_than_cong',
    name: 'Đao Thần Công',
    slot_type: 'than_cong',
    grade: 'bao',
    emoji: '📕🔪',
    weapon_affinity: 'dao',
    min_realm: 3,
    base_effects: {
      cd_than_phap_reduction: 2,
      lifesteal_bonus: 10,
      on_kill_cd_reset_chance: 15,
    },
    rollable_options: [
      { id: 'lifesteal', name: 'Tăng hút máu', max_red: 15, unit: '%' },
      { id: 'cd_than_phap', name: 'Giảm CD Thân Pháp', max_red: -3, unit: ' lượt' },
      { id: 'kill_reset', name: 'Hạ gục = reset CD', max_red: 25, unit: '%' },
      { id: 'damage_bonus', name: 'Tăng damage đao', max_red: 25, unit: '%' },
    ],
    description: 'Thần Công đao. +10% hút máu, 15% hạ gục = reset CD thân pháp.',
  },

  // ═══════════════════════════════════════
  //  ĐẠI PHÁP (📗) — Giảm CD mạnh cho 1 loại
  // ═══════════════════════════════════════
  {
    id: 'dao_dai_phap',
    name: 'Đao Đại Pháp',
    slot_type: 'dai_phap',
    grade: 'bao',
    emoji: '📗🔪',
    weapon_affinity: 'dao',
    min_realm: 3,
    base_effects: {
      cd_vo_ky_reduction_percent: 25,
      cd_tuyet_ky_reduction_percent: 25,
      cd_than_phap_reduction_percent: 25,
      mana_cost_than_thong_reduction: 40,
    },
    rollable_options: [
      { id: 'cd_vo_ky', name: 'Giảm CD Võ Kỹ', max_red: 15, unit: '%' },
      { id: 'cd_tuyet_ky', name: 'Giảm CD Tuyệt Kỹ', max_red: 15, unit: '%' },
      { id: 'cd_than_phap', name: 'Giảm CD Thân Pháp', max_red: 15, unit: '%' },
      { id: 'mana_reduction', name: 'Giảm Linh Lực Thần Thông', max_red: 20, unit: '%' },
    ],
    description: 'Đao Đại Pháp: -25% CD Võ Kỹ/Tuyệt Kỹ/Thân Pháp, -40% mana Thần Thông. Bám sát game!',
  },
  {
    id: 'kiem_dai_phap',
    name: 'Kiếm Đại Pháp',
    slot_type: 'dai_phap',
    grade: 'bao',
    emoji: '📗⚔️',
    weapon_affinity: 'kiem',
    min_realm: 3,
    base_effects: {
      cd_vo_ky_reduction_percent: 25,
      cd_tuyet_ky_reduction_percent: 20,
      cd_than_phap_reduction_percent: 30,
      mana_cost_than_thong_reduction: 35,
    },
    rollable_options: [
      { id: 'cd_vo_ky', name: 'Giảm CD Võ Kỹ', max_red: 15, unit: '%' },
      { id: 'cd_than_phap', name: 'Giảm CD Thân Pháp', max_red: 15, unit: '%' },
      { id: 'damage_bonus', name: 'Tăng damage kiếm', max_red: 20, unit: '%' },
      { id: 'kiem_tram_stack', name: 'Kiếm Trảm +tầng/đòn', max_red: 1, unit: '' },
    ],
    description: 'Kiếm Đại Pháp: -25% CD Võ Kỹ, -30% CD Thân Pháp. Chain kiếm vĩnh cửu.',
  },
  {
    id: 'van_nang_dai_phap',
    name: 'Vạn Năng Đại Pháp',
    slot_type: 'dai_phap',
    grade: 'bao',
    emoji: '📗✨',
    weapon_affinity: null,
    min_realm: 4,
    base_effects: {
      cd_vo_ky_reduction_percent: 20,
      cd_tuyet_ky_reduction_percent: 20,
      cd_than_phap_reduction_percent: 20,
      mana_cost_than_thong_reduction: 30,
    },
    rollable_options: [
      { id: 'cd_all', name: 'Giảm CD tất cả', max_red: 10, unit: '%' },
      { id: 'mana_reduction', name: 'Giảm mana Thần Thông', max_red: 15, unit: '%' },
      { id: 'damage_bonus', name: 'Tăng damage', max_red: 15, unit: '%' },
    ],
    description: 'Đại Pháp vạn năng. -20% CD tất cả. Phù hợp mọi weapon type.',
  },

  // ═══════════════════════════════════════
  //  BÍ QUYỂN (📘) — Buff stack effects
  // ═══════════════════════════════════════
  {
    id: 'kiem_tram_bi_quyen',
    name: 'Kiếm Trảm Bí Quyển',
    slot_type: 'bi_quyen',
    grade: 'bao',
    emoji: '📘🗡️',
    weapon_affinity: 'kiem',
    min_realm: 3,
    base_effects: {
      stack_build_bonus: 2,          // Kiếm Trảm mỗi hit +2 tầng thay vì +1
      stack_duration_bonus: 2,       // +2 lượt duy trì stack
      on_max_stack_cd_than_phap: 4,  // Max stack → -4 CD Thân Pháp (game gốc: 8 tầng = -8s)
    },
    rollable_options: [
      { id: 'stack_build', name: 'Kiếm Trảm tích thêm', max_red: 2, unit: ' tầng/hit' },
      { id: 'max_stack_reward', name: 'Max stack giảm CD Thân Pháp', max_red: -4, unit: ' lượt' },
      { id: 'stack_duration', name: 'Thời gian duy trì stack', max_red: 3, unit: ' lượt' },
      { id: 'xuat_huyet_bonus', name: 'Xuất Huyết mạnh hơn', max_red: 5, unit: '%' },
    ],
    description: 'Kiếm Trảm cộng dồn 3 tầng/đòn! Max stack → -4 CD Thân Pháp. Core bí quyển Kiếm Tu.',
  },
  {
    id: 'huyet_sat_bi_quyen',
    name: 'Huyết Sát Bí Quyển',
    slot_type: 'bi_quyen',
    grade: 'bao',
    emoji: '📘🩸',
    weapon_affinity: 'dao',
    min_realm: 3,
    base_effects: {
      stack_build_bonus: 1,
      lifesteal_per_stack_bonus: 2,
      on_max_stack_berserk: true,    // Max stack → vào trạng thái Cuồng Huyết
      berserk_atk_bonus: 30,
      berserk_duration: 3,
    },
    rollable_options: [
      { id: 'lifesteal_bonus', name: 'Hút máu per stack', max_red: 3, unit: '%' },
      { id: 'berserk_atk', name: 'ATK Cuồng Huyết', max_red: 20, unit: '%' },
      { id: 'berserk_duration', name: 'Thời gian Cuồng Huyết', max_red: 2, unit: ' lượt' },
    ],
    description: 'Huyết Sát hút máu mạnh hơn. Max stack → Cuồng Huyết +30% ATK 3 lượt!',
  },

  // ═══════════════════════════════════════
  //  QUYẾT (📙) — Hồi Linh Lực
  // ═══════════════════════════════════════
  {
    id: 'hoi_linh_quyet',
    name: 'Hồi Linh Quyết',
    slot_type: 'quyet',
    grade: 'bao',
    emoji: '📙💎',
    weapon_affinity: null,
    min_realm: 2,
    base_effects: {
      mana_regen_per_turn: 15,
      mana_regen_on_than_phap_per_turn: 25,   // Duy trì thân pháp mỗi lượt +25 mana
      mana_regen_on_clone_death: 244,          // BÁM SÁT: huyễn ảnh tan hồi 244 linh lực
    },
    rollable_options: [
      { id: 'mana_regen', name: 'Hồi linh lực/lượt', max_red: 15, unit: '' },
      { id: 'tp_mana_regen', name: 'Hồi linh lực khi thân pháp', max_red: 20, unit: '/lượt' },
      { id: 'clone_death_mana', name: 'Huyễn ảnh tan hồi linh lực', max_red: 200, unit: '' },
      { id: 'low_mana_regen', name: 'Linh lực < 20% hồi thêm', max_red: 30, unit: '/lượt' },
    ],
    description: 'Hồi 15 linh lực/lượt. Thân pháp active +25/lượt. Huyễn ảnh tan hồi 244!',
  },

  // ═══════════════════════════════════════
  //  NGANG (📓) — Hồi HP
  // ═══════════════════════════════════════
  {
    id: 'hoi_sinh_ngang',
    name: 'Hồi Sinh Ngang',
    slot_type: 'ngang',
    grade: 'bao',
    emoji: '📓❤️',
    weapon_affinity: null,
    min_realm: 2,
    base_effects: {
      hp_regen_per_turn: 20,
      hp_regen_on_than_phap_percent: 3,    // Thân pháp mỗi lượt hồi 3% max HP
      hp_regen_on_stack_threshold: {
        stack_count: 8,
        heal_percent: 5,
      },
    },
    rollable_options: [
      { id: 'hp_regen', name: 'Hồi HP/lượt', max_red: 20, unit: '' },
      { id: 'tp_hp_regen', name: 'Thân pháp hồi HP', max_red: 4, unit: '%/lượt' },
      { id: 'stack_heal', name: 'Mỗi 8 stack hồi HP', max_red: 5, unit: '%' },
      { id: 'low_hp_regen', name: 'HP < 30% hồi thêm', max_red: 8, unit: '%/lượt' },
    ],
    description: 'Hồi 20 HP/lượt. Thân pháp active hồi 3% max HP/lượt. 8 stack hồi 5% HP.',
  },

  // ═══════════════════════════════════════
  //  LỤC (📒) — Support
  // ═══════════════════════════════════════
  {
    id: 'cuong_hoa_luc',
    name: 'Cuồng Hóa Lục',
    slot_type: 'luc',
    grade: 'bao',
    emoji: '📒💪',
    weapon_affinity: null,
    min_realm: 2,
    base_effects: {
      dan_duoc_cuong_hoa: true,   // Đan dược hiệu quả +50%
      atk_bonus: 10,
      def_bonus: 5,
    },
    rollable_options: [
      { id: 'dan_duoc_bonus', name: 'Đan dược hiệu quả', max_red: 30, unit: '%' },
      { id: 'atk_bonus', name: 'Tăng ATK', max_red: 10, unit: '' },
      { id: 'def_bonus', name: 'Tăng DEF', max_red: 5, unit: '' },
      { id: 'max_hp', name: 'Tăng max HP', max_red: 15, unit: '%' },
    ],
    description: 'Đan dược cuồng hóa +50% hiệu quả. +10 ATK, +5 DEF. Support vạn năng.',
  },
  {
    id: 'pha_gioi_luc',
    name: 'Phá Giới Lục',
    slot_type: 'luc',
    grade: 'thanh',
    emoji: '📒🔓',
    weapon_affinity: null,
    min_realm: 5,
    base_effects: {
      ignore_realm_difference: 1,   // Bỏ qua 1 bậc cảnh giới khi chiến đấu
      tribulation_success_bonus: 10, // +10% tỉ lệ đột phá
      exp_bonus_percent: 10,
    },
    rollable_options: [
      { id: 'realm_ignore', name: 'Bỏ qua bậc cảnh giới', max_red: 1, unit: '' },
      { id: 'tribulation_bonus', name: 'Tỉ lệ đột phá', max_red: 10, unit: '%' },
      { id: 'exp_bonus', name: 'Tu vi bonus', max_red: 10, unit: '%' },
    ],
    description: 'Bỏ qua 1 bậc cảnh giới khi đánh. +10% đột phá, +10% tu vi.',
  },
];

module.exports = {
  TAM_PHAP_SLOTS,
  tamPhapList,
  list: tamPhapList,

  getTamPhapById(id) {
    return tamPhapList.find(t => t.id === id);
  },

  getBySlotType(slotType) {
    return tamPhapList.filter(t => t.slot_type === slotType);
  },

  getByWeaponAffinity(weaponType) {
    return tamPhapList.filter(t =>
      t.weapon_affinity === weaponType || t.weapon_affinity === null
    );
  },

  getAvailableAt(realmOrder, slotType, weaponType) {
    return tamPhapList.filter(t =>
      t.min_realm <= realmOrder &&
      (!slotType || t.slot_type === slotType) &&
      (t.weapon_affinity === weaponType || t.weapon_affinity === null)
    );
  },
};
