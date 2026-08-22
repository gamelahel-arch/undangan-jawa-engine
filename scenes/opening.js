/* OpeningScene — sequence amplop 3D (spec §9/10) */
function setupOpening(data, theme) {
  const env = document.getElementById('env');
  const envScene = document.getElementById('envScene');
  let opened = false;
  function open() {
    if (opened) return; opened = true;
    env.classList.add('opening');
    // sequence: flap .15s delay (CSS) → kartu naik .5s → tirai belah setelah 1.4s
    setTimeout(() => document.body.classList.add('opened'), 1400);
  }
  if (envScene) {
    envScene.addEventListener('click', open);
    envScene.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') open(); });
  }
}
