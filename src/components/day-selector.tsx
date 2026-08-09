import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { Radius, Spacing, colors } from '@/theme/colors';
import { formatDayNumber, formatWeekday, isSameLocalDay } from '@/utils/time';

interface DaySelectorProps {
  /** Local midnight for each selectable day. */
  days: number[];
  selectedDay: number;
  today: number;
  onSelect: (day: number) => void;
}

export function DaySelector({ days, selectedDay, today, onSelect }: DaySelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {days.map((day) => {
        const isSelected = day === selectedDay;
        const isToday = isSameLocalDay(day, today);
        return (
          <Pressable
            key={day}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(day)}
            style={[styles.chip, isSelected && styles.chipSelected]}>
            <Text style={[styles.weekday, isSelected && styles.textSelected]}>
              {isToday ? 'Today' : formatWeekday(day)}
            </Text>
            <Text style={[styles.dayNumber, isSelected && styles.textSelected]}>
              {formatDayNumber(day)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  chip: {
    minWidth: 58,
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.chip,
    borderCurve: 'continuous',
    backgroundColor: colors.secondarySystemBackground,
  },
  chipSelected: {
    backgroundColor: colors.systemBlue,
  },
  weekday: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondaryLabel,
  },
  dayNumber: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.label,
    fontVariant: ['tabular-nums'],
  },
  textSelected: {
    color: '#FFFFFF',
  },
});
