import { Image } from 'expo-image';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { colors } from '@/theme/colors';

type Todo = {
  id: number;
  title: string;
  done: number;
};

export default function TodoScreen() {
  useColorScheme();
  const db = useSQLiteContext();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [draft, setDraft] = useState('');

  const refresh = useCallback(async () => {
    const rows = await db.getAllAsync<Todo>(
      'SELECT id, title, done FROM todos ORDER BY done ASC, id DESC'
    );
    setTodos(rows);
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addTodo = async () => {
    const title = draft.trim();
    if (!title) return;
    setDraft('');
    await db.runAsync('INSERT INTO todos (title) VALUES (?)', [title]);
    await refresh();
  };

  const toggleTodo = async (todo: Todo) => {
    await db.runAsync('UPDATE todos SET done = ? WHERE id = ?', [
      todo.done ? 0 : 1,
      todo.id,
    ]);
    await refresh();
  };

  const deleteTodo = async (todo: Todo) => {
    await db.runAsync('DELETE FROM todos WHERE id = ?', [todo.id]);
    await refresh();
  };

  const remaining = todos.filter((t) => !t.done).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.systemBackground }}>
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        data={todos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        ListHeaderComponent={
          <View style={{ gap: 12, paddingBottom: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={addTodo}
                placeholder="What needs doing?"
                placeholderTextColor={colors.tertiaryLabel as string}
                returnKeyType="done"
                submitBehavior="submit"
                style={{
                  flex: 1,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderCurve: 'continuous',
                  backgroundColor: colors.secondarySystemBackground,
                  color: colors.label,
                  fontSize: 17,
                }}
              />
              <Pressable
                onPress={addTodo}
                hitSlop={8}
                style={{ justifyContent: 'center' }}
              >
                <Image
                  source="sf:plus.circle.fill"
                  style={{ width: 34, height: 34 }}
                  tintColor={colors.systemBlue as string}
                />
              </Pressable>
            </View>
            <Text style={{ color: colors.secondaryLabel, fontSize: 13 }}>
              {todos.length === 0
                ? 'No todos yet — add one above.'
                : `${remaining} of ${todos.length} remaining`}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            layout={LinearTransition}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                padding: 14,
                borderRadius: 12,
                borderCurve: 'continuous',
                backgroundColor: colors.secondarySystemBackground,
              }}
            >
              <Pressable
                onPress={() => toggleTodo(item)}
                accessibilityRole="button"
                accessibilityState={{ checked: !!item.done }}
                accessibilityLabel={item.title}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Image
                  source={item.done ? 'sf:checkmark.circle.fill' : 'sf:circle'}
                  style={{ width: 24, height: 24 }}
                  tintColor={
                    (item.done ? colors.systemBlue : colors.tertiaryLabel) as string
                  }
                />
                <Text
                  style={{
                    flex: 1,
                    fontSize: 17,
                    color: item.done ? colors.secondaryLabel : colors.label,
                    textDecorationLine: item.done ? 'line-through' : 'none',
                  }}
                >
                  {item.title}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => deleteTodo(item)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${item.title}`}
              >
                <Image
                  source="sf:trash"
                  style={{ width: 20, height: 20 }}
                  tintColor={colors.systemRed as string}
                />
              </Pressable>
            </View>
          </Animated.View>
        )}
      />
    </View>
  );
}
