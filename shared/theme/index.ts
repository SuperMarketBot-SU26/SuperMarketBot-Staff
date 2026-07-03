/**
 * `shared/theme` — design tokens, theme provider, and the consumer hooks.
 *
 * Public surface (the only thing features should import from here):
 *   - tokens:    palette, spacing, radius, typography, shadows, DEVICE
 *   - status:    robotStatusConfig, priorityConfig, Priority
 *   - context:   ThemeProvider, ThemeContext
 *   - hooks:     useAppTheme, useIsDark, useThemeToggle
 *   - types:     Theme
 *
 * Concrete example of why this layer exists: a feature screen should
 * never have to write `import { palette } from "@/constants/theme"`.
 * It should `import { palette, useIsDark } from "@/shared/theme"` and
 * the rest of the app can move underneath without breaking the screens.
 */

export {
  palette,
  lightTheme,
  darkTheme,
  spacing,
  radius,
  typography,
  shadows,
  DEVICE,
  type Theme,
} from "./tokens";

export {
  robotStatusConfig,
  priorityConfig,
  type Priority,
} from "./status-config";

export {
  ThemeProvider,
  ThemeContext,
  useThemeContext,
  type ThemeContextValue,
} from "./context";

export {
  useAppTheme,
  useIsDark,
  useThemeToggle,
} from "./hooks";