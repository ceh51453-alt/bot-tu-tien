/**
 * @file Đạo Tâm Configuration
 * @description 18 loại Đạo Tâm + 2 đặc thù (Thiên Cơ, Quy Nhất)
 *
 * Đạo Tâm = "Ý chí tu luyện" — quyết định NTCM có thể nhận được
 * Mỗi Đạo Tâm có buff passive riêng và nhóm NTCM chuyên dụng
 *
 * Trạng thái kiên định (100 → 0):
 *   moi_sinh (100)  → ngung_tu (80+)  → ket_tuy (90+, viên mãn)
 *   dao_dong (30-)   → sup_do (0-)     → tru_khu (vỡ vụn hoàn toàn)
 *
 * Cải biến Đạo Tâm: Thông qua Quỷ Cốc → Reset NTCM theo đạo tâm
 */

/**
 * Trạng thái Đạo Tâm
 */
const DAO_TAM_STATES = {
  MOI_SINH:  { id: 'moi_sinh',  name: 'Mới Sinh',    emoji: '🌱', order: 1, desc: 'Đạo tâm vừa hình thành, có thể nhận NTCM.' },
  NGUNG_TU:  { id: 'ngung_tu',  name: 'Ngưng Tụ',    emoji: '💎', order: 2, desc: 'Đạo tâm đang phát triển, nhận buff đặc biệt.' },
  KET_TUY:   { id: 'ket_tuy',   name: 'Kết Túy',     emoji: '✨', order: 3, desc: 'Đạo tâm viên mãn, buff tối đa.' },
  DAO_DONG:  { id: 'dao_dong',  name: 'Dao Động',     emoji: '⚠️', order: -1, desc: 'Đạo tâm bị lung lay, có debuff nhẹ.' },
  SUP_DO:    { id: 'sup_do',    name: 'Sụp Đổ',       emoji: '💔', order: -2, desc: 'Đạo tâm sắp vỡ, debuff nặng.' },
  TRU_KHU:   { id: 'tru_khu',   name: 'Trừ Khử',     emoji: '💀', order: -3, desc: 'Đạo tâm vỡ vụn, không thể đột phá.' },
};

/**
 * Kiên định → Trạng thái mapping
 */
function getStateFromKienDinh(kienDinh) {
  if (kienDinh >= 90) return DAO_TAM_STATES.KET_TUY;
  if (kienDinh >= 60) return DAO_TAM_STATES.NGUNG_TU;
  if (kienDinh >= 30) return DAO_TAM_STATES.MOI_SINH;
  if (kienDinh > 0) return DAO_TAM_STATES.DAO_DONG;
  if (kienDinh > -50) return DAO_TAM_STATES.SUP_DO;
  return DAO_TAM_STATES.TRU_KHU;
}

const daoTamList = [
  // ═══════════════════════════════════════
  //  Nhóm 1: Tốc Độ Di Chuyển +10%
  // ═══════════════════════════════════════
  {
    id: 'bat_tuc',
    name: 'Bất Tức',
    emoji: '🌬️',
    group: 'di_toc',
    passive: { di_toc_percent: 10 },
    passive_ngung_tu: { di_toc_percent: 15, damage_percent: 3 },
    passive_ket_tuy: { di_toc_percent: 20, damage_percent: 5 },
    description: 'Tốc độ di chuyển +10%. Bất kỳ lúc nào cũng không dừng bước.',
    ntcm_pool: ['phong_khoi_linh_dong'],
  },
  {
    id: 'tuan_thien',
    name: 'Tuần Thiên',
    emoji: '🔄',
    group: 'di_toc',
    passive: { di_toc_percent: 10 },
    passive_ngung_tu: { di_toc_percent: 15, def_percent: 3 },
    passive_ket_tuy: { di_toc_percent: 20, def_percent: 5 },
    description: 'Tốc độ di chuyển +10%. Tuần hoàn không ngừng.',
    ntcm_pool: ['kim_cham_thu_huyet'],
  },
  {
    id: 'truong_hang',
    name: 'Trường Hằng',
    emoji: '♾️',
    group: 'di_toc',
    passive: { di_toc_percent: 10 },
    passive_ngung_tu: { di_toc_percent: 15, hp_regen_percent: 2 },
    passive_ket_tuy: { di_toc_percent: 20, hp_regen_percent: 5 },
    description: 'Tốc độ di chuyển +10%. Kiên trì vĩnh hằng.',
    ntcm_pool: ['thau_the_hoa_kinh'],
  },

  // ═══════════════════════════════════════
  //  Nhóm 2: Kỹ năng CD -10%
  // ═══════════════════════════════════════
  {
    id: 'te_ngu',
    name: 'Tể Ngự',
    emoji: '👑',
    group: 'cd_giam',
    passive: { cooldown_reduction_percent: 10 },
    passive_ngung_tu: { cooldown_reduction_percent: 15, mana_regen_percent: 3 },
    passive_ket_tuy: { cooldown_reduction_percent: 20, mana_regen_percent: 5 },
    description: 'Kỹ năng CD -10%. Ngự trị vạn vật.',
    ntcm_pool: ['thau_the_hoa_kinh'],
  },
  {
    id: 'tu_tinh',
    name: 'Tu Tỉnh',
    emoji: '🧘',
    group: 'cd_giam',
    passive: { cooldown_reduction_percent: 10 },
    passive_ngung_tu: { cooldown_reduction_percent: 15, ngo_tinh_bonus: 5 },
    passive_ket_tuy: { cooldown_reduction_percent: 20, ngo_tinh_bonus: 10 },
    description: 'Kỹ năng CD -10%. Tự phản tỉnh, tự tiến bộ.',
    ntcm_pool: ['thanh_khau_chi_chu'],
  },
  {
    id: 'vo_dinh',
    name: 'Vô Định',
    emoji: '🌀',
    group: 'cd_giam',
    passive: { cooldown_reduction_percent: 10 },
    passive_ngung_tu: { cooldown_reduction_percent: 15, dodge_percent: 3 },
    passive_ket_tuy: { cooldown_reduction_percent: 20, dodge_percent: 5 },
    description: 'Kỹ năng CD -10%. Biến hóa khôn lường.',
    ntcm_pool: ['phong_khoi_linh_dong'],
  },

  // ═══════════════════════════════════════
  //  Nhóm 3: Tầm bắn +20%
  // ═══════════════════════════════════════
  {
    id: 'van_tuong',
    name: 'Vạn Tượng',
    emoji: '🌌',
    group: 'tam_ban',
    passive: { range_percent: 20 },
    passive_ngung_tu: { range_percent: 25, atk_percent: 3 },
    passive_ket_tuy: { range_percent: 30, atk_percent: 5 },
    description: 'Tầm bắn +20%. Vạn vật đều trong tầm tay.',
    ntcm_pool: ['viem_hoa_cuong_liep'],
  },
  {
    id: 'ke_minh',
    name: 'Kế Minh',
    emoji: '🐓',
    group: 'tam_ban',
    passive: { range_percent: 20 },
    passive_ngung_tu: { range_percent: 25, crit_rate: 3 },
    passive_ket_tuy: { range_percent: 30, crit_rate: 5 },
    description: 'Tầm bắn +20%. Kế sách tinh minh.',
    ntcm_pool: ['thien_loi_cuon_cuon'],
  },
  {
    id: 'kho_nhien',
    name: 'Khô Nhiên',
    emoji: '🍂',
    group: 'tam_ban',
    passive: { range_percent: 20 },
    passive_ngung_tu: { range_percent: 25, damage_reduction_percent: 3 },
    passive_ket_tuy: { range_percent: 30, damage_reduction_percent: 5 },
    description: 'Tầm bắn +20%. Lặng lẽ như cây khô.',
    ntcm_pool: ['hau_duc_tai_vat'],
  },

  // ═══════════════════════════════════════
  //  Nhóm 4: Niệm lực tiêu hao -20%
  // ═══════════════════════════════════════
  {
    id: 'thuong_thien',
    name: 'Thượng Thiện',
    emoji: '🕊️',
    group: 'niem_luc',
    passive: { niem_luc_cost_reduction_percent: 20 },
    passive_ngung_tu: { niem_luc_cost_reduction_percent: 25, hp_percent: 3 },
    passive_ket_tuy: { niem_luc_cost_reduction_percent: 30, hp_percent: 5 },
    description: 'Niệm lực tiêu hao -20%. Thượng thiện như nước.',
    ntcm_pool: ['quy_kinh_phan_nguyen'],
  },
  {
    id: 'quy_tang',
    name: 'Quy Tàng',
    emoji: '🐢',
    group: 'niem_luc',
    passive: { niem_luc_cost_reduction_percent: 20 },
    passive_ngung_tu: { niem_luc_cost_reduction_percent: 25, def_percent: 3 },
    passive_ket_tuy: { niem_luc_cost_reduction_percent: 30, def_percent: 5 },
    description: 'Niệm lực tiêu hao -20%. Ẩn mình chờ thời.',
    ntcm_pool: ['huyen_ho_te_the'],
  },
  {
    id: 'chi_du',
    name: 'Chỉ Du',
    emoji: '🧭',
    group: 'niem_luc',
    passive: { niem_luc_cost_reduction_percent: 20 },
    passive_ngung_tu: { niem_luc_cost_reduction_percent: 25, speed_percent: 3 },
    passive_ket_tuy: { niem_luc_cost_reduction_percent: 30, speed_percent: 5 },
    description: 'Niệm lực tiêu hao -20%. Chỉ đường dẫn lối.',
    ntcm_pool: ['truy_anh_ky_hoan'],
  },

  // ═══════════════════════════════════════
  //  Nhóm 5: Sát thương nhận vào -15%
  // ═══════════════════════════════════════
  {
    id: 'hoa_ngai',
    name: 'Hóa Ngại',
    emoji: '🛡️',
    group: 'giam_thuong',
    passive: { damage_taken_reduction_percent: 15 },
    passive_ngung_tu: { damage_taken_reduction_percent: 18, ho_tam_bonus: 5 },
    passive_ket_tuy: { damage_taken_reduction_percent: 22, ho_tam_bonus: 10 },
    description: 'Sát thương nhận vào từ tu tiên giả -15%. Hóa giải mọi trở ngại.',
    ntcm_pool: ['phu_sinh_phao_anh'],
  },
  {
    id: 'vo_cuu',
    name: 'Vô Cữu',
    emoji: '☯️',
    group: 'giam_thuong',
    passive: { damage_taken_reduction_percent: 15 },
    passive_ngung_tu: { damage_taken_reduction_percent: 18, hp_percent: 5 },
    passive_ket_tuy: { damage_taken_reduction_percent: 22, hp_percent: 10 },
    description: 'Sát thương nhận vào từ tu tiên giả -15%. Không lỗi lầm.',
    ntcm_pool: ['dai_mac_cuong_dao'],
  },

  // ═══════════════════════════════════════
  //  Nhóm 6: May Mắn +40
  // ═══════════════════════════════════════
  {
    id: 'phuc_sinh',
    name: 'Phúc Sinh',
    emoji: '🍀',
    group: 'may_man',
    passive: { van_khi_bonus: 40 },
    passive_ngung_tu: { van_khi_bonus: 50, exp_bonus_percent: 5 },
    passive_ket_tuy: { van_khi_bonus: 60, exp_bonus_percent: 10 },
    description: 'May mắn +40. Phúc lành tái sinh.',
    ntcm_pool: ['viem_hoa_cuong_liep'],
  },
  {
    id: 'bach_hieu',
    name: 'Bách Hiểu',
    emoji: '📖',
    group: 'may_man',
    passive: { van_khi_bonus: 40 },
    passive_ngung_tu: { van_khi_bonus: 50, ngo_tinh_bonus: 5 },
    passive_ket_tuy: { van_khi_bonus: 60, ngo_tinh_bonus: 10 },
    description: 'May mắn +40. Thông hiểu trăm điều.',
    ntcm_pool: ['kim_cham_thu_huyet'],
  },

  // ═══════════════════════════════════════
  //  Nhóm 7: Đạo Tâm Tổng Hợp (Triệu hồn damage)
  // ═══════════════════════════════════════
  {
    id: 'vo_danh',
    name: 'Vô Danh',
    emoji: '❓',
    group: 'tong_hop',
    passive: { summon_damage_percent: 10 },
    passive_ngung_tu: { summon_damage_percent: 15, atk_percent: 3 },
    passive_ket_tuy: { summon_damage_percent: 20, atk_percent: 5 },
    description: 'Triệu hoán vật sát thương +10%. Vô danh vô tướng.',
    ntcm_pool: [], // Tất cả NTCM đều có thể xuất hiện
  },

  // ═══════════════════════════════════════
  //  Đạo Tâm Đặc Thù
  // ═══════════════════════════════════════
  {
    id: 'thien_co',
    name: 'Thiên Cơ',
    emoji: '🔮',
    group: 'dac_thu',
    special: true,
    sect_required: 'dao_tam_cac', // Đạo Tâm Các
    passive: { van_khi_bonus: 40 },
    passive_ngung_tu: { van_khi_bonus: 50, crit_rate: 5, summon_damage_percent: 5 },
    passive_ket_tuy: { van_khi_bonus: 60, crit_rate: 10, summon_damage_percent: 10 },
    description: 'May mắn +40 (Đạo Tâm Các). Thiên cơ bất khả lộ.',
    ntcm_pool: ['that_tinh_kiem_boc', 'minh_ha_chi_chu'],
  },
  {
    id: 'quy_nhat',
    name: 'Quy Nhất',
    emoji: '🎯',
    group: 'dac_thu',
    special: true,
    sect_required: 'thuc_tam_dien', // Thực Tâm Điện
    passive: { van_khi_bonus: 40 },
    passive_ngung_tu: { van_khi_bonus: 50, damage_percent: 5, def_percent: 3 },
    passive_ket_tuy: { van_khi_bonus: 60, damage_percent: 10, def_percent: 5 },
    description: 'May mắn +40 (Thực Tâm Điện). Vạn pháp quy nhất.',
    ntcm_pool: ['that_tinh_kiem_boc', 'minh_ha_chi_chu'],
  },
];

module.exports = {
  DAO_TAM_STATES,
  daoTamList,
  list: daoTamList,
  getStateFromKienDinh,

  /**
   * Lấy đạo tâm theo id
   */
  getDaoTamById(id) {
    return daoTamList.find(d => d.id === id);
  },

  /**
   * Lấy buff passive dựa trên trạng thái kiên định
   */
  getPassiveBuff(daoTamId, kienDinh) {
    const dt = daoTamList.find(d => d.id === daoTamId);
    if (!dt) return {};
    const state = getStateFromKienDinh(kienDinh);
    if (state.order === 3) return { ...dt.passive, ...dt.passive_ket_tuy };
    if (state.order === 2) return { ...dt.passive, ...dt.passive_ngung_tu };
    if (state.order >= 1) return dt.passive;
    // Debuff khi dao_dong/sup_do/tru_khu
    if (state.id === 'dao_dong') return { damage_percent: -10 };
    if (state.id === 'sup_do') return { damage_percent: -50, damage_taken_percent: 100 };
    return { damage_percent: -50, damage_taken_percent: 100, no_breakthrough: true };
  },

  /**
   * Lấy đạo tâm theo nhóm
   */
  getByGroup(groupId) {
    return daoTamList.filter(d => d.group === groupId);
  },

  /**
   * Lấy danh sách đạo tâm có thể chọn (không đặc thù)
   */
  getSelectableList() {
    return daoTamList.filter(d => !d.special);
  },

  /**
   * Tính kiên định thay đổi theo sự kiện
   */
  KIEN_DINH_EVENTS: {
    WIN_BATTLE: 2,         // Thắng trận +2
    LOSE_BATTLE: -5,       // Thua trận -5
    DIE: -15,              // Chết -15
    LOSE_FRIEND: -10,      // Mất đạo lữ/bạn -10
    BREAKTHROUGH_SUCCESS: 5, // Đột phá thành công +5
    BREAKTHROUGH_FAIL: -8,  // Đột phá thất bại -8
    MEDITATION: 3,          // Tĩnh tọa +3
    COMPREHEND_DAO: 5,      // Lĩnh ngộ đạo +5
  },
};
