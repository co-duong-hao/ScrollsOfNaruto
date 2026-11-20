class SoundEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = localStorage.getItem('son_muted') === '1';
    const savedVol = Number(localStorage.getItem('son_sfx_vol'));
    this.volume = Number.isFinite(savedVol) && savedVol >= 0 && savedVol <= 100 ? savedVol : 35;
  }

  getEffectiveGain() {
    if (this.muted || this.volume <= 0) return 0;
    // Perceptual curve + gentle ceiling so SFX never feels harsh
    return Math.pow(this.volume / 100, 1.7) * 0.72;
  }

  ensure() {
    if (this.muted || this.volume <= 0) return null;
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
    localStorage.setItem('son_sfx_vol', String(v));
    localStorage.setItem('son_muted', this.muted ? '1' : '0');
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(this.getEffectiveGain(), this.ctx.currentTime, 0.015);
    }
    return v;
  }

  toggle() {
    this.muted = !this.muted;
    if (!this.muted && this.volume === 0) {
      this.volume = 35;
      localStorage.setItem('son_sfx_vol', '35');
    }
    localStorage.setItem('son_muted', this.muted ? '1' : '0');
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
    g.gain.linearRampToValueAtTime(gain, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  noise(dur = 0.15, gain = 0.1, filterFreq = 1200, delay = 0) {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const t0 = ctx.currentTime + delay;
    const size = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(filterFreq, t0);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    src.start(t0);
  }

  play(name) {
    if (this.muted) return;
    switch (name) {
      case 'select':
        this.tone(520, 0.06, 'triangle', 0.08, 0, 660);
        break;
      case 'draw':
        this.noise(0.09, 0.08, 2200);
        this.tone(420, 0.08, 'sine', 0.07, 0.02, 580);
        break;
      case 'turn':
        this.tone(330, 0.14, 'triangle', 0.1, 0);
        this.tone(440, 0.18, 'triangle', 0.1, 0.08);
        break;
      case 'cast':
        this.noise(0.18, 0.1, 900);
        this.tone(240, 0.22, 'sawtooth', 0.08, 0, 480);
        break;
      case 'srank':
        this.tone(110, 0.55, 'sawtooth', 0.12, 0, 75);
        this.tone(220, 0.45, 'triangle', 0.12, 0.05, 440);
        this.tone(660, 0.35, 'sine', 0.1, 0.12);
        break;
      case 'hỏa':
        this.noise(0.28, 0.14, 500);
        this.tone(180, 0.25, 'sawtooth', 0.09, 0, 90);
        break;
      case 'thủy':
        this.noise(0.25, 0.11, 1600);
        this.tone(360, 0.22, 'sine', 0.09, 0.02, 240);
        break;
      case 'lôi':
        this.noise(0.14, 0.14, 3400);
        this.tone(880, 0.1, 'square', 0.07, 0, 220);
        this.tone(640, 0.12, 'sawtooth', 0.06, 0.05, 180);
        break;
      case 'phong':
        this.noise(0.3, 0.11, 2400);
        this.tone(480, 0.24, 'sine', 0.07, 0, 720);
        break;
      case 'hit':
        this.noise(0.12, 0.15, 400);
        this.tone(150, 0.14, 'triangle', 0.15, 0, 55);
        break;
      case 'armor':
        this.tone(720, 0.14, 'square', 0.08, 0, 480);
        this.tone(960, 0.12, 'triangle', 0.08, 0.03);
        break;
      case 'dodge':
        this.noise(0.12, 0.09, 3000);
        this.tone(520, 0.12, 'sine', 0.08, 0, 980);
        break;
      case 'pet':
        this.tone(290, 0.12, 'triangle', 0.1, 0, 420);
        this.tone(430, 0.14, 'triangle', 0.09, 0.07, 580);
        break;
      case 'reaction':
        this.tone(440, 0.15, 'sine', 0.11, 0);
        this.tone(554, 0.15, 'sine', 0.11, 0.07);
        this.tone(659, 0.22, 'triangle', 0.12, 0.14);
        break;
      case 'ko':
        this.noise(0.38, 0.18, 320);
        this.tone(140, 0.55, 'sawtooth', 0.16, 0, 42);
        this.tone(280, 0.45, 'triangle', 0.12, 0.06, 70);
        break;
      case 'victory':
        [523, 659, 784, 1046].forEach((f, i) => {
          this.tone(f, 0.28, 'triangle', 0.13, i * 0.11);
        });
        break;
    }
  }
}

export const SFX = new SoundEngine();
