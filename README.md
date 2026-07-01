# SuperMarketBot-Staff

Mobile app for supermarket staff to monitor and coordinate the in-store robot fleet. Built with **Expo SDK 54** and **React Native 0.81** (New Architecture / Fabric, Hermes, React Compiler).

> 📱 Target device: Samsung Galaxy S25 reference (360 × 792 dp). Portrait only.

---

## ✨ Features

- **Bản Đồ (Fleet Map)** — Live overview of all robots per floor (1F / 2F / 3F), with battery and signal indicators.
- **Cảnh Báo (Tasks & Alerts)** — A prioritized task feed (urgent / high / normal) grouped by category, with quick actions to acknowledge.
- **Robot List** — Sortable list of every robot in the fleet with status, uptime, and signal strength.
- **Robot Detail** — Per-robot telemetry: battery, firmware, serial, signal, active tasks, error log.
- **Robot Nav** — Pings the robot's live location on the store map. Opens when staff tap "Xử lý" on a robot alert so they can walk to the robot and tap "Đã xử lý" on site.
- **Light / Dark / System theme** — Manual toggle in the header (Sun / Moon) overrides the device scheme via `ThemeContext`.
- **Side drawer navigation** — Hamburger slides in a left-side panel with all sections.

---

## 🧱 Tech Stack

| Layer        | Choice                                                    |
|--------------|-----------------------------------------------------------|
| Framework    | Expo SDK 54, React Native 0.81                            |
| Router       | `expo-router` (file-based, typed routes)                  |
| Navigation   | `@react-navigation/native`                                |
| Animation    | `react-native-reanimated` 4 + `react-native-worklets`     |
| Gestures     | `react-native-gesture-handler`                            |
| Safe Areas   | `react-native-safe-area-context`                          |
| Icons        | `expo-symbols`, `@expo/vector-icons`, custom SVG set      |
| Status Bar   | `expo-status-bar`                                         |
| Language     | TypeScript (`strict`), React Compiler enabled             |

---

## 📁 Project Structure

```
app/                       # File-based routes (expo-router)
  _layout.tsx              # Root stack + ThemeProvider
  index.tsx                # Redirect → /staff/fleet
  modal.tsx                # Modal route
  staff/
    _layout.tsx            # Phone-frame shell, header, sidebar
    index.tsx              # /staff → /staff/fleet
    fleet.tsx              # Bản Đồ
    tasks.tsx              # Cảnh Báo
    robots.tsx             # Robot list
    robot-detail.tsx       # Per-robot telemetry
    robotsData.ts          # Robot + Floor data (single source of truth)

components/
  ui/
    staff-icons.tsx        # Custom SVG icon set
    icon-symbol.tsx        # SF Symbols bridge
    collapsible.tsx
  themed-text.tsx
  themed-view.tsx
  parallax-scroll-view.tsx
  haptic-tab.tsx
  external-link.tsx
  hello-wave.tsx

constants/
  theme.ts                 # palette, lightTheme, darkTheme, typography,
                           # spacing, radius, shadows, useAppTheme/useIsDark

contexts/
  ThemeContext.tsx         # Light/Dark/System theme provider + useThemeToggle

hooks/                     # use-color-scheme, use-theme-color

assets/images/             # App icon, splash, foreground/background
app.json                   # Expo config (orientation, plugins, experiments)
```

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the dev server

```bash
npx expo start
```

Then open the app in one of:

- **Expo Go** on your physical device (limited, no custom native modules).
- An **Android emulator** (`a` key).
- An **iOS simulator** (`i` key, macOS only).
- A **development build** (`expo-dev-client`) for full native support.

### 3. Reset to a clean starter (optional)

```bash
npm run reset-project
```

Moves the current `app/` content to `app-example/` and creates a blank `app/`.

---

## 🎨 Design System

All visual tokens live in [`constants/theme.ts`](./constants/theme.ts):

- **Brand:** Violet primary (`palette.violet`), with Emerald / Amber / Red / Blue / Orange accents.
- **Mode-aware:** `lightTheme` and `darkTheme` are full token objects; `useAppTheme()` returns the resolved one.
- **Typography:** 13 / 15 / 17 / 20 / 24 / 30 px scale with weight + line-height tokens.
- **Spacing:** 4 / 8 / 12 / 16 / 20 / 24 / 32.
- **Radius:** 6 / 10 / 14 / 18 / pill.
- **Shadows:** `sm` / `md` / `lg` / `violet`, each with light + dark variants.
- **Device constants:** `screenWidth: 360`, `screenHeight: 792`, `headerHeight: 57`, `tabBarHeight: 64`, `sidebarWidth: 200`.

### Theme usage

```tsx
import { useAppTheme, useIsDark, useThemeToggle, palette } from "@/constants/theme";

const theme = useAppTheme();       // full token object
const isDark = useIsDark();        // boolean
const { toggle } = useThemeToggle(); // swap light <-> dark
```

The `ThemeProvider` (mounted in `app/_layout.tsx`) keeps the user's manual choice in memory and falls back to the system scheme on first launch.

---

## 📐 Routing

Routes are file-based under `app/`. The root stack currently exposes:

| Path             | File                  | Purpose                              |
|------------------|-----------------------|--------------------------------------|
| `/`              | `app/index.tsx`       | Redirects to `/staff/fleet`          |
| `/staff`         | `app/staff/_layout.tsx` | Shell: header + sidebar           |
| `/staff/fleet`   | `app/staff/fleet.tsx` | Bản Đồ (default landing)             |
| `/staff/fleet-map` | `app/staff/fleet-map.tsx` | Fullscreen pan/zoom map (tap blank area of the mini map to open) |
| `/staff/tasks`   | `app/staff/tasks.tsx` | Cảnh Báo                             |
| `/staff/robots`  | `app/staff/robots.tsx` | Robot list                          |
| `/staff/robot-detail` | `app/staff/robot-detail.tsx` | Telemetry + error log     |
| `/staff/robot-nav`   | `app/staff/robot-nav.tsx`   | Live robot location pin (from "Xử lý" on a robot alert) |
| `/modal`         | `app/modal.tsx`       | Generic modal                        |

---

## 🧪 Scripts

| Command            | What it does                                |
|--------------------|---------------------------------------------|
| `npm start`        | Run Expo dev server                         |
| `npm run android`  | Start dev server + open Android target     |
| `npm run ios`      | Start dev server + open iOS simulator       |
| `npm run web`      | Start dev server + open web target          |
| `npm run lint`     | Run `expo lint`                             |
| `npm run reset-project` | Reset `app/` to a blank starter        |

---

## 📝 Conventions

- **Styling:** `StyleSheet.create` per component; tokens via `palette` / `theme` / `DEVICE` rather than hard-coded colors or magic numbers.
- **Components:** Functional + hooks. Class components are not used.
- **Imports:** Use the `@/` alias for project-root modules (configured in `tsconfig.json`).
- **TypeScript:** Strict mode on. Avoid `any`; prefer `as const` and literal types.
- **Icons:** Custom SVG set in `components/ui/staff-icons.tsx`. Falls back to SF Symbols on iOS via `icon-symbol.tsx`.
- **Theme:** Always read `isDark` / `theme` from the hooks, never from `useColorScheme` directly. The user's manual override only takes effect through the context.

---

## 📄 License

Internal — SmartMarket SMB.