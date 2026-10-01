/* ==========================================================================
   NeIn-Barcamp – Seitenlogik
   · Phasen: vor dem Barcamp / Barcamp-Tag (live) / danach
   · Countdown, Navigation
   · Essensbuchung über FormSubmit (Formular-Adresse steht in index.html)
   · Sessionplan aus sessions.md (lädt sich selbst neu, Beamer-Ansicht)
   · Edupads als eingebettetes Fenster
   ========================================================================== */
(function () {
  'use strict';

  var CFG = window.BARCAMP_CONFIG || {};
  var EVENT = CFG.event || {};
  var LIVE = CFG.live || {};
  var PADS = CFG.pads || {};
  var MEAL = CFG.meal || {};
  var TZ = EVENT.timeZone || 'Europe/Berlin';
  var root = document.documentElement;

  function $(sel, el) { return (el || document).querySelector(sel); }
  function $$(sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); }

  function store(kind) {
    try { return window[kind]; } catch (e) { return null; }
  }
  function getItem(kind, key) {
    try { var s = store(kind); return s ? s.getItem(key) : null; } catch (e) { return null; }
  }
  function setItem(kind, key, value) {
    try { var s = store(kind); if (s) s.setItem(key, value); } catch (e) { /* egal */ }
  }

  // ---------------------------------------------------------------- Zeit (immer deutsche Ortszeit)

  var partsFmt = new Intl.DateTimeFormat('de-DE', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });

  function nowParts() {
    var p = {};
    partsFmt.formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    return p;
  }
  function todayISO() {
    var p = nowParts();
    return p.year + '-' + p.month + '-' + p.day;
  }
  function minutesNow() {
    var p = nowParts();
    return (+p.hour % 24) * 60 + (+p.minute);
  }
  function isoToUTC(iso) {
    var d = iso.split('-').map(Number);
    return Date.UTC(d[0], d[1] - 1, d[2]);
  }
  function daysUntil(iso) {
    return Math.round((isoToUTC(iso) - isoToUTC(todayISO())) / 864e5);
  }
  function formatDate(iso, withYear) {
    var opts = { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' };
    if (withYear) opts.year = 'numeric';
    return new Intl.DateTimeFormat('de-DE', opts).format(new Date(isoToUTC(iso)));
  }
  function clock(date) {
    return new Intl.DateTimeFormat('de-DE', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(date || new Date());
  }

  // ---------------------------------------------------------------- Phase

  function designState() {
    var d = window.BARCAMP_DESIGN;
    return d && d.enabled ? d.state || {} : {};
  }

  function computePhase() {
    var forced = designState().phase;
    if (forced && forced !== 'auto') return forced;

    var today = todayISO();
    var from = LIVE.from || EVENT.date;
    if (today < from) return 'before';
    if (today <= EVENT.date) return 'live';
    if (LIVE.until && today > LIVE.until) return 'over';
    return 'after';
  }

  var phase = null;

  function applyPhase() {
    var next = computePhase();
    var changed = next !== phase;
    phase = next;
    root.setAttribute('data-phase', phase);

    $$('[data-phases]').forEach(function (el) {
      el.hidden = el.getAttribute('data-phases').split(/\s+/).indexOf(phase) === -1;
    });

    updateCountdown();
    updateMeal();
    if (phase === 'live' || phase === 'after') startLive(); else stopLive();
    if (changed) observeSections();
  }

  // ---------------------------------------------------------------- Countdown

  function updateCountdown() {
    var el = $('#countdown');
    if (!el) return;
    var d = daysUntil(EVENT.date);
    if (phase !== 'before' || d < 1) { el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML = d === 1 ? '<strong>Morgen</strong> geht’s los' : 'Noch <strong>' + d + '</strong> Tage';
  }

  // ---------------------------------------------------------------- Navigation

  function initNav() {
    var header = $('#header');
    var toggle = $('.nav-toggle');
    var nav = $('#site-nav');

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    }
    toggle.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });

    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  var sectionObserver = null;
  function observeSections() {
    if (!('IntersectionObserver' in window)) return;
    if (sectionObserver) sectionObserver.disconnect();
    var links = $$('.site-nav a[href^="#"]');
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });

    sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        var a = byId[entry.target.id];
        if (a) a.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section && !section.hidden) sectionObserver.observe(section);
    });
  }

  // ---------------------------------------------------------------- Favicon & Browserfarbe passend zur Palette

  function updateBrandAssets() {
    var cs = getComputedStyle(root);
    var c = ['--p1', '--p2', '--p3', '--p4'].map(function (v) { return cs.getPropertyValue(v).trim(); });
    if (!c[0]) return;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
      '<rect x="2" y="2.5" width="13" height="13" rx="3" fill="' + c[0] + '" transform="rotate(-4 8.5 9)"/>' +
      '<rect x="17" y="2" width="13" height="13" rx="3" fill="' + c[1] + '" transform="rotate(3 23.5 8.5)"/>' +
      '<rect x="2.5" y="17" width="13" height="13" rx="3" fill="' + c[2] + '" transform="rotate(2 9 23.5)"/>' +
      '<rect x="17" y="17.5" width="13" height="13" rx="3" fill="' + c[3] + '" transform="rotate(-3 23.5 24)"/></svg>';
    var icon = $('link[rel="icon"]');
    if (icon) icon.href = 'data:image/svg+xml,' + encodeURIComponent(svg);

    var meta = $('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = cs.getPropertyValue('--hero-bg').trim();
  }

  // ---------------------------------------------------------------- Essensbuchung

  var meal = {};

  function updateMeal() {
    if (!meal.form) return;
    var closed = phase !== 'before' || (MEAL.deadline && todayISO() > MEAL.deadline);
    meal.form.hidden = closed || meal.done;
    meal.doneBox.hidden = closed || !meal.done;
    meal.closedBox.hidden = !closed;
  }

  function fieldError(input, errorEl, message) {
    var target = input.closest('fieldset') || input;
    if (message) {
      target.setAttribute('aria-invalid', 'true');
      if (target === input) input.setAttribute('aria-describedby', ((input.getAttribute('aria-describedby') || '').replace(errorEl.id, '') + ' ' + errorEl.id).trim());
    } else {
      target.removeAttribute('aria-invalid');
    }
    errorEl.textContent = message || '';
    return !message;
  }

  function validateMeal() {
    var f = meal.form;
    var name = f.elements.Name;
    var email = f.elements.email;
    var privacy = f.elements.Datenschutz;
    var choice = f.querySelector('input[name="Essen"]');
    var chosen = f.querySelector('input[name="Essen"]:checked');

    var results = [
      [name, fieldError(name, $('#f-name-error'), name.value.trim() ? '' : 'Bitte gib deinen Namen an.')],
      [email, fieldError(email, $('#f-email-error'),
        !email.value.trim() ? 'Bitte gib deine E-Mail-Adresse an.' :
        !email.checkValidity() ? 'Diese E-Mail-Adresse sieht nicht ganz richtig aus.' : '')],
      [choice, fieldError(choice, $('#f-meal-error'), chosen ? '' : 'Bitte wähle ein Essen aus.')],
      [privacy, fieldError(privacy, $('#f-privacy-error'), privacy.checked ? '' : 'Bitte stimme der Verarbeitung deiner Angaben zu.')],
    ];
    var firstInvalid = results.filter(function (r) { return !r[1]; })[0];
    if (firstInvalid) firstInvalid[0].focus();
    return !firstInvalid;
  }

  function recipient() {
    try { return decodeURIComponent(new URL(meal.form.action).pathname.split('/').pop()); } catch (e) { return ''; }
  }

  function showMealError(message, data) {
    var addr = recipient();
    var lines = Object.keys(data).filter(function (k) { return k.charAt(0) !== '_'; })
      .map(function (k) { return k + ': ' + data[k]; }).join('\n');
    var mailto = addr.indexOf('@') !== -1
      ? ' Alternativ schickt eure Buchung per <a href="mailto:' + addr + '?subject=' +
        encodeURIComponent('Essensbuchung NeIn-Barcamp') + '&body=' + encodeURIComponent(lines) + '">E-Mail</a>.'
      : '';
    meal.status.className = 'form__status is-error';
    meal.status.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-alert"/></svg><span>' + message + mailto + '</span>';
  }

  function setMealLoading(on) {
    meal.submit.disabled = on;
    meal.submit.classList.toggle('is-loading', on);
    meal.submit.querySelector('.btn__label').textContent = on ? 'Wird gesendet …' : 'Mittagessen verbindlich buchen';
  }

  function initMeal() {
    meal.form = $('#meal-form');
    if (!meal.form) return;
    meal.form.noValidate = true;
    meal.doneBox = $('#meal-done');
    meal.closedBox = $('#meal-closed');
    meal.status = $('#meal-status');
    meal.submit = $('#meal-submit');
    meal.done = false;

    $$('[data-deadline-text]').forEach(function (el) {
      if (MEAL.deadline) el.textContent = formatDate(MEAL.deadline, el.getAttribute('data-deadline-text') === 'long');
    });

    if (getItem('localStorage', 'nein-meal-booked')) $('#meal-repeat').hidden = false;

    // Fehlermeldung verschwindet, sobald korrigiert wird
    meal.form.addEventListener('input', function (e) {
      var el = e.target;
      var target = el.closest('fieldset') || el;
      if (target.getAttribute('aria-invalid') === 'true') {
        target.removeAttribute('aria-invalid');
        var err = target.querySelector ? target.querySelector('.field__error') : null;
        var errEl = err || (el.parentElement && el.parentElement.querySelector('.field__error'));
        if (errEl) errEl.textContent = '';
      }
    });

    meal.form.addEventListener('submit', function (e) {
      e.preventDefault();
      meal.status.textContent = '';
      meal.status.className = 'form__status';
      if (!validateMeal()) return;

      var data = {};
      new FormData(meal.form).forEach(function (value, key) { data[key] = typeof value === 'string' ? value.trim() : value; });
      if (data._honey) return; // Spam-Bot
      data._subject = 'Essensbuchung NeIn-Barcamp: ' + data.Name;

      var url;
      try {
        url = new URL(meal.form.action);
        if (url.pathname.indexOf('/ajax/') !== 0) url.pathname = '/ajax' + url.pathname;
      } catch (err) {
        showMealError('Das Formular ist nicht richtig eingerichtet.', data);
        return;
      }

      setMealLoading(true);
      fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (json) {
            if (!res.ok || String(json.success) !== 'true') {
              var msg = json.message || ('Fehler ' + res.status);
              if (/activat/i.test(msg)) msg = 'Das Formular muss vom Orga-Team einmalig aktiviert werden (Aktivierungs-Mail im Postfach). Bitte versucht es später noch einmal.';
              throw new Error(msg);
            }
          });
        })
        .then(function () {
          setItem('localStorage', 'nein-meal-booked', '1');
          meal.done = true;
          $('#meal-done-name').textContent = data.Name.split(' ')[0];
          $('#meal-done-mail').textContent = data.email;
          updateMeal();
          meal.doneBox.focus();
        })
        .catch(function (err) {
          var reason = err && err.message && !/fetch|network/i.test(err.message) ? ' (' + err.message + ')' : '';
          showMealError('Das hat leider nicht geklappt' + reason + '. Bitte versucht es gleich noch einmal.', data);
        })
        .then(function () { setMealLoading(false); });
    });

    $('#meal-again').addEventListener('click', function () {
      meal.form.reset();
      meal.done = false;
      $('#meal-repeat').hidden = false;
      updateMeal();
      meal.form.elements.Name.focus();
    });
  }

  // ---------------------------------------------------------------- Sessionplan

  var board = { text: null, src: null, loaded: false, timer: null, tick: null, started: false };
  var TIME_RE = /(\d{1,2})[:.](\d{2})(?:\s*(?:-|–|—|bis)\s*(\d{1,2})[:.](\d{2}))?/;
  var EMPTY_RE = /^\s*(?:[-–—·.…]|tba|tbd|frei)?\s*$/i;

  function boardSource() {
    var s = designState();
    return s.example && LIVE.exampleFile ? LIVE.exampleFile : (LIVE.sessionsFile || 'sessions.md');
  }

  function isPadUrl(href) {
    try {
      var u = new URL(href, location.href);
      return (PADS.hosts || []).some(function (h) { return u.hostname === h || u.hostname.slice(-h.length - 1) === '.' + h; });
    } catch (e) { return false; }
  }

  // Hängt ein Symbol so an den Linktext, dass es nie allein in die nächste Zeile rutscht
  function glueIcon(a, iconHtml) {
    var walker = document.createTreeWalker(a, NodeFilter.SHOW_TEXT);
    var last = null;
    while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) last = walker.currentNode;
    var span = document.createElement('span');
    span.className = 'nowrap';
    if (last) {
      var text = last.nodeValue.replace(/\s+$/, '');
      var cut = text.search(/\S+$/);
      last.nodeValue = text.slice(0, cut);
      span.textContent = text.slice(cut);
      last.parentNode.insertBefore(span, last.nextSibling);
    } else {
      a.appendChild(span);
    }
    span.insertAdjacentHTML('beforeend', iconHtml);
  }

  function enhanceBoard(container) {
    var padLinks = 0;
    $$('table', container).forEach(function (table) {
      var rows = $$('tbody tr', table);
      rows.forEach(function (tr) {
        var cells = Array.prototype.slice.call(tr.children);
        if (cells[0] && TIME_RE.test(cells[0].textContent)) cells[0].classList.add('is-time');
        cells.forEach(function (td) {
          if (EMPTY_RE.test(td.textContent) && !td.querySelector('a')) {
            td.classList.add(td.textContent.trim() ? 'is-empty' : 'is-blank');
          }
        });
        // Nur die erste Raumspalte gefüllt, der Rest leer (z. B. „Mittagessen“)? → über alle Räume ziehen
        var rest = cells.slice(2);
        if (cells.length > 2 && cells[1].textContent.trim() && rest.every(function (td) { return !td.textContent.trim(); })) {
          cells[1].colSpan = cells.length - 1;
          cells[1].classList.add('is-span');
          cells[1].removeAttribute('data-label');
          rest.forEach(function (td) { td.remove(); });
        }
      });
      if (rows.some(function (tr) { return tr.children[0] && tr.children[0].classList.contains('is-time'); })) {
        table.classList.add('has-time');
      }
    });
    $$('a', container).forEach(function (a) {
      if (!isPadUrl(a.href)) return;
      padLinks++;
      a.classList.add('pad-link');
      a.setAttribute('data-pad', '');
      glueIcon(a, '<svg class="icon" aria-hidden="true"><use href="#i-pad"/></svg>');
      a.setAttribute('aria-label', a.textContent.trim() + ' – Edupad öffnen');
    });
    var hint = $('.board__hint');
    if (hint) hint.hidden = padLinks === 0;
  }

  function highlightNow() {
    var content = $('#board-content');
    if (!content) return;
    $$('.slot-badge', content).forEach(function (b) { b.remove(); });
    $$('tr.is-now, tr.is-next', content).forEach(function (tr) { tr.classList.remove('is-now', 'is-next'); });
    if (phase !== 'live') return;

    var now = minutesNow();
    $$('table', content).forEach(function (table) {
      var rows = $$('tbody tr', table).map(function (tr) {
        var m = tr.children[0] && tr.children[0].textContent.match(TIME_RE);
        if (!m) return null;
        return { tr: tr, start: +m[1] * 60 + +m[2], end: m[3] ? +m[3] * 60 + +m[4] : null };
      }).filter(Boolean);

      rows.forEach(function (r, i) {
        if (r.end === null) r.end = rows[i + 1] ? rows[i + 1].start : r.start + 45;
      });

      var current = rows.filter(function (r) { return now >= r.start && now < r.end; })[0];
      var upcoming = rows.filter(function (r) { return r.start > now && r.start - now <= 90; })[0];
      if (current) mark(current.tr, 'is-now', 'Jetzt');
      if (upcoming && upcoming !== current) mark(upcoming.tr, 'is-next', 'Gleich');
    });

    function mark(tr, cls, label) {
      tr.classList.add(cls);
      tr.children[0].insertAdjacentHTML('beforeend',
        ' <span class="slot-badge' + (cls === 'is-next' ? ' slot-badge--next' : '') + '">' + label + '</span>');
    }
  }

  function renderBoard(text) {
    var content = $('#board-content');
    if (!window.MiniMarkdown) return;
    var html = window.MiniMarkdown.render(text);
    content.innerHTML = html.trim() ? html : '<p class="board__status">Der Sessionplan ist noch leer – gleich geht’s los.</p>';
    enhanceBoard(content);
    highlightNow();
  }

  function loadBoard() {
    var src = boardSource();
    var updated = $('#board-updated');
    return fetch(src + (src.indexOf('?') === -1 ? '?' : '&') + 't=' + Date.now(), { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(function (text) {
        var changed = text !== board.text || src !== board.src;
        if (changed) {
          var wasLoaded = board.loaded;
          board.text = text;
          board.src = src;
          renderBoard(text);
          if (wasLoaded) {
            var el = $('#board');
            el.classList.remove('is-updated');
            void el.offsetWidth;
            el.classList.add('is-updated');
          }
        }
        board.loaded = true;
        if (updated) updated.textContent = 'Stand: ' + clock() + ' Uhr';
      })
      .catch(function () {
        if (!board.loaded) {
          $('#board-content').innerHTML = '<p class="board__status board__status--error">Der Sessionplan konnte gerade nicht geladen werden. Wir versuchen es gleich noch einmal.</p>';
        }
        if (updated) updated.textContent = 'Keine Verbindung – neuer Versuch läuft …';
      });
  }

  function setPresenting(on) {
    var el = $('#board');
    el.classList.toggle('is-presenting', on);
    document.body.classList.toggle('is-presenting', on);
    if (on) {
      $('#board-clock').textContent = clock();
      if (el.requestFullscreen) el.requestFullscreen().catch(function () {});
      $('#board-present-close').focus();
    } else {
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
      $('#board-present').focus();
    }
  }

  function initBoardControls() {
    $('#board-refresh').addEventListener('click', function () {
      var btn = this;
      btn.disabled = true;
      loadBoard().then(function () { btn.disabled = false; });
    });
    $('#board-present').addEventListener('click', function () { setPresenting(true); });
    $('#board-present-close').addEventListener('click', function () { setPresenting(false); });
    document.addEventListener('fullscreenchange', function () {
      if (!document.fullscreenElement && $('#board').classList.contains('is-presenting')) setPresenting(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && $('#board').classList.contains('is-presenting')) setPresenting(false);
    });

    // Klick auf ein Thema mit Pad → Pad im Fenster unten öffnen
    $('#board-content').addEventListener('click', function (e) {
      var a = e.target.closest('a[data-pad]');
      if (!a || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      if ($('#board').classList.contains('is-presenting')) setPresenting(false);
      openSessionPad(a.textContent.trim(), a.href);
    });

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && board.started) loadBoard();
    });
  }

  function startLive() {
    if (!$('#board')) return;
    if (!board.started) {
      board.started = true;
      initPads();
    }
    var src = boardSource();
    if (src !== board.src || !board.loaded) loadBoard();

    clearInterval(board.timer);
    if (phase === 'live') {
      board.timer = setInterval(function () { if (!document.hidden) loadBoard(); }, Math.max(15, LIVE.refreshSeconds || 60) * 1000);
    }
    clearInterval(board.tick);
    var lastMinute = minutesNow();
    board.tick = setInterval(function () {
      var m = minutesNow();
      var c = $('#board-clock');
      if (c) c.textContent = clock();
      if (m !== lastMinute) { lastMinute = m; highlightNow(); }
    }, 5000);
    highlightNow();
  }

  function stopLive() {
    clearInterval(board.timer);
    clearInterval(board.tick);
  }

  // ---------------------------------------------------------------- Edupads

  var pads = { current: null, session: null, consent: false, ready: false };

  function embedUrl(url) {
    if (!PADS.embedParams) return url;
    return url + (url.indexOf('?') === -1 ? '?' : '&') + PADS.embedParams;
  }

  function padList() {
    var list = (PADS.list || []).slice();
    if (pads.session) list.push(pads.session);
    return list;
  }

  function renderPadTabs() {
    var tabs = $('#pad-tabs');
    tabs.innerHTML = '';
    padList().forEach(function (pad, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pad-tab' + (pad.session ? ' pad-tab--session' : '');
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-controls', 'pad-viewer');
      b.setAttribute('aria-selected', String(pad === pads.current));
      b.tabIndex = pad === pads.current ? 0 : -1;
      b.id = 'pad-tab-' + i;
      b.innerHTML = '<span class="pad-tab__dot" aria-hidden="true"></span>';
      b.appendChild(document.createTextNode(pad.title));
      b.addEventListener('click', function () { selectPad(pad); });
      tabs.appendChild(b);
    });
  }

  function loadFrame() {
    var frame = $('#pad-frame');
    $('#pad-consent').hidden = true;
    var iframe = $('iframe', frame);
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.setAttribute('allow', 'clipboard-read; clipboard-write');
      frame.appendChild(iframe);
    }
    iframe.title = 'Edupad: ' + pads.current.title;
    iframe.src = embedUrl(pads.current.url);
  }

  function selectPad(pad) {
    if (!pad) return;
    pads.current = pad;
    $('#pad-name').textContent = pad.title;
    $('#pad-desc').textContent = pad.description || (pad.session ? 'Mitschrift zu dieser Session' : '');
    $('#pad-open').href = pad.url;
    try { $('#pad-host').textContent = new URL(pad.url).hostname; } catch (e) { /* egal */ }
    renderPadTabs();

    var viewer = $('#pad-viewer');
    viewer.setAttribute('aria-labelledby', 'pad-tab-' + padList().indexOf(pad));
    if (pads.consent || PADS.clickToLoad === false) {
      loadFrame();
    } else {
      $('#pad-consent').hidden = false;
      var old = $('#pad-frame iframe');
      if (old) old.remove();
    }
  }

  function openSessionPad(title, url) {
    pads.session = { title: title, url: url, session: true };
    selectPad(pads.session);
    $('#pads').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function setPadLarge(on) {
    var viewer = $('#pad-viewer');
    viewer.classList.toggle('is-large', on);
    document.body.classList.toggle('is-pad-large', on);
    var btn = $('#pad-full');
    btn.innerHTML = on
      ? '<svg class="icon" aria-hidden="true"><use href="#i-close"/></svg>Verkleinern'
      : '<svg class="icon" aria-hidden="true"><use href="#i-expand"/></svg>Groß';
  }

  function initPads() {
    if (pads.ready) return;
    pads.ready = true;
    pads.consent = getItem('sessionStorage', 'nein-pad-consent') === '1';

    $('#pad-consent-btn').addEventListener('click', function () {
      pads.consent = true;
      setItem('sessionStorage', 'nein-pad-consent', '1');
      loadFrame();
    });
    $('#pad-full').addEventListener('click', function () {
      setPadLarge(!$('#pad-viewer').classList.contains('is-large'));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && $('#pad-viewer').classList.contains('is-large')) setPadLarge(false);
    });
    // Pfeiltasten in der Tab-Leiste
    $('#pad-tabs').addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var list = padList();
      var i = list.indexOf(pads.current);
      var next = list[(i + (e.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length];
      selectPad(next);
      var tab = $('#pad-tab-' + list.indexOf(next));
      if (tab) tab.focus();
    });

    if (padList().length) {
      selectPad(padList()[0]);
    } else {
      $('#pad-viewer').hidden = true;
    }
  }

  // ---------------------------------------------------------------- Start

  function init() {
    if ($('.nav-toggle')) initNav();
    initMeal();
    if ($('#board')) initBoardControls();
    applyPhase();
    updateBrandAssets();

    // Seite über Mitternacht offen gelassen? Phase regelmäßig prüfen.
    setInterval(function () { if (computePhase() !== phase) applyPhase(); }, 60 * 1000);

    // Signale aus dem Design-Panel
    document.addEventListener('barcamp:design', function (e) {
      var detail = e.detail || {};
      if (detail.theme) updateBrandAssets();
      if (detail.phase) applyPhase();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
