const logger = require('../utils/logger');
const { createErrorEmbed } = require('../ui/embeds');
const { handleButton, handleSelectMenu, handleModal } = require('../handlers/interaction');

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction) {
        try {
            // ══════════════════════════════════
            // Slash Commands
            // ══════════════════════════════════
            if (interaction.isChatInputCommand()) {
                const commandName = interaction.commandName;

                if (commandName === 'tutien') {
                    // Dynamic import để tránh circular dependency
                    const tutienCommand = require('../commands/tutien');
                    await tutienCommand.execute(interaction);
                } else {
                    logger.warn(`Lệnh không xác định: ${commandName}`);
                }
                return;
            }

            // ══════════════════════════════════
            // Button Interactions
            // ══════════════════════════════════
            if (interaction.isButton()) {
                await handleButton(interaction);
                return;
            }

            // ══════════════════════════════════
            // Select Menu Interactions
            // ══════════════════════════════════
            if (interaction.isStringSelectMenu()) {
                await handleSelectMenu(interaction);
                return;
            }

            // ══════════════════════════════════
            // Modal Submissions
            // ══════════════════════════════════
            if (interaction.isModalSubmit()) {
                await handleModal(interaction);
                return;
            }

        } catch (err) {
            logger.error(`Lỗi xử lý interaction [${interaction.id}]:`, err.message);
            logger.error(err.stack);

            // Gửi thông báo lỗi cho người dùng
            const errorEmbed = createErrorEmbed(
                'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.'
            );

            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            } catch (replyErr) {
                logger.error('Không thể gửi thông báo lỗi:', replyErr.message);
            }
        }
    },
};
