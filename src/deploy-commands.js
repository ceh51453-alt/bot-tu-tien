require('dotenv').config();

const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const logger = require('./utils/logger');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId) {
    logger.error('Cần DISCORD_TOKEN và CLIENT_ID trong file .env');
    process.exit(1);
}

// ══════════════════════════════════
// Định nghĩa lệnh /tutien
// ══════════════════════════════════
const commands = [
    new SlashCommandBuilder()
        .setName('tutien')
        .setDescription('🌸 Mở Tu Tiên Giới - Bắt đầu hành trình tu luyện!')
        .toJSON(),
];

// ══════════════════════════════════
// Đăng ký lệnh
// ══════════════════════════════════
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        logger.info('Đang đăng ký slash commands...');

        if (guildId) {
            // Đăng ký cho guild cụ thể (nhanh hơn, dùng khi dev)
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands }
            );
            logger.success(`✦ Đã đăng ký ${commands.length} lệnh cho guild ${guildId}`);
        } else {
            // Đăng ký global (mất 1 giờ để cập nhật)
            await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands }
            );
            logger.success(`✦ Đã đăng ký ${commands.length} lệnh global`);
        }

        logger.info('Hoàn tất! Lệnh /tutien đã sẵn sàng.');
    } catch (err) {
        logger.error('Lỗi đăng ký commands:', err);
    }
})();
