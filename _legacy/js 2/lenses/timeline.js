// js/lenses/timeline.js
// Vertical timeline: a top-to-bottom axis (earliest at the top), year ticks on
// the axis, event landmarks down the LEFT, and case dots down the RIGHT — each
// dot carrying a persistent short title so judgments can be scanned without
// hovering. The page scrolls vertically through the full span.
import { place } from '../nodes.js';
import { t } from '../i18n.js';

export const Y0 = 2015.3, Y1 = 2026.7;
export const TOP = 52;     // px above the first year
export const PERYR = 116;  // vertical px per year
export const BOT = 80;     // px below the last dot
export const MINGAP = 28;  // min vertical gap between dots (de-collision)

export function yearFraction(iso) {           // 'YYYY' or 'YYYY-MM'
  const [y, m] = iso.split('-').map(Number);
  return y + ((m ? m - 1 : 0) / 12);
}
// Kept for unit tests / any horizontal use; the vertical render uses scaleY.
export function scaleX(yearFrac, width) {
  return 70 + ((yearFrac - Y0) / (Y1 - Y0)) * (width - 140);
}
export function scaleY(yearFrac) {
  return TOP + (yearFrac - Y0) * PERYR;
}
// Axis x-position: a left-third gutter for events, the rest for dots + titles.
export function axisXFor(width) {
  return Math.round(Math.min(216, Math.max(150, width * 0.4)));
}

export function render(ctx) {
  const { cases, nodes, lang, events, ticks, eventEls, axis, stage } = ctx;
  const scroller = stage.parentElement;
  stage.classList.add('vtl'); scroller.classList.add('vtl');
  const axisX = axisXFor(ctx.width);
  const topY = scaleY(Y0), bottomY = scaleY(Y1);

  // vertical axis line
  axis.classList.add('on');
  axis.style.left = axisX + 'px'; axis.style.top = topY + 'px';
  axis.style.width = '1px'; axis.style.height = (bottomY - topY) + 'px';
  axis.style.background = 'linear-gradient(180deg,transparent,var(--ring) 4%,var(--ring) 96%,transparent)';

  // year ticks in the gutter just right of the axis (clear of the event labels)
  Object.entries(ticks).forEach(([y, el]) => {
    el.classList.add('on');
    el.style.left = (axisX + 9) + 'px'; el.style.top = scaleY(+y) + 'px';
    el.style.transform = 'translateY(-50%)';
  });

  // event landmarks down the LEFT (diamond on the axis, text to its left)
  events.forEach((e, i) => {
    const el = eventEls[i];
    el.querySelector('.etxt').textContent = t(e.label, lang);
    el.classList.add('on');
    el.style.left = axisX + 'px'; el.style.top = scaleY(yearFraction(e.date)) + 'px';
    el.style.transform = 'none';
  });

  // case dots down the RIGHT — chronological single column, de-collided so each
  // dot (and its title) gets its own line.
  const dotX = axisX + 48;
  const order = cases.map((_, i) => i)
    .sort((a, b) => yearFraction(cases[a].date) - yearFraction(cases[b].date));
  let lastY = -1e9, maxY = bottomY;
  order.forEach((idx, k) => {
    let y = scaleY(yearFraction(cases[idx].date));
    if (y < lastY + MINGAP) y = lastY + MINGAP;
    lastY = y; if (y > maxY) maxY = y;
    place(nodes[idx], dotX, y, k * 14);
  });

  stage.style.height = Math.round(maxY + BOT) + 'px';
}

export function clear(ctx) {
  const { stage, axis, ticks, eventEls } = ctx;
  const scroller = stage.parentElement;
  stage.classList.remove('vtl'); scroller.classList.remove('vtl');
  stage.style.height = '';
  axis.classList.remove('on');
  ['left', 'top', 'width', 'height', 'background', 'transform'].forEach(p => axis.style[p] = '');
  Object.values(ticks).forEach(el => { el.classList.remove('on'); ['left', 'top', 'transform'].forEach(p => el.style[p] = ''); });
  eventEls.forEach(e => { e.classList.remove('on'); ['left', 'top', 'transform'].forEach(p => e.style[p] = ''); });
}
