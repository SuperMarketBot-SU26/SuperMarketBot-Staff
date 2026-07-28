/**
 * `useRobotList` — Real API hook for fetching live robot roster & positions from Backend.
 *
 * Calls BE endpoint: GET /api/robots + GET /api/robots/{code}/pose
 * Fallback to MOCK_ROBOTS when offline / backend not running.
 */
import { useCallback, useEffect, useState } from "react";
import { listRobotsWithPositions, type NormalizedRobot } from "@/shared/api";
import { useApiErrorMessage } from "@/shared/hooks";

export interface RobotListState {
  robots: NormalizedRobot[] | null;
  error: string | null;
  refreshing: boolean;
  reload: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const MOCK_ROBOTS: NormalizedRobot[] = [
  {
    robotId: 1,
    robotCode: "SMB-01",
    robotName: "SuperMarketBot 01",
    status: "active",
    mode: "navigating",
    batteryPct: 88,
    lastSeenAt: new Date().toISOString(),
    position: {
      x: 0.5,
      y: 1.3,
      headingDeg: 0,
      at: new Date().toISOString(),
    },
  },
  {
    robotId: 2,
    robotCode: "SMB-02",
    robotName: "SuperMarketBot 02",
    status: "active",
    mode: "scanning",
    batteryPct: 92,
    lastSeenAt: new Date().toISOString(),
    position: {
      x: 1.5,
      y: 0.8,
      headingDeg: 90,
      at: new Date().toISOString(),
    },
  },
  {
    robotId: 3,
    robotCode: "SMB-03",
    robotName: "SuperMarketBot 03",
    status: "charging",
    mode: "charging",
    batteryPct: 100,
    lastSeenAt: new Date().toISOString(),
    position: {
      x: 2.8,
      y: 2.0,
      headingDeg: 270,
      at: new Date().toISOString(),
    },
  },
  {
    robotId: 4,
    robotCode: "SMB-04",
    robotName: "SuperMarketBot 04",
    status: "standby",
    mode: "idle",
    batteryPct: 65,
    lastSeenAt: new Date().toISOString(),
    position: {
      x: 2.5,
      y: 1.3,
      headingDeg: 180,
      at: new Date().toISOString(),
    },
  },
];

export function useRobotList(): RobotListState {
  const [robots, setRobots] = useState<NormalizedRobot[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const message = useApiErrorMessage();

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await listRobotsWithPositions();
      if (data && data.length > 0) {
        setRobots(data);
      } else {
        // Fallback to mock roster if backend database has 0 robots
        setRobots(MOCK_ROBOTS);
      }
    } catch (e) {
      // If network/backend error, fallback to offline mock roster with error message
      setRobots(MOCK_ROBOTS);
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

  return { robots, error, refreshing, reload: load, onRefresh };
}