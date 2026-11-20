// Canvas 2D Jutsu & Particle VFX Engine
// Inspired by Naruto FX, Fire Jutsu FX, Cartoon FX & Spellbound VFX

class VfxEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.beams = [];
    this.rings = [];
    this.raf = null;
    this.lastTime = 0;
  }

  attach(container) {
    if (!container) return;
    let c = container.querySelector('#vfxCanvas');
    if (!c) {
      c = document.createElement('canvas');
      c.id = 'vfxCanvas';
      c.className = 'vfx-canvas';
      container.appendChild(c);
    }
    this.canvas = c;
    this.ctx = c.getContext('2d');
    this.resize();
  }

  resize() {
    if (!this.canvas || !this.canvas.parentElement) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    if (this.ctx) this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  seatCenter(container, idx) {
    const tbRect = container.getBoundingClientRect();
    const el = container.querySelector(`[data-seat-idx="${idx}"]`);
    if (!el) return { x: tbRect.width / 2, y: tbRect.height / 2 };
    const r = el.getBoundingClientRect();
    return {
      x: r.left - tbRect.left + r.width / 2,
      y: r.top - tbRect.top + r.height / 2,
    };
  }

  spawnParticles(x, y, count, colors, opts = {}) {
    const {
      speedMin = 40,
      speedMax = 160,
      sizeMin = 3,
      sizeMax = 8,
      lifeMin = 0.55,
      lifeMax = 1.2,
      gravity = 0,
      upward = 0,
      shape = 'circle',
    } = opts;
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = speedMin + Math.random() * (speedMax - speedMin);
      const life = lifeMin + Math.random() * (lifeMax - lifeMin);
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - upward,
        size: sizeMin + Math.random() * (sizeMax - sizeMin),
        color: colors[Math.floor(Math.random() * colors.length)],
        life,
        maxLife: life,
        gravity,
        shape,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 8,
      });
    }
  }

  spawnRing(x, y, maxR, color, lineWidth = 4, life = 0.8) {
    this.rings.push({ x, y, r: 8, maxR, color, lineWidth, life, maxLife: life });
  }

  spawnProjectile(from, to, style) {
    this.beams.push({
      from,
      to,
      progress: 0,
      speed: style.speed || 1.35,
      style,
      done: false,
    });
  }

  getSkillStyle(cast) {
    const n = (cast.n || '').toLowerCase();
    const el = cast.el;
    const s = (cast.s || '').toLowerCase();

    if (n.includes('thiên chiếu')) {
      return { kind: 'fire', colors: ['#111111', '#7f1d1d', '#ef4444'], glow: '#dc2626', size: 22 };
    }
    if (n.includes('rasengan')) {
      return { kind: 'rasengan', colors: ['#38bdf8', '#e0f2fe', '#0284c7'], glow: '#38bdf8', size: 24 };
    }
    if (n.includes('chidori') || n.includes('lôi thiết') || el === 'lôi') {
      return { kind: 'lightning', colors: ['#fde047', '#fef08a', '#38bdf8'], glow: '#facc15', size: 18 };
    }
    if (s === 'cửu vĩ') {
      return { kind: 'fire', colors: ['#dc2626', '#f97316', '#facc15'], glow: '#ef4444', size: 26 };
    }
    if (s === 'ma kính băng tinh') {
      return { kind: 'water', colors: ['#bae6fd', '#38bdf8', '#ffffff'], glow: '#7dd3fc', size: 20 };
    }
    if (s === 'mộc độn' || s === 'côn trùng') {
      return { kind: 'wind', colors: ['#22c55e', '#84cc16', '#dcfce7'], glow: '#22c55e', size: 20 };
    }
    if (s === 'gió và cánh quạt') {
      return { kind: 'wind', colors: ['#34d399', '#a7f3d0', '#ffffff'], glow: '#10b981', size: 20 };
    }
    if (s === 'bộ rắn') {
      return { kind: 'gravity', colors: ['#9333ea', '#c084fc', '#facc15'], glow: '#a855f7', size: 20 };
    }
    if (s === 'bộ cóc') {
      return { kind: 'fire', colors: ['#f97316', '#fbbf24', '#86efac'], glow: '#ea580c', size: 20 };
    }
    if (el === 'hỏa' || n.includes('bom') || n.includes('bộc giấy')) {
      return { kind: 'fire', colors: ['#ff5a1f', '#fb923c', '#fde047'], glow: '#ff5a1f', size: 20 };
    }
    if (el === 'thủy' || s === 'cá mập và sóng') {
      return { kind: 'water', colors: ['#0ea5e9', '#38bdf8', '#bae6fd'], glow: '#0284c7', size: 20 };
    }
    if (el === 'phong' || s === 'sa mạc và máu') {
      return { kind: 'wind', colors: ['#4ade80', '#d97706', '#fef3c7'], glow: '#22c55e', size: 18 };
    }
    if (s === 'rinnegan') {
      return { kind: 'gravity', colors: ['#a855f7', '#e9d5ff', '#6b21a8'], glow: '#9333ea', size: 24 };
    }
    if (s === 'uchiha' || s === 'mangakyo' || s === 'ảo thuật') {
      return { kind: 'genjutsu', colors: ['#dc2626', '#991b1b', '#f87171'], glow: '#ef4444', size: 20 };
    }
    if (cast.t === 'h' || s === 'hoa anh đào') {
      return { kind: 'heal', colors: ['#4ade80', '#f472b6', '#bbf7d0'], glow: '#22c55e', size: 16 };
    }
    if (cast.t === 'd' || cast.t === 's') {
      return { kind: 'buff', colors: ['#fbbf24', '#60a5fa', '#fef3c7'], glow: '#f59e0b', size: 18 };
    }
    return { kind: 'slash', colors: ['#f8fafc', '#cbd5e1', '#ff6a3d'], glow: '#ff6a3d', size: 16 };
  }

  trigger(container, cast, flEvents = []) {
    this.attach(container);
    if (!this.canvas) return;

    const style = cast ? this.getSkillStyle(cast) : null;
    const srcIdx = cast?.srcIdx ?? -1;
    const srcPos = srcIdx >= 0 ? this.seatCenter(container, srcIdx) : null;
    const targets = [...new Set(flEvents.map((e) => e.t).filter((t) => t >= 0))];

    if (cast && style) {
      if (srcPos) {
        this.spawnRing(srcPos.x, srcPos.y, cast.r === 'S' ? 95 : 65, style.glow, 3, 0.45);
        this.spawnParticles(srcPos.x, srcPos.y, cast.r === 'S' ? 24 : 14, style.colors, {
          speedMin: 40,
          speedMax: 150,
          upward: style.kind === 'heal' || style.kind === 'buff' ? 70 : 0,
        });
      }

      if (targets.length && srcPos) {
        targets.forEach((ti) => {
          if (ti === srcIdx) return;
          const toPos = this.seatCenter(container, ti);
          this.spawnProjectile(srcPos, toPos, style);
        });
      }
    }

    flEvents.forEach((ev) => {
      const pos = this.seatCenter(container, ev.t);
      if (ev.c === 'rx') {
        this.spawnRing(pos.x, pos.y, 110, '#e0b3ff', 5, 0.65);
        this.spawnParticles(pos.x, pos.y, 28, ['#e879f9', '#38bdf8', '#facc15', '#ff5a1f'], {
          speedMin: 90,
          speedMax: 280,
          sizeMax: 9,
          shape: 'star',
        });
      } else if (ev.c === 'hp') {
        const cols = style ? style.colors : ['#ff5448', '#fb923c', '#fff'];
        this.spawnRing(pos.x, pos.y, 75, cols[0], 4, 0.45);
        this.spawnParticles(pos.x, pos.y, 20, cols, {
          speedMin: 70,
          speedMax: 230,
          gravity: 160,
        });
      } else if (ev.c === 'ar') {
        this.spawnRing(pos.x, pos.y, 68, '#60a5fa', 4, 0.45);
        this.spawnParticles(pos.x, pos.y, 12, ['#93c5fd', '#dbeafe', '#3b82f6'], { speedMax: 150 });
      } else if (ev.c === 'dg') {
        this.spawnParticles(pos.x, pos.y, 14, ['#ffffff', '#cbd5e1'], { speedMax: 170, upward: 40 });
      } else if (ev.c === 'au') {
        this.spawnRing(pos.x, pos.y, 82, '#ffd24a', 4, 0.85);
        this.spawnParticles(pos.x, pos.y, 18, ['#fde047', '#fff', '#f59e0b'], { upward: 60 });
      } else if (ev.c === 'ko') {
        this.spawnRing(pos.x, pos.y, 150, '#ef4444', 7, 1.15);
        this.spawnRing(pos.x, pos.y, 110, '#111827', 5, 0.95);
        this.spawnParticles(pos.x, pos.y, 45, ['#ef4444', '#dc2626', '#fbbf24', '#111827'], {
          speedMin: 80,
          speedMax: 290,
          sizeMin: 5,
          sizeMax: 12,
          lifeMin: 0.7,
          lifeMax: 1.4,
          shape: 'star',
        });
      }
    });

    this.startLoop();
  }

  startLoop() {
    if (this.raf) return;
    this.lastTime = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - this.lastTime) / 1000);
      this.lastTime = now;
      this.updateAndDraw(dt);
      if (this.particles.length || this.beams.length || this.rings.length) {
        this.raf = requestAnimationFrame(tick);
      } else {
        this.raf = null;
      }
    };
    this.raf = requestAnimationFrame(tick);
  }

  drawLightning(ctx, x1, y1, x2, y2, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    const steps = 7;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const jx = (Math.random() - 0.5) * 34;
      const jy = (Math.random() - 0.5) * 34;
      ctx.lineTo(x1 + (x2 - x1) * t + jx, y1 + (y2 - y1) * t + jy);
    }
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  updateAndDraw(dt) {
    const ctx = this.ctx;
    if (!ctx || !this.canvas) return;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    // Projectiles / Beams
    for (let i = this.beams.length - 1; i >= 0; i--) {
      const b = this.beams[i];
      b.progress = Math.min(1, b.progress + b.speed * dt);
      const x = b.from.x + (b.to.x - b.from.x) * b.progress;
      const y = b.from.y + (b.to.y - b.from.y) * b.progress;

      if (b.style.kind === 'lightning') {
        this.drawLightning(ctx, b.from.x, b.from.y, x, y, b.style.glow);
      } else {
        ctx.save();
        ctx.fillStyle = b.style.colors[0];
        ctx.shadowColor = b.style.glow;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(x, y, b.style.size * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Trail particles
      this.spawnParticles(x, y, 2, b.style.colors, {
        speedMin: 15,
        speedMax: 75,
        sizeMin: 2,
        sizeMax: 6,
        lifeMin: 0.18,
        lifeMax: 0.35,
      });

      if (b.progress >= 1) {
        this.spawnRing(b.to.x, b.to.y, 78, b.style.glow, 4, 0.4);
        this.spawnParticles(b.to.x, b.to.y, 16, b.style.colors, { speedMin: 70, speedMax: 210 });
        this.beams.splice(i, 1);
      }
    }

    // Expanding shockwave rings
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.life -= dt;
      if (r.life <= 0) {
        this.rings.splice(i, 1);
        continue;
      }
      const p = 1 - r.life / r.maxLife;
      const curR = r.r + (r.maxR - r.r) * p;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - p);
      ctx.strokeStyle = r.color;
      ctx.shadowColor = r.color;
      ctx.shadowBlur = 10;
      ctx.lineWidth = r.lineWidth * (1 - p * 0.6);
      ctx.beginPath();
      ctx.arc(r.x, r.y, curR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= dt;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      pt.vy += pt.gravity * dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.rot += pt.vrot * dt;

      const alpha = Math.max(0, pt.life / pt.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = pt.color;
      ctx.shadowColor = pt.color;
      ctx.shadowBlur = 8;
      ctx.translate(pt.x, pt.y);
      ctx.rotate(pt.rot);
      if (pt.shape === 'star') {
        const s = pt.size;
        ctx.fillRect(-s / 2, -s / 2, s, s);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, pt.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}

export const VFX = new VfxEngine();
