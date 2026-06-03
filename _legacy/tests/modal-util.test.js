// tests/modal-util.test.js
import { describe, it, expect } from 'vitest';
import { setBackgroundInert, trapTab } from '../js/modal-util.js';

describe('modal-util', () => {
  it('setBackgroundInert toggles inert + aria-hidden on background regions', () => {
    const sc = document.createElement('div'); sc.id = 'scroller';
    document.body.appendChild(sc);
    setBackgroundInert(true);
    expect(sc.hasAttribute('inert')).toBe(true);
    expect(sc.getAttribute('aria-hidden')).toBe('true');
    setBackgroundInert(false);
    expect(sc.hasAttribute('inert')).toBe(false);
    expect(sc.hasAttribute('aria-hidden')).toBe(false);
    sc.remove();
  });

  it('trapTab wraps focus from the last focusable back to the first', () => {
    const card = document.createElement('div'); card.tabIndex = -1;
    const b1 = document.createElement('button'); const b2 = document.createElement('button');
    card.append(b1, b2); document.body.appendChild(card);
    b2.focus();
    const e = new KeyboardEvent('keydown', { key: 'Tab' });
    let prevented = false; e.preventDefault = () => { prevented = true; };
    const handled = trapTab(card, e);
    expect(handled).toBe(true);
    expect(prevented).toBe(true);
    expect(document.activeElement).toBe(b1);
    card.remove();
  });

  it('trapTab ignores non-Tab keys', () => {
    const card = document.createElement('div');
    expect(trapTab(card, new KeyboardEvent('keydown', { key: 'a' }))).toBe(false);
  });
});
