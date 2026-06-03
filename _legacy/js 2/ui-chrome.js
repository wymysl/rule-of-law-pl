// js/ui-chrome.js
import { t } from './i18n.js';

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

export function renderHero(mount, primer, lang) {
  mount.innerHTML = '';
  const inner = el('div', 'hero-inner reveal');
  const actions = el('div', 'hero-actions');
  // primary CTA opens the guided story — the click handler is wired in app.js
  const startBtn = el('button', 'hero-cta');
  startBtn.type = 'button';
  startBtn.append(document.createTextNode(lang === 'pl' ? 'Zacznij od historii' : 'Start with the story'), el('span', 'arrow', '→'));
  const exploreBtn = el('button', 'hero-explore');
  exploreBtn.type = 'button';
  exploreBtn.append(document.createTextNode(lang === 'pl' ? 'albo przeglądaj sprawy' : 'or explore the cases'), el('span', 'arrow', '↓'));
  exploreBtn.addEventListener('click', () => {
    document.getElementById('controls').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  actions.append(startBtn, exploreBtn);
  inner.append(
    el('div', 'kicker', lang === 'pl' ? 'Kryzys praworządności' : 'The Rule of Law Crisis'),
    el('h1', 'hero-title', t(primer.heroTitle, lang)),
    el('p', 'hero-sub', t(primer.heroSub, lang)),
    actions,
  );
  mount.appendChild(inner);
}

export function renderPrimer(mount, primer, lang) {
  mount.innerHTML = '';
  [primer.whatIsRoL, primer.howCourts].forEach(s => {
    const sec = el('section', 'primer-block reveal');
    sec.append(el('h2', null, t(s.title, lang)), el('p', null, t(s.body, lang)));
    mount.appendChild(sec);
  });
}

export function renderDisclaimer(footer, primer, lang) {
  footer.innerHTML = '';
  footer.appendChild(el('p', 'disclaimer-text', t(primer.disclaimer, lang)));
}

export function maybeFirstVisit(box, primer, lang) {
  let dismissed = false;
  try { dismissed = localStorage.getItem('rol-disclaimer-ack') === '1'; } catch (e) {}
  if (dismissed) { box.hidden = true; return; }
  box.hidden = false;
  box.innerHTML = '';
  const inner = el('div', 'fv-inner');
  const short = lang === 'pl'
    ? 'Przystępny przewodnik — nie jest poradą prawną. Pełne zastrzeżenie i źródła na dole strony.'
    : 'A plain-language explainer — not legal advice. Full disclaimer and sources at the bottom.';
  inner.appendChild(el('p', null, short));
  const btn = el('button', 'fv-ok', lang === 'pl' ? 'Rozumiem' : 'I understand');
  btn.type = 'button';
  btn.addEventListener('click', () => {
    try { localStorage.setItem('rol-disclaimer-ack', '1'); } catch (e) {}
    box.hidden = true;
  });
  inner.appendChild(btn);
  box.appendChild(inner);
}

export function setupScrollReveal() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(node => node.classList.add('in'));
    return;
  }
  const obs = new IntersectionObserver(
    es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
    { threshold: .25 });
  document.querySelectorAll('.reveal').forEach(node => obs.observe(node));
}
