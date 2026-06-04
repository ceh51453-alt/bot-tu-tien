const db = require('./connection');

function initSchema() {
    db.exec(`
        -- Bảng người chơi chính
        CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            discord_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            spiritual_root TEXT,
            root_type TEXT,
            constitution TEXT,
            dao_path TEXT,
            technique_id INTEGER,
            realm_index INTEGER DEFAULT 0,
            sub_realm INTEGER DEFAULT 1,
            exp INTEGER DEFAULT 0,
            hp INTEGER DEFAULT 100,
            max_hp INTEGER DEFAULT 100,
            atk INTEGER DEFAULT 10,
            def INTEGER DEFAULT 5,
            speed INTEGER DEFAULT 10,
            mana INTEGER DEFAULT 50,
            max_mana INTEGER DEFAULT 50,
            linh_thach INTEGER DEFAULT 100,
            tien_thach INTEGER DEFAULT 0,
            cong_duc INTEGER DEFAULT 0,
            weapon_type TEXT DEFAULT NULL,
            ngo_tinh INTEGER DEFAULT 100,
            van_khi INTEGER DEFAULT 80,
            age INTEGER DEFAULT 16,
            danh_vong INTEGER DEFAULT 0,
            dao_tam INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_cultivate DATETIME,
            last_mine DATETIME,
            is_dead INTEGER DEFAULT 0
        );

        -- Kỹ năng đã trang bị (slot 1-4: chủ động, 5-6: bị động)
        CREATE TABLE IF NOT EXISTS player_skills (
            player_id INTEGER NOT NULL,
            skill_id INTEGER NOT NULL,
            slot INTEGER NOT NULL CHECK(slot BETWEEN 1 AND 6),
            level INTEGER DEFAULT 1,
            cooldown_remaining INTEGER DEFAULT 0,
            PRIMARY KEY (player_id, slot),
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        );

        -- Tất cả kỹ năng đã học
        CREATE TABLE IF NOT EXISTS learned_skills (
            player_id INTEGER NOT NULL,
            skill_id INTEGER NOT NULL,
            level INTEGER DEFAULT 1,
            PRIMARY KEY (player_id, skill_id),
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        );

        -- Linh thú của người chơi
        CREATE TABLE IF NOT EXISTS player_pets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER NOT NULL,
            pet_id INTEGER NOT NULL,
            name TEXT,
            level INTEGER DEFAULT 1,
            exp INTEGER DEFAULT 0,
            hp INTEGER DEFAULT 50,
            atk INTEGER DEFAULT 5,
            def INTEGER DEFAULT 3,
            is_active INTEGER DEFAULT 0,
            evolved INTEGER DEFAULT 0,
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        );

        -- Đạo luật đã lĩnh ngộ
        CREATE TABLE IF NOT EXISTS player_dao_laws (
            player_id INTEGER NOT NULL,
            law_id INTEGER NOT NULL,
            level INTEGER DEFAULT 1 CHECK(level BETWEEN 1 AND 10),
            PRIMARY KEY (player_id, law_id),
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        );

        -- Trang bị đang mặc
        CREATE TABLE IF NOT EXISTS player_equipment (
            player_id INTEGER NOT NULL,
            slot TEXT NOT NULL CHECK(slot IN ('weapon', 'armor', 'accessory', 'artifact')),
            equipment_id INTEGER NOT NULL,
            enhance_level INTEGER DEFAULT 0,
            PRIMARY KEY (player_id, slot),
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        );

        -- Kho đồ
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER NOT NULL,
            item_id INTEGER NOT NULL,
            quantity INTEGER DEFAULT 1,
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        );

        -- Nhiệm vụ đang làm và đã hoàn thành
        CREATE TABLE IF NOT EXISTS player_quests (
            player_id INTEGER NOT NULL,
            quest_id TEXT NOT NULL,
            status TEXT DEFAULT 'active', -- 'active' hoặc 'completed'
            progress INTEGER DEFAULT 0,
            completed_at DATETIME,
            PRIMARY KEY (player_id, quest_id),
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        );

        -- Bang phái
        CREATE TABLE IF NOT EXISTS sects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            leader_id INTEGER NOT NULL,
            level INTEGER DEFAULT 1,
            treasury INTEGER DEFAULT 0,
            max_members INTEGER DEFAULT 20,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (leader_id) REFERENCES players(id) ON DELETE CASCADE
        );

        -- Thành viên bang phái
        CREATE TABLE IF NOT EXISTS sect_members (
            player_id INTEGER PRIMARY KEY,
            sect_id INTEGER NOT NULL,
            role TEXT DEFAULT 'member',
            contribution INTEGER DEFAULT 0,
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
            FOREIGN KEY (sect_id) REFERENCES sects(id) ON DELETE CASCADE
        );

        -- Hảo cảm NPC
        CREATE TABLE IF NOT EXISTS npc_affinity (
            player_id INTEGER NOT NULL,
            npc_id TEXT NOT NULL,
            affinity INTEGER DEFAULT 0,
            PRIMARY KEY (player_id, npc_id),
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        );

        -- Giao dịch giữa người chơi
        CREATE TABLE IF NOT EXISTS player_trades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            offer_linh_thach INTEGER DEFAULT 0,
            offer_item_id TEXT,
            offer_item_qty INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
            channel_id TEXT,
            message_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES players(id) ON DELETE CASCADE,
            FOREIGN KEY (receiver_id) REFERENCES players(id) ON DELETE CASCADE
        );

        -- Đấu giá vật phẩm (Tụ Bảo Các)
        CREATE TABLE IF NOT EXISTS auction_listings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            seller_id INTEGER NOT NULL,
            item_id TEXT NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            price INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (seller_id) REFERENCES players(id) ON DELETE CASCADE
        );

        -- Cooldown hệ thống
        CREATE TABLE IF NOT EXISTS cooldowns (
            player_id INTEGER NOT NULL,
            action_type TEXT NOT NULL,
            expires_at DATETIME NOT NULL,
            PRIMARY KEY (player_id, action_type),
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        );

        -- Index để tăng tốc truy vấn
        CREATE INDEX IF NOT EXISTS idx_players_discord_id ON players(discord_id);
        CREATE INDEX IF NOT EXISTS idx_inventory_player ON inventory(player_id);
        CREATE INDEX IF NOT EXISTS idx_sect_members_sect ON sect_members(sect_id);
        CREATE INDEX IF NOT EXISTS idx_cooldowns_player ON cooldowns(player_id);
        CREATE INDEX IF NOT EXISTS idx_player_pets_player ON player_pets(player_id);
        CREATE INDEX IF NOT EXISTS idx_learned_skills_player ON learned_skills(player_id);

        -- ═══════════════════════════════════════
        -- Skill Slots (Võ Kỹ / Thân Pháp / Tuyệt Kỹ / Thần Thông)
        -- ═══════════════════════════════════════
        CREATE TABLE IF NOT EXISTS player_skill_slots (
            player_id INTEGER NOT NULL,
            slot_type TEXT NOT NULL CHECK(slot_type IN ('vo_ky','than_phap','tuyet_ky','than_thong')),
            skill_id TEXT NOT NULL,
            skill_level INTEGER DEFAULT 1,
            options_json TEXT,
            PRIMARY KEY (player_id, slot_type),
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_skill_slots_player ON player_skill_slots(player_id);

        -- ═══════════════════════════════════════
        -- Nghịch Thiên Cải Mệnh (Passive Traits)
        -- ═══════════════════════════════════════
        CREATE TABLE IF NOT EXISTS player_nghich_thien (
            player_id INTEGER NOT NULL,
            slot INTEGER NOT NULL CHECK(slot BETWEEN 1 AND 5),
            trait_id TEXT NOT NULL,
            PRIMARY KEY (player_id, slot),
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_nghich_thien_player ON player_nghich_thien(player_id);

        -- ═══════════════════════════════════════
        -- Tâm Pháp 6 Slots
        -- ═══════════════════════════════════════
        CREATE TABLE IF NOT EXISTS player_tam_phap (
            player_id INTEGER NOT NULL,
            slot_type TEXT NOT NULL CHECK(slot_type IN (
                'than_cong','dai_phap','bi_quyen','quyet','ngang','luc'
            )),
            tam_phap_id TEXT NOT NULL,
            level INTEGER DEFAULT 1,
            options_json TEXT,
            PRIMARY KEY (player_id, slot_type),
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_tam_phap_player ON player_tam_phap(player_id);

        -- ═══════════════════════════════════════
        -- Tiên Thiên Khí Vận (Birth Traits)
        -- ═══════════════════════════════════════
        CREATE TABLE IF NOT EXISTS player_tien_thien (
            player_id INTEGER NOT NULL,
            trait_id TEXT NOT NULL,
            PRIMARY KEY (player_id, trait_id),
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_tien_thien_player ON player_tien_thien(player_id);

        -- ═══════════════════════════════════════
        -- Đạo Tâm (Dao Heart)
        -- ═══════════════════════════════════════
        CREATE TABLE IF NOT EXISTS player_dao_tam (
            player_id INTEGER PRIMARY KEY,
            dao_tam_id TEXT NOT NULL,
            kien_dinh INTEGER DEFAULT 100,
            trang_thai TEXT DEFAULT 'moi_sinh',
            acquired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        );

        -- ═══════════════════════════════════════
        -- Hậu Thiên Khí Vận (Temporary Buffs)
        -- ═══════════════════════════════════════
        CREATE TABLE IF NOT EXISTS player_hau_thien (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER NOT NULL,
            khi_van_id TEXT NOT NULL,
            stacks INTEGER DEFAULT 1,
            expires_at DATETIME,
            source TEXT,
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_hau_thien_player ON player_hau_thien(player_id);
        CREATE INDEX IF NOT EXISTS idx_hau_thien_expires ON player_hau_thien(expires_at);

        -- ═══════════════════════════════════════
        -- Khí Vận Active (Interactive Cultivation buffs)
        -- ═══════════════════════════════════════
        CREATE TABLE IF NOT EXISTS player_khi_van (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER NOT NULL,
            khi_van_id TEXT NOT NULL,
            applied_at INTEGER NOT NULL,
            expires_at INTEGER NOT NULL,
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_khi_van_player ON player_khi_van(player_id);
        CREATE INDEX IF NOT EXISTS idx_khi_van_expires ON player_khi_van(expires_at);

        -- ═══════════════════════════════════════
        -- Bế Quan Tu Luyện (AFK Cultivation)
        -- ═══════════════════════════════════════
        CREATE TABLE IF NOT EXISTS player_afk_cultivation (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER NOT NULL,
            started_at INTEGER NOT NULL,
            ended_at INTEGER,
            status TEXT DEFAULT 'active',
            base_exp_rate INTEGER DEFAULT 1,
            total_exp INTEGER DEFAULT 0,
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_afk_player ON player_afk_cultivation(player_id);
    `);
}

module.exports = { initSchema };
