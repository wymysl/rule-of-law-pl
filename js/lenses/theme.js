// js/lenses/theme.js
// Cases grouped into per-theme clusters. The layout is responsive: two columns
// on wide screens, one on narrow, and clusters stack with computed heights so
// they never overlap or clip — the stage grows vertically like the timeline.
import { place } from '../nodes.js';
import { t } from '../i18n.js';

const PER = 3, SP = 46, ROWH = 46, HEADER = 40, GAP = 30, TOP = 54;

function themeLayout(cases, themeKeys, width) {
  const cols = width < 620 ? 1 : 2;
  const cellW = width / cols;
  const colY = Array(cols).fill(TOP);
  const dots = [], labels = [];
  themeKeys.forEach((key, ti) => {
    const col = ti % cols;
    const cx = col * cellW + cellW / 2;
    const y0 = colY[col];
    labels.push({ key, x: cx, y: y0 });
    const items = cases.map((c, i) => ({ c, i })).filter(o => o.c.themes.includes(key));
    items.forEach((o, k) => {
      const cc = k % PER, rr = Math.floor(k / PER);
      dots.push({ i: o.i, x: cx + (cc - (PER - 1) / 2) * SP, y: y0 + HEADER + rr * ROWH });
    });
    const rows = Math.max(1, Math.ceil(items.length / PER));
    colY[col] = y0 + HEADER + rows * ROWH + GAP;
  });
  return { dots, labels, height: Math.max(...colY) + 10 };
}

// kept for unit tests: just the dot positions
export function themePositions(cases, themeKeys, width) {
  return themeLayout(cases, themeKeys, width).dots;
}

export function render(ctx) {
  const { cases, nodes, themes, lang, labels, stage } = ctx;
  const layout = themeLayout(cases, themes.map(th => th.key), ctx.width);
  themes.forEach(th => {
    const lab = layout.labels.find(x => x.key === th.key);
    const l = labels.get('th_' + th.key);
    l.textContent = t(th.name, lang);
    l.classList.add('on');
    l.style.left = (lab.x - l.offsetWidth / 2) + 'px';
    l.style.top = (lab.y - 30) + 'px';
  });
  layout.dots.forEach((p, k) => place(nodes[p.i], p.x, p.y, k * 30));
  stage.style.height = Math.max(560, layout.height) + 'px';
}

export function clear(ctx) {
  ctx.labels.forEach(l => l.classList.remove('on'));
  ctx.stage.style.height = '';
}
