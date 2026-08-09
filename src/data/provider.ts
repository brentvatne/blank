import { mockTideProvider } from '@/data/mock-tide-provider';
import type { TideProvider } from '@/data/types';

/**
 * THE SWAP POINT FOR REAL DATA.
 *
 * The whole app reads tides through this one export. To move off the generated
 * data, write a provider that satisfies `TideProvider` and assign it here — no
 * screen, hook, or component needs to change.
 *
 * A real provider has to do three things:
 *
 *   1. Fetch heights for `range` (inclusive of both ends) and return them as
 *      evenly spaced `samples`, reporting the spacing in `sampleIntervalMs`.
 *   2. Return the highs and lows inside `range` as `events`. If the upstream API
 *      already publishes them, use those rather than deriving them from the
 *      samples — they are more precise.
 *   3. Set `info.isRealData` to true, and put the licence or attribution string
 *      the data requires in `info.attribution`. The About screen renders it.
 *
 * Heights must be metres above the station datum, and times epoch milliseconds
 * in UTC. `getSeries` receives an `AbortSignal`; pass it to `fetch` so a screen
 * that unmounts mid-request cancels cleanly.
 *
 * For Spanish Banks the natural upstream is the Canadian Hydrographic Service
 * water level API, reading station 07795 (Point Atkinson) — the reference
 * station English Bay predictions are keyed to. Its `wlp` time series gives the
 * curve and `wlp-hilo` gives the turning points.
 */
export const tideProvider: TideProvider = mockTideProvider;
