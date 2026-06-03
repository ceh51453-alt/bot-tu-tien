/**
 * @file Cultivation Techniques (Công Pháp) Configuration
 * @description Các bộ công pháp tu luyện Chính Đạo và Ma Đạo
 *
 * Grades (cấp bậc):
 *   Phàm < Linh < Bảo < Thánh < Tiên < Thần
 *
 * dao_path: 'chinh_dao' (Chính Đạo) | 'ma_dao' (Ma Đạo) | 'both' (cả hai)
 *
 * Mỗi công pháp cung cấp:
 *   - exp_bonus: % tăng exp tu luyện
 *   - stat_bonuses: tăng chỉ số cố định
 *   - special: khả năng đặc biệt khi đạt cấp cao
 *   - source: nguồn gốc (có thể nhận từ NPC, drop, quest...)
 */

const GRADES = {
  PHAM: { id: 'pham', name: 'Phàm Cấp', order: 1, color: '#9CA3AF' },
  LINH: { id: 'linh', name: 'Linh Cấp', order: 2, color: '#22C55E' },
  BAO: { id: 'bao', name: 'Bảo Cấp', order: 3, color: '#3B82F6' },
  THANH: { id: 'thanh', name: 'Thánh Cấp', order: 4, color: '#A855F7' },
  TIEN: { id: 'tien', name: 'Tiên Cấp', order: 5, color: '#F59E0B' },
  THAN: { id: 'than', name: 'Thần Cấp', order: 6, color: '#EF4444' },
};

const techniques = [
  // ═══════════════════════════════════════════
  //  CHÍNH ĐẠO (Righteous Path)
  // ═══════════════════════════════════════════
  {
    id: 'co_ban_tam_phap',
    name: 'Cơ Bản Tâm Pháp',
    grade: GRADES.PHAM,
    dao_path: 'both',
    exp_bonus: 0,
    max_level: 10,
    stat_bonuses: {
      hp: 20,
      mana: 10,
    },
    special: null,
    source: 'starter',
    min_realm: 1,
    emoji: '📖',
    description: 'Tâm pháp cơ bản nhất, mọi tu sĩ đều biết. Không có gì đặc biệt nhưng là nền tảng cho mọi công pháp.',
  },
  {
    id: 'thanh_van_quyet',
    name: 'Thanh Vân Quyết',
    grade: GRADES.LINH,
    dao_path: 'chinh_dao',
    exp_bonus: 10,
    max_level: 20,
    stat_bonuses: {
      hp: 50,
      mana: 30,
      def: 10,
    },
    special: {
      name: 'Thanh Vân Hộ Thể',
      description: 'Lv10+: Tự động tạo lá chắn hấp thụ 10% sát thương khi bắt đầu trận.',
      min_level: 10,
      effect: { shield_percent: 10 },
    },
    source: 'npc_truong_lao',
    min_realm: 1,
    emoji: '☁️',
    description: 'Công pháp truyền thừa của Thanh Vân Tông, chú trọng phòng ngự và ổn định.',
  },
  {
    id: 'liet_hoa_cong',
    name: 'Liệt Hỏa Công',
    grade: GRADES.LINH,
    dao_path: 'chinh_dao',
    exp_bonus: 8,
    max_level: 20,
    stat_bonuses: {
      atk: 30,
      mana: 20,
      speed: 5,
    },
    special: {
      name: 'Liệt Hỏa Phần Thiên',
      description: 'Lv15+: Kỹ năng Hỏa hệ gây thêm 15% sát thương.',
      min_level: 15,
      effect: { fire_damage_bonus: 15 },
    },
    source: 'drop_boss',
    min_realm: 2,
    emoji: '🔥',
    description: 'Công pháp tu luyện Hỏa hệ mãnh liệt, sát thương kinh người nhưng dễ tẩu hỏa nhập ma.',
  },
  {
    id: 'thai_am_chan_kinh',
    name: 'Thái Âm Chân Kinh',
    grade: GRADES.BAO,
    dao_path: 'chinh_dao',
    exp_bonus: 20,
    max_level: 30,
    stat_bonuses: {
      hp: 100,
      mana: 80,
      def: 25,
      speed: 10,
    },
    special: {
      name: 'Thái Âm Hồi Thiên',
      description: 'Lv20+: Mỗi lượt hồi 3% HP. Kỹ năng hồi máu tăng 25% hiệu quả.',
      min_level: 20,
      effect: { hp_regen_percent: 3, heal_bonus: 25 },
    },
    source: 'quest_secret',
    min_realm: 4,
    emoji: '🌙',
    description: 'Kinh thư thượng cổ tu luyện Âm nhu chi lực. Hồi phục mạnh mẽ, phù hợp tu sĩ Thủy/Băng.',
  },
  {
    id: 'thuan_duong_cong',
    name: 'Thuần Dương Công',
    grade: GRADES.BAO,
    dao_path: 'chinh_dao',
    exp_bonus: 18,
    max_level: 30,
    stat_bonuses: {
      atk: 60,
      hp: 60,
      mana: 40,
      crit_rate: 5,
    },
    special: {
      name: 'Thuần Dương Chân Hỏa',
      description: 'Lv20+: Miễn nhiễm Âm hệ debuff. Tấn công có 10% phát động Dương Hỏa gây thêm 20% sát thương.',
      min_level: 20,
      effect: { dark_immunity: true, yang_fire_chance: 10, yang_fire_damage: 20 },
    },
    source: 'quest_temple',
    min_realm: 4,
    emoji: '☀️',
    description: 'Chí dương chi công, khắc chế mọi tà ma. Công thủ toàn diện, là khắc tinh của Ma Đạo.',
  },
  {
    id: 'cuu_chuyen_huyen_cong',
    name: 'Cửu Chuyển Huyền Công',
    grade: GRADES.THANH,
    dao_path: 'chinh_dao',
    exp_bonus: 35,
    max_level: 50,
    stat_bonuses: {
      hp: 200,
      atk: 100,
      def: 80,
      mana: 120,
      speed: 30,
    },
    special: {
      name: 'Cửu Chuyển Luân Hồi',
      description: 'Lv30+: Khi chết hồi sinh với 50% HP (1 lần/trận). Mỗi chuyển (10 level) tăng 5% toàn chỉ số.',
      min_level: 30,
      effect: { revive: true, revive_hp_percent: 50, stat_bonus_per_10_levels: 5 },
    },
    source: 'tribulation_reward',
    min_realm: 7,
    emoji: '🔄',
    description: 'Công pháp Thánh Cấp truyền kỳ, tu luyện qua 9 chuyển biến. Mỗi chuyển sức mạnh tăng vọt.',
  },
  {
    id: 'hong_mong_dai_dao',
    name: 'Hồng Mông Đại Đạo',
    grade: GRADES.TIEN,
    dao_path: 'chinh_dao',
    exp_bonus: 50,
    max_level: 80,
    stat_bonuses: {
      hp: 500,
      atk: 250,
      def: 200,
      mana: 300,
      speed: 80,
      crit_rate: 10,
    },
    special: {
      name: 'Hồng Mông Khai Thiên',
      description: 'Lv50+: Tạo ra không gian Hồng Mông, giảm 30% sát thương nhận, tăng 30% sát thương gây. Miễn nhiễm khống chế.',
      min_level: 50,
      effect: { damage_reduction: 30, damage_bonus: 30, cc_immunity: true },
    },
    source: 'ancient_ruins',
    min_realm: 12,
    emoji: '🌅',
    description: 'Đại đạo vô cực, hồng mông khai thiên. Công pháp Tiên Cấp truyền từ thượng cổ, nắm giữ sức mạnh sáng thế.',
  },
  {
    id: 'hon_don_kinh',
    name: 'Hỗn Độn Kinh',
    grade: GRADES.THAN,
    dao_path: 'both',
    exp_bonus: 80,
    max_level: 100,
    stat_bonuses: {
      hp: 1000,
      atk: 500,
      def: 400,
      mana: 600,
      speed: 150,
      crit_rate: 15,
      crit_damage: 20,
    },
    special: {
      name: 'Hỗn Độn Chủ Tể',
      description: 'Lv70+: Bất tử trong 3 lượt (1 lần/trận). Mọi công kích đều mang lực lượng Hỗn Độn, bỏ qua 50% phòng ngự. Hồi 10% HP mỗi lượt.',
      min_level: 70,
      effect: {
        invincible_turns: 3,
        armor_penetration: 50,
        hp_regen_percent: 10,
      },
    },
    source: 'chi_ton_inheritance',
    min_realm: 20,
    emoji: '🌀',
    description: 'Kinh thư tối thượng, vượt trên cả Tiên Cấp. Chỉ Chí Tôn cường giả mới có thể tu luyện trọn vẹn.',
  },

  // ═══════════════════════════════════════════
  //  MA ĐẠO (Demonic Path)
  // ═══════════════════════════════════════════
  {
    id: 'hap_huyet_dai_phap',
    name: 'Hấp Huyết Đại Pháp',
    grade: GRADES.LINH,
    dao_path: 'ma_dao',
    exp_bonus: 12,
    max_level: 20,
    stat_bonuses: {
      atk: 25,
      hp: 30,
      speed: 10,
    },
    special: {
      name: 'Hấp Huyết',
      description: 'Lv10+: Mỗi đòn tấn công hút 8% sát thương thành HP.',
      min_level: 10,
      effect: { life_steal_percent: 8 },
    },
    source: 'ma_dao_starter',
    min_realm: 1,
    emoji: '🩸',
    description: 'Tà công của Ma Đạo, hấp thu tinh huyết kẻ địch để cường hóa bản thân. Tàn nhẫn nhưng hiệu quả.',
  },
  {
    id: 'van_quy_kinh',
    name: 'Vạn Quỷ Kinh',
    grade: GRADES.BAO,
    dao_path: 'ma_dao',
    exp_bonus: 22,
    max_level: 30,
    stat_bonuses: {
      atk: 70,
      mana: 60,
      speed: 15,
      crit_rate: 8,
    },
    special: {
      name: 'Vạn Quỷ Triều Tông',
      description: 'Lv20+: Triệu hồi quỷ hồn hỗ chiến (tăng 20% sát thương). Kẻ địch bị giảm 10% phòng ngự.',
      min_level: 20,
      effect: { summon_damage_bonus: 20, enemy_def_reduction: 10 },
    },
    source: 'quest_dark_temple',
    min_realm: 5,
    emoji: '👻',
    description: 'Kinh thư tu luyện vạn quỷ, triệu hồi quỷ hồn chiến đấu. Cấm thuật của Ma Đạo cổ xưa.',
  },
  {
    id: 'cuu_u_minh_vuong_cong',
    name: 'Cửu U Minh Vương Công',
    grade: GRADES.THANH,
    dao_path: 'ma_dao',
    exp_bonus: 38,
    max_level: 50,
    stat_bonuses: {
      atk: 150,
      hp: 100,
      mana: 100,
      speed: 40,
      crit_rate: 10,
      life_steal: 5,
    },
    special: {
      name: 'U Minh Vương Giáng Thế',
      description: 'Lv35+: Biến thành U Minh Vương 5 lượt, tăng 50% ATK, hút 15% HP. Kẻ địch bị khủng bố giảm 20% ATK.',
      min_level: 35,
      effect: {
        transform_duration: 5,
        atk_bonus: 50,
        life_steal: 15,
        enemy_atk_reduction: 20,
      },
    },
    source: 'abyss_dungeon',
    min_realm: 8,
    emoji: '💀',
    description: 'Đại pháp tối thượng của U Minh giới, biến bản thân thành Vương giả của bóng tối.',
  },
  {
    id: 'diet_the_ma_kinh',
    name: 'Diệt Thế Ma Kinh',
    grade: GRADES.TIEN,
    dao_path: 'ma_dao',
    exp_bonus: 55,
    max_level: 80,
    stat_bonuses: {
      atk: 350,
      hp: 200,
      mana: 250,
      speed: 100,
      crit_rate: 15,
      crit_damage: 25,
      life_steal: 10,
    },
    special: {
      name: 'Diệt Thế',
      description: 'Lv50+: Phát động "Diệt Thế" hủy diệt mọi thứ trong phạm vi. Gây 200% ATK sát thương diện rộng, bỏ qua 40% phòng ngự. Tự giảm 30% HP.',
      min_level: 50,
      effect: {
        aoe_damage_multiplier: 2.0,
        armor_penetration: 40,
        self_hp_cost_percent: 30,
      },
    },
    source: 'demon_lord_drop',
    min_realm: 14,
    emoji: '🌑',
    description: 'Ma kinh tối cổ, sức mạnh hủy diệt thế giới. Tu luyện bằng cách hấp thu oán niệm của vạn linh.',
  },
];

module.exports = {
  GRADES,
  techniques,
  list: techniques, // Alias for menu compatibility

  /**
   * Lấy công pháp theo id
   * @param {string} id
   */
  getTechniqueById(id) {
    return techniques.find(t => t.id === id);
  },

  /**
   * Lấy danh sách theo đạo
   * @param {'chinh_dao'|'ma_dao'|'both'} path
   */
  getByDaoPath(path) {
    return techniques.filter(t => t.dao_path === path || t.dao_path === 'both');
  },

  /**
   * Lấy danh sách theo cấp bậc
   * @param {string} gradeId
   */
  getByGrade(gradeId) {
    return techniques.filter(t => t.grade.id === gradeId);
  },

  /**
   * Lấy công pháp có thể học tại realm
   * @param {number} realmOrder
   * @param {string} daoPath
   */
  getAvailableAt(realmOrder, daoPath) {
    return techniques.filter(t =>
      t.min_realm <= realmOrder &&
      (t.dao_path === daoPath || t.dao_path === 'both')
    );
  },
};
