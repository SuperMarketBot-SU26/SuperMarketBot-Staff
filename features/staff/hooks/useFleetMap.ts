/**
 * `useFleetMap` — Real API hook for floorplan metadata from Backend (GET /api/v1/maps/latest).
 */
import { useCallback, useEffect, useState } from "react";
import { getLatestMap, type MapFloorplanDto } from "@/shared/api";
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
    }
  }, [message]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return {
    floorplan,
    error,
    refreshing,
    reload: load,
    onRefresh,
  };
}
