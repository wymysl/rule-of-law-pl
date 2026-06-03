// js/lenses/glossary-view.js
// A standalone reference panel listing every glossary term with its definition
// (and verified quote, where present). Tackles the "acronym soup" problem —
// CJEU, KRS, CERPA, the Articles — in one scannable place.
import { t } from '../i18n.js';

export function render(ctx) {
  const { glossary, lang, glossMount } = ctx;
  ctx.stage.style.display = 'none';
  ctx.nodes.forEach(n => n.style.opacity = '0');
  glossMount.hidden = false;
  glossMount.innerHTML = '';

  const list = document.createElement('div');
  list.className = 'gloss-list';
  for (const g of Object.values(glossary)) {
    const item = document.createElement('div');
    item.className = 'gloss-item';
    const term = document.createElement('h3'); term.className = 'gloss-term';
    term.textContent = t(g.longName, lang);
    const def = document.createElement('p'); def.className = 'gloss-def';
    def.textContent = t(g.definition, lang);
    item.append(term, def);
    if (g.quote) {
      const q = document.createElement('blockquote'); q.className = 'gloss-q';
      const src = g.quote.source ? ` — ${g.quote.source}` : '';
      q.textContent = `“${t(g.quote.text, lang)}”${src}`;
      item.appendChild(q);
    }
    list.appendChild(item);
  }
  glossMount.appendChild(list);
}

export function clear(ctx) {
  ctx.glossMount.hidden = true;
  ctx.glossMount.innerHTML = '';
  ctx.stage.style.display = '';
  ctx.nodes.forEach(n => n.style.opacity = '');
}
