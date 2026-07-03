/**
 * SmartMarket Staff App — Unified Design System
 * Based on Figma design: violet primary, emerald/amber/red status system
 * Samsung Galaxy S25 (360dp wide × 792dp tall) as reference device
 *
 * Single source of truth for:
 *   - the raw colour palette (every shade we use across the app)
 *   - the resolved `Theme` object for light/dark mode (consumed by useAppTheme)
 *   - spacing / radius / typography / shadow tokens
 *   - status / priority colour configs the screens look up by name
 */

/* ─── Color Palette ──────────────────────────────────────────────────── */
export const palette = {
  violet: {
    50:  "#f5f3ff",
    100: "#ede9fe",
    200: "#ddd6fe",
    300: "#c4b5fd",
    400: "#a78bfa",
    500: "#8b5cf6",
    600: "#7c3aed",
    700: "#6d28d9",
    800: "#5b21b6",
    900: "#4c1d95",
    950: "#2e1065",
  },

  emerald: {
    50:  "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
    950: "#022c22",
  },

  amber: {
    50:  "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
    950: "#451a03",
  },

  red: {
    50:  "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
    950: "#450a0a",
  },

  blue: {
    50:  "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
    950: "#172554",
  },

  orange: {
    50:  "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
    800: "#9a3412",
    900: "#7c2d12",
    950: "#431407",
  },

  gray: {
    50:  "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    850: "#18181b",
    900: "#111827",
    950: "#030712",
  },
} as const;

/* ─── Light / Dark Theme Objects ─────────────────────────────────────── */
export const lightTheme = {
  mode: "light" as const,
  background: "#ffffff",
  foreground: "#111827",
  card: "#ffffff",
  cardForeground: "#111827",
  popover: "#ffffff",
  popoverForeground: "#111827",
  primary: palette.violet[600],
  primaryForeground: "#ffffff",
  secondary: palette.gray[100],
  secondaryForeground: "#111827",
  muted: palette.gray[100],
  mutedForeground: palette.gray[500],
  accent: palette.violet[50],
  accentForeground: palette.violet[700],
  destructive: palette.red[600],
  destructiveForeground: "#ffffff",
  border: palette.gray[200],
  input: "transparent",
  inputBackground: palette.gray[50],
  ring: palette.violet[400],
  sidebar: "#ffffff",
  sidebarForeground: "#111827",
  sidebarPrimary: palette.violet[700],
  sidebarPrimaryForeground: "#ffffff",
  sidebarAccent: palette.violet[50],
  sidebarAccentForeground: palette.violet[700],
  sidebarBorder: palette.gray[200],
  sidebarRing: palette.violet[400],
  chart1: palette.violet[500],
  chart2: palette.emerald[500],
  chart3: palette.amber[500],
  chart4: palette.blue[500],
  chart5: palette.red[500],
  statusActive: palette.emerald[500],
  statusStandby: palette.amber[500],
  statusError: palette.red[500],
  statusCharging: palette.blue[500],
  surface: palette.gray[50],
  surfaceElevated: "#ffffff",
};

export const darkTheme = {
  mode: "dark" as const,
  background: "#030712",
  foreground: "#f9fafb",
  card: "#111827",
  cardForeground: "#f9fafb",
  popover: "#111827",
  popoverForeground: "#f9fafb",
  primary: palette.violet[500],
  primaryForeground: "#ffffff",
  secondary: palette.gray[800],
  secondaryForeground: "#f9fafb",
  muted: palette.gray[800],
  mutedForeground: palette.gray[400],
  accent: palette.violet[900],
  accentForeground: palette.violet[300],
  destructive: palette.red[600],
  destructiveForeground: "#ffffff",
  border: palette.gray[800],
  input: "transparent",
  inputBackground: palette.gray[800],
  ring: palette.violet[500],
  sidebar: "#030712",
  sidebarForeground: "#f9fafb",
  sidebarPrimary: palette.violet[500],
  sidebarPrimaryForeground: "#ffffff",
  sidebarAccent: palette.violet[900],
  sidebarAccentForeground: palette.violet[300],
  sidebarBorder: palette.gray[800],
  sidebarRing: palette.violet[500],
  chart1: palette.violet[400],
  chart2: palette.emerald[400],
  chart3: palette.amber[400],
  chart4: palette.blue[400],
  chart5: palette.red[400],
  statusActive: palette.emerald[400],
  statusStandby: palette.amber[400],
  statusError: palette.red[400],
  statusCharging: palette.blue[400],
  surface: palette.gray[900],
  surfaceElevated: palette.gray[800],
};

export type Theme = typeof lightTheme;

/* ─── Spacing & Radius ───────────────────────────────────────────────── */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
} as const;

/* ─── Typography ─────────────────────────────────────────────────────── */
export const typography = {
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
  },
  fontWeight: {
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    extrabold: "800" as const,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

/* ─── Shadows ────────────────────────────────────────────────────────── */
export const shadows = {
  sm: {
    light: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
    dark: "0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)",
  },
  md: {
    light: "0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)",
    dark: "0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)",
  },
  lg: {
    light: "0 10px 30px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)",
    dark: "0 10px 30px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.4)",
  },
  violet: {
    light: "0 4px 16px rgba(124,58,237,0.2)",
    dark: "0 4px 16px rgba(124,58,237,0.4)",
  },
} as const;

/* ─── Device Constants (Samsung Galaxy S25 reference) ─────────────────── */
export const DEVICE = {
  screenWidth: 360,
  screenHeight: 792,
  headerHeight: 57,
  tabBarHeight: 64,
  sidebarWidth: 200,
  borderRadius: {
    card: 18,
    button: 12,
    badge: 6,
    pill: 9999,
  },
} as const;