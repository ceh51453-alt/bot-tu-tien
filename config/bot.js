/**
 * @file Bot Configuration
 * @description Cấu hình chung cho Bot Tu Tiên RPG
 */

module.exports = {
  /** Prefix lệnh mặc định */
  prefix: 't!',

  /** Màu embed cho các loại tin nhắn */
  colors: {
    primary: '#7C3AED',     // Tím - chủ đề tu tiên
    success: '#10B981',     // Xanh lá - thành công
    error: '#EF4444',       // Đỏ - lỗi
    warning: '#F59E0B',     // Vàng - cảnh báo
    info: '#3B82F6',        // Xanh dương - thông tin
    cultivation: '#8B5CF6', // Tím đậm - tu luyện
    combat: '#DC2626',      // Đỏ đậm - chiến đấu
    loot: '#F59E0B',        // Vàng - rơi đồ
    levelup: '#FBBF24',     // Vàng sáng - tăng cấp
    tribulation: '#7C2D12', // Nâu đỏ - kiếp nạn
    ma_dao: '#4C1D95',      // Tím tối - ma đạo
    chinh_dao: '#DBEAFE',   // Trắng xanh - chính đạo
    mythic: '#FF6B6B',      // Hồng - thần thoại
    legendary: '#FFD700',   // Vàng gold - truyền thuyết
  },

  /** Emoji mặc định */
  emojis: {
    exp: '✨',
    coin: '🪙',
    spirit_stone: '💎',
    hp: '❤️',
    mana: '🔮',
    atk: '⚔️',
    def: '🛡️',
    speed: '💨',
    luck: '🍀',
    cultivation: '🧘',
    combat: '⚔️',
    success: '✅',
    fail: '❌',
    warning: '⚠️',
    loading: '⏳',
    level_up: '🎉',
    tribulation: '⛈️',
    pet: '🐾',
    inventory: '🎒',
    shop: '🏪',
    quest: '📜',
    mining: '⛏️',
    pill: '💊',
    equipment: '🗡️',
    dao: '☯️',
  },

  /** Cooldown mặc định (giây) */
  cooldowns: {
    /** Thời gian nghỉ giữa các lệnh chung */
    default: 3,
    /** Tu luyện */
    cultivate: 60,
    /** Chiến đấu PvE */
    hunt: 30,
    /** Chiến đấu PvP */
    pvp: 120,
    /** Luyện đan */
    alchemy: 45,
    /** Khai thác */
    mining: 300,
    /** Mua bán */
    shop: 5,
    /** Sử dụng vật phẩm */
    use_item: 10,
    /** Bắt thú */
    capture: 60,
    /** Nhiệm vụ hàng ngày */
    daily: 86400,
    /** Kiếp nạn */
    tribulation: 600,
    /** Tương tác NPC */
    npc_interact: 15,
  },

  /** Giới hạn hệ thống */
  limits: {
    /** Túi đồ tối đa */
    inventory_max: 100,
    /** Số thú cưng tối đa */
    pet_max: 5,
    /** Số kỹ năng trang bị tối đa */
    equipped_skills_max: 6,
    /** Số đạo pháp tối đa có thể lĩnh ngộ */
    dao_max: 3,
    /** Số lần săn quái mỗi ngày */
    daily_hunts: 50,
    /** Số lần khai thác mỗi ngày */
    daily_mines: 10,
    /** Số lần PvP mỗi ngày */
    daily_pvp: 10,
    /** Số lần luyện đan mỗi ngày */
    daily_alchemy: 20,
    /** Tinh thạch bắt đầu */
    starting_spirit_stones: 100,
    /** HP khởi đầu */
    starting_hp: 100,
    /** Mana khởi đầu */
    starting_mana: 50,
    /** ATK khởi đầu */
    starting_atk: 10,
    /** DEF khởi đầu */
    starting_def: 5,
    /** Speed khởi đầu */
    starting_speed: 10,
  },

  /** Hệ số game */
  rates: {
    /** Tỉ lệ bạo kích (crit) cơ bản */
    base_crit_rate: 0.05,
    /** Sát thương bạo kích */
    crit_damage_multiplier: 1.5,
    /** Tỉ lệ rơi đồ cơ bản */
    base_drop_rate: 0.3,
    /** Bonus exp cho combo ngày liên tiếp */
    daily_streak_bonus: 0.05,
    /** Exp bonus tối đa từ streak */
    max_streak_bonus: 0.5,
    /** Tỉ lệ thành công cường hóa trang bị cơ bản */
    enhance_base_rate: 0.9,
    /** Giảm tỉ lệ mỗi cấp cường hóa */
    enhance_rate_decay: 0.05,
    /** Phí giao dịch chợ (%) */
    market_tax: 0.05,
    /** Hệ số PvP exp */
    pvp_exp_rate: 0.5,
  },

  /** Cấu hình hiển thị */
  display: {
    /** Số item mỗi trang */
    items_per_page: 10,
    /** Thời gian tự xóa tin nhắn lỗi (ms) */
    error_delete_timeout: 10000,
    /** Thời gian chờ phản hồi interaction (ms) */
    interaction_timeout: 60000,
    /** Thanh tiến trình */
    progress_bar_length: 20,
    progress_bar_filled: '█',
    progress_bar_empty: '░',
  },

  /** Hệ thống bang hội (sẽ mở rộng sau) */
  guild: {
    create_cost: 10000,
    max_members: 50,
    name_min_length: 2,
    name_max_length: 20,
  },
};
