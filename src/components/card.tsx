import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Radius, Spacing, colors } from '@/theme/colors';

interface CardProps {
  title?: string;
  style?: ViewStyle;
}

export function Card({ title, style, children }: PropsWithChildren<CardProps>) {
  return (
    <View style={[styles.card, style]}>
      {title ? <Text style={styles.title}>{title.toUpperCase()}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.secondarySystemBackground,
    borderRadius: Radius.card,
    borderCurve: 'continuous',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.secondaryLabel,
  },
});
