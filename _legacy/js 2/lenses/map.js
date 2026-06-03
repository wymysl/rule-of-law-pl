// js/lenses/map.js
import { place } from '../nodes.js';

export function buildEdges(cases) {
  const idx = new Map(cases.map((c, i) => [c.id, i]));
  const seen = new Set(), edges = [];
  cases.forEach((c, i) => (c.relationships || []).forEach(r => {
    const j = idx.get(r.targetId); if (j == null || j === i) return;
    const key = i < j ? `${i}-${j}` : `${j}-${i}`;
    if (seen.has(key)) return; seen.add(key); edges.push(i < j ? [i, j] : [j, i]);
  }));
  return edges;
}

export function buildAdjacency(cases, edges) {
  const adj = cases.map(() => new Set());
  edges.forEach(([a, b]) => { adj[a].add(b); adj[b].add(a); });
  return adj;
}

export function forceLayout(cases, edges, width, height) {
  const n = cases.length, cx = width / 2, cy = height / 2;
  const pos = cases.map((_, i) => ({                       // deterministic seed
    x: cx + Math.cos(i / n * Math.PI * 2) * 180,
    y: cy + Math.sin(i / n * Math.PI * 2) * 150,
  }));
  for (let it = 0; it < 320; it++) {
    const fx = pos.map(() => 0), fy = pos.map(() => 0);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const dx = pos[i].x - pos[j].x, dy = pos[i].y - pos[j].y, d2 = dx * dx + dy * dy || 1, d = Math.sqrt(d2), f = 5200 / d2;
      fx[i] += dx / d * f; fy[i] += dy / d * f; fx[j] -= dx / d * f; fy[j] -= dy / d * f;
    }
    edges.forEach(([a, b]) => {
      const dx = pos[b].x - pos[a].x, dy = pos[b].y - pos[a].y, d = Math.sqrt(dx * dx + dy * dy) || 1, f = (d - 96) * 0.04;
      fx[a] += dx / d * f; fy[a] += dy / d * f; fx[b] -= dx / d * f; fy[b] -= dy / d * f;
    });
    for (let i = 0; i < n; i++) {
      fx[i] += (cx - pos[i].x) * 0.012; fy[i] += (cy - pos[i].y) * 0.012;
      pos[i].x += Math.max(-6, Math.min(6, fx[i])); pos[i].y += Math.max(-6, Math.min(6, fy[i]));
      pos[i].x = Math.max(60, Math.min(width - 60, pos[i].x));
      pos[i].y = Math.max(50, Math.min(height - 50, pos[i].y));
    }
  }
  return pos;
}

let cached = null;
export function render(ctx) {
  const { cases, nodes, svg, width, height = 560 } = ctx;
  const edges = ctx._edges || (ctx._edges = buildEdges(cases));
  const adj = ctx._adj || (ctx._adj = buildAdjacency(cases, edges));
  if (!cached || ctx._recompute) { cached = forceLayout(cases, edges, width, height); ctx._recompute = false; }
  cases.forEach((c, i) => place(nodes[i], cached[i].x, cached[i].y, i * 22));
  drawEdges(svg, edges, cached, width, height);
  ctx._mapHover = (i) => highlight(ctx, edges, adj, i);
  ctx._mapClearHover = () => clearHighlight(ctx, edges);
}

function drawEdges(svg, edges, pos, width, height) {
  svg.setAttribute('width', width); svg.setAttribute('height', height);
  svg.innerHTML = '';
  edges.forEach(([a, b]) => {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const x1 = pos[a].x, y1 = pos[a].y, x2 = pos[b].x, y2 = pos[b].y;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, len = Math.hypot(-dy, dx) || 1;
    p.setAttribute('d', `M${x1},${y1} Q${mx - dy / len * 18},${my + dx / len * 18} ${x2},${y2}`);
    svg.appendChild(p);
  });
  setTimeout(() => svg.querySelectorAll('path').forEach(p => p.classList.add('on')), 420);
}

function highlight(ctx, edges, adj, i) {
  ctx.svg.querySelectorAll('path').forEach((p, k) => {
    const [a, b] = edges[k];
    p.classList.toggle('hl', a === i || b === i);
    p.classList.toggle('dim', !(a === i || b === i));
  });
  ctx.nodes.forEach((n, j) => {
    n.classList.toggle('hl', j === i || adj[i].has(j));
    n.classList.toggle('dim', !(j === i || adj[i].has(j)));
  });
}
function clearHighlight(ctx, edges) {
  ctx.svg.querySelectorAll('path').forEach(p => p.classList.remove('hl', 'dim'));
  ctx.nodes.forEach(n => n.classList.remove('hl', 'dim'));
}

export function clear(ctx) {
  ctx.svg.innerHTML = '';
  ctx.nodes.forEach(n => n.classList.remove('hl', 'dim'));
  ctx._mapHover = null; ctx._mapClearHover = null;
}
