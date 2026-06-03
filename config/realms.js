/**
 * @file Cultivation Realms Configuration
 * @description 26 cảnh giới tu luyện, chia 4 đại cảnh giới
 *
 * Tiers:
 *   - Phàm Giới (Mortal Realm): Realms 1-9
 *   - Tiên Giới (Immortal Realm): Realms 10-16
 *   - Thánh Giới (Saint Realm): Realms 17-25
 *   - Đỉnh Phong (Peak): Realm 26
 *
 * Mỗi cảnh giới có 9 tầng (sub_realms), trừ Chí Tôn chỉ có 1.
 * exp_per_sub: kinh nghiệm cần cho mỗi tầng
 * stat_multiplier: hệ số sức mạnh nhân lên khi đột phá
 * tribulation: loại kiếp nạn cần vượt qua (null nếu không có)
 */

/** @type {'PHAM_GIOI'|'TIEN_GIOI'|'THANH_GIOI'|'DINH_PHONG'} */
const TIERS = {
  PHAM_GIOI: 'Phàm Giới',
  TIEN_GIOI: 'Tiên Giới',
  THANH_GIOI: 'Thánh Giới',
  DINH_PHONG: 'Đỉnh Phong',
};

const realms = [
  // ═══════════════════════════════════════════
  //  PHÀM GIỚI (Mortal Realm) — Realms 1-9
  // ═══════════════════════════════════════════
  {
    id: 'luyen_khi',
    name: 'Luyện Khí',
    tier: TIERS.PHAM_GIOI,
    order: 1,
    sub_realms: 9,
    exp_per_sub: 100,
    stat_multiplier: 1.0,
    tribulation: null,
    emoji: '🌱',
    description: 'Bước đầu tiên trên con đường tu tiên. Hấp thu linh khí trời đất, thanh lọc thân thể phàm trần.',
  },
  {
    id: 'truc_co',
    name: 'Trúc Cơ',
    tier: TIERS.PHAM_GIOI,
    order: 2,
    sub_realms: 9,
    exp_per_sub: 300,
    stat_multiplier: 1.5,
    tribulation: null,
    emoji: '🪨',
    description: 'Xây dựng nền tảng tu luyện vững chắc. Đan điền bắt đầu hình thành, có thể sử dụng pháp thuật đơn giản.',
  },
  {
    id: 'kim_dan',
    name: 'Kim Đan',
    tier: TIERS.PHAM_GIOI,
    order: 3,
    sub_realms: 9,
    exp_per_sub: 900,
    stat_multiplier: 2.0,
    tribulation: null,
    emoji: '🟡',
    description: 'Ngưng tụ Kim Đan trong đan điền. Tuổi thọ tăng lên 500 năm, có thể ngự không phi hành.',
  },
  {
    id: 'nguyen_anh',
    name: 'Nguyên Anh',
    tier: TIERS.PHAM_GIOI,
    order: 4,
    sub_realms: 9,
    exp_per_sub: 2700,
    stat_multiplier: 3.0,
    tribulation: 'tieu_kiep',
    emoji: '👶',
    description: 'Kim Đan hóa thành Nguyên Anh - linh hồn thứ hai. Phải vượt qua Tiểu Kiếp của trời đất.',
  },
  {
    id: 'hoa_than',
    name: 'Hóa Thần',
    tier: TIERS.PHAM_GIOI,
    order: 5,
    sub_realms: 9,
    exp_per_sub: 8100,
    stat_multiplier: 4.5,
    tribulation: null,
    emoji: '✨',
    description: 'Nguyên Anh hóa thần, hợp nhất với thiên đạo. Có thể cảm ứng quy luật tự nhiên.',
  },
  {
    id: 'luyen_hu',
    name: 'Luyện Hư',
    tier: TIERS.PHAM_GIOI,
    order: 6,
    sub_realms: 9,
    exp_per_sub: 24300,
    stat_multiplier: 6.5,
    tribulation: null,
    emoji: '🌀',
    description: 'Luyện hóa hư không, nắm bắt bản chất của vũ trụ. Thân thể bắt đầu siêu thoát phàm trần.',
  },
  {
    id: 'hop_the',
    name: 'Hợp Thể',
    tier: TIERS.PHAM_GIOI,
    order: 7,
    sub_realms: 9,
    exp_per_sub: 72900,
    stat_multiplier: 9.0,
    tribulation: 'trung_kiep',
    emoji: '🔗',
    description: 'Thể xác và Nguyên Anh hợp nhất hoàn toàn. Trung Kiếp giáng xuống thử thách tu sĩ.',
  },
  {
    id: 'do_kiep',
    name: 'Độ Kiếp',
    tier: TIERS.PHAM_GIOI,
    order: 8,
    sub_realms: 9,
    exp_per_sub: 218700,
    stat_multiplier: 13.0,
    tribulation: 'dai_kiep',
    emoji: '⚡',
    description: 'Giai đoạn cuối cùng trước khi thành tiên. Đại Kiếp bao gồm chín đợt thiên lôi.',
  },
  {
    id: 'ban_tien',
    name: 'Bán Tiên',
    tier: TIERS.PHAM_GIOI,
    order: 9,
    sub_realms: 9,
    exp_per_sub: 656100,
    stat_multiplier: 18.0,
    tribulation: 'tien_kiep',
    emoji: '🌟',
    description: 'Nửa tiên nửa phàm, đứng giữa ranh giới hai thế giới. Tiên Kiếp là thử thách cuối để phi thăng.',
  },

  // ═══════════════════════════════════════════
  //  TIÊN GIỚI (Immortal Realm) — Realms 10-16
  // ═══════════════════════════════════════════
  {
    id: 'chan_tien',
    name: 'Chân Tiên',
    tier: TIERS.TIEN_GIOI,
    order: 10,
    sub_realms: 9,
    exp_per_sub: 1968300,
    stat_multiplier: 25.0,
    tribulation: null,
    emoji: '🏮',
    description: 'Chính thức bước vào Tiên Giới. Tuổi thọ vô hạn, sức mạnh vượt xa phàm nhân.',
  },
  {
    id: 'cuc_tien',
    name: 'Cực Tiên',
    tier: TIERS.TIEN_GIOI,
    order: 11,
    sub_realms: 9,
    exp_per_sub: 5904900,
    stat_multiplier: 35.0,
    tribulation: null,
    emoji: '💫',
    description: 'Đạt đến cực hạn của cảnh giới Tiên nhân. Có thể tự tạo không gian riêng.',
  },
  {
    id: 'at_tien',
    name: 'Ất Tiên',
    tier: TIERS.TIEN_GIOI,
    order: 12,
    sub_realms: 9,
    exp_per_sub: 17714700,
    stat_multiplier: 50.0,
    tribulation: 'tien_loi_kiep',
    emoji: '🔥',
    description: 'Tiên nhân bậc cao, nắm giữ sức mạnh hủy diệt. Tiên Lôi Kiếp sẽ thử thách ý chí.',
  },
  {
    id: 'ngoc_tien',
    name: 'Ngọc Tiên',
    tier: TIERS.TIEN_GIOI,
    order: 13,
    sub_realms: 9,
    exp_per_sub: 53144100,
    stat_multiplier: 70.0,
    tribulation: null,
    emoji: '💠',
    description: 'Thể xác tinh khiết như ngọc, linh hồn sáng như trăng. Có thể tạo ra thế giới nhỏ.',
  },
  {
    id: 'tien_vuong',
    name: 'Tiên Vương',
    tier: TIERS.TIEN_GIOI,
    order: 14,
    sub_realms: 9,
    exp_per_sub: 159432300,
    stat_multiplier: 100.0,
    tribulation: null,
    emoji: '👑',
    description: 'Vương giả trong giới tiên nhân, thống trị một phương trời. Mỗi cử chỉ đều mang uy áp kinh thiên.',
  },
  {
    id: 'tien_ton',
    name: 'Tiên Tôn',
    tier: TIERS.TIEN_GIOI,
    order: 15,
    sub_realms: 9,
    exp_per_sub: 478296900,
    stat_multiplier: 140.0,
    tribulation: 'tien_ton_kiep',
    emoji: '⭐',
    description: 'Tôn giả bất khả xâm phạm. Tiên Tôn Kiếp có thể hủy diệt cả một tinh cầu.',
  },
  {
    id: 'tien_de',
    name: 'Tiên Đế',
    tier: TIERS.TIEN_GIOI,
    order: 16,
    sub_realms: 9,
    exp_per_sub: 1434890700,
    stat_multiplier: 200.0,
    tribulation: 'thanh_kiep',
    emoji: '🏛️',
    description: 'Đế vương của Tiên Giới, sức mạnh chấn động tam giới. Thánh Kiếp mở đường lên Thánh Giới.',
  },

  // ═══════════════════════════════════════════
  //  THÁNH GIỚI (Saint Realm) — Realms 17-25
  // ═══════════════════════════════════════════
  {
    id: 'nhap_thanh',
    name: 'Nhập Thánh',
    tier: TIERS.THANH_GIOI,
    order: 17,
    sub_realms: 9,
    exp_per_sub: 4304672100,
    stat_multiplier: 280.0,
    tribulation: null,
    emoji: '🌅',
    description: 'Bước chân vào cảnh giới Thánh. Mỗi hành động đều thuận theo thiên đạo.',
  },
  {
    id: 'thanh_gia',
    name: 'Thánh Già',
    tier: TIERS.THANH_GIOI,
    order: 18,
    sub_realms: 9,
    exp_per_sub: 12914016300,
    stat_multiplier: 400.0,
    tribulation: null,
    emoji: '🧙',
    description: 'Thánh nhân đã trải qua vạn kiếp, trí tuệ thông suốt cổ kim. Nhìn thấu vạn vật bản chất.',
  },
  {
    id: 'tieu_thanh',
    name: 'Tiểu Thánh',
    tier: TIERS.THANH_GIOI,
    order: 19,
    sub_realms: 9,
    exp_per_sub: 38742048900,
    stat_multiplier: 560.0,
    tribulation: 'thanh_loi_kiep',
    emoji: '🌠',
    description: 'Thánh nhân bậc nhỏ nhưng sức mạnh kinh thiên. Thánh Lôi Kiếp mang đến sấm sét thánh.',
  },
  {
    id: 'dai_thanh',
    name: 'Đại Thánh',
    tier: TIERS.THANH_GIOI,
    order: 20,
    sub_realms: 9,
    exp_per_sub: 116226146700,
    stat_multiplier: 780.0,
    tribulation: null,
    emoji: '🐒',
    description: 'Đại Thánh không hề, một quyền phá sơn hà. Sức mạnh khiến chư tiên phải kính nể.',
  },
  {
    id: 'thanh_tuong',
    name: 'Thánh Tướng',
    tier: TIERS.THANH_GIOI,
    order: 21,
    sub_realms: 9,
    exp_per_sub: 348678440100,
    stat_multiplier: 1100.0,
    tribulation: null,
    emoji: '🗡️',
    description: 'Tướng quân của Thánh Giới, thống lĩnh thiên binh. Mỗi kiếm chém đều xẻ đôi không gian.',
  },
  {
    id: 'thanh_vuong',
    name: 'Thánh Vương',
    tier: TIERS.THANH_GIOI,
    order: 22,
    sub_realms: 9,
    exp_per_sub: 1046035320300,
    stat_multiplier: 1500.0,
    tribulation: 'thanh_vuong_kiep',
    emoji: '🦁',
    description: 'Vương giả trong Thánh Giới, ngự trị vạn giới. Thánh Vương Kiếp là thử thách tối thượng.',
  },
  {
    id: 'thanh_ton',
    name: 'Thánh Tôn',
    tier: TIERS.THANH_GIOI,
    order: 23,
    sub_realms: 9,
    exp_per_sub: 3138105960900,
    stat_multiplier: 2100.0,
    tribulation: null,
    emoji: '🌌',
    description: 'Tôn giả của Thánh Giới, một lời nói có thể thay đổi quy tắc của vũ trụ.',
  },
  {
    id: 'thanh_hoang',
    name: 'Thánh Hoàng',
    tier: TIERS.THANH_GIOI,
    order: 24,
    sub_realms: 9,
    exp_per_sub: 9414317882700,
    stat_multiplier: 3000.0,
    tribulation: 'thanh_hoang_kiep',
    emoji: '🐉',
    description: 'Hoàng đế tối cao của Thánh Giới, quyền năng gần như vô hạn. Thánh Hoàng Kiếp hủy diệt cả thiên hà.',
  },
  {
    id: 'thanh_de',
    name: 'Thánh Đế',
    tier: TIERS.THANH_GIOI,
    order: 25,
    sub_realms: 9,
    exp_per_sub: 28242953648100,
    stat_multiplier: 4500.0,
    tribulation: 'chi_ton_kiep',
    emoji: '☀️',
    description: 'Đế vương cuối cùng, đứng trên đỉnh Thánh Giới. Chí Tôn Kiếp là kiếp nạn cuối cùng.',
  },

  // ═══════════════════════════════════════════
  //  ĐỈNH PHONG (Peak) — Realm 26
  // ═══════════════════════════════════════════
  {
    id: 'chi_ton',
    name: 'Chí Tôn',
    tier: TIERS.DINH_PHONG,
    order: 26,
    sub_realms: 1,
    exp_per_sub: null,
    stat_multiplier: 9999.0,
    tribulation: null,
    emoji: '👁️',
    description: 'Đỉnh phong tuyệt đỉnh, vượt trên tất cả. Chí Tôn là tồn tại duy nhất, vĩnh hằng bất diệt.',
  },
];

module.exports = {
  TIERS,
  realms,
  list: realms, // Alias for menu compatibility

  /**
   * Lấy thông tin cảnh giới theo id
   * @param {string} id
   * @returns {object|undefined}
   */
  getRealmById(id) {
    return realms.find(r => r.id === id);
  },

  /**
   * Lấy thông tin cảnh giới theo thứ tự
   * @param {number} order
   * @returns {object|undefined}
   */
  getRealmByOrder(order) {
    return realms.find(r => r.order === order);
  },

  /**
   * Lấy cảnh giới tiếp theo
   * @param {number} currentOrder
   * @returns {object|null}
   */
  getNextRealm(currentOrder) {
    return realms.find(r => r.order === currentOrder + 1) || null;
  },

  /**
   * Tính tổng exp cần để đạt cảnh giới
   * @param {number} order
   * @param {number} subRealm
   * @returns {number}
   */
  getTotalExpRequired(order, subRealm) {
    let total = 0;
    for (const realm of realms) {
      if (realm.order < order) {
        total += (realm.exp_per_sub || 0) * realm.sub_realms;
      } else if (realm.order === order) {
        total += (realm.exp_per_sub || 0) * (subRealm - 1);
        break;
      }
    }
    return total;
  },
};
