import { Image } from 'expo-image';
import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { TideEvent } from '@/data/types';
import { Spacing, colors } from '@/theme/colors';
import { formatTime } from '@/utils/time';
import { formatHeight } from '@/utils/tide';

interface TideEventListProps {
  events: TideEvent[];
  /** Highlights the next event still ahead. */
  nowMs: number | null;
}

export function TideEventList({ events, nowMs }: TideEventListProps) {
  if (events.length === 0) {
    return <Text style={styles.empty}>No highs or lows on this day.</Text>;
  }

  const nextIndex = nowMs === null ? -1 : events.findIndex((event) => event.time > nowMs);

  return (
    <View>
      {events.map((event, index) => (
        <Fragment key={event.time}>
          {index > 0 ? <View style={styles.separator} /> : null}
          <View style={styles.row}>
            <Image
              source={event.kind === 'high' ? 'sf:arrow.up.circle.fill' : 'sf:arrow.down.circle.fill'}
              tintColor={
                (event.kind === 'high' ? colors.systemBlue : colors.tertiaryLabel) as string
              }
              style={styles.icon}
            />
            <Text style={styles.kind}>{event.kind === 'high' ? 'High' : 'Low'}</Text>
            <Text style={styles.time} selectable>
              {formatTime(event.time)}
            </Text>
            <Text style={styles.height} selectable>
              {formatHeight(event.height)}
            </Text>
            {index === nextIndex ? <Text style={styles.nextBadge}>NEXT</Text> : null}
          </View>
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  icon: {
    width: 20,
    height: 20,
  },
  kind: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.label,
    width: 46,
  },
  time: {
    flex: 1,
    fontSize: 16,
    color: colors.label,
    fontVariant: ['tabular-nums'],
  },
  height: {
    fontSize: 16,
    color: colors.secondaryLabel,
    fontVariant: ['tabular-nums'],
  },
  nextBadge: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.systemOrange,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
  },
  empty: {
    fontSize: 15,
    color: colors.secondaryLabel,
  },
});
