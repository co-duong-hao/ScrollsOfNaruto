import { CARDS, describeCard, TYPE_LABELS, REACTIONS } from '/shared/cards.js';
import { isValidTarget, TEAM_NAMES, EDO_HP } from '/shared/engine.js';
import { cardArtSvg } from './cardArt.js';

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
  hỏa: '🔥 Hỏa',
  thủy: '💧 Thủy',
  lôi: '⚡ Lôi',
  phong: '🌪 Phong',
};

export function renderCard(c, i, { selected = false, dim = false, interactive = true } = {}) {
  const elTag = c.el ? `<span class="el-tag el-${c.el}">${EL_BADGE[c.el]}</span>` : '';
  const rem = 3 - (c.age || 0);
  const ageTag =
    interactive && !c.au
      ? `<span class="age-tag ${rem <= 1 ? 'age-warn' : ''}" title="Còn ${rem} lượt trước khi tự hủy">⏳ ${rem}</span>`
      : '';
  return `
    <div class="cd ${c.r} ${c.au ? 'au' : ''} ${selected ? 'sel' : ''} ${dim ? 'dim' : ''}"
         data-card-idx="${i}"
         ${interactive ? `onclick="appActions.pickCard(${i})"` : ''}
         title="${esc(describeCard(c))}">
      <div class="cd-top">
        <span class="rk rk-${c.r}">${c.r}</span>
        <div class="cd-badges">${ageTag}${elTag}</div>
      </div>
      ${cardArtSvg(c)}
      <b class="cd-name">${esc(c.n)}</b>
      <small class="cd-meta">${TYPE_LABELS[c.t] || c.t} · ${esc(c.s)}</small>
      <div class="cd-desc">${esc(describeCard(c))}</div>
      ${c.au ? '<div class="cd-au">🛡 Tự kích hoạt</div>' : ''}
    </div>`;
}

function renderChips(p, showSecret) {
  const bad = [
    ...p.marks.map((e) => [`ấn ${e}`, 'Ấn nguyên tố: thêm 1 ấn nữa sẽ gây phản ứng']),
    p.bleed ? [`🩸 chảy máu ${p.bleed > 1e9 ? '∞' : p.bleed}`, 'Mất 50 máu đầu mỗi lượt, bỏ qua giáp và pet'] : null,
    p.stun ? ['💫 choáng', 'Mất lượt kế tiếp, không rút bài, vẫn chịu sát thương'] : null,
  ].filter(Boolean);

  const auCount = showSecret ? p.hand.filter((c) => c.au).length : 0;
  const good = [
    ...p.buffs.map((b) => [
      `✦ ${b.n}${b.m ? ' +' + Math.round(b.m * 100) + '%' : ''}${b.t < 90 ? ` · ${b.t}L` : ''}`,
      'Trạng thái chủ động',
    ]),
    p.immune ? [`🕊 miễn nhiễm · ${p.immune}L`, 'Miễn nhiễm hiệu ứng xấu'] : null,
    p.edo ? ['🧟 Uế Thổ (-50% dmg)', 'Thi thể bất tử, có thể bị Kim Sa Ấn tiêu diệt'] : null,
    p.armor ? [`🛡 giáp ${p.armor}${p.armorT ? ` · ${p.armorT}L` : ''}`, 'Giáp chặn sát thương sau khi qua pet'] : null,
    showSecret && p.dodge !== null ? [`💨 né ${p.dodge}`, 'Điểm né ẩn: dưới 100 là % né, né xong trừ 100'] : null,
    showSecret && auCount ? [`👁 canh phòng ×${auCount}`, 'Thẻ tự kích hoạt đang trên tay'] : null,
  ].filter(Boolean);

  const mk = (arr, cls) =>
    arr
      .map(
        ([t, d]) =>
          `<span class="ch ${cls}" title="${esc(d)}" onclick="event.stopPropagation();appActions.toast('${esc(t)}: ${esc(d)}')">${esc(t)}</span>`
      )
      .join('') || '<span class="ch-empty">—</span>';

  const petsHtml =
    p.pets
      .map(
        (q) =>
          `<span class="ch pet" title="Pet: đỡ đòn, đánh ${q.atk} mỗi hit">🐾 ${q.hp}<u style="width:${Math.max(
            0,
            (q.hp / q.mx) * 100
          )}%"></u></span>`
      )
      .join('') || '<span class="ch-empty">—</span>';

  return {
    bad,
    html: `
      <div class="rw"><i>⚠</i>${mk(bad, 'bad')}</div>
      <div class="rw"><i>✦</i>${mk(good, 'good')}</div>
      <div class="rw"><i>🐾</i>${petsHtml}</div>`,
  };
}

export function renderSeat(G, p, i, cur, showSecret, isMe, flList = []) {
  const selCard = G.sel != null ? cur.hand[G.sel] : null;
  const canTarget = selCard && isValidTarget(G, selCard, i, G.cur);
  const fl = flList.filter((e) => e.t === i);
  const ch = renderChips(p, isMe && showSecret);
  const handCount = p.handCount != null ? p.handCount : p.hand.length;
  const statusClasses = [
    p.bleed ? 'is-bleed' : '',
    p.armor > 0 ? 'has-armor' : '',
    p.buffs.length ? 'has-buff' : '',
    p.immune > 0 ? 'is-immune' : '',
    p.corpse ? 'is-corpse' : '',
    p.stun > 0 ? 'is-stun' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const orbs = p.marks.map((m) => `<span class="mark-orb orb-${m}" title="Ấn ${m}"></span>`).join('');

  return `
    <div class="st ${isMe ? 'me' : ''} ${i === G.cur ? 'cur' : ''} ${p.dead ? 'dead' : ''} ${canTarget ? 'tg' : ''} ${statusClasses} ${
    fl.some((e) => e.c === 'hp') ? 'hit' : ''
  } ${fl.some((e) => e.c === 'ko') ? 'ko-flash' : ''}" data-seat-idx="${i}" onclick="appActions.targetPlayer(${i})">
      ${fl
        .map((e, j) => {
          const dx = ((j % 3) - 1) * 38;
          const dy = -Math.floor(j / 3) * 26;
          return `<span class="fl ${e.c}" style="--dx:${dx}px;--dy:${dy}px;animation-delay:${j * 0.28}s">${esc(e.tx)}</span>`;
        })
        .join('')}
      <div class="st-head">
        <b>${esc(p.name)}${p.bot ? ' 🤖' : ''}${p.dead ? ' 💀' : ''}${p.stun > 0 ? ' 💫' : ''}</b>
        ${G.teams ? `<span class="tm t${p.team}">${TEAM_NAMES[p.team]}</span>` : ''}
        ${orbs ? `<span class="orb-row">${orbs}</span>` : ''}
      </div>
      <div class="hp">
        <i style="width:${p.hp >= EDO_HP ? 100 : Math.min(100, (p.hp / 4000) * 100)}%"></i>
        <span>❤ ${p.hp >= EDO_HP ? '∞' : `${p.hp} / 4000`}</span>
      </div>
      <div class="st-stats">
        <span>🧠 ${p.sp}/10</span>
        <span>🃏 ${handCount} lá</span>
      </div>
      ${ch.html}
      ${
        isMe && showSecret
          ? `<div class="sum">
               ${p.destiny?.length ? `<div class="destiny">🌟 Định mệnh (×3): <b>${p.destiny.map(esc).join(' · ')}</b></div>` : ''}
               <div>${ch.bad.length ? 'Đang dính: ' + ch.bad.map((x) => esc(x[0])).join(', ') : 'Trạng thái ổn định'}</div>
             </div>`
          : ''
      }
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
          <h2>📜 Sổ Tay Luật Chơi & Đặc Tả Hệ Thống</h2>
          <button onclick="appActions.closeModal()">✕</button>
        </div>
        <div class="rb-content">${body}</div>
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
          <h2>🛡 Xác nhận kích hoạt thẻ</h2>
        </div>
        ${playerName ? `<p class="hint">Người chơi: <b>${esc(playerName)}</b></p>` : ''}
        <p>${reasonText}</p>
        <div class="auto-preview">${renderCard(card, 0, { interactive: false })}</div>
        <div class="row auto-actions">
          <button class="go btn-lg" onclick="appActions.replyAuto(true)">✅ Kích hoạt</button>
          <button class="btn-lg" onclick="appActions.replyAuto(false)">❌ Bỏ qua</button>
        </div>
      </div>
    </div>`;
}

export function renderCodexModal(filterRank = 'ALL', search = '') {
  const q = search.trim().toLowerCase();
  const list = CARDS.filter((c) => {
    if (filterRank !== 'ALL' && c.r !== filterRank) return false;
    if (q && !c.n.toLowerCase().includes(q) && !c.s.toLowerCase().includes(q) && !(c.el || '').includes(q)) {
      return false;
    }
    return true;
  });

  return `
    <div class="modal" onclick="if(event.target===this)appActions.closeModal()">
      <div class="modal-card codex-modal">
        <div class="modal-head">
          <h2>🃏 Từ Điển Nhẫn Thuật (${list.length}/${CARDS.length})</h2>
          <button onclick="appActions.closeModal()">✕</button>
        </div>
        <div class="codex-bar">
          <input id="codexSearch" placeholder="Tìm tên thẻ, tộc, nguyên tố..." value="${esc(search)}"
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
        <div class="codex-grid">
          ${list.map((c, i) => renderCard(c, i, { interactive: false })).join('')}
        </div>
      </div>
    </div>`;
}
