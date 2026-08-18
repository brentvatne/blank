import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Todo } from '@/hooks/use-todos';

type Props = {
  todo: Todo;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
};

export function TodoRow({ todo, onToggle, onRemove }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: todo.done }}
        accessibilityLabel={`Toggle ${todo.text}`}
        testID={`toggle-${todo.id}`}
        hitSlop={8}
        onPress={() => onToggle(todo.id)}
        style={styles.checkboxHit}>
        <View
          style={[
            styles.checkbox,
            { borderColor: todo.done ? theme.accent : theme.border },
            todo.done && { backgroundColor: theme.accent },
          ]}>
          {todo.done && <ThemedText style={styles.check}>✓</ThemedText>}
        </View>
      </Pressable>

      <Pressable style={styles.label} onPress={() => onToggle(todo.id)}>
        <ThemedText
          numberOfLines={3}
          themeColor={todo.done ? 'textSecondary' : 'text'}
          style={todo.done && styles.doneText}>
          {todo.text}
        </ThemedText>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Delete ${todo.text}`}
        testID={`delete-${todo.id}`}
        hitSlop={8}
        onPress={() => onRemove(todo.id)}
        style={styles.deleteHit}>
        <ThemedText themeColor="textSecondary" style={styles.delete}>
          ✕
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: 14,
  },
  checkboxHit: {
    justifyContent: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  label: {
    flex: 1,
  },
  doneText: {
    textDecorationLine: 'line-through',
  },
  deleteHit: {
    paddingHorizontal: Spacing.one,
  },
  delete: {
    fontSize: 16,
    lineHeight: 20,
  },
});
