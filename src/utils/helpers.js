/**
 * Format số lớn có dấu phẩy ngăn cách
 * @param {number} num
 * @returns {string}
 */
function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format milliseconds thành chuỗi dễ đọc
 * @param {number} ms - milliseconds
 * @returns {string}
 */
function formatTime(ms) {
    if (ms <= 0) return 'Sẵn sàng';

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}p`;
    if (hours > 0) return `${hours}h ${minutes % 60}p ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}p ${seconds % 60}s`;
    return `${seconds}s`;
}

/**
 * Tính toán chỉ số phái sinh từ cảnh giới, linh căn, thể chất
 * @param {Object} player - Dữ liệu người chơi
 * @param {Object} realm - Dữ liệu cảnh giới
 * @param {Object} root - Dữ liệu linh căn
 * @param {Object} constitution - Dữ liệu thể chất
 * @returns {Object} - Chỉ số đã tính
 */
function calculateStats(player, realm, root, constitution) {
    const realmMultiplier = realm?.statMultiplier || 1;
    const rootBonus = root?.bonus || {};
    const constBonus = constitution?.bonus || {};

    const baseHp = 100 + (player.realm_index * 50) + (player.sub_realm * 10);
    const baseAtk = 10 + (player.realm_index * 8) + (player.sub_realm * 2);
    const baseDef = 5 + (player.realm_index * 5) + (player.sub_realm * 1);
    const baseSpeed = 10 + (player.realm_index * 3) + (player.sub_realm * 1);
    const baseMana = 50 + (player.realm_index * 30) + (player.sub_realm * 5);

    return {
        max_hp: Math.floor(baseHp * realmMultiplier * (1 + (rootBonus.hp || 0)) * (1 + (constBonus.hp || 0))),
        atk: Math.floor(baseAtk * realmMultiplier * (1 + (rootBonus.atk || 0)) * (1 + (constBonus.atk || 0))),
        def: Math.floor(baseDef * realmMultiplier * (1 + (rootBonus.def || 0)) * (1 + (constBonus.def || 0))),
        speed: Math.floor(baseSpeed * realmMultiplier * (1 + (rootBonus.speed || 0)) * (1 + (constBonus.speed || 0))),
        max_mana: Math.floor(baseMana * realmMultiplier * (1 + (rootBonus.mana || 0)) * (1 + (constBonus.mana || 0)))
    };
}

/**
 * Tạo thanh tiến trình bằng emoji
 * @param {number} current
 * @param {number} max
 * @param {number} length - Độ dài thanh (default 10)
 * @returns {string}
 */
function progressBar(current, max, length = 10) {
    if (max <= 0) return '░'.repeat(length);
    const ratio = Math.min(current / max, 1);
    const filled = Math.round(ratio * length);
    const empty = length - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * Random số nguyên trong khoảng [min, max]
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Trả về true với xác suất percent%
 * @param {number} percent - 0 đến 100
 * @returns {boolean}
 */
function chance(percent) {
    return Math.random() * 100 < percent;
}

/**
 * Giới hạn giá trị trong khoảng [min, max]
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

module.exports = {
    formatNumber,
    formatTime,
    calculateStats,
    progressBar,
    randomInt,
    chance,
    clamp
};
