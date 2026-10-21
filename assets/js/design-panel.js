/* ==========================================================================
   Design-Werkstatt – nur für die Vorbereitung im Orga-Team.
   Farben und Schriften live wechseln, Barcamp-Tag simulieren,
   Platzhalter markieren, Kombination als Link/CSS teilen.

   Abschalten: in assets/js/config.js  design.panel = false
   (dann trotzdem erreichbar über ?design=1, wieder aus mit ?design=0)
   ========================================================================== */
(function () {
  'use strict';

  var D = window.BARCAMP_DESIGN;
  if (!D || !D.enabled) return;

  var PALETTES = [
    { id: '1', name: 'Buntstift', mood: 'fröhlich, kräftig, nah an der Schule', colors: ['#f6511d', '#ffb400', '#00a6ed', '#7fb800'] },
    { id: '2', name: 'Pflaume & Senf', mood: 'ruhig, warm, eigenständig', colors: ['#5c415d', '#694966', '#74526c', '#dbd053'] },
    { id: '3', name: 'Pop', mood: 'verspielt, jung, selbstbewusst', colors: ['#ff6666', '#ccff66', '#5d2e8c', '#2ec4b6'] },
    { id: '4', name: 'Schulgarten', mood: 'frisch, natürlich, vertrauenswürdig', colors: ['#51cb20', '#76b041', '#639a88', '#3a5683'] },
    { id: '5', name: 'Abendrot', mood: 'herzlich, kreativ, warm', colors: ['#e09f7d', '#ef5d60', '#ec4067', '#a01a7d'] },
    { id: '6', name: 'Anthrazit & Gold', mood: 'seriös, edel, zurückhaltend', colors: ['#363636', '#242f40', '#cca43b', '#e5e5e5'] },
    { id: '7', name: 'Bordeaux & Kupfer', mood: 'kräftig, elegant, erwachsen', colors: ['#321325', '#5f0f40', '#9a031e', '#cb793a'] },
  ];

  var FONTS = [
    { id: 'werkstatt', name: 'Werkstatt', mood: 'lebendig & freundlich', head: 'Bricolage Grotesque', body: 'Figtree', mono: 'JetBrains Mono', weight: 750, fvs: 'normal' },
    { id: 'informatik', name: 'Informatik', mood: 'technisch & klar', head: 'Space Grotesk', body: 'Inter', mono: 'Space Mono', weight: 700, fvs: 'normal' },
    { id: 'lesefreundlich', name: 'Lesefreundlich', mood: 'für flüssiges Lesen entwickelt', head: 'Lexend', body: 'Lexend', mono: 'Red Hat Mono', weight: 650, fvs: 'normal' },
    { id: 'barrierearm', name: 'Barrierearm', mood: 'maximal unterscheidbare Zeichen', head: 'Atkinson Hyperlegible Next', body: 'Atkinson Hyperlegible Next', mono: 'Atkinson Hyperlegible Mono', weight: 760, fvs: 'normal' },
    { id: 'editorial', name: 'Editorial', mood: 'warm & hochwertig', head: 'Fraunces', body: 'Source Sans 3', mono: 'IBM Plex Mono', weight: 620, fvs: '"SOFT" 60, "WONK" 0' },
    { id: 'sachlich', name: 'Sachlich', mood: 'nüchtern & institutionell', head: 'IBM Plex Sans', body: 'IBM Plex Sans', mono: 'IBM Plex Mono', weight: 650, fvs: 'normal' },
    { id: 'code', name: 'Code-Charme', mood: 'verspielt mit Programmier-Flair', head: 'Recursive', body: 'Recursive', mono: 'Recursive Mono', weight: 800, fvs: '"CASL" 1, "CRSV" 0.5', headLabel: 'Recursive Casual', bodyLabel: 'Recursive Linear' },
  ];

  var PHASES = [
    { id: 'auto', label: 'Automatisch (nach Datum)' },
    { id: 'before', label: 'Vor dem Barcamp' },
    { id: 'live', label: 'Barcamp-Tag (live)' },
    { id: 'after', label: 'Nach dem Barcamp' },
  ];

  var TOKENS = [
    '--p1', '--p2', '--p3', '--p4',
    '--bg', '--bg-alt', '--surface', '--ink', '--ink-muted', '--line',
    '--brand', '--on-brand', '--brand-ink', '--accent', '--on-accent',
    '--hero-bg', '--hero-ink', '--hero-muted', '--hero-accent', '--hero-cta-bg', '--hero-cta-ink',
    '--band-bg', '--band-ink', '--band-accent', '--footer-bg', '--footer-ink', '--focus',
    '--font-head', '--font-body', '--font-mono', '--head-weight', '--head-tracking',
  ];

  var root = document.documentElement;
  var state = D.state;
  if (!state.phase) state.phase = 'auto';
  if (state.example === undefined) state.example = true;

  // Farben, Schrift & Co. bleiben gespeichert; der simulierte Seitenzustand nur in diesem Tab
  var SIM_KEYS = ['phase', 'example'];
  function save() {
    var keep = {}, sim = {};
    Object.keys(state).forEach(function (k) { (SIM_KEYS.indexOf(k) === -1 ? keep : sim)[k] = state[k]; });
    try { localStorage.setItem('nein-design', JSON.stringify(keep)); } catch (e) { /* egal */ }
    try { sessionStorage.setItem('nein-design-sim', JSON.stringify(sim)); } catch (e) { /* egal */ }
  }
  function emit(detail) {
    document.dispatchEvent(new CustomEvent('barcamp:design', { detail: detail }));
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function byId(list, id) {
    return list.filter(function (x) { return x.id === id; })[0] || list[0];
  }

  // Parameter aus geteiltem Link übernehmen und aus der Adresse entfernen
  (function adoptUrl() {
    var url = new URL(location.href);
    var touched = false;
    ['palette', 'font', 'design'].forEach(function (k) {
      if (url.searchParams.has(k)) { url.searchParams.delete(k); touched = true; }
    });
    save();
    if (touched && history.replaceState) history.replaceState(null, '', url.pathname + url.search + url.hash);
  })();

  // Stylesheet des Panels nachladen (gehört nicht zur fertigen Seite)
  var css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = (document.querySelector('script[src*="design-panel.js"]').getAttribute('src') || '').replace(/js\/design-panel\.js.*$/, 'css/design-panel.css');
  document.head.appendChild(css);

  // ---------------------------------------------------------------- Aufbau

  var fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'design-fab';
  fab.setAttribute('aria-expanded', 'false');
  fab.setAttribute('aria-controls', 'design-panel');
  fab.innerHTML =
    '<span class="design-fab__swatches" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
    '<span>Design</span>';

  var panel = document.createElement('aside');
  panel.className = 'design-panel';
  panel.id = 'design-panel';
  panel.setAttribute('aria-label', 'Design-Werkstatt');
  panel.hidden = true;

  panel.innerHTML =
    '<div class="dp-head">' +
      '<div><p class="dp-title">Design-Werkstatt</p><p class="dp-sub">Nur zur Vorbereitung · Besucher sehen das nicht, sobald es in der config.js ausgeschaltet ist.</p></div>' +
      '<button type="button" class="dp-close" aria-label="Panel schließen">&times;</button>' +
    '</div>' +
    '<div class="dp-body">' +
      '<section class="dp-section"><h2 class="dp-h">Farbpalette <span class="dp-kbd">1–7</span></h2>' +
        '<div class="dp-list" role="radiogroup" aria-label="Farbpalette" id="dp-palettes"></div></section>' +
      '<section class="dp-section"><h2 class="dp-h">Schriften <span class="dp-kbd">⇧ 1–7</span></h2>' +
        '<div class="dp-list" role="radiogroup" aria-label="Schriftkombination" id="dp-fonts"></div></section>' +
      '<section class="dp-section"><h2 class="dp-h">Vorschau</h2>' +
        '<label class="dp-field"><span>Seitenzustand</span><select id="dp-phase"></select></label>' +
        '<label class="dp-check"><input type="checkbox" id="dp-example"><span>Beispiel-Sessionplan zeigen<small>statt der echten sessions.md</small></span></label>' +
        '<label class="dp-check"><input type="checkbox" id="dp-ph"><span>Platzhalter markieren<small>Texte, die noch angepasst werden müssen</small></span></label>' +
      '</section>' +
      '<section class="dp-section"><h2 class="dp-h">Teilen</h2>' +
        '<div class="dp-actions">' +
          '<button type="button" class="dp-btn" id="dp-link">Link zu dieser Kombination kopieren</button>' +
          '<button type="button" class="dp-btn" id="dp-css">CSS-Variablen kopieren</button>' +
          '<button type="button" class="dp-btn dp-btn--quiet" id="dp-reset">Zurücksetzen</button>' +
        '</div>' +
        '<p class="dp-current" id="dp-current"></p>' +
      '</section>' +
    '</div>' +
    '<div class="dp-toast" id="dp-toast" role="status" aria-live="polite"></div>';

  function mount() {
    document.body.appendChild(fab);
    document.body.appendChild(panel);
    build();
    sync();
    setOpen(!!state.open);
  }

  function build() {
    var pal = panel.querySelector('#dp-palettes');
    pal.innerHTML = PALETTES.map(function (p) {
      return '<button type="button" class="dp-option" role="radio" data-palette-id="' + p.id + '">' +
        '<span class="dp-swatches" aria-hidden="true">' + p.colors.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '</span>' +
        '<span class="dp-option__text"><strong>' + p.id + ' · ' + esc(p.name) + '</strong><small>' + esc(p.mood) + '</small></span>' +
      '</button>';
    }).join('');

    var fonts = panel.querySelector('#dp-fonts');
    fonts.innerHTML = FONTS.map(function (f, i) {
      return '<button type="button" class="dp-option" role="radio" data-font-id="' + f.id + '">' +
        '<span class="dp-aa" aria-hidden="true" style="font-family:\'' + f.head + '\';font-weight:' + f.weight + ';font-variation-settings:' + esc(f.fvs) + '">Aa</span>' +
        '<span class="dp-option__text"><strong>' + (i + 1) + ' · ' + esc(f.name) + '</strong>' +
        '<small>' + esc(f.headLabel || f.head) + ' / ' + esc(f.bodyLabel || f.body) + '</small>' +
        '<small class="dp-mood">' + esc(f.mood) + '</small></span>' +
      '</button>';
    }).join('');

    var sel = panel.querySelector('#dp-phase');
    sel.innerHTML = PHASES.map(function (p) { return '<option value="' + p.id + '">' + p.label + '</option>'; }).join('');

    pal.addEventListener('click', function (e) {
      var b = e.target.closest('[data-palette-id]');
      if (b) setPalette(b.getAttribute('data-palette-id'));
    });
    fonts.addEventListener('click', function (e) {
      var b = e.target.closest('[data-font-id]');
      if (b) setFont(b.getAttribute('data-font-id'));
    });
    radioKeys(pal, '[data-palette-id]', function (b) { setPalette(b.getAttribute('data-palette-id')); });
    radioKeys(fonts, '[data-font-id]', function (b) { setFont(b.getAttribute('data-font-id')); });

    sel.addEventListener('change', function () {
      state.phase = sel.value;
      save(); sync();
      emit({ phase: true });
    });
    panel.querySelector('#dp-example').addEventListener('change', function () {
      state.example = this.checked;
      save();
      emit({ phase: true });
    });
    panel.querySelector('#dp-ph').addEventListener('change', function () {
      state.placeholders = this.checked;
      root.classList.toggle('show-ph', this.checked);
      save();
    });
    panel.querySelector('#dp-link').addEventListener('click', copyLink);
    panel.querySelector('#dp-css').addEventListener('click', copyCss);
    panel.querySelector('#dp-reset').addEventListener('click', reset);
    panel.querySelector('.dp-close').addEventListener('click', function () { setOpen(false); fab.focus(); });
    fab.addEventListener('click', function () { setOpen(panel.hidden); });
  }

  function radioKeys(group, selector, activate) {
    group.addEventListener('keydown', function (e) {
      var keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (!keys[e.key]) return;
      e.preventDefault();
      var items = Array.prototype.slice.call(group.querySelectorAll(selector));
      var i = items.indexOf(document.activeElement);
      var next = items[(i + keys[e.key] + items.length) % items.length];
      activate(next);
      next.focus();
    });
  }

  // ---------------------------------------------------------------- Zustand

  function setPalette(id) {
    state.palette = byId(PALETTES, id).id;
    root.setAttribute('data-palette', state.palette);
    save(); sync();
    emit({ theme: true });
  }

  function setFont(id) {
    state.font = byId(FONTS, id).id;
    root.setAttribute('data-font', state.font);
    save(); sync();
  }

  function setOpen(open) {
    panel.hidden = !open;
    fab.setAttribute('aria-expanded', String(open));
    fab.classList.toggle('is-open', open);
    state.open = open;
    save();
  }

  function sync() {
    var p = byId(PALETTES, state.palette);
    var f = byId(FONTS, state.font);
    panel.querySelectorAll('[data-palette-id]').forEach(function (b) {
      var on = b.getAttribute('data-palette-id') === p.id;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    panel.querySelectorAll('[data-font-id]').forEach(function (b) {
      var on = b.getAttribute('data-font-id') === f.id;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    panel.querySelector('#dp-phase').value = state.phase || 'auto';
    panel.querySelector('#dp-example').checked = !!state.example;
    panel.querySelector('#dp-ph').checked = !!state.placeholders;
    panel.querySelector('#dp-current').innerHTML = 'Aktuell: <strong>Palette ' + p.id + ' „' + esc(p.name) + '“</strong> + <strong>„' + esc(f.name) + '“</strong>';

    var sw = fab.querySelectorAll('.design-fab__swatches i');
    p.colors.forEach(function (c, i) { if (sw[i]) sw[i].style.background = c; });
  }

  function reset() {
    var cfg = (window.BARCAMP_CONFIG && window.BARCAMP_CONFIG.design) || {};
    state.phase = 'auto';
    state.example = true;
    state.placeholders = false;
    root.classList.remove('show-ph');
    setPalette(cfg.palette || '1');
    setFont(cfg.font || 'werkstatt');
    emit({ phase: true });
    toast('Auf Standard zurückgesetzt');
  }

  // ---------------------------------------------------------------- Teilen

  function copy(text, done) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { toast(done); }, function () { fallback(); });
    } else {
      fallback();
    }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      if (ok) toast(done); else window.prompt('Zum Kopieren:', text);
    }
  }

  function copyLink() {
    var url = new URL(location.href);
    url.hash = '';
    url.searchParams.set('palette', state.palette);
    url.searchParams.set('font', state.font);
    copy(url.toString(), 'Link kopiert – wer ihn öffnet, sieht genau diese Kombination.');
  }

  function copyCss() {
    var p = byId(PALETTES, state.palette);
    var f = byId(FONTS, state.font);
    var cs = getComputedStyle(root);
    var lines = TOKENS.map(function (t) {
      var v = cs.getPropertyValue(t).trim();
      return v ? '  ' + t + ': ' + v + ';' : null;
    }).filter(Boolean);
    var text =
      '/* NeIn – Palette ' + p.id + ' „' + p.name + '“ + Schrift „' + f.name + '“\n' +
      '   Schriften: ' + f.head + ' / ' + f.body + ' / ' + f.mono + ' (Dateien + @font-face: assets/fonts, assets/css/fonts.css) */\n' +
      ':root {\n' + lines.join('\n') + '\n}\n';
    copy(text, 'CSS-Variablen kopiert – z. B. für neueinformatik.de.');
  }

  var toastTimer;
  function toast(msg) {
    var t = panel.querySelector('#dp-toast');
    if (panel.hidden) setOpen(true);
    t.textContent = msg;
    t.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-visible'); }, 2600);
  }

  // ---------------------------------------------------------------- Tastatur

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    var m = /^Digit([1-7])$/.exec(e.code || '');
    if (m) {
      var i = +m[1] - 1;
      if (e.shiftKey) setFont(FONTS[i].id); else setPalette(PALETTES[i].id);
      e.preventDefault();
      return;
    }
    if (e.key === 'Escape' && !panel.hidden && panel.contains(document.activeElement)) {
      setOpen(false);
      fab.focus();
    }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
