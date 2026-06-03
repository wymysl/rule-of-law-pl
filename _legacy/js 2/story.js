// js/story.js
// Apple-keynote-style scroll story: a full-screen takeover of stacked
// viewport-height panels you scroll through, each revealing (fade + rise) as it
// enters view, with a side progress rail. Esc exits; "See the full case" closes
// the story and opens that case's detail. Reduced-motion safe.
import { t } from './i18n.js';
import { setBackgroundInert } from './modal-util.js';

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

export function makeStory(mount, { story, casesById, ui }, onCaseOpen) {
  let lang = 'en', opener = null, obs = null, keyHandler = null;
  const steps = story.steps;

  function caseSnapshot(c) {
    const box = el('div', 'story-case');
    box.append(
      el('span', 'pill ' + (c.court === 'CJEU' ? 'cjeu' : 'echr'),
        `${c.court} · ${String(c.date).slice(0, 4)} · ${t(c.outcome, lang)}`),
      el('span', 'story-case-name', t(c.shortName, lang)),
    );
    const openBtn = el('button', 'story-open', (lang === 'pl' ? 'Zobacz pełną sprawę' : 'See the full case') + ' →');
    openBtn.type = 'button';
    openBtn.addEventListener('click', () => { close(); onCaseOpen(c); });
    box.appendChild(openBtn);
    return box;
  }

  function open(currentLang) {
    lang = currentLang || 'en';
    opener = document.activeElement;
    setBackgroundInert(true);
    mount.innerHTML = '';
    mount.hidden = false;
    mount.tabIndex = -1;
    mount.setAttribute('role', 'region');
    mount.setAttribute('aria-label', t(story.title, lang));

    const closeBtn = el('button', 'story-close', '×');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', t(ui.close, lang));
    closeBtn.addEventListener('click', close);

    const rail = el('div', 'story-rail');
    rail.setAttribute('aria-hidden', 'true');

    const panels = [];
    steps.forEach((step, i) => {
      const panel = el('section', 'story-panel');
      panel.dataset.step = String(i);
      const inner = el('div', 'story-panel-inner');
      inner.appendChild(el('div', 'story-kicker', t(step.kicker, lang)));
      const c = step.caseId ? casesById.get(step.caseId) : null;
      const headingText = step.heading ? t(step.heading, lang) : (c ? t(c.shortName, lang) : '');
      if (headingText) inner.appendChild(el('h2', 'story-heading', headingText));
      inner.appendChild(el('p', 'story-narration', t(step.narration, lang)));
      if (c) inner.appendChild(caseSnapshot(c));
      panel.appendChild(inner);
      mount.appendChild(panel);
      panels.push(panel);

      const dot = el('button', 'story-dot');
      dot.type = 'button';
      dot.setAttribute('aria-label', `${i + 1} / ${steps.length}`);
      dot.addEventListener('click', () => panel.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      rail.appendChild(dot);
    });

    // scroll cue on the first panel
    panels[0].querySelector('.story-panel-inner')
      .appendChild(el('div', 'story-hint', (lang === 'pl' ? 'przewiń' : 'scroll') + ' ↓'));

    mount.append(rail, closeBtn);

    const setActive = (idx) => [...rail.children].forEach((d, k) => d.classList.toggle('on', k === idx));
    panels[0].classList.add('in');   // first screen is visible immediately
    setActive(0);

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      panels.forEach(p => p.classList.add('in'));
    } else {
      // reveal a panel as soon as it enters (robust even when a panel is taller
      // than the viewport, where a high intersection ratio is never reached)
      const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
      }, { root: mount, rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
      panels.forEach(p => revealObs.observe(p));
      // active rail dot = the panel filling the viewport centre (deterministic)
      const onScroll = () => {
        const centre = mount.scrollTop + mount.clientHeight / 2;
        let idx = 0;
        for (let k = 0; k < panels.length; k++) { if (panels[k].offsetTop <= centre) idx = k; else break; }
        setActive(idx);
      };
      mount.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      obs = { disconnect() { revealObs.disconnect(); mount.removeEventListener('scroll', onScroll); } };
    }

    keyHandler = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', keyHandler);
    mount.scrollTop = 0;
    mount.focus();
  }

  function close() {
    if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }
    if (obs) { obs.disconnect(); obs = null; }
    mount.hidden = true;
    mount.innerHTML = '';
    setBackgroundInert(false);
    if (opener && opener.focus) opener.focus();
    opener = null;
  }

  return { open, close };
}
