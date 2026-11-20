import { CARDS, HIDDEN_CLANS, CLANS, REACTIONS } from './cards.js';

export const TEAM_NAMES = ['Phe Đỏ', 'Phe Xanh'];
export const EDO_HP = 1e9;

export const needTarget = (c) => !!(c.d || c.h || c.ms || c.rv || c.dt || c.heal);

// Precompute rank multipliers so drawable cards match ~20% C, 30% B, 28% A, 22% S
const DRAWABLE_CARDS = CARDS.filter((c) => !HIDDEN_CLANS.includes(c.s) || c.n === 'rinnengan');
const CLAN_COUNTS = DRAWABLE_CARDS.reduce((acc, c) => {
  acc[c.s] = (acc[c.s] || 0) + 1;
  return acc;
}, {});
const DESTINY_CLANS = [...new Set(CARDS.map((c) => c.s))].filter(
  (s) => s !== CLANS.NORMAL && !HIDDEN_CLANS.includes(s)
);

const RANK_MULT = (() => {
  const target = { C: 0.2, B: 0.3, A: 0.28, S: 0.22 };
  const mult = { C: 1, B: 1, A: 1, S: 1 };
  for (let iter = 0; iter < 40; iter++) {
    const sums = { C: 0, B: 0, A: 0, S: 0 };
    DRAWABLE_CARDS.forEach((c) => {
      sums[c.r] += mult[c.r] / Math.pow(CLAN_COUNTS[c.s], 0.65);
    });
    const tot = sums.C + sums.B + sums.A + sums.S;
    ['C', 'B', 'A', 'S'].forEach((r) => {
      if (sums[r] > 0) mult[r] *= target[r] / (sums[r] / tot);
    });
  }
  return mult;
})();

function pickDestiny() {
  const pool = [...DESTINY_CLANS].sort(() => Math.random() - 0.5);
  return pool.slice(0, 2);
}

export function createPlayer(name, bot, index, uid = null) {
  return {
    name,
    bot,
    uid,
    team: index % 2,
    hp: 4000,
    sp: 10,
    dodge: 0,
    armor: 0,
    armorT: 0,
    pets: [],
    buffs: [],
    marks: [],
    bleed: 0,
    stun: 0,
    immune: 0,
    regen: [],
    edo: 0,
    corpse: 0,
    izm: 0,
    last: null,
    hand: [],
    aff: {},
    destiny: pickDestiny(),
    dead: 0,
    destroyed: 0,
  };
}

export async function createGame(playersConfig, options = {}) {
  const n = playersConfig.length;
  const G = {
    online: !!options.online,
    onAskAuto: options.onAskAuto || null,
    teams: n >= 4 && n % 2 === 0,
    ps: playersConfig.map((p, i) => createPlayer(p.name, !!p.bot, i, p.uid || null)),
    cur: 0,
    turnCount: 1,
    log: ['Trận đấu bắt đầu!'],
    used: [],
    over: null,
    q: [],
    showTurn: 1,
    snap: null,
    snapFor: null,
  };
  G.ps.forEach((p) => {
    drawCard(p);
    drawCard(p);
    drawCard(p);
  });
  await startTurn(G);
  return G;
}

export function aliveIndices(G) {
  return G.ps.map((_, i) => i).filter((i) => !G.ps[i].dead);
}

export function adjacentIndices(G, i) {
  const a = aliveIndices(G);
  const k = a.indexOf(i);
  const n = a.length;
  if (k < 0 || n <= 1) return [];
  return [...new Set([a[(k + 1) % n], a[(k - 1 + n) % n]])].filter((x) => x !== i);
}

export function isValidTarget(G, card, targetIdx, actorIdx) {
  const q = G.ps[targetIdx];
  if (!q) return false;
  if (card.ally) return !q.dead;
  if (targetIdx === actorIdx) return false;
  if (card.rv) return !!(q.dead && !q.destroyed);
  if (card.ds) return !q.destroyed;
  return !q.dead;
}

export function drawCard(p) {
  const weights = DRAWABLE_CARDS.map((c) => {
    const base = RANK_MULT[c.r] / Math.pow(CLAN_COUNTS[c.s], 0.65);
    const dest = p.destiny?.includes(c.s) ? 3 : 1;
    const aff = p.aff[c.s] || 1;
    return base * dest * aff;
  });
  let y = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < DRAWABLE_CARDS.length; i++) {
    y -= weights[i];
    if (y <= 0) {
      const drawn = { ...DRAWABLE_CARDS[i], age: 0 };
      p.hand.push(drawn);
      return drawn;
    }
  }
  const fallback = { ...DRAWABLE_CARDS[0], age: 0 };
  p.hand.push(fallback);
  return fallback;
}

function pushFloat(G, targetPlayer, tx, cls) {
  G.q.push({ t: G.ps.indexOf(targetPlayer), tx, c: cls });
}

function addLog(G, msg) {
  G.log.push(msg);
  if (G.log.length > 120) G.log.shift();
}

function adjustSp(G, p, delta) {
  if (delta < 0 && p.immune > 0) return;
  p.sp = Math.min(10, p.sp + delta);
  if (p.sp <= 0) {
    p.sp = 5;
    if (p.immune <= 0) {
      p.stun = Math.max(p.stun, 1);
      addLog(G, `${p.name} cạn tinh thần: hồi 5, bị Choáng`);
      pushFloat(G, p, '💫 Cạn tinh thần!', 'au');
    } else {
      addLog(G, `${p.name} cạn tinh thần: hồi 5 (miễn Choáng)`);
    }
  }
}

async function askAuto(G, player, card, info) {
  if (player.bot || typeof G.onAskAuto !== 'function') return true;
  const idx = G.ps.indexOf(player);
  try {
    return !!(await G.onAskAuto(idx, card, info));
  } catch {
    return true;
  }
}

async function checkDeath(G, p) {
  if (p.hp > 0 || p.dead) return;
  const k = p.hand.findIndex((c) => c.au === 'rev');
  if (k >= 0) {
    const revCard = p.hand[k];
    const ok = await askAuto(G, p, revCard, { reason: 'revive' });
    if (ok) {
      const idx = p.hand.indexOf(revCard);
      if (idx >= 0) p.hand.splice(idx, 1);
      p.hp = 500;
      p.armor = 500;
      p.armorT = 1;
      addLog(G, `✨ ${p.name} kích hoạt Izanagi hồi sinh (500 máu, 500 giáp)`);
      pushFloat(G, p, '✨ IZANAGI!', 'au');
      return;
    }
  }
  p.dead = 1;
  p.hp = 0;
  p.hand = [];
  p.pets = [];
  p.marks = [];
  addLog(G, `💀 ${p.name} đã bị kết liễu!`);
  pushFloat(G, p, '💀 KẾT LIỄU!', 'ko');
}

async function directDamage(G, p, dmg, emitFloat = true) {
  if (p.hp >= EDO_HP) return;
  dmg = Math.round(dmg);
  p.hp -= dmg;
  if (emitFloat && dmg > 0) pushFloat(G, p, `-${dmg}`, 'hp');
  await checkDeath(G, p);
}

async function applyHit(G, source, target, dmg, card, ignoreEvasion = false) {
  dmg = Math.round(dmg);
  if (target.dead) return 0;
  if (source && source !== target) target.last = G.ps.indexOf(source);

  if (!ignoreEvasion) {
    const matches = target.hand.filter(
      (x) =>
        x.au === 'kl' ||
        x.au === 'gq' ||
        x.au === 'trap' ||
        (card && ((x.au === 'kr' && 'AS'.includes(card.r)) || (x.au === 'izm' && card.r === 'A')))
    );
    for (const x of matches) {
      const ok = await askAuto(G, target, x, {
        reason: 'hit',
        dmg,
        attacker: source ? source.name : 'Hiệu ứng',
        cardName: card ? card.n : 'Đòn đánh',
      });
      if (!ok) continue;
      const idx = target.hand.indexOf(x);
      if (idx >= 0) target.hand.splice(idx, 1);
      if (x.au !== 'izm') {
        addLog(G, `🛡 ${target.name} kích hoạt ${x.n}`);
        pushFloat(G, target, `🛡 ${x.n}!`, 'au');
      }
      if (x.au === 'kl' && card && card.t === 'a') target.hand.push({ ...card, age: 0 });
      if (x.au === 'kr') target.armor += 150;
      if (x.au === 'gq' && target.hp < EDO_HP) {
        target.hp += dmg;
        pushFloat(G, target, `+${dmg} ❤`, 'au');
      }
      if (x.au === 'trap' && source) {
        await directDamage(G, source, dmg, true);
        adjustSp(G, source, -1);
      }
      if (x.au === 'izm') {
        if (source) source.izm = 1;
        break;
      }
      return 0;
    }

    const d = target.dodge;
    if (d > 0 && (d >= 100 || Math.random() * 100 < d)) {
      target.dodge = Math.max(0, d - 100);
      addLog(G, `💨 ${target.name} né thành công`);
      pushFloat(G, target, 'NÉ!', 'dg');
      return 0;
    }
  }

  if (card?.ba && target.armor > 0) {
    target.armor = 0;
    target.buffs = target.buffs.filter((b) => !b.ua);
    addLog(G, `💥 ${card.n} phá vỡ toàn bộ giáp của ${target.name}!`);
    pushFloat(G, target, '💥 PHÁ GIÁP', 'ar');
  }

  if (target.pets.length) {
    const pet = target.pets[0];
    pet.hp -= dmg;
    addLog(G, `🐾 Pet của ${target.name} đỡ ${dmg} sát thương`);
    pushFloat(G, target, `🐾 -${dmg}`, 'pt');
    if (pet.hp <= 0) {
      target.pets.shift();
      addLog(G, `🐾 Pet của ${target.name} bị tiêu diệt`);
    }
    return 1;
  }

  const drBuff = target.buffs.find((b) => b.dr && target.armor > 0);
  if (drBuff) {
    dmg = Math.round(dmg * (1 - drBuff.dr));
  }

  const absorbed = Math.min(target.armor, dmg);
  if (absorbed > 0) {
    target.armor -= absorbed;
    dmg -= absorbed;
    const rfBuff = target.buffs.find((b) => b.rf);
    if (source && !source.dead && rfBuff) {
      const rfAmt = typeof rfBuff.rf === 'number' ? rfBuff.rf : 20;
      addLog(G, `🛡 Giáp của ${target.name} phản ${rfAmt} sát thương lên ${source.name}`);
      await directDamage(G, source, rfAmt, true);
    }
  }
  if (target.armor <= 0) {
    target.armor = 0;
    target.buffs = target.buffs.filter((b) => !b.ua);
  }
  if (dmg > 0) await directDamage(G, target, dmg, false);

  addLog(G, `⚔ ${target.name} nhận ${dmg + absorbed} sát thương${absorbed ? ` (giáp chặn ${absorbed})` : ''}`);
  if (dmg > 0) pushFloat(G, target, `-${dmg}`, 'hp');
  if (absorbed > 0) pushFloat(G, target, `🛡 -${absorbed}`, 'ar');
  return 1;
}

async function applyMark(G, target, el) {
  if (target.dead || target.immune > 0) return;
  target.marks.push(el);
  if (target.marks.length < 2) return;

  const [a, b] = target.marks;
  target.marks = [];
  const key = [a, b].sort().join('+');
  const neighbors = adjacentIndices(G, G.ps.indexOf(target)).map((i) => G.ps[i]);
  const rxName = REACTIONS[key]?.name || 'Khuếch tán nguyên tố';

  addLog(G, `⚗ Phản ứng [${rxName}] (${key}) trên ${target.name}`);
  pushFloat(G, target, `⚗ ${rxName}`, 'rx');

  if (a === 'phong' || b === 'phong') {
    const other = a === 'phong' ? b : a;
    if (other !== 'phong') {
      target.marks = [other];
      for (const n of neighbors) await applyMark(G, n, other);
    }
    return;
  }

  if (key === 'lôi+thủy') {
    for (const n of [target, ...neighbors]) await applyHit(G, null, n, 50, null, true);
  } else if (key === 'hỏa+thủy') {
    await applyHit(G, null, target, 100, null, true);
  } else if (key === 'hỏa+hỏa') {
    if (target.immune <= 0) target.bleed += 150;
  } else if (key === 'thủy+thủy') {
    target.dodge = Math.max(0, target.dodge - 30);
  } else if (key === 'lôi+lôi') {
    adjustSp(G, target, -1);
    await directDamage(G, target, 30, true);
  } else if (key === 'hỏa+lôi') {
    if (target.immune <= 0) target.stun = Math.max(target.stun, 1);
  }
}

export function checkWin(G) {
  const a = aliveIndices(G);
  let winner = null;
  if (G.teams) {
    const teams = [...new Set(a.map((i) => G.ps[i].team))];
    if (teams.length <= 1) {
      winner = teams.length ? `${TEAM_NAMES[teams[0]]} (${a.map((i) => G.ps[i].name).join(', ')})` : 'Không ai';
    }
  } else if (a.length <= 1) {
    winner = a.length ? G.ps[a[0]].name : 'Không ai';
  }
  if (winner) {
    G.over = winner;
    addLog(G, `🏆 ${winner} chiến thắng!`);
    return true;
  }
  return false;
}

export async function startTurn(G) {
  if (checkWin(G)) return;
  let guard = 0;
  while (G.ps[G.cur].dead && guard < G.ps.length) {
    G.cur = (G.cur + 1) % G.ps.length;
    guard++;
  }
  const p = G.ps[G.cur];
  G.used = [];
  G.q = [];
  G.showTurn = 1;
  addLog(G, `— Lượt ${p.name} —`);

  if (p.bleed > 0) {
    p.bleed = Math.max(0, p.bleed - 50);
    addLog(G, `🩸 ${p.name} chảy máu −50`);
    await directDamage(G, p, 50, true);
  }
  if (p.regen.length && !p.dead && p.hp < 4000) {
    p.regen.forEach((rg) => {
      const missing = Math.max(0, 4000 - p.hp);
      const healAmt = Math.round(missing * (rg.pct / 100));
      if (healAmt > 0) {
        p.hp = Math.min(4000, p.hp + healAmt);
        addLog(G, `💚 ${p.name} hồi ${healAmt} máu (Sáng tạo diêm sinh)`);
        pushFloat(G, p, `+${healAmt} ❤`, 'au');
      }
      rg.t--;
    });
    p.regen = p.regen.filter((rg) => rg.t > 0);
  }
  if (p.armorT && --p.armorT === 0) p.armor = 0;

  if (p.dead) {
    return nextTurn(G);
  }

  const aoePets = p.pets.filter((q) => q.aoeTurn);
  if (aoePets.length) {
    const foes = aliveIndices(G).filter((i) => i !== G.cur);
    for (const pet of aoePets) {
      addLog(G, `🐾 Shukaku của ${p.name} gầm thét, tấn công cả bàn (${pet.atk} sát thương)!`);
      for (const idx of foes) await applyHit(G, p, G.ps[idx], pet.atk, null);
    }
    if (checkWin(G)) return;
  }

  if (p.pets.some((q) => q.lock)) {
    addLog(G, `💤 ${p.name} bị khóa chủ động bởi Mộng Nhất Vĩ`);
    return endTurn(G, false);
  }

  if (p.stun > 0) {
    p.stun--;
    addLog(G, `💫 ${p.name} bị Choáng, mất lượt`);
    pushFloat(G, p, '💫 CHOÁNG', 'au');
    return endTurn(G, true);
  }
  if (p.izm) {
    p.izm = 0;
    G.snap = structuredClone(G.ps);
    G.snapFor = G.cur;
  }
}

export async function nextTurn(G) {
  if (checkWin(G)) return;
  G.cur = (G.cur + 1) % G.ps.length;
  G.turnCount++;
  await startTurn(G);
}

export async function endTurn(G, skipDraw = false) {
  if (checkWin(G)) return;
  if (G.snap && G.snapFor === G.cur) {
    G.ps = G.snap;
    G.snap = null;
    G.snapFor = null;
  }
  const p = G.ps[G.cur];
  if (!p.dead) {
    [...new Set(G.used)].forEach((s) => {
      p.aff[s] = (p.aff[s] || 1) * 1.5;
    });
    p.buffs.forEach((b) => b.t--);
    p.buffs = p.buffs.filter((b) => b.t > 0);
    if (p.immune > 0) p.immune--;
    p.hand = p.hand.filter((c) => {
      if (c.au) return true;
      c.age = (c.age || 0) + 1;
      if (c.age >= 3) {
        addLog(G, `⏳ Thẻ ${c.n} của ${p.name} hết hạn (3 lượt)`);
        return false;
      }
      return true;
    });
    if (!skipDraw) {
      drawCard(p);
      drawCard(p);
    }
  }
  await nextTurn(G);
}

export async function useCard(G, handIndex, targetIdx = -1, hitList = null) {
  if (G.over) return { ok: false, error: 'Trận đấu đã kết thúc' };
  const p = G.ps[G.cur];
  const c = p.hand[handIndex];
  if (!c || c.au) return { ok: false, error: 'Thẻ không hợp lệ' };

  if (needTarget(c)) {
    if (c.h) {
      if (!Array.isArray(hitList) || hitList.length !== c.h.length || !hitList.every((x) => isValidTarget(G, c, x, G.cur))) {
        return { ok: false, error: 'Mục tiêu multi-hit không hợp lệ' };
      }
    } else if (!isValidTarget(G, c, targetIdx, G.cur)) {
      return { ok: false, error: 'Mục tiêu không hợp lệ' };
    }
  }

  p.hand.splice(handIndex, 1);
  const T = G.ps[targetIdx];
  G.used.push(c.s);
  G.q = [];

  G.q.push({
    k: 'cast',
    n: c.n,
    r: c.r,
    t: c.t,
    s: c.s,
    el: c.el || null,
    srcIdx: G.cur,
    who: p.name,
    sub: c.a || c.split || c.splitSelf ? 'lên cả bàn' : c.h ? '' : T && needTarget(c) ? `→ ${T.name}` : '',
  });
  addLog(G, `${p.name} dùng ${c.n}${c.h ? '' : T && !c.a && needTarget(c) ? ` → ${T.name}` : ''}`);

  if (c.hpl && p.hp < EDO_HP) p.hp = Math.max(1, Math.floor(p.hp * (1 - c.hpl / 100)));
  if (c.sf) adjustSp(G, p, c.sf);
  if (c.dg) p.dodge += c.dg;
  if (c.ar) {
    p.armor += c.ar;
    if (c.at) p.armorT = c.at;
  }
  if (c.heal && T && !T.dead && T.hp < EDO_HP) {
    T.hp += c.heal;
    addLog(G, `💚 ${T.name} hồi ${c.heal} máu`);
    pushFloat(G, T, `+${c.heal} ❤`, 'au');
  }
  if (c.healSelf && p.hp < EDO_HP) {
    p.hp += c.healSelf;
    addLog(G, `💚 ${p.name} hồi ${c.healSelf} máu`);
    pushFloat(G, p, `+${c.healSelf} ❤`, 'au');
  }
  if (c.cleanse) {
    p.bleed = 0;
    p.marks = [];
    p.stun = 0;
    p.izm = 0;
    addLog(G, `✨ ${p.name} giải toàn bộ hiệu ứng xấu`);
  }
  if (c.immune) p.immune = Math.max(p.immune, c.immune);
  if (c.regen) p.regen.push({ ...c.regen });

  if (c.pet) {
    for (let k = 0; k < c.pet[0]; k++) {
      p.pets.push({
        hp: c.pet[1],
        mx: c.pet[1],
        atk: c.pet[2],
        aoeTurn: c.pet[3] || 0,
        lock: c.pet[4] || 0,
      });
      if (p.pets.length > 3) p.pets.shift();
    }
  }
  if (c.b) {
    p.buffs.push({ n: c.n, ...c.b, t: c.b.t || 99 });
    if (p.buffs.length > 2) p.buffs.shift();
  }
  if (c.gv === 'm') {
    const pool = CARDS.filter((x) => x.s === CLANS.MANGEKYO);
    p.hand.push({ ...pool[Math.floor(Math.random() * pool.length)], age: 0 });
  }
  if (c.gv === 'r') {
    const pool = CARDS.filter((x) => x.s === CLANS.RINNEGAN && x.n !== 'rinnengan');
    for (let k = 0; k < 3; k++) {
      p.hand.push({ ...pool[Math.floor(Math.random() * pool.length)], age: 0 });
    }
  }
  if (c.kpa) G.ps.forEach((q) => (q.pets = []));
  if (c.rv && T) {
    T.dead = 0;
    if (c.edo) {
      T.hp = EDO_HP;
      T.edo = 1;
      T.corpse = 1;
      addLog(G, `🧟 ${T.name} được Uế Thổ Chuyển Sinh (máu ∞, -50% sát thương)`);
      pushFloat(G, T, '🧟 UẾ THỔ!', 'au');
    } else {
      T.hp = 1000;
      T.edo = 0;
      T.corpse = 0;
      addLog(G, `♻ ${T.name} được hồi sinh với 1000 máu`);
      pushFloat(G, T, '♻ HỒI SINH!', 'au');
    }
    drawCard(T);
    drawCard(T);
    drawCard(T);
  }
  if (c.ds && T && (T.dead || T.corpse)) {
    T.dead = 1;
    T.hp = 0;
    T.destroyed = 1;
    T.hand = [];
    T.pets = [];
    addLog(G, `🔥 Thi thể ${T.name} bị tiêu diệt vĩnh viễn`);
  }

  let mult = 1 + p.buffs.reduce((a, b) => a + b.m + (b.hy && c.s === CLANS.HYUGA ? b.hy : 0), 0);
  if (p.edo) mult *= 0.5;

  const landed = {};
  let plan = [];
  if (c.h) {
    plan = hitList.map((x, k) => [x, c.h[k]]);
  } else if (c.a) {
    plan = aliveIndices(G)
      .filter((x) => x !== G.cur)
      .map((x) => [x, c.a]);
  } else if (c.split) {
    const foes = aliveIndices(G).filter((x) => x !== G.cur);
    const each = foes.length ? Math.round(c.split / foes.length) : 0;
    plan = foes.map((x) => [x, each]);
  } else if (c.splitSelf) {
    const all = aliveIndices(G);
    const each = all.length ? Math.round(c.splitSelf / all.length) : 0;
    plan = all.map((x) => [x, each]);
  } else if (needTarget(c) && !c.rv && !c.heal) {
    plan = [[targetIdx, c.d || 0]];
  }

  for (const [x, baseDmg] of plan) {
    const t = G.ps[x];
    if (!t || t.dead) continue;
    if (!baseDmg) {
      landed[x] = 1;
      continue;
    }
    let d = baseDmg * mult;
    if (c.crit && t.stun > 0) {
      d *= 2;
      addLog(G, '💥 Chí mạng!');
    }
    landed[x] = (landed[x] || 0) + (await applyHit(G, p, t, d, c));
    if (c.j) {
      for (const y of adjacentIndices(G, x)) await applyHit(G, p, G.ps[y], c.j * mult, c);
    }
    for (const q of [...p.pets]) {
      if (!q.aoeTurn && x !== G.cur) await applyHit(G, p, t, q.atk, null);
    }
  }

  for (const k of Object.keys(landed)) {
    const t = G.ps[k];
    if (!t || t.dead || !landed[k]) continue;
    if (c.el) await applyMark(G, t, c.el);
    if (c.st && t.immune <= 0) t.stun = Math.max(t.stun, c.st);
    if (c.ms) adjustSp(G, t, -c.ms);
    if (c.ma) adjustSp(G, t, -c.ma);
    if (c.dt) t.dodge = Math.max(0, t.dodge - c.dt);
    if (c.bl && t.immune <= 0) t.bleed += c.bl;
    if (c.kp) t.pets = [];
    if (c.rd && t.hand.length) {
      const removed = t.hand.splice(Math.floor(Math.random() * t.hand.length), 1)[0];
      addLog(G, `🗑 Hủy thẻ ${removed.n} của ${t.name}`);
    }
    if (c.rs && t.hand.length) {
      const stolen = t.hand.splice(Math.floor(Math.random() * t.hand.length), 1)[0];
      p.hand.push({ ...stolen, age: 0 });
      addLog(G, `🫳 Cướp 1 thẻ từ ${t.name}`);
    }
  }

  const events = [...G.q];
  if (!checkWin(G) && p.dead) {
    await endTurn(G);
  }
  return { ok: true, events };
}

export function pickBotAction(G) {
  if (!G || G.over) return { type: 'end' };
  const p = G.ps[G.cur];
  if (p.pets.some((q) => q.lock)) return { type: 'end' };

  const targets = aliveIndices(G).filter((x) => x !== G.cur && !G.ps[x].corpse);
  const allTargets = aliveIndices(G).filter((x) => x !== G.cur);
  const hasCorpse = aliveIndices(G).some((x) => x !== G.cur && G.ps[x].corpse);

  const chooseTarget = (preferCorpse = false) => {
    if (preferCorpse) {
      const cIdx = allTargets.find((x) => G.ps[x].corpse);
      if (cIdx != null) return cIdx;
    }
    const pool = targets.length ? targets : allTargets;
    const l = p.last;
    return l != null && l !== G.cur && G.ps[l] && !G.ps[l].dead && !G.ps[l].corpse
      ? l
      : pool[Math.floor(Math.random() * pool.length)];
  };

  const options = [];
  p.hand.forEach((c, i) => {
    if (c.au || (c.hpl && p.hp < 2000)) return;
    if ((c.heal || c.healSelf) && p.hp >= 3200) return;

    let sc =
      (c.d || 0) +
      (c.a || 0) * targets.length +
      (c.split || 0) +
      (c.splitSelf ? c.splitSelf * 0.4 : 0) +
      (c.h || []).reduce((a, b) => a + b, 0) +
      (c.ar || 0) * 0.8 +
      (c.heal || c.healSelf || 0) * (p.hp < 2500 ? 0.9 : 0.2) +
      (c.pet ? c.pet[0] * c.pet[1] * 0.6 : 0) +
      (c.b ? 150 : 0) +
      (c.dg || 0) * 0.5 +
      (c.ms || 0) * 30 +
      20;
    if (p.hp < 1200 && c.ar) sc += 200;
    if (c.ds && hasCorpse) sc += 900;
    sc *= 0.7 + Math.random() * 0.6;
    if (!needTarget(c)) {
      options.push([sc, i, -1]);
      return;
    }
    if (c.heal && c.ally) {
      options.push([sc, i, G.cur]);
      return;
    }
    if (c.rv) {
      G.ps.forEach((q, x) => {
        if (q.dead && !q.destroyed && (!G.teams || !c.edo || q.team === p.team)) {
          options.push([sc, i, x]);
        }
      });
      return;
    }
    if (allTargets.length) options.push([sc, i, chooseTarget(!!c.ds)]);
  });

  options.sort((a, b) => b[0] - a[0]);
  if (!options.length) return { type: 'end' };
  const [, index, target] = options[0];
  const card = p.hand[index];
  return {
    type: 'use',
    index,
    target,
    hitList: card.h ? card.h.map(() => chooseTarget(false)) : null,
  };
}

export function sanitizeStateFor(G, viewerUid) {
  return {
    online: G.online,
    teams: G.teams,
    cur: G.cur,
    turnCount: G.turnCount,
    log: G.log.slice(-40),
    over: G.over,
    showTurn: G.showTurn,
    ps: G.ps.map((p) => {
      const isMe = viewerUid && p.uid === viewerUid;
      return {
        name: p.name,
        bot: p.bot,
        uid: p.uid,
        team: p.team,
        hp: p.hp,
        sp: p.sp,
        dodge: isMe ? p.dodge : null,
        armor: p.armor,
        armorT: p.armorT,
        pets: p.pets,
        buffs: p.buffs,
        marks: p.marks,
        bleed: p.bleed,
        stun: p.stun,
        immune: p.immune,
        regen: p.regen,
        edo: p.edo,
        corpse: p.corpse,
        izm: p.izm,
        dead: p.dead,
        destroyed: p.destroyed,
        destiny: isMe ? p.destiny : null,
        handCount: p.hand.length,
        hand: isMe ? p.hand : [],
      };
    }),
  };
}
