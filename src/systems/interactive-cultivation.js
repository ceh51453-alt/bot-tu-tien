/**
 * @file Interactive Cultivation System
 * @description Tu luyện tương tác — mini-game thiền định 3-5 vòng
 *
 * Thay vì bấm 1 nút → +EXP, player trải qua nhiều vòng lựa chọn:
 *   Vòng 1: Hấp Thu Linh Khí (chọn nguyên tố)
 *   Vòng 2: Vận Chuyển Kinh Mạch (rủi ro/an toàn)
 *   Vòng 3: Random Event (30+ sự kiện, mỗi lần đáp án xáo trộn)
 *   Vòng 4-5: Sự kiện cao cấp (Kim Đan+)
 *
 * EXP tính theo performance: Perfect 3x, Good 2x, Normal 1x, Bad 0.5x
 */

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { COLORS } = require('../utils/constants');
const { formatNumber } = require('../utils/helpers');

// ═══════════════════════════════════════════
// SỰ KIỆN NGẪU NHIÊN — 30+ events
// Mỗi event có nhiều bộ đáp án, shuffle mỗi lần
// ═══════════════════════════════════════════

const RANDOM_EVENTS = [
  // ── TÂM MA (Tâm ma xâm nhập) ──
  {
    id: 'tam_ma_1',
    category: 'tam_ma',
    title: '👹 Tâm Ma Xâm Nhập',
    description: 'Trong lúc tu luyện, một tiếng nói thì thầm trong tâm trí: _"Ngươi quá yếu đuối, từ bỏ tu luyện đi..."_',
    answers: [
      { text: '🧘 Tĩnh tâm ngưng thần, xua đuổi tạp niệm', type: 'correct', flavor: 'Ngươi an định tâm thần, tâm ma tự tan.' },
      { text: '😡 Nổi giận phản kháng, dùng ý chí đè bẹp', type: 'risky', flavor: 'Sức mạnh ý chí đè bẹp tâm ma, nhưng kinh mạch chấn động.' },
      { text: '🤔 Lắng nghe xem tâm ma nói gì', type: 'wrong', flavor: 'Tâm ma thừa cơ xâm nhập, linh đài dao động!' },
    ],
  },
  {
    id: 'tam_ma_2',
    category: 'tam_ma',
    title: '🌑 Hắc Ám Trùng Phùng',
    description: 'Bóng tối bao trùm tâm cảnh, quá khứ đau thương ùa về khiến tâm hồn lay động...',
    answers: [
      { text: '💡 Vận Phật Tâm Chú, chiếu sáng tâm cảnh', type: 'correct', flavor: 'Ánh sáng xua tan bóng tối, tâm cảnh sáng rực.' },
      { text: '🗡️ Dùng Tâm Kiếm chém đứt tất cả', type: 'risky', flavor: 'Kiếm ý sắc bén, nhưng cũng chém vào chính mình.' },
      { text: '😢 Đắm chìm trong ký ức', type: 'wrong', flavor: 'Tâm hồn bị cuốn vào quá khứ, mất phương hướng.' },
    ],
  },
  {
    id: 'tam_ma_3',
    category: 'tam_ma',
    title: '🎭 Ảo Ảnh Mê Lầm',
    description: 'Trước mắt hiện ra cảnh phồn hoa tuyệt đẹp — vàng bạc châu báu, quyền lực vô song. Tất cả như thật...',
    answers: [
      { text: '👁️ Nhắm mắt, tất cả đều là hư ảo', type: 'correct', flavor: 'Ngươi nhìn thấu chân tướng, ảo cảnh tan biến.' },
      { text: '🔥 Phóng hỏa đốt sạch ảo ảnh', type: 'risky', flavor: 'Lửa cháy rực, nhưng tiêu hao quá nhiều linh lực.' },
      { text: '🤩 Vươn tay lấy châu báu', type: 'wrong', flavor: 'Ảo ảnh biến thành xiềng xích, trói chặt đạo tâm.' },
    ],
  },
  {
    id: 'tam_ma_4',
    category: 'tam_ma',
    title: '🪞 Tà Ma Phân Thân',
    description: 'Một phiên bản khác của ngươi xuất hiện — mang đầy oán hận và tham lam. Nó cười nhạo: _"Ta mới là thật!"_',
    answers: [
      { text: '☯️ Tiếp nhận, hắn cũng là một phần của ta', type: 'correct', flavor: 'Ánh dương và bóng tối hợp nhất, đạo tâm viên mãn hơn.' },
      { text: '⚔️ Chiến đấu, tiêu diệt phân thân', type: 'risky', flavor: 'Trận chiến nội tâm kịch liệt, thắng nhưng kiệt sức.' },
      { text: '🏃 Quay đầu bỏ chạy', type: 'wrong', flavor: 'Phân thân đuổi theo, nỗi sợ ngày càng lớn.' },
    ],
  },
  {
    id: 'tam_ma_5',
    category: 'tam_ma',
    title: '💀 Tử Vong Chi Ảnh',
    description: 'Cảm giác chết chóc xâm nhập — hơi thở ngừng, tim như ngưng đập. Sợ hãi tột cùng...',
    answers: [
      { text: '🌸 Buông bỏ, sinh tử tuần hoàn', type: 'correct', flavor: 'Buông bỏ sợ hãi, lĩnh ngộ sinh tử luân hồi.' },
      { text: '💪 Vận toàn lực chống lại', type: 'risky', flavor: 'Ý chí mãnh liệt đánh bại tử thần, nhưng thân thể hao tổn.' },
      { text: '😱 Hoảng loạn, phá vỡ thiền định', type: 'wrong', flavor: 'Linh khí loạn xạ, kinh mạch bị tổn thương.' },
    ],
  },

  // ── THIÊN ĐỊA DỊ TƯỢNG ──
  {
    id: 'di_tuong_1',
    category: 'di_tuong',
    title: '🌩️ Lôi Điện Giáng Thế',
    description: 'Bỗng nhiên sấm vang trời, một tia lôi điện xuyên qua mái nhà, nhắm thẳng vào đan điền!',
    answers: [
      { text: '⚡ Hấp thu lôi điện, rèn luyện thân thể', type: 'correct', flavor: 'Lôi điện thanh lọc kinh mạch, thân thể cường hóa!' },
      { text: '🛡️ Dựng linh khí hộ thuẫn chống đỡ', type: 'risky', flavor: 'Hộ thuẫn chắn được phần lớn, nhưng vẫn bị chấn thương nhẹ.' },
      { text: '🏃 Lập tức né tránh', type: 'wrong', flavor: 'Phá vỡ trạng thái thiền định, linh khí tán loạn.' },
    ],
  },
  {
    id: 'di_tuong_2',
    category: 'di_tuong',
    title: '🌸 Thiên Hoa Loạn Trụy',
    description: 'Trăm hoa cùng nở, hương thơm ngào ngạt. Cánh hoa rơi xuống đan điền, mang theo linh khí thuần khiết...',
    answers: [
      { text: '🧘 Nhẹ nhàng hấp thu, thuận theo tự nhiên', type: 'correct', flavor: 'Hoa rơi thành linh lực, cảnh giới tâm bình an.' },
      { text: '🌪️ Vận linh lực cuốn hết về đan điền', type: 'risky', flavor: 'Thu được nhiều nhưng linh khí hỗn loạn, cần thời gian tiêu hóa.' },
      { text: '🤨 Cảnh giác, đây có thể là bẫy', type: 'wrong', flavor: 'Quá cảnh giác khiến bỏ lỡ cơ duyên trời cho.' },
    ],
  },
  {
    id: 'di_tuong_3',
    category: 'di_tuong',
    title: '🐉 Rồng Hiện Không Trung',
    description: 'Giữa tầng mây, một con rồng khí khổng lồ hiện ra, gầm lên chấn động thiên địa!',
    answers: [
      { text: '🙏 Cúi đầu kính lễ, cầu xin chỉ giáo', type: 'correct', flavor: 'Rồng khí gật đầu, ban cho một tia ngộ tính.' },
      { text: '🗡️ Bình tĩnh, vận kiếm ý đối kháng', type: 'risky', flavor: 'Rồng khí ấn tượng bởi dũng khí, nhưng áp lực khủng khiếp.' },
      { text: '😨 Sợ hãi quỳ sụp', type: 'wrong', flavor: 'Uy áp rồng khí đè nặng, đạo tâm lung lay.' },
    ],
  },
  {
    id: 'di_tuong_4',
    category: 'di_tuong',
    title: '🌋 Địa Mạch Phun Trào',
    description: 'Mặt đất rung chuyển, một dòng linh mạch phun trào từ dưới đất, linh khí dày đặc bao phủ!',
    answers: [
      { text: '🧘 Tĩnh tọa trên dòng linh mạch, từ từ hấp thu', type: 'correct', flavor: 'Linh khí thuần khiết chảy vào đan điền, tu vi tăng vọt.' },
      { text: '🌊 Mở toàn bộ kinh mạch, hấp thu tối đa', type: 'risky', flavor: 'Thu được nhiều nhưng kinh mạch quá tải, đau đớn vô cùng.' },
      { text: '🏃 Tránh xa, sợ nguy hiểm', type: 'wrong', flavor: 'Cơ duyên trước mặt mà bỏ lỡ, đáng tiếc.' },
    ],
  },
  {
    id: 'di_tuong_5',
    category: 'di_tuong',
    title: '☀️🌙 Nhật Nguyệt Đồng Huy',
    description: 'Mặt trời và mặt trăng cùng xuất hiện, ánh sáng âm dương giao hòa chiếu vào thân thể...',
    answers: [
      { text: '☯️ Vận hành công pháp âm dương, dung hợp hai nguồn lực', type: 'correct', flavor: 'Âm dương hài hòa, linh lực thuần hóa đến cực điểm!' },
      { text: '☀️ Chỉ hấp thu dương quang', type: 'risky', flavor: 'Được dương lực mạnh nhưng mất cân bằng âm dương.' },
      { text: '🌙 Chỉ hấp thu nguyệt quang', type: 'risky', flavor: 'Âm lực dồi dào nhưng dương khí suy yếu.' },
    ],
  },

  // ── CẢM NGỘ (Đạo pháp cảm ngộ) ──
  {
    id: 'cam_ngo_1',
    category: 'cam_ngo',
    title: '📖 Thiên Đạo Chân Ngôn',
    description: 'Trong trạng thái nhập định, ngươi nghe thấy tiếng nói mơ hồ của thiên đạo. Nhưng chỉ có thể ghi nhớ một câu...',
    answers: [
      { text: '🧠 Tập trung toàn bộ thần thức lắng nghe', type: 'correct', flavor: 'Ghi nhớ một đoạn Thiên Đạo Chân Ngôn, ngộ tính tăng.' },
      { text: '📝 Cố gắng ghi nhớ tất cả', type: 'risky', flavor: 'Ghi nhớ được nhiều nhưng không hiểu hết, hỗn loạn.' },
      { text: '🤷 Bỏ qua, chắc là ảo giác', type: 'wrong', flavor: 'Cơ hội ngàn năm có một bị bỏ lỡ.' },
    ],
  },
  {
    id: 'cam_ngo_2',
    category: 'cam_ngo',
    title: '🦋 Trang Sinh Mộng Điệp',
    description: 'Ngươi mơ thấy mình biến thành bướm, bay lượn tự do. Hay là bướm đang mơ thấy mình là người?',
    answers: [
      { text: '🌀 Không phân biệt thực hư, thuận theo tự nhiên', type: 'correct', flavor: 'Lĩnh ngộ đạo lý "vạn vật đồng nhất", cảnh giới thăng hoa.' },
      { text: '🦋 Muốn mãi là bướm, tự do bay lượn', type: 'risky', flavor: 'Tâm hồn thư thái nhưng dần quên mất bản ngã.' },
      { text: '😤 Tỉnh dậy! Ta là tu sĩ, không phải bướm', type: 'wrong', flavor: 'Chấp niệm quá nặng, bỏ lỡ cơ duyên ngộ đạo.' },
    ],
  },
  {
    id: 'cam_ngo_3',
    category: 'cam_ngo',
    title: '🌊 Thủy Trung Lao Nguyệt',
    description: 'Trong tâm cảnh xuất hiện mặt hồ tĩnh lặng, bóng trăng in trên mặt nước. Ngươi vươn tay vớt trăng...',
    answers: [
      { text: '🪷 Nhìn trăng mà ngộ, trăng tại tâm chứ không tại nước', type: 'correct', flavor: 'Ngộ ra "đạo tại tâm", tâm cảnh sáng rực như trăng.' },
      { text: '🌊 Khuấy động mặt nước, phá vỡ ảo ảnh', type: 'risky', flavor: 'Phá ảo nhưng cũng mất đi cảnh giới tĩnh lặng.' },
      { text: '🤿 Lặn xuống nước tìm trăng thật', type: 'wrong', flavor: 'Chìm sâu trong mê lầm, không tìm được đường ra.' },
    ],
  },
  {
    id: 'cam_ngo_4',
    category: 'cam_ngo',
    title: '🍃 Lá Rụng Về Cội',
    description: 'Ngươi nhìn thấy chiếc lá vàng rơi từ cành cao, nhẹ nhàng xoay tròn trước khi chạm đất...',
    answers: [
      { text: '🧘 Quan sát từng khoảnh khắc, cảm nhận quy luật tự nhiên', type: 'correct', flavor: 'Lĩnh ngộ chu kỳ sinh diệt, tu vi tăng tiến.' },
      { text: '🌬️ Thổi gió giữ lá bay mãi', type: 'risky', flavor: 'Trái tự nhiên, tốn linh lực vô ích.' },
      { text: '🤷 Chỉ là chiếc lá, có gì đặc biệt', type: 'wrong', flavor: 'Không nhìn ra đạo lý, bỏ phí cơ duyên.' },
    ],
  },
  {
    id: 'cam_ngo_5',
    category: 'cam_ngo',
    title: '⛰️ Sơn Phong Cổ Chung',
    description: 'Từ đỉnh núi xa vang lại tiếng chuông cổ xưa, mỗi tiếng chuông mang theo một tầng ý nghĩa...',
    answers: [
      { text: '👂 Lắng nghe tĩnh lặng, đếm từng tiếng chuông', type: 'correct', flavor: '9 tiếng chuông, 9 tầng lĩnh ngộ, đạo tâm kiên cố.' },
      { text: '🔔 Vận linh lực tạo ra tiếng chuông đáp lại', type: 'risky', flavor: 'Cộng hưởng mạnh mẽ nhưng tiêu hao nhiều linh lực.' },
      { text: '🙉 Bịt tai, tiếng chuông quá ồn ào', type: 'wrong', flavor: 'Từ chối chỉ dẫn của thiên đạo.' },
    ],
  },

  // ── KỲ NGỘ (Gặp gỡ kỳ lạ trong thiền định) ──
  {
    id: 'ky_ngo_1',
    category: 'ky_ngo',
    title: '👻 Cổ Tu Sĩ Hiện Hồn',
    description: 'Trong không gian thiền định, linh hồn một cổ tu sĩ hiện ra: _"Ta có thể truyền cho ngươi một thần thông, nhưng..."_',
    answers: [
      { text: '🙏 Kính cẩn thỉnh giáo, xin tiền bối chỉ dạy', type: 'correct', flavor: 'Cổ tu sĩ hài lòng, truyền thụ một chút kinh nghiệm tu luyện.' },
      { text: '🤝 Đặt điều kiện trao đổi', type: 'risky', flavor: 'Giao dịch thành công nhưng tiền bối hơi thất vọng.' },
      { text: '🚫 Từ chối, sợ bị lừa', type: 'wrong', flavor: 'Cổ tu sĩ thở dài biến mất, cơ duyên mất vĩnh viễn.' },
    ],
  },
  {
    id: 'ky_ngo_2',
    category: 'ky_ngo',
    title: '🦊 Hồ Yêu Quyến Rũ',
    description: 'Một mỹ nữ yêu kiều xuất hiện, mùi hương mê mẩn: _"Tu luyện khổ sở quá, hãy nghỉ ngơi cùng ta..."_',
    answers: [
      { text: '🧊 Tĩnh tâm như băng, không bị mê hoặc', type: 'correct', flavor: 'Hồ yêu bất lực rút lui, linh đài càng thêm trong sáng.' },
      { text: '🔥 Vận hỏa thiêu đốt ảo ảnh', type: 'risky', flavor: 'Xua đuổi thành công nhưng tiêu hao linh lực.' },
      { text: '💕 Ngồi xuống trò chuyện một lúc', type: 'wrong', flavor: 'Hồ yêu hút dần tinh lực, suýt mất mạng!' },
    ],
  },
  {
    id: 'ky_ngo_3',
    category: 'ky_ngo',
    title: '🐢 Thần Quy Xuất Hiện',
    description: 'Một con rùa cổ thần bò chậm rãi tới, trên mai có khắc những ký tự cổ xưa phát sáng...',
    answers: [
      { text: '👀 Cẩn thận đọc ký tự trên mai rùa', type: 'correct', flavor: 'Lĩnh ngộ một phần Thái Cổ Đạo Văn, trí tuệ khai sáng!' },
      { text: '✋ Chạm vào mai rùa cảm nhận', type: 'risky', flavor: 'Nhận được lực lượng cổ đại nhưng hơi quá tải.' },
      { text: '🏃 Tránh xa, sợ là yêu thú', type: 'wrong', flavor: 'Thần Quy thất vọng rời đi, cơ hội hiếm có bị bỏ lỡ.' },
    ],
  },
  {
    id: 'ky_ngo_4',
    category: 'ky_ngo',
    title: '🗡️ Kiếm Linh Thức Tỉnh',
    description: 'Thanh kiếm bên cạnh bỗng rung lên, phát ra tiếng kêu vang, muốn bay về phía ngươi!',
    answers: [
      { text: '🤝 Vận linh lực kết nối với kiếm linh', type: 'correct', flavor: 'Nhân kiếm hợp nhất, kiếm ý tăng vọt!' },
      { text: '🗡️ Nắm chặt kiếm, dùng ý chí chế ngự', type: 'risky', flavor: 'Kiếm linh phục tùng nhưng không tâm phục khẩu phục.' },
      { text: '😱 Né tránh, sợ bị thương', type: 'wrong', flavor: 'Kiếm linh thất vọng, trở lại trạng thái ngủ đông.' },
    ],
  },
  {
    id: 'ky_ngo_5',
    category: 'ky_ngo',
    title: '🌺 Linh Thảo Hiện Hình',
    description: 'Một bông hoa linh thảo phát quang xuất hiện giữa tâm cảnh, tỏa ra linh khí nồng đậm...',
    answers: [
      { text: '🧘 Tĩnh tọa bên cạnh, dùng công pháp hấp thu tự nhiên', type: 'correct', flavor: 'Linh khí từ hoa thảo thấm dần vào, ôn hòa mà mạnh mẽ.' },
      { text: '🤲 Hái hoa ngay lập tức', type: 'risky', flavor: 'Hái được nhưng hoa héo ngay, chỉ còn 1/3 linh lực.' },
      { text: '🧐 Nghi ngờ, đứng xa quan sát', type: 'wrong', flavor: 'Hoa linh thảo dần tan biến, quá thận trọng hóa ra mất cơ hội.' },
    ],
  },

  // ── BIẾN CỐ NỘI TÂM ──
  {
    id: 'noi_tam_1',
    category: 'noi_tam',
    title: '🔥 Linh Khí Nghịch Hành',
    description: 'Dòng linh khí đang lưu chuyển bỗng nghịch chuyển, đan điền nóng rực, đau đớn vô cùng!',
    answers: [
      { text: '🌊 Vận thủy hệ linh lực làm mát, ổn định dần', type: 'correct', flavor: 'Linh khí dần ổn định, nghịch cảnh hóa cơ duyên.' },
      { text: '🔥 Vận thêm hỏa lực, "dĩ độc trị độc"', type: 'risky', flavor: 'Hoặc thành công rực rỡ, hoặc tẩu hỏa nhập ma.' },
      { text: '😱 Hoảng loạn, lập tức xuất định', type: 'wrong', flavor: 'Linh khí tán loạn, kinh mạch bị tổn thương nặng.' },
    ],
  },
  {
    id: 'noi_tam_2',
    category: 'noi_tam',
    title: '💎 Đan Điền Rạn Nứt',
    description: 'Nghe thấy tiếng "rắc" — đan điền xuất hiện vết nứt nhỏ, linh lực rò rỉ ra ngoài!',
    answers: [
      { text: '🩹 Dùng linh lực chậm rãi hàn gắn', type: 'correct', flavor: 'Vết nứt được hàn, đan điền còn cứng hơn trước.' },
      { text: '💊 Nuốt đan dược hỗ trợ (nếu có)', type: 'risky', flavor: 'Đan dược phát huy tác dụng, nhưng có phó tác dụng.' },
      { text: '🏃 Phá vỡ thiền định ngay lập tức', type: 'wrong', flavor: 'Vết nứt mở rộng, linh lực hao tổn nghiêm trọng.' },
    ],
  },
  {
    id: 'noi_tam_3',
    category: 'noi_tam',
    title: '🌈 Ngũ Hành Thất Thường',
    description: 'Ngũ hành trong cơ thể bỗng mất cân bằng — kim khắc mộc, mộc khắc thổ, hỗn loạn!',
    answers: [
      { text: '☯️ Điều hòa ngũ hành, tìm điểm cân bằng', type: 'correct', flavor: 'Ngũ hành quay về quỹ đạo, cơ thể hài hòa hơn.' },
      { text: '🌪️ Phá vỡ quy luật, tạo hệ ngũ hành mới', type: 'risky', flavor: 'Nếu thành công sẽ đột phá, nhưng xác suất thấp.' },
      { text: '😰 Không biết xử lý, chịu đựng đau đớn', type: 'wrong', flavor: 'Nội thương nặng, cần nghỉ ngơi lâu dài.' },
    ],
  },
  {
    id: 'noi_tam_4',
    category: 'noi_tam',
    title: '🕸️ Kinh Mạch Bế Tắc',
    description: 'Một huyệt đạo quan trọng bị bế tắc, linh khí không lưu thông được!',
    answers: [
      { text: '🔓 Tập trung linh lực từ từ khai thông huyệt đạo', type: 'correct', flavor: 'Huyệt đạo khai thông, linh khí tuần hoàn mạnh hơn trước.' },
      { text: '💥 Dồn toàn bộ linh lực phá huyệt', type: 'risky', flavor: 'Phá được nhưng huyệt đạo xung quanh bị ảnh hưởng.' },
      { text: '⏭️ Bỏ qua, đi vòng sang kinh mạch khác', type: 'wrong', flavor: 'Đi vòng khiến linh lực tiêu hao gấp đôi, hiệu quả giảm.' },
    ],
  },
  {
    id: 'noi_tam_5',
    category: 'noi_tam',
    title: '✨ Linh Đài Chấn Động',
    description: 'Linh đài — nơi chứa thần hồn — bỗng rung lên dữ dội, ý thức bị kéo vào vùng tối...',
    answers: [
      { text: '🏠 Bình tĩnh quay về linh đài, bảo vệ thần hồn', type: 'correct', flavor: 'Thần hồn an toàn, linh đài được củng cố mạnh mẽ.' },
      { text: '🌟 Thả tâm thức lang thang, khám phá vùng tối', type: 'risky', flavor: 'Phát hiện bí mật trong vùng tối nhưng suýt lạc mất.' },
      { text: '😨 Hoảng sợ, la hét', type: 'wrong', flavor: 'Linh đài rung chuyển mạnh hơn, thần thức tổn thương.' },
    ],
  },

  // ── PHÚC DUYÊN (May mắn ngẫu nhiên) ──
  {
    id: 'phuc_duyen_1',
    category: 'phuc_duyen',
    title: '🌟 Tiên Duyên Giáng Lâm',
    description: 'Một tia tiên khí thuần khiết từ trên trời rơi xuống, chiếu thẳng vào đỉnh đầu!',
    answers: [
      { text: '🧘 Mở toàn bộ kinh mạch, đón nhận', type: 'correct', flavor: 'Tiên khí tẩy tủy phạt kinh, thân thể tiến hóa!' },
      { text: '🙏 Cảm tạ trời đất, từ từ hấp thu', type: 'correct', flavor: 'Tiên khí ôn hòa chảy vào, dễ dàng đồng hóa.' },
      { text: '🤔 Chần chừ nghi ngại', type: 'wrong', flavor: 'Tiên khí tản mất, chỉ hấp thu được phần nhỏ.' },
    ],
  },
  {
    id: 'phuc_duyen_2',
    category: 'phuc_duyen',
    title: '📿 Xá Lợi Tử Hiện',
    description: 'Trong đan điền bỗng xuất hiện một hạt xá lợi tử phát sáng, đây là dấu hiệu đạo hạnh thâm hậu!',
    answers: [
      { text: '🧘 Cẩn thận nuôi dưỡng xá lợi tử', type: 'correct', flavor: 'Xá lợi tử lớn lên, linh lực tăng vĩnh viễn.' },
      { text: '💎 Nén xá lợi tử thành linh châu', type: 'risky', flavor: 'Linh châu mạnh nhưng mất xá lợi tử nguyên bản.' },
      { text: '🤯 Quá bất ngờ, mất tập trung', type: 'wrong', flavor: 'Xá lợi tử mất ổn định, tan thành linh khí phân tán.' },
    ],
  },
  {
    id: 'phuc_duyen_3',
    category: 'phuc_duyen',
    title: '🎶 Thiên Lại Chi Âm',
    description: 'Tiếng nhạc tự nhiên vang lên, mỗi nốt nhạc mang theo đạo vận thâm sâu...',
    answers: [
      { text: '🎵 Nhắm mắt lắng nghe, để tâm hồn hòa vào giai điệu', type: 'correct', flavor: 'Đạo vận thấm vào linh hồn, ngộ tính tăng mạnh.' },
      { text: '🎶 Hát theo, tạo cộng hưởng', type: 'risky', flavor: 'Cộng hưởng mạnh mẽ nhưng hơi quá sức chịu đựng.' },
      { text: '🔇 Bịt tai, tập trung tu luyện', type: 'wrong', flavor: 'Bỏ lỡ âm luật thiên đạo, đáng tiếc vô cùng.' },
    ],
  },

  // ── SỰ KIỆN ĐẶC BIỆT CHO MA ĐẠO ──
  {
    id: 'ma_dao_1',
    category: 'ma_dao',
    title: '🌙 Ma Khí Phùng Nguồn',
    description: 'Ma khí cuồn cuộn kéo tới, tràn vào đan điền. Đối với ma tu, đây là đại bổ!',
    answers: [
      { text: '😈 Vận ma công hấp thu toàn bộ', type: 'correct', flavor: 'Ma khí chuyển hóa thành ma lực, công lực đại tiến!' },
      { text: '⚖️ Chỉ hấp thu một phần, giữ cân bằng', type: 'risky', flavor: 'An toàn nhưng bỏ phí nguồn ma khí dồi dào.' },
      { text: '🛡️ Chống cự ma khí, bảo vệ chính khí', type: 'wrong', flavor: 'Ma tu mà chống ma khí? Nội chiến trong thân, kinh mạch rối loạn.' },
    ],
  },
  {
    id: 'ma_dao_2',
    category: 'ma_dao',
    title: '💀 Vong Hồn Tụ Tập',
    description: 'Hàng trăm vong hồn kéo đến, oán khí xung thiên. Chúng quỳ lạy xin ma tu giải thoát...',
    answers: [
      { text: '🖤 Hấp thu oán khí, ban cho siêu thoát', type: 'correct', flavor: 'Oán khí chuyển hóa thành ma lực, vong hồn tiêu tán.' },
      { text: '💀 Thu phục vong hồn làm tay sai', type: 'risky', flavor: 'Có thêm lực lượng nhưng oán khí nhiễm thân.' },
      { text: '🙏 Tụng kinh siêu độ', type: 'wrong', flavor: 'Ma tu tụng kinh? Nội tâm mâu thuẫn, tu vi dao động.' },
    ],
  },

  // ── SỰ KIỆN ĐẶC BIỆT CẢNH GIỚI CAO (Kim Đan+) ──
  {
    id: 'cao_cap_1',
    category: 'cao_cap',
    title: '🔮 Thiên Nhãn Khai Mở',
    description: 'Trong lúc nhập định sâu, con mắt thứ ba ở giữa trán bắt đầu mở ra!',
    answers: [
      { text: '🔮 Từ từ mở, điều khiển linh lực hỗ trợ', type: 'correct', flavor: 'Thiên nhãn khai sáng, nhìn thấu vạn vật bản chất!' },
      { text: '💪 Dồn hết sức mở hoàn toàn', type: 'risky', flavor: 'Mở nhanh nhưng quá tải, đau đầu dữ dội.' },
      { text: '😨 Sợ hãi, cố đóng lại', type: 'wrong', flavor: 'Thiên nhãn bị ức chế, từ nay khó mở lại.' },
    ],
  },
  {
    id: 'cao_cap_2',
    category: 'cao_cap',
    title: '🌌 Hư Không Liệt Phùng',
    description: 'Không gian trước mặt bỗng nứt ra, bên trong là một thế giới khác — linh khí dày đặc gấp trăm lần!',
    answers: [
      { text: '🚪 Bước vào, tu luyện trong không gian giàu linh khí', type: 'correct', flavor: 'Tu luyện một khắc bằng trăm năm ngoài đời!' },
      { text: '🤲 Chỉ hấp thu linh khí từ vết nứt', type: 'risky', flavor: 'An toàn hơn nhưng được ít linh khí.' },
      { text: '🏃 Nhanh chóng rời xa vết nứt', type: 'wrong', flavor: 'Cơ duyên tuyệt thế bị bỏ lỡ.' },
    ],
  },
  {
    id: 'cao_cap_3',
    category: 'cao_cap',
    title: '⚡ Thiên Đạo Thị Luyện',
    description: 'Thiên đạo cảm ứng tu vi của ngươi, giáng xuống một tia thiên uy — đây là thử thách, cũng là cơ duyên!',
    answers: [
      { text: '🧘 Nghênh đón thiên uy, dùng thân thể rèn luyện', type: 'correct', flavor: 'Thiên uy tôi luyện thân thể, kinh mạch mở rộng!' },
      { text: '🛡️ Vận toàn bộ linh lực chống đỡ', type: 'risky', flavor: 'Chặn được thiên uy nhưng linh lực cạn kiệt.' },
      { text: '🙇 Quỳ lạy cầu xin tha thứ', type: 'wrong', flavor: 'Thiên đạo vô tình, quỳ lạy cũng vô dụng. Đạo tâm sụp đổ.' },
    ],
  },
];

// ═══════════════════════════════════════════
// VÒNG 1: HẤP THU LINH KHÍ
// ═══════════════════════════════════════════

const ELEMENT_INTERACTIONS = {
  // element: { boost: [tương sinh], neutral: [...], counter: [tương khắc] }
  'thuy': { boost: ['moc'], neutral: ['phong', 'loi'], counter: ['hoa', 'tho'] },
  'hoa': { boost: ['tho'], neutral: ['phong', 'loi'], counter: ['thuy', 'moc'] },
  'moc': { boost: ['hoa'], neutral: ['phong', 'loi'], counter: ['tho', 'thuy'] },
  'tho': { boost: ['loi'], neutral: ['phong', 'thuy'], counter: ['moc', 'hoa'] },
  'phong': { boost: ['loi'], neutral: ['thuy', 'hoa'], counter: ['tho', 'moc'] },
  'loi': { boost: ['phong'], neutral: ['thuy', 'hoa'], counter: ['tho', 'moc'] },
};

const LINH_KHI_OPTIONS = [
  { id: 'thuy', emoji: '🌊', name: 'Thủy Khí', desc: 'Nhu hòa, linh hoạt' },
  { id: 'hoa', emoji: '🔥', name: 'Hỏa Khí', desc: 'Mãnh liệt, bùng cháy' },
  { id: 'moc', emoji: '🌿', name: 'Mộc Khí', desc: 'Sinh trưởng, chữa lành' },
  { id: 'tho', emoji: '🪨', name: 'Thổ Khí', desc: 'Vững chắc, ổn định' },
  { id: 'phong', emoji: '🌪️', name: 'Phong Khí', desc: 'Nhanh nhạy, xuyên thấu' },
  { id: 'loi', emoji: '⚡', name: 'Lôi Khí', desc: 'Bùng nổ, hủy diệt' },
];

/**
 * Xác định nguyên tố chính từ linh căn player
 */
function getPlayerElement(player) {
  const rootMap = {
    'thuy': 'thuy', 'thủy': 'thuy', 'water': 'thuy',
    'hoa': 'hoa', 'hỏa': 'hoa', 'fire': 'hoa',
    'moc': 'moc', 'mộc': 'moc', 'wood': 'moc',
    'tho': 'tho', 'thổ': 'tho', 'earth': 'tho',
    'phong': 'phong', 'wind': 'phong',
    'loi': 'loi', 'lôi': 'loi', 'thunder': 'loi', 'lightning': 'loi',
  };

  const root = (player.spiritual_root || '').toLowerCase();
  for (const [key, val] of Object.entries(rootMap)) {
    if (root.includes(key)) return val;
  }
  // Default: random
  return LINH_KHI_OPTIONS[Math.floor(Math.random() * LINH_KHI_OPTIONS.length)].id;
}

// ═══════════════════════════════════════════
// SESSION MANAGEMENT
// ═══════════════════════════════════════════

/** @type {Map<string, CultivationSession>} */
const activeSessions = new Map();

/**
 * @typedef {Object} CultivationSession
 * @property {number} playerId
 * @property {number} round - Vòng hiện tại (1-5)
 * @property {number} maxRounds - Tổng số vòng
 * @property {number} score - Điểm performance (0-100)
 * @property {string} playerElement - Nguyên tố chính player
 * @property {Array} events - Danh sách event đã chọn cho session
 * @property {string} currentEventId - Event đang xử lý
 * @property {boolean} tauHoa - Đã tẩu hỏa chưa
 * @property {number} baseExp - EXP cơ bản
 */

/**
 * Bắt đầu session tu luyện mới
 */
function startSession(player) {
  const playerElement = getPlayerElement(player);
  const maxRounds = player.realm_index >= 3 ? 5 : 3; // Kim Đan+ có 5 vòng

  // Chọn events ngẫu nhiên cho session này
  const availableEvents = RANDOM_EVENTS.filter(e => {
    if (e.category === 'ma_dao' && player.dao_path !== 'ma') return false;
    if (e.category === 'cao_cap' && player.realm_index < 3) return false;
    return true;
  });

  // Shuffle và chọn events cho từng vòng (vòng 3+)
  const shuffled = [...availableEvents].sort(() => Math.random() - 0.5);
  const selectedEvents = shuffled.slice(0, maxRounds);

  const session = {
    playerId: player.id,
    round: 0,
    maxRounds,
    score: 0,
    playerElement,
    events: selectedEvents,
    currentEventId: null,
    tauHoa: false,
    baseExp: Math.floor(Math.random() * 16) + 15, // 15-30
    timestamp: Date.now(),
  };

  activeSessions.set(player.discord_id, session);
  return session;
}

function getSession(discordId) {
  return activeSessions.get(discordId);
}

function endSession(discordId) {
  activeSessions.delete(discordId);
}

// ═══════════════════════════════════════════
// ROUND BUILDERS
// ═══════════════════════════════════════════

/**
 * Vòng 1: Hấp Thu Linh Khí — Chọn nguyên tố
 */
function buildRound1(session) {
  // Chọn 3 nguyên tố ngẫu nhiên (đảm bảo có ít nhất 1 đúng)
  const shuffled = [...LINH_KHI_OPTIONS].sort(() => Math.random() - 0.5);
  const playerEl = LINH_KHI_OPTIONS.find(o => o.id === session.playerElement);
  let options = shuffled.slice(0, 3);

  // Đảm bảo có nguyên tố phù hợp
  if (!options.find(o => o.id === session.playerElement)) {
    options[Math.floor(Math.random() * 3)] = playerEl;
  }
  // Shuffle lại để đáp án đúng không luôn ở cùng vị trí
  options = options.sort(() => Math.random() - 0.5);

  const embed = new EmbedBuilder()
    .setColor(0x9b59b6)
    .setTitle('🧘 Tu Luyện — Vòng 1/3: Hấp Thu Linh Khí')
    .setDescription(
      `Ngươi ngồi xuống tĩnh tọa, mở đan điền cảm ứng linh khí trời đất...\n\n` +
      `Có **3 dòng linh khí** đang cuộn tới. Hãy chọn dòng phù hợp với linh căn:\n\n` +
      options.map((o, i) => `${o.emoji} **${o.name}** — _${o.desc}_`).join('\n')
    )
    .setFooter({ text: '💡 Chọn đúng linh căn = Bonus EXP | Chọn sai = Giảm EXP' })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    ...options.map(o =>
      new ButtonBuilder()
        .setCustomId(`icultivation:r1:${o.id}`)
        .setLabel(o.name)
        .setEmoji(o.emoji)
        .setStyle(ButtonStyle.Primary)
    )
  );

  return { embed, components: [row] };
}

/**
 * Vòng 2: Vận Chuyển Kinh Mạch — An toàn / Rủi ro / Cực đoan
 */
function buildRound2(session) {
  const embed = new EmbedBuilder()
    .setColor(0xe67e22)
    .setTitle(`🧘 Tu Luyện — Vòng 2/${session.maxRounds}: Vận Chuyển Kinh Mạch`)
    .setDescription(
      `Linh khí đã vào đan điền. Bây giờ cần dẫn nó qua kinh mạch...\n\n` +
      `Chọn cách vận chuyển:\n\n` +
      `🐢 **Thuận Hành** — An toàn, ổn định. EXP bình thường.\n` +
      `⚡ **Nghịch Chuyển** — Rủi ro cao nhưng EXP x2 nếu thành công.\n` +
      `🌀 **Kỳ Kinh Bát Mạch** — Cực kỳ nguy hiểm. Thành: EXP x3 | Bại: Tẩu hỏa!`
    )
    .setFooter({ text: `Điểm hiện tại: ${session.score}/100` })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('icultivation:r2:safe')
      .setLabel('Thuận Hành')
      .setEmoji('🐢')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('icultivation:r2:risky')
      .setLabel('Nghịch Chuyển')
      .setEmoji('⚡')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('icultivation:r2:extreme')
      .setLabel('Kỳ Kinh Bát Mạch')
      .setEmoji('🌀')
      .setStyle(ButtonStyle.Danger),
  );

  return { embed, components: [row] };
}

/**
 * Vòng 3+: Random Event — Sự kiện ngẫu nhiên
 */
function buildRandomEventRound(session, roundNum) {
  const eventIndex = roundNum - 3; // Round 3 = index 0, Round 4 = index 1, etc.
  const event = session.events[eventIndex % session.events.length];
  session.currentEventId = event.id;

  // QUAN TRỌNG: Shuffle đáp án mỗi lần để không bao giờ trùng vị trí
  const shuffledAnswers = [...event.answers].sort(() => Math.random() - 0.5);

  const embed = new EmbedBuilder()
    .setColor(
      event.category === 'tam_ma' ? 0xe74c3c :
      event.category === 'di_tuong' ? 0x3498db :
      event.category === 'cam_ngo' ? 0xf1c40f :
      event.category === 'phuc_duyen' ? 0x2ecc71 :
      event.category === 'ma_dao' ? 0x8e44ad :
      0x9b59b6
    )
    .setTitle(`🧘 Tu Luyện — Vòng ${roundNum}/${session.maxRounds}: ${event.title}`)
    .setDescription(
      `${event.description}\n\n` +
      `Ngươi sẽ làm gì?`
    )
    .setFooter({ text: `Điểm: ${session.score}/100 | ${event.category.replace('_', ' ').toUpperCase()}` })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    ...shuffledAnswers.map((ans, i) =>
      new ButtonBuilder()
        .setCustomId(`icultivation:r3:${event.id}:${ans.type}:${i}`)
        .setLabel(ans.text.substring(0, 80))
        .setStyle(
          ans.type === 'correct' ? ButtonStyle.Success :
          ans.type === 'risky' ? ButtonStyle.Primary :
          ButtonStyle.Secondary
        )
    )
  );

  // Lưu shuffled answers vào session để lookup flavor text
  session._currentAnswers = shuffledAnswers;

  return { embed, components: [row] };
}

// ═══════════════════════════════════════════
// XỬLÝ KẾT QUẢ TỪNG VÒNG
// ═══════════════════════════════════════════

/**
 * Xử lý kết quả Vòng 1: Hấp Thu Linh Khí
 */
function processRound1(session, chosenElement) {
  const playerEl = session.playerElement;
  const interactions = ELEMENT_INTERACTIONS[playerEl] || {};

  let result = { score: 0, text: '', color: COLORS.INFO };

  if (chosenElement === playerEl) {
    result.score = 30;
    result.text = `✨ **Hoàn hảo!** Linh khí ${chosenElement} hoàn toàn phù hợp linh căn, hấp thu nhanh chóng!`;
    result.color = COLORS.SUCCESS;
  } else if (interactions.boost && interactions.boost.includes(chosenElement)) {
    result.score = 25;
    result.text = `👍 **Tương sinh!** Nguyên tố tương sinh, hấp thu thuận lợi.`;
    result.color = COLORS.SUCCESS;
  } else if (interactions.neutral && interactions.neutral.includes(chosenElement)) {
    result.score = 15;
    result.text = `😐 **Bình thường.** Linh khí không đặc biệt phù hợp, hấp thu ổn.`;
    result.color = COLORS.WARNING;
  } else {
    result.score = 5;
    result.text = `💥 **Tương khắc!** Linh khí xung đột với linh căn, kinh mạch bị chấn động!`;
    result.color = COLORS.ERROR;
  }

  session.score += result.score;
  return result;
}

/**
 * Xử lý kết quả Vòng 2: Kinh Mạch
 */
function processRound2(session, choice, player) {
  let result = { score: 0, text: '', color: COLORS.INFO, tauHoa: false };

  switch (choice) {
    case 'safe':
      result.score = 15;
      result.text = '🐢 **Thuận hành thành công!** Linh khí chảy đều qua kinh mạch, ổn định.';
      result.color = COLORS.SUCCESS;
      break;

    case 'risky': {
      // 70% thành công, 30% thất bại
      const success = Math.random() < 0.7;
      if (success) {
        result.score = 30;
        result.text = '⚡ **Nghịch chuyển thành công!** Linh khí bùng nổ, kinh mạch mở rộng, tu vi đại tiến!';
        result.color = COLORS.SUCCESS;
      } else {
        result.score = 5;
        result.text = '💫 **Nghịch chuyển thất bại!** Linh khí rối loạn, may mà không tẩu hỏa...';
        result.color = COLORS.WARNING;
      }
      break;
    }

    case 'extreme': {
      // 40% đại thành, 30% bình thường, 30% tẩu hỏa
      const roll = Math.random();
      // Ma đạo giảm tẩu hỏa xuống còn 3% (từ 5%)
      const tauHoaThreshold = player.dao_path === 'ma' ? 0.27 : 0.30;

      if (roll < 0.40) {
        result.score = 45;
        result.text = '🌀 **Kỳ Kinh Bát Mạch THÀNH CÔNG!** Tám mạch kỳ kinh đồng thời khai thông, tu vi bạo tăng!';
        result.color = 0xFFD700;
      } else if (roll < 0.70) {
        result.score = 15;
        result.text = '🌀 Kỳ Kinh Bát Mạch chỉ khai thông được 3 mạch, kết quả bình thường.';
        result.color = COLORS.WARNING;
      } else {
        result.score = -10;
        result.tauHoa = true;
        session.tauHoa = true;
        result.text = '🔥 **TẨU HỎA NHẬP MA!** Linh khí nghịch chuyển toàn bộ, kinh mạch bị tổn thương!';
        result.color = COLORS.ERROR;
      }
      break;
    }
  }

  session.score += result.score;
  return result;
}

/**
 * Xử lý kết quả Vòng 3+: Random Event
 */
function processRandomEvent(session, answerType) {
  let result = { score: 0, text: '', color: COLORS.INFO, flavorText: '' };

  // Tìm flavor text từ answers đã shuffle
  const answer = (session._currentAnswers || []).find(a => a.type === answerType);
  result.flavorText = answer ? answer.flavor : '';

  switch (answerType) {
    case 'correct':
      result.score = 25;
      result.text = '✅ **Lựa chọn sáng suốt!**';
      result.color = COLORS.SUCCESS;
      break;
    case 'risky': {
      const success = Math.random() < 0.6;
      if (success) {
        result.score = 20;
        result.text = '⚡ **Mạo hiểm thành công!**';
        result.color = COLORS.SUCCESS;
      } else {
        result.score = 5;
        result.text = '💫 **Mạo hiểm thất bại, nhưng không quá nghiêm trọng.**';
        result.color = COLORS.WARNING;
      }
      break;
    }
    case 'wrong':
      result.score = -5;
      result.text = '❌ **Lựa chọn sai lầm!**';
      result.color = COLORS.ERROR;
      break;
  }

  session.score += result.score;
  return result;
}

// ═══════════════════════════════════════════
// TÍNH TOÁN KẾT QUẢ CUỐI CÙNG
// ═══════════════════════════════════════════

/**
 * Tính EXP cuối cùng dựa trên performance
 */
function calculateFinalResults(session, player) {
  const score = Math.max(0, session.score);
  const techniques = require('../../config/techniques');
  const technique = techniques.list.find(t => t.id === player.technique_id);
  const expBonus = technique ? technique.exp_bonus / 100 : 0;

  let multiplier = 1;
  let grade = 'normal';
  let gradeEmoji = '😐';
  let gradeText = 'Bình Thường';

  if (score >= 80) {
    multiplier = 3;
    grade = 'perfect';
    gradeEmoji = '🌟';
    gradeText = 'Hoàn Mỹ';
  } else if (score >= 60) {
    multiplier = 2.5;
    grade = 'excellent';
    gradeEmoji = '✨';
    gradeText = 'Xuất Sắc';
  } else if (score >= 40) {
    multiplier = 2;
    grade = 'good';
    gradeEmoji = '👍';
    gradeText = 'Tốt';
  } else if (score >= 20) {
    multiplier = 1;
    grade = 'normal';
    gradeEmoji = '😐';
    gradeText = 'Bình Thường';
  } else {
    multiplier = 0.5;
    grade = 'bad';
    gradeEmoji = '😰';
    gradeText = 'Kém';
  }

  // Tẩu hỏa giảm 50%
  if (session.tauHoa) {
    multiplier *= 0.5;
  }

  const baseExp = session.baseExp;
  const bonusExp = Math.floor(baseExp * expBonus);
  const totalBase = baseExp + bonusExp;
  const finalExp = Math.max(1, Math.floor(totalBase * multiplier));

  // Ma đạo bonus (giữ lại nhưng giảm tẩu hỏa)
  let maBonus = 0;
  if (player.dao_path === 'ma') {
    maBonus = Math.floor(finalExp * 0.15);
  }

  // Chance nhận Hậu Thiên Khí Vận (15-25%)
  const khiVanChance = grade === 'perfect' ? 0.30 : grade === 'excellent' ? 0.25 : grade === 'good' ? 0.20 : 0.10;
  const rollKhiVan = Math.random() < khiVanChance;

  return {
    score,
    grade,
    gradeEmoji,
    gradeText,
    multiplier,
    baseExp,
    bonusExp,
    finalExp: finalExp + maBonus,
    maBonus,
    tauHoa: session.tauHoa,
    khiVanRoll: rollKhiVan,
    technique,
  };
}

module.exports = {
  RANDOM_EVENTS,
  LINH_KHI_OPTIONS,
  ELEMENT_INTERACTIONS,
  activeSessions,
  startSession,
  getSession,
  endSession,
  getPlayerElement,
  buildRound1,
  buildRound2,
  buildRandomEventRound,
  processRound1,
  processRound2,
  processRandomEvent,
  calculateFinalResults,
};
