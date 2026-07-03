/**
 * `useStaffTasks` — fetches the staff's pending restock tasks.
 *
 * Same shape contract as `useRobotList`: returns a tuple of state + reload
 * helpers. We don't auto-refresh on a timer — the staff screen has its own
 * pull-to-refresh, and the BE doesn't currently emit task changes over a
 * push channel.
 */
import { listRestockTasks, type StaffTask } from "@/shared/api";
import { useApiErrorMessage } from "@/shared/hooks";
import { useCallback, useEffect, useState } from "react";

export interface StaffTaskState {
  tasks: StaffTask[];
  error: string | null;
  refreshing: boolean;
  reload: () => Promise<void>;
  onRefresh: () => Promise<void>;
  acknowledge: (id: number) => void;
}

export function useStaffTasks(): StaffTaskState {
  const [tasks, setTasks] = useState<StaffTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const message = useApiErrorMessage();

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await listRestockTasks();
      setTasks(data);
    } catch (e) {
      setError(message(e));
    }
  }, [message]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listRestockTasks();
        if (!cancelled) setTasks(data);
      } catch (e) {
        if (cancelled) return;
        setError(message(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [message]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const acknowledge = useCallback((id: number) => {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, acknowledged: true } : t)));
  }, []);

  return { tasks, error, refreshing, reload: load, onRefresh, acknowledge };
}