// Katon Fire Effect at the Kunai Cursor Tip (Move, Hover, Click & Drag)
// Ultra-fast: pre-rendered 32x32 flame sprites + 1x DPR canvas + particle cap + auto-sleep rAF.

const INTERACTIVE_SEL = 'button, a, select, input, .cd, .st.tg, .brand, [onclick]';
const MAX_PARTICLES = 90;

function makeFlameSprite(inner, mid, outer) {
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 32;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.45, mid);
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, 32, 32);
  return c;
}

export function initCursorFire() {
  if (typeof window === 'undefined') return;
  const finePointer = window.matchMedia?.('(hover: hover) and (pointer: fine)')?.matches;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  if (!finePointer || reduced) return;

  let canvas = document.getElementById('cursorFireCanvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'cursorFireCanvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText =
      'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:99998;';
    document.body.appendChild(canvas);
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const hotSprite = makeFlameSprite('rgba(255,251,200,1)', 'rgba(251,146,60,0.85)', 'rgba(220,38,38,0)');
  const emberSprite = makeFlameSprite('rgba(249,115,22,1)', 'rgba(220,38,38,0.72)', 'rgba(127,29,29,0)');

  function resize() {
    // 1x DPR is visually identical for soft fire glow and 4x faster to composite over large modals
    canvas.width = Math.max(1, window.innerWidth);
    canvas.height = Math.max(1, window.innerHeight);
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const particles = [];
  const rings = [];
  let mx = -999;
  let my = -999;
  let isHot = false;
  let isDown = false;
  let raf = null;
  let lastTime = 0;
  let emitAcc = 0;

  function spawnFlame(x, y, count = 1, burst = false) {
    for (let i = 0; i < count; i++) {
      if (particles.length >= MAX_PARTICLES) particles.shift();
      const ang = burst
        ? Math.random() * Math.PI * 2
        : -Math.PI / 2 + (Math.random() - 0.5) * 1.15;
      const spd = burst
        ? 45 + Math.random() * 140
        : 20 + Math.random() * 52;
      const life = burst
        ? 0.22 + Math.random() * 0.24
        : 0.2 + Math.random() * 0.22;
      particles.push({
        x: x + (Math.random() - 0.5) * (burst ? 4 : 5),
        y: y + (Math.random() - 0.5) * (burst ? 4 : 3),
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - (burst ? 24 : 16),
        r: burst ? 3.2 + Math.random() * 4.2 : 2.8 + Math.random() * 3.8,
        life,
        maxLife: life,
        burst,
      });
    }
  }

  function startLoop() {
    if (raf) return;
    lastTime = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if ((isHot || isDown) && mx >= 0 && my >= 0) {
        emitAcc += dt * (isDown ? 56 : 36);
        while (emitAcc >= 1) {
          emitAcc -= 1;
          spawnFlame(mx, my, 1, false);
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // Click flame rings (no expensive shadowBlur)
      for (let i = rings.length - 1; i >= 0; i--) {
        const rg = rings[i];
        rg.life -= dt;
        if (rg.life <= 0) {
          rings.splice(i, 1);
          continue;
        }
        const p = 1 - rg.life / rg.maxLife;
        const rad = 3 + p * rg.maxR;
        ctx.globalAlpha = (1 - p) * 0.45;
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 4.5 * (1 - p * 0.6);
        ctx.beginPath();
        ctx.arc(rg.x, rg.y, rad, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = (1 - p) * 0.85;
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 1.8 * (1 - p * 0.6);
        ctx.beginPath();
        ctx.arc(rg.x, rg.y, rad, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Flame particles via pre-rendered sprites
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.life -= dt;
        if (pt.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        const p = 1 - pt.life / pt.maxLife;
        pt.vy -= (pt.burst ? 88 : 115) * dt;
        pt.vx *= 0.96;
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;

        const size = Math.max(2, pt.r * (1 - p * 0.7) * 4.2);
        const half = size * 0.5;
        ctx.globalAlpha = (1 - p) * 0.92;
        ctx.drawImage(p < 0.36 ? hotSprite : emberSprite, pt.x - half, pt.y - half, size, size);
      }

      ctx.restore();

      if (isHot || isDown || particles.length || rings.length) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    };
    raf = requestAnimationFrame(tick);
  }

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'touch') return;
      const prevX = mx;
      const prevY = my;
      mx = e.clientX;
      my = e.clientY;

      if (prevX >= 0 && prevY >= 0) {
        const dx = mx - prevX;
        const dy = my - prevY;
        const dist = Math.hypot(dx, dy);
        if (dist > 1.5) {
          const stepPx = isDown ? 7 : 10;
          const steps = Math.min(12, Math.max(1, Math.floor(dist / stepPx)));
          for (let s = 1; s <= steps; s++) {
            const t = s / steps;
            spawnFlame(prevX + dx * t, prevY + dy * t, 1, false);
          }
          startLoop();
        }
      }

      const hot = !!e.target?.closest?.(INTERACTIVE_SEL);
      if (hot !== isHot) {
        isHot = hot;
        if (isHot) {
          spawnFlame(mx, my, 3, false);
          startLoop();
        }
      }
    },
    { passive: true }
  );

  window.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return;
    isDown = true;
    mx = e.clientX;
    my = e.clientY;
    spawnFlame(mx, my, 14, true);
    rings.push({ x: mx, y: my, maxR: 22, life: 0.25, maxLife: 0.25 });
    startLoop();
  });

  const stopDown = () => {
    isDown = false;
  };
  window.addEventListener('pointerup', stopDown);
  window.addEventListener('pointercancel', stopDown);
  window.addEventListener('blur', stopDown);

  document.addEventListener('pointerleave', () => {
    isHot = false;
    isDown = false;
  });
}
