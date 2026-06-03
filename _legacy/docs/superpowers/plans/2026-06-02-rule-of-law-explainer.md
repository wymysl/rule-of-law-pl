# Rule of Law Explainer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual (EN/PL), static, data-driven web explainer of the Polish Rule of Law crisis that presents ~20 ECtHR/CJEU judgments through six switchable lenses (Map, Theme, Timeline, Court, All, Execution), with an Apple-style look, switchable themes, glossary tooltips, official links, and a mandatory disclaimer.

**Architecture:** A zero-runtime-dependency static site. All content lives in `data/` modules as bilingual `{en,pl}` objects. A small render core reads the active case set and delegates to one independent lens module per view. JS is authored as native ES modules (`<script type="module">`) so it runs in the browser with no build step *and* is unit-testable under Vitest. The same shared case set feeds every lens, so adding a case = editing one record.

**Tech Stack:** HTML5, CSS3 (custom properties for theming), vanilla JavaScript ES modules. Dev-only: Vitest + jsdom for unit tests. Hosting: GitHub Pages / Netlify (serves static files as-is).

**Scope:** This plan delivers the working application with a *seed dataset* (the ~18 cases prototyped during design, English-complete, 3 fully bilingual to exercise the language toggle). Full research/drafting of all cases, complete Polish translation, and owner accuracy-review are a **follow-on content workstream** (see "Out of scope / follow-on" at the end). Every additional case is just another data record — no code changes.

---

## File Structure

```
index.html                 # shell: hero, primer mount, lens switcher, stage, detail mount, disclaimer
css/
  tokens.css               # theme custom properties (Nocturne/Obsidian/Daylight/Aurora) + base
  layout.css               # hero, primer, switcher, footer, responsive
  constellation.css        # nodes, edges, labels, axis, idle motion, reduced-motion
  detail.css               # case card glance/deep, glossary tooltip, disclaimer notice
js/
  app.js                   # entry: load data, build state, wire toggles + switcher, initial render
  i18n.js                  # t(value, lang) resolver with en->pl fallback; lang state
  data.js                  # assembles + validates the dataset from data/ modules
  glossary.js              # term lookup + tooltip element builder
  nodes.js                 # node element creation, place(), idle float, selection
  detail.js                # case detail card: glance + deep layer render, open/close
  lenses/
    theme.js               # group-by-theme layout
    court.js               # CJEU vs ECtHR layout
    timeline.js            # axis + year scale + event markers + node placement
    list.js                # "All": filterable/searchable list (accessible Map equivalent)
    map.js                 # force-directed graph: adjacency, layout, edges, hover highlight
    execution.js           # status board: counts, root-cause banner, grouped rows
  switcher.js              # lens registry + switch logic; calls clear()/render() on lenses
data/
  cases.js                 # export const CASES = [ ... ]
  themes.js                # export const THEMES = [ ... ]
  events.js                # export const EVENTS = [ ... ]
  glossary.js              # export const GLOSSARY = { ... }
  ui.js                    # export const UI = { ... }  (interface strings)
  primer.js                # export const PRIMER = { ... } (intro explainers + disclaimer text)
tests/
  i18n.test.js
  data.test.js
  glossary.test.js
  lenses.test.js           # pure layout/scale/adjacency/filter/count functions
package.json               # vitest devDependency + "test" script
vitest.config.js
README.md                  # how to run, test, deploy
```

**Design boundaries:** each lens module exports the same interface — `clear(ctx)` and `render(ctx)` where `ctx` carries `{ cases, nodes, stage, lang, theme, helpers }`. Pure geometry/logic (scales, grouping, adjacency, filtering, counts) is exported separately from DOM mutation so it can be unit-tested without a browser.

---

## Task 1: Scaffold project + dev test harness

**Files:**
- Create: `package.json`, `vitest.config.js`, `index.html`, `css/tokens.css`, `README.md`
- Test: `tests/smoke.test.js`

- [ ] **Step 1: Write the failing smoke test**

```js
// tests/smoke.test.js
import { describe, it, expect } from 'vitest';

describe('test harness', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 2: Create package.json**

```json
{
  "name": "rule-of-law-explainer",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "serve": "python3 -m http.server 8080"
  },
  "devDependencies": {
    "vitest": "^2.1.0",
    "jsdom": "^25.0.0"
  }
}
```

- [ ] **Step 3: Create vitest.config.js**

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.js'],
  },
});
```

- [ ] **Step 4: Install and run the smoke test**

Run: `npm install && npm test`
Expected: PASS (1 test). `node_modules/` is already gitignored.

- [ ] **Step 5: Create the HTML shell**

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rule of Law in Poland — the cases, explained</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/layout.css">
  <link rel="stylesheet" href="css/constellation.css">
  <link rel="stylesheet" href="css/detail.css">
</head>
<body data-theme="nocturne" data-lang="en">
  <header id="hero"></header>
  <section id="primer"></section>

  <nav id="controls">
    <div id="lens-tabs" role="tablist" aria-label="View"></div>
    <div id="toggles">
      <div id="lang-toggle"></div>
      <div id="theme-swatches"></div>
    </div>
  </nav>

  <div id="scroller"><div id="stage"><svg id="edges"></svg><div id="axis"></div></div></div>

  <div id="detail" aria-live="polite"></div>
  <footer id="disclaimer"></footer>
  <div id="first-visit" hidden></div>

  <script type="module" src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 6: Create css/tokens.css (theme variables + base)**

Port the four theme variable blocks and grain overlay from the validated prototype `dots-v4.html` (themes Nocturne/Obsidian/Daylight/Aurora). Include `:root` base typography and a `@media (prefers-reduced-motion: reduce)` block that sets `--anim: 0` and `body{transition:none}`.

```css
/* css/tokens.css */
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',sans-serif;min-height:100vh;color:var(--text);background:var(--bg);
     background-attachment:fixed;-webkit-font-smoothing:antialiased;transition:background .8s,color .8s}
body[data-theme="nocturne"]{
  --bg:radial-gradient(90% 70% at 20% 0%,rgba(45,95,180,.16),transparent 55%),radial-gradient(80% 70% at 85% 6%,rgba(180,70,60,.10),transparent 55%),linear-gradient(180deg,#080b13,#06080e 60%,#040509);
  --text:#e9edf4;--sub:#7a8499;--cj1:#8fb8ee;--cj2:#3f73c4;--ec1:#eea297;--ec2:#cc6155;--ring:rgba(255,255,255,.18);
  --edge:rgba(150,180,230,.16);--edgehl:rgba(180,205,255,.65);--tick:#6c7689;--event:#b3a484;--dia:#d9b06a;
  --card:linear-gradient(160deg,rgba(24,28,36,.94),rgba(12,14,20,.94));--cardbd:rgba(255,255,255,.09);
  --pillC:#9fc0ee;--pillE:#eea297;--menu:rgba(255,255,255,.04);--menubd:rgba(255,255,255,.08);--grain:.035}
body[data-theme="obsidian"]{
  --bg:linear-gradient(180deg,#0c0c0d,#070708);
  --text:#ececed;--sub:#7d7d80;--cj1:#c3ccda;--cj2:#7d8aa0;--ec1:#e7c89a;--ec2:#bf9a63;--ring:rgba(255,255,255,.14);
  --edge:rgba(255,255,255,.10);--edgehl:rgba(255,255,255,.5);--tick:#6a6a6d;--event:#9a9077;--dia:#c2a36e;
  --card:linear-gradient(160deg,rgba(22,22,24,.95),rgba(12,12,13,.95));--cardbd:rgba(255,255,255,.08);
  --pillC:#c3ccda;--pillE:#e7c89a;--menu:rgba(255,255,255,.04);--menubd:rgba(255,255,255,.07);--grain:.04}
body[data-theme="daylight"]{
  --bg:radial-gradient(90% 70% at 18% 0%,rgba(60,110,200,.10),transparent 55%),linear-gradient(180deg,#f4f2ec,#eceae3);
  --text:#1b1e26;--sub:#6a7180;--cj1:#5b8fdc;--cj2:#2f6fd0;--ec1:#dd7866;--ec2:#c2553f;--ring:rgba(20,30,60,.14);
  --edge:rgba(40,55,90,.14);--edgehl:rgba(40,80,160,.55);--tick:#9098a6;--event:#8a7d5e;--dia:#c2904a;
  --card:linear-gradient(160deg,rgba(255,255,255,.96),rgba(244,242,236,.96));--cardbd:rgba(20,30,60,.12);
  --pillC:#2f6fd0;--pillE:#c2553f;--menu:rgba(20,30,60,.05);--menubd:rgba(20,30,60,.10);--grain:.02}
body[data-theme="aurora"]{
  --bg:radial-gradient(80% 70% at 15% 0%,rgba(40,160,150,.16),transparent 55%),radial-gradient(80% 70% at 88% 8%,rgba(120,80,200,.16),transparent 55%),linear-gradient(180deg,#0a1018,#070b12 60%,#05080e);
  --text:#e8f0f2;--sub:#7e8ea0;--cj1:#79e0cf;--cj2:#2f9c8c;--ec1:#c4a0f0;--ec2:#8f5fd0;--ring:rgba(255,255,255,.16);
  --edge:rgba(140,200,210,.16);--edgehl:rgba(180,240,230,.6);--tick:#6c8089;--event:#9fb0a6;--dia:#7fd0c0;
  --card:linear-gradient(160deg,rgba(18,28,32,.94),rgba(10,16,20,.94));--cardbd:rgba(255,255,255,.09);
  --pillC:#79e0cf;--pillE:#c4a0f0;--menu:rgba(255,255,255,.04);--menubd:rgba(255,255,255,.08);--grain:.035}
body::after{content:'';position:fixed;inset:0;pointer-events:none;opacity:var(--grain);z-index:50;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
:root{--anim:1}
@media (prefers-reduced-motion: reduce){:root{--anim:0}}
```

- [ ] **Step 7: Create README.md**

```markdown
# Rule of Law in Poland — Explainer

Static, bilingual (EN/PL) explainer of the Polish Rule of Law crisis and the
ECtHR/CJEU judgments it produced. No build step — open `index.html` or serve
the folder.

## Develop
- `npm install` — dev/test deps only (the site itself has no runtime deps)
- `npm test` — run unit tests (Vitest)
- `npm run serve` — serve at http://localhost:8080

## Deploy
Push to a GitHub repo and enable Pages (root). Or drag the folder to Netlify.
```

- [ ] **Step 8: Commit**

```bash
git add package.json vitest.config.js index.html css/tokens.css README.md tests/smoke.test.js
git commit -m "chore: scaffold static site + Vitest harness + theme tokens"
```

---

## Task 2: i18n resolver with fallback (TDD)

**Files:**
- Create: `js/i18n.js`
- Test: `tests/i18n.test.js`

The resolver turns a `{en,pl}` value (or a plain string) into a display string for the active language, falling back to `en` when a `pl` value is missing/empty (so partially-translated content degrades gracefully).

- [ ] **Step 1: Write failing tests**

```js
// tests/i18n.test.js
import { describe, it, expect } from 'vitest';
import { t } from '../js/i18n.js';

describe('t()', () => {
  it('returns the active language value', () => {
    expect(t({ en: 'Court', pl: 'Sąd' }, 'pl')).toBe('Sąd');
    expect(t({ en: 'Court', pl: 'Sąd' }, 'en')).toBe('Court');
  });
  it('falls back to en when pl is missing or empty', () => {
    expect(t({ en: 'Court' }, 'pl')).toBe('Court');
    expect(t({ en: 'Court', pl: '' }, 'pl')).toBe('Court');
  });
  it('passes through plain strings', () => {
    expect(t('C-791/19', 'pl')).toBe('C-791/19');
  });
  it('returns empty string for null/undefined', () => {
    expect(t(null, 'en')).toBe('');
    expect(t(undefined, 'pl')).toBe('');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/i18n.test.js`
Expected: FAIL — cannot import `t`.

- [ ] **Step 3: Implement js/i18n.js**

```js
// js/i18n.js
export function t(value, lang) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  const v = value[lang];
  if (v != null && v !== '') return v;
  return value.en ?? '';
}

// shared language state
export const langState = { current: 'en' };
export function setLang(lang) { langState.current = lang; }
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run tests/i18n.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add js/i18n.js tests/i18n.test.js
git commit -m "feat: i18n resolver with en->pl fallback"
```

---

## Task 3: Seed data modules + validator (TDD)

**Files:**
- Create: `data/cases.js`, `data/themes.js`, `data/events.js`, `data/glossary.js`, `data/ui.js`, `data/primer.js`, `js/data.js`
- Test: `tests/data.test.js`

- [ ] **Step 1: Create data/themes.js**

```js
// data/themes.js
export const THEMES = [
  { key: 'ct',   name: { en: 'Constitutional Tribunal capture', pl: 'Przejęcie Trybunału Konstytucyjnego' },
    description: { en: 'Packing and neutralising the court that checks if laws follow the constitution.', pl: '' } },
  { key: 'sc',   name: { en: 'Supreme Court & Judicial Council', pl: 'Sąd Najwyższy i KRS' },
    description: { en: 'Reshaping the top court and politicising the body that appoints judges.', pl: '' } },
  { key: 'disc', name: { en: 'Disciplining judges', pl: 'Dyscyplinowanie sędziów' },
    description: { en: 'Punishing judges for their rulings — including the "muzzle law".', pl: '' } },
  { key: 'ret',  name: { en: 'Forced retirements', pl: 'Przymusowe przejścia w stan spoczynku' },
    description: { en: 'Removing sitting judges early by lowering retirement ages.', pl: '' } },
];
export const THEME_KEYS = THEMES.map(t => t.key);
```

- [ ] **Step 2: Create data/events.js**

```js
// data/events.js
export const EVENTS = [
  { date: '2015-10', label: { en: 'Law & Justice wins majority', pl: 'Zwycięstwo Prawa i Sprawiedliwości' } },
  { date: '2015-12', label: { en: 'Constitutional Tribunal packed', pl: 'Przejęcie Trybunału Konstytucyjnego' } },
  { date: '2017-12', label: { en: 'Judicial Council politicised', pl: 'Upolitycznienie KRS' } },
  { date: '2018-07', label: { en: 'Supreme Court purge law', pl: 'Ustawa o Sądzie Najwyższym' } },
  { date: '2019-01', label: { en: 'Disciplinary Chamber set up', pl: 'Powstanie Izby Dyscyplinarnej' } },
  { date: '2020-02', label: { en: '"Muzzle law" enacted', pl: 'Wejście w życie „ustawy kagańcowej”' } },
  { date: '2021-10', label: { en: 'EU-law primacy challenged', pl: 'Zakwestionowanie pierwszeństwa prawa UE' } },
  { date: '2022-07', label: { en: 'Disciplinary Chamber replaced', pl: 'Zastąpienie Izby Dyscyplinarnej' } },
  { date: '2023-10', label: { en: 'Opposition wins election', pl: 'Zwycięstwo opozycji w wyborach' } },
];
```

- [ ] **Step 3: Create data/cases.js (seed: 18 cases, English-complete; 3 fully bilingual)**

Author one record per case using the schema below. Use the case list and one-line summaries from the validated prototype `dots-v4.html` as the starting `summary`/`shortName`/`themes`/`court`/`date`. Fill `whatHappened`, `legalQuestion`, `ruling`, `whyItMatters`, `keyPrinciple`, `legalBasis`, `relationships`, `execution`, and `links` from sources during the content workstream — for the seed, provide real English text for the 18 prototyped cases and real Polish (`pl`) for the **3 marked seed-bilingual cases** (`C-791/19`, `C-585/18`, `43447/19`). Other records may omit `pl` (the resolver falls back to `en`).

Schema (one element of the array):

```js
// data/cases.js  (shape — author all 18; example shows one fully-bilingual record)
export const CASES = [
  {
    id: 'C-791/19',
    court: 'CJEU',
    procedureType: { en: 'Infringement action', pl: 'Skarga o stwierdzenie uchybienia' },
    date: '2021-07-15',
    shortName: { en: 'Commission v. Poland', pl: 'Komisja przeciwko Polsce' },
    themes: ['disc'],
    outcome: { en: 'Infringement found', pl: 'Stwierdzono uchybienie' },
    summary: { en: 'The Disciplinary Chamber was ordered shut; €1m/day fines for keeping it open.',
               pl: 'Nakazano zamknięcie Izby Dyscyplinarnej; 1 mln euro kary dziennie za jej utrzymywanie.' },
    whatHappened: { en: '...', pl: '...' },
    legalQuestion: { en: '...', pl: '...' },
    ruling: { en: '...', pl: '...' },
    whyItMatters: { en: '...', pl: '...' },
    keyPrinciple: { en: '...', pl: '...' },
    legalBasis: [ { ref: 'Art. 19(1) TEU', gloss: 'art19teu' }, { ref: 'Art. 47 Charter', gloss: 'art47charter' } ],
    relationships: [
      { targetId: 'C-585/18', type: 'buildsOn', note: { en: 'Applies the independence test.', pl: '' } },
      { targetId: 'C-558/18', type: 'sameTarget', note: { en: 'Same disciplinary regime.', pl: '' } },
    ],
    execution: {
      individualMeasures: { en: '...', pl: '...' },
      generalMeasures: { en: '...', pl: '...' },
      doneSoFar: { en: '...', pl: '...' },
      status: 'partial',
      supervision: { body: 'European Commission', procedure: null, caseGroup: null,
                     latestAction: { date: '2022-06', text: { en: '...', pl: '...' } } },
    },
    links: [
      { label: { en: 'Judgment (CURIA)', pl: 'Wyrok (CURIA)' }, url: 'https://curia.europa.eu/' },
    ],
  },
  // ... 17 more records (English-complete). IDs (from prototype):
  // 4907/18 Xero Flor [ct/ECtHR], K 3/21 [ct/CJEU], C-585/18 A.K. [sc/CJEU, seed-bilingual],
  // 43447/19 Reczkowicz [sc/ECtHR, seed-bilingual], 49868/19 Dolińska-Ficek & Ozimek [sc/ECtHR],
  // 1469/20 Advance Pharma [sc/ECtHR], C-487/19 W.Ż. [sc/CJEU], C-132/20 Getin Noble [sc/CJEU],
  // 50849/21 Wałęsa [sc/ECtHR], 43572/18 Grzęda [sc/ECtHR], C-558/18 Miasto Łowicz [disc/CJEU],
  // C-204/21 Commission v Poland muzzle law [disc/CJEU], 39650/18 Żurek [disc/ECtHR],
  // 35599/20 Juszczyszyn [disc/ECtHR], C-619/18 [ret/CJEU], C-192/18 [ret/CJEU],
  // 26691/18 Broda & Bochenek [ret/ECtHR]
];

export const RELATIONSHIP_TYPES = {
  buildsOn:        { en: 'builds on',        pl: 'rozwija' },
  sameTarget:      { en: 'same target',      pl: 'ten sam cel' },
  crossCourtEcho:  { en: 'cross-court echo', pl: 'echo między trybunałami' },
  consolidatedBy:  { en: 'consolidated by',  pl: 'skonsolidowane w' },
  proceduralSequel:{ en: 'procedural sequel',pl: 'ciąg proceduralny' },
  conflict:        { en: 'conflict',         pl: 'konflikt' },
};
```

- [ ] **Step 4: Create data/glossary.js**

```js
// data/glossary.js
export const GLOSSARY = {
  cm: { longName: { en: 'Committee of Ministers', pl: 'Komitet Ministrów' },
        definition: { en: 'The Council of Europe body that supervises whether states carry out ECtHR judgments.',
                      pl: 'Organ Rady Europy nadzorujący wykonywanie wyroków ETPC przez państwa.' } },
  krs: { longName: { en: 'National Council of the Judiciary (KRS)', pl: 'Krajowa Rada Sądownictwa (KRS)' },
        definition: { en: 'The Polish body that nominates judges; politicised in 2018, which is the root cause behind many of these cases.',
                      pl: 'Polski organ wskazujący kandydatów na sędziów; upolityczniony w 2018 r., co jest źródłem wielu z tych spraw.' } },
  enhanced: { longName: { en: 'Enhanced supervision', pl: 'Nadzór wzmocniony' },
        definition: { en: 'A closer Committee of Ministers procedure for serious or systemic execution problems.',
                      pl: 'Zaostrzona procedura Komitetu Ministrów dla poważnych lub systemowych problemów z wykonaniem.' } },
  pilot: { longName: { en: 'Pilot judgment', pl: 'Wyrok pilotażowy' },
        definition: { en: 'An ECtHR judgment identifying a systemic problem behind many similar cases and indicating general remedies.',
                      pl: 'Wyrok ETPC wskazujący systemowy problem stojący za wieloma podobnymi sprawami i środki generalne.' } },
  art19teu: { longName: { en: 'Article 19(1) TEU', pl: 'Art. 19 ust. 1 TUE' },
        definition: { en: 'Requires EU states to provide remedies sufficient to ensure effective legal protection — read as guaranteeing independent courts.',
                      pl: 'Wymaga od państw UE środków zapewniających skuteczną ochronę prawną — odczytywany jako gwarancja niezależnych sądów.' } },
  art47charter: { longName: { en: 'Article 47 of the Charter', pl: 'Art. 47 Karty' },
        definition: { en: 'The EU Charter right to an effective remedy and a fair trial before an independent tribunal.',
                      pl: 'Prawo z Karty UE do skutecznego środka prawnego i rzetelnego procesu przed niezawisłym sądem.' } },
  art6echr: { longName: { en: 'Article 6 ECHR', pl: 'Art. 6 EKPC' },
        definition: { en: 'The Convention right to a fair hearing by an independent and impartial tribunal established by law.',
                      pl: 'Prawo z Konwencji do rzetelnego procesu przed niezawisłym sądem ustanowionym ustawą.' } },
};
```

- [ ] **Step 5: Create data/ui.js and data/primer.js**

```js
// data/ui.js
export const UI = {
  lenses: {
    map:  { en: 'Map', pl: 'Mapa' },
    theme:{ en: 'By Theme', pl: 'Wg tematu' },
    time: { en: 'Timeline', pl: 'Oś czasu' },
    court:{ en: 'By Court', pl: 'Wg trybunału' },
    all:  { en: 'All', pl: 'Wszystkie' },
    exec: { en: 'Execution', pl: 'Wykonanie' },
  },
  search: { en: 'Search cases…', pl: 'Szukaj spraw…' },
  close:  { en: 'Close', pl: 'Zamknij' },
  deeper: { en: 'Deeper detail', pl: 'Więcej szczegółów' },
  langName: { en: 'EN', pl: 'PL' },
  courts: { CJEU: { en: 'Court of Justice of the EU', pl: 'Trybunał Sprawiedliwości UE' },
            ECtHR:{ en: 'European Court of Human Rights', pl: 'Europejski Trybunał Praw Człowieka' } },
};
```

```js
// data/primer.js
export const PRIMER = {
  heroTitle: { en: 'How a government captured its courts.', pl: 'Jak rząd przejął własne sądy.' },
  heroSub: { en: "And how Europe's two highest courts fought back — explained for everyone.",
             pl: 'I jak odpowiedziały dwa najwyższe europejskie trybunały — wytłumaczone dla każdego.' },
  whatIsRoL: { title: { en: 'What is the Rule of Law?', pl: 'Czym jest praworządność?' },
               body: { en: '...', pl: '...' } },
  howCourts: { title: { en: 'How these two courts work', pl: 'Jak działają te dwa trybunały' },
               body: { en: '...', pl: '...' } },
  disclaimer: { en: 'This site is informative only. It is gathered from publicly accessible sources, may be inaccurate or out of date, is not legal advice, and is by no means authoritative. For any legal matter, consult the official judgment and a qualified lawyer.',
                pl: 'Ta strona ma charakter wyłącznie informacyjny. Opiera się na źródłach publicznie dostępnych, może być nieścisła lub nieaktualna, nie stanowi porady prawnej i nie ma charakteru autorytatywnego. W sprawach prawnych należy zapoznać się z oryginalnym wyrokiem i skonsultować z wykwalifikowanym prawnikiem.' },
};
```

(The `'...'` deep-prose fields are content-workstream fills; the engine renders whatever is present, and the resolver falls back to `en`. Glance-layer fields above are real and complete.)

- [ ] **Step 6: Write failing validator tests**

```js
// tests/data.test.js
import { describe, it, expect } from 'vitest';
import { CASES } from '../data/cases.js';
import { THEME_KEYS } from '../data/themes.js';
import { validateCases } from '../js/data.js';

describe('seed data integrity', () => {
  it('every case has required glance fields', () => {
    const errors = validateCases(CASES, THEME_KEYS);
    expect(errors).toEqual([]);
  });
  it('relationship targets all exist', () => {
    const ids = new Set(CASES.map(c => c.id));
    for (const c of CASES)
      for (const r of (c.relationships || []))
        expect(ids.has(r.targetId), `${c.id} -> ${r.targetId}`).toBe(true);
  });
  it('has the 18 seed cases', () => {
    expect(CASES.length).toBe(18);
  });
});
```

- [ ] **Step 7: Implement js/data.js validator**

```js
// js/data.js
import { CASES } from '../data/cases.js';
import { THEMES, THEME_KEYS } from '../data/themes.js';
import { EVENTS } from '../data/events.js';
import { GLOSSARY } from '../data/glossary.js';
import { UI } from '../data/ui.js';
import { PRIMER } from '../data/primer.js';

const REQUIRED = ['id', 'court', 'date', 'shortName', 'themes', 'outcome', 'summary'];

export function validateCases(cases, themeKeys) {
  const errors = [];
  for (const c of cases) {
    for (const f of REQUIRED)
      if (c[f] == null) errors.push(`${c.id || '?'} missing ${f}`);
    if (!['CJEU', 'ECtHR'].includes(c.court)) errors.push(`${c.id} bad court ${c.court}`);
    for (const th of (c.themes || []))
      if (!themeKeys.includes(th)) errors.push(`${c.id} unknown theme ${th}`);
    if (c.summary && c.summary.en == null) errors.push(`${c.id} summary needs en`);
  }
  return errors;
}

export function loadData() {
  const errors = validateCases(CASES, THEME_KEYS);
  if (errors.length) console.warn('Data validation:', errors);
  return { cases: CASES, themes: THEMES, events: EVENTS, glossary: GLOSSARY, ui: UI, primer: PRIMER };
}
```

- [ ] **Step 8: Run tests**

Run: `npx vitest run tests/data.test.js`
Expected: PASS (3 tests). If "has 18 seed cases" fails, finish authoring the records.

- [ ] **Step 9: Commit**

```bash
git add data js/data.js tests/data.test.js
git commit -m "feat: seed dataset + bilingual data modules + validator"
```

---

## Task 4: Glossary lookup + tooltip builder (TDD)

**Files:**
- Create: `js/glossary.js`
- Modify: `css/detail.css` (tooltip styles)
- Test: `tests/glossary.test.js`

- [ ] **Step 1: Write failing tests**

```js
// tests/glossary.test.js
import { describe, it, expect } from 'vitest';
import { GLOSSARY } from '../data/glossary.js';
import { lookupTerm, buildGlossaryEl } from '../js/glossary.js';

describe('glossary', () => {
  it('looks up a known term in the active language', () => {
    expect(lookupTerm(GLOSSARY, 'krs', 'en').longName).toContain('National Council');
    expect(lookupTerm(GLOSSARY, 'krs', 'pl').longName).toContain('Krajowa Rada');
  });
  it('returns null for unknown terms', () => {
    expect(lookupTerm(GLOSSARY, 'nope', 'en')).toBe(null);
  });
  it('builds a span with the term text and a tooltip definition', () => {
    const el = buildGlossaryEl(GLOSSARY, 'cm', 'CM', 'en');
    expect(el.tagName).toBe('SPAN');
    expect(el.classList.contains('gloss')).toBe(true);
    expect(el.textContent).toBe('CM');
    expect(el.querySelector('.gloss-tip').textContent).toContain('Council of Europe');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/glossary.test.js`
Expected: FAIL — cannot import.

- [ ] **Step 3: Implement js/glossary.js**

```js
// js/glossary.js
import { t } from './i18n.js';

export function lookupTerm(glossary, key, lang) {
  const g = glossary[key];
  if (!g) return null;
  return { longName: t(g.longName, lang), definition: t(g.definition, lang) };
}

export function buildGlossaryEl(glossary, key, displayText, lang) {
  const span = document.createElement('span');
  span.className = 'gloss';
  span.tabIndex = 0;
  span.textContent = displayText;
  const info = lookupTerm(glossary, key, lang);
  if (info) {
    span.setAttribute('aria-label', `${info.longName}: ${info.definition}`);
    const tip = document.createElement('span');
    tip.className = 'gloss-tip';
    tip.innerHTML = `<strong>${info.longName}</strong><br>${info.definition}`;
    span.appendChild(tip);
  }
  return span;
}
```

- [ ] **Step 4: Add tooltip CSS to css/detail.css**

```css
/* glossary tooltip */
.gloss{border-bottom:1px dotted var(--sub);cursor:help;position:relative;outline:none}
.gloss-tip{position:absolute;bottom:135%;left:0;width:240px;background:var(--card);border:1px solid var(--cardbd);
  color:var(--text);font-size:12.5px;font-weight:400;line-height:1.45;padding:10px 12px;border-radius:10px;
  opacity:0;pointer-events:none;transition:opacity .2s;z-index:30;backdrop-filter:blur(10px);box-shadow:0 12px 36px rgba(0,0,0,.4)}
.gloss-tip strong{color:var(--text)}
.gloss:hover .gloss-tip,.gloss:focus .gloss-tip{opacity:1}
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run tests/glossary.test.js`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add js/glossary.js tests/glossary.test.js css/detail.css
git commit -m "feat: glossary lookup + accessible tooltip builder"
```

---

## Task 5: Node system + render context

**Files:**
- Create: `js/nodes.js`
- Modify: `css/constellation.css`
- Test: `tests/lenses.test.js` (start the file here)

Pure helpers (`courtClass`, `placeStyle`) are tested; DOM creation verified in jsdom.

- [ ] **Step 1: Write failing tests**

```js
// tests/lenses.test.js
import { describe, it, expect } from 'vitest';
import { courtClass, placeTransform, createNodes } from '../js/nodes.js';

const CASES = [
  { id: 'A', court: 'CJEU', themes: ['sc'] },
  { id: 'B', court: 'ECtHR', themes: ['disc'] },
];

describe('nodes', () => {
  it('maps court to css class', () => {
    expect(courtClass('CJEU')).toBe('cjeu');
    expect(courtClass('ECtHR')).toBe('echr');
  });
  it('computes a centered translate transform', () => {
    expect(placeTransform(100, 50)).toBe('translate(91px,41px)'); // node radius 9
  });
  it('creates one node element per case with the court class', () => {
    const stage = document.createElement('div');
    const nodes = createNodes(CASES, stage, () => {});
    expect(nodes.length).toBe(2);
    expect(stage.querySelectorAll('.node').length).toBe(2);
    expect(nodes[0].classList.contains('cjeu')).toBe(true);
    expect(nodes[1].classList.contains('echr')).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/lenses.test.js`
Expected: FAIL — cannot import.

- [ ] **Step 3: Implement js/nodes.js**

```js
// js/nodes.js
export const NODE_R = 9; // half of 18px

export function courtClass(court) {
  return court === 'CJEU' ? 'cjeu' : 'echr';
}

export function placeTransform(x, y) {
  return `translate(${x - NODE_R}px,${y - NODE_R}px)`;
}

export function createNodes(cases, stage, onSelect) {
  return cases.map((c, i) => {
    const n = document.createElement('div');
    n.className = `node ${courtClass(c.court)}`;
    n.dataset.id = c.id;
    n.innerHTML = `<div class="float"><div class="core"><span class="tip"></span></div></div>`;
    // idle float timing (randomised in browser; deterministic-safe default under test)
    const rand = typeof window !== 'undefined' && window.crypto ? Math.random() : (i % 5) / 5;
    n.style.setProperty('--d', (4 + rand * 3).toFixed(2) + 's');
    n.style.setProperty('--dl', (-rand * 4).toFixed(2) + 's');
    n.querySelector('.core').addEventListener('click', () => onSelect(i, n));
    stage.appendChild(n);
    return n;
  });
}

export function place(node, x, y, delayMs) {
  node.style.transitionDelay = `${delayMs}ms`;
  node.style.transform = placeTransform(x, y);
}

export function setTip(node, text) {
  node.querySelector('.tip').textContent = text;
}
```

- [ ] **Step 4: Add node + edge CSS to css/constellation.css**

Port the `.node`, `.float`, `.core`, `.tip`, `#edges`, `#axis`, `.tick`, `.label`, `.event` styles from the validated `dots-v4.html`. Wrap the idle-float `animation` so it is disabled when `--anim:0`:

```css
.float{width:100%;height:100%;animation:float var(--d,5s) ease-in-out infinite;animation-delay:var(--dl,0s)}
@media (prefers-reduced-motion: reduce){ .float{animation:none} .node{transition:none} }
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run tests/lenses.test.js`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add js/nodes.js css/constellation.css tests/lenses.test.js
git commit -m "feat: node system + constellation styles"
```

---

## Task 6: Theme & Court lenses (TDD on grouping)

**Files:**
- Create: `js/lenses/theme.js`, `js/lenses/court.js`
- Test: `tests/lenses.test.js` (append)

Each lens exports `groupPositions(cases, width)` (pure → array of `{i,x,y}`) and `render(ctx)`/`clear(ctx)` (DOM).

- [ ] **Step 1: Append failing tests**

```js
// tests/lenses.test.js (append)
import { themePositions } from '../js/lenses/theme.js';
import { courtPositions } from '../js/lenses/court.js';

const SET = [
  { id: 'a', court: 'CJEU', themes: ['ct'] },
  { id: 'b', court: 'ECtHR', themes: ['ct'] },
  { id: 'c', court: 'CJEU', themes: ['sc'] },
];
const THEME_KEYS = ['ct', 'sc', 'disc', 'ret'];

describe('theme lens', () => {
  it('returns a position for every case, grouped by theme column', () => {
    const pos = themePositions(SET, THEME_KEYS, 800);
    expect(pos.length).toBe(3);
    // ct cases share the same cluster centre x; sc differs
    const ax = pos.find(p => p.i === 0).x, bx = pos.find(p => p.i === 1).x;
    const cx = pos.find(p => p.i === 2).x;
    expect(ax).toBe(bx);
    expect(cx).not.toBe(ax);
  });
});

describe('court lens', () => {
  it('splits CJEU left of ECtHR', () => {
    const pos = courtPositions(SET, 800);
    const cjeuX = pos.find(p => p.i === 0).x, echrX = pos.find(p => p.i === 1).x;
    expect(cjeuX).toBeLessThan(echrX);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/lenses.test.js`
Expected: FAIL — cannot import lens modules.

- [ ] **Step 3: Implement js/lenses/theme.js**

```js
// js/lenses/theme.js
import { place } from '../nodes.js';
import { t } from '../i18n.js';

export function themePositions(cases, themeKeys, width) {
  const cols = 2, cellW = width / cols, out = [];
  themeKeys.forEach((key, ti) => {
    const cx = (ti % cols) * cellW + cellW / 2;
    const cy = Math.floor(ti / cols) * 300 + 54;
    const items = cases.map((c, i) => ({ c, i })).filter(o => o.c.themes.includes(key));
    items.forEach((o, k) => {
      const per = 3, col = k % per, row = Math.floor(k / per);
      out.push({ i: o.i, x: cx + (col - (per - 1) / 2) * 46, y: cy + 16 + row * 46 });
    });
  });
  return out;
}

export function render(ctx) {
  const { cases, nodes, stage, themes, lang, labels } = ctx;
  const themeKeys = themes.map(th => th.key);
  themes.forEach((th, ti) => {
    const cx = (ti % 2) * (ctx.width / 2) + ctx.width / 4;
    const cy = Math.floor(ti / 2) * 300 + 54;
    const l = labels.get('th_' + th.key);
    l.textContent = t(th.name, lang);
    l.classList.add('on');
    l.style.left = (cx - l.offsetWidth / 2) + 'px';
    l.style.top = (cy - 32) + 'px';
  });
  themePositions(cases, themeKeys, ctx.width).forEach((p, k) => place(nodes[p.i], p.x, p.y, k * 45));
}

export function clear(ctx) { ctx.labels.forEach(l => l.classList.remove('on')); }
```

- [ ] **Step 4: Implement js/lenses/court.js**

```js
// js/lenses/court.js
import { place } from '../nodes.js';
import { t } from '../i18n.js';

export function courtPositions(cases, width) {
  const out = [];
  ['CJEU', 'ECtHR'].forEach((court, ci) => {
    const cx = width * (ci ? 0.72 : 0.28);
    const items = cases.map((c, i) => ({ c, i })).filter(o => o.c.court === court);
    items.forEach((o, k) => {
      const per = 3, col = k % per, row = Math.floor(k / per);
      out.push({ i: o.i, x: cx + (col - (per - 1) / 2) * 48, y: 84 + row * 50 });
    });
  });
  return out;
}

export function render(ctx) {
  const { cases, nodes, lang, ui, labels } = ctx;
  ['CJEU', 'ECtHR'].forEach((court, ci) => {
    const cx = ctx.width * (ci ? 0.72 : 0.28);
    const l = labels.get('co_' + court);
    l.textContent = t(ui.courts[court], lang);
    l.classList.add('on');
    l.style.left = (cx - l.offsetWidth / 2) + 'px';
    l.style.top = '16px';
  });
  courtPositions(cases, ctx.width).forEach((p, k) => place(nodes[p.i], p.x, p.y, k * 32));
}

export function clear(ctx) { ctx.labels.forEach(l => l.classList.remove('on')); }
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run tests/lenses.test.js`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add js/lenses/theme.js js/lenses/court.js tests/lenses.test.js
git commit -m "feat: theme and court lenses"
```

---

## Task 7: Timeline lens (TDD on date scale)

**Files:**
- Create: `js/lenses/timeline.js`
- Test: `tests/lenses.test.js` (append)

- [ ] **Step 1: Append failing tests**

```js
// tests/lenses.test.js (append)
import { yearFraction, scaleX } from '../js/lenses/timeline.js';

describe('timeline scale', () => {
  it('converts an ISO date to a fractional year', () => {
    expect(yearFraction('2021-07')).toBeCloseTo(2021.5, 1);
    expect(yearFraction('2019-01')).toBeCloseTo(2019.0, 1);
  });
  it('maps the start of the range near the left padding', () => {
    const x = scaleX(2015.3, 1000); // Y0 = 2015.3
    expect(x).toBeCloseTo(70, 0);
  });
  it('is monotonic increasing in time', () => {
    expect(scaleX(2020, 1000)).toBeLessThan(scaleX(2022, 1000));
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/lenses.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement js/lenses/timeline.js**

```js
// js/lenses/timeline.js
import { place } from '../nodes.js';
import { t } from '../i18n.js';

export const Y0 = 2015.3, Y1 = 2024.4, AX = 330, PERYR = 150;

export function yearFraction(iso) {           // 'YYYY' or 'YYYY-MM'
  const [y, m] = iso.split('-').map(Number);
  return y + ((m ? m - 1 : 0) / 12);
}
export function scaleX(yearFrac, width) {
  return 70 + ((yearFrac - Y0) / (Y1 - Y0)) * (width - 140);
}
export function timelineWidth(viewportWidth) {
  return Math.max(viewportWidth, (Y1 - Y0) * PERYR);
}

export function render(ctx) {
  const { cases, nodes, lang, events, ticks, eventEls, axis } = ctx;
  axis.classList.add('on'); axis.style.left = '70px'; axis.style.width = (ctx.width - 140) + 'px';
  Object.entries(ticks).forEach(([y, el]) => {
    const x = scaleX(+y, ctx.width); el.classList.add('on'); el.style.left = x + 'px'; el.style.top = (AX + 16) + 'px';
  });
  events.forEach((e, i) => {
    const el = eventEls[i], x = scaleX(yearFraction(e.date), ctx.width);
    el.querySelector('.etxt').textContent = t(e.label, lang);
    el.querySelector('.conn').style.height = ((i % 2 === 0) ? 24 : 74) + 'px';
    el.classList.add('on'); el.style.left = x + 'px'; el.style.top = (AX + 10) + 'px'; el.style.transform = 'translate(-5px,0)';
  });
  const buckets = {};
  cases.forEach((c, i) => { const k = Math.round(yearFraction(c.date) * 2); (buckets[k] = buckets[k] || []).push(i); });
  Object.values(buckets).forEach(arr =>
    arr.sort((a, b) => yearFraction(cases[a].date) - yearFraction(cases[b].date))
       .forEach((idx, k) => place(nodes[idx], scaleX(yearFraction(cases[idx].date), ctx.width), AX - 34 - k * 40, idx * 24)));
}

export function clear(ctx) {
  ctx.axis.classList.remove('on');
  Object.values(ctx.ticks).forEach(t => t.classList.remove('on'));
  ctx.eventEls.forEach(e => e.classList.remove('on'));
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run tests/lenses.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add js/lenses/timeline.js tests/lenses.test.js
git commit -m "feat: timeline lens with date scale + event markers"
```

---

## Task 8: All-cases list lens (TDD on filter)

**Files:**
- Create: `js/lenses/list.js`
- Test: `tests/lenses.test.js` (append)

This lens doubles as the **accessible equivalent** of the visual Map.

- [ ] **Step 1: Append failing tests**

```js
// tests/lenses.test.js (append)
import { filterCases } from '../js/lenses/list.js';

const LIST = [
  { id: 'C-791/19', court: 'CJEU', themes: ['disc'], shortName: { en: 'Commission v. Poland' } },
  { id: '43447/19', court: 'ECtHR', themes: ['sc'], shortName: { en: 'Reczkowicz v. Poland' } },
];

describe('list filter', () => {
  it('matches by query against id and name', () => {
    expect(filterCases(LIST, { q: 'reczkowicz', court: null, theme: null }, 'en').length).toBe(1);
    expect(filterCases(LIST, { q: 'C-791', court: null, theme: null }, 'en')[0].id).toBe('C-791/19');
  });
  it('filters by court and theme', () => {
    expect(filterCases(LIST, { q: '', court: 'ECtHR', theme: null }, 'en').length).toBe(1);
    expect(filterCases(LIST, { q: '', court: null, theme: 'disc' }, 'en').length).toBe(1);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/lenses.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement js/lenses/list.js**

```js
// js/lenses/list.js
import { t } from '../i18n.js';

export function filterCases(cases, { q, court, theme }, lang) {
  const needle = (q || '').trim().toLowerCase();
  return cases.filter(c => {
    if (court && c.court !== court) return false;
    if (theme && !c.themes.includes(theme)) return false;
    if (!needle) return true;
    const hay = (c.id + ' ' + t(c.shortName, lang)).toLowerCase();
    return hay.includes(needle);
  });
}

export function render(ctx) {
  const { cases, lang, ui, listMount, onSelect } = ctx;
  // hide nodes; render an HTML list instead
  ctx.nodes.forEach(n => n.style.opacity = '0');
  listMount.hidden = false;
  listMount.innerHTML = `<input class="list-search" type="search" placeholder="${t(ui.search, lang)}" aria-label="${t(ui.search, lang)}">
    <ul class="case-list" role="list"></ul>`;
  const ul = listMount.querySelector('.case-list');
  const draw = (rows) => {
    ul.innerHTML = '';
    rows.forEach(c => {
      const li = document.createElement('li');
      li.innerHTML = `<button class="case-row"><span class="cr-name">${t(c.shortName, lang)}</span>
        <span class="cr-meta">${c.court} · ${c.id}</span></button>`;
      li.querySelector('button').addEventListener('click', () => onSelect(cases.indexOf(c)));
      ul.appendChild(li);
    });
  };
  draw(cases);
  listMount.querySelector('.list-search').addEventListener('input', (e) =>
    draw(filterCases(cases, { q: e.target.value, court: null, theme: null }, lang)));
}

export function clear(ctx) {
  ctx.listMount.hidden = true; ctx.listMount.innerHTML = '';
  ctx.nodes.forEach(n => n.style.opacity = '');
}
```

- [ ] **Step 4: Add list CSS to css/layout.css**

```css
#list-mount[hidden]{display:none}
.list-search{width:min(420px,90%);display:block;margin:0 auto 18px;padding:11px 16px;border-radius:999px;
  background:var(--menu);border:1px solid var(--menubd);color:var(--text);font:400 14px 'Inter'}
.case-list{max-width:680px;margin:0 auto;list-style:none}
.case-row{width:100%;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:13px 16px;
  background:rgba(255,255,255,.025);border:1px solid var(--menubd);border-radius:12px;margin-bottom:7px;
  color:var(--text);font:500 14.5px 'Inter';cursor:pointer;text-align:left}
.case-row:hover{background:var(--menubd)}
.cr-meta{color:var(--sub);font-weight:300;font-size:12.5px}
```

Add `<div id="list-mount" hidden></div>` inside `#scroller` in `index.html`.

- [ ] **Step 5: Run tests**

Run: `npx vitest run tests/lenses.test.js`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add js/lenses/list.js css/layout.css index.html tests/lenses.test.js
git commit -m "feat: all-cases filterable list lens (a11y map equivalent)"
```

---

## Task 9: Map lens — adjacency + force layout (TDD on logic)

**Files:**
- Create: `js/lenses/map.js`
- Test: `tests/lenses.test.js` (append)

Edges are derived from `relationships`. Force layout seeds positions deterministically (by index) so it is reproducible and testable.

- [ ] **Step 1: Append failing tests**

```js
// tests/lenses.test.js (append)
import { buildEdges, buildAdjacency, forceLayout } from '../js/lenses/map.js';

const MAPSET = [
  { id: 'a', court: 'CJEU', relationships: [{ targetId: 'b', type: 'buildsOn' }] },
  { id: 'b', court: 'ECtHR', relationships: [] },
  { id: 'c', court: 'CJEU', relationships: [{ targetId: 'a', type: 'sameTarget' }] },
];

describe('map logic', () => {
  it('builds unique edges from relationships (by index)', () => {
    const edges = buildEdges(MAPSET);
    expect(edges).toContainEqual([0, 1]);
    expect(edges).toContainEqual([0, 2]);
    expect(edges.length).toBe(2);
  });
  it('builds a symmetric adjacency set', () => {
    const adj = buildAdjacency(MAPSET, buildEdges(MAPSET));
    expect(adj[0].has(1)).toBe(true);
    expect(adj[1].has(0)).toBe(true);
  });
  it('force layout returns in-bounds positions for every node', () => {
    const pos = forceLayout(MAPSET, buildEdges(MAPSET), 800, 560);
    expect(pos.length).toBe(3);
    pos.forEach(p => {
      expect(p.x).toBeGreaterThanOrEqual(60); expect(p.x).toBeLessThanOrEqual(740);
      expect(p.y).toBeGreaterThanOrEqual(50); expect(p.y).toBeLessThanOrEqual(510);
    });
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/lenses.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement js/lenses/map.js**

```js
// js/lenses/map.js
import { place } from '../nodes.js';

export function buildEdges(cases) {
  const idx = new Map(cases.map((c, i) => [c.id, i]));
  const seen = new Set(), edges = [];
  cases.forEach((c, i) => (c.relationships || []).forEach(r => {
    const j = idx.get(r.targetId); if (j == null || j === i) return;
    const key = i < j ? `${i}-${j}` : `${j}-${i}`;
    if (seen.has(key)) return; seen.add(key); edges.push(i < j ? [i, j] : [j, i]);
  }));
  return edges;
}

export function buildAdjacency(cases, edges) {
  const adj = cases.map(() => new Set());
  edges.forEach(([a, b]) => { adj[a].add(b); adj[b].add(a); });
  return adj;
}

export function forceLayout(cases, edges, width, height) {
  const n = cases.length, cx = width / 2, cy = height / 2;
  const pos = cases.map((_, i) => ({                       // deterministic seed
    x: cx + Math.cos(i / n * Math.PI * 2) * 180,
    y: cy + Math.sin(i / n * Math.PI * 2) * 150,
  }));
  for (let it = 0; it < 320; it++) {
    const fx = pos.map(() => 0), fy = pos.map(() => 0);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const dx = pos[i].x - pos[j].x, dy = pos[i].y - pos[j].y, d2 = dx * dx + dy * dy || 1, d = Math.sqrt(d2), f = 5200 / d2;
      fx[i] += dx / d * f; fy[i] += dy / d * f; fx[j] -= dx / d * f; fy[j] -= dy / d * f;
    }
    edges.forEach(([a, b]) => {
      const dx = pos[b].x - pos[a].x, dy = pos[b].y - pos[a].y, d = Math.sqrt(dx * dx + dy * dy) || 1, f = (d - 96) * 0.04;
      fx[a] += dx / d * f; fy[a] += dy / d * f; fx[b] -= dx / d * f; fy[b] -= dy / d * f;
    });
    for (let i = 0; i < n; i++) {
      fx[i] += (cx - pos[i].x) * 0.012; fy[i] += (cy - pos[i].y) * 0.012;
      pos[i].x += Math.max(-6, Math.min(6, fx[i])); pos[i].y += Math.max(-6, Math.min(6, fy[i]));
      pos[i].x = Math.max(60, Math.min(width - 60, pos[i].x));
      pos[i].y = Math.max(50, Math.min(height - 50, pos[i].y));
    }
  }
  return pos;
}

let cached = null;
export function render(ctx) {
  const { cases, nodes, svg, width, height = 560 } = ctx;
  const edges = ctx._edges || (ctx._edges = buildEdges(cases));
  const adj = ctx._adj || (ctx._adj = buildAdjacency(cases, edges));
  if (!cached || ctx._recompute) { cached = forceLayout(cases, edges, width, height); ctx._recompute = false; }
  cases.forEach((c, i) => place(nodes[i], cached[i].x, cached[i].y, i * 22));
  drawEdges(svg, edges, cached, width, height);
  ctx._mapHover = (i) => highlight(ctx, edges, adj, i);
  ctx._mapClearHover = () => clearHighlight(ctx, edges);
}

function drawEdges(svg, edges, pos, width, height) {
  svg.setAttribute('width', width); svg.setAttribute('height', height);
  svg.innerHTML = '';
  edges.forEach(([a, b]) => {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const x1 = pos[a].x, y1 = pos[a].y, x2 = pos[b].x, y2 = pos[b].y;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, len = Math.hypot(-dy, dx) || 1;
    p.setAttribute('d', `M${x1},${y1} Q${mx - dy / len * 18},${my + dx / len * 18} ${x2},${y2}`);
    svg.appendChild(p);
  });
  setTimeout(() => svg.querySelectorAll('path').forEach(p => p.classList.add('on')), 420);
}

function highlight(ctx, edges, adj, i) {
  ctx.svg.querySelectorAll('path').forEach((p, k) => {
    const [a, b] = edges[k];
    p.classList.toggle('hl', a === i || b === i);
    p.classList.toggle('dim', !(a === i || b === i));
  });
  ctx.nodes.forEach((n, j) => {
    n.classList.toggle('hl', j === i || adj[i].has(j));
    n.classList.toggle('dim', !(j === i || adj[i].has(j)));
  });
}
function clearHighlight(ctx, edges) {
  ctx.svg.querySelectorAll('path').forEach(p => p.classList.remove('hl', 'dim'));
  ctx.nodes.forEach(n => n.classList.remove('hl', 'dim'));
}

export function clear(ctx) {
  ctx.svg.innerHTML = '';
  ctx.nodes.forEach(n => n.classList.remove('hl', 'dim'));
  ctx._mapHover = null; ctx._mapClearHover = null;
}
```

- [ ] **Step 4: Add edge highlight CSS to css/constellation.css** (if not already ported)

```css
#edges path{fill:none;stroke:var(--edge);stroke-width:1.2;opacity:0;transition:opacity .6s,stroke .4s}
#edges path.on{opacity:1}
#edges path.hl{stroke:var(--edgehl);stroke-width:1.8;opacity:1}
#edges path.dim{opacity:.05}
.node.dim .core{opacity:.18}
.node.hl .core{transform:scale(1.4)}
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run tests/lenses.test.js`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add js/lenses/map.js css/constellation.css tests/lenses.test.js
git commit -m "feat: map lens — edges, adjacency, deterministic force layout"
```

---

## Task 10: Execution lens (TDD on status counts)

**Files:**
- Create: `js/lenses/execution.js`
- Modify: `css/layout.css`
- Test: `tests/lenses.test.js` (append)

- [ ] **Step 1: Append failing tests**

```js
// tests/lenses.test.js (append)
import { executionCounts } from '../js/lenses/execution.js';

const EX = [
  { execution: { status: 'open', supervision: { procedure: 'enhanced' } } },
  { execution: { status: 'partial', supervision: { procedure: 'enhanced' } } },
  { execution: { status: 'closed', supervision: { procedure: null } } },
  { execution: null },
];

describe('execution counts', () => {
  it('tallies statuses and enhanced supervision, ignoring missing execution', () => {
    const c = executionCounts(EX);
    expect(c.open).toBe(1);
    expect(c.partial).toBe(1);
    expect(c.closed).toBe(1);
    expect(c.enhanced).toBe(2);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/lenses.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement js/lenses/execution.js**

```js
// js/lenses/execution.js
import { t } from '../i18n.js';

export function executionCounts(cases) {
  const c = { open: 0, partial: 0, closed: 0, enhanced: 0 };
  for (const x of cases) {
    const e = x.execution; if (!e) continue;
    if (e.status === 'open') c.open++;
    else if (e.status === 'partial') c.partial++;
    else if (e.status === 'closed') c.closed++;
    if (e.supervision && e.supervision.procedure === 'enhanced') c.enhanced++;
  }
  return c;
}

const STATUS_LABEL = {
  open: { en: 'Root cause open', pl: 'Źródło problemu nierozwiązane' },
  partial: { en: 'Partially executed', pl: 'Częściowo wykonane' },
  closed: { en: 'Closed', pl: 'Zamknięte' },
};

export function render(ctx) {
  const { cases, lang, themes, execMount, nodes } = ctx;
  nodes.forEach(n => n.style.opacity = '0');
  execMount.hidden = false;
  const c = executionCounts(cases);
  const tile = (num, cls, label) => `<div class="stat"><div class="num ${cls}">${num}</div><div class="lbl">${label}</div></div>`;
  let html = `<div class="summary">
    ${tile(c.open, 'n-open', lang === 'pl' ? 'Źródło nierozwiązane' : 'Root cause open')}
    ${tile(c.partial, 'n-part', lang === 'pl' ? 'Częściowo' : 'Partially executed')}
    ${tile(c.closed, 'n-closed', lang === 'pl' ? 'Zamknięte' : 'Closed')}
    ${tile(c.enhanced, 'n-enh', lang === 'pl' ? 'Nadzór wzmocniony' : 'Enhanced supervision')}
  </div>`;
  themes.forEach(th => {
    const rows = cases.filter(x => x.themes.includes(th.key) && x.execution);
    if (!rows.length) return;
    html += `<div class="exec-group"><h3>${t(th.name, lang)}</h3>`;
    rows.forEach(x => {
      const e = x.execution, s = e.status;
      const la = e.supervision && e.supervision.latestAction;
      html += `<div class="exec-row">
        <div><div class="case">${t(x.shortName, lang)}</div><div class="cid">${x.court} · ${x.id}</div></div>
        <span class="badge b-${x.court === 'CJEU' ? 'cjeu' : 'echr'}">${x.court}</span>
        <span class="status s-${s}"><i class="pip"></i>${t(STATUS_LABEL[s], lang)}</span>
        <div class="cm">${la ? `<span class="enh">${la.date}:</span> ${t(la.text, lang)}` : ''}</div>
      </div>`;
    });
    html += `</div>`;
  });
  execMount.innerHTML = html;
}

export function clear(ctx) {
  ctx.execMount.hidden = true; ctx.execMount.innerHTML = '';
  ctx.nodes.forEach(n => n.style.opacity = '');
}
```

- [ ] **Step 4: Add execution CSS to css/layout.css**

Port the `.summary/.stat/.exec-group/.exec-row/.badge/.status/.pip/.cm` styles from the validated `execution-overview.html` mock (rename `.row`→`.exec-row`, `.group`→`.exec-group` to avoid collisions). Add `<div id="exec-mount" hidden></div>` inside `#scroller`.

- [ ] **Step 5: Run tests**

Run: `npx vitest run tests/lenses.test.js`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add js/lenses/execution.js css/layout.css index.html tests/lenses.test.js
git commit -m "feat: execution lens — status board + counts"
```

---

## Task 11: Lens switcher + render context wiring

**Files:**
- Create: `js/switcher.js`
- Test: `tests/switcher.test.js`

- [ ] **Step 1: Write failing test**

```js
// tests/switcher.test.js
import { describe, it, expect, vi } from 'vitest';
import { makeSwitcher } from '../js/switcher.js';

describe('switcher', () => {
  it('clears the previous lens and renders the next', () => {
    const a = { clear: vi.fn(), render: vi.fn() };
    const b = { clear: vi.fn(), render: vi.fn() };
    const sw = makeSwitcher({ a, b }, () => ({ width: 800 }));
    sw.switchTo('a'); expect(a.render).toHaveBeenCalledTimes(1);
    sw.switchTo('b'); expect(a.clear).toHaveBeenCalledTimes(1); expect(b.render).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/switcher.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement js/switcher.js**

```js
// js/switcher.js
export function makeSwitcher(lenses, getCtx) {
  let current = null;
  function switchTo(name) {
    const ctx = getCtx();
    if (current && lenses[current].clear) lenses[current].clear(ctx);
    current = name;
    lenses[name].render(ctx);
  }
  return { switchTo, get current() { return current; } };
}
```

- [ ] **Step 4: Run test**

Run: `npx vitest run tests/switcher.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add js/switcher.js tests/switcher.test.js
git commit -m "feat: lens switcher with clear/render lifecycle"
```

---

## Task 12: Case detail card (glance → deep)

**Files:**
- Create: `js/detail.js`
- Modify: `css/detail.css`

Rendered DOM; verified in the browser. Uses `t()`, `buildGlossaryEl`, and `RELATIONSHIP_TYPES`.

- [ ] **Step 1: Implement js/detail.js**

```js
// js/detail.js
import { t } from './i18n.js';
import { buildGlossaryEl } from './glossary.js';
import { RELATIONSHIP_TYPES } from '../data/cases.js';

export function makeDetail(mount, glossary, ui, casesById) {
  function open(c, lang) {
    const courtCls = c.court === 'CJEU' ? 'cjeu' : 'echr';
    mount.innerHTML = `
      <div class="card show" role="dialog" aria-label="${t(c.shortName, lang)}">
        <button class="close" aria-label="${t(ui.close, lang)}">×</button>
        <span class="pill ${courtCls}">${c.court} · ${c.date.slice(0,4)} · ${t(c.outcome, lang)}</span>
        <h3>${t(c.shortName, lang)}</h3>
        <div class="cid">${t(c.procedureType, lang)} · ${c.id}</div>
        <p class="lead">${t(c.summary, lang)}</p>
        <details class="deep"><summary>${t(ui.deeper, lang)}</summary>
          <div class="deep-body"></div>
        </details>
      </div>`;
    const body = mount.querySelector('.deep-body');
    const block = (labelEN, labelPL, val) => {
      if (!val || !t(val, lang)) return;
      const h = document.createElement('h4'); h.textContent = lang === 'pl' ? labelPL : labelEN;
      const p = document.createElement('p'); p.textContent = t(val, lang);
      body.append(h, p);
    };
    block('What happened','Co się stało', c.whatHappened);
    block('The legal question','Pytanie prawne', c.legalQuestion);
    block('What the court ruled','Rozstrzygnięcie', c.ruling);
    block('Why it matters','Dlaczego to ważne', c.whyItMatters);
    block('Key principle','Kluczowa zasada', c.keyPrinciple);
    if (c.legalBasis?.length) {
      const h = document.createElement('h4'); h.textContent = lang === 'pl' ? 'Podstawa prawna' : 'Legal basis';
      const p = document.createElement('p');
      c.legalBasis.forEach((lb, k) => { if (k) p.append(', '); p.append(buildGlossaryEl(glossary, lb.gloss, lb.ref, lang)); });
      body.append(h, p);
    }
    if (c.relationships?.length) {
      const h = document.createElement('h4'); h.textContent = lang === 'pl' ? 'Powiązane sprawy' : 'Related cases';
      const ul = document.createElement('ul'); ul.className = 'rel-list';
      c.relationships.forEach(r => {
        const tgt = casesById.get(r.targetId); if (!tgt) return;
        const li = document.createElement('li');
        const rel = t(RELATIONSHIP_TYPES[r.type], lang);
        li.innerHTML = `<button class="rel-link">${t(tgt.shortName, lang)}</button> — <em>${rel}</em>${t(r.note, lang) ? ': ' + t(r.note, lang) : ''}`;
        li.querySelector('.rel-link').addEventListener('click', () => open(tgt, lang));
        ul.appendChild(li);
      });
      body.append(h, ul);
    }
    if (c.execution) {
      const h = document.createElement('h4'); h.textContent = lang === 'pl' ? 'Wykonanie wyroku' : 'Execution';
      body.appendChild(h);
      block('General measures required','Wymagane środki generalne', c.execution.generalMeasures);
      block('Done so far','Co zrobiono', c.execution.doneSoFar);
      const sup = c.execution.supervision;
      if (sup?.latestAction) block('Latest supervision','Ostatni nadzór',
        { en: `${sup.body} (${sup.latestAction.date}): ${t(sup.latestAction.text,'en')}`,
          pl: `${sup.body} (${sup.latestAction.date}): ${t(sup.latestAction.text,'pl')}` });
    }
    if (c.links?.length) {
      const div = document.createElement('div'); div.className = 'links';
      c.links.forEach(l => { const a = document.createElement('a'); a.href = l.url; a.target = '_blank';
        a.rel = 'noopener'; a.textContent = t(l.label, lang) + ' ↗'; div.appendChild(a); });
      body.appendChild(div);
    }
    mount.querySelector('.close').addEventListener('click', close);
  }
  function close() { const card = mount.querySelector('.card'); if (card) card.classList.remove('show'); }
  return { open, close };
}
```

- [ ] **Step 2: Add detail card CSS to css/detail.css**

Port `.card/.pill/.cid/.lead` from the prototype; add `.deep summary{cursor:pointer}`, `.deep-body h4`, `.rel-list`, `.links a` styles consistent with theme variables.

- [ ] **Step 3: Manual verification (browser)**

Run `npm run serve`, open http://localhost:8080, click a node → card slides up with glance text; expand "Deeper detail" → blocks render; click a related case → detail switches; links open in new tabs. Toggle language → labels switch (deep prose falls back to EN where PL absent).

- [ ] **Step 4: Commit**

```bash
git add js/detail.js css/detail.css
git commit -m "feat: case detail card with deep layer, relationships, links"
```

---

## Task 13: Hero, primer, disclaimer, first-visit notice

**Files:**
- Create: `js/ui-chrome.js`
- Modify: `css/layout.css`, `js/app.js` (wired in Task 14)

- [ ] **Step 1: Implement js/ui-chrome.js**

```js
// js/ui-chrome.js
import { t } from './i18n.js';

export function renderHero(mount, primer, lang) {
  mount.innerHTML = `<div class="hero-inner reveal">
    <div class="kicker">${lang === 'pl' ? 'Kryzys praworządności' : 'The Rule of Law Crisis'}</div>
    <h1 class="hero-title">${t(primer.heroTitle, lang)}</h1>
    <p class="hero-sub">${t(primer.heroSub, lang)}</p>
  </div>`;
}

export function renderPrimer(mount, primer, lang) {
  const sec = (s) => `<section class="primer-block reveal"><h2>${t(s.title, lang)}</h2><p>${t(s.body, lang)}</p></section>`;
  mount.innerHTML = sec(primer.whatIsRoL) + sec(primer.howCourts);
}

export function renderDisclaimer(footer, primer, lang) {
  footer.innerHTML = `<p class="disclaimer-text">${t(primer.disclaimer, lang)}</p>`;
}

export function maybeFirstVisit(box, primer, lang) {
  let dismissed = false;
  try { dismissed = localStorage.getItem('rol-disclaimer-ack') === '1'; } catch (e) {}
  if (dismissed) { box.hidden = true; return; }
  box.hidden = false;
  box.innerHTML = `<div class="fv-inner"><p>${t(primer.disclaimer, lang)}</p>
    <button class="fv-ok">${lang === 'pl' ? 'Rozumiem' : 'I understand'}</button></div>`;
  box.querySelector('.fv-ok').addEventListener('click', () => {
    try { localStorage.setItem('rol-disclaimer-ack', '1'); } catch (e) {}
    box.hidden = true;
  });
}

export function setupScrollReveal() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in')); return;
  }
  const obs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }), { threshold: .25 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}
```

- [ ] **Step 2: Add hero/primer/disclaimer/first-visit CSS to css/layout.css**

Port the Apple-style hero (`clamp()` headline, gradient text), `.reveal{opacity:0;transform:translateY(40px);transition:...}` / `.reveal.in{opacity:1;transform:none}`, primer blocks, footer disclaimer (small, persistent, `--sub` colour), and a fixed-bottom first-visit banner with backdrop blur. Guard reveals with reduced-motion.

- [ ] **Step 3: Manual verification**

Serve; confirm hero animates in on load, primer sections reveal on scroll, footer disclaimer always present, first-visit banner appears once and stays dismissed after reload.

- [ ] **Step 4: Commit**

```bash
git add js/ui-chrome.js css/layout.css
git commit -m "feat: hero, primer, persistent disclaimer + first-visit notice"
```

---

## Task 14: App wiring — toggles, controls, initial render

**Files:**
- Modify: `js/app.js`
- Modify: `css/layout.css` (controls/tabs/swatches)

- [ ] **Step 1: Implement js/app.js**

```js
// js/app.js
import { loadData } from './data.js';
import { t, langState, setLang } from './i18n.js';
import { createNodes, setTip } from './nodes.js';
import { makeSwitcher } from './switcher.js';
import { makeDetail } from './detail.js';
import * as theme from './lenses/theme.js';
import * as court from './lenses/court.js';
import * as timeline from './lenses/timeline.js';
import * as list from './lenses/list.js';
import * as map from './lenses/map.js';
import * as execution from './lenses/execution.js';
import { renderHero, renderPrimer, renderDisclaimer, maybeFirstVisit, setupScrollReveal } from './ui-chrome.js';

const data = loadData();
const stage = document.getElementById('stage');
const scroller = document.getElementById('scroller');
const svg = document.getElementById('edges');
const axis = document.getElementById('axis');
const casesById = new Map(data.cases.map(c => [c.id, c]));

// build label/tick/event elements once
const labels = new Map();
data.themes.forEach(th => { const l = mk('label'); labels.set('th_' + th.key, l); });
['CJEU','ECtHR'].forEach(c => { const l = mk('label'); labels.set('co_' + c, l); });
const ticks = {}; [2016,2017,2018,2019,2020,2021,2022,2023,2024].forEach(y => { const el = mk('tick'); el.textContent = y; ticks[y] = el; });
const eventEls = data.events.map(() => { const el = mk('event'); el.innerHTML = '<div class="dia"></div><div class="conn"></div><div class="etxt"></div>'; return el; });
function mk(cls){ const d = document.createElement('div'); d.className = cls; stage.appendChild(d); return d; }

const listMount = document.getElementById('list-mount');
const execMount = document.getElementById('exec-mount');
const detail = makeDetail(document.getElementById('detail'), data.glossary, data.ui, casesById);

function onSelect(i){ detail.open(data.cases[i], langState.current); }
const nodes = createNodes(data.cases, stage, onSelect);
data.cases.forEach((c, i) => setTip(nodes[i], t(c.shortName, langState.current)));

// hover wiring for map
nodes.forEach((n, i) => {
  n.addEventListener('mouseenter', () => { if (sw.current === 'map' && ctx._mapHover) ctx._mapHover(i); });
  n.addEventListener('mouseleave', () => { if (sw.current === 'map' && ctx._mapClearHover) ctx._mapClearHover(); });
});

const ctx = {};
function getCtx(){
  Object.assign(ctx, {
    cases: data.cases, nodes, stage, svg, axis, labels, ticks, eventEls,
    themes: data.themes, events: data.events, ui: data.ui, glossary: data.glossary,
    lang: langState.current, listMount, execMount, onSelect,
    width: (sw && sw.current === 'time') ? timeline.timelineWidth(scroller.clientWidth) : scroller.clientWidth,
    height: 560,
  });
  stage.style.width = ctx.width + 'px';
  return ctx;
}

const sw = makeSwitcher({ map, theme, time: timeline, court, all: list, exec: execution }, getCtx);

// controls
const tabsEl = document.getElementById('lens-tabs');
// lens view keys match data.ui.lenses keys exactly (map/theme/time/court/all/exec)
['map','theme','time','court','all','exec'].forEach((key) => {
  const b = document.createElement('button'); b.className = 'tab'; b.dataset.view = key; b.setAttribute('role','tab');
  b.textContent = t(data.ui.lenses[key], langState.current);
  b.addEventListener('click', () => { setActive(b); sw.switchTo(key); });
  tabsEl.appendChild(b);
});
function setActive(b){ tabsEl.querySelectorAll('.tab').forEach(x => x.classList.remove('active')); b.classList.add('active'); }

// language toggle
const langEl = document.getElementById('lang-toggle');
['en','pl'].forEach(l => { const b = document.createElement('button'); b.className = 'lang' + (l === 'en' ? ' active' : '');
  b.textContent = l.toUpperCase(); b.addEventListener('click', () => switchLang(l, b)); langEl.appendChild(b); });
function switchLang(l, b){
  setLang(l); document.body.dataset.lang = l;
  langEl.querySelectorAll('.lang').forEach(x => x.classList.remove('active')); b.classList.add('active');
  data.cases.forEach((c, i) => setTip(nodes[i], t(c.shortName, l)));
  renderChrome(); relabelTabs(); sw.switchTo(sw.current); // re-render active lens in new lang
}
function relabelTabs(){ tabsEl.querySelectorAll('.tab').forEach(b => {
  const k = b.dataset.view; b.textContent = t(data.ui.lenses[k], langState.current); }); }

// theme swatches
const swEl = document.getElementById('theme-swatches');
['nocturne','obsidian','daylight','aurora'].forEach((th, i) => {
  const s = document.createElement('button'); s.className = 'sw ' + th + (i === 0 ? ' active' : '');
  s.title = th; s.addEventListener('click', () => { document.body.dataset.theme = th;
    swEl.querySelectorAll('.sw').forEach(x => x.classList.remove('active')); s.classList.add('active'); });
  swEl.appendChild(s);
});

function renderChrome(){
  renderHero(document.getElementById('hero'), data.primer, langState.current);
  renderPrimer(document.getElementById('primer'), data.primer, langState.current);
  renderDisclaimer(document.getElementById('disclaimer'), data.primer, langState.current);
}

window.addEventListener('resize', () => { if (sw.current === 'map') ctx._recompute = true; sw.switchTo(sw.current); });

// boot
renderChrome();
maybeFirstVisit(document.getElementById('first-visit'), data.primer, langState.current);
setupScrollReveal();
setActive(tabsEl.querySelector('[data-view="map"]'));
sw.switchTo('map');
```

- [ ] **Step 2: Add controls CSS to css/layout.css**

Port `.tabs/.tab/.themes/.sw/.lang` styles from the prototype; lay out `#controls` as a sticky bar with tabs left and toggles right; responsive wrap on mobile.

- [ ] **Step 3: Run full test suite**

Run: `npm test`
Expected: PASS (all suites).

- [ ] **Step 4: Manual verification (browser)**

Serve; verify: all six tabs switch with the cascade animation; Map hover highlights; Timeline scrolls; theme swatches reskin live; language toggle flips every label and re-renders the active lens; detail card works in both languages; first-visit + footer disclaimer present.

- [ ] **Step 5: Commit**

```bash
git add js/app.js css/layout.css
git commit -m "feat: wire app — controls, lens switcher, language + theme toggles"
```

---

## Task 15: Accessibility, responsive & reduced-motion pass

**Files:**
- Modify: `css/layout.css`, `css/constellation.css`, `js/app.js`

- [ ] **Step 1: Keyboard + ARIA**

Make nodes focusable (`tabindex="0"` on `.core`, Enter/Space → select), add `aria-selected` on active tab, ensure the language/theme buttons have `aria-pressed`. The "All" list is the screen-reader path for the Map.

```js
// in createNodes(): after creating core
core.tabIndex = 0;
core.setAttribute('role', 'button');
core.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(i, n); } });
```

- [ ] **Step 2: Responsive layout**

Add `@media (max-width: 760px)` rules: stack `#controls`, shrink hero clamp, switch theme-grid lens to single column (`cols = 1` path — add a width check in `themePositions`/`render`), make detail card full-width bottom sheet, event labels single-row.

- [ ] **Step 3: Reduced-motion**

Confirm `prefers-reduced-motion` disables idle float, node transitions, and scroll reveals (reveals already handled in `setupScrollReveal`). Verify nodes still jump to correct positions instantly.

- [ ] **Step 4: Manual verification**

Use the browser at mobile width; tab through controls and nodes with the keyboard; toggle OS reduced-motion and reload. Check colour contrast in all four themes (Daylight especially) with browser devtools.

- [ ] **Step 5: Commit**

```bash
git add css js/app.js js/nodes.js
git commit -m "feat: accessibility, responsive, reduced-motion pass"
```

---

## Task 16: Deploy

**Files:**
- Create: `.nojekyll`

- [ ] **Step 1: Add .nojekyll** (prevents GitHub Pages from touching `_`-prefixed paths; harmless otherwise)

```bash
touch .nojekyll
```

- [ ] **Step 2: Final full test + manual smoke**

Run: `npm test` (PASS) and `npm run serve`, click through all lenses once more.

- [ ] **Step 3: Commit + push + enable Pages**

```bash
git add .nojekyll
git commit -m "chore: prepare for GitHub Pages deploy"
# create GitHub repo, then:
# git remote add origin <url> && git push -u origin main
# In GitHub: Settings → Pages → Source: main / root
```

- [ ] **Step 4: Verify the live URL** loads, fonts/data fetch correctly (paths are relative), and the disclaimer + first-visit notice work over HTTPS.

---

## Self-review notes (plan vs spec)

- **Spec §3 IA / six lenses** → Tasks 6–11 (all six lenses) + 11 (switcher) ✓
- **Spec §4 data model** → Task 3 (schema + seed) + 13 (primer/disclaimer strings) ✓
- **Spec §4.2 relationship types** → `RELATIONSHIP_TYPES` (Task 3), used in Map (Task 9) + detail (Task 12) ✓
- **Spec §5.1 glossary tooltips** → Task 4 + used in Task 12 ✓
- **Spec §5.2 links** → schema (Task 3) + render (Task 12) ✓
- **Spec §5.3 disclaimer** → Task 13 (footer + first-visit) ✓
- **Spec §6 visuals/themes/constellation** → Tasks 1 (tokens), 5 (nodes), 9 (map), 14 (theme swatches) ✓
- **Spec §7 architecture** → file structure + ES modules + Task 1 ✓
- **Spec §8 sourcing/accuracy** → content workstream (below), with provenance `links` field present in schema ✓
- **Spec §9 accessibility** → Task 15 ✓
- **Naming consistency:** lenses expose `render(ctx)`/`clear(ctx)`; pure helpers (`themePositions`, `courtPositions`, `scaleX`, `filterCases`, `buildEdges`, `forceLayout`, `executionCounts`) are the tested surface; `place`/`createNodes`/`setTip` shared from `nodes.js`. Checked consistent across tasks.

---

## Out of scope / follow-on (content workstream)

This plan builds the **engine + seed data**. A separate effort (its own plan) covers:

1. **Research & draft** every in-scope case's deep-layer prose + execution data from CURIA / HUDOC / HUDOC-EXEC / Commission & Venice Commission sources, with an adversarial fact-check pass. Includes recent rulings (Biliński, Sobczyńska, …).
2. **Populate `links`** with verified official URLs per case.
3. **Polish translation** of all `pl` fields.
4. **Owner accuracy review** — the legal authority verifies content + translation before publication.

Because every case is just a data record validated by `validateCases`, this is additive: no engine changes required.
