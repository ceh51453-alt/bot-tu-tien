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
