/* Parallax Manager — lerp smoothing via rAF (spec §4)
   Phase 2: + scroll-linked elemen [data-motion~="parallax"][data-speed]
   (satu loop rAF, tidak duplikat; transform & opacity saja). */
const ParallaxManager = {
  layers: [], linked: [], target: 0, current: 0, raf: null,
  intensity: 1,
  init() {
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.layers = [...document.querySelectorAll('[data-depth]')];
    this.linked = [...document.querySelectorAll('[data-motion~="parallax"]')]
      .map(el => ({ el, speed: parseFloat(el.dataset.speed || '0.15'), mid: 0 }));
    this.measure();
    addEventListener('resize', () => this.measure(), { passive: true });
    let ticking = false;
    addEventListener('scroll', () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => { this.target = window.scrollY; ticking = false; });
    }, { passive: true });
    const loop = () => {
      // lerp: gerak natural, bukan linear mekanis
      this.current += (this.target - this.current) * 0.08;
      if (Math.abs(this.target - this.current) < .05) this.current = this.target;
      this.apply();
      this.raf = requestAnimationFrame(loop);
    };
    loop();
  },
  // offset vertikal di-cache; tidak ada layout read per frame
  measure() {
    for (const L of this.linked) {
      const r = L.el.getBoundingClientRect();
      L.mid = r.top + window.scrollY + r.height / 2;
    }
  },
  apply() {
    if (this.reduced) return;
    for (const el of this.layers) {
      const d = parseFloat(el.dataset.depth) * this.intensity;
      el.style.transform = 'translate3d(0,' + (this.current * d * -1).toFixed(2) + 'px,0)';
    }
    for (const L of this.linked) {
      const off = (this.current + innerHeight / 2 - L.mid) * L.speed * this.intensity;
      L.el.style.transform = 'translate3d(0,' + off.toFixed(2) + 'px,0)';
    }
  },
  destroy() { cancelAnimationFrame(this.raf); }
};
