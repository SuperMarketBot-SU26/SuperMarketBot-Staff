/**
 * useRobotNav — single-robot fetch with extra "last pinged at" tracking
 * that the robot-navigation screen uses to render the "Cập nhật 09:42"
 * label under the mini-map.
 *
 * Identical to `useRobot` from robot-detail but exposes a timestamp.
 */
import { useCallback, useEffect, useState } from "react";
import { ApiError, getRobot, type NormalizedRobot } from "@/shared/api";
import { apiErrorMessage } from "@/shared/hooks";

export interface UseRobotNavResult {
  robot: NormalizedRobot | null | undefined;
  error: string | null;
  pinging: boolean;
  pingedAt: string; // HH:MM or "—"
  reload: () => Promise<void>;
}

export function useRobotNav(code: string | undefined): UseRobotNavResult {
  const [robot, setRobot] = useState<NormalizedRobot | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [pinging, setPinging] = useState(false);
  const [pingedAt, setPingedAt] = useState<string>("vừa xong");

  const load = useCallback(async () => {
    if (!code) return;
    setPinging(true);
    setError(null);
    try {
      const data = await getRobot(code);
      setRobot(data);
      const now = new Date();
      setPingedAt(
        `${now.getHours().toString().padStart(2, "0")}:${now
          .getMinutes()
          .toString()
          .padStart(2, "0")}`,
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : apiErrorMessage(e));
      setRobot(null);
    } finally {
      setPinging(false);
    }
  }, [code]);

  useEffect(() => {
    load();
  }, [load]);

  return { robot, error, pinging, pingedAt, reload: load };
}