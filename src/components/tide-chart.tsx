import {
  Canvas,
  Circle,
  DashPathEffect,
  Group,
  LinearGradient,
  Path,
  Rect,
  Skia,
  vec,
} from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { TideEvent, TideSample } from '@/data/types';
import type { ChartPalette } from '@/theme/chart-palette';
import { colors } from '@/theme/colors';
import { formatTime } from '@/utils/time';

const CHART_HEIGHT = 240;
const PADDING = { top: 44, right: 14, bottom: 30, left: 34 };
const X_TICK_COUNT = 5;
const LABEL_WIDTH = 62;

export interface TideChartProps {
  /** Curve points, ordered by time. */
  samples: TideSample[];
  /** Turning points to mark on the curve. */
  events: TideEvent[];
  /** Left and right edges of the plot, in epoch milliseconds. */
  windowStart: number;
  windowEnd: number;
  /** Where to draw the "now" marker, or null when the window is not today. */
  nowMs: number | null;
  /** Height at `nowMs`. Ignored when `nowMs` is null. */
  nowHeight: number | null;
  /** Vertical bounds in metres. */
  minHeight: number;
  maxHeight: number;
  /** Sand flats are walkable below this height. */
  flatsThreshold: number;
  palette: ChartPalette;
  /** Measured by the parent; the canvas needs a real number. */
  width: number;
}

export function TideChart({
  samples,
  events,
  windowStart,
  windowEnd,
  nowMs,
  nowHeight,
  minHeight,
  maxHeight,
  flatsThreshold,
  palette,
  width,
}: TideChartProps) {
  const plotWidth = Math.max(1, width - PADDING.left - PADDING.right);
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const plotBottom = PADDING.top + plotHeight;

  const toX = (timeMs: number) =>
    PADDING.left + ((timeMs - windowStart) / (windowEnd - windowStart)) * plotWidth;
  const toY = (metres: number) =>
    PADDING.top + (1 - (metres - minHeight) / (maxHeight - minHeight)) * plotHeight;

  const paths = useMemo(() => {
    const line = Skia.Path.Make();
    const fill = Skia.Path.Make();
    if (samples.length < 2) return { line, fill };

    samples.forEach((sample, index) => {
      const x = toX(sample.time);
      const y = toY(sample.height);
      if (index === 0) {
        line.moveTo(x, y);
        fill.moveTo(x, plotBottom);
        fill.lineTo(x, y);
      } else {
        line.lineTo(x, y);
        fill.lineTo(x, y);
      }
    });

    fill.lineTo(toX(samples[samples.length - 1].time), plotBottom);
    fill.close();
    return { line, fill };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [samples, width, minHeight, maxHeight, windowStart, windowEnd]);

  const gridValues = useMemo(() => {
    const values: number[] = [];
    for (let metres = Math.ceil(minHeight); metres <= Math.floor(maxHeight); metres += 1) {
      values.push(metres);
    }
    return values;
  }, [minHeight, maxHeight]);

  const gridPath = useMemo(() => {
    const path = Skia.Path.Make();
    for (const metres of gridValues) {
      const y = toY(metres);
      path.moveTo(PADDING.left, y);
      path.lineTo(PADDING.left + plotWidth, y);
    }
    return path;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridValues, width, minHeight, maxHeight]);

  const nowPath = useMemo(() => {
    const path = Skia.Path.Make();
    if (nowMs === null) return path;
    const x = toX(nowMs);
    path.moveTo(x, PADDING.top - 8);
    path.lineTo(x, plotBottom);
    return path;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nowMs, width, windowStart, windowEnd]);

  const xTicks = useMemo(() => {
    const ticks: number[] = [];
    for (let i = 0; i < X_TICK_COUNT; i += 1) {
      ticks.push(windowStart + ((windowEnd - windowStart) * i) / (X_TICK_COUNT - 1));
    }
    return ticks;
  }, [windowStart, windowEnd]);

  const flatsTop = toY(Math.min(flatsThreshold, maxHeight));
  const showFlatsBand = flatsThreshold > minHeight && flatsTop < plotBottom;

  return (
    <View style={{ width, height: CHART_HEIGHT }}>
      <Canvas style={{ width, height: CHART_HEIGHT }}>
        {showFlatsBand && (
          <Rect
            x={PADDING.left}
            y={flatsTop}
            width={plotWidth}
            height={plotBottom - flatsTop}
            color={palette.flats}
          />
        )}

        <Path path={gridPath} style="stroke" strokeWidth={1} color={palette.grid} />

        <Path path={paths.fill}>
          <LinearGradient
            start={vec(0, PADDING.top)}
            end={vec(0, plotBottom)}
            colors={[palette.waterTop, palette.waterBottom]}
          />
        </Path>

        <Path
          path={paths.line}
          style="stroke"
          strokeWidth={2.5}
          strokeJoin="round"
          strokeCap="round"
          color={palette.curve}
        />

        {events.map((event) => (
          <Group key={`dot-${event.time}`}>
            <Circle
              cx={toX(event.time)}
              cy={toY(event.height)}
              r={4.5}
              color={event.kind === 'high' ? palette.high : palette.low}
            />
          </Group>
        ))}

        {nowMs !== null && nowHeight !== null && (
          <Group>
            <Path path={nowPath} style="stroke" strokeWidth={1.5} color={palette.now}>
              <DashPathEffect intervals={[4, 5]} />
            </Path>
            <Circle cx={toX(nowMs)} cy={toY(nowHeight)} r={10} color={palette.nowHalo} />
            <Circle cx={toX(nowMs)} cy={toY(nowHeight)} r={5} color={palette.now} />
          </Group>
        )}
      </Canvas>

      {/* Text sits above the canvas so it uses the platform font and scales with
          the user's text size setting. */}
      {gridValues.map((metres) => (
        <Text
          key={`y-${metres}`}
          style={[styles.yLabel, { top: toY(metres) - 7, width: PADDING.left - 6 }]}>
          {metres}
        </Text>
      ))}

      {xTicks.map((tick, index) => (
        <Text
          key={`x-${tick}`}
          numberOfLines={1}
          style={[
            styles.xLabel,
            {
              top: plotBottom + 8,
              left: toX(tick) - LABEL_WIDTH / 2,
              width: LABEL_WIDTH,
              // Keep the first and last labels inside the canvas.
              textAlign: index === 0 ? 'left' : index === X_TICK_COUNT - 1 ? 'right' : 'center',
            },
          ]}>
          {formatTime(tick)}
        </Text>
      ))}

      {events.map((event) => (
        <View
          key={`label-${event.time}`}
          pointerEvents="none"
          style={[
            styles.eventLabel,
            {
              left: clamp(toX(event.time) - LABEL_WIDTH / 2, 2, width - LABEL_WIDTH - 2),
              top: Math.max(2, toY(event.height) - 38),
              width: LABEL_WIDTH,
            },
          ]}>
          <Text style={styles.eventHeight}>{event.height.toFixed(1)} m</Text>
          <Text style={styles.eventTime}>{formatTime(event.time)}</Text>
        </View>
      ))}
    </View>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

const styles = StyleSheet.create({
  yLabel: {
    position: 'absolute',
    left: 0,
    textAlign: 'right',
    fontSize: 11,
    color: colors.tertiaryLabel,
    fontVariant: ['tabular-nums'],
  },
  xLabel: {
    position: 'absolute',
    fontSize: 11,
    color: colors.tertiaryLabel,
    fontVariant: ['tabular-nums'],
  },
  eventLabel: {
    position: 'absolute',
    alignItems: 'center',
    gap: 1,
  },
  eventHeight: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.label,
    fontVariant: ['tabular-nums'],
  },
  eventTime: {
    fontSize: 11,
    color: colors.secondaryLabel,
    fontVariant: ['tabular-nums'],
  },
});
