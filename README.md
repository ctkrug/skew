# Skew

**▶ Live demo: [apps.charliekrug.com/leap-second](https://apps.charliekrug.com/leap-second/)**

[![CI](https://github.com/ctkrug/leap-second/actions/workflows/ci.yml/badge.svg)](https://github.com/ctkrug/leap-second/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> The leap-second countdown, with live UTC/TAI/GPS clocks.

Skew shows the three time standards that quietly disagree with each other every day, ticking
side by side, and counts down to the December 2026 leap-second decision. It is built for
developers, GNSS and telecom engineers, and anyone who has ever wondered why computers can't
agree on what time it is and wants a correct, visual answer.

## Why it exists

Almost every clock you look at shows civil time (UTC, or a local offset of it) and quietly
teaches you that time is one uniform, ever-increasing counter. It isn't. Three real,
broadcast timescales run right now and each sits a different, precisely known number of
seconds from UTC:

- **UTC** is civil time, kept within 0.9s of Earth's rotation by occasionally inserting a
  leap second, most recently at the end of 2016.
- **TAI** (International Atomic Time) never applies leap seconds. It has run a fixed
  **37 seconds ahead of UTC** since that 2016 leap second.
- **GPS time** also skips leap seconds. It was aligned with UTC at the 1980 GPS epoch and now
  sits **18 seconds ahead of UTC**, exactly 19 seconds behind TAI.

Three clocks, three answers to "what time is it," all correct. Skew draws all three as real
ticking dials so the gap is something you watch happen, not a number you take on faith from a
table.

The second half of the page tracks a live, open question: will the world add another leap
second at the end of **December 2026**? IERS publishes that decision twice a year in
Bulletin C, the 2022 CGPM resolution has already voted to retire the leap second by 2035, and
Earth's accelerating rotation has put a never-before-issued _negative_ leap second on the
table. Skew counts down to the boundary and shows a running estimate of the odds, with the
reasoning behind each number.

## What you see

```
  UTC                 TAI                 GPS
  00:00:00            00:00:37            00:00:18
                      +37s vs UTC ▓▓▓▓▓   +18s vs UTC ▓▓▓░░

  Countdown to the Dec 2026 decision boundary
  174d 00h 00m 00s

  No leap second inserted ............. 95%
  Positive leap second (+1s) .......... 3%
  Negative leap second (-1s) .......... 2%
```

## Features

- **Three synchronized dials.** UTC, TAI, and GPS rendered as inline-SVG clock faces with
  digital readouts, ticking in real time, plus a proportional offset bar under TAI and GPS.
- **A live countdown** to the 31 December 2026 boundary that switches to a decided state,
  pointing at Bulletin C, once the instant passes.
- **An odds tracker with its reasoning**, not a bare percentage, sourced from IERS Bulletin C
  and the 2022 CGPM resolution.
- **A plain-language explainer** of why the three clocks disagree, for anyone who has never
  heard of TAI or the GPS epoch.
- **A signature detail:** at the `:59`-second mark, a dashed leader-line callout sweeps in on
  the UTC dial to label the exact TAI and GPS offsets.
- **Correct by construction.** All the time math is pure functions over `Date`, unit- and
  property-tested, with the offset constants documented in one place.

## Stack

Vanilla JavaScript and inline SVG, bundled with [Vite](https://vitejs.dev/) and tested with
[Vitest](https://vitest.dev/). No UI framework and no runtime dependencies, because the whole
point is that the time math is small and legible enough to read directly.

## Getting started

```bash
npm install
npm run dev        # local dev server with hot reload
npm test           # run the test suite
npm run coverage   # run the test suite with a coverage report
npm run build      # production build into site/
```

## Project layout

```
src/
  clocks.js         # UTC/TAI/GPS offset math, the source of truth for all three clocks
  countdown.js      # countdown + odds-tracker logic for the Dec 2026 decision
  dial.js           # pure hand-angle math for the SVG clock dials
  offset-bar.js     # pure width-percentage math for the offset bars
  render.js         # SVG rendering and DOM wiring (mount once, patch per tick)
  main.js           # entry point
test/               # Vitest unit + property-based tests
docs/
  VISION.md         # problem, audience, design decisions, what "done" looks like
  BACKLOG.md        # epic/story breakdown with acceptance criteria
  DESIGN.md         # visual design direction and tokens
  ARCHITECTURE.md   # concise map of the codebase for future work
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how the pieces fit together.

## License

MIT. See [`LICENSE`](LICENSE).

---

More of Charlie's projects → [apps.charliekrug.com](https://apps.charliekrug.com)
