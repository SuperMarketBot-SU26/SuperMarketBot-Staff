/**
 * `useRobotList` — Real API hook for fetching live robot roster & poses from Backend.
 * Calls BE: GET /api/robots + GET /api/robots/{code}/pose.
 * Single physical robot in store: RB0001 (SmartMarketBot 01).
 */
import { useCallback, useEffect, useState } from "react";
import { listRobotsWithPositions, type NormalizedRobot } from "@/shared/api";

export interface RobotListState {
  robots: NormalizedRobot[] | null;
  error: string | null;
  refreshing: boolean;
  reload: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const SINGLE_ROBOT_FALLBACK: NormalizedRobot[] = [
  {
    robotId: 1,
    robotCode: "RB0001",
    robotName: "SmartMarketBot 01",
    status: "active",
    mode: "idle",
    batteryPct: 100,
    lastSeenAt: new Date().toISOString(),
    position: {
      x: 0.6,
      y: 2.2,
      headingDeg: 90,
      at: new Date().toISOString(),
    },
  },
];

export function useRobotList(): RobotListState {
  const [robots, setRobots] = useState<NormalizedRobot[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await listRobotsWithPositions();
      if (data && data.length > 0) {
        setRobots(data);
      } else {
        setRobots(SINGLE_ROBOT_FALLBACK);
      }
    } catch (e: any) {
      setRobots(SINGLE_ROBOT_FALLBACK);
      setError(e?.message ?? "Không thể kết nối đến robot");
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return { robots, error, refreshing, reload: load, onRefresh };
}
