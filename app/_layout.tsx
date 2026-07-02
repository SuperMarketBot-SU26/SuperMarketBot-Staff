/**
 * Root Layout — Top-level Stack navigator
 * Top-level index redirects based on auth state:
 *   - not signed in → /login
 *   - signed in     → /staff/fleet
 */
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from "@react-navigation/native";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { palette } from "@/constants/theme";
import { ThemeProvider, useThemeContext } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider>
          <RootNavigation />
        </ThemeProvider>
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
        {/* Root index — redirects based on auth state */}
        <Stack.Screen name="index" />

        {/* Login screen */}
        <Stack.Screen name="login" />

        {/* Staff section (file-based routing at app/staff/*) */}
        <Stack.Screen name="staff" />
      </Stack>

      {/* Top-level redirect after the Stack is registered so the
          "login" route is reachable as a target. */}
      {status === "unauthenticated" ? (
        <Redirect href={"/login" as any} />
      ) : status === "authenticated" ? (
        <Redirect href="/staff/fleet" />
      ) : null}
    </NavThemeProvider>
  );
}