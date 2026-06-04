/**
 * @file Nghịch Thiên Cải Mệnh (Passive Traits) Configuration — EXPANDED
 * @description ~100 traits thụ động, bám sát game Quỷ Cốc Bát Hoang
 *
 * Hệ thống:
 *   - Chain: VD Vũ Pháp Nhập Môn → Tiến Giai → Tinh Thông (upgrade thay thế)
 *   - Standalone: 1 slot mỗi trait
 *   - Slot mở khi đạt cảnh giới: slot 1 (Trúc Cơ), 2 (Kim Đan), 3 (Nguyên Anh),
 *     4 (Hóa Thần), 5 (Hợp Thể)
 *   - NTCM Vũ Hóa: Endgame, mở khi Hợp Thể+
 *   - NTCM Tông: Endgame meta, mở khi Hóa Thần+
 *   - NTCM Đạo Tâm: Gắn với đạo tâm cụ thể
 *
 * Chỉ số đã chỉnh cho phù hợp bot Discord (damage scale nhỏ hơn game gốc)
 */

const SLOT_UNLOCK = {
  1: { realm_order: 2, realm_name: 'Trúc Cơ' },
  2: { realm_order: 3, realm_name: 'Kim Đan' },
  3: { realm_order: 4, realm_name: 'Nguyên Anh' },
  4: { realm_order: 5, realm_name: 'Hóa Thần' },
  5: { realm_order: 7, realm_name: 'Hợp Thể' },
};

const nghichThienList = [
  // ╔═══════════════════════════════════════════════╗
  // ║  CHAIN: VŨ PHÁP (Giảm CD) — BẮT BUỘC        ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'vu_phap_nhap_mon', name: 'Vũ Pháp Nhập Môn',
    tier: 1, prerequisite: null, chain: 'vu_phap', rating: '7/10', emoji: '📘',
    dao_diem: 30,
    effect: { cooldown_reduction_all_percent: 15 },
    description: 'Giảm 15% CD tất cả kỹ năng. Nền tảng mọi build.',
  },
  {
    id: 'vu_phap_tien_giai', name: 'Vũ Pháp Tiến Giai',
    tier: 2, prerequisite: 'vu_phap_nhap_mon', chain: 'vu_phap', rating: '8/10', emoji: '📗',
    dao_diem: 60,
    effect: { cooldown_reduction_all_percent: 25 },
    replaces: 'vu_phap_nhap_mon',
    description: 'Giảm 25% CD. Nâng cấp từ Nhập Môn.',
  },
  {
    id: 'vu_phap_tinh_thong', name: 'Vũ Pháp Tinh Thông',
    tier: 3, prerequisite: 'vu_phap_tien_giai', chain: 'vu_phap', rating: '10/10', emoji: '📕',
    dao_diem: 100,
    effect: { cooldown_reduction_all_percent: 40 },
    replaces: 'vu_phap_tien_giai',
    description: 'Giảm 40% CD. BẮT BUỘC mọi build!',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  CHAIN: PHI KIẾM (Debuff random)              ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'tieu_ly_phi_kiem', name: 'Tiểu Lý Phi Kiếm',
    tier: 1, prerequisite: null, chain: 'phi_kiem', rating: '7/10', emoji: '🗡️',
    dao_diem: 40,
    effect: {
      extra_projectile: true,
      debuff_random: ['trung_doc','choang','giam_toc','thieu_dot','dong_bang','te_liet','hut_mau','day_lui','ton_linh_luc','troi_buoc','tram_mac'],
      debuff_chance: 30,
    },
    description: 'Phi kiếm bổ sung, 30% debuff ngẫu nhiên.',
  },
  {
    id: 'trung_ly_phi_kiem', name: 'Trung Lý Phi Kiếm',
    tier: 2, prerequisite: 'tieu_ly_phi_kiem', chain: 'phi_kiem', rating: '8/10', emoji: '🗡️✨',
    dao_diem: 80,
    effect: {
      extra_projectile: true,
      debuff_random: ['trung_doc','choang','giam_toc','thieu_dot','dong_bang','te_liet','hut_mau','day_lui','ton_linh_luc','troi_buoc','tram_mac'],
      debuff_chance: 50,
    },
    replaces: 'tieu_ly_phi_kiem',
    description: 'Phi kiếm mạnh hơn, 50% debuff ngẫu nhiên.',
  },
  {
    id: 'dai_ly_phi_kiem', name: 'Đại Lý Phi Kiếm',
    tier: 3, prerequisite: 'trung_ly_phi_kiem', chain: 'phi_kiem', rating: '10/10', emoji: '🗡️💎',
    dao_diem: 120,
    effect: {
      extra_projectile: true, extra_projectile_count: 2,
      debuff_random: ['trung_doc','choang','giam_toc','thieu_dot','dong_bang','te_liet','hut_mau','day_lui','ton_linh_luc','troi_buoc','tram_mac'],
      debuff_chance: 70,
    },
    replaces: 'trung_ly_phi_kiem',
    description: '2 phi kiếm, 70% debuff. Sát thần phi kiếm!',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  CHAIN: LINH CỘNG SINH (Extra cast)           ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'song_linh_cong_sinh', name: 'Song Linh Cộng Sinh',
    tier: 1, prerequisite: null, chain: 'linh_cong_sinh', rating: '8/10', emoji: '👥',
    dao_diem: 50,
    effect: { extra_cast_chance: 25, extra_cast_count: 1 },
    description: '25% bắn thêm 1 lần tuyệt kỹ/thần thông.',
  },
  {
    id: 'tam_linh_cong_sinh', name: 'Tam Linh Cộng Sinh',
    tier: 2, prerequisite: 'song_linh_cong_sinh', chain: 'linh_cong_sinh', rating: '9/10', emoji: '👥✨',
    dao_diem: 100,
    effect: { extra_cast_chance: 30, extra_cast_count: 2 },
    replaces: 'song_linh_cong_sinh',
    description: '30% bắn thêm 2 lần! Tam Linh hợp nhất!',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  CHAIN: YÊU THUẬT (Debuff duration)           ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'yeu_thuat_nhap_mon', name: 'Yêu Thuật Nhập Môn',
    tier: 1, prerequisite: null, chain: 'yeu_thuat', rating: '6/10', emoji: '🦊',
    dao_diem: 30,
    effect: { debuff_duration_percent: 30 },
    description: 'Debuff kéo dài +30%. Yêu thuật cơ bản.',
  },
  {
    id: 'yeu_thuat_tien_giai', name: 'Yêu Thuật Tiến Giai',
    tier: 2, prerequisite: 'yeu_thuat_nhap_mon', chain: 'yeu_thuat', rating: '7/10', emoji: '🦊✨',
    dao_diem: 60,
    effect: { debuff_duration_percent: 50, debuff_resist_reduction: 10 },
    replaces: 'yeu_thuat_nhap_mon',
    description: 'Debuff kéo dài +50%, giảm kháng debuff -10.',
  },
  {
    id: 'yeu_thuat_tinh_thong', name: 'Yêu Thuật Tinh Thông',
    tier: 3, prerequisite: 'yeu_thuat_tien_giai', chain: 'yeu_thuat', rating: '9/10', emoji: '🦊💎',
    dao_diem: 100,
    effect: { debuff_duration_percent: 80, debuff_resist_reduction: 20, extra_debuff_chance: 20 },
    replaces: 'yeu_thuat_tien_giai',
    description: 'Debuff +80%, giảm kháng -20, 20% thêm debuff phụ.',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  CHAIN: CÚC HOA (Tốc độ)                     ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'cuc_hoa_nang', name: 'Cúc Hoa Năng',
    tier: 1, prerequisite: null, chain: 'cuc_hoa', rating: '5/10', emoji: '🌼',
    dao_diem: 30,
    effect: { speed_percent: 25, charge_speed_percent: 20 },
    description: 'Tốc chạy +25%, tốc xông +20%. Chạy như Flash.',
  },
  {
    id: 'cuc_hoa_hong', name: 'Cúc Hoa Hồng',
    tier: 2, prerequisite: 'cuc_hoa_nang', chain: 'cuc_hoa', rating: '7/10', emoji: '🌸',
    dao_diem: 60,
    effect: { speed_percent: 40, charge_speed_percent: 35, dodge_chance: 5 },
    replaces: 'cuc_hoa_nang',
    description: 'Tốc chạy +40%, tốc xông +35%, né +5%.',
  },
  {
    id: 'cuc_hoa_tan', name: 'Cúc Hoa Tàn',
    tier: 3, prerequisite: 'cuc_hoa_hong', chain: 'cuc_hoa', rating: '8/10', emoji: '🥀',
    dao_diem: 100,
    effect: { speed_percent: 60, charge_speed_percent: 50, dodge_chance: 10, on_dodge_counter: true },
    replaces: 'cuc_hoa_hong',
    description: 'Tốc +60%, né +10%, phản đòn khi né thành công.',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  CHAIN: CÂN THÍ TRÙNG (Damage scale with HP) ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'tieu_can_thi_trung', name: 'Tiểu Cân Thí Trùng',
    tier: 1, prerequisite: null, chain: 'can_thi_trung', rating: '7/10', emoji: '🐛',
    dao_diem: 40,
    effect: { damage_scale_hp_percent: 5 },
    description: 'Sát thương +5% dựa trên HP mất đi. Càng thương càng mạnh.',
  },
  {
    id: 'trung_can_thi_trung', name: 'Trung Cân Thí Trùng',
    tier: 2, prerequisite: 'tieu_can_thi_trung', chain: 'can_thi_trung', rating: '8/10', emoji: '🐛✨',
    dao_diem: 80,
    effect: { damage_scale_hp_percent: 10, lifesteal_percent: 3 },
    replaces: 'tieu_can_thi_trung',
    description: 'Damage +10% theo HP mất, hút máu 3%.',
  },
  {
    id: 'dai_can_thi_trung', name: 'Đại Cân Thí Trùng',
    tier: 3, prerequisite: 'trung_can_thi_trung', chain: 'can_thi_trung', rating: '9/10', emoji: '🐛💎',
    dao_diem: 120,
    effect: { damage_scale_hp_percent: 15, lifesteal_percent: 5, berserk_threshold: 30 },
    replaces: 'trung_can_thi_trung',
    description: 'Damage +15% theo HP mất, hút 5%, dưới 30% HP cuồng sát (+25% ATK).',
  },
  {
    id: 'cung_thi_long', name: 'Cùng Thí Long',
    tier: 4, prerequisite: 'dai_can_thi_trung', chain: 'can_thi_trung', rating: '10/10', emoji: '🐲',
    dao_diem: 200,
    effect: { damage_scale_hp_percent: 20, lifesteal_percent: 8, berserk_threshold: 30, berserk_atk_percent: 40 },
    replaces: 'dai_can_thi_trung',
    description: 'Damage +20% theo HP, hút 8%, dưới 30% HP → +40% ATK. Rồng Tàn!',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  CHAIN: BẢO ĐÍCH THUẪN (Tank shield)          ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'tieu_bao_dich_thuan', name: 'Tiểu Bảo Đích Thuẫn',
    tier: 1, prerequisite: null, chain: 'bao_dich_thuan', rating: '6/10', emoji: '🛡️',
    dao_diem: 30,
    effect: { shield_percent: 10, taunt_chance: 20 },
    description: 'Hấp thụ 10% damage cho đồng đội, 20% thu hút aggro.',
  },
  {
    id: 'trung_bao_dich_thuan', name: 'Trung Bảo Đích Thuẫn',
    tier: 2, prerequisite: 'tieu_bao_dich_thuan', chain: 'bao_dich_thuan', rating: '7/10', emoji: '🛡️✨',
    dao_diem: 60,
    effect: { shield_percent: 20, taunt_chance: 40, def_bonus: 10 },
    replaces: 'tieu_bao_dich_thuan',
    description: 'Hấp thụ 20% damage, aggro 40%, DEF +10.',
  },
  {
    id: 'dai_bao_dich_thuan', name: 'Đại Bảo Đích Thuẫn',
    tier: 3, prerequisite: 'trung_bao_dich_thuan', chain: 'bao_dich_thuan', rating: '9/10', emoji: '🛡️💎',
    dao_diem: 100,
    effect: { shield_percent: 30, taunt_chance: 60, def_bonus: 20, reflect_percent: 10 },
    replaces: 'trung_bao_dich_thuan',
    description: 'Hấp thụ 30%, aggro 60%, DEF +20, phản 10% damage.',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  CHAIN: QUỶ TU (Ma Đạo exclusive)             ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'quy_tu_nhap_mon', name: 'Quỷ Tu Nhập Môn',
    tier: 1, prerequisite: null, chain: 'quy_tu', rating: '7/10', emoji: '👻',
    dao_diem: 40, dao_path: 'ma',
    effect: { atk_percent: 8, damage_taken_percent: 5 },
    description: 'ATK +8%, nhận thêm 5% damage. Con đường ma đạo.',
  },
  {
    id: 'quy_tu_tien_giai', name: 'Quỷ Tu Tiến Giai',
    tier: 2, prerequisite: 'quy_tu_nhap_mon', chain: 'quy_tu', rating: '8/10', emoji: '👻✨',
    dao_diem: 80, dao_path: 'ma',
    effect: { atk_percent: 15, damage_taken_percent: 8, lifesteal_percent: 3 },
    replaces: 'quy_tu_nhap_mon',
    description: 'ATK +15%, nhận thêm 8% damage, hút máu 3%.',
  },
  {
    id: 'quy_tu_tinh_thong', name: 'Quỷ Tu Tinh Thông',
    tier: 3, prerequisite: 'quy_tu_tien_giai', chain: 'quy_tu', rating: '10/10', emoji: '👻💎',
    dao_diem: 150, dao_path: 'ma',
    effect: { atk_percent: 25, damage_taken_percent: 10, lifesteal_percent: 6, fear_chance: 15 },
    replaces: 'quy_tu_tien_giai',
    description: 'ATK +25%, nhận +10%, hút máu 6%, 15% gây sợ hãi.',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  CHAIN: HUYẾT MA (Bạo kích)                   ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'huyet_ma', name: 'Huyết Ma',
    tier: 1, prerequisite: null, chain: 'huyet_sat', rating: '7/10', emoji: '🩸',
    dao_diem: 40,
    effect: { crit_rate: 8, crit_damage: 15 },
    description: 'Bạo kích +8%, sát thương bạo kích +15%.',
  },
  {
    id: 'huyet_sat', name: 'Huyết Sát',
    tier: 2, prerequisite: 'huyet_ma', chain: 'huyet_sat', rating: '9/10', emoji: '🩸✨',
    dao_diem: 80,
    effect: { crit_rate: 15, crit_damage: 30, on_crit_bleed: true },
    replaces: 'huyet_ma',
    description: 'Bạo kích +15%, damage +30%, bạo kích gây chảy máu.',
  },
  {
    id: 'huyet_yem', name: 'Huyết Yểm',
    tier: 3, prerequisite: 'huyet_sat', chain: 'huyet_sat', rating: '10/10', emoji: '🩸💎',
    dao_diem: 150,
    effect: { crit_rate: 25, crit_damage: 50, on_crit_bleed: true, bleed_lifesteal: 5 },
    replaces: 'huyet_sat',
    description: 'Bạo kích +25%, damage +50%, chảy máu + hút máu.',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  CHAIN: THUẪN LINH (Shield support)           ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'thuan_linh_nhap_mon', name: 'Thuẫn Linh Nhập Môn',
    tier: 1, prerequisite: null, chain: 'thuan_linh', rating: '5/10', emoji: '🛡️',
    dao_diem: 30,
    effect: { shield_block: true, shield_hp_percent: 15, shield_duration_turns: 3 },
    description: 'Tạo khiên hấp thụ 15% HP max, kéo dài 3 lượt.',
  },
  {
    id: 'thuan_linh_tien_giai', name: 'Thuẫn Linh Tiến Giai',
    tier: 2, prerequisite: 'thuan_linh_nhap_mon', chain: 'thuan_linh', rating: '7/10', emoji: '🛡️✨',
    dao_diem: 60,
    effect: { shield_block: true, shield_hp_percent: 25, shield_duration_turns: 4, shield_heal_on_break: 10 },
    replaces: 'thuan_linh_nhap_mon',
    description: 'Khiên 25% HP, 4 lượt, vỡ hồi 10% HP.',
  },
  {
    id: 'thuan_linh_tinh_thong', name: 'Thuẫn Linh Tinh Thông',
    tier: 3, prerequisite: 'thuan_linh_tien_giai', chain: 'thuan_linh', rating: '8/10', emoji: '🛡️💎',
    dao_diem: 100,
    effect: { shield_block: true, shield_hp_percent: 40, shield_duration_turns: 5, shield_heal_on_break: 20, reflect_on_shield: 15 },
    replaces: 'thuan_linh_tien_giai',
    description: 'Khiên 40% HP, 5 lượt, vỡ hồi 20%, phản 15%.',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  CHAIN: KIM THIỀN (Miễn tử)                   ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'kim_thien_vo_anh', name: 'Kim Thiền Vô Ảnh',
    tier: 1, prerequisite: null, chain: 'kim_thien', rating: '5/10', emoji: '🦗',
    dao_diem: 30,
    effect: { revive_once: true, revive_hp_percent: 25 },
    description: 'Miễn tử 1 lần, hồi 25% HP.',
  },
  {
    id: 'kim_thien_gia_anh', name: 'Kim Thiền Giả Ảnh',
    tier: 2, prerequisite: 'kim_thien_vo_anh', chain: 'kim_thien', rating: '7/10', emoji: '🦗✨',
    dao_diem: 60,
    effect: { revive_once: true, revive_hp_percent: 40, on_revive_buff: { atk_percent: 15, speed_percent: 20 } },
    replaces: 'kim_thien_vo_anh',
    description: 'Miễn tử + hồi 40% HP + buff tạm ATK/Speed.',
  },
  {
    id: 'kim_thien_huyet_anh', name: 'Kim Thiền Huyết Ảnh',
    tier: 3, prerequisite: 'kim_thien_gia_anh', chain: 'kim_thien', rating: '9/10', emoji: '🦗💎',
    dao_diem: 100,
    effect: { revive_once: true, revive_hp_percent: 60, on_revive_buff: { atk_percent: 25, speed_percent: 30 }, revive_aoe_damage: 20 },
    replaces: 'kim_thien_gia_anh',
    description: 'Miễn tử + hồi 60% HP + buff mạnh + AOE damage khi hồi sinh.',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  CHAIN: LINH PHÁP (Mana efficiency)           ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'linh_phap_nhap_mon', name: 'Linh Pháp Nhập Môn',
    tier: 1, prerequisite: null, chain: 'linh_phap', rating: '6/10', emoji: '🔮',
    dao_diem: 30,
    effect: { mana_cost_reduction_percent: 15, mana_regen_per_turn: 3 },
    description: 'Giảm 15% mana, hồi 3 mana/lượt.',
  },
  {
    id: 'linh_phap_tien_giai', name: 'Linh Pháp Tiến Giai',
    tier: 2, prerequisite: 'linh_phap_nhap_mon', chain: 'linh_phap', rating: '8/10', emoji: '🔮✨',
    dao_diem: 60,
    effect: { mana_cost_reduction_percent: 25, mana_regen_per_turn: 6, spell_power_percent: 8 },
    replaces: 'linh_phap_nhap_mon',
    description: 'Giảm 25% mana, hồi 6/lượt, pháp thuật +8%.',
  },
  {
    id: 'linh_phap_tinh_thong', name: 'Linh Pháp Tinh Thông',
    tier: 3, prerequisite: 'linh_phap_tien_giai', chain: 'linh_phap', rating: '9/10', emoji: '🔮💎',
    dao_diem: 100,
    effect: { mana_cost_reduction_percent: 40, mana_regen_per_turn: 10, spell_power_percent: 15, overload_at_max_mana: true },
    replaces: 'linh_phap_tien_giai',
    description: 'Giảm 40% mana, hồi 10/lượt, +15% pháp lực, mana đầy +20% damage.',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  CHAIN: HUYẾT LINH (HP regen)                 ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'huyet_linh_nhap_mon', name: 'Huyết Linh Nhập Môn',
    tier: 1, prerequisite: null, chain: 'huyet_linh', rating: '6/10', emoji: '❤️',
    dao_diem: 30,
    effect: { hp_regen_percent_per_turn: 2, max_hp_percent: 5 },
    description: 'Hồi 2% HP/lượt, HP tối đa +5%.',
  },
  {
    id: 'huyet_linh_tien_giai', name: 'Huyết Linh Tiến Giai',
    tier: 2, prerequisite: 'huyet_linh_nhap_mon', chain: 'huyet_linh', rating: '7/10', emoji: '❤️✨',
    dao_diem: 60,
    effect: { hp_regen_percent_per_turn: 4, max_hp_percent: 10, damage_reduction_percent: 3 },
    replaces: 'huyet_linh_nhap_mon',
    description: 'Hồi 4% HP/lượt, HP +10%, giảm thương 3%.',
  },
  {
    id: 'huyet_linh_tinh_thong', name: 'Huyết Linh Tinh Thông',
    tier: 3, prerequisite: 'huyet_linh_tien_giai', chain: 'huyet_linh', rating: '9/10', emoji: '❤️💎',
    dao_diem: 100,
    effect: { hp_regen_percent_per_turn: 6, max_hp_percent: 20, damage_reduction_percent: 6, emergency_heal: { threshold: 20, heal_percent: 15 } },
    replaces: 'huyet_linh_tien_giai',
    description: 'Hồi 6% HP/lượt, HP +20%, giảm thương 6%, dưới 20% HP hồi 15%.',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  CHAIN: KIẾM LINH (Kiếm passive)              ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'kiem_linh', name: 'Kiếm Linh',
    tier: 1, prerequisite: null, chain: 'kiem_linh_chain', rating: '9/10', emoji: '🗡️💎',
    dao_diem: 50,
    effect: { kiem_linh_passive: true, extra_damage_percent: 15, mana_regen_on_hit: 3 },
    description: 'Kiếm Linh: mỗi đòn +15% damage, hồi 3 mana.',
  },
  {
    id: 'kiem_linh_tinh_thong', name: 'Kiếm Linh Tinh Thông',
    tier: 2, prerequisite: 'kiem_linh', chain: 'kiem_linh_chain', rating: '10/10', emoji: '🗡️💎✨',
    dao_diem: 100,
    effect: { kiem_linh_passive: true, extra_damage_percent: 30, mana_regen_on_hit: 6, kiem_linh_summon: true },
    replaces: 'kiem_linh',
    description: 'Kiếm Linh +30% damage, hồi 6 mana/đòn, triệu hồi kiếm linh!',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  CHAIN: HỒNG TRẦN KIẾM HẠP (Hit counter)     ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'hong_tran_kiem_hap', name: 'Hồng Trần Kiếm Hạp',
    tier: 1, prerequisite: null, chain: 'kiem_hap', rating: '6/10', emoji: '🌹⚔️',
    dao_diem: 40,
    effect: { on_hit_threshold: 10, bonus_damage_on_trigger_percent: 30 },
    description: 'Mỗi 10 hit → bonus 30% damage.',
  },
  {
    id: 'hong_tran_kiem_hap_2', name: 'Hồng Trần Kiếm Hạp II',
    tier: 2, prerequisite: 'hong_tran_kiem_hap', chain: 'kiem_hap', rating: '10/10', emoji: '🌹⚔️✨',
    dao_diem: 100,
    effect: { on_hit_threshold: 8, bonus_damage_on_trigger_percent: 80 },
    replaces: 'hong_tran_kiem_hap',
    description: 'Mỗi 8 hit → bonus 80% damage! Sát thương khủng!',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  CHAIN: HUYẾT TẾ (Sacrifice HP for power)     ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'huyet_te_nhap_mon', name: 'Huyết Tế Nhập Môn',
    tier: 1, prerequisite: null, chain: 'huyet_te', rating: '6/10', emoji: '🩸⚡',
    dao_diem: 40,
    effect: { sacrifice_hp_percent: 5, bonus_atk_percent: 12 },
    description: 'Mỗi lượt mất 5% HP, ATK +12%.',
  },
  {
    id: 'huyet_te_tien_giai', name: 'Huyết Tế Tiến Giai',
    tier: 2, prerequisite: 'huyet_te_nhap_mon', chain: 'huyet_te', rating: '8/10', emoji: '🩸⚡✨',
    dao_diem: 80,
    effect: { sacrifice_hp_percent: 8, bonus_atk_percent: 20, bonus_crit_rate: 5 },
    replaces: 'huyet_te_nhap_mon',
    description: 'Mỗi lượt mất 8% HP, ATK +20%, bạo kích +5%.',
  },
  {
    id: 'huyet_te_tinh_thong', name: 'Huyết Tế Tinh Thông',
    tier: 3, prerequisite: 'huyet_te_tien_giai', chain: 'huyet_te', rating: '10/10', emoji: '🩸⚡💎',
    dao_diem: 120,
    effect: { sacrifice_hp_percent: 10, bonus_atk_percent: 35, bonus_crit_rate: 10, execute_threshold: 15 },
    replaces: 'huyet_te_tien_giai',
    description: 'Mất 10% HP/lượt, ATK +35%, bạo kích +10%, hạ thủ khi dưới 15% HP.',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  CHAIN: LINH NĂNG (Elemental power)           ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'linh_nang_chi_vu', name: 'Linh Năng Chi Vũ',
    tier: 1, prerequisite: null, chain: 'linh_nang', rating: '6/10', emoji: '🌧️',
    dao_diem: 30,
    effect: { elemental_damage_percent: 10 },
    description: 'Sát thương nguyên tố +10%.',
  },
  {
    id: 'linh_nang_chi_tuyen', name: 'Linh Năng Chi Tuyền',
    tier: 2, prerequisite: 'linh_nang_chi_vu', chain: 'linh_nang', rating: '8/10', emoji: '⛲',
    dao_diem: 60,
    effect: { elemental_damage_percent: 20, elemental_resist_percent: 10 },
    replaces: 'linh_nang_chi_vu',
    description: 'Sát thương nguyên tố +20%, kháng nguyên tố +10%.',
  },
  {
    id: 'linh_nang_chi_trieu', name: 'Linh Năng Chi Triều',
    tier: 3, prerequisite: 'linh_nang_chi_tuyen', chain: 'linh_nang', rating: '10/10', emoji: '🌊',
    dao_diem: 100,
    effect: { elemental_damage_percent: 35, elemental_resist_percent: 20, elemental_penetration: 15 },
    replaces: 'linh_nang_chi_tuyen',
    description: 'Nguyên tố +35%, kháng +20%, xuyên kháng 15%.',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  STANDALONE TRAITS — COMBAT                   ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'binh_nhan_chuyen_tinh', name: 'Binh Nhận Chuyên Tinh',
    tier: 1, prerequisite: null, chain: null, rating: '9/10', emoji: '⚔️',
    dao_diem: 80,
    effect: { ignore_weapon_restriction_than_thong: true },
    description: 'Dùng Thần Thông Đao/Kiếm/Thương không cần vũ khí.',
  },
  {
    id: 'lao_nhi_kien_di', name: 'Lão Nhi Kiên Di',
    tier: 1, prerequisite: null, chain: null, rating: '6/10', emoji: '🧓',
    dao_diem: 30,
    effect: { def_per_age: 1 },
    description: 'Mỗi tuổi = +1 DEF. Càng già càng trâu.',
  },
  {
    id: 'thuy_luc_tu_xa', name: 'Thủy Lực Tứ Xạ',
    tier: 1, prerequisite: null, chain: null, rating: '8/10', emoji: '💧💥',
    dao_diem: 60,
    effect: { water_splash: true, splash_damage_percent: 20, splash_trigger_chance: 40 },
    description: 'Tốc cao → 40% kích thủy lực, 20% splash damage.',
  },
  {
    id: 'hoa_luc_tu_xa', name: 'Hỏa Lực Tứ Xạ',
    tier: 1, prerequisite: null, chain: null, rating: '8/10', emoji: '🔥💥',
    dao_diem: 60,
    effect: { fire_splash: true, splash_damage_percent: 25, splash_trigger_chance: 35, burn_chance: 20 },
    description: '35% kích hỏa lực, 25% splash, 20% đốt cháy.',
  },
  {
    id: 'loi_luc_tu_xa', name: 'Lôi Lực Tứ Xạ',
    tier: 1, prerequisite: null, chain: null, rating: '9/10', emoji: '⚡💥',
    dao_diem: 80,
    effect: { lightning_splash: true, splash_damage_percent: 30, splash_trigger_chance: 30, stun_chance: 15 },
    description: '30% kích lôi lực, 30% splash, 15% choáng.',
  },
  {
    id: 'phong_luc_tu_xa', name: 'Phong Lực Tứ Xạ',
    tier: 1, prerequisite: null, chain: null, rating: '7/10', emoji: '🌪️💥',
    dao_diem: 50,
    effect: { wind_splash: true, splash_damage_percent: 15, splash_trigger_chance: 50, speed_debuff: 10 },
    description: '50% kích phong lực, 15% splash, giảm tốc đối phương.',
  },
  {
    id: 'moc_luc_tu_xa', name: 'Mộc Lực Tứ Xạ',
    tier: 1, prerequisite: null, chain: null, rating: '7/10', emoji: '🌿💥',
    dao_diem: 50,
    effect: { wood_splash: true, splash_damage_percent: 15, splash_trigger_chance: 45, heal_on_splash: 5 },
    description: '45% kích mộc lực, 15% splash, hồi 5% HP mỗi kích.',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  STANDALONE TRAITS — UTILITY/SPECIAL          ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'hoang_can_thien_su', name: 'Hoàng Cân Thiên Sư',
    tier: 1, prerequisite: null, chain: null, rating: '7/10', emoji: '📿',
    dao_diem: 50,
    effect: { summon_hp_percent: 30, summon_atk_percent: 15 },
    description: 'Triệu hoán vật HP +30%, ATK +15%.',
  },
  {
    id: 'mi_cot', name: 'Mị Cốt',
    tier: 1, prerequisite: null, chain: null, rating: '6/10', emoji: '💋',
    dao_diem: 40,
    effect: { charm_chance: 15, charm_duration: 2 },
    description: '15% mê hoặc đối phương 2 lượt (không hành động).',
  },
  {
    id: 'sat_khi', name: 'Sát Khí',
    tier: 1, prerequisite: null, chain: null, rating: '8/10', emoji: '💀',
    dao_diem: 60,
    effect: { atk_percent: 10, crit_damage: 20, intimidate: 10 },
    description: 'ATK +10%, bạo kích damage +20%, hù dọa giảm DEF -10.',
  },
  {
    id: 'song_tu_dai_phap', name: 'Song Tu Đại Pháp',
    tier: 1, prerequisite: null, chain: null, rating: '7/10', emoji: '💑',
    dao_diem: 50,
    effect: { dual_cultivation_bonus: true, exp_bonus_with_partner: 30, stats_share_percent: 10 },
    description: 'Song tu: tu luyện cùng người khác +30% EXP, chia 10% stats.',
  },
  {
    id: 'tien_thu_hau_cong', name: 'Tiên Thụ Hậu Công',
    tier: 1, prerequisite: null, chain: null, rating: '7/10', emoji: '🐢⚔️',
    dao_diem: 50,
    effect: { first_3_turns_def_percent: 50, after_3_turns_atk_percent: 20 },
    description: '3 lượt đầu DEF +50%, sau đó ATK +20%. Thụ trước công sau.',
  },
  {
    id: 'hoa_vat', name: 'Hóa Vật',
    tier: 1, prerequisite: null, chain: null, rating: '5/10', emoji: '🦎',
    dao_diem: 30,
    effect: { transform_chance: 5, transform_stats_percent: 50 },
    description: '5% biến hình, tăng 50% toàn bộ stats 3 lượt.',
  },
  {
    id: 'tuy_tam_nhi_ngu', name: 'Tùy Tâm Nhi Ngự',
    tier: 1, prerequisite: null, chain: null, rating: '8/10', emoji: '🎯',
    dao_diem: 60,
    effect: { accuracy: 30, auto_target_weakness: true },
    description: 'Chính xác +30, tự động nhắm điểm yếu.',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  NTCM VŨ HÓA — ENDGAME (Hợp Thể+)           ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'dia_yem_quy_tram', name: 'Địa Yểm Quỷ Trảm',
    tier: 1, prerequisite: null, chain: null, rating: '10/10', emoji: '⛧',
    dao_diem: 500, min_realm: 7,
    category: 'vu_hoa',
    effect: { aoe_damage_percent: 30, aoe_radius: 2, execute_under_percent: 20, fear_on_kill: true },
    description: 'AOE +30%, hạ thủ dưới 20% HP, giết gây sợ hãi vùng.',
  },
  {
    id: 'thien_vu_phong_sat', name: 'Thiên Vũ Phong Sát',
    tier: 1, prerequisite: null, chain: null, rating: '10/10', emoji: '🌪️⚡',
    dao_diem: 500, min_realm: 7,
    category: 'vu_hoa',
    effect: { multi_hit: 5, multi_hit_damage_percent: 60, wind_resistance_ignore: 30 },
    description: '5 đòn liên hoàn, mỗi đòn 60% damage, xuyên kháng gió 30%.',
  },
  {
    id: 'vi_nhan_vi_ky', name: 'Vi Nhân Vi Kỷ',
    tier: 1, prerequisite: null, chain: null, rating: '10/10', emoji: '🎭',
    dao_diem: 500, min_realm: 7,
    category: 'vu_hoa',
    effect: { copy_enemy_buff: true, steal_buff_chance: 40, all_stats_percent: 5 },
    description: 'Copy buff địch, 40% cướp buff, toàn stats +5%.',
  },
  {
    id: 'bac_minh_phi_suong', name: 'Bắc Minh Phi Sương',
    tier: 1, prerequisite: null, chain: null, rating: '10/10', emoji: '❄️🐟',
    dao_diem: 500, min_realm: 7,
    category: 'vu_hoa',
    effect: { mana_absorb_percent: 20, damage_from_mana: true, ice_field: { slow_percent: 30, duration: 3 } },
    description: 'Hút 20% mana địch, damage từ mana, trường băng giảm tốc.',
  },
  {
    id: 'yen_la_huyen_chuong', name: 'Yên La Huyễn Chướng',
    tier: 1, prerequisite: null, chain: null, rating: '10/10', emoji: '🌫️',
    dao_diem: 500, min_realm: 7,
    category: 'vu_hoa',
    effect: { illusion_field: true, miss_chance_in_field: 30, confusion_chance: 20 },
    description: 'Trường huyễn: 30% miss, 20% hoang mang (tự đánh mình).',
  },
  {
    id: 'than_hoa_thien_tinh', name: 'Thần Hỏa Thiên Tinh',
    tier: 1, prerequisite: null, chain: null, rating: '10/10', emoji: '🔥⭐',
    dao_diem: 500, min_realm: 7,
    category: 'vu_hoa',
    effect: { fire_damage_percent: 40, burn_all_on_hit: true, burn_damage_per_turn: 8 },
    description: 'Hỏa pháp +40%, mỗi đòn đốt cháy, cháy 8%/lượt.',
  },
  {
    id: 'than_tieu_tinh_tran', name: 'Thần Tiêu Tịnh Trần',
    tier: 1, prerequisite: null, chain: null, rating: '10/10', emoji: '✨🧹',
    dao_diem: 500, min_realm: 7,
    category: 'vu_hoa',
    effect: { purify_all_debuff: true, purify_cooldown: 3, heal_on_purify_percent: 10 },
    description: 'Xóa tất cả debuff mỗi 3 lượt, hồi 10% HP khi xóa.',
  },
  {
    id: 'hao_viem_chuoc_nhat', name: 'Hào Viêm Chước Nhật',
    tier: 1, prerequisite: null, chain: null, rating: '10/10', emoji: '☀️🔥',
    dao_diem: 500, min_realm: 7,
    category: 'vu_hoa',
    effect: { sun_damage_scaling: true, atk_increase_per_turn: 3, max_atk_bonus: 50 },
    description: 'Mỗi lượt ATK +3% (tối đa +50%). Càng đánh càng mạnh.',
  },
  {
    id: 'chuong_noi_can_khon', name: 'Chưởng Nội Càn Khôn',
    tier: 1, prerequisite: null, chain: null, rating: '10/10', emoji: '🌍✋',
    dao_diem: 1000, min_realm: 7,
    category: 'vu_hoa',
    effect: { gravity_field: true, enemy_speed_reduction: 50, enemy_dodge_reduction: 30, crush_damage_per_turn: 5 },
    description: 'Trường trọng lực: giảm tốc 50%, giảm né 30%, nghiền 5%/lượt.',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  NTCM TÔNG — META ENDGAME (Hóa Thần+)        ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'dap_tuyet_vo_ngan', name: 'Đạp Tuyết Vô Ngân',
    tier: 1, prerequisite: null, chain: null, rating: '10/10', emoji: '❄️👣',
    dao_diem: 300, min_realm: 5,
    category: 'tong',
    effect: { stealth_after_skill: true, stealth_duration: 1, first_hit_from_stealth_percent: 50 },
    description: 'Dùng kỹ năng → tàng hình 1 lượt, đòn đầu +50% damage.',
  },
  {
    id: 'xuyen_van_dien_thiem', name: 'Xuyên Vân Điện Thiểm',
    tier: 1, prerequisite: null, chain: null, rating: '10/10', emoji: '⚡☁️',
    dao_diem: 300, min_realm: 5,
    category: 'tong',
    effect: { guaranteed_first_strike: true, first_strike_crit: true, speed_percent: 30 },
    description: 'Luôn đánh trước, đòn đầu bạo kích, tốc +30%.',
  },
  {
    id: 'ho_phach_long_hon', name: 'Hổ Phách Long Hồn',
    tier: 1, prerequisite: null, chain: null, rating: '10/10', emoji: '🐉💎',
    dao_diem: 300, min_realm: 5,
    category: 'tong',
    effect: { dragon_soul: true, all_stats_percent: 8, immune_to_fear: true, roar_stun_chance: 20 },
    description: 'Hồn Long: +8% toàn stats, miễn sợ hãi, 20% gầm choáng.',
  },
  {
    id: 'nhat_kiem_khinh_hong', name: 'Nhất Kiếm Khinh Hồng',
    tier: 1, prerequisite: null, chain: null, rating: '10/10', emoji: '🗡️🌈',
    dao_diem: 300, min_realm: 5,
    category: 'tong',
    effect: { sword_mastery_ultimate: true, kiem_damage_percent: 40, ignore_def_percent: 20 },
    description: 'Kiếm pháp tối thượng: +40% damage kiếm, xuyên 20% DEF.',
  },
  {
    id: 'bach_bo_sat_than', name: 'Bách Bộ Sát Thần',
    tier: 1, prerequisite: null, chain: null, rating: '9/10', emoji: '👁️‍🗨️',
    dao_diem: 200, min_realm: 5,
    category: 'tong',
    effect: { sniper_mode: true, range_percent: 50, damage_at_max_range_percent: 30 },
    description: 'Tầm xa +50%, tầm xa max +30% damage. Bắn tỉa thần sầu.',
  },
  {
    id: 'van_kiep_bat_diet', name: 'Vạn Kiếp Bất Diệt',
    tier: 1, prerequisite: null, chain: null, rating: '10/10', emoji: '♾️🛡️',
    dao_diem: 300, min_realm: 5,
    category: 'tong',
    effect: { revive_count: 2, revive_hp_percent: 30, damage_reduction_after_revive: 20 },
    description: 'Miễn tử 2 lần, hồi 30% HP, sau hồi sinh giảm thương 20%.',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  NTCM ĐẠO TÂM — Gắn với Đạo Tâm cụ thể      ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'phong_khoi_linh_dong', name: 'Phong Khởi Linh Động',
    tier: 1, prerequisite: null, chain: null, rating: '8/10', emoji: '🌬️⚡',
    dao_diem: 100,
    dao_tam_required: ['bat_tuc', 'vo_dinh'],
    effect: { speed_percent: 15, dodge_percent: 8, wind_damage_percent: 15 },
    description: 'Tốc +15%, né +8%, phong pháp +15%. (Đạo tâm: Bất Tức/Vô Định)',
  },
  {
    id: 'kim_cham_thu_huyet', name: 'Kim Châm Thứ Huyệt',
    tier: 1, prerequisite: null, chain: null, rating: '8/10', emoji: '💉',
    dao_diem: 100,
    dao_tam_required: ['tuan_thien', 'bach_hieu'],
    effect: { accuracy: 20, crit_rate: 10, bleed_on_crit: true },
    description: 'Chính xác +20, bạo kích +10%, bạo kích gây chảy máu. (Đạo tâm: Tuần Thiên/Bách Hiểu)',
  },
  {
    id: 'thau_the_hoa_kinh', name: 'Thấu Thể Hóa Kình',
    tier: 1, prerequisite: null, chain: null, rating: '9/10', emoji: '💫',
    dao_diem: 100,
    dao_tam_required: ['truong_hang', 'te_ngu'],
    effect: { armor_penetration_percent: 15, true_damage_percent: 10 },
    description: 'Xuyên giáp 15%, 10% damage thực (bỏ qua DEF). (Đạo tâm: Trường Hằng/Tể Ngự)',
  },
  {
    id: 'thanh_khau_chi_chu', name: 'Thanh Khẩu Chi Chú',
    tier: 1, prerequisite: null, chain: null, rating: '7/10', emoji: '📜',
    dao_diem: 80,
    dao_tam_required: ['tu_tinh'],
    effect: { spell_power_percent: 15, cooldown_reduction_percent: 5, mana_cost_reduction_percent: 10 },
    description: 'Pháp lực +15%, CD -5%, mana -10%. (Đạo tâm: Tu Tỉnh)',
  },
  {
    id: 'viem_hoa_cuong_liep', name: 'Viêm Hỏa Cuồng Liệt',
    tier: 1, prerequisite: null, chain: null, rating: '8/10', emoji: '🔥',
    dao_diem: 100,
    dao_tam_required: ['van_tuong', 'phuc_sinh'],
    effect: { fire_damage_percent: 25, burn_chance: 30, burn_damage: 5 },
    description: 'Hỏa pháp +25%, 30% đốt cháy, cháy 5%/lượt. (Đạo tâm: Vạn Tượng/Phúc Sinh)',
  },
  {
    id: 'thien_loi_cuon_cuon', name: 'Thiên Lôi Cuồn Cuộn',
    tier: 1, prerequisite: null, chain: null, rating: '9/10', emoji: '⚡',
    dao_diem: 120,
    dao_tam_required: ['ke_minh'],
    effect: { lightning_damage_percent: 30, chain_lightning: true, chain_count: 2 },
    description: 'Lôi pháp +30%, sét dây chuyền nhảy 2 mục tiêu. (Đạo tâm: Kế Minh)',
  },
  {
    id: 'hau_duc_tai_vat', name: 'Hậu Đức Tải Vật',
    tier: 1, prerequisite: null, chain: null, rating: '7/10', emoji: '🌍',
    dao_diem: 80,
    dao_tam_required: ['kho_nhien'],
    effect: { def_percent: 10, hp_percent: 10, earth_damage_percent: 15 },
    description: 'DEF +10%, HP +10%, thổ pháp +15%. (Đạo tâm: Khô Nhiên)',
  },
  {
    id: 'quy_kinh_phan_nguyen', name: 'Quy Kình Phản Nguyên',
    tier: 1, prerequisite: null, chain: null, rating: '8/10', emoji: '🐢✨',
    dao_diem: 100,
    dao_tam_required: ['thuong_thien'],
    effect: { damage_reflection_percent: 15, damage_reduction_percent: 8 },
    description: 'Phản 15% damage, giảm thương 8%. (Đạo tâm: Thượng Thiện)',
  },
  {
    id: 'huyen_ho_te_the', name: 'Huyền Hồ Tế Thế',
    tier: 1, prerequisite: null, chain: null, rating: '7/10', emoji: '🏥',
    dao_diem: 80,
    dao_tam_required: ['quy_tang'],
    effect: { heal_power_percent: 25, heal_over_time: 3 },
    description: 'Hiệu quả hồi phục +25%, hồi dần 3%/lượt. (Đạo tâm: Quy Tàng)',
  },
  {
    id: 'truy_anh_ky_hoan', name: 'Truy Ảnh Kỳ Hoán',
    tier: 1, prerequisite: null, chain: null, rating: '8/10', emoji: '👤💨',
    dao_diem: 100,
    dao_tam_required: ['chi_du'],
    effect: { teleport_chance: 15, dodge_counter_damage: 20 },
    description: '15% dịch chuyển né đòn, phản đòn 20% damage. (Đạo tâm: Chỉ Du)',
  },
  {
    id: 'phu_sinh_phao_anh', name: 'Phù Sinh Phào Ảnh',
    tier: 1, prerequisite: null, chain: null, rating: '8/10', emoji: '🫧',
    dao_diem: 100,
    dao_tam_required: ['hoa_ngai'],
    effect: { bubble_shield: true, shield_absorb_percent: 20, shield_explode_damage: 15 },
    description: 'Khiên bọt hấp thụ 20% damage, vỡ gây 15% damage. (Đạo tâm: Hóa Ngại)',
  },
  {
    id: 'dai_mac_cuong_dao', name: 'Đại Mạc Cuồng Đao',
    tier: 1, prerequisite: null, chain: null, rating: '9/10', emoji: '🏜️🔪',
    dao_diem: 120,
    dao_tam_required: ['vo_cuu'],
    effect: { dao_damage_percent: 25, cleave_chance: 30, cleave_damage_percent: 40 },
    description: 'Đao pháp +25%, 30% chém quạt 40% damage. (Đạo tâm: Vô Cữu)',
  },
  {
    id: 'that_tinh_kiem_boc', name: 'Thất Tình Kiếm Bộc',
    tier: 1, prerequisite: null, chain: null, rating: '10/10', emoji: '🗡️💜',
    dao_diem: 200,
    dao_tam_required: ['thien_co', 'quy_nhat'],
    effect: { seven_emotions_sword: true, emotion_stacks: true, max_stacks: 7, damage_per_stack: 5 },
    description: 'Thất Tình Kiếm: cộng dồn 7 cảm xúc, mỗi stack +5% damage. (Đạo tâm: Thiên Cơ/Quy Nhất)',
  },
  {
    id: 'minh_ha_chi_chu', name: 'Minh Hà Chi Chú',
    tier: 1, prerequisite: null, chain: null, rating: '10/10', emoji: '🌑🔮',
    dao_diem: 200,
    dao_tam_required: ['thien_co', 'quy_nhat'],
    effect: { dark_curse: true, curse_atk_reduction: 15, curse_def_reduction: 10, curse_speed_reduction: 10 },
    description: 'Nguyền rủa: giảm ATK/DEF/Speed địch. (Đạo tâm: Thiên Cơ/Quy Nhất)',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  NTCM ĐẶC THÙ (Quest/NPC)                    ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'hoa_uan', name: 'Hoa Uẩn',
    tier: 1, prerequisite: null, chain: null, rating: '8/10', emoji: '🌺',
    dao_diem: 100,
    category: 'quest',
    effect: { poison_immune: true, poison_damage_to_enemy: 5, nature_affinity: 20 },
    description: 'Miễn độc, mỗi lượt gây độc 5% cho địch. (Quest đặc biệt)',
  },
  {
    id: 'bich_nhi', name: 'Bích Nhị',
    tier: 1, prerequisite: null, chain: null, rating: '7/10', emoji: '🎵',
    dao_diem: 80,
    category: 'quest',
    effect: { sound_wave_damage: true, sound_aoe_percent: 15, confusion_chance: 10 },
    description: 'Sóng âm AOE 15% damage, 10% hoang mang. (Quest đặc biệt)',
  },
  {
    id: 'huyen_ho', name: 'Huyền Hồ',
    tier: 1, prerequisite: null, chain: null, rating: '6/10', emoji: '🫗',
    dao_diem: 60,
    category: 'quest',
    effect: { gourd_absorb: true, absorb_projectile_chance: 25, release_damage_percent: 150 },
    description: 'Hồ lô hút 25% đạn, phóng lại 150% damage. (Quest đặc biệt)',
  },
];

module.exports = {
  SLOT_UNLOCK,
  nghichThienList,
  list: nghichThienList,

  getNghichThienById(id) {
    return nghichThienList.find(n => n.id === id);
  },

  getAvailableTraits(currentTraitIds, player = null) {
    return nghichThienList.filter(trait => {
      if (currentTraitIds.includes(trait.id)) return false;
      if (trait.replaces && currentTraitIds.includes(trait.replaces)) return false;
      if (trait.prerequisite && !currentTraitIds.includes(trait.prerequisite)) return false;
      // Ma Đạo check
      if (trait.dao_path && player && player.dao_path !== trait.dao_path) return false;
      // Realm check
      if (trait.min_realm && player) {
        const realms = require('../../config/realms');
        const currentRealm = realms.list[player.realm_index];
        if (currentRealm && currentRealm.order < trait.min_realm) return false;
      }
      // Đạo Tâm check
      if (trait.dao_tam_required && trait.dao_tam_required.length > 0 && player) {
        const db = require('../database/connection');
        const playerDaoTam = db.prepare('SELECT dao_tam_id FROM player_dao_tam WHERE player_id = ?').get(player.id);
        if (!playerDaoTam || !trait.dao_tam_required.includes(playerDaoTam.dao_tam_id)) return false;
      }
      return true;
    });
  },

  getSlotCost(traitId) {
    return 1;
  },

  isSlotUnlocked(slot, realmOrder) {
    const unlock = SLOT_UNLOCK[slot];
    return unlock ? realmOrder >= unlock.realm_order : false;
  },

  getUnlockedSlotCount(realmOrder) {
    let count = 0;
    for (const [, info] of Object.entries(SLOT_UNLOCK)) {
      if (realmOrder >= info.realm_order) count++;
    }
    return count;
  },

  getByCategory(category) {
    return nghichThienList.filter(n => n.category === category);
  },
};
