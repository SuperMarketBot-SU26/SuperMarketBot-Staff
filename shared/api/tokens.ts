/**
 * Token storage wrapper around `expo-secure-store` with Web fallback (`localStorage`).
 *
 * Safe on both Mobile (iOS/Android Native) and Web browsers (`react-native-web`).
 */
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import {
  TOKEN_KEY_ACCESS,
  TOKEN_KEY_REFRESH,
  TOKEN_KEY_EXPIRES,
} from "./config";

export interface StoredTokens {
  access: string;
  refresh: string;
  /** ISO 8601 — when the access token expires. */
  expiresAt: string;
}

let cache: StoredTokens | null | undefined = undefined;
let inflightRead: Promise<StoredTokens | null> | null = null;

const isWeb = Platform.OS === "web";

async function safeGetItem(key: string): Promise<string | null> {
  try {
    if (isWeb) {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    }
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function safeSetItem(key: string, value: string): Promise<void> {
  try {
    if (isWeb) {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      return;
    }
    await SecureStore.setItemAsync(key, value);
  } catch {
    // ignore storage write errors
  }
}

async function safeDeleteItem(key: string): Promise<void> {
  try {
    if (isWeb) {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      return;
    }
    await SecureStore.deleteItemAsync(key);
  } catch {
    // ignore storage delete errors
  }
}

async function readFromStore(): Promise<StoredTokens | null> {
  const [access, refresh, expiresAt] = await Promise.all([
    safeGetItem(TOKEN_KEY_ACCESS),
    safeGetItem(TOKEN_KEY_REFRESH),
    safeGetItem(TOKEN_KEY_EXPIRES),
  ]);
  if (!access || !refresh || !expiresAt) return null;
  return { access, refresh, expiresAt };
}

/** Returns cached stored tokens, reading from SecureStore/localStorage on first access. */
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
    safeSetItem(TOKEN_KEY_ACCESS, tokens.access),
    safeSetItem(TOKEN_KEY_REFRESH, tokens.refresh),
    safeSetItem(TOKEN_KEY_EXPIRES, tokens.expiresAt),
  ]);
}

export async function clear(): Promise<void> {
  cache = null;
  await Promise.all([
    safeDeleteItem(TOKEN_KEY_ACCESS),
    safeDeleteItem(TOKEN_KEY_REFRESH),
    safeDeleteItem(TOKEN_KEY_EXPIRES),
  ]);
}