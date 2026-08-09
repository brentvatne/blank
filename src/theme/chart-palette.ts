/**
 * Plain hex/rgba colors for the Skia canvas.
 *
 * Skia paints from raw color values, so it cannot use the platform semantic
 * colors in `colors.ts`. This palette is picked by color scheme instead.
 */
export interface ChartPalette {
  /** Stroke along the top of the water. */
  curve: string;
  /** Fill gradient under the curve, top to bottom. */
  waterTop: string;
  waterBottom: string;
  /** Horizontal metre gridlines. */
  grid: string;
  /** Band marking the height below which the sand flats are walkable. */
  flats: string;
  /** Vertical "right now" marker. */
  now: string;
  nowHalo: string;
  /** Dots on the high and low turning points. */
  high: string;
  low: string;
}

const LIGHT: ChartPalette = {
  curve: '#0A84FF',
  waterTop: 'rgba(10, 132, 255, 0.42)',
  waterBottom: 'rgba(10, 132, 255, 0.04)',
  grid: 'rgba(11, 18, 32, 0.09)',
  flats: 'rgba(214, 178, 106, 0.16)',
  now: '#FF9500',
  nowHalo: 'rgba(255, 149, 0, 0.22)',
  high: '#0A84FF',
  low: '#7A8698',
};

const DARK: ChartPalette = {
  curve: '#4FC3F7',
  waterTop: 'rgba(79, 195, 247, 0.44)',
  waterBottom: 'rgba(79, 195, 247, 0.03)',
  grid: 'rgba(255, 255, 255, 0.12)',
  flats: 'rgba(214, 178, 106, 0.14)',
  now: '#FFB340',
  nowHalo: 'rgba(255, 179, 64, 0.24)',
  high: '#4FC3F7',
  low: '#8E99A8',
};

export function chartPalette(scheme: 'light' | 'dark'): ChartPalette {
  return scheme === 'dark' ? DARK : LIGHT;
}
