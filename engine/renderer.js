const Renderer = {
  run(data) {
    const $ = selector => document.querySelector(selector);
    const coupleNames = `${data.couple.groom.short} & ${data.couple.bride.short}`;

    // Opening dan hero.
    $('#ecNames').textContent = coupleNames;
    $('#ecDate').textContent = data.event.dateLabel;
    $('#heroNames').textContent = coupleNames;
    $('#heroDate').textContent = data.event.dateLabel;

    // Mempelai.
    $('#groomFull').textContent = data.couple.groom.full;
    $('#groomParents').textContent = data.couple.groom.childOf;
    $('#brideFull').textContent = data.couple.bride.full;
    $('#brideParents').textContent = data.couple.bride.childOf;

    // Photo-scene: pasang foto asli bila field photos terisi;
    // tanpa itu layout kembali ke ilustrasi SVG lama (fallback).
    const photos = data.photos || {};
    Renderer.setPhoto(document.getElementById('groomPhoto'), photos.groom);
    Renderer.setPhoto(document.getElementById('bridePhoto'), photos.bride);
    const heroUrl = Renderer.safeUrl(photos.hero);
    if (heroUrl) document.querySelector('.scene-hero').style.setProperty('--hero-photo', `url("${heroUrl}")`);
    const venueUrl = Renderer.safeUrl(photos.venue);
    const locationSection = document.querySelector('.location-section');
    if (locationSection) {
      if (venueUrl) locationSection.style.setProperty('--venue-photo', `url("${venueUrl}")`);
      const art = locationSection.querySelector('.location-art');
      if (art) art.hidden = Boolean(venueUrl); // tanpa foto venue → tampilkan lagi ilustrasi.
    }

    // Timeline dibuat sebagai node DOM, bukan template HTML, untuk data pengguna tetap aman.
    const timeline = $('#storyTl');
    timeline.replaceChildren();
    data.story.forEach(itemData => {
      const item = document.createElement('article');
      item.className = 'tl-item';
      item.dataset.motion = 'reveal';
      const year = document.createElement('p');
      year.className = 'tl-year';
      year.textContent = itemData.year;
      const title = document.createElement('h3');
      title.textContent = itemData.title;
      const copy = document.createElement('p');
      copy.textContent = itemData.text;
      item.append(year, title, copy);
      timeline.append(item);
    });

    // Coverflow galeri memakai elemen semantik dan alt/caption dari data.
    const gallery = $('#galWrapper');
    gallery.replaceChildren();
    data.gallery.forEach((galleryItem, index) => {
      const card = document.createElement('article');
      card.className = 'gallery-card';
      const figure = document.createElement('figure');
      const image = document.createElement('img');
      image.src = Renderer.safeUrl((photos.gallery && photos.gallery[index]) || galleryItem.src) || '';
      image.alt = galleryItem.caption;
      image.loading = index === 0 ? 'eager' : 'lazy';
      image.decoding = 'async';
      const caption = document.createElement('figcaption');
      caption.textContent = galleryItem.caption;
      figure.append(image, caption);
      card.append(figure);
      gallery.append(card);
    });

    // Lokasi dan amplop digital.
    $('#giftBank').textContent = `${data.gift.bank} · ${data.gift.account}`;
    $('#giftHolder').textContent = Renderer.clean(data.gift.holder, 80);
    $('#venueName').textContent = data.event.venue;
    $('#venueAddr').textContent = data.event.address;
    $('#mapsBtn').href = Renderer.safeUrl(data.event.mapsUrl) || '#';

    // Nama tamu dibatasi panjangnya dan selalu dipasang dengan textContent.
    const guest = new URLSearchParams(location.search).get(data.guestParam);
    if (guest) $('#guestName').textContent = Renderer.clean(guest, 60);
  },

  clean(value, maxLength) {
    return String(value == null ? '' : value).slice(0, maxLength);
  },

  safeUrl(value) {
    try {
      const url = new URL(String(value || ''), location.href);
      return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
    } catch {
      return '';
    }
  },

  setPhoto(img, value) {
    if (!img) return;
    const url = Renderer.safeUrl(value);
    if (url) { img.src = url; img.hidden = false; }
  }
};
