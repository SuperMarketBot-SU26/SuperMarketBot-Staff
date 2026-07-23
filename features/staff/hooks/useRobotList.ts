/**
 * `useRobotList` — provides hardcoded robot list with live poses matching the
 * store navigation layout. Works 100% offline without backend dependency.
 */
import { useCallback, useState } from "react";
import type { NormalizedRobot } from "@/shared/api";
import { MOCK_ROBOTS } from "../map/hooks/useRobotList";

export interface RobotListState {
  robots: NormalizedRobot[] | null;
  error: string | null;
  refreshing: boolean;
  reload: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

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