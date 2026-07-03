/**
 * useRobot — single-robot fetch with loading / error / refresh.
 *
 * Reads `?code=XXX` from the URL and calls `GET /api/robots/{code}/pose`
 * (via `getRobot`, which also fetches the roster for battery/mode/status).
 */
import { useCallback, useEffect, useState } from "react";
import { ApiError, getRobot, type NormalizedRobot } from "@/shared/api";
import { apiErrorMessage } from "@/shared/hooks";

export interface UseRobotResult {
  robot: NormalizedRobot | null | undefined;
  error: string | null;
  refreshing: boolean;
  reload: () => Promise<void>;
}

export function useRobot(code: string | undefined): UseRobotResult {
  const [robot, setRobot] = useState<NormalizedRobot | null | undefined>(
    undefined,
  );
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (codeStr: string) => {
      setError(null);
      try {
        const data = await getRobot(codeStr);
        setRobot(data);
      } catch (e) {
        // Map ApiError.401 to a localized message; fall through to default.
        if (e instanceof ApiError && e.status === 401) {
          setError("Phiên đăng nhập đã hết hạn.");
        } else {
          setError(apiErrorMessage(e));
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (code) load(code);
    else setRobot(null);
  }, [code, load]);

  const reload = useCallback(async () => {
    if (!code) return;
    setRefreshing(true);
    await load(code);
    setRefreshing(false);
  }, [code, load]);

  return { robot, error, refreshing, reload };
}