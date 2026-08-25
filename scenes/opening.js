const OpeningScene = {
  opened: false,
  timer: null,

  setup() {
    const envelope = document.getElementById('env');
    const trigger = document.getElementById('envScene');
    const opening = document.getElementById('opening');
    const content = document.getElementById('invitationContent');
    if (!envelope || !trigger || !opening || !content) return;

    const open = () => {
      if (this.opened) return;
      this.opened = true;
      trigger.disabled = true;
      trigger.setAttribute('aria-expanded', 'true');
      trigger.setAttribute('aria-label', 'Undangan sedang dibuka');
      envelope.classList.add('opening');
      document.body.classList.remove('opening-locked');

      const finish = () => {
        document.body.classList.add('opened');
        opening.setAttribute('aria-hidden', 'true');
        content.focus({ preventScroll: true });
      };

      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        finish();
      } else {
        this.timer = window.setTimeout(finish, 1120);
      }
    };

    // pointerup menangkap tap sentuh dengan respons cepat; click menjadi fallback untuk keyboard/desktop.
    let pointerActivated = false;
    trigger.addEventListener('pointerup', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      pointerActivated = true;
      open();
    }, { passive: true });
    trigger.addEventListener('click', () => {
      if (!pointerActivated) open();
      pointerActivated = false;
    });
    trigger.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    });
  },

  destroy() {
    if (this.timer) window.clearTimeout(this.timer);
  }
};

function setupOpening() {
  OpeningScene.setup();
}
