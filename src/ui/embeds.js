const { EmbedBuilder } = require('discord.js');
const { COLORS, EMOJIS } = require('../utils/constants');
const { formatNumber, progressBar } = require('../utils/helpers');

/**
 * Embed menu chính - hiển thị sau khi /tutien
 */
function createMainMenuEmbed(player) {
    const realms = require('../../config/realms');
    const realm = realms.list[player.realm_index];
    const realmName = realm ? `${realm.emoji} ${realm.name}` : '🌟 Chí Tôn';
    const realmTier = realm ? realm.tier : 'ĐỈNH PHONG';
    const daoEmoji = player.dao_path === 'ma' ? '😈' : '☀️';
    const daoName = player.dao_path === 'ma' ? 'Ma Đạo' : 'Chính Đạo';

    const embed = new EmbedBuilder()
        .setColor(COLORS.CULTIVATION)
        .setTitle(`${EMOJIS.DAO} ── Tu Tiên Giới ── ${EMOJIS.DAO}`)
        .setDescription(
            `${daoEmoji} **${player.name}** — ${daoName}\n` +
            `${realmName} Tầng ${player.sub_realm} ║ ${realmTier}\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━`
        )
        .addFields(
            {
                name: `${EMOJIS.EXP} Tu Vi`,
                value: formatNumber(player.exp),
                inline: true,
            },
            {
                name: `${EMOJIS.LINH_THACH} Linh Thạch`,
                value: formatNumber(player.linh_thach),
                inline: true,
            },
            {
                name: `${EMOJIS.SWORD} Chiến Lực`,
                value: formatNumber(player.atk + player.def + player.speed),
                inline: true,
            },
            {
                name: `${EMOJIS.HP} Sinh Lực`,
                value: `${formatNumber(player.hp)}/${formatNumber(player.max_hp)}\n${progressBar(player.hp, player.max_hp)}`,
                inline: true,
            },
            {
                name: `${EMOJIS.MANA} Linh Lực`,
                value: `${formatNumber(player.mana)}/${formatNumber(player.max_mana)}\n${progressBar(player.mana, player.max_mana)}`,
                inline: true,
            },
            {
                name: '\u200b',
                value: '\u200b',
                inline: true,
            }
        )
        .setFooter({ text: '🌸 Tu Tiên Chi Lộ — Hành trình vạn dặm bắt đầu từ một bước' })
        .setTimestamp()
        .setImage('attachment://main_menu.png');

    return embed;
}

/**
 * Embed thông tin nhân vật
 */
function createProfileEmbed(player) {
    const embed = new EmbedBuilder()
        .setColor(COLORS.PROFILE)
        .setTitle(`${EMOJIS.STAR} ── Thông Tin Nhân Vật ── ${EMOJIS.STAR}`)
        .setDescription(`**${player.name}** - ${player.dao_path === 'chinh' ? `${EMOJIS.CHINH_DAO} Chính Đạo` : `${EMOJIS.MA_DAO} Ma Đạo`}`)
        .addFields(
            {
                name: `${EMOJIS.SPIRITUAL_ROOT} Linh Căn`,
                value: player.spiritual_root || 'Chưa xác định',
                inline: true,
            },
            {
                name: `${EMOJIS.CONSTITUTION} Thể Chất`,
                value: player.constitution || 'Phàm Thể',
                inline: true,
            },
            {
                name: `${EMOJIS.REALM} Cảnh Giới`,
                value: `Tầng ${player.realm_index} - Tầng ${player.sub_realm}`,
                inline: true,
            },
            {
                name: '━━━ Chỉ Số ━━━',
                value: [
                    `${EMOJIS.HP} **HP:** ${formatNumber(player.hp)}/${formatNumber(player.max_hp)} ${progressBar(player.hp, player.max_hp, 8)}`,
                    `${EMOJIS.MANA} **Mana:** ${formatNumber(player.mana)}/${formatNumber(player.max_mana)} ${progressBar(player.mana, player.max_mana, 8)}`,
                    `${EMOJIS.ATK} **Công:** ${formatNumber(player.atk)}`,
                    `${EMOJIS.DEF} **Thủ:** ${formatNumber(player.def)}`,
                    `${EMOJIS.SPEED} **Tốc:** ${formatNumber(player.speed)}`,
                ].join('\n'),
                inline: false,
            },
            {
                name: '━━━ Tài Sản ━━━',
                value: [
                    `${EMOJIS.LINH_THACH} **Linh Thạch:** ${formatNumber(player.linh_thach)}`,
                    `${EMOJIS.TIEN_THACH} **Tiên Thạch:** ${formatNumber(player.tien_thach)}`,
                    `${EMOJIS.CONG_DUC} **Công Đức:** ${formatNumber(player.cong_duc)}`,
                ].join('\n'),
                inline: false,
            }
        )
        .setFooter({ text: `ID: ${player.discord_id}` })
        .setTimestamp();

    return embed;
}

/**
 * Embed chiến đấu
 */
function createCombatEmbed(player, enemy, turn) {
    const embed = new EmbedBuilder()
        .setColor(COLORS.COMBAT)
        .setTitle(`${EMOJIS.SWORD} ── Chiến Đấu ── ${EMOJIS.SWORD}`)
        .setDescription(`**Lượt ${turn}** - Hãy chọn hành động!`)
        .addFields(
            {
                name: `${EMOJIS.STAR} ${player.name}`,
                value: [
                    `${EMOJIS.HP} ${progressBar(player.hp, player.max_hp, 12)} ${formatNumber(player.hp)}/${formatNumber(player.max_hp)}`,
                    `${EMOJIS.MANA} ${progressBar(player.mana, player.max_mana, 12)} ${formatNumber(player.mana)}/${formatNumber(player.max_mana)}`,
                ].join('\n'),
                inline: false,
            },
            {
                name: `${EMOJIS.MONSTER} ${enemy.name}`,
                value: [
                    `${EMOJIS.HP} ${progressBar(enemy.hp, enemy.max_hp, 12)} ${formatNumber(enemy.hp)}/${formatNumber(enemy.max_hp)}`,
                    `${EMOJIS.ATK} Công: ${formatNumber(enemy.atk)} | ${EMOJIS.DEF} Thủ: ${formatNumber(enemy.def)}`,
                ].join('\n'),
                inline: false,
            }
        )
        .setFooter({ text: 'Chọn kỹ năng hoặc hành động bên dưới' })
        .setTimestamp();

    return embed;
}

/**
 * Embed tu luyện
 */
function createCultivationEmbed(player) {
    const embed = new EmbedBuilder()
        .setColor(COLORS.CULTIVATION)
        .setTitle(`${EMOJIS.CULTIVATION} ── Tu Luyện ── ${EMOJIS.CULTIVATION}`)
        .setDescription(
            `**${player.name}** đang tu luyện tại cảnh giới **Tầng ${player.realm_index} - Tầng ${player.sub_realm}**\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━`
        )
        .addFields(
            {
                name: `${EMOJIS.EXP} Tu Vi`,
                value: `${formatNumber(player.exp)} EXP`,
                inline: true,
            },
            {
                name: `${EMOJIS.TECHNIQUE} Công Pháp`,
                value: player.technique_id ? `#${player.technique_id}` : 'Chưa có',
                inline: true,
            },
            {
                name: `${EMOJIS.SPIRITUAL_ROOT} Linh Căn`,
                value: player.spiritual_root || 'Chưa xác định',
                inline: true,
            },
            {
                name: `${EMOJIS.FIRE} Tùy Chọn Tu Luyện`,
                value: [
                    `${EMOJIS.CULTIVATION} **Tu Luyện** - Tăng tu vi`,
                    `${EMOJIS.BREAKTHROUGH} **Đột Phá** - Thăng cảnh giới`,
                    `${EMOJIS.TECHNIQUE} **Công Pháp** - Quản lý công pháp`,
                    `${EMOJIS.SKILL} **Kỹ Năng** - Học và trang bị kỹ năng`,
                ].join('\n'),
                inline: false,
            }
        )
        .setFooter({ text: '🌸 Đạo pháp tự nhiên, thuận theo trời đất' })
        .setTimestamp();

    return embed;
}

/**
 * Embed thông báo lỗi
 */
function createErrorEmbed(message) {
    return new EmbedBuilder()
        .setColor(COLORS.ERROR)
        .setTitle(`${EMOJIS.CROSS} Lỗi`)
        .setDescription(message)
        .setTimestamp();
}

/**
 * Embed thông báo thành công
 */
function createSuccessEmbed(title, message) {
    return new EmbedBuilder()
        .setColor(COLORS.SUCCESS)
        .setTitle(`${EMOJIS.CHECK} ${title}`)
        .setDescription(message)
        .setTimestamp();
}

/**
 * Embed tạo nhân vật theo từng bước
 */
function createCharacterCreationEmbed(step, data = {}) {
    const steps = {
        welcome: new EmbedBuilder()
            .setColor(COLORS.CREATION)
            .setTitle(`${EMOJIS.STAR} ── Khai Mở Tu Tiên Chi Lộ ── ${EMOJIS.STAR}`)
            .setDescription(
                '```\n' +
                '╔══════════════════════════════════╗\n' +
                '║    CHÀO MỪNG ĐẾN TU TIÊN GIỚI   ║\n' +
                '╚══════════════════════════════════╝\n' +
                '```\n' +
                'Ngươi đã bước chân vào con đường tu tiên.\n' +
                'Hãy bắt đầu bằng việc chọn **tên đạo hiệu** của mình.\n\n' +
                `${EMOJIS.INFO} Nhấn nút bên dưới để bắt đầu.`
            )
            .setImage('attachment://welcome.png')
            .setFooter({ text: 'Bước 1/4 - Đặt Đạo Hiệu' }),

        name: new EmbedBuilder()
            .setColor(COLORS.CREATION)
            .setTitle(`${EMOJIS.SCROLL} Bước 1: Đạo Hiệu`)
            .setDescription(
                `Đạo hiệu: **${data.name || '???'}**\n\n` +
                'Tiếp theo, hãy chọn **Linh Căn** của ngươi.\n' +
                'Linh Căn quyết định hệ nguyên tố và tiềm năng tu luyện.'
            )
            .setFooter({ text: 'Bước 2/4 - Chọn Linh Căn' }),

        root: new EmbedBuilder()
            .setColor(COLORS.CREATION)
            .setTitle(`${EMOJIS.SPIRITUAL_ROOT} Bước 2: Linh Căn`)
            .setDescription(
                `Đạo hiệu: **${data.name || '???'}**\n` +
                `Linh Căn: **${data.spiritual_root || '???'}**\n\n` +
                `${EMOJIS.CONSTITUTION} Bây giờ hãy thử vận mệnh - **Roll Thể Chất**!\n` +
                'Thể chất ảnh hưởng đến chỉ số cơ bản của nhân vật.'
            )
            .setFooter({ text: 'Bước 3/4 - Roll Thể Chất' }),

        constitution: new EmbedBuilder()
            .setColor(COLORS.CREATION)
            .setTitle(`${EMOJIS.CONSTITUTION} Bước 3: Thể Chất`)
            .setDescription(
                `Đạo hiệu: **${data.name || '???'}**\n` +
                `Linh Căn: **${data.spiritual_root || '???'}**\n` +
                `Thể Chất: **${data.constitution || '???'}**\n\n` +
                `${EMOJIS.DAO} Cuối cùng, hãy chọn **Con Đường** tu luyện!`
            )
            .setFooter({ text: 'Bước 4/4 - Chọn Đạo Lộ' }),

        complete: new EmbedBuilder()
            .setColor(COLORS.GOLD)
            .setTitle(`${EMOJIS.FIRE} ── Khai Mở Thành Công! ── ${EMOJIS.FIRE}`)
            .setDescription(
                '```\n' +
                '╔══════════════════════════════════╗\n' +
                '║       THIÊN ĐẠO KHAI MỞ!        ║\n' +
                '╚══════════════════════════════════╝\n' +
                '```\n' +
                `${EMOJIS.STAR} **Đạo Hiệu:** ${data.name}\n` +
                `${EMOJIS.SPIRITUAL_ROOT} **Linh Căn:** ${data.spiritual_root}\n` +
                `${EMOJIS.CONSTITUTION} **Thể Chất:** ${data.constitution}\n` +
                `${EMOJIS.DAO} **Đạo Lộ:** ${data.dao_path === 'chinh' ? `${EMOJIS.CHINH_DAO} Chính Đạo` : `${EMOJIS.MA_DAO} Ma Đạo`}\n\n` +
                `Hành trình tu tiên của ngươi bắt đầu từ đây!\n` +
                `Dùng lệnh \`/tutien\` để mở menu chính.`
            )
            .setFooter({ text: '🌸 Vạn sự khởi đầu nan' }),
    };

    return steps[step] || steps.welcome;
}

module.exports = {
    createMainMenuEmbed,
    createProfileEmbed,
    createCombatEmbed,
    createCultivationEmbed,
    createErrorEmbed,
    createSuccessEmbed,
    createCharacterCreationEmbed,
};
