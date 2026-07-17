/**
 * `useRobotList` — fetches the fleet roster (with per-robot positions) and
 * exposes loading / error / refresh state.
 *
 * Returns:
 *   - `robots`     — `NormalizedRobot[]` once loaded, `null` while loading,
 *                    or `[]` after a failed load.
 *   - `error`      — user-facing Vietnamese message, or `null`.
 *   - `refreshing` — true while a user-initiated pull-to-refresh is in flight.
 *   - `reload`     — manual trigger.
 *   - `onRefresh`  — for `<RefreshControl onRefresh={...} />`.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getRobotPose,
  listRobots,
  type NormalizedRobot,
  type RobotPoseDto,
} from "@/shared/api";
import { useApiErrorMessage } from "@/shared/hooks";

export interface RobotListState {
  robots: NormalizedRobot[] | null;
  error: string | null;
  refreshing: boolean;
  reload: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

const DEFAULT_POLL_MS = 5000;

export function useRobotList(
  options: { pollMs?: number } = {},
): RobotListState {
  const pollMs = options.pollMs ?? DEFAULT_POLL_MS;
  const [robots, setRobots] = useState<NormalizedRobot[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const message = useApiErrorMessage();
  const robotsRef = useRef<NormalizedRobot[] | null>(null);
  robotsRef.current = robots;

  const load = useCallback(async () => {
    try {
      setError(null);
      const list = await listRobots();
      const poses = await Promise.all(
        list.map((r) => getRobotPose(r.robotCode).catch(() => null)),
      );
      const merged = list.map((r, i) => mergePose(r, poses[i]));
      setRobots(merged);
    } catch (e) {
      setError(message(e));
      setRobots((prev) => prev ?? []);
    }
  }, [message]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await listRobots();
        if (cancelled) return;
        const poses = await Promise.all(
          list.map((r) => getRobotPose(r.robotCode).catch(() => null)),
        );
        if (cancelled) return;
        const merged = list.map((r, i) => mergePose(r, poses[i]));
        setRobots(merged);
      } catch (e) {
        if (cancelled) return;
        setError(message(e));
        setRobots([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [message]);

  // Live pose polling — re-fetches only the poses.
  useEffect(() => {
    if (pollMs <= 0) return undefined;
    const id = setInterval(async () => {
      const current = robotsRef.current;
      if (!current || current.length === 0) return;
      const poses = await Promise.all(
        current.map((r) => getRobotPose(r.robotCode).catch(() => null)),
      );
      setRobots((prev) => {
        if (!prev) return prev;
        return prev.map((r, i) => mergePose(r, poses[i]));
      });
    }, pollMs);
    return () => clearInterval(id);
  }, [pollMs]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return { robots, error, refreshing, reload: load, onRefresh };
}

function mergePose(
  robot: NormalizedRobot,
  pose: RobotPoseDto | null,
): NormalizedRobot {
  if (!pose) return robot;
  return {
    ...robot,
    position: {
      x: pose.x,
      y: pose.y,
      headingDeg: pose.headingDeg,
      at: pose.timestampUtc ?? new Date().toISOString(),
    },
  };
}
