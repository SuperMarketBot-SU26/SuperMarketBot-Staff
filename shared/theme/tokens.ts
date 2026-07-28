/**
 * SmartMarket Staff App — Pure White Design System (Matching Admin FE 100%)
 *
 * All themes (light & dark) use the Pure White & Soft Mint Slate palette
 * so that dark backgrounds NEVER appear anywhere in the app.
 */

/* ─── Color Palette ──────────────────────────────────────────────────── */
export const palette = {
  green: {
    50:  "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
    950: "#052e16",
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

  slate: {
    50:  "#f7faf7",
    100: "#f3f8f4",
    200: "#e6eee7",
    300: "#cad6cf",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    850: "#151e2e",
    900: "#11201a",
    950: "#052e16",
  },

  gray: {
    50:  "#f7faf7",
    100: "#f3f8f4",
    200: "#e6eee7",
    300: "#cad6cf",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    850: "#151e2e",
    900: "#11201a",
    950: "#052e16",
  },

  teal: {
    50:  "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
    950: "#052e16",
  },

  violet: {
    50:  "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
    950: "#052e16",
  },
} as const;

/* ─── Pure White Theme Objects (Eliminating Dark Backgrounds) ─────────── */
export const lightTheme = {
  mode: "light" as const,
  background: "#f7faf7",
  foreground: "#11201a",
  card: "#ffffff",
  cardForeground: "#11201a",
  popover: "#ffffff",
  popoverForeground: "#11201a",
  primary: palette.green[800],
  primaryForeground: "#ffffff",
  secondary: palette.green[100],
  secondaryForeground: "#11201a",
  muted: palette.slate[100],
  mutedForeground: palette.slate[500],
  accent: palette.green[50],
  accentForeground: palette.green[900],
  destructive: palette.red[600],
  destructiveForeground: "#ffffff",
  border: "rgba(20,83,45,0.15)",
  input: "transparent",
  inputBackground: palette.slate[50],
  ring: palette.green[500],
  sidebar: "#ffffff",
  sidebarForeground: "#11201a",
  sidebarPrimary: palette.green[800],
  sidebarPrimaryForeground: "#ffffff",
  sidebarAccent: palette.green[50],
  sidebarAccentForeground: palette.green[900],
  sidebarBorder: "rgba(20,83,45,0.15)",
  sidebarRing: palette.green[500],
  chart1: palette.green[600],
  chart2: palette.emerald[500],
  chart3: palette.amber[500],
  chart4: palette.blue[500],
  chart5: palette.red[500],
  statusActive: palette.emerald[500],
  statusStandby: palette.blue[500],
  statusError: palette.red[500],
  statusCharging: palette.amber[500],
  surface: palette.slate[50],
  surfaceElevated: "#ffffff",
};

export const darkTheme = { ...lightTheme, mode: "dark" as const };

export type Theme = typeof lightTheme;

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

export const shadows = {
  sm: {
    light: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
    dark: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
  },
  md: {
    light: "0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)",
    dark: "0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)",
  },
  lg: {
    light: "0 10px 30px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)",
    dark: "0 10px 30px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)",
  },
  green: {
    light: "0 4px 16px rgba(22,163,74,0.2)",
    dark: "0 4px 16px rgba(22,163,74,0.2)",
  },
} as const;

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