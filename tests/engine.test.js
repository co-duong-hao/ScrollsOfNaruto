import test from 'node:test';
import assert from 'node:assert/strict';
import { CARDS } from '../shared/cards.js';
import { createGame, useCard, endTurn, sanitizeStateFor, EDO_HP } from '../shared/engine.js';

test('CARDS has all 96 cards', () => {
  assert.equal(CARDS.length, 96);
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

test('card age expires non-auto cards after 3 turns while keeping auto cards', async () => {
  const G = await createGame([
    { name: 'P1', bot: false },
    { name: 'P2', bot: false },
  ]);
  G.ps[0].hand = [
    { ...CARDS.find((c) => c.n === 'rasengan'), age: 0 },
    { ...CARDS.find((c) => c.n === 'izanagi'), age: 0 },
  ];
  await endTurn(G, true);
  await endTurn(G, true);
  await endTurn(G, true);
  await endTurn(G, true);
  await endTurn(G, true);
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
