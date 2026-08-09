# Spanish Banks Tides

An Expo app that tracks the tide at Spanish Banks, Vancouver BC.

The tide data is **generated, not real**. The app is built so that swapping in real
data is a one-file change.

## What it shows

- Current water level, whether the tide is rising or falling, and the countdown to
  the next high or low.
- A seven-day forecast, one day at a time.
- A Skia tide curve for the selected day, with the highs and lows marked, a "now"
  marker, and a shaded band for the height below which the sand flats are walkable.
- The full list of highs and lows for that day.
- An About sheet naming the station, the datum, and the data source.

## Where the data comes from today

`src/data/mock-tide-provider.ts` sums the seven harmonic constituents that dominate
the Strait of Georgia (M2, S2, N2, K1, O1, P1, Q1). That reproduces the behaviour the
UI has to handle — mixed semidiurnal tides, two unequal highs a day, and a
spring/neap cycle — without a network call.

The amplitudes and phases are plausible for this coast but are **not** surveyed
values. Every screen that shows them also says so.

## Swapping in real data

Everything reads tides through one export: `tideProvider` in `src/data/provider.ts`.

1. Write a provider that satisfies the `TideProvider` interface in
   `src/data/types.ts`.
2. Assign it in `src/data/provider.ts`.

Nothing else changes — no screen, hook, or component imports the mock directly.

A provider must return:

| Field | Meaning |
| --- | --- |
| `samples` | Evenly spaced curve points across the requested range |
| `sampleIntervalMs` | The spacing between those samples |
| `events` | The highs and lows inside the range |
| `source.isRealData` | Set to `true` so the app drops the simulated-data warning |
| `source.attribution` | The licence or credit line, rendered on the About screen |

Heights are metres above the station datum. Times are epoch milliseconds in UTC; the
app converts to Vancouver local time for display. `getSeries` receives an
`AbortSignal` — pass it to `fetch` so a screen that unmounts cancels cleanly.

For Spanish Banks the natural upstream is the Canadian Hydrographic Service water
level API reading station 07795 (Point Atkinson), the reference station English Bay
predictions are keyed to. Its `wlp` series gives the curve and `wlp-hilo` gives the
turning points.

## Layout

```
src/
  app/             Expo Router routes only
  screens/         Screen bodies the routes render
  components/      Reusable UI, including the Skia chart
  data/            Types, station metadata, providers
  hooks/           useTides, useNow
  theme/           Semantic colors, spacing, and the chart's hex palette
  utils/           Time zone and tide math helpers
```

The chart is drawn with `@shopify/react-native-skia`. Text on the chart is regular
React Native text layered over the canvas, so it uses the platform font and respects
the user's text size setting.

## Running it

```bash
npm install
npx expo start
```

## Checks

```bash
npx tsc --noEmit
npx expo lint
```
