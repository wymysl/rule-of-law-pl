// js/event-card.js
// Renders a clickable timeline landmark as a card: what happened, the consequence
// (incl. how the courts diagnosed it), and the judgments that followed.
import { t } from './i18n.js';
import { buildAliasList, buildLinkified } from './linkify.js';

const MONTHS = {
  en: ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  pl: ['', 'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'],
};
export function formatEventDate(iso, lang) {
  const [y, m] = String(iso).split('-');
  return m ? `${MONTHS[lang === 'pl' ? 'pl' : 'en'][+m]} ${y}` : y;
}

export function makeEventCard(mount, glossary, ui, casesById) {
  let keyHandler = null;
  let outsideHandler = null;
  let opener = null;
  function open(ev, lang, onCaseOpen) {
    if (!mount.querySelector('.card.show')) opener = document.activeElement;
    const aliasList = buildAliasList(glossary, [...casesById.values()]);
    const lz = (s) => buildLinkified(s, { aliasList, glossary, casesById, lang, onOpen: onCaseOpen });
    mount.innerHTML = `
      <div class="card show" role="dialog" aria-label="" tabindex="-1">
        <button class="close" type="button">×</button>
        <span class="pill event-pill"></span>
        <h3></h3>
        <div class="deep-body"></div>
      </div>`;
    const card = mount.querySelector('.card');
    card.setAttribute('aria-label', t(ev.label, lang));
    const closeBtn = mount.querySelector('.close');
    closeBtn.setAttribute('aria-label', t(ui.close, lang));
    closeBtn.addEventListener('click', close);
    if (keyHandler) document.removeEventListener('keydown', keyHandler);
    keyHandler = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', keyHandler);
    // click anywhere outside the card closes it (pointerdown, so a click on
    // another landmark/case still opens that one straight after).
    if (outsideHandler) document.removeEventListener('pointerdown', outsideHandler);
    outsideHandler = (e) => { if (!mount.contains(e.target)) close(); };
    document.addEventListener('pointerdown', outsideHandler);
    card.focus();
    mount.querySelector('.event-pill').textContent = formatEventDate(ev.date, lang);
    mount.querySelector('h3').textContent = t(ev.label, lang);

    const body = mount.querySelector('.deep-body');
    const block = (labelEN, labelPL, val) => {
      if (!val || !t(val, lang)) return;
      const h = document.createElement('h4'); h.textContent = lang === 'pl' ? labelPL : labelEN;
      const p = document.createElement('p'); p.appendChild(lz(t(val, lang)));
      body.append(h, p);
    };
    block('What happened', 'Co się stało', ev.what);
    block('Consequences', 'Konsekwencje', ev.consequence);

    const relSection = (ids, labelEN, labelPL) => {
      if (!ids?.length) return;
      const ul = document.createElement('ul'); ul.className = 'rel-list';
      ids.forEach(id => {
        const c = casesById.get(id); if (!c) return;
        const li = document.createElement('li');
        const btn = document.createElement('button'); btn.className = 'rel-link'; btn.type = 'button';
        btn.textContent = t(c.shortName, lang);
        btn.addEventListener('click', () => onCaseOpen && onCaseOpen(c));
        li.appendChild(btn); ul.appendChild(li);
      });
      if (!ul.children.length) return;
      const h = document.createElement('h4'); h.textContent = lang === 'pl' ? labelPL : labelEN;
      body.append(h, ul);
    };
    // Back-compat: an older flat `related` is treated as caused.
    relSection(ev.causedJudgments || ev.related, 'Judgments that followed', 'Wyroki, które nastąpiły');
    relSection(ev.associatedJudgments, 'Associated judgments', 'Powiązane wyroki');
  }
  function close() {
    if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }
    if (outsideHandler) { document.removeEventListener('pointerdown', outsideHandler); outsideHandler = null; }
    const card = mount.querySelector('.card');
    if (card) card.classList.remove('show');
    if (opener && opener.focus) opener.focus();
    opener = null;
  }
  return { open, close };
}
