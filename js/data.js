// js/data.js
import { CASES, RELATIONSHIP_TYPES } from '../data/cases.js';
import { THEMES, THEME_KEYS } from '../data/themes.js';
import { EVENTS } from '../data/events.js';
import { GLOSSARY } from '../data/glossary.js';
import { UI } from '../data/ui.js';
import { PRIMER } from '../data/primer.js';
import { STORY } from '../data/story.js';
import { READING } from '../data/reading.js';

const REQUIRED = ['id', 'court', 'date', 'shortName', 'themes', 'outcome', 'summary'];
const REL_TYPES = Object.keys(RELATIONSHIP_TYPES);
const GLOSS_KEYS = Object.keys(GLOSSARY);
const EXEC_STATUSES = ['open', 'partial', 'closed'];

export function validateCases(cases, themeKeys) {
  const errors = [];
  for (const c of cases) {
    const id = c.id ?? '?';
    for (const f of REQUIRED)
      if (c[f] == null) errors.push(`${id} missing ${f}`);
    if (c.court != null && !['CJEU', 'ECtHR'].includes(c.court)) errors.push(`${id} bad court ${c.court}`);
    for (const th of (c.themes || []))
      if (!themeKeys.includes(th)) errors.push(`${id} unknown theme ${th}`);
    if (c.summary && c.summary.en == null) errors.push(`${id} summary needs en`);
    for (const r of (c.relationships || []))
      if (!REL_TYPES.includes(r.type)) errors.push(`${id} unknown rel type ${r.type}`);
    for (const lb of (c.legalBasis || []))
      if (lb.gloss && !GLOSS_KEYS.includes(lb.gloss)) errors.push(`${id} unknown gloss key ${lb.gloss}`);
    if (c.execution?.status && !EXEC_STATUSES.includes(c.execution.status))
      errors.push(`${id} bad execution status ${c.execution.status}`);
  }
  return errors;
}

// Walk the data trees and flag every localized value that has a non-empty `en`
// string but no usable `pl` string. Returns a list of dotted paths ([] = full
// parity). Guards against the EN→PL fallback silently serving English to Polish
// readers.
export function findMissingTranslations(root) {
  const missing = [];
  const visit = (node, path) => {
    if (Array.isArray(node)) { node.forEach((v, i) => visit(v, `${path}[${i}]`)); return; }
    if (node && typeof node === 'object') {
      if (typeof node.en === 'string' && node.en.trim() !== '' &&
          (typeof node.pl !== 'string' || node.pl.trim() === '')) missing.push(path || '(root)');
      for (const [k, v] of Object.entries(node)) {
        if (k === 'en' || k === 'pl') continue;
        visit(v, path ? `${path}.${k}` : k);
      }
    }
  };
  visit(root, '');
  return missing;
}

export function loadData() {
  const errors = validateCases(CASES, THEME_KEYS);
  if (errors.length) console.warn('Data validation:', errors);
  return {
    cases: CASES, themes: THEMES, events: EVENTS, glossary: GLOSSARY,
    ui: UI, primer: PRIMER, story: STORY, reading: READING, relationshipTypes: RELATIONSHIP_TYPES,
  };
}
