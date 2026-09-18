/**
 * Staff tasks — Restock Out-of-Stock Handler with Full CRUD support.
 *
 * BE endpoints:
 *   GET    /api/staff/tasks                 → RestockTaskListResponseDto
 *   POST   /api/staff/tasks/complete        → CompleteRestockRequestDto
 *   POST   /api/shelf-scans/report-oos      → Create Out-of-Stock Task
 *   DELETE /api/staff/tasks/{id}            → Delete Task
 */
import { apiRequest } from "./client";
import type {
    RestockPriority,
    RestockTaskDto,
    RestockTaskListResponseDto,
    StaffProfileDto,
    StaffTask,
} from "./types";

export type { RestockPriority, RestockTaskDto, StaffProfileDto, StaffTask };

function isRestockError(t: RestockTaskDto): boolean {
  return t.currentQuantity === 0 || t.priority === "High";
}

export function mapRestockPriority(
  p: RestockPriority,
): "urgent" | "high" {
  if (p === "High") return "urgent";
  return "high";
}

export function cleanShelfLocation(loc?: string): string {
  if (!loc) return "";
  return loc
    .replace(/\s*[-·]\s*Tầng\s*\d+/gi, "")
    .replace(/\s*Tầng\s*\d+/gi, "")
    .trim();
}

export function toStaffTask(t: RestockTaskDto): StaffTask {
  const density = Math.max(0, Math.min(100, Math.round(100 - t.emptyPercentage)));
  return {
    id: t.scanId,
    category: "hangHoa",
    priority: mapRestockPriority(t.priority),
    isError: isRestockError(t),
    title: t.productName,
    detail: `Mật độ kệ: ${density}% · Cần bổ sung: ${t.emptyPercentage}%`,
    location: cleanShelfLocation(t.shelfLocation),
    reportedAt: t.reportedAt,
    acknowledged: false,
    restock: t,
    densityPercentage: density,
  };
}

export async function listRestockTasks(): Promise<StaffTask[]> {
  const { data } = await apiRequest<RestockTaskListResponseDto>(
    "/api/staff/tasks",
  );
  return data.tasks.map(toStaffTask);
}

/**
 * [COMPLETE] Mark restock task complete.
 */
export async function completeRestockTask(payload: {
  scanId?: number;
  shelfId?: number;
  aisleId: number;
  aisleNodeId?: number;
  slotId?: number;
  quantityAdded?: number;
}): Promise<boolean> {
  await apiRequest("/api/staff/tasks/complete", {
    method: "POST",
    body: payload,
  });
  return true;
}

/**
 * [CREATE] Report an Out-of-Stock task / Create new task.
 */
export async function createRestockTask(payload: {
  slotId: number;
  emptyPercentage: number;
  imageUrl?: string;
}): Promise<boolean> {
  await apiRequest("/api/shelf-scans/report-oos", {
    method: "POST",
    body: payload,
  });
  return true;
}

/**
 * [DELETE] Remove a restock task.
 */
export async function deleteRestockTask(taskId: number): Promise<boolean> {
  await apiRequest(`/api/staff/tasks/${taskId}`, {
    method: "DELETE",
  });
  return true;
}

/**
 * [PROFILE] Fetch staff profile and work status.
 */
export async function getStaffProfile(accountId?: number): Promise<StaffProfileDto> {
  const query = accountId ? `?accountId=${accountId}` : "";
  const { data } = await apiRequest<StaffProfileDto>(`/api/staff/profile${query}`);
  return data;
}

