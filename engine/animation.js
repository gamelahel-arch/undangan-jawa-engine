/* Animation Manager — timeline deklaratif, bukan setTimeout berantakan (spec §28) */
const AnimationManager = {
  _timelines: {},
  register(name, timeline) { this._timelines[name] = timeline; },
  play(name) {
    const tl = this._timelines[name]; if (!tl) return;
    let elapsed = 0;
    tl.forEach(step => {
      setTimeout(() => {
        const els = document.querySelectorAll(step.target);
        els.forEach(el => {
          Object.assign(el.style, step.to);
          if (step.from) { Object.assign(el.style, step.from); requestAnimationFrame(() => Object.assign(el.style, step.to)); }
          if (step.cls) el.classList.add(step.cls);
        });
      }, elapsed + (step.delay || 0));
      elapsed += (step.delay || 0) + (step.after || 0);
    });
  }
};
