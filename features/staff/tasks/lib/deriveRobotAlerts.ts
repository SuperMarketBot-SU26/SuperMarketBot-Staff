/**
 * `deriveRobotAlerts` — turn the live robot list into a Task-shaped union
 * suitable for the Cảnh Báo screen's "Robot" tab.
 *
 * Rules:
 *   - "active" with battery ≥ 20% → not a task (everything's fine)
 *   - "error" or battery < 20% → "urgent" (pin yếu / lỗi)
 *   - "charging" without errors  → "high"
 *   - "standby" with no telemetry → "high" (Mất kết nối)
 *   - "standby" with telemetry   → "high" (Chờ quá lâu)
 *
 * Anything that returns null is filtered out by the caller.
 */
import type { NormalizedRobot, StaffTask } from "@/shared/api";
import { formatRelativeTime } from "@/shared/lib";

export type Priority = "urgent" | "high" | "normal";
export type Category = "hangHoa" | "robot";

/**
 * Robot-derived alert. Carries the underlying robot so the "Đến robot"
 * button can deep-link to /staff/robot-detail.
 */
export interface RobotTask {
  id: number;
  category: "robot";
  priority: Priority;
  issueType: string;
  title: string;
  detail: string;
  location: string;
  time: string;
  acknowledged: boolean;
  robot: NormalizedRobot;
}

export function deriveRobotTask(r: NormalizedRobot): RobotTask | null {
  if (r.status === "active" && r.batteryPct >= 20) return null;

  const priority: Priority =
    r.status === "error" || r.batteryPct < 20 ? "urgent" : "high";

  const issueType =
    r.status === "error"
      ? r.batteryPct < 15
        ? "Pin yếu"
        : "Lỗi"
      : r.status === "charging"
        ? "Đang sạc"
        : !r.lastSeenAt
          ? "Mất kết nối"
          : "Chờ quá lâu";

  return {
    id: r.robotId,
    category: "robot",
    priority,
    issueType,
    title: r.robotCode,
    detail:
      r.status === "error"
        ? `Pin ${r.batteryPct}% — cần kiểm tra.`
        : r.status === "charging"
          ? `Robot đang ở trạm sạc — pin ${r.batteryPct}%.`
          : !r.lastSeenAt
            ? "Chưa có dữ liệu telemetry trong hệ thống."
            : "Robot đang chờ nhưng chưa được giao nhiệm vụ.",
    location: r.position
      ? `(${r.position.x.toFixed(0)}, ${r.position.y.toFixed(0)})`
      : "Chưa có tọa độ",
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