/**
 * @file Hậu Thiên Khí Vận (Temporary Buffs/Debuffs) Configuration
 * @description Buff/debuff tạm thời nhận trong quá trình chơi
 *
 * Nguồn gốc: Chiến đấu, Rượu, Phù, Quest, Khí Linh, Đạo Tâm, Tông Môn, Event
 * Thời hạn: Tạm thời (phút/giờ), có điều kiện, hoặc vĩnh viễn (hiếm)
 *
 * Chỉ số đã chỉnh phù hợp bot Discord
 */

const hauThienList = [
  // ╔═══════════════════════════════════════════════╗
  // ║  RƯỢU — Buff từ uống rượu (Thời hạn: 60 phút) ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'ruou_luc_lon', name: 'Lực Lớn Vô Cùng',
    category: 'ruou', tier: 1, emoji: '🍶',
    duration_minutes: 60, stackable: false,
    effect: { atk: 6 },
    description: 'Lực công kích +6.',
  },
  {
    id: 'ruou_nhiet_huyet', name: 'Nhiệt Huyết Phi Đằng',
    category: 'ruou', tier: 1, emoji: '🍶',
    duration_minutes: 60, stackable: false,
    effect: { hp: 50 },
    description: 'Sinh lực +50.',
  },
  {
    id: 'ruou_sam_la', name: 'Sâm La Vạn Tượng',
    category: 'ruou', tier: 1, emoji: '🍶',
    duration_minutes: 60, stackable: false,
    effect: { mana: 50 },
    description: 'Linh lực +50.',
  },
  {
    id: 'ruou_de_than', name: 'Đề Thần Tỉnh Não',
    category: 'ruou', tier: 1, emoji: '🍶',
    duration_minutes: 60, stackable: false,
    effect: { niem_luc: 50 },
    description: 'Niệm lực +50.',
  },
  {
    id: 'ruou_cuong_than', name: 'Cường Thân Kiện Thể',
    category: 'ruou', tier: 1, emoji: '🍶',
    duration_minutes: 60, stackable: false,
    effect: { def: 6 },
    description: 'Phòng ngự +6.',
  },
  {
    id: 'ruou_than_nguyen', name: 'Thần Nguyên Hóa Sát',
    category: 'ruou', tier: 1, emoji: '🍶',
    duration_minutes: 60, stackable: false,
    effect: { hoi_tam: 10 },
    description: 'Hội tâm +10.',
  },
  {
    id: 'ruou_cuong_can', name: 'Cương Cân Thiết Cốt',
    category: 'ruou', tier: 1, emoji: '🍶',
    duration_minutes: 60, stackable: false,
    effect: { ho_tam: 10 },
    description: 'Hộ tâm +10.',
  },
  {
    id: 'ruou_ba_lan', name: 'Ba Lan Bất Kinh',
    category: 'ruou', tier: 1, emoji: '🍶',
    duration_minutes: 60, stackable: false,
    effect: { hp_regen_flat: 10 },
    description: 'Hồi sinh lực +10/lượt.',
  },
  {
    id: 'ruou_xuyen_luu', name: 'Xuyên Lưu Bất Tức',
    category: 'ruou', tier: 1, emoji: '🍶',
    duration_minutes: 60, stackable: false,
    effect: { mana_regen_flat: 10 },
    description: 'Hồi linh lực +10/lượt.',
  },
  {
    id: 'ruou_than_khinh', name: 'Thân Khinh Như Yến',
    category: 'ruou', tier: 1, emoji: '🍶',
    duration_minutes: 60, stackable: false,
    effect: { speed: 8, cuoc_luc: 100 },
    description: 'Tốc độ +8, cước lực +100.',
  },
  {
    id: 'ruou_tinh_luc', name: 'Tinh Lực Sung Mãn',
    category: 'ruou', tier: 1, emoji: '🍶',
    duration_minutes: 60, stackable: false,
    effect: { tinh_luc: 10 },
    description: 'Tinh lực +10.',
  },
  {
    id: 'ruou_nhan_gia', name: 'Nhân Giả Nhạc Sơn',
    category: 'ruou', tier: 1, emoji: '🍶',
    duration_minutes: 60, stackable: false,
    effect: { tam_tinh: 10 },
    description: 'Tâm tình +10.',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  RƯỢU CẤP 2 — Buff mạnh hơn                   ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'ruou_luc_lon_2', name: 'Lực Lớn Vô Cùng II',
    category: 'ruou', tier: 2, emoji: '🍷',
    duration_minutes: 60, stackable: false,
    effect: { atk: 15 },
    replaces: 'ruou_luc_lon',
    description: 'Lực công kích +15.',
  },
  {
    id: 'ruou_nhiet_huyet_2', name: 'Nhiệt Huyết Phi Đằng II',
    category: 'ruou', tier: 2, emoji: '🍷',
    duration_minutes: 60, stackable: false,
    effect: { hp: 150 },
    replaces: 'ruou_nhiet_huyet',
    description: 'Sinh lực +150.',
  },
  {
    id: 'ruou_cuong_than_2', name: 'Cường Thân Kiện Thể II',
    category: 'ruou', tier: 2, emoji: '🍷',
    duration_minutes: 60, stackable: false,
    effect: { def: 15 },
    replaces: 'ruou_cuong_than',
    description: 'Phòng ngự +15.',
  },
  {
    id: 'ruou_than_nguyen_2', name: 'Thần Nguyên Hóa Sát II',
    category: 'ruou', tier: 2, emoji: '🍷',
    duration_minutes: 60, stackable: false,
    effect: { hoi_tam: 30 },
    replaces: 'ruou_than_nguyen',
    description: 'Hội tâm +30.',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  PHÙ — Buff từ phù lục (Thời hạn: 30 phút)    ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'phu_ho_the', name: 'Hộ Thể Phù',
    category: 'phu', tier: 1, emoji: '📜',
    duration_minutes: 30, stackable: false,
    effect: { def_percent: 10, damage_reduction_percent: 5 },
    description: 'DEF +10%, giảm thương 5%.',
  },
  {
    id: 'phu_tang_luc', name: 'Tăng Lực Phù',
    category: 'phu', tier: 1, emoji: '📜',
    duration_minutes: 30, stackable: false,
    effect: { atk_percent: 10 },
    description: 'ATK +10%.',
  },
  {
    id: 'phu_than_hanh', name: 'Thần Hành Phù',
    category: 'phu', tier: 1, emoji: '📜',
    duration_minutes: 30, stackable: false,
    effect: { speed_percent: 20 },
    description: 'Tốc độ +20%.',
  },
  {
    id: 'phu_ti_yeu', name: 'Tị Yêu Phù',
    category: 'phu', tier: 1, emoji: '📜',
    duration_minutes: 30, stackable: false,
    effect: { monster_encounter_rate_percent: -50 },
    description: 'Giảm 50% tỉ lệ gặp quái.',
  },
  {
    id: 'phu_an_tuc', name: 'Ẩn Tức Phù',
    category: 'phu', tier: 1, emoji: '📜',
    duration_minutes: 30, stackable: false,
    effect: { pvp_encounter_rate_percent: -50 },
    description: 'Giảm 50% tỉ lệ bị PvP.',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  CHIẾN ĐẤU — Buff/debuff từ combat            ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'chien_y_bung_chay', name: 'Chiến Ý Bùng Cháy',
    category: 'combat', tier: 1, emoji: '🔥⚔️',
    duration_minutes: 15, stackable: true, max_stacks: 5,
    effect: { atk_percent: 3 },
    description: 'ATK +3% mỗi stack (tối đa 5). Thắng liên tiếp.',
  },
  {
    id: 'sat_khi_dang_dang', name: 'Sát Khí Đằng Đằng',
    category: 'combat', tier: 1, emoji: '💀',
    duration_minutes: 10, stackable: true, max_stacks: 10,
    effect: { crit_rate: 1, crit_damage: 3 },
    description: 'Bạo kích +1%, damage +3% mỗi stack. Giết liên tục.',
  },
  {
    id: 'kinh_hoang', name: 'Kinh Hoảng',
    category: 'combat', tier: 1, emoji: '😨',
    duration_minutes: 5, stackable: false,
    effect: { atk_percent: -15, speed_percent: -10 },
    description: 'ATK -15%, tốc -10%. Bị đánh bại bởi kẻ mạnh hơn nhiều.',
    is_debuff: true,
  },
  {
    id: 'thuong_the_luy_luy', name: 'Thương Thế Lũy Lũy',
    category: 'combat', tier: 1, emoji: '🩹',
    duration_minutes: 10, stackable: false,
    effect: { hp_percent: -10, def_percent: -5 },
    description: 'HP -10%, DEF -5%. Thương tích chưa lành.',
    is_debuff: true,
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  ĐẠO TÂM — Buff/debuff liên quan đạo tâm     ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'dao_tam_buff_1', name: 'Đạo Tâm Thông Dụng (+)',
    category: 'dao_tam', tier: 1, emoji: '✨',
    duration_minutes: null, stackable: false,
    effect: { damage_percent: 5 },
    description: 'Sát thương +5%. Đạo tâm tích cực.',
  },
  {
    id: 'dao_tam_buff_2', name: 'Đạo Tâm Kiên Cố',
    category: 'dao_tam', tier: 1, emoji: '🛡️',
    duration_minutes: null, stackable: false,
    effect: { damage_taken_percent: -10 },
    description: 'Sát thương nhận -10%. Đạo tâm vững vàng.',
  },
  {
    id: 'dao_tam_debuff_1', name: 'Đạo Tâm Thông Dụng (-)',
    category: 'dao_tam', tier: 1, emoji: '😞',
    duration_minutes: null, stackable: false,
    effect: { damage_percent: -10 },
    description: 'Sát thương -10%. Đạo tâm yếu.',
    is_debuff: true,
  },
  {
    id: 'dao_tam_debuff_2', name: 'Đạo Tâm Suy Yếu',
    category: 'dao_tam', tier: 1, emoji: '💔',
    duration_minutes: null, stackable: false,
    effect: { damage_taken_percent: 20 },
    description: 'Sát thương nhận +20%. Đạo tâm sụp đổ.',
    is_debuff: true,
  },
  {
    id: 'long_nhu_tro_nguoi', name: 'Lòng Như Tro Nguội',
    category: 'dao_tam', tier: 1, emoji: '🪦',
    duration_minutes: null, stackable: false,
    effect: { damage_percent: -50, damage_taken_percent: 100 },
    description: 'Sát thương -50%, nhận thương +100%. Tâm tử.',
    is_debuff: true,
  },
  {
    id: 'nan_long_thoai_chi', name: 'Nản Lòng Thoái Chí',
    category: 'dao_tam', tier: 1, emoji: '😩',
    duration_minutes: null, stackable: false,
    effect: { tinh_luc_percent: -50, skip_turn_chance: 15 },
    description: 'Tinh lực -50%, 15% bỏ lượt. Mất ý chí.',
    is_debuff: true,
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  QUEST/EVENT — Buff từ nhiệm vụ/sự kiện       ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'phuc_lanh_tien_nhan', name: 'Phúc Lành Tiên Nhân',
    category: 'quest', tier: 1, emoji: '🌟',
    duration_minutes: 120, stackable: false,
    effect: { exp_bonus_percent: 20, van_khi: 20, hp_regen_percent: 5 },
    description: 'Tu vi +20%, vận khí +20, hồi HP +5%. Ân huệ tiên nhân.',
  },
  {
    id: 'su_bao_ho', name: 'Sư Bảo Hộ',
    category: 'quest', tier: 1, emoji: '👨‍🏫',
    duration_minutes: 60, stackable: false,
    effect: { exp_bonus_percent: 30, damage_reduction_percent: 10 },
    description: 'Tu vi +30%, giảm thương 10%. Sư phụ bảo hộ.',
  },
  {
    id: 'ki_duyen_than_bi', name: 'Kỳ Duyên Thần Bí',
    category: 'quest', tier: 1, emoji: '🎁',
    duration_minutes: 30, stackable: false,
    effect: { van_khi: 30, all_stats_percent: 3 },
    description: 'Vận khí +30, toàn stats +3%. Kỳ duyên may mắn.',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  TÔNG MÔN — Buff từ bang phái                  ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'tong_mon_de_nhat', name: 'Thiên Hạ Đệ Nhất Tông',
    category: 'tong_mon', tier: 1, emoji: '🏆',
    duration_minutes: null, stackable: false,
    effect: { all_stats_percent: 5, exp_bonus_percent: 10, danh_vong: 50 },
    description: 'Toàn stats +5%, tu vi +10%, danh vọng +50. Đệ nhất tông môn!',
  },
  {
    id: 'de_tu_xuat_sac', name: 'Đệ Tử Xuất Sắc',
    category: 'tong_mon', tier: 1, emoji: '🥇',
    duration_minutes: null, stackable: false,
    effect: { exp_bonus_percent: 15, ngo_tinh: 10, danh_vong: 30 },
    description: 'Tu vi +15%, ngộ tính +10, danh vọng +30. Đệ tử mạnh nhất!',
  },

  // ╔═══════════════════════════════════════════════╗
  // ║  KHÍ LINH — Buff vùng/map                     ║
  // ╚═══════════════════════════════════════════════╝
  {
    id: 'linh_khi_sung_phe', name: 'Linh Khí Sung Phệ',
    category: 'khi_linh', tier: 1, emoji: '🌿',
    duration_minutes: null, stackable: false,
    effect: { exp_bonus_percent: 10, mana_regen_percent: 10 },
    description: 'Tu vi +10%, hồi mana +10%. Vùng đất linh khí dồi dào.',
  },
  {
    id: 'hung_khi_bao_phu', name: 'Hung Khí Bao Phủ',
    category: 'khi_linh', tier: 1, emoji: '☠️',
    duration_minutes: null, stackable: false,
    effect: { atk_percent: 10, damage_taken_percent: 10 },
    description: 'ATK +10%, nhận thương +10%. Vùng đất hung hiểm.',
    is_debuff: true,
  },
];

module.exports = {
  hauThienList,
  list: hauThienList,

  getById(id) {
    return hauThienList.find(h => h.id === id);
  },

  getByCategory(category) {
    return hauThienList.filter(h => h.category === category);
  },

  /**
   * Áp dụng buff hậu thiên cho player
   * @param {number} playerId
   * @param {string} khiVanId
   * @param {string} source - Nguồn gốc (combat, quest, npc...)
   * @returns {Object|null} - Info về buff đã áp dụng
   */
  applyBuff(playerId, khiVanId, source = 'system') {
    const db = require('../database/connection');
    const kv = hauThienList.find(h => h.id === khiVanId);
    if (!kv) return null;

    const expiresAt = kv.duration_minutes
      ? Date.now() + kv.duration_minutes * 60 * 1000
      : null;

    // Check if already exists
    const existing = db.prepare('SELECT * FROM player_hau_thien WHERE player_id = ? AND khi_van_id = ?')
      .get(playerId, khiVanId);

    if (existing) {
      if (kv.stackable && existing.stacks < (kv.max_stacks || 999)) {
        db.prepare('UPDATE player_hau_thien SET stacks = stacks + 1, expires_at = ? WHERE id = ?')
          .run(expiresAt, existing.id);
        return { ...kv, stacks: existing.stacks + 1, action: 'stacked' };
      }
      // Replace nếu có replaces
      if (kv.replaces) {
        db.prepare('DELETE FROM player_hau_thien WHERE player_id = ? AND khi_van_id = ?')
          .run(playerId, kv.replaces);
      }
      // Refresh duration
      db.prepare('UPDATE player_hau_thien SET expires_at = ? WHERE id = ?')
        .run(expiresAt, existing.id);
      return { ...kv, stacks: existing.stacks, action: 'refreshed' };
    }

    // Replace lower tier
    if (kv.replaces) {
      db.prepare('DELETE FROM player_hau_thien WHERE player_id = ? AND khi_van_id = ?')
        .run(playerId, kv.replaces);
    }

    db.prepare('INSERT INTO player_hau_thien (player_id, khi_van_id, stacks, expires_at, source) VALUES (?, ?, 1, ?, ?)')
      .run(playerId, khiVanId, expiresAt, source);

    return { ...kv, stacks: 1, action: 'applied' };
  },

  /**
   * Xóa buff hết hạn
   */
  cleanExpired(playerId) {
    const db = require('../database/connection');
    db.prepare('DELETE FROM player_hau_thien WHERE player_id = ? AND expires_at IS NOT NULL AND expires_at < ?')
      .run(playerId, Date.now());
  },

  /**
   * Lấy tất cả buff đang active
   */
  getActiveBuffs(playerId) {
    const db = require('../database/connection');
    this.cleanExpired(playerId);
    const rows = db.prepare('SELECT * FROM player_hau_thien WHERE player_id = ?').all(playerId);
    return rows.map(row => {
      const kv = hauThienList.find(h => h.id === row.khi_van_id);
      return kv ? { ...kv, stacks: row.stacks, expires_at: row.expires_at, db_id: row.id } : null;
    }).filter(Boolean);
  },

  /**
   * Tính tổng effect từ tất cả buff active
   */
  getTotalEffects(playerId) {
    const activeBuffs = this.getActiveBuffs(playerId);
    const total = {};

    for (const buff of activeBuffs) {
      if (!buff.effect) continue;
      const stacks = buff.stacks || 1;
      for (const [key, value] of Object.entries(buff.effect)) {
        if (typeof value === 'number') {
          total[key] = (total[key] || 0) + value * stacks;
        } else if (typeof value === 'boolean' && value) {
          total[key] = true;
        }
      }
    }

    return total;
  },

  /**
   * Xóa một buff cụ thể
   */
  removeBuff(playerId, khiVanId) {
    const db = require('../database/connection');
    db.prepare('DELETE FROM player_hau_thien WHERE player_id = ? AND khi_van_id = ?')
      .run(playerId, khiVanId);
  },

  /**
   * Xóa tất cả buff
   */
  removeAllBuffs(playerId) {
    const db = require('../database/connection');
    db.prepare('DELETE FROM player_hau_thien WHERE player_id = ?').run(playerId);
  },
};
