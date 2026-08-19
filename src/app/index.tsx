import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Todo = {
  id: string;
  title: string;
  done: boolean;
};

type Filter = 'all' | 'active' | 'done';

const STORAGE_KEY = 'todos:v1';

export default function TodoScreen() {
  const scheme = useColorScheme();
  const c = scheme === 'dark' ? darkColors : lightColors;

  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setTodos(JSON.parse(raw));
        } catch {}
      }
      loaded.current = true;
    });
  }, []);

  useEffect(() => {
    if (loaded.current) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }
  }, [todos]);

  const addTodo = () => {
    const title = text.trim();
    if (!title) return;
    setTodos((prev) => [
      { id: Date.now().toString(36), title, done: false },
      ...prev,
    ]);
    setText('');
  };

  const toggleTodo = (id: string) =>
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );

  const deleteTodo = (id: string) =>
    setTodos((prev) => prev.filter((t) => t.id !== id));

  const clearDone = () => setTodos((prev) => prev.filter((t) => !t.done));

  const visible = todos.filter((t) =>
    filter === 'all' ? true : filter === 'active' ? !t.done : t.done
  );
  const remaining = todos.filter((t) => !t.done).length;
  const doneCount = todos.length - remaining;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: c.text }]}>Todos</Text>
          <Text style={[styles.subtitle, { color: c.muted }]}>
            {todos.length === 0
              ? 'Nothing here yet'
              : `${remaining} left · ${doneCount} done`}
          </Text>
        </View>

        <View style={[styles.inputRow, { backgroundColor: c.card }]}>
          <TextInput
            style={[styles.input, { color: c.text }]}
            placeholder="What needs doing?"
            placeholderTextColor={c.muted}
            value={text}
            onChangeText={setText}
            onSubmitEditing={addTodo}
            returnKeyType="done"
            submitBehavior="submit"
          />
          <Pressable
            onPress={addTodo}
            accessibilityLabel="Add todo"
            style={({ pressed }) => [
              styles.addButton,
              { backgroundColor: c.accent, opacity: pressed || !text.trim() ? 0.6 : 1 },
            ]}
          >
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </View>

        <View style={styles.filterRow}>
          {(['all', 'active', 'done'] as const).map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filter === f ? c.accent : c.card,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: filter === f ? '#fff' : c.muted },
                ]}
              >
                {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Done'}
              </Text>
            </Pressable>
          ))}
          {doneCount > 0 && (
            <Pressable onPress={clearDone} style={styles.clearButton}>
              <Text style={[styles.filterText, { color: c.danger }]}>
                Clear done
              </Text>
            </Pressable>
          )}
        </View>

        <FlatList
          data={visible}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text style={[styles.empty, { color: c.muted }]}>
              {filter === 'done'
                ? 'Nothing done yet'
                : filter === 'active'
                  ? 'No active todos'
                  : 'Add your first todo above'}
            </Text>
          }
          renderItem={({ item }) => (
            <View style={[styles.todoRow, { backgroundColor: c.card }]}>
              <Pressable
                onPress={() => toggleTodo(item.id)}
                accessibilityLabel={
                  item.done ? `Mark ${item.title} active` : `Complete ${item.title}`
                }
                style={styles.todoTapArea}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: item.done ? c.accent : c.muted,
                      backgroundColor: item.done ? c.accent : 'transparent',
                    },
                  ]}
                >
                  {item.done && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text
                  style={[
                    styles.todoText,
                    { color: item.done ? c.muted : c.text },
                    item.done && styles.todoTextDone,
                  ]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => deleteTodo(item.id)}
                accessibilityLabel={`Delete ${item.title}`}
                hitSlop={8}
                style={styles.deleteButton}
              >
                <Text style={[styles.deleteText, { color: c.danger }]}>✕</Text>
              </Pressable>
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const lightColors = {
  bg: '#F2F2F7',
  card: '#FFFFFF',
  text: '#1C1C1E',
  muted: '#8E8E93',
  accent: '#208AEF',
  danger: '#FF3B30',
};

const darkColors = {
  bg: '#000000',
  card: '#1C1C1E',
  text: '#FFFFFF',
  muted: '#8E8E93',
  accent: '#208AEF',
  danger: '#FF453A',
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  title: { fontSize: 34, fontWeight: '700' },
  subtitle: { fontSize: 15, marginTop: 4 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    borderRadius: 14,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
  },
  input: { flex: 1, fontSize: 17, paddingVertical: 8 },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  addButtonText: { color: '#fff', fontSize: 24, fontWeight: '600', marginTop: -2 },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  filterText: { fontSize: 14, fontWeight: '600' },
  clearButton: { marginLeft: 'auto', paddingVertical: 7 },
  listContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 8 },
  empty: { textAlign: 'center', fontSize: 15, marginTop: 40 },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingRight: 8,
  },
  todoTapArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingVertical: 14,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  todoText: { flex: 1, fontSize: 17 },
  todoTextDone: { textDecorationLine: 'line-through' },
  deleteButton: { padding: 8 },
  deleteText: { fontSize: 16, fontWeight: '600' },
});
