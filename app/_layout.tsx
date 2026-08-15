/**
 * Root Layout — Top-level Stack navigator.
 *
 * Top-level index redirects based on auth state:
 *   - not signed in → /login
 *   - signed in     → /staff/fleet
 *
 * Providers (`GestureHandlerRootView` → `AuthProvider` → `ThemeProvider`)
 * all mount here so every route can read auth + theme.
 */
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavThemeProvider,
} from "@react-navigation/native";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { palette, ThemeProvider, useThemeContext } from "@/shared/theme";
import { AuthProvider, useAuth } from "@/features/auth";
import { StaffRealtimeProvider } from "@/shared/realtime/StaffRealtimeContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StaffRealtimeProvider>
          <ThemeProvider>
            <RootNavigation />
          </ThemeProvider>
        </StaffRealtimeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigation() {
  const { isDark } = useThemeContext();
  const { status } = useAuth();

  const navigationTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: palette.violet[500],
          background: palette.gray[950],
          card: palette.gray[900],
          text: "#f9fafb",
          border: palette.gray[800],
          notification: palette.red[500],
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: palette.violet[600],
          background: "#ffffff",
          card: "#ffffff",
          text: "#111827",
          border: palette.gray[200],
          notification: palette.red[500],
        },
      };

  return (
    <NavThemeProvider value={navigationTheme}>
      <StatusBar
        style={isDark ? "light" : "dark"}
        backgroundColor={isDark ? palette.gray[950] : "#ffffff"}
      />
      <Stack screenOptions={{ headerShown: false, animation: "none" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="staff" />
      </Stack>

      {status === "unauthenticated" ? (
        <Redirect href={"/login" as any} />
      ) : status === "authenticated" ? (
        <Redirect href="/staff/fleet" />
      ) : null}
    </NavThemeProvider>
  );
}
