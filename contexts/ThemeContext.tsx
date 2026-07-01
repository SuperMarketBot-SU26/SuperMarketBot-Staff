/**
 * SmartMarket Staff App — Theme Provider
 * Lets the user override the system color scheme with a manual toggle.
 * Reads from system on first load, then the toggle wins.
 */
import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";
import { lightTheme, darkTheme, type Theme } from "@/constants/theme";

type ThemeMode = "light" | "dark" | "system";
type ResolvedMode = "light" | "dark";

export interface ThemeContextValue {
  /** The full theme object for the currently resolved mode */
  theme: Theme;
  /** Whether the resolved theme is dark */
  isDark: boolean;
  /** The user's manual preference (system = follow device) */
  mode: ThemeMode;
  /** The actually-rendered mode after applying the system fallback */
  resolved: ResolvedMode;
  /** Toggle between light/dark. If currently "system", remembers the choice. */
  toggle: () => void;
  /** Explicitly set the mode */
  setMode: (m: ThemeMode) => void;
}

// Default context value used when no provider is mounted.
// Always reports light mode so it renders something sensible.
const defaultContext: ThemeContextValue = {
  theme: lightTheme,
  isDark: false,
  mode: "system",
  resolved: "light",
  toggle: () => {},
  setMode: () => {},
};

export const ThemeContext = createContext<ThemeContextValue>(defaultContext as unknown as ThemeContextValue);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useRNColorScheme();
  const [mode, setMode] = useState<ThemeMode>("system");

  const resolved: ResolvedMode = useMemo(() => {
    if (mode === "system") return systemScheme === "dark" ? "dark" : "light";
    return mode;
  }, [mode, systemScheme]);

  const isDark = resolved === "dark";
  const theme = isDark ? darkTheme : lightTheme;

  const toggle = useCallback(() => {
    setMode((prev) => {
      const current = prev === "system" ? resolved : prev;
      return current === "dark" ? "light" : "dark";
    });
  }, [resolved]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme: theme as Theme, isDark, mode, resolved, toggle, setMode }),
    [theme, isDark, mode, resolved, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  return useContext(ThemeContext);
}

export function useThemeToggle(): { toggle: () => void; mode: ThemeMode; isDark: boolean } {
  const { toggle, mode, isDark } = useContext(ThemeContext);
  return { toggle, mode, isDark };
}