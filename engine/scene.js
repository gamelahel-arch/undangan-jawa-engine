/* Scene Manager — scroll progress controller (spec §12) */
const SceneManager = {
  scenes: [], progress: 0,
  init() {
    this.scenes = [...document.querySelectorAll('[data-scene]')];
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      this.progress = max > 0 ? window.scrollY / max : 0;
      this.scenes.forEach(s => s.classList.toggle('scene-active', this.inView(s)));
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  },
  inView(s) {
    const r = s.getBoundingClientRect();
    return r.top < innerHeight * .8 && r.bottom > innerHeight * .2;
  }
};
