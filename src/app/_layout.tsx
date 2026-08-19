import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { colors } from "@/theme/colors";

const partyTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.backgroundDeep,
    text: colors.white,
    primary: colors.cyan,
    border: colors.cardBorder,
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={partyTheme}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerTintColor: colors.cyan,
          headerTitleStyle: { color: colors.white },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ headerShown: false, title: "Party" }}
        />
        <Stack.Screen name="bring" options={{ title: "What to Bring" }} />
      </Stack>
    </ThemeProvider>
  );
}
