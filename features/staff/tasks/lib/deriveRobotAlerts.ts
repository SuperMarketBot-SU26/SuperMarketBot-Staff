/**
 * `deriveRobotAlerts` — turn the live robot list into a Task-shaped union
 * suitable for the Cảnh Báo screen's "Robot" tab.
 *
 * Rules (all driven by API fields; no fixed Vietnamese strings):
 *   - "active" with battery ≥ 20%  → filtered out (nothing to alert on)
 *   - everything else              → a task with `priority` and `isError`
 *
 * The "error" bucket (red) is: status === "error" OR batteryPct < 20.
 * Everything else is the orange "watch" bucket.
 *
 * Anything that returns null is filtered out by the caller.
 */
import type { NormalizedRobot, StaffTask } from "@/shared/api";
import { formatRelativeTime } from "@/shared/lib";

export type Priority = "urgent" | "high";
export type Category = "hangHoa" | "robot";

/**
 * Robot-derived alert. Carries the underlying robot so the "Đến robot"
 * button can deep-link to /staff/robot-location.
 */
export interface RobotTask {
  id: number;
  category: "robot";
  priority: Priority;
  /** True when this row is in the "error" colour bucket (red). */
  isError: boolean;
  title: string;
  /** Composed-from-API-fields subtitle (battery / status / mode). */
  detail: string;
  location: string;
  time: string;
  acknowledged: boolean;
  robot: NormalizedRobot;
}

export function deriveRobotTask(r: NormalizedRobot): RobotTask | null {
  if (r.status === "active" && r.batteryPct >= 20) return null;

  const isError = r.status === "error" || r.batteryPct < 20;
  const priority: Priority = isError ? "urgent" : "high";

  return {
    id: r.robotId,
    category: "robot",
    priority,
    isError,
    title: r.robotCode,
    detail: `${r.batteryPct}% · ${r.status} · ${r.mode}`,
    location: r.position
      ? `(${r.position.x.toFixed(0)}, ${r.position.y.toFixed(0)})`
      : "—",
    time: r.lastSeenAt ? formatRelativeTime(r.lastSeenAt) : "—",
    acknowledged: false,
    robot: r,
  };
}

/** Unified Task union consumed by the screen + TaskCard. */
export type Task =
  | (Omit<StaffTask, "category"> & { category: "hangHoa"; time: string })
  | RobotTask;

/**
 * Drop-acknowledged helper used by the screen filter UI.
 * Robot alerts are derived live, so they're never marked acknowledged yet.
 */
export function isTaskPending(t: Task): boolean {
  if (t.category === "robot") return true;
  return !t.acknowledged;
}

/** Map a staff (restock) task into the unified shape. */
export function restockToTask(t: StaffTask): Task {
  return {
    ...t,
    category: "hangHoa",
    time: formatRelativeTime(t.reportedAt),
  };
}