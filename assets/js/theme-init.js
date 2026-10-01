/* Setzt Palette und Schrift, bevor die Seite gezeichnet wird (kein Aufflackern).
   Läuft synchron im <head>, direkt nach config.js. */
(function () {
  var cfg = (window.BARCAMP_CONFIG && window.BARCAMP_CONFIG.design) || {};
  var root = document.documentElement;
  var params = new URLSearchParams(location.search);
  var enabled = !!cfg.panel;
  var state = {};

  try {
    if (params.get('design') === '1') localStorage.setItem('nein-design-unlock', '1');
    if (params.get('design') === '0') localStorage.removeItem('nein-design-unlock');
    if (localStorage.getItem('nein-design-unlock') === '1') enabled = true;
    if (enabled) state = JSON.parse(localStorage.getItem('nein-design') || '{}') || {};
  } catch (e) {
    /* privater Modus o. Ä. – dann eben ohne Speicherung */
  }

  var palette = cfg.palette || '1';
  var font = cfg.font || 'werkstatt';

  if (enabled) {
    palette = params.get('palette') || state.palette || palette;
    font = params.get('font') || state.font || font;
    state.palette = palette;
    state.font = font;
    root.classList.add('design-mode');
    if (state.placeholders) root.classList.add('show-ph');
  }

  root.setAttribute('data-palette', palette);
  root.setAttribute('data-font', font);

  window.BARCAMP_DESIGN = { enabled: enabled, state: state };
})();
