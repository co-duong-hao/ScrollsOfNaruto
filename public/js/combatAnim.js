// GSAP Fighting-Game Combat Choreography (Ultimate Ninja Storm Hit-Feel)
// Handles: Anime Cut-in timeline, attacker lunge, directional recoil, camera punch,
// S-rank / KO Impact Frame, and delayed yellow HP Lag Bar.

const prevHpBySeat = new Map();

function getGsap() {
  return typeof window !== 'undefined' ? window.gsap : null;
}

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
}

function seatEl(tbEl, idx) {
  return tbEl?.querySelector(`[data-seat-idx="${idx}"]`) || null;
}

function seatCenter(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

export const CombatAnim = {
  resetMatch() {
    prevHpBySeat.clear();
  },

  animateCastBanner(tbEl, cast) {
    if (!tbEl || !cast) return;
    const banner = tbEl.querySelector('.cast');
    if (!banner) return;
    const g = getGsap();
    if (!g || reducedMotion()) {
      banner.classList.add('no-gsap');
      return;
    }

    const artWrap = banner.querySelector('.cast-art-wrap');
    const artImg = banner.querySelector('.cast-art-img, .cast-art-svg');
    const flash = banner.querySelector('.cast-art-flash');
    const sheen = banner.querySelector('.cast-art-sheen');
    const copy = banner.querySelector('.cast-copy');
    const kj = banner.querySelector('.cast-kj');
    const isS = cast.r === 'S';
    const isAuto = !!cast.isAuto;
    const holdDur = isAuto ? 0.65 : isS ? 1.05 : 0.9;

    g.killTweensOf([banner, artWrap, artImg, flash, sheen, copy, kj].filter(Boolean));

    const tl = g.timeline();
    tl.fromTo(
      banner,
      { opacity: 0, scaleY: 0.25 },
      { opacity: 1, scaleY: 1, duration: 0.2, ease: 'expo.out' },
      0
    );

    if (artWrap) {
      tl.fromTo(
        artWrap,
        { opacity: 0, x: -115, scale: 0.92 },
        { opacity: 1, x: 0, scale: 1, duration: 0.3, ease: 'expo.out' },
        0.02
      );
    }
    if (artImg) {
      tl.fromTo(
        artImg,
        { scale: isS ? 1.24 : 1.15 },
        { scale: 1.02, duration: holdDur + 0.15, ease: 'power2.out' },
        0.04
      );
    }
    if (flash) {
      tl.fromTo(
        flash,
        { opacity: isS ? 0.95 : 0.72 },
        { opacity: 0, duration: 0.32, ease: 'power2.out' },
        0.04
      );
    }
    if (sheen) {
      tl.fromTo(
        sheen,
        { xPercent: -160, opacity: 0.9 },
        { xPercent: 320, opacity: 0, duration: 0.52, ease: 'power2.inOut' },
        0.12
      );
    }
    if (copy) {
      tl.fromTo(
        copy,
        { opacity: 0, x: 85 },
        { opacity: 1, x: 0, duration: 0.3, ease: 'expo.out' },
        0.03
      );
    }
    if (kj) {
      tl.fromTo(
        kj,
        { opacity: 0, scale: 1.38, y: -10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.34, ease: 'back.out(1.6)' },
        0.07
      );
    }

    tl.to(
      banner,
      { opacity: 0, scaleY: 0.88, duration: 0.18, ease: 'power2.in' },
      `+=${holdDur * 0.45}`
    );
  },

  animateSeatAttack(tbEl, srcIdx, targetIndices = []) {
    const g = getGsap();
    if (!g || !tbEl || srcIdx == null || srcIdx < 0 || reducedMotion()) return;
    const src = seatEl(tbEl, srcIdx);
    if (!src) return;

    let dx = 0;
    let dy = -12;
    const firstTarget = targetIndices.find((ti) => ti !== srcIdx);
    const tgt = firstTarget != null ? seatEl(tbEl, firstTarget) : null;
    if (tgt) {
      const a = seatCenter(src);
      const b = seatCenter(tgt);
      const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      dx = ((b.x - a.x) / len) * 14;
      dy = ((b.y - a.y) / len) * 14;
    }

    g.killTweensOf(src);
    g.timeline()
      .to(src, { x: dx, y: dy, scale: 1.04, duration: 0.14, ease: 'power3.out' })
      .to(src, { x: 0, y: 0, scale: 1, duration: 0.34, ease: 'elastic.out(1, 0.55)' });
  },

  animateImpactGroup(tbEl, cast, flEvents = []) {
    const g = getGsap();
    if (!g || !tbEl || !flEvents.length || reducedMotion()) return;

    const srcIdx = cast?.srcIdx ?? -1;
    const src = srcIdx >= 0 ? seatEl(tbEl, srcIdx) : null;
    const srcCenter = src ? seatCenter(src) : null;

    const hasKo = flEvents.some((e) => e.c === 'ko');
    const hasRx = flEvents.some((e) => e.c === 'rx');
    const hasHp = flEvents.some((e) => e.c === 'hp');
    const isSrank = cast?.r === 'S';

    // Impact Frame on S-rank offensive hits or KO
    if (hasKo || (isSrank && (hasHp || hasRx))) {
      this.triggerImpactFrame(tbEl, hasKo ? 'ko' : 'srank');
    }

    // Directional recoil & debuff-specific reactions per target seat
    const seen = new Set();
    flEvents.forEach((ev) => {
      if (ev.t == null || ev.t < 0 || seen.has(ev.t)) return;
      if (!['hp', 'ko', 'rx', 'ar', 'pt', 'db'].includes(ev.c)) return;
      seen.add(ev.t);
      const tgt = seatEl(tbEl, ev.t);
      if (!tgt) return;

      // Dedicated debuff physical reaction when seat is afflicted/ticking without a heavy attack blow
      if (ev.c === 'db' || (ev.fx && !cast)) {
        g.killTweensOf(tgt);
        if (ev.fx === 'stun_apply' || ev.fx === 'stun_skip' || ev.fx === 'sp_empty') {
          g.timeline()
            .to(tgt, { rotation: -3.2, x: -7, duration: 0.06, ease: 'power2.out' })
            .to(tgt, { rotation: 3.2, x: 7, duration: 0.07, ease: 'power2.inOut' })
            .to(tgt, { rotation: -2.2, x: -5, duration: 0.07, ease: 'power2.inOut' })
            .to(tgt, { rotation: 1.5, x: 3, duration: 0.07, ease: 'power2.inOut' })
            .to(tgt, { rotation: 0, x: 0, duration: 0.14, ease: 'power2.out' });
        } else if (ev.fx === 'koto_apply' || ev.fx === 'koto_redirect') {
          g.timeline()
            .to(tgt, { scale: 1.04, rotation: -1.6, duration: 0.14, ease: 'sine.out' })
            .to(tgt, { scale: 0.97, rotation: 1.6, duration: 0.16, ease: 'sine.inOut' })
            .to(tgt, { scale: 1, rotation: 0, duration: 0.18, ease: 'sine.out' });
        } else if (
          ev.fx === 'bleed_tick' ||
          ev.fx === 'amaterasu_tick' ||
          ev.fx === 'bug_bite' ||
          ev.fx === 'curse_drain'
        ) {
          g.timeline()
            .to(tgt, { y: 6, scale: 0.97, duration: 0.09, ease: 'power3.out' })
            .to(tgt, { y: 0, scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.5)' });
        } else {
          g.timeline()
            .to(tgt, { scale: 0.96, duration: 0.09, ease: 'power2.out' })
            .to(tgt, { scale: 1, duration: 0.24, ease: 'back.out(1.6)' });
        }
        return;
      }

      let rx = 0;
      let ry = -12;
      if (srcCenter && ev.t !== srcIdx) {
        const tc = seatCenter(tgt);
        const len = Math.hypot(tc.x - srcCenter.x, tc.y - srcCenter.y) || 1;
        const mag = ev.c === 'ko' ? 22 : isSrank || ev.c === 'rx' ? 16 : ev.c === 'ar' ? 7 : 12;
        rx = ((tc.x - srcCenter.x) / len) * mag;
        ry = ((tc.y - srcCenter.y) / len) * mag;
      }

      g.killTweensOf(tgt);
      g.timeline()
        .to(tgt, {
          x: rx,
          y: ry,
          scale: ev.c === 'ar' ? 1.02 : 0.96,
          duration: 0.08,
          ease: 'power4.out',
        })
        .to(tgt, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.42,
          ease: 'elastic.out(1.05, 0.45)',
        });
    });

    // Camera punch / shake on arena (.tb)
    if (hasKo || isSrank || hasRx || hasHp) {
      const amp = hasKo ? 11 : isSrank ? 8 : hasRx ? 6 : 3.5;
      const steps = hasKo ? 6 : isSrank ? 5 : 3;
      const tl = g.timeline();
      for (let k = 0; k < steps; k++) {
        const decay = 1 - k / steps;
        tl.to(tbEl, {
          x: (Math.random() - 0.5) * 2 * amp * decay,
          y: (Math.random() - 0.5) * 2 * amp * decay,
          duration: 0.04,
          ease: 'none',
        });
      }
      tl.to(tbEl, { x: 0, y: 0, duration: 0.12, ease: 'power2.out' });
    }
  },

  triggerImpactFrame(tbEl, kind = 'srank') {
    if (!tbEl || reducedMotion()) return;
    let ov = tbEl.querySelector('.impact-frame-ov');
    if (!ov) {
      ov = document.createElement('div');
      ov.className = 'impact-frame-ov';
      ov.setAttribute('aria-hidden', 'true');
      tbEl.appendChild(ov);
    }
    ov.classList.remove('is-ko', 'is-srank', 'is-active');
    ov.classList.add(kind === 'ko' ? 'is-ko' : 'is-srank');
    // Force reflow to restart crisp 75ms anime impact frame
    void ov.offsetWidth;
    ov.classList.add('is-active');
    setTimeout(() => {
      ov.classList.remove('is-active');
    }, kind === 'ko' ? 120 : 85);
  },

  syncHpLagBars(tbEl, players = [], EDO_HP = 999999) {
    if (!tbEl || !Array.isArray(players)) return;
    const g = getGsap();
    players.forEach((p, idx) => {
      const curPct = p.hp >= EDO_HP ? 100 : Math.max(0, Math.min(100, (p.hp / 4000) * 100));
      const prevPct = prevHpBySeat.has(idx) ? prevHpBySeat.get(idx) : curPct;
      prevHpBySeat.set(idx, curPct);

      const seat = seatEl(tbEl, idx);
      const lag = seat?.querySelector('.hp .hp-lag');
      if (!lag) return;

      if (prevPct > curPct + 0.2 && g && !reducedMotion()) {
        g.killTweensOf(lag);
        lag.style.width = `${prevPct}%`;
        g.to(lag, {
          width: `${curPct}%`,
          duration: 0.58,
          delay: 0.22,
          ease: 'power2.out',
        });
      } else {
        lag.style.width = `${curPct}%`;
      }
    });
  },
};
