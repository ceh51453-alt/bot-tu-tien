/**
 * @file Tuyệt Kỹ (Special Skills) Configuration
 * @description Kỹ năng mạnh CD dài, gắn với stack effect
 *
 * Bám sát game Quỷ Cốc Bát Hoang:
 *   - Tuyệt Kỹ tương tác với stack từ Võ Kỹ
 *   - VD: Kiếm Trảm đủ 8 stack → giảm CD Thân Pháp
 *   - Roll option: giảm CD, tăng damage boss/tất cả, stack threshold
 */

const tuyetKyList = [
  // ═══════════════════════════════════════
  //  KIẾM TUYỆT KỸ
  // ═══════════════════════════════════════
  {
    id: 'van_kiem_quy_tong',
    name: 'Vạn Kiếm Quy Tông',
    weapon_type: 'kiem',
    grade: 'bao',
    emoji: '⚔️💫',
    cooldown_turns: 6,
    mana_cost: 60,
    damage_mult: 3.0,
    target: 'single',
    min_realm: 3,
    // BÁM SÁT: stack interaction
    stack_interaction: {
      stack_type: 'kiem_tram',
      required_stacks: 8,
      consume_stacks: true,
      reward: {
        cd_reduction_than_phap: 2, // Đủ 8 Kiếm Trảm → -2 lượt CD Thân Pháp
      },
    },
    rollable_options: [
      { id: 'cd_reduction', name: 'Giảm hồi chiêu', max_red: -2, unit: ' lượt' },
      { id: 'stack_threshold', name: 'Giảm Kiếm Trảm cần', max_red: -3, unit: ' tầng' },
      { id: 'damage_boss', name: 'Tăng damage Đại Yêu Thú', max_red: 40, unit: '%' },
      { id: 'damage_all', name: 'Tăng damage Tất Cả', max_red: 25, unit: '%' },
    ],
    description: 'Vạn kiếm quy nhất! Tích 8 Kiếm Trảm → giảm 2 lượt CD Thân Pháp. Chain build core.',
  },
  {
    id: 'cuu_kiem_lien_hoan',
    name: 'Cửu Kiếm Liên Hoàn',
    weapon_type: 'kiem',
    grade: 'thanh',
    emoji: '🗡️✨',
    cooldown_turns: 8,
    mana_cost: 100,
    damage_mult: 5.0,
    target: 'single',
    hit_count: 9, // 9 đòn liên tiếp
    min_realm: 7,
    stack_interaction: {
      stack_type: 'kiem_tram',
      required_stacks: 5,
      consume_stacks: false,
      reward: {
        cd_reduction_than_phap: 3,
        extra_damage_percent: 30,
      },
    },
    rollable_options: [
      { id: 'cd_reduction', name: 'Giảm hồi chiêu', max_red: -3, unit: ' lượt' },
      { id: 'damage_all', name: 'Tăng damage', max_red: 40, unit: '%' },
      { id: 'ignore_def', name: 'Bỏ qua phòng ngự', max_red: 30, unit: '%' },
      { id: 'cd_than_phap', name: 'Giảm CD Thân Pháp thêm', max_red: -2, unit: ' lượt' },
    ],
    description: 'Cửu kiếm liên hoàn! 9 đòn chém liên tục. 5 Kiếm Trảm → giảm 3 CD Thân Pháp + 30% damage.',
  },

  // ═══════════════════════════════════════
  //  ĐAO TUYỆT KỸ
  // ═══════════════════════════════════════
  {
    id: 'huyet_dao_cuong_vu',
    name: 'Huyết Đao Cuồng Vũ',
    weapon_type: 'dao',
    grade: 'bao',
    emoji: '🩸🔪',
    cooldown_turns: 5,
    mana_cost: 55,
    damage_mult: 2.8,
    target: 'aoe',
    min_realm: 3,
    stack_interaction: {
      stack_type: 'huyet_sat',
      required_stacks: 6,
      consume_stacks: true,
      reward: {
        lifesteal_bonus: 15, // +15% hút máu 3 lượt
        lifesteal_duration: 3,
      },
    },
    rollable_options: [
      { id: 'cd_reduction', name: 'Giảm hồi chiêu', max_red: -2, unit: ' lượt' },
      { id: 'lifesteal', name: 'Hút máu', max_red: 20, unit: '%' },
      { id: 'damage_all', name: 'Tăng damage', max_red: 30, unit: '%' },
      { id: 'aoe_count', name: 'Số mục tiêu AOE', max_red: 3, unit: '' },
    ],
    description: 'Đao cuồng vũ huyết sát! AOE damage. 6 Huyết Sát → +15% hút máu 3 lượt.',
  },

  // ═══════════════════════════════════════
  //  THƯƠNG TUYỆT KỸ
  // ═══════════════════════════════════════
  {
    id: 'long_tuong_pha_thien',
    name: 'Long Tương Phá Thiên',
    weapon_type: 'thuong',
    grade: 'bao',
    emoji: '🐲🔱',
    cooldown_turns: 6,
    mana_cost: 65,
    damage_mult: 4.0,
    target: 'single',
    min_realm: 3,
    stack_interaction: {
      stack_type: 'xuyen_thau',
      required_stacks: 6,
      consume_stacks: true,
      reward: {
        ignore_def_percent: 40, // Bỏ qua 40% DEF
        ignore_def_duration: 2,
      },
    },
    rollable_options: [
      { id: 'cd_reduction', name: 'Giảm hồi chiêu', max_red: -2, unit: ' lượt' },
      { id: 'armor_pen', name: 'Xuyên giáp thêm', max_red: 25, unit: '%' },
      { id: 'damage_all', name: 'Tăng damage', max_red: 35, unit: '%' },
      { id: 'crit_damage', name: 'Sát thương bạo kích', max_red: 40, unit: '%' },
    ],
    description: 'Long tương phá thiên! Burst cực cao. 6 Xuyên Thấu → bỏ qua 40% DEF.',
  },

  // ═══════════════════════════════════════
  //  QUYỀN TUYỆT KỸ
  // ═══════════════════════════════════════
  {
    id: 'pha_son_quyen',
    name: 'Phá Sơn Quyền',
    weapon_type: 'quyen',
    grade: 'bao',
    emoji: '⛰️👊',
    cooldown_turns: 5,
    mana_cost: 50,
    damage_mult: 3.5,
    target: 'aoe',
    min_realm: 3,
    stack_interaction: {
      stack_type: 'lien_kich',
      required_stacks: 10,
      consume_stacks: true,
      reward: {
        stun_all: true,
        stun_duration: 2,
      },
    },
    rollable_options: [
      { id: 'cd_reduction', name: 'Giảm hồi chiêu', max_red: -2, unit: ' lượt' },
      { id: 'stun_duration', name: 'Choáng', max_red: 1, unit: ' lượt' },
      { id: 'damage_all', name: 'Tăng damage', max_red: 35, unit: '%' },
      { id: 'aoe_count', name: 'Số mục tiêu', max_red: 3, unit: '' },
    ],
    description: 'Một quyền phá núi! AOE choáng. 10 Liên Kích → choáng tất cả 2 lượt.',
  },

  // ═══════════════════════════════════════
  //  CHƯỞNG TUYỆT KỸ
  // ═══════════════════════════════════════
  {
    id: 'van_phat_chung_tran',
    name: 'Vạn Phật Chung Trấn',
    weapon_type: 'chuong',
    grade: 'bao',
    emoji: '🔔🖐️',
    cooldown_turns: 6,
    mana_cost: 55,
    damage_mult: 2.5,
    target: 'aoe',
    min_realm: 3,
    stack_interaction: {
      stack_type: 'tran_ap',
      required_stacks: 6,
      consume_stacks: true,
      reward: {
        silence_all: true, // Phong ấn kỹ năng tất cả
        silence_duration: 2,
        def_break_percent: 20,
      },
    },
    rollable_options: [
      { id: 'cd_reduction', name: 'Giảm hồi chiêu', max_red: -2, unit: ' lượt' },
      { id: 'silence_duration', name: 'Phong ấn', max_red: 1, unit: ' lượt' },
      { id: 'damage_all', name: 'Tăng damage', max_red: 30, unit: '%' },
      { id: 'def_break', name: 'Phá phòng', max_red: 15, unit: '%' },
    ],
    description: 'Vạn phật trấn áp! Phong ấn kỹ năng tất cả. 6 Trấn Áp → silence 2 lượt + phá 20% DEF.',
  },

  // ═══════════════════════════════════════
  //  CHỈ TUYỆT KỸ
  // ═══════════════════════════════════════
  {
    id: 'thien_chi_tuyet_ky',
    name: 'Thiên Chỉ Tuyệt Kỹ',
    weapon_type: 'chi',
    grade: 'bao',
    emoji: '✨☝️',
    cooldown_turns: 5,
    mana_cost: 50,
    damage_mult: 3.0,
    target: 'single',
    hit_count: 10, // 10 điểm liên tiếp
    min_realm: 3,
    stack_interaction: {
      stack_type: 'diem_huyet',
      required_stacks: 8,
      consume_stacks: true,
      reward: {
        seal_target: true, // Phong ấn 2 lượt
        seal_duration: 2,
        crit_rate_bonus: 30,
        crit_duration: 3,
      },
    },
    rollable_options: [
      { id: 'cd_reduction', name: 'Giảm hồi chiêu', max_red: -2, unit: ' lượt' },
      { id: 'crit_rate', name: 'Bạo kích', max_red: 20, unit: '%' },
      { id: 'damage_all', name: 'Tăng damage', max_red: 30, unit: '%' },
      { id: 'seal_duration', name: 'Phong ấn thêm', max_red: 1, unit: ' lượt' },
    ],
    description: '10 chỉ liên hoàn! 8 Điểm Huyệt → phong ấn 2 lượt + bạo kích +30% trong 3 lượt.',
  },
];

module.exports = {
  tuyetKyList,
  list: tuyetKyList,

  getTuyetKyById(id) {
    return tuyetKyList.find(t => t.id === id);
  },

  getByWeaponType(weaponType) {
    return tuyetKyList.filter(t => t.weapon_type === weaponType);
  },

  getAvailableAt(realmOrder, weaponType) {
    return tuyetKyList.filter(t =>
      t.min_realm <= realmOrder &&
      (!weaponType || t.weapon_type === weaponType)
    );
  },
};
