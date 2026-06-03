// tests/switcher.test.js
import { describe, it, expect, vi } from 'vitest';
import { makeSwitcher } from '../js/switcher.js';

describe('switcher', () => {
  it('clears the previous lens and renders the next', () => {
    const a = { clear: vi.fn(), render: vi.fn() };
    const b = { clear: vi.fn(), render: vi.fn() };
    const sw = makeSwitcher({ a, b }, () => ({ width: 800 }));
    sw.switchTo('a'); expect(a.render).toHaveBeenCalledTimes(1);
    sw.switchTo('b'); expect(a.clear).toHaveBeenCalledTimes(1); expect(b.render).toHaveBeenCalledTimes(1);
  });
});
