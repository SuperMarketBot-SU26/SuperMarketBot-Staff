import { useAppTheme } from "@/constants/theme";

/**
 * cn() — Tailwind-style className merger for React Native
 * Merges multiple className strings, deduplicates, and handles conditional classes.
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs
    .flat()
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Returns opacity-adjusted hex color
 * e.g. hexToRgba('#ef4444', 0.15) → 'rgba(239,68,68,0.15)'
 */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Returns a style object for shadow with current theme mode
 */
export function getShadow(
  variant: "sm" | "md" | "lg" | "violet",
  isDark: boolean
): object {
  const map: Record<string, Record<string, object>> = {
    sm: {
      light: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 1 },
      dark: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 1 },
    },
    md: {
      light: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
      dark: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 3 },
    },
    lg: {
      light: { shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 5 },
      dark: { shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 5 },
    },
    violet: {
      light: { shadowColor: "#7c3aed", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 },
      dark: { shadowColor: "#8b5cf6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 4 },
    },
  };
  return map[variant][isDark ? "dark" : "light"];
}

/**
 * Returns appropriate divider color for current theme
 */
export function divider(isDark: boolean): string {
  return isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
}
