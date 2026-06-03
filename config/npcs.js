/**
 * @file NPCs (Nhân Vật Phi Người Chơi) Configuration
 * @description NPC với cá tính riêng, cửa hàng, nhiệm vụ, và hội thoại
 *
 * Mỗi NPC có:
 *   - shop_items: vật phẩm bán (id + giá)
 *   - quests: nhiệm vụ có thể nhận
 *   - dialogue: hội thoại theo tình huống
 *   - max_affinity: độ thân mật tối đa (tăng qua tương tác)
 */

const npcs = [
  {
    id: 'truong_lao_thanh_van',
    name: 'Trưởng Lão Thanh Vân',
    title: 'Trưởng Lão Thanh Vân Tông',
    emoji: '🧙‍♂️',
    location: 'thanh_van_tong',
    max_affinity: 100,
    shop_items: [
      { item_id: 'co_ban_tam_phap', price: 0, type: 'technique', note: 'Miễn phí cho đệ tử mới' },
      { item_id: 'thanh_van_quyet', price: 500, type: 'technique' },
      { item_id: 'hoi_khi_dan', price: 15, type: 'item' },
      { item_id: 'hoi_linh_dan', price: 15, type: 'item' },
      { item_id: 'truc_co_dan', price: 100, type: 'item' },
      { item_id: 'sat_kiem', price: 50, type: 'equipment' },
      { item_id: 'bo_giap', price: 40, type: 'equipment' },
      { item_id: 'linh_ngoc_boi', price: 30, type: 'equipment' },
      { item_id: 'cuoc_khai_khoang', price: 100, type: 'item' },
    ],
    quests: [
      {
        id: 'quest_01_first_hunt',
        name: 'Lần Săn Đầu Tiên',
        description: 'Hãy đi săn 3 con Linh Thỏ để chứng minh năng lực.',
        type: 'hunt',
        requirements: { kill: { target: 'linh_tho', count: 3 } },
        rewards: { exp: 100, spirit_stones: 50, items: [{ id: 'hoa_cau_thuat_sach', count: 1 }] },
        min_realm: 1,
        repeatable: false,
      },
      {
        id: 'quest_02_strengthen',
        name: 'Cường Hóa Bản Thân',
        description: 'Đạt đến Luyện Khí tầng 5 để nhận phần thưởng.',
        type: 'cultivation',
        requirements: { realm: 1, sub_realm: 5 },
        rewards: { exp: 300, spirit_stones: 100, items: [{ id: 'cuong_the_dan', count: 2 }] },
        min_realm: 1,
        repeatable: false,
      },
      {
        id: 'quest_03_breakthrough',
        name: 'Đột Phá Trúc Cơ',
        description: 'Đột phá thành công lên Trúc Cơ.',
        type: 'cultivation',
        requirements: { realm: 2, sub_realm: 1 },
        rewards: { exp: 500, spirit_stones: 200, items: [{ id: 'linh_quang_kiem', count: 1 }] },
        min_realm: 1,
        repeatable: false,
      },
    ],
    dialogue: {
      greeting: [
        'Chào đệ tử, hôm nay tu luyện thế nào rồi?',
        'Thanh Vân Tông hoan nghênh ngươi. Hãy nỗ lực tu luyện!',
        'Ta cảm nhận được linh lực của ngươi đang tăng. Tốt lắm!',
      ],
      shop: [
        'Ngươi muốn mua gì? Ta có nhiều vật phẩm hữu ích.',
        'Đan dược và vũ khí, tất cả đều có. Hãy chọn đi.',
      ],
      quest_complete: [
        'Xuất sắc! Ngươi đã hoàn thành nhiệm vụ. Đây là phần thưởng.',
        'Rất tốt! Tiếp tục phát huy, tương lai của ngươi không thể đo lường.',
      ],
      affinity_high: [
        'Ngươi là đệ tử ưu tú nhất ta từng thấy.',
        'Ta có một bí mật muốn chia sẻ với ngươi...',
      ],
      farewell: [
        'Tu luyện cẩn thận, đừng tẩu hỏa nhập ma.',
        'Đường tu tiên gian nan, kiên trì là chìa khóa.',
      ],
    },
    description: 'Trưởng lão uy nghiêm của Thanh Vân Tông, hướng dẫn đệ tử mới. Nghiêm khắc nhưng nhân từ.',
  },
  {
    id: 'dan_su_duoc_lao',
    name: 'Dược Lão',
    title: 'Đan Sư Bậc Thánh',
    emoji: '👨‍🔬',
    location: 'dan_phong',
    max_affinity: 100,
    shop_items: [
      { item_id: 'hoi_khi_dan', price: 12, type: 'item' },
      { item_id: 'hoi_linh_dan', price: 12, type: 'item' },
      { item_id: 'dai_hoi_xuan_dan', price: 180, type: 'item' },
      { item_id: 'cuong_the_dan', price: 280, type: 'item' },
      { item_id: 'kim_dan_dan', price: 450, type: 'item' },
      { item_id: 'nguyen_anh_dan', price: 1400, type: 'item' },
      { item_id: 'bao_dan', price: 1800, type: 'item' },
      { item_id: 'dan_lo_pham', price: 200, type: 'equipment' },
    ],
    quests: [
      {
        id: 'quest_alchemy_01',
        name: 'Học Nghề Luyện Đan',
        description: 'Thu thập 10 Linh Thảo cho Dược Lão.',
        type: 'collect',
        requirements: { collect: { item_id: 'linh_thao', count: 10 } },
        rewards: { exp: 200, spirit_stones: 80, items: [{ id: 'dan_lo_pham', count: 1 }], unlock: 'alchemy' },
        min_realm: 1,
        repeatable: false,
      },
      {
        id: 'quest_alchemy_02',
        name: 'Nguyên Liệu Quý',
        description: 'Mang về 5 Băng Tinh từ vùng tuyết sơn.',
        type: 'collect',
        requirements: { collect: { item_id: 'bang_tinh', count: 5 } },
        rewards: { exp: 1000, spirit_stones: 500, items: [{ id: 'hop_the_dan', count: 1 }] },
        min_realm: 3,
        repeatable: false,
      },
    ],
    dialogue: {
      greeting: [
        'Hừm, ngươi lại đến quấy rầy ta luyện đan à?',
        'Đan đạo là nghệ thuật, không phải trò đùa. Ngươi muốn gì?',
        'Ta đang nghiên cứu một loại đan dược mới... À, ngươi cần gì?',
      ],
      shop: [
        'Đan dược của ta đều là thượng phẩm. Đừng so sánh với hàng chợ.',
        'Mua nhiều ta giảm giá... à không, ta không giảm giá. Chất lượng có giá của nó.',
      ],
      quest_complete: [
        'Ít nhất ngươi còn biết làm việc. Đây, phần thưởng.',
        'Nguyên liệu tốt đấy. Có lẽ ngươi có thiên phú đan đạo.',
      ],
      affinity_high: [
        'Ta sẽ truyền cho ngươi bí quyết luyện đan tối cao.',
        'Ngươi... xứng đáng làm đệ tử chân truyền của ta.',
      ],
      farewell: [
        'Đi đi, đừng quấy rầy ta nữa.',
        'Nhớ mang nguyên liệu tốt về cho ta!',
      ],
    },
    description: 'Đan sư cổ quái, tính tình khó chịu nhưng đan thuật vô song. Bán đan dược chất lượng cao.',
  },
  {
    id: 'thuong_nhan_luu_tinh',
    name: 'Lưu Tinh',
    title: 'Thương Nhân Phiêu Bạt',
    emoji: '🧳',
    location: 'cho_phien',
    max_affinity: 100,
    shop_items: [
      { item_id: 'linh_quang_kiem', price: 800, type: 'equipment' },
      { item_id: 'linh_giap', price: 600, type: 'equipment' },
      { item_id: 'phong_linh_nhan', price: 500, type: 'equipment' },
      { item_id: 'thu_linh_chuong', price: 700, type: 'equipment' },
      { item_id: 'truyen_tong_phu', price: 90, type: 'item' },
      { item_id: 'ho_the_phu', price: 140, type: 'item' },
      { item_id: 'kiem_quang_sach', price: 45, type: 'item' },
      { item_id: 'hoa_cau_thuat_sach', price: 45, type: 'item' },
    ],
    quests: [
      {
        id: 'quest_trade_01',
        name: 'Hộ Tống Thương Đoàn',
        description: 'Bảo vệ thương đoàn qua Hắc Phong Sơn. Đánh bại 5 cường đạo.',
        type: 'hunt',
        requirements: { kill: { target: 'thanh_lang', count: 5 } },
        rewards: { exp: 300, spirit_stones: 200, items: [{ id: 'dai_hoi_xuan_dan', count: 3 }] },
        min_realm: 2,
        repeatable: true,
        daily_limit: 1,
      },
    ],
    dialogue: {
      greeting: [
        'Huynh đài! Ghé xem hàng đi, toàn đồ tốt nhập từ Tiên Giới đó!',
        'Ê ê, khách quý! Hôm nay ta có mấy món hay lắm nè.',
        'Chào chào! Lưu Tinh thương hội luôn có hàng hot nhất!',
      ],
      shop: [
        'Giá cả phải chăng, chất lượng đảm bảo! Đổi trả trong 3 ngày... à đùa thôi.',
        'Mua nhiều ủng hộ ta nha, ta còn phải nuôi gia đình.',
      ],
      quest_complete: [
        'Cảm ơn huynh đài đã hộ tống! Đây là thù lao xứng đáng.',
        'Nhờ có huynh mà hàng hóa an toàn. Đây, đây, tiền thưởng!',
      ],
      affinity_high: [
        'Huynh đài ơi, ta có nguồn hàng bí mật muốn giới thiệu...',
        'Xem này, hàng VIP chỉ dành cho khách ruột thôi!',
      ],
      farewell: [
        'Nhớ ghé lại nhé! Lần sau có hàng mới!',
        'Đi đường cẩn thận, gặp cướp nhớ gọi ta!... À, ta không đánh nhau được đâu.',
      ],
    },
    description: 'Thương nhân vui vẻ, buôn bán khắp nơi. Hàng hóa đa dạng, giá hơi chát.',
  },
  {
    id: 'hac_am_su_to',
    name: 'Hắc Ám Sư Tổ',
    title: 'Ma Đạo Tổ Sư',
    emoji: '🌑',
    location: 'am_gioi_cong',
    max_affinity: 100,
    shop_items: [
      { item_id: 'hap_huyet_dai_phap', price: 300, type: 'technique', note: 'Chỉ Ma Đạo' },
      { item_id: 'huyet_kiem', price: 2000, type: 'equipment' },
      { item_id: 'huyet_ngoc_truyen', price: 3000, type: 'equipment' },
      { item_id: 'am_khi_thach', price: 35, type: 'item' },
    ],
    quests: [
      {
        id: 'quest_dark_01',
        name: 'Chứng Minh Tâm Ma',
        description: 'Đánh bại 3 Ma Đạo Đệ Tử để chứng minh sức mạnh.',
        type: 'hunt',
        requirements: { kill: { target: 'ma_dao_de_tu', count: 3 } },
        rewards: { exp: 200, spirit_stones: 100, items: [{ id: 'am_khi_thach', count: 10 }] },
        min_realm: 2,
        dao_path_required: 'ma_dao',
        repeatable: false,
      },
      {
        id: 'quest_dark_02',
        name: 'Huyết Tế',
        description: 'Thu thập 10 Huyết Ngọc từ Huyết Quỷ.',
        type: 'collect',
        requirements: { collect: { item_id: 'huyet_ngoc', count: 10 } },
        rewards: { exp: 5000, spirit_stones: 2000, items: [{ id: 'van_quy_kinh', count: 1 }] },
        min_realm: 5,
        dao_path_required: 'ma_dao',
        repeatable: false,
      },
    ],
    dialogue: {
      greeting: [
        'Kẻ yếu không xứng đứng trước ta. Ngươi muốn gì?',
        'Ma Đạo không phải con đường của kẻ hèn nhát.',
        'Sức mạnh... ngươi khao khát sức mạnh chứ? Ta có thể cho ngươi.',
      ],
      shop: [
        'Công pháp Ma Đạo, mạnh hơn bất cứ thứ gì Chính Đạo có.',
        'Giá trả bằng tinh thạch... và có thể cả linh hồn của ngươi.',
      ],
      quest_complete: [
        'Tốt. Ngươi có tiềm năng. Đây là phần thưởng xứng đáng.',
        'Huyết tế thành công... Sức mạnh đang chờ ngươi.',
      ],
      affinity_high: [
        'Ngươi... nhắc ta nhớ đến ta thời trẻ. Ta sẽ truyền chân truyền.',
        'Diệt Thế Ma Kinh... có lẽ ngươi xứng đáng.',
      ],
      farewell: [
        'Đi đi. Nhớ rằng, sức mạnh là tất cả.',
        'Ma Đạo vô tình, nhưng ta... hừ, đi đi.',
      ],
    },
    description: 'Tổ sư Ma Đạo bí ẩn, lạnh lùng vô tình. Chỉ tôn trọng kẻ mạnh. Bán Ma Đạo công pháp.',
  },
  {
    id: 'tien_nhan_ngu_linh',
    name: 'Tiên Nhân Ngũ Linh',
    title: 'Tiên Nhân Ẩn Thế',
    emoji: '🌸',
    location: 'dao_son',
    max_affinity: 200,
    shop_items: [
      { item_id: 'thanh_dan', price: 18000, type: 'item' },
      { item_id: 'hop_the_dan', price: 4500, type: 'item' },
      { item_id: 'kiep_loi_phu', price: 4500, type: 'item' },
      { item_id: 'thanh_long_kiem', price: 15000, type: 'equipment' },
      { item_id: 'thien_menh_ngoc', price: 25000, type: 'equipment' },
    ],
    quests: [
      {
        id: 'quest_immortal_01',
        name: 'Tìm Kiếm Đạo Tâm',
        description: 'Đạt Kim Đan cảnh giới và ngộ ra Đạo tâm.',
        type: 'cultivation',
        requirements: { realm: 3, sub_realm: 9 },
        rewards: { exp: 3000, spirit_stones: 1000, items: [{ id: 'bao_dan', count: 2 }] },
        min_realm: 3,
        repeatable: false,
      },
      {
        id: 'quest_immortal_02',
        name: 'Thử Thách Tiên Nhân',
        description: 'Đánh bại Thượng Cổ Thao Thiết.',
        type: 'hunt',
        requirements: { kill: { target: 'thuong_co_tao_thien_khuynh', count: 1 } },
        rewards: { exp: 20000, spirit_stones: 10000, items: [{ id: 'cuu_kiem_quy_nhat_sach', count: 1 }] },
        min_realm: 7,
        repeatable: false,
      },
    ],
    dialogue: {
      greeting: [
        'Tiểu hữu, duyên phận đưa ngươi đến đây.',
        'Đạo tâm kiên định, ngươi mới có thể đi xa trên đường tu.',
        'Trăm năm một thoáng, ngàn năm phù du. Ngươi đã sẵn sàng chưa?',
      ],
      shop: [
        'Ta có một vài vật phẩm, có thể giúp ngươi trên đường tu.',
        'Tinh thạch chỉ là vật ngoài thân, nhưng đan dược lại không thể thiếu.',
      ],
      quest_complete: [
        'Ngộ tính tốt. Ngươi sẽ đạt được nhiều thứ trên đường tu.',
        'Thiên đạo không phụ kẻ khổ tâm. Tiếp tục đi, tiểu hữu.',
      ],
      affinity_high: [
        'Ta sẽ truyền cho ngươi Hồng Mông Đại Đạo... nếu ngươi đủ tư cách.',
        'Ngươi là truyền nhân ta chờ đợi hàng vạn năm.',
      ],
      farewell: [
        'Đường tu vô tận, ta chờ ngươi trở lại.',
        'Thuận theo tự nhiên, đừng cưỡng cầu.',
      ],
    },
    description: 'Tiên nhân ẩn cư trên Đào Sơn, tu vi thâm sâu không thể đo lường. Chỉ xuất hiện với người có duyên.',
  },
];

module.exports = {
  npcs,
  list: npcs, // Alias for menu compatibility

  /**
   * Lấy NPC theo id
   */
  getNpcById(id) {
    return npcs.find(n => n.id === id);
  },

  /**
   * Lấy NPC theo location
   */
  getNpcByLocation(location) {
    return npcs.filter(n => n.location === location);
  },

  /**
   * Lấy quest từ NPC
   */
  getQuestById(questId) {
    for (const npc of npcs) {
      const quest = npc.quests.find(q => q.id === questId);
      if (quest) return { quest, npc_id: npc.id };
    }
    return null;
  },

  /**
   * Lấy tất cả quest khả dụng
   */
  getAvailableQuests(realmOrder, daoPath) {
    const available = [];
    for (const npc of npcs) {
      for (const quest of npc.quests) {
        if (quest.min_realm <= realmOrder) {
          if (!quest.dao_path_required || quest.dao_path_required === daoPath) {
            available.push({ ...quest, npc_id: npc.id, npc_name: npc.name });
          }
        }
      }
    }
    return available;
  },
};
