// js/nodes.js
export const NODE_R = 9; // half of 18px

export function courtClass(court) {
  return court === 'CJEU' ? 'cjeu' : 'echr';
}

export function placeTransform(x, y) {
  return `translate(${x - NODE_R}px,${y - NODE_R}px)`;
}

export function createNodes(cases, stage, onSelect) {
  return cases.map((c, i) => {
    const n = document.createElement('div');
    n.className = `node ${courtClass(c.court)}`;
    n.dataset.id = c.id;
    // `.tip` (hover) and `.dot-title` (always-on, shown only in the vertical
    // timeline) sit OUTSIDE `.core` on purpose: `.core` is scaled on hover, and a
    // scaled ancestor renders descendant text blurry. As children of `.node`
    // (translate-only) both labels stay crisp.
    n.innerHTML = `<div class="float"><div class="core"></div></div><span class="tip"></span><span class="dot-title"></span>`;
    // idle float timing — intentionally randomised so nodes don't bob in lockstep
    const rand = Math.random();
    n.style.setProperty('--d', (4 + rand * 3).toFixed(2) + 's');
    n.style.setProperty('--dl', (-rand * 4).toFixed(2) + 's');
    const core = n.querySelector('.core');
    core.addEventListener('click', () => onSelect(c, n));
    core.tabIndex = 0;
    core.setAttribute('role', 'button');
    core.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(c, n); }
    });
    stage.appendChild(n);
    return n;
  });
}

export function place(node, x, y, delayMs = 0) {
  node.style.transitionDelay = `${delayMs}ms`;
  node.style.transform = placeTransform(x, y);
}

export function setTip(node, text) {
  node.querySelector('.tip').textContent = text;
  node.querySelector('.dot-title').textContent = text;
  node.querySelector('.core').setAttribute('aria-label', text);
}
