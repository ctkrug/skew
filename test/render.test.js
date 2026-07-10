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
      '00:00:00',
    );
    expect(root.querySelector('[data-clock="tai"] [data-field="readout"]').textContent).toBe(
      '00:00:37',
    );
    expect(root.querySelector('[data-clock="gps"] [data-field="readout"]').textContent).toBe(
      '00:00:18',
    );
  });

  it('re-renders the digital readout on a later call with the same root', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:00Z'));
    render(root, new Date('2026-07-10T00:01:00Z'));

    expect(root.querySelector('[data-clock="utc"] [data-field="readout"]').textContent).toBe(
      '00:01:00',
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

  it('rolls TAI and GPS onto tomorrow while UTC is still today, near midnight', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T23:59:30Z'));

    expect(root.querySelector('[data-clock="utc"] [data-field="date"]').textContent).toBe(
      '2026-07-10',
    );
    expect(root.querySelector('[data-clock="tai"] [data-field="date"]').textContent).toBe(
      '2026-07-11',
    );
    expect(root.querySelector('[data-clock="gps"] [data-field="date"]').textContent).toBe(
      '2026-07-10',
    );
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
      Number(gpsFill.getAttribute('width')),
    );
    expect(Number(taiFill.getAttribute('width'))).toBe(100);
  });

  it('makes the offset bar focusable via keyboard', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:00Z'));

    expect(
      root.querySelector('[data-clock="tai"] [data-offset-bar]').getAttribute('tabindex'),
    ).toBe('0');
  });
});

describe('render — signature annotation sweep', () => {
  it('is inactive through most of the minute and activates at the :59 mark', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:30Z'));
    const annotation = root.querySelector('[data-annotation]');
    expect(annotation.classList.contains('annotation--active')).toBe(false);

    render(root, new Date('2026-07-10T00:00:59Z'));
    expect(annotation.classList.contains('annotation--active')).toBe(true);
  });

  it('retracts again on the following tick', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:59Z'));
    render(root, new Date('2026-07-10T00:01:00Z'));

    expect(root.querySelector('[data-annotation]').classList.contains('annotation--active')).toBe(
      false,
    );
  });

  it('shows the exact TAI/GPS offsets in the callout label', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:59Z'));

    expect(root.querySelector('.annotation__label').textContent).toContain('37s');
    expect(root.querySelector('.annotation__label').textContent).toContain('18s');
  });

  it('stays always active, not just at :59, when prefers-reduced-motion is set', () => {
    const root = freshRoot();
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = (query) => ({ matches: query.includes('reduce'), media: query });

    try {
      render(root, new Date('2026-07-10T00:00:30Z'));
      expect(root.querySelector('[data-annotation]').classList.contains('annotation--active')).toBe(
        true,
      );
    } finally {
      window.matchMedia = originalMatchMedia;
    }
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

  it('states the exact boundary instant as a machine-readable time element', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:00Z'));

    const boundary = root.querySelector('.countdown__boundary time');
    expect(boundary).not.toBeNull();
    expect(boundary.getAttribute('datetime')).toBe(DECISION_INSTANT.toISOString());
    expect(boundary.textContent).toContain('2026');
    expect(boundary.textContent).toContain('UTC');
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

describe('render — resilience to a corrupted DOM', () => {
  it('skips a dial hand update rather than throwing if a hand element was removed', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:00Z'));
    root.querySelector('[data-clock="utc"] [data-hand="second"]').remove();

    expect(() => render(root, new Date('2026-07-10T00:00:01Z'))).not.toThrow();
  });

  it('leaves the annotation untouched rather than throwing if it was removed', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:00Z'));
    root.querySelector('[data-annotation]').remove();

    expect(() => render(root, new Date('2026-07-10T00:00:59Z'))).not.toThrow();
  });

  it('skips a whole panel rather than throwing if it was removed, and still updates the rest', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:00Z'));
    root.querySelector('[data-clock="tai"]').remove();

    expect(() => render(root, new Date('2026-07-10T00:01:00Z'))).not.toThrow();
    expect(root.querySelector('[data-clock="utc"] [data-field="readout"]').textContent).toBe(
      '00:01:00',
    );
  });
});

describe('render — long-session stability', () => {
  it('holds a constant DOM node count across thousands of ticks (no leak)', () => {
    const root = freshRoot();
    const start = new Date('2026-07-10T00:00:00Z');
    render(root, start);
    const nodeCountAfterMount = root.querySelectorAll('*').length;

    for (let i = 1; i <= 1000; i += 1) {
      render(root, new Date(start.getTime() + i * 1000));
    }

    expect(root.querySelectorAll('*').length).toBe(nodeCountAfterMount);
  });
});
