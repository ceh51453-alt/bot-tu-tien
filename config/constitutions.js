/**
 * @file Constitutions (Thể Chất) Configuration
 * @description 8 loại thể chất, ảnh hưởng đến sức mạnh cơ thể và khả năng đặc biệt
 *
 * Rarity tiers:
 *   Common → Uncommon → Rare → Epic → Legendary → Mythic
 */

const constitutions = [
  {
    id: 'pham_the',
    name: 'Phàm Thể',
    rarity: 'common',
    color: '#9CA3AF',
    emoji: '🧍',
    roll_weight: 40,
    bonuses: {
      hp_percent: 0,
      atk_percent: 0,
      def_percent: 0,
      speed_percent: 0,
    },
    special_ability: null,
    description: 'Thể chất bình thường của phàm nhân. Không có thiên phú đặc biệt, nhưng cũng không có điểm yếu.',
  },
  {
    id: 'cuong_the',
    name: 'Cương Thể',
    rarity: 'uncommon',
    color: '#D97706',
    emoji: '💪',
    roll_weight: 20,
    bonuses: {
      hp_percent: 10,
      atk_percent: 10,
      def_percent: 5,
      speed_percent: -5,
    },
    special_ability: {
      name: 'Cương Thể Hộ Giáp',
      description: 'Khi HP dưới 30%, tự động tăng 20% phòng ngự trong 3 lượt.',
      trigger: 'hp_below_30',
      effect: { def_percent: 20 },
      duration: 3,
      cooldown: 10,
    },
    description: 'Thể chất cương cường, da thịt rắn chắc. Phòng ngự tự nhiên cao nhưng hơi chậm chạp.',
  },
  {
    id: 'nhu_the',
    name: 'Nhu Thể',
    rarity: 'uncommon',
    color: '#06B6D4',
    emoji: '🌊',
    roll_weight: 20,
    bonuses: {
      hp_percent: 5,
      atk_percent: 0,
      def_percent: 0,
      speed_percent: 10,
      dodge_rate: 8,
    },
    special_ability: {
      name: 'Nhu Nhược Vô Cốt',
      description: 'Có 15% cơ hội né tránh hoàn toàn một đòn tấn công.',
      trigger: 'on_hit_received',
      effect: { dodge_chance: 15 },
      duration: 0,
      cooldown: 0,
    },
    description: 'Thể chất mềm dẻo như nước, linh hoạt phi thường. Giỏi né tránh hơn chịu đòn.',
  },
  {
    id: 'chien_the',
    name: 'Chiến Thể',
    rarity: 'rare',
    color: '#DC2626',
    emoji: '⚔️',
    roll_weight: 10,
    bonuses: {
      hp_percent: 5,
      atk_percent: 15,
      def_percent: 5,
      speed_percent: 5,
      crit_rate: 5,
    },
    special_ability: {
      name: 'Chiến Ý Bùng Phát',
      description: 'Mỗi khi hạ gục đối thủ, tăng 10% ATK cho trận tiếp theo (cộng dồn tối đa 30%).',
      trigger: 'on_kill',
      effect: { atk_percent: 10 },
      max_stacks: 3,
      duration: 1,
      cooldown: 0,
    },
    description: 'Sinh ra để chiến đấu, càng đánh càng mạnh. Thiên tài chiến đấu hiếm có.',
  },
  {
    id: 'linh_the',
    name: 'Linh Thể',
    rarity: 'rare',
    color: '#7C3AED',
    emoji: '🔮',
    roll_weight: 10,
    bonuses: {
      hp_percent: 0,
      atk_percent: 5,
      def_percent: 0,
      speed_percent: 5,
      mana_percent: 20,
      exp_bonus: 10,
    },
    special_ability: {
      name: 'Linh Khí Cảm Ứng',
      description: 'Tăng 15% kinh nghiệm tu luyện. Kỹ năng tiêu hao mana giảm 10%.',
      trigger: 'passive',
      effect: { exp_bonus: 15, mana_cost_reduction: 10 },
      duration: 0,
      cooldown: 0,
    },
    description: 'Thể chất thiên bẩm thông linh, cảm ứng linh khí dễ dàng. Tu luyện nhanh hơn người thường.',
  },
  {
    id: 'thanh_the',
    name: 'Thánh Thể',
    rarity: 'epic',
    color: '#F59E0B',
    emoji: '👼',
    roll_weight: 4,
    bonuses: {
      hp_percent: 15,
      atk_percent: 15,
      def_percent: 15,
      speed_percent: 10,
      crit_rate: 5,
      exp_bonus: 10,
    },
    special_ability: {
      name: 'Thánh Thể Phục Hồi',
      description: 'Tự động hồi 5% HP mỗi lượt chiến đấu. Miễn nhiễm trạng thái độc.',
      trigger: 'per_turn',
      effect: { hp_regen_percent: 5, immunity: ['poison'] },
      duration: 0,
      cooldown: 0,
    },
    description: 'Thánh Thể trời sinh, mọi chỉ số đều xuất sắc. Tự hồi phục và miễn nhiễm độc.',
  },
  {
    id: 'bat_diet_the',
    name: 'Bất Diệt Thể',
    rarity: 'legendary',
    color: '#FFD700',
    emoji: '♾️',
    roll_weight: 1.5,
    bonuses: {
      hp_percent: 30,
      atk_percent: 10,
      def_percent: 25,
      speed_percent: 5,
      crit_rate: 3,
      exp_bonus: 15,
    },
    special_ability: {
      name: 'Bất Tử Chi Thân',
      description: 'Khi HP về 0, hồi sinh với 20% HP một lần mỗi trận. Giảm 50% sát thương chí mạng nhận vào.',
      trigger: 'on_death',
      effect: { revive_hp_percent: 20, crit_damage_reduction: 50 },
      uses_per_battle: 1,
      duration: 0,
      cooldown: 0,
    },
    description: 'Thể chất truyền thuyết, gần như bất tử. Có thể hồi sinh từ cõi chết.',
  },
  {
    id: 'hon_don_thanh_the',
    name: 'Hỗn Độn Thánh Thể',
    rarity: 'mythic',
    color: '#FF6B6B',
    emoji: '🌀',
    roll_weight: 0.5,
    bonuses: {
      hp_percent: 25,
      atk_percent: 25,
      def_percent: 20,
      speed_percent: 15,
      crit_rate: 10,
      crit_damage: 15,
      exp_bonus: 20,
      all_resistance: 10,
    },
    special_ability: {
      name: 'Hỗn Độn Bất Diệt',
      description: 'Hồi sinh 2 lần/trận với 30% HP. Mỗi lượt hồi 3% HP & 5% Mana. Miễn nhiễm mọi debuff dưới cấp Tiên.',
      trigger: 'passive_and_on_death',
      effect: {
        revive_hp_percent: 30,
        hp_regen_percent: 3,
        mana_regen_percent: 5,
        debuff_immunity_below: 'tien',
      },
      uses_per_battle: 2,
      duration: 0,
      cooldown: 0,
    },
    description: 'Thể chất thần thoại, vạn năm chưa chắc có một. Hỗn Độn Thánh Thể chứa đựng sức mạnh nguyên thủy của vũ trụ.',
  },
];

module.exports = {
  constitutions,
  list: constitutions, // Alias for menu compatibility

  /**
   * Lấy thể chất theo id
   * @param {string} id
   */
  getConstitutionById(id) {
    return constitutions.find(c => c.id === id);
  },

  /**
   * Roll ngẫu nhiên thể chất dựa trên roll_weight
   * @returns {object}
   */
  rollConstitution() {
    const totalWeight = constitutions.reduce((sum, c) => sum + c.roll_weight, 0);
    let roll = Math.random() * totalWeight;
    for (const constitution of constitutions) {
      roll -= constitution.roll_weight;
      if (roll <= 0) return constitution;
    }
    return constitutions[0];
  },

  /**
   * Lấy danh sách theo rarity
   * @param {string} rarity
   */
  getByRarity(rarity) {
    return constitutions.filter(c => c.rarity === rarity);
  },
};
