# Design direction

## Aesthetic direction

Leap Second is a **blueprint/technical instrument**: crisp navy ink linework on a warm
drafting-paper background, like a schematic for a clock rather than a screenshot of one.
No dark-mode dashboard, no glassy cards — this is a precision instrument panel you'd trust
to tell you the truth about time.

## Tokens

| Token              | Value                    | Use                                                           |
| ------------------ | ------------------------ | ------------------------------------------------------------- |
| `--bg`             | `#f2ede3`                | page background — warm drafting paper                         |
| `--surface-1`      | `#ffffff`                | primary panel surface (clock faces, cards)                    |
| `--surface-2`      | `#e9e2d1`                | secondary/recessed surface (panel headers, track backgrounds) |
| `--text`           | `#16213a`                | primary ink — deep navy, near-black                           |
| `--text-muted`     | `#5b6b82`                | secondary ink — captions, labels, timestamps                  |
| `--accent`         | `#cd471c`                | signal accent — the leap second itself, countdown emphasis    |
| `--accent-support` | `#2a5c8a`                | support accent — TAI/GPS linework, secondary emphasis         |
| `--success`        | `#2f855a`                | positive/confirmed states                                     |
| `--danger`         | `#c23b3b`                | error states                                                  |
| `--border`         | `#16213a` at 15% opacity | hairline schematic borders                                    |

_`--accent` was darkened from the original `#e2572b` during QA: at 0.7rem/1rem text sizes
(the annotation label, the countdown's decided-state message) the original only hit 3.73:1
against `--surface-1`, short of WCAG AA's 4.5:1 for non-large text. `#cd471c` keeps the same
hue and reads as the same orange but clears 4.5:1 everywhere it's used as text._

**Type pairing:** [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) for
the wordmark, headings, and all ticking digits (a monospace face reads as _instrumentation_,
and keeps digit columns from jittering as they tick); [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans)
for body copy and labels. System fallback stack: `ui-monospace, "SF Mono", monospace` and
`-apple-system, "Segoe UI", sans-serif` respectively.

**Spacing unit:** 8px scale (8/16/24/32/48/64).

**Corner radius:** 4px — sharp enough to read as drafted, not soft as glass.

**Shadow/depth:** no soft glows. Panels get a 1px hairline navy border plus a crisp
2px-offset flat shadow (`2px 2px 0 rgba(22,33,58,0.12)`), like a stamped drafting stencil.
Background carries a very faint grid (blueprint graph-paper lines at ~40px, 4% opacity)
for atmosphere without competing with content.

**Motion:** UI transitions 150ms ease-out. The ticking second digits roll like a mechanical
counter over ~100ms rather than snapping.

## Layout intent

The hero is the **three clock readouts** (UTC / TAI / GPS), each its own instrument panel
with a large monospace digital readout and, beneath it, a thin SVG offset bar showing how
far that clock sits from UTC. Below the three panels, one full-width panel holds the
countdown + odds tracker.

- **1440×900 desktop:** three clock panels in a row, each ~30% width, filling the top ~55%
  of the viewport; the countdown/odds panel spans full width beneath, filling the rest.
  No dead margins — panels use the full content width with 24px gutters.
- **390×844 phone:** three clock panels stack vertically, each full-width and tall enough
  to read at a glance (no horizontal scroll); countdown/odds panel follows, also full-width.

## Signature detail

When the seconds counter on the UTC clock reaches `:59`, a dashed leader line and small
annotation callout — in the style of a technical drawing dimension marker — sweeps in from
the panel edge to label the exact TAI/GPS gap at that instant ("+37s", "+18s"), then
retracts. It's the one moment the page explicitly points at the thing it exists to show.

## Notes for BUILD

- Build all three clock faces and the offset bars as inline SVG so the annotation callout
  can be drawn with real coordinates, not overlaid HTML.
- This is a dev-tool, not a game — no SFX/juice plan needed; motion stays subtle and
  functional (ticking digits, the annotation sweep, hover/focus states).
- Respect `prefers-reduced-motion`: freeze the digit roll and annotation sweep to instant
  swaps.
