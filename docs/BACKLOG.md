# Backlog

Epics are ordered for build sequence. Every story lists concrete, verifiable acceptance
criteria — no "works well" vibes checks.

## Epic 1 — Core clock comparison (the wow moment)

- [x] **1.1 — Three live SVG clock dials for UTC / TAI / GPS** _(wow moment — build first)_
  - Loading the page shows three distinct dial readouts labeled UTC, TAI, and GPS, each
    updating every second with no page reload.
  - At any given tick, TAI's displayed value is exactly 37 seconds ahead of UTC's, and GPS's
    is exactly 18 seconds ahead of UTC's.
  - Each dial is rendered as inline SVG (inspectable in the DOM tree), not canvas or a raster
    image.

- [x] **1.2 — Offset bar under each non-UTC clock**
  - A horizontal bar beneath the TAI and GPS readouts is proportionally scaled to its offset
    (37s vs 18s), so the two bars are visibly different lengths.
  - Hovering or focusing a bar reveals a tooltip/label stating the exact offset in seconds.

- [x] **1.3 — Plain-language explainer: why the three clocks differ**
  - A section states what UTC/TAI/GPS are and why they diverge, citing the last leap second
    (end of 2016) and the GPS epoch (1980-01-06).
  - The section uses a real heading (not a styled `div`) and is reachable by keyboard/screen
    reader.

- [ ] **1.4 — Design polish pass: clock panels**
  - Clock panels' colors, fonts, spacing, radius, and shadow match the tokens in
    `docs/DESIGN.md` (verified via computed styles, not eyeballing).
  - The three clock panels together fill at least 60% of viewport height at 1440×900.

## Epic 2 — Countdown & odds tracker

- [x] **2.1 — Live countdown to the Dec 31, 2026 decision boundary**
  - The countdown panel shows days/hours/minutes/seconds remaining and updates every second
    without a reload.
  - Once the target instant is in the past, the panel switches to a "decided" state instead
    of showing negative numbers or `NaN`.

- [x] **2.2 — Odds tracker with outcome breakdown and reasoning**
  - The panel lists each outcome (no leap second / positive leap second / negative leap
    second) with its probability and one sentence of reasoning, sourced from
    `src/countdown.js`'s `ODDS`.
  - The listed probabilities visibly sum to 100%.

- [x] **2.3 — Source citation for the odds estimate**
  - The odds panel names IERS Bulletin C and the 2022 CGPM resolution as the basis for the
    estimate.
  - The estimate's "as of" date is visible on the page.

- [ ] **2.4 — Design polish pass: countdown/odds panel**
  - The countdown/odds panel spans the full content width beneath the clocks at 1440px, with
    no dead margins, per `docs/DESIGN.md`'s layout intent.
  - Countdown digits use the display font with tabular/monospace alignment so they don't
    jitter as they change.

## Epic 3 — Craft, accessibility & responsiveness

- [ ] **3.1 — Responsive layout at 390 / 768 / 1440**
  - No horizontal scrollbar appears at any of the three widths.
  - Clock panels stack vertically below 768px and sit in a row at 1024px and above.

- [ ] **3.2 — Interaction states, reduced motion, and the signature annotation sweep**
  - Every interactive control has a visible `:focus-visible` outline distinct from the
    browser default.
  - At the `:59`-second mark, a dashed leader-line callout sweeps in on the UTC dial showing
    the TAI/GPS offsets, then retracts, per `docs/DESIGN.md`'s signature detail; with
    `prefers-reduced-motion` set, it's replaced by an always-visible static label instead of
    animating.

- [ ] **3.3 — Test coverage for time-math edge cases**
  - Unit tests cover the exact leap-second-boundary instant (2026-12-31T23:59:59Z →
    2027-01-01T00:00:00Z) without throwing or producing `NaN`.
  - `npm test` and `npm run lint` both exit 0 in CI on every push.

- [ ] **3.4 — Design polish pass: accessibility & motion review**
  - Tab order through the full page is logical, and every icon-only control has an
    `aria-label`.
  - `docs/DESIGN.md`'s D3 self-review checklist (resize, squint, tab, click) has been
    performed, with any failures fixed and noted in the commit/PR description.

## Epic 4 — Ship & deploy

- [ ] **4.1 — Production build verified deployable to a subpath**
  - `dist/index.html`'s asset URLs are all relative (no leading `/`).
  - Serving `dist/` from a non-root path (e.g. `npx serve dist --single -l 5000` behind a
    reverse-proxy prefix, or opening `dist/index.html` directly) shows no absolute-path 404s
    in the console.

- [ ] **4.2 — Launch-ready README**
  - The README's live-demo link points at the real deployed URL (no longer marked "coming at
    ship time").
  - The GitHub repo has an accurate description and relevant topics set.

- [ ] **4.3 — Final design self-review**
  - Every item in `docs/DESIGN.md`'s D3 checklist has been walked through end-to-end on the
    shipped build, not just in dev.
  - The favicon and wordmark render correctly in a browser tab and page header — no default
    globe icon.
