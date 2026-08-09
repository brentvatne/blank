import type { TideStation } from '@/data/types';

/**
 * Spanish Banks, Vancouver BC.
 *
 * Spanish Banks has no tide gauge of its own. Predictions for the beach are read
 * from the nearest Canadian Hydrographic Service reference station, Point
 * Atkinson (station 07795), which sits across English Bay. Replace `id` if you
 * wire up a different station.
 */
export const SPANISH_BANKS: TideStation = {
  id: '07795',
  name: 'Spanish Banks',
  region: 'English Bay, Vancouver BC',
  latitude: 49.2769,
  longitude: -123.201,
  datum: 'Chart datum (lowest normal tide)',
  timeZone: 'America/Vancouver',
};

/**
 * Below this height the sand flats off Spanish Banks are walkable. This is a
 * rule of thumb for the UI, not a surveyed number.
 */
export const FLATS_EXPOSED_BELOW_M = 1.5;
