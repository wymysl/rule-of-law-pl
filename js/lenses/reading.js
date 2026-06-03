// js/lenses/reading.js
// Further-reading reference panel: curated external links grouped by theme.
// Like the glossary it renders into its own mount and hides the dot stage.
import { t } from '../i18n.js';

export function render(ctx) {
  const { reading, lang, readingMount } = ctx;
  ctx.stage.style.display = 'none';
  readingMount.hidden = false;
  readingMount.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'reading-list';

  const intro = document.createElement('p');
  intro.className = 'reading-intro';
  intro.textContent = t(reading.intro, lang);
  wrap.appendChild(intro);

  reading.groups.forEach(g => {
    const sec = document.createElement('section');
    sec.className = 'read-group';
    const h = document.createElement('h3');
    h.className = 'read-group-h';
    h.textContent = t(g.title, lang);
    sec.appendChild(h);
    g.items.forEach(it => {
      const a = document.createElement('a');
      a.className = 'read-item';
      a.href = it.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      const main = document.createElement('span'); main.className = 'read-main';
      const lab = document.createElement('span'); lab.className = 'read-label'; lab.textContent = it.label;
      const src = document.createElement('span'); src.className = 'read-src'; src.textContent = it.source;
      main.append(lab, src);
      const arr = document.createElement('span'); arr.className = 'read-arr'; arr.setAttribute('aria-hidden', 'true'); arr.textContent = '↗';
      a.append(main, arr);
      sec.appendChild(a);
    });
    wrap.appendChild(sec);
  });
  readingMount.appendChild(wrap);
}

export function clear(ctx) {
  ctx.readingMount.hidden = true;
  ctx.readingMount.innerHTML = '';
  ctx.stage.style.display = '';
}
