/**
 * `useFleetMap` — fetches the floorplan (image + nodes + edges +
 * semantic objects) for the default floor and exposes loading / error /
 * refresh state shaped the same way as `useRobotList`.
 *
 * Shape contract (matches `RobotListState` in useRobotList.ts):
 *   - `floorplan` — MapFloorplanDto | null while loading, or `null`
 *     after a failed load (so the map layer can show the placeholder).
 *   - `error`     — user-facing Vietnamese message, or null.
 *   - `refreshing` — true while a user-initiated reload is in flight.
 *   - `reload`     — manual trigger (e.g. "Thử lại" button).
 *   - `onRefresh`  — for `<RefreshControl onRefresh={...} />`.
 */
import { useCallback, useEffect, useState } from "react";
import { DEFAULT_FLOOR_ID } from "@/shared/config/floor";
import { getLatestMap } from "@/shared/api";
import type { MapFloorplanDto } from "@/shared/api";
import { useApiErrorMessage } from "@/shared/hooks";

export interface FleetMapState {
  floorplan: MapFloorplanDto | null;
  error: string | null;
  refreshing: boolean;
  reload: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function useFleetMap(floorId: number = DEFAULT_FLOOR_ID): FleetMapState {
  const [floorplan, setFloorplan] = useState<MapFloorplanDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const message = useApiErrorMessage();

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await getLatestMap(floorId);
      setFloorplan(data);
    } catch (e) {
      setError(message(e));
      // Preserve a previously-rendered map if the refresh fails.
      setFloorplan((prev) => prev ?? null);
    }
  }, [floorId, message]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getLatestMap(floorId);
        if (!cancelled) setFloorplan(data);
      } catch (e) {
        if (cancelled) return;
        setError(message(e));
        setFloorplan(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [floorId, message]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return { floorplan, error, refreshing, reload: load, onRefresh };
}