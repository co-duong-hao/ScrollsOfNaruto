// 17 Canon Naruto Special Visual Effects (Canvas 2D Overlay)
// Every effect uses a smooth fade-in / fade-out alpha envelope so it dissolves
// cleanly to 0 opacity with zero leftover artifacts.

function smoothEnv(p, fadeIn = 0.14, fadeOut = 0.28) {
  if (p <= 0 || p >= 1) return 0;
  let a = 1;
  if (p < fadeIn) a = p / fadeIn;
  else if (p > 1 - fadeOut) a = (1 - p) / fadeOut;
  return Math.max(0, Math.min(1, a));
}

function drawTomoe(ctx, r, ang, size) {
  ctx.save();
  ctx.rotate(ang);
  ctx.translate(r, 0);
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(size * 1.9, -size * 0.4, size * 0.7, size * 1.3);
  ctx.quadraticCurveTo(size * 0.5, size * 0.2, 0, size * 0.5);
  ctx.fill();
  ctx.restore();
}

export function createSpecialFx(type, opts = {}) {
  const {
    x = 0,
    y = 0,
    from = null,
    to = null,
    variant = '',
    scale = 1,
    duration = 0.95,
    color = null,
    delay = 0,
  } = opts;

  // Deterministic pseudo-random seeds per instance for swarms/petals/papers
  const items = [];
  const seedCount =
    type === 'paper_storm' || type === 'bug_swarm' || type === 'sand_wave' || type === 'blood_bleed'
      ? 24
      : type === 'sakura_petals' ||
          type === 'wood_roots' ||
          type === 'ninja_weapons' ||
          type === 'chakra_drain' ||
          type === 'scroll_shatter'
        ? 14
        : type === 'eight_gates' || type === 'stun_shock'
          ? 16
          : 10;
  for (let i = 0; i < seedCount; i++) {
    items.push({
      a: (i / seedCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5,
      r: 0.35 + Math.random() * 0.9,
      s: 0.65 + Math.random() * 0.75,
      o: (Math.random() - 0.5) * 68,
      p: Math.random() * Math.PI * 2,
      d: Math.random() * 0.22,
    });
  }

  return {
    type,
    x,
    y,
    from: from || { x, y },
    to: to || { x, y },
    variant,
    scale,
    duration,
    color,
    delay,
    elapsed: 0,
    items,
  };
}

export function drawSpecialFx(ctx, fx) {
  const p = Math.min(1, fx.elapsed / fx.duration);
  const env = smoothEnv(p, 0.14, 0.28);
  if (env <= 0.005) return;

  const sc = fx.scale || 1;
  ctx.save();

  switch (fx.type) {
    case 'sharingan_eye': {
      const r = 46 * sc * (0.72 + 0.32 * Math.sin(Math.min(1, p * 2.2) * Math.PI * 0.5));
      ctx.translate(fx.x, fx.y);
      ctx.globalAlpha = env * 0.92;
      // Red chakra glow
      const glow = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r * 1.75);
      glow.addColorStop(0, 'rgba(220, 38, 38, 0.85)');
      glow.addColorStop(0.55, 'rgba(153, 27, 27, 0.45)');
      glow.addColorStop(1, 'rgba(153, 27, 27, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.75, 0, Math.PI * 2);
      ctx.fill();

      // Iris
      ctx.fillStyle = '#dc2626';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 3.2 * sc;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner ring + rotating 3 tomoe
      ctx.strokeStyle = 'rgba(9, 9, 11, 0.82)';
      ctx.lineWidth = 2 * sc;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.56, 0, Math.PI * 2);
      ctx.stroke();

      const spin = p * Math.PI * 3.4;
      for (let k = 0; k < 3; k++) {
        drawTomoe(ctx, r * 0.56, spin + (k * Math.PI * 2) / 3, 6.2 * sc);
      }

      // Pupil
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'mangekyo_eye': {
      const r = 56 * sc * (0.75 + 0.3 * Math.min(1, p * 3));
      ctx.translate(fx.x, fx.y);
      ctx.globalAlpha = env * 0.95;

      const glow = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r * 2.1);
      glow.addColorStop(0, 'rgba(239, 68, 68, 0.95)');
      glow.addColorStop(0.5, 'rgba(127, 29, 29, 0.55)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, r * 2.1, 0, Math.PI * 2);
      ctx.fill();

      // Blood-red eye disc
      ctx.fillStyle = '#b91c1c';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 3.8 * sc;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Rotating 3-blade Mangekyo pinwheel
      ctx.save();
      ctx.rotate(p * Math.PI * 4.2);
      ctx.fillStyle = '#09090b';
      for (let k = 0; k < 3; k++) {
        ctx.save();
        ctx.rotate((k * Math.PI * 2) / 3);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(r * 0.58, -r * 0.52, r * 0.92, -r * 0.08);
        ctx.quadraticCurveTo(r * 0.42, r * 0.16, 0, 0);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }

    case 'rinnegan_ripple': {
      ctx.translate(fx.x, fx.y);
      const pull = fx.variant === 'pull';
      ctx.globalAlpha = env * 0.9;
      for (let k = 0; k < 5; k++) {
        const phase = pull ? 1 - ((p * 1.4 + k * 0.18) % 1) : (p * 1.3 + k * 0.18) % 1;
        const rr = (16 + phase * 110) * sc;
        ctx.strokeStyle = k % 2 === 0 ? '#c084fc' : '#581c87';
        ctx.lineWidth = (3.4 - k * 0.35) * sc;
        ctx.beginPath();
        ctx.arc(0, 0, rr, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Central Rinnegan orb
      const coreR = 26 * sc;
      const g = ctx.createRadialGradient(0, 0, 2, 0, 0, coreR);
      g.addColorStop(0, '#f3e8ff');
      g.addColorStop(0.55, '#a855f7');
      g.addColorStop(1, 'rgba(88,28,135,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, coreR, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'byakugan_bagua': {
      ctx.translate(fx.x, fx.y);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = env * 0.88;
      const r = 82 * sc * (0.78 + 0.25 * Math.min(1, p * 2.5));
      ctx.rotate(p * 1.2);
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 2.4 * sc;
      // Outer & inner rings
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2);
      ctx.stroke();
      // 8 trigram sectors & bars
      for (let k = 0; k < 8; k++) {
        ctx.save();
        ctx.rotate((k * Math.PI) / 4);
        ctx.beginPath();
        ctx.moveTo(r * 0.62, 0);
        ctx.lineTo(r, 0);
        ctx.stroke();
        // Trigram lines
        for (let b = 0; b < 3; b++) {
          const yy = r * (0.7 + b * 0.085);
          ctx.beginPath();
          if ((k + b) % 2 === 0) {
            ctx.moveTo(-10 * sc, yy);
            ctx.lineTo(10 * sc, yy);
          } else {
            ctx.moveTo(-10 * sc, yy);
            ctx.lineTo(-2 * sc, yy);
            ctx.moveTo(2 * sc, yy);
            ctx.lineTo(10 * sc, yy);
          }
          ctx.stroke();
        }
        ctx.restore();
      }
      // Central gentle-fist burst
      const g = ctx.createRadialGradient(0, 0, 2, 0, 0, r * 0.5);
      g.addColorStop(0, 'rgba(224,242,254,0.9)');
      g.addColorStop(0.5, 'rgba(56,189,248,0.45)');
      g.addColorStop(1, 'rgba(56,189,248,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'smoke_poof': {
      ctx.translate(fx.x, fx.y);
      // Kuchiyose summoning formula ring on ground
      if (fx.variant === 'kuchiyose') {
        ctx.save();
        ctx.globalAlpha = env * 0.85;
        const sr = 86 * sc * Math.min(1, p * 2.5);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.6 * sc;
        ctx.beginPath();
        ctx.arc(0, 0, sr, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, sr * 0.72, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#fef2f2';
        ctx.font = `700 ${Math.round(24 * sc)}px 'Yuji Syuku', serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('召', 0, 0);
        ctx.restore();
      }
      // Fluffy smoke puffs
      fx.items.forEach((it) => {
        const dist = (14 + p * 66 * it.r) * sc;
        const px = Math.cos(it.a) * dist;
        const py = Math.sin(it.a) * dist - p * 18 * sc;
        const rad = (20 + p * 24) * it.s * sc;
        ctx.globalAlpha = env * 0.78;
        const g = ctx.createRadialGradient(px, py, 2, px, py, rad);
        g.addColorStop(0, 'rgba(248, 250, 252, 0.95)');
        g.addColorStop(0.65, 'rgba(203, 213, 225, 0.75)');
        g.addColorStop(1, 'rgba(148, 163, 184, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.fill();
      });
      // Kawarimi spinning wooden log
      if (fx.variant === 'kawarimi') {
        ctx.save();
        ctx.globalAlpha = env;
        ctx.translate(p * 26 * sc, -Math.sin(p * Math.PI) * 34 * sc);
        ctx.rotate(p * Math.PI * 2.6);
        ctx.fillStyle = '#78350f';
        ctx.strokeStyle = '#fef3c7';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.roundRect(-18 * sc, -9 * sc, 36 * sc, 18 * sc, 5 * sc);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      break;
    }

    case 'hiraishin_flash': {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = env;
      const x1 = fx.from.x;
      const y1 = fx.from.y;
      const x2 = fx.to.x;
      const y2 = fx.to.y;
      // Instant golden flash line
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 14 * sc * (1 - p * 0.65);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo((x1 + x2) * 0.5 + (Math.random() - 0.5) * 32, (y1 + y2) * 0.5 + (Math.random() - 0.5) * 32);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4.5 * sc * (1 - p * 0.5);
      ctx.stroke();

      // Golden 3-pronged kunai silhouette & seal flash at target
      ctx.save();
      ctx.translate(x2, y2);
      ctx.rotate(Math.atan2(y2 - y1, x2 - x1));
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(26 * sc, 0);
      ctx.lineTo(4 * sc, -11 * sc);
      ctx.lineTo(8 * sc, -4 * sc);
      ctx.lineTo(-18 * sc, -3 * sc);
      ctx.lineTo(-18 * sc, 3 * sc);
      ctx.lineTo(8 * sc, 4 * sc);
      ctx.lineTo(4 * sc, 11 * sc);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
    }

    case 'ninja_weapons': {
      const ang = Math.atan2(fx.to.y - fx.from.y, fx.to.x - fx.from.x);
      const isFuma = fx.variant === 'fuma';
      const isShuriken = fx.variant === 'shuriken' || isFuma;
      const isSenbon = fx.variant === 'senbon';
      const count = isFuma ? 1 : isSenbon ? 7 : 3;

      for (let i = 0; i < count; i++) {
        const tp = Math.max(0, Math.min(1, (p - i * 0.06) / 0.72));
        if (tp <= 0 || tp >= 1) continue;
        const spread = (i - (count - 1) / 2) * (isSenbon ? 14 : 22);
        const perpX = -Math.sin(ang) * spread;
        const perpY = Math.cos(ang) * spread;
        const cx = fx.from.x + (fx.to.x - fx.from.x) * tp + perpX;
        const cy = fx.from.y + (fx.to.y - fx.from.y) * tp + perpY;

        ctx.save();
        ctx.globalAlpha = env;
        // Air trail
        ctx.strokeStyle = isSenbon ? 'rgba(168, 85, 247, 0.75)' : 'rgba(226, 232, 240, 0.75)';
        ctx.lineWidth = isFuma ? 5 : 2.2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - Math.cos(ang) * (isFuma ? 56 : 34), cy - Math.sin(ang) * (isFuma ? 56 : 34));
        ctx.stroke();

        ctx.translate(cx, cy);
        if (isShuriken) {
          ctx.rotate(tp * Math.PI * 10);
          const sz = (isFuma ? 32 : 14) * sc;
          ctx.fillStyle = '#cbd5e1';
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          for (let b = 0; b < 4; b++) {
            const ba = (b * Math.PI) / 2;
            ctx.lineTo(Math.cos(ba) * sz, Math.sin(ba) * sz);
            ctx.lineTo(Math.cos(ba + Math.PI / 4) * sz * 0.34, Math.sin(ba + Math.PI / 4) * sz * 0.34);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.rotate(ang);
          ctx.fillStyle = isSenbon ? '#c084fc' : '#f1f5f9';
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(18 * sc, 0);
          ctx.lineTo(-4 * sc, -5 * sc);
          ctx.lineTo(-14 * sc, 0);
          ctx.lineTo(-4 * sc, 5 * sc);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      }
      break;
    }

    case 'shadow_bind': {
      const reach = Math.min(1, p * 2.1);
      const x1 = fx.from.x;
      const y1 = fx.from.y;
      const x2 = x1 + (fx.to.x - x1) * reach;
      const y2 = y1 + (fx.to.y - y1) * reach;

      ctx.globalAlpha = env * 0.92;
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 14 * sc;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      for (let s = 1; s <= 6; s++) {
        const t = s / 6;
        const wob = Math.sin(t * Math.PI * 3 + p * 8) * 16;
        ctx.lineTo(x1 + (x2 - x1) * t + wob, y1 + (y2 - y1) * t + wob * 0.5);
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(147, 51, 234, 0.55)';
      ctx.lineWidth = 3 * sc;
      ctx.stroke();

      if (reach > 0.85) {
        // Wrapping shadow rings at target
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 6 * sc;
        ctx.beginPath();
        ctx.ellipse(fx.to.x, fx.to.y, 44 * sc, 24 * sc, 0.25, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(fx.to.x, fx.to.y, 44 * sc, 24 * sc, -0.25, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }

    case 'paper_storm': {
      const isBomb = fx.variant === 'bomb';
      fx.items.forEach((it) => {
        const tp = Math.max(0, Math.min(1, (p - it.d) / (1 - it.d)));
        if (tp <= 0 || tp >= 1) return;
        const cx = fx.from.x + (fx.to.x - fx.from.x) * tp + Math.sin(tp * 7 + it.p) * it.o;
        const cy = fx.from.y + (fx.to.y - fx.from.y) * tp + Math.cos(tp * 6 + it.p) * it.o * 0.6;
        ctx.save();
        ctx.globalAlpha = env * 0.92;
        ctx.translate(cx, cy);
        ctx.rotate(tp * 6 + it.a);
        ctx.fillStyle = isBomb ? '#fef3c7' : '#f8fafc';
        ctx.strokeStyle = isBomb ? '#dc2626' : '#94a3b8';
        ctx.lineWidth = 1.4;
        ctx.fillRect(-7 * sc, -10 * sc, 14 * sc, 20 * sc);
        ctx.strokeRect(-7 * sc, -10 * sc, 14 * sc, 20 * sc);
        if (isBomb) {
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(-3 * sc, -4 * sc, 6 * sc, 8 * sc);
        }
        ctx.restore();
      });
      break;
    }

    case 'seal_gate': {
      ctx.translate(fx.x, fx.y);
      ctx.globalAlpha = env * 0.95;
      const drop = (1 - Math.min(1, p * 3.2)) * -75 * sc;
      if (fx.variant === 'torii') {
        ctx.translate(0, drop);
        ctx.fillStyle = '#b91c1c';
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 2.4;
        // Top curved beam
        ctx.fillRect(-66 * sc, -36 * sc, 132 * sc, 13 * sc);
        ctx.strokeRect(-66 * sc, -36 * sc, 132 * sc, 13 * sc);
        // Second beam
        ctx.fillRect(-52 * sc, -16 * sc, 104 * sc, 9 * sc);
        // Pillars
        ctx.fillRect(-42 * sc, -24 * sc, 11 * sc, 68 * sc);
        ctx.fillRect(31 * sc, -24 * sc, 11 * sc, 68 * sc);
      } else {
        // Golden sealing chains X + glowing 封 kanji
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 4 * sc;
        ctx.setLineDash([10, 6]);
        ctx.beginPath();
        ctx.moveTo(-68 * sc, -44 * sc);
        ctx.lineTo(68 * sc, 44 * sc);
        ctx.moveTo(68 * sc, -44 * sc);
        ctx.lineTo(-68 * sc, 44 * sc);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#fef08a';
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 3;
        ctx.font = `700 ${Math.round(44 * sc)}px 'Yuji Syuku', serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText('封', 0, 0);
        ctx.fillText('封', 0, 0);
      }
      break;
    }

    case 'sand_wave': {
      fx.items.forEach((it) => {
        const tp = Math.max(0, Math.min(1, (p - it.d * 0.8) / 0.8));
        if (tp <= 0 || tp >= 1) return;
        const cx = fx.from.x + (fx.to.x - fx.from.x) * tp + Math.sin(tp * 5 + it.p) * it.o * 0.7;
        const cy = fx.from.y + (fx.to.y - fx.from.y) * tp - Math.sin(tp * Math.PI) * 32 + it.o * 0.3;
        const rad = (10 + it.s * 14) * sc;
        ctx.globalAlpha = env * 0.8;
        const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, rad);
        g.addColorStop(0, '#fef3c7');
        g.addColorStop(0.55, '#d97706');
        g.addColorStop(1, 'rgba(180, 83, 9, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    case 'bug_swarm': {
      fx.items.forEach((it) => {
        const tp = Math.max(0, Math.min(1, (p - it.d) / (1 - it.d)));
        if (tp <= 0 || tp >= 1) return;
        const cx = fx.from.x + (fx.to.x - fx.from.x) * tp + Math.cos(tp * 14 + it.a) * 34 * it.r;
        const cy = fx.from.y + (fx.to.y - fx.from.y) * tp + Math.sin(tp * 14 + it.a) * 26 * it.r;
        ctx.globalAlpha = env * 0.92;
        ctx.fillStyle = '#09090b';
        ctx.strokeStyle = fx.variant === 'toxic' ? '#a855f7' : '#84cc16';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 5.2 * sc, 3.2 * sc, it.a + tp * 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
      break;
    }

    case 'eight_gates': {
      const crimson = fx.variant === 'shimon';
      const c1 = crimson ? '#ef4444' : '#22c55e';
      const c2 = crimson ? '#fef08a' : '#bbf7d0';
      ctx.translate(fx.x, fx.y);
      ctx.globalCompositeOperation = 'lighter';
      fx.items.forEach((it) => {
        const yy = (28 - p * 115 * it.r) * sc;
        const xx = Math.sin(it.p + p * 6) * 44 * sc;
        const h = (26 + it.s * 34) * sc;
        ctx.globalAlpha = env * 0.72;
        const g = ctx.createLinearGradient(xx, yy, xx, yy - h);
        g.addColorStop(0, c1);
        g.addColorStop(0.6, c2);
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = g;
        ctx.lineWidth = (5 + it.s * 6) * sc;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(xx, yy);
        ctx.lineTo(xx, yy - h);
        ctx.stroke();
      });
      break;
    }

    case 'sakura_petals': {
      ctx.translate(fx.x, fx.y);
      fx.items.forEach((it) => {
        const dist = (14 + p * 84 * it.r) * sc;
        const px = Math.cos(it.a + p * 1.4) * dist;
        const py = Math.sin(it.a + p * 1.4) * dist - p * 22 * sc;
        ctx.save();
        ctx.globalAlpha = env * 0.92;
        ctx.translate(px, py);
        ctx.rotate(it.p + p * 4);
        ctx.fillStyle = it.r > 0.65 ? '#f472b6' : '#fbcfe8';
        ctx.beginPath();
        ctx.ellipse(0, 0, 7 * sc * it.s, 4 * sc * it.s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      // Soft medical green glow ring
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = env * 0.55;
      const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 72 * sc);
      g.addColorStop(0, 'rgba(74, 222, 128, 0.85)');
      g.addColorStop(1, 'rgba(74, 222, 128, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, 72 * sc, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'wood_roots': {
      ctx.translate(fx.x, fx.y);
      ctx.globalAlpha = env * 0.92;
      const grow = Math.min(1, p * 2.2);
      for (let k = 0; k < 6; k++) {
        const ang = -Math.PI * 0.85 + (k / 5) * Math.PI * 0.7;
        const len = (56 + (k % 2) * 24) * grow * sc;
        ctx.strokeStyle = '#713f12';
        ctx.lineWidth = (7 - (k % 2) * 2) * sc;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 26 * sc);
        ctx.quadraticCurveTo(
          Math.cos(ang) * len * 0.6 + (k % 2 ? 16 : -16),
          26 * sc + Math.sin(ang) * len * 0.5,
          Math.cos(ang) * len,
          26 * sc + Math.sin(ang) * len
        );
        ctx.stroke();
        // Green leaf tip
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(Math.cos(ang) * len, 26 * sc + Math.sin(ang) * len, 6 * sc, 3.5 * sc, ang, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'puppet_threads': {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = env * 0.85;
      for (let k = -2; k <= 2; k++) {
        const off = k * 8;
        ctx.strokeStyle = k % 2 === 0 ? '#38bdf8' : '#c084fc';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(fx.from.x, fx.from.y + off);
        ctx.quadraticCurveTo(
          (fx.from.x + fx.to.x) * 0.5,
          (fx.from.y + fx.to.y) * 0.5 + off * 2.4 + Math.sin(p * 12 + k) * 12,
          fx.to.x,
          fx.to.y + off * 0.8
        );
        ctx.stroke();
      }
      break;
    }

    case 'meteor_gravity': {
      ctx.translate(fx.x, fx.y);
      ctx.globalAlpha = env * 0.94;
      if (fx.variant === 'susanoo') {
        // Spectral purple Susanoo ribcage shield glow
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 5 * sc;
        for (let k = -1; k <= 1; k++) {
          ctx.beginPath();
          ctx.arc(0, k * 14 * sc, (54 - Math.abs(k) * 8) * sc, -Math.PI * 0.82, -Math.PI * 0.18);
          ctx.stroke();
        }
      } else if (fx.variant === 'kyubi') {
        // Blazing crimson Nine-Tails chakra silhouette sweep
        ctx.globalCompositeOperation = 'lighter';
        for (let k = 0; k < 5; k++) {
          const ang = -Math.PI * 0.9 + (k / 4) * Math.PI * 0.8 + Math.sin(p * 10 + k) * 0.15;
          ctx.strokeStyle = k % 2 === 0 ? '#ef4444' : '#f97316';
          ctx.lineWidth = 9 * sc * (1 - p * 0.4);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(0, 14 * sc);
          ctx.quadraticCurveTo(Math.cos(ang) * 58 * sc, Math.sin(ang) * 58 * sc, Math.cos(ang + 0.35) * 98 * sc, Math.sin(ang + 0.35) * 98 * sc);
          ctx.stroke();
        }
      } else {
        // Descending Planetary Devastation / Tengai Shinsei meteor
        const fall = Math.min(1, p * 1.9);
        const my = (-125 + fall * 125) * sc;
        const r = 46 * sc;
        const g = ctx.createRadialGradient(0, my, 4, 0, my, r * 1.45);
        g.addColorStop(0, '#fef08a');
        g.addColorStop(0.55, '#ea580c');
        g.addColorStop(1, 'rgba(234, 88, 12, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, my, r * 1.45, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#292524';
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 3 * sc;
        ctx.beginPath();
        ctx.arc(0, my, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      break;
    }

    // === DEBUFF PROCEDURAL NARUTO EFFECTS (7 CANON STATUS VISUALS) ===
    case 'blood_bleed': {
      const amaterasu = fx.variant === 'amaterasu';
      ctx.translate(fx.x, fx.y);
      if (amaterasu) {
        // Swirling obsidian-black flames with burning crimson edges
        const g = ctx.createRadialGradient(0, 0, 8 * sc, 0, 0, 68 * sc);
        g.addColorStop(0, 'rgba(15, 23, 42, 0.88)');
        g.addColorStop(0.55, 'rgba(153, 27, 27, 0.55)');
        g.addColorStop(1, 'rgba(153, 27, 27, 0)');
        ctx.globalAlpha = env * 0.92;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, 68 * sc, 0, Math.PI * 2);
        ctx.fill();

        fx.items.forEach((it) => {
          const prog = Math.max(0, Math.min(1, (p - it.d * 0.6) / 0.85));
          const xx = Math.cos(it.a + prog * 1.4) * (24 + it.r * 34) * sc;
          const yy = (26 - prog * 96 * it.r) * sc;
          const sz = (8 + it.s * 9) * (1 - prog * 0.45) * sc;
          ctx.globalAlpha = env * 0.92;
          ctx.fillStyle = '#09090b';
          ctx.strokeStyle = it.r > 0.6 ? '#ef4444' : '#7f1d1d';
          ctx.lineWidth = 2.2 * sc;
          ctx.beginPath();
          ctx.moveTo(xx, yy - sz * 1.4);
          ctx.quadraticCurveTo(xx + sz, yy, xx, yy + sz * 0.7);
          ctx.quadraticCurveTo(xx - sz, yy, xx, yy - sz * 1.4);
          ctx.fill();
          ctx.stroke();
        });
      } else {
        // Crimson blood-slash burst & falling scarlet droplets
        ctx.globalAlpha = env * 0.86;
        const g = ctx.createRadialGradient(0, 0, 6 * sc, 0, 0, 64 * sc);
        g.addColorStop(0, 'rgba(220, 38, 38, 0.58)');
        g.addColorStop(0.65, 'rgba(127, 29, 29, 0.3)');
        g.addColorStop(1, 'rgba(127, 29, 29, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, 64 * sc, 0, Math.PI * 2);
        ctx.fill();

        // Diagonal crimson wound slash
        ctx.strokeStyle = '#ef4444';
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 4.5 * sc * (1 - p * 0.5);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-42 * sc, -24 * sc);
        ctx.lineTo(42 * sc, 24 * sc);
        ctx.stroke();

        // Falling blood droplets
        fx.items.forEach((it) => {
          const xx = Math.cos(it.a) * (16 + it.r * 46) * sc;
          const yy = (-18 + it.o * 0.4 + p * (62 + it.s * 54)) * sc;
          const r = (3.2 + it.s * 4.2) * sc;
          ctx.globalAlpha = env * 0.92;
          ctx.fillStyle = it.r > 0.55 ? '#ef4444' : '#991b1b';
          ctx.beginPath();
          ctx.moveTo(xx, yy - r * 1.8);
          ctx.quadraticCurveTo(xx + r, yy, xx, yy + r);
          ctx.quadraticCurveTo(xx - r, yy, xx, yy - r * 1.8);
          ctx.fill();
        });
      }
      break;
    }

    case 'stun_shock': {
      ctx.translate(fx.x, fx.y - 12 * sc);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = env * 0.95;

      // Tilted orbiting dizzy ring + 4 golden 4-point stun stars
      const rx = 56 * sc;
      const ry = 20 * sc;
      ctx.strokeStyle = '#fde047';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 14;
      ctx.lineWidth = 2.6 * sc;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();

      for (let k = 0; k < 4; k++) {
        const ang = p * Math.PI * 4.4 + (k * Math.PI) / 2;
        const sx = Math.cos(ang) * rx;
        const sy = Math.sin(ang) * ry;
        const sr = (8 + (k % 2) * 3) * sc;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(p * 6 + k);
        ctx.fillStyle = k % 2 === 0 ? '#fef08a' : '#38bdf8';
        ctx.beginPath();
        for (let j = 0; j < 8; j++) {
          const rad = j % 2 === 0 ? sr : sr * 0.36;
          const a = (j * Math.PI) / 4;
          if (j === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
          else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Crackling paralysis lightning arcs around the seat
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 2.2 * sc;
      for (let k = 0; k < 3; k++) {
        const a0 = p * 5 + k * 2.1;
        const x1 = Math.cos(a0) * 58 * sc;
        const y1 = Math.sin(a0) * 28 * sc + 14 * sc;
        const x2 = Math.cos(a0 + 1.3) * 58 * sc;
        const y2 = Math.sin(a0 + 1.3) * 28 * sc + 14 * sc;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo((x1 + x2) * 0.5 + Math.sin(p * 30 + k) * 14 * sc, (y1 + y2) * 0.5 + Math.cos(p * 26 + k) * 10 * sc);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      break;
    }

    case 'element_seal': {
      const map = {
        hỏa: { kj: '火', col: '#ff5a1f', glow: '#fb923c', bg: 'rgba(154, 52, 18, 0.55)' },
        thủy: { kj: '水', col: '#38bdf8', glow: '#bae6fd', bg: 'rgba(12, 74, 110, 0.55)' },
        lôi: { kj: '雷', col: '#facc15', glow: '#fef08a', bg: 'rgba(113, 63, 18, 0.55)' },
        phong: { kj: '風', col: '#4ade80', glow: '#bbf7d0', bg: 'rgba(20, 83, 45, 0.55)' },
      };
      const cfg = map[fx.variant] || map.hỏa;
      const pop = p < 0.25 ? 1.55 - (p / 0.25) * 0.55 : 1 + (p - 0.25) * 0.08;
      const r = 42 * sc * pop;
      ctx.translate(fx.x, fx.y);
      ctx.globalAlpha = env * 0.94;

      ctx.fillStyle = cfg.bg;
      ctx.strokeStyle = cfg.col;
      ctx.shadowColor = cfg.glow;
      ctx.shadowBlur = 18;
      ctx.lineWidth = 3 * sc;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.rotate(p * Math.PI * 1.4);
      ctx.setLineDash([7 * sc, 5 * sc]);
      ctx.strokeStyle = cfg.glow;
      ctx.lineWidth = 1.8 * sc;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${Math.round(36 * sc * pop)}px "Yuji Syuku", "Noto Serif JP", serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cfg.kj, 0, 2 * sc);
      break;
    }

    case 'chakra_drain': {
      const empty = fx.variant === 'empty';
      ctx.translate(fx.x, fx.y);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = env * 0.92;

      if (empty) {
        // Imploding chakra collapse + fractured ring
        const r = (68 * (1 - p * 0.45) + 12) * sc;
        ctx.strokeStyle = '#ef4444';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 16;
        ctx.lineWidth = 4 * sc;
        ctx.setLineDash([12 * sc, 8 * sc]);
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Spiraling drained blue-violet chakra wisps rising away
      fx.items.forEach((it) => {
        const ang = it.a + p * 3.8;
        const dist = (14 + p * (empty ? 84 : 62) * it.r) * sc;
        const cx = Math.cos(ang) * dist;
        const cy = Math.sin(ang) * dist * 0.55 - p * 68 * sc;
        ctx.fillStyle = empty ? (it.r > 0.5 ? '#f87171' : '#38bdf8') : it.r > 0.5 ? '#38bdf8' : '#a855f7';
        ctx.beginPath();
        ctx.arc(cx, cy, (3.2 + it.s * 3.6) * (1 - p * 0.45) * sc, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    case 'dodge_snare': {
      ctx.translate(fx.x, fx.y);
      ctx.globalAlpha = env * 0.92;
      const clamp = 1.45 - Math.min(1, p * 2.4) * 0.45;
      const r = 48 * sc * clamp;

      // Clamping frost/weight binding ring + downward pressure chevrons
      ctx.strokeStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 3.2 * sc;
      ctx.setLineDash([10 * sc, 6 * sc]);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2 downward chevrons indicating reduced agility/dodge
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 3.4 * sc;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (let k = 0; k < 2; k++) {
        const yy = (-14 + k * 18 + p * 26) * sc;
        ctx.beginPath();
        ctx.moveTo(-18 * sc, yy - 8 * sc);
        ctx.lineTo(0, yy + 6 * sc);
        ctx.lineTo(18 * sc, yy - 8 * sc);
        ctx.stroke();
      }
      break;
    }

    case 'curse_seal_pulse': {
      ctx.translate(fx.x, fx.y);
      ctx.globalAlpha = env * 0.92;
      const r = (36 + p * 24) * sc;
      const g = ctx.createRadialGradient(0, 0, 4, 0, 0, r * 1.6);
      g.addColorStop(0, 'rgba(126, 34, 206, 0.78)');
      g.addColorStop(0.6, 'rgba(59, 7, 100, 0.45)');
      g.addColorStop(1, 'rgba(59, 7, 100, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.4 * sc;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();

      const spin = p * Math.PI * 2.5;
      for (let k = 0; k < 3; k++) {
        drawTomoe(ctx, r * 0.56, spin + (k * Math.PI * 2) / 3, 6.8 * sc);
      }
      break;
    }

    case 'scroll_shatter': {
      const burn = fx.variant === 'burn';
      ctx.translate(fx.x, fx.y);
      fx.items.forEach((it) => {
        const dist = (14 + p * 92 * it.r) * sc;
        const px = Math.cos(it.a) * dist;
        const py = Math.sin(it.a) * dist - (burn ? p * 28 : p * 44) * sc;
        ctx.save();
        ctx.globalAlpha = env * 0.92;
        ctx.translate(px, py);
        ctx.rotate(it.p + p * 7);
        ctx.fillStyle = burn ? (it.r > 0.5 ? '#ef4444' : '#f59e0b') : '#fef3c7';
        ctx.strokeStyle = burn ? '#7f1d1d' : '#d97706';
        ctx.lineWidth = 1.4;
        ctx.fillRect(-7 * sc * it.s, -4.5 * sc * it.s, 14 * sc * it.s, 9 * sc * it.s);
        ctx.strokeRect(-7 * sc * it.s, -4.5 * sc * it.s, 14 * sc * it.s, 9 * sc * it.s);
        ctx.restore();
      });
      break;
    }

    default:
      break;
  }

  ctx.restore();
}
