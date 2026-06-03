// js/lenses/spine.js
// "Anatomy of the capture" — a vertical spine showing how nearly every judgment
// radiates from one root defect: the politicised KRS. Cases are grouped by the
// mechanism that produced them (the existing themes), the root branch emphasised,
// and each judgment is a clickable chip. Renders into its own mount; the floaty
// timeline/graph stage is hidden, mirroring the execution & glossary lenses.
import { t } from '../i18n.js';

// Narrative order + framing. Keys map to data/themes.js; the copy here only adds
// the "role" relative to the root defect and an era tag — the names/descriptions
// come from the themes data so there is a single source of truth.
const BRANCHES = [
  { key: 'sc',   role: 'root',   eyebrow: { en: 'The root defect',   pl: 'Źródło problemu' },    era: '2017' },
  { key: 'disc', role: 'branch', eyebrow: { en: 'What it enabled',   pl: 'Co to umożliwiło' },   era: '2019–2020' },
  { key: 'ret',  role: 'branch', eyebrow: { en: 'A parallel front',  pl: 'Front równoległy' },   era: '2017–2018' },
  { key: 'ct',   role: 'branch', eyebrow: { en: 'A parallel front',  pl: 'Front równoległy' },   era: '2015' },
];

const INTRO = {
  eyebrow: { en: 'Anatomy of the capture', pl: 'Anatomia przejęcia' },
  lead: {
    en: 'Nearly every judgment below traces back to one defect. The body that nominates every judge in Poland — the National Council of the Judiciary (KRS) — was placed under political control in 2017. Once the gate was captured, much of what passed through it was tainted.',
    pl: 'Niemal każdy z poniższych wyroków sprowadza się do jednej wady. Organ wskazujący każdego sędziego w Polsce — Krajowa Rada Sądownictwa (KRS) — został w 2017 r. poddany kontroli politycznej. Gdy przejęto bramę, wiele z tego, co przez nią przeszło, zostało skażone.' },
};

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

export function render(ctx) {
  const { cases, lang, themes, spineMount, onSelect } = ctx;
  ctx.stage.style.display = 'none';
  spineMount.hidden = false;
  spineMount.innerHTML = '';

  const intro = el('div', 'spine-intro');
  intro.append(el('div', 'spine-eyebrow', t(INTRO.eyebrow, lang)), el('p', 'spine-lead', t(INTRO.lead, lang)));
  spineMount.appendChild(intro);

  const trunk = el('div', 'spine-trunk');
  BRANCHES.forEach(b => {
    const th = themes.find(x => x.key === b.key);
    if (!th) return;
    const rows = cases.filter(c => c.themes.includes(b.key))
      .sort((a, z) => String(a.date).localeCompare(String(z.date)));
    if (!rows.length) return;

    const branch = el('div', 'spine-branch' + (b.role === 'root' ? ' is-root' : ''));
    branch.appendChild(el('span', 'spine-node'));

    const head = el('div', 'spine-head');
    head.append(el('span', 'spine-tag', t(b.eyebrow, lang)), el('span', 'spine-era', b.era));
    branch.appendChild(head);

    branch.appendChild(el('h3', 'spine-h', t(th.name, lang)));
    branch.appendChild(el('p', 'spine-d', t(th.description, lang)));

    const chips = el('div', 'spine-cases');
    rows.forEach(c => {
      const chip = el('button', 'spine-chip ' + (c.court === 'CJEU' ? 'cjeu' : 'echr'));
      chip.type = 'button';
      chip.dataset.id = c.id;
      chip.setAttribute('aria-label', `${t(c.shortName, lang)} — ${c.court} ${c.id}`);
      if (onSelect) chip.addEventListener('click', () => onSelect(c));
      chip.append(
        el('span', 'sc-dot'),
        el('span', 'sc-nm', t(c.shortName, lang)),
        el('span', 'sc-id', c.id),
      );
      chips.appendChild(chip);
    });
    branch.appendChild(chips);
    trunk.appendChild(branch);
  });
  spineMount.appendChild(trunk);
}

export function clear(ctx) {
  ctx.spineMount.hidden = true;
  ctx.spineMount.innerHTML = '';
  ctx.stage.style.display = '';
}
