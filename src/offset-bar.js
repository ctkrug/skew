/**
 * Pure sizing math for the offset bars beneath the TAI/GPS clock panels.
 * Kept separate from the SVG markup so the proportional-width calculation
 * (the part a bug would silently mis-scale) is trivial to unit test.
 */

/**
 * @param {number} offsetSeconds the clock's offset from UTC, in seconds
 * @param {number} maxOffsetSeconds the offset that should fill the bar (100%)
 * @returns {number} a width percentage in [0, 100]
 */
export function offsetBarWidthPercent(offsetSeconds, maxOffsetSeconds) {
  if (maxOffsetSeconds <= 0) return 0;
  const ratio = offsetSeconds / maxOffsetSeconds;
  return Math.min(100, Math.max(0, ratio * 100));
}
