// tests/linkify.test.js
import { describe, it, expect } from 'vitest';
import { buildAliasList, tokenize, deriveCaseAliases } from '../js/linkify.js';

const GLOSSARY = {
  krs: { aliases: ['National Council of the Judiciary', 'KRS', 'NCJ'], longName: { en: 'KRS' }, definition: { en: 'def' } },
  discChamber: { aliases: ['Disciplinary Chamber'], longName: { en: 'DC' }, definition: { en: 'def' } },
};
const CASES = [
  { id: '43447/19', shortName: { en: 'Reczkowicz v. Poland' }, summary: { en: 'snap' }, aliases: ['Reczkowicz'] },
  { id: '50849/21', shortName: { en: 'Wałęsa v. Poland' }, summary: { en: 'snap' } },
];

describe('linkify', () => {
  it('derives a case alias by stripping " v. Poland"', () => {
    expect(deriveCaseAliases({ shortName: { en: 'Wałęsa v. Poland' } })).toEqual(['Wałęsa']);
  });
  it('does NOT derive a generic alias that several cases share', () => {
    // All four "Commission v. Poland (…)" cases would reduce to "Commission" — ambiguous.
    expect(deriveCaseAliases({ shortName: { en: 'Commission v. Poland (Supreme Court)' } })).toEqual([]);
    expect(deriveCaseAliases({ shortName: { en: 'Others v. Poland' } })).toEqual([]); // "Others" is generic
    expect(deriveCaseAliases({ shortName: { en: 'Reczkowicz v. Poland' } })).toEqual(['Reczkowicz']); // distinctive still works
  });
  it('does not auto-link the bare word "Commission" to any single case', () => {
    const cases = [
      { id: 'C-619/18', shortName: { en: 'Commission v. Poland (Supreme Court)' }, aliases: ['Commission v. Poland (Supreme Court)'] },
      { id: 'C-791/19', shortName: { en: 'Commission v. Poland (Disciplinary Chamber)' }, aliases: ['Commission v. Poland (Disciplinary Chamber)'] },
    ];
    const list = buildAliasList({}, cases);
    expect(list.some(i => i.alias === 'Commission')).toBe(false);
    const segs = tokenize('The Commission brought the action.', list);
    expect(segs.filter(s => s.type)).toEqual([]); // bare "Commission" stays plain text
    // but the full distinctive name still links to the right case
    const full = tokenize('See Commission v. Poland (Disciplinary Chamber) here.', list);
    expect(full.find(s => s.type)?.key).toBe('C-791/19');
  });
  it('builds an alias list sorted longest-first, excluding the current case', () => {
    const list = buildAliasList(GLOSSARY, CASES, { excludeCaseId: '50849/21' });
    expect(list[0].alias).toBe('National Council of the Judiciary'); // longest first
    expect(list.some(i => i.key === '50849/21')).toBe(false);        // excluded
    expect(list.find(i => i.alias === 'Reczkowicz').type).toBe('case');
    expect(list.find(i => i.alias === 'KRS').type).toBe('gloss');
  });
  it('tokenizes prose, tagging glossary and case matches with whole-word boundaries', () => {
    const list = buildAliasList(GLOSSARY, CASES, { excludeCaseId: '50849/21' });
    const segs = tokenize('The Disciplinary Chamber echoed Reczkowicz and the KRS reform.', list);
    const linked = segs.filter(s => s.type);
    expect(linked.map(s => s.text)).toEqual(['Disciplinary Chamber', 'Reczkowicz', 'KRS']);
    expect(segs.find(s => s.text === 'Disciplinary Chamber').type).toBe('gloss');
    expect(segs.find(s => s.text === 'Reczkowicz').type).toBe('case');
    // reassembling segments reproduces the original text exactly
    expect(segs.map(s => s.text).join('')).toBe('The Disciplinary Chamber echoed Reczkowicz and the KRS reform.');
  });
  it('does not match an alias inside a larger word', () => {
    const list = buildAliasList({ x: { aliases: ['CM'], longName: { en: 'CM' }, definition: { en: 'd' } } }, []);
    const segs = tokenize('The CMS system and CM body.', list);
    expect(segs.filter(s => s.type).map(s => s.text)).toEqual(['CM']); // only the standalone CM
  });
});
