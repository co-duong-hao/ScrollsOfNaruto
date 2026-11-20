import { CARDS } from '/shared/cards.js';
import {
  createGame,
  useCard,
  endTurn,
  pickBotAction,
  needTarget,
  isValidTarget,
} from '/shared/engine.js';
import { SFX } from './sound.js';
import { VFX } from './vfx.js';
import {
  esc,
  ECOL,
  RCOL,
  renderCard,
  renderSeat,
  renderRulesModal,
  renderCodexModal,
  renderAutoPromptModal,
  renderQuickReactionsModal,
  renderVictoryOverlay,
} from './ui.js';

const $ = (id) => document.getElementById(id);

const state = {
  mode: 'menu', // menu | offline_setup | online_menu | lobby | game
  G: null,
  socket: null,
  you: null,
  isOnlineHost: false,
  lobby: null,
  offlineCount: 4,
  lastOfflinePlayers: null,
  nick: localStorage.getItem('son_nick') || 'Ninja',
  modal: null, // null | 'rules' | 'codex' | 'reactions'
  codexRank: 'ALL',
  codexSearch: '',
  busy: false,
  waitOnline: false,
  cast: null,
  fl: [],
  pendingAfterFx: null,
  msg: '',
  rulebookText: '',
  autoPrompt: null,
  sandboxSearch: '',
  sandboxGiveTo: 0,
  dark: localStorage.getItem('son_theme') !== 'light',
};

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.dark ? 'dark' : 'light');
}
applyTheme();

function topBarHtml(showLeave = false) {
  return `
    <header class="topbar">
      <div class="brand" onclick="${showLeave ? 'appActions.leaveGame()' : 'appActions.goMenu()'}">
        <span class="brand-icon">📜</span>
        <span>Scrolls of Naruto</span>
      </div>
      <div class="top-actions">
        ${showLeave ? '<button class="btn-sm" onclick="appActions.leaveGame()">🚪 Thoát</button>' : ''}
        <button class="btn-sm" onclick="appActions.openModal(\'reactions\')" title="Tra cứu nhanh phản ứng nguyên tố (Phím R)">⚗️ Phản ứng</button>
        <button class="btn-sm" onclick="appActions.openModal(\'codex\')">🃏 Nhẫn thuật</button>
        <button class="btn-sm" onclick="appActions.openModal(\'rules\')">📖 Luật</button>
        <button class="btn-sm" onclick="appActions.toggleSound()">${SFX.muted ? '🔇 Tắt âm' : '🔊 Âm thanh'}</button>
        <button class="btn-sm" onclick="appActions.toggleTheme()">${state.dark ? '🌙 Tối' : '☀️ Sáng'}</button>
      </div>
    </header>`;
}

function askLocalAuto(playerIdx, card, info) {
  return new Promise((resolve) => {
    const p = state.G?.ps[playerIdx];
    state.autoPrompt = {
      card,
      info,
      playerName: p ? p.name : '',
      resolve: (allow) => {
        state.autoPrompt = null;
        render();
        resolve(allow);
      },
    };
    render();
  });
}

function playFxEvents(events, onDone) {
  const list = events || [];
  const cs = list.find((e) => e.k === 'cast') || null;
  const fl = list.filter((e) => !e.k);

  if (!cs && !fl.length) {
    render();
    if (onDone) onDone();
    return;
  }

  state.busy = true;
  state.cast = cs;
  state.fl = [];

  if (cs) {
    if (cs.r === 'S') SFX.play('srank');
    else if (cs.el) SFX.play(cs.el);
    else SFX.play('cast');
  }
  render();
  VFX.trigger(document.querySelector('.tb'), cs, fl);

  setTimeout(() => {
    state.cast = null;
    state.fl = fl;
    if (fl.some((e) => e.c === 'ko')) SFX.play('ko');
    else if (fl.some((e) => e.c === 'hp')) SFX.play('hit');
    else if (fl.some((e) => e.c === 'dg')) SFX.play('dodge');
    else if (fl.some((e) => e.c === 'ar')) SFX.play('armor');
    else if (fl.some((e) => e.c === 'pt')) SFX.play('pet');
    if (fl.some((e) => e.c === 'rx')) SFX.play('reaction');
    render();
    VFX.trigger(document.querySelector('.tb'), null, fl);
  }, cs ? 1700 : 0);

  setTimeout(() => {
    state.fl = [];
    state.busy = false;
    render();
    if (onDone) setTimeout(onDone, 350);
  }, cs ? 3100 : 1400);
}

function runOfflineBotStep() {
  const G = state.G;
  if (!G || G.online || G.over) return;
  const p = G.ps[G.cur];
  if (!p || !p.bot) return;

  setTimeout(async () => {
    if (!state.G || state.G.over || state.G !== G) return;
    const act = pickBotAction(G);
    if (act.type === 'end') {
      const endRes = await endTurn(G);
      SFX.play('draw');
      if (endRes?.events?.length) {
        playFxEvents(endRes.events, () => {
          if (state.G === G && !G.over && G.ps[G.cur]?.bot) runOfflineBotStep();
        });
      } else {
        render();
        runOfflineBotStep();
      }
      return;
    }
    const res = await useCard(G, act.index, act.target, act.hitList);
    if (res.ok) {
      playFxEvents(res.events, () => {
        if (state.G === G && !G.over && G.ps[G.cur]?.bot) {
          runOfflineBotStep();
        }
      });
    } else {
      const endRes = await endTurn(G);
      if (endRes?.events?.length) {
        playFxEvents(endRes.events, () => {
          if (state.G === G && !G.over && G.ps[G.cur]?.bot) runOfflineBotStep();
        });
      } else {
        render();
        runOfflineBotStep();
      }
    }
  }, 1500);
}

function connectSocket() {
  if (state.socket) return state.socket;
  if (typeof window.io !== 'function') {
    state.msg = 'Không kết nối được Socket.IO server.';
    render();
    return null;
  }
  const s = window.io();
  state.socket = s;

  s.on('room:lobby', (lobby) => {
    state.lobby = lobby;
    state.mode = 'lobby';
    state.msg = '';
    render();
  });

  s.on('game:state', ({ state: srvState, fx, you, isHost }) => {
    const prevCur = state.G ? state.G.cur : -1;
    state.you = you;
    state.isOnlineHost = !!isHost;
    state.G = srvState;
    state.G.sel = null;
    state.G.hl = null;
    state.mode = 'game';
    state.waitOnline = false;

    if (srvState.over) {
      SFX.play('victory');
    } else if (srvState.cur !== prevCur) {
      SFX.play('turn');
    }

    if (fx && fx.length) {
      playFxEvents(fx);
    } else {
      render();
    }
  });

  s.on('game:error', (err) => {
    state.waitOnline = false;
    state.msg = err || 'Hành động không hợp lệ';
    render();
  });

  s.on('game:askAuto', ({ card, info }) => {
    state.autoPrompt = {
      card,
      info,
      playerName: '',
      resolve: (allow) => {
        state.autoPrompt = null;
        s.emit('game:autoReply', { allow });
        render();
      },
    };
    render();
  });

  s.on('disconnect', () => {
    if (state.mode === 'lobby' || (state.mode === 'game' && state.G?.online)) {
      state.msg = 'Mất kết nối tới máy chủ.';
      render();
    }
  });

  return s;
}

function renderModal() {
  if (state.autoPrompt) return renderAutoPromptModal(state.autoPrompt);
  if (state.modal === 'rules') return renderRulesModal(state.rulebookText);
  if (state.modal === 'codex') return renderCodexModal(state.codexRank, state.codexSearch);
  if (state.modal === 'reactions') return renderQuickReactionsModal();
  return '';
}

function renderMenu() {
  return `
    ${topBarHtml(false)}
    <main class="hero">
      <div class="hero-card">
        <div class="hero-badge">⚔️ TACTICAL ELEMENTAL TCG</div>
        <h1>Scrolls of Naruto</h1>
        <p class="hero-sub">Đấu thẻ bài chiến thuật 4 nguyên tố <b>Phong · Thủy · Hỏa · Lôi</b> với 96 nhẫn thuật, Pet hộ thể, Né tránh ẩn và 7 Phản ứng Nguyên tố.</p>
        <div class="hero-btns">
          <button class="go btn-lg btn-online" onclick="appActions.openOnlineMenu()">🌐 Chơi Online</button>
          <button class="go btn-lg" onclick="appActions.openOfflineSetup()">🎮 Chơi Offline</button>
          <button class="btn-lg btn-sandbox" onclick="appActions.startSandbox()">🧪 Thử Skill</button>
        </div>
        <div class="hero-links">
          <button onclick="appActions.openModal('codex')">🃏 Xem 96 Thẻ Bài</button>
          <button onclick="appActions.openModal('rules')">📜 Sổ Tay Luật Chơi</button>
        </div>
      </div>
    </main>`;
}

function renderOfflineSetup() {
  const n = state.offlineCount;
  return `
    ${topBarHtml(false)}
    <main class="panel-wrap">
      <div class="panel">
        <h2>🎮 Thiết lập trận Offline</h2>
        <div class="row">
          <label>Số người chơi:</label>
          <select onchange="appActions.setOfflineCount(+this.value)">
            ${[2, 3, 4, 5, 6].map((k) => `<option value="${k}" ${k === n ? 'selected' : ''}>${k} người</option>`).join('')}
          </select>
        </div>
        <div class="player-rows">
          ${Array.from(
            { length: n },
            (_, i) => `
            <div class="row">
              <input id="nm${i}" value="Người chơi ${i + 1}" maxlength="16">
              <select id="ty${i}">
                <option value="0" ${i === 0 ? 'selected' : ''}>Người</option>
                <option value="1" ${i > 0 ? 'selected' : ''}>Bot 🤖</option>
              </select>
            </div>`
          ).join('')}
        </div>
        ${
          n >= 4 && n % 2 === 0
            ? '<p class="hint">✨ Số người chẵn: tự động chia 2 phe (Phe Đỏ / Phe Xanh).</p>'
            : ''
        }
        <div class="row actions-row">
          <button class="go" onclick="appActions.startOffline()">Bắt đầu trận</button>
          <button onclick="appActions.goMenu()">Quay lại</button>
        </div>
      </div>
    </main>`;
}

function renderOnlineMenu() {
  const urlCode = new URLSearchParams(window.location.search).get('room') || '';
  return `
    ${topBarHtml(false)}
    <main class="panel-wrap">
      <div class="panel">
        <h2>🌐 Chơi Online (Real-time)</h2>
        <div class="row">
          <label>Tên Ninja:</label>
          <input id="nickInput" value="${esc(state.nick)}" maxlength="16" placeholder="Nhập tên của bạn">
        </div>
        <div class="divider"></div>
        <div class="row">
          <button class="go" onclick="appActions.createRoom()">➕ Tạo phòng mới</button>
        </div>
        <div class="row">
          <input id="codeInput" value="${esc(urlCode)}" placeholder="Mã phòng (4 ký tự)" maxlength="4" style="text-transform:uppercase;width:170px">
          <button onclick="appActions.joinRoom()">🚪 Vào phòng</button>
        </div>
        ${state.msg ? `<p class="err">${esc(state.msg)}</p>` : ''}
        <div class="row actions-row">
          <button onclick="appActions.goMenu()">Quay lại</button>
        </div>
      </div>
    </main>`;
}

function renderLobby() {
  const L = state.lobby;
  const isHost = L.hostId === state.you;
  const total = L.players.length + L.bots;
  const maxBots = Math.max(0, 6 - L.players.length);
  const shareUrl = `${window.location.origin}/?room=${L.code}`;

  return `
    ${topBarHtml(false)}
    <main class="panel-wrap">
      <div class="panel">
        <div class="lobby-head">
          <h2>Phòng <span class="room-code">${L.code}</span></h2>
          <button class="btn-sm" onclick="appActions.copyInvite('${shareUrl}')">📋 Copy link mời</button>
        </div>
        <p class="hint">Người chơi (${L.players.length}/6):</p>
        <ul class="lobby-list">
          ${L.players
            .map(
              (p) =>
                `<li><span>🥷 ${esc(p.name)}</span><span>${p.id === L.hostId ? '👑 Chủ phòng' : ''}${
                  p.id === state.you ? ' (Bạn)' : ''
                }</span></li>`
            )
            .join('')}
        </ul>
        ${
          isHost
            ? `<div class="row">
                <label>Thêm Bot:</label>
                <select onchange="appActions.setRoomBots(+this.value)">
                  ${Array.from({ length: maxBots + 1 }, (_, k) => `<option value="${k}" ${k === L.bots ? 'selected' : ''}>${k} Bot</option>`).join('')}
                </select>
                <span class="hint">Tổng: ${total} người ${total >= 4 && total % 2 === 0 ? '· Chia 2 phe' : ''}</span>
              </div>
              <div class="row actions-row">
                <button class="go" ${total < 2 || total > 6 ? 'disabled' : ''} onclick="appActions.startOnline()">⚔️ Bắt đầu</button>
                <button onclick="appActions.leaveLobby()">Rời phòng</button>
              </div>`
            : `<p class="hint">⏳ Đang chờ chủ phòng bắt đầu...</p>
               <div class="row actions-row"><button onclick="appActions.leaveLobby()">Rời phòng</button></div>`
        }
      </div>
    </main>`;
}

function renderSandboxBar(G) {
  if (!G.sandbox) return '';
  const q = state.sandboxSearch.trim().toLowerCase();
  const matches = CARDS.filter((c) => !q || c.n.toLowerCase().includes(q) || c.s.toLowerCase().includes(q)).slice(0, 12);
  return `
    <div class="sandbox-bar">
      <div class="sandbox-row">
        <span class="sandbox-badge">🧪 PHÒNG TẬP SKILL</span>
        <input id="sbSearch" placeholder="Tìm tên skill (vd: rasengan, kamui, thiên chiếu...)" value="${esc(state.sandboxSearch)}"
               oninput="appActions.sandboxFilter(this.value)">
        <select onchange="appActions.sandboxTarget(this.value)">
          <option value="0" ${state.sandboxGiveTo === 0 ? 'selected' : ''}>Thêm cho: Bạn</option>
          <option value="1" ${state.sandboxGiveTo === 1 ? 'selected' : ''}>Thêm cho: Hình nộm 1</option>
        </select>
        <button class="btn-sm" onclick="appActions.sandboxDummyAttack()">⚔️ Hình nộm đánh thử</button>
        <button class="btn-sm" onclick="appActions.sandboxReset()">🔄 Reset bàn</button>
        <button class="btn-sm" onclick="appActions.sandboxClearHand()">🗑 Xóa tay</button>
      </div>
      <div class="sandbox-picks">
        ${matches
          .map(
            (c) =>
              `<button class="sb-pill rk-b-${c.r}" onclick="appActions.sandboxAdd(${c.id})" title="${esc(c.s)}"><b>[${c.r}]</b> ${esc(c.n)}</button>`
          )
          .join('')}
      </div>
    </div>`;
}

function renderGame() {
  const G = state.G;
  if (G.over) {
    const canRematch = !G.online || state.isOnlineHost;
    return `
      ${topBarHtml(true)}
      ${renderVictoryOverlay(G, { canRematch, isOnline: !!G.online })}`;
  }

  const cur = G.ps[G.cur];
  const humCount = G.ps.filter((p) => !p.bot).length;
  const on = G.online;

  let viewIdx = on
    ? Math.max(0, G.ps.findIndex((p) => p.uid === state.you))
    : humCount < 2
      ? Math.max(0, G.ps.findIndex((p) => !p.bot))
      : G.cur;
  if (!on && humCount < 2 && G.ps[viewIdx].bot) viewIdx = G.cur;

  const V = G.ps[viewIdx];
  const isMyTurn = viewIdx === G.cur && !cur.bot;
  const showSecret = on ? true : isMyTurn ? humCount < 2 || G.ready : humCount < 2 && !V.bot;
  const canAct = isMyTurn && showSecret && !state.busy && !state.waitOnline;
  const selCard = G.sel != null ? cur.hand[G.sel] : null;

  const others = G.ps.map((_, i) => i).filter((i) => i !== viewIdx);
  const rotated = [...others.filter((i) => i > viewIdx), ...others.filter((i) => i < viewIdx)];

  let banner = cur.bot ? `🤖 ${cur.name} đang suy nghĩ…` : on && isMyTurn ? '⚔️ Đến lượt bạn!' : `Lượt của ${cur.name}`;
  let msg = state.msg || '';
  if (selCard) {
    msg = selCard.h
      ? `Đòn ${(G.hl || []).length + 1}/${selCard.h.length} của ${selCard.n}: chọn mục tiêu`
      : `Chọn mục tiêu cho ${selCard.n}`;
  }

  const ca = state.cast;
  const castCol = ca ? ECOL[ca.el] || RCOL[ca.r] : '';

  const actionsHtml = canAct
    ? `<div class="acts">
         <button class="go" onclick="appActions.endTurn()">⏭ Kết thúc lượt</button>
         ${selCard ? '<button onclick="appActions.cancelSelect()">✕ Hủy chọn</button>' : ''}
         <span class="hk-hint">Phím tắt: <b>1-9</b> chọn · <b>Space</b> hết lượt · <b>R</b> phản ứng</span>
       </div>`
    : '';

  const handHtml = showSecret
    ? `<div class="hand">
         ${V.hand
           .map((c, i) =>
             renderCard(c, i, {
               selected: G.sel === i,
               dim: !canAct,
               interactive: true,
               hotkey: canAct && i < 9 ? i + 1 : null,
             })
           )
           .join('')}
       </div>`
    : '';

  const hotseatOverlay =
    !on && !cur.bot && !showSecret
      ? `<div class="ov-pass">
           <div class="pass-box">
             <h2>Lượt của ${esc(cur.name)}</h2>
             <p>Đưa màn hình cho <b>${esc(cur.name)}</b> rồi bấm Sẵn sàng để xem bài.</p>
             <button class="go btn-lg" onclick="appActions.readyHotseat()">👁 Sẵn sàng</button>
           </div>
         </div>`
      : '';

  return `
    ${topBarHtml(true)}
    ${renderSandboxBar(G)}
    <div class="tb ${ca && ca.r === 'S' ? 'shake' : ''}">
      <div class="opp">
        ${rotated.map((i) => renderSeat(G, G.ps[i], i, cur, showSecret, false, state.fl)).join('')}
      </div>
      ${
        ca
          ? `<div class="cast">
               <h2 style="--c:${castCol}">${esc(ca.n.toUpperCase())}!</h2>
               <small>${esc(ca.who)} · cấp ${ca.r} ${esc(ca.sub)}</small>
             </div>`
          : ''
      }
      <div class="mid">
        <div class="ban">${esc(banner)}</div>
        <div class="msg">${esc(msg)}</div>
        <div class="lg" id="lg">${G.log.slice(-40).map(esc).join('<br>')}</div>
      </div>
      <div class="mine">
        ${renderSeat(G, V, viewIdx, cur, showSecret, true, state.fl)}
        <div class="hw">
          ${actionsHtml}
          ${handHtml}
        </div>
      </div>
    </div>
    ${hotseatOverlay}`;
}

function render() {
  const app = $('app');
  const prevHand = document.querySelector('.hand');
  const scrollLeft = prevHand ? prevHand.scrollLeft : 0;

  let html = '';
  if (state.mode === 'menu') html = renderMenu();
  else if (state.mode === 'offline_setup') html = renderOfflineSetup();
  else if (state.mode === 'online_menu') html = renderOnlineMenu();
  else if (state.mode === 'lobby') html = renderLobby();
  else if (state.mode === 'game') html = renderGame();

  html += renderModal();
  app.innerHTML = html;

  const newHand = document.querySelector('.hand');
  if (newHand) newHand.scrollLeft = scrollLeft;
  const lg = $('lg');
  if (lg) lg.scrollTop = lg.scrollHeight;
}

window.appActions = {
  goMenu() {
    state.mode = 'menu';
    state.msg = '';
    render();
  },
  toggleTheme() {
    state.dark = !state.dark;
    localStorage.setItem('son_theme', state.dark ? 'dark' : 'light');
    applyTheme();
    render();
  },
  toggleSound() {
    SFX.toggle();
    render();
  },
  openModal(name) {
    state.modal = name;
    if (name === 'rules' && !state.rulebookText) {
      fetch('/rulebook')
        .then((r) => r.text())
        .then((txt) => {
          state.rulebookText = txt;
          if (state.modal === 'rules') render();
        })
        .catch(() => {});
    }
    render();
  },
  closeModal() {
    state.modal = null;
    render();
  },
  codexFilter(rank, search) {
    state.codexRank = rank;
    state.codexSearch = search;
    render();
    const inp = $('codexSearch');
    if (inp) {
      inp.focus();
      inp.setSelectionRange(inp.value.length, inp.value.length);
    }
  },
  toast(text) {
    state.msg = text;
    render();
  },
  openOfflineSetup() {
    state.mode = 'offline_setup';
    render();
  },
  setOfflineCount(n) {
    state.offlineCount = n;
    render();
  },
  replyAuto(allow) {
    state.autoPrompt?.resolve?.(!!allow);
  },
  async startOffline() {
    const n = state.offlineCount;
    const players = Array.from({ length: n }, (_, i) => ({
      name: ($('nm' + i)?.value || `Người chơi ${i + 1}`).trim().slice(0, 16),
      bot: $('ty' + i)?.value === '1',
    }));
    state.lastOfflinePlayers = players;
    state.G = await createGame(players, { online: false, onAskAuto: askLocalAuto });
    state.G.sel = null;
    state.G.hl = null;
    state.G.ready = false;
    state.mode = 'game';
    state.msg = '';
    SFX.play('turn');
    render();
    runOfflineBotStep();
  },
  async rematch() {
    const G = state.G;
    if (!G) return;
    if (G.online) {
      state.waitOnline = true;
      state.socket?.emit('room:rematch');
      render();
      return;
    }
    if (G.sandbox) {
      return this.startSandbox();
    }
    const players =
      state.lastOfflinePlayers ||
      G.ps.map((p) => ({ name: p.name.replace(/\s*\(Bot\)$/, ''), bot: !!p.bot }));
    state.G = await createGame(players, { online: false, onAskAuto: askLocalAuto });
    state.G.sel = null;
    state.G.hl = null;
    state.G.ready = false;
    state.busy = false;
    state.msg = '';
    SFX.play('turn');
    render();
    runOfflineBotStep();
  },
  async startSandbox() {
    const players = [
      { name: 'Bạn (Test)', bot: false },
      { name: 'Hình nộm 1', bot: false },
      { name: 'Hình nộm 2', bot: false },
    ];
    const G = await createGame(players, { online: false, onAskAuto: askLocalAuto });
    G.sandbox = true;
    G.sel = null;
    G.hl = null;
    G.ready = true;
    G.log = ['🧪 Chế độ Thử Skill: chọn bất kỳ thẻ nào bên trên để thêm vào tay và thử nghiệm!'];
    state.G = G;
    state.mode = 'game';
    state.msg = '';
    state.sandboxSearch = '';
    state.sandboxGiveTo = 0;
    SFX.play('turn');
    render();
  },
  sandboxFilter(val) {
    state.sandboxSearch = val;
    render();
    const inp = $('sbSearch');
    if (inp) {
      inp.focus();
      inp.setSelectionRange(inp.value.length, inp.value.length);
    }
  },
  sandboxTarget(val) {
    state.sandboxGiveTo = Number(val) || 0;
  },
  sandboxAdd(cardId) {
    const G = state.G;
    if (!G || !G.sandbox) return;
    const card = CARDS.find((c) => c.id === cardId);
    if (!card) return;
    const targetP = G.ps[state.sandboxGiveTo] || G.ps[0];
    targetP.hand.push({ ...card, age: 0 });
    SFX.play('draw');
    state.msg = `Đã thêm [${card.r}] ${card.n} cho ${targetP.name}`;
    render();
  },
  sandboxClearHand() {
    const G = state.G;
    if (!G || !G.sandbox) return;
    G.ps[0].hand = [];
    G.sel = null;
    G.hl = null;
    render();
  },
  sandboxReset() {
    const G = state.G;
    if (!G || !G.sandbox) return;
    G.ps.forEach((p) => {
      p.hp = 4000;
      p.sp = 10;
      p.dodge = 0;
      p.armor = 0;
      p.armorT = 0;
      p.pets = [];
      p.buffs = [];
      p.marks = [];
      p.bleed = 0;
      p.stun = 0;
      p.immune = 0;
      p.regen = [];
      p.edo = 0;
      p.corpse = 0;
      p.izm = 0;
      p.dead = 0;
      p.destroyed = 0;
    });
    G.cur = 0;
    G.over = null;
    G.sel = null;
    G.hl = null;
    G.log.push('🔄 Đã reset trạng thái bàn thử nghiệm.');
    render();
  },
  async sandboxDummyAttack() {
    const G = state.G;
    if (!G || !G.sandbox || G.over || state.busy) return;
    const dummy = G.ps[1];
    if (dummy.dead) {
      state.msg = 'Hình nộm 1 đang chết, hãy bấm Reset bàn.';
      return render();
    }
    const prevCur = G.cur;
    G.cur = 1;
    dummy.hand.unshift({ ...CARDS.find((c) => c.n === 'rasengan'), age: 0 });
    const res = await useCard(G, 0, 0);
    G.cur = prevCur;
    if (res.ok) {
      playFxEvents(res.events);
    } else {
      render();
    }
  },
  openOnlineMenu() {
    state.mode = 'online_menu';
    state.msg = '';
    render();
  },
  createRoom() {
    const nick = ($('nickInput')?.value || 'Ninja').trim().slice(0, 16) || 'Ninja';
    state.nick = nick;
    localStorage.setItem('son_nick', nick);
    const s = connectSocket();
    if (!s) return;
    s.emit('room:create', { name: nick }, (res) => {
      if (res?.ok) state.you = res.uid;
      else {
        state.msg = res?.error || 'Không tạo được phòng';
        render();
      }
    });
  },
  joinRoom() {
    const nick = ($('nickInput')?.value || 'Ninja').trim().slice(0, 16) || 'Ninja';
    const code = ($('codeInput')?.value || '').trim().toUpperCase();
    if (!code) {
      state.msg = 'Vui lòng nhập mã phòng.';
      return render();
    }
    state.nick = nick;
    localStorage.setItem('son_nick', nick);
    const s = connectSocket();
    if (!s) return;
    s.emit('room:join', { code, name: nick }, (res) => {
      if (res?.ok) state.you = res.uid;
      else {
        state.msg = res?.error || 'Không vào được phòng';
        render();
      }
    });
  },
  copyInvite(url) {
    navigator.clipboard?.writeText(url).then(() => {
      alert('Đã copy link mời phòng: ' + url);
    });
  },
  setRoomBots(bots) {
    state.socket?.emit('room:setBots', { bots });
  },
  startOnline() {
    state.socket?.emit('room:start');
  },
  leaveLobby() {
    state.socket?.emit('room:leave');
    state.lobby = null;
    state.mode = 'online_menu';
    render();
  },
  leaveGame() {
    if (state.G?.online) {
      state.socket?.emit('room:leave');
    }
    state.G = null;
    state.lobby = null;
    state.busy = false;
    state.waitOnline = false;
    state.mode = 'menu';
    render();
  },
  readyHotseat() {
    if (state.G) {
      state.G.ready = true;
      SFX.play('select');
      render();
    }
  },
  pickCard(i) {
    const G = state.G;
    if (!G || G.over || state.busy || state.waitOnline) return;
    const cur = G.ps[G.cur];
    if (cur.bot) return;
    if (G.online && cur.uid !== state.you) return;
    const c = cur.hand[i];
    if (!c) return;

    if (G.sel === i) {
      G.sel = null;
      G.hl = null;
      return render();
    }
    if (c.au) {
      state.msg = 'Thẻ này tự kích hoạt khi bị tấn công hoặc hấp hối.';
      return render();
    }
    if (c.rv && !G.ps.some((q) => q.dead && !q.destroyed)) {
      state.msg = 'Chưa có ai để hồi sinh.';
      return render();
    }
    SFX.play('select');
    if (needTarget(c)) {
      G.sel = i;
      G.hl = [];
      return render();
    }
    this.executeUse(i, -1, null);
  },
  targetPlayer(x) {
    const G = state.G;
    if (!G || G.sel == null || state.busy || state.waitOnline) return;
    const cur = G.ps[G.cur];
    const c = cur.hand[G.sel];
    if (!c || !isValidTarget(G, c, x, G.cur)) return;

    if (c.h) {
      G.hl.push(x);
      SFX.play('select');
      if (G.hl.length < c.h.length) return render();
      this.executeUse(G.sel, x, G.hl);
    } else {
      this.executeUse(G.sel, x, null);
    }
  },
  cancelSelect() {
    if (!state.G) return;
    state.G.sel = null;
    state.G.hl = null;
    render();
  },
  async executeUse(index, target, hitList) {
    const G = state.G;
    G.sel = null;
    G.hl = null;
    state.msg = '';

    if (G.online) {
      state.waitOnline = true;
      state.socket?.emit('game:use', { index, target, hitList });
      render();
    } else {
      const res = await useCard(G, index, target, hitList);
      if (!res.ok) {
        state.msg = res.error;
        return render();
      }
      playFxEvents(res.events, () => {
        if (state.G === G && !G.over && G.ps[G.cur]?.bot) {
          runOfflineBotStep();
        }
      });
    }
  },
  async endTurn() {
    const G = state.G;
    if (!G || G.over || state.busy || state.waitOnline) return;
    const cur = G.ps[G.cur];
    if (cur.bot) return;
    if (G.online && cur.uid !== state.you) return;

    G.sel = null;
    G.hl = null;
    state.msg = '';
    SFX.play('draw');

    if (G.online) {
      state.waitOnline = true;
      state.socket?.emit('game:end');
      render();
    } else {
      const endRes = await endTurn(G);
      let events = endRes?.events || [];
      if (G.sandbox) {
        let guard = 0;
        while (!G.over && G.cur !== 0 && guard < G.ps.length) {
          const r = await endTurn(G, true);
          if (r?.events?.length) events = events.concat(r.events);
          guard++;
        }
      } else {
        G.ready = false;
      }
      if (events.length) {
        playFxEvents(events, () => {
          if (!G.sandbox && state.G === G && !G.over && G.ps[G.cur]?.bot) {
            runOfflineBotStep();
          }
        });
      } else {
        render();
        if (!G.sandbox) runOfflineBotStep();
      }
    }
  },
};

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const tag = e.target?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if (state.autoPrompt) return;

  if (e.key === 'Escape') {
    if (state.modal) {
      window.appActions.closeModal();
    } else if (state.G?.sel != null) {
      window.appActions.cancelSelect();
    }
    return;
  }

  if (e.key === 'r' || e.key === 'R') {
    if (state.modal === 'reactions') window.appActions.closeModal();
    else if (!state.modal) window.appActions.openModal('reactions');
    return;
  }

  if (state.mode !== 'game' || !state.G || state.G.over || state.modal || state.busy || state.waitOnline) return;
  const G = state.G;
  const cur = G.ps[G.cur];
  if (!cur || cur.bot) return;
  if (G.online && cur.uid !== state.you) return;
  const humCount = G.ps.filter((p) => !p.bot).length;
  if (!G.online && humCount >= 2 && !G.ready) return;

  if (e.key >= '1' && e.key <= '9') {
    const idx = Number(e.key) - 1;
    if (idx < cur.hand.length) {
      e.preventDefault();
      window.appActions.pickCard(idx);
    }
    return;
  }

  if ((e.key === ' ' || e.key === 'Enter') && G.sel == null) {
    e.preventDefault();
    window.appActions.endTurn();
  }
});

document.addEventListener(
  'wheel',
  (e) => {
    const h = e.target.closest?.('.hand');
    if (h && h.scrollWidth > h.clientWidth && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      h.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  },
  { passive: false }
);

// Auto-open online menu if ?room=XXXX is in URL
if (new URLSearchParams(window.location.search).get('room')) {
  state.mode = 'online_menu';
}
render();
