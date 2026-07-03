/**
 * Runtime configuration that maps the staff app to the right floor
 * in the supermarket.
 *
 * `EXPO_PUBLIC_DEFAULT_FLOOR_ID` is inlined into the bundle by Expo at
 * build time. Falls back to `1` so the app still loads if the env is
 * not set (most stores today only have one floor).
 *
 * When the BE eventually exposes `GET /api/v1/floors`, this file is the
 * single place to swap to a user-picked floor.
 */
const raw = process.env.EXPO_PUBLIC_DEFAULT_FLOOR_ID;
const parsed = raw ? Number.parseInt(raw.trim(), 10) : Number.NaN;
export const DEFAULT_FLOOR_ID =
  Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

if (__DEV__) {
  console.log(`[config] Default floor id: ${DEFAULT_FLOOR_ID}`);
}