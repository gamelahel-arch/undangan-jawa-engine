/* Coverflow ringan: kelas aktif berubah pada scroll horizontal, CSS menangani transform. */
const GalleryFlow = {
  observer: null,
  frame: null,

  init() {
    const track = document.getElementById('galWrapper');
    if (!track) return;
    const cards = [...track.querySelectorAll('.gallery-card')];
    if (!cards.length) return;

    const setActive = card => {
      cards.forEach(item => item.classList.toggle('is-active', item === card));
    };
    setActive(cards[0]);

    if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.observer = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target);
      }, { root: track, threshold: [0.45, 0.65, 0.85] });
      cards.forEach(card => this.observer.observe(card));
    }

    track.addEventListener('scroll', () => {
      if (this.frame) return;
      this.frame = requestAnimationFrame(() => {
        const center = track.scrollLeft + track.clientWidth / 2;
        let active = cards[0];
        let distance = Infinity;
        cards.forEach(card => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const nextDistance = Math.abs(cardCenter - center);
          if (nextDistance < distance) {
            distance = nextDistance;
            active = card;
          }
        });
        setActive(active);
        this.frame = null;
      });
    }, { passive: true });
  },

  destroy() {
    if (this.observer) this.observer.disconnect();
    if (this.frame) cancelAnimationFrame(this.frame);
    this.observer = null;
    this.frame = null;
  }
};
