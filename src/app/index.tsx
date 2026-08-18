import { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterBar } from '@/components/filter-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TodoRow } from '@/components/todo-row';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { filterTodos, useTodos, type Filter } from '@/hooks/use-todos';

const EMPTY_MESSAGE: Record<Filter, string> = {
  all: 'Nothing here yet. Add your first task above.',
  active: 'No active tasks. Enjoy the break.',
  done: 'No completed tasks yet.',
};

export default function TodoScreen() {
  const theme = useTheme();
  const { todos, loaded, add, toggle, remove, clearDone, remaining, doneCount } = useTodos();
  const [draft, setDraft] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(() => filterTodos(todos, filter), [todos, filter]);

  function submit() {
    add(draft);
    setDraft('');
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="subtitle">Todos</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {remaining} left · {doneCount} done
            </ThemedText>
          </View>

          <View style={[styles.inputRow, { backgroundColor: theme.backgroundElement }]}>
            <TextInput
              testID="new-todo-input"
              accessibilityLabel="New task"
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={submit}
              placeholder="What needs doing?"
              placeholderTextColor={theme.textSecondary}
              returnKeyType="done"
              submitBehavior="submit"
              style={[styles.input, { color: theme.text }]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add task"
              testID="add-todo-button"
              onPress={submit}
              disabled={draft.trim().length === 0}
              style={[
                styles.addButton,
                { backgroundColor: theme.accent },
                draft.trim().length === 0 && styles.addButtonDisabled,
              ]}>
              <ThemedText style={styles.addButtonLabel}>Add</ThemedText>
            </Pressable>
          </View>

          <FilterBar value={filter} onChange={setFilter} />

          <FlatList
            data={visible}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TodoRow todo={item} onToggle={toggle} onRemove={remove} />}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              loaded ? (
                <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
                  {EMPTY_MESSAGE[filter]}
                </ThemedText>
              ) : null
            }
          />

          {doneCount > 0 && (
            <Pressable
              accessibilityRole="button"
              testID="clear-done-button"
              onPress={clearDone}
              style={styles.clearButton}>
              <ThemedText type="smallBold" style={{ color: theme.danger }}>
                Clear completed
              </ThemedText>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    paddingTop: Spacing.three,
    gap: Spacing.half,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: 14,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
  },
  addButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 10,
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
  addButtonLabel: {
    color: '#ffffff',
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: Spacing.four,
    flexGrow: 1,
  },
  separator: {
    height: Spacing.two,
  },
  empty: {
    textAlign: 'center',
    paddingTop: Spacing.five,
  },
  clearButton: {
    alignSelf: 'center',
    paddingBottom: Spacing.three,
  },
});
