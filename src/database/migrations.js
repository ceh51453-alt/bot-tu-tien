const db = require('./connection');
const logger = require('../utils/logger');

// Danh sách migration theo thứ tự
const migrations = [
    {
        version: 1,
        name: 'initial_schema',
        up: () => {
            // Schema ban đầu đã được tạo trong schema.js
            // Migration này chỉ đánh dấu version
        }
    },
    // Thêm migration mới ở đây:
    {
        version: 2,
        name: 'add_trade_message_tracking',
        up: () => {
            try {
                db.exec(`ALTER TABLE player_trades ADD COLUMN channel_id TEXT;`);
            } catch (err) {
                if (!err.message.includes('duplicate column name')) throw err;
            }
            try {
                db.exec(`ALTER TABLE player_trades ADD COLUMN message_id TEXT;`);
            } catch (err) {
                if (!err.message.includes('duplicate column name')) throw err;
            }
        }
    },
    // Migration v3: World Boss Raid tables
    {
        version: 3,
        name: 'add_world_boss_tables',
        up: () => {
            db.exec(`
                CREATE TABLE IF NOT EXISTS world_boss_raids (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    boss_id TEXT NOT NULL,
                    boss_name TEXT NOT NULL,
                    max_hp INTEGER NOT NULL,
                    current_hp INTEGER NOT NULL,
                    channel_id TEXT,
                    status TEXT DEFAULT 'active',
                    spawned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    ended_at DATETIME
                );

                CREATE TABLE IF NOT EXISTS world_boss_contributions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    raid_id INTEGER NOT NULL,
                    player_id INTEGER NOT NULL,
                    damage_dealt INTEGER DEFAULT 0,
                    contribution_percent INTEGER DEFAULT 0,
                    exp_reward INTEGER DEFAULT 0,
                    gold_reward INTEGER DEFAULT 0,
                    FOREIGN KEY (raid_id) REFERENCES world_boss_raids(id),
                    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
                );

                CREATE INDEX IF NOT EXISTS idx_wb_contributions_raid ON world_boss_contributions(raid_id);
                CREATE INDEX IF NOT EXISTS idx_wb_contributions_player ON world_boss_contributions(player_id);
            `);
        }
    },
    // Migration v4: Nâng cấp hệ thống chiến kỹ — Phase 1-5
    {
        version: 4,
        name: 'qcbh_weapon_types_and_character_expansion',
        up: () => {
            // ═══ Phase 1: Weapon Types — Thêm cột weapon_type cho players ═══
            const playerColumns = [
                { col: 'weapon_type', def: "ALTER TABLE players ADD COLUMN weapon_type TEXT DEFAULT NULL;" },
                { col: 'ngo_tinh', def: "ALTER TABLE players ADD COLUMN ngo_tinh INTEGER DEFAULT 100;" },
                { col: 'van_khi', def: "ALTER TABLE players ADD COLUMN van_khi INTEGER DEFAULT 80;" },
                { col: 'age', def: "ALTER TABLE players ADD COLUMN age INTEGER DEFAULT 16;" },
                { col: 'danh_vong', def: "ALTER TABLE players ADD COLUMN danh_vong INTEGER DEFAULT 0;" },
                { col: 'dao_tam', def: "ALTER TABLE players ADD COLUMN dao_tam INTEGER DEFAULT 0;" },
            ];
            for (const { col, def } of playerColumns) {
                try {
                    db.exec(def);
                } catch (err) {
                    if (!err.message.includes('duplicate column name')) throw err;
                }
            }

            // ═══ Phase 2: Skill 4 Slots ═══
            db.exec(`
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
            `);

            // ═══ Phase 3: Nghịch Thiên Cải Mệnh ═══
            db.exec(`
                CREATE TABLE IF NOT EXISTS player_nghich_thien (
                    player_id INTEGER NOT NULL,
                    slot INTEGER NOT NULL CHECK(slot BETWEEN 1 AND 5),
                    trait_id TEXT NOT NULL,
                    PRIMARY KEY (player_id, slot),
                    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
                );
                CREATE INDEX IF NOT EXISTS idx_nghich_thien_player ON player_nghich_thien(player_id);
            `);

            // ═══ Phase 4: Tâm Pháp 6 Slots ═══
            db.exec(`
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
            `);

            // ═══ Phase 5: Tiên Thiên Khí Vận ═══
            db.exec(`
                CREATE TABLE IF NOT EXISTS player_tien_thien (
                    player_id INTEGER NOT NULL,
                    trait_id TEXT NOT NULL,
                    PRIMARY KEY (player_id, trait_id),
                    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
                );
                CREATE INDEX IF NOT EXISTS idx_tien_thien_player ON player_tien_thien(player_id);
            `);
        }
    },
    // Migration v5: Phase 8 — Ngự Kiếm (location tracking)
    {
        version: 5,
        name: 'add_ngu_kiem_location',
        up: () => {
            // Cột current_location cho hệ thống ngự kiếm
            try {
                db.exec(`ALTER TABLE players ADD COLUMN current_location TEXT DEFAULT 'tieu_nhan_tran';`);
            } catch (err) {
                if (!err.message.includes('duplicate column name')) throw err;
            }
        }
    },
    // Migration v6: Đạo Tâm + Stats phụ + Hậu Thiên Khí Vận
    {
        version: 6,
        name: 'dao_tam_secondary_stats_hau_thien',
        up: () => {
            // ═══ A: Thêm stats phụ vào players ═══
            const newCols = [
                { col: 'mi_luc',       def: "ALTER TABLE players ADD COLUMN mi_luc INTEGER DEFAULT 100;" },
                { col: 'cuoc_luc',     def: "ALTER TABLE players ADD COLUMN cuoc_luc INTEGER DEFAULT 100;" },
                { col: 'tho_menh',     def: "ALTER TABLE players ADD COLUMN tho_menh INTEGER DEFAULT 100;" },
                { col: 'hoi_tam',      def: "ALTER TABLE players ADD COLUMN hoi_tam INTEGER DEFAULT 10;" },
                { col: 'ho_tam',       def: "ALTER TABLE players ADD COLUMN ho_tam INTEGER DEFAULT 10;" },
                { col: 'tinh_luc',     def: "ALTER TABLE players ADD COLUMN tinh_luc INTEGER DEFAULT 100;" },
                { col: 'tinh_luc_max', def: "ALTER TABLE players ADD COLUMN tinh_luc_max INTEGER DEFAULT 100;" },
                { col: 'tam_tinh',     def: "ALTER TABLE players ADD COLUMN tam_tinh INTEGER DEFAULT 100;" },
                { col: 'tam_tinh_max', def: "ALTER TABLE players ADD COLUMN tam_tinh_max INTEGER DEFAULT 100;" },
                { col: 'the_chat',     def: "ALTER TABLE players ADD COLUMN the_chat INTEGER DEFAULT 100;" },
                { col: 'niem_luc',     def: "ALTER TABLE players ADD COLUMN niem_luc INTEGER DEFAULT 200;" },
                { col: 'niem_luc_max', def: "ALTER TABLE players ADD COLUMN niem_luc_max INTEGER DEFAULT 200;" },
                { col: 'ma_dao',       def: "ALTER TABLE players ADD COLUMN ma_dao INTEGER DEFAULT 0;" },
                { col: 'chinh_dao',    def: "ALTER TABLE players ADD COLUMN chinh_dao INTEGER DEFAULT 0;" },
                { col: 'di_toc',       def: "ALTER TABLE players ADD COLUMN di_toc INTEGER DEFAULT 10;" },
                { col: 'bao_kich',     def: "ALTER TABLE players ADD COLUMN bao_kich INTEGER DEFAULT 100;" },
                { col: 'dao_diem',     def: "ALTER TABLE players ADD COLUMN dao_diem INTEGER DEFAULT 0;" },
            ];
            for (const { col, def } of newCols) {
                try { db.exec(def); } catch (err) {
                    if (!err.message.includes('duplicate column name')) throw err;
                }
            }

            // ═══ B: Bảng Đạo Tâm ═══
            db.exec(`
                CREATE TABLE IF NOT EXISTS player_dao_tam (
                    player_id INTEGER PRIMARY KEY,
                    dao_tam_id TEXT NOT NULL,
                    kien_dinh INTEGER DEFAULT 100,
                    trang_thai TEXT DEFAULT 'moi_sinh',
                    acquired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
                );
            `);

            // ═══ C: Bảng Hậu Thiên Khí Vận (buff/debuff tạm thời) ═══
            db.exec(`
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
            `);
        }
    },
    // Migration v7: Interactive Cultivation + Bế Quan + Khí Vận mới
    {
        version: 7,
        name: 'interactive_cultivation_be_quan_khi_van',
        up: () => {
            // ═══ A: Bảng Khí Vận mới (dùng cho hệ thống interactive) ═══
            db.exec(`
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
            `);

            // ═══ B: Bảng Bế Quan Tu Luyện (AFK Cultivation) ═══
            db.exec(`
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
    },
];

function runMigrations() {
    // Tạo bảng theo dõi migration
    db.exec(`
        CREATE TABLE IF NOT EXISTS migrations (
            version INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    const getCurrentVersion = db.prepare('SELECT MAX(version) as version FROM migrations');
    const insertMigration = db.prepare('INSERT INTO migrations (version, name) VALUES (?, ?)');

    const current = getCurrentVersion.get();
    const currentVersion = current?.version || 0;

    const pending = migrations.filter(m => m.version > currentVersion);

    if (pending.length === 0) {
        logger.info('Database đã cập nhật, không có migration mới.');
        return;
    }

    // Chạy migration trong transaction
    const runAll = db.transaction(() => {
        for (const migration of pending) {
            logger.info(`Đang chạy migration v${migration.version}: ${migration.name}`);
            try {
                migration.up();
                insertMigration.run(migration.version, migration.name);
                logger.info(`✓ Migration v${migration.version} thành công`);
            } catch (err) {
                logger.error(`✗ Migration v${migration.version} thất bại: ${err.message}`);
                throw err; // Rollback toàn bộ transaction
            }
        }
    });

    runAll();
    logger.info(`Đã chạy ${pending.length} migration thành công.`);
}

module.exports = { runMigrations };
