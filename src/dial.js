/**
 * Pure hand-angle math for the SVG clock dials. Kept separate from markup so
 * the geometry (the part that must be correct) is trivial to unit test
 * without touching the DOM.
 *
 * Angles are degrees clockwise from 12 o'clock (0deg), matching an SVG
 * `rotate(deg cx cy)` transform applied to an upward-pointing hand.
 */

const DEGREES_PER_HOUR = 360 / 12;
const DEGREES_PER_MINUTE = 360 / 60;
const DEGREES_PER_SECOND = 360 / 60;

/**
 * @param {Date} date a Date whose UTC-frame fields represent the clock to draw
 *   (already offset for TAI/GPS via src/clocks.js — the dial just reads fields)
 * @returns {{ hourDeg: number, minuteDeg: number, secondDeg: number }}
 */
export function handAngles(date) {
  const hours = date.getUTCHours() % 12;
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();

  const secondDeg = seconds * DEGREES_PER_SECOND;
  const minuteDeg = (minutes + seconds / 60) * DEGREES_PER_MINUTE;
  const hourDeg = (hours + minutes / 60) * DEGREES_PER_HOUR;

  return { hourDeg, minuteDeg, secondDeg };
}
