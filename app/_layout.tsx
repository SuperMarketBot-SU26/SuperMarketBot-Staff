/**
 * Root Layout — Top-level Stack navigator
 * Only handles: index (redirect) → staff section
 */
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { palette } from "@/constants/theme";
import { ThemeProvider, useThemeContext } from "@/contexts/ThemeContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootNavigation />
    </ThemeProvider>
  );
}

function RootNavigation() {
  const { isDark } = useThemeContext();

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
        {/* Root index — redirects to /staff/fleet */}
        <Stack.Screen name="index" />

        {/* Staff section (file-based routing at app/staff/*) */}
        <Stack.Screen name="staff" />

        {/* Modal */}
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
    </NavThemeProvider>
  );
}