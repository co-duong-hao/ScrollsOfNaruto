// 3-Layer Naruto VFX Engine:
// 1. 48 Hand-drawn Anime Sakuga Flipbooks (KanaWorks_AI @KanaWorks_AI) with loopStyle fade envelope
// 2. 17 Canon Naruto Special Effects (narutoSpecialFx.js)
// 3. S-rank Multi-layer Energy Beams & Velocity Spark Streaks
// Includes 4-layer ghost-image bug fix: full-buffer clearCanvas() on every frame & loop exit,
// ResizeObserver sync, and clearAll() lifecycle cleanup.

import { getCardFxProfile } from './skillFxMap.js';
import { createSpecialFx, drawSpecialFx } from './narutoSpecialFx.js';

class VfxEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.dpr = 1;
    this.resizeObs = null;
    this.observedEl = null;

    this.particles = [];
    this.beams = [];
    this.energyBeams = [];
    this.rings = [];
    this.flipbooks = [];
    this.specials = [];
    this.raf = null;
    this.lastTime = 0;

    this.manifest = null;
    this.manifestPromise = null;
    this.images = new Map();
    this.corePreloaded = false;
  }

  ensureManifest() {
    if (this.manifest) return Promise.resolve(this.manifest);
    if (!this.manifestPromise && typeof fetch !== 'undefined') {
      this.manifestPromise = fetch('/assets/vfx/manifest.json')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          this.manifest = data;
          return data;
        })
        .catch(() => null);
    }
    return this.manifestPromise || Promise.resolve(null);
  }

  loadEffectImage(id) {
    if (!id || !this.manifest?.effects?.[id] || typeof Image === 'undefined') return null;
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
        'wind_vortex_01',
        'dark_impact_01',
        'light_impact_01',
        'rock_impact_01',
        'rock_shield_01',
      ];
      coreIds.forEach((id) => this.loadEffectImage(id));
    });
  }

  hasActiveFx() {
    return (
      this.particles.length > 0 ||
      this.beams.length > 0 ||
      this.energyBeams.length > 0 ||
      this.rings.length > 0 ||
      this.flipbooks.length > 0 ||
      this.specials.length > 0
    );
  }

  // Always clear the FULL backing buffer in physical pixels so DPR / layout shifts
  // can NEVER leave a clipped or frozen image fragment over a player seat box!
  clearCanvas() {
    const ctx = this.ctx;
    const c = this.canvas;
    if (!ctx || !c) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.restore();
  }

  clearAll() {
    this.particles.length = 0;
    this.beams.length = 0;
    this.energyBeams.length = 0;
    this.rings.length = 0;
    this.flipbooks.length = 0;
    this.specials.length = 0;
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = null;
    }
    this.clearCanvas();
  }

  attach(container) {
    if (!container) return;
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
    if (!this.hasActiveFx()) {
      this.clearCanvas();
    }

    if (typeof ResizeObserver !== 'undefined' && this.observedEl !== container) {
      if (this.resizeObs) this.resizeObs.disconnect();
      this.observedEl = container;
      this.resizeObs = new ResizeObserver(() => {
        this.resize();
        if (!this.hasActiveFx()) this.clearCanvas();
      });
      this.resizeObs.observe(container);
    }
  }

  resize() {
    if (!this.canvas || !this.canvas.parentElement) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.max(1, Math.floor(rect.width * this.dpr));
    const targetH = Math.max(1, Math.floor(rect.height * this.dpr));
    if (this.canvas.width !== targetW || this.canvas.height !== targetH) {
      this.canvas.width = targetW;
      this.canvas.height = targetH;
    }
    if (this.ctx) this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
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

  spawnSpecial(spec, { x, y, from, to, scale = 1, duration = 0.95, delay = 0 } = {}) {
    if (!spec?.type) return;
    this.specials.push(
      createSpecialFx(spec.type, {
        x,
        y,
        from,
        to,
        variant: spec.variant || '',
        scale,
        duration,
        delay,
      })
    );
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
      scale = 1.4,
      rotation = 0,
      speed = 1.2,
      alpha = 1.0,
      additive = false,
      delay = 0,
      followFrom = null,
      followTo = null,
      travelDuration = 0.44,
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
    const { duration = 0.8, width = 30 } = opts;
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
      lifeMin = 0.32,
      lifeMax = 0.72,
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

  spawnRing(x, y, maxR, color, lineWidth = 4, life = 0.5) {
    this.rings.push({ x, y, r: 8, maxR, color, lineWidth, life, maxLife: life });
  }

  spawnProjectile(from, to, style) {
    const ang = Math.atan2(to.y - from.y, to.x - from.x);
    if (style.projectileFx) {
      this.spawnFlipbook(style.projectileFx, from.x, from.y, {
        scale: style.isS ? 1.5 : 1.25,
        rotation: ang,
        speed: 1.45,
        additive: style.kind !== 'poison' && style.kind !== 'darkfire',
        followFrom: from,
        followTo: to,
        travelDuration: 0.44,
      });
    }
    this.beams.push({
      from,
      to,
      progress: 0,
      speed: style.speed || 2.2,
      style,
    });
  }

  getSkillStyle(cast) {
    return getCardFxProfile(cast);
  }

  triggerCast(container, cast, flEvents = []) {
    this.attach(container);
    if (!this.canvas || !cast) return;
    this.ensureManifest();

    const style = this.getSkillStyle(cast);
    const srcIdx = cast.srcIdx ?? -1;
    const srcPos = srcIdx >= 0 ? this.seatCenter(container, srcIdx) : null;
    const targets = [...new Set(flEvents.map((e) => e.t).filter((t) => t != null && t >= 0 && t !== srcIdx))];

    const directionalSpecials = new Set([
      'hiraishin_flash',
      'ninja_weapons',
      'shadow_bind',
      'paper_storm',
      'sand_wave',
      'bug_swarm',
      'puppet_threads',
    ]);

    if (srcPos) {
      // Special canon Naruto effect on cast (caster-centered)
      if (style.specialCast && !directionalSpecials.has(style.specialCast.type)) {
        this.spawnSpecial(style.specialCast, {
          x: srcPos.x,
          y: srcPos.y,
          scale: cast.r === 'S' ? 1.25 : 1.0,
          duration: cast.r === 'S' ? 1.05 : 0.88,
        });
      }

      if (style.shieldFx && cast.t === 'd') {
        this.spawnFlipbook(style.shieldFx, srcPos.x, srcPos.y, { scale: 1.35, speed: 1.25 });
      } else if (style.chargeFx) {
        this.spawnFlipbook(style.chargeFx, srcPos.x, srcPos.y, {
          scale: cast.r === 'S' ? 1.55 : 1.2,
          speed: 1.25,
          additive: style.kind !== 'genjutsu' && style.kind !== 'darkfire' && style.kind !== 'poison',
        });
      }
      this.spawnRing(srcPos.x, srcPos.y, cast.r === 'S' ? 110 : 72, style.glow, 3.5, 0.48);
      this.spawnParticles(srcPos.x, srcPos.y, cast.r === 'S' ? 20 : 12, style.colors, {
        speedMin: 45,
        speedMax: 170,
        upward: style.kind === 'heal' || style.kind === 'buff' ? 85 : 0,
      });
    }

    if (targets.length && srcPos) {
      targets.forEach((ti) => {
        const toPos = this.seatCenter(container, ti);
        // Directional canon special effects (Kunai, Hiraishin, Shadow, Paper, Sand, Bugs, Puppet Threads)
        if (style.specialCast && directionalSpecials.has(style.specialCast.type)) {
          this.spawnSpecial(style.specialCast, {
            x: toPos.x,
            y: toPos.y,
            from: srcPos,
            to: toPos,
            scale: cast.r === 'S' ? 1.2 : 1.0,
            duration: 0.82,
          });
        }

        if (style.beam && cast.r === 'S') {
          this.spawnEnergyBeam(srcPos, toPos, style, { duration: 0.82, width: 30 });
        } else if (!style.instantImpact) {
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

    // Defense / Buff / Heal / Summon cards without damage events replay cleanly on caster
    if (cast && style && srcPos && !flEvents.some((e) => e.c === 'hp' || e.c === 'ko')) {
      if (style.specialImpact) {
        this.spawnSpecial(style.specialImpact, {
          x: srcPos.x,
          y: srcPos.y,
          scale: cast.r === 'S' ? 1.2 : 1.0,
          duration: 0.9,
        });
      }
      if (cast.t === 'd' && style.shieldFx) {
        this.spawnFlipbook(style.shieldFx, srcPos.x, srcPos.y, { scale: 1.4, speed: 1.2 });
      } else if ((cast.t === 's' || cast.t === 'h') && (style.chargeFx || style.impactFx)) {
        this.spawnFlipbook(style.chargeFx || style.impactFx, srcPos.x, srcPos.y, {
          scale: 1.35,
          speed: 1.2,
          additive: style.kind !== 'genjutsu' && style.kind !== 'poison',
        });
      }
    }

    flEvents.forEach((ev) => {
      if (ev.t == null || ev.t < 0) return;
      const pos = this.seatCenter(container, ev.t);
      const ang = srcPos ? Math.atan2(pos.y - srcPos.y, pos.x - srcPos.x) : 0;

      // Dedicated debuff VFX handler (runs for 'db' events and debuff-tagged damage ticks)
      if (ev.fx) {
        if (ev.c === 'hp') {
          // Damage tick paired with a 'db' event (bleed_tick, amaterasu_tick, bug_bite, curse_drain):
          // avoid spawning a generic fire explosion over the dedicated debuff VFX.
          return;
        }
        if (ev.fx === 'bleed_apply' || ev.fx === 'bleed_tick') {
          this.spawnSpecial({ type: 'blood_bleed', variant: 'normal' }, { x: pos.x, y: pos.y, scale: 1.0, duration: 0.9 });
          this.spawnRing(pos.x, pos.y, 76, '#ef4444', 3.5, 0.48);
          this.spawnParticles(pos.x, pos.y, 14, ['#ef4444', '#b91c1c', '#fca5a5'], {
            speedMin: 40,
            speedMax: 145,
            gravity: 260,
            shape: 'dot',
          });
          return;
        }
        if (ev.fx === 'amaterasu_apply' || ev.fx === 'amaterasu_tick') {
          this.spawnSpecial({ type: 'blood_bleed', variant: 'amaterasu' }, { x: pos.x, y: pos.y, scale: 1.12, duration: 1.05 });
          this.spawnFlipbook('dark_impact_01', pos.x, pos.y, { scale: 1.25, speed: 1.25 });
          this.spawnRing(pos.x, pos.y, 88, '#dc2626', 4, 0.55);
          this.spawnParticles(pos.x, pos.y, 16, ['#111827', '#dc2626', '#991b1b'], {
            speedMin: 50,
            speedMax: 160,
            upward: 90,
          });
          return;
        }
        if (ev.fx === 'stun_apply' || ev.fx === 'stun_skip') {
          this.spawnSpecial({ type: 'stun_shock' }, { x: pos.x, y: pos.y, scale: 1.05, duration: 1.05 });
          this.spawnFlipbook('thunder_impact_01', pos.x, pos.y, { scale: 1.15, speed: 1.35, additive: true });
          this.spawnRing(pos.x, pos.y, 82, '#facc15', 3.5, 0.46);
          this.spawnParticles(pos.x, pos.y, 14, ['#fde047', '#38bdf8', '#ffffff'], {
            speedMin: 80,
            speedMax: 210,
          });
          return;
        }
        if (ev.fx === 'bug_apply' || ev.fx === 'bug_bite') {
          this.spawnSpecial(
            { type: 'bug_swarm', variant: 'toxic' },
            {
              x: pos.x,
              y: pos.y,
              from: { x: pos.x - 42, y: pos.y - 26 },
              to: { x: pos.x + 18, y: pos.y + 10 },
              scale: 1.0,
              duration: 0.92,
            }
          );
          this.spawnFlipbook('poison_impact_01', pos.x, pos.y, { scale: 1.2, speed: 1.3 });
          this.spawnRing(pos.x, pos.y, 74, '#84cc16', 3.5, 0.48);
          this.spawnParticles(pos.x, pos.y, 14, ['#84cc16', '#a855f7', '#3f6212'], {
            speedMin: 55,
            speedMax: 165,
          });
          return;
        }
        if (ev.fx === 'koto_apply' || ev.fx === 'koto_redirect') {
          this.spawnSpecial({ type: 'mangekyo_eye' }, { x: pos.x, y: pos.y, scale: 1.05, duration: 1.0 });
          this.spawnFlipbook('dark_aura_01', pos.x, pos.y, { scale: 1.35, speed: 1.2 });
          this.spawnRing(pos.x, pos.y, 94, '#dc2626', 4, 0.62);
          this.spawnRing(pos.x, pos.y, 64, '#a855f7', 3, 0.52);
          return;
        }
        if (ev.fx === 'sp_drain' || ev.fx === 'sp_empty') {
          const isEmpty = ev.fx === 'sp_empty';
          this.spawnSpecial(
            { type: 'chakra_drain', variant: isEmpty ? 'empty' : 'drain' },
            { x: pos.x, y: pos.y, scale: isEmpty ? 1.1 : 0.95, duration: 0.9 }
          );
          if (isEmpty) {
            this.spawnSpecial({ type: 'stun_shock' }, { x: pos.x, y: pos.y, scale: 0.95, duration: 0.95, delay: 0.12 });
            this.spawnFlipbook('dark_impact_01', pos.x, pos.y, { scale: 1.2, speed: 1.3 });
          }
          this.spawnRing(pos.x, pos.y, isEmpty ? 92 : 68, isEmpty ? '#ef4444' : '#38bdf8', 3.5, 0.5);
          return;
        }
        if (ev.fx === 'dodge_down') {
          this.spawnSpecial({ type: 'dodge_snare' }, { x: pos.x, y: pos.y, scale: 0.95, duration: 0.85 });
          this.spawnRing(pos.x, pos.y, 68, '#38bdf8', 3, 0.44);
          return;
        }
        if (ev.fx.startsWith('mark_')) {
          const el = ev.fx.slice(5);
          const colMap = { hỏa: '#ff5a1f', thủy: '#38bdf8', lôi: '#facc15', phong: '#4ade80' };
          this.spawnSpecial({ type: 'element_seal', variant: el }, { x: pos.x, y: pos.y, scale: 0.95, duration: 0.86 });
          this.spawnRing(pos.x, pos.y, 68, colMap[el] || '#facc15', 3, 0.44);
          return;
        }
        if (ev.fx === 'curse_drain') {
          this.spawnSpecial({ type: 'curse_seal_pulse' }, { x: pos.x, y: pos.y, scale: 1.05, duration: 0.95 });
          this.spawnFlipbook('dark_aura_01', pos.x, pos.y, { scale: 1.25, speed: 1.25 });
          this.spawnRing(pos.x, pos.y, 80, '#a855f7', 3.5, 0.52);
          return;
        }
        if (ev.fx === 'card_burn' || ev.fx === 'card_steal') {
          this.spawnSpecial(
            { type: 'scroll_shatter', variant: ev.fx === 'card_burn' ? 'burn' : 'steal' },
            { x: pos.x, y: pos.y, scale: 1.0, duration: 0.88 }
          );
          this.spawnRing(pos.x, pos.y, 74, ev.fx === 'card_burn' ? '#f97316' : '#facc15', 3.5, 0.45);
          return;
        }
      }

      if (ev.c === 'rx') {
        this.spawnFlipbook('light_impact_01', pos.x, pos.y, { scale: 1.65, speed: 1.3, additive: true });
        this.spawnFlipbook('thunder_impact_01', pos.x, pos.y, { scale: 1.45, speed: 1.35, delay: 0.06, additive: true });
        this.spawnRing(pos.x, pos.y, 128, '#e0b3ff', 5, 0.52);
        this.spawnParticles(pos.x, pos.y, 24, ['#e879f9', '#38bdf8', '#facc15', '#ff5a1f'], {
          speedMin: 110,
          speedMax: 300,
          sizeMax: 9,
        });
      } else if (ev.c === 'ko') {
        this.spawnFlipbook('dark_impact_01', pos.x, pos.y, { scale: 1.9, speed: 1.1 });
        this.spawnFlipbook('fire_impact_02', pos.x, pos.y, { scale: 1.8, speed: 1.2, delay: 0.08, additive: true });
        this.spawnRing(pos.x, pos.y, 170, '#ef4444', 7, 0.9);
        this.spawnRing(pos.x, pos.y, 120, '#111827', 5, 0.75);
        this.spawnParticles(pos.x, pos.y, 38, ['#ef4444', '#dc2626', '#fbbf24', '#111827'], {
          speedMin: 100,
          speedMax: 330,
          sizeMin: 4,
          sizeMax: 11,
          lifeMin: 0.5,
          lifeMax: 1.05,
        });
      } else if (ev.c === 'hp') {
        const cols = style ? style.colors : ['#ff5448', '#fb923c', '#fff'];
        if (style?.specialImpact) {
          this.spawnSpecial(style.specialImpact, {
            x: pos.x,
            y: pos.y,
            from: srcPos || pos,
            to: pos,
            scale: style.isS ? 1.2 : 1.0,
            duration: 0.9,
          });
        }
        const impactFx = style?.impactFx || 'fire_impact_01';
        this.spawnFlipbook(impactFx, pos.x, pos.y, {
          scale: style?.isS ? 1.75 : 1.4,
          speed: 1.25,
          additive: style?.kind !== 'genjutsu' && style?.kind !== 'darkfire' && style?.kind !== 'poison',
        });
        if (style?.impactFx2) {
          this.spawnFlipbook(style.impactFx2, pos.x, pos.y, {
            scale: style.isS ? 1.65 : 1.3,
            speed: 1.3,
            delay: 0.06,
            additive: true,
          });
        }
        if (style?.slashFx) {
          this.spawnFlipbook(style.slashFx, pos.x, pos.y, {
            scale: 1.35,
            rotation: ang,
            speed: 1.45,
            additive: true,
          });
        }
        this.spawnRing(pos.x, pos.y, style?.isS ? 112 : 78, cols[0], 4, 0.44);
        this.spawnParticles(pos.x, pos.y, style?.isS ? 22 : 15, cols, {
          speedMin: 90,
          speedMax: 255,
          gravity: 160,
        });
      } else if (ev.c === 'ar') {
        const shieldFx = style?.shieldFx || 'rock_shield_01';
        this.spawnFlipbook(shieldFx, pos.x, pos.y, { scale: 1.35, speed: 1.25 });
        this.spawnRing(pos.x, pos.y, 72, '#60a5fa', 4, 0.42);
        this.spawnParticles(pos.x, pos.y, 12, ['#93c5fd', '#dbeafe', '#3b82f6'], { speedMax: 160 });
      } else if (ev.c === 'dg') {
        this.spawnSpecial({ type: 'smoke_poof', variant: 'kawarimi' }, { x: pos.x, y: pos.y, scale: 0.9, duration: 0.72 });
        this.spawnParticles(pos.x, pos.y, 12, ['#ffffff', '#cbd5e1'], { speedMax: 185, upward: 45 });
      } else if (ev.c === 'au') {
        if (ev.sfx === 'genjutsu') {
          this.spawnSpecial({ type: 'mangekyo_eye' }, { x: pos.x, y: pos.y, scale: 0.95, duration: 0.82 });
          this.spawnFlipbook('dark_aura_01', pos.x, pos.y, { scale: 1.4, speed: 1.25 });
        } else {
          this.spawnFlipbook('light_aura_01', pos.x, pos.y, { scale: 1.4, speed: 1.25, additive: true });
        }
        this.spawnRing(pos.x, pos.y, 88, ev.sfx === 'genjutsu' ? '#dc2626' : '#ffd24a', 4, 0.6);
        this.spawnParticles(pos.x, pos.y, 14, ['#fde047', '#fff', '#f59e0b'], { upward: 75 });
      } else if (ev.c === 'pt') {
        this.spawnFlipbook('rock_impact_01', pos.x, pos.y, { scale: 1.25, speed: 1.3 });
        this.spawnParticles(pos.x, pos.y, 12, ['#fb923c', '#fde68a', '#fff'], { speedMax: 175 });
      }
    });

    this.startLoop();
  }

  trigger(container, cast, flEvents = []) {
    if (cast) this.triggerCast(container, cast, flEvents);
    else this.triggerImpact(container, null, flEvents);
  }

  startLoop() {
    if (this.raf || typeof requestAnimationFrame === 'undefined') return;
    this.lastTime = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - this.lastTime) / 1000));
      this.lastTime = now;
      this.updateAndDraw(dt);
      if (this.hasActiveFx()) {
        this.raf = requestAnimationFrame(tick);
      } else {
        // CRITICAL: always wipe the physical canvas buffer on exit so ZERO remnant frames remain!
        this.clearCanvas();
        this.raf = null;
      }
    };
    this.raf = requestAnimationFrame(tick);
  }

  drawLightning(ctx, x1, y1, x2, y2, color, width = 3, jitter = 30) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;
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

    ctx.globalAlpha = 0.34 * fade;
    ctx.strokeStyle = glow;
    ctx.shadowColor = glow;
    ctx.shadowBlur = 24;
    ctx.lineWidth = w * 2.1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.globalAlpha = 0.78 * fade;
    ctx.strokeStyle = colMid;
    ctx.lineWidth = w * 1.1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.globalAlpha = 0.95 * fade;
    ctx.strokeStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 12;
    ctx.lineWidth = Math.max(3, w * 0.38);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.globalAlpha = 0.85 * fade;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = glow;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(x1, y1, w * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x2, y2, w * 0.82, 0, Math.PI * 2);
    ctx.fill();

    if (fade > 0.2) {
      ctx.globalAlpha = 0.82 * fade;
      this.drawLightning(ctx, x1, y1, x2, y2, '#ffffff', 2.2, 24);
    }
    ctx.restore();
  }

  updateAndDraw(dt) {
    const ctx = this.ctx;
    if (!ctx || !this.canvas) return;
    this.clearCanvas();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

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

    // 2. Projectiles / Lightning trails (remove BEFORE drawing if already finished)
    for (let i = this.beams.length - 1; i >= 0; i--) {
      const b = this.beams[i];
      b.progress += b.speed * dt;
      if (b.progress >= 1) {
        this.beams.splice(i, 1);
        continue;
      }
      const x = b.from.x + (b.to.x - b.from.x) * b.progress;
      const y = b.from.y + (b.to.y - b.from.y) * b.progress;

      if (b.style.kind === 'lightning') {
        this.drawLightning(ctx, b.from.x, b.from.y, x, y, b.style.glow, 3.2, 30);
        this.drawLightning(ctx, b.from.x, b.from.y, x, y, '#ffffff', 1.4, 18);
      } else if (!b.style.projectileFx && !b.style.specialCast) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = b.style.colors[0];
        ctx.shadowColor = b.style.glow;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(x, y, (b.style.size || 18) * 0.42, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      this.spawnParticles(x, y, 2, b.style.colors, {
        speedMin: 20,
        speedMax: 80,
        sizeMin: 2,
        sizeMax: 5,
        lifeMin: 0.14,
        lifeMax: 0.26,
      });
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
      ctx.shadowBlur = 10;
      ctx.lineWidth = r.lineWidth * (1 - p * 0.65);
      ctx.beginPath();
      ctx.arc(r.x, r.y, curR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Sakuga Hand-Drawn Flipbook Spritesheets (with smooth fade envelope on loopStyle sheets!)
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
      let progress = frameIdx / Math.max(1, fb.meta.frames - 1);
      if (fb.followFrom && fb.followTo) {
        const tp = fb.elapsed / fb.travelDuration;
        if (tp >= 1) {
          this.flipbooks.splice(i, 1);
          continue;
        }
        drawX = fb.followFrom.x + (fb.followTo.x - fb.followFrom.x) * tp;
        drawY = fb.followFrom.y + (fb.followTo.y - fb.followFrom.y) * tp;
        progress = tp;
      }

      // Apply smooth fade-in/fade-out envelope for looping sheets (shields, auras, projectiles)
      let envAlpha = fb.alpha;
      if (fb.meta.loopStyle) {
        if (progress < 0.12) envAlpha *= progress / 0.12;
        else if (progress > 0.72) envAlpha *= Math.max(0, (1 - progress) / 0.28);
      }
      if (envAlpha <= 0.005) continue;

      const [cols] = fb.meta.grid;
      const [cw, ch] = fb.meta.cell;
      const sx = (frameIdx % cols) * cw;
      const sy = Math.floor(frameIdx / cols) * ch;
      const drawW = cw * fb.scale;
      const drawH = ch * fb.scale;
      const [px, py] = fb.meta.pivot || [0.5, 0.5];

      ctx.save();
      if (fb.additive) ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = envAlpha;
      ctx.translate(drawX, drawY);
      if (fb.rotation) ctx.rotate(fb.rotation);
      ctx.drawImage(fb.imgRec.img, sx, sy, cw, ch, -drawW * px, -drawH * py, drawW, drawH);
      ctx.restore();
    }

    // 5. Canon Naruto Special Procedural Effects (Sharingan, Bagua, Hiraishin, Kunai, Shadow, Paper...)
    for (let i = this.specials.length - 1; i >= 0; i--) {
      const sp = this.specials[i];
      if (sp.delay > 0) {
        sp.delay -= dt;
        continue;
      }
      sp.elapsed += dt;
      if (sp.elapsed >= sp.duration) {
        this.specials.splice(i, 1);
        continue;
      }
      drawSpecialFx(ctx, sp);
    }

    // 6. Crisp Anime Spark Streak Particles
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
VFX.ensureManifest();
