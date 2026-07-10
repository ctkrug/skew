import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { offsetBarWidthPercent } from '../src/offset-bar.js';

describe('offsetBarWidthPercent', () => {
  it('fills to 100% when the offset equals the max', () => {
    expect(offsetBarWidthPercent(37, 37)).toBe(100);
  });

  it('scales proportionally below the max', () => {
    expect(offsetBarWidthPercent(18, 37)).toBeCloseTo((18 / 37) * 100, 5);
  });

  it('returns 0 for a zero offset', () => {
    expect(offsetBarWidthPercent(0, 37)).toBe(0);
  });

  it('clamps above 100% if the offset exceeds the max', () => {
    expect(offsetBarWidthPercent(50, 37)).toBe(100);
  });

  it('clamps below 0% for a negative offset', () => {
    expect(offsetBarWidthPercent(-5, 37)).toBe(0);
  });

  it('returns 0 rather than dividing by zero when max is 0', () => {
    expect(offsetBarWidthPercent(10, 0)).toBe(0);
  });

  it('returns 0 rather than a flipped-sign ratio when max is negative', () => {
    expect(offsetBarWidthPercent(10, -37)).toBe(0);
  });
});

describe('offsetBarWidthPercent — properties', () => {
  it('always stays within [0, 100] for any finite offset and a positive max', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -1e6, max: 1e6, noNaN: true }),
        fc.double({ min: Number.EPSILON, max: 1e6, noNaN: true }),
        (offset, max) => {
          const result = offsetBarWidthPercent(offset, max);
          expect(result).toBeGreaterThanOrEqual(0);
          expect(result).toBeLessThanOrEqual(100);
        },
      ),
    );
  });

  it('is monotonically non-decreasing in offset for a fixed positive max', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -1e6, max: 1e6, noNaN: true }),
        fc.double({ min: -1e6, max: 1e6, noNaN: true }),
        fc.double({ min: Number.EPSILON, max: 1e6, noNaN: true }),
        (a, b, max) => {
          const [lo, hi] = a <= b ? [a, b] : [b, a];
          expect(offsetBarWidthPercent(lo, max)).toBeLessThanOrEqual(
            offsetBarWidthPercent(hi, max),
          );
        },
      ),
    );
  });

  it('is always exactly 0 for any non-positive max', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -1e6, max: 1e6, noNaN: true }),
        fc.double({ min: -1e6, max: 0, noNaN: true }),
        (offset, max) => {
          expect(offsetBarWidthPercent(offset, max)).toBe(0);
        },
      ),
    );
  });
});
