/**
 * Login route — delegates to the LoginScreen living in `features/auth`.
 * Keeping the route file as a one-liner keeps the Expo Router routing
 * tree separate from the actual feature code.
 */
export { default } from "@/features/auth/screens/LoginScreen";