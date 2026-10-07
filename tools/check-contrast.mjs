#!/usr/bin/env node
// Prüft alle Farbpaletten in assets/css/themes.css auf ausreichenden Kontrast (WCAG 2.x).
// Aufruf: node tools/check-contrast.mjs
// Neue Palette ergänzt? Einfach erneut ausführen – jede Zeile mit ✗ muss nachgebessert werden.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const css = readFileSync(fileURLToPath(new URL('../assets/css/themes.css', import.meta.url)), 'utf8');

const rgb = (hex) => {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const lum = (hex) => {
  const [r, g, b] = rgb(hex).map((v) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

// [Vordergrund, Hintergrund, Mindestwert, Beschreibung]
const checks = [
  ['--ink', '--bg', 7, 'Text auf Seite'],
  ['--ink', '--bg-alt', 7, 'Text auf Wechselfläche'],
  ['--ink-muted', '--bg', 4.5, 'Nebentext auf Seite'],
  ['--ink-muted', '--bg-alt', 4.5, 'Nebentext auf Wechselfläche'],
  ['--ink-muted', '--surface', 4.5, 'Nebentext auf Karte'],
  ['--brand-ink', '--bg', 4.5, 'Link auf Seite'],
  ['--brand-ink', '--bg-alt', 4.5, 'Link auf Wechselfläche'],
  ['--brand-ink', '--surface', 4.5, 'Link auf Karte'],
  ['--on-brand', '--brand', 4.5, 'Button-Text'],
  ['--on-accent', '--accent', 4.5, 'Text auf Akzent'],
  ['--hero-ink', '--hero-bg', 7, 'Kopfbereich Text'],
  ['--hero-muted', '--hero-bg', 4.5, 'Kopfbereich Nebentext'],
  ['--hero-cta-ink', '--hero-cta-bg', 4.5, 'Kopfbereich Button'],
  ['--hero-focus', '--hero-bg', 3, 'Kopfbereich Fokusrahmen'],
  ['--logo-1', '--hero-bg', 3, 'Logo-Schriftzug Anfang (große Schrift)'],
  ['--logo-2', '--hero-bg', 3, 'Logo-Schriftzug Ende (große Schrift)'],
  ['--band-ink', '--band-bg', 4.5, 'Vereins-Band Text'],
  ['--band-muted', '--band-bg', 4.5, 'Vereins-Band Nebentext'],
  ['--band-cta-ink', '--band-accent', 4.5, 'Vereins-Band Button'],
  ['--footer-ink', '--footer-bg', 7, 'Fußzeile Text'],
  ['--footer-muted', '--footer-bg', 4.5, 'Fußzeile Nebentext'],
  ['--focus', '--bg', 3, 'Fokusrahmen'],
  ['--on-p1', '--p1', 3, 'Symbol auf Farbe 1'],
  ['--on-p2', '--p2', 3, 'Symbol auf Farbe 2'],
  ['--on-p3', '--p3', 3, 'Symbol auf Farbe 3'],
  ['--on-p4', '--p4', 3, 'Symbol auf Farbe 4'],
];

const blocks = [...css.matchAll(/\[data-palette="(\d+)"\]\s*\{([^}]*)\}/g)];
let failures = 0;

for (const [, id, body] of blocks) {
  const vars = Object.fromEntries(
    [...body.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map(([, k, v]) => [k, v])
  );
  const rows = [];
  for (const [fg, bg, min, label] of checks) {
    if (!vars[fg] || !vars[bg]) {
      rows.push(`  ? ${label}: ${fg} oder ${bg} fehlt`);
      failures++;
      continue;
    }
    const ratio = contrast(vars[fg], vars[bg]);
    const ok = ratio >= min;
    if (!ok) failures++;
    rows.push(`  ${ok ? '✓' : '✗'} ${ratio.toFixed(2).padStart(5)} (min ${min})  ${label}  ${vars[fg]} auf ${vars[bg]}`);
  }
  console.log(`Palette ${id}`);
  console.log(rows.join('\n'));
}

console.log(failures ? `\n${failures} Problem(e) gefunden.` : '\nAlle Paletten bestehen die Prüfung.');
process.exit(failures ? 1 : 0);
