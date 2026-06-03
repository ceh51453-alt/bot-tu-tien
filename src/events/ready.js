const { ActivityType } = require('discord.js');
const logger = require('../utils/logger');
const { initSchema } = require('../database/schema');
const { runMigrations } = require('../database/migrations');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        logger.success(`✦ Bot đã đăng nhập: ${client.user.tag}`);
        logger.info(`✦ Đang phục vụ ${client.guilds.cache.size} server(s)`);
        logger.info(`✦ Tổng ${client.users.cache.size} user(s) trong cache`);

        // Đặt trạng thái hoạt động
        client.user.setPresence({
            activities: [{
                name: '/tutien | Tu Tiên Giới',
                type: ActivityType.Playing,
            }],
            status: 'online',
        });

        // Khởi tạo database
        try {
            initSchema();
            logger.success('✦ Database schema đã khởi tạo');

            runMigrations();
            logger.success('✦ Database migrations hoàn tất');

            // Khởi chạy scheduler nền
            const { startScheduler } = require('../systems/scheduler');
            startScheduler(client);
        } catch (err) {
            logger.error('✗ Lỗi khởi tạo database:', err.message);
            process.exit(1);
        }

        logger.success('══════════════════════════════════');
        logger.success('  Tu Tiên Bot sẵn sàng hoạt động!');
        logger.success('══════════════════════════════════');
    },
};
