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
};

function getPalette(c) {
  if (c.el && EL_COLORS[c.el]) return EL_COLORS[c.el];
  return CLAN_COLORS[c.s] || CLAN_COLORS.thường;
}

function motifSvg(c, c1, c2) {
  const n = c.n;
  if (c.s === 'rinnegan') {
    return `
      <circle cx="50" cy="36" r="24" fill="${c2}33" stroke="${c2}" stroke-width="2"/>
      <circle cx="50" cy="36" r="18" fill="none" stroke="${c2}" stroke-width="1.6"/>
      <circle cx="50" cy="36" r="12" fill="none" stroke="${c2}" stroke-width="1.6"/>
      <circle cx="50" cy="36" r="6" fill="none" stroke="${c2}" stroke-width="1.6"/>
      <circle cx="50" cy="36" r="2.5" fill="#fff"/>`;
  }
  if (c.s === 'uchiha' || c.s === 'mangakyo') {
    if (n.includes('susanoo')) {
      return `
        <path d="M24 58 L32 20 L50 12 L68 20 L76 58 Z" fill="${c2}33" stroke="${c2}" stroke-width="2"/>
        <path d="M36 32 L45 36 L38 42 Z M64 32 L55 36 L62 42 Z" fill="#fff"/>
        <path d="M40 50 L50 44 L60 50" fill="none" stroke="${c2}" stroke-width="2"/>`;
    }
    return `
      <circle cx="50" cy="36" r="22" fill="#900" stroke="${c2}" stroke-width="2"/>
      <circle cx="50" cy="36" r="13" fill="none" stroke="#111" stroke-width="1.5"/>
      <circle cx="50" cy="36" r="4" fill="#111"/>
      <circle cx="50" cy="23" r="3.2" fill="#111"/>
      <circle cx="61" cy="43" r="3.2" fill="#111"/>
      <circle cx="39" cy="43" r="3.2" fill="#111"/>`;
  }
  if (c.s === 'hyuga') {
    return `
      <circle cx="50" cy="36" r="22" fill="${c2}22" stroke="${c2}" stroke-width="2"/>
      <circle cx="50" cy="36" r="13" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="4 3"/>
      <path d="M22 36 L34 36 M66 36 L78 36 M50 10 L50 20 M50 52 L50 62" stroke="#fff" stroke-width="1.6"/>
      <circle cx="50" cy="36" r="4" fill="#fff"/>`;
  }
  if (c.el === 'hỏa' || n.includes('bom')) {
    return `
      <path d="M50 10 C62 24, 70 34, 64 48 C60 57, 40 57, 36 48 C30 34, 38 24, 50 10 Z" fill="${c1}" stroke="${c2}" stroke-width="2"/>
      <path d="M50 24 C56 32, 58 40, 54 47 C51 51, 49 51, 46 47 C42 40, 44 32, 50 24 Z" fill="${c2}"/>`;
  }
  if (c.el === 'thủy' || c.s === 'cá mập và sóng') {
    return `
      <path d="M18 46 Q34 22 50 38 T82 34 L82 58 L18 58 Z" fill="${c1}99" stroke="${c2}" stroke-width="2"/>
      <path d="M24 52 Q44 36 62 48 T80 46" fill="none" stroke="#fff" stroke-width="1.8"/>`;
  }
  if (c.el === 'lôi') {
    return `
      <polygon points="54,10 34,38 48,38 42,62 66,32 52,32" fill="${c2}" stroke="#fff" stroke-width="1.5"/>`;
  }
  if (c.el === 'phong' || n.includes('rasengan')) {
    return `
      <circle cx="50" cy="36" r="20" fill="${c2}33" stroke="${c2}" stroke-width="2"/>
      <path d="M50 16 A20 20 0 0 1 70 36 M50 24 A12 12 0 0 1 62 36 M30 36 A20 20 0 0 1 50 16" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      <circle cx="50" cy="36" r="5" fill="#fff"/>`;
  }
  if (c.s === 'nhẫn cụ') {
    return `
      <path d="M50 12 L56 28 L72 34 L56 40 L50 56 L44 40 L28 34 L44 28 Z" fill="${c2}" stroke="#fff" stroke-width="1.5"/>
      <circle cx="50" cy="34" r="4" fill="#1c212d"/>`;
  }
  if (c.s === 'nghệ thuật rối') {
    return `
      <rect x="35" y="18" width="30" height="36" rx="8" fill="${c1}" stroke="${c2}" stroke-width="2"/>
      <circle cx="44" cy="32" r="3" fill="#fff"/><circle cx="56" cy="32" r="3" fill="#fff"/>
      <path d="M42 44 L58 44 M46 41 L46 47 M50 41 L50 47 M54 41 L54 47" stroke="#fff" stroke-width="1.5"/>`;
  }
  if (c.pet) {
    return `
      <circle cx="50" cy="36" r="22" fill="none" stroke="${c2}" stroke-width="2" stroke-dasharray="5 3"/>
      <polygon points="50,18 65,48 35,48" fill="${c2}55" stroke="#fff" stroke-width="1.8"/>`;
  }
  if (c.ar) {
    return `
      <path d="M30 18 L50 12 L70 18 L66 44 L50 58 L34 44 Z" fill="${c1}99" stroke="${c2}" stroke-width="2"/>
      <path d="M50 16 L50 54" stroke="#fff" stroke-width="1.5" opacity=".7"/>`;
  }
  return `
    <circle cx="50" cy="36" r="20" fill="${c1}66" stroke="${c2}" stroke-width="2"/>
    <path d="M38 36 L50 22 L62 36 L50 50 Z" fill="${c2}"/>`;
}

let artUid = 0;

export function cardArtSvg(c) {
  const [c1, c2] = getPalette(c);
  const gid = `g_${c.id}_${++artUid}`;
  return `<svg class="cd-art" viewBox="0 0 100 68" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c1}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="${c2}" stop-opacity="0.12"/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="96" height="64" rx="7" fill="url(#${gid})" stroke="${c2}" stroke-opacity="0.45"/>
    ${motifSvg(c, c1, c2)}
  </svg>`;
}
