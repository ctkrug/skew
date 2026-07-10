# Leap Second

A live, ticking comparison of the three time standards that quietly disagree with each
other every day — UTC, TAI, and GPS time — paired with a real countdown and odds tracker
for the December 2026 leap-second decision.

**[Live demo →](https://apps.charliekrug.com/leap-second)** *(coming at ship time)*

## Why

Almost everything on a screen shows you UTC (or a local offset of it) and pretends time is
one uniform, ever-increasing counter. It isn't:

- **UTC** — civil time, deliberately kept within 0.9s of Earth's rotation by inserting (or
  skipping) leap seconds.
- **TAI** (International Atomic Time) — a pure atomic clock count with no leap seconds,
  ever. It has been running **37 seconds ahead of UTC** since the last leap second, at the
  end of 2016.
- **GPS time** — the time standard satellites broadcast. It froze its offset from UTC at
  the 1980 GPS epoch and, like TAI, never applies leap seconds. It currently sits
  **18 seconds ahead of UTC** (19 seconds behind TAI, by definition).

Three clocks, three answers to "what time is it," all correct. Leap Second draws all
three, ticking in real time, so the gap is something you *see* rather than something you
have to take on faith from a table.

The second half of the page: whether the world adds another leap second at the end of
**December 2026** is a live, open question — the 2022 General Conference on Weights and
Measures voted to abolish the leap second by 2035, but hasn't retired it yet, and IERS
still has to publish its decision in Bulletin C. Leap Second tracks the countdown to that
boundary and a running estimate of the odds, with the reasoning behind the number.

## Features (planned — see [`docs/BACKLOG.md`](docs/BACKLOG.md))

- Three synchronized, animated clock faces (UTC / TAI / GPS) rendered in SVG, ticking in
  real time with the offsets clearly labeled.
- A live countdown to the December 31, 2026 decision boundary.
- An odds tracker with the reasoning/sources behind the estimate.
- A short, legible explainer of *why* the three clocks disagree.
- Fully responsive, keyboard-accessible, and designed to be looked at (not just correct).

## Stack

Vanilla JavaScript + inline SVG, bundled with [Vite](https://vitejs.dev/), tested with
[Vitest](https://vitest.dev/). No UI framework, no runtime dependencies — the whole point
is that the time math is small and legible enough to read directly.

## Getting started

```bash
npm install
npm run dev       # local dev server with hot reload
npm test          # run the test suite
npm run build     # production build into dist/
```

## Project layout

```
src/
  clocks.js        # UTC/TAI/GPS offset math — the source of truth for all three clocks
  countdown.js      # countdown + odds-tracker logic for the Dec 2026 decision
  render.js         # SVG clock rendering and DOM wiring
  main.js           # entry point
test/               # Vitest unit tests
docs/
  VISION.md          # problem, audience, design decisions, what "done" looks like
  BACKLOG.md         # epic/story breakdown with acceptance criteria
  DESIGN.md          # visual design direction and tokens
```

## License

MIT — see [`LICENSE`](LICENSE).
