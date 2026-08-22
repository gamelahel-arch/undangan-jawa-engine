/* Renderer — isi konten dari data, XSS-safe via textContent (spec §7/38) */
const Renderer = {
  run(d, theme) {
    const $ = s => document.querySelector(s);
    // opening
    $('#ecNames').textContent = d.couple.groom.short + ' & ' + d.couple.bride.short;
    $('#ecDate').textContent = d.event.dateLabel;
    // hero
    $('#heroNames').textContent = d.couple.groom.short + ' & ' + d.couple.bride.short;
    $('#heroDate').textContent = d.event.dateLabel;
    // couple detail
    $('#groomFull').textContent = d.couple.groom.full;
    $('#groomParents').textContent = d.couple.groom.childOf;
    $('#brideFull').textContent = d.couple.bride.full;
    $('#brideParents').textContent = d.couple.bride.childOf;
    // story timeline
    const tl = $('#storyTl');
    d.story.forEach((s, i) => {
      const item = document.createElement('div'); item.className = 'tl-item rv3d';
      const y = document.createElement('div'); y.className = 'tl-year'; y.textContent = s.year;
      const t = document.createElement('h3'); t.textContent = s.title;
      const p = document.createElement('p'); p.textContent = s.text;
      item.append(y, t, p); tl.appendChild(item);
    });
    // gallery dari data
    const wrap = $('#galWrapper');
    d.gallery.forEach(g => {
      const slide = document.createElement('div'); slide.className = 'swiper-slide';
      const fig = document.createElement('figure');
      const img = document.createElement('img'); img.src = g.src; img.alt = g.caption; img.loading = 'lazy';
      const cap = document.createElement('figcaption'); cap.textContent = g.caption;
      fig.append(img, cap); slide.appendChild(fig); wrap.appendChild(slide);
    });
    // gift
    $('#giftBank').textContent = d.gift.bank + ' · ' + d.gift.account;
    $('#giftHolder').textContent = a.n(d.gift.holder);
    // venue
    $('#venueName').textContent = d.event.venue;
    $('#venueAddr').textContent = d.event.address;
    $('#mapsBtn').href = d.event.mapsUrl;
    // guest param sanitized
    const guest = new URLSearchParams(location.search).get(d.guestParam);
    if (guest) $('#guestName').textContent = guest.slice(0, 60);
  }
};
// helper aman
const a = { n: s => String(s == null ? '' : s).slice(0, 80) };
