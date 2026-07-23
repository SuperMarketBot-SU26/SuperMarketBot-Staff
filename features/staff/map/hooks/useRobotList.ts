/**
 * `useRobotList` — provides hardcoded robot list with live poses matching the
 * store navigation layout. Works 100% offline without backend dependency.
 */
import { useCallback, useState } from "react";
import type { NormalizedRobot } from "@/shared/api";

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
      x: 0.48,
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
      y: 0.85,
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
      x: 2.45,
      y: 1.3,
      headingDeg: 180,
      at: new Date().toISOString(),
    },
  },
];

export function useRobotList(): RobotListState {
  const [robots, setRobots] = useState<NormalizedRobot[] | null>(MOCK_ROBOTS);
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(async () => {
    setRobots([...MOCK_ROBOTS]);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setRobots([...MOCK_ROBOTS]);
    setRefreshing(false);
  }, []);

  return { robots, error: null, refreshing, reload, onRefresh };
}
