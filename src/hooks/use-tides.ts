import { useEffect, useState } from 'react';

import { tideProvider } from '@/data/provider';
import type { TideSeries } from '@/data/types';

export interface UseTidesResult {
  series: TideSeries | null;
  isLoading: boolean;
  error: Error | null;
}

interface LoadedState {
  /** Which range the result belongs to. Anything else means it is stale. */
  key: string;
  series: TideSeries | null;
  error: Error | null;
}

const EMPTY: LoadedState = { key: '', series: null, error: null };

/**
 * Loads one tide series covering [start, end].
 *
 * The provider is generated data today and may be a network call tomorrow, so
 * this hook already handles the loading and error states and aborts in-flight
 * work when the range changes or the screen unmounts.
 */
export function useTides(start: number, end: number): UseTidesResult {
  const [loaded, setLoaded] = useState<LoadedState>(EMPTY);
  const key = `${start}:${end}`;

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    tideProvider
      .getSeries({ start, end }, controller.signal)
      .then((series) => {
        if (cancelled) return;
        setLoaded({ key, series, error: null });
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setLoaded({
          key,
          series: null,
          error: cause instanceof Error ? cause : new Error(String(cause)),
        });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [start, end, key]);

  // Loading is derived, not stored, so the range and the result can never
  // disagree while a request is in flight.
  const isStale = loaded.key !== key;
  return {
    series: isStale ? null : loaded.series,
    isLoading: isStale,
    error: isStale ? null : loaded.error,
  };
}
