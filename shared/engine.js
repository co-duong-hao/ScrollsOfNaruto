import { CARDS, HIDDEN_CLANS, CLANS, REACTIONS, getCardTitle, formatCardLogName } from './cards.js';

export const TEAM_NAMES = ['Phe Đỏ', 'Phe Xanh'];
export const EDO_HP = 1e9;

export function totalArmor(p) {
  if (!p) return 0;
  const temp = Array.isArray(p.tempArmors) ? p.tempArmors.reduce((s, x) => s + (x.amt || 0), 0) : 0;
  return (p.armor || 0) + temp;
}

function addTempArmor(p, amt, turns) {
  if (!amt || amt <= 0) return;
  if (!Array.isArray(p.tempArmors)) p.tempArmors = [];
  const existing = p.tempArmors.find((x) => x.t === turns);
  if (existing) {
    existing.amt += amt;
  } else {
    p.tempArmors.push({ amt, t: turns });
    p.tempArmors.sort((a, b) => a.t - b.t);
  }
}

function absorbArmorDamage(p, dmg) {
  let rem = dmg;
  let absorbed = 0;
  if (Array.isArray(p.tempArmors) && p.tempArmors.length) {
    p.tempArmors.sort((a, b) => a.t - b.t);
    for (const layer of p.tempArmors) {
      if (rem <= 0) break;
      const take = Math.min(layer.amt, rem);
      layer.amt -= take;
      rem -= take;
      absorbed += take;
    }
    p.tempArmors = p.tempArmors.filter((x) => x.amt > 0);
  }
  if (rem > 0 && p.armor > 0) {
    const take = Math.min(p.armor, rem);
    p.armor -= take;
    rem -= take;
    absorbed += take;
  }
  return absorbed;
}

export const needTarget = (c) =>
  !c.a && !!(c.d || c.h || c.ms || c.rv || c.dt || c.heal || c.koto || c.gourdMark);

export function previewReaction(existingMarks, incomingEl) {
  if (!incomingEl || !Array.isArray(existingMarks) || existingMarks.length !== 1) return null;
  const a = existingMarks[0];
  const b = incomingEl;
  if (a === 'phong' || b === 'phong') {
    const other = a === 'phong' ? b : a;
    if (other === 'phong') {
      return { key: 'phong+phong', name: 'Tiêu thụ Phong', desc: 'Xóa 2 ấn Phong' };
    }
    return {
      key: `phong+${other}`,
      name: `Khuếch tán (${other})`,
      desc: `Lan ấn ${other} sang 2 người cạnh bên`,
    };
  }
  const key = [a, b].sort().join('+');
  const rx = REACTIONS[key];
  return rx ? { key, ...rx } : null;
}

export function calcExpectedDamage(G, actorIdx, card, targetIdx = -1) {
  const p = G?.ps?.[actorIdx];
  if (!p || !card) return { dmg: 0, isCrit: false, mult: 1 };

  let mult =
    1 +
    p.buffs.reduce(
      (a, b) =>
        a +
        (b.m || 0) +
        (b.hy && card.s === CLANS.HYUGA ? b.hy : 0) +
        (b.clanM && b.clanM.clan === card.s ? b.clanM.m : 0),
      0
    );
  if (p.edo || p.weak) mult *= 0.5;

  let base = 0;
  if (card.c0) {
    const baseHp = p.hp >= EDO_HP ? 4000 : p.hp;
    const lost = Math.max(0, baseHp - Math.max(1, Math.floor(baseHp * (1 - card.c0.lossPct / 100))));
    base = Math.round(lost * (card.c0.dmgPct / 100));
  } else if (card.h) {
    base = card.h.reduce((a, b) => a + b, 0);
  } else if (card.a) {
    base = card.a;
  } else if (card.split) {
    const foes = aliveIndices(G).filter((x) => x !== actorIdx);
    base = foes.length ? Math.round(card.split / foes.length) : 0;
  } else if (card.splitSelf) {
    const all = aliveIndices(G);
    base = all.length ? Math.round(card.splitSelf / all.length) : 0;
  } else if (card.d) {
    base = card.d;
  }

  let dmg = Math.round(base * mult);
  const target = targetIdx >= 0 ? G.ps[targetIdx] : null;
  const isCrit = !!(card.crit && target && target.stun > 0);
  if (isCrit) dmg *= 2;

  return { dmg, isCrit, mult };
}

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
    tempArmors: [],
    pets: [],
    buffs: [],
    marks: [],
    bleed: 0,
    stun: 0,
    immune: 0,
    stealth: 0,
    koto: null,
    gourd: null,
    bugMark: null,
    regen: [],
    edo: 0,
    corpse: 0,
    weak: 0,
    puppetMaster: null,
    izm: 0,
    last: null,
    hand: [],
    aff: {},
    destiny: pickDestiny(),
    dead: 0,
    destroyed: 0,
    stats: {
      dmgDealt: 0,
      dmgTaken: 0,
      reactions: 0,
      cardsUsed: 0,
      kos: 0,
      healed: 0,
    },
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
  if (q.stealth > 0) return false;
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

function pushFloat(G, targetPlayer, tx, cls, sfx = null) {
  const ev = { t: G.ps.indexOf(targetPlayer), tx, c: cls };
  if (sfx) ev.sfx = sfx;
  G.q.push(ev);
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
      pushFloat(G, p, 'Cạn tinh thần!', 'au');
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

async function checkDeath(G, p, killer = null) {
  if (p.hp > 0 || p.dead) return;
  const k = p.hand.findIndex((c) => c.au === 'rev');
  if (k >= 0) {
    const revCard = p.hand[k];
    const ok = await askAuto(G, p, revCard, { reason: 'revive' });
    if (ok) {
      const idx = p.hand.indexOf(revCard);
      if (idx >= 0) p.hand.splice(idx, 1);
      p.hp = 500;
      addTempArmor(p, 500, 1);
      addLog(G, `${p.name} kích hoạt Izanagi hồi sinh (500 máu, 500 giáp tạm 1 lượt)`);
      pushFloat(G, p, 'IZANAGI!', 'au');
      return;
    }
  }
  p.dead = 1;
  p.hp = 0;
  p.armor = 0;
  p.tempArmors = [];
  p.hand = [];
  p.pets = [];
  p.marks = [];
  if (killer && killer !== p && killer.stats) killer.stats.kos++;
  addLog(G, `${p.name} đã bị kết liễu!`);
  pushFloat(G, p, 'KẾT LIỄU!', 'ko');
}

async function directDamage(G, p, dmg, emitFloat = true, creditSource = null) {
  if (p.hp >= EDO_HP) return;
  dmg = Math.round(dmg);
  if (dmg > 0) {
    p.hp -= dmg;
    if (p.stats) p.stats.dmgTaken += dmg;
    if (creditSource && creditSource !== p && creditSource.stats) {
      creditSource.stats.dmgDealt += dmg;
    }
    if (emitFloat) pushFloat(G, p, `-${dmg}`, 'hp');
  }
  await checkDeath(G, p, creditSource);
}

async function applyHit(G, source, target, dmg, card, ignoreEvasion = false, statCredit = null) {
  dmg = Math.round(dmg);
  if (target.dead) return 0;
  if (source && source !== target) {
    target.last = G.ps.indexOf(source);
    if (source.gourd && G.ps[source.gourd.ownerIdx] === target) {
      source.gourd = null;
      if (source.immune <= 0) {
        source.stun = Math.max(source.stun, 1);
        addLog(G, `Hồng Hồ Lô kích hoạt! ${source.name} bị Choáng 1 vòng`);
        pushFloat(G, source, 'CHOÁNG!', 'au');
      }
    }
  }
  const credit = statCredit || source;

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
        cardName: card ? formatCardLogName(card) : 'Đòn đánh',
      });
      if (!ok) continue;
      const idx = target.hand.indexOf(x);
      if (idx >= 0) target.hand.splice(idx, 1);
      if (x.au !== 'izm') {
        addLog(G, `${target.name} kích hoạt ${formatCardLogName(x)}`);
        pushFloat(G, target, `${getCardTitle(x)}!`, 'au', x.au === 'trap' ? 'genjutsu' : null);
      }
      if (x.au === 'kl' && card && card.t === 'a') target.hand.push({ ...card, age: 0 });
      if (x.au === 'kr') target.armor += 150;
      if (x.au === 'gq' && target.hp < EDO_HP) {
        target.hp += dmg;
        if (target.stats) target.stats.healed += dmg;
        pushFloat(G, target, `+${dmg} HP`, 'au');
      }
      if (x.au === 'trap' && source) {
        await directDamage(G, source, dmg, true, target);
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
      addLog(G, `${target.name} né thành công`);
      pushFloat(G, target, 'NÉ!', 'dg');
      return 0;
    }
  }

  if (card?.ba && totalArmor(target) > 0) {
    target.armor = 0;
    target.tempArmors = [];
    target.buffs = target.buffs.filter((b) => !b.ua);
    addLog(G, `${formatCardLogName(card)} phá vỡ toàn bộ giáp của ${target.name}!`);
    pushFloat(G, target, 'PHÁ GIÁP', 'ar');
  }

  if (target.pets.length) {
    const pet = target.pets[0];
    pet.hp -= dmg;
    if (credit && credit !== target && credit.stats) credit.stats.dmgDealt += dmg;
    addLog(G, `Pet của ${target.name} đỡ ${dmg} sát thương`);
    pushFloat(G, target, `Pet -${dmg}`, 'pt');
    if (pet.hp <= 0) {
      target.pets.shift();
      addLog(G, `Pet của ${target.name} bị tiêu diệt`);
    }
    return 1;
  }

  const clanDrBuff = card ? target.buffs.find((b) => b.clanDr && b.clanDr.clan === card.s) : null;
  if (clanDrBuff) {
    dmg = Math.round(dmg * (1 - clanDrBuff.clanDr.dr));
  }

  const drBuff = target.buffs.find((b) => b.dr && totalArmor(target) > 0);
  if (drBuff) {
    dmg = Math.round(dmg * (1 - drBuff.dr));
  }

  let reflected = false;
  const absorbed = absorbArmorDamage(target, dmg);
  if (absorbed > 0) {
    dmg -= absorbed;
    if (credit && credit !== target && credit.stats) credit.stats.dmgDealt += absorbed;
    const rfBuff = target.buffs.find((b) => b.rf);
    if (source && !source.dead && rfBuff) {
      const rfAmt = typeof rfBuff.rf === 'number' ? rfBuff.rf : 20;
      addLog(G, `Giáp của ${target.name} phản ${rfAmt} sát thương lên ${source.name}`);
      await directDamage(G, source, rfAmt, true, target);
      reflected = true;
    }
  }
  if (!reflected && source && !source.dead) {
    const rfAlwaysBuff = target.buffs.find((b) => b.rf && b.rfAlways);
    if (rfAlwaysBuff) {
      const rfAmt = typeof rfAlwaysBuff.rf === 'number' ? rfAlwaysBuff.rf : 20;
      addLog(G, `${rfAlwaysBuff.n} của ${target.name} phản ${rfAmt} sát thương lên ${source.name}`);
      await directDamage(G, source, rfAmt, true, target);
    }
  }
  if (totalArmor(target) <= 0) {
    target.armor = 0;
    target.tempArmors = [];
    target.buffs = target.buffs.filter((b) => !b.ua);
  }
  if (dmg > 0) await directDamage(G, target, dmg, false, credit);

  addLog(G, `${target.name} nhận ${dmg + absorbed} sát thương${absorbed ? ` (giáp chặn ${absorbed})` : ''}`);
  if (dmg > 0) pushFloat(G, target, `-${dmg}`, 'hp');
  if (absorbed > 0) pushFloat(G, target, `Giáp -${absorbed}`, 'ar');
  return 1;
}

async function applyMark(G, target, el, actor = null) {
  if (target.dead || target.immune > 0) return;
  target.marks.push(el);
  if (target.marks.length < 2) return;

  const credit = actor || G.ps[G.cur] || null;
  const [a, b] = target.marks;
  target.marks = [];
  const key = [a, b].sort().join('+');
  const neighbors = adjacentIndices(G, G.ps.indexOf(target)).map((i) => G.ps[i]);
  const rxName = REACTIONS[key]?.name || 'Khuếch tán nguyên tố';

  if (credit?.stats) credit.stats.reactions++;
  addLog(G, `Phản ứng [${rxName}] (${key}) trên ${target.name}`);
  pushFloat(G, target, `${rxName}`, 'rx');

  if (a === 'phong' || b === 'phong') {
    const other = a === 'phong' ? b : a;
    if (other !== 'phong') {
      target.marks = [other];
      for (const n of neighbors) await applyMark(G, n, other, credit);
    }
    return;
  }

  if (key === 'lôi+thủy') {
    for (const n of [target, ...neighbors]) await applyHit(G, null, n, 50, null, true, credit);
  } else if (key === 'hỏa+thủy') {
    await applyHit(G, null, target, 100, null, true, credit);
  } else if (key === 'hỏa+hỏa') {
    if (target.immune <= 0) target.bleed += 150;
  } else if (key === 'thủy+thủy') {
    target.dodge = Math.max(0, target.dodge - 30);
  } else if (key === 'lôi+lôi') {
    adjustSp(G, target, -1);
    await directDamage(G, target, 30, true, credit);
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
    addLog(G, `${winner} chiến thắng!`);
    return true;
  }
  return false;
}

export async function startTurn(G, _chained = false) {
  if (checkWin(G)) return;
  let guard = 0;
  while (G.ps[G.cur].dead && guard < G.ps.length) {
    G.cur = (G.cur + 1) % G.ps.length;
    guard++;
  }
  const p = G.ps[G.cur];
  G.used = [];
  if (!_chained) G.q = [];
  G.showTurn = 1;
  addLog(G, `— Lượt ${p.name} —`);

  if (p.stealth > 0) p.stealth--;

  if (p.bleed > 0) {
    p.bleed = Math.max(0, p.bleed - 50);
    addLog(G, `${p.name} chảy máu −50`);
    await directDamage(G, p, 50, true);
  }
  if (!p.dead) {
    for (const b of p.buffs) {
      if (b.healTurn && p.hp < EDO_HP) {
        p.hp += b.healTurn;
        if (p.stats) p.stats.healed += b.healTurn;
        addLog(G, `${p.name} hồi ${b.healTurn} máu (${b.n})`);
        pushFloat(G, p, `+${b.healTurn} HP`, 'au');
      }
      if (b.maxHpDrain && !p.dead) {
        const drain = Math.round(4000 * (b.maxHpDrain / 100));
        addLog(G, `${b.n}: ${p.name} mất ${drain} máu`);
        await directDamage(G, p, drain, true);
      }
    }
  }
  if (p.regen.length && !p.dead && p.hp < 4000) {
    p.regen.forEach((rg) => {
      const missing = Math.max(0, 4000 - p.hp);
      const healAmt = Math.round(missing * (rg.pct / 100));
      if (healAmt > 0) {
        p.hp = Math.min(4000, p.hp + healAmt);
        if (p.stats) p.stats.healed += healAmt;
        addLog(G, `${p.name} hồi ${healAmt} máu (Sáng tạo diêm sinh)`);
        pushFloat(G, p, `+${healAmt} HP`, 'au');
      }
      rg.t--;
    });
    p.regen = p.regen.filter((rg) => rg.t > 0);
  }
  if (Array.isArray(p.tempArmors) && p.tempArmors.length) {
    let expiredAmt = 0;
    p.tempArmors.forEach((s) => {
      s.t--;
      if (s.t <= 0) expiredAmt += s.amt;
    });
    p.tempArmors = p.tempArmors.filter((s) => s.t > 0 && s.amt > 0);
    if (expiredAmt > 0) {
      addLog(G, `Giáp tạm (${expiredAmt}) của ${p.name} đã hết hạn`);
      if (totalArmor(p) <= 0) {
        p.buffs = p.buffs.filter((b) => !b.ua);
      }
    }
  }

  if (p.dead) {
    return nextTurn(G, true);
  }

  const aoePets = p.pets.filter((q) => q.aoeTurn);
  if (aoePets.length) {
    const foes = aliveIndices(G).filter((i) => i !== G.cur);
    for (const pet of aoePets) {
      const pName = pet.name || 'Shukaku';
      addLog(G, `${pName} của ${p.name} gầm thét, tấn công cả bàn (${pet.atk} sát thương)!`);
      for (const idx of foes) await applyHit(G, p, G.ps[idx], pet.atk, null);
    }
    if (checkWin(G)) return;
  }

  const lockPet = p.pets.find((q) => q.lock);
  if (lockPet) {
    addLog(G, `${p.name} bị khóa chủ động bởi ${lockPet.name || 'Mộng Nhất Vĩ'}`);
    return endTurn(G, false, true);
  }

  if (p.stun > 0) {
    p.stun--;
    addLog(G, `${p.name} bị Choáng, mất lượt`);
    pushFloat(G, p, 'CHOÁNG', 'au');
    return endTurn(G, true, true);
  }
  if (p.izm) {
    p.izm = 0;
    G.snap = structuredClone(G.ps);
    G.snapFor = G.cur;
  }
}

export async function nextTurn(G, _chained = false) {
  if (checkWin(G)) return;
  G.cur = (G.cur + 1) % G.ps.length;
  G.turnCount++;
  await startTurn(G, _chained);
}

export async function endTurn(G, skipDraw = false, _chained = false) {
  if (!_chained) G.q = [];
  if (checkWin(G)) return { events: [...G.q] };
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
    const expiredBuffs = [];
    p.buffs.forEach((b) => {
      b.t--;
      if (b.t <= 0) expiredBuffs.push(b);
    });
    p.buffs = p.buffs.filter((b) => b.t > 0);
    for (const eb of expiredBuffs) {
      if (eb.endSp) {
        addLog(G, `${eb.n} hết hiệu lực: ${p.name} ${eb.endSp} tinh thần`);
        adjustSp(G, p, eb.endSp);
      }
      if (eb.stackClan && (eb.stacks || 0) > 0) {
        const boomDmg = eb.stacks * (eb.stackDmg || 100);
        const foes = aliveIndices(G).filter((x) => x !== G.cur && (!G.teams || G.ps[x].team !== p.team));
        addLog(G, `${eb.n} kết thúc! Nổ ${eb.stacks} điểm = ${boomDmg} sát thương lên mọi kẻ địch!`);
        pushFloat(G, p, `NỔ ${boomDmg}!`, 'rx');
        for (const idx of foes) await applyHit(G, p, G.ps[idx], boomDmg, null);
        if (checkWin(G)) return { events: [...G.q] };
      }
    }
    if (p.immune > 0) p.immune--;
    if (p.bugMark) {
      p.bugMark.t--;
      if (p.bugMark.t <= 0) p.bugMark = null;
    }
    if (p.koto) {
      p.koto.t--;
      if (p.koto.t <= 0) p.koto = null;
    }
    if (p.gourd) {
      p.gourd.t--;
      if (p.gourd.t <= 0) p.gourd = null;
    }
    p.hand = p.hand.filter((c) => {
      if (c.au) return true;
      c.age = (c.age || 0) + 1;
      if (c.age >= 3) {
        addLog(G, `Thẻ ${formatCardLogName(c)} của ${p.name} hết hạn (3 lượt)`);
        return false;
      }
      return true;
    });
    if (!skipDraw) {
      drawCard(p);
      drawCard(p);
    }
  }
  await nextTurn(G, true);
  return { events: [...G.q] };
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
  if (p.stats) p.stats.cardsUsed++;
  G.used.push(c.s);
  G.q = [];

  // Kotoamatsukami mind-control redirection for offensive targeted cards
  if (p.koto && needTarget(c) && !c.ally && !c.rv && !c.heal && !c.koto && !c.gourdMark) {
    const teammates = G.teams
      ? aliveIndices(G).filter((x) => x !== G.cur && G.ps[x].team === p.team && G.ps[x].stealth <= 0)
      : [];
    const redirectOne = (orig) => {
      if (teammates.length) {
        return teammates[Math.floor(Math.random() * teammates.length)];
      }
      if (orig === p.koto.casterIdx) {
        const others = aliveIndices(G).filter((x) => x !== G.cur && x !== p.koto.casterIdx && G.ps[x].stealth <= 0);
        return others.length ? others[Math.floor(Math.random() * others.length)] : G.cur;
      }
      return orig;
    };
    if (c.h && Array.isArray(hitList)) {
      hitList = hitList.map((x) => redirectOne(x));
      targetIdx = hitList[0];
      addLog(G, `Kotoamatsukami điều khiển ${p.name} đổi mục tiêu!`);
    } else {
      const nextTgt = redirectOne(targetIdx);
      if (nextTgt !== targetIdx) {
        targetIdx = nextTgt;
        addLog(G, `Kotoamatsukami ép ${p.name} tấn công ${G.ps[targetIdx].name}!`);
      }
    }
  }

  const T = G.ps[targetIdx];

  G.q.push({
    k: 'cast',
    n: c.n,
    jp: c.jp || c.n,
    kj: c.kj || '',
    r: c.r,
    t: c.t,
    s: c.s,
    el: c.el || null,
    srcIdx: G.cur,
    who: p.name,
    sub:
      c.a || c.split || c.splitSelf || c.c0
        ? 'lên cả bàn'
        : c.h || c.gourdMark
          ? ''
          : T && needTarget(c)
            ? `→ ${T.name}`
            : '',
  });
  addLog(
    G,
    `${p.name} dùng ${formatCardLogName(c)}${c.h || c.gourdMark ? '' : T && !c.a && needTarget(c) ? ` → ${T.name}` : ''}`
  );

  // Action-triggered debuff: Trùng Bám Đuổi
  if (p.bugMark && p.bugMark.t > 0 && !p.dead) {
    const srcP = p.bugMark.srcIdx != null ? G.ps[p.bugMark.srcIdx] : null;
    addLog(G, `Trùng Bám Đuổi cắn ${p.name} −${p.bugMark.dmg} máu`);
    await directDamage(G, p, p.bugMark.dmg, true, srcP);
    if (p.dead) {
      const events = [...G.q];
      if (!checkWin(G)) await endTurn(G);
      return { ok: true, events };
    }
  }

  // Active clan-synergy buff triggers (Thủy Giao Đạn, Sa Mạc Bảo Hộ, Đất Sét Nổ)
  for (const b of p.buffs) {
    if (b.clanHeal && c.s === b.clanHeal.clan && p.hp < EDO_HP) {
      p.hp += b.clanHeal.amt;
      if (p.stats) p.stats.healed += b.clanHeal.amt;
      addLog(G, `${b.n}: ${p.name} hồi ${b.clanHeal.amt} máu`);
      pushFloat(G, p, `+${b.clanHeal.amt} HP`, 'au');
    }
    if (b.clanArmor && c.s === b.clanArmor.clan) {
      p.armor += b.clanArmor.amt;
      addLog(G, `${b.n}: ${p.name} nhận +${b.clanArmor.amt} giáp`);
      pushFloat(G, p, `Giáp +${b.clanArmor.amt}`, 'ar');
    }
    if (b.stackClan && c.s === b.stackClan) {
      b.stacks = (b.stacks || 0) + 1;
      addLog(G, `${b.n}: tích điểm (×${b.stacks})`);
      pushFloat(G, p, `×${b.stacks}`, 'au');
    }
  }

  if (c.hpl && p.hp < EDO_HP) p.hp = Math.max(1, Math.floor(p.hp * (1 - c.hpl / 100)));
  if (c.sf) adjustSp(G, p, c.sf);
  if (c.dg) p.dodge += c.dg;
  if (c.stealth) {
    p.stealth = Math.max(p.stealth, c.stealth);
    addLog(G, `${p.name} ẩn thân ${c.stealth} lượt`);
    pushFloat(G, p, 'ẨN THÂN', 'au');
  }
  if (c.ar) {
    if (c.at) {
      addTempArmor(p, c.ar, c.at);
    } else {
      p.armor += c.ar;
    }
  }
  if (c.heal && T && !T.dead && T.hp < EDO_HP) {
    T.hp += c.heal;
    if (p.stats) p.stats.healed += c.heal;
    addLog(G, `${T.name} hồi ${c.heal} máu`);
    pushFloat(G, T, `+${c.heal} HP`, 'au');
  }
  if (c.healSelf && p.hp < EDO_HP) {
    p.hp += c.healSelf;
    if (p.stats) p.stats.healed += c.healSelf;
    addLog(G, `${p.name} hồi ${c.healSelf} máu`);
    pushFloat(G, p, `+${c.healSelf} HP`, 'au');
  }
  if (c.cleanse) {
    p.bleed = 0;
    p.marks = [];
    p.stun = 0;
    p.izm = 0;
    p.bugMark = null;
    p.koto = null;
    p.gourd = null;
    addLog(G, `${p.name} giải toàn bộ hiệu ứng xấu`);
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
        name: c.pet[5] || (c.pet[3] ? 'Shukaku' : ''),
      });
      if (p.pets.length > 3) p.pets.shift();
    }
  }
  if (c.b) {
    p.buffs.push({ n: getCardTitle(c), ...c.b, stacks: c.b.stackClan ? 0 : undefined, t: c.b.t || 99 });
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
  if (c.koto && T && !T.dead) {
    if (T.immune <= 0) {
      T.koto = { t: c.koto, casterIdx: G.cur };
      addLog(G, `${T.name} trúng Kotoamatsukami (${c.koto} vòng)!`);
      pushFloat(G, T, 'BỊ ĐIỀU KHIỂN!', 'au');
    } else {
      addLog(G, `${T.name} miễn nhiễm Kotoamatsukami`);
    }
  }
  if (c.gourdMark && T && !T.dead) {
    // Secret trap mark: no log or floating text revealing the target
    T.gourd = { ownerIdx: G.cur, t: 1 };
  }
  if (c.rv && T) {
    T.dead = 0;
    if (c.edo) {
      T.hp = EDO_HP;
      T.edo = 1;
      T.corpse = 1;
      T.weak = 0;
      T.puppetMaster = null;
      addLog(G, `${T.name} được Uế Thổ Chuyển Sinh (máu ∞, -50% sát thương)`);
      pushFloat(G, T, 'UẾ THỔ!', 'au');
    } else if (c.puppetRevive) {
      T.hp = 500;
      T.edo = 0;
      T.corpse = 1;
      T.weak = 1;
      T.puppetMaster = p.name;
      if (G.teams) T.team = p.team;
      T.bot = p.bot;
      if (p.uid) T.uid = p.uid;
      addLog(G, `${p.name} biến ${T.name} thành con rối (500 máu, -50% sát thương)`);
      pushFloat(G, T, 'RỐI!', 'au');
    } else {
      T.hp = 1000;
      T.edo = 0;
      T.corpse = 0;
      T.weak = 0;
      T.puppetMaster = null;
      addLog(G, `${T.name} được hồi sinh với 1000 máu`);
      pushFloat(G, T, 'HỒI SINH!', 'au');
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
    addLog(G, `Thi thể ${T.name} bị tiêu diệt vĩnh viễn`);
  }

  let mult =
    1 +
    p.buffs.reduce(
      (a, b) =>
        a +
        (b.m || 0) +
        (b.hy && c.s === CLANS.HYUGA ? b.hy : 0) +
        (b.clanM && b.clanM.clan === c.s ? b.clanM.m : 0),
      0
    );
  if (p.edo || p.weak) mult *= 0.5;

  const landed = {};
  let plan = [];
  if (c.c0) {
    const baseHp = p.hp >= EDO_HP ? 4000 : p.hp;
    const lost = Math.max(0, baseHp - Math.max(1, Math.floor(baseHp * (1 - c.c0.lossPct / 100))));
    if (p.hp < EDO_HP) p.hp -= lost;
    const c0Dmg = Math.round(lost * (c.c0.dmgPct / 100));
    addLog(G, `${p.name} tự bạo mất ${lost} máu, gây ${c0Dmg} sát thương diện rộng!`);
    const foes = aliveIndices(G).filter((x) => x !== G.cur && (!G.teams || G.ps[x].team !== p.team));
    plan = foes.map((x) => [x, c0Dmg]);
  } else if (c.h) {
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
  } else if (needTarget(c) && !c.rv && !c.heal && !c.koto && !c.gourdMark) {
    plan = [[targetIdx, c.d || 0]];
  }

  let firstAttackedTarget = null;
  for (const [x, baseDmg] of plan) {
    const t = G.ps[x];
    if (!t || t.dead) continue;
    if (!firstAttackedTarget && x !== G.cur && baseDmg > 0) firstAttackedTarget = t;
    if (!baseDmg) {
      landed[x] = 1;
      continue;
    }
    let d = baseDmg * mult;
    if (c.crit && t.stun > 0) {
      d *= 2;
      addLog(G, 'Chí mạng!');
    }
    landed[x] = (landed[x] || 0) + (await applyHit(G, p, t, d, c));
    if (c.j) {
      for (const y of adjacentIndices(G, x)) await applyHit(G, p, G.ps[y], c.j * mult, c);
    }
    for (const q of [...p.pets]) {
      if (!q.aoeTurn && x !== G.cur) await applyHit(G, p, t, q.atk, null);
    }
  }

  // Extra attack hit from active buff (e.g., Ma Kính Băng Tinh: +100 dmg + thủy mark once per turn)
  if (firstAttackedTarget && !firstAttackedTarget.dead) {
    for (const b of p.buffs) {
      if (b.extraHit && b._usedTurn !== G.turnCount) {
        b._usedTurn = G.turnCount;
        addLog(G, `${b.n} gây thêm ${b.extraHit} sát thương phụ lên ${firstAttackedTarget.name}`);
        const extraLanded = await applyHit(G, p, firstAttackedTarget, b.extraHit, null);
        if (extraLanded && b.extraEl && !firstAttackedTarget.dead) {
          await applyMark(G, firstAttackedTarget, b.extraEl, p);
        }
      }
    }
  }

  let hitTargetCount = 0;
  for (const k of Object.keys(landed)) {
    const t = G.ps[k];
    if (!t || t.dead || !landed[k]) continue;
    if (Number(k) !== G.cur) hitTargetCount++;
    if (c.el) await applyMark(G, t, c.el, p);
    if (c.st && t.immune <= 0) t.stun = Math.max(t.stun, c.st);
    if (c.ms) adjustSp(G, t, -c.ms);
    if (c.ma) adjustSp(G, t, -c.ma);
    if (c.dt) t.dodge = Math.max(0, t.dodge - c.dt);
    if (c.bl && t.immune <= 0) t.bleed += c.bl;
    if (c.bugMark && t.immune <= 0) {
      t.bugMark = { dmg: c.bugMark.dmg, t: c.bugMark.t, srcIdx: G.cur };
      addLog(G, `${t.name} bị Trùng Bám Đuổi đánh dấu (${c.bugMark.t} lượt)`);
      pushFloat(G, t, 'TRÙNG BÁM!', 'au');
    }
    if (c.kp) t.pets = [];
    if (c.rd && t.hand.length) {
      const removed = t.hand.splice(Math.floor(Math.random() * t.hand.length), 1)[0];
      addLog(G, `Hủy thẻ ${formatCardLogName(removed)} của ${t.name}`);
    }
    if (c.rs && t.hand.length) {
      const stolen = t.hand.splice(Math.floor(Math.random() * t.hand.length), 1)[0];
      p.hand.push({ ...stolen, age: 0 });
      addLog(G, `Cướp 1 thẻ từ ${t.name}`);
    }
  }

  if (c.healPerHit && hitTargetCount > 0 && !p.dead && p.hp < EDO_HP) {
    const healAmt = hitTargetCount * c.healPerHit;
    p.hp += healAmt;
    if (p.stats) p.stats.healed += healAmt;
    addLog(G, `${formatCardLogName(c)}: ${p.name} hồi ${healAmt} máu (${hitTargetCount} mục tiêu trúng đòn)`);
    pushFloat(G, p, `+${healAmt} HP`, 'au');
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

  const isEnemy = (x) =>
    x !== G.cur &&
    G.ps[x].stealth <= 0 &&
    (!G.teams || (p.koto ? G.ps[x].team === p.team : G.ps[x].team !== p.team));
  const allTargets = aliveIndices(G).filter(isEnemy);
  const targets = allTargets.filter((x) => !G.ps[x].corpse);
  const hasCorpse = allTargets.some((x) => G.ps[x].corpse);

  const chooseTarget = (preferCorpse = false, incomingEl = null) => {
    if (preferCorpse) {
      const cIdx = allTargets.find((x) => G.ps[x].corpse);
      if (cIdx != null) return cIdx;
    }
    const pool = targets.length ? targets : allTargets;
    if (!pool.length) return -1;
    if (incomingEl) {
      const rxTarget = pool.find((x) => {
        const q = G.ps[x];
        if (q.immune > 0) return false;
        const rx = previewReaction(q.marks, incomingEl);
        return rx && rx.key !== 'phong+phong';
      });
      if (rxTarget != null) return rxTarget;
    }
    const l = p.last;
    return l != null && pool.includes(l) ? l : pool[Math.floor(Math.random() * pool.length)];
  };

  const options = [];
  p.hand.forEach((c, i) => {
    if (c.au || (c.hpl && p.hp < 2000)) return;
    if (c.c0 && p.hp < 1800) return;
    if ((c.heal || c.healSelf) && p.hp >= 3200) return;

    let sc =
      (c.d || 0) +
      (c.a || 0) * targets.length +
      (c.c0 ? Math.min(p.hp, 4000) * 0.55 : 0) +
      (c.split || 0) +
      (c.splitSelf ? c.splitSelf * 0.4 : 0) +
      (c.h || []).reduce((a, b) => a + b, 0) +
      (c.ar || 0) * 0.8 +
      (c.heal || c.healSelf || 0) * (p.hp < 2500 ? 0.9 : 0.2) +
      (c.healPerHit ? c.healPerHit * targets.length * 0.5 : 0) +
      (c.pet ? c.pet[0] * c.pet[1] * 0.6 : 0) +
      (c.b ? 150 : 0) +
      (c.stealth ? 130 : 0) +
      (c.koto ? 200 : 0) +
      (c.gourdMark ? 110 : 0) +
      (c.bugMark ? 90 : 0) +
      (c.dg || 0) * 0.5 +
      (c.ms || 0) * 30 +
      (c.st ? 90 : 0) +
      (c.ba && targets.some((x) => totalArmor(G.ps[x]) > 0) ? 140 : 0) +
      (c.kp && targets.some((x) => G.ps[x].pets.length > 0) ? 120 : 0) +
      20;
    if (p.hp < 1200 && c.ar) sc += 200;
    if (c.ds && hasCorpse) sc += 900;

    if (!needTarget(c)) {
      if (c.el && targets.some((x) => G.ps[x].immune <= 0 && previewReaction(G.ps[x].marks, c.el))) {
        sc += 140;
      }
      sc *= 0.7 + Math.random() * 0.6;
      options.push([sc, i, -1]);
      return;
    }
    if (c.heal && c.ally) {
      sc *= 0.7 + Math.random() * 0.6;
      options.push([sc, i, G.cur]);
      return;
    }
    if (c.rv) {
      sc *= 0.7 + Math.random() * 0.6;
      G.ps.forEach((q, x) => {
        if (q.dead && !q.destroyed && (!G.teams || q.team === p.team)) {
          options.push([sc, i, x]);
        }
      });
      return;
    }
    if (allTargets.length) {
      const tgt = chooseTarget(!!c.ds, c.el || null);
      if (tgt >= 0) {
        if (c.el && G.ps[tgt].immune <= 0) {
          const rx = previewReaction(G.ps[tgt].marks, c.el);
          if (rx && rx.key !== 'phong+phong') sc += 160;
        }
        sc *= 0.7 + Math.random() * 0.6;
        options.push([sc, i, tgt]);
      }
    }
  });

  options.sort((a, b) => b[0] - a[0]);
  if (!options.length) return { type: 'end' };
  const [, index, target] = options[0];
  const card = p.hand[index];
  return {
    type: 'use',
    index,
    target,
    hitList: card.h ? card.h.map(() => chooseTarget(false, card.el || null)) : null,
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
        tempArmors: p.tempArmors || [],
        pets: p.pets,
        buffs: p.buffs,
        marks: p.marks,
        bleed: p.bleed,
        stun: p.stun,
        immune: p.immune,
        stealth: p.stealth,
        koto: p.koto,
        bugMark: p.bugMark,
        regen: p.regen,
        edo: p.edo,
        corpse: p.corpse,
        weak: p.weak,
        puppetMaster: p.puppetMaster,
        dead: p.dead,
        destroyed: p.destroyed,
        destiny: isMe ? p.destiny : null,
        handCount: p.hand.length,
        hand: isMe ? p.hand : [],
        stats: p.stats,
      };
    }),
  };
}
