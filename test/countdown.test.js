import { describe, it, expect } from 'vitest';
import { timeRemaining, DECISION_INSTANT, ODDS } from '../src/countdown.js';

describe('timeRemaining', () => {
  it('counts down to a future target', () => {
    const now = new Date('2026-12-31T23:59:00Z');
    const target = new Date('2026-12-31T23:59:59Z');

    const result = timeRemaining(now, target);

    expect(result.isPast).toBe(false);
    expect(result.days).toBe(0);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(59);
  });

  it('flags a target already in the past', () => {
    const now = new Date('2027-01-01T00:00:01Z');
    const target = new Date('2026-12-31T23:59:59Z');

    expect(timeRemaining(now, target).isPast).toBe(true);
  });

  it('treats now exactly equal to the target as past, not future', () => {
    const instant = new Date('2026-12-31T23:59:59Z');

    const result = timeRemaining(instant, instant);

    expect(result.totalMs).toBe(0);
    expect(result.isPast).toBe(true);
    expect(result.days).toBe(0);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(0);
  });

  it('breaks a multi-day gap into days/hours/minutes/seconds', () => {
    const now = new Date('2026-07-10T00:00:00Z');
    const target = new Date('2026-07-12T01:02:03Z');

    const result = timeRemaining(now, target);

    expect(result.days).toBe(2);
    expect(result.hours).toBe(1);
    expect(result.minutes).toBe(2);
    expect(result.seconds).toBe(3);
  });

  it('defaults to the December 2026 decision instant', () => {
    const now = new Date('2026-07-10T00:00:00Z');
    expect(timeRemaining(now).totalMs).toBe(DECISION_INSTANT.getTime() - now.getTime());
  });

  it('crosses the exact leap-second boundary instant without NaN or a throw', () => {
    const atBoundary = timeRemaining(new Date('2026-12-31T23:59:59Z'), DECISION_INSTANT);
    const oneSecondLater = timeRemaining(new Date('2027-01-01T00:00:00Z'), DECISION_INSTANT);

    for (const result of [atBoundary, oneSecondLater]) {
      expect(result.isPast).toBe(true);
      expect(Number.isNaN(result.days)).toBe(false);
      expect(Number.isNaN(result.hours)).toBe(false);
      expect(Number.isNaN(result.minutes)).toBe(false);
      expect(Number.isNaN(result.seconds)).toBe(false);
    }
  });
});

describe('ODDS', () => {
  it('sums outcome probabilities to 1', () => {
    const total = ODDS.outcomes.reduce((sum, o) => sum + o.probability, 0);
    expect(total).toBeCloseTo(1, 5);
  });

  it('gives every outcome a label and reasoning', () => {
    for (const outcome of ODDS.outcomes) {
      expect(outcome.label).toBeTruthy();
      expect(outcome.reasoning).toBeTruthy();
    }
  });
});
