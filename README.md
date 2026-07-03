# SuperMarketBot-Staff

Mobile app for supermarket staff to monitor and coordinate the in-store robot fleet. Built with **Expo SDK 54** and **React Native 0.81** (New Architecture / Fabric, Hermes, React Compiler).

> 📱 Target device: Samsung Galaxy S25 reference (360 × 792 dp). Portrait only.

---

## ✨ Features

- **Đăng nhập (Login)** — Email + password against `POST /api/auth/login`; tokens stored in `expo-secure-store`. Auto-refresh on 401 via `POST /api/auth/refresh`.
- **Bản Đồ (Fleet)** — Live overview of all robots with battery, mode and status (active / standby / error / charging). Pull-to-refresh.
- **Cảnh Báo (Tasks & Alerts)** — A prioritized feed (urgent / high / normal). **Hàng hóa** tab is live (`GET /api/staff/tasks`, Out-of-Stock Handler). **Robot** tab is live (`GET /api/robots` → derive alerts from battery / mode / last-seen). Tapping **Xử lý** on a Hàng hóa row opens **Vị trí kệ** (`/staff/restock-location`) which pings the aisle node on a mini-map and exposes a **Đã xử lý** confirm action.
- **Robot List** — Live roster from `GET /api/robots` (+ pose) with per-status summary strip.
- **Robot Detail** — `GET /api/robots/{code}/pose` for live position; battery, mode, last-seen.
- **Robot Nav** — When staff tap "Xử lý" on a robot alert, this screen pings the robot's live location and pins it on the mini-map so the staff can walk to the robot and tap "Đã xử lý".
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
| Icons        | Custom SVG set (`shared/ui/icons.tsx`)                    |
| Storage      | `expo-secure-store` (auth tokens)                         |
| Language     | TypeScript (`strict`), React Compiler enabled             |

---

## 📁 Project Structure

The app follows a **feature-based** layout: route files in `app/` stay at the root (required by `expo-router`), but every screen, hook, and reusable bit lives under `features/<area>/`. Cross-cutting primitives live under `shared/`.

```
app/                                    # File-based routes (expo-router)
  _layout.tsx                           # Root stack + AuthProvider + ThemeProvider
  index.tsx                             # Redirect → /staff/fleet
  login.tsx                             # Re-exports features/auth/screens/LoginScreen
  staff/
    _layout.tsx                         # Re-exports features/staff/layout/StaffLayout
    index.tsx                           # Redirect → /staff/fleet
    fleet.tsx                           # Re-exports features/staff/fleet/FleetScreen
    fleet-map.tsx                       # Re-exports features/staff/fleet/FleetMapScreen
    tasks.tsx                           # Re-exports features/staff/tasks/TasksScreen
    robots.tsx                          # Re-exports features/staff/robots/RobotsScreen
    robot-detail.tsx                    # Re-exports features/staff/robot-detail/RobotDetailScreen
    robot-nav.tsx                       # Re-exports features/staff/robot-nav/RobotNavScreen
    restock-location.tsx                # Re-exports features/staff/restock-location/RestockLocationScreen

features/                               # All real screens, hooks, and components
  auth/
    context.tsx                         # AuthProvider + useAuth (login/logout state)
    components/LoginCard.tsx            # Presentational login form
    screens/LoginScreen.tsx             # Owns form state + submit + redirect
    index.ts                            # Public barrel

  staff/
    layout/
      StaffLayout.tsx                   # Phone-frame shell, header, sidebar, <Slot/>
      components/
        StaffHeader.tsx                 # Hamburger + dark-mode toggle
        StaffSidebar.tsx                # Slide-in nav panel + logout
        SidebarButton.tsx               # Individual nav row
        HamburgerIcon.tsx               # Animated menu/X icon
    fleet/
      FleetScreen.tsx                   # Bản Đồ overview
      FleetMapScreen.tsx                # Fullscreen pan/zoom map
      components/                       # FleetRobotListItem, MapPlaceholder,
                                        # BackgroundLayer, MapPin, RobotRow,
                                        # ZoomIndicator, InlineBanner
      lib/map.ts                        # Shared map math (project, projectPct, describeRobot)
    robots/
      RobotsScreen.tsx                  # Robot roster + status summary
      components/                       # RobotCard, StatusBadge, SummaryStrip
    robot-detail/
      RobotDetailScreen.tsx             # Per-robot telemetry
      components/                       # DetailHeader, HeroCard, StatsRow, InfoCard
      hooks/useRobot.ts                 # Single-robot loader
    robot-nav/
      RobotNavScreen.tsx                # Live robot location pin
      components/                       # NavHeader, AlertCard, MiniRobotMap,
                                        # RobotStatusCard, PulseRing
      hooks/useRobotNav.ts              # Loader with last-pinged timestamp
    tasks/
      TasksScreen.tsx                   # Cảnh Báo (Hàng hóa + Robot tabs)
      components/                       # TaskCard, TasksHeader, TasksEmpty
      lib/deriveRobotAlerts.ts          # Map robots → Task union, priority logic
    restock-location/
      RestockLocationScreen.tsx         # Aisle ping + "Đã xử lý" confirm (hangHoa)
      components/                       # RestockPingMap, RestockInfoCard
      hooks/useRestockTask.ts           # Placeholder for future fetch-by-id
    hooks/
      useRobotList.ts                   # Shared list-with-poses loader
      useStaffTasks.ts                  # Shared restock-task loader
    index.ts                            # Public barrel

shared/                                 # Cross-cutting primitives
  theme/
    tokens.ts                           # palette, light/dark themes, spacing, radius,
                                        # typography, shadows, DEVICE
    status-config.ts                    # robotStatusConfig, priorityConfig (depend on API types)
    context.tsx                         # ThemeProvider + ThemeContext
    hooks.ts                            # useAppTheme, useIsDark, useThemeToggle
    index.ts                            # Public barrel
  api/
    client.ts                           # Tiny fetch wrapper (JSON, auth header, 401 refresh)
    auth.ts                             # login / refresh / logout
    tokens.ts                           # SecureStore wrapper (access + refresh + expiresAt)
    config.ts                           # EXPO_PUBLIC_API_BASE_URL + token keys
    types.ts                            # BE DTOs + UI-normalized types (NormalizedRobot, StaffTask, ...)
    robots.ts                           # listRobots, listRobotsWithPositions, getRobot, getRobotPose
    tasks.ts                            # listRestockTasks, mapRestockPriority
    index.ts                            # Public barrel (apiRequest, AuthApi, types, ...)
  hooks/
    useApiErrorMessage.ts               # Translate ApiError → Vietnamese user-facing string
    index.ts                            # Public barrel
  ui/
    icons.tsx                           # Hand-rolled SVG icon set (~20 used)
    index.ts                            # Public barrel
  lib/
    formatRelativeTime.ts               # ISO → "vừa xong / 5 phút trước / ..."
    index.ts                            # Public barrel

assets/images/                          # App icon, splash, foreground/background
app.json                                # Expo config (orientation, plugins, experiments)
.env.example                            # Template for EXPO_PUBLIC_API_BASE_URL
```

### Why feature-based?

The old flat layout (`components/`, `constants/`, `contexts/`, `hooks/`, `services/`) hit 800+ lines in single page files because every screen pulled in pieces from five different folders. Moving to `features/<area>/` keeps each screen's components, hooks, and helpers beside the screen that uses them — so a future change to "robot-detail" only touches one folder.

Cross-cutting code that genuinely *is* shared (API client, theme tokens, icons, generic utilities) still lives in `shared/`. The rule of thumb: if only one feature uses it, it lives in that feature.

### Route shells are 1–4 lines each

`expo-router` requires routes to live in `app/`, so each route file just re-exports the screen from `features/`:

```ts
// app/staff/fleet.tsx
export { default } from "@/features/staff/fleet/FleetScreen";
```

This keeps the routing topology explicit (you can see every URL in `app/`) while letting us organise everything else by feature.

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the API URL

```bash
cp .env.example .env
# Edit .env and set EXPO_PUBLIC_API_BASE_URL to your dev backend, e.g.:
#   http://192.168.1.106:5000   (phone on the same Wi-Fi as the dev machine)
#   http://localhost:5000       (web / emulator on the same machine)
```

`EXPO_PUBLIC_*` variables are inlined into the JS bundle at build time (Expo SDK 50+). Do **not** put secrets here.

Restart the dev server with `npx expo start --clear` after editing the file.

### 3. Start the dev server

```bash
npx expo start
```

Then open the app in one of:

- **Expo Go** on your physical device (limited, no custom native modules).
- An **Android emulator** (`a` key).
- An **iOS simulator** (`i` key, macOS only).
- A **development build** (`expo-dev-client`) for full native support.

---

## 🔌 API Layer

The HTTP client and per-resource wrappers live under `shared/api/`.

| Endpoint                          | Wrapper                          |
|-----------------------------------|----------------------------------|
| `POST /api/auth/login`            | `shared/api/auth.ts` → `login`   |
| `POST /api/auth/refresh`          | `shared/api/auth.ts` → `refresh` |
| `POST /api/auth/logout`           | `shared/api/auth.ts` → `logout`  |
| `GET  /api/robots`                | `shared/api/robots.ts` → `listRobots` (+ `listRobotsWithPositions`) |
| `GET  /api/robots/{code}/pose`    | `shared/api/robots.ts` → `getRobotPose` / `getRobot` |
| `GET  /api/staff/tasks`           | `shared/api/tasks.ts` → `listRestockTasks` |

The HTTP client (`shared/api/client.ts`) is intentionally minimal:

- Reads `EXPO_PUBLIC_API_BASE_URL` at startup.
- Sets `Content-Type: application/json` on any request with a body.
- Adds `Authorization: Bearer <accessToken>` unless `skipAuth: true`.
- On `401` from a non-auth endpoint, tries `POST /api/auth/refresh` once and retries the original request.
- Converts non-2xx responses into `ApiError` carrying the BE's error message.

Features consume the API surface through the barrel:

```ts
import { listRobots, listRestockTasks, AuthApi, type NormalizedRobot } from "@/shared/api";
```

---

## 🎨 Design System

All visual tokens live under `shared/theme/`:

- **`tokens.ts`** — `palette`, `lightTheme`, `darkTheme`, `spacing`, `radius`, `typography`, `shadows`, `DEVICE`.
- **`status-config.ts`** — `robotStatusConfig` and `priorityConfig` (live separately from `tokens.ts` because they reference the `RobotStatus` API type).
- **`context.tsx`** — `ThemeProvider` + `ThemeContext`.
- **`hooks.ts`** — `useAppTheme`, `useIsDark`, `useThemeToggle`.
- **`index.ts`** — public barrel.

Highlights:

- **Brand:** Violet primary (`palette.violet`), with Emerald / Amber / Red / Blue / Orange accents.
- **Mode-aware:** `lightTheme` and `darkTheme` are full token objects; `useAppTheme()` returns the resolved one.
- **Typography:** 13 / 15 / 17 / 20 / 24 / 30 px scale with weight + line-height tokens.
- **Spacing:** 4 / 8 / 12 / 16 / 20 / 24 / 32.
- **Radius:** 6 / 10 / 14 / 18 / pill.
- **Shadows:** `sm` / `md` / `lg` / `violet`, each with light + dark variants.
- **Device constants:** `screenWidth: 360`, `screenHeight: 792`, `headerHeight: 57`, `tabBarHeight: 64`, `sidebarWidth: 200`.

### Theme usage

```tsx
import { useAppTheme, useIsDark, useThemeToggle, palette } from "@/shared/theme";

const theme = useAppTheme();       // full token object
const isDark = useIsDark();        // boolean
const { toggle } = useThemeToggle(); // swap light <-> dark
```

The `ThemeProvider` (mounted in `app/_layout.tsx`) keeps the user's manual choice in memory and falls back to the system scheme on first launch.

---

## 📐 Routing

Routes are file-based under `app/`. The root stack currently exposes:

| Path                       | File                              | Purpose                                       |
|----------------------------|-----------------------------------|-----------------------------------------------|
| `/`                        | `app/index.tsx`                   | Redirects to `/staff/fleet` (auth-gated)      |
| `/login`                   | `app/login.tsx`                   | Đăng nhập                                     |
| `/staff`                   | `app/staff/_layout.tsx`           | Shell: header + sidebar                       |
| `/staff/fleet`             | `app/staff/fleet.tsx`             | Bản Đồ (default landing)                      |
| `/staff/fleet-map`         | `app/staff/fleet-map.tsx`         | Fullscreen pan/zoom map (placeholder)         |
| `/staff/tasks`             | `app/staff/tasks.tsx`             | Cảnh Báo                                      |
| `/staff/robots`            | `app/staff/robots.tsx`            | Robot list                                    |
| `/staff/robot-detail`      | `app/staff/robot-detail.tsx`      | Telemetry + live pose (`?code=…`)             |
| `/staff/robot-nav`         | `app/staff/robot-nav.tsx`         | Live robot location pin (`?code=…`)           |
| `/staff/restock-location`  | `app/staff/restock-location.tsx`  | Aisle pin for a hangHoa task (`?id=…&slotCode=…`) |

---

## 🧪 Scripts

| Command                  | What it does                                          |
|--------------------------|-------------------------------------------------------|
| `npm start`              | Run Expo dev server                                   |
| `npm run android`        | Start dev server + open Android target                |
| `npm run ios`            | Start dev server + open iOS simulator                 |
| `npm run web`            | Start dev server + open web target                    |
| `npm run lint`           | Run `expo lint`                                       |
| `npm run typecheck`      | Run `tsc --noEmit` over the project                   |
| `npm run reset-project`  | Reset `app/` to a blank starter                       |

---

## 📝 Conventions

- **Styling:** `StyleSheet.create` per component; tokens via `palette` / `theme` / `DEVICE` rather than hard-coded colors or magic numbers.
- **Components:** Functional + hooks. Class components are not used.
- **Imports:** Use the `@/` alias for project-root modules (configured in `tsconfig.json`).
- **TypeScript:** Strict mode on. Avoid `any`; prefer `as const` and literal types.
- **Icons:** Custom SVG set in `shared/ui/icons.tsx`. Adding a new icon is just a function with `<Svg>` primitives — no font shipping required.
- **Theme:** Always read `isDark` / `theme` from the hooks, never from `useColorScheme` directly. The user's manual override only takes effect through the context.
- **API errors:** Always render `ApiError.message` through `useApiErrorMessage()` so 401s land as "Phiên đăng nhập đã hết hạn" consistently.

---

## 📄 License

Internal — SmartMarket SMB.