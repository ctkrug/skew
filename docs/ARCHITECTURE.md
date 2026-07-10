# Architecture

A concise map of the codebase for anyone (human or model) picking this up cold.

## Data flow

```
main.js
  └─ render(root, now)          # called once, then every 1000ms via setInterval
       ├─ mount(root)           # builds the full DOM tree, once, on the first call
       └─ update(root, now)     # patches text/attributes on the existing DOM, every call
            ├─ clocks.js        # currentClocks(now) -> { utc, tai, gps } Date objects
            ├─ dial.js          # handAngles(date) -> hour/minute/second rotation degrees
            └─ countdown.js     # timeRemaining(now) -> days/hours/minutes/seconds/isPast
```

The two pure-math modules (`clocks.js`, `countdown.js`, `dial.js`, `offset-bar.js`) have no
DOM or timer dependency — every one of them is a plain function over a `Date` or a number,
which is what makes them cheap to property-test and safe to refactor.

## Why mount/update instead of re-rendering wholesale

The original scaffold replaced `root.innerHTML` on every tick. That's simple but wrong for
an app with interactive elements: rebuilding the DOM every second would drop keyboard focus
and any open `:hover`/`:focus-visible` tooltip state on the offset bars every second.

`render.js` now splits the work:

- **`mount(root)`** runs once per root (guarded by `root.dataset.mounted`). It builds the
  entire static structure — clock panel skeletons, dial SVGs, offset bars (their width never
  changes, since the offsets are constants), the explainer, and the odds tracker.
- **`update(root, now)`** runs on every call. It only touches the handful of nodes that
  actually change per second: the dial hand `transform` attributes, the digital readout and
  date text, the countdown digits, the decided-state visibility, and the annotation-sweep
  active class.

Tests assert this explicitly (`test/render.test.js`: "does not rebuild the DOM subtree on
repeat renders").

## Module map

| Module              | Responsibility                                                                                                             |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `src/clocks.js`     | UTC/TAI/GPS offset constants and `toTAI`/`toGPS`/`currentClocks`                                                           |
| `src/countdown.js`  | `timeRemaining`, `DECISION_INSTANT`, and the hand-maintained `ODDS` estimate                                               |
| `src/dial.js`       | `handAngles(date)` — pure hour/minute/second rotation math for the SVG dial                                                |
| `src/offset-bar.js` | `offsetBarWidthPercent(offset, max)` — pure proportional-width math for the bars                                           |
| `src/render.js`     | Markup builders (`dialMarkup`, `offsetBarMarkup`, `explainerMarkup`, `oddsMarkup`) plus the `mount`/`update` DOM lifecycle |
| `src/main.js`       | Entry point — imports the stylesheet, calls `render()` once, then on a 1s interval                                         |
| `src/style.css`     | All styling; tokens from `docs/DESIGN.md` live at the top as CSS custom properties                                         |

## Signature detail: the annotation sweep

At the `:59`-second mark on the UTC dial (or always, if `prefers-reduced-motion` is set),
`updateAnnotation` toggles an `annotation--active` class on a `[data-annotation]` element
built once in `mount`. The CSS transition (or its absence, under reduced motion) does the
rest — no animation logic lives in JS.

## Testing approach

Each pure module has example-based unit tests at its boundaries (see `test/dial.test.js`,
`test/offset-bar.test.js`, `test/countdown.test.js` for the exact leap-second-boundary
instant, including the `now === target` equality edge and a negative/zero max-offset guard).
`test/render.test.js` drives `render()` against a `happy-dom` document and asserts on the
resulting DOM — offsets, ARIA labels, focusability, DOM-identity stability across repeat
renders, recovery when a hand/annotation/panel element is missing from the DOM, and that node
count holds steady over 1000 simulated ticks — rather than on markup strings, so refactors of
the markup shape don't break tests that don't care about it. `test/design-tokens.test.js`
parses the actual custom-property values out of `style.css` and pins the text-color tokens to
WCAG AA's 4.5:1 contrast floor, so a future palette tweak can't silently regress legibility.

## Running things

```bash
npm install
npm run dev       # local dev server
npm test          # vitest run
npm run coverage  # vitest run --coverage, full src/ report (v8, html + text)
npm run lint      # eslint .
npm run build     # production build into dist/, base-path-relative for subpath hosting
```
