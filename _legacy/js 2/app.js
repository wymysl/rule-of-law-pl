// js/app.js
import { loadData } from './data.js';
import { t, langState, setLang } from './i18n.js';
import { createNodes, setTip } from './nodes.js';
import { makeSwitcher } from './switcher.js';
import { makeDetail } from './detail.js';
import { makeEventCard } from './event-card.js';
import * as theme from './lenses/theme.js';
import * as timeline from './lenses/timeline.js';
import * as list from './lenses/list.js';
import * as map from './lenses/map.js';
import * as execution from './lenses/execution.js';
import * as glossaryView from './lenses/glossary-view.js';
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
    lang: langState.current, listMount, execMount, glossMount, onSelect, height: 560,
    width: scroller.clientWidth, query: searchQuery,
  });
  stage.style.width = ctx.width + 'px';
  stage.dataset.lens = (typeof sw !== 'undefined' && sw.current) || '';
  return ctx;
}

const sw = makeSwitcher({ map, theme, time: timeline, all: list, exec: execution, gloss: glossaryView }, getCtx);

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
['map','theme','time','all','exec','gloss'].forEach(key => {
  const b = document.createElement('button');
  b.className = 'tab'; b.dataset.view = key; b.type = 'button'; b.setAttribute('role','tab'); b.setAttribute('aria-controls','scroller');
  b.textContent = t(data.ui.lenses[key], langState.current);
  b.addEventListener('click', () => { detail.close(); eventCard.close(); setActive(b); sw.switchTo(key); updateCaption(); });
  tabsEl.appendChild(b);
});

// global search — typing jumps to the All list and filters it live (from any lens)
const searchEl = document.createElement('input');
searchEl.id = 'global-search'; searchEl.type = 'search';
searchEl.setAttribute('aria-label', t(data.ui.search, langState.current));
searchEl.placeholder = t(data.ui.search, langState.current);
document.getElementById('controls').insertBefore(searchEl, document.getElementById('toggles'));
searchEl.addEventListener('input', () => {
  searchQuery = searchEl.value;
  if (sw.current !== 'all') { detail.close(); eventCard.close(); setActive(tabsEl.querySelector('[data-view="all"]')); }
  sw.switchTo('all'); updateCaption();
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
  renderChrome(); renderLegend(); relabelTabs(); relabelCourtFilter(); sw.switchTo(sw.current); updateCaption();
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

// boot
initTooltips();
renderChrome();
renderLegend();
maybeFirstVisit(document.getElementById('first-visit'), data.primer, langState.current);
setupScrollReveal();
setActive(tabsEl.querySelector('[data-view="time"]'));
sw.switchTo('time');
updateCaption();
