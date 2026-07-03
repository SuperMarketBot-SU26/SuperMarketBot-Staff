/**
 * Translate any thrown error from the API layer into a Vietnamese user-facing
 * string. Shared between fleet, robots and robot-detail so the 401/500/network
 * wording stays consistent.
 */
import { useCallback } from "react";
import { ApiError } from "@/shared/api";

export function apiErrorMessage(
  e: unknown,
  fallback = "Không thể kết nối máy chủ.",
): string {
  if (e instanceof ApiError) {
    if (e.status === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    return e.message;
  }
  return fallback;
}

/**
 * Convenience: returns a stable callback that produces the localized message.
 * Useful as a `useCallback` target so screens can pass it directly to handlers
 * without re-creating it on every render.
 */
export function useApiErrorMessage(fallback?: string): (e: unknown) => string {
  return useCallback(
    (e: unknown) => apiErrorMessage(e, fallback),
    [fallback],
  );
}