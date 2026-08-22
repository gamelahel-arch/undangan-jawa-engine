/* Parallax Manager — lerp smoothing via rAF (spec §4) */
const ParallaxManager = {
  layers: [], target: 0, current: 0, raf: null,
  intensity: 1,
  init() {
    this.layers = [...document.querySelectorAll('[data-depth]')];
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
  apply() {
    for (const el of this.layers) {
      const d = parseFloat(el.dataset.depth) * this.intensity;
      el.style.transform = 'translate3d(0,' + (this.current * d * -1).toFixed(2) + 'px,0)';
    }
  },
  destroy() { cancelAnimationFrame(this.raf); }
};
