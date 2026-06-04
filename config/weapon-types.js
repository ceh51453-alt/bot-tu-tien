/**
 * @file Weapon Types (Loại Võ Khí) Configuration
 * @description 6 loại võ khí theo game Quỷ Cốc Bát Hoang
 *
 * Mỗi loại có:
 *   - base_stats: hệ số ATK, tốc độ, tầm đánh
 *   - stack_effect: hiệu ứng stack riêng (Kiếm Trảm, Huyết Sát...)
 *   - secondary_effect: hiệu ứng phụ (Xuất Huyết, Phá Giáp...)
 *   - synergy_elements: nguyên tố tương hợp
 *
 * Tầm đánh: 'gan' (cận) < 'trung' < 'xa'
 */

const weaponTypes = [
  // ══════════════════════════════════════
  //  KIẾM — Tốc độ & tầm xa
  // ══════════════════════════════════════
  {
    id: 'kiem',
    name: 'Kiếm',
    emoji: '⚔️',
    base_stats: {
      atk_mult: 1.0,
      speed_mult: 1.3,
      range: 'xa',
    },
    stack_effect: {
      id: 'kiem_tram',
      name: 'Kiếm Trảm',
      emoji: '🗡️',
      description: 'Mỗi stack +2% sát thương với kẻ địch có HP thấp hơn 50%. Duy trì 3 lượt.',
      max_stacks: 10,
      duration_turns: 3,
      bonus_per_stack: 0.02,
      threshold_hp_percent: 50,
    },
    secondary_effect: {
      id: 'xuat_huyet',
      name: 'Xuất Huyết',
      emoji: '🩸',
      description: 'Gây hiệu ứng trừ máu theo thời gian.',
      dot_percent: 3,
      duration_turns: 3,
    },
    synergy_elements: ['thuy', 'phong'],
    description: 'Kiếm tu chuyên về tốc độ và tầm đánh xa. Ngự kiếm phi hành, hiệu ứng đẹp nhất trong các loại.',
  },

  // ══════════════════════════════════════
  //  ĐAO — Sát thương & hút máu
  // ══════════════════════════════════════
  {
    id: 'dao',
    name: 'Đao',
    emoji: '🔪',
    base_stats: {
      atk_mult: 1.2,
      speed_mult: 1.0,
      range: 'trung',
    },
    stack_effect: {
      id: 'huyet_sat',
      name: 'Huyết Sát',
      emoji: '🩸',
      description: 'Mỗi stack +3% hút máu. Duy trì 4 lượt.',
      max_stacks: 8,
      duration_turns: 4,
      lifesteal_per_stack: 0.03,
    },
    secondary_effect: {
      id: 'pha_giap',
      name: 'Phá Giáp',
      emoji: '💥',
      description: 'Giảm 5% phòng ngự mục tiêu.',
      def_reduction_percent: 5,
      duration_turns: 2,
    },
    synergy_elements: ['hoa', 'loi'],
    description: 'Đao tu mạnh về sát thương đơn và hút máu. Càng chiến đấu càng khỏe.',
  },

  // ══════════════════════════════════════
  //  THƯƠNG — Xuyên phá & burst
  // ══════════════════════════════════════
  {
    id: 'thuong',
    name: 'Thương',
    emoji: '🔱',
    base_stats: {
      atk_mult: 1.15,
      speed_mult: 1.1,
      range: 'xa',
    },
    stack_effect: {
      id: 'xuyen_thau',
      name: 'Xuyên Thấu',
      emoji: '🎯',
      description: 'Mỗi stack +3% bỏ qua phòng ngự. Duy trì 3 lượt.',
      max_stacks: 8,
      duration_turns: 3,
      armor_pen_per_stack: 0.03,
    },
    secondary_effect: {
      id: 'kich_thoi',
      name: 'Kích Thối',
      emoji: '💫',
      description: 'Đẩy lùi kẻ địch, giảm 15% tốc độ.',
      slow_percent: 15,
      duration_turns: 2,
    },
    synergy_elements: ['phong', 'tho'],
    description: 'Thương tu chuyên xuyên phá phòng ngự. Burst damage cao nhất các loại.',
  },

  // ══════════════════════════════════════
  //  QUYỀN — Tốc độ cận chiến & combo
  // ══════════════════════════════════════
  {
    id: 'quyen',
    name: 'Quyền',
    emoji: '👊',
    base_stats: {
      atk_mult: 0.9,
      speed_mult: 1.5,
      range: 'gan',
    },
    stack_effect: {
      id: 'lien_kich',
      name: 'Liên Kích',
      emoji: '💢',
      description: 'Mỗi stack +5% tốc độ đánh. Combo cực nhanh. Duy trì 2 lượt.',
      max_stacks: 12,
      duration_turns: 2,
      speed_per_stack: 0.05,
    },
    secondary_effect: {
      id: 'chan_dong',
      name: 'Chấn Động',
      emoji: '💥',
      description: '15% choáng kẻ địch 1 lượt.',
      stun_chance: 15,
      stun_duration: 1,
    },
    synergy_elements: ['hoa', 'tho'],
    description: 'Quyền tu cận chiến tốc độ cực cao. Liên Kích combo liên hoàn vô tận.',
  },

  // ══════════════════════════════════════
  //  CHƯỞNG — Khống chế & debuff
  // ══════════════════════════════════════
  {
    id: 'chuong',
    name: 'Chưởng',
    emoji: '🖐️',
    base_stats: {
      atk_mult: 1.1,
      speed_mult: 0.9,
      range: 'trung',
    },
    stack_effect: {
      id: 'tran_ap',
      name: 'Trấn Áp',
      emoji: '⬇️',
      description: 'Mỗi stack giảm 3% ATK kẻ địch. Duy trì 4 lượt.',
      max_stacks: 8,
      duration_turns: 4,
      atk_reduction_per_stack: 0.03,
    },
    secondary_effect: {
      id: 'dao_tam_xung',
      name: 'Đạo Tâm Xung',
      emoji: '😵',
      description: '10% gây hoang mang (đánh nhầm bản thân).',
      confuse_chance: 10,
      confuse_duration: 1,
    },
    synergy_elements: ['tho', 'thuy'],
    description: 'Chưởng tu khống chế mạnh. Trấn áp đối thủ, giảm sức chiến đấu liên tục.',
  },

  // ══════════════════════════════════════
  //  CHỈ — Chính xác & crit
  // ══════════════════════════════════════
  {
    id: 'chi',
    name: 'Chỉ',
    emoji: '☝️',
    base_stats: {
      atk_mult: 0.85,
      speed_mult: 1.4,
      range: 'xa',
    },
    stack_effect: {
      id: 'diem_huyet',
      name: 'Điểm Huyệt',
      emoji: '📍',
      description: 'Mỗi stack +4% crit rate. 10 stack = phong ấn kẻ địch 1 lượt. Duy trì 3 lượt.',
      max_stacks: 10,
      duration_turns: 3,
      crit_per_stack: 0.04,
      max_stack_seal: true,
      seal_duration: 1,
    },
    secondary_effect: {
      id: 'te_liet',
      name: 'Tê Liệt',
      emoji: '⚡',
      description: '8% gây tê liệt (giảm tốc 50%).',
      paralyze_chance: 8,
      speed_reduction: 0.5,
      duration_turns: 1,
    },
    synergy_elements: ['loi', 'phong'],
    description: 'Chỉ tu chính xác cực cao. Điểm huyệt tích lũy, phong ấn kẻ địch khi max stack.',
  },
];

module.exports = {
  weaponTypes,
  list: weaponTypes,

  /**
   * Lấy loại võ khí theo id
   * @param {string} id
   * @returns {Object|undefined}
   */
  getWeaponTypeById(id) {
    return weaponTypes.find(w => w.id === id);
  },

  /**
   * Lấy danh sách id
   * @returns {string[]}
   */
  getAllIds() {
    return weaponTypes.map(w => w.id);
  },

  /**
   * Lấy stack effect config cho weapon type
   * @param {string} weaponTypeId
   * @returns {Object|null}
   */
  getStackEffect(weaponTypeId) {
    const wt = weaponTypes.find(w => w.id === weaponTypeId);
    return wt ? wt.stack_effect : null;
  },

  /**
   * Lấy secondary effect config
   * @param {string} weaponTypeId
   * @returns {Object|null}
   */
  getSecondaryEffect(weaponTypeId) {
    const wt = weaponTypes.find(w => w.id === weaponTypeId);
    return wt ? wt.secondary_effect : null;
  },

  /**
   * Kiểm tra nguyên tố có tương hợp với weapon type không
   * @param {string} weaponTypeId
   * @param {string} elementId
   * @returns {boolean}
   */
  hasSynergy(weaponTypeId, elementId) {
    const wt = weaponTypes.find(w => w.id === weaponTypeId);
    return wt ? wt.synergy_elements.includes(elementId) : false;
  },
};
