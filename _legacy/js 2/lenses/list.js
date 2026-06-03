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
  const { cases, lang, ui, listMount, onSelect, query } = ctx;
  // hide the constellation stage and render an HTML list, filtered by the global
  // search query (ctx.query) which is driven from the controls bar.
  ctx.stage.style.display = 'none';
  ctx.nodes.forEach(n => n.style.opacity = '0');
  listMount.hidden = false;
  listMount.innerHTML = '';

  const rows = filterCases(cases, { q: query, court: null, theme: null }, lang);
  if (!rows.length) {
    const p = document.createElement('p');
    p.className = 'list-empty';
    p.textContent = t(ui.noResults, lang);
    listMount.appendChild(p);
    return;
  }
  const ul = document.createElement('ul');
  ul.className = 'case-list'; ul.setAttribute('role', 'list');
  rows.forEach(c => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.className = 'case-row';
    const name = document.createElement('span'); name.className = 'cr-name'; name.textContent = t(c.shortName, lang);
    const meta = document.createElement('span'); meta.className = 'cr-meta'; meta.textContent = `${c.court} · ${c.id}`;
    btn.append(name, meta);
    btn.addEventListener('click', () => onSelect(c));
    li.appendChild(btn);
    ul.appendChild(li);
  });
  listMount.appendChild(ul);
}

export function clear(ctx) {
  ctx.listMount.hidden = true; ctx.listMount.innerHTML = '';
  ctx.stage.style.display = '';
  ctx.nodes.forEach(n => n.style.opacity = '');
}
