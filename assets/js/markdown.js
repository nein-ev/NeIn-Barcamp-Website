/* ==========================================================================
   Mini-Markdown – rendert den Sessionplan (sessions.md).
   Unterstützt: Überschriften, Absätze, Listen, Zitate, Trennlinien, Tabellen
   (inkl. Ausrichtung), **fett**, *kursiv*, ~~durchgestrichen~~, `Code`,
   [Links](https://…), nackte URLs, <br> und HTML-Kommentare (werden entfernt).
   Jedes andere HTML wird maskiert – der Inhalt kann also nichts „kaputt“ machen.
   ========================================================================== */
(function (global) {
  'use strict';

  var HOLD = '\u0000';

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function safeUrl(url) {
    var u = url.trim();
    // Nur ungefährliche Protokolle zulassen (kein javascript: o. Ä.)
    if (/^[a-z][a-z0-9+.-]*:/i.test(u) && !/^(https?|mailto|tel):/i.test(u)) return '#';
    return u;
  }

  function link(url, html) {
    var href = safeUrl(url);
    var external = /^https?:/i.test(href);
    return '<a href="' + esc(href) + '"' + (external ? ' target="_blank" rel="noopener"' : '') + '>' + html + '</a>';
  }

  function emphasis(s) {
    return s
      .replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, '<strong>$1</strong>')
      .replace(/__(?=\S)([\s\S]*?\S)__/g, '<strong>$1</strong>')
      .replace(/\*(?=\S)([\s\S]*?\S)\*/g, '<em>$1</em>')
      .replace(/(^|[^\w])_(?=\S)([\s\S]*?\S)_(?!\w)/g, '$1<em>$2</em>')
      .replace(/~~(?=\S)([\s\S]*?\S)~~/g, '<del>$1</del>');
  }

  function inline(src) {
    var slots = [];
    function keep(html) {
      slots.push(html);
      return HOLD + (slots.length - 1) + HOLD;
    }

    var s = String(src);
    s = s.replace(/`([^`]+)`/g, function (_, code) { return keep('<code>' + esc(code) + '</code>'); });
    s = s.replace(/<br\s*\/?>/gi, function () { return keep('<br>'); });
    s = s.replace(/\[([^\]]+)\]\(\s*<?([^()\s>]+)>?(?:\s+"[^"]*")?\s*\)/g, function (_, text, url) {
      return keep(link(url, emphasis(esc(text))));
    });
    s = s.replace(/<((?:https?:\/\/|mailto:)[^>\s]+)>/g, function (_, url) {
      return keep(link(url, esc(url.replace(/^mailto:/, ''))));
    });
    s = s.replace(/https?:\/\/[^\s<>()]*[^\s<>().,;:!?'"]/g, function (url) {
      return keep(link(url, esc(url.replace(/^https?:\/\//, ''))));
    });
    s = emphasis(esc(s));

    var pattern = new RegExp(HOLD + '(\\d+)' + HOLD, 'g');
    for (var guard = 0; s.indexOf(HOLD) !== -1 && guard < 5; guard++) {
      s = s.replace(pattern, function (_, i) { return slots[+i]; });
    }
    return s;
  }

  // ---------------------------------------------------------------- Tabellen

  function splitRow(line) {
    var row = line.trim().replace(/\\\|/g, '\u0001');
    if (row.charAt(0) === '|') row = row.slice(1);
    if (row.charAt(row.length - 1) === '|') row = row.slice(0, -1);
    return row.split('|').map(function (cell) {
      return cell.trim().replace(/\u0001/g, '|');
    });
  }

  function isSeparator(line) {
    if (!line || line.indexOf('-') === -1) return false;
    var cells = splitRow(line);
    return cells.length > 0 && cells.every(function (c) { return /^:?-+:?$/.test(c); });
  }

  function alignOf(cell) {
    var left = cell.charAt(0) === ':';
    var right = cell.charAt(cell.length - 1) === ':';
    if (left && right) return 'center';
    if (right) return 'right';
    return '';
  }

  function plain(html) {
    return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
  }

  function table(headerLine, sepLine, bodyLines) {
    var head = splitRow(headerLine);
    var aligns = splitRow(sepLine).map(alignOf);
    var cols = head.length;
    var style = function (i) { return aligns[i] ? ' style="text-align:' + aligns[i] + '"' : ''; };
    var headHtml = head.map(function (h) { return inline(h); });

    var html = '<div class="table-wrap"><table><thead><tr>';
    headHtml.forEach(function (h, i) { html += '<th scope="col"' + style(i) + '>' + h + '</th>'; });
    html += '</tr></thead><tbody>';

    bodyLines.forEach(function (line) {
      var cells = splitRow(line);
      html += '<tr>';
      for (var i = 0; i < cols; i++) {
        var label = plain(headHtml[i] || '');
        html += '<td' + style(i) + (label ? ' data-label="' + esc(label) + '"' : '') + '>' + inline(cells[i] || '') + '</td>';
      }
      html += '</tr>';
    });

    return html + '</tbody></table></div>';
  }

  // ---------------------------------------------------------------- Blöcke

  var RE = {
    heading: /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/,
    hr: /^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/,
    quote: /^\s{0,3}>\s?/,
    ul: /^\s{0,3}[-*+]\s+/,
    ol: /^\s{0,3}\d+[.)]\s+/,
  };

  function startsBlock(line, next) {
    return RE.heading.test(line) || RE.hr.test(line) || RE.quote.test(line) ||
      RE.ul.test(line) || RE.ol.test(line) || (line.indexOf('|') !== -1 && isSeparator(next));
  }

  function render(md) {
    var text = String(md || '').replace(/\r\n?/g, '\n').replace(/<!--[\s\S]*?-->/g, '');
    var lines = text.split('\n');
    var out = [];
    var i = 0;

    while (i < lines.length) {
      var line = lines[i];
      var m;

      if (!line.trim()) { i++; continue; }

      if ((m = line.match(RE.heading))) {
        var level = m[1].length;
        out.push('<h' + level + '>' + inline(m[2]) + '</h' + level + '>');
        i++;
        continue;
      }

      if (RE.hr.test(line)) { out.push('<hr>'); i++; continue; }

      if (line.indexOf('|') !== -1 && isSeparator(lines[i + 1])) {
        var header = line;
        var sep = lines[i + 1];
        var body = [];
        i += 2;
        while (i < lines.length && lines[i].trim() && lines[i].indexOf('|') !== -1) {
          body.push(lines[i]);
          i++;
        }
        out.push(table(header, sep, body));
        continue;
      }

      if (RE.quote.test(line)) {
        var quoted = [];
        while (i < lines.length && RE.quote.test(lines[i])) {
          quoted.push(lines[i].replace(RE.quote, ''));
          i++;
        }
        out.push('<blockquote>' + render(quoted.join('\n')) + '</blockquote>');
        continue;
      }

      if (RE.ul.test(line) || RE.ol.test(line)) {
        var ordered = RE.ol.test(line);
        var itemRe = ordered ? RE.ol : RE.ul;
        var items = [];
        while (i < lines.length && lines[i].trim()) {
          if (itemRe.test(lines[i])) {
            items.push(lines[i].replace(itemRe, ''));
          } else if (/^\s+\S/.test(lines[i]) && items.length) {
            items[items.length - 1] += ' ' + lines[i].trim();
          } else {
            break;
          }
          i++;
        }
        var tag = ordered ? 'ol' : 'ul';
        out.push('<' + tag + '>' + items.map(function (it) { return '<li>' + inline(it) + '</li>'; }).join('') + '</' + tag + '>');
        continue;
      }

      var para = [];
      while (i < lines.length && lines[i].trim() && !(para.length && startsBlock(lines[i], lines[i + 1]))) {
        para.push(lines[i].trim());
        i++;
      }
      out.push('<p>' + inline(para.join('\n')).replace(/\n/g, ' ') + '</p>');
    }

    return out.join('\n');
  }

  global.MiniMarkdown = { render: render, inline: inline };
})(window);
