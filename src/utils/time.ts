import { SPANISH_BANKS } from '@/data/station';

/** All times shown in the app are Vancouver local time, whatever the device is set to. */
export const TIME_ZONE = SPANISH_BANKS.timeZone;

export const MINUTE_MS = 60_000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  hour12: false,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

/** Offset of the station's time zone at an instant, in milliseconds. */
function zoneOffsetMs(timeMs: number): number {
  const parts = partsFormatter.formatToParts(new Date(timeMs));
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? '0');

  const asUtc = Date.UTC(
    read('year'),
    read('month') - 1,
    read('day'),
    read('hour') % 24,
    read('minute'),
    read('second'),
  );
  return asUtc - Math.floor(timeMs / 1000) * 1000;
}

/** Midnight in Vancouver, for the day containing `timeMs`, as epoch milliseconds. */
export function startOfLocalDay(timeMs: number): number {
  const offset = zoneOffsetMs(timeMs);
  const flooredLocal = Math.floor((timeMs + offset) / DAY_MS) * DAY_MS;
  // Re-read the offset at the candidate instant so days that contain a DST
  // change still start at local midnight.
  return flooredLocal - zoneOffsetMs(flooredLocal - offset);
}

/** Adds whole local days, landing on local midnight each time. */
export function addLocalDays(timeMs: number, days: number): number {
  return startOfLocalDay(startOfLocalDay(timeMs) + days * DAY_MS + 12 * HOUR_MS);
}

export function isSameLocalDay(a: number, b: number): boolean {
  return startOfLocalDay(a) === startOfLocalDay(b);
}

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  hour: 'numeric',
  minute: '2-digit',
});

const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  weekday: 'short',
});

const dayNumberFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  day: 'numeric',
});

const longDateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

/** "3:42 PM" */
export function formatTime(timeMs: number): string {
  return timeFormatter.format(new Date(timeMs));
}

/** "Sun" */
export function formatWeekday(timeMs: number): string {
  return weekdayFormatter.format(new Date(timeMs));
}

/** "9" */
export function formatDayNumber(timeMs: number): string {
  return dayNumberFormatter.format(new Date(timeMs));
}

/** "Sunday, August 9" */
export function formatLongDate(timeMs: number): string {
  return longDateFormatter.format(new Date(timeMs));
}

/** "2h 14m", "14m", or "now" for anything under a minute. */
export function formatDuration(durationMs: number): string {
  const totalMinutes = Math.round(Math.max(0, durationMs) / MINUTE_MS);
  if (totalMinutes < 1) return 'now';

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}
