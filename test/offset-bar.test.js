import { describe, it, expect } from 'vitest';
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
});
