# Rule of Law Explainer — Design Spec

**Date:** 2026-06-02
**Status:** Approved (pending final spec review)
**Author:** Drafted with Claude; content to be verified by the project owner (legal reviewer).

---

## 1. Purpose

A simple, elegant, **publicly hosted** webpage that explains the Polish **Rule of Law crisis** and the body of **ECtHR and CJEU judgments** it produced — in plain terms, with strong visual aids.

The cases are numerous, complex, and similar to one another. The site's core job is to make them **clear and distinct** without sacrificing **thoroughness**: a high-school student should understand the default layer; a lawyer should find real depth one click away.

### Success criteria
- A newcomer can explain, after one visit, *what the crisis was* and *why these courts got involved*.
- All significant ECtHR + CJEU rule-of-law cases are covered (comprehensive), yet none "blur together."
- The relationships between judgments are **visible**, not just described.
- The **execution/remedy** status of each judgment is shown — the dimension most explainers omit.
- Works fully in **English and Polish**.
- Loads fast, hosts free, and stays maintainable for years (no build rot).

---

## 2. Audience & language

- **Mixed audience**, served by a two-layer content model:
  - **Glance layer** — plain language, no jargon, for the general public / students / journalists.
  - **Deep layer** — legal detail, doctrine, citations, for lawyers and clerks.
- **Bilingual EN + PL** with a language toggle. *Every* piece of prose (summaries, theme descriptions, glossary, UI strings, disclaimer) exists in both languages. This is the single largest content cost and is planned for explicitly.

---

## 3. Information architecture

```
┌─────────────────────────────────────────────────────────┐
│  HERO  (cinematic, scroll-driven)                         │
│  INTRO PRIMER                                             │
│   • "What is the Rule of Law?"                            │
│   • "How these two courts work" (CJEU vs ECtHR)           │
├─────────────────────────────────────────────────────────┤
│  LENS SWITCHER  (re-renders the same shared case set)     │
│   1. Map        – relationship graph (force layout)       │
│   2. By Theme   – grouped by part of the system attacked  │
│   3. Timeline   – axis + key political events             │
│   4. By Court   – CJEU vs ECtHR                           │
│   5. All        – filterable / searchable list            │
│   6. Execution  – remedy & supervision status board       │
├─────────────────────────────────────────────────────────┤
│  CASE DETAIL  (glance card → expandable deep layer)       │
├─────────────────────────────────────────────────────────┤
│  PERSISTENT DISCLAIMER (footer) + first-visit notice      │
└─────────────────────────────────────────────────────────┘
```

**Single source of truth:** all six lenses render from one shared data set. Adding/editing a case = editing one record; it appears correctly everywhere. This guarantees cross-view consistency and is the architectural backbone of the whole project.

### The four "battlefield" themes
1. **Constitutional Tribunal capture**
2. **Supreme Court & National Council of the Judiciary (KRS)**
3. **Disciplining judges** (incl. the "muzzle law")
4. **Forced retirements / removals**

(Themes are data, not hardcoded — they can be adjusted as research refines the grouping.)

---

## 4. Data model

All prose fields are bilingual objects `{ en, pl }`.

### 4.1 Case record
```jsonc
{
  "id": "C-791/19",                  // case number or application number
  "court": "CJEU" | "ECtHR",
  "procedureType": { en, pl },       // e.g. infringement action / individual application / preliminary ruling / Grand Chamber
  "date": "2021-07-15",
  "shortName": { en, pl },           // e.g. "Commission v. Poland"
  "themes": ["disc"],                // one or more theme keys
  "outcome": { en, pl },             // 3-word verdict, e.g. "Infringement found"
  "summary": { en, pl },             // SNAPSHOT: 1–3 sentences — what happened AND why it was a violation (glance layer)

  // pronunciation aid (EN version only)
  "pronunciation": {
    "phonetic": "yoosh-CHIH-shin", // English respelling of a hard Polish name
    "audio": "data/audio/<id>.mp3" | null  // spoken clip (ElevenLabs, paid plan, stock voice)
  },

  // deep layer
  "facts":     [ { en, pl }, … ],    // statement of facts, ~6 bullet points
  "violation": { en, pl },           // 1–3 sentences of legal analysis (which right, why breached)
  "legalBasis": [ { ref, gloss } ],  // e.g. "Art. 19(1) TEU", links to glossary

  "relationships": [
    { "targetId": "C-585/18", "type": "buildsOn", "note": { en, pl } }
  ],

  "execution": {
    "individualMeasures": { en, pl },   // redress for the applicant
    "generalMeasures":    { en, pl },   // EXTRACTED FROM the Committee of Ministers' resolutions/decisions
    "doneSoFar":          { en, pl },   // from Poland's action plans/reports + CM resolutions
    "status": "open" | "partial" | "closed",
    "supervision": {
      "body": "Committee of Ministers" | "European Commission",
      "procedure": "enhanced" | "standard" | null,
      "caseGroup": "Reczkowicz group" | null,
      "latestAction": { "date": "2024-03", "text": { en, pl } }
    }
  },

  "links": [ { "label": { en, pl }, "url": "https://..." } ]
  // judgment text (CURIA/HUDOC), HUDOC-EXEC page, CM decision, trusted explainer
}
```

### 4.2 Relationship types (Map edges)
`buildsOn` · `sameTarget` · `crossCourtEcho` · `consolidatedBy` · `proceduralSequel` · `conflict`. Each rendered with a distinct style and explained in the Map legend, so the legend itself teaches how European case law compounds.

### 4.3 Supporting data files
- **glossary** — `term → { definition: {en,pl}, longName: {en,pl} }` (CM, KRS, enhanced supervision, pilot judgment, Art. 19(1) TEU, Art. 47 Charter, Art. 6 ECHR, …).
- **events** — key political events for the Timeline: `{ date, label: {en,pl} }`.
- **themes** — `{ key, name: {en,pl}, description: {en,pl} }`.
- **ui-strings** — all interface labels in `{en,pl}`.
- **primer** — the two intro explainers in `{en,pl}`.

---

## 5. Cross-cutting features

### 5.1 Glossary tooltips
Defined terms get a dotted underline. **Hover (desktop) / tap (mobile)** reveals a short plain-language definition + full name, in the active language. Defined once in the glossary file, referenced everywhere by key.

### 5.2 Official links
Every case surfaces authoritative links (judgment text, HUDOC-EXEC, CM decision, trusted explainer). Open in a new tab, clearly external.

### 5.3 Disclaimer (mandatory)
Unavoidable and prominent:
- **First-visit notice** (dismissible) on load.
- **Permanent footer** on every screen.
- Wording (EN + PL): the information is **informative only**, gathered from **publicly accessible sources**, **may be inaccurate or out of date**, is **not legal advice** and is **by no means authoritative**; for any legal matter consult the official judgment and a qualified lawyer.

---

## 6. Visual design

- **Direction:** Apple-keynote — cinematic hero, big confident typography, generous negative space, scroll-driven section reveals, each major theme introduced like a product moment.
- **The constellation:** cases as nodes that **fluidly re-cluster** (staggered, eased motion) when the lens changes; gentle idle "breathing"; hover labels; click → detail card. Layered transforms so idle motion never fights the regroup animation.
- **Map lens:** force-directed graph; hover a node to highlight its connections and dim the rest.
- **Timeline lens:** real horizontal axis, scrollable/long, year ticks, case-nodes above the line, **key political events** as markers below it — so cause (government move) and effect (court ruling) align.
- **Execution lens:** status board with summary tiles, a "shared root cause" banner, theme-grouped rows showing status pill + supervising body's latest word; "RECENT" tags for new judgments.
- **Themes:** 4 switchable palettes — **Nocturne**, **Obsidian**, **Daylight**, **Aurora** — via CSS variables; instant re-skin; all lenses hold together in each.
- **Responsive:** mobile gets tap tooltips, stacked layouts, a simplified Map.
- **Motion:** respects `prefers-reduced-motion`.

---

## 7. Technical architecture

- **Plain static site: HTML + CSS + vanilla JavaScript, no build step.** Hosts free on GitHub Pages / Netlify; no dependencies to update; editable by changing a data file.
- **Structure:**
  ```
  index.html
  css/        theme variables + components
  js/         render core + one module per lens + glossary + i18n + router
  data/       cases.*, glossary.*, themes.*, events.*, ui-strings.*, primer.*  (each with en/pl)
  assets/     icons, any SVG illustration
  ```
- **Rendering core** reads the data set and hands it to whichever lens module is active. Lens modules are independent and testable in isolation (clear input: case set + container; clear output: rendered + animated view).
- **i18n:** a tiny helper resolves `{en,pl}` against the active language; toggling re-renders without reload.
- **No backend.** Everything client-side and cacheable.

---

## 8. Content & accuracy methodology

- **Division of labour (approach A):** Claude researches and drafts every case from sources; the **project owner verifies** as the legal authority before content ships.
- **Sourcing hierarchy:**
  - **Primary / authoritative** (hard facts — case number, date, holding, execution status): **CURIA** (CJEU), **HUDOC** (ECtHR), **HUDOC-EXEC** + CM documents (execution).
  - **Trusted secondary** (plain-language framing, relationship mapping): European Commission Rule of Law Reports, Venice Commission opinions, reputable scholarship (e.g. Verfassungsblog, EU Law Live), quality journalism.
- **Verification:** every hard fact cross-checked against the primary source; relationships derived from the judgments' own citations + scholarship. An **adversarial fact-check pass** runs before any case is marked verified.
- **Currency:** includes 2024–2025 developments (e.g. *Biliński v. Poland*, *Sobczyńska and Others v. Poland*); schema lets new judgments slot in cleanly.
- **Provenance:** each case stores its source links so claims are traceable.

---

## 9. Accessibility

- WCAG-minded colour contrast across all four themes.
- Keyboard navigable (lenses, nodes, tooltips, language/theme toggles).
- Screen-reader friendly (semantic structure; the visual Map has an accessible list equivalent — the "All" lens).
- `prefers-reduced-motion` disables non-essential animation.

---

## 10. Build sequence

1. **Scaffold** — repo layout, data schemas, theming system, i18n helper, disclaimer + first-visit notice.
2. **Constellation engine** — render core + node system + lens switcher; implement all 6 lenses with placeholder data.
3. **Case detail** — glance card → deep layer; glossary tooltip system; links.
4. **Execution lens** — status board + per-case execution block wired to data.
5. **Research & populate (EN)** — all cases drafted from sources, with links; adversarial fact-check.
6. **Polish translation** — every string to PL.
7. **Accuracy review** — owner verifies content & translation; corrections applied.
8. **Polish & ship** — responsiveness, accessibility, performance; deploy to GitHub Pages/Netlify.

---

## 11. Risks & open questions

- **Accuracy is paramount.** Legal content drafted by an AI must be owner-verified before publication; the disclaimer mitigates but does not remove this duty.
- **Execution data is volatile** — CM decisions and compliance status change; the page reflects a snapshot (dated) and should note "last updated."
- **Scope creep on case count** — comprehensive coverage is the goal, but each case is bilingual + verified; populating is the long pole. (Mitigation: build the engine first with a curated subset, then expand — every case is just data.)
- **Open:** final list of cases to include (to be fixed during research step 5); exact theme grouping may shift slightly as research firms up.

---

*This spec consolidates decisions validated interactively via the visual brainstorming companion (structure, view-switcher, Apple-style direction, the case constellation, the relationship Map, theme switcher, and the execution overview).*
