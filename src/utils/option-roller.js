/**
 * @file Option Roller — Hệ thống roll option cho skill/tâm pháp
 * @description Roll option đỏ/tím/xanh dựa trên Ngộ Tính của người chơi
 *
 * Bám sát cơ chế game gốc:
 *   - Ngộ Tính cao → dễ roll đỏ hơn
 *   - Mỗi skill/tâm pháp có danh sách rollable_options
 *   - Mỗi option có max value theo màu (đỏ > tím > xanh)
 *   - Re-roll tốn tài nguyên
 */

/**
 * Màu option: đỏ (mạnh nhất) > tím > xanh > trắng
 */
const OPTION_COLORS = {
  DO:    { id: 'do',    name: 'Đỏ',    emoji: '❤️', order: 4 },
  TIM:   { id: 'tim',   name: 'Tím',   emoji: '💜', order: 3 },
  XANH:  { id: 'xanh',  name: 'Xanh',  emoji: '💙', order: 2 },
  TRANG: { id: 'trang', name: 'Trắng', emoji: '🤍', order: 1 },
};

/**
 * Tính tỉ lệ roll theo Ngộ Tính
 *
 * Ngộ Tính 50:   1% đỏ, 10% tím, 39% xanh, 50% trắng
 * Ngộ Tính 100:  5% đỏ, 20% tím, 45% xanh, 30% trắng
 * Ngộ Tính 140: 15% đỏ, 35% tím, 35% xanh, 15% trắng
 * Ngộ Tính 180: 25% đỏ, 40% tím, 25% xanh, 10% trắng
 * Ngộ Tính 200: 30% đỏ, 40% tím, 20% xanh, 10% trắng
 *
 * @param {number} ngoTinh - Ngộ Tính người chơi (50-200)
 * @returns {{do: number, tim: number, xanh: number, trang: number}}
 */
function getColorRates(ngoTinh) {
  const nt = Math.max(50, Math.min(200, ngoTinh));
  const t = (nt - 50) / 150; // 0 → 1

  // Nội suy tuyến tính giữa min/max rates
  const doRate    = Math.round(1 + t * 29);              // 1% → 30%
  const timRate   = Math.round(10 + t * 30);             // 10% → 40%
  const trangRate = Math.round(50 - t * 40);             // 50% → 10%
  const xanhRate  = 100 - doRate - timRate - trangRate;   // Phần còn lại

  return {
    do: doRate,
    tim: timRate,
    xanh: Math.max(5, xanhRate),
    trang: Math.max(5, trangRate),
  };
}

/**
 * Roll 1 màu option dựa trên Ngộ Tính
 * @param {number} ngoTinh
 * @returns {Object} OPTION_COLORS entry
 */
function rollOptionColor(ngoTinh) {
  const rates = getColorRates(ngoTinh);
  const roll = Math.random() * 100;

  if (roll < rates.do) return OPTION_COLORS.DO;
  if (roll < rates.do + rates.tim) return OPTION_COLORS.TIM;
  if (roll < rates.do + rates.tim + rates.xanh) return OPTION_COLORS.XANH;
  return OPTION_COLORS.TRANG;
}

/**
 * Tính giá trị option dựa trên màu
 * Đỏ: 85-100% max, Tím: 60-84%, Xanh: 35-59%, Trắng: 10-34%
 *
 * @param {Object} optionDef - Định nghĩa option {id, name, max_red, max_purple?}
 * @param {Object} color - Màu option (OPTION_COLORS entry)
 * @returns {number} Giá trị cuối cùng
 */
function rollOptionValue(optionDef, color) {
  const maxVal = optionDef.max_red || 0;
  const isNegative = maxVal < 0; // VD: giảm CD = giá trị âm
  const absMax = Math.abs(maxVal);

  let minPercent, maxPercent;
  switch (color.id) {
    case 'do':    minPercent = 0.85; maxPercent = 1.0;  break;
    case 'tim':   minPercent = 0.60; maxPercent = 0.84; break;
    case 'xanh':  minPercent = 0.35; maxPercent = 0.59; break;
    default:      minPercent = 0.10; maxPercent = 0.34; break;
  }

  const valuePercent = minPercent + Math.random() * (maxPercent - minPercent);
  const rawValue = absMax * valuePercent;

  // Làm tròn thông minh: số nhỏ → 2 chữ số thập phân, số lớn → số nguyên
  let finalValue;
  if (absMax < 1) {
    finalValue = Math.round(rawValue * 100) / 100;
  } else if (absMax < 10) {
    finalValue = Math.round(rawValue * 10) / 10;
  } else {
    finalValue = Math.round(rawValue);
  }

  return isNegative ? -finalValue : finalValue;
}

/**
 * Roll toàn bộ options cho 1 skill/tâm pháp
 *
 * @param {Array} rollableOptions - Danh sách option definitions [{id, name, max_red, ...}]
 * @param {number} ngoTinh - Ngộ Tính người chơi
 * @returns {Array<{id: string, name: string, color: Object, value: number}>}
 */
function rollSkillOptions(rollableOptions, ngoTinh) {
  if (!rollableOptions || rollableOptions.length === 0) return [];

  return rollableOptions.map(optDef => {
    const color = rollOptionColor(ngoTinh);
    const value = rollOptionValue(optDef, color);

    return {
      id: optDef.id,
      name: optDef.name,
      color: color,
      value: value,
    };
  });
}

/**
 * Re-roll 1 option cụ thể (giữ id, roll lại màu + value)
 *
 * @param {Object} currentOption - Option hiện tại {id, name, color, value}
 * @param {Object} optionDef - Định nghĩa gốc
 * @param {number} ngoTinh - Ngộ Tính
 * @returns {Object} Option mới
 */
function rerollOption(currentOption, optionDef, ngoTinh) {
  const newColor = rollOptionColor(ngoTinh);
  const newValue = rollOptionValue(optionDef, newColor);

  return {
    id: optionDef.id,
    name: optionDef.name,
    color: newColor,
    value: newValue,
  };
}

/**
 * Format option thành text hiển thị
 * VD: "❤️ Giảm hồi chiêu: -0.18s" hoặc "💜 Tăng damage: +25%"
 *
 * @param {Object} option - {id, name, color, value}
 * @param {string} [unit=''] - Đơn vị (%, s, điểm...)
 * @returns {string}
 */
function formatOption(option, unit = '') {
  const sign = option.value >= 0 ? '+' : '';
  return `${option.color.emoji} ${option.name}: ${sign}${option.value}${unit}`;
}

/**
 * Đếm số option đỏ
 * @param {Array} options
 * @returns {number}
 */
function countRedOptions(options) {
  return options.filter(o => o.color.id === 'do').length;
}

/**
 * Tính chi phí re-roll (tăng theo số lần đã roll)
 * @param {number} rerollCount - Số lần đã re-roll option này
 * @returns {number} Linh Thạch cần
 */
function getRerollCost(rerollCount) {
  const baseCost = 500;
  return baseCost * Math.pow(1.5, rerollCount);
}

module.exports = {
  OPTION_COLORS,
  getColorRates,
  rollOptionColor,
  rollOptionValue,
  rollSkillOptions,
  rerollOption,
  formatOption,
  countRedOptions,
  getRerollCost,
};
