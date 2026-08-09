import { SPANISH_BANKS } from '@/data/station';
import type {
  TideEvent,
  TideProvider,
  TideRange,
  TideSample,
  TideSeries,
  TideSourceInfo,
} from '@/data/types';

/**
 * Generated tide data for Spanish Banks.
 *
 * The curve is a sum of the seven harmonic constituents that dominate the Strait
 * of Georgia. That gives the app realistic behaviour to render — mixed
 * semidiurnal tides, a strong diurnal inequality (two unequal highs a day), and
 * a spring/neap cycle from the M2/S2 beat — without any network access.
 *
 * The amplitudes and phases below are plausible, NOT surveyed. Do not navigate
 * by them. Replace this provider with a real one; see `src/data/provider.ts`.
 */

interface Constituent {
  name: string;
  /** Period in hours. These are the real astronomical periods. */
  periodHours: number;
  /** Metres. Invented, but in the right proportion for this coast. */
  amplitude: number;
  /** Degrees. Invented; fixes where in the cycle the epoch falls. */
  phaseDeg: number;
}

const CONSTITUENTS: Constituent[] = [
  { name: 'M2', periodHours: 12.4206012, amplitude: 0.82, phaseDeg: 214 },
  { name: 'S2', periodHours: 12.0, amplitude: 0.23, phaseDeg: 246 },
  { name: 'N2', periodHours: 12.6583475, amplitude: 0.17, phaseDeg: 191 },
  { name: 'K1', periodHours: 23.9344721, amplitude: 0.78, phaseDeg: 293 },
  { name: 'O1', periodHours: 25.8193387, amplitude: 0.45, phaseDeg: 275 },
  { name: 'P1', periodHours: 24.0658877, amplitude: 0.24, phaseDeg: 289 },
  { name: 'Q1', periodHours: 26.8683504, amplitude: 0.08, phaseDeg: 258 },
];

/** Mean water level above chart datum, in metres. */
const MEAN_LEVEL_M = 3.05;

/** Fixed epoch, so the same instant always produces the same height. */
const EPOCH_MS = Date.UTC(2026, 0, 1, 0, 0, 0);

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

/** Curve resolution handed to the chart. */
export const SAMPLE_INTERVAL_MS = 10 * MINUTE_MS;

/** Step used when hunting for turning points. */
const EVENT_SCAN_STEP_MS = MINUTE_MS;

/** Padding around the requested range so an event just outside it is still found. */
const EVENT_SCAN_PAD_MS = 8 * HOUR_MS;

const DEG_TO_RAD = Math.PI / 180;

/** Predicted height in metres above chart datum at an instant. */
export function mockHeightAt(timeMs: number): number {
  const hours = (timeMs - EPOCH_MS) / HOUR_MS;
  let height = MEAN_LEVEL_M;
  for (const c of CONSTITUENTS) {
    height +=
      c.amplitude * Math.cos((2 * Math.PI * hours) / c.periodHours - c.phaseDeg * DEG_TO_RAD);
  }
  return height;
}

function buildSamples(range: TideRange): TideSample[] {
  const samples: TideSample[] = [];
  for (let t = range.start; t <= range.end; t += SAMPLE_INTERVAL_MS) {
    samples.push({ time: t, height: mockHeightAt(t) });
  }
  return samples;
}

/**
 * Finds highs and lows by walking the curve and watching for the slope to flip
 * sign, then refining the turning point with a short golden-section style
 * bisection on the derivative.
 */
function findEvents(range: TideRange): TideEvent[] {
  const scanStart = range.start - EVENT_SCAN_PAD_MS;
  const scanEnd = range.end + EVENT_SCAN_PAD_MS;
  const events: TideEvent[] = [];

  let previous = mockHeightAt(scanStart);
  let current = mockHeightAt(scanStart + EVENT_SCAN_STEP_MS);

  for (let t = scanStart + EVENT_SCAN_STEP_MS; t < scanEnd; t += EVENT_SCAN_STEP_MS) {
    const next = mockHeightAt(t + EVENT_SCAN_STEP_MS);
    const risingBefore = current > previous;
    const risingAfter = next > current;

    if (risingBefore !== risingAfter) {
      const turn = refineTurningPoint(t, risingBefore ? 'high' : 'low');
      if (turn.time >= range.start && turn.time <= range.end) {
        events.push(turn);
      }
    }

    previous = current;
    current = next;
  }

  return events;
}

/** Ternary search inside one scan step for the exact extreme. */
function refineTurningPoint(approxMs: number, kind: 'high' | 'low'): TideEvent {
  let lo = approxMs - EVENT_SCAN_STEP_MS;
  let hi = approxMs + EVENT_SCAN_STEP_MS;

  for (let i = 0; i < 40; i += 1) {
    const a = lo + (hi - lo) / 3;
    const b = hi - (hi - lo) / 3;
    const ha = mockHeightAt(a);
    const hb = mockHeightAt(b);
    const aIsBetter = kind === 'high' ? ha > hb : ha < hb;
    if (aIsBetter) {
      hi = b;
    } else {
      lo = a;
    }
  }

  // Round to the nearest minute; published tide tables are minute-resolution.
  const time = Math.round((lo + hi) / 2 / MINUTE_MS) * MINUTE_MS;
  return { time, height: mockHeightAt(time), kind };
}

const MOCK_SOURCE: TideSourceInfo = {
  id: 'mock-harmonic-v1',
  label: 'Simulated harmonic model',
  attribution:
    'Generated on device from seven tidal constituents. Plausible, but not measured or predicted by a hydrographic office.',
  isRealData: false,
};

export const mockTideProvider: TideProvider = {
  info: MOCK_SOURCE,
  station: SPANISH_BANKS,
  async getSeries(range: TideRange): Promise<TideSeries> {
    return {
      station: SPANISH_BANKS,
      source: MOCK_SOURCE,
      samples: buildSamples(range),
      events: findEvents(range),
      sampleIntervalMs: SAMPLE_INTERVAL_MS,
    };
  },
};
