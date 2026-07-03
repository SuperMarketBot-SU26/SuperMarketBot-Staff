/**
 * Staff tasks — Flow 4 (Out-of-Stock Handler).
 *
 * BE endpoint: GET /api/staff/tasks → RestockTaskListResponseDto
 *
 * We expose the raw `RestockTaskDto` plus a normalized UI shape
 * (`StaffTask`) that the screen consumes. The normalization lives here,
 * not in the screen, so the same shape is reusable when other task kinds
 * land (e.g. robot alerts — see `features/staff/tasks/lib/deriveRobotAlerts.ts`).
 */
import { apiRequest } from "./client";
import type {
  RestockPriority,
  RestockTaskDto,
  RestockTaskListResponseDto,
  StaffTask,
} from "./types";

export type { RestockPriority, RestockTaskDto, StaffTask };

/**
 * Normalize a BE priority string onto the three UI priorities the screens
 * already understand (urgent / high / normal). 'High' restock → urgent so
 * it pops visually (the BE enum is more granular than what we need).
 */
export function mapRestockPriority(
  p: RestockPriority,
): "urgent" | "high" | "normal" {
  if (p === "High") return "urgent";
  if (p === "Medium") return "high";
  return "normal";
}

/** Vietnamese label for the restock issue type. */
function describeRestockIssue(t: RestockTaskDto): string {
  if (t.currentQuantity === 0) return "Hết kệ";
  if (t.emptyPercentage >= 80) return "Sắp hết";
  return "Tồn thấp";
}

export function toStaffTask(t: RestockTaskDto): StaffTask {
  return {
    id: t.scanId,
    category: "hangHoa",
    priority: mapRestockPriority(t.priority),
    issueType: describeRestockIssue(t),
    title: t.productName,
    detail: t.hasWarehouseStock
      ? `Kho còn hàng — cần bổ sung ${t.emptyPercentage}% trống.`
      : `Kệ trống ${t.emptyPercentage}% — kho hiện không còn.`,
    location: t.shelfLocation,
    reportedAt: t.reportedAt,
    acknowledged: false,
    restock: t,
  };
}

export async function listRestockTasks(): Promise<StaffTask[]> {
  const { data } = await apiRequest<RestockTaskListResponseDto>(
    "/api/staff/tasks",
  );
  return data.tasks.map(toStaffTask);
}