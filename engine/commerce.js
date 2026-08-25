const CommerceEngine = {
  timers: {},
  musicReady: false,

  init(data) {
    this.slug = data.slug || 'default';
    this.initMusic(data.audio);
    this.initCountdown(data.event);
    this.initGift(data.gift);
    this.initRsvp(data.rsvp);
    document.addEventListener('invitation:opened', () => this.onOpened());
  },

  /* Musik latar: src dari data.audio.url; tanpa URL tombol tetap hidden. */
  initMusic(audio) {
    const btn = document.getElementById('musicBtn');
    const el = document.getElementById('bgm');
    if (!btn || !el) return;
    const src = Renderer.safeUrl(audio && audio.url);
    if (!src) return;
    el.src = src;
    el.loop = true;
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', () => {
      if (el.paused) {
        el.play().then(() => this.setMusicState(true)).catch(() => {});
      } else {
        el.pause();
        this.setMusicState(false);
      }
    });
    this.musicReady = true;
  },

  setMusicState(playing) {
    const btn = document.getElementById('musicBtn');
    if (!btn) return;
    btn.classList.toggle('playing', playing);
    btn.setAttribute('aria-pressed', String(playing));
  },

  onOpened() {
    const btn = document.getElementById('musicBtn');
    const el = document.getElementById('bgm');
    if (!this.musicReady || !btn || !el) return;
    btn.hidden = false;
    el.volume = 0.55;
    el.play().then(() => this.setMusicState(true)).catch(() => {
      // Autoplay diblokir browser: pengguna dapat menyalakan lewat tombol.
    });
  },

  /* Countdown 4 kotak; lewat tanggal → "Hari Bahagia Telah Tiba". */
  initCountdown(event) {
    const section = document.getElementById('countdownSection');
    if (!section) return;
    const grid = document.getElementById('cdGrid');
    const done = document.getElementById('cdDone');
    const fields = {
      d: document.getElementById('cdD'),
      h: document.getElementById('cdH'),
      m: document.getElementById('cdM'),
      s: document.getElementById('cdS')
    };
    const target = event && event.dateISO ? new Date(event.dateISO).getTime() : NaN;
    if (Number.isNaN(target) || !grid || !done || !fields.d) { section.hidden = true; return; }
    const pad = n => String(n).padStart(2, '0');
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        clearInterval(this.timers.cd);
        grid.hidden = true;
        done.hidden = false;
        return;
      }
      fields.d.textContent = pad(Math.floor(diff / 864e5));
      fields.h.textContent = pad(Math.floor(diff / 36e5) % 24);
      fields.m.textContent = pad(Math.floor(diff / 6e4) % 60);
      fields.s.textContent = pad(Math.floor(diff / 1e3) % 60);
    };
    this.timers.cd = setInterval(tick, 1000);
    tick();
  },

  /* Tombol salin rekening: pakai gift.rekening[], fallback turun ke gift.account lama. */
  initGift(gift) {
    const wrap = document.getElementById('giftAccounts');
    if (!wrap || !gift) return;
    const accounts = Array.isArray(gift.rekening) && gift.rekening.length
      ? gift.rekening.filter(acc => acc && acc.account)
      : (gift.account ? [{ bank: gift.bank, account: gift.account }] : []);
    accounts.forEach(acc => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-btn';
      btn.textContent = accounts.length > 1 && acc.bank ? `Salin No. Rekening — ${acc.bank}` : 'Salin No. Rekening';
      btn.addEventListener('click', () => this.copyAccount(btn, String(acc.account)));
      wrap.append(btn);
    });
  },

  copyAccount(btn, account) {
    const flash = () => {
      const original = btn.dataset.label || (btn.dataset.label = btn.textContent);
      btn.textContent = 'Tersalin ✓';
      btn.classList.add('copied');
      clearTimeout(btn._flashTimer);
      btn._flashTimer = setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove('copied');
      }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(account).then(flash).catch(() => this.copyFallback(account, flash));
    } else {
      this.copyFallback(account, flash);
    }
  },

  // Fallback untuk browser/konteks non-secure tanpa Clipboard API.
  copyFallback(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      if (document.execCommand && document.execCommand('copy')) done();
    } catch { /* izin ditolak: abaikan */ }
    ta.remove();
  },

  /* RSVP + buku tamu demo: localStorage per slug, maksimal 10 ucapan tampil. */
  initRsvp(rsvp) {
    const section = document.getElementById('rsvpSection');
    if (!section || !rsvp || !rsvp.enabled) { if (section) section.hidden = true; return; }
    this.storeKey = `undangan-rsvp:${this.slug}`;
    const attendList = ['Hadir', 'Tidak Hadir', 'Masih Ragu'];
    let entries = this.loadEntries();
    if (!entries.length && Array.isArray(rsvp.seed)) {
      entries = rsvp.seed.slice(0, 10).map(seed => ({
        name: Renderer.clean(seed.name, 60),
        attend: attendList.includes(seed.attend) ? seed.attend : 'Hadir',
        message: Renderer.clean(seed.message, 300),
        ts: Date.parse(seed.ts) || Date.now()
      }));
      this.saveEntries(entries);
    }

    this.renderEntries(document.getElementById('rsvpList'), entries);

    const form = document.getElementById('rsvpForm');
    if (!form) return;
    form.addEventListener('submit', event => {
      event.preventDefault();
      const nameInput = document.getElementById('rsvpName');
      const name = String(nameInput.value || '').trim();
      if (!name) { nameInput.focus(); return; }
      const attendSel = document.getElementById('rsvpAttend');
      const msgInput = document.getElementById('rsvpMsg');
      entries.unshift({
        name: name.slice(0, 60),
        attend: attendList.includes(attendSel.value) ? attendSel.value : 'Hadir',
        message: String(msgInput.value || '').trim().slice(0, 300),
        ts: Date.now()
      });
      // ponytail: simpan maksimal 50 entri terakhir; pindah ke backend saat live.
      this.saveEntries(entries.slice(0, 50));
      this.renderEntries(document.getElementById('rsvpList'), entries);
      form.reset();
    });
  },

  loadEntries() {
    try {
      const parsed = JSON.parse(localStorage.getItem(this.storeKey));
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  },

  saveEntries(entries) {
    try { localStorage.setItem(this.storeKey, JSON.stringify(entries)); } catch { /* mode privat: lewati persist */ }
  },

  renderEntries(list, entries) {
    if (!list) return;
    list.replaceChildren();
    const badges = { 'Hadir': 'yes', 'Tidak Hadir': 'no', 'Masih Ragu': 'maybe' };
    entries.slice(0, 10).forEach(entry => {
      const item = document.createElement('article');
      item.className = 'rsvp-item';
      const head = document.createElement('div');
      head.className = 'rsvp-head';
      const name = document.createElement('span');
      name.className = 'rsvp-name';
      name.textContent = entry.name;
      const badge = document.createElement('span');
      badge.className = 'rsvp-badge ' + (badges[entry.attend] || '');
      badge.textContent = entry.attend;
      head.append(name, badge);
      item.append(head);
      if (entry.message) {
        const copy = document.createElement('p');
        copy.textContent = entry.message;
        item.append(copy);
      }
      list.append(item);
    });
    if (!entries.length) {
      const empty = document.createElement('p');
      empty.className = 'rsvp-empty';
      empty.textContent = 'Jadilah yang pertama mengirim ucapan.';
      list.append(empty);
    }
  }
};
