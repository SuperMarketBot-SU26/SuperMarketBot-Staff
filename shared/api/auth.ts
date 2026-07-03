/**
 * Authentication API — login, refresh, logout.
 *
 * The BE (`AuthController`) endpoints:
 *   POST /api/auth/login     { email, password }                       → AuthResponseDto
 *   POST /api/auth/refresh   { refreshToken }                          → AuthResponseDto
 *   POST /api/auth/logout    { refreshToken } (auth)                    → 200
 *
 * Token storage is handled by `./tokens`. This module is stateless — it
 * just calls the BE and tells the caller "here's the auth payload" /
 * "you're logged out".
 */
import { apiRequest, logoutAndClear as clearOnLogout } from "./client";
import * as tokens from "./tokens";
import type {
  AuthResponseDto,
  LoginRequest,
  RefreshRequest,
} from "./types";

export * from "./types";

/** Login with email + password. Tokens are saved automatically. */
export async function login(input: LoginRequest): Promise<AuthResponseDto> {
  const { data } = await apiRequest<AuthResponseDto>("/api/auth/login", {
    method: "POST",
    body: input,
    skipAuth: true,
  });
  await tokens.save({
    access: data.accessToken,
    refresh: data.refreshToken,
    expiresAt: data.accessTokenExpiresAt,
  });
  return data;
}

/**
 * Refresh the access token using the stored refresh token.
 * Returns `null` if there is no refresh token or the BE rejects it.
 */
export async function refresh(): Promise<AuthResponseDto | null> {
  const rt = await tokens.getRefresh();
  if (!rt) return null;
  const req: RefreshRequest = { refreshToken: rt };
  try {
    const { data } = await apiRequest<AuthResponseDto>("/api/auth/refresh", {
      method: "POST",
      body: req,
      skipAuth: true,
    });
    await tokens.save({
      access: data.accessToken,
      refresh: data.refreshToken,
      expiresAt: data.accessTokenExpiresAt,
    });
    return data;
  } catch {
    await tokens.clear();
    return null;
  }
}

/**
 * Logout — tells the BE to revoke the refresh token, then clears local
 * state. Errors are swallowed because the local clear must succeed even
 * if the BE call fails (e.g. offline).
 */
export async function logout(): Promise<void> {
  await clearOnLogout();
}

/** True if there are any cached tokens locally. */
export async function hasStoredSession(): Promise<boolean> {
  const t = await tokens.getTokens();
  return !!t;
}