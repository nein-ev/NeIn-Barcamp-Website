/* ==========================================================================
   Konfiguration – hier wird alles eingestellt, was sich ändern kann.
   Texte der Seite stehen direkt in index.html.
   ========================================================================== */

window.BARCAMP_CONFIG = {
  event: {
    // Tag der Fortbildung (JJJJ-MM-TT). Steuert Countdown und Live-Bereich.
    date: '2026-11-05',
    timeZone: 'Europe/Berlin',
  },

  live: {
    // Ab diesem Tag (00:00 Uhr) erscheinen Sessionplan und Pads auf der Seite.
    from: '2026-11-05',
    // Bis einschließlich diesem Tag bleiben sie sichtbar. null = dauerhaft
    // (nach dem Barcamp als „Rückblick“ zur Dokumentation).
    until: null,
    // Markdown-Datei mit dem Sessionplan (wird am Tag live bearbeitet).
    sessionsFile: 'sessions.md',
    // Beispiel-Sessionplan für die Vorschau im Design-Panel.
    exampleFile: 'sessions.beispiel.md',
    // Wie oft der Sessionplan automatisch neu geladen wird (Sekunden).
    refreshSeconds: 60,
  },

  pads: {
    // true = Pads werden erst nach einem Klick eingebettet (datenschutzfreundlich:
    // vorher wird keine Verbindung zum Pad-Anbieter aufgebaut).
    clickToLoad: true,
    // Links auf diese Domains im Sessionplan öffnen sich im Pad-Fenster der Seite.
    hosts: ['yopad.eu'],
    // Jede Session im Sessionplan bekommt automatisch ein eigenes Pad.
    // Adresse: base + prefix + '-' + Uhrzeit + '-' + Raum + suffix, z. B.
    //   https://yopad.eu/p/NeIn-Barcamp-2026-1015-Raum-A-365days
    // („365days“ = das Pad bleibt bei yopad.eu ein Jahr lang erhalten.)
    // Steht in einer Zelle schon ein Link, wird dieser verwendet.
    sessionPads: {
      enabled: true,
      base: 'https://yopad.eu/p/',
      prefix: 'NeIn-Barcamp-2026',
      suffix: '-365days',
    },
    // Optional an die eingebettete Pad-Adresse angehängt (Etherpad-Parameter).
    embedParams: 'showChat=false&showLineNumbers=false',
    // Allgemeine Pads (yopad.eu legt ein Pad beim ersten Aufruf automatisch an).
    // Pads zu einzelnen Sessions verlinkt ihr einfach im Sessionplan (sessions.md).
    list: [
      {
        title: 'Sessionplanung & Ideen',
        description: 'Alle Sessionvorschläge, auch die, die heute keinen Platz gefunden haben.',
        url: 'https://yopad.eu/p/NeIn-Barcamp-2026-Ideen-365days',
      },
      {
        title: 'Linksammlung',
        description: 'Tools, Material und Links, die in den Sessions genannt wurden.',
        url: 'https://yopad.eu/p/NeIn-Barcamp-2026-Links-365days',
      },
      {
        title: 'Feedback',
        description: 'Was nehmt ihr mit? Was wünscht ihr euch fürs nächste Mal?',
        url: 'https://yopad.eu/p/NeIn-Barcamp-2026-Feedback-365days',
      },
    ],
  },

  design: {
    // true = Design-Panel (Farben & Schriften testen) ist für alle sichtbar.
    // false = Besucher sehen es nicht; das Orga-Team öffnet die Seite einmal
    // mit ?design=1 in der Adresse (bleibt im Browser gespeichert, aus mit ?design=0).
    // Sobald Farben und Schrift feststehen: auf false setzen.
    panel: false,
    // Standard-Palette (1–7) und Schriftkombination für alle Besucher.
    // Entschieden: 4 „Schulgarten“ + „Werkstatt“.
    palette: '4',
    font: 'werkstatt',
  },
};
