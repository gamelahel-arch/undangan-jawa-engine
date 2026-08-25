/*
  Parallax scroll-linked yang hemat: ukuran di-cache, transform saja,
  dan rAF aktif hanya ketika target scroll masih berubah.
*/
const ParallaxManager = {
  layers: [],
  linked: [],
  target: 0,
  current: 0,
  raf: null,
  intensity: 1,
  reduced: false,
  onScroll: null,
  onResize: null,

  init() {
    this.destroy();
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.layers = [...document.querySelectorAll('[data-depth]')];
    this.linked = [...document.querySelectorAll('[data-motion~="parallax"]')]
      .map(el => ({ el, speed: parseFloat(el.dataset.speed || '0.12'), mid: 0 }));
    this.target = window.scrollY || 0;
    this.current = this.target;
    this.measure();
    this.apply();

    if (this.reduced || (!this.layers.length && !this.linked.length)) return;

    this.onScroll = () => {
      this.target = window.scrollY || 0;
      this.start();
    };
    this.onResize = () => {
      this.measure();
      this.apply();
    };
    addEventListener('scroll', this.onScroll, { passive: true });
    addEventListener('resize', this.onResize, { passive: true });
  },

  measure() {
    this.linked.forEach(link => {
      const rect = link.el.getBoundingClientRect();
      link.mid = rect.top + (window.scrollY || 0) + rect.height / 2;
    });
  },

  start() {
    if (this.raf || this.reduced) return;
    const tick = () => {
      this.current += (this.target - this.current) * 0.14;
      if (Math.abs(this.target - this.current) < 0.1) this.current = this.target;
      this.apply();
      if (this.current !== this.target) {
        this.raf = requestAnimationFrame(tick);
      } else {
        this.raf = null;
      }
    };
    this.raf = requestAnimationFrame(tick);
  },

  apply() {
    if (this.reduced) return;
    this.layers.forEach(layer => {
      const depth = parseFloat(layer.dataset.depth || '0') * this.intensity;
      layer.style.transform = `translate3d(0,${(this.current * depth * -1).toFixed(2)}px,0)`;
    });
    this.linked.forEach(link => {
      const offset = (this.current + innerHeight / 2 - link.mid) * link.speed * this.intensity;
      link.el.style.transform = `translate3d(0,${offset.toFixed(2)}px,0)`;
    });
  },

  destroy() {
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.onScroll) removeEventListener('scroll', this.onScroll);
    if (this.onResize) removeEventListener('resize', this.onResize);
    this.raf = null;
    this.onScroll = null;
    this.onResize = null;
  }
};
