/**
 * @file Monsters (Quái Vật) Configuration
 * @description Dữ liệu quái vật theo loại và cấp cảnh giới
 *
 * Types:
 *   - yeu_thu: Yêu Thú (thú linh bình thường)
 *   - quy_tu: Quỷ Tu (tu sĩ quỷ)
 *   - ma_dao_tu_si: Ma Đạo Tu Sĩ (tu sĩ tà đạo)
 *   - thuong_co_di_thu: Thượng Cổ Dị Thú (boss thượng cổ)
 *   - thien_ma: Thiên Ma (world boss)
 *   - kiep_thu: Kiếp Thú (quái vật kiếp nạn)
 *
 * realm_level: tương đương cảnh giới realm order (1-26)
 * drops: [{item_id, chance}] - vật phẩm rơi ra
 * skills: [skill_id] - kỹ năng chiến đấu (từ config/skills.js)
 * element: nguyên tố chính (fire, water, ice, thunder, earth, wind, wood, dark, light, chaos, neutral)
 * equipment_bonus: bonus stats từ trang bị của quái (atk, def, hp, speed, crit_rate)
 */

const monsters = [
  // ═══════════════════════════════════════════
  //  YÊU THÚ (Normal Beasts) — 15 monsters
  // ═══════════════════════════════════════════
  {
    id: 'linh_tho',
    name: 'Linh Thỏ',
    type: 'yeu_thu',
    emoji: '🐰',
    element: 'wood',
    realm_level: 1,
    hp: 50,
    atk: 8,
    def: 3,
    speed: 15,
    exp_reward: 25,
    skills: ['tang_toc_thuat'],
    drops: [
      { item_id: 'thu_dan', chance: 0.4 },
      { item_id: 'linh_thao', chance: 0.3 },
    ],
    description: 'Thỏ hấp thu linh khí, nhanh nhẹn nhưng yếu ớt. Thích hợp cho tu sĩ mới.',
  },
  {
    id: 'hoa_miêu',
    name: 'Hỏa Miêu',
    type: 'yeu_thu',
    emoji: '🐱',
    element: 'fire',
    realm_level: 1,
    hp: 60,
    atk: 12,
    def: 4,
    speed: 13,
    exp_reward: 25,
    skills: ['hoa_cau_thuat'],
    drops: [
      { item_id: 'hoa_tinh_thach', chance: 0.3 },
      { item_id: 'thu_dan', chance: 0.35 },
    ],
    description: 'Mèo lửa hoang dã, phun lửa nhỏ tấn công. Thường xuất hiện ở rừng rậm.',
  },
  {
    id: 'thanh_lang',
    name: 'Thanh Lang',
    type: 'yeu_thu',
    emoji: '🐺',
    element: 'wind',
    realm_level: 2,
    hp: 120,
    atk: 20,
    def: 8,
    speed: 14,
    exp_reward: 60,
    skills: ['tang_toc_thuat', 'phong_nhan'],
    drops: [
      { item_id: 'lang_nha', chance: 0.35 },
      { item_id: 'linh_thao', chance: 0.25 },
      { item_id: 'thu_dan', chance: 0.3 },
    ],
    description: 'Sói xanh sống theo bầy, tốc độ và sức mạnh vượt trội so với thú thường.',
  },
  {
    id: 'doc_xà',
    name: 'Độc Xà',
    type: 'yeu_thu',
    emoji: '🐍',
    element: 'wood',
    realm_level: 2,
    hp: 90,
    atk: 25,
    def: 5,
    speed: 16,
    exp_reward: 55,
    skills: ['doc_vu'],
    drops: [
      { item_id: 'xa_dam', chance: 0.3 },
      { item_id: 'doc_nang', chance: 0.2 },
    ],
    description: 'Rắn độc linh hóa, nọc độc cực mạnh. Tấn công nhanh và gây trạng thái độc.',
  },
  {
    id: 'thach_hùng',
    name: 'Thạch Hùng',
    type: 'yeu_thu',
    emoji: '🐻',
    element: 'earth',
    realm_level: 3,
    hp: 300,
    atk: 35,
    def: 25,
    speed: 8,
    exp_reward: 120,
    skills: ['tho_thuan', 'dia_liet_chuong'],
    equipment_bonus: { def: 5 },
    drops: [
      { item_id: 'hung_dam', chance: 0.25 },
      { item_id: 'thach_tinh', chance: 0.2 },
      { item_id: 'thu_dan', chance: 0.4 },
    ],
    description: 'Gấu đá khổng lồ, phòng ngự cực cao. Chậm chạp nhưng mỗi cú đấm đều kinh thiên.',
  },
  {
    id: 'loi_dieu',
    name: 'Lôi Điêu',
    type: 'yeu_thu',
    emoji: '🦅',
    element: 'thunder',
    realm_level: 3,
    hp: 200,
    atk: 40,
    def: 12,
    speed: 25,
    exp_reward: 130,
    skills: ['loi_kich', 'tang_toc_thuat'],
    drops: [
      { item_id: 'loi_vu', chance: 0.2 },
      { item_id: 'dieu_vu', chance: 0.3 },
    ],
    description: 'Đại bàng sấm sét, bay nhanh như chớp. Sát thương Lôi hệ cực mạnh.',
  },
  {
    id: 'huyet_lang',
    name: 'Huyết Lang',
    type: 'yeu_thu',
    emoji: '🐺',
    element: 'dark',
    realm_level: 4,
    hp: 500,
    atk: 60,
    def: 30,
    speed: 18,
    exp_reward: 300,
    skills: ['am_anh_tru', 'cuong_chien'],
    equipment_bonus: { atk: 10, crit_rate: 5 },
    drops: [
      { item_id: 'huyet_lang_nha', chance: 0.25 },
      { item_id: 'huyet_ngoc', chance: 0.15 },
      { item_id: 'thu_dan', chance: 0.35 },
    ],
    description: 'Lang vương máu đỏ, hung tàn vô cùng. Hút máu kẻ địch để hồi phục.',
  },
  {
    id: 'bang_ho',
    name: 'Băng Hổ',
    type: 'yeu_thu',
    emoji: '🐯',
    element: 'ice',
    realm_level: 5,
    hp: 800,
    atk: 85,
    def: 40,
    speed: 20,
    exp_reward: 600,
    skills: ['bang_tru', 'kim_chung_trao'],
    equipment_bonus: { atk: 15, def: 10 },
    drops: [
      { item_id: 'bang_ho_co', chance: 0.2 },
      { item_id: 'bang_tinh', chance: 0.15 },
      { item_id: 'bao_dan', chance: 0.1 },
    ],
    description: 'Hổ băng bá vương, lãnh khí bao phủ. Mỗi cú vồ đều mang sức mạnh đóng băng.',
  },
  {
    id: 'hoa_mang',
    name: 'Hỏa Mãng',
    type: 'yeu_thu',
    emoji: '🐉',
    element: 'fire',
    realm_level: 6,
    hp: 1500,
    atk: 120,
    def: 60,
    speed: 15,
    exp_reward: 1200,
    skills: ['thien_hoa_lien', 'hoa_cau_thuat', 'cuong_chien'],
    equipment_bonus: { atk: 25, hp: 200 },
    drops: [
      { item_id: 'mang_lân', chance: 0.2 },
      { item_id: 'hoa_tinh_thach', chance: 0.25 },
      { item_id: 'bao_dan', chance: 0.12 },
    ],
    description: 'Trăn lửa khổng lồ, gần hóa giao long. Thân nhiệt thiêu cháy vạn vật tiếp cận.',
  },
  {
    id: 'huyen_qui',
    name: 'Huyền Quy',
    type: 'yeu_thu',
    emoji: '🐢',
    element: 'water',
    realm_level: 7,
    hp: 3000,
    atk: 80,
    def: 150,
    speed: 5,
    exp_reward: 2000,
    skills: ['thuy_tinh_ket_gioi', 'kim_chung_trao', 'tri_lieu_thuat'],
    equipment_bonus: { def: 50, hp: 500 },
    drops: [
      { item_id: 'huyen_qui_giap', chance: 0.15 },
      { item_id: 'thach_tinh', chance: 0.2 },
      { item_id: 'thanh_dan', chance: 0.08 },
    ],
    description: 'Rùa huyền bí ngàn năm, mai cứng hơn kim cương. Cực kỳ khó hạ nhưng rơi nguyên liệu quý.',
  },
  {
    id: 'loi_long',
    name: 'Lôi Long',
    type: 'yeu_thu',
    emoji: '🐲',
    element: 'thunder',
    realm_level: 8,
    hp: 5000,
    atk: 200,
    def: 100,
    speed: 22,
    exp_reward: 5000,
    skills: ['loi_kich', 'thien_loi', 'cuong_chien'],
    equipment_bonus: { atk: 50, speed: 5, crit_rate: 8 },
    drops: [
      { item_id: 'long_lân', chance: 0.1 },
      { item_id: 'loi_tinh', chance: 0.15 },
      { item_id: 'thanh_dan', chance: 0.1 },
    ],
    description: 'Rồng sấm sét, vương giả trong thú linh. Sức mạnh ngang tu sĩ Độ Kiếp.',
  },
  {
    id: 'kim_bang_dieu',
    name: 'Kim Bằng Điêu',
    type: 'yeu_thu',
    emoji: '🦅',
    element: 'wind',
    realm_level: 9,
    hp: 8000,
    atk: 300,
    def: 120,
    speed: 30,
    exp_reward: 10000,
    skills: ['phong_nhan', 'cuu_kiem_quy_nhat', 'tang_toc_thuat'],
    equipment_bonus: { atk: 80, speed: 10, crit_rate: 10 },
    drops: [
      { item_id: 'kim_vu', chance: 0.1 },
      { item_id: 'bang_tinh', chance: 0.2 },
      { item_id: 'tien_dan', chance: 0.05 },
    ],
    description: 'Đại bằng vàng, cánh rộng che trời. Tốc độ vượt âm, sát thương kinh hoàng.',
  },
  {
    id: 'cuu_vi_ho',
    name: 'Cửu Vĩ Hồ',
    type: 'yeu_thu',
    emoji: '🦊',
    element: 'fire',
    realm_level: 10,
    hp: 15000,
    atk: 450,
    def: 180,
    speed: 28,
    exp_reward: 25000,
    skills: ['tam_ma_thuat', 'thien_hoa_lien', 'hoi_xuan'],
    equipment_bonus: { atk: 100, def: 30, speed: 8, crit_rate: 12 },
    drops: [
      { item_id: 'ho_vĩ', chance: 0.1 },
      { item_id: 'yeu_dan', chance: 0.15 },
      { item_id: 'tien_dan', chance: 0.08 },
    ],
    description: 'Hồ ly chín đuôi, mê hoặc vạn vật. Yêu thú bậc Tiên, trí tuệ ngang người.',
  },
  {
    id: 'than_thu',
    name: 'Thần Thú Bạch Trạch',
    type: 'yeu_thu',
    emoji: '🦌',
    element: 'light',
    realm_level: 15,
    hp: 80000,
    atk: 2000,
    def: 1000,
    speed: 35,
    exp_reward: 200000,
    skills: ['bat_hoang_diet_the_kiem', 'linh_ap', 'tinh_hoa_linh_tuyen', 'thien_loi'],
    equipment_bonus: { atk: 500, def: 200, hp: 10000, speed: 10, crit_rate: 15 },
    drops: [
      { item_id: 'than_thu_huyet', chance: 0.08 },
      { item_id: 'tien_dan', chance: 0.15 },
      { item_id: 'than_tinh', chance: 0.05 },
    ],
    description: 'Thần thú thượng cổ Bạch Trạch, thông tỏ vạn yêu. Hiếm gặp, cực kỳ nguy hiểm.',
  },
  {
    id: 'moc_yeu',
    name: 'Mộc Yêu',
    type: 'yeu_thu',
    emoji: '🌳',
    element: 'wood',
    realm_level: 4,
    hp: 400,
    atk: 45,
    def: 35,
    speed: 6,
    exp_reward: 250,
    skills: ['tri_lieu_thuat', 'doc_vu'],
    equipment_bonus: { hp: 100, def: 8 },
    drops: [
      { item_id: 'linh_moc', chance: 0.3 },
      { item_id: 'linh_thao', chance: 0.4 },
      { item_id: 'thu_dan', chance: 0.3 },
    ],
    description: 'Cây cổ thụ hóa yêu, rễ cây cuốn chặt con mồi. HP cao, chậm nhưng hồi phục mạnh.',
  },

  // ═══════════════════════════════════════════
  //  QUỶ TU (Dark Cultivators) — 5 monsters
  // ═══════════════════════════════════════════
  {
    id: 'u_hon',
    name: 'U Hồn',
    type: 'quy_tu',
    emoji: '👻',
    element: 'dark',
    realm_level: 3,
    hp: 150,
    atk: 30,
    def: 5,
    speed: 20,
    exp_reward: 100,
    skills: ['am_anh_tru'],
    drops: [
      { item_id: 'hon_ngoc', chance: 0.2 },
      { item_id: 'am_khi_thach', chance: 0.25 },
    ],
    description: 'Hồn quỷ vất vưởng, tấn công bằng âm khí. Phòng ngự thấp nhưng tấn công mạnh.',
  },
  {
    id: 'ha_cap_quy',
    name: 'Hạ Cấp Quỷ Tu',
    type: 'quy_tu',
    emoji: '👹',
    element: 'dark',
    realm_level: 5,
    hp: 600,
    atk: 80,
    def: 30,
    speed: 17,
    exp_reward: 500,
    skills: ['am_anh_tru', 'phong_an_thuat'],
    equipment_bonus: { atk: 15, def: 5 },
    drops: [
      { item_id: 'quy_dan', chance: 0.2 },
      { item_id: 'am_khi_thach', chance: 0.3 },
      { item_id: 'ma_ngoc', chance: 0.1 },
    ],
    description: 'Quỷ tu bậc thấp, tu luyện bằng hấp thu linh hồn. Tàn nhẫn và xảo quyệt.',
  },
  {
    id: 'huyet_quy',
    name: 'Huyết Quỷ',
    type: 'quy_tu',
    emoji: '🧛',
    element: 'dark',
    realm_level: 7,
    hp: 2000,
    atk: 150,
    def: 50,
    speed: 22,
    exp_reward: 2500,
    skills: ['am_anh_tru', 'cuong_chien', 'doc_vu'],
    equipment_bonus: { atk: 40, speed: 5, crit_rate: 10 },
    drops: [
      { item_id: 'huyet_ngoc', chance: 0.15 },
      { item_id: 'quy_dan', chance: 0.2 },
      { item_id: 'huyet_ki', chance: 0.1 },
    ],
    description: 'Quỷ hút máu, càng hút càng mạnh. Mỗi đòn tấn công hồi HP bằng 10% sát thương.',
  },
  {
    id: 'minh_gioi_quy_vuong',
    name: 'Minh Giới Quỷ Vương',
    type: 'quy_tu',
    emoji: '💀',
    element: 'dark',
    realm_level: 10,
    hp: 12000,
    atk: 400,
    def: 200,
    speed: 25,
    exp_reward: 20000,
    skills: ['tam_ma_thuat', 'am_anh_tru', 'phong_an_thuat', 'cuu_kiem_quy_nhat'],
    equipment_bonus: { atk: 100, def: 50, hp: 2000, crit_rate: 12 },
    drops: [
      { item_id: 'quy_vuong_ngoc', chance: 0.1 },
      { item_id: 'am_khi_thach', chance: 0.3 },
      { item_id: 'tien_dan', chance: 0.08 },
    ],
    description: 'Vương giả của Minh Giới, thống trị vạn quỷ. Sức mạnh ngang Chân Tiên.',
  },
  {
    id: 'cuu_u_quy_ton',
    name: 'Cửu U Quỷ Tôn',
    type: 'quy_tu',
    emoji: '☠️',
    element: 'dark',
    realm_level: 15,
    hp: 60000,
    atk: 1800,
    def: 800,
    speed: 30,
    exp_reward: 150000,
    skills: ['tam_ma_thuat', 'bat_hoang_diet_the_kiem', 'phong_an_thuat', 'tinh_hoa_linh_tuyen'],
    equipment_bonus: { atk: 400, def: 150, hp: 8000, speed: 8, crit_rate: 15 },
    drops: [
      { item_id: 'quy_ton_ngoc', chance: 0.08 },
      { item_id: 'than_tinh', chance: 0.05 },
      { item_id: 'tien_dan', chance: 0.12 },
    ],
    description: 'Tôn giả tối cao của Quỷ tộc, cai quản Cửu U Minh Phủ. Sức mạnh kinh thiên.',
  },

  // ═══════════════════════════════════════════
  //  MA ĐẠO TU SĨ (Demonic Cultivators) — 5 monsters
  // ═══════════════════════════════════════════
  {
    id: 'ma_dao_de_tu',
    name: 'Ma Đạo Đệ Tử',
    type: 'ma_dao_tu_si',
    emoji: '🧙‍♂️',
    element: 'dark',
    realm_level: 2,
    hp: 100,
    atk: 18,
    def: 7,
    speed: 12,
    exp_reward: 40,
    skills: ['hoa_cau_thuat'],
    equipment_bonus: { atk: 3 },
    drops: [
      { item_id: 'ma_dan', chance: 0.2 },
      { item_id: 'am_khi_thach', chance: 0.2 },
    ],
    description: 'Đệ tử tà ma mới nhập môn, tu luyện tà công. Yếu nhưng xảo trá.',
  },
  {
    id: 'huyet_y_tu_si',
    name: 'Huyết Y Tu Sĩ',
    type: 'ma_dao_tu_si',
    emoji: '🩸',
    element: 'dark',
    realm_level: 5,
    hp: 700,
    atk: 90,
    def: 35,
    speed: 18,
    exp_reward: 550,
    skills: ['am_anh_tru', 'cuong_chien', 'tri_lieu_thuat'],
    equipment_bonus: { atk: 20, def: 8, crit_rate: 5 },
    drops: [
      { item_id: 'huyet_ngoc', chance: 0.2 },
      { item_id: 'ma_dan', chance: 0.25 },
      { item_id: 'bao_dan', chance: 0.08 },
    ],
    description: 'Tu sĩ mặc huyết y, tu luyện Hấp Huyết Đại Pháp. Hút máu kẻ địch để tăng sức.',
  },
  {
    id: 'van_doc_giao_chu',
    name: 'Vạn Độc Giáo Chủ',
    type: 'ma_dao_tu_si',
    emoji: '☠️',
    element: 'wood',
    realm_level: 7,
    hp: 2500,
    atk: 130,
    def: 60,
    speed: 16,
    exp_reward: 3000,
    skills: ['doc_vu', 'phong_an_thuat', 'thuy_tinh_ket_gioi'],
    equipment_bonus: { atk: 30, def: 15, hp: 300 },
    drops: [
      { item_id: 'van_doc_dan', chance: 0.15 },
      { item_id: 'doc_nang', chance: 0.25 },
      { item_id: 'thanh_dan', chance: 0.06 },
    ],
    description: 'Giáo chủ Vạn Độc giáo, sử dụng vạn loại kịch độc. Đầu độc trước khi chiến đấu.',
  },
  {
    id: 'huyen_am_lao_to',
    name: 'Huyền Âm Lão Tổ',
    type: 'ma_dao_tu_si',
    emoji: '🌑',
    element: 'dark',
    realm_level: 9,
    hp: 6000,
    atk: 280,
    def: 100,
    speed: 20,
    exp_reward: 8000,
    skills: ['tam_ma_thuat', 'am_anh_tru', 'cuu_kiem_quy_nhat', 'hoi_xuan'],
    equipment_bonus: { atk: 70, def: 30, hp: 1000, crit_rate: 8 },
    drops: [
      { item_id: 'huyen_am_ngoc', chance: 0.1 },
      { item_id: 'ma_dan', chance: 0.2 },
      { item_id: 'thanh_dan', chance: 0.08 },
    ],
    description: 'Lão tổ Ma Đạo, tu luyện ngàn năm. Âm khí tràn ngập, một chưởng phá sơn.',
  },
  {
    id: 'ma_ton',
    name: 'Ma Tôn',
    type: 'ma_dao_tu_si',
    emoji: '😈',
    element: 'chaos',
    realm_level: 14,
    hp: 50000,
    atk: 1500,
    def: 700,
    speed: 28,
    exp_reward: 120000,
    skills: ['bat_hoang_diet_the_kiem', 'tam_ma_thuat', 'linh_ap', 'tinh_hoa_linh_tuyen'],
    equipment_bonus: { atk: 350, def: 120, hp: 6000, speed: 8, crit_rate: 15 },
    drops: [
      { item_id: 'ma_ton_ngoc', chance: 0.08 },
      { item_id: 'tien_dan', chance: 0.1 },
      { item_id: 'diet_the_ma_kinh_trang', chance: 0.03 },
    ],
    description: 'Ma Tôn tà đạo, sức mạnh ngang Tiên Vương. Hắc ám bao trùm, vạn kiếp bất diệt.',
  },

  // ═══════════════════════════════════════════
  //  THƯỢNG CỔ DỊ THÚ (Ancient Boss) — 3 monsters
  // ═══════════════════════════════════════════
  {
    id: 'thuong_co_tao_thien_khuynh',
    name: 'Thượng Cổ Thao Thiết',
    type: 'thuong_co_di_thu',
    emoji: '🐲',
    element: 'earth',
    realm_level: 8,
    hp: 20000,
    atk: 350,
    def: 200,
    speed: 15,
    exp_reward: 15000,
    is_boss: true,
    boss_skills: ['devour', 'roar'],
    skills: ['dia_liet_chuong', 'cuong_chien'],
    equipment_bonus: { atk: 80, def: 60, hp: 3000 },
    drops: [
      { item_id: 'tao_thiet_nha', chance: 0.2 },
      { item_id: 'thuong_co_tinh_huyet', chance: 0.1 },
      { item_id: 'thanh_dan', chance: 0.15 },
      { item_id: 'tien_kiem_manh', chance: 0.05 },
    ],
    description: 'Thượng cổ hung thú Thao Thiết, nuốt chửng vạn vật. Boss cực mạnh, cần đội hình mới hạ.',
  },
  {
    id: 'thuong_co_tien_long',
    name: 'Thượng Cổ Tiên Long',
    type: 'thuong_co_di_thu',
    emoji: '🐉',
    element: 'fire',
    realm_level: 12,
    hp: 100000,
    atk: 1200,
    def: 600,
    speed: 25,
    exp_reward: 80000,
    is_boss: true,
    boss_skills: ['dragon_breath', 'tail_sweep', 'dragon_roar'],
    skills: ['thien_hoa_lien', 'linh_ap'],
    equipment_bonus: { atk: 200, def: 100, hp: 10000, speed: 5, crit_rate: 10 },
    drops: [
      { item_id: 'long_lân', chance: 0.15 },
      { item_id: 'long_ngoc', chance: 0.08 },
      { item_id: 'tien_dan', chance: 0.12 },
      { item_id: 'tien_giap_manh', chance: 0.05 },
    ],
    description: 'Rồng tiên thượng cổ, ngự trị trên chín tầng trời. Sức mạnh vượt xa tu sĩ bình thường.',
  },
  {
    id: 'thuong_co_phuong_hoang',
    name: 'Thượng Cổ Phượng Hoàng',
    type: 'thuong_co_di_thu',
    emoji: '🔥',
    element: 'fire',
    realm_level: 14,
    hp: 150000,
    atk: 1800,
    def: 500,
    speed: 35,
    exp_reward: 130000,
    is_boss: true,
    boss_skills: ['nirvana_flame', 'phoenix_rebirth', 'feather_storm'],
    skills: ['thien_hoa_lien', 'linh_ap', 'cuong_chien'],
    equipment_bonus: { atk: 400, def: 80, hp: 15000, speed: 8, crit_rate: 15 },
    drops: [
      { item_id: 'phuong_vu', chance: 0.1 },
      { item_id: 'niet_ban_hoa', chance: 0.08 },
      { item_id: 'tien_dan', chance: 0.15 },
      { item_id: 'than_tinh', chance: 0.03 },
    ],
    description: 'Phượng Hoàng thượng cổ, niết bàn trùng sinh. Lửa thiêng cháy bất diệt, tái sinh từ tro tàn.',
  },

  // ═══════════════════════════════════════════
  //  THIÊN MA (World Boss) — 1 monster
  // ═══════════════════════════════════════════
  {
    id: 'thien_ma',
    name: 'Thiên Ma Đại Đế',
    type: 'thien_ma',
    emoji: '👿',
    element: 'chaos',
    realm_level: 20,
    hp: 1000000,
    atk: 5000,
    def: 3000,
    speed: 40,
    exp_reward: 500000,
    is_boss: true,
    is_world_boss: true,
    boss_skills: ['dark_domain', 'soul_destroy', 'demon_army', 'ultimate_darkness'],
    skills: ['van_phat_quy_tong', 'bat_hoang_diet_the_kiem'],
    equipment_bonus: { atk: 1000, def: 500, hp: 100000, speed: 10, crit_rate: 20 },
    phases: 3,
    drops: [
      { item_id: 'thien_ma_ngoc', chance: 0.05 },
      { item_id: 'than_tinh', chance: 0.1 },
      { item_id: 'tien_dan', chance: 0.2 },
      { item_id: 'than_giap_manh', chance: 0.03 },
      { item_id: 'hon_don_tinh', chance: 0.01 },
    ],
    description: 'Thiên Ma Đại Đế - World Boss tối thượng. Cần cả server hợp lực mới có thể đánh bại. Xuất hiện định kỳ.',
  },

  // ═══════════════════════════════════════════
  //  KIẾP THÚ (Tribulation Beast) — 1 monster
  // ═══════════════════════════════════════════
  {
    id: 'kiep_loi_thu',
    name: 'Kiếp Lôi Thú',
    type: 'kiep_thu',
    emoji: '⛈️',
    element: 'thunder',
    realm_level: 0, // Scales với realm người vượt kiếp
    hp: 0,          // Scales
    atk: 0,         // Scales
    def: 0,         // Scales
    speed: 20,
    exp_reward: 0,  // Scales
    is_tribulation: true,
    skills: ['loi_kich', 'thien_loi'],
    scaling: {
      hp_multiplier: 2.0,      // 2x HP người chơi
      atk_multiplier: 1.5,     // 1.5x ATK
      def_multiplier: 1.2,     // 1.2x DEF
      exp_multiplier: 3.0,     // 3x exp thường
    },
    drops: [
      { item_id: 'kiep_loi_tinh', chance: 0.3 },
      { item_id: 'thanh_dan', chance: 0.2 },
    ],
    description: 'Thú Kiếp sinh ra từ sấm sét kiếp nạn. Sức mạnh tỉ lệ với cảnh giới người vượt kiếp.',
  },
];

module.exports = {
  monsters,
  list: monsters, // Alias for menu compatibility

  /**
   * Lấy quái theo id
   */
  getMonsterById(id) {
    return monsters.find(m => m.id === id);
  },

  /**
   * Lấy quái theo loại
   */
  getByType(type) {
    return monsters.filter(m => m.type === type);
  },

  /**
   * Lấy quái theo realm
   */
  getByRealmLevel(realmLevel) {
    return monsters.filter(m => m.realm_level === realmLevel);
  },

  /**
   * Lấy quái trong khoảng realm
   */
  getInRealmRange(minRealm, maxRealm) {
    return monsters.filter(m => m.realm_level >= minRealm && m.realm_level <= maxRealm);
  },

  /**
   * Lấy danh sách boss
   */
  getBosses() {
    return monsters.filter(m => m.is_boss);
  },

  /**
   * Lấy world boss
   */
  getWorldBosses() {
    return monsters.filter(m => m.is_world_boss);
  },
};
