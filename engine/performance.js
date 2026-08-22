/* Performance Controller — adaptive quality HIGH/MEDIUM/LOW (spec §33) */
const PerfController = {
  level: 'HIGH',
  detect() {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = matchMedia('(max-width: 768px)').matches;
    const cores = navigator.hardwareConcurrency || 4;
    const lowMem = (navigator.deviceMemory || 8) <= 2;
    if (reduced || lowMem || cores <= 2) this.level = 'LOW';
    else if (mobile && cores <= 6) this.level = 'MEDIUM';
    else this.level = 'HIGH';
    document.documentElement.dataset.quality = this.level.toLowerCase();
    return this.level;
  },
  config(theme) {
    const m = { LOW: .35, MEDIUM: .65, HIGH: 1 }[this.level];
    return {
      parallax: theme.motion.parallax * m,
      dust: this.level === 'HIGH' ? theme.motion.dustCountHigh : this.level === 'MEDIUM' ? 8 : theme.motion.dustCountLow,
      blur: this.level !== 'LOW'
    };
  }
};
