/**
 * Runtime configuration for the API layer.
 *
 * `API_BASE_URL` is read from `EXPO_PUBLIC_API_BASE_URL` (inlined into the
 * bundle by Expo at build time). The `.env.example` documents how to set
 * this up; if the variable is missing, we fall back to a sensible dev
 * default that points at localhost (works for `expo start` on a desktop
 * browser; physical-device testing needs the host IP instead).
 */
const raw = process.env.EXPO_PUBLIC_API_BASE_URL;
export const API_BASE_URL =
  raw && raw.trim().length > 0 ? raw.trim() : "http://localhost:5000";

if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log(`[api] Base URL: ${API_BASE_URL}`);
}

/** SecureStore keys used for the access + refresh tokens. */
export const TOKEN_KEY_ACCESS = "staff.auth.access";
export const TOKEN_KEY_REFRESH = "staff.auth.refresh";
