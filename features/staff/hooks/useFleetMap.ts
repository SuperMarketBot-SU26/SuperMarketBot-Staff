/**
 * `useFleetMap` — fetches the latest floorplan (nodes + edges + semantic objects)
 * and exposes loading / error / refresh state.
 *
 * Shape contract:
 *   - `floorplan` — MapFloorplanDto | null while loading, or null after failure.
 *   - `error`     — user-facing Vietnamese message, or null.
 *   - `refreshing` — true while a user-initiated reload is in flight.
 *   - `reload`     — manual trigger.
 *   - `onRefresh`  — for `<RefreshControl onRefresh={...} />`.
 *
 * Uses: GET /api/v1/maps/latest (no query params needed)
 */
import { useCallback, useEffect, useState } from "react";
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

export function useFleetMap(): FleetMapState {
  const [floorplan, setFloorplan] = useState<MapFloorplanDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const message = useApiErrorMessage();

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await getLatestMap();
      setFloorplan(data);
    } catch (e) {
      setError(message(e));
      setFloorplan((prev) => prev ?? null);
    }
  }, [message]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getLatestMap();
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
  }, [message]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return { floorplan, error, refreshing, reload: load, onRefresh };
}
