/*
  AmbientEngine — lapisan "hidup" terus-menerus (fireflies, twinkle, ornamen sudut).
  Pola motion.js: IO/rAF tidak dibutuhkan di sini — semua loop infinite dijalankan
  CSS (transform/opacity saja), JS hanya menabur partikel sekali saat init.
  prefers-reduced-motion: tidak ada DOM yang dibangun, dan CSS global mematikan loop.
*/
const AmbientEngine = {
  init() {
    if (this.reduced()) return;
    this.fireflies();
    this.twinkles('#opening');
    this.twinkles('.scene-hero');
    this.corners();
    this.ampels();
  },

  reduced() {
    try { return matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch (e) { return false; }
  },

  rand(min, max) {
    return min + Math.random() * (max - min);
  },

  /* Debu emas: 14-18 titik kecil melayang naik-turun, durasi/delay unik biar organik. */
  fireflies() {
    const layer = document.getElementById('dustLayer');
    if (!layer || !layer.appendChild) return;
    let count = { HIGH: 18, MEDIUM: 15, LOW: 14 }[PerfController.level] || 16;
    for (let i = 0; i < count; i++) {
      const fly = document.createElement('span');
      fly.className = 'fly';
      const size = this.rand(2, 3.6).toFixed(1);
      fly.style.left = this.rand(2, 98).toFixed(2) + '%';
      fly.style.top = this.rand(4, 96).toFixed(2) + '%';
      fly.style.width = size + 'px';
      fly.style.height = size + 'px';
      fly.style.setProperty('--dx', this.rand(-34, 34).toFixed(0) + 'px');
      fly.style.setProperty('--dy', this.rand(-46, -18).toFixed(0) + 'px');
      fly.style.setProperty('--dur', this.rand(9, 21).toFixed(1) + 's');
      // Delay negatif: partikel mulai dari fase acak, bukan serentak.
      fly.style.animationDelay = '-' + this.rand(0, 21).toFixed(1) + 's,-' + this.rand(0, 6).toFixed(1) + 's';
      layer.appendChild(fly);
    }
  },

  /* Kelip cahaya lilin di opening + hero: 9 titik opacity-pulse per scene. */
  twinkles(sceneSelector) {
    const scene = document.querySelector(sceneSelector);
    if (!scene || !scene.appendChild) return;
    for (let i = 0; i < 9; i++) {
      const star = document.createElement('span');
      star.className = 'twinkle';
      star.style.left = this.rand(4, 94).toFixed(2) + '%';
      star.style.top = this.rand(6, 88).toFixed(2) + '%';
      star.style.setProperty('--dur', this.rand(2.4, 5.2).toFixed(1) + 's');
      star.style.animationDelay = '-' + this.rand(0, 5).toFixed(1) + 's';
      star.style.animationDuration = 'var(--dur)';
      scene.appendChild(star);
    }
  },

  /* Hiasan sudut emas ganda pada kartu-kartu utama (bingkai dalam + flourish sudut). */
  corners() {
    document.querySelectorAll('.hero-frame, .couple-card, .gift-card, .tl-item').forEach(card => {
      if (!card.appendChild) return;
      const orn = document.createElement('i');
      orn.className = 'orn-corners';
      orn.setAttribute('aria-hidden', 'true');
      card.appendChild(orn);
    });
  },

  /* Ampel/pahat: baris titik truntum emas di tepi atas & bawah tiap section. */
  ampels() {
    document.querySelectorAll('section[data-scene]').forEach(section => {
      if (!section.appendChild) return;
      ['tp', 'bt'].forEach(pos => {
        const strip = document.createElement('span');
        strip.className = 'ampel ' + pos;
        strip.setAttribute('aria-hidden', 'true');
        section.appendChild(strip);
      });
    });
  }
};
