# NeIn-Barcamp 2026

Website zum Barcamp am **Donnerstag, 5. November 2026**: Rahmeninfos und Ablauf –
und am Barcamp-Tag selbst Sessionplan und ein Pad pro Session.

Reines HTML/CSS/JavaScript ohne Build-Schritt. Läuft direkt auf GitHub Pages.

---

## Veröffentlichen (GitHub Pages)

1. Auf GitHub: **Settings → Pages → Build and deployment**
2. *Source*: „Deploy from a branch“, Branch auswählen, Ordner `/ (root)` → **Save**
3. Nach ca. einer Minute ist die Seite unter `https://<nutzer>.github.io/NeIn-Barcamp-Dashboard/` erreichbar.

Die leere Datei `.nojekyll` sorgt dafür, dass GitHub die Markdown-Dateien unverändert ausliefert.
Ohne sie würde der Sessionplan nicht funktionieren.

**Lokal ansehen:** im Projektordner `python3 -m http.server` ausführen und `http://localhost:8000` öffnen.
Ein Doppelklick auf `index.html` reicht nicht, weil der Browser dann den Sessionplan nicht laden darf.

---

## Design-Werkstatt (Farben & Schriften testen)

Die Design-Werkstatt ist für Besucher ausgeblendet (`design.panel: false` in `config.js`). Das Orga-Team
öffnet die Seite einmal mit **`…/index.html?design=1`**; danach sitzt unten rechts der Knopf **„Design“**
(bleibt im Browser gespeichert, aus mit `?design=0`). Damit lassen sich ausprobieren:

| | |
|---|---|
| **7 Farbpaletten** | eure Paletten 1–7, jeweils fest in Rollen übersetzt (Hintergrund, Text, Buttons …) und auf Lesbarkeit geprüft |
| **7 Schriftkombinationen** | Überschrift / Fließtext / Akzentschrift, siehe unten |
| **Seitenzustand** | „Vor dem Barcamp“, „Barcamp-Tag (live)“, „Nach dem Barcamp“ – so seht ihr Sessionplan, Pads und Rückblick schon jetzt. Gilt nur im aktuellen Tab. |
| **Beispiel-Sessionplan** | zeigt bei simuliertem Seitenzustand `sessions.beispiel.md` statt der echten `sessions.md`. Nach echtem Datum wird immer `sessions.md` geladen. |
| **Platzhalter markieren** | rahmt alle Texte ein, die noch angepasst werden müssen |
| **Link kopieren** | Link zur aktuellen Kombination, z. B. für den Team-Chat (`?palette=3&font=editorial`) |
| **CSS-Variablen kopieren** | alle Farb- und Schriftwerte als CSS, z. B. für neueinformatik.de |

Tastenkürzel: **1–7** wechselt die Palette, **Umschalt + 1–7** die Schrift.
Die Auswahl wird im eigenen Browser gespeichert; andere Besucher sehen die Standardeinstellung.

### Schriftkombinationen

| Nr. | Name | Überschrift | Fließtext | Akzent (Mono) | Charakter |
|---|---|---|---|---|---|
| 1 | Werkstatt | Bricolage Grotesque | Figtree | JetBrains Mono | lebendig, modern, freundlich |
| 2 | Informatik | Space Grotesk | Inter | Space Mono | technisch, klar |
| 3 | Lesefreundlich | Lexend | Lexend | Red Hat Mono | für flüssiges Lesen entwickelt |
| 4 | Barrierearm | Atkinson Hyperlegible Next | ← | Atkinson Hyperlegible Mono | maximal unterscheidbare Zeichen |
| 5 | Editorial | Fraunces | Source Sans 3 | IBM Plex Mono | warm, hochwertig |
| 6 | Sachlich | IBM Plex Sans | ← | IBM Plex Mono | nüchtern, institutionell |
| 7 | Code-Charme | Recursive (casual) | Recursive (linear) | Recursive Mono | verspielt mit Programmier-Flair |

Alle Schriften liegen in `assets/fonts/` und werden **nicht** von Google geladen (DSGVO).
Das große „I“ in **NeIn** steht immer in der Mono-Schrift – sonst sieht es in Groteskschriften
aus wie ein kleines l („Neln“).

### Festgelegt: Palette 4 „Schulgarten“ + Schrift „Werkstatt“

Das ist der Standard für alle Besucher (`assets/js/config.js`). Wer vorher im Panel etwas anderes
ausprobiert hatte, bekommt beim nächsten Besuch automatisch den neuen Standard.

Das Panel ist für Besucher aus (`panel: false`) und für euch über `…/index.html?design=1` erreichbar.

Wer später eine Palette ändert oder ergänzt, prüft die Kontraste mit `node tools/check-contrast.mjs`.

---

## Vor der Veröffentlichung anpassen

Mit **„Platzhalter markieren“** im Design-Panel seht ihr alle Stellen. Im Einzelnen:

- **`index.html`**: Uhrzeiten, Teilnahmekosten, Zeitplan im Abschnitt „Ablauf“
  (Ort steht fest: Johanna-Moosdorf-Schule, Philipp-Rosenthal-Straße 61–63, 04103 Leipzig)
- **Impressum und Datenschutz** verlinken auf `https://neueinformatik.de/impressum` bzw. `https://neueinformatik.de/datenschutz` (Footer in `index.html`). Die Texte werden dort gepflegt, nicht im Repo.
- **Titelfoto**: Bild als `assets/img/titelbild.jpg` ablegen (Querformat, ca. 1600 × 1200 px).
  Es ersetzt automatisch die Illustration im Kopfbereich.

Die Seite spricht Besucher mit „ihr“ an.

---

## Logo

Das Barcamp-Logo ist in der Seite nachgebaut, nicht als Bild eingefügt: Die Bildmarke (Sprechblase aus
Nullen und Einsen + Sprechblase aus einem Netzwerk) ist ein SVG direkt in `index.html`, „Barcamp“ und die
Unterzeile sind echter Text. Dadurch übernimmt das Logo automatisch die Farben der Palette
(`--mark-1 … --mark-3`, `--logo-1/--logo-2` in `themes.css`) und die Überschriftenschrift.

- `assets/img/logo-barcamp.png` – das Logo in den Website-Farben, transparenter Hintergrund (z. B. für Folien, neueinformatik.de)
- `assets/img/favicon.svg` – kleine Variante („01“-Sprechblase + Netzwerk), auch oben links in der Kopfzeile

---

## Die drei Phasen der Seite

Die Seite stellt sich nach dem Datum (deutsche Zeit) selbst um – niemand muss etwas umschalten:

| Zeitraum | Seite |
|---|---|
| bis 4.11.2026 | **Vorbereitung**: Countdown, Infos, Barcamp-Format, Ablauf |
| 5.11.2026, ab 0:00 Uhr | **Barcamp-Tag**: Sessionplan und Pads ganz oben, Infos darunter |
| ab 6.11.2026 | **Rückblick**: „Danke fürs Mitmachen“, Sessionplan und Pads zum Nachlesen, Knopf „Feedback geben“ (öffnet das Feedback-Pad). Infos, Format und Ablauf sind ausgeblendet. |

## Am Barcamp-Tag

### Sessionplan live bearbeiten

Datei **`sessions.md`** auf github.com öffnen → Stift-Symbol → bearbeiten → **Commit changes**.
Das geht auch vom Handy aus. Nach ca. einer Minute ist die Änderung online, und die Seite lädt den
Plan jede Minute von selbst neu. Niemand muss etwas neu laden.

```markdown
| Zeit          | Raum A | Raum B | Raum C |
| ------------- | ------ | ------ | ------ |
| 10:15 – 11:00 | Python im Anfangsunterricht<br>_Workshop_ | KI & Schule | · |
| 12:30 – 13:00 | _Mittagessen_ | | |
```

- Erste Spalte = Uhrzeit. Die laufende Runde wird als **„Jetzt“** markiert, die nächste als **„Gleich“**.
- Ist nur die erste Raumspalte gefüllt (z. B. „Mittagessen“), läuft der Eintrag über alle Räume.
- Jedes Thema wird automatisch mit seinem Pad verlinkt und öffnet es per Klick direkt auf der Seite.
- **Beamer-Ansicht**: Knopf über dem Plan. Zeigt den Plan bildschirmfüllend mit Uhr, z. B. für den Eingangsbereich.

### Pads (yopad.eu)

**Jede Session bekommt automatisch ihr eigenes Pad.** Ihr tragt in `sessions.md` nur das Thema ein –
die Seite verlinkt es selbst. Der Pad-Name ergibt sich aus Uhrzeit und Raum:

| Zelle im Sessionplan | Pad |
|---|---|
| 10:15, Spalte „Raum A“ | `https://yopad.eu/p/NeIn-Barcamp-2026-1015-Raum-A-365days` |
| 13:00, Spalte „Raum D (Informatikraum)“ | `https://yopad.eu/p/NeIn-Barcamp-2026-1300-Raum-D-Informatikraum-365days` |

yopad.eu legt das Pad beim ersten Aufruf selbst an; `-365days` heißt, es bleibt ein Jahr erhalten.
Einstellbar in `config.js` unter `pads.sessionPads` (Präfix, Endung, an/aus).

- Wird eine Session nachträglich in einen anderen Raum oder Slot verschoben, zeigt die Zelle auf das Pad
  des neuen Platzes. Soll ein Pad fest an einer Session hängen, den Link selbst in die Zelle schreiben:
  `[Python im Anfangsunterricht](https://yopad.eu/p/NeIn-Barcamp-2026-1015-Raum-A-365days)`.
- Allgemeine Pads (Ideen, Links, Feedback) stehen in `config.js` unter `pads.list`.
- Pads werden erst nach einem Klick auf „Pads anzeigen“ eingebettet (datenschutzfreundlich).
  Jedes Pad lässt sich auch „In neuem Tab öffnen“, falls yopad.eu das Einbetten blockiert – bitte vorher testen.

---

## Dateien

```
index.html               Hauptseite
sessions.md              Sessionplan – wird am Tag live bearbeitet
sessions.beispiel.md     Beispiel für die Vorschau
assets/js/config.js      ← alle Einstellungen (Datum, Pads, Design)
assets/js/main.js        Seitenlogik (Phasen, Sessionplan, Pads)
assets/js/markdown.js    kleiner Markdown-Renderer für den Sessionplan
assets/js/design-panel.js + assets/css/design-panel.css   Design-Werkstatt (nur Vorbereitung)
assets/css/themes.css    die 7 Farbpaletten
assets/css/fonts.css     Schriften und Schriftkombinationen
assets/css/style.css     Layout
assets/fonts/            Schriftdateien + Lizenzen (SIL OFL)
tools/check-contrast.mjs Kontrastprüfung aller Paletten
```
