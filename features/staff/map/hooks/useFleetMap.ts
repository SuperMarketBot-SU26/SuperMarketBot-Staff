/**
 * `useFleetMap` — hardcoded map (no backend).
 * Always returns null floorplan.
 */
import { useCallback, useState } from "react";
import type { MapFloorplanDto } from "@/shared/api";

export interface FleetMapState {
  floorplan: MapFloorplanDto | null;
  error: string | null;
  refreshing: boolean;
  reload: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function useFleetMap(): FleetMapState {
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(async () => {
    // No-op: hardcoded map
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  return {
    floorplan: null, // hardcoded, no backend
    error: null,
    refreshing,
    reload,
    onRefresh,
  };
}
