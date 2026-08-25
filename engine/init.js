/* Engine bootstrap */
const App = {
  async start() {
    // 1. load data & theme (terpisah dari UI)
    const data = await fetch('data/invitation.json').then(r => r.json());
    const theme = await fetch('themes/' + data.theme + '.json').then(r => r.json());
    ThemeEngine.apply(theme);

    // 2. adaptive quality
    PerfController.detect();
    const cfg = PerfController.config(theme);

    // 3. engine modules
    ParallaxManager.intensity = cfg.parallax;
    ParallaxManager.init();
    Camera.bind(document.getElementById('world'));
    SceneManager.init();
    AnimationManager.register('opening', [
      { target: '.env-scene', from: { opacity: '0', transform: 'scale(.9) translateY(30px)' }, to: { opacity: '1', transform: 'scale(1) translateY(0)', transition: 'all 900ms cubic-bezier(.22,1,.36,1)' }, delay: 300 },
      { target: '.env-hint', to: { opacity: '1' }, delay: 1200 }
    ]);
    Interaction.init(theme.motion.intensity);

    // 4. render konten dari data
    Renderer.run(data, theme);

    // 5. Phase 2: scroll motion engine (reveal/stagger/parallax-linked)
    MotionEngine.init();

    // 6. opening sequence
    AnimationManager.play('opening');
    setupOpening(data, theme);
  }
};

document.addEventListener('DOMContentLoaded', () => App.start());
