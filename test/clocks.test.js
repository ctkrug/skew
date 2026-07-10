import { describe, it, expect } from 'vitest';
import {
  TAI_UTC_OFFSET_SECONDS,
  GPS_UTC_OFFSET_SECONDS,
  GPS_TAI_OFFSET_SECONDS,
  toTAI,
  toGPS,
  currentClocks,
} from '../src/clocks.js';

describe('clock offsets', () => {
  it('keeps TAI exactly 19s ahead of GPS, by definition', () => {
    expect(TAI_UTC_OFFSET_SECONDS - GPS_UTC_OFFSET_SECONDS).toBe(GPS_TAI_OFFSET_SECONDS);
  });

  it('reports the current 37s TAI-UTC gap', () => {
    expect(TAI_UTC_OFFSET_SECONDS).toBe(37);
  });

  it('reports the current 18s GPS-UTC gap', () => {
    expect(GPS_UTC_OFFSET_SECONDS).toBe(18);
  });
});

describe('toTAI / toGPS', () => {
  const utc = new Date('2026-07-10T00:00:00Z');

  it('advances TAI by 37 seconds over UTC', () => {
    expect(toTAI(utc).getTime() - utc.getTime()).toBe(37_000);
  });

  it('advances GPS by 18 seconds over UTC', () => {
    expect(toGPS(utc).getTime() - utc.getTime()).toBe(18_000);
  });
});

describe('currentClocks', () => {
  it('returns all three clocks for one instant', () => {
    const utc = new Date('2026-07-10T12:00:00Z');
    const { utc: u, tai, gps } = currentClocks(utc);

    expect(u).toBe(utc);
    expect(tai.getTime()).toBe(utc.getTime() + 37_000);
    expect(gps.getTime()).toBe(utc.getTime() + 18_000);
  });
});
