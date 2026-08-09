import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/card';
import { tideProvider } from '@/data/provider';
import { FLATS_EXPOSED_BELOW_M } from '@/data/station';
import { Spacing, colors } from '@/theme/colors';

export function AboutScreen() {
  const { info, station } = tideProvider;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      {!info.isRealData ? (
        <Card>
          <Text style={styles.warningTitle}>These tides are not real</Text>
          <Text style={styles.body} selectable>
            {info.attribution}
          </Text>
          <Text style={styles.body}>
            Do not use this app to plan a crossing, a paddle, or anything else where being wrong
            about the water matters.
          </Text>
        </Card>
      ) : null}

      <Card title="Station">
        <Row label="Name" value={station.name} />
        <Row label="Area" value={station.region} />
        <Row label="Station id" value={station.id} />
        <Row
          label="Position"
          value={`${station.latitude.toFixed(4)}°N, ${Math.abs(station.longitude).toFixed(4)}°W`}
        />
        <Row label="Datum" value={station.datum} />
        <Row label="Times" value={station.timeZone} />
      </Card>

      <Card title="Source">
        <Row label="Provider" value={info.label} />
        <Row label="Id" value={info.id} />
        <Row label="Live data" value={info.isRealData ? 'Yes' : 'No'} />
      </Card>

      <Card title="Sand flats">
        <Text style={styles.body}>
          The chart shades everything below {FLATS_EXPOSED_BELOW_M} m to mark when the Spanish Banks
          flats are walkable. That threshold is a rule of thumb for the display, not a surveyed
          elevation.
        </Text>
      </Card>

      <Text style={styles.footnote}>
        Swapping in real data means writing one provider and assigning it in src/data/provider.ts.
        Nothing else in the app changes.
      </Text>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} selectable>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.systemOrange,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.label,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.four,
  },
  rowLabel: {
    fontSize: 14,
    color: colors.secondaryLabel,
    width: 84,
  },
  rowValue: {
    flex: 1,
    fontSize: 14,
    color: colors.label,
    textAlign: 'right',
  },
  footnote: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.tertiaryLabel,
  },
});
