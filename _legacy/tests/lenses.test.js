// tests/lenses.test.js
import { describe, it, expect } from 'vitest';
import { courtClass, placeTransform, createNodes, place, setTip } from '../js/nodes.js';
import { themePositions } from '../js/lenses/theme.js';
import { yearFraction, scaleX } from '../js/lenses/timeline.js';
import { filterCases } from '../js/lenses/list.js';
import { buildEdges, buildAdjacency, forceLayout } from '../js/lenses/map.js';
import { executionCounts, render as execRender } from '../js/lenses/execution.js';

const CASES = [
  { id: 'A', court: 'CJEU', themes: ['sc'] },
  { id: 'B', court: 'ECtHR', themes: ['disc'] },
];

describe('nodes', () => {
  it('maps court to css class', () => {
    expect(courtClass('CJEU')).toBe('cjeu');
    expect(courtClass('ECtHR')).toBe('echr');
  });
  it('computes a centered translate transform', () => {
    expect(placeTransform(100, 50)).toBe('translate(91px,41px)'); // node radius 9
  });
  it('creates one node element per case with the court class', () => {
    const stage = document.createElement('div');
    const nodes = createNodes(CASES, stage, () => {});
    expect(nodes.length).toBe(2);
    expect(stage.querySelectorAll('.node').length).toBe(2);
    expect(nodes[0].classList.contains('cjeu')).toBe(true);
    expect(nodes[1].classList.contains('echr')).toBe(true);
  });
  it('place() sets transform and delay, defaulting delay to 0ms', () => {
    const n = document.createElement('div');
    place(n, 100, 50, 40);
    expect(n.style.transform).toBe('translate(91px,41px)');
    expect(n.style.transitionDelay).toBe('40ms');
    place(n, 10, 20);
    expect(n.style.transitionDelay).toBe('0ms'); // no undefinedms
  });
  it('setTip() writes the tip text', () => {
    const stage = document.createElement('div');
    const [n] = createNodes([{ id: 'A', court: 'CJEU', themes: [] }], stage, () => {});
    setTip(n, 'Hello v. World');
    expect(n.querySelector('.tip').textContent).toBe('Hello v. World');
  });
  it('makes node cores keyboard-focusable buttons with an accessible name', () => {
    const stage = document.createElement('div');
    const [n] = createNodes([{ id: 'A', court: 'CJEU', themes: [] }], stage, () => {});
    const core = n.querySelector('.core');
    expect(core.getAttribute('role')).toBe('button');
    expect(core.tabIndex).toBe(0);
    setTip(n, 'Case Name');
    expect(core.getAttribute('aria-label')).toBe('Case Name');
  });
});

const SET = [
  { id: 'a', court: 'CJEU', themes: ['ct'] },
  { id: 'b', court: 'ECtHR', themes: ['ct'] },
  { id: 'c', court: 'CJEU', themes: ['sc'] },
];
const THEME_KEYS_T = ['ct', 'sc', 'disc', 'ret'];

describe('theme lens', () => {
  it('groups cases into per-theme clusters (ct together, sc apart)', () => {
    const pos = themePositions(SET, THEME_KEYS_T, 800);
    expect(pos.length).toBe(3);
    // theme 'ct' is the first cluster, centred at width/4 = 200; 'sc' is the
    // second cluster, centred at 3*width/4 = 600. Cases spread <=46px around centre.
    const ax = pos.find(p => p.i === 0).x, bx = pos.find(p => p.i === 1).x;
    const cx = pos.find(p => p.i === 2).x;
    expect(Math.abs(ax - 200)).toBeLessThanOrEqual(46); // both 'ct' cases near the ct cluster
    expect(Math.abs(bx - 200)).toBeLessThanOrEqual(46);
    expect(cx).toBeGreaterThan(400);                    // 'sc' is in the far cluster
  });
});

const LIST = [
  { id: 'C-791/19', court: 'CJEU', themes: ['disc'], shortName: { en: 'Commission v. Poland' } },
  { id: '43447/19', court: 'ECtHR', themes: ['sc'], shortName: { en: 'Reczkowicz v. Poland' } },
];

describe('list filter', () => {
  it('matches by query against id and name', () => {
    expect(filterCases(LIST, { q: 'reczkowicz', court: null, theme: null }, 'en').length).toBe(1);
    expect(filterCases(LIST, { q: 'C-791', court: null, theme: null }, 'en')[0].id).toBe('C-791/19');
  });
  it('filters by court and theme', () => {
    expect(filterCases(LIST, { q: '', court: 'ECtHR', theme: null }, 'en').length).toBe(1);
    expect(filterCases(LIST, { q: '', court: null, theme: 'disc' }, 'en').length).toBe(1);
  });
});

const MAPSET = [
  { id: 'a', court: 'CJEU', relationships: [{ targetId: 'b', type: 'buildsOn' }] },
  { id: 'b', court: 'ECtHR', relationships: [] },
  { id: 'c', court: 'CJEU', relationships: [{ targetId: 'a', type: 'sameTarget' }] },
];

describe('map logic', () => {
  it('builds unique edges from relationships (by index)', () => {
    const edges = buildEdges(MAPSET);
    expect(edges).toContainEqual([0, 1]);
    expect(edges).toContainEqual([0, 2]);
    expect(edges.length).toBe(2);
  });
  it('builds a symmetric adjacency set', () => {
    const adj = buildAdjacency(MAPSET, buildEdges(MAPSET));
    expect(adj[0].has(1)).toBe(true);
    expect(adj[1].has(0)).toBe(true);
  });
  it('force layout returns in-bounds positions for every node', () => {
    const pos = forceLayout(MAPSET, buildEdges(MAPSET), 800, 560);
    expect(pos.length).toBe(3);
    pos.forEach(p => {
      expect(p.x).toBeGreaterThanOrEqual(60); expect(p.x).toBeLessThanOrEqual(740);
      expect(p.y).toBeGreaterThanOrEqual(50); expect(p.y).toBeLessThanOrEqual(510);
    });
  });
});

const EX = [
  { execution: { status: 'open', supervision: { procedure: 'enhanced' } } },
  { execution: { status: 'partial', supervision: { procedure: 'enhanced' } } },
  { execution: { status: 'closed', supervision: { procedure: null } } },
  { execution: null },
];

describe('execution counts', () => {
  it('tallies statuses and enhanced supervision, ignoring missing execution', () => {
    const c = executionCounts(EX);
    expect(c.open).toBe(1);
    expect(c.partial).toBe(1);
    expect(c.closed).toBe(1);
    expect(c.enhanced).toBe(2);
  });
  it('renders each case as a button that opens its detail on click', () => {
    const execMount = document.createElement('div');
    const cases = [{ id: 'C-1', court: 'CJEU', themes: ['disc'], shortName: { en: 'X v. Poland' },
      execution: { status: 'open', supervision: { latestAction: { date: '2024', text: { en: 'urged' } } } } }];
    let opened = null;
    execRender({ cases, themes: [{ key: 'disc', name: { en: 'Disc' } }], lang: 'en',
      execMount, stage: document.createElement('div'), nodes: [], onSelect: c => { opened = c; } });
    const row = execMount.querySelector('button.exec-row');
    expect(row).not.toBe(null);
    row.click();
    expect(opened && opened.id).toBe('C-1');
  });
});

describe('timeline scale', () => {
  it('converts an ISO date to a fractional year', () => {
    expect(yearFraction('2021-07')).toBeCloseTo(2021.5, 1);
    expect(yearFraction('2019-01')).toBeCloseTo(2019.0, 1);
  });
  it('maps the start of the range near the left padding', () => {
    const x = scaleX(2015.3, 1000); // Y0 = 2015.3
    expect(x).toBeCloseTo(70, 0);
  });
  it('is monotonic increasing in time', () => {
    expect(scaleX(2020, 1000)).toBeLessThan(scaleX(2022, 1000));
  });
});
