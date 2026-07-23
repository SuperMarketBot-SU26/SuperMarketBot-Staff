/**
 * Runtime configuration for the API layer.
 *
 * Supports seamless switching between local and ngrok backends via environment variables.
 *
 * Configuration (in `EXPO_PUBLIC_*` env vars, inlined into the bundle at build time):
 *   - `EXPO_PUBLIC_ACTIVE_BACKEND`: "local" | "ngrok" (defaults to "local")
 *   - `EXPO_PUBLIC_LOCAL_API_URL`: URL for local backend (default: http://localhost:5000)
 *   - `EXPO_PUBLIC_NGROK_API_URL`: URL for ngrok tunnel
 *   - `EXPO_PUBLIC_API_BASE_URL`: Legacy override — if set, bypasses backend selection
 *
 * Usage:
 *   1. Copy `.env.example` to `.env`
 *   2. Set your ngrok URL in `EXPO_PUBLIC_NGROK_API_URL`
 *   3. Change `EXPO_PUBLIC_ACTIVE_BACKEND` between "local" and "ngrok"
 *   4. Restart `npx expo start --clear` to pick up new values
 */

type BackendType = "local" | "ngrok";

const activeBackend = (process.env.EXPO_PUBLIC_ACTIVE_BACKEND ?? "local") as BackendType;
const localUrl = process.env.EXPO_PUBLIC_LOCAL_API_URL ?? "http://localhost:5000";
const ngrokUrl = process.env.EXPO_PUBLIC_NGROK_API_URL ?? "";
const legacyUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

function buildApiBaseUrl(): string {
  if (legacyUrl && legacyUrl.trim().length > 0) {
    return legacyUrl.trim();
  }

  switch (activeBackend) {
    case "ngrok":
      if (ngrokUrl && ngrokUrl.trim().length > 0) {
        return ngrokUrl.trim();
      }
      console.warn("[api] ACTIVE_BACKEND=ngrok but EXPO_PUBLIC_NGROK_API_URL is not set. Falling back to local.");
      return localUrl;
    case "local":
    default:
      return localUrl;
  }
}

export const API_BASE_URL = buildApiBaseUrl();

if (__DEV__) {
  console.log(`[api] Base URL: ${API_BASE_URL} (backend: ${activeBackend})`);
}

/** SecureStore keys used for the access + refresh tokens. */
export const TOKEN_KEY_ACCESS = "staff.auth.access";
export const TOKEN_KEY_REFRESH = "staff.auth.refresh";
export const TOKEN_KEY_EXPIRES = "staff.auth.expiresAt";