/* Theme Engine — hanya ubah visual tokens, tidak sentuh engine (spec §8) */
const ThemeEngine = {
  apply(theme) {
    const r = document.documentElement.style;
    const c = theme.colors;
    r.setProperty('--bg', c.background); r.setProperty('--surface', c.surface);
    r.setProperty('--surface2', c.surface2); r.setProperty('--fg', c.foreground);
    r.setProperty('--muted', c.muted); r.setProperty('--gold', c.accent);
    r.setProperty('--border', c.border);
    r.setProperty('--font-heading', theme.typography.heading);
    r.setProperty('--font-display', theme.typography.display);
    r.setProperty('--font-body', theme.typography.body);
    document.body.dataset.theme = theme.name;
  }
};
