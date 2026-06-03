// tests/detail.test.js
import { describe, it, expect } from 'vitest';
import { makeDetail } from '../js/detail.js';

const GLOSSARY = { art6echr: { longName: { en: 'Article 6 ECHR' }, definition: { en: 'fair trial' } } };
const UI = { close: { en: 'Close' }, deeper: { en: 'Deeper detail' } };

function setup() {
  const target = { id: 'T-1', court: 'ECtHR', date: '2022-06', procedureType: { en: 'Application' },
    shortName: { en: 'Target v. Poland' }, outcome: { en: 'Violation' }, summary: { en: 'Short.' } };
  const c = { id: 'C-1', court: 'CJEU', date: '2021-07', procedureType: { en: 'Infringement' },
    shortName: { en: 'Evil <img src=x> v. Poland' }, outcome: { en: 'Infringement found' }, summary: { en: 'A summary.' },
    pronunciation: { phonetic: 'EE-vil', audio: 'data/audio/c-1.mp3' },
    facts: [{ en: 'First fact here.' }, { en: 'Second fact.' }],
    violation: { en: 'The court found a breach of independence.' },
    legalBasis: [{ ref: 'Art. 6 ECHR', gloss: 'art6echr' }],
    relationships: [{ targetId: 'T-1', type: 'buildsOn', note: { en: 'note' } }],
    execution: { generalMeasures: { en: 'Fix it.' }, status: 'open',
      supervision: { body: 'Committee of Ministers', latestAction: { date: '2024-03', text: { en: 'urged reform' } } } },
    links: [{ label: { en: 'Judgment' }, url: 'https://example.org' }] };
  const casesById = new Map([['C-1', c], ['T-1', target]]);
  const mount = document.createElement('div');
  return { mount, detail: makeDetail(mount, GLOSSARY, UI, casesById), c };
}

describe('detail card', () => {
  it('renders glance fields and is shown, with case names rendered literally (no HTML injection)', () => {
    const { mount, detail, c } = setup();
    detail.open(c, 'en');
    expect(mount.querySelector('.card').classList.contains('show')).toBe(true);
    expect(mount.querySelector('h3').textContent).toBe('Evil <img src=x> v. Poland');
    expect(mount.querySelector('h3').querySelector('img')).toBe(null); // not parsed as HTML
    expect(mount.querySelector('.lead').textContent).toBe('A summary.');
    expect(mount.querySelector('.pill').classList.contains('cjeu')).toBe(true);
  });
  it('shows facts and the violation by default (not hidden behind a disclosure)', () => {
    const { mount, detail, c } = setup();
    detail.open(c, 'en');
    // no collapsed <details> wrapper — substance is visible immediately
    expect(mount.querySelector('details')).toBe(null);
    expect(mount.querySelector('.facts-list')).not.toBe(null);
    expect(mount.querySelector('.callout.violation')).not.toBe(null);
  });
  it('renders facts bullets, the violation, glossary basis, a clickable related case, execution and links', () => {
    const { mount, detail, c } = setup();
    detail.open(c, 'en');
    const factItems = [...mount.querySelectorAll('.facts-list li')].map(li => li.textContent);
    expect(factItems).toEqual(['First fact here.', 'Second fact.']);
    expect(mount.querySelector('.deep-body').textContent).toContain('breach of independence');
    expect(mount.querySelector('.gloss')).not.toBe(null);            // legal basis tooltip
    const rel = mount.querySelector('.rel-link');
    expect(rel.textContent).toBe('Target v. Poland');
    expect(mount.querySelector('.deep-body').textContent).toContain('Committee of Ministers');
    const link = mount.querySelector('.links a');
    expect(link.getAttribute('href')).toBe('https://example.org');
    expect(link.getAttribute('target')).toBe('_blank');
    // clicking the related case navigates to it
    rel.click();
    expect(mount.querySelector('h3').textContent).toBe('Target v. Poland');
  });
  it('shows the plain-English lead when present and hides it when absent', () => {
    const { mount, detail, c } = setup();
    detail.open({ ...c, plain: { en: 'Plain meaning here.' } }, 'en');
    expect(mount.querySelector('.plain-lead').textContent).toBe('Plain meaning here.');
    expect(mount.querySelector('.plain-lead').hidden).toBe(false);
    detail.open(c, 'en'); // c has no plain
    expect(mount.querySelector('.plain-lead').hidden).toBe(true);
  });
  it('shows the pronunciation aid only in the English version', () => {
    const { mount, detail, c } = setup();
    detail.open(c, 'en');
    expect(mount.querySelector('.pron').hidden).toBe(false);
    expect(mount.querySelector('.pron').textContent).toContain('EE-vil');
    expect(mount.querySelector('.pron-play').hidden).toBe(false);
    detail.open(c, 'pl');
    expect(mount.querySelector('.pron').hidden).toBe(true);
    expect(mount.querySelector('.pron-play').hidden).toBe(true);
  });
  it('close() hides the card', () => {
    const { mount, detail, c } = setup();
    detail.open(c, 'en');
    detail.close();
    expect(mount.querySelector('.card').classList.contains('show')).toBe(false);
  });
  it('is a non-blocking dialog panel that closes on Escape (no aria-modal trap)', () => {
    const { mount, detail, c } = setup();
    detail.open(c, 'en');
    const card = mount.querySelector('.card');
    expect(card.getAttribute('role')).toBe('dialog');
    expect(card.getAttribute('aria-modal')).toBe(null); // non-blocking: background stays interactive
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(mount.querySelector('.card').classList.contains('show')).toBe(false);
  });
  it('replaces content when another judgment is opened while one is showing', () => {
    const { mount, detail, c } = setup();
    detail.open(c, 'en');
    expect(mount.querySelector('h3').textContent).toContain('Evil');
    detail.open({ id: 'T-1', court: 'ECtHR', date: '2022-06', procedureType: { en: 'Application' },
      shortName: { en: 'Target v. Poland' }, outcome: { en: 'Violation' }, summary: { en: 'Short.' } }, 'en');
    expect(mount.querySelector('h3').textContent).toBe('Target v. Poland'); // replaced, no need to close first
    expect(detail.isOpen()).toBe(true);
  });
  it('moves focus into the dialog on open and restores it to the opener on close', () => {
    const { mount, detail, c } = setup();
    document.body.appendChild(mount);
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    expect(document.activeElement).toBe(opener);
    detail.open(c, 'en');
    expect(document.activeElement).toBe(mount.querySelector('.card')); // focus entered the dialog
    detail.close();
    expect(document.activeElement).toBe(opener);                       // and returned to the opener
    mount.remove(); opener.remove();
  });
});
