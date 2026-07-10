/**
 * UTC/TAI/GPS offset math.
 *
 * TAI (International Atomic Time) never applies leap seconds; UTC does, to stay
 * within 0.9s of Earth's rotation. Every leap second widens the TAI-UTC gap by
 * exactly one second. The last leap second was inserted at the end of 2016,
 * putting TAI 37 seconds ahead of UTC — a gap that has been frozen since.
 *
 * GPS time also never applies leap seconds. It was set equal to UTC at the GPS
 * epoch (1980-01-06T00:00:00 UTC) and has drifted apart by one second per leap
 * second inserted since. By definition TAI is always exactly 19 seconds ahead
 * of GPS time, so GPS currently sits 37 - 19 = 18 seconds ahead of UTC.
 *
 * These offsets are constants until IERS announces another leap second in a
 * Bulletin C — see docs/VISION.md for how the December 2026 decision could
 * change them.
 */

export const TAI_UTC_OFFSET_SECONDS = 37;
export const GPS_TAI_OFFSET_SECONDS = 19;
export const GPS_UTC_OFFSET_SECONDS = TAI_UTC_OFFSET_SECONDS - GPS_TAI_OFFSET_SECONDS;

/** @param {Date} utcDate @returns {Date} the same instant expressed on the TAI timescale */
export function toTAI(utcDate) {
  return new Date(utcDate.getTime() + TAI_UTC_OFFSET_SECONDS * 1000);
}

/** @param {Date} utcDate @returns {Date} the same instant expressed on the GPS timescale */
export function toGPS(utcDate) {
  return new Date(utcDate.getTime() + GPS_UTC_OFFSET_SECONDS * 1000);
}

/**
 * @param {Date} utcDate
 * @returns {{ utc: Date, tai: Date, gps: Date }} all three clocks for one instant
 */
export function currentClocks(utcDate = new Date()) {
  return {
    utc: utcDate,
    tai: toTAI(utcDate),
    gps: toGPS(utcDate),
  };
}
