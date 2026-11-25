import {
  CARDS,
  describeCard,
  TYPE_LABELS,
  REACTIONS,
  getCardTitle,
  isSameJpViName,
  normalizeSearchText,
} from '/shared/cards.js';
import {
  isValidTarget,
  TEAM_NAMES,
  EDO_HP,
  previewReaction,
  calcExpectedDamage,
  totalArmor,
  getCardMaxAge,
} from '/shared/engine.js';
import { cardArtSvg, CARD_IMAGE_IDS } from './cardArt.js';

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const ECOL = {
  hỏa: '#ff5a1f',
  thủy: '#2a8cff',
  lôi: '#c9a300',
  phong: '#27b866',
};

export const RCOL = {
  C: '#6b7280',
  B: '#2563eb',
  A: '#7c3aed',
  S: '#d97706',
};

export const EL_BADGE = {
  hỏa: 'Hỏa',
  thủy: 'Thủy',
  lôi: 'Lôi',
  phong: 'Phong',
};

export const KONOHA_CREST_SVG = `<svg class="konoha-crest" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M5 24.5 L12 24.5 C10.5 21 10.8 14.5 16.5 11.2 C21.8 8.2 28.5 11.2 28.8 17.5 C29.1 22.8 24.5 26.8 19.2 26.2 C15 25.7 13 22 14.2 18.2 C15.2 15.2 18.6 14 21.4 15.5 C23.6 16.7 24.2 19.6 22.5 21.5 C21 23.1 18.4 22.8 17.8 20.8 C17.3 19.2 18.6 18 19.8 18.6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M23.5 11 L29.5 6.5 L26.5 14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const AKATSUKI_CLOUD_SVG = `<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M9 23.5 C6 23.5 4.5 21 5.2 18.5 C5.8 16.2 8 15.2 10 15.8 C10.8 12.2 14.4 10 18.2 11 C20.4 11.5 22 13 22.8 14.8 C24.8 13.8 27.6 14.4 29.2 16.3 C31.2 18.7 30.2 23.5 26.5 23.5 Z" fill="#dc2626" stroke="#fef2f2" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M13.5 19.2 C14.5 17.6 16.8 17.6 17.6 19.2 C18.2 20.4 17 21.6 15.8 21.2" stroke="#fef2f2" stroke-width="1.4" stroke-linecap="round"/>
  <path d="M22.5 18.2 C23.8 17.2 25.8 17.8 26 19.4" stroke="#fef2f2" stroke-width="1.4" stroke-linecap="round"/>
</svg>`;

export const ARENA_SEAL_SVG = `<svg class="arena-seal" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="160" cy="160" r="148" stroke="currentColor" stroke-width="2.2" stroke-dasharray="14 8"/>
  <circle cx="160" cy="160" r="134" stroke="currentColor" stroke-width="1.4"/>
  <circle cx="160" cy="160" r="96" stroke="currentColor" stroke-width="1.6" stroke-dasharray="6 6"/>
  <circle cx="160" cy="160" r="46" stroke="currentColor" stroke-width="1.8"/>
  <polygon points="160,26 276,227 44,227" stroke="currentColor" stroke-width="1.2" opacity="0.55"/>
  <polygon points="160,294 276,93 44,93" stroke="currentColor" stroke-width="1.2" opacity="0.55"/>
  <g fill="currentColor" font-family="'Yuji Syuku','Noto Serif JP',serif" font-size="18" text-anchor="middle" dominant-baseline="central">
    <text x="160" y="42">火</text>
    <text x="278" y="160">風</text>
    <text x="160" y="278">水</text>
    <text x="42" y="160">雷</text>
    <text x="160" y="162" font-size="34" opacity="0.8">封</text>
  </g>
</svg>`;

function renderSeatEmblem(G, p) {
  if (G.teams && p.team === 0) {
    return `<span class="seat-crest" style="color:#fca5a5;border-color:rgba(220,38,38,.55)" title="Phe Đỏ (Akatsuki)">${AKATSUKI_CLOUD_SVG}</span>`;
  }
  if (G.teams && p.team === 1) {
    return `<span class="seat-crest" style="color:#93c5fd;border-color:rgba(37,99,235,.55)" title="Phe Xanh (Liên Minh Shinobi)">${KONOHA_CREST_SVG}</span>`;
  }
  return `<span class="seat-crest" title="Shinobi Làng Lá">${KONOHA_CREST_SVG}</span>`;
}

function renderChakraBar(sp, handCount) {
  const clamped = Math.max(0, Math.min(10, Number(sp) || 0));
  let pips = '';
  for (let k = 0; k < 10; k++) {
    pips += `<span class="sp-pip ${k < clamped ? 'on' : ''}"></span>`;
  }
  return `
    <div class="chakra-row">
      <div class="sp-bar ${clamped <= 2 ? 'is-low' : ''}" title="Chakra: ${clamped}/10">${pips}</div>
      <div class="chakra-meta">
        <span>CK ${clamped}/10</span>
        <span class="hand-pill">${handCount} lá</span>
      </div>
    </div>`;
}

export function getCardFoilInfo(c) {
  if (c.r === 'S' && (c.s === 'mangakyo' || c.s === 'rinnegan')) {
    return { rarity: 'rare rainbow', label: 'Huyền Thoại Rainbow Holo', pillCls: 'foil-rainbow' };
  }
  if (c.r === 'S') {
    return { rarity: 'rare secret', label: 'Bí Truyền Gold Secret', pillCls: 'foil-S' };
  }
  if (c.r === 'A') {
    return { rarity: 'radiant rare', label: 'Radiant Diamond Holo', pillCls: 'foil-A' };
  }
  if (c.r === 'B') {
    return { rarity: 'rare holo', label: 'Regular Scanline Holo', pillCls: 'foil-B' };
  }
  return { rarity: 'basic', label: 'Glossy Foil', pillCls: 'foil-C' };
}

function renderCardBackHtml() {
  return `
    <div class="cd-back">
      <div class="cd-back-ring">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#fde68a" stroke-width="3" stroke-dasharray="6 4"/>
          <path d="M50 18 C72 18 82 36 74 54 C67 70 48 76 34 66 C22 57 22 40 34 32 C44 26 56 32 58 43 C60 52 51 58 44 54 C39 51 41 44 47 45" fill="none" stroke="#fde68a" stroke-width="5" stroke-linecap="round"/>
          <circle cx="50" cy="50" r="4.5" fill="#f59e0b"/>
        </svg>
      </div>
      <div class="cd-back-title">Nhẫn Quyển</div>
      <div class="cd-back-sub">Shinobi Scroll</div>
    </div>`;
}

export function renderCard(
  c,
  i,
  {
    selected = false,
    dim = false,
    interactive = true,
    hotkey = null,
    inspectable = false,
    holoMode = null,
    includeBack = false,
    flipped = false,
    isInspector = false,
  } = {}
) {
  const foil = getCardFoilInfo(c);
  const mode = holoMode || (isInspector ? 'inspector' : interactive ? 'hand' : 'codex');
  const elTag = c.el ? `<span class="el-tag el-${c.el}">${EL_BADGE[c.el]}</span>` : '';
  const rem = getCardMaxAge(c) - (c.age || 0);
  const ageTag =
    interactive && !c.au
      ? `<span class="age-tag ${rem <= 1 ? 'age-warn' : ''}" title="Còn ${rem} lượt trước khi tự hủy">${rem}L</span>`
      : '';
  const hkTag = interactive && hotkey ? `<span class="hk-tag" title="Phím tắt ${hotkey}">${hotkey}</span>` : '';
  const clickAttr = interactive
    ? `onclick="appActions.pickCard(${i})" oncontextmenu="event.preventDefault();appActions.inspectCard(${c.id}, false)"`
    : inspectable
      ? `onclick="appActions.inspectCard(${c.id}, true)"`
      : isInspector
        ? `onclick="appActions.toggleInspectFlip()"`
        : '';
  const zoomBtn = interactive
    ? `<button type="button" class="cd-zoom-btn" title="Phóng to & xoay thẻ 3D (hoặc chuột phải)" onclick="event.stopPropagation();appActions.inspectCard(${c.id}, false)">3D</button>`
    : '';

  const titleJp = getCardTitle(c);
  const subParts = [];
  if (c.kj) subParts.push(`<span class="cd-kj">${esc(c.kj)}</span>`);
  if (c.n && !isSameJpViName(c)) subParts.push(`<span class="cd-vi">${esc(c.n)}</span>`);
  const subHtml = subParts.length ? `<div class="cd-sub">${subParts.join(' · ')}</div>` : '';
  const tooltipText = `${titleJp}${c.kj ? ` (${c.kj})` : ''}${!isSameJpViName(c) ? ` — ${c.n}` : ''}: ${describeCard(c)}`;

  return `
    <div class="cd cd-holo ${c.r} ${c.au ? 'au' : ''} ${selected ? 'sel' : ''} ${dim ? 'dim' : ''} ${
    isInspector ? 'is-inspector' : ''
  } ${flipped ? 'is-flipped' : ''}"
         data-card-idx="${i}"
         data-card-id="${c.id}"
         data-rarity="${foil.rarity}"
         data-el="${c.el || ''}"
         data-clan="${esc(c.s)}"
         data-holo-mode="${mode}"
         ${clickAttr}
         title="${esc(tooltipText)}">
      <div class="cd-rotator">
        <div class="cd-flipper">
          <div class="cd-front">
            <div class="cd-top">
              <div class="cd-left-tags"><span class="rk rk-${c.r}">${c.r}</span>${hkTag}</div>
              <div class="cd-badges">${ageTag}${elTag}</div>
            </div>
            ${cardArtSvg(c)}
            <b class="cd-name">${esc(titleJp)}</b>
            ${subHtml}
            <small class="cd-meta">${TYPE_LABELS[c.t] || c.t} · ${esc(c.s)}</small>
            <div class="cd-desc">${esc(describeCard(c))}</div>
            ${c.au ? '<div class="cd-au">Tự kích hoạt</div>' : ''}
            ${zoomBtn}
            <div class="cd__shine"></div>
            <div class="cd__glare"></div>
          </div>
          ${includeBack ? renderCardBackHtml() : ''}
        </div>
      </div>
    </div>`;
}

function renderChips(p, showSecret) {
  const bad = [
    ...p.marks.map((e) => [`ấn ${e}`, 'Ấn nguyên tố: thêm 1 ấn nữa sẽ gây phản ứng']),
    p.bleed ? [`chảy máu ${p.bleed > 1e9 ? '∞' : p.bleed}`, 'Mất 50 máu đầu mỗi lượt, bỏ qua giáp và pet'] : null,
    p.stun ? ['choáng', 'Mất lượt kế tiếp, không rút bài, vẫn chịu sát thương'] : null,
    p.bugMark ? [`trùng bám -${p.bugMark.dmg} · ${p.bugMark.t}L`, 'Mỗi lần dùng thẻ sẽ nhận thêm sát thương trực tiếp'] : null,
    p.koto ? [`koto · ${p.koto.t}L`, 'Bị Kotoamatsukami điều khiển tấn công đồng đội'] : null,
  ].filter(Boolean);

  const auCount = showSecret ? p.hand.filter((c) => c.au).length : 0;
  const good = [
    ...p.buffs.map((b) => [
      `${b.n}${b.m ? ' +' + Math.round(b.m * 100) + '%' : ''}${b.stacks ? ` ×${b.stacks}` : ''}${b.t < 90 ? ` · ${b.t}L` : ''}`,
      'Trạng thái chủ động',
    ]),
    p.stealth ? [`ẩn thân · ${p.stealth}L`, 'Không thể bị chọn làm mục tiêu đơn'] : null,
    p.immune ? [`miễn nhiễm · ${p.immune}L`, 'Miễn nhiễm hiệu ứng xấu'] : null,
    p.edo ? ['Uế Thổ (-50% dmg)', 'Thi thể bất tử, có thể bị Kim Sa Ấn tiêu diệt'] : null,
    p.puppetMaster ? [`Rối (${p.puppetMaster})`, 'Con rối 500 máu (-50% dmg), có thể bị Kim Sa Ấn tiêu diệt'] : null,
    ...(p.tempArmors || []).map((s) => [
      `giáp tạm ${s.amt} · ${s.t}L`,
      `Giáp có thời hạn (${s.t} lượt): chịu sát thương trước giáp vĩnh viễn và tự mất khi hết lượt`,
      'tarmor',
    ]),
    p.armor ? [`giáp ${p.armor}`, 'Giáp không thời hạn: chỉ giảm khi bị tấn công, chịu sát thương sau giáp tạm'] : null,
    showSecret && p.dodge !== null ? [`né ${p.dodge}`, 'Điểm né ẩn: dưới 100 là % né, né xong trừ 100'] : null,
    showSecret && auCount ? [`canh phòng ×${auCount}`, 'Thẻ tự kích hoạt đang trên tay'] : null,
  ].filter(Boolean);

  const mk = (arr, cls) =>
    arr
      .map(
        ([t, d, customCls]) =>
          `<span class="ch ${customCls || cls}" title="${esc(d)}" onclick="event.stopPropagation();appActions.toast('${esc(t)}: ${esc(d)}')">${esc(t)}</span>`
      )
      .join('') || '<span class="ch-empty">—</span>';

  return {
    bad,
    html: `
      <div class="rw"><i>Xấu</i>${mk(bad, 'bad')}</div>
      <div class="rw"><i>Lợi</i>${mk(good, 'good')}</div>`,
  };
}

function renderSidePets(pets) {
  if (!Array.isArray(pets) || pets.length === 0) return '';
  return `<div class="seat-pets">
    ${pets
      .map((q) => {
        const pct = Math.max(0, Math.min(100, (q.hp / (q.mx || 1)) * 100));
        const hasImg = q.cardId != null && CARD_IMAGE_IDS.has(q.cardId);
        const title = `${q.name ? q.name + ' · ' : ''}HP ${q.hp}/${q.mx} · Đánh ${q.atk} mỗi hit`;
        return `
          <div class="pet-unit" title="${esc(title)}">
            <div class="pet-hp">
              <i style="width:${pct}%"></i>
              <span>${q.hp}</span>
            </div>
            <div class="pet-art">
              ${hasImg ? `<img src="/assets/cards/${q.cardId}.webp" alt="" loading="lazy" decoding="async" draggable="false">` : '<span class="pet-fallback">PET</span>'}
            </div>
          </div>`;
      })
      .join('')}
  </div>`;
}

export function renderSeat(G, p, i, cur, showSecret, isMe, flList = []) {
  const selCard = G.sel != null ? cur.hand[G.sel] : null;
  const canTarget = selCard && isValidTarget(G, selCard, i, G.cur);
  const fl = flList.filter((e) => e.t === i);
  const ch = renderChips(p, isMe && showSecret);
  const handCount = p.handCount != null ? p.handCount : p.hand.length;
  const totArmor = totalArmor(p);
  const statusClasses = [
    p.bleed ? 'is-bleed' : '',
    totArmor > 0 ? 'has-armor' : '',
    p.buffs.length ? 'has-buff' : '',
    p.immune > 0 ? 'is-immune' : '',
    p.corpse ? 'is-corpse' : '',
    p.stun > 0 ? 'is-stun' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const orbs = p.marks.map((m) => `<span class="mark-orb orb-${m}" title="Ấn ${m}"></span>`).join('');

  let targetPreviewHtml = '';
  if (canTarget && selCard) {
    const badges = [];
    if (selCard.heal) {
      badges.push(`<span class="tg-badge tg-heal">+${selCard.heal} máu</span>`);
    } else if (selCard.rv) {
      badges.push(
        `<span class="tg-badge tg-heal">${
          selCard.edo ? 'Uế Thổ (∞)' : selCard.puppetRevive ? 'Biến thành rối (500)' : 'Hồi sinh 1000'
        }</span>`
      );
    } else if (selCard.koto) {
      badges.push(`<span class="tg-badge tg-rx">Điều khiển ${selCard.koto} vòng</span>`);
    } else if (selCard.gourdMark) {
      badges.push(`<span class="tg-badge tg-break">Đánh dấu bí mật</span>`);
    } else {
      const est = calcExpectedDamage(G, G.cur, selCard, i);
      if (est.dmg > 0) {
        if (selCard.h) {
          const hitIdx = (G.hl || []).length;
          const hitBase = selCard.h[hitIdx] || 0;
          const hitDmg = Math.round(hitBase * est.mult);
          badges.push(`<span class="tg-badge tg-dmg">Đòn ${hitIdx + 1}: ~${hitDmg}</span>`);
        } else {
          badges.push(
            `<span class="tg-badge ${est.isCrit ? 'tg-crit' : 'tg-dmg'}">${est.isCrit ? 'CHÍ MẠNG' : 'Sát thương'} ~${est.dmg}</span>`
          );
        }
      }
      if (selCard.ba && totArmor > 0) {
        badges.push(`<span class="tg-badge tg-break">Phá ${totArmor} giáp</span>`);
      }
      if (selCard.ds && (p.dead || p.corpse)) {
        badges.push(`<span class="tg-badge tg-crit">Tiêu diệt thi thể</span>`);
      }
      if (selCard.el && p.immune <= 0) {
        const rx = previewReaction(p.marks, selCard.el);
        if (rx) {
          badges.push(`<span class="tg-badge tg-rx" title="${esc(rx.desc)}">${esc(rx.name)}</span>`);
        } else if (p.marks.length === 0) {
          badges.push(`<span class="tg-badge tg-el">${EL_BADGE[selCard.el]}</span>`);
        }
      }
    }
    if (badges.length) {
      targetPreviewHtml = `<div class="tg-preview">${badges.join('')}</div>`;
    }
  }

  const sidePetsHtml = renderSidePets(p.pets);

  return `
    <div class="seat-wrap ${isMe ? 'is-me' : ''}">
    <div class="st ${isMe ? 'me' : ''} ${i === G.cur ? 'cur' : ''} ${p.dead ? 'dead' : ''} ${canTarget ? 'tg' : ''} ${statusClasses} ${
    fl.some((e) => e.c === 'hp') ? 'hit' : ''
  } ${fl.some((e) => e.c === 'ko') ? 'ko-flash' : ''}" data-seat-idx="${i}" onclick="appActions.targetPlayer(${i})">
      ${targetPreviewHtml}
      ${fl
        .map((e, j) => {
          const dx = ((j % 3) - 1) * 38;
          const dy = -Math.floor(j / 3) * 26;
          return `<span class="fl ${e.c}" style="--dx:${dx}px;--dy:${dy}px;animation-delay:${j * 0.28}s">${esc(e.tx)}</span>`;
        })
        .join('')}
      <div class="st-head">
        ${renderSeatEmblem(G, p)}
        <b>${esc(p.name)}${p.bot ? ' (Bot)' : ''}${p.dead ? ' (Hạ gục)' : ''}</b>
        ${G.teams ? `<span class="tm t${p.team}">${TEAM_NAMES[p.team]}</span>` : ''}
        ${orbs ? `<span class="orb-row">${orbs}</span>` : ''}
      </div>
      <div class="hp">
        <b class="hp-lag" style="width:${p.hp >= EDO_HP ? 100 : Math.min(100, (p.hp / 4000) * 100)}%"></b>
        <i style="width:${p.hp >= EDO_HP ? 100 : Math.min(100, (p.hp / 4000) * 100)}%"></i>
        <span>HP ${p.hp >= EDO_HP ? '∞' : `${p.hp} / 4000`}</span>
      </div>
      ${renderChakraBar(p.sp, handCount)}
      ${ch.html}
      ${
        isMe && showSecret
          ? `<div class="sum">
               ${p.destiny?.length ? `<div class="destiny">Định mệnh (×3): <b>${p.destiny.map(esc).join(' · ')}</b></div>` : ''}
               <div>${ch.bad.length ? 'Đang dính: ' + ch.bad.map((x) => esc(x[0])).join(', ') : 'Trạng thái ổn định'}</div>
             </div>`
          : ''
      }
    </div>
    ${sidePetsHtml}
    </div>`;
}

function formatInline(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\$\\rightarrow\$/g, '→');
}

function formatRulebookText(raw) {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  let html = '';
  let inList = false;
  let tableRows = [];

  const flushList = () => {
    if (inList) {
      html += '</ul>';
      inList = false;
    }
  };
  const flushTable = () => {
    if (!tableRows.length) return;
    html += '<table class="rb-table">';
    tableRows.forEach((cols, idx) => {
      if (cols.every((c) => /^[-–—]+$/.test(c.trim()))) return;
      const tag = idx === 0 ? 'th' : 'td';
      html += `<tr>${cols.map((c) => `<${tag}>${formatInline(c.trim())}</${tag}>`).join('')}</tr>`;
    });
    html += '</table>';
    tableRows = [];
  };

  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      flushList();
      flushTable();
      continue;
    }
    if (t.startsWith('|') && t.endsWith('|')) {
      flushList();
      tableRows.push(t.slice(1, -1).split('|'));
      continue;
    }
    if (t.includes('\t')) {
      flushList();
      tableRows.push(t.split('\t'));
      continue;
    }
    flushTable();

    if (t === '---') {
      flushList();
      html += '<hr class="rb-hr">';
    } else if (t.startsWith('# ')) {
      flushList();
      html += `<h2 class="rb-h1">${formatInline(t.slice(2))}</h2>`;
    } else if (t.startsWith('## ')) {
      flushList();
      html += `<h3 class="rb-h2">${formatInline(t.slice(3))}</h3>`;
    } else if (t.startsWith('### ')) {
      flushList();
      html += `<h4 class="rb-h3">${formatInline(t.slice(4))}</h4>`;
    } else if (/^[A-P]\.\s/.test(t) || t === 'TRẠNG THÁI MỖI NGƯỜI CHƠI') {
      flushList();
      html += `<h3 class="rb-sec">${formatInline(t)}</h3>`;
    } else if (t.startsWith('* ')) {
      if (!inList) {
        html += '<ul class="rb-list">';
        inList = true;
      }
      html += `<li>${formatInline(t.slice(2))}</li>`;
    } else {
      flushList();
      html += `<p class="rb-p">${formatInline(t)}</p>`;
    }
  }
  flushList();
  flushTable();
  return html;
}

export function renderRulesModal(rulebookText = '') {
  const body = rulebookText
    ? formatRulebookText(rulebookText)
    : '<p class="hint">Đang tải toàn văn Sổ tay Luật chơi...</p>';
  return `
    <div class="modal" onclick="if(event.target===this)appActions.closeModal()">
      <div class="modal-card rules-modal">
        <div class="modal-head">
          <h2>Sổ Tay Luật Chơi & Đặc Tả Hệ Thống</h2>
          <button onclick="appActions.closeModal()">✕</button>
        </div>
        <div class="rb-content">
          ${body}
          <p class="hint" style="margin-top:18px;padding-top:10px;border-top:1px solid var(--bd);font-size:11.5px">
            Tài nguyên hiệu ứng chiến đấu Sakuga: <b>KanaWorks_AI (@KanaWorks_AI)</b> · Animation: <b>GSAP</b>.
          </p>
        </div>
      </div>
    </div>`;
}

export function renderAutoPromptModal(prompt) {
  if (!prompt) return '';
  const { card, info, playerName } = prompt;
  const reasonText =
    info?.reason === 'revive'
      ? 'Bạn sắp gục ngã! Kích hoạt để hồi sinh với 500 máu và 500 giáp?'
      : `${esc(info?.attacker || 'Đối thủ')} dùng <b>${esc(info?.cardName || 'đòn đánh')}</b> gây <b>${
          info?.dmg ?? 0
        }</b> sát thương. Bạn có muốn kích hoạt thẻ tự động này không?`;
  return `
    <div class="modal auto-modal">
      <div class="modal-card auto-prompt-box">
        <div class="modal-head">
          <h2>Xác nhận kích hoạt thẻ</h2>
        </div>
        ${playerName ? `<p class="hint">Người chơi: <b>${esc(playerName)}</b></p>` : ''}
        <p>${reasonText}</p>
        <div class="auto-preview">${renderCard(card, 0, { interactive: false })}</div>
        <div class="row auto-actions">
          <button class="go btn-lg" onclick="appActions.replyAuto(true)">Kích hoạt</button>
          <button class="btn-lg" onclick="appActions.replyAuto(false)">Bỏ qua</button>
        </div>
      </div>
    </div>`;
}

export function getFilteredCodexCards(filterRank = 'ALL', search = '') {
  const qRaw = String(search || '').trim().toLowerCase();
  const qNorm = normalizeSearchText(search);
  return CARDS.filter((c) => {
    if (filterRank !== 'ALL' && c.r !== filterRank) return false;
    if (qNorm) {
      const hay = normalizeSearchText(`${c.jp || ''} ${c.n || ''} ${c.s || ''} ${c.el || ''}`);
      const kjHit = qRaw && (c.kj || '').toLowerCase().includes(qRaw);
      if (!hay.includes(qNorm) && !kjHit) return false;
    }
    return true;
  });
}

export function renderCodexModal(filterRank = 'ALL', search = '') {
  const list = getFilteredCodexCards(filterRank, search);

  return `
    <div class="modal" onclick="if(event.target===this)appActions.closeModal()">
      <div class="modal-card codex-modal">
        <div class="modal-head">
          <h2>Từ Điển Nhẫn Thuật (${list.length}/${CARDS.length})</h2>
          <button onclick="appActions.closeModal()">✕</button>
        </div>
        <div class="codex-bar">
          <input id="codexSearch" placeholder="Tìm tên Nhật (vd: gokakyu, amaterasu), Kanji, tiếng Việt, tộc..." value="${esc(search)}"
                 oninput="appActions.codexFilter('${filterRank}', this.value)">
          <div class="rank-pills">
            ${['ALL', 'S', 'A', 'B', 'C']
              .map(
                (r) =>
                  `<button class="${filterRank === r ? 'go' : ''}" onclick="appActions.codexFilter('${r}', document.getElementById('codexSearch').value)">${
                    r === 'ALL' ? 'Tất cả' : 'Cấp ' + r
                  }</button>`
              )
              .join('')}
          </div>
        </div>
        <p class="codex-hint">Di chuột lên thẻ để xem hiệu ứng 3D Holo theo cấp độ · Nhấn vào thẻ để phóng to & lật xem mặt sau.</p>
        <div class="codex-grid">
          ${list.map((c, i) => renderCard(c, i, { interactive: false, inspectable: true, holoMode: 'codex' })).join('')}
        </div>
      </div>
    </div>`;
}

export function renderCardInspectModal(cardId, { flipped = false, listIds = null } = {}) {
  const c = CARDS.find((x) => x.id === cardId);
  if (!c) return '';
  const foil = getCardFoilInfo(c);
  const idx = Array.isArray(listIds) ? listIds.indexOf(cardId) : -1;
  const hasNav = Array.isArray(listIds) && listIds.length > 1 && idx >= 0;
  const isHiddenClan = c.s === 'mangakyo' || c.s === 'rinnegan';

  return `
    <div class="card-inspect-overlay" onclick="if(event.target===this)appActions.closeInspect()">
      <div class="card-inspect-dialog">
        <div class="card-inspect-stage">
          ${
            hasNav
              ? `<button class="inspect-nav" title="Thẻ trước (←)" onclick="appActions.inspectStep(-1)">‹</button>`
              : ''
          }
          <div class="card-inspect-card">
            ${renderCard(c, 0, {
              interactive: false,
              inspectable: false,
              holoMode: 'inspector',
              includeBack: true,
              flipped,
              isInspector: true,
            })}
          </div>
          ${
            hasNav
              ? `<button class="inspect-nav" title="Thẻ sau (→)" onclick="appActions.inspectStep(1)">›</button>`
              : ''
          }
        </div>
        <div class="card-inspect-info">
          <span class="inspect-foil-pill ${foil.pillCls}">${foil.label}</span>
          <h3>${esc(getCardTitle(c))}</h3>
          ${c.kj ? `<div class="inspect-kj">${esc(c.kj)}</div>` : ''}
          <div class="inspect-meta-list">
            <div><span>Tên Tiếng Việt</span><b>${esc(c.n)}</b></div>
            <div><span>Cấp độ</span><b>Cấp ${c.r}</b></div>
            <div><span>Loại thẻ</span><b>${esc(TYPE_LABELS[c.t] || c.t)}</b></div>
            <div><span>Hệ phái / Tộc</span><b>${esc(c.s)}</b></div>
            <div><span>Nguyên tố</span><b>${c.el ? EL_BADGE[c.el] : 'Không nguyên tố'}</b></div>
            <div><span>Nguồn rút</span><b>${
              isHiddenClan && c.n !== 'rinnengan'
                ? c.s === 'mangakyo'
                  ? 'Qua Mangekyō Sharingan'
                  : 'Qua Rinnegan'
                : 'Rút trực tiếp từ bộ bài'
            }</b></div>
            ${hasNav ? `<div><span>Vị trí</span><b>${idx + 1} / ${listIds.length}</b></div>` : ''}
          </div>
          <div class="inspect-desc-box">${esc(describeCard(c))}</div>
          <div class="inspect-actions">
            <button id="inspectFlipBtn" onclick="appActions.toggleInspectFlip()">${flipped ? 'Xem mặt trước' : 'Lật mặt sau'} (F)</button>
            <button onclick="appActions.triggerInspectShowcase()">Tự nghiêng</button>
            <button class="go" onclick="appActions.closeInspect()">Đóng</button>
          </div>
          <p class="inspect-tip">Di chuột hoặc vuốt lên lá bài để ngắm ánh sáng 3D · Phím <kbd>F</kbd> lật bài${
            hasNav ? ' · <kbd>←</kbd>/<kbd>→</kbd> chuyển thẻ' : ''
          } · <kbd>Esc</kbd> đóng</p>
        </div>
      </div>
    </div>`;
}

export function renderQuickReactionsModal() {
  const pill = (el) => `<span class="rx-pill rx-el-${el}">${EL_BADGE[el]}</span>`;
  const rows = [
    [pill('lôi') + ' + ' + pill('hỏa'), REACTIONS['hỏa+lôi'].name, REACTIONS['hỏa+lôi'].desc],
    [pill('hỏa') + ' + ' + pill('thủy'), REACTIONS['hỏa+thủy'].name, REACTIONS['hỏa+thủy'].desc],
    [pill('lôi') + ' + ' + pill('thủy'), REACTIONS['lôi+thủy'].name, REACTIONS['lôi+thủy'].desc],
    [pill('hỏa') + ' + ' + pill('hỏa'), REACTIONS['hỏa+hỏa'].name, REACTIONS['hỏa+hỏa'].desc],
    [pill('thủy') + ' + ' + pill('thủy'), REACTIONS['thủy+thủy'].name, REACTIONS['thủy+thủy'].desc],
    [pill('lôi') + ' + ' + pill('lôi'), REACTIONS['lôi+lôi'].name, REACTIONS['lôi+lôi'].desc],
    [
      pill('phong') + ' + <span class="rx-pill rx-el-any">Ấn bất kỳ</span>',
      'Khuếch tán nguyên tố',
      'Lan ấn kia cho 2 người cạnh bên, xóa ấn Phong và giữ lại ấn gốc trên mục tiêu',
    ],
  ];

  return `
    <div class="modal" onclick="if(event.target===this)appActions.closeModal()">
      <div class="modal-card rx-quick-modal">
        <div class="modal-head">
          <h2>Tra Cứu Nhanh Phản Ứng Nguyên Tố</h2>
          <button onclick="appActions.closeModal()">✕</button>
        </div>
        <p class="hint">Đủ <b>2 ấn</b> trên mục tiêu sẽ kích nổ phản ứng ngay lập tức và tiêu thụ ấn.</p>
        <div class="rx-quick-list">
          ${rows
            .map(
              ([combo, name, desc]) => `
            <div class="rx-quick-item">
              <div class="rx-combo">${combo}</div>
              <div class="rx-info">
                <b>${esc(name)}</b>
                <span>${esc(desc)}</span>
              </div>
            </div>`
            )
            .join('')}
        </div>
        <div class="rx-pipeline">
          <b>Thứ tự nhận sát thương:</b>
          <span>1. Tự kích hoạt / Né</span> → <span>2. Pet đỡ (FIFO)</span> → <span>3. Giáp</span> → <span>4. Máu</span>
        </div>
      </div>
    </div>`;
}

export function renderVictoryOverlay(G, { canRematch = true, isOnline = false } = {}) {
  const maxDmg = Math.max(0, ...G.ps.map((p) => p.stats?.dmgDealt || 0));
  const sorted = [...G.ps].sort((a, b) => (b.stats?.dmgDealt || 0) - (a.stats?.dmgDealt || 0));

  return `
    <div class="ov-win">
      <div class="win-box win-wide">
        <div class="win-stamp" aria-hidden="true">勝</div>
        <h1>${esc(G.over)} chiến thắng!</h1>
        <p class="hint">Tổng số lượt: <b>${G.turnCount || 1}</b></p>
        <div class="stats-wrap">
          <table class="stats-table">
            <thead>
              <tr>
                <th>Ninja</th>
                <th>Sát thương</th>
                <th>Phản ứng</th>
                <th>Số thẻ</th>
                <th>Hạ gục</th>
              </tr>
            </thead>
            <tbody>
              ${sorted
                .map((p) => {
                  const st = p.stats || { dmgDealt: 0, reactions: 0, cardsUsed: 0, kos: 0 };
                  const isMvp = maxDmg > 0 && st.dmgDealt === maxDmg;
                  return `
                  <tr class="${p.dead ? 'row-dead' : 'row-alive'}">
                    <td>
                      <b>${esc(p.name)}</b>${p.bot ? ' (Bot)' : ''}
                      ${G.teams ? `<span class="tm t${p.team}">${TEAM_NAMES[p.team]}</span>` : ''}
                      ${isMvp ? '<span class="mvp-badge">MVP</span>' : ''}
                    </td>
                    <td><b>${st.dmgDealt}</b></td>
                    <td>${st.reactions}</td>
                    <td>${st.cardsUsed}</td>
                    <td>${st.kos}</td>
                  </tr>`;
                })
                .join('')}
            </tbody>
          </table>
        </div>
        <div class="row win-actions">
          ${
            canRematch
              ? '<button class="go btn-lg" onclick="appActions.rematch()">Chơi lại ngay</button>'
              : isOnline
                ? '<span class="hint">Chờ chủ phòng bấm Chơi lại...</span>'
                : ''
          }
          <button class="btn-lg" onclick="appActions.leaveGame()">Về Menu</button>
        </div>
      </div>
    </div>`;
}

export function renderCastBanner(ca) {
  if (!ca) return '';
  const castCol = ECOL[ca.el] || RCOL[ca.r] || '#ea580c';
  const matchedCard =
    (ca.id != null ? CARDS.find((x) => x.id === ca.id) : null) ||
    CARDS.find((x) => x.n === ca.n);
  const cardId = matchedCard ? matchedCard.id : ca.id;
  const hasWebp = cardId != null && CARD_IMAGE_IDS.has(cardId);
  const artHtml = hasWebp
    ? `<img class="cast-art-img" src="/assets/cards/${cardId}.webp" alt="" decoding="sync" draggable="false">`
    : matchedCard
      ? `<div class="cast-art-svg">${cardArtSvg(matchedCard)}</div>`
      : '';

  const titleText = (ca.jp || ca.n || '').toUpperCase();
  const viPart = ca.n && !isSameJpViName(ca) ? `<span class="cast-vi">${esc(ca.n)}</span> · ` : '';

  return `
    <div class="cast cast-r-${esc(ca.r || 'C')} ${ca.isAuto ? 'cast-auto' : ''}" style="--c:${castCol}">
      <div class="cast-inner">
        ${
          artHtml
            ? `<div class="cast-art-wrap">
                 <div class="cast-art-frame">
                   ${artHtml}
                   <span class="cast-art-flash" aria-hidden="true"></span>
                   <span class="cast-art-sheen" aria-hidden="true"></span>
                 </div>
                 <span class="rk rk-${esc(ca.r || 'C')} cast-rk">${esc(ca.r || 'C')}</span>
               </div>`
            : ''
        }
        <div class="cast-copy">
          ${ca.isAuto ? '<span class="cast-auto-tag">Tự Kích Hoạt</span>' : ''}
          ${ca.kj ? `<span class="cast-kj">${esc(ca.kj)}</span>` : ''}
          <h2>${esc(titleText)}!</h2>
          <small>${viPart}${esc(ca.who || '')} · cấp ${esc(ca.r || '')} ${esc(ca.sub || '')}</small>
        </div>
      </div>
    </div>`;
}
