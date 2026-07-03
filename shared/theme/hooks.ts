/**
 * Convenience hooks for reading the active theme.
 *
 *   useAppTheme()      → the full Theme object (most common)
 *   useIsDark()        → boolean, handy for short-circuit branches
 *   useThemeToggle()   → { toggle, mode, isDark } for the dark-mode button
 *
 * All three assume a `<ThemeProvider>` is mounted higher in the tree.
 * The root layout always mounts one; if you mount a screen standalone
 * (e.g. in a test) you'll get the safe light-mode default.
 */
import { useContext } from "react";
import { ThemeContext } from "./context";
import type { Theme } from "./tokens";

export function useAppTheme(): Theme {
  return useContext(ThemeContext).theme;
}

export function useIsDark(): boolean {
  return useContext(ThemeContext).isDark;
}

export function useThemeToggle(): {
  toggle: () => void;
  mode: "light" | "dark" | "system";
  isDark: boolean;
} {
  const { toggle, mode, isDark } = useContext(ThemeContext);
  return { toggle, mode, isDark };
}