export const CLANS = {
  PUPPET: 'nghệ thuật rối',
  HYUGA: 'hyuga',
  UCHIHA: 'uchiha',
  NORMAL: 'thường',
  MANGEKYO: 'mangakyo',
  RINNEGAN: 'rinnegan',
  TOOLS: 'nhẫn cụ',
  BOMB: 'bom nghệ thuật',
  SHARK: 'cá mập và sóng',
  SEAL: 'phong ấn',
  SAND: 'sa mạc và máu',
  GENJUTSU: 'ảo thuật',
  YELLOW_FLASH: 'tia chớp vàng',
  TAIJUTSU: 'thể thuật',
  SAKURA: 'hoa anh đào',
  SHADOW: 'khiển bóng',
  COPY_NINJA: 'ninja sao chép',
  PAPER_ANGEL: 'thiên thần giấy',
};

export const HIDDEN_CLANS = [CLANS.MANGEKYO, CLANS.RINNEGAN];

export const ELEMENTS = {
  FIRE: 'hỏa',
  WATER: 'thủy',
  LIGHTNING: 'lôi',
  WIND: 'phong',
};

export const REACTIONS = {
  'lôi+thủy': { name: 'Sốc điện lan truyền', desc: '50 sát thương cho mục tiêu và 2 người bên cạnh' },
  'hỏa+thủy': { name: 'Hơi nước bốc hơi', desc: '100 sát thương trực tiếp' },
  'hỏa+hỏa': { name: 'Quá tải nhiệt', desc: 'Gây chảy máu 150' },
  'thủy+thủy': { name: 'Đóng băng', desc: 'Trừ 30 điểm né tránh' },
  'lôi+lôi': { name: 'Sấm sét giật cục', desc: 'Trừ 1 tinh thần và gây 30 sát thương' },
  'hỏa+lôi': { name: 'Điện-Nhiệt: Choáng', desc: 'Choáng mục tiêu ở vòng kế tiếp' },
};

export const AUTO_DESC = {
  rev: 'tự hồi sinh 500 máu, nhận 500 giáp (1 lượt)',
  kl: 'miễn đòn tấn công, nhận lại thẻ tấn công tương đương',
  kr: 'miễn đòn cấp A trở lên, nhận +150 giáp',
  trap: 'phản 100% sát thương và -1 tinh thần kẻ tấn công',
  gq: 'miễn đòn, hồi máu bằng sát thương phải nhận',
  izm: 'khi bị đòn cấp A: đánh dấu kẻ đó, mọi hành động lượt sau của họ bị xóa',
};

export const TYPE_LABELS = {
  a: 'Tấn công',
  s: 'Trạng thái',
  d: 'Đỡ đòn',
  x: 'Đặc biệt',
  h: 'Hồi phục',
};

const card = (id, n, r, t, s, extra = {}) => ({ id, n, r, t, s, ...extra });

const {
  PUPPET: R, HYUGA: H, UCHIHA: U, NORMAL: T, MANGEKYO: M, RINNEGAN: RN,
  TOOLS: TL, BOMB: BM, SHARK: SH, SEAL: SL, SAND: SD, GENJUTSU: GJ,
  YELLOW_FLASH: YF, TAIJUTSU: TJ, SAKURA: SK, SHADOW: SW, COPY_NINJA: CN, PAPER_ANGEL: PA,
} = CLANS;

export const CARDS = [
  card(0, 'sharingan', 'A', 's', U, { dg: 70, sf: -1, b: { m: 0.3, t: 5 } }),
  card(1, 'rasengan', 'A', 'a', T, { d: 200 }),
  card(2, 'ném kunai', 'C', 'a', TL, { d: 50 }),
  card(3, 'ném shuriken', 'C', 'a', TL, { d: 60 }),
  card(4, 'hỏa độn', 'B', 'a', T, { d: 100, el: 'hỏa' }),
  card(5, 'thủy độn', 'B', 'a', T, { d: 110, el: 'thủy' }),
  card(6, 'bạch nhãn', 'A', 's', H, { dg: 55, b: { m: 0.15, hy: 0.5, t: 5 } }),
  card(7, 'thuật triệu hồi', 'A', 's', T, { pet: [1, 200, 30] }),
  card(8, 'izanagi', 'S', 'x', U, { au: 'rev' }),
  card(9, 'phi lôi thần thuật', 'S', 'a', YF, { a: 140, dg: 100, el: 'lôi' }),
  card(10, 'phong độn', 'B', 'a', T, { a: 30, el: 'phong' }),
  card(11, 'bom c4 nhện', 'B', 'a', BM, { d: 80, j: 10, el: 'hỏa' }),
  card(12, 'bom c4 chim', 'B', 'a', BM, { d: 90, j: 10, el: 'hỏa' }),
  card(13, 'karasu', 'B', 'a', R, { d: 100, crit: 1 }),
  card(14, 'kuroari', 'B', 'a', R, { d: 50, st: 1 }),
  card(15, 'kanshouo', 'B', 'd', R, { ar: 50 }),
  card(16, 'hiruko', 'A', 's', R, { ar: 150, b: { m: 0.05, ua: 1, rf: 20 } }),
  card(17, 'rối kage đệ tam', 'S', 'a', R, { d: 300, bl: 200 }),
  card(18, 'thập rối chikamatsu', 'S', 'a', R, { a: 250 }),
  card(19, 'bách rối thuật', 'S', 'a', R, { a: 300 }),
  card(20, 'thủy lao thuật', 'B', 'a', SH, { d: 20, st: 1, el: 'thủy' }),
  card(21, 'ngũ thực giảo', 'B', 'a', SH, { d: 150, el: 'thủy' }),
  card(22, 'thiên thực giảo', 'A', 'a', SH, { a: 220, dg: 30, el: 'thủy' }),
  card(23, 'thủy đạn thuật', 'B', 'a', SH, { d: 150, dg: 40, el: 'thủy' }),
  card(24, 'thủy phân thân', 'A', 's', T, { pet: [1, 200, 20] }),
  card(25, 'odama rasengan', 'S', 'a', T, { d: 300, el: 'phong' }),
  card(26, 'đa phân thân thuật', 'S', 's', T, { pet: [2, 150, 20] }),
  card(27, 'hỏa long viêm đạn', 'A', 'a', T, { d: 200, el: 'hỏa' }),
  card(28, 'chidori', 'A', 'a', T, { d: 220, dg: 10, el: 'lôi' }),
  card(29, 'thi quỷ phong tận', 'S', 'a', SL, { hpl: 80, d: 20, st: 4 }),
  card(30, 'cổng thần đạo', 'A', 'a', SL, { d: 150, kp: 1 }),
  card(31, 'kim sa ấn', 'S', 'a', SL, { d: 200, st: 1, ds: 1 }),
  card(32, 'ngũ trùng la sinh môn', 'A', 'd', T, { ar: 300, at: 3 }),
  card(33, 'thuẫn cát', 'B', 'd', SD, { ar: 50 }),
  card(34, 'hồi thiên', 'B', 'd', H, { dg: 90, a: 30 }),
  card(35, 'nhu quyền', 'C', 'a', H, { d: 30, dt: 20 }),
  card(36, 'lục thập tứ chưởng', 'A', 'a', H, { h: [80, 160, 32, 64] }),
  card(37, 'bát quái không chưởng', 'B', 'a', H, { d: 180 }),
  card(38, 'nhu bộ song sư kích', 'B', 'a', H, { h: [80, 80] }),
  card(39, 'bách nhị thập tứ chưởng', 'A', 'a', H, { h: [80, 160, 32, 64, 128] }),
  card(40, 'susanoo', 'S', 's', M, { ar: 250, b: { m: 0.6, ua: 1 } }),
  card(41, 'hỏa cầu chi thuật', 'B', 'a', U, { d: 130, el: 'hỏa' }),
  card(42, 'phụng liên đạn', 'B', 'a', U, { h: [30, 30, 30], el: 'hỏa' }),
  card(43, 'chiếu bản chi thuật', 'A', 'a', GJ, { d: 30, ms: 2, bl: 200 }),
  card(44, 'hống trương cấm thính', 'B', 'a', GJ, { a: 100, ma: 1 }),
  card(45, 'bẫy ảo thuật', 'A', 'x', GJ, { au: 'trap' }),
  card(46, 'mangakyo sharingan', 'S', 's', U, { sf: -2, b: { m: 0.6, t: 3 }, gv: 'm' }),
  card(47, 'thiên chiếu', 'S', 'a', M, { d: 50, bl: Infinity }),
  card(48, 'stukuyomi', 'S', 'a', M, { d: 150, ms: 3, bl: 200 }),
  card(49, 'kamui trái', 'S', 'x', M, { au: 'kl' }),
  card(50, 'kamui phải', 'S', 'x', M, { au: 'kr' }),
  card(51, 'rinnengan', 'S', 'x', RN, { gv: 'r' }),
  card(52, 'thiên đạo đẩy', 'S', 'a', RN, { d: 50, rd: 1 }),
  card(53, 'thiên đạo hút', 'S', 'a', RN, { d: 50, rs: 1 }),
  card(54, 'atula đạo tên lửa', 'B', 'a', RN, { a: 100 }),
  card(55, 'atula đạo lưỡi cưa', 'B', 'a', RN, { d: 200 }),
  card(56, 'súc sinh đạo', 'A', 's', RN, { pet: [1, 300, 50] }),
  card(57, 'ngạ quỷ đạo', 'A', 'x', RN, { au: 'gq' }),
  card(58, 'nhân gian đạo', 'A', 'a', RN, { ms: 5 }),
  card(59, 'địa ngục đạo', 'S', 'x', RN, { rv: 1 }),
  card(60, 'địa bộc thiên tinh', 'S', 'a', RN, { d: 500, st: 2 }),
  card(61, 'tengai shinsei', 'S', 'a', RN, { a: 400 }),
  card(62, 'ngoại đạo ma tượng', 'S', 'a', RN, { a: 600, hpl: 40, kpa: 1 }),
  card(63, 'izanami', 'S', 'x', M, { au: 'izm' }),
  // 32 New cards from updated narutoskill.xlsx
  card(64, 'bát môn độn giáp tử môn', 'S', 's', TJ, { hpl: 60, dg: 150, b: { m: 2.0, t: 2 } }),
  card(65, 'Lưu Sa Tế Bão', 'S', 'a', SD, { a: 250, el: 'phong' }),
  card(66, 'Sa Mạc Tằng Đại Táng', 'A', 'a', SD, { d: 350, bl: 150, el: 'phong' }),
  card(67, 'Lưu Sa Triều', 'B', 'a', SD, { d: 120, dt: 30, el: 'phong' }),
  card(68, 'Khiên Cát Tự Động', 'S', 's', SD, { ar: 200, b: { m: 0, ua: 1, rf: 40, dr: 0.5 } }),
  card(69, 'Mộng Nhất Vĩ', 'S', 's', SD, { hpl: 40, pet: [1, 500, 120, 1, 1] }),
  card(70, 'Mộc Diệp Sen Ký', 'B', 'a', TJ, { d: 130, dt: 20 }),
  card(71, 'Biến Hình Liên Đạn', 'A', 'a', TJ, { h: [90, 100, 120] }),
  card(72, 'Bát Môn khai môn', 'B', 'd', TJ, { dg: 150 }),
  card(73, 'Liên Hoa Đầu', 'S', 'a', TJ, { hpl: 5, d: 320 }),
  card(74, 'Triều Khổng Tước', 'S', 'a', TJ, { split: 1000 }),
  card(75, 'Đoản Kiếm Đột Kích', 'C', 'a', TL, { d: 45 }),
  card(76, 'Phi Tiêu Cơn Lốc', 'C', 'a', TL, { d: 40, el: 'phong' }),
  card(77, 'Tiêm Dược Cấp Cứu', 'C', 'h', T, { heal: 200, ally: 1 }),
  card(78, 'Thể Thuật Cận Chiến', 'C', 'a', TJ, { d: 45 }),
  card(79, 'Trị Thương Thuật', 'B', 'h', SK, { heal: 400, ally: 1 }),
  card(80, 'Quái Lực Quyền', 'C', 'a', SK, { d: 125 }),
  card(81, 'Khai Hoa Bách Hợp Trị Liệu', 'A', 'h', SK, { healSelf: 500, cleanse: 1 }),
  card(82, 'Cú Đấm Sơn Trấn', 'B', 'a', SK, { d: 225 }),
  card(83, 'sáng tạo diêm sinh', 'S', 's', SK, { healSelf: 500, immune: 4, regen: { pct: 5, t: 4 } }),
  card(84, 'Uế Thổ Chuyển Sinh', 'S', 'x', T, { rv: 1, edo: 1 }),
  card(85, 'Thiểm Quang Trảm', 'A', 'a', YF, { a: 150, dg: 90, el: 'lôi' }),
  card(86, 'Ảnh Phộc Thuật', 'B', 'a', SW, { d: 20, st: 1 }),
  card(87, 'Ảnh Thủ Phược Cương Hợp', 'A', 'a', SW, { d: 220, rs: 1 }),
  card(88, 'Ảnh Thủ phược Kế', 'B', 'a', SW, { d: 40, ms: 1 }),
  card(89, 'Thổ Lưu Bích', 'B', 'd', CN, { ar: 150 }),
  card(90, 'Lôi Thiết', 'A', 'a', CN, { d: 300, ba: 1 }),
  card(91, 'bộc giấy trận', 'S', 'a', PA, { splitSelf: 2000, el: 'hỏa' }),
  card(92, 'thức giấy thuật tiễn', 'B', 'a', PA, { a: 200 }),
  card(93, 'vũ dịch chi thuật', 'B', 'd', PA, { dg: 80 }),
  card(94, 'thần chi giấy giả thuật', 'B', 'a', PA, { d: 180, ba: 1 }),
  card(95, 'thiên sứ chi dực', 'S', 'd', PA, { ar: 400, at: 1 }),
];

export function describeCard(c) {
  if (c.au) return `(tự kích hoạt) ${AUTO_DESC[c.au]}`;
  const o = [];
  if (c.hpl) o.push(`mất ${c.hpl}% máu`);
  if (c.d) o.push(`${c.d} sát thương`);
  if (c.a) o.push(`${c.a} lên cả bàn`);
  if (c.split) o.push(`chia đều ${c.split} lên đối thủ`);
  if (c.splitSelf) o.push(`chia đều ${c.splitSelf} lên tất cả (gồm bản thân)`);
  if (c.h) o.push(`đánh ${c.h.join('/')}`);
  if (c.j) o.push(`${c.j} hai bên`);
  if (c.crit) o.push('chí mạng nếu choáng');
  if (c.ba) o.push('phá mọi giáp');
  if (c.el) o.push(`ấn ${c.el}`);
  if (c.bl) o.push(`chảy máu ${c.bl > 1e9 ? 'vô hạn' : c.bl}`);
  if (c.st) o.push(`choáng ${c.st}`);
  if (c.ms) o.push(`-${c.ms} tinh thần`);
  if (c.ma) o.push(`-${c.ma} tinh thần cả bàn`);
  if (c.dt) o.push(`-${c.dt} né địch`);
  if (c.dg) o.push(`+${c.dg} né`);
  if (c.sf) o.push(`${c.sf} tinh thần bản thân`);
  if (c.ar) o.push(`+${c.ar} giáp${c.at ? ` (${c.at} lượt)` : ''}`);
  if (c.heal) o.push(`hồi ${c.heal} máu (bản thân hoặc mục tiêu)`);
  if (c.healSelf) o.push(`hồi ${c.healSelf} máu bản thân`);
  if (c.cleanse) o.push('giải toàn bộ hiệu ứng xấu');
  if (c.immune) o.push(`miễn hiệu ứng xấu ${c.immune} lượt`);
  if (c.regen) o.push(`hồi ${c.regen.pct}% máu đã mất mỗi lượt (${c.regen.t} lượt)`);
  if (c.pet) {
    if (c.pet[3]) {
      o.push(`triệu hồi Shukaku (${c.pet[1]} máu, ${c.pet[2]} dmg cả bàn/lượt, khóa chủ động)`);
    } else {
      o.push(`pet x${c.pet[0]}: ${c.pet[1]} máu, ${c.pet[2]} dmg`);
    }
  }
  if (c.b) {
    const parts = [];
    if (c.b.m) parts.push(`+${Math.round(c.b.m * 100)}% dmg`);
    if (c.b.hy) parts.push(`+${c.b.hy * 100}% hyuga`);
    if (c.b.rf) parts.push(`phản ${c.b.rf} dmg`);
    if (c.b.dr) parts.push(`giảm ${Math.round(c.b.dr * 100)}% dmg nhận`);
    o.push(`buff ${parts.join(', ')}${c.b.t ? `, ${c.b.t} lượt` : ', tới hết giáp'}`);
  }
  if (c.kp) o.push('diệt pet mục tiêu');
  if (c.kpa) o.push('diệt mọi pet');
  if (c.rd) o.push('hủy 1 thẻ địch');
  if (c.rs) o.push('cướp 1 thẻ địch');
  if (c.gv) o.push(`nhận thẻ ${c.gv === 'm' ? 'mangakyo' : 'rinnegan'}`);
  if (c.rv) {
    o.push(c.edo ? 'hồi sinh 1 người chết với máu ∞ (-50% dmg, là thi thể)' : 'hồi sinh 1 người chết với 1000 máu');
  }
  if (c.ds) o.push('thi thể bị tiêu diệt');
  return o.join(', ');
}
