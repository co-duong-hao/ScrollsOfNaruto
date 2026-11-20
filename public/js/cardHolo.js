// Spring-physics 3D Holographic Card Controller
// Modeled after simeydotme/pokemon-cards-css (Card.svelte pointer & spring math)

const clamp = (v, min = 0, max = 100) => Math.min(Math.max(v, min), max);
const round = (v, precision = 3) => parseFloat(v.toFixed(precision));
const adjust = (v, fromMin, fromMax, toMin, toMax) =>
  round(toMin + ((toMax - toMin) * (v - fromMin)) / (fromMax - fromMin));

const activeSprings = new Map(); // HTMLElement -> spring state
let rafId = null;
let initialized = false;
let showcaseTimer = null;

function createSpringState() {
  return {
    // Current interpolated values
    rx: 0,
    ry: 0,
    px: 50,
    py: 50,
    bx: 50,
    by: 50,
    op: 0,
    // Velocities for damped spring physics
    vrx: 0,
    vry: 0,
    vpx: 0,
    vpy: 0,
    vbx: 0,
    vby: 0,
    vop: 0,
    // Targets
    trx: 0,
    try: 0,
    tpx: 50,
    tpy: 50,
    tbx: 50,
    tby: 50,
    top: 0,
    // Spring stiffness/damping
    stiffness: 0.12,
    damping: 0.35,
    interacting: false,
  };
}

function stepScalar(cur, vel, target, stiffness, damping) {
  const force = (target - cur) * stiffness;
  const nextVel = (vel + force) * (1 - damping);
  const nextVal = cur + nextVel;
  return [nextVal, nextVel];
}

function applyCssVars(el, s) {
  const fromCenter = clamp(Math.hypot(s.py - 50, s.px - 50) / 50, 0, 1);
  el.style.setProperty('--pointer-x', `${round(s.px, 2)}%`);
  el.style.setProperty('--pointer-y', `${round(s.py, 2)}%`);
  el.style.setProperty('--pointer-from-center', `${round(fromCenter, 3)}`);
  el.style.setProperty('--pointer-from-top', `${round(s.py / 100, 3)}`);
  el.style.setProperty('--pointer-from-left', `${round(s.px / 100, 3)}`);
  el.style.setProperty('--background-x', `${round(s.bx, 2)}%`);
  el.style.setProperty('--background-y', `${round(s.by, 2)}%`);
  el.style.setProperty('--rotate-x', `${round(s.rx, 2)}deg`);
  el.style.setProperty('--rotate-y', `${round(s.ry, 2)}deg`);
  el.style.setProperty('--card-opacity', `${round(clamp(s.op, 0, 1), 3)}`);
}

function tick() {
  for (const [el, s] of activeSprings.entries()) {
    if (!el.isConnected) {
      activeSprings.delete(el);
      continue;
    }

    [s.rx, s.vrx] = stepScalar(s.rx, s.vrx, s.trx, s.stiffness, s.damping);
    [s.ry, s.vry] = stepScalar(s.ry, s.vry, s.try, s.stiffness, s.damping);
    [s.px, s.vpx] = stepScalar(s.px, s.vpx, s.tpx, s.stiffness, s.damping);
    [s.py, s.vpy] = stepScalar(s.py, s.vpy, s.tpy, s.stiffness, s.damping);
    [s.bx, s.vbx] = stepScalar(s.bx, s.vbx, s.tbx, s.stiffness, s.damping);
    [s.by, s.vby] = stepScalar(s.by, s.vby, s.tby, s.stiffness, s.damping);
    [s.op, s.vop] = stepScalar(s.op, s.vop, s.top, s.stiffness, s.damping);

    applyCssVars(el, s);

    const settled =
      !s.interacting &&
      Math.abs(s.rx - s.trx) < 0.05 &&
      Math.abs(s.ry - s.try) < 0.05 &&
      Math.abs(s.op - s.top) < 0.01 &&
      Math.abs(s.vrx) < 0.05 &&
      Math.abs(s.vry) < 0.05;

    if (settled) {
      s.rx = s.trx;
      s.ry = s.try;
      s.px = s.tpx;
      s.py = s.tpy;
      s.bx = s.tbx;
      s.by = s.tby;
      s.op = s.top;
      applyCssVars(el, s);
      el.classList.remove('interacting');
      activeSprings.delete(el);
    }
  }

  if (activeSprings.size > 0) {
    rafId = requestAnimationFrame(tick);
  } else {
    rafId = null;
  }
}

function ensureLoop() {
  if (rafId === null) {
    rafId = requestAnimationFrame(tick);
  }
}

function stopShowcase() {
  if (showcaseTimer) {
    clearInterval(showcaseTimer);
    showcaseTimer = null;
  }
}

function interactCard(el, clientX, clientY) {
  if (el.classList.contains('dim')) return;
  stopShowcase();

  const rect = el.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const absX = clientX - rect.left;
  const absY = clientY - rect.top;
  const percentX = clamp((100 / rect.width) * absX, 0, 100);
  const percentY = clamp((100 / rect.height) * absY, 0, 100);
  const centerX = percentX - 50;
  const centerY = percentY - 50;

  const mode = el.dataset.holoMode || 'codex';
  const divisor = mode === 'hand' ? 5.2 : mode === 'inspector' ? 2.8 : 3.4;

  let s = activeSprings.get(el);
  if (!s) {
    s = createSpringState();
    activeSprings.set(el, s);
  }

  s.interacting = true;
  s.stiffness = 0.14;
  s.damping = 0.34;
  s.tpx = percentX;
  s.tpy = percentY;
  s.tbx = adjust(percentX, 0, 100, 37, 63);
  s.tby = adjust(percentY, 0, 100, 33, 67);
  s.trx = round(-(centerX / divisor), 2);
  s.try = round(centerY / divisor, 2);
  s.top = 1;

  el.classList.add('interacting');
  ensureLoop();
}

function resetCard(el) {
  const s = activeSprings.get(el);
  if (!s) return;
  s.interacting = false;
  s.stiffness = 0.045;
  s.damping = 0.22;
  s.trx = 0;
  s.try = 0;
  s.tpx = 50;
  s.tpy = 50;
  s.tbx = 50;
  s.tby = 50;
  s.top = 0;
  ensureLoop();
}

export function triggerShowcaseWobble(selector = '.card-inspect-card .cd.cd-holo') {
  stopShowcase();
  const el = document.querySelector(selector);
  if (!el) return;

  let s = activeSprings.get(el);
  if (!s) {
    s = createSpringState();
    activeSprings.set(el, s);
  }

  let r = 0;
  const start = performance.now();
  el.classList.add('interacting');

  showcaseTimer = setInterval(() => {
    if (!el.isConnected || performance.now() - start > 2600) {
      stopShowcase();
      resetCard(el);
      return;
    }
    r += 0.09;
    s.interacting = true;
    s.stiffness = 0.08;
    s.damping = 0.32;
    s.trx = Math.sin(r) * 18;
    s.try = Math.cos(r) * 14;
    s.tpx = 50 + Math.sin(r) * 38;
    s.tpy = 50 + Math.cos(r) * 36;
    s.tbx = 50 + Math.sin(r) * 14;
    s.tby = 50 + Math.cos(r) * 14;
    s.top = 0.92;
    ensureLoop();
  }, 24);
}

export function initCardHolo() {
  if (initialized) return;
  initialized = true;

  let hoveredEl = null;

  document.addEventListener('pointermove', (e) => {
    const card = e.target?.closest?.('.cd.cd-holo');
    if (hoveredEl && hoveredEl !== card) {
      resetCard(hoveredEl);
      hoveredEl = null;
    }
    if (card) {
      hoveredEl = card;
      interactCard(card, e.clientX, e.clientY);
    }
  });

  document.addEventListener('pointerout', (e) => {
    if (!hoveredEl) return;
    if (!e.relatedTarget || !hoveredEl.contains(e.relatedTarget)) {
      resetCard(hoveredEl);
      hoveredEl = null;
    }
  });

  document.addEventListener(
    'touchmove',
    (e) => {
      const t = e.touches?.[0];
      if (!t) return;
      const card = document.elementFromPoint(t.clientX, t.clientY)?.closest?.('.cd.cd-holo');
      if (card) {
        hoveredEl = card;
        interactCard(card, t.clientX, t.clientY);
      }
    },
    { passive: true }
  );

  document.addEventListener(
    'touchend',
    () => {
      if (hoveredEl) {
        resetCard(hoveredEl);
        hoveredEl = null;
      }
    },
    { passive: true }
  );
}
