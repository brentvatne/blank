import type { TideEvent, TideSample } from '@/data/types';

export type TideTrend = 'rising' | 'falling';

/** "3.2 m" */
export function formatHeight(metres: number): string {
  return `${metres.toFixed(1)} m`;
}

/**
 * Height at an arbitrary instant, linearly interpolated between the two
 * surrounding samples. Returns null when `timeMs` falls outside the series.
 */
export function heightAtTime(samples: TideSample[], timeMs: number): number | null {
  if (samples.length === 0) return null;
  if (timeMs < samples[0].time || timeMs > samples[samples.length - 1].time) return null;

  // Samples are evenly spaced and sorted, so index the slot directly.
  const spacing = samples.length > 1 ? samples[1].time - samples[0].time : 0;
  if (spacing <= 0) return samples[0].height;

  const rawIndex = (timeMs - samples[0].time) / spacing;
  const lowIndex = Math.min(Math.floor(rawIndex), samples.length - 2);
  const low = samples[lowIndex];
  const high = samples[lowIndex + 1];
  const fraction = (timeMs - low.time) / (high.time - low.time);
  return low.height + (high.height - low.height) * fraction;
}

/** Whether the water is coming in or going out at `timeMs`. */
export function trendAtTime(samples: TideSample[], timeMs: number): TideTrend | null {
  const before = heightAtTime(samples, timeMs - 15 * 60_000);
  const after = heightAtTime(samples, timeMs + 15 * 60_000);
  if (before === null || after === null) return null;
  return after >= before ? 'rising' : 'falling';
}

/** The first high or low still ahead of `timeMs`. */
export function nextEventAfter(events: TideEvent[], timeMs: number): TideEvent | null {
  return events.find((event) => event.time > timeMs) ?? null;
}

/** Events falling inside [start, end]. */
export function eventsInRange(events: TideEvent[], start: number, end: number): TideEvent[] {
  return events.filter((event) => event.time >= start && event.time <= end);
}

/** Samples inside [start, end], plus one on each side so the curve reaches the edges. */
export function samplesInRange(samples: TideSample[], start: number, end: number): TideSample[] {
  const inside = samples.filter((sample) => sample.time >= start && sample.time <= end);
  if (inside.length === 0) return inside;

  const firstIndex = samples.indexOf(inside[0]);
  const lastIndex = samples.indexOf(inside[inside.length - 1]);
  return samples.slice(Math.max(0, firstIndex - 1), Math.min(samples.length, lastIndex + 2));
}

/** Rounded-out vertical bounds for a chart, so the curve never touches the frame. */
export function heightBounds(samples: TideSample[]): { min: number; max: number } {
  if (samples.length === 0) return { min: 0, max: 5 };

  let min = samples[0].height;
  let max = samples[0].height;
  for (const sample of samples) {
    if (sample.height < min) min = sample.height;
    if (sample.height > max) max = sample.height;
  }

  return {
    min: Math.floor(min - 0.5),
    max: Math.ceil(max + 0.5),
  };
}
