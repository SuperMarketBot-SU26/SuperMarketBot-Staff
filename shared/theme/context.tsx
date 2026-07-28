/**
 * SmartMarket Staff App — Theme Provider
 * Defaults to Light Mode ("light") for pure white, high-contrast Admin FE style by default.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useColorScheme as useRNColorScheme } from "react-native";
import { lightTheme, darkTheme, type Theme } from "./tokens";

type ThemeMode = "light" | "dark" | "system";
type ResolvedMode = "light" | "dark";

export interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  mode: ThemeMode;
  resolved: ResolvedMode;
  toggle: () => void;
  setMode: (m: ThemeMode) => void;
}

const defaultContext: ThemeContextValue = {
  theme: lightTheme,
  isDark: false,
  mode: "light",
  resolved: "light",
  toggle: () => {},
  setMode: () => {},
};

export const ThemeContext =
  createContext<ThemeContextValue>(
    defaultContext as unknown as ThemeContextValue,
  );

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useRNColorScheme();
  /* Force default to "light" mode so app opens in pure white like Admin FE */
  const [mode, setMode] = useState<ThemeMode>("light");

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
    () => ({
      theme: theme as Theme,
      isDark,
      mode,
      resolved,
      toggle,
      setMode,
    }),
    [theme, isDark, mode, resolved, toggle],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  return useContext(ThemeContext);
}