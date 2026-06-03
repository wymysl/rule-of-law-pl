// tests/story.test.js
import { describe, it, expect } from 'vitest';
import { STORY } from '../data/story.js';
import { CASES } from '../data/cases.js';

describe('story script', () => {
  const ids = new Set(CASES.map(c => c.id));
  it('every case step points at a real case', () => {
    for (const s of STORY.steps) {
      if (s.caseId != null) expect(ids.has(s.caseId), `story step -> ${s.caseId}`).toBe(true);
    }
  });
  it('has an intro and outro (caseId null) and seven case steps', () => {
    const caseSteps = STORY.steps.filter(s => s.caseId != null);
    const bookends = STORY.steps.filter(s => s.caseId == null);
    expect(caseSteps.length).toBe(7);
    expect(bookends.length).toBe(2);
  });
  it('every step has narration in both languages', () => {
    for (const s of STORY.steps) {
      expect(s.narration.en, 'en narration').toBeTruthy();
      expect(s.narration.pl, 'pl narration').toBeTruthy();
    }
  });
});
