/**
 * `useRobotList` — fetches the fleet roster (with per-robot positions) and
 * exposes the loading / error / refresh state that the list screens share.
 *
 * Unifies the previously-duplicated `useEffect` + `load` + `RefreshControl`
 * wiring in `app/staff/fleet.tsx` and `app/staff/robots.tsx`.
 *
 * Returns:
 *   - `robots`     — `NormalizedRobot[]` once loaded, `null` while loading,
 *                    or `[]` after a failed load (so the list can render the
 *                    empty state instead of a permanent spinner).
 *   - `error`      — user-facing Vietnamese message, or `null`.
 *   - `refreshing` — true while a user-initiated pull-to-refresh is in flight.
 *   - `reload`     — manual trigger (e.g. "Thử lại" button).
 *   - `onRefresh`  — for `<RefreshControl onRefresh={...} />`.
 */
import { useCallback, useEffect, useState } from "react";
import { listRobotsWithPositions, type NormalizedRobot } from "@/services/api/robots";
import { useApiErrorMessage } from "./useApiErrorMessage";

export interface RobotListState {
  robots: NormalizedRobot[] | null;
  error: string | null;
  refreshing: boolean;
  reload: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function useRobotList(): RobotListState {
  const [robots, setRobots] = useState<NormalizedRobot[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const message = useApiErrorMessage();

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await listRobotsWithPositions();
      setRobots(data);
    } catch (e) {
      setError(message(e));
      // Preserve a previously-rendered list if the refresh fails — only
      // collapse to empty on the very first load.
      setRobots((prev) => prev ?? []);
    }
  }, [message]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listRobotsWithPositions();
        if (!cancelled) setRobots(data);
      } catch (e) {
        if (cancelled) return;
        setError(message(e));
        setRobots([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [message]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return { robots, error, refreshing, reload: load, onRefresh };
}