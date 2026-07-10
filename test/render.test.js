// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { render } from '../src/render.js';
import { DECISION_INSTANT, ODDS } from '../src/countdown.js';

function freshRoot() {
  return document.createElement('div');
}

describe('render — clock panels', () => {
  it('renders one panel per clock, each with an inline SVG dial', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:00Z'));

    for (const key of ['utc', 'tai', 'gps']) {
      const panel = root.querySelector(`[data-clock="${key}"]`);
      expect(panel).not.toBeNull();
      expect(panel.querySelector('svg.dial')).not.toBeNull();
    }
  });

  it('keeps TAI exactly 37s and GPS exactly 18s ahead of UTC in the digital readout', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:00Z'));

    expect(root.querySelector('[data-clock="utc"] [data-field="readout"]').textContent).toBe(
      '00:00:00'
    );
    expect(root.querySelector('[data-clock="tai"] [data-field="readout"]').textContent).toBe(
      '00:00:37'
    );
    expect(root.querySelector('[data-clock="gps"] [data-field="readout"]').textContent).toBe(
      '00:00:18'
    );
  });

  it('re-renders the digital readout on a later call with the same root', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:00Z'));
    render(root, new Date('2026-07-10T00:01:00Z'));

    expect(root.querySelector('[data-clock="utc"] [data-field="readout"]').textContent).toBe(
      '00:01:00'
    );
  });

  it('does not rebuild the DOM subtree on repeat renders, preserving element identity', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:00Z'));
    const panelBefore = root.querySelector('[data-clock="utc"]');
    render(root, new Date('2026-07-10T00:00:01Z'));
    const panelAfter = root.querySelector('[data-clock="utc"]');

    expect(panelBefore).toBe(panelAfter);
  });

  it('renders an offset bar with an exact-seconds label for TAI and GPS, but not UTC', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:00Z'));

    expect(root.querySelector('[data-clock="utc"] [data-offset-bar]')).toBeNull();

    const tai = root.querySelector('[data-clock="tai"] [data-offset-bar]');
    const gps = root.querySelector('[data-clock="gps"] [data-offset-bar]');
    expect(tai.getAttribute('aria-label')).toBe('TAI is 37 seconds ahead of UTC');
    expect(gps.getAttribute('aria-label')).toBe('GPS is 18 seconds ahead of UTC');
  });

  it('scales the TAI and GPS offset bar fills proportionally to their offsets', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:00Z'));

    const taiFill = root.querySelector('[data-clock="tai"] .offset-bar__fill');
    const gpsFill = root.querySelector('[data-clock="gps"] .offset-bar__fill');
    expect(Number(taiFill.getAttribute('width'))).toBeGreaterThan(
      Number(gpsFill.getAttribute('width'))
    );
    expect(Number(taiFill.getAttribute('width'))).toBe(100);
  });

  it('makes the offset bar focusable via keyboard', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:00Z'));

    expect(
      root.querySelector('[data-clock="tai"] [data-offset-bar]').getAttribute('tabindex')
    ).toBe('0');
  });
});

describe('render — explainer', () => {
  it('has a real, reachable heading and mentions the 2016 leap second and 1980 GPS epoch', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:00Z'));

    const heading = root.querySelector('#explainer-heading');
    expect(heading).not.toBeNull();
    expect(heading.tagName).toBe('H2');
    expect(root.textContent).toContain('2016');
    expect(root.textContent).toContain('1980-01-06');
  });
});

describe('render — countdown', () => {
  it('renders a countdown to the decision boundary', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:00Z'));

    const value = root.querySelector('[data-field="countdown-value"]');
    expect(value.hidden).toBe(false);
    expect(value.textContent).toMatch(/\d+d \d{2}h \d{2}m \d{2}s/);
    expect(root.querySelector('[data-field="decided"]').hidden).toBe(true);
  });

  it('switches to a decided state once the boundary has passed, with no negative numbers or NaN', () => {
    const root = freshRoot();
    const afterBoundary = new Date(DECISION_INSTANT.getTime() + 60_000);
    render(root, afterBoundary);

    const value = root.querySelector('[data-field="countdown-value"]');
    const decided = root.querySelector('[data-field="decided"]');
    expect(value.hidden).toBe(true);
    expect(decided.hidden).toBe(false);
    expect(decided.textContent).not.toContain('NaN');
    expect(decided.textContent).not.toContain('-');
  });

  it('handles the exact boundary instant without throwing', () => {
    const root = freshRoot();
    expect(() => render(root, DECISION_INSTANT)).not.toThrow();
    expect(root.querySelector('[data-field="decided"]').hidden).toBe(false);
  });
});

describe('render — odds tracker', () => {
  it('lists every outcome from ODDS with its probability and reasoning', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:00Z'));

    const items = root.querySelectorAll('.odds__item');
    expect(items.length).toBe(ODDS.outcomes.length);
    for (const outcome of ODDS.outcomes) {
      expect(root.textContent).toContain(outcome.label);
      expect(root.textContent).toContain(outcome.reasoning);
    }
  });

  it('shows the listed probabilities summing to 100%', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:00Z'));

    expect(root.querySelector('.odds__total').textContent).toContain('100%');
  });

  it('cites IERS Bulletin C and the 2022 CGPM resolution, with an as-of date', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:00Z'));

    expect(root.textContent).toContain('IERS Bulletin C');
    expect(root.textContent).toContain('2022 CGPM');
    expect(root.querySelector('.odds__asof time').getAttribute('datetime')).toBe(ODDS.asOf);
  });
});
