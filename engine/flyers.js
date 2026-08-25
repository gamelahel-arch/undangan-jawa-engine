/*
  FlyersEngine — kupu-kupu & burung siluet emas melintasi layar.
  Pola ambient.js: JS hanya menabur elemen sekali; loop infinite
  (lintas layar + flap sayap) dijalankan CSS murni via transform.
  prefers-reduced-motion: tidak ada DOM yang dibangun.
*/
const FlyersEngine = {
  init() {
    try { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; }
    catch (e) { return; }
    const layer = document.createElement('div');
    layer.id = 'flyersLayer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
    // 3 kupu-kupu + 2 burung. Delay negatif: fase awal acak, tak serentak.
    ['butterfly', 'butterfly', 'butterfly', 'bird', 'bird'].forEach((kind, i) => {
      const el = document.createElement('span');
      el.className = 'flyer ' + kind;
      el.style.top = (8 + i * 17 + Math.round(Math.random() * 8)) + '%';
      el.style.animationDelay = '-' + Math.round(Math.random() * 30) + 's';
      el.style.setProperty('--fdur', (18 + i * 4) + 's'); // 18–34s
      el.innerHTML = kind === 'bird' ? this.BIRD : this.FLY;
      layer.appendChild(el);
    });
  },

  /* Kupu-kupu: dua pasang sayap emas semi-transparan, flap = scaleX menuju badan. */
  FLY:
    '<svg viewBox="0 0 32 24" aria-hidden="true">' +
    '<g class="fw wl"><path d="M15 12 C7 2 0 3 1.5 10 C2.6 14.6 9 16 15 13.2 Z"/><path d="M15 13.4 C9 16.5 4.5 19 7.5 21.5 C10 23.2 14 19 15 15 Z"/></g>' +
    '<g class="fw wr"><path d="M17 12 C25 2 32 3 30.5 10 C29.4 14.6 23 16 17 13.2 Z"/><path d="M17 13.4 C23 16.5 27.5 19 24.5 21.5 C22 23.2 18 19 17 15 Z"/></g>' +
    '<ellipse cx="16" cy="13" rx="1.3" ry="4.4"/></svg>',

  /* Burung: siluet "V", flap = scaleY swap dua frame. */
  BIRD:
    '<svg viewBox="0 0 32 14" aria-hidden="true"><g class="bw"><path d="M1 12 Q10 2 16 8 Q22 2 31 12 Q22 8.6 16 10.4 Q10 8.6 1 12 Z"/></g></svg>'
};
