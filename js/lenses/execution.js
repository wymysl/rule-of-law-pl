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
  open:    { en: 'Root cause open', pl: 'Źródło problemu nierozwiązane' },
  partial: { en: 'Partially executed', pl: 'Częściowo wykonane' },
  closed:  { en: 'Closed', pl: 'Zamknięte' },
};
const TILE_LABEL = {
  open:    { en: 'Root cause open', pl: 'Źródło nierozwiązane' },
  partial: { en: 'Partially executed', pl: 'Częściowo' },
  closed:  { en: 'Closed', pl: 'Zamknięte' },
  enhanced:{ en: 'Enhanced supervision', pl: 'Nadzór wzmocniony' },
};

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

export function render(ctx) {
  const { cases, lang, themes, execMount, nodes, onSelect } = ctx;
  ctx.stage.style.display = 'none';
  nodes.forEach(n => n.style.opacity = '0');
  execMount.hidden = false;
  execMount.innerHTML = '';

  const counts = executionCounts(cases);
  const summary = el('div', 'summary');
  [['open', 'n-open'], ['partial', 'n-part'], ['closed', 'n-closed'], ['enhanced', 'n-enh']].forEach(([k, cls]) => {
    const stat = el('div', 'stat');
    stat.append(el('div', 'num ' + cls, String(counts[k])), el('div', 'lbl', t(TILE_LABEL[k], lang)));
    summary.appendChild(stat);
  });
  execMount.appendChild(summary);

  themes.forEach(th => {
    const rows = cases.filter(x => x.themes.includes(th.key) && x.execution);
    if (!rows.length) return;
    const group = el('div', 'exec-group');
    group.appendChild(el('h3', null, t(th.name, lang)));
    rows.forEach(x => {
      const e = x.execution;
      const row = el('button', 'exec-row');
      row.type = 'button';
      row.dataset.id = x.id;
      row.setAttribute('aria-label', t(x.shortName, lang));
      if (onSelect) row.addEventListener('click', () => onSelect(x));

      const left = el('div');
      left.append(el('div', 'case', t(x.shortName, lang)), el('div', 'cid', `${x.court} · ${x.id}`));

      const badge = el('span', 'badge b-' + (x.court === 'CJEU' ? 'cjeu' : 'echr'), x.court);

      const status = el('span', 'status s-' + e.status);
      status.append(el('i', 'pip'), document.createTextNode(t(STATUS_LABEL[e.status], lang)));

      const cm = el('div', 'cm');
      const la = e.supervision && e.supervision.latestAction;
      if (la) {
        cm.append(el('span', 'enh', la.date + ':'), document.createTextNode(' ' + t(la.text, lang)));
      }

      row.append(left, badge, status, cm);
      group.appendChild(row);
    });
    execMount.appendChild(group);
  });
}

export function clear(ctx) {
  ctx.execMount.hidden = true;
  ctx.execMount.innerHTML = '';
  ctx.stage.style.display = '';
  ctx.nodes.forEach(n => n.style.opacity = '');
}
