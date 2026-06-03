// js/glossary.js
import { t } from './i18n.js';

export function lookupTerm(glossary, key, lang) {
  const g = glossary[key];
  if (!g) return null;
  return {
    longName: t(g.longName, lang),
    definition: t(g.definition, lang),
    quote: g.quote ? { text: t(g.quote.text, lang), source: g.quote.source } : null,
  };
}

export function buildGlossaryEl(glossary, key, displayText, lang) {
  const span = document.createElement('span');
  span.className = 'gloss';
  const info = lookupTerm(glossary, key, lang);
  if (!info) { span.textContent = displayText; return span; } // unknown key: inert, not focusable
  span.tabIndex = 0;
  span.setAttribute('aria-label', `${info.longName}: ${info.definition}`);
  span.textContent = displayText;
  // Build the tooltip with DOM nodes (no innerHTML) so legal text containing
  // <, >, & or quotes is rendered literally and can never inject markup.
  const tip = document.createElement('span');
  tip.className = 'gloss-tip';
  tip.setAttribute('role', 'tooltip');
  const strong = document.createElement('strong');
  strong.textContent = info.longName;
  tip.append(strong, document.createElement('br'), document.createTextNode(info.definition));
  if (info.quote) {
    const q = document.createElement('span');
    q.className = 'gloss-quote';
    q.textContent = `“${info.quote.text}”${info.quote.source ? ' — ' + info.quote.source : ''}`;
    tip.appendChild(q);
  }
  span.appendChild(tip);
  return span;
}
