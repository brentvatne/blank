# Todo

A simple todo list app built with Expo and Expo Router. Todos are stored locally in SQLite with `expo-sqlite`.

## Features

- Add todos from the input field.
- Tap a todo to mark it done or not done.
- Tap the trash icon to delete a todo.
- Data persists across app restarts in a local SQLite database (`todos.db`).

## Structure

- `src/app/_layout.tsx` — root layout. It wraps the app in `SQLiteProvider` and runs the schema migration.
- `src/app/index.tsx` — the todo list screen. It reads and writes todos with `useSQLiteContext`.
- `src/theme/colors.ts` — semantic platform colors.

## Run

```bash
bun install
bun start
```

Then open the app in Expo Go or a simulator.
