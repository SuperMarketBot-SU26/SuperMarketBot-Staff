/**
 * Tiny HTTP client for the SmartMarketBot backend.
 *
 * Responsibilities:
 *  - Base URL + JSON encoding + header defaults.
 *  - Inject `Authorization: Bearer <accessToken>` when an access token is set.
 *  - Auto-refresh the token on 401, then retry the original request once.
 *  - Convert non-OK responses into `ApiError` with the BE's error message.
 *
 * Intentionally not using axios / ky — a ~70-line fetch wrapper is enough
 * for this surface and keeps the bundle small. If we grow a need for
 * interceptors / cancellation / retries beyond the one above, swap to ky.
 */
import { API_BASE_URL, TOKEN_KEY_ACCESS, TOKEN_KEY_REFRESH } from "./config";
import * as tokens from "./tokens";

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorLike | undefined;
  constructor(message: string, status: number, body?: ApiErrorLike) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

interface ApiErrorLike {
  message?: string;
  errors?: Record<string, string[]>;
  [k: string]: unknown;
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiOptions {
  method?: HttpMethod;
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  /**
   * Pass `true` for endpoints that must NOT receive a token (login).
   * Pass `"skip-refresh"` to disable the silent refresh on 401 (used by
   * the refresh endpoint itself).
   */
  skipAuth?: boolean | "skip-refresh";
  /** AbortSignal forwarding (e.g. for unmount). */
  signal?: AbortSignal;
}

export interface ApiResponse<T> {
  status: number;
  data: T;
}

function buildUrl(
  path: string,
  query?: ApiOptions["query"],
): string {
  const base = API_BASE_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (!query) return `${base}${cleanPath}`;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    params.append(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${base}${cleanPath}?${qs}` : `${base}${cleanPath}`;
}

async function readJson<T>(res: Response): Promise<T> {
  // Some BE error bodies are empty — guard.
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(
      `Invalid JSON from server (HTTP ${res.status})`,
      res.status,
    );
  }
}

function errFrom(res: Response, body: unknown): ApiError {
  const candidate = (body as ApiErrorLike | undefined)?.message;
  const message =
    (typeof candidate === "string" && candidate) ||
    `Request failed (HTTP ${res.status})`;
  return new ApiError(message, res.status, body as ApiErrorLike | undefined);
}

/**
 * Single-flight refresh: if multiple in-flight requests all hit 401 at once,
 * only one refresh actually fires. The others reuse its promise.
 */
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  const rt = await tokens.getRefresh();
  if (!rt) {
    refreshInFlight = Promise.resolve(null);
    return null;
  }
  refreshInFlight = (async () => {
    try {
      const res = await fetch(buildUrl("/api/auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: rt }),
      });
      if (!res.ok) {
        await tokens.clear();
        return null;
      }
      const data = await readJson<AuthResponseDtoLike>(res);
      await tokens.save({
        access: data.accessToken,
        refresh: data.refreshToken,
        expiresAt: data.accessTokenExpiresAt,
      });
      return data.accessToken;
    } catch {
      return null;
    } finally {
      // Allow next 401 to trigger another refresh.
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

// Local mirror of just what refresh() actually reads from the response.
interface AuthResponseDtoLike {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
}

export async function apiRequest<T>(
  path: string,
  opts: ApiOptions = {},
): Promise<ApiResponse<T>> {
  const { method = "GET", query, body, skipAuth, signal } = opts;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  // Always send a JSON Content-Type when there's a body — even on
  // `skipAuth: true` endpoints (login / refresh), otherwise ASP.NET Core
  // returns 415 for [FromBody] parameters.
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let token: string | null = null;
  if (skipAuth !== true && skipAuth !== "skip-refresh") {
    token = await tokens.getAccess();
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  const doFetch = (tokenToSend: string | null) => {
    const h = { ...headers };
    if (tokenToSend) h.Authorization = `Bearer ${tokenToSend}`;
    return fetch(buildUrl(path, query), {
      method,
      headers: h,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  };

  let res = await doFetch(token);
  let payload: unknown;

  // 401 path: try a refresh exactly once, then retry the request.
  if (
    res.status === 401 &&
    skipAuth !== true &&
    skipAuth !== "skip-refresh"
  ) {
    const fresh = await refreshAccessToken();
    if (fresh) {
      res = await doFetch(fresh);
    }
  }

  // 204 No Content (e.g. DELETE /api/v1/admin/products/:id)
  if (res.status === 204) {
    return { status: 204, data: undefined as unknown as T };
  }

  payload = await readJson<unknown>(res);
  if (!res.ok) {
    throw errFrom(res, payload);
  }
  return { status: res.status, data: payload as T };
}

// Convenience: clear local auth state and tell the caller nothing is logged in.
export async function logoutAndClear(): Promise<void> {
  const rt = await tokens.getRefresh();
  if (rt) {
    try {
      await apiRequest("/api/auth/logout", {
        method: "POST",
        body: { refreshToken: rt } as { refreshToken: string },
        skipAuth: "skip-refresh",
      });
    } catch {
      // Best-effort — we still clear local state regardless of remote result.
    }
  }
  await tokens.clear();
}

// Re-export storage keys so consumers don't have to know the underlying
// names; tests / utilities can clear without touching config.ts directly.
export const TOKEN_KEYS = {
  access: TOKEN_KEY_ACCESS,
  refresh: TOKEN_KEY_REFRESH,
} as const;
