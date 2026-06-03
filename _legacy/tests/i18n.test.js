// tests/i18n.test.js
import { describe, it, expect, afterEach } from 'vitest';
import { t, langState, setLang } from '../js/i18n.js';
import { findMissingTranslations } from '../js/data.js';
import { CASES } from '../data/cases.js';
import { THEMES } from '../data/themes.js';
import { PRIMER } from '../data/primer.js';
import { UI } from '../data/ui.js';
import { GLOSSARY } from '../data/glossary.js';
import { EVENTS } from '../data/events.js';
import { STORY } from '../data/story.js';

afterEach(() => setLang('en')); // reset shared state between tests

describe('i18n completeness gate', () => {
  it('every English string has a Polish counterpart (no silent EN→PL fallback)', () => {
    const missing = findMissingTranslations({
      cases: CASES, themes: THEMES, primer: PRIMER, ui: UI, glossary: GLOSSARY, events: EVENTS, story: STORY,
    });
    expect(missing, `missing PL for: ${missing.join(', ')}`).toEqual([]);
  });
});

describe('t()', () => {
  it('returns the active language value', () => {
    expect(t({ en: 'Court', pl: 'Sąd' }, 'pl')).toBe('Sąd');
    expect(t({ en: 'Court', pl: 'Sąd' }, 'en')).toBe('Court');
  });
  it('falls back to en when pl is missing or empty', () => {
    expect(t({ en: 'Court' }, 'pl')).toBe('Court');
    expect(t({ en: 'Court', pl: '' }, 'pl')).toBe('Court');
  });
  it('passes through plain strings', () => {
    expect(t('C-791/19', 'pl')).toBe('C-791/19');
  });
  it('returns empty string for null/undefined', () => {
    expect(t(null, 'en')).toBe('');
    expect(t(undefined, 'pl')).toBe('');
  });
  it('defaults to the shared current language when lang is omitted', () => {
    setLang('pl');
    expect(langState.current).toBe('pl');
    expect(t({ en: 'Court', pl: 'Sąd' })).toBe('Sąd');
    setLang('en');
    expect(t({ en: 'Court', pl: 'Sąd' })).toBe('Court');
  });
});
