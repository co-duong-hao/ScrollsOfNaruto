// Hybrid Naruto Audio Engine: 25 Local Real MP3 Clips (24 CC0 Studio + genjutsu.mp3)
// Layered with Custom Naruto-Canon Web Audio Synthesis (Chidori 1000-bird chirp,
// Rasengan compressed wind turbine, Sharingan/Mangekyo/Rinnegan chime, Hyoshigi hand-seals...)

export const SFX_CLIPS = {
  genjutsu: '/assets/sfx/genjutsu.mp3',
  poof: '/assets/sfx/poof.mp3',
  teleport: '/assets/sfx/teleport.mp3',
  summon_pop: '/assets/sfx/summon_pop.mp3',
  taiko_big: '/assets/sfx/taiko_big.mp3',
  taiko_massive: '/assets/sfx/taiko_massive.mp3',
  metal_clash: '/assets/sfx/metal_clash.mp3',
  metal_heavy: '/assets/sfx/metal_heavy.mp3',
  slam_big: '/assets/sfx/slam_big.mp3',
  slam_massive: '/assets/sfx/slam_massive.mp3',
  bass_drop: '/assets/sfx/bass_drop.mp3',
  earth_rumble: '/assets/sfx/earth_rumble.mp3',
  hit_deep: '/assets/sfx/hit_deep.mp3',
  hit_heavy: '/assets/sfx/hit_heavy.mp3',
  whoosh_fast: '/assets/sfx/whoosh_fast.mp3',
  whoosh_med: '/assets/sfx/whoosh_med.mp3',
  blade_swish: '/assets/sfx/blade_swish.mp3',
  dash_zip: '/assets/sfx/dash_zip.mp3',
  heal_shimmer: '/assets/sfx/heal_shimmer.mp3',
  ice_shimmer: '/assets/sfx/ice_shimmer.mp3',
  puppet_clack: '/assets/sfx/puppet_clack.mp3',
  seal_lock: '/assets/sfx/seal_lock.mp3',
  paper_slide: '/assets/sfx/paper_slide.mp3',
  water_bubble: '/assets/sfx/water_bubble.mp3',
  riser: '/assets/sfx/riser.mp3',
};

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.clipCache = new Map();
    const isBrowser = typeof localStorage !== 'undefined';
    this.muted = isBrowser ? localStorage.getItem('son_muted') === '1' : false;
    const savedVol = isBrowser ? Number(localStorage.getItem('son_sfx_vol')) : 35;
    this.volume = Number.isFinite(savedVol) && savedVol >= 0 && savedVol <= 100 ? savedVol : 35;
  }

  getClipVolume(mult = 1) {
    if (this.muted || this.volume <= 0) return 0;
    return Math.min(1, Math.pow(this.volume / 100, 1.5) * mult);
  }

  playClip(keyOrUrl, { gain = 0.85, rate = 1, jitter = 0.04, delay = 0 } = {}) {
    const url = SFX_CLIPS[keyOrUrl] || keyOrUrl;
    const vol = this.getClipVolume(gain);
    if (vol <= 0 || typeof Audio === 'undefined' || !url) return;

    const fire = () => {
      let base = this.clipCache.get(url);
      if (!base) {
        base = new Audio(url);
        base.preload = 'auto';
        this.clipCache.set(url, base);
      }
      const inst = base.cloneNode();
      inst.volume = vol;
      if (rate !== 1 || jitter > 0) {
        const j = jitter > 0 ? 1 + (Math.random() - 0.5) * 2 * jitter : 1;
        inst.playbackRate = Math.max(0.5, Math.min(2.0, rate * j));
      }
      inst.play().catch(() => {});
    };

    if (delay > 0) setTimeout(fire, Math.round(delay * 1000));
    else fire();
  }

  getEffectiveGain() {
    if (this.muted || this.volume <= 0) return 0;
    return Math.pow(this.volume / 100, 1.65) * 0.72;
  }

  ensure() {
    if (this.muted || this.volume <= 0 || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.setValueAtTime(this.getEffectiveGain(), this.ctx.currentTime);
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.master) {
      this.master.gain.setValueAtTime(this.getEffectiveGain(), this.ctx.currentTime);
    }
    return this.ctx;
  }

  setVolume(val) {
    const v = Math.max(0, Math.min(100, Math.round(Number(val) || 0)));
    this.volume = v;
    this.muted = v === 0;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('son_sfx_vol', String(v));
      localStorage.setItem('son_muted', this.muted ? '1' : '0');
    }
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(this.getEffectiveGain(), this.ctx.currentTime, 0.015);
    }
    return v;
  }

  toggle() {
    this.muted = !this.muted;
    if (!this.muted && this.volume === 0) {
      this.volume = 35;
      if (typeof localStorage !== 'undefined') localStorage.setItem('son_sfx_vol', '35');
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('son_muted', this.muted ? '1' : '0');
    }
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(this.getEffectiveGain(), this.ctx.currentTime, 0.015);
    }
    return this.muted;
  }

  tone(freq, dur = 0.15, type = 'sine', gain = 0.14, delay = 0, slideTo = null) {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    g.gain.setValueAtTime(0.001, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + Math.min(0.02, dur * 0.25));
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  noise(dur = 0.15, gain = 0.1, filterFreq = 1200, delay = 0, filterEnd = null, q = 1.6) {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const t0 = ctx.currentTime + delay;
    const size = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(q, t0);
    filter.frequency.setValueAtTime(filterFreq, t0);
    if (filterEnd) filter.frequency.exponentialRampToValueAtTime(Math.max(60, filterEnd), t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + Math.min(0.025, dur * 0.2));
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    src.start(t0);
  }

  // Signature Naruto Synth Helpers
  playHyoshigi() {
    // Classic Japanese wooden hand-seal clack (two crisp resonant wood hits)
    this.tone(1180, 0.045, 'triangle', 0.11, 0, 920);
    this.noise(0.03, 0.08, 2200, 0);
    this.tone(1340, 0.05, 'triangle', 0.12, 0.08, 1050);
    this.noise(0.03, 0.08, 2500, 0.08);
  }

  playChidoriChirps(intense = false) {
    // Iconic "One Thousand Birds" rapid high-frequency chirping + electric crackle
    const count = intense ? 9 : 6;
    for (let i = 0; i < count; i++) {
      const f = 2200 + Math.random() * 1900;
      this.tone(f, 0.055, 'sine', 0.055, i * 0.042, f * (0.72 + Math.random() * 0.55));
    }
    this.noise(0.38, 0.14, 3800, 0, 1900, 2.5);
    this.tone(620, 0.18, 'sawtooth', 0.06, 0.04, 180);
  }

  playRasenganTurbine(big = false) {
    // Compressed spinning chakra sphere roar
    const dur = big ? 0.68 : 0.48;
    this.noise(dur, big ? 0.17 : 0.13, 620, 0, big ? 2600 : 1850, 3.2);
    this.tone(big ? 150 : 210, dur, 'sawtooth', 0.075, 0, big ? 520 : 640);
    this.tone(big ? 300 : 420, dur * 0.85, 'sine', 0.07, 0.04, big ? 980 : 1120);
  }

  playEyeActivate(mode = 'sharingan') {
    if (mode === 'byakugan') {
      this.playClip('teleport', { gain: 0.55, rate: 1.35 });
      this.tone(880, 0.22, 'sine', 0.09, 0, 1320);
      this.tone(1760, 0.25, 'triangle', 0.05, 0.03, 1320);
    } else if (mode === 'rinnegan') {
      this.playClip('bass_drop', { gain: 0.72, rate: 0.92 });
      this.tone(246.9, 0.48, 'sine', 0.11, 0, 220);
      this.tone(370, 0.44, 'triangle', 0.07, 0.04, 311);
    } else if (mode === 'mangekyo') {
      this.playClip('riser', { gain: 0.72, rate: 1.15 });
      this.tone(587, 0.36, 'sawtooth', 0.065, 0, 146);
      this.tone(1174, 0.28, 'sine', 0.07, 0.02, 880);
    } else {
      // Classic 3-tomoe Sharingan spin chime
      this.playClip('summon_pop', { gain: 0.52, rate: 1.35 });
      this.tone(740, 0.22, 'sine', 0.09, 0, 520);
      this.tone(1480, 0.16, 'triangle', 0.05, 0.04, 1110);
    }
  }

  play(name) {
    if (this.muted || this.volume <= 0) return;

    switch (name) {
      // UI Interactions
      case 'uiHover':
        this.tone(640, 0.035, 'triangle', 0.032, 0, 740);
        break;
      case 'uiCardHover':
        this.noise(0.045, 0.028, 2500);
        this.tone(520, 0.038, 'sine', 0.025, 0, 620);
        break;
      case 'uiClick':
        this.noise(0.024, 0.035, 2600);
        this.tone(460, 0.055, 'triangle', 0.085, 0, 620);
        break;
      case 'uiConfirm':
        this.tone(392, 0.075, 'triangle', 0.095, 0, 523);
        this.tone(587, 0.09, 'sine', 0.075, 0.035, 659);
        break;
      case 'uiSelect':
        this.tone(540, 0.05, 'sine', 0.075, 0, 720);
        break;
      case 'select':
        this.tone(520, 0.06, 'triangle', 0.08, 0, 660);
        break;
      case 'draw':
        this.playClip('paper_slide', { gain: 0.55 });
        break;
      case 'turn':
        this.tone(330, 0.14, 'triangle', 0.1, 0);
        this.tone(440, 0.18, 'triangle', 0.1, 0.08);
        break;

      // === NARUTO CANON SKILL AUDIO PRESETS ===
      case 'hand_seal':
      case 'cast':
        this.playHyoshigi();
        this.playClip('whoosh_med', { gain: 0.55, delay: 0.06 });
        break;
      case 'srank':
        this.playClip('taiko_massive', { gain: 0.85 });
        this.tone(220, 0.45, 'triangle', 0.11, 0.04, 440);
        break;

      // Fire / Katon / Amaterasu / Bombs
      case 'katon':
      case 'hỏa':
        this.playClip('whoosh_med', { gain: 0.72, rate: 0.88 });
        this.noise(0.36, 0.15, 420, 0.02, 950, 1.4);
        this.tone(160, 0.3, 'sawtooth', 0.085, 0, 78);
        break;
      case 'katon_big':
        this.playClip('taiko_big', { gain: 0.72 });
        this.playClip('whoosh_fast', { gain: 0.78, rate: 0.78, delay: 0.05 });
        this.noise(0.48, 0.18, 360, 0.04, 1200, 1.2);
        break;
      case 'amaterasu':
        this.playEyeActivate('mangekyo');
        this.playClip('bass_drop', { gain: 0.75, delay: 0.12 });
        this.noise(0.45, 0.15, 2200, 0.08, 420, 2.2);
        break;
      case 'fire_hit':
        this.playClip('slam_big', { gain: 0.76, rate: 1.05 });
        this.noise(0.28, 0.14, 580, 0, 240);
        break;
      case 'bomb_throw':
        this.playClip('whoosh_fast', { gain: 0.65 });
        this.playClip('puppet_clack', { gain: 0.45, rate: 1.35, delay: 0.04 });
        break;
      case 'bomb_explode':
        this.playClip('slam_massive', { gain: 0.86 });
        this.playClip('bass_drop', { gain: 0.72, delay: 0.04 });
        break;
      case 'c0_nuke':
        this.playClip('taiko_massive', { gain: 0.9 });
        this.playClip('slam_massive', { gain: 0.9, delay: 0.1 });
        this.playClip('earth_rumble', { gain: 0.85, delay: 0.06 });
        break;

      // Water / Suiton
      case 'suiton':
      case 'thủy':
        this.playClip('water_bubble', { gain: 0.72, rate: 0.85 });
        this.playClip('whoosh_med', { gain: 0.6, rate: 0.95, delay: 0.04 });
        this.noise(0.32, 0.12, 1300, 0.02, 520, 2.0);
        break;
      case 'water_hit':
        this.playClip('water_bubble', { gain: 0.75, rate: 0.72 });
        this.playClip('hit_deep', { gain: 0.72 });
        break;

      // Wind / Futon / Rasengan
      case 'futon':
      case 'phong':
        this.playClip('whoosh_fast', { gain: 0.8 });
        this.playClip('blade_swish', { gain: 0.65, delay: 0.06 });
        this.noise(0.34, 0.12, 2400, 0, 950, 2.4);
        break;
      case 'rasengan':
        this.playRasenganTurbine(false);
        this.playClip('whoosh_fast', { gain: 0.68, delay: 0.08 });
        break;
      case 'rasengan_big':
        this.playClip('taiko_big', { gain: 0.76 });
        this.playRasenganTurbine(true);
        break;
      case 'rasengan_hit':
        this.playClip('slam_massive', { gain: 0.82, rate: 1.1 });
        this.noise(0.24, 0.14, 1800, 0, 480);
        break;

      // Lightning / Chidori / Raikiri / Hiraishin
      case 'chidori':
      case 'lôi':
        this.playChidoriChirps(false);
        this.playClip('dash_zip', { gain: 0.65, delay: 0.06 });
        break;
      case 'raikiri':
        this.playChidoriChirps(true);
        this.playClip('metal_clash', { gain: 0.72, rate: 1.18, delay: 0.08 });
        break;
      case 'lightning_hit':
        this.playClip('slam_big', { gain: 0.78, rate: 1.25 });
        this.noise(0.18, 0.16, 3600, 0, 1200, 2.8);
        break;
      case 'hiraishin':
        this.playClip('dash_zip', { gain: 0.85, rate: 1.35 });
        this.playClip('teleport', { gain: 0.82, rate: 1.25, delay: 0.06 });
        this.tone(1560, 0.14, 'sine', 0.08, 0.04, 2480);
        break;
      case 'teleport':
        this.playClip('teleport', { gain: 0.78 });
        break;

      // Dojutsu & Genjutsu
      case 'sharingan':
        this.playEyeActivate('sharingan');
        break;
      case 'mangekyo':
        this.playEyeActivate('mangekyo');
        break;
      case 'rinnegan':
        this.playEyeActivate('rinnegan');
        break;
      case 'byakugan':
        this.playEyeActivate('byakugan');
        break;
      case 'genjutsu':
        this.playClip('genjutsu', { gain: 0.92, jitter: 0 });
        break;
      case 'susanoo':
        this.playClip('taiko_massive', { gain: 0.8 });
        this.playClip('metal_heavy', { gain: 0.72, delay: 0.08 });
        break;

      // Ninja Tools, Blades, Smoke, Summoning
      case 'kunai':
        this.playClip('blade_swish', { gain: 0.72, rate: 1.25 });
        this.tone(1850, 0.07, 'sine', 0.055, 0.02, 1250);
        break;
      case 'blade_slash':
        this.playClip('blade_swish', { gain: 0.82 });
        this.playClip('metal_clash', { gain: 0.55, rate: 1.3, delay: 0.04 });
        break;
      case 'metal_hit':
      case 'armor':
        this.playClip('metal_clash', { gain: 0.76 });
        break;
      case 'slash_hit':
        this.playClip('blade_swish', { gain: 0.75, rate: 1.1 });
        this.playClip('hit_heavy', { gain: 0.72, delay: 0.03 });
        break;
      case 'smoke_poof':
      case 'dodge':
        this.playClip('poof', { gain: 0.82 });
        break;
      case 'kuchiyose':
        this.playHyoshigi();
        this.playClip('taiko_big', { gain: 0.72, delay: 0.06 });
        this.playClip('poof', { gain: 0.85, delay: 0.14 });
        break;
      case 'edo_tensei':
        this.playClip('earth_rumble', { gain: 0.82 });
        this.playClip('seal_lock', { gain: 0.72, rate: 0.75, delay: 0.12 });
        break;

      // Earth / Sand / Wood / Ice / Seals
      case 'sand':
        this.playClip('earth_rumble', { gain: 0.65, rate: 1.2 });
        this.noise(0.42, 0.13, 1650, 0, 700, 1.1);
        break;
      case 'earth_rumble':
        this.playClip('earth_rumble', { gain: 0.85 });
        this.playClip('slam_big', { gain: 0.68, delay: 0.08 });
        break;
      case 'earth_hit':
        this.playClip('slam_big', { gain: 0.82, rate: 0.85 });
        break;
      case 'wood':
        this.playClip('earth_rumble', { gain: 0.68, rate: 1.05 });
        this.playClip('puppet_clack', { gain: 0.72, rate: 0.78, delay: 0.06 });
        break;
      case 'ice':
        this.playClip('ice_shimmer', { gain: 0.78 });
        this.tone(2400, 0.16, 'sine', 0.055, 0.04, 3200);
        break;
      case 'ice_hit':
        this.playClip('ice_shimmer', { gain: 0.72, rate: 1.25 });
        this.playClip('metal_clash', { gain: 0.55, rate: 1.45 });
        break;
      case 'seal':
        this.playHyoshigi();
        this.playClip('seal_lock', { gain: 0.78, delay: 0.06 });
        this.playClip('heal_shimmer', { gain: 0.55, rate: 0.85, delay: 0.1 });
        break;
      case 'seal_hit':
        this.playClip('seal_lock', { gain: 0.85, rate: 0.8 });
        this.playClip('taiko_big', { gain: 0.75 });
        break;

      // Puppet / Bugs / Paper / Shadow
      case 'puppet':
        this.playClip('puppet_clack', { gain: 0.8 });
        this.playClip('puppet_clack', { gain: 0.6, rate: 1.25, delay: 0.09 });
        break;
      case 'puppet_hit':
        this.playClip('puppet_clack', { gain: 0.72, rate: 0.85 });
        this.playClip('hit_heavy', { gain: 0.72 });
        break;
      case 'bugs':
        this.noise(0.45, 0.11, 2100, 0, 2700, 4.5);
        this.tone(185, 0.36, 'sawtooth', 0.05, 0, 230);
        this.playClip('whoosh_med', { gain: 0.52, rate: 1.3 });
        break;
      case 'poison_hit':
        this.playClip('water_bubble', { gain: 0.68, rate: 1.3 });
        this.playClip('hit_deep', { gain: 0.65 });
        break;
      case 'paper':
        this.playClip('paper_slide', { gain: 0.85 });
        this.playClip('paper_slide', { gain: 0.72, rate: 1.2, delay: 0.07 });
        this.playClip('whoosh_fast', { gain: 0.55, delay: 0.1 });
        break;
      case 'shadow':
        this.playClip('earth_rumble', { gain: 0.65, rate: 0.78 });
        this.tone(110, 0.35, 'sawtooth', 0.065, 0, 72);
        break;
      case 'dark_hit':
        this.playClip('bass_drop', { gain: 0.74 });
        this.playClip('hit_deep', { gain: 0.72 });
        break;

      // Taijutsu / Eight Gates / Gentle Fist / Sakura / Heal / Gravity / Kurama
      case 'eight_gates':
        this.playClip('taiko_massive', { gain: 0.84 });
        this.playClip('whoosh_fast', { gain: 0.8, delay: 0.08 });
        this.noise(0.42, 0.15, 1100, 0.05, 2400);
        break;
      case 'taijutsu':
        this.playClip('whoosh_fast', { gain: 0.75 });
        break;
      case 'gentle_fist':
        this.playClip('hit_deep', { gain: 0.65, rate: 1.3 });
        this.tone(520, 0.12, 'sine', 0.08, 0, 260);
        break;
      case 'sakura_punch':
        this.playClip('whoosh_fast', { gain: 0.72 });
        this.playClip('slam_massive', { gain: 0.88, delay: 0.08 });
        break;
      case 'sakura_hit':
      case 'heavy_hit':
        this.playClip('slam_big', { gain: 0.84 });
        this.playClip('hit_heavy', { gain: 0.75, delay: 0.03 });
        break;
      case 'hit_deep':
      case 'hit':
        this.playClip('hit_deep', { gain: 0.8 });
        break;
      case 'heal':
        this.playClip('heal_shimmer', { gain: 0.82 });
        [523, 659, 784].forEach((f, idx) => this.tone(f, 0.24, 'sine', 0.065, idx * 0.06));
        break;
      case 'gravity_push':
        this.playClip('bass_drop', { gain: 0.88 });
        this.playClip('slam_massive', { gain: 0.82, delay: 0.1 });
        break;
      case 'gravity_hit':
        this.playClip('bass_drop', { gain: 0.78 });
        this.playClip('slam_big', { gain: 0.78 });
        break;
      case 'meteor':
        this.playClip('riser', { gain: 0.82, rate: 0.75 });
        this.playClip('earth_rumble', { gain: 0.85, delay: 0.15 });
        break;
      case 'kyubi_roar':
        this.playClip('taiko_massive', { gain: 0.86 });
        this.playClip('earth_rumble', { gain: 0.85, rate: 0.85 });
        this.tone(135, 0.55, 'sawtooth', 0.11, 0.04, 58);
        break;

      // Negative Status / Debuff SFX
      case 'bleed_tick':
        this.playClip('water_bubble', { gain: 0.55, rate: 0.62 });
        this.tone(145, 0.18, 'triangle', 0.1, 0, 62);
        this.noise(0.14, 0.08, 950, 0.02, 360, 2.2);
        break;
      case 'stun':
        this.playClip('metal_clash', { gain: 0.62, rate: 1.48 });
        this.tone(980, 0.16, 'sine', 0.085, 0, 560);
        this.tone(1420, 0.18, 'triangle', 0.06, 0.06, 780);
        this.noise(0.22, 0.11, 3400, 0, 1400, 3.0);
        break;
      case 'sp_drain':
        this.playClip('teleport', { gain: 0.58, rate: 0.72 });
        this.tone(540, 0.24, 'sine', 0.08, 0, 190);
        break;
      case 'sp_empty':
        this.playClip('seal_lock', { gain: 0.8, rate: 0.74 });
        this.playClip('bass_drop', { gain: 0.72, delay: 0.05 });
        this.tone(420, 0.28, 'sawtooth', 0.075, 0.02, 110);
        break;
      case 'dodge_down':
        this.playClip('metal_heavy', { gain: 0.55, rate: 0.78 });
        this.tone(240, 0.18, 'triangle', 0.09, 0, 95);
        break;
      case 'curse_drain':
        this.playClip('earth_rumble', { gain: 0.58, rate: 0.72 });
        this.tone(128, 0.3, 'sawtooth', 0.07, 0, 74);
        break;

      // Core Combat Events
      case 'pet':
        this.playClip('hit_heavy', { gain: 0.75, rate: 1.1 });
        break;
      case 'reaction':
        this.playClip('teleport', { gain: 0.72, rate: 1.15 });
        this.tone(440, 0.15, 'sine', 0.1, 0);
        this.tone(554, 0.15, 'sine', 0.1, 0.07);
        this.tone(659, 0.22, 'triangle', 0.11, 0.14);
        break;
      case 'ko':
        this.playClip('taiko_massive', { gain: 0.92 });
        this.playClip('slam_massive', { gain: 0.88, delay: 0.06 });
        this.playClip('bass_drop', { gain: 0.85, delay: 0.1 });
        break;
      case 'victory':
        this.playClip('taiko_big', { gain: 0.72 });
        [523, 659, 784, 1046].forEach((f, i) => {
          this.tone(f, 0.28, 'triangle', 0.12, i * 0.11);
        });
        break;
      default:
        this.playClip('hit_deep', { gain: 0.65 });
        break;
    }
  }

  initUiSounds() {
    if (this._uiBound || typeof document === 'undefined') return;
    this._uiBound = true;

    let lastHoverEl = null;
    let lastHoverAt = 0;

    document.addEventListener(
      'pointerover',
      (e) => {
        if (e.pointerType === 'touch') return;
        const el = e.target?.closest?.('button:not(:disabled), select:not(:disabled), .cd, .st.tg, .brand');
        if (!el || el === lastHoverEl) return;
        lastHoverEl = el;
        if (!this.ctx || this.ctx.state !== 'running') return;
        const now = performance.now();
        if (now - lastHoverAt < 55) return;
        lastHoverAt = now;
        this.play(el.classList.contains('cd') ? 'uiCardHover' : 'uiHover');
      },
      { passive: true }
    );

    document.addEventListener('pointerout', (e) => {
      if (lastHoverEl && !e.relatedTarget?.closest?.('button, select, .cd, .st.tg, .brand')) {
        lastHoverEl = null;
      }
    });

    document.addEventListener('click', (e) => {
      const btn = e.target?.closest?.('button:not(:disabled), .brand');
      if (!btn) return;
      if (btn.id === 'sfxMuteBtn') return;
      const isPrimary = btn.classList.contains('go') || btn.classList.contains('btn-lg');
      this.play(isPrimary ? 'uiConfirm' : 'uiClick');
    });

    document.addEventListener('change', (e) => {
      if (e.target?.matches?.('select')) {
        this.play('uiSelect');
      }
    });
  }
}

export const SFX = new SoundEngine();
