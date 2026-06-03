// js/tooltips.js
// Edge-aware tooltips. The glossary (.gloss-tip), case-ref (.ref-tip) and node
// (.tip) tooltips are built as children of their anchors, but those anchors sit
// inside clipped/overflow containers — and the detail .card uses a CSS transform,
// which turns it into the containing block even for position:fixed descendants.
// So an in-place tooltip gets cut off near a card or window edge.
//
// Fix: on hover/focus we clone the anchor's tooltip into a body-level portal
// (#tip-layer, outside every transformed/overflow ancestor) and position it with
// computeTipPosition(), which flips above↔below and clamps horizontally so the
// tooltip is always fully on-screen. The originals stay invisible (data source).

const ANCHORS = [
  { sel: '.gloss', tip: '.gloss-tip' },
  { sel: '.case-ref', tip: '.ref-tip' },
  { sel: '.node', tip: '.tip' },
];
const MARGIN = 8; // keep this far from any viewport edge
const GAP = 8;    // gap between anchor and tooltip

// Pure: given the anchor's rect, the tooltip's size and the viewport, return the
// fixed {left, top, placement} that keeps the tooltip fully visible. Prefers
// placing the tooltip above the anchor; flips below when there isn't room.
export function computeTipPosition(anchor, tip, viewport, margin = MARGIN, gap = GAP) {
  const { vw, vh } = viewport;
  let left = anchor.left + anchor.width / 2 - tip.w / 2; // centre over the anchor
  left = Math.max(margin, Math.min(left, vw - tip.w - margin));
  let top = anchor.top - tip.h - gap;
  let placement = 'top';
  if (top < margin) {
    const below = anchor.bottom + gap;
    if (below + tip.h <= vh - margin) { top = below; placement = 'bottom'; }
    else top = Math.max(margin, vh - tip.h - margin); // neither side fits: clamp
  }
  return { left: Math.round(left), top: Math.round(top), placement };
}

let layer = null;
let current = null; // { anchor, clone }

function ensureLayer() {
  if (!layer || !layer.isConnected) {
    layer = document.getElementById('tip-layer') || document.createElement('div');
    layer.id = 'tip-layer';
    if (!layer.isConnected) document.body.appendChild(layer);
  }
  return layer;
}

function hide() {
  if (current) { current.clone.remove(); current = null; }
}

function show(anchor, tipSel) {
  if (current && current.anchor === anchor) return;
  const src = anchor.querySelector(tipSel);
  if (!src) return;
  hide();
  const clone = src.cloneNode(true);
  clone.classList.add('tip-portal');
  clone.style.opacity = '0';
  ensureLayer().appendChild(clone);
  const a = anchor.getBoundingClientRect();
  const pos = computeTipPosition(
    { left: a.left, top: a.top, bottom: a.bottom, width: a.width },
    { w: clone.offsetWidth, h: clone.offsetHeight },
    { vw: window.innerWidth, vh: window.innerHeight },
  );
  clone.style.left = pos.left + 'px';
  clone.style.top = pos.top + 'px';
  clone.dataset.placement = pos.placement;
  clone.getBoundingClientRect(); // flush before fading in
  clone.style.opacity = '1';
  current = { anchor, clone };
}

function onOver(e) {
  for (const { sel, tip } of ANCHORS) {
    const anchor = e.target.closest && e.target.closest(sel);
    if (anchor) { show(anchor, tip); return; }
  }
}
function onOut(e) {
  if (!current) return;
  const to = e.relatedTarget;
  if (to && (current.anchor === to || current.anchor.contains(to))) return;
  hide();
}

export function initTooltips(root = document) {
  root.addEventListener('pointerover', onOver, true);
  root.addEventListener('pointerout', onOut, true);
  root.addEventListener('focusin', onOver, true);
  root.addEventListener('focusout', hide, true);
  window.addEventListener('scroll', hide, true);
  window.addEventListener('resize', hide);
}
