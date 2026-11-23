// Sakuga Anime Flipbook + Energy Beam + Canvas 2D VFX Engine
// Hand-drawn anime VFX assets credit: KanaWorks_AI (@KanaWorks_AI)
// https://github.com/kanaworksai-hue/kanaworks-sakuga-vfx

class VfxEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.beams = [];
    this.energyBeams = [];
    this.rings = [];
    this.flipbooks = [];
    this.raf = null;
    this.lastTime = 0;

    this.manifest = null;
    this.manifestPromise = null;
    this.images = new Map();
    this.corePreloaded = false;
  }

  ensureManifest() {
    if (this.manifest) return Promise.resolve(this.manifest);
    if (!this.manifestPromise) {
      this.manifestPromise = fetch('/assets/vfx/manifest.json')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          this.manifest = data;
          return data;
        })
        .catch(() => null);
    }
    return this.manifestPromise;
  }

  loadEffectImage(id) {
    if (!id || !this.manifest?.effects?.[id]) return null;
    const cached = this.images.get(id);
    if (cached) return cached;
    const img = new Image();
    img.decoding = 'async';
    img.src = this.manifest.effects[id].src;
    const rec = { img, loaded: false, failed: false };
    img.onload = () => {
      rec.loaded = true;
    };
    img.onerror = () => {
      rec.failed = true;
    };
    this.images.set(id, rec);
    return rec;
  }

  preloadCore() {
    if (this.corePreloaded) return;
    this.corePreloaded = true;
    this.ensureManifest().then((m) => {
      if (!m?.effects) return;
      const coreIds = [
        'fire_impact_01',
        'fire_projectile_01',
        'thunder_impact_01',
        'thunder_strike_01',
        'water_impact_01',
        'wind_impact_01',
        'dark_impact_01',
        'light_impact_01',
        'rock_shield_01',
      ];
      coreIds.forEach((id) => this.loadEffectImage(id));
    });
  }

  attach(container) {
    if (!container) return;
    // Reuse the exact same canvas DOM node across render() calls so active
    // Sakuga flipbooks, Energy Beams, and particles are NEVER wiped mid-animation!
    if (!this.canvas) {
      const c = document.createElement('canvas');
      c.id = 'vfxCanvas';
      c.className = 'vfx-canvas';
      this.canvas = c;
      this.ctx = c.getContext('2d');
    }
    if (this.canvas.parentElement !== container) {
      const existing = container.querySelector('#vfxCanvas');
      if (existing && existing !== this.canvas) existing.remove();
      container.appendChild(this.canvas);
    }
    this.resize();
  }

  resize() {
    if (!this.canvas || !this.canvas.parentElement) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.max(1, Math.floor(rect.width * dpr));
    const targetH = Math.max(1, Math.floor(rect.height * dpr));
    if (this.canvas.width !== targetW || this.canvas.height !== targetH) {
      this.canvas.width = targetW;
      this.canvas.height = targetH;
    }
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

  spawnFlipbook(id, x, y, opts = {}) {
    if (!id) return false;
    if (!this.manifest) {
      this.ensureManifest().then((m) => {
        if (m?.effects?.[id]) {
          this.spawnFlipbook(id, x, y, opts);
          this.startLoop();
        }
      });
      return false;
    }
    const meta = this.manifest.effects?.[id];
    if (!meta) return false;
    const imgRec = this.loadEffectImage(id);
    if (!imgRec || imgRec.failed) return false;

    const {
      scale = 1.45,
      rotation = 0,
      speed = 1.15,
      alpha = 1.0,
      additive = false,
      delay = 0,
      followFrom = null,
      followTo = null,
      travelDuration = 0.45,
    } = opts;

    this.flipbooks.push({
      id,
      meta,
      imgRec,
      x,
      y,
      scale,
      rotation,
      speed,
      alpha,
      additive,
      delay,
      elapsed: 0,
      waitElapsed: 0,
      followFrom,
      followTo,
      travelDuration,
    });
    return true;
  }

  spawnEnergyBeam(from, to, style, opts = {}) {
    const { duration = 0.72, width = 26 } = opts;
    this.energyBeams.push({
      from,
      to,
      style,
      width,
      elapsed: 0,
      duration,
    });
  }

  spawnParticles(x, y, count, colors, opts = {}) {
    const {
      speedMin = 60,
      speedMax = 210,
      sizeMin = 3,
      sizeMax = 7,
      lifeMin = 0.35,
      lifeMax = 0.78,
      gravity = 0,
      upward = 0,
      shape = 'streak',
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
        vrot: (Math.random() - 0.5) * 9,
      });
    }
  }

  spawnRing(x, y, maxR, color, lineWidth = 4, life = 0.55) {
    this.rings.push({ x, y, r: 8, maxR, color, lineWidth, life, maxLife: life });
  }

  spawnProjectile(from, to, style) {
    const ang = Math.atan2(to.y - from.y, to.x - from.x);
    if (style.projectileFx) {
      this.spawnFlipbook(style.projectileFx, from.x, from.y, {
        scale: style.isS ? 1.55 : 1.3,
        rotation: ang,
        speed: 1.4,
        additive: style.additiveProjectile !== false,
        followFrom: from,
        followTo: to,
        travelDuration: 0.46,
      });
    }
    this.beams.push({
      from,
      to,
      progress: 0,
      speed: style.speed || 2.15,
      style,
      done: false,
    });
  }

  getSkillStyle(cast) {
    const n = (cast?.n || '').toLowerCase();
    const el = cast?.el;
    const s = (cast?.s || '').toLowerCase();
    const isS = cast?.r === 'S';
    const isDef = cast?.t === 'd';
    const isHeal = cast?.t === 'h';

    if (n.includes('thiên chiếu')) {
      return {
        kind: 'darkfire',
        colors: ['#111111', '#991b1b', '#ef4444'],
        glow: '#dc2626',
        size: 24,
        isS,
        chargeFx: 'dark_aura_01',
        projectileFx: 'fire_projectile_01',
        impactFx: 'dark_impact_01',
        impactFx2: 'fire_impact_01',
        beam: isS,
      };
    }
    if (n.includes('rasengan')) {
      return {
        kind: 'rasengan',
        colors: ['#38bdf8', '#e0f2fe', '#0284c7'],
        glow: '#38bdf8',
        size: 24,
        isS,
        chargeFx: 'light_aura_01',
        projectileFx: 'wind_vortex_01',
        impactFx: 'wind_impact_01',
        impactFx2: 'light_impact_01',
        beam: isS,
      };
    }
    if (n.includes('chidori') || n.includes('lôi thiết') || n.includes('kirin') || el === 'lôi') {
      return {
        kind: 'lightning',
        colors: ['#fde047', '#fef08a', '#38bdf8'],
        glow: '#facc15',
        size: 20,
        isS,
        chargeFx: 'thunder_charge_01',
        projectileFx: null,
        impactFx: isS || n.includes('kirin') ? 'thunder_strike_01' : 'thunder_impact_01',
        slashFx: 'thunder_slash_01',
        beam: isS,
      };
    }
    if (s === 'cửu vĩ') {
      return {
        kind: 'fire',
        colors: ['#dc2626', '#f97316', '#facc15'],
        glow: '#ef4444',
        size: 26,
        isS,
        chargeFx: 'fire_charge_01',
        projectileFx: 'fire_projectile_01',
        impactFx: 'fire_impact_01',
        beam: true,
      };
    }
    if (s === 'ma kính băng tinh') {
      return {
        kind: 'ice',
        colors: ['#bae6fd', '#38bdf8', '#ffffff'],
        glow: '#7dd3fc',
        size: 20,
        isS,
        chargeFx: 'light_aura_01',
        impactFx: 'ice_impact_01',
        shieldFx: 'ice_shield_01',
      };
    }
    if (s === 'mộc độn' || s === 'sa mạc và máu' || n.includes('la sinh môn')) {
      return {
        kind: 'rock',
        colors: ['#d97706', '#22c55e', '#fef3c7'],
        glow: '#d97706',
        size: 20,
        isS,
        chargeFx: 'light_aura_01',
        impactFx: isS ? 'rock_column_01' : 'rock_impact_01',
        shieldFx: 'rock_shield_01',
      };
    }
    if (s === 'bộ rắn' || s === 'côn trùng' || s === 'nghệ thuật rối') {
      return {
        kind: 'poison',
        colors: ['#9333ea', '#84cc16', '#c084fc'],
        glow: '#a855f7',
        size: 20,
        isS,
        chargeFx: 'dark_aura_01',
        impactFx: 'poison_impact_01',
      };
    }
    if (s === 'gió và cánh quạt' || el === 'phong') {
      return {
        kind: 'wind',
        colors: ['#34d399', '#a7f3d0', '#ffffff'],
        glow: '#10b981',
        size: 20,
        isS,
        chargeFx: 'light_aura_01',
        projectileFx: 'wind_vortex_01',
        impactFx: 'wind_impact_01',
        slashFx: 'wind_slash_01',
        beam: isS,
      };
    }
    if (el === 'hỏa' || s === 'bộ cóc' || n.includes('bom') || n.includes('bộc giấy') || n.includes('c0')) {
      return {
        kind: 'fire',
        colors: ['#ff5a1f', '#fb923c', '#fde047'],
        glow: '#ff5a1f',
        size: 22,
        isS,
        chargeFx: 'fire_charge_01',
        projectileFx: 'fire_projectile_01',
        impactFx: 'fire_impact_01',
        slashFx: 'fire_slash_01',
        beam: isS,
      };
    }
    if (el === 'thủy' || s === 'cá mập và sóng') {
      return {
        kind: 'water',
        colors: ['#0ea5e9', '#38bdf8', '#bae6fd'],
        glow: '#0284c7',
        size: 20,
        isS,
        chargeFx: 'light_aura_01',
        impactFx: isS ? 'water_column_01' : 'water_impact_01',
        shieldFx: 'water_shield_01',
        beam: isS,
      };
    }
    if (s === 'rinnegan' || s === 'uchiha' || s === 'mangakyo' || s === 'ảo thuật' || n.includes('uế thổ')) {
      return {
        kind: 'genjutsu',
        colors: ['#dc2626', '#a855f7', '#f87171'],
        glow: '#ef4444',
        size: 22,
        isS,
        chargeFx: 'dark_aura_01',
        impactFx: 'dark_impact_01',
        beam: isS && cast?.t === 'a',
      };
    }
    if (isHeal || s === 'hoa anh đào') {
      return {
        kind: 'heal',
        colors: ['#4ade80', '#f472b6', '#bbf7d0'],
        glow: '#22c55e',
        size: 16,
        isS,
        chargeFx: 'light_aura_01',
        impactFx: 'light_impact_01',
      };
    }
    if (isDef || cast?.t === 's') {
      return {
        kind: 'buff',
        colors: ['#fbbf24', '#60a5fa', '#fef3c7'],
        glow: '#f59e0b',
        size: 18,
        isS,
        chargeFx: 'light_aura_01',
        shieldFx: 'rock_shield_01',
      };
    }
    return {
      kind: 'slash',
      colors: ['#f8fafc', '#fbbf24', '#ea580c'],
      glow: '#f97316',
      size: 18,
      isS,
      slashFx: 'wind_slash_01',
      impactFx: 'rock_impact_01',
    };
  }

  triggerCast(container, cast, flEvents = []) {
    this.attach(container);
    if (!this.canvas || !cast) return;
    this.ensureManifest();

    const style = this.getSkillStyle(cast);
    const srcIdx = cast.srcIdx ?? -1;
    const srcPos = srcIdx >= 0 ? this.seatCenter(container, srcIdx) : null;
    const targets = [...new Set(flEvents.map((e) => e.t).filter((t) => t >= 0 && t !== srcIdx))];

    if (srcPos) {
      if (style.shieldFx && cast.t === 'd') {
        this.spawnFlipbook(style.shieldFx, srcPos.x, srcPos.y, { scale: 1.45, speed: 1.15 });
      } else if (style.chargeFx) {
        this.spawnFlipbook(style.chargeFx, srcPos.x, srcPos.y, {
          scale: cast.r === 'S' ? 1.65 : 1.3,
          speed: 1.2,
          additive: style.kind !== 'genjutsu' && style.kind !== 'darkfire',
        });
      }
      this.spawnRing(srcPos.x, srcPos.y, cast.r === 'S' ? 115 : 75, style.glow, 3.5, 0.5);
      this.spawnParticles(srcPos.x, srcPos.y, cast.r === 'S' ? 22 : 14, style.colors, {
        speedMin: 45,
        speedMax: 175,
        upward: style.kind === 'heal' || style.kind === 'buff' ? 85 : 0,
      });
    }

    if (targets.length && srcPos) {
      targets.forEach((ti) => {
        const toPos = this.seatCenter(container, ti);
        if (style.beam && cast.r === 'S') {
          this.spawnEnergyBeam(srcPos, toPos, style, { duration: 0.85, width: 32 });
        } else {
          this.spawnProjectile(srcPos, toPos, style);
        }
      });
    }

    this.startLoop();
  }

  triggerImpact(container, cast, flEvents = []) {
    this.attach(container);
    if (!this.canvas) return;
    const style = cast ? this.getSkillStyle(cast) : null;
    const srcIdx = cast?.srcIdx ?? -1;
    const srcPos = srcIdx >= 0 ? this.seatCenter(container, srcIdx) : null;

    // For defense / buff / heal cards that have no damage events, replay a crisp
    // Sakuga shield / aura flipbook on the caster once the cut-in banner clears.
    if (cast && style && srcPos && !flEvents.some((e) => e.c === 'hp' || e.c === 'ko')) {
      if (cast.t === 'd' && style.shieldFx) {
        this.spawnFlipbook(style.shieldFx, srcPos.x, srcPos.y, { scale: 1.55, speed: 1.1 });
      } else if ((cast.t === 's' || cast.t === 'h') && (style.chargeFx || style.impactFx)) {
        this.spawnFlipbook(style.chargeFx || style.impactFx, srcPos.x, srcPos.y, {
          scale: 1.45,
          speed: 1.15,
          additive: style.kind !== 'genjutsu',
        });
      }
    }

    flEvents.forEach((ev) => {
      const pos = this.seatCenter(container, ev.t);
      const ang = srcPos ? Math.atan2(pos.y - srcPos.y, pos.x - srcPos.x) : 0;

      if (ev.c === 'rx') {
        this.spawnFlipbook('light_impact_01', pos.x, pos.y, { scale: 1.75, speed: 1.25, additive: true });
        this.spawnFlipbook('thunder_impact_01', pos.x, pos.y, { scale: 1.5, speed: 1.3, delay: 0.06, additive: true });
        this.spawnRing(pos.x, pos.y, 130, '#e0b3ff', 5, 0.55);
        this.spawnParticles(pos.x, pos.y, 26, ['#e879f9', '#38bdf8', '#facc15', '#ff5a1f'], {
          speedMin: 110,
          speedMax: 310,
          sizeMax: 9,
        });
      } else if (ev.c === 'ko') {
        this.spawnFlipbook('dark_impact_01', pos.x, pos.y, { scale: 2.0, speed: 1.05 });
        this.spawnFlipbook('fire_impact_01', pos.x, pos.y, { scale: 1.85, speed: 1.15, delay: 0.08, additive: true });
        this.spawnRing(pos.x, pos.y, 175, '#ef4444', 7, 0.95);
        this.spawnRing(pos.x, pos.y, 125, '#111827', 5, 0.8);
        this.spawnParticles(pos.x, pos.y, 40, ['#ef4444', '#dc2626', '#fbbf24', '#111827'], {
          speedMin: 100,
          speedMax: 340,
          sizeMin: 4,
          sizeMax: 11,
          lifeMin: 0.55,
          lifeMax: 1.1,
        });
      } else if (ev.c === 'hp') {
        const cols = style ? style.colors : ['#ff5448', '#fb923c', '#fff'];
        const impactFx = style?.impactFx || 'fire_impact_01';
        this.spawnFlipbook(impactFx, pos.x, pos.y, {
          scale: style?.isS ? 1.85 : 1.45,
          speed: 1.2,
          additive: style?.kind !== 'genjutsu' && style?.kind !== 'darkfire' && style?.kind !== 'poison',
        });
        if (style?.impactFx2) {
          this.spawnFlipbook(style.impactFx2, pos.x, pos.y, {
            scale: style.isS ? 1.7 : 1.35,
            speed: 1.25,
            delay: 0.06,
            additive: true,
          });
        }
        if (style?.slashFx) {
          this.spawnFlipbook(style.slashFx, pos.x, pos.y, {
            scale: 1.4,
            rotation: ang,
            speed: 1.4,
            additive: true,
          });
        }
        this.spawnRing(pos.x, pos.y, style?.isS ? 115 : 80, cols[0], 4, 0.45);
        this.spawnParticles(pos.x, pos.y, style?.isS ? 24 : 16, cols, {
          speedMin: 90,
          speedMax: 260,
          gravity: 160,
        });
      } else if (ev.c === 'ar') {
        const shieldFx = style?.shieldFx || 'rock_shield_01';
        this.spawnFlipbook(shieldFx, pos.x, pos.y, { scale: 1.4, speed: 1.2 });
        this.spawnRing(pos.x, pos.y, 75, '#60a5fa', 4, 0.42);
        this.spawnParticles(pos.x, pos.y, 12, ['#93c5fd', '#dbeafe', '#3b82f6'], { speedMax: 165 });
      } else if (ev.c === 'dg') {
        this.spawnFlipbook('wind_vortex_01', pos.x, pos.y, { scale: 1.25, speed: 1.45, alpha: 0.85 });
        this.spawnParticles(pos.x, pos.y, 14, ['#ffffff', '#cbd5e1'], { speedMax: 190, upward: 45 });
      } else if (ev.c === 'au') {
        const auFx = ev.sfx === 'genjutsu' ? 'dark_aura_01' : 'light_aura_01';
        this.spawnFlipbook(auFx, pos.x, pos.y, { scale: 1.5, speed: 1.15, additive: ev.sfx !== 'genjutsu' });
        this.spawnRing(pos.x, pos.y, 92, ev.sfx === 'genjutsu' ? '#dc2626' : '#ffd24a', 4, 0.65);
        this.spawnParticles(pos.x, pos.y, 16, ['#fde047', '#fff', '#f59e0b'], { upward: 75 });
      } else if (ev.c === 'pt') {
        this.spawnFlipbook('rock_impact_01', pos.x, pos.y, { scale: 1.3, speed: 1.25 });
        this.spawnParticles(pos.x, pos.y, 12, ['#fb923c', '#fde68a', '#fff'], { speedMax: 180 });
      }
    });

    this.startLoop();
  }

  // Backward-compatible combined entry point
  trigger(container, cast, flEvents = []) {
    if (cast) this.triggerCast(container, cast, flEvents);
    else this.triggerImpact(container, null, flEvents);
  }

  startLoop() {
    if (this.raf) return;
    this.lastTime = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - this.lastTime) / 1000);
      this.lastTime = now;
      this.updateAndDraw(dt);
      if (
        this.particles.length ||
        this.beams.length ||
        this.energyBeams.length ||
        this.rings.length ||
        this.flipbooks.length
      ) {
        this.raf = requestAnimationFrame(tick);
      } else {
        this.raf = null;
      }
    };
    this.raf = requestAnimationFrame(tick);
  }

  drawLightning(ctx, x1, y1, x2, y2, color, width = 3, jitter = 30) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    const steps = 8;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const jx = (Math.random() - 0.5) * jitter;
      const jy = (Math.random() - 0.5) * jitter;
      ctx.lineTo(x1 + (x2 - x1) * t + jx, y1 + (y2 - y1) * t + jy);
    }
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  drawEnergyBeam(ctx, eb) {
    const p = Math.min(1, eb.elapsed / eb.duration);
    // Fast extend (0..0.28), hold & pulse (0.28..0.72), snappy fade (0.72..1.0)
    const reach = p < 0.28 ? p / 0.28 : 1;
    const fade = p > 0.72 ? Math.max(0, 1 - (p - 0.72) / 0.28) : 1;
    const pulse = 1 + Math.sin(eb.elapsed * 42) * 0.16;
    const w = eb.width * pulse * (0.45 + 0.55 * fade);

    const x1 = eb.from.x;
    const y1 = eb.from.y;
    const x2 = x1 + (eb.to.x - x1) * reach;
    const y2 = y1 + (eb.to.y - y1) * reach;
    const glow = eb.style.glow || '#38bdf8';
    const colMid = eb.style.colors?.[0] || glow;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';

    // Outer plasma aura
    ctx.globalAlpha = 0.34 * fade;
    ctx.strokeStyle = glow;
    ctx.shadowColor = glow;
    ctx.shadowBlur = 28;
    ctx.lineWidth = w * 2.15;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Mid elemental beam
    ctx.globalAlpha = 0.78 * fade;
    ctx.strokeStyle = colMid;
    ctx.lineWidth = w * 1.1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // White-hot inner core
    ctx.globalAlpha = 0.95 * fade;
    ctx.strokeStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 12;
    ctx.lineWidth = Math.max(3, w * 0.38);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Origin charge orb & tip flare
    ctx.globalAlpha = 0.85 * fade;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = glow;
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(x1, y1, w * 0.65, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x2, y2, w * 0.85, 0, Math.PI * 2);
    ctx.fill();

    // Crackling lightning around beam
    if (fade > 0.2) {
      ctx.globalAlpha = 0.85 * fade;
      this.drawLightning(ctx, x1, y1, x2, y2, '#ffffff', 2.2, 26);
    }
    ctx.restore();
  }

  updateAndDraw(dt) {
    const ctx = this.ctx;
    if (!ctx || !this.canvas) return;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    // 1. S-rank Multi-layer Energy Beams
    for (let i = this.energyBeams.length - 1; i >= 0; i--) {
      const eb = this.energyBeams[i];
      eb.elapsed += dt;
      if (eb.elapsed >= eb.duration) {
        this.energyBeams.splice(i, 1);
        continue;
      }
      this.drawEnergyBeam(ctx, eb);
    }

    // 2. Projectiles / Lightning trails
    for (let i = this.beams.length - 1; i >= 0; i--) {
      const b = this.beams[i];
      b.progress = Math.min(1, b.progress + b.speed * dt);
      const x = b.from.x + (b.to.x - b.from.x) * b.progress;
      const y = b.from.y + (b.to.y - b.from.y) * b.progress;

      if (b.style.kind === 'lightning') {
        this.drawLightning(ctx, b.from.x, b.from.y, x, y, b.style.glow, 3.2, 32);
        this.drawLightning(ctx, b.from.x, b.from.y, x, y, '#ffffff', 1.4, 18);
      } else if (!b.style.projectileFx) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = b.style.colors[0];
        ctx.shadowColor = b.style.glow;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(x, y, b.style.size * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      this.spawnParticles(x, y, 2, b.style.colors, {
        speedMin: 20,
        speedMax: 85,
        sizeMin: 2,
        sizeMax: 5,
        lifeMin: 0.14,
        lifeMax: 0.28,
      });

      if (b.progress >= 1) {
        this.beams.splice(i, 1);
      }
    }

    // 3. Expanding shockwave rings
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.life -= dt;
      if (r.life <= 0) {
        this.rings.splice(i, 1);
        continue;
      }
      const p = 1 - r.life / r.maxLife;
      const curR = r.r + (r.maxR - r.r) * (1 - Math.pow(1 - p, 2));
      ctx.save();
      ctx.globalAlpha = Math.max(0, (1 - p) * 0.85);
      ctx.strokeStyle = r.color;
      ctx.shadowColor = r.color;
      ctx.shadowBlur = 12;
      ctx.lineWidth = r.lineWidth * (1 - p * 0.65);
      ctx.beginPath();
      ctx.arc(r.x, r.y, curR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Sakuga Hand-Drawn Flipbook Spritesheets
    for (let i = this.flipbooks.length - 1; i >= 0; i--) {
      const fb = this.flipbooks[i];
      if (!fb.imgRec.loaded) {
        fb.waitElapsed += dt;
        if (fb.imgRec.failed || fb.waitElapsed > 2.5) {
          this.flipbooks.splice(i, 1);
        }
        continue;
      }
      if (fb.delay > 0) {
        fb.delay -= dt;
        continue;
      }
      fb.elapsed += dt;
      const frameIdx = Math.floor(fb.elapsed * fb.meta.fps * fb.speed);
      if (frameIdx >= fb.meta.frames) {
        this.flipbooks.splice(i, 1);
        continue;
      }

      let drawX = fb.x;
      let drawY = fb.y;
      if (fb.followFrom && fb.followTo) {
        const tp = Math.min(1, fb.elapsed / fb.travelDuration);
        drawX = fb.followFrom.x + (fb.followTo.x - fb.followFrom.x) * tp;
        drawY = fb.followFrom.y + (fb.followTo.y - fb.followFrom.y) * tp;
        if (tp >= 1) {
          this.flipbooks.splice(i, 1);
          continue;
        }
      }

      const [cols] = fb.meta.grid;
      const [cw, ch] = fb.meta.cell;
      const sx = (frameIdx % cols) * cw;
      const sy = Math.floor(frameIdx / cols) * ch;
      const drawW = cw * fb.scale;
      const drawH = ch * fb.scale;
      const [px, py] = fb.meta.pivot || [0.5, 0.5];

      ctx.save();
      if (fb.additive) ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = fb.alpha;
      ctx.translate(drawX, drawY);
      if (fb.rotation) ctx.rotate(fb.rotation);
      ctx.drawImage(fb.imgRec.img, sx, sy, cw, ch, -drawW * px, -drawH * py, drawW, drawH);
      ctx.restore();
    }

    // 5. Crisp Anime Spark Streak Particles
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
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = alpha;
      if (pt.shape === 'streak') {
        const len = Math.max(6, Math.hypot(pt.vx, pt.vy) * 0.045);
        const ang = Math.atan2(pt.vy, pt.vx);
        ctx.strokeStyle = pt.color;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 8;
        ctx.lineWidth = Math.max(1.5, pt.size * 0.42 * alpha);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x - Math.cos(ang) * len, pt.y - Math.sin(ang) * len);
        ctx.stroke();
      } else {
        ctx.fillStyle = pt.color;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 8;
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.rot);
        ctx.beginPath();
        ctx.arc(0, 0, pt.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}

export const VFX = new VfxEngine();
// Warm up manifest immediately on module load
VFX.ensureManifest();
