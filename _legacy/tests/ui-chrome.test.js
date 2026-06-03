// tests/ui-chrome.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHero, renderDisclaimer, maybeFirstVisit } from '../js/ui-chrome.js';

const PRIMER = {
  heroTitle: { en: 'Title <b>X</b>', pl: 'Tytuł' },
  heroSub: { en: 'Sub.', pl: '' },
  whatIsRoL: { title: { en: 'RoL' }, body: { en: 'Body.' } },
  howCourts: { title: { en: 'Courts' }, body: { en: 'Body2.' } },
  disclaimer: { en: 'Informative only.', pl: 'Tylko informacyjnie.' },
};

beforeEach(() => { try { localStorage.clear(); } catch (e) {} });

describe('ui-chrome', () => {
  it('renders the hero title literally (no HTML injection)', () => {
    const m = document.createElement('div');
    renderHero(m, PRIMER, 'en');
    expect(m.querySelector('.hero-title').textContent).toBe('Title <b>X</b>');
    expect(m.querySelector('.hero-title').querySelector('b')).toBe(null);
  });
  it('renders the disclaimer text', () => {
    const f = document.createElement('footer');
    renderDisclaimer(f, PRIMER, 'pl');
    expect(f.querySelector('.disclaimer-text').textContent).toBe('Tylko informacyjnie.');
  });
  it('first-visit notice shows once, then stays dismissed after acknowledge', () => {
    const box = document.createElement('div');
    maybeFirstVisit(box, PRIMER, 'en');
    expect(box.hidden).toBe(false);
    box.querySelector('.fv-ok').click();
    expect(box.hidden).toBe(true);
    // a fresh box on the next "visit" should stay hidden
    const box2 = document.createElement('div');
    maybeFirstVisit(box2, PRIMER, 'en');
    expect(box2.hidden).toBe(true);
  });
});
