const EL_COLORS = {
  hỏa: ['#ff5a1f', '#ffb347'],
  thủy: ['#1e88e5', '#64d2ff'],
  lôi: ['#d4a700', '#ffe96b'],
  phong: ['#1fa85b', '#7ef2a6'],
};

const CLAN_COLORS = {
  uchiha: ['#b71c1c', '#ff5252'],
  mangakyo: ['#7f0000', '#ff1744'],
  rinnegan: ['#5e35b1', '#b388ff'],
  hyuga: ['#455a64', '#b0bec5'],
  'nghệ thuật rối': ['#6d4c41', '#bcaaa4'],
  'bom nghệ thuật': ['#e65100', '#ffd180'],
  'cá mập và sóng': ['#0277bd', '#4fc3f7'],
  'phong ấn': ['#4a148c', '#ce93d8'],
  'sa mạc và máu': ['#a1887f', '#ffe082'],
  'ảo thuật': ['#880e4f', '#f48fb1'],
  'nhẫn cụ': ['#37474f', '#90a4ae'],
  thường: ['#5d4037', '#d7ccc8'],
  'tia chớp vàng': ['#f59e0b', '#fef08a'],
  'thể thuật': ['#15803d', '#86efac'],
  'hoa anh đào': ['#db2777', '#fbcfe8'],
  'khiển bóng': ['#1f2937', '#9ca3af'],
  'ninja sao chép': ['#0f766e', '#5eead4'],
  'thiên thần giấy': ['#6366f1', '#e0e7ff'],
  'mộc độn': ['#166534', '#86efac'],
  'ma kính băng tinh': ['#0369a1', '#bae6fd'],
  'bộ cóc': ['#c2410c', '#fdba74'],
  'bộ rắn': ['#6b21a8', '#d8b4fe'],
  'cửu vĩ': ['#dc2626', '#fbbf24'],
  'côn trùng': ['#3f6212', '#bef264'],
  'gió và cánh quạt': ['#047857', '#6ee7b7'],
};

// Keep the 11 Sharingan-emblem cards (Izanagi + uploaded Uchiha/Mangekyo set) untouched
const EXCLUDED_SHARINGAN_IDS = new Set([0, 8, 41, 42, 46, 47, 48, 49, 50, 63, 117]);

function getPalette(c) {
  if (c.el && EL_COLORS[c.el]) return EL_COLORS[c.el];
  return CLAN_COLORS[c.s] || CLAN_COLORS.thường;
}

function sharinganOriginalSvg(c2) {
  return `
      <circle cx="50" cy="36" r="22" fill="#900" stroke="${c2}" stroke-width="2"/>
      <circle cx="50" cy="36" r="13" fill="none" stroke="#111" stroke-width="1.5"/>
      <circle cx="50" cy="36" r="4" fill="#111"/>
      <circle cx="50" cy="23" r="3.2" fill="#111"/>
      <circle cx="61" cy="43" r="3.2" fill="#111"/>
      <circle cx="39" cy="43" r="3.2" fill="#111"/>`;
}

// Per-card Naruto anime flat-vector emblems matching the Izanagi graphic style
const CARD_ART_BY_ID = {
  // 1: Rasengan — swirling cyan chakra sphere with concentric spiral arcs
  1: (_c1, _c2) => `
    <circle cx="50" cy="34" r="22" fill="#0369a1" stroke="#7dd3fc" stroke-width="2"/>
    <circle cx="50" cy="34" r="16" fill="#0284c7" stroke="#bae6fd" stroke-width="1.4" stroke-dasharray="14 6"/>
    <path d="M50 15 A19 19 0 0 1 68 38 M32 30 A19 19 0 0 1 56 16 M64 46 A18 18 0 0 1 34 42" fill="none" stroke="#e0f2fe" stroke-width="1.9" stroke-linecap="round"/>
    <path d="M50 22 A12 12 0 0 1 61 36 M39 32 A12 12 0 0 1 52 22" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="50" cy="34" r="7" fill="#e0f2fe" stroke="#fff" stroke-width="1.5"/>
    <circle cx="50" cy="34" r="3" fill="#fff"/>`,

  // 2: Ném Kunai — classic ninja throwing kunai with wrapped handle & pommel ring
  2: (_c1, c2) => `
    <path d="M22 50 L32 42 M26 56 L36 48" stroke="${c2}" stroke-width="1.4" stroke-linecap="round" opacity="0.65"/>
    <g transform="rotate(-35 50 34)">
      <polygon points="50,9 61,28 50,41 39,28" fill="#334155" stroke="${c2}" stroke-width="1.8" stroke-linejoin="round"/>
      <polygon points="50,9 61,28 50,41" fill="#64748b"/>
      <line x1="50" y1="11" x2="50" y2="39" stroke="#111" stroke-width="1.4"/>
      <rect x="47.5" y="40" width="5" height="12" rx="1.5" fill="#e2e8f0" stroke="#111" stroke-width="1.4"/>
      <line x1="47.5" y1="44" x2="52.5" y2="45.5" stroke="#111" stroke-width="1.2"/>
      <line x1="47.5" y1="48" x2="52.5" y2="49.5" stroke="#111" stroke-width="1.2"/>
      <circle cx="50" cy="56" r="4.5" fill="none" stroke="${c2}" stroke-width="2.2"/>
    </g>`,

  // 3: Ném Shuriken — crisp 4-pointed black steel throwing star with spin arcs
  3: (_c1, c2) => `
    <path d="M26 24 A26 26 0 0 1 38 12 M74 44 A26 26 0 0 1 62 56" fill="none" stroke="${c2}" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
    <path d="M50 10 L57 27 L74 34 L57 41 L50 58 L43 41 L26 34 L43 27 Z" fill="#1e293b" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M50 10 L57 27 L50 34 Z M74 34 L57 41 L50 34 Z M50 58 L43 41 L50 34 Z M26 34 L43 27 L50 34 Z" fill="#64748b"/>
    <circle cx="50" cy="34" r="6" fill="#161a24" stroke="#cbd5e1" stroke-width="1.8"/>`,

  // 4: Hỏa Độn — stylized Naruto blazing fire emblem
  4: (c1, c2) => `
    <circle cx="50" cy="36" r="22" fill="#7c1d0d" stroke="${c2}" stroke-width="2"/>
    <path d="M50 14 C60 24, 67 31, 64 43 C62 52, 56 56, 50 56 C44 56, 38 52, 36 43 C33 32, 41 25, 43 21 C44 26, 46 27, 47 26 C46 20, 48 16, 50 14 Z" fill="${c1}" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M50 28 C56 34, 58 41, 55 48 C53 51, 47 51, 45 48 C42 41, 44 34, 50 28 Z" fill="#fde047" stroke="#111" stroke-width="1.2"/>
    <circle cx="33" cy="20" r="2" fill="${c2}"/><circle cx="68" cy="23" r="1.8" fill="#fde047"/>`,

  // 5: Thủy Độn — classic Hokusai/Naruto curling ocean wave crest
  5: (c1, c2) => `
    <circle cx="50" cy="34" r="22" fill="#0c4a6e" stroke="${c2}" stroke-width="2"/>
    <path d="M29 44 C32 24, 48 16, 61 23 C67 26, 67 34, 60 36 C55 37, 52 33, 55 29 C51 28, 45 31, 45 38 C45 45, 55 48, 69 44 C64 52, 57 56, 50 56 C40 56, 32 51, 29 44 Z" fill="${c1}" stroke="#e0f2fe" stroke-width="1.7" stroke-linejoin="round"/>
    <path d="M34 45 Q44 38 55 44 T68 43" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="62" cy="19" r="2" fill="#fff"/><circle cx="35" cy="24" r="1.6" fill="#bae6fd"/>`,

  // 6: Bạch Nhãn — pale lavender Byakugan eye with radial chakra veins
  6: (_c1, c2) => `
    <path d="M22 34 Q50 10 78 34 Q50 58 22 34 Z" fill="#e2e8f0" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M14 25 L23 29 M12 34 L20 34 M14 43 L23 39 M86 25 L77 29 M88 34 L80 34 M86 43 L77 39" stroke="#cbd5e1" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="50" cy="34" r="13.5" fill="#cbd5e1" stroke="#475569" stroke-width="1.7"/>
    <circle cx="50" cy="34" r="7.5" fill="#f1f5f9" stroke="#64748b" stroke-width="1.3"/>
    <circle cx="50" cy="34" r="2.2" fill="#94a3b8"/>
    <path d="M22 34 Q50 13 78 34" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round"/>`,

  // 7: Thuật Triệu Hồi — Kuchiyose blood-seal summoning circle
  7: (_c1, c2) => `
    <circle cx="50" cy="34" r="23" fill="#271c19" stroke="${c2}" stroke-width="2"/>
    <circle cx="50" cy="34" r="17" fill="none" stroke="#ef4444" stroke-width="1.6" stroke-dasharray="5 3"/>
    <polygon points="50,15 66,44 34,44" fill="none" stroke="${c2}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M50 11 L50 16 M50 52 L50 57 M27 34 L32 34 M68 34 L73 34" stroke="#ef4444" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="50" cy="35" r="7" fill="#991b1b" stroke="#fca5a5" stroke-width="1.5"/>
    <path d="M47 36 L47 31 M50 36 L50 29 M53 36 L53 31" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>`,

  // 9: Phi Lôi Thần Thuật — Minato's 3-pronged Flying Raijin kunai + golden flashes
  9: (_c1, c2) => `
    <path d="M16 20 L28 28 L22 32 L32 40 M84 20 L72 28 L78 32 L68 40" fill="none" stroke="#fef08a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M50 8 L56 22 L66 19 L61 33 L53 37 L53 50 L47 50 L47 37 L39 33 L34 19 L44 22 Z" fill="#1e293b" stroke="${c2}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M50 10 L50 35" stroke="#fde047" stroke-width="1.4"/>
    <rect x="46.5" y="38" width="7" height="11" rx="1" fill="#f8fafc" stroke="#111" stroke-width="1.2"/>
    <path d="M48 41 L52 41 M48 44 L52 44 M48 47 L52 47" stroke="#dc2626" stroke-width="1.4"/>
    <circle cx="50" cy="55" r="4.5" fill="none" stroke="#facc15" stroke-width="2.2"/>`,

  // 10: Phong Độn — swirling emerald wind-blade cyclone
  10: (c1, c2) => `
    <circle cx="50" cy="34" r="22" fill="#064e3b" stroke="${c2}" stroke-width="2"/>
    <path d="M29 24 C36 16, 62 16, 68 26 C72 34, 62 42, 48 41 C38 40, 36 32, 44 29 C50 27, 56 30, 54 35" fill="none" stroke="${c2}" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M71 44 C64 52, 38 52, 32 42 C28 34, 38 26, 52 27" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="50" cy="34" r="3.5" fill="#fff" stroke="${c1}" stroke-width="1.2"/>`,

  // 11: Bom C4 Nhện — Deidara's white exploding clay spider
  11: (c1, c2) => `
    <circle cx="50" cy="34" r="22" fill="#7c2d12" stroke="${c2}" stroke-width="2"/>
    <path d="M42 29 L28 20 L23 27 M41 34 L25 33 L22 41 M42 39 L28 46 L25 53 M58 29 L72 20 L77 27 M59 34 L75 33 L78 41 M58 39 L72 46 L75 53" fill="none" stroke="#f8fafc" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <ellipse cx="50" cy="38" rx="9" ry="10" fill="#f8fafc" stroke="#111" stroke-width="1.6"/>
    <circle cx="50" cy="25" r="6" fill="#f8fafc" stroke="#111" stroke-width="1.6"/>
    <circle cx="47.5" cy="24" r="1.4" fill="#111"/><circle cx="52.5" cy="24" r="1.4" fill="#111"/>
    <path d="M46 37 L50 33 L54 37 L50 42 Z" fill="${c1}"/>`,

  // 12: Bom C4 Chim — Deidara's sleek white exploding clay bird
  12: (c1, c2) => `
    <circle cx="50" cy="34" r="22" fill="#7c2d12" stroke="${c2}" stroke-width="2"/>
    <path d="M18 32 C28 20, 40 22, 48 30 L50 18 L53 30 C61 22, 73 20, 82 32 C72 34, 62 37, 54 44 L50 53 L46 44 C38 37, 28 34, 18 32 Z" fill="#f8fafc" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/>
    <circle cx="48.5" cy="24" r="1.2" fill="#111"/><circle cx="51.5" cy="24" r="1.2" fill="#111"/>
    <path d="M36 48 L41 44 M64 48 L59 44 M50 55 L50 59" stroke="${c1}" stroke-width="2" stroke-linecap="round"/>`,

  // 13: Karasu — Kankuro's 3-eyed Crow puppet head & crossed blades
  13: (_c1, c2) => `
    <path d="M22 52 L78 16 M78 52 L22 16" stroke="#94a3b8" stroke-width="2.2" stroke-linecap="round" opacity="0.7"/>
    <path d="M33 24 L37 12 L44 20 L50 10 L56 20 L63 12 L67 24 L65 46 C65 53, 35 53, 35 46 Z" fill="#292524" stroke="${c2}" stroke-width="1.8" stroke-linejoin="round"/>
    <ellipse cx="50" cy="36" rx="13" ry="14" fill="#d6c5b3" stroke="#111" stroke-width="1.5"/>
    <circle cx="44" cy="34" r="2.2" fill="#111"/><circle cx="56" cy="34" r="2.2" fill="#111"/><circle cx="50" cy="28" r="2" fill="#111"/>
    <path d="M40 42 L60 42 M44 39 L44 45 M50 39 L50 45 M56 39 L56 45" stroke="#111" stroke-width="1.4"/>
    <path d="M38 30 L42 32 M62 30 L58 32" stroke="#b91c1c" stroke-width="1.8" stroke-linecap="round"/>`,

  // 14: Kuroari — Kankuro's Black Ant trap puppet with horned head & cage chest
  14: (_c1, c2) => `
    <path d="M36 14 L42 22 L58 22 L64 14 L62 27 L38 27 Z" fill="#1c1917" stroke="${c2}" stroke-width="1.6" stroke-linejoin="round"/>
    <rect x="33" y="25" width="34" height="32" rx="8" fill="#44403c" stroke="${c2}" stroke-width="1.8"/>
    <circle cx="43" cy="32" r="2.6" fill="#facc15" stroke="#111" stroke-width="1.2"/>
    <circle cx="57" cy="32" r="2.6" fill="#facc15" stroke="#111" stroke-width="1.2"/>
    <rect x="39" y="39" width="22" height="14" rx="2" fill="#111" stroke="#b91c1c" stroke-width="1.4"/>
    <path d="M45 39 L45 53 M50 39 L50 53 M55 39 L55 53 M39 46 L61 46" stroke="${c2}" stroke-width="1.4"/>`,

  // 15: Kanshouo — Kankuro's armored Salamander dome shield puppet
  15: (_c1, c2) => `
    <path d="M22 48 C22 24, 34 15, 50 15 C66 15, 78 24, 78 48 L72 54 L28 54 Z" fill="#573d31" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M26 36 Q50 28 74 36 M24 45 Q50 39 76 45" fill="none" stroke="#111" stroke-width="1.8"/>
    <path d="M50 15 L50 54" stroke="#111" stroke-width="1.8"/>
    <circle cx="40" cy="27" r="2.4" fill="#facc15" stroke="#111" stroke-width="1"/>
    <circle cx="60" cy="27" r="2.4" fill="#facc15" stroke="#111" stroke-width="1"/>
    <path d="M38 54 L50 48 L62 54" fill="none" stroke="${c2}" stroke-width="1.8"/>`,

  // 16: Hiruko — Sasori's armored puppet shell with curved iron scorpion tail
  16: (_c1, c2) => `
    <path d="M26 52 C26 34, 38 28, 52 32 C64 36, 70 44, 70 52 Z" fill="#44403c" stroke="${c2}" stroke-width="1.8"/>
    <path d="M62 44 C76 40, 80 20, 66 13 C56 9, 46 14, 44 21" fill="none" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"/>
    <path d="M62 44 C76 40, 80 20, 66 13 C56 9, 46 14, 44 21" fill="none" stroke="#111" stroke-width="1.4" stroke-dasharray="3 3"/>
    <polygon points="44,21 36,16 42,26" fill="#ef4444" stroke="#111" stroke-width="1.2"/>
    <circle cx="38" cy="40" r="3" fill="#991b1b" stroke="#fca5a5" stroke-width="1.2"/>
    <path d="M29 48 L67 48" stroke="#111" stroke-width="1.6"/>`,

  // 17: Rối Kage Đệ Tam — Third Kazekage puppet & Iron Sand (Satetsu) pyramid
  17: (_c1, c2) => `
    <polygon points="50,10 74,52 26,52" fill="#1e293b" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <polygon points="50,10 74,52 50,44" fill="#334155"/>
    <line x1="50" y1="10" x2="50" y2="52" stroke="#111" stroke-width="1.6"/>
    <polygon points="22,26 30,22 27,32" fill="#334155" stroke="${c2}" stroke-width="1.2"/>
    <polygon points="78,26 70,22 73,32" fill="#334155" stroke="${c2}" stroke-width="1.2"/>
    <circle cx="44" cy="36" r="2.2" fill="#facc15"/><circle cx="56" cy="36" r="2.2" fill="#facc15"/>
    <path d="M36 55 Q50 50 64 55" fill="none" stroke="#94a3b8" stroke-width="1.8" stroke-linecap="round"/>`,

  // 18: Thập Rối Chikamatsu — Chiyo's white-robed puppets on blue chakra threads
  18: (_c1, c2) => `
    <path d="M30 8 L30 28 M50 6 L50 22 M70 8 L70 28 M40 8 L45 24 M60 8 L55 24" stroke="#38bdf8" stroke-width="1.3" opacity="0.85"/>
    <path d="M22 55 L26 34 L34 34 L38 55 Z M62 55 L66 34 L74 34 L78 55 Z" fill="#cbd5e1" stroke="#111" stroke-width="1.4"/>
    <circle cx="30" cy="29" r="5" fill="#f8fafc" stroke="#111" stroke-width="1.4"/>
    <circle cx="70" cy="29" r="5" fill="#f8fafc" stroke="#111" stroke-width="1.4"/>
    <path d="M39 58 L44 31 L56 31 L61 58 Z" fill="#f8fafc" stroke="${c2}" stroke-width="1.8"/>
    <circle cx="50" cy="24" r="7" fill="#fff" stroke="#111" stroke-width="1.6"/>
    <circle cx="47.5" cy="24" r="1.4" fill="#111"/><circle cx="52.5" cy="24" r="1.4" fill="#111"/>`,

  // 19: Bách Rối Thuật — Sasori's crimson-cloaked 100 puppet army & red core
  19: (_c1, c2) => `
    <path d="M50 36 L22 14 M50 36 L36 12 M50 36 L64 12 M50 36 L78 14 M50 36 L20 48 M50 36 L80 48" stroke="#ef4444" stroke-width="1.3" opacity="0.8"/>
    <path d="M18 54 L23 36 L31 36 L35 54 Z M65 54 L69 36 L77 36 L82 54 Z" fill="#7f1d1d" stroke="#111" stroke-width="1.3"/>
    <circle cx="27" cy="31" r="4.5" fill="#991b1b" stroke="#fca5a5" stroke-width="1.2"/>
    <circle cx="73" cy="31" r="4.5" fill="#991b1b" stroke="#fca5a5" stroke-width="1.2"/>
    <path d="M37 58 L43 29 L57 29 L63 58 Z" fill="#b91c1c" stroke="${c2}" stroke-width="1.8"/>
    <circle cx="50" cy="22" r="7" fill="#991b1b" stroke="#fca5a5" stroke-width="1.6"/>
    <circle cx="47.5" cy="22" r="1.5" fill="#fde047"/><circle cx="52.5" cy="22" r="1.5" fill="#fde047"/>
    <circle cx="50" cy="40" r="4" fill="#ef4444" stroke="#fff" stroke-width="1.3"/>`,

  // 20: Thủy Lao Thuật — Water Prison translucent blue sphere trapping silhouette
  20: (c1, c2) => `
    <circle cx="50" cy="34" r="22" fill="${c1}88" stroke="${c2}" stroke-width="2.2"/>
    <circle cx="50" cy="25" r="5" fill="#0f172a" stroke="#7dd3fc" stroke-width="1.1"/>
    <path d="M42 46 C42 35, 45 31, 50 31 C55 31, 58 35, 58 46 Z" fill="#0f172a"/>
    <path d="M34 25 A18 18 0 0 1 48 16" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>
    <path d="M64 43 A18 18 0 0 1 52 52" fill="none" stroke="#bae6fd" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="38" cy="43" r="2" fill="#e0f2fe"/><circle cx="62" cy="25" r="1.8" fill="#e0f2fe"/>`,

  // 21: Ngũ Thực Giảo — Five Feeding Sharks circling pack
  21: (c1, c2) => `
    <circle cx="50" cy="34" r="22" fill="#0c4a6e" stroke="${c2}" stroke-width="2"/>
    <path d="M32 24 C42 18, 56 19, 64 25 L57 28 L61 32 C50 30, 41 29, 32 24 Z" fill="${c2}" stroke="#111" stroke-width="1.2"/>
    <path d="M68 42 C58 49, 44 49, 35 43 L43 40 L39 36 C50 38, 59 39, 68 42 Z" fill="${c2}" stroke="#111" stroke-width="1.2"/>
    <path d="M34 34 L46 28 L58 34 L46 40 Z" fill="${c1}" stroke="#fff" stroke-width="1.4"/>
    <path d="M47 28 L51 22 L53 29" fill="#e0f2fe" stroke="#111" stroke-width="1"/>
    <circle cx="54" cy="33" r="1.4" fill="#fff"/>`,

  // 22: Thiên Thực Giảo — Thousand Feeding Sharks tidal tsunami jaw
  22: (c1, c2) => `
    <path d="M12 52 C20 26, 36 14, 52 16 C68 18, 78 26, 88 34 C76 42, 68 50, 88 56 L12 56 Z" fill="${c1}" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M52 24 L76 34 L52 44 L58 34 Z" fill="#0f172a" stroke="#e0f2fe" stroke-width="1.4"/>
    <path d="M56 28 L60 32 L64 29 L68 33 M56 40 L60 36 L64 39 L68 35" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M22 36 L34 32 L28 40 Z M28 47 L42 44 L36 51 Z M34 24 L46 21 L40 28 Z" fill="#bae6fd" stroke="#0c4a6e" stroke-width="1"/>
    <circle cx="56" cy="23" r="2" fill="#fff"/>`,

  // 23: Thủy Đạn Thuật — high-pressure leaping water shark torpedo blast
  23: (c1, c2) => `
    <ellipse cx="32" cy="34" rx="5" ry="15" fill="none" stroke="${c2}" stroke-width="1.6"/>
    <ellipse cx="42" cy="34" rx="5" ry="18" fill="none" stroke="#bae6fd" stroke-width="1.6"/>
    <path d="M20 34 C34 22, 58 20, 82 34 C58 48, 34 46, 20 34 Z" fill="${c1}" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M48 23 L58 14 L59 24 M48 45 L56 52 L58 44" fill="${c2}" stroke="#111" stroke-width="1.2"/>
    <path d="M30 34 L72 34" stroke="#e0f2fe" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="69" cy="31" r="2" fill="#fff"/>`,

  // 24: Thủy Phân Thân — translucent water ninja clone rising from ripples
  24: (_c1, _c2) => `
    <ellipse cx="50" cy="54" rx="26" ry="6" fill="#0284c7" stroke="#7dd3fc" stroke-width="1.6"/>
    <ellipse cx="50" cy="54" rx="15" ry="3" fill="none" stroke="#e0f2fe" stroke-width="1.2"/>
    <circle cx="50" cy="21" r="7.5" fill="#38bdf8" stroke="#e0f2fe" stroke-width="1.8"/>
    <path d="M36 52 C36 36, 41 30, 50 30 C59 30, 64 36, 64 52 Z" fill="#0ea5e9" stroke="#e0f2fe" stroke-width="1.8"/>
    <path d="M44 20 L56 20" stroke="#0c4a6e" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="32" cy="28" r="2.2" fill="#7dd3fc"/><circle cx="69" cy="24" r="2" fill="#bae6fd"/>`,

  // 25: Odama Rasengan — colossal giant Rasengan sphere with intense energy rings
  25: (_c1, c2) => `
    <circle cx="50" cy="34" r="26" fill="#0369a1" stroke="${c2}" stroke-width="2.2"/>
    <circle cx="50" cy="34" r="21" fill="#0284c7" stroke="#7dd3fc" stroke-width="1.6" stroke-dasharray="16 5"/>
    <path d="M50 10 A24 24 0 0 1 73 40 M27 28 A24 24 0 0 1 58 11 M69 49 A23 23 0 0 1 30 45" fill="none" stroke="#e0f2fe" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="50" cy="34" r="13" fill="#38bdf8" stroke="#fff" stroke-width="1.8"/>
    <circle cx="50" cy="34" r="6.5" fill="#fff"/>`,

  // 26: Đa Phân Thân Thuật — Multi Shadow Clone silhouettes bursting from smoke puffs
  26: (_c1, c2) => `
    <g opacity="0.6">
      <circle cx="28" cy="25" r="5.5" fill="#f97316" stroke="#111" stroke-width="1.2"/>
      <path d="M19 46 C19 35, 23 32, 28 32 C33 32, 37 35, 37 46 Z" fill="#f97316" stroke="#111" stroke-width="1.2"/>
      <circle cx="72" cy="25" r="5.5" fill="#f97316" stroke="#111" stroke-width="1.2"/>
      <path d="M63 46 C63 35, 67 32, 72 32 C77 32, 81 35, 81 46 Z" fill="#f97316" stroke="#111" stroke-width="1.2"/>
    </g>
    <circle cx="50" cy="21" r="7" fill="#fb923c" stroke="#fff" stroke-width="1.8"/>
    <path d="M38 48 C38 35, 43 30, 50 30 C57 30, 62 35, 62 48 Z" fill="#ea580c" stroke="#fff" stroke-width="1.8"/>
    <path d="M43 20 L57 20" stroke="#1e293b" stroke-width="2.2"/>
    <circle cx="30" cy="50" r="6" fill="#f8fafc" stroke="${c2}" stroke-width="1.3"/>
    <circle cx="42" cy="53" r="7" fill="#f8fafc" stroke="${c2}" stroke-width="1.3"/>
    <circle cx="58" cy="53" r="7" fill="#f8fafc" stroke="${c2}" stroke-width="1.3"/>
    <circle cx="70" cy="50" r="6" fill="#f8fafc" stroke="${c2}" stroke-width="1.3"/>`,

  // 27: Hỏa Long Viêm Đạn — roaring flame dragon head breathing fire
  27: (c1, c2) => `
    <path d="M16 44 C24 24, 38 14, 56 16 L66 10 L62 20 L74 22 L64 29 L78 36 L60 39 L70 48 L52 46 C42 54, 26 54, 16 44 Z" fill="${c1}" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M26 42 C34 29, 46 24, 58 27 L52 34 L64 36 C52 43, 38 46, 26 42 Z" fill="#fde047" stroke="#111" stroke-width="1.2"/>
    <polygon points="52,23 58,25 53,27" fill="#fff" stroke="#111" stroke-width="1"/>
    <path d="M74 34 L86 30 M76 38 L88 40 M72 42 L84 48" stroke="#fde047" stroke-width="2" stroke-linecap="round"/>`,

  // 28: Chidori — crackling blue-white lightning orb with jagged radiating bolts
  28: (_c1, c2) => `
    <path d="M50 34 L22 14 L32 26 M50 34 L78 14 L68 26 M50 34 L16 36 L30 39 M50 34 L84 36 L70 39 M50 34 L26 56 L38 46 M50 34 L74 56 L62 46" fill="none" stroke="#7dd3fc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="50" cy="34" r="15" fill="#0284c7" stroke="${c2}" stroke-width="2"/>
    <polygon points="50,15 55,27 68,26 57,35 65,47 52,41 44,52 45,39 32,37 44,30 39,19 48,26" fill="#e0f2fe" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"/>
    <circle cx="50" cy="34" r="5" fill="#fff"/>`,

  // 29: Thi Quỷ Phong Tận — Shinigami horned demon face gripping dagger in teeth
  29: (_c1, c2) => `
    <circle cx="50" cy="34" r="23" fill="#3b0764" stroke="${c2}" stroke-width="2"/>
    <path d="M36 18 L31 8 L42 15 M64 18 L69 8 L58 15" fill="#f8fafc" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M34 24 C34 15, 66 15, 66 24 L64 43 C64 51, 36 51, 36 43 Z" fill="#f1f5f9" stroke="#111" stroke-width="1.6"/>
    <polygon points="39,28 47,31 40,34" fill="#dc2626" stroke="#111" stroke-width="1"/>
    <polygon points="61,28 53,31 60,34" fill="#dc2626" stroke="#111" stroke-width="1"/>
    <path d="M26 42 L74 42 L78 44 L74 46 L26 46 Z" fill="#94a3b8" stroke="#111" stroke-width="1.4"/>
    <path d="M42 40 L44 45 M50 40 L50 46 M58 40 L56 45" stroke="#111" stroke-width="1.6"/>`,

  // 30: Cổng Thần Đạo — Hashirama's falling crimson Torii Gate (Myōjinmon)
  30: (_c1, c2) => `
    <ellipse cx="50" cy="54" rx="28" ry="6" fill="none" stroke="${c2}" stroke-width="1.6" stroke-dasharray="6 3"/>
    <path d="M20 17 Q50 22 80 17 L77 24 Q50 27 23 24 Z" fill="#dc2626" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M22 15 Q50 19 78 15" fill="none" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="27" y="29" width="46" height="5" rx="1" fill="#b91c1c" stroke="#111" stroke-width="1.4"/>
    <rect x="33" y="24" width="6" height="32" fill="#dc2626" stroke="#111" stroke-width="1.5"/>
    <rect x="61" y="24" width="6" height="32" fill="#dc2626" stroke="#111" stroke-width="1.5"/>
    <rect x="47" y="24" width="6" height="9" fill="#111" stroke="${c2}" stroke-width="1.1"/>`,

  // 31: Kim Sa Ấn — golden sealing talisman emblem with binding chains
  31: (_c1, c2) => `
    <path d="M16 18 L84 50 M84 18 L16 50" stroke="#f59e0b" stroke-width="2.6" stroke-dasharray="5 3" stroke-linecap="round"/>
    <circle cx="50" cy="34" r="20" fill="#78350f" stroke="#fde047" stroke-width="2.2"/>
    <rect x="40" y="18" width="20" height="32" rx="3" fill="#fef3c7" stroke="#111" stroke-width="1.6"/>
    <path d="M44 25 L56 25 M50 22 L50 44 M44 33 L56 33 M45 41 L55 41" stroke="#b91c1c" stroke-width="2" stroke-linecap="round"/>
    <circle cx="50" cy="34" r="23" fill="none" stroke="${c2}" stroke-width="1.3" stroke-dasharray="3 4"/>`,

  // 32: Ngũ Trùng La Sinh Môn — towering demonic iron Rashōmon fortress gate
  32: (_c1, c2) => `
    <path d="M22 57 L22 24 Q50 8 78 24 L78 57 Z" fill="#334155" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M28 57 L28 28 Q50 15 72 28 L72 57 Z" fill="#475569" stroke="#111" stroke-width="1.6"/>
    <polygon points="36,28 46,32 39,35" fill="#ef4444" stroke="#111" stroke-width="1.1"/>
    <polygon points="64,28 54,32 61,35" fill="#ef4444" stroke="#111" stroke-width="1.1"/>
    <path d="M38 42 Q50 38 62 42 L59 48 Q50 51 41 48 Z" fill="#111"/>
    <path d="M42 42 L44 46 M50 41 L50 46 M58 42 L56 46" stroke="#f8fafc" stroke-width="1.5"/>
    <circle cx="50" cy="50" r="5" fill="none" stroke="#f59e0b" stroke-width="2.2"/>`,

  // 33: Thuẫn Cát — Gaara's curved swirling Shield of Sand
  33: (_c1, c2) => `
    <path d="M24 52 C20 30, 32 14, 50 14 C68 14, 80 30, 76 52 C66 44, 34 44, 24 52 Z" fill="#b45309" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M29 44 C30 28, 39 20, 50 20 C61 20, 70 28, 71 44" fill="none" stroke="#fde68a" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M35 38 Q50 30 65 38 M32 46 Q50 39 68 46" fill="none" stroke="#fef3c7" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="50" cy="34" r="5" fill="#78350f" stroke="#fde68a" stroke-width="1.5"/>`,

  // 34: Hồi Thiên — Hyuga Kaiten spinning pale-cyan chakra dome
  34: (_c1, c2) => `
    <circle cx="50" cy="34" r="23" fill="#0c4a6e" stroke="${c2}" stroke-width="2"/>
    <path d="M28 34 A22 22 0 0 1 72 34" fill="#38bdf8" fill-opacity="0.35"/>
    <path d="M32 24 C42 15, 62 17, 68 29 M68 44 C58 53, 38 51, 32 39" fill="none" stroke="#e0f2fe" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M37 30 C44 23, 57 24, 62 32 M63 38 C56 45, 43 44, 38 36" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="50" cy="34" r="5" fill="#fff" stroke="#0284c7" stroke-width="1.5"/>`,

  // 35: Nhu Quyền — Hyuga Gentle Fist open palm emitting tenketsu chakra ripple
  35: (_c1, c2) => `
    <circle cx="50" cy="34" r="22" fill="#1e293b" stroke="${c2}" stroke-width="2"/>
    <circle cx="50" cy="34" r="14" fill="none" stroke="#7dd3fc" stroke-width="1.4" stroke-dasharray="4 3"/>
    <path d="M42 50 L42 32 C42 29, 45 29, 45 32 L45 22 C45 19, 48 19, 48 22 L48 20 C48 17, 52 17, 52 20 L52 22 C52 19, 55 19, 55 22 L55 32 C55 29, 58 29, 58 32 L58 46 C58 51, 42 53, 42 50 Z" fill="#e2e8f0" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/>
    <circle cx="50" cy="37" r="4" fill="#38bdf8" stroke="#fff" stroke-width="1.3"/>`,

  // 36: Lục Thập Tứ Chưởng — Hyuga Eight Trigrams (Bagua) octagon mandala
  36: (_c1, c2) => `
    <polygon points="50,10 67,17 74,34 67,51 50,58 33,51 26,34 33,17" fill="#1e293b" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="50" cy="34" r="15" fill="none" stroke="#7dd3fc" stroke-width="1.5"/>
    <circle cx="50" cy="34" r="8" fill="#e0f2fe" stroke="#111" stroke-width="1.4"/>
    <path d="M50 26 A4 4 0 0 1 50 34 A4 4 0 0 0 50 42 A8 8 0 0 1 50 26 Z" fill="#1e293b"/>
    <circle cx="50" cy="30" r="1.4" fill="#1e293b"/><circle cx="50" cy="38" r="1.4" fill="#e0f2fe"/>
    <path d="M46 14 L54 14 M46 54 L54 54 M30 30 L30 38 M70 30 L70 38 M35 20 L40 16 M60 16 L65 20 M35 48 L40 52 M60 52 L65 48" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>`,

  // 37: Bát Quái Không Chưởng — Eight Trigrams Vacuum Palm compressed air shockwave
  37: (_c1, c2) => `
    <path d="M18 34 L34 26 L34 42 Z" fill="#e2e8f0" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/>
    <ellipse cx="44" cy="34" rx="5" ry="11" fill="none" stroke="#e0f2fe" stroke-width="2"/>
    <ellipse cx="57" cy="34" rx="6" ry="17" fill="none" stroke="#7dd3fc" stroke-width="2"/>
    <ellipse cx="72" cy="34" rx="7" ry="23" fill="none" stroke="${c2}" stroke-width="2"/>
    <path d="M35 34 L78 34 M37 28 L72 20 M37 40 L72 48" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity="0.85"/>`,

  // 38: Nhu Bộ Song Sư Kích — Hinata's Gentle Step Twin Lion Fists
  38: (_c1, c2) => `
    <path d="M18 34 C18 20, 30 15, 42 22 L47 34 L42 46 C30 53, 18 48, 18 34 Z" fill="#4f46e5" stroke="${c2}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M82 34 C82 20, 70 15, 58 22 L53 34 L58 46 C70 53, 82 48, 82 34 Z" fill="#4f46e5" stroke="${c2}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M25 25 L36 28 L33 34 L36 40 L25 43 M75 25 L64 28 L67 34 L64 40 L75 43" fill="none" stroke="#a5f3fc" stroke-width="1.6" stroke-linecap="round"/>
    <polygon points="34,29 41,31 36,34" fill="#fff"/>
    <polygon points="66,29 59,31 64,34" fill="#fff"/>
    <circle cx="50" cy="34" r="4" fill="#e0f2fe"/>`,

  // 39: Bách Nhị Thập Tứ Chưởng — blazing upgraded 128 Palms Bagua mandala
  39: (_c1, c2) => `
    <circle cx="50" cy="34" r="24" fill="#1e1b4b" stroke="${c2}" stroke-width="2"/>
    <polygon points="50,11 66,18 73,34 66,50 50,57 34,50 27,34 34,18" fill="none" stroke="#38bdf8" stroke-width="1.8"/>
    <path d="M50 10 L50 58 M26 34 L74 34 M33 17 L67 51 M67 17 L33 51" stroke="#7dd3fc" stroke-width="1.3" opacity="0.8"/>
    <circle cx="50" cy="34" r="11" fill="#0284c7" stroke="#fff" stroke-width="1.8"/>
    <circle cx="50" cy="34" r="5" fill="#fff"/>`,

  // 40: Susanoo — armored spectral samurai Susanoo tengu helmet & chakra ribcage
  40: (c1, c2) => `
    <path d="M22 57 C22 36, 30 16, 50 11 C70 16, 78 36, 78 57 Z" fill="${c1}" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M30 22 L42 12 L50 20 L58 12 L70 22 L64 44 L50 54 L36 44 Z" fill="#450a0a" stroke="${c2}" stroke-width="1.8" stroke-linejoin="round"/>
    <polygon points="37,30 47,33 39,37" fill="#fef08a" stroke="#111" stroke-width="1"/>
    <polygon points="63,30 53,33 61,37" fill="#fef08a" stroke="#111" stroke-width="1"/>
    <path d="M46 34 L50 42 L54 34" fill="none" stroke="${c2}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M27 46 L35 44 M26 52 L36 50 M73 46 L65 44 M74 52 L64 50" stroke="#fca5a5" stroke-width="2" stroke-linecap="round"/>`,

  // 43: Chiếu Bản Chi Thuật — crimson genjutsu mirror reflection & shattered illusion
  43: (c1, c2) => `
    <polygon points="50,10 74,34 50,58 26,34" fill="${c1}" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M50 10 L50 58 M38 22 L62 46" stroke="#111" stroke-width="1.6"/>
    <path d="M32 34 Q50 20 68 34 Q50 48 32 34 Z" fill="#161a24" stroke="#f472b6" stroke-width="1.7"/>
    <circle cx="50" cy="34" r="6.5" fill="#be123c" stroke="#fff" stroke-width="1.4"/>
    <circle cx="50" cy="34" r="2.5" fill="#111"/>`,

  // 44: Hống Trương Cấm Thính — hypnotic crimson soundwave genjutsu rings
  44: (c1, c2) => `
    <path d="M30 18 A22 22 0 0 0 30 50 M70 18 A22 22 0 0 1 70 50" fill="none" stroke="${c2}" stroke-width="2" stroke-linecap="round"/>
    <path d="M37 23 A15 15 0 0 0 37 45 M63 23 A15 15 0 0 1 63 45" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="50" cy="34" r="10" fill="${c1}" stroke="${c2}" stroke-width="2"/>
    <path d="M44 34 Q47 26 50 34 T56 34" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`,

  // 45: Bẫy Ảo Thuật — swirling crimson illusion spiral snare & crow feathers
  45: (c1, c2) => `
    <circle cx="50" cy="34" r="22" fill="${c1}" stroke="${c2}" stroke-width="2"/>
    <path d="M50 16 A18 18 0 1 1 33 40 A13 13 0 1 1 56 44 A8 8 0 1 1 46 31" fill="none" stroke="#111" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M18 19 C24 15, 30 17, 33 22 C27 23, 22 22, 18 19 Z M82 49 C76 53, 70 51, 67 46 C73 45, 78 46, 82 49 Z" fill="#111" stroke="${c2}" stroke-width="1.3"/>
    <circle cx="50" cy="34" r="3.5" fill="#fff"/>`,

  // 51: Rinnengan — iconic pale-purple Rinnegan eye in Izanagi clean emblem style
  51: (_c1, c2) => `
    <circle cx="50" cy="34" r="22" fill="#8b5cf6" stroke="${c2}" stroke-width="2"/>
    <circle cx="50" cy="34" r="17" fill="#a78bfa" stroke="#111" stroke-width="1.5"/>
    <circle cx="50" cy="34" r="12" fill="#c4b5fd" stroke="#111" stroke-width="1.5"/>
    <circle cx="50" cy="34" r="7" fill="#ddd6fe" stroke="#111" stroke-width="1.5"/>
    <circle cx="50" cy="34" r="3" fill="#111"/>`,

  // 52: Thiên Đạo Đẩy — Shinra Tensei explosive outward gravity shockwave
  52: (c1, c2) => `
    <circle cx="50" cy="34" r="23" fill="none" stroke="${c2}" stroke-width="2" stroke-dasharray="10 5"/>
    <circle cx="50" cy="34" r="15" fill="${c1}88" stroke="#fff" stroke-width="1.8"/>
    <path d="M50 12 L46 18 M50 12 L54 18 M50 56 L46 50 M50 56 L54 50 M26 34 L32 30 M26 34 L32 38 M74 34 L68 30 M74 34 L68 38" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    <circle cx="50" cy="34" r="6" fill="#fff" stroke="#111" stroke-width="1.4"/>`,

  // 53: Thiên Đạo Hút — Banshō Ten'in inward gravitational pull vortex
  53: (c1, c2) => `
    <circle cx="50" cy="34" r="22" fill="#2e1065" stroke="${c2}" stroke-width="2"/>
    <path d="M24 18 L39 28 M76 18 L61 28 M24 50 L39 40 M76 50 L61 40" stroke="${c2}" stroke-width="2" stroke-linecap="round"/>
    <polygon points="41,29 35,28 38,24" fill="#fff"/>
    <polygon points="59,29 65,28 62,24" fill="#fff"/>
    <polygon points="41,39 35,40 38,44" fill="#fff"/>
    <polygon points="59,39 65,40 62,44" fill="#fff"/>
    <circle cx="50" cy="34" r="9" fill="#111" stroke="${c1}" stroke-width="2"/>
    <circle cx="50" cy="34" r="4" fill="${c2}"/>`,

  // 54: Atula Đạo Tên Lửa — Asura Path mechanical missile barrage
  54: (_c1, c2) => `
    <g transform="rotate(-25 50 34)">
      <path d="M28 24 L52 24 L60 28 L52 32 L28 32 Z" fill="#475569" stroke="${c2}" stroke-width="1.5" stroke-linejoin="round"/>
      <polygon points="28,24 22,21 25,28 22,35 28,32" fill="#f97316"/>
      <path d="M36 36 L68 36 L78 40 L68 44 L36 44 Z" fill="#64748b" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>
      <polygon points="36,36 27,32 31,40 27,48 36,44" fill="#fb923c"/>
      <path d="M24 47 L48 47 L56 51 L48 55 L24 55 Z" fill="#475569" stroke="${c2}" stroke-width="1.5" stroke-linejoin="round"/>
      <polygon points="24,47 18,44 21,51 18,58 24,55" fill="#f97316"/>
    </g>`,

  // 55: Atula Đạo Lưỡi Cưa — Asura Path serrated mechanical buzzsaw blade
  55: (_c1, c2) => `
    <polygon points="50,10 56,18 66,14 66,24 76,26 70,34 76,42 66,44 66,54 56,50 50,58 44,50 34,54 34,44 24,42 30,34 24,26 34,24 34,14 44,18" fill="#475569" stroke="${c2}" stroke-width="1.8" stroke-linejoin="round"/>
    <circle cx="50" cy="34" r="11" fill="#1e293b" stroke="#e2e8f0" stroke-width="1.6"/>
    <circle cx="50" cy="34" r="4.5" fill="${c2}" stroke="#111" stroke-width="1.3"/>`,

  // 56: Súc Sinh Đạo — Animal Path multi-headed Cerberus beast + Rinnegan eye
  56: (c1, c2) => `
    <circle cx="50" cy="34" r="23" fill="#2e1065" stroke="${c2}" stroke-width="1.8" stroke-dasharray="6 3"/>
    <path d="M26 42 L22 26 L33 32 L38 22 L43 32 L50 14 L57 32 L62 22 L67 32 L78 26 L74 42 L64 51 L36 51 Z" fill="${c1}" stroke="${c2}" stroke-width="1.7" stroke-linejoin="round"/>
    <circle cx="50" cy="35" r="7" fill="#c4b5fd" stroke="#111" stroke-width="1.4"/>
    <circle cx="50" cy="35" r="3.5" fill="none" stroke="#111" stroke-width="1.1"/>
    <circle cx="50" cy="35" r="1.4" fill="#111"/>
    <circle cx="34" cy="39" r="2.2" fill="#e9d5ff"/><circle cx="66" cy="39" r="2.2" fill="#e9d5ff"/>`,

  // 57: Ngạ Quỷ Đạo — Preta Path chakra-absorbing energy dome
  57: (c1, c2) => `
    <circle cx="50" cy="34" r="21" fill="${c1}66" stroke="${c2}" stroke-width="2.2"/>
    <path d="M16 20 Q32 22 42 30 M84 20 Q68 22 58 30 M16 48 Q32 46 42 38 M84 48 Q68 46 58 38" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
    <circle cx="50" cy="34" r="12" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="5 3"/>
    <circle cx="50" cy="34" r="5" fill="#e9d5ff" stroke="#111" stroke-width="1.3"/>`,

  // 58: Nhân Gian Đạo — Human Path soul-extraction spirit dragon & hand
  58: (_c1, c2) => `
    <path d="M36 56 C36 46, 64 46, 64 56 Z" fill="#1e1b4b" stroke="${c2}" stroke-width="1.5"/>
    <path d="M50 48 C40 42, 42 28, 50 18 C58 28, 60 42, 50 48 Z" fill="#38bdf8" fill-opacity="0.7" stroke="#e0f2fe" stroke-width="1.8"/>
    <circle cx="50" cy="24" r="6" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1.5"/>
    <path d="M38 14 L46 21 M50 10 L50 18 M62 14 L54 21" stroke="${c2}" stroke-width="2" stroke-linecap="round"/>`,

  // 59: Địa Ngục Đạo — Naraka Path King of Hell crowned head & violet flames
  59: (c1, c2) => `
    <path d="M26 54 C20 38, 26 20, 38 14 L44 20 L50 9 L56 20 L62 14 C74 20, 80 38, 74 54 Z" fill="${c1}" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M34 26 L66 26 L63 49 L50 55 L37 49 Z" fill="#2e1065" stroke="#e9d5ff" stroke-width="1.5" stroke-linejoin="round"/>
    <circle cx="43" cy="34" r="3.5" fill="#c4b5fd" stroke="#111" stroke-width="1.2"/>
    <circle cx="57" cy="34" r="3.5" fill="#c4b5fd" stroke="#111" stroke-width="1.2"/>
    <path d="M41 44 Q50 49 59 44" fill="#111" stroke="#f472b6" stroke-width="1.8" stroke-linecap="round"/>`,

  // 60: Địa Bộc Thiên Tinh — Chibaku Tensei planetary gravity sphere & rising rocks
  60: (c1, c2) => `
    <circle cx="50" cy="28" r="18" fill="#57534e" stroke="${c2}" stroke-width="2"/>
    <path d="M36 22 L46 26 L42 35 M56 16 L54 27 L64 31 M44 38 L56 39" fill="none" stroke="#1c1917" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="50" cy="28" r="6" fill="#111" stroke="${c1}" stroke-width="1.8"/>
    <polygon points="28,57 35,51 39,58" fill="#78716c" stroke="#111" stroke-width="1.2"/>
    <polygon points="46,59 51,50 56,59" fill="#78716c" stroke="#111" stroke-width="1.2"/>
    <polygon points="64,57 69,51 74,58" fill="#78716c" stroke="#111" stroke-width="1.2"/>
    <path d="M35 50 L41 42 M50 49 L50 44 M66 50 L60 42" stroke="${c2}" stroke-width="1.5" stroke-linecap="round"/>`,

  // 61: Tengai Shinsei — Madara's colossal descending twin flaming meteors
  61: (_c1, c2) => `
    <circle cx="66" cy="20" r="11" fill="#44403c" stroke="#f97316" stroke-width="1.6" opacity="0.8"/>
    <path d="M22 14 L42 28 M36 8 L52 22 M60 8 L72 18" stroke="#fb923c" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M32 24 C42 18, 58 20, 64 32 C68 42, 60 54, 48 55 C34 56, 24 46, 26 34 Z" fill="#57534e" stroke="#fde047" stroke-width="2" stroke-linejoin="round"/>
    <path d="M34 32 L44 36 L40 46 M54 28 L50 40 L59 44" fill="none" stroke="#111" stroke-width="1.6"/>
    <path d="M22 48 Q46 62 72 48" fill="none" stroke="${c2}" stroke-width="2" stroke-linecap="round"/>`,

  // 62: Ngoại Đạo Ma Tượng — Gedō Mazō horned nine-eyed wooden demonic statue
  62: (c1, c2) => `
    <path d="M28 57 L32 34 L20 26 L30 22 L38 14 L50 20 L62 14 L70 22 L80 26 L68 34 L72 57 Z" fill="#573d31" stroke="${c2}" stroke-width="1.9" stroke-linejoin="round"/>
    <rect x="37" y="25" width="26" height="8" rx="3" fill="#e2e8f0" stroke="#111" stroke-width="1.4"/>
    <circle cx="43" cy="29" r="1.6" fill="#111"/><circle cx="50" cy="29" r="1.8" fill="#dc2626"/><circle cx="57" cy="29" r="1.6" fill="#111"/>
    <path d="M40 40 L60 40 L56 48 L44 48 Z" fill="#111" stroke="${c1}" stroke-width="1.3"/>
    <path d="M22 48 Q50 56 78 48" fill="none" stroke="${c2}" stroke-width="1.8" stroke-linecap="round"/>`,

  // 64: Bát Môn Độn Giáp Tử Môn — Might Guy's 8th Gate blood-red vapor aura & heart core
  64: (_c1, _c2) => `
    <path d="M24 56 C18 38, 28 18, 42 12 C40 20, 46 20, 50 9 C54 20, 60 20, 58 12 C72 18, 82 38, 76 56 Z" fill="#991b1b" stroke="#f87171" stroke-width="2" stroke-linejoin="round"/>
    <path d="M33 56 C30 40, 38 26, 50 20 C62 26, 70 40, 67 56 Z" fill="#dc2626" stroke="#fca5a5" stroke-width="1.5"/>
    <circle cx="50" cy="39" r="8" fill="#111" stroke="#fde047" stroke-width="2"/>
    <circle cx="50" cy="39" r="3.5" fill="#fef08a"/>`,

  // 65: Lưu Sa Tế Bão — massive curling desert sandstorm tsunami
  65: (_c1, c2) => `
    <path d="M14 54 C18 28, 36 14, 58 16 C72 18, 78 28, 68 35 C60 40, 52 34, 57 27 C49 25, 40 31, 42 40 C44 48, 64 50, 84 44 L84 56 L14 56 Z" fill="#b45309" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M22 46 Q46 34 74 44 M20 52 Q50 45 80 51" fill="none" stroke="#fde68a" stroke-width="1.7" stroke-linecap="round"/>
    <circle cx="74" cy="20" r="2" fill="#fde68a"/><circle cx="28" cy="22" r="1.8" fill="#fde68a"/>`,

  // 66: Sa Mạc Tằng Đại Táng — Gaara's Grand Sand Mausoleum stepped pyramid tomb
  66: (_c1, c2) => `
    <polygon points="50,12 78,54 22,54" fill="#b45309" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M39 29 L61 29 M32 40 L68 40 M26 49 L74 49" stroke="#111" stroke-width="1.6"/>
    <rect x="45" y="25" width="10" height="22" rx="1.5" fill="#fef3c7" stroke="#111" stroke-width="1.3"/>
    <path d="M48 31 L52 31 M50 28 L50 43 M48 39 L52 39" stroke="#b91c1c" stroke-width="1.6" stroke-linecap="round"/>`,

  // 67: Lưu Sa Triều — rolling desert sand waves surge
  67: (_c1, c2) => `
    <path d="M12 42 Q28 24 44 36 T76 30 L88 38 L88 56 L12 56 Z" fill="#a16207" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M12 49 Q34 36 54 46 T88 44 L88 56 L12 56 Z" fill="#ca8a04" stroke="#fde68a" stroke-width="1.6"/>
    <path d="M24 24 Q34 20 44 24 M58 20 Q70 16 80 22" fill="none" stroke="#fde68a" stroke-width="1.6" stroke-linecap="round"/>`,

  // 68: Khiên Cát Tự Động — Gaara's sand gourd unleashing automatic protective sand arc
  68: (_c1, c2) => `
    <path d="M24 50 C18 28, 30 12, 50 12 C70 12, 82 28, 76 50" fill="none" stroke="#fde68a" stroke-width="3" stroke-linecap="round"/>
    <path d="M43 19 C43 14, 57 14, 57 19 C57 24, 53 27, 54 31 C60 34, 62 42, 60 49 C58 55, 42 55, 40 49 C38 42, 40 34, 46 31 C47 27, 43 24, 43 19 Z" fill="#b45309" stroke="${c2}" stroke-width="2"/>
    <path d="M44 30 L56 30" stroke="#dc2626" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M45 43 L55 43" stroke="#111" stroke-width="1.5"/>`,

  // 69: Mộng Nhất Vĩ — Shukaku One-Tail fierce tanuki face with 4-point star pupils
  69: (_c1, c2) => `
    <path d="M28 24 L24 12 L38 18 L50 16 L62 18 L76 12 L72 24 L74 44 C70 54, 30 54, 26 44 Z" fill="#d6b485" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M28 28 L38 26 M72 28 L62 26 M32 45 L39 42 M68 45 L61 42" stroke="#312e81" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="40" cy="33" r="6" fill="#111"/><circle cx="60" cy="33" r="6" fill="#111"/>
    <circle cx="40" cy="33" r="4.2" fill="#facc15"/><circle cx="60" cy="33" r="4.2" fill="#facc15"/>
    <path d="M40 30 L41 32 L43 33 L41 34 L40 36 L39 34 L37 33 L39 32 Z M60 30 L61 32 L63 33 L61 34 L60 36 L59 34 L57 33 L59 32 Z" fill="#111"/>
    <path d="M38 46 L44 43 L50 47 L56 43 L62 46" fill="none" stroke="#111" stroke-width="1.8" stroke-linejoin="round"/>`,

  // 70: Mộc Diệp Sen Ký — Konoha Senpū spinning emerald whirlwind kick + leaves
  70: (c1, c2) => `
    <circle cx="50" cy="34" r="22" fill="${c1}66" stroke="${c2}" stroke-width="2"/>
    <path d="M26 38 C28 20, 56 14, 72 26" fill="none" stroke="${c2}" stroke-width="3" stroke-linecap="round"/>
    <polygon points="75,28 66,22 69,31" fill="#fff"/>
    <path d="M74 30 C72 48, 44 54, 28 42" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M42 36 C46 28, 56 28, 58 34 C52 40, 45 40, 42 36 Z" fill="#4ade80" stroke="#111" stroke-width="1.3"/>
    <line x1="43" y1="36" x2="55" y2="33" stroke="#111" stroke-width="1.2"/>`,

  // 71: Biến Hình Liên Đạn — triple combo rapid taijutsu strike burst
  71: (c1, c2) => `
    <path d="M22 48 L44 18 L52 34 L76 16" fill="none" stroke="${c2}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="34" cy="33" r="6" fill="${c1}" stroke="#fff" stroke-width="1.6"/>
    <circle cx="51" cy="33" r="7" fill="${c1}" stroke="${c2}" stroke-width="1.8"/>
    <circle cx="69" cy="21" r="8" fill="#4ade80" stroke="#fff" stroke-width="1.8"/>
    <path d="M69 13 L69 29 M61 21 L77 21" stroke="#111" stroke-width="1.6"/>
    <path d="M44 48 L72 48" stroke="${c2}" stroke-width="2" stroke-linecap="round" stroke-dasharray="5 3"/>`,

  // 72: Bát Môn Khai Môn — First Gate opening glowing emerald inner gate aura
  72: (c1, c2) => `
    <circle cx="50" cy="34" r="22" fill="#052e16" stroke="${c2}" stroke-width="2"/>
    <path d="M32 52 C32 36, 38 22, 50 14 C62 22, 68 36, 68 52 Z" fill="${c1}" stroke="${c2}" stroke-width="1.8"/>
    <circle cx="50" cy="28" r="7" fill="#4ade80" stroke="#fff" stroke-width="2"/>
    <path d="M50 12 L50 18 M34 28 L40 28 M60 28 L66 28 M38 17 L43 21 M62 17 L57 21" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/>
    <circle cx="50" cy="28" r="2.8" fill="#fff"/>`,

  // 73: Liên Hoa Đầu — Primary/Hidden Lotus blooming chakra petals & swirling bandages
  73: (c1, c2) => `
    <path d="M28 50 Q50 58 72 50 M30 42 Q50 49 70 42" fill="none" stroke="#f8fafc" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M50 12 C57 22, 58 34, 50 44 C42 34, 43 22, 50 12 Z" fill="#4ade80" stroke="#111" stroke-width="1.4"/>
    <path d="M32 22 C42 24, 48 32, 48 44 C36 40, 30 32, 32 22 Z" fill="${c1}" stroke="${c2}" stroke-width="1.6"/>
    <path d="M68 22 C58 24, 52 32, 52 44 C64 40, 70 32, 68 22 Z" fill="${c1}" stroke="${c2}" stroke-width="1.6"/>
    <circle cx="50" cy="36" r="4.5" fill="#fef08a" stroke="#111" stroke-width="1.3"/>`,

  // 74: Triều Khổng Tước — Morning Peacock blazing fan of fire punch plumes
  74: (_c1, c2) => `
    <path d="M50 52 L22 28 C25 22, 32 21, 36 27 Z" fill="#ea580c" stroke="#fde047" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M50 52 L34 16 C39 11, 45 12, 47 19 Z" fill="#f97316" stroke="#fde047" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M50 52 L50 11 C55 11, 61 12, 66 16 Z" fill="#f97316" stroke="#fde047" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M50 52 L64 27 C68 21, 75 22, 78 28 Z" fill="#ea580c" stroke="#fde047" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M50 52 L45 14 L50 10 L55 14 Z" fill="#fef08a"/>
    <circle cx="50" cy="50" r="7" fill="#dc2626" stroke="${c2}" stroke-width="2"/>`,

  // 75: Đoản Kiếm Đột Kích — Anbu/ninja tantō short sword with clean slash arc
  75: (_c1, c2) => `
    <path d="M22 20 Q52 10 78 30" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
    <g transform="rotate(-35 50 36)">
      <polygon points="20,33 60,33 68,36 60,39 20,39" fill="#cbd5e1" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/>
      <line x1="22" y1="36" x2="64" y2="36" stroke="#fff" stroke-width="1.2"/>
      <rect x="64" y="29" width="4" height="14" rx="1" fill="#f59e0b" stroke="#111" stroke-width="1.2"/>
      <rect x="68" y="33" width="14" height="6" rx="1.5" fill="#1e293b" stroke="${c2}" stroke-width="1.4"/>
    </g>`,

  // 76: Phi Tiêu Cơn Lốc — giant 4-blade curved Fūma Shuriken in emerald cyclone
  76: (_c1, c2) => `
    <circle cx="50" cy="34" r="23" fill="none" stroke="${c2}" stroke-width="1.8" stroke-dasharray="12 6"/>
    <path d="M50 11 C58 14, 60 22, 55 29 L73 34 C70 42, 62 44, 55 39 L50 57 C42 54, 40 46, 45 39 L27 34 C30 26, 38 24, 45 29 Z" fill="#1e293b" stroke="#e2e8f0" stroke-width="1.8" stroke-linejoin="round"/>
    <circle cx="50" cy="34" r="6.5" fill="#161a24" stroke="${c2}" stroke-width="2"/>`,

  // 77: Tiêm Dược Cấp Cứu — medical ninja syringe / antidote with glowing green cross
  77: (_c1, _c2) => `
    <circle cx="50" cy="34" r="22" fill="#064e3b" stroke="#86efac" stroke-width="2"/>
    <g transform="rotate(-40 50 34)">
      <rect x="36" y="28" width="24" height="12" rx="2" fill="#dcfce7" stroke="#111" stroke-width="1.5"/>
      <rect x="38" y="30" width="13" height="8" fill="#22c55e"/>
      <line x1="60" y1="34" x2="73" y2="34" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/>
      <line x1="28" y1="34" x2="36" y2="34" stroke="#e2e8f0" stroke-width="2.5"/>
      <line x1="28" y1="29" x2="28" y2="39" stroke="#e2e8f0" stroke-width="2.5" stroke-linecap="round"/>
    </g>
    <path d="M65 18 L65 26 M61 22 L69 22" stroke="#86efac" stroke-width="2.2" stroke-linecap="round"/>`,

  // 78: Thể Thuật Cận Chiến — bandaged shinobi fist & kinetic shockwave burst
  78: (c1, c2) => `
    <circle cx="50" cy="34" r="22" fill="${c1}66" stroke="${c2}" stroke-width="2"/>
    <rect x="34" y="23" width="32" height="22" rx="7" fill="#f1f5f9" stroke="#111" stroke-width="1.8"/>
    <path d="M42 23 L42 35 M50 23 L50 35 M58 23 L58 35 M34 36 L66 36" stroke="#111" stroke-width="1.6"/>
    <path d="M38 45 L38 54 M62 45 L62 54 M38 49 L62 49" stroke="#cbd5e1" stroke-width="2"/>
    <path d="M20 20 L27 25 M80 20 L73 25 M18 36 L26 36 M82 36 L74 36" stroke="${c2}" stroke-width="2" stroke-linecap="round"/>`,

  // 79: Trị Thương Thuật — Shōsen Jutsu emerald healing palm + sakura petals
  79: (_c1, c2) => `
    <circle cx="50" cy="34" r="22" fill="#064e3b" stroke="#86efac" stroke-width="2"/>
    <path d="M41 51 L41 31 C41 28, 44 28, 44 31 L44 21 C44 18, 48 18, 48 21 L48 19 C48 16, 52 16, 52 19 L52 21 C52 18, 56 18, 56 21 L56 31 C56 28, 59 28, 59 31 L59 47 C59 52, 41 54, 41 51 Z" fill="#4ade80" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M50 32 L50 42 M45 37 L55 37" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="29" cy="24" r="3" fill="${c2}"/><circle cx="71" cy="26" r="2.6" fill="${c2}"/>`,

  // 80: Quái Lực Quyền — Sakura chakra-enhanced fist smashing stone
  80: (c1, c2) => `
    <path d="M18 54 L34 44 L44 50 L56 42 L68 49 L82 54" fill="none" stroke="${c2}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="35" y="16" width="30" height="22" rx="6" fill="${c1}" stroke="${c2}" stroke-width="2"/>
    <path d="M43 16 L43 29 M50 16 L50 29 M57 16 L57 29 M35 30 L65 30" stroke="#111" stroke-width="1.6"/>
    <path d="M26 42 L34 38 M74 42 L66 38 M50 40 L50 54" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`,

  // 81: Khai Hoa Bách Hợp Trị Liệu — radiant 5-petal sakura blossom with emerald healing glow
  81: (c1, c2) => `
    <circle cx="50" cy="34" r="22" fill="#065f46" stroke="#86efac" stroke-width="2"/>
    <g fill="${c2}" stroke="${c1}" stroke-width="1.3">
      <path d="M50 32 C44 22, 44 14, 50 12 C56 14, 56 22, 50 32 Z"/>
      <path d="M50 32 C44 22, 44 14, 50 12 C56 14, 56 22, 50 32 Z" transform="rotate(72 50 34)"/>
      <path d="M50 32 C44 22, 44 14, 50 12 C56 14, 56 22, 50 32 Z" transform="rotate(144 50 34)"/>
      <path d="M50 32 C44 22, 44 14, 50 12 C56 14, 56 22, 50 32 Z" transform="rotate(216 50 34)"/>
      <path d="M50 32 C44 22, 44 14, 50 12 C56 14, 56 22, 50 32 Z" transform="rotate(288 50 34)"/>
    </g>
    <circle cx="50" cy="34" r="5" fill="#4ade80" stroke="#fff" stroke-width="1.5"/>`,

  // 82: Cú Đấm Sơn Trấn — Ōkashō earth-shattering crater fissure & flying boulders
  82: (c1, c2) => `
    <path d="M14 50 L36 42 L50 56 L64 42 L86 50" fill="none" stroke="${c2}" stroke-width="2.4" stroke-linejoin="round"/>
    <polygon points="24,36 33,24 38,34" fill="#78716c" stroke="#111" stroke-width="1.4"/>
    <polygon points="76,36 67,24 62,34" fill="#78716c" stroke="#111" stroke-width="1.4"/>
    <polygon points="44,24 50,11 56,24" fill="${c1}" stroke="#fff" stroke-width="1.6"/>
    <path d="M50 24 L50 48 M34 40 L48 48 M66 40 L52 48" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    <circle cx="50" cy="48" r="5" fill="${c2}"/>`,

  // 83: Sáng Tạo Diêm Sinh — Byakugō Strength of a Hundred Diamond Seal & spreading markings
  83: (c1, c2) => `
    <circle cx="50" cy="34" r="22" fill="#4c1d95" stroke="${c2}" stroke-width="2"/>
    <path d="M22 34 L38 34 M62 34 L78 34 M28 22 L40 28 M72 22 L60 28 M28 46 L40 40 M72 46 L60 40" stroke="#111" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M22 34 L38 34 M62 34 L78 34 M28 22 L40 28 M72 22 L60 28 M28 46 L40 40 M72 46 L60 40" stroke="${c2}" stroke-width="1" stroke-linecap="round"/>
    <polygon points="50,15 62,34 50,53 38,34" fill="#7c3aed" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
    <polygon points="50,23 56,34 50,45 44,34" fill="${c1}" stroke="${c2}" stroke-width="1.3"/>`,

  // 84: Uế Thổ Chuyển Sinh — Edo Tensei rising wooden coffin & cracked ash seal
  84: (_c1, c2) => `
    <path d="M20 56 Q50 50 80 56" fill="none" stroke="${c2}" stroke-width="2" stroke-linecap="round"/>
    <polygon points="37,54 33,22 41,11 59,11 67,22 63,54" fill="#451a03" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <polygon points="41,51 38,24 44,15 56,15 62,24 59,51" fill="#78350f" stroke="#111" stroke-width="1.4"/>
    <rect x="46" y="21" width="8" height="22" rx="1" fill="#e2e8f0" stroke="#111" stroke-width="1.2"/>
    <path d="M48 26 L52 26 M50 24 L50 39 M48 34 L52 34" stroke="#111" stroke-width="1.5"/>
    <path d="M22 36 L30 32 M78 32 L70 36 M24 22 L30 24" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/>`,

  // 85: Thiểm Quang Trảm — Yellow Flash blazing golden lightning Z-slash
  85: (c1, c2) => `
    <path d="M18 18 L66 18 L34 48 L82 48" fill="none" stroke="${c1}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M18 18 L66 18 L34 48 L82 48" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <polygon points="72,14 76,22 84,22 77,27 80,35 72,30 64,35 67,27 60,22 68,22" fill="${c2}" stroke="#111" stroke-width="1.2"/>`,

  // 86: Ảnh Phộc Thuật — Nara Shadow Possession stretching shadow tendril
  86: (_c1, c2) => `
    <circle cx="72" cy="24" r="6" fill="#475569" stroke="${c2}" stroke-width="1.6"/>
    <path d="M64 46 C64 36, 67 32, 72 32 C77 32, 80 36, 80 46 Z" fill="#475569" stroke="${c2}" stroke-width="1.6"/>
    <path d="M16 52 C28 52, 34 44, 46 46 C56 48, 62 46, 72 47 C79 47, 82 52, 72 54 C56 56, 36 56, 16 52 Z" fill="#090d16" stroke="#e2e8f0" stroke-width="1.8" stroke-linejoin="round"/>
    <circle cx="24" cy="48" r="4" fill="#090d16" stroke="${c2}" stroke-width="1.5"/>`,

  // 87: Ảnh Thủ Phược Cương Hợp — Shadow Sewing piercing black shadow spears
  87: (_c1, c2) => `
    <path d="M22 56 L36 16 L43 56 Z M43 56 L50 10 L57 56 Z M57 56 L64 16 L78 56 Z" fill="#090d16" stroke="#e2e8f0" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M28 42 Q50 30 72 42" fill="none" stroke="${c2}" stroke-width="2" stroke-linecap="round"/>
    <circle cx="50" cy="36" r="4.5" fill="${c2}" stroke="#111" stroke-width="1.4"/>`,

  // 88: Ảnh Thủ Phược Kế — Shikamaru Shadow Strategy Shogi piece + shadow web
  88: (_c1, c2) => `
    <path d="M16 54 L50 36 L84 54 M16 20 L50 36 L84 20 M50 10 L50 58" stroke="#94a3b8" stroke-width="1.4" stroke-dasharray="4 3"/>
    <polygon points="50,14 63,22 66,52 34,52 37,22" fill="#0f172a" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M44 27 L56 27 M50 24 L50 44 M43 35 L57 35 M44 43 L56 43" stroke="#e2e8f0" stroke-width="1.8" stroke-linecap="round"/>`,

  // 89: Thổ Lưu Bích — Kakashi Earth Style Mud Wall with sculpted Ninken dog reliefs
  89: (_c1, c2) => `
    <path d="M16 56 L20 20 L80 20 L84 56 Z" fill="#78533a" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M20 28 L80 28" stroke="#111" stroke-width="1.6"/>
    <g fill="#a17454" stroke="#111" stroke-width="1.3">
      <circle cx="34" cy="41" r="7"/><polygon points="28,36 27,29 33,34"/><polygon points="40,36 41,29 35,34"/>
      <circle cx="50" cy="41" r="7"/><polygon points="44,36 43,29 49,34"/><polygon points="56,36 57,29 51,34"/>
      <circle cx="66" cy="41" r="7"/><polygon points="60,36 59,29 65,34"/><polygon points="72,36 73,29 67,34"/>
    </g>
    <circle cx="32" cy="40" r="1.1" fill="#111"/><circle cx="36" cy="40" r="1.1" fill="#111"/>
    <circle cx="48" cy="40" r="1.1" fill="#111"/><circle cx="52" cy="40" r="1.1" fill="#111"/>
    <circle cx="64" cy="40" r="1.1" fill="#111"/><circle cx="68" cy="40" r="1.1" fill="#111"/>`,

  // 90: Lôi Thiết — Kakashi Raikiri concentrated blue-white lightning blade
  90: (_c1, c2) => `
    <path d="M16 34 L48 22 L86 34 L48 46 Z" fill="#0284c7" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M22 34 L50 28 L82 34 L50 40 Z" fill="#e0f2fe"/>
    <path d="M28 20 L40 26 L36 16 M64 16 L58 26 L72 22 M30 48 L42 42 L38 52 M64 52 L58 42 L72 46" fill="none" stroke="#7dd3fc" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="48" cy="34" r="5" fill="#fff"/>`,

  // 91: Bộc Giấy Trận — Konan's 600 Billion Paper Bomb tags igniting in fiery vortex
  91: (c1, c2) => `
    <circle cx="50" cy="34" r="23" fill="#7c2d12" stroke="${c2}" stroke-width="2"/>
    <rect x="24" y="16" width="12" height="20" rx="1.5" transform="rotate(-18 30 26)" fill="#fef3c7" stroke="#111" stroke-width="1.4"/>
    <rect x="64" y="16" width="12" height="20" rx="1.5" transform="rotate(18 70 26)" fill="#fef3c7" stroke="#111" stroke-width="1.4"/>
    <rect x="42" y="18" width="16" height="28" rx="1.5" fill="#fff" stroke="#111" stroke-width="1.6"/>
    <path d="M46 25 L54 25 M50 22 L50 40 M46 33 L54 33" stroke="#dc2626" stroke-width="1.8" stroke-linecap="round"/>
    <polygon points="50,38 56,48 66,46 58,54 62,61 50,56 38,61 42,54 34,46 44,48" fill="${c1}" stroke="#fde047" stroke-width="1.4"/>`,

  // 92: Thức Giấy Thuật Tiễn — volley of sharp folded white origami paper spears
  92: (_c1, c2) => `
    <polygon points="20,22 52,18 42,27" fill="#f8fafc" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/>
    <polygon points="18,46 50,42 40,51" fill="#e0e7ff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/>
    <polygon points="24,34 80,34 52,24 58,34 52,44" fill="#fff" stroke="${c2}" stroke-width="1.8" stroke-linejoin="round"/>
    <line x1="28" y1="34" x2="78" y2="34" stroke="#6366f1" stroke-width="1.5"/>`,

  // 93: Vũ Dịch Chi Thuật — Dance of the Shikigami swirling origami butterflies & sheets
  93: (_c1, c2) => `
    <path d="M22 48 C28 18, 72 18, 78 48" fill="none" stroke="${c2}" stroke-width="1.6" stroke-dasharray="5 4"/>
    <polygon points="50,34 34,20 38,38 50,34 66,20 62,38" fill="#fff" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/>
    <polygon points="50,34 40,46 48,40 50,34 60,46 52,40" fill="#e0e7ff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/>
    <rect x="20" y="18" width="9" height="12" transform="rotate(-20 24 24)" fill="#f8fafc" stroke="#6366f1" stroke-width="1.2"/>
    <rect x="71" y="38" width="9" height="12" transform="rotate(24 75 44)" fill="#f8fafc" stroke="#6366f1" stroke-width="1.2"/>`,

  // 94: Thần Chi Giấy Giả Thuật — piercing giant white origami lance splitting armor
  94: (_c1, c2) => `
    <path d="M62 16 L76 22 L72 44 L62 52" fill="none" stroke="#94a3b8" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="6 4"/>
    <polygon points="16,34 44,24 84,34 44,44" fill="#f8fafc" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <polygon points="16,34 44,24 84,34" fill="#fff" stroke="#111" stroke-width="1.3"/>
    <line x1="18" y1="34" x2="82" y2="34" stroke="#6366f1" stroke-width="1.6"/>`,

  // 95: Thiên Sứ Chi Dực — Konan's majestic twin white origami angel wings + blue paper flower
  95: (_c1, c2) => `
    <path d="M48 38 L16 16 L22 30 L18 39 L28 45 L26 52 L48 44 Z" fill="#f8fafc" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M52 38 L84 16 L78 30 L82 39 L72 45 L74 52 L52 44 Z" fill="#f8fafc" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M22 30 L46 39 M28 45 L46 42 M78 30 L54 39 M72 45 L54 42" stroke="#6366f1" stroke-width="1.3"/>
    <circle cx="50" cy="24" r="6" fill="#6366f1" stroke="${c2}" stroke-width="1.8"/>
    <circle cx="50" cy="24" r="2.2" fill="#fff"/>`,

  // 96: Siêu Gia Trọng Nham Thuật — Ohnoki's giant rock-encrusted fist crashing down
  96: (_c1, c2) => `
    <path d="M32 10 L32 22 M50 8 L50 18 M68 10 L68 22" stroke="${c2}" stroke-width="2" stroke-linecap="round"/>
    <polygon points="32,22 42,17 58,17 68,22 72,38 64,48 36,48 28,38" fill="#78716c" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M40 24 L40 37 M50 22 L50 37 M60 24 L60 37 M34 38 L66 38" stroke="#111" stroke-width="1.7"/>
    <path d="M18 54 L34 50 L50 56 L66 50 L82 54" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round"/>`,

  // 97: Mộc Độn Thụ Giới Giáng Lâm — Hashirama's Deep Forest Emergence ancient twisting trees
  97: (c1, c2) => `
    <path d="M20 57 C28 44, 34 32, 34 22 M80 57 C72 44, 66 32, 66 22 M50 57 L50 20" fill="none" stroke="#92400e" stroke-width="5" stroke-linecap="round"/>
    <path d="M50 42 C38 36, 28 38, 22 30 M50 36 C62 30, 72 32, 78 24" fill="none" stroke="#b45309" stroke-width="3.2" stroke-linecap="round"/>
    <circle cx="50" cy="20" r="12" fill="${c1}" stroke="${c2}" stroke-width="2"/>
    <circle cx="32" cy="25" r="9" fill="#15803d" stroke="${c2}" stroke-width="1.6"/>
    <circle cx="68" cy="25" r="9" fill="#15803d" stroke="${c2}" stroke-width="1.6"/>`,

  // 98: Lôi Thú Truy Hồn — Kakashi's charging Lightning Hound / Wolf
  98: (_c1, c2) => `
    <path d="M14 40 L24 34 L28 40 L36 34" fill="none" stroke="${c2}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M34 36 L44 18 L52 24 L62 14 L64 26 L80 30 L70 38 L78 44 L56 46 L46 52 L42 42 Z" fill="#0284c7" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <polygon points="56,28 65,30 58,33" fill="#fff"/>
    <path d="M68 38 L74 36 M46 34 L54 38" stroke="#fef08a" stroke-width="1.6" stroke-linecap="round"/>`,

  // 99: Bom C1 Đất Sét — Deidara's small white clay winged insect bomb
  99: (c1, c2) => `
    <circle cx="50" cy="34" r="22" fill="#7c2d12" stroke="${c2}" stroke-width="2"/>
    <path d="M42 32 C26 20, 22 38, 38 40 M58 32 C74 20, 78 38, 62 40" fill="#f8fafc" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/>
    <ellipse cx="50" cy="36" rx="9" ry="12" fill="#f8fafc" stroke="#111" stroke-width="1.6"/>
    <circle cx="47" cy="29" r="1.5" fill="#111"/><circle cx="53" cy="29" r="1.5" fill="#111"/>
    <path d="M46 24 L42 17 M54 24 L58 17" stroke="#f8fafc" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="50" cy="39" r="3.5" fill="${c1}"/>`,

  // 100: C4 Garuda — Deidara's colossal white clay clone giant dispersing micro-bombs
  100: (c1, c2) => `
    <circle cx="50" cy="20" r="8" fill="#f8fafc" stroke="#111" stroke-width="1.6"/>
    <path d="M32 56 L36 30 L42 28 L58 28 L64 30 L68 56 Z" fill="#f8fafc" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M46 19 L49 20 M54 19 L51 20 M46 24 Q50 26 54 24" stroke="#111" stroke-width="1.4" stroke-linecap="round"/>
    <circle cx="22" cy="22" r="2.5" fill="${c2}"/><circle cx="78" cy="22" r="2.5" fill="${c2}"/>
    <circle cx="24" cy="38" r="2" fill="${c1}"/><circle cx="76" cy="38" r="2" fill="${c1}"/>
    <circle cx="50" cy="41" r="6" fill="${c1}" stroke="#fde047" stroke-width="1.6"/>`,

  // 101: Bùa Nổ — iconic Naruto Kibaku Fuda explosive paper tag burning with spark
  101: (c1, c2) => `
    <rect x="34" y="10" width="32" height="48" rx="3" fill="#fef3c7" stroke="${c2}" stroke-width="2"/>
    <rect x="38" y="14" width="24" height="40" rx="1.5" fill="none" stroke="#111" stroke-width="1.5"/>
    <path d="M43 24 L57 24 M50 19 L50 47 M43 34 L57 34 M44 43 L56 43 M44 28 L56 39" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
    <polygon points="66,14 70,20 77,19 71,24 74,31 67,27 61,30 63,23 58,18 65,19" fill="${c1}" stroke="#fde047" stroke-width="1.2"/>`,

  // 102: Kim Châm Độc Rối — fan of 5 steel senbon needles dripping purple-green poison
  102: (_c1, c2) => `
    <g stroke="#e2e8f0" stroke-width="1.8" stroke-linecap="round">
      <line x1="22" y1="52" x2="40" y2="14"/>
      <line x1="34" y1="54" x2="46" y2="12"/>
      <line x1="50" y1="56" x2="50" y2="10"/>
      <line x1="66" y1="54" x2="54" y2="12"/>
      <line x1="78" y1="52" x2="60" y2="14"/>
    </g>
    <circle cx="40" cy="14" r="2.8" fill="#a855f7" stroke="${c2}" stroke-width="1"/>
    <circle cx="50" cy="11" r="3.2" fill="#a855f7" stroke="#e9d5ff" stroke-width="1.1"/>
    <circle cx="60" cy="14" r="2.8" fill="#a855f7" stroke="${c2}" stroke-width="1"/>
    <path d="M46 21 C44 25, 48 25, 46 21 Z M54 22 C52 26, 56 26, 54 22 Z" fill="#c084fc"/>`,

  // 103: Nhện Đất Sét Nhỏ — trio of small scurrying white clay spiders
  103: (c1, c2) => `
    <g stroke="#f8fafc" stroke-width="1.5" stroke-linecap="round">
      <path d="M24 34 L18 28 M24 38 L17 40 M36 34 L42 28 M36 38 L43 40"/>
      <path d="M64 34 L58 28 M64 38 L57 40 M76 34 L82 28 M76 38 L83 40"/>
      <path d="M43 24 L36 18 M43 29 L35 31 M57 24 L64 18 M57 29 L65 31"/>
    </g>
    <circle cx="30" cy="38" r="6" fill="#f8fafc" stroke="#111" stroke-width="1.4"/>
    <circle cx="70" cy="38" r="6" fill="#f8fafc" stroke="#111" stroke-width="1.4"/>
    <circle cx="50" cy="27" r="7" fill="#f8fafc" stroke="#111" stroke-width="1.5"/>
    <circle cx="30" cy="38" r="2" fill="${c1}"/><circle cx="70" cy="38" r="2" fill="${c1}"/><circle cx="50" cy="27" r="2.4" fill="${c2}"/>`,

  // 104: Thế Thân Chi Thuật — iconic Substitution Jutsu wooden log + ninja smoke poof
  104: (_c1, c2) => `
    <circle cx="28" cy="26" r="8" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.3"/>
    <circle cx="72" cy="26" r="8" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.3"/>
    <circle cx="50" cy="18" r="9" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.3"/>
    <rect x="28" y="30" width="44" height="22" rx="4" fill="#92400e" stroke="${c2}" stroke-width="1.8"/>
    <ellipse cx="32" cy="41" rx="5" ry="11" fill="#fde68a" stroke="#111" stroke-width="1.5"/>
    <ellipse cx="32" cy="41" rx="2.2" ry="5" fill="none" stroke="#92400e" stroke-width="1.2"/>
    <path d="M42 36 L66 36 M45 45 L68 45" stroke="#451a03" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M58 30 C60 22, 68 20, 71 25 C67 28, 62 29, 58 30 Z" fill="#4ade80" stroke="#111" stroke-width="1.2"/>`,

  // 105: Bom Khói — black ninja smoke pellet erupting into stealth smoke clouds
  105: (_c1, c2) => `
    <circle cx="33" cy="28" r="11" fill="#94a3b8" stroke="#e2e8f0" stroke-width="1.5"/>
    <circle cx="67" cy="28" r="11" fill="#94a3b8" stroke="#e2e8f0" stroke-width="1.5"/>
    <circle cx="50" cy="22" r="13" fill="#cbd5e1" stroke="#fff" stroke-width="1.6"/>
    <circle cx="50" cy="44" r="11" fill="#1e293b" stroke="${c2}" stroke-width="2"/>
    <path d="M46 34 L50 28 L54 34" fill="none" stroke="#facc15" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="46" cy="42" r="2.2" fill="#475569"/>`,

  // 106: Mộc Độn Mộc Đĩnh Bích — Wood Locking Wall interlocking curved wooden dome
  106: (_c1, c2) => `
    <path d="M20 54 C20 22, 34 12, 50 12 C66 12, 80 22, 80 54 Z" fill="#92400e" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M30 54 C30 27, 39 16, 50 12 M40 54 C40 31, 45 20, 50 12 M50 54 L50 12 M60 54 C60 31, 55 20, 50 12 M70 54 C70 27, 61 16, 50 12" fill="none" stroke="#451a03" stroke-width="1.8"/>
    <path d="M20 54 L80 54" stroke="${c2}" stroke-width="2.2" stroke-linecap="round"/>`,

  // 107: Mộc Phân Thân Thuật — Wood Clone emerging from coiling wooden ribbons & leaves
  107: (c1, c2) => `
    <circle cx="50" cy="21" r="7.5" fill="#b45309" stroke="${c2}" stroke-width="1.8"/>
    <path d="M37 54 C37 36, 42 30, 50 30 C58 30, 63 36, 63 54 Z" fill="#92400e" stroke="${c2}" stroke-width="1.8"/>
    <path d="M32 48 C40 42, 60 42, 68 36 M34 38 C44 33, 58 34, 66 28" fill="none" stroke="#fde68a" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M24 28 C28 22, 34 22, 36 27 C31 30, 27 30, 24 28 Z M76 26 C72 20, 66 20, 64 25 C69 28, 73 28, 76 26 Z" fill="${c1}" stroke="${c2}" stroke-width="1.3"/>`,

  // 108: Mộc Độn Tứ Trụ Gia — Yamato's Four-Pillar Japanese wooden timber house
  108: (_c1, c2) => `
    <polygon points="18,32 50,12 82,32" fill="#78350f" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <rect x="26" y="32" width="48" height="23" fill="#92400e" stroke="${c2}" stroke-width="1.8"/>
    <line x1="36" y1="32" x2="36" y2="55" stroke="#111" stroke-width="2"/>
    <line x1="64" y1="32" x2="64" y2="55" stroke="#111" stroke-width="2"/>
    <rect x="44" y="38" width="12" height="17" fill="#fef3c7" stroke="#111" stroke-width="1.4"/>
    <path d="M50 20 L50 28 M46 24 L54 24" stroke="#86efac" stroke-width="2" stroke-linecap="round"/>`,

  // 109: Thiên Sát Thủy Tường — Haku's Thousand Flying Water Needles of Death
  109: (_c1, c2) => `
    <ellipse cx="50" cy="54" rx="28" ry="5" fill="#0369a1" stroke="${c2}" stroke-width="1.6"/>
    <g stroke="#e0f2fe" stroke-width="2" stroke-linecap="round">
      <line x1="26" y1="48" x2="20" y2="20"/>
      <line x1="36" y1="49" x2="34" y2="14"/>
      <line x1="50" y1="50" x2="50" y2="10"/>
      <line x1="64" y1="49" x2="66" y2="14"/>
      <line x1="74" y1="48" x2="80" y2="20"/>
    </g>
    <circle cx="50" cy="10" r="2.2" fill="#fff"/><circle cx="34" cy="14" r="2" fill="#7dd3fc"/><circle cx="66" cy="14" r="2" fill="#7dd3fc"/>`,

  // 110: Băng Độn: Nhất Giác Bạch Kình — leaping crystalline Ice Narwhal whale
  110: (_c1, c2) => `
    <path d="M16 52 Q36 44 54 50 T86 48" fill="none" stroke="${c2}" stroke-width="2" stroke-linecap="round"/>
    <path d="M22 46 C26 24, 46 18, 66 26 L84 16 L69 33 C66 44, 50 48, 36 44 L24 51 Z" fill="#bae6fd" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M36 30 L56 28 M42 38 L60 35" stroke="#0284c7" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="62" cy="30" r="1.8" fill="#0f172a"/>`,

  // 111: Băng Độn: Băng Lao — jagged hexagonal glacier Ice Prison
  111: (_c1, c2) => `
    <polygon points="50,8 72,22 68,54 50,60 32,54 28,22" fill="#0284c7" fill-opacity="0.7" stroke="#e0f2fe" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="50" cy="27" r="5" fill="#0f172a"/>
    <path d="M42 46 C42 36, 45 33, 50 33 C55 33, 58 36, 58 46 Z" fill="#0f172a"/>
    <path d="M50 8 L50 60 M28 22 L72 22 M32 54 L68 22" stroke="${c2}" stroke-width="1.4" opacity="0.85"/>`,

  // 112: Bí Thuật: Ma Kính Băng Tinh — Haku's ring of tall Demonic Ice Mirrors
  112: (_c1, c2) => `
    <polygon points="18,16 32,13 30,52 16,49" fill="#0ea5e9" fill-opacity="0.65" stroke="#e0f2fe" stroke-width="1.7" stroke-linejoin="round"/>
    <polygon points="68,13 82,16 84,49 70,52" fill="#0ea5e9" fill-opacity="0.65" stroke="#e0f2fe" stroke-width="1.7" stroke-linejoin="round"/>
    <polygon points="38,10 62,10 60,58 40,58" fill="#38bdf8" fill-opacity="0.75" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
    <path d="M43 18 L55 14 M42 34 L57 26" stroke="#fff" stroke-width="1.4" opacity="0.8"/>
    <path d="M44 38 L56 38 M44 43 L56 43" stroke="#111" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="50" cy="33" r="3" fill="${c2}" stroke="#111" stroke-width="1.2"/>`,

  // 113: Băng Độn: Băng Nham Đường Vô — faceted reflective Ice Crystal Dome barrier
  113: (_c1, c2) => `
    <polygon points="20,54 24,28 38,14 62,14 76,28 80,54" fill="#0369a1" fill-opacity="0.75" stroke="#e0f2fe" stroke-width="2" stroke-linejoin="round"/>
    <path d="M38 14 L36 54 M62 14 L64 54 M24 28 L76 28 M38 14 L50 38 L62 14" fill="none" stroke="${c2}" stroke-width="1.5"/>
    <path d="M22 20 L16 14 M78 20 L84 14 M50 14 L50 7" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>`,

  // 114: Tiên Nhân Cóc — Toad Sage Mode golden eye with horizontal bar pupil & orange pigmentation
  114: (_c1, c2) => `
    <path d="M18 34 C28 16, 72 16, 82 34 C72 52, 28 52, 18 34 Z" fill="#ea580c" stroke="${c2}" stroke-width="2"/>
    <path d="M24 34 Q50 16 76 34 Q50 52 24 34 Z" fill="#facc15" stroke="#111" stroke-width="1.8"/>
    <rect x="35" y="30.5" width="30" height="7" rx="3" fill="#111"/>
    <circle cx="42" cy="27" r="2" fill="#fff"/>`,

  // 115: Xà Tiên Nhân Chi Thuật — Snake Sage golden eye with vertical viper slit & purple markings
  115: (c1, c2) => `
    <path d="M24 14 L34 22 M76 14 L66 22" stroke="${c2}" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M18 34 C28 16, 72 16, 82 34 C72 52, 28 52, 18 34 Z" fill="${c1}" stroke="${c2}" stroke-width="2"/>
    <path d="M25 34 Q50 17 75 34 Q50 51 25 34 Z" fill="#fde047" stroke="#111" stroke-width="1.8"/>
    <ellipse cx="50" cy="34" rx="4.2" ry="13.5" fill="#111"/>
    <circle cx="45" cy="27" r="2" fill="#fff"/>`,

  // 116: Cửu Vĩ Bạo Động — Kurama Nine-Tails fierce fox head & blazing tail aura
  116: (c1, c2) => `
    <path d="M22 50 C14 36, 18 22, 28 14 M78 50 C86 36, 82 22, 72 14" fill="none" stroke="${c2}" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M26 26 L22 10 L40 20 L50 18 L60 20 L78 10 L74 26 L70 46 L50 56 L30 46 Z" fill="${c1}" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <polygon points="34,30 46,34 36,38" fill="#fef08a" stroke="#111" stroke-width="1.2"/>
    <polygon points="66,30 54,34 64,38" fill="#fef08a" stroke="#111" stroke-width="1.2"/>
    <line x1="40" y1="31" x2="40" y2="37" stroke="#111" stroke-width="1.6"/>
    <line x1="60" y1="31" x2="60" y2="37" stroke="#111" stroke-width="1.6"/>
    <path d="M28 41 L36 42 M29 45 L37 45 M72 41 L64 42 M71 45 L63 45" stroke="#111" stroke-width="1.5" stroke-linecap="round"/>`,

  // 118: Ba Tiêu Phiến — Treasured Tool Bashōsen giant palm fan radiating elements
  118: (_c1, c2) => `
    <path d="M50 50 C28 48, 22 30, 32 16 C40 10, 60 10, 68 16 C78 30, 72 48, 50 50 Z" fill="#b45309" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M50 50 L50 14 M50 42 L34 24 M50 42 L66 24 M50 32 L30 34 M50 32 L70 34" stroke="#111" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="50" y1="49" x2="50" y2="59" stroke="#fef3c7" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="22" cy="18" r="2.8" fill="#ff5a1f"/><circle cx="78" cy="18" r="2.8" fill="#38bdf8"/>
    <circle cx="20" cy="40" r="2.8" fill="#fde047"/><circle cx="80" cy="40" r="2.8" fill="#4ade80"/>`,

  // 119: Hồng Hồ Lô — Benihisago Crimson Sealing Gourd with sacred white rope
  119: (_c1, c2) => `
    <path d="M44 13 L56 13 L54 19 C60 21, 61 28, 56 32 C64 36, 65 48, 59 54 C54 58, 46 58, 41 54 C35 48, 36 36, 44 32 C39 28, 40 21, 46 19 Z" fill="#b91c1c" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M42 32 Q50 35 58 32" fill="none" stroke="#fef3c7" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M44 13 Q50 9 56 13" fill="none" stroke="#fde047" stroke-width="2"/>
    <path d="M50 11 C46 5, 58 5, 68 12" fill="none" stroke="#c084fc" stroke-width="2" stroke-linecap="round"/>`,

  // 120: Dầu Cóc — high-pressure amber Toad Oil Bullet splash
  120: (c1, c2) => `
    <path d="M16 42 C28 36, 38 22, 54 22 C66 22, 74 30, 72 40 C70 50, 56 54, 44 50 C34 46, 26 48, 16 42 Z" fill="#92400e" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M38 30 C46 26, 58 27, 62 34" fill="none" stroke="#fde68a" stroke-width="2" stroke-linecap="round"/>
    <circle cx="76" cy="22" r="3.5" fill="${c1}" stroke="${c2}" stroke-width="1.3"/>
    <circle cx="82" cy="36" r="2.8" fill="#b45309" stroke="${c2}" stroke-width="1.2"/>
    <circle cx="68" cy="52" r="3" fill="#92400e" stroke="${c2}" stroke-width="1.2"/>`,

  // 121: Triệu Hồi Gamabunta — Chief Toad Gamabunta with eye scar & smoking pipe
  121: (c1, c2) => `
    <path d="M24 38 C24 22, 36 16, 50 16 C64 16, 76 22, 76 38 C76 50, 64 55, 50 55 C36 55, 24 50, 24 38 Z" fill="${c1}" stroke="${c2}" stroke-width="2"/>
    <circle cx="38" cy="27" r="6" fill="#fde047" stroke="#111" stroke-width="1.5"/>
    <circle cx="62" cy="27" r="6" fill="#fde047" stroke="#111" stroke-width="1.5"/>
    <rect x="34" y="25.5" width="8" height="3" fill="#111"/>
    <rect x="58" y="25.5" width="8" height="3" fill="#111"/>
    <line x1="35" y1="19" x2="42" y2="35" stroke="#111" stroke-width="1.8"/>
    <path d="M35 44 Q50 48 65 44" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round"/>
    <line x1="60" y1="45" x2="82" y2="49" stroke="#e2e8f0" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="82" cy="43" r="3" fill="#f8fafc" opacity="0.8"/>`,

  // 122: Tiên Pháp: Goemon — Jiraiya's catastrophic tidal inferno of boiling oil & fire
  122: (c1, c2) => `
    <path d="M10 56 C16 32, 30 14, 44 24 C48 12, 60 10, 68 22 C78 16, 86 28, 90 56 Z" fill="#991b1b" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M18 56 C24 36, 36 24, 48 32 C54 20, 66 22, 78 56 Z" fill="${c1}" stroke="#fde047" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M30 56 C36 42, 46 36, 52 44 C58 36, 66 42, 70 56 Z" fill="#fde047"/>
    <path d="M18 22 Q34 16 46 22 M64 16 Q76 12 86 18" fill="none" stroke="#fde047" stroke-width="1.6" stroke-linecap="round"/>`,

  // 123: Trùng Độc — venomous Aburame beetles with glowing toxic droplets
  123: (c1, c2) => `
    <ellipse cx="50" cy="37" rx="11" ry="15" fill="#4c1d95" stroke="${c2}" stroke-width="2"/>
    <path d="M39 30 C25 22, 23 44, 39 42 M61 30 C75 22, 77 44, 61 42" fill="${c1}" stroke="${c2}" stroke-width="1.6"/>
    <line x1="50" y1="24" x2="50" y2="51" stroke="#111" stroke-width="1.6"/>
    <path d="M45 22 L40 14 M55 22 L60 14" stroke="${c2}" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="24" cy="18" r="3" fill="#a3e635" stroke="#111" stroke-width="1"/>
    <circle cx="76" cy="18" r="3" fill="#a3e635" stroke="#111" stroke-width="1"/>
    <circle cx="74" cy="52" r="2.5" fill="#c084fc"/>`,

  // 124: Ký Sinh Trùng — Parasitic Kikaichū beetle draining chakra rings
  124: (c1, c2) => `
    <circle cx="50" cy="36" r="22" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="5 3"/>
    <ellipse cx="50" cy="36" rx="10" ry="14" fill="${c1}" stroke="${c2}" stroke-width="2"/>
    <path d="M40 31 L28 24 M40 38 L26 38 M40 44 L29 50 M60 31 L72 24 M60 38 L74 38 M60 44 L71 50" stroke="${c2}" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="50" y1="24" x2="50" y2="49" stroke="#111" stroke-width="1.6"/>
    <circle cx="50" cy="36" r="4" fill="#38bdf8" stroke="#fff" stroke-width="1.2"/>`,

  // 125: Trùng Bám Đuổi — target reticle locked around glowing tracking beetle
  125: (c1, c2) => `
    <circle cx="50" cy="34" r="21" fill="none" stroke="${c2}" stroke-width="1.8"/>
    <path d="M50 8 L50 18 M50 50 L50 60 M24 34 L34 34 M66 34 L76 34" stroke="${c2}" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="50" cy="35" rx="8" ry="11" fill="${c1}" stroke="#fff" stroke-width="1.7"/>
    <path d="M46 24 L42 18 M54 24 L58 18" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="50" cy="35" r="3" fill="#bef264"/>`,

  // 126: Trùng Vũ — swirling spherical Aburame insect swarm hive
  126: (c1, c2) => `
    <circle cx="50" cy="34" r="22" fill="${c1}55" stroke="${c2}" stroke-width="2" stroke-dasharray="7 3"/>
    <circle cx="50" cy="34" r="13" fill="none" stroke="${c2}" stroke-width="1.4" stroke-dasharray="4 3"/>
    <g fill="#111" stroke="${c2}" stroke-width="1.1">
      <ellipse cx="50" cy="34" rx="4.5" ry="6"/>
      <ellipse cx="34" cy="24" rx="3.2" ry="4.5" transform="rotate(-30 34 24)"/>
      <ellipse cx="66" cy="24" rx="3.2" ry="4.5" transform="rotate(30 66 24)"/>
      <ellipse cx="32" cy="44" rx="3.2" ry="4.5" transform="rotate(35 32 44)"/>
      <ellipse cx="68" cy="44" rx="3.2" ry="4.5" transform="rotate(-35 68 44)"/>
      <ellipse cx="50" cy="17" rx="3" ry="4"/>
      <ellipse cx="50" cy="51" rx="3" ry="4"/>
    </g>`,

  // 127: Bí Thuật: Trùng Bạo — explosive radial Aburame insect swarm burst
  127: (c1, c2) => `
    <path d="M50 34 L22 14 M50 34 L78 14 M50 34 L16 34 M50 34 L84 34 M50 34 L22 54 M50 34 L78 54 M50 34 L50 10 M50 34 L50 58" stroke="${c2}" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="50" cy="34" r="12" fill="${c1}" stroke="#fff" stroke-width="2"/>
    <g fill="#111" stroke="${c2}" stroke-width="1.2">
      <circle cx="24" cy="16" r="3.5"/><circle cx="76" cy="16" r="3.5"/>
      <circle cx="19" cy="34" r="3.5"/><circle cx="81" cy="34" r="3.5"/>
      <circle cx="24" cy="52" r="3.5"/><circle cx="76" cy="52" r="3.5"/>
    </g>
    <circle cx="50" cy="34" r="5" fill="#bef264"/>`,

  // 128: Phong Nhận — razor-sharp glowing emerald crescent Wind Blade
  128: (c1, c2) => `
    <path d="M22 48 C26 22, 54 12, 80 18 C62 24, 48 36, 36 52 Z" fill="${c1}" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M27 45 C32 27, 54 18, 74 20" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    <path d="M18 30 L28 24 M58 48 L72 40" stroke="${c2}" stroke-width="1.6" stroke-linecap="round"/>`,

  // 129: Đại Liêm Phong — Temari war fan with 3 purple moons unleashing triple wind-razors
  129: (_c1, c2) => `
    <path d="M40 54 L16 26 A30 30 0 0 1 64 26 Z" fill="#1e293b" stroke="${c2}" stroke-width="1.9" stroke-linejoin="round"/>
    <circle cx="30" cy="30" r="3" fill="#a855f7"/><circle cx="40" cy="26" r="3" fill="#a855f7"/><circle cx="50" cy="30" r="3" fill="#a855f7"/>
    <path d="M62 20 Q76 18 84 26 M64 32 Q78 30 86 38 M58 44 Q74 44 82 52" fill="none" stroke="${c2}" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M64 26 Q75 24 82 31 M62 38 Q74 38 80 44" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>`,

  // 130: Phong Độn: Cuồng Phong — towering roaring emerald funnel tornado
  130: (c1, c2) => `
    <path d="M20 15 C36 11, 64 11, 80 15 L62 42 L50 58 L38 42 Z" fill="${c1}88" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>
    <ellipse cx="50" cy="16" rx="28" ry="5" fill="none" stroke="#fff" stroke-width="1.8"/>
    <ellipse cx="50" cy="28" rx="20" ry="4" fill="none" stroke="${c2}" stroke-width="1.8"/>
    <ellipse cx="50" cy="40" rx="12" ry="3.2" fill="none" stroke="#fff" stroke-width="1.8"/>
    <ellipse cx="50" cy="50" rx="6" ry="2.2" fill="none" stroke="${c2}" stroke-width="1.6"/>`,

  // 131: Triệu Hồi Kamatari — one-eyed white weasel with giant crescent steel scythe
  131: (_c1, c2) => `
    <path d="M20 52 C28 18, 56 12, 82 22 C66 24, 52 34, 46 46 Z" fill="#cbd5e1" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/>
    <line x1="28" y1="54" x2="68" y2="20" stroke="#92400e" stroke-width="3" stroke-linecap="round"/>
    <circle cx="54" cy="41" r="11" fill="#f8fafc" stroke="${c2}" stroke-width="1.8"/>
    <polygon points="46,32 43,23 51,30" fill="#f8fafc" stroke="#111" stroke-width="1.2"/>
    <polygon points="62,32 65,23 57,30" fill="#f8fafc" stroke="#111" stroke-width="1.2"/>
    <path d="M46 39 L53 41 M57 39 L61 39" stroke="#111" stroke-width="2" stroke-linecap="round"/>
    <circle cx="59" cy="41" r="1.5" fill="#dc2626"/>`,

  // 132: Tam Đại Phong Ảnh — Temari's giant unfolded iron fan displaying 3 purple moons
  132: (c1, c2) => `
    <path d="M50 56 L14 24 A44 44 0 0 1 86 24 Z" fill="#1e293b" stroke="${c2}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M50 56 L30 16 M50 56 L50 12 M50 56 L70 16" stroke="${c1}" stroke-width="1.4"/>
    <circle cx="33" cy="27" r="5.5" fill="#9333ea" stroke="#e9d5ff" stroke-width="1.5"/>
    <circle cx="50" cy="22" r="6" fill="#9333ea" stroke="#e9d5ff" stroke-width="1.5"/>
    <circle cx="67" cy="27" r="5.5" fill="#9333ea" stroke="#e9d5ff" stroke-width="1.5"/>
    <circle cx="50" cy="54" r="3.5" fill="${c2}"/>`,

  // 133: Chú Ấn — Orochimaru's Cursed Seal of Heaven (3 iconic curved black tomoe)
  133: (_c1, _c2) => `
    <circle cx="50" cy="34" r="22" fill="#4c1d95" stroke="#c084fc" stroke-width="2"/>
    <circle cx="50" cy="34" r="15" fill="#7c3aed" fill-opacity="0.45" stroke="#e9d5ff" stroke-width="1.2" stroke-dasharray="4 3"/>
    <g fill="#111" stroke="#e9d5ff" stroke-width="1.1">
      <path d="M50 26 C55 26, 57 20, 52 17 C48 15, 44 19, 46 23 C47 25, 49 26, 50 26 Z"/>
      <path d="M50 26 C55 26, 57 20, 52 17 C48 15, 44 19, 46 23 C47 25, 49 26, 50 26 Z" transform="rotate(120 50 34)"/>
      <path d="M50 26 C55 26, 57 20, 52 17 C48 15, 44 19, 46 23 C47 25, 49 26, 50 26 Z" transform="rotate(240 50 34)"/>
    </g>
    <circle cx="50" cy="34" r="3.2" fill="#111" stroke="#f87171" stroke-width="1.4"/>`,

  // 134: Thủy Độn: Thủy Giao Đạn Thuật — Kisame's giant Great Shark Bullet absorbing chakra
  134: (c1, c2) => `
    <path d="M16 34 C28 18, 56 14, 84 32 C68 48, 34 52, 16 34 Z" fill="${c1}" stroke="${c2}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M46 19 L58 9 L60 20 M24 34 L14 22 L18 34 L14 46 Z" fill="${c2}" stroke="#111" stroke-width="1.3" stroke-linejoin="round"/>
    <polygon points="56,33 82,32 62,43" fill="#0f172a" stroke="#e0f2fe" stroke-width="1.3"/>
    <path d="M62 34 L65 38 L69 34 L73 37" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="67" cy="26" r="2.2" fill="#fff"/>`,

  // 135: Nghệ Thuật: Đất Sét Nổ — Deidara's open palm with grinning clay-chewing mouth
  135: (c1, c2) => `
    <circle cx="50" cy="34" r="22" fill="#7c2d12" stroke="${c2}" stroke-width="2"/>
    <path d="M36 52 L36 30 C36 27, 40 27, 40 30 L40 20 C40 17, 44 17, 44 20 L44 17 C44 14, 49 14, 49 17 L49 20 C49 17, 54 17, 54 20 L54 26 C54 23, 59 23, 59 27 L59 48 C59 53, 36 55, 36 52 Z" fill="#fed7aa" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M40 36 Q48 44 56 36 Q48 32 40 36 Z" fill="#991b1b" stroke="#111" stroke-width="1.4"/>
    <path d="M44 37 L46 41 L50 37 L53 40" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>
    <circle cx="24" cy="22" r="2.5" fill="${c1}"/><circle cx="76" cy="24" r="2.5" fill="#fde047"/>`,

  // 136: Nghệ Thuật Chân Chính: Tự Bạo C0 — Deidara's ultimate C0 supernova starburst
  136: (c1, c2) => `
    <polygon points="50,7 55,22 70,12 62,27 80,26 65,35 80,44 62,43 70,56 55,46 50,61 45,46 30,56 38,43 20,44 35,35 20,26 38,27 30,12 45,22" fill="${c1}" stroke="${c2}" stroke-width="1.8" stroke-linejoin="round"/>
    <circle cx="50" cy="34" r="12" fill="#fef08a" stroke="#fff" stroke-width="2"/>
    <path d="M44 32 L47 34 M56 32 L53 34 M44 38 Q50 42 56 38" stroke="#111" stroke-width="1.6" stroke-linecap="round"/>`,

  // 137: Bí Thuật: Bách Cơ Thao Diễn — Puppet Reincarnation blue chakra threads & glowing life core
  137: (_c1, c2) => `
    <path d="M30 8 L44 26 M50 6 L50 22 M70 8 L56 26 M24 14 L38 36 M76 14 L62 36" stroke="#38bdf8" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="50" cy="24" r="7" fill="#292524" stroke="${c2}" stroke-width="1.8"/>
    <path d="M36 56 L42 33 L58 33 L64 56 Z" fill="#44403c" stroke="${c2}" stroke-width="1.8" stroke-linejoin="round"/>
    <circle cx="50" cy="43" r="5.5" fill="#38bdf8" stroke="#fff" stroke-width="1.6"/>
    <circle cx="47.5" cy="24" r="1.4" fill="#38bdf8"/><circle cx="52.5" cy="24" r="1.4" fill="#38bdf8"/>`,

  // 138: Sa Chiến: Sa Mạc Bảo Hộ — Gaara's hardened Shukaku Shield sand bastion
  138: (_c1, c2) => `
    <path d="M26 18 L50 11 L74 18 L70 44 L50 57 L30 44 Z" fill="#b45309" stroke="${c2}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M33 23 L50 18 L67 23 L64 41 L50 50 L36 41 Z" fill="#d6b485" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/>
    <circle cx="43" cy="31" r="3" fill="#111"/><circle cx="57" cy="31" r="3" fill="#111"/>
    <circle cx="43" cy="31" r="1.7" fill="#facc15"/><circle cx="57" cy="31" r="1.7" fill="#facc15"/>
    <path d="M39 40 Q50 45 61 40" fill="none" stroke="#312e81" stroke-width="2" stroke-linecap="round"/>`,
};

function fallbackMotifSvg(c1, c2) {
  return `
    <circle cx="50" cy="34" r="20" fill="${c1}66" stroke="${c2}" stroke-width="2"/>
    <path d="M38 34 L50 20 L62 34 L50 48 Z" fill="${c2}"/>`;
}

let artUid = 0;

export function cardArtSvg(c) {
  const [c1, c2] = getPalette(c);
  const gid = `g_${c.id}_${++artUid}`;

  if (EXCLUDED_SHARINGAN_IDS.has(c.id)) {
    return `<svg class="cd-art" viewBox="0 0 100 68" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c1}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="${c2}" stop-opacity="0.12"/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="96" height="64" rx="7" fill="url(#${gid})" stroke="${c2}" stroke-opacity="0.45"/>
    ${sharinganOriginalSvg(c2)}
  </svg>`;
  }

  const renderer = CARD_ART_BY_ID[c.id];
  const motif = renderer ? renderer(c1, c2, gid) : fallbackMotifSvg(c1, c2);

  return `<svg class="cd-art" viewBox="0 0 100 68" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c1}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="${c2}" stop-opacity="0.12"/>
      </linearGradient>
      <clipPath id="${gid}_c">
        <rect x="3" y="3" width="94" height="62" rx="6"/>
      </clipPath>
    </defs>
    <rect x="2" y="2" width="96" height="64" rx="7" fill="url(#${gid})" stroke="${c2}" stroke-opacity="0.45"/>
    <g clip-path="url(#${gid}_c)">${motif}</g>
  </svg>`;
}
