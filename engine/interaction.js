/* Interaction Manager — gyro optional + cursor kecil (spec §21/22/32) */
const Interaction = {
  init(intensity) {
    const targets = () => document.querySelectorAll('.tilt3d');
    // Desktop cursor: maksimal ±3deg sesuai spec
    if (matchMedia('(pointer:fine)').matches) {
      let raf = null;
      addEventListener('pointermove', e => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const mx = e.clientX / innerWidth - .5, my = e.clientY / innerHeight - .5;
          targets().forEach(t => t.style.transform = 'perspective(900px) rotateX(' + (-my * 3 * intensity) + 'deg) rotateY(' + (mx * 3 * intensity) + 'deg)');
          raf = null;
        });
      }, { passive: true });
    }
    // Gyro: enhancement saja, gagal = diam
    const enableGyro = () => {
      if (!(typeof DeviceOrientationEvent !== 'undefined')) return;
      const handler = e => {
        const gx = (e.gamma || 0) / 45, gy = ((e.beta || 0) - 40) / 45;
        targets().forEach(t => t.style.transform = 'perspective(900px) rotateX(' + (-Math.max(-1, Math.min(1, gy)) * 4 * intensity) + 'deg) rotateY(' + (Math.max(-1, Math.min(1, gx)) * 5 * intensity) + 'deg)');
      };
      if (DeviceOrientationEvent.requestPermission) {
        DeviceOrientationEvent.requestPermission().then(s => { if (s === 'granted') addEventListener('deviceorientation', handler); }).catch(() => {});
      } else addEventListener('deviceorientation', handler);
    };
    const openBtn = document.getElementById('btnOpen');
    if (openBtn) openBtn.addEventListener('click', enableGyro, { once: true });
  }
};
