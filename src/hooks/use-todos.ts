import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type Todo = {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
};

export type Filter = 'all' | 'active' | 'done';

const STORAGE_KEY = 'todos.v1';

let counter = 0;
function makeId() {
  counter += 1;
  return `${Date.now().toString(36)}-${counter}`;
}

function parseTodos(raw: string | null): Todo[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is Todo =>
        !!item &&
        typeof item === 'object' &&
        typeof (item as Todo).id === 'string' &&
        typeof (item as Todo).text === 'string' &&
        typeof (item as Todo).done === 'boolean'
    );
  } catch {
    return [];
  }
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loaded, setLoaded] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled) return;
        setTodos(parseTodos(raw));
      })
      .catch(() => {
        // Ignore read failures and start from an empty list.
      })
      .finally(() => {
        if (cancelled) return;
        loadedRef.current = true;
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist only after the first read, so an empty initial state never
  // overwrites stored todos.
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos)).catch(() => {
      // Ignore write failures; the in-memory list stays correct.
    });
  }, [todos, loaded]);

  const add = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos((current) => [
      { id: makeId(), text: trimmed, done: false, createdAt: Date.now() },
      ...current,
    ]);
  }, []);

  const toggle = useCallback((id: string) => {
    setTodos((current) =>
      current.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo))
    );
  }, []);

  const remove = useCallback((id: string) => {
    setTodos((current) => current.filter((todo) => todo.id !== id));
  }, []);

  const clearDone = useCallback(() => {
    setTodos((current) => current.filter((todo) => !todo.done));
  }, []);

  const remaining = useMemo(() => todos.filter((todo) => !todo.done).length, [todos]);
  const doneCount = todos.length - remaining;

  return { todos, loaded, add, toggle, remove, clearDone, remaining, doneCount };
}

export function filterTodos(todos: Todo[], filter: Filter) {
  if (filter === 'active') return todos.filter((todo) => !todo.done);
  if (filter === 'done') return todos.filter((todo) => todo.done);
  return todos;
}
