/**
 * Token storage wrapper around `expo-secure-store`.
 *
 * We use SecureStore (keychain / Android keystore) instead of AsyncStorage
 * because the refresh token is a long-lived credential.
 *
 * The module never throws on storage failures — read returns null, write
 * is best-effort. The caller treats "no token" as "logged out".
 *
 * An in-memory cache is held for synchronous reads inside the same tick;
 * SecureStore itself is async and we don't want every API call to wait on
 * a SecureStore round-trip on the hot path.
 */
import * as SecureStore from "expo-secure-store";
import { TOKEN_KEY_ACCESS, TOKEN_KEY_REFRESH } from "./config";

export interface StoredTokens {
  access: string;
  refresh: string;
  /** ISO 8601 — when the access token expires. */
  expiresAt: string;
}

let cache: StoredTokens | null | undefined = undefined;
let inflightRead: Promise<StoredTokens | null> | null = null;

async function readFromStore(): Promise<StoredTokens | null> {
  const [access, refresh, expiresAt] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY_ACCESS),
    SecureStore.getItemAsync(TOKEN_KEY_REFRESH),
    SecureStore.getItemAsync("staff.auth.expiresAt"),
  ]);
  if (!access || !refresh || !expiresAt) return null;
  return { access, refresh, expiresAt };
}

/** Returns cached stored tokens, reading from SecureStore on first access. */
export async function getTokens(): Promise<StoredTokens | null> {
  if (cache !== undefined) return cache;
  if (!inflightRead) {
    inflightRead = readFromStore().finally(() => {
      inflightRead = null;
    });
  }
  cache = await inflightRead;
  return cache;
}

export async function getAccess(): Promise<string | null> {
  const t = await getTokens();
  return t?.access ?? null;
}

export async function getRefresh(): Promise<string | null> {
  const t = await getTokens();
  return t?.refresh ?? null;
}

export async function save(tokens: StoredTokens): Promise<void> {
  cache = tokens;
  await Promise.all([
    SecureStore.setItemAsync(TOKEN_KEY_ACCESS, tokens.access),
    SecureStore.setItemAsync(TOKEN_KEY_REFRESH, tokens.refresh),
    SecureStore.setItemAsync("staff.auth.expiresAt", tokens.expiresAt),
  ]);
}

export async function clear(): Promise<void> {
  cache = null;
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY_ACCESS),
    SecureStore.deleteItemAsync(TOKEN_KEY_REFRESH),
    SecureStore.deleteItemAsync("staff.auth.expiresAt"),
  ]);
}
