/**
 * @file Hậu Thiên Khí Vận System
 * @description Quản lý hệ thống khí vận (buff/debuff) từ data Hậu Thiên Khí Vận
 *
 * Cơ chế:
 *   - Roll khí vận ngẫu nhiên sau khi tu luyện, chiến đấu, kỳ ngộ
 *   - Mỗi khí vận có duration (12h-72h thời gian thực)
 *   - Effects: tăng/giảm stat, EXP bonus, combat bonus, v.v.
 *   - Scheduler tự động dọn khí vận hết hạn
 */

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { COLORS } = require('../utils/constants');
const { formatNumber, formatTime } = require('../utils/helpers');
const db = require('../database/connection');

// ═══════════════════════════════════════════
// KHÍVẬN DATA — Parsed từ Hậu Thiên Khí Vận.txt
// Chọn lọc các khí vận có ý nghĩa gameplay
// ═══════════════════════════════════════════

const KHI_VAN_POOL = [
  // ── BUFF TU LUYỆN ──
  { id: 'kv_linh_khi_bao_phu', name: '🌿 Linh Khí Bao Phủ', description: 'Linh khí xung quanh nồng đậm, tu luyện thuận lợi hơn.', category: 'buff', effects: { exp_bonus: 0.15 }, duration: 24 * 60 * 60 * 1000, rarity: 'common' },
  { id: 'kv_tinh_luc_sung_man', name: '✨ Tinh Lực Sung Mãn', description: 'Tinh lực tràn đầy, tu luyện bền bỉ.', category: 'buff', effects: { max_mana_bonus: 100, mana_regen: 50 }, duration: 12 * 60 * 60 * 1000, rarity: 'common' },
  { id: 'kv_tam_tinh_thu_suong', name: '😊 Tâm Tình Thư Sướng', description: 'Tâm trạng vui vẻ, tu luyện dễ dàng lĩnh ngộ.', category: 'buff', effects: { exp_bonus: 0.10, comprehension: 10 }, duration: 18 * 60 * 60 * 1000, rarity: 'common' },
  { id: 'kv_nhan_gia_nhac_son', name: '🏔️ Nhân Giả Nhạc Sơn', description: 'Tâm tĩnh như núi, đạo tâm kiên cố.', category: 'buff', effects: { def_bonus: 20, dao_tam_bonus: 5 }, duration: 24 * 60 * 60 * 1000, rarity: 'uncommon' },
  { id: 'kv_than_khinh_nhu_yen', name: '🕊️ Thân Khinh Như Yến', description: 'Thân thể nhẹ nhàng, tốc độ tăng.', category: 'buff', effects: { speed_bonus: 25 }, duration: 12 * 60 * 60 * 1000, rarity: 'common' },
  { id: 'kv_luc_lon_vo_cung', name: '💪 Lực Lớn Vô Cùng', description: 'Sức mạnh bùng phát, công kích tăng mạnh.', category: 'buff', effects: { atk_bonus: 30 }, duration: 12 * 60 * 60 * 1000, rarity: 'uncommon' },
  { id: 'kv_cuong_than_kien_the', name: '🛡️ Cường Thân Kiện Thể', description: 'Thể chất kiên cường, phòng ngự vững chắc.', category: 'buff', effects: { def_bonus: 30 }, duration: 12 * 60 * 60 * 1000, rarity: 'uncommon' },
  { id: 'kv_than_nguyen_hoa_sat', name: '💥 Thần Nguyên Hóa Sát', description: 'Hội tâm tăng, cơ hội chí mạng cao hơn.', category: 'buff', effects: { crit_bonus: 20 }, duration: 12 * 60 * 60 * 1000, rarity: 'uncommon' },
  { id: 'kv_nhiet_huyet_phi_dang', name: '❤️ Nhiệt Huyết Phi Đằng', description: 'Sinh lực bùng nổ, HP tối đa tăng.', category: 'buff', effects: { max_hp_bonus: 500 }, duration: 24 * 60 * 60 * 1000, rarity: 'uncommon' },
  { id: 'kv_sam_la_van_tuong', name: '🔮 Sâm La Vạn Tượng', description: 'Linh lực tối đa tăng mạnh.', category: 'buff', effects: { max_mana_bonus: 300 }, duration: 24 * 60 * 60 * 1000, rarity: 'uncommon' },
  { id: 'kv_phuc_sinh', name: '🍀 Phúc Sinh', description: 'Vận may tràn đầy, mọi việc thuận lợi.', category: 'buff', effects: { luck: 40 }, duration: 24 * 60 * 60 * 1000, rarity: 'rare' },
  { id: 'kv_bach_hieu', name: '📚 Bách Hiểu', description: 'Trí tuệ thông suốt, lĩnh ngộ nhanh chóng.', category: 'buff', effects: { comprehension: 40, exp_bonus: 0.20 }, duration: 18 * 60 * 60 * 1000, rarity: 'rare' },
  { id: 'kv_tien_van_gia_than', name: '✨ Tiên Vận Gia Thân', description: 'Được tiên nhân ban ân, toàn bộ chỉ số tăng.', category: 'buff', effects: { atk_bonus: 10, def_bonus: 10, speed_bonus: 10, max_hp_bonus: 200, exp_bonus: 0.10 }, duration: 48 * 60 * 60 * 1000, rarity: 'rare' },
  { id: 'kv_xuan_tho_keo_dai', name: '🌸 Xuân Thọ Kéo Dài', description: 'Sinh lực tối đa +15%, linh lực tối đa +10%.', category: 'buff', effects: { max_hp_percent: 0.15, max_mana_percent: 0.10 }, duration: 48 * 60 * 60 * 1000, rarity: 'epic' },

  // ── BUFF CHIẾN ĐẤU ──
  { id: 'kv_cuong_can_thiet_cot', name: '🦴 Cương Cân Thiết Cốt', description: 'Gân cốt cứng như sắt, hộ tâm tăng.', category: 'combat_buff', effects: { def_bonus: 20, damage_reduction: 0.05 }, duration: 12 * 60 * 60 * 1000, rarity: 'uncommon' },
  { id: 'kv_ba_lan_bat_kinh', name: '🌊 Ba Lan Bất Kinh', description: 'Bình tĩnh như mặt hồ, hồi sinh lực mỗi giờ.', category: 'combat_buff', effects: { hp_regen: 200 }, duration: 24 * 60 * 60 * 1000, rarity: 'uncommon' },
  { id: 'kv_xuyen_luu_bat_tuc', name: '💧 Xuyên Lưu Bất Tức', description: 'Linh lực hồi phục không ngừng.', category: 'combat_buff', effects: { mana_regen: 200 }, duration: 24 * 60 * 60 * 1000, rarity: 'uncommon' },

  // ── ĐẠO TÂM BUFF ──
  { id: 'kv_vo_danh', name: '☯️ Vô Danh', description: 'Đạo tâm bình an, tổn thương tạo thành +10%.', category: 'dao_tam', effects: { atk_percent: 0.10 }, duration: 24 * 60 * 60 * 1000, rarity: 'rare' },
  { id: 'kv_bat_tuc', name: '💨 Bất Tức', description: 'Tốc độ di chuyển +10%.', category: 'dao_tam', effects: { speed_percent: 0.10 }, duration: 24 * 60 * 60 * 1000, rarity: 'uncommon' },
  { id: 'kv_tai_ngu', name: '🧠 Tể Ngự', description: 'Kỹ năng cooldown -10%.', category: 'dao_tam', effects: { cd_reduction: 0.10 }, duration: 24 * 60 * 60 * 1000, rarity: 'uncommon' },
  { id: 'kv_van_tuong', name: '🌟 Vạn Tượng', description: 'Tầm bắn kỹ năng +20%.', category: 'dao_tam', effects: { range_bonus: 0.20 }, duration: 24 * 60 * 60 * 1000, rarity: 'uncommon' },
  { id: 'kv_thuong_thien', name: '💊 Thượng Thiện', description: 'Tiêu hao đan dược giảm -20%.', category: 'dao_tam', effects: { potion_efficiency: 0.20 }, duration: 24 * 60 * 60 * 1000, rarity: 'uncommon' },
  { id: 'kv_truong_hang', name: '♾️ Trường Hằng', description: 'Tốc độ +10%, bền bỉ hơn.', category: 'dao_tam', effects: { speed_percent: 0.10 }, duration: 24 * 60 * 60 * 1000, rarity: 'uncommon' },
  { id: 'kv_tuan_thien', name: '🔄 Tuần Thiên', description: 'Tuần hoàn linh khí tốt, tốc độ +10%.', category: 'dao_tam', effects: { speed_percent: 0.10 }, duration: 24 * 60 * 60 * 1000, rarity: 'uncommon' },

  // ── DEBUFF ──
  { id: 'kv_tau_hoa', name: '🔥 Tẩu Hỏa Nhập Ma', description: 'Tẩu hỏa nhập ma, linh khí loạn xạ!', category: 'debuff', effects: { exp_bonus: -0.30, atk_bonus: -10 }, duration: 6 * 60 * 60 * 1000, rarity: 'common' },
  { id: 'kv_y_chi_sa_sut', name: '😞 Ý Chí Tinh Thần Sa Sút', description: 'Tinh thần suy sụp, tạo thành tổn thương -10%.', category: 'debuff', effects: { atk_percent: -0.10 }, duration: 12 * 60 * 60 * 1000, rarity: 'common' },
  { id: 'kv_tram_moi_lo', name: '😰 Trăm Mối Lo', description: 'Lo lắng quá nhiều, nhận tổn thương +20%.', category: 'debuff', effects: { damage_taken: 0.20 }, duration: 12 * 60 * 60 * 1000, rarity: 'common' },
  { id: 'kv_nan_long_thoai_chi', name: '💤 Nản Lòng Thoái Chí', description: 'Mất động lực tu luyện, EXP giảm 20%.', category: 'debuff', effects: { exp_bonus: -0.20 }, duration: 12 * 60 * 60 * 1000, rarity: 'common' },
  { id: 'kv_dao_tam_dao_dong', name: '💔 Đạo Tâm Dao Động', description: 'Đạo tâm lung lay, không thể đột phá.', category: 'debuff', effects: { breakthrough_block: true }, duration: 6 * 60 * 60 * 1000, rarity: 'uncommon' },
  { id: 'kv_u_hon_ky_doc', name: '☠️ U Hồn Kỳ Độc', description: 'Trúng độc, sinh lực và linh lực suy giảm.', category: 'debuff', effects: { max_hp_percent: -0.30, max_mana_percent: -0.30 }, duration: 6 * 60 * 60 * 1000, rarity: 'uncommon' },
  { id: 'kv_linh_luc_phong_an', name: '🔒 Linh Lực Phong Ấn', description: 'Linh lực bị phong ấn, linh căn giảm.', category: 'debuff', effects: { max_mana_bonus: -200 }, duration: 6 * 60 * 60 * 1000, rarity: 'uncommon' },
  { id: 'kv_dau_vang_mat_hoa', name: '😵 Đầu Váng Mắt Hoa', description: 'Thể chất suy yếu -20%.', category: 'debuff', effects: { def_percent: -0.20 }, duration: 6 * 60 * 60 * 1000, rarity: 'common' },
  { id: 'kv_long_nhu_tro_nguoi', name: '💀 Lòng Như Tro Nguội', description: 'Mất hết ý chí chiến đấu, tổn thương -50%.', category: 'debuff', effects: { atk_percent: -0.50 }, duration: 3 * 60 * 60 * 1000, rarity: 'rare' },

  // ── ĐẶC BIỆT ──
  { id: 'kv_thien_ha_de_nhat', name: '👑 Thiên Hạ Đệ Nhất Tông', description: 'Thuộc tông môn mạnh nhất, uy danh vang dội!', category: 'special', effects: { atk_bonus: 50, def_bonus: 50, exp_bonus: 0.25 }, duration: 72 * 60 * 60 * 1000, rarity: 'legendary' },
  { id: 'kv_thien_cuong_ngu_loi', name: '⚡ Thiên Cương Ngũ Lôi Đạo Thể', description: 'Thể chất trời ban, lôi pháp cường hóa.', category: 'special', effects: { atk_bonus: 100, def_bonus: 50, max_hp_bonus: 1000 }, duration: 48 * 60 * 60 * 1000, rarity: 'legendary' },
  { id: 'kv_dao_tam_ket_tuy', name: '💎 Đạo Tâm Kết Túy', description: 'Đạo tâm viên mãn, nhận hiệu quả đặc biệt.', category: 'special', effects: { atk_percent: 0.15, def_percent: 0.15, exp_bonus: 0.30 }, duration: 48 * 60 * 60 * 1000, rarity: 'epic' },
  { id: 'kv_phuc_hi_chien_vu', name: '⚡ Phục Hi Chiến Vũ', description: 'Chiến vũ từ thượng cổ, sức chiến đấu bùng nổ!', category: 'special', effects: { atk_percent: 0.25, speed_percent: 0.15 }, duration: 24 * 60 * 60 * 1000, rarity: 'epic' },
  { id: 'kv_mi_luc_vo_tan', name: '💕 Mị Lực Vô Tận', description: 'Mị lực toát ra, NPC thiện cảm tăng.', category: 'special', effects: { luck: 20, exp_bonus: 0.05 }, duration: 24 * 60 * 60 * 1000, rarity: 'rare' },
  { id: 'kv_yao_co_huong_hoa', name: '🌸 Dao Cơ Hương Hoa', description: 'Hương hoa tiên dược, may mắn +20.', category: 'special', effects: { luck: 20 }, duration: 36 * 60 * 60 * 1000, rarity: 'rare' },
];

// Weighted rarity system
const RARITY_WEIGHTS = {
  common: 50,
  uncommon: 30,
  rare: 15,
  epic: 4,
  legendary: 1,
};

// ═══════════════════════════════════════════
// DB Prepared Statements (Lazy init — bảng có thể chưa tồn tại)
// ═══════════════════════════════════════════

let _stmts = null;
function getStmts() {
  if (!_stmts) {
    _stmts = {
      getActive: db.prepare("SELECT * FROM player_khi_van WHERE player_id = ? AND expires_at > ? ORDER BY applied_at DESC"),
      apply: db.prepare("INSERT INTO player_khi_van (player_id, khi_van_id, applied_at, expires_at) VALUES (?, ?, ?, ?)"),
      removeExpired: db.prepare("DELETE FROM player_khi_van WHERE expires_at <= ?"),
      countActive: db.prepare("SELECT COUNT(*) as count FROM player_khi_van WHERE player_id = ? AND expires_at > ?"),
    };
  }
  return _stmts;
}

// ═══════════════════════════════════════════
// CORE FUNCTIONS
// ═══════════════════════════════════════════

/**
 * Roll khí vận ngẫu nhiên theo context
 * @param {'cultivation'|'combat'|'ky_ngo'|'be_quan'|'breakthrough'} context
 * @param {Object} player
 * @returns {Object|null} Khí vận được roll hoặc null
 */
function rollRandomKhiVan(context, player) {
  // Filter pool theo context
  let pool = KHI_VAN_POOL.filter(kv => {
    // Debuff ít hơn trong context tốt
    if (context === 'be_quan' && kv.category === 'debuff') return Math.random() < 0.3;
    if (context === 'cultivation') return true; // Tất cả đều có thể
    if (context === 'combat') return kv.category !== 'dao_tam'; // Combat không roll đạo tâm
    return true;
  });

  if (pool.length === 0) return null;

  // Weighted random selection
  const totalWeight = pool.reduce((sum, kv) => sum + (RARITY_WEIGHTS[kv.rarity] || 10), 0);
  let roll = Math.random() * totalWeight;

  for (const kv of pool) {
    roll -= (RARITY_WEIGHTS[kv.rarity] || 10);
    if (roll <= 0) return kv;
  }

  return pool[pool.length - 1];
}

/**
 * Apply khí vận cho player
 */
function applyKhiVan(playerId, khiVanId) {
  const kv = KHI_VAN_POOL.find(k => k.id === khiVanId);
  if (!kv) return false;

  // Check max active (5 khí vận tối đa)
  const count = getStmts().countActive.get(playerId, Date.now());
  if (count && count.count >= 5) {
    // Remove oldest
    db.prepare(
      "DELETE FROM player_khi_van WHERE id = (SELECT id FROM player_khi_van WHERE player_id = ? ORDER BY applied_at ASC LIMIT 1)"
    ).run(playerId);
  }

  const now = Date.now();
  getStmts().apply.run(playerId, khiVanId, now, now + kv.duration);
  return true;
}

/**
 * Lấy list khí vận đang active
 */
function getActiveKhiVan(playerId) {
  const rows = getStmts().getActive.all(playerId, Date.now());
  return rows.map(row => {
    const kv = KHI_VAN_POOL.find(k => k.id === row.khi_van_id);
    return {
      ...row,
      ...kv,
      timeLeft: row.expires_at - Date.now(),
    };
  }).filter(kv => kv.name); // Filter out unknown khí vận
}

/**
 * Tính tổng effects từ tất cả khí vận đang active
 */
function calculateKhiVanEffects(playerId) {
  const activeKhiVan = getActiveKhiVan(playerId);
  const totalEffects = {};

  for (const kv of activeKhiVan) {
    if (!kv.effects) continue;
    for (const [key, value] of Object.entries(kv.effects)) {
      if (typeof value === 'number') {
        totalEffects[key] = (totalEffects[key] || 0) + value;
      } else if (typeof value === 'boolean') {
        totalEffects[key] = totalEffects[key] || value;
      }
    }
  }

  return totalEffects;
}

/**
 * Dọn dẹp khí vận hết hạn (gọi từ scheduler)
 */
function removeExpiredKhiVan() {
  const result = getStmts().removeExpired.run(Date.now());
  return result.changes;
}

// ═══════════════════════════════════════════
// UI: Menu Khí Vận
// ═══════════════════════════════════════════

/**
 * Hiển thị menu khí vận của player
 */
async function showKhiVanMenu(interaction, player) {
  const activeKhiVan = getActiveKhiVan(player.id);

  let description;
  if (activeKhiVan.length === 0) {
    description = '_Hiện chưa có khí vận nào đang hoạt động._\n\n💡 Tu luyện, chiến đấu hoặc bế quan để nhận khí vận!';
  } else {
    description = activeKhiVan.map((kv, i) => {
      const timeLeft = formatTime(kv.timeLeft);
      const rarityEmoji = kv.rarity === 'legendary' ? '🏆' : kv.rarity === 'epic' ? '💎' : kv.rarity === 'rare' ? '🌟' : kv.rarity === 'uncommon' ? '🔵' : '⚪';
      const effectText = Object.entries(kv.effects || {})
        .map(([k, v]) => {
          if (typeof v === 'boolean') return v ? `🚫 ${k}` : '';
          const sign = v >= 0 ? '+' : '';
          if (k.includes('percent') || k.includes('bonus') && typeof v === 'number' && Math.abs(v) < 1) {
            return `${sign}${Math.round(v * 100)}% ${k.replace(/_/g, ' ')}`;
          }
          return `${sign}${v} ${k.replace(/_/g, ' ')}`;
        })
        .filter(Boolean)
        .join(', ');

      return `${rarityEmoji} **${kv.name}**\n` +
             `┗ _${kv.description}_\n` +
             `┗ 📊 ${effectText}\n` +
             `┗ ⏰ Còn: ${timeLeft}`;
    }).join('\n\n');
  }

  const embed = new EmbedBuilder()
    .setColor(0x9b59b6)
    .setTitle('🌟 Hậu Thiên Khí Vận')
    .setDescription(
      `**${player.name}** — Khí vận đang có: **${activeKhiVan.length}/5**\n\n` +
      description
    )
    .setFooter({ text: 'Khí vận sẽ tự hết hạn theo thời gian' })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('cultivation:menu')
      .setLabel('🧘 Tu Luyện Các')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('menu:main')
      .setLabel('🏠 Menu Chính')
      .setStyle(ButtonStyle.Secondary),
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

module.exports = {
  KHI_VAN_POOL,
  RARITY_WEIGHTS,
  rollRandomKhiVan,
  applyKhiVan,
  getActiveKhiVan,
  calculateKhiVanEffects,
  removeExpiredKhiVan,
  showKhiVanMenu,
};
