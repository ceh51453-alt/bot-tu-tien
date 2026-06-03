/**
 * @file Pets / Spirit Beasts (Linh Thú) Configuration
 * @description Dữ liệu thú cưng / linh thú
 *
 * Tiers: Phàm < Linh < Bảo < Thánh < Tiên < Thần
 *
 * Mỗi thú cưng có:
 *   - base stats (HP, ATK, DEF) tăng theo level
 *   - growth_rate: hệ số tăng trưởng
 *   - skills: kỹ năng chiến đấu
 *   - evolves_to: id linh thú tiến hóa (null nếu tối đa)
 *   - capture_rate: tỉ lệ bắt (0-100)
 */

const pets = [
  // ═══════════════════════════════════════════
  //  PHÀM (Common Tier)
  // ═══════════════════════════════════════════
  {
    id: 'linh_tho_con',
    name: 'Linh Thỏ Con',
    tier: 'pham',
    emoji: '🐰',
    base_hp: 30,
    base_atk: 5,
    base_def: 3,
    growth_rate: 1.0,
    max_level: 30,
    skills: [
      { id: 'can', name: 'Cắn', damage_multiplier: 1.0, cooldown: 0 },
    ],
    evolves_to: 'ngoc_tho',
    evolve_level: 20,
    capture_rate: 80,
    element: 'neutral',
    description: 'Thỏ linh nhỏ dễ thương, bạn đồng hành đầu tiên. Tiến hóa thành Ngọc Thỏ ở lv20.',
  },
  {
    id: 'hoa_mieu_con',
    name: 'Hỏa Miêu Con',
    tier: 'pham',
    emoji: '🐱',
    base_hp: 25,
    base_atk: 8,
    base_def: 2,
    growth_rate: 1.1,
    max_level: 30,
    skills: [
      { id: 'hoa_trau', name: 'Hỏa Trảo', damage_multiplier: 1.1, cooldown: 1, element: 'fire' },
    ],
    evolves_to: 'hoa_ly',
    evolve_level: 20,
    capture_rate: 70,
    element: 'fire',
    description: 'Mèo lửa con, ngọn lửa nhỏ bén trên đuôi. Tấn công mạnh nhưng máu mỏng.',
  },

  // ═══════════════════════════════════════════
  //  LINH (Spirit Tier)
  // ═══════════════════════════════════════════
  {
    id: 'ngoc_tho',
    name: 'Ngọc Thỏ',
    tier: 'linh',
    emoji: '🐇',
    base_hp: 80,
    base_atk: 15,
    base_def: 10,
    growth_rate: 1.3,
    max_level: 50,
    skills: [
      { id: 'nguyet_quang', name: 'Nguyệt Quang', damage_multiplier: 1.3, cooldown: 2, element: 'light' },
      { id: 'nhanh_nhen', name: 'Nhanh Nhẹn', type: 'buff', effect: { speed_percent: 20 }, cooldown: 3 },
    ],
    evolves_to: 'nguyet_tho',
    evolve_level: 40,
    capture_rate: 40,
    element: 'light',
    description: 'Thỏ ngọc phát sáng, nhanh nhẹn và thông minh. Tiến hóa từ Linh Thỏ Con.',
  },
  {
    id: 'hoa_ly',
    name: 'Hỏa Ly',
    tier: 'linh',
    emoji: '🦊',
    base_hp: 60,
    base_atk: 25,
    base_def: 8,
    growth_rate: 1.4,
    max_level: 50,
    skills: [
      { id: 'hoa_cau', name: 'Hỏa Cầu', damage_multiplier: 1.4, cooldown: 2, element: 'fire' },
      { id: 'mê_hồn', name: 'Mê Hồn', type: 'debuff', effect: { confuse_chance: 20 }, cooldown: 4 },
    ],
    evolves_to: 'cuu_vi_linh_ho',
    evolve_level: 40,
    capture_rate: 35,
    element: 'fire',
    description: 'Ly hỏa tinh quái, xảo trá và nguy hiểm. Tiến hóa từ Hỏa Miêu Con.',
  },
  {
    id: 'bang_xa',
    name: 'Băng Xà',
    tier: 'linh',
    emoji: '🐍',
    base_hp: 70,
    base_atk: 22,
    base_def: 12,
    growth_rate: 1.3,
    max_level: 50,
    skills: [
      { id: 'bang_doc', name: 'Băng Độc', damage_multiplier: 1.3, cooldown: 2, element: 'ice' },
      { id: 'dong_ket', name: 'Đông Kết', type: 'debuff', effect: { freeze_chance: 15 }, cooldown: 4 },
    ],
    evolves_to: 'bang_giao_long',
    evolve_level: 40,
    capture_rate: 30,
    element: 'ice',
    description: 'Rắn băng linh tính, nọc độc kèm sức mạnh băng giá.',
  },

  // ═══════════════════════════════════════════
  //  BẢO (Treasure Tier)
  // ═══════════════════════════════════════════
  {
    id: 'cuu_vi_linh_ho',
    name: 'Cửu Vĩ Linh Hồ',
    tier: 'bao',
    emoji: '🦊',
    base_hp: 200,
    base_atk: 60,
    base_def: 30,
    growth_rate: 1.6,
    max_level: 70,
    skills: [
      { id: 'hoa_vu', name: 'Hỏa Vũ', damage_multiplier: 1.8, cooldown: 2, element: 'fire' },
      { id: 'me_hon_dai_phap', name: 'Mê Hồn Đại Pháp', type: 'debuff', effect: { confuse_chance: 35, duration: 2 }, cooldown: 5 },
      { id: 'ho_hoa', name: 'Hồ Hỏa', damage_multiplier: 2.2, cooldown: 4, element: 'fire' },
    ],
    evolves_to: null,
    evolve_level: null,
    capture_rate: 10,
    element: 'fire',
    description: 'Hồ ly chín đuôi bậc Bảo, ma mị vạn vật. Sát thương Hỏa hệ cực mạnh.',
  },
  {
    id: 'nguyet_tho',
    name: 'Nguyệt Thỏ',
    tier: 'bao',
    emoji: '🌙',
    base_hp: 250,
    base_atk: 45,
    base_def: 40,
    growth_rate: 1.5,
    max_level: 70,
    skills: [
      { id: 'nguyet_hoa', name: 'Nguyệt Hoa', damage_multiplier: 1.6, cooldown: 2, element: 'light' },
      { id: 'nguyet_tri_lieu', name: 'Nguyệt Trị Liệu', type: 'heal', effect: { heal_percent: 20 }, cooldown: 3 },
      { id: 'nguyet_thuẫn', name: 'Nguyệt Thuẫn', type: 'defense', effect: { shield_percent: 15 }, cooldown: 4 },
    ],
    evolves_to: null,
    evolve_level: null,
    capture_rate: 8,
    element: 'light',
    description: 'Thỏ nguyệt huyền bí, ánh trăng hồi phục. Bậc Bảo, hỗ trợ trị liệu xuất sắc.',
  },
  {
    id: 'bang_giao_long',
    name: 'Băng Giao Long',
    tier: 'bao',
    emoji: '🐲',
    base_hp: 300,
    base_atk: 55,
    base_def: 45,
    growth_rate: 1.6,
    max_level: 70,
    skills: [
      { id: 'bang_tức', name: 'Băng Tức', damage_multiplier: 1.7, cooldown: 2, element: 'ice' },
      { id: 'dong_ket_truong', name: 'Đông Kết Trường', type: 'debuff', effect: { freeze_chance: 25, aoe: true }, cooldown: 5 },
      { id: 'giao_long_no', name: 'Giao Long Nộ', damage_multiplier: 2.5, cooldown: 5, element: 'ice' },
    ],
    evolves_to: 'bang_long_vuong',
    evolve_level: 60,
    capture_rate: 5,
    element: 'ice',
    description: 'Giao long băng giá, gần hóa chân long. Sức mạnh Băng hệ áp đảo.',
  },

  // ═══════════════════════════════════════════
  //  THÁNH (Saint Tier)
  // ═══════════════════════════════════════════
  {
    id: 'bang_long_vuong',
    name: 'Băng Long Vương',
    tier: 'thanh',
    emoji: '🐉',
    base_hp: 800,
    base_atk: 150,
    base_def: 100,
    growth_rate: 2.0,
    max_level: 90,
    skills: [
      { id: 'tuyet_bao', name: 'Tuyết Bão', damage_multiplier: 2.5, cooldown: 3, element: 'ice', target: 'aoe' },
      { id: 'long_tức', name: 'Long Tức', damage_multiplier: 3.0, cooldown: 4, element: 'ice' },
      { id: 'bang_phong_ket_gioi', name: 'Băng Phong Kết Giới', type: 'defense', effect: { damage_reduction: 40, duration: 3 }, cooldown: 6 },
      { id: 'tuyet_long_no', name: 'Tuyệt Long Nộ', damage_multiplier: 4.0, cooldown: 8, element: 'ice', target: 'aoe' },
    ],
    evolves_to: null,
    evolve_level: null,
    capture_rate: 2,
    element: 'ice',
    description: 'Vương giả của rồng băng, hơi thở đóng băng vạn dặm. Thánh Cấp linh thú.',
  },

  // ═══════════════════════════════════════════
  //  TIÊN (Immortal Tier)
  // ═══════════════════════════════════════════
  {
    id: 'than_phuong',
    name: 'Thần Phượng',
    tier: 'tien',
    emoji: '🦚',
    base_hp: 2000,
    base_atk: 400,
    base_def: 250,
    growth_rate: 2.5,
    max_level: 100,
    skills: [
      { id: 'phuong_hoa', name: 'Phượng Hỏa', damage_multiplier: 3.0, cooldown: 3, element: 'fire' },
      { id: 'niet_ban', name: 'Niết Bàn', type: 'heal', effect: { full_revive: true, cooldown_reset: true }, cooldown: 15 },
      { id: 'phuong_minh', name: 'Phượng Minh', type: 'buff', effect: { all_stats_percent: 25, duration: 5 }, cooldown: 8 },
      { id: 'thien_phuong_vu', name: 'Thiên Phượng Vũ', damage_multiplier: 5.0, cooldown: 10, element: 'fire', target: 'aoe' },
    ],
    evolves_to: null,
    evolve_level: null,
    capture_rate: 0.5,
    element: 'fire',
    description: 'Phượng hoàng thần thánh, niết bàn tái sinh. Tiên Cấp linh thú, cực kỳ hiếm.',
  },

  // ═══════════════════════════════════════════
  //  THẦN (Divine Tier)
  // ═══════════════════════════════════════════
  {
    id: 'hon_don_than_thu',
    name: 'Hỗn Độn Thần Thú',
    tier: 'than',
    emoji: '🌀',
    base_hp: 5000,
    base_atk: 1000,
    base_def: 600,
    growth_rate: 3.0,
    max_level: 100,
    skills: [
      { id: 'hon_don_tức', name: 'Hỗn Độn Tức', damage_multiplier: 4.0, cooldown: 3, element: 'chaos' },
      { id: 'thoi_khong_an', name: 'Thời Không Ẩn', type: 'buff', effect: { invincible: true, duration: 2 }, cooldown: 10 },
      { id: 'van_vat_quy_tong', name: 'Vạn Vật Quy Tông', damage_multiplier: 8.0, cooldown: 12, element: 'chaos', target: 'aoe' },
      { id: 'hon_don_ho_the', name: 'Hỗn Độn Hộ Thể', type: 'defense', effect: { all_immunity: true, duration: 3 }, cooldown: 15 },
    ],
    evolves_to: null,
    evolve_level: null,
    capture_rate: 0.1,
    element: 'chaos',
    description: 'Thần thú từ Hỗn Độn nguyên thủy, sức mạnh vượt trên tưởng tượng. Thần Cấp tối cao, gần như không thể bắt.',
  },
];

module.exports = {
  pets,
  list: pets, // Alias for menu compatibility

  /**
   * Lấy pet theo id
   */
  getPetById(id) {
    return pets.find(p => p.id === id);
  },

  /**
   * Lấy pet theo tier
   */
  getByTier(tier) {
    return pets.filter(p => p.tier === tier);
  },

  /**
   * Tính stats tại level
   */
  getStatsAtLevel(petId, level) {
    const pet = pets.find(p => p.id === petId);
    if (!pet) return null;
    return {
      hp: Math.floor(pet.base_hp * (1 + (level - 1) * pet.growth_rate * 0.1)),
      atk: Math.floor(pet.base_atk * (1 + (level - 1) * pet.growth_rate * 0.1)),
      def: Math.floor(pet.base_def * (1 + (level - 1) * pet.growth_rate * 0.1)),
    };
  },

  /**
   * Kiểm tra pet có thể tiến hóa không
   */
  canEvolve(petId, currentLevel) {
    const pet = pets.find(p => p.id === petId);
    if (!pet || !pet.evolves_to) return false;
    return currentLevel >= pet.evolve_level;
  },

  /**
   * Tiers order
   */
  tierOrder: ['pham', 'linh', 'bao', 'thanh', 'tien', 'than'],
};
