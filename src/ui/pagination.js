const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { EMOJIS, COLORS } = require('../utils/constants');

/**
 * Tạo embed phân trang với nút prev/next
 * @param {Array} items - Toàn bộ danh sách
 * @param {number} page - Trang hiện tại (bắt đầu từ 0)
 * @param {number} perPage - Số item mỗi trang
 * @param {Function} embedBuilder - Hàm tạo embed từ items trên trang (items, page, totalPages) => EmbedBuilder
 * @param {string} prefix - Prefix cho custom ID (e.g., 'inventory', 'leaderboard')
 * @returns {{ embed: EmbedBuilder, components: ActionRowBuilder[] }}
 */
function createPagination(items, page, perPage, embedBuilder, prefix = 'page') {
    const totalPages = Math.max(1, Math.ceil(items.length / perPage));
    const currentPage = Math.max(0, Math.min(page, totalPages - 1));

    const start = currentPage * perPage;
    const end = Math.min(start + perPage, items.length);
    const pageItems = items.slice(start, end);

    const embed = embedBuilder(pageItems, currentPage, totalPages);

    // Footer hiển thị trang
    const footerText = embed.data.footer?.text
        ? `${embed.data.footer.text} | Trang ${currentPage + 1}/${totalPages}`
        : `Trang ${currentPage + 1}/${totalPages}`;
    embed.setFooter({ text: footerText });

    // Nút phân trang
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`${prefix}:first`)
            .setEmoji('⏮️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage === 0),
        new ButtonBuilder()
            .setCustomId(`${prefix}:prev`)
            .setEmoji(EMOJIS.BACK)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === 0),
        new ButtonBuilder()
            .setCustomId(`${prefix}:info`)
            .setLabel(`${currentPage + 1}/${totalPages}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        new ButtonBuilder()
            .setCustomId(`${prefix}:next`)
            .setEmoji(EMOJIS.NEXT)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage >= totalPages - 1),
        new ButtonBuilder()
            .setCustomId(`${prefix}:last`)
            .setEmoji('⏭️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage >= totalPages - 1),
    );

    return { embed, components: [row] };
}

/**
 * Xử lý interaction phân trang
 * @param {Object} interaction - Button interaction
 * @param {string} action - Hành động (first, prev, next, last)
 * @param {number} currentPage - Trang hiện tại
 * @param {number} totalPages - Tổng số trang
 * @returns {number} - Trang mới
 */
function handlePaginationAction(action, currentPage, totalPages) {
    switch (action) {
        case 'first': return 0;
        case 'prev':  return Math.max(0, currentPage - 1);
        case 'next':  return Math.min(totalPages - 1, currentPage + 1);
        case 'last':  return totalPages - 1;
        default:      return currentPage;
    }
}

module.exports = {
    createPagination,
    handlePaginationAction,
};
