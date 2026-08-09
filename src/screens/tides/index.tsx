import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

import { Card } from '@/components/card';
import { DaySelector } from '@/components/day-selector';
import { NowPanel } from '@/components/now-panel';
import { TideChart } from '@/components/tide-chart';
import { TideEventList } from '@/components/tide-event-list';
import { FLATS_EXPOSED_BELOW_M, SPANISH_BANKS } from '@/data/station';
import { useNow } from '@/hooks/use-now';
import { useTides } from '@/hooks/use-tides';
import { chartPalette } from '@/theme/chart-palette';
import { Spacing, colors } from '@/theme/colors';
import {
  DAY_MS,
  addLocalDays,
  formatLongDate,
  isSameLocalDay,
  startOfLocalDay,
} from '@/utils/time';
import {
  eventsInRange,
  heightAtTime,
  heightBounds,
  nextEventAfter,
  samplesInRange,
  trendAtTime,
} from '@/utils/tide';

/** How many days of forecast the day selector offers. */
const FORECAST_DAYS = 7;

export function TidesScreen() {
  const nowMs = useNow();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const palette = chartPalette(scheme);

  // Anchor the whole forecast on the day the app was opened, so the fetched
  // range does not change on every clock tick.
  const [today] = useState(() => startOfLocalDay(Date.now()));
  const [selectedDay, setSelectedDay] = useState(today);
  const [chartWidth, setChartWidth] = useState(0);

  const days = useMemo(
    () => Array.from({ length: FORECAST_DAYS }, (_, index) => addLocalDays(today, index)),
    [today],
  );

  const rangeStart = days[0];
  const rangeEnd = addLocalDays(today, FORECAST_DAYS);
  const { series, isLoading, error } = useTides(rangeStart, rangeEnd);

  const dayEnd = useMemo(() => addLocalDays(selectedDay, 1), [selectedDay]);
  const daySamples = useMemo(
    () => (series ? samplesInRange(series.samples, selectedDay, dayEnd) : []),
    [series, selectedDay, dayEnd],
  );
  const dayEvents = useMemo(
    () => (series ? eventsInRange(series.events, selectedDay, dayEnd) : []),
    [series, selectedDay, dayEnd],
  );
  const bounds = useMemo(() => heightBounds(daySamples), [daySamples]);

  const isToday = isSameLocalDay(selectedDay, nowMs);
  const currentHeight = series ? heightAtTime(series.samples, nowMs) : null;
  const currentTrend = series ? trendAtTime(series.samples, nowMs) : null;
  const nextEvent = series ? nextEventAfter(series.events, nowMs) : null;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}>
      <NowPanel
        height={currentHeight}
        trend={currentTrend}
        nextEvent={nextEvent}
        nowMs={nowMs}
      />

      <DaySelector days={days} selectedDay={selectedDay} today={today} onSelect={setSelectedDay} />

      <View style={styles.section}>
        <Card title={formatLongDate(selectedDay)}>
          <View
            style={styles.chartSlot}
            onLayout={(event) => setChartWidth(event.nativeEvent.layout.width)}>
            {error ? (
              <Text style={styles.error} selectable>
                Could not load tides: {error.message}
              </Text>
            ) : isLoading || daySamples.length < 2 || chartWidth === 0 ? (
              <ActivityIndicator style={styles.loader} />
            ) : (
              <TideChart
                samples={daySamples}
                events={dayEvents}
                windowStart={selectedDay}
                windowEnd={selectedDay + DAY_MS}
                nowMs={isToday ? nowMs : null}
                nowHeight={isToday ? currentHeight : null}
                minHeight={bounds.min}
                maxHeight={bounds.max}
                flatsThreshold={FLATS_EXPOSED_BELOW_M}
                palette={palette}
                width={chartWidth}
              />
            )}
          </View>

          <View style={styles.legend}>
            <LegendSwatch color={palette.curve} label="Water level" />
            <LegendSwatch color={palette.flats} label={`Flats below ${FLATS_EXPOSED_BELOW_M} m`} />
            {isToday ? <LegendSwatch color={palette.now} label="Now" /> : null}
          </View>
        </Card>

        <Card title="Highs and lows">
          <TideEventList events={dayEvents} nowMs={isToday ? nowMs : null} />
        </Card>

        <Link href="/about" asChild>
          <Pressable style={styles.sourceRow}>
            <Image
              source="sf:exclamationmark.triangle.fill"
              tintColor={colors.systemOrange as string}
              style={styles.sourceIcon}
            />
            <Text style={styles.sourceText}>
              {series?.source.isRealData
                ? series.source.label
                : 'Simulated data — not for navigation'}
            </Text>
            <Image
              source="sf:chevron.right"
              tintColor={colors.tertiaryLabel as string}
              style={styles.chevron}
            />
          </Pressable>
        </Link>

        <Text style={styles.footer}>
          Heights are metres above {SPANISH_BANKS.datum.toLowerCase()}. Times are Vancouver local.
        </Text>
      </View>
    </ScrollView>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.five,
  },
  section: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  chartSlot: {
    minHeight: 240,
    justifyContent: 'center',
  },
  loader: {
    alignSelf: 'center',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.four,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 12,
    color: colors.secondaryLabel,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  sourceIcon: {
    width: 15,
    height: 15,
  },
  sourceText: {
    flex: 1,
    fontSize: 14,
    color: colors.label,
  },
  chevron: {
    width: 12,
    height: 12,
  },
  error: {
    fontSize: 15,
    color: colors.label,
    textAlign: 'center',
  },
  footer: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.tertiaryLabel,
  },
});
