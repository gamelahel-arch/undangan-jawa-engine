/*
  AmbientEngine v2 — restraint: sedikit, halus, lambat.
  Anggaran elemen loop: 8 kelopak + 8 kunang + 2 mist (CSS) + 2 flora sudut (markup).
  Pola lama: JS hanya menabur partikel sekali saat init; semua loop infinite
  dijalankan CSS (transform/opacity saja). API init() tetap.
  prefers-reduced-motion: tidak ada DOM yang dibangun, CSS global mematikan loop.
*/
const AmbientEngine = {
  init() {
    if (this.reduced()) return;
    this.petals();
    this.fireflies();
    this.corners();
  },

  reduced() {
    try { return matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch (e) { return false; }
  },

  rand(min, max) {
    return min + Math.random() * (max - min);
  },

  /* Kelopak jatuh: satu container, 8 span, durasi 9–16s, delay negatif (fase acak). */
  petals() {
    const layer = document.getElementById('petalLayer');
    if (!layer || !layer.appendChild) return;
    for (let i = 0; i < 8; i++) {
      const petal = document.createElement('span');
      petal.className = 'petal' + (i % 2 ? ' alt' : '');
      petal.style.left = this.rand(3, 97).toFixed(2) + '%';
      petal.style.width = this.rand(8, 13).toFixed(1) + 'px';
      petal.style.height = this.rand(11, 17).toFixed(1) + 'px';
      petal.style.setProperty('--dur', this.rand(9, 16).toFixed(1) + 's');
      petal.style.setProperty('--delay', '-' + this.rand(0, 16).toFixed(1) + 's');
      layer.appendChild(petal);
    }
  },

  /* Kunang emas: maksimal 8, satu animasi gabungan drift+pulse per titik. */
  fireflies() {
    const layer = document.getElementById('dustLayer');
    if (!layer || !layer.appendChild) return;
    const count = { HIGH: 8, MEDIUM: 7, LOW: 5 }[PerfController.level] || 8;
    for (let i = 0; i < count; i++) {
      const fly = document.createElement('span');
      fly.className = 'fly';
      const size = this.rand(2, 3.4).toFixed(1);
      fly.style.left = this.rand(2, 98).toFixed(2) + '%';
      fly.style.top = this.rand(4, 96).toFixed(2) + '%';
      fly.style.width = size + 'px';
      fly.style.height = size + 'px';
      fly.style.setProperty('--dx', this.rand(-34, 34).toFixed(0) + 'px');
      fly.style.setProperty('--dy', this.rand(-46, -18).toFixed(0) + 'px');
      fly.style.setProperty('--dur', this.rand(11, 22).toFixed(1) + 's');
      // Delay negatif: mulai dari fase acak, tidak serentak.
      fly.style.animationDelay = '-' + this.rand(0, 22).toFixed(1) + 's';
      layer.appendChild(fly);
    }
  },

  /* Flourish sudut hairline hanya pada kartu mempelai & hadiah (statis, tanpa loop). */
  corners() {
    document.querySelectorAll('.couple-card, .gift-card').forEach(card => {
      if (!card.appendChild) return;
      const orn = document.createElement('i');
      orn.className = 'orn-corners';
      orn.setAttribute('aria-hidden', 'true');
      card.appendChild(orn);
    });
  }
};
