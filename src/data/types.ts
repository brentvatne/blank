/**
 * Shared tide data types.
 *
 * Everything the UI renders comes through `TideProvider`. The mock provider and
 * a future real-data provider both satisfy this contract, so swapping the data
 * source touches exactly one file: `src/data/provider.ts`.
 */

export interface TideStation {
  /** Stable id. For real data, use the hydrographic office station id. */
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  /** Vertical reference the heights are measured from. */
  datum: string;
  /** IANA time zone the station's local times are expressed in. */
  timeZone: string;
}

/** One point on the tide curve. */
export interface TideSample {
  /** Epoch milliseconds (UTC). */
  time: number;
  /** Metres above the station datum. */
  height: number;
}

export type TideEventKind = 'high' | 'low';

/** A tide turning point (high water or low water). */
export interface TideEvent {
  time: number;
  height: number;
  kind: TideEventKind;
}

/** Where a series came from, shown to the user so mock data is never mistaken for real. */
export interface TideSourceInfo {
  id: string;
  label: string;
  attribution: string;
  /** False for generated data. The UI shows a warning banner when this is false. */
  isRealData: boolean;
}

export interface TideRange {
  /** Epoch milliseconds, inclusive. */
  start: number;
  /** Epoch milliseconds, inclusive. */
  end: number;
}

export interface TideSeries {
  station: TideStation;
  source: TideSourceInfo;
  /** Evenly spaced curve points covering the requested range. */
  samples: TideSample[];
  /** Highs and lows inside the requested range. */
  events: TideEvent[];
  /** Spacing between samples, in milliseconds. */
  sampleIntervalMs: number;
}

export interface TideProvider {
  info: TideSourceInfo;
  station: TideStation;
  getSeries(range: TideRange, signal?: AbortSignal): Promise<TideSeries>;
}
