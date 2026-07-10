import { currentClocks, TAI_UTC_OFFSET_SECONDS, GPS_UTC_OFFSET_SECONDS } from './clocks.js';
import { timeRemaining, DECISION_INSTANT, ODDS } from './countdown.js';
import { handAngles } from './dial.js';
import { offsetBarWidthPercent } from './offset-bar.js';

const MAX_OFFSET_SECONDS = TAI_UTC_OFFSET_SECONDS;

const CLOCK_CONFIG = [
  { key: 'utc', label: 'UTC', sublabel: 'Coordinated Universal Time', offsetSeconds: 0 },
  {
    key: 'tai',
    label: 'TAI',
    sublabel: 'International Atomic Time',
    offsetSeconds: TAI_UTC_OFFSET_SECONDS,
  },
  { key: 'gps', label: 'GPS', sublabel: 'GPS Time', offsetSeconds: GPS_UTC_OFFSET_SECONDS },
];

function pad(n, width = 2) {
  return String(n).padStart(width, '0');
}

function formatReadout(date) {
  return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

function formatDatePart(date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function tickMarksMarkup() {
  let ticks = '';
  for (let i = 0; i < 12; i += 1) {
    const angle = (i * 30 * Math.PI) / 180;
    const outer = 46;
    const inner = i % 3 === 0 ? 38 : 41;
    const x1 = 50 + outer * Math.sin(angle);
    const y1 = 50 - outer * Math.cos(angle);
    const x2 = 50 + inner * Math.sin(angle);
    const y2 = 50 - inner * Math.cos(angle);
    ticks += `<line class="dial__tick" x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" />`;
  }
  return ticks;
}

function dialMarkup() {
  return `
    <svg class="dial" viewBox="0 0 100 100" role="img" aria-hidden="true">
      <circle class="dial__face" cx="50" cy="50" r="46" />
      ${tickMarksMarkup()}
      <line class="dial__hand dial__hand--hour" data-hand="hour" x1="50" y1="50" x2="50" y2="30" />
      <line class="dial__hand dial__hand--minute" data-hand="minute" x1="50" y1="50" x2="50" y2="20" />
      <line class="dial__hand dial__hand--second" data-hand="second" x1="50" y1="50" x2="50" y2="15" />
      <circle class="dial__pivot" cx="50" cy="50" r="2.5" />
    </svg>
  `;
}

function offsetBarMarkup(clock) {
  if (clock.offsetSeconds <= 0) return '';
  const widthPercent = offsetBarWidthPercent(clock.offsetSeconds, MAX_OFFSET_SECONDS);
  const tooltip = `${clock.label} is ${clock.offsetSeconds} seconds ahead of UTC`;
  return `
    <div class="offset-bar" data-offset-bar="${clock.key}" tabindex="0" aria-label="${tooltip}">
      <svg class="offset-bar__svg" viewBox="0 0 100 12" preserveAspectRatio="none" role="img" aria-hidden="true">
        <rect class="offset-bar__track" x="0" y="2" width="100" height="8" rx="2" />
        <rect class="offset-bar__fill" x="0" y="2" width="${widthPercent}" height="8" rx="2" />
      </svg>
      <span class="offset-bar__caption">+${clock.offsetSeconds}s vs UTC</span>
      <span class="offset-bar__tooltip" role="tooltip">${tooltip}</span>
    </div>
  `;
}

function clockPanelMarkup(clock) {
  return `
    <article class="clock-panel" data-clock="${clock.key}" aria-label="${clock.label} clock">
      <header class="clock-panel__header">
        <h2 class="clock-panel__label">${clock.label}</h2>
        <p class="clock-panel__sublabel">${clock.sublabel}</p>
      </header>
      <div class="clock-panel__dial">
        ${dialMarkup()}
      </div>
      <div class="clock-panel__readout" data-field="readout">00:00:00</div>
      <div class="clock-panel__date" data-field="date"></div>
      ${offsetBarMarkup(clock)}
    </article>
  `;
}

function explainerMarkup() {
  return `
    <section class="explainer panel" aria-labelledby="explainer-heading">
      <h2 id="explainer-heading">Why three clocks disagree</h2>
      <p>
        <strong>UTC</strong> (Coordinated Universal Time) is civil time &mdash; the one on every
        phone and laptop. It stays within 0.9 seconds of Earth's actual rotation by occasionally
        inserting a leap second, most recently at the end of 2016.
      </p>
      <p>
        <strong>TAI</strong> (International Atomic Time) never applies leap seconds; it just
        counts atomic seconds. Every leap second widens the TAI&ndash;UTC gap by exactly one
        second, which is why TAI now sits ${TAI_UTC_OFFSET_SECONDS} seconds ahead of UTC.
      </p>
      <p>
        <strong>GPS</strong> time also never applies leap seconds. It was locked to UTC at the
        GPS epoch, 1980-01-06T00:00:00 UTC, and has drifted apart by one second per leap second
        inserted since &mdash; ${GPS_UTC_OFFSET_SECONDS} seconds by now, and always exactly
        19 seconds behind TAI by definition.
      </p>
    </section>
  `;
}

function formatAsOf(isoDate) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function oddsListMarkup() {
  return ODDS.outcomes
    .map(
      (outcome) => `
        <li class="odds__item">
          <div class="odds__row">
            <span class="odds__label">${outcome.label}</span>
            <span class="odds__prob">${Math.round(outcome.probability * 100)}%</span>
          </div>
          <div class="odds__track">
            <div class="odds__track-fill" style="width: ${outcome.probability * 100}%"></div>
          </div>
          <p class="odds__reasoning">${outcome.reasoning}</p>
        </li>
      `
    )
    .join('');
}

function oddsMarkup() {
  const totalPercent = Math.round(
    ODDS.outcomes.reduce((sum, o) => sum + o.probability, 0) * 100
  );
  return `
    <div class="odds">
      <h2 id="odds-heading">Odds tracker</h2>
      <p class="odds__asof">As of <time datetime="${ODDS.asOf}">${formatAsOf(ODDS.asOf)}</time></p>
      <ul class="odds__list">${oddsListMarkup()}</ul>
      <p class="odds__total">Total: ${totalPercent}%</p>
      <p class="odds__citation">
        Source: IERS Bulletin C and the 2022 CGPM (General Conference on Weights and Measures)
        resolution on the future of UTC.
      </p>
    </div>
  `;
}

function countdownMarkup() {
  return `
    <section class="countdown-odds-panel panel" aria-label="Countdown and odds tracker">
      <div class="countdown">
        <h2 id="countdown-heading">Countdown to the Dec 2026 decision boundary</h2>
        <div class="clock-value" data-field="countdown-value"></div>
        <p class="countdown__decided" data-field="decided" hidden aria-live="polite">
          The decision boundary has passed &mdash; check IERS Bulletin C for the outcome.
        </p>
      </div>
      ${oddsMarkup()}
    </section>
  `;
}

function mount(root) {
  root.innerHTML = `
    <header class="page-header">
      <h1 class="wordmark">Leap<span class="wordmark__accent">Second</span></h1>
      <p class="muted">UTC vs TAI vs GPS, live — and a countdown to the Dec 2026 decision.</p>
    </header>
    <div class="clocks-grid">
      ${CLOCK_CONFIG.map(clockPanelMarkup).join('')}
    </div>
    ${explainerMarkup()}
    ${countdownMarkup()}
  `;
  root.dataset.mounted = '1';
}

function updateDial(panel, date) {
  const { hourDeg, minuteDeg, secondDeg } = handAngles(date);
  const hour = panel.querySelector('[data-hand="hour"]');
  const minute = panel.querySelector('[data-hand="minute"]');
  const second = panel.querySelector('[data-hand="second"]');
  if (hour) hour.setAttribute('transform', `rotate(${hourDeg} 50 50)`);
  if (minute) minute.setAttribute('transform', `rotate(${minuteDeg} 50 50)`);
  if (second) second.setAttribute('transform', `rotate(${secondDeg} 50 50)`);
}

function updateCountdown(root, now) {
  const remaining = timeRemaining(now, DECISION_INSTANT);
  const valueEl = root.querySelector('[data-field="countdown-value"]');
  const decidedEl = root.querySelector('[data-field="decided"]');

  if (remaining.isPast) {
    valueEl.hidden = true;
    decidedEl.hidden = false;
    return;
  }

  valueEl.hidden = false;
  decidedEl.hidden = true;
  valueEl.textContent =
    `${remaining.days}d ${pad(remaining.hours)}h ${pad(remaining.minutes)}m ${pad(remaining.seconds)}s`;
}

function update(root, now) {
  const clocks = currentClocks(now);

  for (const clock of CLOCK_CONFIG) {
    const panel = root.querySelector(`[data-clock="${clock.key}"]`);
    if (!panel) continue;
    const date = clocks[clock.key];
    panel.querySelector('[data-field="readout"]').textContent = formatReadout(date);
    panel.querySelector('[data-field="date"]').textContent = formatDatePart(date);
    updateDial(panel, date);
  }

  updateCountdown(root, now);
}

/**
 * Renders (or, on repeat calls with the same root, live-updates) the app.
 * The DOM is built once and patched in place thereafter so focus/hover
 * state on future interactive elements survives the once-a-second tick.
 */
export function render(root, now = new Date()) {
  if (!root.dataset.mounted) {
    mount(root);
  }
  update(root, now);
}
