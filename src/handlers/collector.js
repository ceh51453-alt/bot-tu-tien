const { INTERACTION_TIMEOUT } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Tạo button collector cho interaction
 * @param {import('discord.js').ChatInputCommandInteraction|import('discord.js').MessageComponentInteraction} interaction
 * @param {Object} options
 * @param {number} [options.timeout] - Thời gian timeout (ms), mặc định 5 phút
 * @param {Function} [options.filter] - Hàm filter tùy chỉnh
 * @param {number} [options.max] - Số lần tối đa thu thập
 * @returns {import('discord.js').InteractionCollector}
 */
function createButtonCollector(interaction, options = {}) {
    const {
        timeout = INTERACTION_TIMEOUT,
        filter = (i) => i.user.id === interaction.user.id,
        max,
    } = options;

    const message = interaction.message || interaction;

    const collectorOptions = {
        filter,
        time: timeout,
        componentType: 2, // ComponentType.Button
    };

    if (max) collectorOptions.max = max;

    const collector = message.createMessageComponentCollector(collectorOptions);

    collector.on('end', (collected, reason) => {
        if (reason === 'time') {
            logger.debug(`Button collector timeout cho user ${interaction.user.id}`);
        }
    });

    return collector;
}

/**
 * Tạo select menu collector cho interaction
 * @param {import('discord.js').ChatInputCommandInteraction|import('discord.js').MessageComponentInteraction} interaction
 * @param {Object} options
 * @param {number} [options.timeout] - Thời gian timeout (ms)
 * @param {Function} [options.filter] - Hàm filter tùy chỉnh
 * @param {number} [options.max] - Số lần tối đa thu thập
 * @returns {import('discord.js').InteractionCollector}
 */
function createSelectCollector(interaction, options = {}) {
    const {
        timeout = INTERACTION_TIMEOUT,
        filter = (i) => i.user.id === interaction.user.id,
        max,
    } = options;

    const message = interaction.message || interaction;

    const collectorOptions = {
        filter,
        time: timeout,
        componentType: 3, // ComponentType.StringSelect
    };

    if (max) collectorOptions.max = max;

    const collector = message.createMessageComponentCollector(collectorOptions);

    collector.on('end', (collected, reason) => {
        if (reason === 'time') {
            logger.debug(`Select collector timeout cho user ${interaction.user.id}`);
        }
    });

    return collector;
}

module.exports = {
    createButtonCollector,
    createSelectCollector,
};
