// js/linkify.js
// Scans case prose for known glossary terms and case names and wraps them in
// hover-able links: glossary terms show their definition; case names show that
// case's snapshot and open it on click.
import { t } from './i18n.js';
import { buildGlossaryEl } from './glossary.js';

function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// Words that, on their own, are too generic to identify a single case — several
// cases share them, so an auto-derived alias would mislink (e.g. all four
// "Commission v. Poland (…)" cases reduce to "Commission"). Such cases must carry
// explicit, distinctive `aliases` instead (or none at all).
const GENERIC_ALIAS = new Set(['commission', 'others', 'and others', 'poland']);

export function deriveCaseAliases(c) {
  const en = (c.shortName && c.shortName.en) || '';
  const base = en.replace(/\s+v\.\s+Poland.*$/i, '').trim();
  if (!base || base.length < 4) return [];          // too short to be unambiguous
  if (GENERIC_ALIAS.has(base.toLowerCase())) return []; // ambiguous across cases
  return [base];
}

// Ordered alias list (longest first) so longer phrases win at a given position.
export function buildAliasList(glossary, cases, { excludeCaseId } = {}) {
  const items = [];
  for (const [key, g] of Object.entries(glossary))
    for (const a of (g.aliases || [])) items.push({ alias: a, type: 'gloss', key });
  for (const c of cases) {
    if (excludeCaseId && c.id === excludeCaseId) continue;
    const aliases = (c.aliases && c.aliases.length) ? c.aliases : deriveCaseAliases(c);
    for (const a of aliases) items.push({ alias: a, type: 'case', key: c.id });
  }
  const seen = new Set(), out = [];
  for (const it of items) {
    const k = it.alias.toLowerCase();
    if (!it.alias || seen.has(k)) continue;
    seen.add(k); out.push(it);
  }
  out.sort((a, b) => b.alias.length - a.alias.length);
  return out;
}

// Pure: split text into [{text} | {text,type,key}] non-overlapping segments.
export function tokenize(text, aliasList) {
  if (!text || !aliasList.length) return text ? [{ text }] : [];
  const byLower = new Map(aliasList.map(it => [it.alias.toLowerCase(), it]));
  const pattern = new RegExp('(?<!\\p{L})(' + aliasList.map(it => esc(it.alias)).join('|') + ')(?!\\p{L})', 'giu');
  const segs = []; let last = 0, m;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) segs.push({ text: text.slice(last, m.index) });
    const it = byLower.get(m[0].toLowerCase());
    segs.push(it ? { text: m[0], type: it.type, key: it.key } : { text: m[0] });
    last = m.index + m[0].length;
    if (m.index === pattern.lastIndex) pattern.lastIndex++;
  }
  if (last < text.length) segs.push({ text: text.slice(last) });
  return segs;
}

function buildCaseRef(target, displayText, lang, onOpen) {
  const span = document.createElement('span');
  span.className = 'case-ref';
  span.textContent = displayText;
  if (!target) return span;
  span.tabIndex = 0;
  span.setAttribute('role', 'button');
  span.setAttribute('aria-label', `${t(target.shortName, lang)}: ${t(target.summary, lang)}`);
  const tip = document.createElement('span');
  tip.className = 'ref-tip';
  const name = document.createElement('strong');
  name.textContent = t(target.shortName, lang);
  tip.append(name, document.createElement('br'), document.createTextNode(t(target.summary, lang)));
  span.appendChild(tip);
  const go = () => onOpen && onOpen(target);
  span.addEventListener('click', go);
  span.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  return span;
}

// Returns a DocumentFragment with glossary/case terms linked.
export function buildLinkified(text, { aliasList, glossary, casesById, lang, onOpen }) {
  const frag = document.createDocumentFragment();
  for (const seg of tokenize(text, aliasList)) {
    if (!seg.type) { frag.appendChild(document.createTextNode(seg.text)); continue; }
    if (seg.type === 'gloss') { frag.appendChild(buildGlossaryEl(glossary, seg.key, seg.text, lang)); continue; }
    frag.appendChild(buildCaseRef(casesById.get(seg.key), seg.text, lang, onOpen));
  }
  return frag;
}
