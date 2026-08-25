/*
  Reveal ringan berbasis IntersectionObserver.
  Elemen dianotasi data-motion="reveal|zoom|stagger|parallax".
  Reveal hanya sekali jalan agar tidak berkedip saat pengguna menggulir balik.
*/
const MotionEngine = {
  io: null,

  init() {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const staggered = document.querySelectorAll('[data-motion~="stagger"]');
    staggered.forEach(container => {
      [...container.children].forEach((child, index) => {
        const tokens = (child.dataset.motion || '').split(/\s+/).filter(Boolean);
        if (!tokens.includes('reveal') && !tokens.includes('zoom')) tokens.push('reveal');
        child.dataset.motion = tokens.join(' ');
        child.style.setProperty('--i', String(index));
      });
    });

    const targets = [...document.querySelectorAll('[data-motion~="reveal"], [data-motion~="zoom"]')];
    if (reduced || !('IntersectionObserver' in window)) {
      targets.forEach(target => target.classList.add('in'));
      return;
    }

    document.documentElement.classList.add('motion-ready');
    this.io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        this.io.unobserve(entry.target);
      });
    }, {
      rootMargin: '0px 0px -9% 0px',
      threshold: 0.08
    });
    targets.forEach(target => this.io.observe(target));
  },

  destroy() {
    if (this.io) this.io.disconnect();
    this.io = null;
  }
};
