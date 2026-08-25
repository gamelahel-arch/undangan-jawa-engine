const App = {
  async start() {
    const [dataResponse, themeResponse] = await Promise.all([
      fetch('data/invitation.json'),
      fetch('themes/jawa-luxury.json')
    ]);
    if (!dataResponse.ok || !themeResponse.ok) return;

    const [data, theme] = await Promise.all([dataResponse.json(), themeResponse.json()]);
    ThemeEngine.apply(theme);

    // Kualitas motion ditentukan sekali; perangkat low-end memakai parallax lebih pendek.
    PerfController.detect();
    const config = PerfController.config(theme);

    // Data selalu dirender sebelum modul mencari elemen dinamis.
    Renderer.run(data);
    CommerceEngine.init(data);
    ParallaxManager.intensity = config.parallax;
    ParallaxManager.init();
    Camera.bind(document.getElementById('world'));
    SceneManager.init();
    Interaction.init(theme.motion.intensity);
    MotionEngine.init();
    AmbientEngine.init();
    FlyersEngine.init();
    // No-GPU hemat: video hanya play saat terlihat (IO), pause saat keluar viewport
    const lazyVideos = document.querySelectorAll('[data-lazy-video], .bg-video');
    if ('IntersectionObserver' in window && lazyVideos.length) {
      const vio = new IntersectionObserver((ents) => {
        ents.forEach((en) => {
          const v = en.target;
          if (en.isIntersecting) { v.play().catch(() => {}); }
          else v.pause();
        });
      }, { rootMargin: '120px' });
      lazyVideos.forEach((v) => {
        v.removeAttribute('autoplay');
        if (!document.documentElement.dataset.quality || document.documentElement.dataset.quality !== 'low') vio.observe(v);
        else v.pause();
      });
    }
    GalleryFlow.init();
    setupOpening(data, theme);
  }
};

document.addEventListener('DOMContentLoaded', () => App.start());
