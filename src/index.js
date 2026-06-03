// Tải biến môi trường trước tiên
require('dotenv').config();

const client = require('./bot');
const logger = require('./utils/logger');
const { loadHandlers } = require('./handlers/interaction');

// ══════════════════════════════════
// Tải Event Handlers
// ══════════════════════════════════
const fs = require('fs');
const path = require('path');

const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

    for (const file of eventFiles) {
        const event = require(path.join(eventsPath, file));

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }

        logger.info(`✦ Đã tải event: ${event.name}`);
    }
}

// ══════════════════════════════════
// Tải Interaction Handlers
// ══════════════════════════════════
loadHandlers();

// ══════════════════════════════════
// Xử lý lỗi toàn cục
// ══════════════════════════════════
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
});

// ══════════════════════════════════
// Đăng nhập Bot
// ══════════════════════════════════
const token = process.env.DISCORD_TOKEN;

if (!token) {
    logger.error('DISCORD_TOKEN không được tìm thấy trong biến môi trường!');
    logger.error('Hãy tạo file .env với DISCORD_TOKEN=your_token_here');
    process.exit(1);
}

client.login(token)
    .then(() => logger.info('Đang kết nối đến Discord...'))
    .catch((err) => {
        logger.error('Không thể đăng nhập:', err.message);
        process.exit(1);
    });
