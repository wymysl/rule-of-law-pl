// js/app.js
import { loadData } from './data.js';
import { t, langState, setLang } from './i18n.js';
import { createNodes, setTip } from './nodes.js';
import { makeSwitcher } from './switcher.js';
import { makeDetail } from './detail.js';
import { makeEventCard } from './event-card.js';
import * as spine from './lenses/spine.js';
import * as timeline from './lenses/timeline.js';
import * as list from './lenses/list.js';
import * as execution from './lenses/execution.js';
import * as glossaryView from './lenses/glossary-view.js';
import * as reading from './lenses/reading.js';
import { renderHero, renderPrimer, renderDisclaimer, maybeFirstVisit, setupScrollReveal } from './ui-chrome.js';
import { initTooltips } from './tooltips.js';
import { makeStory } from './story.js';

const data = loadData();
const stage = document.getElementById('stage');
const scroller = document.getElementById('scroller');
const svg = document.getElementById('edges');
const axis = document.getElementById('axis');
const casesById = new Map(data.cases.map(c => [c.id, c]));

function mk(cls){ const d = document.createElement('div'); d.className = cls; stage.appendChild(d); return d; }
const labels = new Map();
data.themes.forEach(th => labels.set('th_' + th.key, mk('label')));
const ticks = {};
[2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026].forEach(y => { const el = mk('tick'); el.textContent = y; ticks[y] = el; });
const eventEls = data.events.map(() => {
  const el = mk('event');
  el.innerHTML = '<div class="dia"></div><div class="conn"></div><div class="etxt"></div>';
  return el;
});

const listMount = document.getElementById('list-mount');
const execMount = document.getElementById('exec-mount');
const glossMount = document.getElementById('gloss-mount');
const spineMount = document.getElementById('spine-mount');
const readingMount = document.getElementById('reading-mount');
const detail = makeDetail(document.getElementById('detail'), data.glossary, data.ui, casesById);

function onSelect(c){ detail.open(c, langState.current); }
const nodes = createNodes(data.cases, stage, onSelect); // parallel to data.cases (the full set)
data.cases.forEach((c, i) => setTip(nodes[i], t(c.shortName, langState.current)));

// clickable timeline landmarks
const eventCard = makeEventCard(document.getElementById('detail'), data.glossary, data.ui, casesById);
const story = makeStory(document.getElementById('story'), { story: data.story, casesById, ui: data.ui }, onSelect);
data.events.forEach((ev, i) => {
  const el = eventEls[i];
  el.tabIndex = 0; el.setAttribute('role', 'button');
  el.setAttribute('aria-label', t(ev.label, langState.current));
  const openEv = () => eventCard.open(ev, langState.current, onSelect);
  el.addEventListener('click', openEv);
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEv(); } });
});

let courtFilter = null; // null = all | 'CJEU' | 'ECtHR'
let searchQuery = '';   // global search, drives the All list

const ctx = {};
function getCtx(){
  // apply the global court filter: ctx.cases and ctx.nodes stay parallel, excluded nodes are hidden
  const activeIdx = data.cases.map((_, i) => i).filter(i => !courtFilter || data.cases[i].court === courtFilter);
  nodes.forEach((n, i) => { n.style.display = (!courtFilter || data.cases[i].court === courtFilter) ? '' : 'none'; });
  Object.assign(ctx, {
    cases: activeIdx.map(i => data.cases[i]), nodes: activeIdx.map(i => nodes[i]),
    stage, svg, axis, labels, ticks, eventEls,
    themes: data.themes, events: data.events, ui: data.ui, glossary: data.glossary,
    lang: langState.current, listMount, execMount, glossMount, spineMount, readingMount, onSelect, height: 560,
    width: scroller.clientWidth, query: searchQuery,
    reading: data.reading,
  });
  stage.style.width = ctx.width + 'px';
  stage.dataset.lens = (typeof sw !== 'undefined' && sw.current) || '';
  return ctx;
}

const sw = makeSwitcher({ spine, time: timeline, all: list, exec: execution, gloss: glossaryView, reading }, getCtx);

// map-lens connection highlight — on hover AND on focus (keyboard + touch tap),
// using the node's index within the (filtered) active set
nodes.forEach((n) => {
  const hi = () => { const i = ctx.nodes.indexOf(n); if (sw.current === 'map' && i >= 0 && ctx._mapHover) ctx._mapHover(i); };
  const lo = () => { if (sw.current === 'map' && ctx._mapClearHover) ctx._mapClearHover(); };
  n.addEventListener('mouseenter', hi);
  n.addEventListener('mouseleave', lo);
  n.addEventListener('focusin', hi);   // focusin bubbles from the inner .core
  n.addEventListener('focusout', lo);
});

// lens tabs (keys match data.ui.lenses keys)
const tabsEl = document.getElementById('lens-tabs');
['spine','time','all','exec','gloss','reading'].forEach(key => {
  const b = document.createElement('button');
  b.className = 'tab'; b.dataset.view = key; b.type = 'button'; b.setAttribute('role','tab'); b.setAttribute('aria-controls','scroller');
  b.textContent = t(data.ui.lenses[key], langState.current);
  b.addEventListener('click', () => { setActive(b); navigate(key); });
  tabsEl.appendChild(b);
});

// persistent way back into the guided story from any lens
const storyBtn = document.createElement('button');
storyBtn.id = 'story-link'; storyBtn.className = 'story-link'; storyBtn.type = 'button';
function labelStoryBtn(){
  storyBtn.innerHTML = '';
  const tri = document.createElement('span'); tri.className = 'tri'; tri.setAttribute('aria-hidden', 'true'); tri.textContent = '\u25B6';
  storyBtn.append(tri, document.createTextNode(langState.current === 'pl' ? 'Czytaj historię' : 'Read the story'));
}
labelStoryBtn();
storyBtn.addEventListener('click', () => story.open(langState.current));
document.getElementById('toggles').appendChild(storyBtn);

// global search — typing jumps to the All list and filters it live (from any lens)
const searchEl = document.createElement('input');
searchEl.id = 'global-search'; searchEl.type = 'search';
searchEl.setAttribute('aria-label', t(data.ui.search, langState.current));
searchEl.placeholder = t(data.ui.search, langState.current);
document.getElementById('controls').insertBefore(searchEl, document.getElementById('toggles'));
searchEl.addEventListener('input', () => {
  searchQuery = searchEl.value;
  if (sw.current !== 'all') { setActive(tabsEl.querySelector('[data-view="all"]')); navigate('all'); }
  else { sw.switchTo('all'); updateCaption(); }
});
function updateCaption(){
  const cap = document.getElementById('lens-caption');
  if (cap) cap.textContent = t(data.ui.captions[sw.current], langState.current);
  const sc = document.getElementById('scroller');               // name the panel for screen readers
  if (sc) sc.setAttribute('aria-label', t(data.ui.lenses[sw.current], langState.current));
}
function setActive(b){
  tabsEl.querySelectorAll('.tab').forEach(x => { x.classList.remove('active'); x.setAttribute('aria-selected','false'); });
  b.classList.add('active'); b.setAttribute('aria-selected','true');
}
function relabelTabs(){ tabsEl.querySelectorAll('.tab').forEach(b => { b.textContent = t(data.ui.lenses[b.dataset.view], langState.current); }); }

// language toggle
const langEl = document.getElementById('lang-toggle');
['en','pl'].forEach(l => {
  const b = document.createElement('button'); b.className = 'lang' + (l === 'en' ? ' active' : ''); b.type = 'button';
  b.textContent = l.toUpperCase(); b.setAttribute('aria-pressed', l === 'en' ? 'true' : 'false');
  b.addEventListener('click', () => switchLang(l, b)); langEl.appendChild(b);
});
// initial language: stored choice wins; otherwise follow the browser on first visit
(function pickInitialLang(){
  let lang = null;
  try { const s = localStorage.getItem('rol-lang'); if (s === 'en' || s === 'pl') lang = s; } catch (e) {}
  if (!lang && (navigator.language || '').toLowerCase().startsWith('pl')) lang = 'pl';
  if (lang && lang !== langState.current) {
    setLang(lang); document.documentElement.lang = lang; document.body.dataset.lang = lang;
    langEl.querySelectorAll('.lang').forEach((x, i) => {
      const on = (i === 0 ? 'en' : 'pl') === lang;
      x.classList.toggle('active', on); x.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    data.cases.forEach((c, i) => setTip(nodes[i], t(c.shortName, lang)));
  }
})();
function switchLang(l, b){
  try { localStorage.setItem('rol-lang', l); } catch (e) {}
  setLang(l); document.documentElement.lang = l; document.body.dataset.lang = l;
  langEl.querySelectorAll('.lang').forEach(x => { x.classList.remove('active'); x.setAttribute('aria-pressed','false'); });
  b.classList.add('active'); b.setAttribute('aria-pressed','true');
  data.cases.forEach((c, i) => setTip(nodes[i], t(c.shortName, l)));
  searchEl.placeholder = t(data.ui.search, l); searchEl.setAttribute('aria-label', t(data.ui.search, l));
  renderChrome(); renderLegend(); relabelTabs(); relabelCourtFilter(); labelStoryBtn(); sw.switchTo(sw.current); updateCaption();
  // renderChrome() rebuilds the hero/primer as fresh .reveal elements (opacity 0);
  // the scroll observer only watches the originals, so re-show them after re-render.
  document.querySelectorAll('#hero .reveal, #primer .reveal').forEach(n => n.classList.add('in'));
}

// court filter (applies across every lens)
const toggles = document.getElementById('toggles');
const courtEl = document.createElement('div');
courtEl.id = 'court-filter';
courtEl.setAttribute('role', 'group');
toggles.insertBefore(courtEl, toggles.firstChild);
const COURT_OPTS = [{ val: null, key: 'allCourts' }, { val: 'CJEU', label: 'CJEU' }, { val: 'ECtHR', label: 'ECtHR' }];
COURT_OPTS.forEach((o, i) => {
  const b = document.createElement('button');
  b.className = 'cf' + (i === 0 ? ' active' : ''); b.type = 'button';
  b.dataset.court = o.val == null ? '' : o.val;
  b.textContent = o.label || t(data.ui[o.key], langState.current);
  b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
  b.addEventListener('click', () => setCourtFilter(o.val, b));
  courtEl.appendChild(b);
});
function setCourtFilter(val, btn){
  courtFilter = val;
  ctx._edges = null; ctx._adj = null; ctx._recompute = true; // rebuild the map graph for the new set
  courtEl.querySelectorAll('.cf').forEach(x => { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); });
  btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true');
  sw.switchTo(sw.current);
}
function relabelCourtFilter(){
  const allBtn = courtEl.querySelector('.cf[data-court=""]');
  if (allBtn) allBtn.textContent = t(data.ui.allCourts, langState.current);
  courtEl.setAttribute('aria-label', t(data.ui.courtFilter, langState.current));
}
relabelCourtFilter();

function renderChrome(){
  renderHero(document.getElementById('hero'), data.primer, langState.current);
  renderPrimer(document.getElementById('primer'), data.primer, langState.current);
  renderDisclaimer(document.getElementById('disclaimer'), data.primer, langState.current);
  const cta = document.querySelector('.hero-cta');         // hero renders fresh each time → re-wire
  if (cta) cta.addEventListener('click', () => story.open(langState.current));
}

// court colour key — colour PLUS a ring-style cue (solid vs dashed) so the
// CJEU/ECtHR distinction survives colour-blindness and forced-colors mode.
function renderLegend(){
  const lg = document.getElementById('legend');
  const lang = langState.current;
  const item = (cls, court, descKey) =>
    `<span class="lg-item"><span class="lg-dot ${cls}"></span>${court} — ${t(data.ui.legend[descKey], lang)}</span>`;
  lg.innerHTML = item('cjeu', 'CJEU', 'cjeu') + item('echr', 'ECtHR', 'echr');
}

let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { if (sw.current === 'map') ctx._recompute = true; sw.switchTo(sw.current); }, 150);
});

// ---- shared-element (FLIP) transitions between views ----
// Each case-bearing view tags its per-case element with data-id and carries a
// small "dot" (the timeline node's core, a spine/list dot, or the exec court
// badge). On a lens change we capture every case dot's document position before
// and after the switch, then fly a coloured token from old → new while the
// incoming layout cross-fades — so the cases appear to rearrange and morph.
const FLIP_DUR = 950;
const flipLayer = document.getElementById('flip-layer');
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function caseAnchors() {
  const m = new Map();
  scroller.querySelectorAll('[data-id]').forEach(elm => {
    const id = elm.dataset.id;
    if (!casesById.has(id)) return;
    const dot = elm.classList.contains('node')
      ? elm.querySelector('.core')
      : (elm.querySelector('.sc-dot,.cr-dot,.badge') || elm);
    const r = dot.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    m.set(id, {
      x: r.left + window.scrollX + r.width / 2,
      y: r.top + window.scrollY + r.height / 2,
      rad: Math.max(4, Math.min(11, (Math.min(r.width, r.height) / 2) || 6)),
      court: casesById.get(id).court === 'CJEU' ? 'cjeu' : 'echr',
    });
  });
  return m;
}

function currentCaseContainer() {
  if (!spineMount.hidden) return spineMount;
  if (!listMount.hidden) return listMount;
  if (!execMount.hidden) return execMount;
  if (!glossMount.hidden) return glossMount;
  return stage;
}

function playFlip(from, to) {
  flipLayer.innerHTML = '';
  const incoming = currentCaseContainer();
  incoming.style.transition = 'none';
  incoming.style.opacity = '0';
  requestAnimationFrame(() => {
    // keep the incoming layout hidden until the dots have all but landed, then
    // fade it in — so the new dots never appear before the old ones find their places.
    incoming.style.transition = `opacity 300ms var(--ease) ${Math.round(FLIP_DUR * 0.95)}ms`;
    incoming.style.opacity = '1';
  });
  const EASE = 'cubic-bezier(.32,.66,.24,1)';
  const VIS = 0.9;
  const ids = [...new Set([...from.keys(), ...to.keys()])];
  ids.forEach((id, i) => {
    const a = from.get(id), b = to.get(id);
    const leaving = !b, entering = !a;
    const start = a || b, end = b || a;
    const ex = end.x - start.x, ey = end.y - start.y;
    const dist = Math.hypot(ex, ey);
    // organic arc: bow perpendicular to the path with a randomised side + amount
    let px = 0, py = 0;
    if (dist > 4) {
      const sign = Math.random() < 0.5 ? 1 : -1;
      const k = Math.max(14, Math.min(120, dist * (0.1 + Math.random() * 0.12))) * sign;
      px = (-ey / dist) * k; py = (ex / dist) * k;
    }
    const s0 = start.rad * 2, s1 = end.rad * 2;
    const sc1 = s1 / s0, scMid = 1 + (sc1 - 1) * 0.5;
    const f = document.createElement('div');
    f.className = 'flier ' + start.court;
    f.style.left = start.x + 'px'; f.style.top = start.y + 'px';
    f.style.width = s0 + 'px'; f.style.height = s0 + 'px';
    flipLayer.appendChild(f);
    const dur = FLIP_DUR * (0.95 + Math.random() * 0.1);
    const delay = Math.min(i * 4, 70) + Math.random() * 40;
    // size animates as part of the same transform (scale) so it grows/shrinks
    // gradually along the whole arc rather than snapping at the end.
    f.animate([
      { transform: 'translate(-50%,-50%) translate(0px,0px) scale(1)', opacity: entering ? 0 : VIS, offset: 0 },
      { transform: `translate(-50%,-50%) translate(${ex / 2 + px}px,${ey / 2 + py}px) scale(${scMid.toFixed(3)})`, opacity: VIS, offset: 0.5 },
      { transform: `translate(-50%,-50%) translate(${ex}px,${ey}px) scale(${sc1.toFixed(3)})`, opacity: leaving ? 0 : VIS, offset: 1 },
    ], { duration: dur, delay, easing: EASE, fill: 'both' });
  });
  setTimeout(() => {
    flipLayer.innerHTML = '';
    incoming.style.transition = ''; incoming.style.opacity = '';
  }, FLIP_DUR + 380);
}

function navigate(key) {
  const prev = sw.current;
  const doSwitch = () => { detail.close(); eventCard.close(); sw.switchTo(key); updateCaption(); };
  if (prev === key || reduceMotion()) { doSwitch(); return; }
  // Lenses without case dots (glossary, reading) switch with a plain cross-fade, never fliers.
  if (key === 'gloss' || prev === 'gloss' || key === 'reading' || prev === 'reading') {
    doSwitch();
    const inc = currentCaseContainer();
    inc.style.transition = 'none'; inc.style.opacity = '0';
    requestAnimationFrame(() => { inc.style.transition = 'opacity 320ms var(--ease)'; inc.style.opacity = '1'; });
    setTimeout(() => { inc.style.transition = ''; inc.style.opacity = ''; }, 380);
    return;
  }
  const from = caseAnchors();
  stage.classList.add('flip-freeze');     // stop timeline nodes double-animating
  doSwitch();
  const to = caseAnchors();
  playFlip(from, to);
  setTimeout(() => stage.classList.remove('flip-freeze'), FLIP_DUR + 420);
}

// boot
initTooltips();
renderChrome();
renderLegend();
maybeFirstVisit(document.getElementById('first-visit'), data.primer, langState.current);
setupScrollReveal();
setActive(tabsEl.querySelector('[data-view="time"]'));
sw.switchTo('time');
updateCaption();
