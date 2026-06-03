/**
 * Chọn phần tử ngẫu nhiên theo trọng số
 * @param {Array} items - Mảng các phần tử
 * @param {Array<number>} weights - Mảng trọng số tương ứng
 * @returns {*} - Phần tử được chọn
 */
function weightedRandom(items, weights) {
    if (items.length !== weights.length) {
        throw new Error('items và weights phải cùng độ dài');
    }

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let roll = Math.random() * totalWeight;

    for (let i = 0; i < items.length; i++) {
        roll -= weights[i];
        if (roll <= 0) return items[i];
    }

    return items[items.length - 1]; // Fallback
}

/**
 * Roll thể chất theo tỉ lệ hiếm — delegates to config
 * @returns {string} - Constitution ID (e.g., 'pham_the', 'cuong_the')
 */
function rollConstitution() {
    const { rollConstitution: configRoll } = require('../../config/constitutions');
    const result = configRoll();
    return result.id;
}

/**
 * Roll loot từ bảng drop
 * @param {Array<{item: *, weight: number, minQty?: number, maxQty?: number}>} dropTable
 * @returns {Array<{item: *, quantity: number}>} - Danh sách vật phẩm nhận được
 */
function rollLoot(dropTable) {
    const results = [];

    for (const drop of dropTable) {
        const roll = Math.random() * 100;
        if (roll < drop.weight) {
            const minQty = drop.minQty || 1;
            const maxQty = drop.maxQty || 1;
            const quantity = Math.floor(Math.random() * (maxQty - minQty + 1)) + minQty;
            results.push({ item: drop.item, quantity });
        }
    }

    return results;
}

/**
 * Roll boolean với tỉ lệ phần trăm
 * @param {number} percent - 0 đến 100
 * @returns {boolean}
 */
function rollChance(percent) {
    return Math.random() * 100 < percent;
}

module.exports = {
    weightedRandom,
    rollConstitution,
    rollLoot,
    rollChance,
};
