import { currentClocks, TAI_UTC_OFFSET_SECONDS, GPS_UTC_OFFSET_SECONDS } from './clocks.js';
import { timeRemaining, DECISION_INSTANT } from './countdown.js';
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

function countdownMarkup() {
  return `
    <section class="panel" aria-label="countdown">
      <span class="muted">Time to the Dec 2026 decision boundary</span>
      <div class="clock-value" data-field="countdown-value"></div>
    </section>
  `;
}

function mount(root) {
  root.innerHTML = `
    <h1>Leap Second</h1>
    <p class="muted">UTC vs TAI vs GPS, live — and a countdown to the Dec 2026 decision.</p>
    <div class="clocks-grid">
      ${CLOCK_CONFIG.map(clockPanelMarkup).join('')}
    </div>
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
  root.querySelector('[data-field="countdown-value"]').textContent =
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
