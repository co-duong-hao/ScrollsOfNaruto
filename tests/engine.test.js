import test from 'node:test';
import assert from 'node:assert/strict';
import { CARDS, getCardTitle, formatCardLogName, normalizeSearchText } from '../shared/cards.js';
import {
  createGame,
  useCard,
  endTurn,
  sanitizeStateFor,
  pickBotAction,
  previewReaction,
  calcExpectedDamage,
  isValidTarget,
  needTarget,
  totalArmor,
  EDO_HP,
} from '../shared/engine.js';

test('CARDS has all 200 cards with unique sequential IDs', () => {
  assert.equal(CARDS.length, 200);
  const ids = new Set(CARDS.map((c) => c.id));
  assert.equal(ids.size, 200);
  for (let i = 0; i < 200; i++) {
    assert.equal(CARDS[i].id, i);
  }
});

test('createGame initializes players with 4000 HP, 10 SP, and 3 cards', async () => {
  const G = await createGame([
    { name: 'P1', bot: false, uid: 'u1' },
    { name: 'P2', bot: false, uid: 'u2' },
    { name: 'P3', bot: true, uid: 'u3' },
  ]);
  assert.equal(G.ps.length, 3);
  G.ps.forEach((p) => {
    assert.equal(p.hp, 4000);
    assert.equal(p.sp, 10);
    assert.equal(p.hand.length, 3);
  });
});

test('damage pipeline: pet absorbs hit and excess damage does not leak to HP', async () => {
  const G = await createGame([
    { name: 'Attacker', bot: false },
    { name: 'Defender', bot: false },
  ]);
  const defender = G.ps[1];
  defender.pets = [{ hp: 50, mx: 200, atk: 20 }];
  defender.dodge = 0;
  defender.hand = [];

  G.ps[0].hand = [CARDS.find((c) => c.n === 'rasengan')];
  const res = await useCard(G, 0, 1);
  assert.equal(res.ok, true);
  assert.equal(defender.pets.length, 0);
  assert.equal(defender.hp, 4000);
});

test('elemental reaction: hỏa + thủy deals 100 direct damage', async () => {
  const G = await createGame([
    { name: 'P1', bot: false },
    { name: 'P2', bot: false },
  ]);
  G.ps[1].dodge = 0;
  G.ps[1].hand = [];
  G.ps[0].hand = [
    CARDS.find((c) => c.n === 'hỏa độn'),
    CARDS.find((c) => c.n === 'thủy độn'),
  ];
  await useCard(G, 0, 1);
  await useCard(G, 0, 1);
  assert.equal(G.ps[1].hp, 4000 - 100 - 110 - 100);
  assert.deepEqual(G.ps[1].marks, []);
});

test('elemental reaction: phong spreads other mark to neighbors', async () => {
  const G = await createGame([
    { name: 'P1', bot: false },
    { name: 'P2', bot: false },
    { name: 'P3', bot: false },
  ]);
  G.ps.forEach((p) => {
    p.dodge = 0;
    p.hand = [];
  });
  G.ps[0].hand = [
    CARDS.find((c) => c.n === 'hỏa độn'),
    CARDS.find((c) => c.n === 'odama rasengan'),
  ];
  await useCard(G, 0, 1);
  await useCard(G, 0, 1);
  assert.deepEqual(G.ps[1].marks, ['hỏa']);
  assert.deepEqual(G.ps[0].marks, ['hỏa']);
  assert.deepEqual(G.ps[2].marks, ['hỏa']);
});

test('sanitizeStateFor hides opponent hand and dodge', async () => {
  const G = await createGame([
    { name: 'P1', bot: false, uid: 'u1' },
    { name: 'P2', bot: false, uid: 'u2' },
  ]);
  G.ps[1].dodge = 70;
  const view = sanitizeStateFor(G, 'u1');
  assert.equal(view.ps[0].hand.length, 3);
  assert.equal(view.ps[0].dodge, 0);
  assert.equal(view.ps[1].hand.length, 0);
  assert.equal(view.ps[1].handCount, 3);
  assert.equal(view.ps[1].dodge, null);
});

test('endTurn draws 2 cards and advances turn', async () => {
  const G = await createGame([
    { name: 'P1', bot: false },
    { name: 'P2', bot: false },
  ]);
  await endTurn(G);
  assert.equal(G.ps[0].hand.length, 5);
  assert.equal(G.cur, 1);
});

test('Lôi Thiết breaks target armor before dealing damage', async () => {
  const G = await createGame([
    { name: 'P1', bot: false },
    { name: 'P2', bot: false },
  ]);
  G.ps[1].armor = 500;
  G.ps[1].dodge = 0;
  G.ps[1].hand = [];
  G.ps[0].hand = [CARDS.find((c) => c.n === 'Lôi Thiết')];
  await useCard(G, 0, 1);
  assert.equal(G.ps[1].armor, 0);
  assert.equal(G.ps[1].hp, 3700);
});

test('Uế Thổ Chuyển Sinh revives as corpse with EDO_HP and Kim Sa Ấn destroys it', async () => {
  const G = await createGame([
    { name: 'P1', bot: false },
    { name: 'P2', bot: false },
    { name: 'P3', bot: false },
  ]);
  G.ps[1].dead = 1;
  G.ps[1].hp = 0;
  G.ps[2].dodge = 0;
  G.ps[0].hand = [
    CARDS.find((c) => c.n === 'Uế Thổ Chuyển Sinh'),
    CARDS.find((c) => c.n === 'kim sa ấn'),
  ];
  await useCard(G, 0, 1);
  assert.equal(G.ps[1].dead, 0);
  assert.equal(G.ps[1].hp, EDO_HP);
  assert.equal(G.ps[1].corpse, 1);

  G.ps[1].dodge = 0;
  G.ps[1].hand = [];
  await useCard(G, 0, 1);
  assert.equal(G.ps[1].dead, 1);
  assert.equal(G.ps[1].destroyed, 1);
});

test('destiny sets are assigned (2 clans) and hidden from opponents', async () => {
  const G = await createGame([
    { name: 'P1', bot: false, uid: 'u1' },
    { name: 'P2', bot: false, uid: 'u2' },
  ]);
  assert.equal(G.ps[0].destiny.length, 2);
  const view = sanitizeStateFor(G, 'u1');
  assert.equal(view.ps[0].destiny.length, 2);
  assert.equal(view.ps[1].destiny, null);
});

test('card age expires non-auto cards by rank (S=6, A=4, B/C=3) while keeping auto cards', async () => {
  const G = await createGame([
    { name: 'P1', bot: false },
    { name: 'P2', bot: false },
  ]);
  G.ps[0].hand = [
    { ...CARDS.find((c) => c.n === 'ném kunai'), age: 0 }, // C -> 3 turns
    { ...CARDS.find((c) => c.n === 'rasengan'), age: 0 },  // A -> 4 turns
    { ...CARDS.find((c) => c.n === 'izanagi'), age: 0 },   // auto -> never expires
  ];
  for (let k = 0; k < 5; k++) await endTurn(G, true); // P1 finished 3 turns
  assert.equal(G.ps[0].hand.some((c) => c.n === 'ném kunai'), false);
  assert.equal(G.ps[0].hand.some((c) => c.n === 'rasengan'), true);
  assert.equal(G.ps[0].hand.some((c) => c.n === 'izanagi'), true);

  await endTurn(G, true);
  await endTurn(G, true); // P1 finished 4 turns
  assert.equal(G.ps[0].hand.length, 1);
  assert.equal(G.ps[0].hand[0].n, 'izanagi');
});

test('direct heal has no 4000 HP cap', async () => {
  const G = await createGame([
    { name: 'P1', bot: false },
    { name: 'P2', bot: false },
  ]);
  G.ps[0].hand = [CARDS.find((c) => c.n === 'Trị Thương Thuật')];
  await useCard(G, 0, 0);
  assert.equal(G.ps[0].hp, 4400);
});

test('onAskAuto confirmation allows skipping auto-trigger card and emits KO finisher on lethal', async () => {
  const G = await createGame(
    [
      { name: 'P1', bot: false },
      { name: 'P2', bot: false },
    ],
    { onAskAuto: async () => false }
  );
  G.ps[1].hp = 150;
  G.ps[1].dodge = 0;
  G.ps[1].hand = [{ ...CARDS.find((c) => c.n === 'kamui trái'), age: 0 }];
  G.ps[0].hand = [{ ...CARDS.find((c) => c.n === 'rasengan'), age: 0 }];

  const res = await useCard(G, 0, 1);
  assert.equal(res.ok, true);
  assert.equal(G.ps[1].dead, 1);
  assert.ok(res.events.some((e) => e.c === 'ko'));
});

test('sanitizeStateFor hides secret Izanami flag (izm) and exposes stats', async () => {
  const G = await createGame([
    { name: 'P1', bot: false, uid: 'u1' },
    { name: 'P2', bot: false, uid: 'u2' },
  ]);
  G.ps[0].izm = 1;
  const view = sanitizeStateFor(G, 'u1');
  assert.equal('izm' in view.ps[0], false);
  assert.equal('izm' in view.ps[1], false);
  assert.ok(view.ps[0].stats);
  assert.equal(view.ps[0].stats.dmgDealt, 0);
});

test('endTurn returns start-of-turn events (bleed / stun)', async () => {
  const G = await createGame([
    { name: 'P1', bot: false },
    { name: 'P2', bot: false },
  ]);
  G.ps[1].bleed = 100;
  const endRes = await endTurn(G, true);
  assert.ok(Array.isArray(endRes.events));
  assert.ok(endRes.events.some((e) => e.t === 1 && e.tx === '-50' && e.c === 'hp'));
});

test('pickBotAction does not attack teammates in team mode', async () => {
  const G = await createGame([
    { name: 'Bot0', bot: true },
    { name: 'Bot1', bot: true },
    { name: 'Bot2', bot: true },
    { name: 'Bot3', bot: true },
  ]);
  assert.equal(G.teams, true);
  G.ps[0].hand = [{ ...CARDS.find((c) => c.n === 'rasengan'), age: 0 }];
  // Even if teammate (index 2, team 0) was last attacker, bot must target enemy (team 1)
  G.ps[0].last = 2;
  for (let i = 0; i < 15; i++) {
    const act = pickBotAction(G);
    assert.equal(act.type, 'use');
    assert.notEqual(G.ps[act.target].team, G.ps[0].team);
  }
});

test('previewReaction detects direct reactions and wind swirl', () => {
  assert.equal(previewReaction([], 'hỏa'), null);
  assert.equal(previewReaction(['hỏa'], 'lôi')?.name, 'Điện-Nhiệt: Choáng');
  assert.equal(previewReaction(['thủy'], 'hỏa')?.name, 'Hơi nước bốc hơi');
  assert.equal(previewReaction(['hỏa'], 'phong')?.name, 'Khuếch tán (hỏa)');
  assert.equal(previewReaction(['phong'], 'phong')?.key, 'phong+phong');
});

test('calcExpectedDamage accounts for buffs, Hyuga bonus, Edo penalty, and Karasu crit', async () => {
  const G = await createGame([
    { name: 'P1', bot: false },
    { name: 'P2', bot: false },
  ]);
  const rasengan = CARDS.find((c) => c.n === 'rasengan');
  const karasu = CARDS.find((c) => c.n === 'karasu');
  const batQuai = CARDS.find((c) => c.n === 'bát quái không chưởng');

  G.ps[0].buffs = [{ n: 'bạch nhãn', m: 0.15, hy: 0.5, t: 5 }];
  assert.equal(calcExpectedDamage(G, 0, rasengan, 1).dmg, 230); // 200 * 1.15
  assert.equal(calcExpectedDamage(G, 0, batQuai, 1).dmg, 297); // 180 * 1.65

  G.ps[1].stun = 1;
  const critEst = calcExpectedDamage(G, 0, karasu, 1);
  assert.equal(critEst.isCrit, true);
  assert.equal(critEst.dmg, 230); // 100 * 1.15 * 2

  G.ps[0].edo = 1;
  assert.equal(calcExpectedDamage(G, 0, rasengan, 1).dmg, 115); // 200 * 1.15 * 0.5
});

test('player stats track dmgDealt, reactions, cardsUsed, and kos', async () => {
  const G = await createGame([
    { name: 'P1', bot: false },
    { name: 'P2', bot: false },
  ]);
  G.ps[1].hp = 300;
  G.ps[1].dodge = 0;
  G.ps[1].hand = [];
  G.ps[0].hand = [
    { ...CARDS.find((c) => c.n === 'hỏa độn'), age: 0 },
    { ...CARDS.find((c) => c.n === 'thủy độn'), age: 0 },
  ];
  await useCard(G, 0, 1);
  await useCard(G, 0, 1);
  assert.equal(G.ps[0].stats.cardsUsed, 2);
  assert.equal(G.ps[0].stats.reactions, 1);
  assert.equal(G.ps[0].stats.dmgDealt, 310); // 100 + 110 + 100 reaction
  assert.equal(G.ps[0].stats.kos, 1);
  assert.equal(G.ps[1].stats.dmgTaken, 310);
});

test('Bom Khói grants stealth blocking single-target selection until next turn', async () => {
  const G = await createGame([
    { name: 'P1', bot: false },
    { name: 'P2', bot: false },
  ]);
  const rasengan = CARDS.find((c) => c.n === 'rasengan');
  G.ps[0].hand = [{ ...CARDS.find((c) => c.n === 'Bom Khói'), age: 0 }];
  await useCard(G, 0);
  assert.equal(G.ps[0].stealth, 1);
  assert.equal(isValidTarget(G, rasengan, 0, 1), false);
  await endTurn(G, true); // P2 turn
  assert.equal(isValidTarget(G, rasengan, 0, 1), false);
  await endTurn(G, true); // back to P1 -> stealth wears off
  assert.equal(G.ps[0].stealth, 0);
  assert.equal(isValidTarget(G, rasengan, 0, 1), true);
});

test('Hồng Hồ Lô secretly marks target and stuns them if they attack marker', async () => {
  const G = await createGame([
    { name: 'P1', bot: false, uid: 'u1' },
    { name: 'P2', bot: false, uid: 'u2' },
  ]);
  G.ps[0].hand = [{ ...CARDS.find((c) => c.n === 'hồng hồ lô'), age: 0 }];
  await useCard(G, 0, 1);
  const view = sanitizeStateFor(G, 'u2');
  assert.equal('gourd' in view.ps[1], false);

  await endTurn(G, true);
  G.ps[0].dodge = 0;
  G.ps[0].hand = [];
  G.ps[1].hand = [{ ...CARDS.find((c) => c.n === 'rasengan'), age: 0 }];
  await useCard(G, 0, 0);
  assert.equal(G.ps[1].stun, 1);
});

test('Trùng Bám Đuổi deals 50 dmg per action and Bí Thuật: Trùng Bạo heals 50 per target hit', async () => {
  const G = await createGame([
    { name: 'P1', bot: false },
    { name: 'P2', bot: false },
    { name: 'P3', bot: false },
  ]);
  G.ps.forEach((p) => {
    p.dodge = 0;
    p.hand = [];
  });
  G.ps[0].hp = 3000;
  G.ps[0].hand = [
    { ...CARDS.find((c) => c.n === 'Trùng Bám Đuổi'), age: 0 },
    { ...CARDS.find((c) => c.n === 'Bí Thuật: Trùng Bạo'), age: 0 },
  ];
  await useCard(G, 0, 1);
  assert.equal(G.ps[1].bugMark.t, 2);
  await useCard(G, 0); // Trùng Bạo hits P2 and P3 -> +100 heal
  assert.equal(G.ps[0].hp, 3100);

  await endTurn(G, true); // P2 turn
  const hpBefore = G.ps[1].hp;
  G.ps[1].hand = [{ ...CARDS.find((c) => c.n === 'Thế Thân Chi Thuật'), age: 0 }];
  await useCard(G, 0);
  assert.equal(G.ps[1].hp, hpBefore - 50);
});

test('Nghệ Thuật: Đất Sét Nổ stacks on bomb cards and explodes when buff expires', async () => {
  const G = await createGame([
    { name: 'P1', bot: false },
    { name: 'P2', bot: false },
  ]);
  G.ps[1].dodge = 0;
  G.ps[1].hand = [];
  G.ps[0].hand = [
    { ...CARDS.find((c) => c.n === 'Nghệ Thuật: Đất Sét Nổ'), age: 0 },
    { ...CARDS.find((c) => c.n === 'Bom C1 Đất Sét'), age: 0 },
    { ...CARDS.find((c) => c.n === 'Nhện Đất Sét Nhỏ'), age: 0 },
  ];
  await useCard(G, 0);
  await useCard(G, 0, 1);
  await useCard(G, 0, 1);
  assert.equal(G.ps[0].buffs[0].stacks, 2);
  // Bom C1 + Nhện Đất Sét Nhỏ also triggers Hỏa+Hỏa (150 bleed)
  assert.equal(G.ps[1].bleed, 150);
  G.ps[1].bleed = 0;
  const hpBeforeBoom = G.ps[1].hp;
  // Advance 3 of P1's turns
  await endTurn(G, true);
  await endTurn(G, true);
  await endTurn(G, true);
  await endTurn(G, true);
  await endTurn(G, true); // 3rd endTurn of P1 -> buff expires and deals 200 dmg!
  assert.equal(G.ps[1].hp, hpBeforeBoom - 200);
});

test('Tự Bạo C0 sacrifices 99% HP and deals 80% of lost HP to enemies', async () => {
  const G = await createGame([
    { name: 'P1', bot: false },
    { name: 'P2', bot: false },
  ]);
  G.ps[1].dodge = 0;
  G.ps[1].hand = [];
  G.ps[0].hp = 1000;
  G.ps[0].hand = [{ ...CARDS.find((c) => c.n === 'Nghệ Thuật Chân Chính: Tự Bạo C0'), age: 0 }];
  await useCard(G, 0);
  assert.equal(G.ps[0].hp, 10); // lost 990
  assert.equal(G.ps[1].hp, 4000 - Math.round(990 * 0.8)); // 4000 - 792 = 3208
});

test('Bí Thuật: Bách Cơ Thao Diễn revives dead player as 500 HP puppet controlled by caster', async () => {
  const G = await createGame([
    { name: 'P1', bot: false, uid: 'u1' },
    { name: 'P2', bot: true, uid: 'u2' },
    { name: 'P3', bot: false, uid: 'u3' },
  ]);
  G.ps[1].dead = 1;
  G.ps[1].hp = 0;
  G.ps[0].hand = [{ ...CARDS.find((c) => c.n === 'Bí Thuật: Bách Cơ Thao Diễn'), age: 0 }];
  await useCard(G, 0, 1);
  assert.equal(G.ps[1].dead, 0);
  assert.equal(G.ps[1].hp, 500);
  assert.equal(G.ps[1].corpse, 1);
  assert.equal(G.ps[1].weak, 1);
  assert.equal(G.ps[1].uid, 'u1');
  assert.equal(G.ps[1].bot, false);
  // Puppet deals 50% damage
  assert.equal(calcExpectedDamage(G, 1, CARDS.find((c) => c.n === 'rasengan'), 2).dmg, 100);
});

test('Phong Độn: Cuồng Phong is AoE (does not require single target) and reduces enemy dodge', async () => {
  const card = CARDS.find((c) => c.n === 'Phong Độn: Cuồng Phong');
  assert.equal(needTarget(card), false);
  const G = await createGame([
    { name: 'P1', bot: false },
    { name: 'P2', bot: false },
  ]);
  G.ps[1].dodge = 40;
  G.ps[1].hand = [];
  // Force hit by setting dodge below threshold or mocking Math.random
  const origRand = Math.random;
  Math.random = () => 0.99;
  try {
    G.ps[0].hand = [{ ...card, age: 0 }];
    await useCard(G, 0);
    assert.equal(G.ps[1].dodge, 10);
    assert.equal(G.ps[1].hp, 3880);
  } finally {
    Math.random = origRand;
  }
});

test('Chú Ấn drains 200 HP per turn and removes 1 SP when expired', async () => {
  const G = await createGame([
    { name: 'P1', bot: false },
    { name: 'P2', bot: false },
  ]);
  G.ps[0].hand = [{ ...CARDS.find((c) => c.n === 'chú ấn'), age: 0 }];
  await useCard(G, 0);
  assert.equal(G.ps[0].dodge, 80);
  // Turn 1 end -> P2 -> P1 start (drains 200)
  await endTurn(G, true);
  await endTurn(G, true);
  assert.equal(G.ps[0].hp, 3800);
  // Finish remaining 2 turns so buff expires
  await endTurn(G, true);
  await endTurn(G, true);
  assert.equal(G.ps[0].hp, 3600);
  await endTurn(G, true); // 3rd endTurn of P1 -> buff expires -> -1 SP
  assert.equal(G.ps[0].sp, 9);
});

test('Kotoamatsukami redirects offensive attack onto teammate in team mode', async () => {
  const G = await createGame([
    { name: 'P0', bot: false },
    { name: 'P1', bot: false },
    { name: 'P2', bot: false },
    { name: 'P3', bot: false },
  ]);
  G.ps.forEach((p) => {
    p.dodge = 0;
    p.hand = [];
  });
  G.ps[0].hand = [{ ...CARDS.find((c) => c.n === 'kotoamatsukami'), age: 0 }];
  await useCard(G, 0, 1); // P0 (team 0) casts koto on P1 (team 1)
  await endTurn(G, true); // P1's turn
  G.ps[1].hand = [{ ...CARDS.find((c) => c.n === 'rasengan'), age: 0 }];
  await useCard(G, 0, 0); // P1 tries to attack P0, redirected to P3 (teammate, team 1)!
  assert.equal(G.ps[0].hp, 4000);
  assert.equal(G.ps[3].hp, 3800);
});

test('Bẫy Ảo Thuật emits genjutsu sfx, reflects 100% damage and drains 1 SP', async () => {
  const G = await createGame([
    { name: 'Attacker', bot: false },
    { name: 'Defender', bot: false },
  ]);
  G.ps[1].dodge = 0;
  G.ps[1].hand = [{ ...CARDS.find((c) => c.n === 'bẫy ảo thuật'), age: 0 }];
  G.ps[0].hand = [{ ...CARDS.find((c) => c.n === 'rasengan'), age: 0 }];
  const res = await useCard(G, 0, 1);
  assert.equal(res.ok, true);
  assert.equal(G.ps[1].hp, 4000);
  assert.equal(G.ps[0].hp, 3800);
  assert.equal(G.ps[0].sp, 9);
  assert.ok(res.events.some((e) => e.sfx === 'genjutsu'));
});

test('permanent armor (Kanshouo) and timed armor (Ngũ Trùng La Sinh Môn) are tracked separately and timed armor absorbs damage first', async () => {
  const G = await createGame([
    { name: 'Defender', bot: false },
    { name: 'Attacker', bot: false },
  ]);
  const def = G.ps[0];
  def.dodge = 0;
  def.hand = [
    { ...CARDS.find((c) => c.n === 'ngũ trùng la sinh môn'), age: 0 }, // +300 temp (3L)
    { ...CARDS.find((c) => c.n === 'kanshouo'), age: 0 }, // +50 perm
  ];
  await useCard(G, 0);
  await useCard(G, 0);
  assert.equal(def.armor, 50);
  assert.deepEqual(def.tempArmors, [{ amt: 300, t: 3 }]);
  assert.equal(totalArmor(def), 350);

  // Switch to Attacker and deal 200 dmg -> temp armor absorbs first (300 -> 100), permanent stays 50!
  await endTurn(G, true);
  G.ps[1].hand = [
    { ...CARDS.find((c) => c.n === 'rasengan'), age: 0 }, // 200
    { ...CARDS.find((c) => c.n === 'bát quái không chưởng'), age: 0 }, // 180
  ];
  await useCard(G, 0, 0);
  assert.equal(def.armor, 50);
  assert.deepEqual(def.tempArmors, [{ amt: 100, t: 3 }]);
  assert.equal(def.hp, 4000);

  // Deal 180 more dmg -> remaining 100 temp armor + 50 perm armor absorbed, 30 spills into HP!
  await useCard(G, 0, 0);
  assert.equal(def.armor, 0);
  assert.deepEqual(def.tempArmors, []);
  assert.equal(def.hp, 3970);
});

test('timed armor expires after its duration without removing permanent armor, and shortest timed armor absorbs first', async () => {
  const G = await createGame([
    { name: 'P1', bot: false },
    { name: 'P2', bot: false },
  ]);
  const p1 = G.ps[0];
  p1.dodge = 0;
  p1.hand = [
    { ...CARDS.find((c) => c.n === 'kanshouo'), age: 0 }, // +50 perm
    { ...CARDS.find((c) => c.n === 'ngũ trùng la sinh môn'), age: 0 }, // +300 (3L)
    { ...CARDS.find((c) => c.n === 'thiên sứ chi dực'), age: 0 }, // +400 (1L)
  ];
  await useCard(G, 0);
  await useCard(G, 0);
  await useCard(G, 0);
  assert.equal(p1.armor, 50);
  assert.deepEqual(p1.tempArmors, [
    { amt: 400, t: 1 },
    { amt: 300, t: 3 },
  ]);

  // P2 deals 200 dmg -> 1L shield absorbs first (400 -> 200), 3L stays 300, perm stays 50
  await endTurn(G, true);
  G.ps[1].hand = [{ ...CARDS.find((c) => c.n === 'rasengan'), age: 0 }];
  await useCard(G, 0, 0);
  assert.deepEqual(p1.tempArmors, [
    { amt: 200, t: 1 },
    { amt: 300, t: 3 },
  ]);
  assert.equal(p1.armor, 50);

  // Back to P1's turn -> 1L expires, 3L becomes 2L, permanent 50 remains untouched
  await endTurn(G, true);
  assert.deepEqual(p1.tempArmors, [{ amt: 300, t: 2 }]);
  assert.equal(p1.armor, 50);

  // Advance 2 more full rounds so 3L also expires -> permanent 50 STILL remains!
  await endTurn(G, true);
  await endTurn(G, true);
  assert.deepEqual(p1.tempArmors, [{ amt: 300, t: 1 }]);
  await endTurn(G, true);
  await endTurn(G, true);
  assert.deepEqual(p1.tempArmors, []);
  assert.equal(p1.armor, 50);
});

test('armor break (Lôi Thiết) destroys both timed and permanent armor', async () => {
  const G = await createGame([
    { name: 'P1', bot: false },
    { name: 'P2', bot: false },
  ]);
  G.ps[1].dodge = 0;
  G.ps[1].armor = 50;
  G.ps[1].tempArmors = [{ amt: 300, t: 3 }];
  G.ps[1].hand = [];
  G.ps[0].hand = [{ ...CARDS.find((c) => c.n === 'Lôi Thiết'), age: 0 }];
  await useCard(G, 0, 1);
  assert.equal(G.ps[1].armor, 0);
  assert.deepEqual(G.ps[1].tempArmors, []);
  assert.equal(G.ps[1].hp, 3700);
});

test('all 200 cards have authentic Japanese Romaji (jp) and Kanji/Kana (kj) names', () => {
  for (const c of CARDS) {
    assert.ok(typeof c.jp === 'string' && c.jp.trim().length > 0, `Missing jp for card ${c.id} (${c.n})`);
    assert.ok(typeof c.kj === 'string' && c.kj.trim().length > 0, `Missing kj for card ${c.id} (${c.n})`);
  }
  const gokakyu = CARDS.find((c) => c.id === 41);
  assert.equal(getCardTitle(gokakyu), 'Katon: Gōkakyū no Jutsu');
  assert.equal(gokakyu.kj, '火遁・豪火球の術');
  assert.equal(formatCardLogName(gokakyu), 'Katon: Gōkakyū no Jutsu (hỏa cầu chi thuật)');
  assert.equal(normalizeSearchText('Katon: Gōkakyū no Jutsu').includes('gokakyu'), true);
  assert.equal(normalizeSearchText('hỏa cầu chi thuật').includes('hoa cau'), true);
});

test('cast event includes card id, Japanese (jp, kj), and Vietnamese (n) names', async () => {
  const G = await createGame([
    { name: 'Itachi', bot: false },
    { name: 'Sasuke', bot: false },
  ]);
  G.ps[1].dodge = 0;
  G.ps[1].hand = [];
  const amaterasu = CARDS.find((c) => c.n === 'thiên chiếu');
  G.ps[0].hand = [{ ...amaterasu, age: 0 }];
  const res = await useCard(G, 0, 1);
  assert.equal(res.ok, true);
  const castEv = res.events.find((e) => e.k === 'cast');
  assert.ok(castEv);
  assert.equal(castEv.id, amaterasu.id);
  assert.equal(castEv.jp, 'Amaterasu');
  assert.equal(castEv.kj, '天照');
  assert.equal(castEv.n, 'thiên chiếu');
});

test('public auto-trigger cards emit auto_cast with card id while Izanami stays secret', async () => {
  const G = await createGame([
    { name: 'P1', bot: false },
    { name: 'P2', bot: false },
  ]);
  const trap = CARDS.find((c) => c.n === 'bẫy ảo thuật');
  const atk = CARDS.find((c) => c.n === 'rasengan');
  G.ps[0].hand = [{ ...atk, age: 0 }];
  G.ps[1].hand = [{ ...trap, age: 0 }];
  const resTrap = await useCard(G, 0, 1);
  const autoTrap = resTrap.events.find((e) => e.k === 'auto_cast');
  assert.ok(autoTrap);
  assert.equal(autoTrap.id, trap.id);
  assert.equal(autoTrap.isAuto, true);

  // Izanami (au === 'izm') must stay secret and NOT emit auto_cast
  const G2 = await createGame([
    { name: 'P1', bot: false },
    { name: 'P2', bot: false },
  ]);
  const izm = CARDS.find((c) => c.au === 'izm');
  G2.ps[0].hand = [{ ...atk, age: 0 }]; // rank A triggers izm
  G2.ps[1].hand = [{ ...izm, age: 0 }];
  const resIzm = await useCard(G2, 0, 1);
  assert.equal(resIzm.events.some((e) => e.k === 'auto_cast'), false);
});

test('all 200 cards resolve valid VFX+SFX profiles and all manifest/SFX asset files exist', async () => {
  const fs = await import('fs');
  const path = await import('path');
  const { getCardFxProfile } = await import('../public/js/skillFxMap.js');
  const { SFX_CLIPS } = await import('../public/js/sound.js');

  const manifest = JSON.parse(fs.readFileSync(path.resolve('public/assets/vfx/manifest.json'), 'utf8'));
  const vfxIds = new Set(Object.keys(manifest.effects));
  assert.ok(vfxIds.size >= 40, `Expected >=40 Sakuga VFX, got ${vfxIds.size}`);

  // Verify every WebP in manifest exists on disk
  for (const [id, info] of Object.entries(manifest.effects)) {
    const fp = path.resolve('public', info.src.replace(/^\//, ''));
    assert.ok(fs.existsSync(fp), `Missing VFX WebP: ${id} -> ${fp}`);
  }

  // Verify every MP3 in SFX_CLIPS exists on disk
  for (const [key, url] of Object.entries(SFX_CLIPS)) {
    const fp = path.resolve('public', url.replace(/^\//, ''));
    assert.ok(fs.existsSync(fp), `Missing SFX MP3: ${key} -> ${fp}`);
  }

  // Verify every single card (0..199) resolves valid VFX+SFX profile & valid Sakuga IDs
  const fxFields = ['chargeFx', 'projectileFx', 'impactFx', 'impactFx2', 'slashFx', 'shieldFx'];
  for (const c of CARDS) {
    const prof = getCardFxProfile(c);
    assert.ok(prof && Array.isArray(prof.colors) && prof.colors.length >= 2, `Missing colors for card #${c.id}`);
    assert.ok(typeof prof.sfxCast === 'string' && prof.sfxCast.length > 0, `Missing sfxCast for card #${c.id}`);
    assert.ok(typeof prof.sfxImpact === 'string' && prof.sfxImpact.length > 0, `Missing sfxImpact for card #${c.id}`);
    for (const f of fxFields) {
      if (prof[f]) {
        assert.ok(vfxIds.has(prof[f]), `Unknown Sakuga VFX "${prof[f]}" on card #${c.id} (${c.jp})`);
      }
    }
  }
});

test('expansion cards (139..199): describeCard, cardArtSvg fallback, positive SP recovery, and Jinton armor/pet/corpse erase work cleanly', async () => {
  const { describeCard } = await import('../shared/cards.js');
  const { cardArtSvg } = await import('../public/js/cardArt.js');

  for (const c of CARDS) {
    const desc = describeCard(c);
    assert.ok(typeof desc === 'string' && desc.trim().length > 0, `Empty description for card #${c.id}`);
    const art = cardArtSvg(c);
    assert.ok(typeof art === 'string' && art.length > 20, `Invalid art for card #${c.id}`);
  }

  // Positive SP recovery (Kyūbi Chakura Mōdo #146)
  const kcm = CARDS[146];
  assert.ok(describeCard(kcm).includes('+2 tinh thần bản thân'));
  const G = await createGame([
    { name: 'Naruto', bot: false },
    { name: 'Sasuke', bot: false },
  ]);
  G.ps[0].sp = 6;
  G.ps[0].hand = [{ ...kcm, age: 0 }];
  await useCard(G, 0);
  assert.equal(G.ps[0].sp, 8);
  assert.equal(G.ps[0].dodge, 75);

  // Jinton: Genkai Hakuri (#199) breaks armor, kills pets, and erases Edo corpse
  const jinton = CARDS[199];
  const G2 = await createGame([
    { name: 'Onoki', bot: false },
    { name: 'Madara', bot: false },
  ]);
  G2.ps[1].dodge = 0;
  G2.ps[1].hand = [];
  G2.ps[1].armor = 200;
  G2.ps[1].pets = [
    { hp: 50, mx: 50, atk: 10 },
    { hp: 100, mx: 100, atk: 20 },
  ];
  G2.ps[0].hand = [{ ...jinton, age: 0 }];
  await useCard(G2, 0, 1);
  assert.equal(G2.ps[1].armor, 0);
  assert.equal(G2.ps[1].pets.length, 0);

  // Uchiha Katon (#166) + Kirin (#165) triggers hỏa+lôi Stun reaction
  const G3 = await createGame([
    { name: 'Sasuke', bot: false },
    { name: 'Itachi', bot: false },
  ]);
  G3.ps[1].dodge = 0;
  G3.ps[1].hand = [];
  G3.ps[0].hand = [
    { ...CARDS[166], age: 0 }, // Katon: Ryūka (hỏa)
    { ...CARDS[165], age: 0 }, // Raiton: Kirin (lôi)
  ];
  await useCard(G3, 0, 1);
  await useCard(G3, 0, 1);
  assert.equal(G3.ps[1].stun, 1);
});
