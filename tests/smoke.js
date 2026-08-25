
// --- minimal DOM/fetch mocks untuk smoke test ---
function makeNode(tag) {
  return {
    tagName: String(tag || 'div').toUpperCase(),
    style: { setProperty(){} }, dataset: {},
    classList: {
      _s: new Set(),
      add(...c){ c.forEach(x => this._s.add(x)); },
      remove(...c){ c.forEach(x => this._s.delete(x)); },
      toggle(c, f){ if (f === undefined) f = !this._s.has(c); return f ? (this._s.add(c), true) : (this._s.delete(c), false); },
      contains(c){ return this._s.has(c); }
    },
    children: [], attributes: {}, handlers: {}, _q: {},
    querySelector(s){ return this._q[s] || (this._q[s] = makeNode('div')); },
    querySelectorAll(){ return []; },
    hidden: false, textContent: '', value: '', type: '', className: '', href: '',
    setAttribute(k, v){ this.attributes[k] = String(v); },
    getAttribute(k){ return k in this.attributes ? this.attributes[k] : null; },
    append(...n){ this.children.push(...n); },
    appendChild(n){ this.children.push(n); return n; },
    replaceChildren(){ this.children.length = 0; },
    remove(){}, select(){}, focus(){}, reset(){},
    addEventListener(t, fn){ (this.handlers[t] = this.handlers[t] || []).push(fn); },
    fire(t, ev){ (this.handlers[t] || []).forEach(fn => fn(Object.assign({ preventScroll: false }, ev))); },
    play(){ this.paused = false; return Promise.resolve(); },
    pause(){ this.paused = true; },
    paused: true,
    getBoundingClientRect(){ return { top: 0, bottom: 0, left: 0, right: 0 }; }
  };
}
const byId = {}, bySel = {};
global.document = {
  documentElement: { style:{setProperty(){}}, dataset:{} },
  body: makeNode('body'),
  querySelector: s => bySel[s] || (bySel[s] = makeNode('div')),
  querySelectorAll: () => [],
  getElementById: id => byId[id] || (byId[id] = makeNode('div')),
  createElement: t => makeNode(t),
  addEventListener(){}
};
global.window = { scrollY: 0, addEventListener(){} };
global.addEventListener = ()=>{};
global.matchMedia = () => ({ matches:false });
// navigator di Node ≥21 bersifat getter-only: wajib defineProperty.
Object.defineProperty(global, 'navigator', { value: { clipboard: { texts: [], writeText(t){ this.texts.push(t); return Promise.resolve(); } } }, configurable: true });
global.localStorage = { _m:{}, getItem(k){ return k in this._m ? this._m[k] : null; }, setItem(k,v){ this._m[k]=String(v); }, removeItem(k){ delete this._m[k]; } };
global.innerHeight = 800;
global.innerWidth = 400;
global.location = { search:'', href:'http://localhost/' };
global.requestAnimationFrame = cb => setTimeout(cb,16);
global.cancelAnimationFrame = ()=>{};
// ok:true agar App.start benar-benar menjalankan renderer + modul.
global.fetch = async url => ({ ok: true, json: async () => JSON.parse(require('fs').readFileSync(url,'utf8')) });
global.IntersectionObserver = class { observe(){} unobserve(){} disconnect(){} };

// load engine files in order
const fs = require('fs');
for (const f of ['../scenes/opening','theme','performance','parallax','motion','ambient','camera','animation','scene','interaction','renderer','commerce','gallery','init']) {
  require('vm').runInThisContext(fs.readFileSync('engine/'+f+'.js','utf8'),{filename:f+'.js'});
}
(async () => {
  await App.start();
  const assert = require('assert');
  const data = JSON.parse(fs.readFileSync('data/invitation.json','utf8'));

  // Struktur: index.html harus memuat section/element fitur baru.
  const html = fs.readFileSync('index.html','utf8');
  for (const id of ['countdownSection','cdGrid','cdDone','cdD','cdH','cdM','cdS','musicBtn','bgm','giftAccounts','rsvpSection','rsvpForm','rsvpList']) {
    assert.ok(html.includes(`id="${id}"`), `index.html harus punya #${id}`);
  }

  // Modul baru load & state benar.
  assert.strictEqual(typeof CommerceEngine.init, 'function', 'CommerceEngine harus terdefinisi');
  assert.strictEqual(typeof MotionEngine.init, 'function', 'MotionEngine harus terdefinisi');
  assert.strictEqual(typeof AmbientEngine.init, 'function', 'AmbientEngine harus terdefinisi');
  assert.ok(Array.isArray(ParallaxManager.linked), 'ParallaxManager.linked harus array');

  // Data JSON punya field fitur komersial.
  assert.ok(data.audio && data.audio.url, 'audio.url harus ada');
  assert.ok(data.rsvp && data.rsvp.enabled && Array.isArray(data.rsvp.seed) && data.rsvp.seed.length >= 2, 'rsvp enabled + seed');
  assert.ok(Array.isArray(data.gift.rekening) && data.gift.rekening.length >= 1, 'gift.rekening array');

  // Photo-scene: semua foto self-hosted ada di disk (JPEG >20KB) dan terpasang renderer.
  const photoPaths = [data.photos.hero, data.photos.groom, data.photos.bride, ...data.photos.gallery, data.photos.venue];
  for (const p of photoPaths) {
    const bytes = fs.readFileSync(p);
    assert.ok(bytes.length > 20480, `${p} harus >20KB (dapat ${bytes.length}B)`);
    assert.ok(bytes[0] === 0xFF && bytes[1] === 0xD8, `${p} harus JPEG`);
  }
  assert.ok(byId.groomPhoto.src.endsWith('/assets/img/groom.jpg') && byId.groomPhoto.hidden === false, 'foto groom terpasang');
  assert.ok(byId.bridePhoto.src.endsWith('/assets/img/bride.jpg'), 'foto bride terpasang');
  const galImgs = document.querySelector('#galWrapper').children.map(c => c.children[0].children[0].src);
  assert.strictEqual(galImgs.length, data.photos.gallery.length, 'galeri = jumlah foto');
  assert.ok(galImgs.every((s, i) => s.endsWith(data.photos.gallery[i])), 'galeri pakai foto asli');

  // Countdown mengisi angka untuk tanggal masa depan.
  assert.ok(byId.cdD.textContent !== '00' || byId.cdS.textContent !== '00', 'countdown harus terisi');

  // Countdown lewat tanggal → pesan "Hari Bahagia Telah Tiba".
  CommerceEngine.timers.cd && clearInterval(CommerceEngine.timers.cd);
  byId.cdGrid.hidden = byId.cdDone.hidden = false;
  CommerceEngine.initCountdown({ dateISO: '2020-01-01T00:00:00Z' });
  assert.strictEqual(byId.cdGrid.hidden, true, 'grid hidden saat tanggal lewat');
  assert.strictEqual(byId.cdDone.hidden, false, 'pesan hari bahagia tampil');

  // Copy rekening: 2 tombol dari data + flash "Tersalin ✓".
  const copyBtns = byId.giftAccounts.children;
  assert.strictEqual(copyBtns.length, data.gift.rekening.length, 'jumlah tombol salin = jumlah rekening');
  await copyBtns[0].handlers.click[0]();
  assert.strictEqual(navigator.clipboard.texts[0], String(data.gift.rekening[0].account), 'clipboard berisi no. rekening');
  assert.strictEqual(copyBtns[0].textContent, 'Tersalin ✓', 'feedback tersalin');

  // RSVP: seed dirender, submit menambah ucapan + persist ke localStorage.
  assert.strictEqual(byId.rsvpList.children.length, data.rsvp.seed.length, 'seed ucapan dirender');
  const nameInput = document.getElementById('rsvpName');
  const attendSel = document.getElementById('rsvpAttend');
  const msgInput = document.getElementById('rsvpMsg');
  nameInput.value = '  Tamu Uji  ';
  attendSel.value = 'Hadir';
  msgInput.value = '<img src=x onerror=alert(1)> Doa terbaik';
  byId.rsvpForm.fire('submit', { preventDefault(){} });
  const stored = JSON.parse(localStorage.getItem(`undangan-rsvp:${data.slug}`));
  assert.strictEqual(stored.length, data.rsvp.seed.length + 1, 'ucapan baru tersimpan');
  assert.strictEqual(byId.rsvpList.children.length, data.rsvp.seed.length + 1, 'ucapan baru dirender');
  // XSS: input dirender via textContent — tag tampil sebagai teks mentah, bukan elemen.
  const newMsg = byId.rsvpList.children[0].children.at(-1).textContent;
  assert.ok(newMsg.includes('<img src=x'), 'markup disimpan/ditampilkan apa adanya (teks)');
  assert.ok(newMsg.includes('Doa terbaik'));
  assert.ok(!byId.rsvpList.children[0].children.some(n => n.tagName === 'IMG'), 'tidak ada elemen IMG dibuat dari input');

  console.log('SMOKE TEST PASS — App.start selesai tanpa error'); process.exit(0);
})().catch(e => { console.error('SMOKE TEST FAIL:', e.message); process.exit(1); });
