/**
 * `features/auth` — login + session management.
 *
 * Public surface:
 *   - `AuthProvider` / `useAuth` — global auth state (mounted in app/_layout)
 *   - `LoginScreen`              — the route component (re-exported by app/login.tsx)
 *   - `LoginCard`                — extracted card component (used in tests)
 */
export { AuthProvider, useAuth } from "./context";
export { default as LoginScreen } from "./screens/LoginScreen";
export { LoginCard } from "./components/LoginCard";