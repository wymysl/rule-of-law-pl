import { describe, it, expect } from 'vitest';
import { GLOSSARY } from '../data/glossary.js';
import { lookupTerm, buildGlossaryEl } from '../js/glossary.js';

describe('glossary', () => {
  it('looks up a known term in the active language', () => {
    expect(lookupTerm(GLOSSARY, 'krs', 'en').longName).toContain('National Council');
    expect(lookupTerm(GLOSSARY, 'krs', 'pl').longName).toContain('Krajowa Rada');
  });
  it('returns null for unknown terms', () => {
    expect(lookupTerm(GLOSSARY, 'nope', 'en')).toBe(null);
  });
  it('builds a focusable span with the term text and a tooltip definition', () => {
    const el = buildGlossaryEl(GLOSSARY, 'cm', 'CM', 'en');
    expect(el.tagName).toBe('SPAN');
    expect(el.classList.contains('gloss')).toBe(true);
    expect(el.tabIndex).toBe(0);
    expect(el.getAttribute('aria-label')).toContain('Committee of Ministers');
    expect(el.textContent).toContain('CM');
    expect(el.querySelector('.gloss-tip').textContent).toContain('Council of Europe');
  });
  it('renders HTML-special characters in definitions literally (no markup injection)', () => {
    const fake = { x: { longName: { en: 'A < B & "C"' }, definition: { en: 'one <b>two</b> three' } } };
    const el = buildGlossaryEl(fake, 'x', 'X', 'en');
    const tip = el.querySelector('.gloss-tip');
    expect(tip.querySelector('b')).toBe(null);          // no injected element
    expect(tip.textContent).toContain('<b>two</b>');     // shown as literal text
    expect(el.querySelector('strong').textContent).toBe('A < B & "C"');
  });
  it('returns an inert, non-focusable span for an unknown key', () => {
    const el = buildGlossaryEl(GLOSSARY, 'nope', 'XYZ', 'en');
    expect(el.textContent).toBe('XYZ');
    expect(el.querySelector('.gloss-tip')).toBe(null);
    expect(el.hasAttribute('tabindex')).toBe(false);
  });
});
