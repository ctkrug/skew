# Vision

## The problem

Every clock you look at — your phone, your laptop, the wall — shows civil time (UTC, or a
local offset of it) and implicitly teaches you that time is a single, ever-increasing count.
It isn't. Atomic time (TAI) and satellite time (GPS) are both real, both broadcast, both
running right now, and both **disagree with UTC by a different, precisely known number of
seconds** — 37 and 18 respectively, as of this writing. Almost nobody outside GNSS/telecom
engineering has ever seen that disagreement made visible.

At the same time, there's a real, dated question in the world right now: will UTC gain
another leap second at the end of December 2026? IERS decides and publishes this twice a
year in Bulletin C, the 2022 CGPM resolution has already voted to retire leap seconds
entirely by 2035, and Earth's accelerating rotation has made the *opposite* problem — a
never-before-issued negative leap second — a live topic. Nobody has built a page that treats
this as the countdown it actually is.

## Who it's for

Developers, GNSS/telecom engineers, and time-keeping nerds who already know roughly what a
leap second is but have never seen the three timescales ticking side by side, and anyone
who lands on the page from a "why don't computers agree on what time it is" search and wants
a legible, correct, visual answer.

## The core idea

Three synchronized clock faces — UTC, TAI, GPS — rendered as real ticking instruments, not a
static table of offsets, so the 37/18-second gaps are something you watch happen rather than
read as a number. Paired with a live countdown to the December 2026 decision boundary and an
odds tracker that shows its reasoning, not just a percentage.

## Key design decisions

- **No backend, no live data feed.** All three offsets are constants that only change when
  IERS actually calls a leap second (a handful of times a decade); the odds estimate is a
  static, hand-maintained value with cited reasoning (see `src/countdown.js`), refreshed by
  hand as new bulletins land rather than pretending to be a live oracle.
- **SVG over canvas.** The clock faces and offset bars are inline SVG so they stay crisp at
  any size, are inspectable/stylable like DOM, and can host the annotation-callout signature
  detail (`docs/DESIGN.md`) with real coordinates.
- **Time math isolated from rendering.** `src/clocks.js` and `src/countdown.js` contain only
  pure functions over `Date` — no DOM, no timers — so the one part of this app that has to be
  *correct* is also the easiest part to unit test in isolation.
- **Static, single-directory build.** Vite with a relative base so the whole thing ships as
  one `dist/` folder deployable under any subpath (`apps.charliekrug.com/leap-second`), no
  server required.

## What "v1 done" looks like

- All three clock faces animate in real time as SVG dials with digital readouts, matching
  `docs/DESIGN.md`.
- The countdown to the Dec 2026 boundary ticks live, and the odds tracker shows its outcome
  breakdown with reasoning, not a bare number.
- A short explainer section makes the *why* (leap seconds, TAI, GPS epoch) legible to someone
  who has never heard of any of the three.
- The page is fully responsive (390/768/1440), keyboard-accessible, has a designed favicon
  and wordmark, and passes the design self-review in `docs/DESIGN.md`.
- `npm run build` produces a self-contained `dist/` deployable to a subpath with no further
  configuration.
