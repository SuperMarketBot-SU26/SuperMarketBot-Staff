/**
 * useRestockTask — placeholder hook for the restock-location screen.
 *
 * Today it just returns the values already passed via navigation params,
 * but we keep the hook boundary so the screen doesn't have to change
 * when the real load-by-id BE endpoint lands. That keeps the eventual
 * swap to a real fetch a one-line change here.
 */
import { useLocalSearchParams } from "expo-router";
import type { StaffTask } from "@/shared/api";

export interface UseRestockTaskResult {
  task: StaffTask | null;
}

export function useRestockTask(): UseRestockTaskResult {
  const params = useLocalSearchParams();
  // Currently we navigate via individual query params, so we cannot fully
  // reconstruct the StaffTask here without a fetch. The screen reads the
  // params directly for now; this hook stays empty intentionally.
  void params;
  return { task: null };
}
