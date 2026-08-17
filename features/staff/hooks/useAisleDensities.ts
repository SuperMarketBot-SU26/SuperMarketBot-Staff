import { useCallback, useEffect, useState } from "react";
import { getAisleDensities, type AisleDensityDto } from "@/shared/api";
import { useApiErrorMessage } from "@/shared/hooks";

export interface AisleDensitiesState {
  densities: AisleDensityDto[] | null;
  error: string | null;
  refreshing: boolean;
  reload: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function useAisleDensities(zoneId?: number): AisleDensitiesState {
  const [densities, setDensities] = useState<AisleDensityDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const message = useApiErrorMessage();

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await getAisleDensities(zoneId ? { zoneId } : undefined);
      setDensities(data);
    } catch (e) {
      setError(message(e));
    }
  }, [zoneId, message]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return { densities, error, refreshing, reload: load, onRefresh };
}
