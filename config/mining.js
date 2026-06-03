/**
 * @file Mining (Khai Thác Khoáng Sản) Configuration
 * @description 6 loại khoáng mạch khai thác
 *
 * Mỗi mỏ có:
 *   - resources: danh sách tài nguyên có thể khai thác [{item_id, chance, min_amount, max_amount}]
 *   - duration_minutes: thời gian khai thác (phút)
 *   - max_daily: số lần khai thác tối đa mỗi ngày
 *   - min_realm: cảnh giới tối thiểu để khai thác
 */

const miningNodes = [
  {
    id: 'linh_thach_quang',
    name: 'Linh Thạch Khoáng',
    emoji: '⛏️',
    min_realm: 1,
    duration_minutes: 5,
    max_daily: 10,
    resources: [
      { item_id: 'thach_tinh', chance: 0.7, min_amount: 1, max_amount: 5 },
      { item_id: 'linh_thao', chance: 0.4, min_amount: 1, max_amount: 3 },
      { item_id: 'hoa_tinh_thach', chance: 0.2, min_amount: 1, max_amount: 2 },
    ],
    exp_reward: 10,
    spirit_stone_reward: { min: 5, max: 15 },
    description: 'Mỏ linh thạch cơ bản, chứa khoáng sản phổ thông. Phù hợp cho tu sĩ mới.',
  },
  {
    id: 'hoa_diệm_quang',
    name: 'Hỏa Diệm Khoáng',
    emoji: '🔥',
    min_realm: 3,
    duration_minutes: 10,
    max_daily: 8,
    resources: [
      { item_id: 'hoa_tinh_thach', chance: 0.6, min_amount: 2, max_amount: 5 },
      { item_id: 'thach_tinh', chance: 0.5, min_amount: 1, max_amount: 3 },
      { item_id: 'linh_thao', chance: 0.3, min_amount: 1, max_amount: 2 },
      { item_id: 'thu_dan', chance: 0.1, min_amount: 1, max_amount: 1 },
    ],
    exp_reward: 30,
    spirit_stone_reward: { min: 15, max: 40 },
    description: 'Mỏ hỏa diệm, nóng bỏng và nguy hiểm. Chứa nhiều Hỏa Tinh Thạch.',
  },
  {
    id: 'bang_tuyet_quang',
    name: 'Băng Tuyết Khoáng',
    emoji: '❄️',
    min_realm: 4,
    duration_minutes: 15,
    max_daily: 6,
    resources: [
      { item_id: 'bang_tinh', chance: 0.5, min_amount: 1, max_amount: 3 },
      { item_id: 'thach_tinh', chance: 0.4, min_amount: 2, max_amount: 4 },
      { item_id: 'doc_nang', chance: 0.15, min_amount: 1, max_amount: 1 },
      { item_id: 'linh_moc', chance: 0.2, min_amount: 1, max_amount: 2 },
    ],
    exp_reward: 60,
    spirit_stone_reward: { min: 30, max: 80 },
    description: 'Mỏ trong vùng băng tuyết vĩnh cửu. Chứa Băng Tinh quý giá.',
  },
  {
    id: 'loi_van_quang',
    name: 'Lôi Vân Khoáng',
    emoji: '⚡',
    min_realm: 6,
    duration_minutes: 20,
    max_daily: 5,
    resources: [
      { item_id: 'loi_tinh', chance: 0.4, min_amount: 1, max_amount: 3 },
      { item_id: 'thach_tinh', chance: 0.5, min_amount: 2, max_amount: 5 },
      { item_id: 'bang_tinh', chance: 0.2, min_amount: 1, max_amount: 2 },
      { item_id: 'bao_dan', chance: 0.05, min_amount: 1, max_amount: 1 },
    ],
    exp_reward: 120,
    spirit_stone_reward: { min: 60, max: 150 },
    description: 'Mỏ bao phủ bởi sấm sét, cực kỳ nguy hiểm. Chứa Lôi Tinh quý.',
  },
  {
    id: 'long_mach_quang',
    name: 'Long Mạch Khoáng',
    emoji: '🐲',
    min_realm: 8,
    duration_minutes: 30,
    max_daily: 3,
    resources: [
      { item_id: 'long_lân', chance: 0.2, min_amount: 1, max_amount: 2 },
      { item_id: 'loi_tinh', chance: 0.3, min_amount: 1, max_amount: 2 },
      { item_id: 'thach_tinh', chance: 0.5, min_amount: 3, max_amount: 8 },
      { item_id: 'thanh_dan', chance: 0.05, min_amount: 1, max_amount: 1 },
      { item_id: 'thuong_co_tinh_huyet', chance: 0.02, min_amount: 1, max_amount: 1 },
    ],
    exp_reward: 300,
    spirit_stone_reward: { min: 150, max: 400 },
    description: 'Mỏ trên đường long mạch, chứa nguyên liệu thánh cấp. Cần sức mạnh Độ Kiếp trở lên.',
  },
  {
    id: 'hon_don_nguon',
    name: 'Hỗn Độn Nguyên Mạch',
    emoji: '🌀',
    min_realm: 15,
    duration_minutes: 60,
    max_daily: 1,
    resources: [
      { item_id: 'than_tinh', chance: 0.15, min_amount: 1, max_amount: 1 },
      { item_id: 'hon_don_tinh', chance: 0.03, min_amount: 1, max_amount: 1 },
      { item_id: 'long_lân', chance: 0.3, min_amount: 1, max_amount: 3 },
      { item_id: 'thuong_co_tinh_huyet', chance: 0.15, min_amount: 1, max_amount: 1 },
      { item_id: 'tien_dan', chance: 0.05, min_amount: 1, max_amount: 1 },
    ],
    exp_reward: 5000,
    spirit_stone_reward: { min: 1000, max: 5000 },
    description: 'Nguồn mạch Hỗn Độn nguyên thủy, hiếm nhất trong vạn giới. Chứa nguyên liệu thần cấp.',
  },
];

module.exports = {
  miningNodes,
  list: miningNodes, // Alias for menu compatibility

  /**
   * Lấy mỏ theo id
   */
  getNodeById(id) {
    return miningNodes.find(n => n.id === id);
  },

  /**
   * Lấy mỏ khả dụng tại realm
   */
  getAvailableNodes(realmOrder) {
    return miningNodes.filter(n => n.min_realm <= realmOrder);
  },

  /**
   * Roll tài nguyên từ mỏ
   * @param {string} nodeId
   * @returns {Array<{item_id: string, amount: number}>}
   */
  rollResources(nodeId) {
    const node = miningNodes.find(n => n.id === nodeId);
    if (!node) return [];
    const results = [];
    for (const resource of node.resources) {
      if (Math.random() < resource.chance) {
        const amount = Math.floor(
          Math.random() * (resource.max_amount - resource.min_amount + 1) + resource.min_amount
        );
        results.push({ item_id: resource.item_id, amount });
      }
    }
    return results;
  },

  /**
   * Roll tinh thạch thưởng
   */
  rollSpiritStones(nodeId) {
    const node = miningNodes.find(n => n.id === nodeId);
    if (!node) return 0;
    const { min, max } = node.spirit_stone_reward;
    return Math.floor(Math.random() * (max - min + 1) + min);
  },
};
