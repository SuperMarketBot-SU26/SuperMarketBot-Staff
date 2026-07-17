/**
 * `useFleetMap` — fetches the floorplan (image + nodes + edges + semantic
 * objects) for the default floor and exposes loading / error / refresh state.
 *
 * Shape contract (matches `RobotListState`):
 *   - `floorplan` — MapFloorplanDto | null while loading, null after failure.
 *   - `error`     — user-facing Vietnamese message, or null.
 *   - `refreshing` — true while a user-initiated reload is in flight.
 *   - `reload`     — manual trigger.
 *   - `onRefresh`  — for `<RefreshControl onRefresh={...} />`.
 *   - `stale`      — true when `/api/v1/maps/latest` and `/api/v1/maps/stats`
 *                    disagree on the most-recent sync time. The BE has a
 *                    known bug where `latest` returns a stale row instead of
 *                    the newest one; we cross-check with `stats.lastSyncedAt`
 *                    so staff can see something is wrong instead of silently
 *                    drawing the wrong map. Becomes false once the BE is fixed.
 */
import { useCallback, useEffect, useState } from "react";
import { DEFAULT_FLOOR_ID } from "@/shared/config/floor";
import { getLatestMap, getMapStats } from "@/shared/api";
import type { MapFloorplanDto } from "@/shared/api";
import { useApiErrorMessage } from "@/shared/hooks";

export interface FleetMapState {
  floorplan: MapFloorplanDto | null;
  error: string | null;
  refreshing: boolean;
  stale: boolean;
  reload: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

/** A floorplan returned by `latest` counts as "stale" if it predates
 *  the most-recent sync reported by `stats` by more than this many ms.
 *  Anything smaller than ~5 s is treated as a benign clock skew. */
const STALE_THRESHOLD_MS = 5_000;

export function useFleetMap(floorId: number = DEFAULT_FLOOR_ID): FleetMapState {
  const [floorplan, setFloorplan] = useState<MapFloorplanDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stale, setStale] = useState(false);
  const message = useApiErrorMessage();

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await getLatestMap(floorId);
      setFloorplan(data);
      // Cross-check with /maps/stats: if it reports a newer sync than the
      // row we just received, flag the result as stale so the screen can
      // surface a warning. We swallow the stats error — a missing stats
      // endpoint should never block rendering the latest map.
      try {
        const stats = await getMapStats(floorId);
        const mapTime = data?.createdAt ? Date.parse(data.createdAt) : 0;
        const statsTime = stats?.lastSyncedAt ? Date.parse(stats.lastSyncedAt) : 0;
        setStale(
          Number.isFinite(mapTime) &&
            Number.isFinite(statsTime) &&
            statsTime - mapTime > STALE_THRESHOLD_MS,
        );
      } catch {
        setStale(false);
      }
    } catch (e) {
      setError(message(e));
      setFloorplan((prev) => prev ?? null);
      setStale(false);
    }
  }, [floorId, message]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getLatestMap(floorId);
        if (!cancelled) setFloorplan(data);
        try {
          const stats = await getMapStats(floorId);
          if (cancelled) return;
          const mapTime = data?.createdAt ? Date.parse(data.createdAt) : 0;
          const statsTime = stats?.lastSyncedAt ? Date.parse(stats.lastSyncedAt) : 0;
          setStale(
            Number.isFinite(mapTime) &&
              Number.isFinite(statsTime) &&
              statsTime - mapTime > STALE_THRESHOLD_MS,
          );
        } catch {
          if (!cancelled) setStale(false);
        }
      } catch (e) {
        if (cancelled) return;
        setError(message(e));
        setFloorplan(null);
        setStale(false);
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

  return { floorplan, error, refreshing, stale, reload: load, onRefresh };
}
