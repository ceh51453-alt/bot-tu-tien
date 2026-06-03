const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { EMOJIS } = require('../utils/constants');

/**
 * Nút menu chính - 2 hàng, 4 nút mỗi hàng
 */
function createMainMenuButtons() {
    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('profile:view')
            .setLabel('Nhân Vật')
            .setEmoji(EMOJIS.STAR)
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('cultivation:menu')
            .setLabel('Tu Luyện')
            .setEmoji(EMOJIS.CULTIVATION)
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('combat:menu')
            .setLabel('Chiến Đấu')
            .setEmoji(EMOJIS.SWORD)
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('world:menu')
            .setLabel('Thế Giới')
            .setEmoji(EMOJIS.WORLD)
            .setStyle(ButtonStyle.Success),
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('inventory:menu')
            .setLabel('Kho Đồ')
            .setEmoji(EMOJIS.ITEM)
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('sect:menu')
            .setLabel('Bang Phái')
            .setEmoji(EMOJIS.SECT)
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('trade:menu')
            .setLabel('Giao Dịch')
            .setEmoji(EMOJIS.SHOP)
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('leaderboard:menu')
            .setLabel('Bảng Xếp Hạng')
            .setEmoji(EMOJIS.RANK)
            .setStyle(ButtonStyle.Secondary),
    );

    const row3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('menu:rest')
            .setLabel('Nghỉ Ngơi (Hồi HP)')
            .setEmoji('🏕️')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('pet:menu')
            .setLabel('Linh Thú')
            .setEmoji('🐾')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('equipment:menu')
            .setLabel('Trang Bị')
            .setEmoji('⚔️')
            .setStyle(ButtonStyle.Secondary),
    );

    return [row1, row2, row3];
}

/**
 * Nút menu nhân vật
 */
function createProfileButtons() {
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('profile:stats')
            .setLabel('Chỉ Số')
            .setEmoji(EMOJIS.ATK)
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('profile:skills')
            .setLabel('Kỹ Năng')
            .setEmoji(EMOJIS.SKILL)
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('profile:equipment')
            .setLabel('Trang Bị')
            .setEmoji(EMOJIS.WEAPON)
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('profile:pets')
            .setLabel('Linh Thú')
            .setEmoji(EMOJIS.PET)
            .setStyle(ButtonStyle.Primary),
        createBackButton('menu:main'),
    );

    return [row];
}

/**
 * Nút tu luyện
 */
function createCultivationButtons() {
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('cultivation:train')
            .setLabel('Tu Luyện')
            .setEmoji(EMOJIS.CULTIVATION)
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('cultivation:breakthrough')
            .setLabel('Đột Phá')
            .setEmoji(EMOJIS.BREAKTHROUGH)
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('cultivation:technique')
            .setLabel('Công Pháp')
            .setEmoji(EMOJIS.TECHNIQUE)
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('cultivation:skills')
            .setLabel('Kỹ Năng')
            .setEmoji(EMOJIS.SKILL)
            .setStyle(ButtonStyle.Primary),
        createBackButton('menu:main'),
    );

    return [row];
}

/**
 * Nút chiến đấu - hiển thị kỹ năng + hành động
 * @param {Array} skills - Danh sách kỹ năng đã trang bị
 */
function createCombatButtons(skills = []) {
    const row1 = new ActionRowBuilder();

    // Nút tấn công thường luôn có
    row1.addComponents(
        new ButtonBuilder()
            .setCustomId('combat:attack')
            .setLabel('Tấn Công')
            .setEmoji(EMOJIS.SWORD)
            .setStyle(ButtonStyle.Danger)
    );

    // Thêm nút kỹ năng (tối đa 4 kỹ năng chủ động)
    for (let i = 0; i < Math.min(skills.length, 3); i++) {
        const skill = skills[i];
        row1.addComponents(
            new ButtonBuilder()
                .setCustomId(`combat:skill_${skill.slot}`)
                .setLabel(skill.name || `Skill ${skill.slot}`)
                .setEmoji(EMOJIS.SKILL)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(skill.cooldown_remaining > 0)
        );
    }

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('combat:defend')
            .setLabel('Phòng Thủ')
            .setEmoji(EMOJIS.SHIELD)
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('combat:potion')
            .setLabel('Dùng Đan')
            .setEmoji(EMOJIS.POTION)
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('combat:flee')
            .setLabel('Bỏ Chạy')
            .setEmoji(EMOJIS.SPEED)
            .setStyle(ButtonStyle.Secondary),
    );

    return [row1, row2];
}

/**
 * Nút thế giới / khám phá
 */
function createWorldButtons() {
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('world:hunt')
            .setLabel('Săn Quái')
            .setEmoji(EMOJIS.MONSTER)
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('world:mine')
            .setLabel('Khai Khoáng')
            .setEmoji(EMOJIS.MINE)
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('world:shop')
            .setLabel('Tiệm')
            .setEmoji(EMOJIS.SHOP)
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('world:npc')
            .setLabel('NPC')
            .setEmoji(EMOJIS.NPC)
            .setStyle(ButtonStyle.Secondary),
        createBackButton('menu:main'),
    );

    return [row];
}

/**
 * Nút kho đồ - phân loại
 */
function createInventoryButtons() {
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('inventory:materials')
            .setLabel('Nguyên Liệu')
            .setEmoji(EMOJIS.ITEM)
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('inventory:equipment')
            .setLabel('Trang Bị')
            .setEmoji(EMOJIS.WEAPON)
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('inventory:consumables')
            .setLabel('Tiêu Hao')
            .setEmoji(EMOJIS.POTION)
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('inventory:special')
            .setLabel('Đặc Biệt')
            .setEmoji(EMOJIS.ARTIFACT)
            .setStyle(ButtonStyle.Secondary),
        createBackButton('menu:main'),
    );

    return [row];
}

/**
 * Nút giao dịch
 */
function createTradeButtons() {
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('trade:buy')
            .setLabel('Mua')
            .setEmoji(EMOJIS.SHOP)
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('trade:sell')
            .setLabel('Bán')
            .setEmoji(EMOJIS.LINH_THACH)
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('trade:auction')
            .setLabel('Đấu Giá')
            .setEmoji(EMOJIS.FIRE)
            .setStyle(ButtonStyle.Primary),
        createBackButton('menu:main'),
    );

    return [row];
}

/**
 * Nút bang phái
 * @param {boolean} hasSect - Người chơi đã có bang chưa
 */
function createSectButtons(hasSect = false) {
    const row = new ActionRowBuilder();

    if (hasSect) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId('sect:info')
                .setLabel('Thông Tin')
                .setEmoji(EMOJIS.INFO)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('sect:members')
                .setLabel('Thành Viên')
                .setEmoji(EMOJIS.NPC)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('sect:donate')
                .setLabel('Đóng Góp')
                .setEmoji(EMOJIS.LINH_THACH)
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('sect:leave')
                .setLabel('Rời Bang')
                .setEmoji(EMOJIS.CROSS)
                .setStyle(ButtonStyle.Danger),
        );
    } else {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId('sect:create')
                .setLabel('Tạo Bang')
                .setEmoji(EMOJIS.SECT)
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('sect:browse')
                .setLabel('Tìm Bang')
                .setEmoji(EMOJIS.WORLD)
                .setStyle(ButtonStyle.Primary),
        );
    }

    row.addComponents(createBackButton('menu:main'));

    return [row];
}

/**
 * Nút bảng xếp hạng
 */
function createLeaderboardButtons() {
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('leaderboard:realm')
            .setLabel('Cảnh Giới')
            .setEmoji(EMOJIS.REALM)
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('leaderboard:combat')
            .setLabel('Chiến Lực')
            .setEmoji(EMOJIS.ATK)
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('leaderboard:wealth')
            .setLabel('Tài Sản')
            .setEmoji(EMOJIS.LINH_THACH)
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('leaderboard:sect')
            .setLabel('Bang Phái')
            .setEmoji(EMOJIS.SECT)
            .setStyle(ButtonStyle.Secondary),
        createBackButton('menu:main'),
    );

    return [row];
}

/**
 * Nút quay lại phổ dụng
 * @param {string} menuId - Custom ID để quay về (e.g., 'menu:main')
 */
function createBackButton(menuId) {
    return new ButtonBuilder()
        .setCustomId(menuId)
        .setLabel('Quay Lại')
        .setEmoji(EMOJIS.BACK)
        .setStyle(ButtonStyle.Secondary);
}

/**
 * Cặp nút xác nhận / hủy
 * @param {string} actionId - ID hành động cần xác nhận
 */
function createConfirmButtons(actionId) {
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`confirm:${actionId}`)
            .setLabel('Xác Nhận')
            .setEmoji(EMOJIS.CHECK)
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(`cancel:${actionId}`)
            .setLabel('Hủy Bỏ')
            .setEmoji(EMOJIS.CROSS)
            .setStyle(ButtonStyle.Danger),
    );

    return [row];
}

/**
 * Nút chọn đạo lộ: Chính Đạo / Ma Đạo
 */
function createDaoPathButtons() {
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('creation:dao_chinh')
            .setLabel('Chính Đạo')
            .setEmoji(EMOJIS.CHINH_DAO)
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('creation:dao_ma')
            .setLabel('Ma Đạo')
            .setEmoji(EMOJIS.MA_DAO)
            .setStyle(ButtonStyle.Danger),
    );

    return [row];
}

module.exports = {
    createMainMenuButtons,
    createProfileButtons,
    createCultivationButtons,
    createCombatButtons,
    createWorldButtons,
    createInventoryButtons,
    createTradeButtons,
    createSectButtons,
    createLeaderboardButtons,
    createBackButton,
    createConfirmButtons,
    createDaoPathButtons,
};
