// tests/tooltips.test.js
import { describe, it, expect } from 'vitest';
import { computeTipPosition } from '../js/tooltips.js';

const VP = { vw: 1000, vh: 800 };
const tip = { w: 240, h: 100 };

describe('computeTipPosition', () => {
  it('places the tooltip above and centred when there is room', () => {
    const anchor = { left: 480, top: 400, bottom: 416, width: 40 };
    const pos = computeTipPosition(anchor, tip, VP);
    expect(pos.placement).toBe('top');
    expect(pos.top).toBe(400 - 100 - 8);          // above with the gap
    expect(pos.left).toBe(480 + 20 - 120);        // centred over the anchor
  });
  it('flips below when the anchor is near the top edge', () => {
    const anchor = { left: 480, top: 20, bottom: 36, width: 40 };
    const pos = computeTipPosition(anchor, tip, VP);
    expect(pos.placement).toBe('bottom');
    expect(pos.top).toBe(36 + 8);
  });
  it('clamps to the left edge so it never goes off-screen', () => {
    const anchor = { left: 0, top: 400, bottom: 416, width: 30 };
    const pos = computeTipPosition(anchor, tip, VP);
    expect(pos.left).toBe(8); // MARGIN
  });
  it('clamps to the right edge', () => {
    const anchor = { left: 980, top: 400, bottom: 416, width: 20 };
    const pos = computeTipPosition(anchor, tip, VP);
    expect(pos.left).toBe(1000 - 240 - 8); // vw - tipW - MARGIN
  });
  it('clamps vertically when the tooltip fits on neither side', () => {
    const tall = { w: 240, h: 790 };
    const anchor = { left: 480, top: 400, bottom: 416, width: 40 };
    const pos = computeTipPosition(anchor, tall, VP);
    expect(pos.top).toBe(8); // max(MARGIN, vh - h - MARGIN) = max(8, -... ) -> 8
  });
});
