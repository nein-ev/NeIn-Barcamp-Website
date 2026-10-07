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
    // Ab diesem Tag (00:00 Uhr) erscheinen Sessionplan und Edupads auf der Seite.
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
    hosts: ['edupad.ch'],
    // Optional an die eingebettete Pad-Adresse angehängt (Etherpad-Parameter).
    embedParams: 'showChat=false&showLineNumbers=false',
    // Allgemeine Pads – BEISPIEL-LINKS, bitte durch eure echten Pads ersetzen.
    // Pads zu einzelnen Sessions verlinkt ihr einfach im Sessionplan (sessions.md).
    list: [
      {
        title: 'Sessionplanung & Ideen',
        description: 'Alle Sessionvorschläge, auch die, die heute keinen Platz gefunden haben.',
        url: 'https://edupad.ch/p/nein-barcamp-2026-ideen',
      },
      {
        title: 'Linksammlung',
        description: 'Tools, Material und Links, die in den Sessions genannt wurden.',
        url: 'https://edupad.ch/p/nein-barcamp-2026-links',
      },
      {
        title: 'Feedback',
        description: 'Was nehmt ihr mit? Was wünscht ihr euch fürs nächste Mal?',
        url: 'https://edupad.ch/p/nein-barcamp-2026-feedback',
      },
    ],
  },

  meal: {
    // Letzter Tag, an dem das Mittagessen gebucht werden kann (einschließlich).
    // Danach wird das Formular automatisch geschlossen.
    // Die Empfänger-Adresse steht im Formular in index.html (action="…").
    deadline: '2026-10-29',
  },

  design: {
    // true = Design-Panel (Farben & Schriften testen) ist für alle sichtbar.
    // false = Besucher sehen es nicht; das Orga-Team öffnet die Seite einmal
    // mit ?design=1 in der Adresse (bleibt im Browser gespeichert, aus mit ?design=0).
    // Sobald Farben und Schrift feststehen: auf false setzen.
    panel: true,
    // Standard-Palette (1–7) und Schriftkombination für alle Besucher.
    // Entschieden: 4 „Schulgarten“ + „Werkstatt“.
    palette: '4',
    font: 'werkstatt',
  },
};
