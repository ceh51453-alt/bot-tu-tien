/**
 * @file Tiên Thiên Khí Vận (Birth Traits) Configuration — EXPANDED
 * @description ~150 đặc tính bẩm sinh khi tạo nhân vật, bám sát game Quỷ Cốc Bát Hoang
 *
 * Rarity: do (đỏ) > cam > tim > lam > luc > xam (xám)
 * Roll khi tạo nhân vật: 1-3 traits, rarity cao = tỉ lệ thấp
 *
 * Chỉ số đã chỉnh phù hợp bot Discord (scale nhỏ hơn game gốc)
 */

const TRAIT_RARITY = {
  DO:    { id: 'do',    name: 'Đỏ',   order: 6, color: '#EF4444', emoji: '🔴', weight: 1 },
  CAM:   { id: 'cam',   name: 'Cam',   order: 5, color: '#F97316', emoji: '🟠', weight: 3 },
  TIM:   { id: 'tim',   name: 'Tím',   order: 4, color: '#A855F7', emoji: '🟣', weight: 9 },
  LAM:   { id: 'lam',   name: 'Lam',   order: 3, color: '#3B82F6', emoji: '🔵', weight: 18 },
  LUC:   { id: 'luc',   name: 'Lục',   order: 2, color: '#22C55E', emoji: '🟢', weight: 30 },
  XAM:   { id: 'xam',   name: 'Xám',   order: 1, color: '#9CA3AF', emoji: '⚪', weight: 40 },
};

const tienThienTraits = [
  // ╔═══════════════════════════════════════════════╗
  // ║  ĐỎ — Cực Hiếm (weight 1)                     ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'thien_menh_chi_tu', name: 'Thiên Mệnh Chi Tử',
    rarity: TRAIT_RARITY.DO, emoji: '👑',
    effects: { ngo_tinh: 50, van_khi: 50, exp_bonus_percent: 25, all_stats_percent: 5 },
    description: 'Ngộ tính +50, vận khí +50, tu vi +25%, toàn stats +5%. Con trời!',
  },
  {
    id: 'nhan_toc_thanh_the', name: 'Nhân Tộc Thánh Thể',
    rarity: TRAIT_RARITY.DO, emoji: '✨👤',
    effects: { hp: 50, atk: 15, def: 10, speed: 8, mana: 30, ngo_tinh: 30 },
    description: 'Thánh thể nhân tộc: toàn stats cực cao. Một trong triệu.',
  },
  {
    id: 'long_mon_cam_ly', name: 'Long Môn Cẩm Lý',
    rarity: TRAIT_RARITY.DO, emoji: '🐉🎏',
    effects: { ngo_tinh: 40, van_khi: 30, breakthrough_bonus_percent: 20, tribulation_resist: 15 },
    description: 'Ngộ tính +40, vận khí +30, đột phá +20%, kháng kiếp +15%.',
  },
  {
    id: 'hon_don_chi_than', name: 'Hỗn Độn Chi Thần',
    rarity: TRAIT_RARITY.DO, emoji: '🌌',
    effects: { all_element_tu_chat: 30, ngo_tinh: 35, mana: 40, elemental_mastery: 20 },
    description: 'Tư chất mọi hệ +30, ngộ tính +35, linh lực +40. Hỗn độn nguyên thể.',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  CAM — Siêu Hiếm (weight 3)                   ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'thien_do_anh_tai', name: 'Thiên Đố Anh Tài',
    rarity: TRAIT_RARITY.CAM, emoji: '🌟',
    effects: { ngo_tinh: 30, exp_bonus_percent: 20 },
    description: 'Ngộ tính +30, tu vi +20%. Thiên tài sinh ra vượt người thường.',
  },
  {
    id: 'kiem_si', name: 'Kiếm Si',
    rarity: TRAIT_RARITY.CAM, emoji: '⚔️',
    effects: { weapon_tu_chat_bonus: { kiem: 30 }, weapon_thuan_thuc_percent: { kiem: 50 } },
    weapon_affinity: 'kiem',
    description: 'Kiếm pháp tư chất +30, thuần thục +50%. Sinh ra vì kiếm.',
  },
  {
    id: 'dao_cuong', name: 'Đao Cuồng',
    rarity: TRAIT_RARITY.CAM, emoji: '🔪',
    effects: { weapon_tu_chat_bonus: { dao: 30 }, weapon_thuan_thuc_percent: { dao: 50 } },
    weapon_affinity: 'dao',
    description: 'Đao pháp tư chất +30, thuần thục +50%. Cuồng đao bất cần.',
  },
  {
    id: 'quy_coc_mon', name: 'Quỷ Cốc Môn',
    rarity: TRAIT_RARITY.CAM, emoji: '👻',
    effects: { atk: 12, ngo_tinh: 30, starter_than_phap: true },
    description: 'ATK +12, ngộ tính +30, sinh ra mang theo 1 quyển cam Trúc Cơ thân pháp.',
  },
  {
    id: 'vo_thanh_chuyen_the', name: 'Võ Thánh Chuyển Thế',
    rarity: TRAIT_RARITY.CAM, emoji: '🥋',
    effects: { atk: 10, def: 3, ngo_tinh: 20, danh_vong: 100 },
    description: 'ATK +10, DEF +3, ngộ tính +20, danh vọng +100. Kiếp trước Võ Thánh.',
  },
  {
    id: 'thien_sinh_dao_the', name: 'Thiên Sinh Đạo Thể',
    rarity: TRAIT_RARITY.CAM, emoji: '✨',
    effects: { all_element_tu_chat: 20, ngo_tinh: 25, exp_bonus_percent: 15 },
    description: 'Tư chất mọi hệ +20, ngộ tính +25, tu vi +15%. Thể chất trời ban.',
  },
  {
    id: 'bao_linh_chuyen_the', name: 'Bạo Linh Chuyển Thế',
    rarity: TRAIT_RARITY.CAM, emoji: '⚡',
    effects: { atk: 15, crit_rate: 8, crit_damage: 20, ngo_tinh: 15 },
    description: 'ATK +15, bạo kích +8%, damage +20%, ngộ tính +15. Sát thần tái thế.',
  },
  {
    id: 'y_tien_chuyen_the', name: 'Y Tiên Chuyển Thế',
    rarity: TRAIT_RARITY.CAM, emoji: '💊',
    effects: { ngo_tinh: 25, pill_effect_percent: 40, poison_resist: 30, heal_power: 20 },
    description: 'Ngộ tính +25, đan dược +40%, kháng độc +30%, hồi phục +20%. Thần y tái sinh.',
  },
  {
    id: 'luyen_khi_dai_su', name: 'Luyện Khí Đại Sư',
    rarity: TRAIT_RARITY.CAM, emoji: '🔥🔨',
    effects: { ngo_tinh: 20, craft_success_percent: 30, equipment_bonus_percent: 15 },
    description: 'Ngộ tính +20, luyện khí +30%, trang bị +15%. Thợ rèn thần cấp.',
  },
  {
    id: 'thuong_hoang_chi_son', name: 'Thương Hoàng Chi Tôn',
    rarity: TRAIT_RARITY.CAM, emoji: '🪙',
    effects: { van_khi: 25, linh_thach_bonus_percent: 20, trade_discount_percent: 15, ngo_tinh: 10 },
    description: 'Vận khí +25, linh thạch +20%, giảm giá +15%. Phú hào thiên sinh.',
  },
  {
    id: 'thanh_thu_chi_hon', name: 'Thánh Thú Chi Hồn',
    rarity: TRAIT_RARITY.CAM, emoji: '🐺',
    effects: { pet_atk_percent: 30, pet_hp_percent: 25, pet_evolve_bonus: 15, ngo_tinh: 15 },
    description: 'Linh thú ATK +30%, HP +25%, tiến hóa +15%. Thánh thú dẫn đường.',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  TÍM — Hiếm (weight 9)                        ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'vu_khi_dai_su', name: 'Vũ Khí Đại Sư',
    rarity: TRAIT_RARITY.TIM, emoji: '🗡️',
    effects: { all_weapon_tu_chat: 20, all_weapon_thuan_thuc_percent: 30 },
    description: 'Kiếm/đao/thương pháp tư chất +20, thuần thục +30%.',
  },
  {
    id: 'hau_nghe_xa_nhat', name: 'Hậu Nghệ Xạ Nhật',
    rarity: TRAIT_RARITY.TIM, emoji: '🏹',
    effects: { atk: 5, range_bonus: 20, accuracy: 20 },
    description: 'ATK +5, tầm đánh +20, chính xác +20. Bắn trúng mặt trời.',
  },
  {
    id: 'thiet_co_dinh_than', name: 'Thiết Cốt Đỉnh Thần',
    rarity: TRAIT_RARITY.TIM, emoji: '🦴',
    effects: { def: 8, hp_percent: 15, tenacity: 20 },
    description: 'DEF +8, HP +15%, kháng khống chế +20. Xương cốt cứng thép.',
  },
  {
    id: 'linh_mach_thong_thien', name: 'Linh Mạch Thông Thiên',
    rarity: TRAIT_RARITY.TIM, emoji: '🌊',
    effects: { mana: 30, mana_regen_percent: 10, ngo_tinh: 15 },
    description: 'Mana +30, hồi linh lực +10%, ngộ tính +15.',
  },
  {
    id: 'sat_than_chuyen_the', name: 'Sát Thần Chuyển Thế',
    rarity: TRAIT_RARITY.TIM, emoji: '💀',
    effects: { atk: 8, crit_rate: 5, crit_damage: 15 },
    description: 'ATK +8, bạo kích +5%, sát thương bạo kích +15%.',
  },
  {
    id: 'tham_thien_chi_the', name: 'Tham Thiền Chi Thể',
    rarity: TRAIT_RARITY.TIM, emoji: '🧘',
    effects: { ngo_tinh: 20, exp_bonus_percent: 12, meditation_bonus: 15 },
    description: 'Ngộ tính +20, tu vi +12%, tĩnh tọa +15%.',
  },
  {
    id: 'thanh_am_nhap_dinh', name: 'Thanh Âm Nhập Định',
    rarity: TRAIT_RARITY.TIM, emoji: '🎵',
    effects: { ngo_tinh: 15, charm_resist: 20, mana_regen_percent: 8 },
    description: 'Ngộ tính +15, kháng mê hoặc +20%, hồi mana +8%.',
  },
  {
    id: 'huyen_thiet_chi_co', name: 'Huyền Thiết Chi Cốt',
    rarity: TRAIT_RARITY.TIM, emoji: '🦾',
    effects: { def: 10, hp: 25, damage_reduction_percent: 5 },
    description: 'DEF +10, HP +25, giảm thương 5%. Cốt cách cứng như huyền thiết.',
  },
  {
    id: 'yeu_tinh_chi_huyet', name: 'Yêu Tinh Chi Huyết',
    rarity: TRAIT_RARITY.TIM, emoji: '🩸',
    effects: { atk: 6, lifesteal_percent: 3, hp: 15 },
    description: 'ATK +6, hút máu 3%, HP +15. Huyết mạch yêu tinh.',
  },
  {
    id: 'phong_thuong_than_the', name: 'Phong Thương Thần Thể',
    rarity: TRAIT_RARITY.TIM, emoji: '🌪️',
    effects: { speed: 10, dodge_rate: 5, atk: 4 },
    description: 'Tốc độ +10, né +5%, ATK +4. Thân pháp như gió.',
  },
  {
    id: 'chu_tuoc_chi_huyet', name: 'Chu Tước Chi Huyết',
    rarity: TRAIT_RARITY.TIM, emoji: '🐦‍🔥',
    effects: { atk: 7, fire_damage_percent: 15, burn_resist: 20 },
    description: 'ATK +7, hỏa pháp +15%, kháng cháy +20%. Huyết mạch Chu Tước.',
  },
  {
    id: 'huyen_vu_chi_huyet', name: 'Huyền Vũ Chi Huyết',
    rarity: TRAIT_RARITY.TIM, emoji: '🐢',
    effects: { def: 8, hp: 30, water_damage_percent: 10, ice_resist: 15 },
    description: 'DEF +8, HP +30, thủy pháp +10%, kháng băng +15%. Huyền Vũ huyết mạch.',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  LAM — Không phổ biến (weight 18)              ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'tan_thu_linh_quang', name: 'Tân Thủ Linh Quang',
    rarity: TRAIT_RARITY.LAM, emoji: '🔆',
    effects: { exp_bonus_percent: 10, ngo_tinh: 10 },
    description: 'Tu vi +10%, ngộ tính +10. Khởi đầu thuận lợi.',
  },
  {
    id: 'phong_luu_khach', name: 'Phong Lưu Khách',
    rarity: TRAIT_RARITY.LAM, emoji: '🎭',
    effects: { van_khi: 15, danh_vong: 50, npc_affinity_bonus: 10 },
    description: 'Vận khí +15, danh vọng +50, hảo cảm NPC +10.',
  },
  {
    id: 'thiet_quyen', name: 'Thiết Quyền',
    rarity: TRAIT_RARITY.LAM, emoji: '👊',
    effects: { atk: 5, def: 3 },
    description: 'ATK +5, DEF +3. Quyền cước cứng như thép.',
  },
  {
    id: 'nhanh_nhen', name: 'Nhanh Nhẹn',
    rarity: TRAIT_RARITY.LAM, emoji: '💨',
    effects: { speed: 8, dodge_rate: 5 },
    description: 'Tốc độ +8, né tránh +5%. Thân pháp linh hoạt từ nhỏ.',
  },
  {
    id: 'linh_tam_tue', name: 'Linh Tâm Tuệ',
    rarity: TRAIT_RARITY.LAM, emoji: '💡',
    effects: { ngo_tinh: 12, mana: 15 },
    description: 'Ngộ tính +12, linh lực +15. Tâm linh thông tuệ.',
  },
  {
    id: 'hoa_du_than', name: 'Hỏa Dữ Thần',
    rarity: TRAIT_RARITY.LAM, emoji: '🔥',
    effects: { atk: 4, fire_damage_percent: 8 },
    description: 'ATK +4, hỏa pháp +8%. Mang lửa trong người.',
  },
  {
    id: 'thuy_nhu_ngoc', name: 'Thủy Như Ngọc',
    rarity: TRAIT_RARITY.LAM, emoji: '💎',
    effects: { def: 3, water_damage_percent: 8, hp: 10 },
    description: 'DEF +3, thủy pháp +8%, HP +10. Trong sáng như ngọc.',
  },
  {
    id: 'tho_hon_chi_luc', name: 'Thổ Hồn Chi Lực',
    rarity: TRAIT_RARITY.LAM, emoji: '🪨',
    effects: { def: 5, hp: 15 },
    description: 'DEF +5, HP +15. Ý chí vững như đá.',
  },
  {
    id: 'loi_dien_chi_than', name: 'Lôi Điện Chi Thần',
    rarity: TRAIT_RARITY.LAM, emoji: '⚡',
    effects: { speed: 6, atk: 3, lightning_damage_percent: 8 },
    description: 'Tốc +6, ATK +3, lôi pháp +8%. Mang sét trong người.',
  },
  {
    id: 'moc_linh_chi_the', name: 'Mộc Linh Chi Thể',
    rarity: TRAIT_RARITY.LAM, emoji: '🌿',
    effects: { hp: 20, hp_regen_percent: 3 },
    description: 'HP +20, hồi HP +3%. Sinh lực dồi dào.',
  },
  {
    id: 'cuoc_luc_manh_me', name: 'Cước Lực Mạnh Mẽ',
    rarity: TRAIT_RARITY.LAM, emoji: '🦵',
    effects: { cuoc_luc: 20, speed: 4 },
    description: 'Cước lực +20, tốc độ +4. Chân cước vững vàng.',
  },
  {
    id: 'mi_luc_thien_sinh', name: 'Mị Lực Thiên Sinh',
    rarity: TRAIT_RARITY.LAM, emoji: '💫',
    effects: { mi_luc: 20, npc_affinity_bonus: 8, charm_resist: 5 },
    description: 'Mị lực +20, hảo cảm NPC +8, kháng mê hoặc +5.',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  LỤC — Phổ biến (weight 30)                   ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'than_khoe_manh', name: 'Thân Khỏe Mạnh',
    rarity: TRAIT_RARITY.LUC, emoji: '💪',
    effects: { hp: 30, def: 2 },
    description: 'HP +30, DEF +2. Sinh ra khỏe mạnh hơn người.',
  },
  {
    id: 'tinh_mat_sang', name: 'Tinh Mắt Sáng',
    rarity: TRAIT_RARITY.LUC, emoji: '👁️',
    effects: { accuracy: 10, crit_rate: 2 },
    description: 'Chính xác +10, bạo kích +2%. Mắt tinh như ưng.',
  },
  {
    id: 'kien_nhan', name: 'Kiên Nhẫn',
    rarity: TRAIT_RARITY.LUC, emoji: '🧘',
    effects: { exp_bonus_percent: 5, mana: 15 },
    description: 'Tu vi +5%, mana +15. Kiên trì tu luyện.',
  },
  {
    id: 'may_man', name: 'May Mắn',
    rarity: TRAIT_RARITY.LUC, emoji: '🍀',
    effects: { van_khi: 10 },
    description: 'Vận khí +10. Hay gặp may.',
  },
  {
    id: 'suc_song_doi_dao', name: 'Sức Sống Dồi Dào',
    rarity: TRAIT_RARITY.LUC, emoji: '❤️',
    effects: { hp: 20, hp_regen_percent: 2 },
    description: 'HP +20, hồi HP +2%. Sinh lực mạnh mẽ.',
  },
  {
    id: 'tam_tinh_vui_ve', name: 'Tâm Tình Vui Vẻ',
    rarity: TRAIT_RARITY.LUC, emoji: '😊',
    effects: { tam_tinh: 15, npc_affinity_bonus: 5 },
    description: 'Tâm tình +15, hảo cảm NPC +5. Luôn vui vẻ.',
  },
  {
    id: 'tho_dai_menh_lon', name: 'Thọ Đại Mệnh Lớn',
    rarity: TRAIT_RARITY.LUC, emoji: '🐢',
    effects: { tho_menh: 20 },
    description: 'Thọ mệnh +20. Sống dai hơn người.',
  },
  {
    id: 'linh_khi_hung_vong', name: 'Linh Khí Hưng Vượng',
    rarity: TRAIT_RARITY.LUC, emoji: '🌬️',
    effects: { mana: 20 },
    description: 'Linh lực +20. Linh khí trong người hưng vượng.',
  },
  {
    id: 'co_chap', name: 'Cố Chấp',
    rarity: TRAIT_RARITY.LUC, emoji: '😤',
    effects: { atk: 3, tenacity: 5 },
    description: 'ATK +3, kháng khống chế +5. Tính tình cố chấp.',
  },
  {
    id: 'linh_hoat', name: 'Linh Hoạt',
    rarity: TRAIT_RARITY.LUC, emoji: '🤸',
    effects: { speed: 4, dodge_rate: 2 },
    description: 'Tốc độ +4, né +2%. Thân thể linh hoạt.',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  XÁM — Rất phổ biến (weight 40)                ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'binh_thuong', name: 'Bình Thường',
    rarity: TRAIT_RARITY.XAM, emoji: '⚪',
    effects: { hp: 10 },
    description: 'HP +10. Người bình thường.',
  },
  {
    id: 'cham_chi', name: 'Chăm Chỉ',
    rarity: TRAIT_RARITY.XAM, emoji: '📚',
    effects: { exp_bonus_percent: 3 },
    description: 'Tu vi +3%. Siêng năng bù thông minh.',
  },
  {
    id: 'bung_lua', name: 'Bùng Lửa',
    rarity: TRAIT_RARITY.XAM, emoji: '🔥',
    effects: { atk: 3 },
    description: 'ATK +3. Tính nóng nảy, đánh mạnh hơn chút.',
  },
  {
    id: 'chac_chan', name: 'Chắc Chắn',
    rarity: TRAIT_RARITY.XAM, emoji: '🧱',
    effects: { def: 2 },
    description: 'DEF +2. Thân thể chắc chắn.',
  },
  {
    id: 'nhanh_chan', name: 'Nhanh Chân',
    rarity: TRAIT_RARITY.XAM, emoji: '🏃',
    effects: { speed: 3 },
    description: 'Tốc độ +3. Chạy nhanh từ nhỏ.',
  },
  {
    id: 'tinh_than_manh', name: 'Tinh Thần Mạnh',
    rarity: TRAIT_RARITY.XAM, emoji: '🧠',
    effects: { mana: 8 },
    description: 'Linh lực +8. Tinh thần mạnh mẽ.',
  },
  {
    id: 'ben_bi', name: 'Bền Bỉ',
    rarity: TRAIT_RARITY.XAM, emoji: '🏋️',
    effects: { hp: 8, def: 1 },
    description: 'HP +8, DEF +1. Chịu đựng tốt.',
  },
  {
    id: 'gan_da', name: 'Gan Dạ',
    rarity: TRAIT_RARITY.XAM, emoji: '🦁',
    effects: { atk: 2, tenacity: 3 },
    description: 'ATK +2, kháng khống chế +3. Gan dạ.',
  },
  {
    id: 'tot_bung', name: 'Tốt Bụng',
    rarity: TRAIT_RARITY.XAM, emoji: '🤗',
    effects: { npc_affinity_bonus: 5, van_khi: 3 },
    description: 'Hảo cảm NPC +5, vận khí +3. Tốt bụng.',
  },
  {
    id: 'tam_can_nhac', name: 'Tẩm Cẩn Nhắc',
    rarity: TRAIT_RARITY.XAM, emoji: '🤔',
    effects: { accuracy: 5 },
    description: 'Chính xác +5. Hành động cẩn thận.',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  NEGATIVE TRAITS (Debuff) — MỌI TIER          ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'ngo_tinh_kem', name: 'Ngộ Tính Kém',
    rarity: TRAIT_RARITY.XAM, emoji: '🐌',
    effects: { ngo_tinh: -10, exp_bonus_percent: -5 },
    description: 'Ngộ tính -10, tu vi -5%. Chậm hiểu.',
    is_negative: true,
  },
  {
    id: 'yeu_duoi', name: 'Yếu Đuối',
    rarity: TRAIT_RARITY.XAM, emoji: '😵',
    effects: { hp: -15, def: -2 },
    description: 'HP -15, DEF -2. Thân thể yếu ớt.',
    is_negative: true,
  },
  {
    id: 'xui_xeo', name: 'Xui Xẻo',
    rarity: TRAIT_RARITY.XAM, emoji: '🫠',
    effects: { van_khi: -15 },
    description: 'Vận khí -15. Toàn gặp xui.',
    is_negative: true,
  },
  {
    id: 'lung_tung', name: 'Lúng Túng',
    rarity: TRAIT_RARITY.XAM, emoji: '😰',
    effects: { speed: -3, accuracy: -5 },
    description: 'Tốc độ -3, chính xác -5. Hay lúng túng.',
    is_negative: true,
  },
  {
    id: 'nong_nay', name: 'Nóng Nảy',
    rarity: TRAIT_RARITY.XAM, emoji: '😡',
    effects: { atk: 2, def: -3, tam_tinh: -10 },
    description: 'ATK +2 nhưng DEF -3, tâm tình -10. Nóng nảy mất kiểm soát.',
    is_negative: true,
  },
];

module.exports = {
  TRAIT_RARITY,
  tienThienTraits,
  list: tienThienTraits,

  getTraitById(id) {
    return tienThienTraits.find(t => t.id === id);
  },

  getByRarity(rarityId) {
    return tienThienTraits.filter(t => t.rarity.id === rarityId);
  },

  /**
   * Roll ngẫu nhiên 1-3 Tiên Thiên traits
   * Số lượng: 55% 1 trait, 30% 2 traits, 12% 3 traits, 3% 4 traits
   * Negative trait: 15% cơ hội thêm 1 negative trait
   */
  rollTraits() {
    const countRoll = Math.random() * 100;
    let count;
    if (countRoll < 55) count = 1;
    else if (countRoll < 85) count = 2;
    else if (countRoll < 97) count = 3;
    else count = 4;

    const positivePool = tienThienTraits.filter(t => !t.is_negative);
    const negativePool = tienThienTraits.filter(t => t.is_negative);
    const result = [];

    // Roll positive traits
    const pool = [...positivePool];
    for (let i = 0; i < count && pool.length > 0; i++) {
      const totalWeight = pool.reduce((sum, t) => sum + t.rarity.weight, 0);
      let roll = Math.random() * totalWeight;
      for (let j = 0; j < pool.length; j++) {
        roll -= pool[j].rarity.weight;
        if (roll <= 0) {
          result.push(pool[j]);
          pool.splice(j, 1);
          break;
        }
      }
    }

    // 15% chance to add a negative trait
    if (Math.random() < 0.15 && negativePool.length > 0) {
      const negIdx = Math.floor(Math.random() * negativePool.length);
      result.push(negativePool[negIdx]);
    }

    return result;
  },

  /**
   * Roll Ngộ Tính (50-200)
   * Phân bố: trung bình ~100, hiếm > 140
   */
  rollNgoTinh() {
    const u1 = Math.random();
    const u2 = Math.random();
    const gaussian = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const value = Math.round(100 + gaussian * 25);
    return Math.max(50, Math.min(200, value));
  },

  /**
   * Roll Vận Khí (50-150)
   * Phân bố: trung bình ~80, hiếm > 120
   */
  rollVanKhi() {
    const u1 = Math.random();
    const u2 = Math.random();
    const gaussian = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const value = Math.round(80 + gaussian * 20);
    return Math.max(50, Math.min(150, value));
  },
};
