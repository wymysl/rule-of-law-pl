// tests/data.test.js
import { describe, it, expect } from 'vitest';
import { CASES } from '../data/cases.js';
import { EVENTS } from '../data/events.js';
import { THEME_KEYS } from '../data/themes.js';
import { validateCases } from '../js/data.js';

describe('seed data integrity', () => {
  it('every case has required glance fields', () => {
    const errors = validateCases(CASES, THEME_KEYS);
    expect(errors).toEqual([]);
  });
  it('relationship targets all exist', () => {
    const ids = new Set(CASES.map(c => c.id));
    for (const c of CASES)
      for (const r of (c.relationships || []))
        expect(ids.has(r.targetId), `${c.id} -> ${r.targetId}`).toBe(true);
  });
  it('has at least the 17 seed cases (grows as the content workstream adds more)', () => {
    expect(CASES.length).toBeGreaterThanOrEqual(17);
  });
  it('every timeline event has a date and label, and its related case ids all exist', () => {
    const ids = new Set(CASES.map(c => c.id));
    for (const e of EVENTS) {
      expect(e.date, 'event date').toBeTruthy();
      expect(e.label && e.label.en, 'event label.en').toBeTruthy();
      for (const id of [...(e.causedJudgments || []), ...(e.associatedJudgments || []), ...(e.related || [])])
        expect(ids.has(id), `event "${e.label.en}" -> ${id}`).toBe(true);
    }
  });
});
