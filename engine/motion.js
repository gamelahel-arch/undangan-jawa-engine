/* Motion Engine — Phase 2: reveal-on-scroll + stagger (spec §13)
   Data-driven: elemen dianotasi data-motion="reveal|zoom|stagger|parallax".
   Reveal sekali jalan lalu persist (unobserve), tidak bolak-balik. */
const MotionEngine = {
  io: null,
  init() {
    // stagger container: anotasi anak-anak dulu, baru kumpulkan semua reveal
    document.querySelectorAll('[data-motion~="stagger"]').forEach(c => {
      [...c.children].forEach((child, i) => {
        if (!child.dataset.motion) child.dataset.motion = 'reveal';
        child.style.setProperty('--i', i);
      });
    });
    const els = [...document.querySelectorAll('[data-motion~="reveal"]')];
    // reduced motion atau tanpa IO: tampilkan langsung, tanpa animasi
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('in'));
      return;
    }
    // hidden-state CSS hanya aktif saat JS siap (no-JS = konten tetap terlihat)
    document.documentElement.classList.add('motion-ready');
    this.io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('in');
        this.io.unobserve(e.target); // persist: tidak revert saat scroll balik
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0 });
    els.forEach(el => this.io.observe(el));
  }
};
