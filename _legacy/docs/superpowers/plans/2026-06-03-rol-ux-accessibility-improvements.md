# Rule-of-Law Explainer — UX / Accessibility / Writing Improvements Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (inline). Steps use `- [ ]` checkboxes. Vanilla ES-module static site; tests via `npm test` (Vitest). Preview: `preview_stop`+`preview_start` to bust the ES-module cache, then screenshot. Commit each task with tests green.

**Goal:** Make the site fulfill its stated promise — "high-schooler clarity by default, lawyer depth one click away," bilingual, accessible, usable on touch — by fixing the issues found in the hostile-critique pass.

**Architecture:** Data in `data/*.js` `{en,pl}`; render core + lens modules in `js/`; CSS tokens per theme in `css/tokens.css`. No build step. Keep the lens pattern (`render(ctx)`/`clear(ctx)`). The word **"Execution"** stays (user decision).

**Tech Stack:** HTML, CSS custom properties, vanilla ES modules, Vitest.

---

## Batch A — credibility & access (do first)

### Task 1: Complete the Polish translations + add an i18n completeness gate
**Files:** Modify `data/primer.js`, `data/themes.js`, `data/cases.js` (empty `pl` shortNames); Modify `js/data.js`; Test `tests/i18n.test.js`.
- [ ] Add `findMissingTranslations(obj)` to `js/data.js`: walk the data trees; for every object that has a non-empty `en` string, flag if `pl` is missing/empty. Return `[]` when complete.
- [ ] Test (`tests/i18n.test.js`): `expect(findMissingTranslations({cases,themes,primer,ui})).toEqual([])` — fails first.
- [ ] Translate: `primer.whatIsRoL.body.pl`, `primer.howCourts.body.pl`, all `themes[].description.pl`, and the empty `shortName.pl` for `C-487/19` (W.Ż.), `C-132/20` (Getin Noble Bank), `50849/21` (Wałęsa), `35599/20` (Juszczyszyn). (Procedural names like "W.Ż." can mirror EN; Getin Noble Bank → "Getin Noble Bank"; Wałęsa → "Wałęsa przeciwko Polsce"; Juszczyszyn → "Juszczyszyn przeciwko Polsce".)
- [ ] Run `npm test` — gate passes.
- [ ] Commit `content: complete Polish translations + i18n completeness gate`.

**Acceptance:** No EN string lacks a PL counterpart; the gate test guards regressions.

### Task 2: SEO / social / favicon metadata
**Files:** Modify `index.html`; Create `assets/favicon.svg`, `assets/og-image.svg` (or `.png`).
- [ ] Add to `<head>`: `<meta name="description">` (EN one-liner), `<link rel="canonical" href="https://wymysl.github.io/rule-of-law-pl/">`, Open Graph (`og:title/description/type/url/image`), Twitter (`summary_large_image`), `<meta name="theme-color">`, `<link rel="icon" href="assets/favicon.svg">`.
- [ ] Create a simple branded `assets/og-image` (1200×630) and `assets/favicon.svg` (a courthouse/scales glyph in brand blue).
- [ ] Verify `curl -s localhost:8080/ | grep og:` shows tags; favicon + og image return 200.
- [ ] Commit `feat: add SEO/social metadata, favicon and share image`.

**Acceptance:** Sharing the URL yields a rich preview; tab shows a favicon.

### Task 3: Fix contrast tokens across all four themes
**Files:** Modify `css/tokens.css`.
- [ ] Replace per-theme values (computed to ≥4.5:1, mostly ≥5.5):
  - nocturne: `--sub:#969fb0; --tick:#8b94a6;` (event ok)
  - obsidian: `--sub:#9a9a9d; --tick:#909093;` (event ok)
  - daylight: `--sub:#565d6b; --tick:#5f6673; --event:#6a5f42;`
  - aurora: `--sub:#97a6b6; --tick:#8a9ca6;` (event ok)
- [ ] Stop dimming readable text with `opacity` — change `.primer-block p{opacity:.85}` (`css/layout.css:52`) and `.disclaimer-text` to full opacity (the new `--sub`/`--text` already carry the right contrast).
- [ ] Verify with the node contrast script (all ≥4.5).
- [ ] Commit `fix(a11y): raise --sub/--tick/--event contrast to WCAG AA in every theme`.

**Acceptance:** Year ticks, sub-text and event labels meet AA in all themes.

### Task 4: Make the detail + event modals accessible dialogs
**Files:** Modify `js/detail.js`, `js/event-card.js`, `index.html` (remove `aria-live` from `#detail`).
- [ ] On `open`, capture `lastFocused = document.activeElement`; on `close`, `lastFocused?.focus()`.
- [ ] Add a Tab focus trap: a keydown handler on the card that cycles focus among focusable descendants (`a[href],button,[tabindex]:not([tabindex="-1"]),input`), wrapping at ends.
- [ ] Set the rest of the page inert while open: add `inert` attribute (and `aria-hidden="true"`) to `#hero,#primer,#controls,#scroller,#disclaimer` on open; remove on close. (Helper `setBackgroundInert(on)` shared by both modal modules — put in a tiny `js/modal-util.js`.)
- [ ] Remove `aria-live="polite"` from `#detail` in `index.html`.
- [ ] Test (`tests/detail.test.js`): after open then close, focus returns to the opener (simulate with a button); Tab from the last focusable wraps to the first.
- [ ] Commit `fix(a11y): focus trap, focus restore and background inert for modals`.

**Acceptance:** Keyboard users stay inside the dialog and land back on the opener on close.

### Task 5: Court color legend + non-color cue
**Files:** Modify `index.html` (legend container in `#controls`), `js/app.js` (render legend), `css/constellation.css` + `css/layout.css` (legend + dot court glyph).
- [ ] Add a small legend by the court filter: "● CJEU — EU law   ● ECtHR — human rights", colored swatches using `--pillC`/`--pillE`.
- [ ] Add a non-color cue to dots: a tiny ring style difference — `.cjeu .core::after{content:''}` solid ring vs `.echr .core` dashed ring (or a 1-letter glyph "E"/"H"). Keep subtle.
- [ ] Verify legend visible in all lenses; cue distinguishes courts in greyscale (screenshot + desaturate check).
- [ ] Commit `feat(a11y): court legend and non-color court cue on dots`.

**Acceptance:** CJEU/ECtHR distinguishable without relying on color.

---

## Batch B — usable by everyone

### Task 6: Touch support for labels & relationships
**Files:** Modify `js/app.js` (touch/focus wiring), `js/lenses/map.js` (highlight on focus), `css/constellation.css` (`@media (pointer:coarse)` always-on titles).
- [ ] In `@media (pointer:coarse)`, reveal `.dot-title` in every constellation lens (not just timeline) at a smaller size; ensure they don't overflow (clip in scroller).
- [ ] Map highlight: also trigger `ctx._mapHover(i)` on node `focus` (keyboard + tap) and clear on `blur`, in addition to mouseenter/leave.
- [ ] Verify on `preview_resize` mobile preset: dot labels visible; focusing a map dot highlights its connections.
- [ ] Commit `feat: touch/keyboard support for dot labels and map relationships`.

**Acceptance:** On a phone you can read dot names and see connections without a mouse.

### Task 7: 44px touch targets
**Files:** Modify `css/constellation.css` (dot hit area), `css/layout.css` (swatches, lang/court pills).
- [ ] Give `.node` an invisible ≥44px hit area via `.node::before{content:'';position:absolute;inset:-13px}` (18px+26=44) with `pointer-events:auto` on the core wrapper; ensure it doesn't block neighbors (keep it on the focusable core, not overlapping siblings — test clicks still select the right dot).
- [ ] Increase `.sw` (swatches) to 28px with a 44px padded hit area; increase `.lang`/`.cf` vertical padding to reach ~40-44px height.
- [ ] Verify taps on mobile preset hit the intended target; dots still select correctly.
- [ ] Commit `fix(a11y): ≥44px touch targets for dots, swatches and pills`.

**Acceptance:** Interactive controls meet the 44px minimum.

### Task 8: Surface case substance by default
**Files:** Modify `js/detail.js`, `css/detail.css`.
- [ ] Render **facts** and the **"the violation"** callout outside the `<details>` (always visible). Keep `legalBasis`, `related cases`, `execution`, `links` inside a `<details open>` labelled "Execution, sources & related" — OR drop `<details>` entirely and use headed sections with the deep parts visually de-emphasised. Choose the headed-sections approach for clarity.
- [ ] Adjust `css/detail.css` spacing for the new flat structure.
- [ ] Update `tests/detail.test.js` expectations (facts/violation present without expanding).
- [ ] Commit `feat(ux): show facts and the violation by default in case detail`.

**Acceptance:** Opening a case shows the substance immediately.

### Task 9: Sensible default lens, clearer names, per-lens caption
**Files:** Modify `js/app.js` (boot lens → `time`; caption element + per-lens text), `data/ui.js` (rename `map` label EN→"Connections"/PL→"Powiązania"; add `captions`), `index.html` (caption container), `css/constellation.css` (caption style).
- [ ] Change boot from `sw.switchTo('map')` / `setActive(...map)` to `time`.
- [ ] Rename the `map` lens label to "Connections" (EN) / "Powiązania" (PL). Keep internal key `map`. **Do NOT rename "Execution".**
- [ ] Add `ui.captions` per lens (one line each, EN+PL) explaining what the view encodes; render under the controls and update on lens switch.
- [ ] Verify caption updates per lens; Timeline is the landing view.
- [ ] Commit `feat(ux): default to Timeline, rename Map→Connections, add per-lens captions`.

**Acceptance:** First view is legible; every lens explains itself in one line.

### Task 10: Typography & focus-ring legibility
**Files:** Modify `css/constellation.css`, `css/detail.css`, `css/layout.css`, `css/tokens.css` (add `--focus` token).
- [ ] Raise the smallest readable text: dot titles 11→12.5px, event labels 11→12px, tooltips →13px, meta rows →13px, disclaimer →12.5px; bump weight 300→400 for body/UI text users must read.
- [ ] Add `--focus` token (high-contrast: nocturne/obsidian/aurora `#cfe0ff`-ish ≥3:1; daylight `#1b4fd0`) and use it for all `:focus-visible` outlines instead of `--sub`; thicken to 2.5px.
- [ ] Verify focus ring visible in all themes; text larger.
- [ ] Commit `fix(a11y): larger UI text and high-contrast focus rings`.

**Acceptance:** No essential text below ~12px; focus clearly visible.

---

## Batch C — bigger bets & remaining polish

### Task 11: Curated "Story in 6 cases" guided path
**Files:** Create `data/story.js` (ordered ids + connective EN/PL narration), `js/story.js` (renderer/stepper), Modify `index.html` (entry button in primer/hero + story container), `css/*`, `js/app.js` (wire). Test `tests/story.test.js` (ordered ids all exist; narration has en+pl).
- [ ] Define 6–8 landmark cases with 1–2 sentence connective narration between them.
- [ ] Build a stepper: prev/next, progress, each step shows the case lead + "open full case", with narration. Keyboard accessible; reduced-motion safe.
- [ ] Entry CTA in the hero ("Start with the story →").
- [ ] Commit `feat(ux): guided "Story in N cases" path`.

### Task 12: Global search, standalone glossary, plain-English lead
**Files:** Modify `js/app.js` (global search in controls), `js/lenses/list.js` (reuse `filterCases`), Create `js/glossary-view.js` + glossary lens/button, Modify `data/cases.js` (add `plain` one-liner per case) + `js/detail.js` (render `plain` first). Test updates.
- [ ] Promote search to the controls bar; submitting switches to a results list (reuse `filterCases`).
- [ ] Add a glossary view/button listing every term + definition (from `data/glossary.js`).
- [ ] Add `plain:{en,pl}` to each case (one plain-English sentence) and render it as the lead, with the existing `summary` below.
- [ ] Commit in 2–3 smaller commits (search; glossary; plain leads).

### Task 13: Responsive cluster layouts
**Files:** Modify `js/lenses/theme.js`, `js/lenses/court.js`.
- [ ] Compute columns/rows and spacing from `ctx.width` and item count; handle multi-theme cases (duplicate node or mark primary). Ensure clusters fit the stage / grow it like the timeline does.
- [ ] Verify on mobile + desktop presets; add cases mentally to confirm scaling.
- [ ] Commit `fix(ux): responsive By-Theme / By-Court cluster layouts`.

### Task 14: Remaining polish (group commit)
**Files:** `css/layout.css` (hero CTA + scroll cue, shorten first-visit copy via `js/ui-chrome.js`, forced-colors hero fallback), `css/detail.css`/`css/constellation.css` (reduced-motion for card slide + edge fades), `js/app.js`/`js/i18n.js` (auto-language from `navigator.language` on first visit, respect stored choice), `index.html` (self-host or system-font fallback), `js/lenses/timeline.js` (faint date leader lines).
- [ ] Hero: reduce to ~72vh, add "Explore the cases ↓" button scrolling to controls + a scroll indicator.
- [ ] First-visit banner: one short line; full legal text stays in footer (`js/ui-chrome.js`).
- [ ] `@media (forced-colors:active)` restores solid `color` on `.hero-title`.
- [ ] Gate `.card` transition + map edge fade behind reduced-motion.
- [ ] Auto-detect language on first visit (store choice).
- [ ] Timeline: faint leader line from each de-collided dot to its true year on the axis.
- [ ] Commit `fix(ux/a11y): hero CTA, lighter first-visit, forced-colors, reduced-motion, auto-lang, timeline date leaders`.

---

## Self-review notes
- Spec coverage: every numbered critique item (1–26) maps to a task (Execution rename intentionally dropped per user). 6→T9, 7→T5, 8→T8, 5→T3, 4→T4, 1→T1, 23→T2, 2→T6, 3→T7, 18/21→T10, 9→T11, 11/14/16→T12, 12→T13, 13/15/20/25/26/17/22→T14 (22 SR landmarks/tabpanel also in T14).
- Add SR tabpanel wiring to T14 (`#scroller` `role="tabpanel"` + `aria-labelledby` active tab; visually-hidden `<h2>`; polite live region announcing lens changes).
- Keep "Execution" everywhere.
