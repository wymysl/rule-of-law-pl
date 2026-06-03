# Story Mode + By-Court removal + Execution click — Implementation Plan

> Inline execution. Vanilla ES modules, Vitest. Commit each task with tests green. Branch: feat/story-and-fixes.

**Goal:** Add a guided "The crisis in seven judgments" story walkthrough; remove the redundant By-Court lens (the court filter already toggles CJEU/ECtHR); make Execution rows open the case detail.

---

## Feature design — Story mode

A linear, plain-language walkthrough that turns the explorable database into a narrative for newcomers. It is the answer to "for a high-schooler, where do I start?"

**Shape.** An accessible full-screen overlay (a dialog) that shows **one step at a time**. Steps are an ordered arc of landmark judgments with 2–3 sentences of connective narration each, bracketed by an intro and an outro. Each case step also shows a compact snapshot (court pill + short name + one-line summary) and a "See the full case →" action.

**The arc (7 judgments).** capture the Constitutional Tribunal → capture the body that picks judges (KRS) → weaponise it (Disciplinary Chamber) → punish judges who resist → Europe rules the appointments unlawful → reveal the systemic scale → the unfinished reckoning:
1. **Xero Flor** (4907/18) — the captured Constitutional Tribunal isn't a lawful court.
2. **A.K. and Others** (C-585/18) — the KRS is politicised; the CJEU sets the independence test.
3. **Commission v. Poland (Disciplinary Chamber)** (C-791/19) — the punishment chamber; €1m/day fine.
4. **Juszczyszyn** (35599/20) — a judge punished for checking an appointment; the chamber as a weapon.
5. **Reczkowicz** (43447/19) — judges named via the captured KRS aren't a "tribunal established by law".
6. **Wałęsa** (50849/21) — a pilot judgment: the defect taints hundreds of cases; fix the system.
7. **C-521/21** (2026) — ~3,000 "neo-judges"; a flawed appointment isn't auto-disqualifying; pass a law.
Plus an **intro** step (the premise) and an **outro** step (restoration stalled; explore further).

**Interaction.** Prev/Next buttons + ← / → arrow keys; progress "n / N"; Esc closes; focus trapped; background `inert`; reduced-motion safe (no slide animations). "See the full case →" closes the story and opens that case's detail modal (avoids nested dialogs). Bilingual (EN/PL) like everything else.

**Entry.** The hero gets a primary CTA **"Start with the story →"** (opens the overlay) and keeps a secondary "explore the cases ↓" that scrolls to the controls.

---

## Task 1: Remove the redundant By-Court lens
**Files:** `data/ui.js` (drop `lenses.court` + `captions.court`), `js/app.js` (drop court import, switcher entry, tab-list entry, `co_*` label creation), delete `js/lenses/court.js`, update `tests/lenses.test.js` (remove court import + test). Keep the court **filter** (`#court-filter`) untouched.
- [ ] Remove `court` from the lens key array and the `makeSwitcher({...})` map; remove `import * as court`.
- [ ] Remove the `['CJEU','ECtHR'].forEach(c => labels.set('co_'+c, mk('label')))` line.
- [ ] Remove `lenses.court` and `captions.court` from `data/ui.js`.
- [ ] Delete `js/lenses/court.js`; remove its import + the "court lens" test block from `tests/lenses.test.js`.
- [ ] `npm test` green; commit `refactor(ux): remove redundant By-Court lens (the court filter already toggles CJEU/ECtHR)`.

## Task 2: Make Execution rows open the case detail
**Files:** `js/lenses/execution.js` (rows become buttons wired to `ctx.onSelect`), `css/layout.css` (`.exec-row` button reset + hover/focus).
- [ ] Destructure `onSelect` from ctx; render each `.exec-row` as a `<button type=button>` with `aria-label` = short name, click → `onSelect(x)`.
- [ ] CSS: reset button appearance, `width:100%`, `text-align:left`, `cursor:pointer`, hover background, `:focus-visible` outline `var(--focus)`.
- [ ] `npm test` green; commit `feat(ux): open case detail from Execution rows`.

## Task 3: Story script (content)
**Files:** Create `data/story.js`; Test `tests/story.test.js`.
- [ ] `STORY = { title:{en,pl}, steps:[ {caseId, kicker:{en,pl}, heading?:{en,pl}, narration:{en,pl}} ... ] }` with the 9 steps above (intro + 7 cases + outro), full EN+PL.
- [ ] Test: every non-null `caseId` exists in CASES; include STORY in the i18n completeness gate (so all narration has PL).
- [ ] `npm test` green; commit `content: story script — the crisis in seven judgments (EN+PL)`.

## Task 4: Story overlay UI + wiring
**Files:** Create `js/story.js` (`makeStory(mount, data, onCaseOpen)` → `{open}`); `index.html` (`<div id="story">`); `css/story.css` (+ link it); `js/app.js` (instantiate, wire hero CTA); `js/ui-chrome.js` (hero primary "Start with the story" CTA + secondary explore).
- [ ] `makeStory`: render a step (progress, kicker, heading/narration, optional case snapshot + "See the full case →"), Prev/Next, Esc/arrows, focus trap + `setBackgroundInert`, reduced-motion safe. "See the full case" closes story then `onCaseOpen(case)`.
- [ ] Hero CTA opens the story; keep the scroll-to-controls action as a secondary control.
- [ ] Verify served files + boot data contract; `npm test` green; commit `feat(ux): guided story-mode overlay`.

## Wrap
- [ ] Merge feat/story-and-fixes → main, push (redeploys Pages), verify live.
