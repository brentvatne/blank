import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { FLATS_EXPOSED_BELOW_M } from '@/data/station';
import type { TideEvent } from '@/data/types';
import { Spacing, colors } from '@/theme/colors';
import { formatDuration, formatTime } from '@/utils/time';
import { formatHeight, type TideTrend } from '@/utils/tide';

interface NowPanelProps {
  height: number | null;
  trend: TideTrend | null;
  nextEvent: TideEvent | null;
  nowMs: number;
}

export function NowPanel({ height, trend, nextEvent, nowMs }: NowPanelProps) {
  if (height === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.unavailable}>Current height unavailable</Text>
      </View>
    );
  }

  const flatsExposed = height < FLATS_EXPOSED_BELOW_M;

  return (
    <View style={styles.container}>
      <View style={styles.headline}>
        <Text style={styles.height} selectable>
          {formatHeight(height)}
        </Text>
        {trend ? (
          <View style={styles.trend}>
            <Image
              source={trend === 'rising' ? 'sf:arrow.up' : 'sf:arrow.down'}
              tintColor={colors.systemBlue as string}
              style={styles.trendIcon}
            />
            <Text style={styles.trendText}>{trend === 'rising' ? 'Rising' : 'Falling'}</Text>
          </View>
        ) : null}
      </View>

      {nextEvent ? (
        <Text style={styles.nextEvent} selectable>
          {nextEvent.kind === 'high' ? 'High' : 'Low'} {formatHeight(nextEvent.height)} in{' '}
          {formatDuration(nextEvent.time - nowMs)}
          <Text style={styles.nextEventTime}> · {formatTime(nextEvent.time)}</Text>
        </Text>
      ) : null}

      <View style={styles.flatsRow}>
        <Image
          source={flatsExposed ? 'sf:figure.walk' : 'sf:water.waves'}
          tintColor={colors.secondaryLabel as string}
          style={styles.flatsIcon}
        />
        <Text style={styles.flatsText}>
          {flatsExposed
            ? 'Sand flats exposed — long walk out'
            : `Flats covered until the tide drops below ${FLATS_EXPOSED_BELOW_M} m`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  headline: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.three,
  },
  height: {
    fontSize: 52,
    fontWeight: '700',
    letterSpacing: -1,
    color: colors.label,
    fontVariant: ['tabular-nums'],
  },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  trendIcon: {
    width: 15,
    height: 15,
  },
  trendText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.systemBlue,
  },
  nextEvent: {
    fontSize: 16,
    color: colors.label,
  },
  nextEventTime: {
    color: colors.secondaryLabel,
    fontVariant: ['tabular-nums'],
  },
  flatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
  flatsIcon: {
    width: 14,
    height: 14,
  },
  flatsText: {
    flex: 1,
    fontSize: 13,
    color: colors.secondaryLabel,
  },
  unavailable: {
    fontSize: 16,
    color: colors.secondaryLabel,
  },
});
