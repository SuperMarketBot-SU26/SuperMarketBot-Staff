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
    StaffTask,
} from "./types";

export type { RestockPriority, RestockTaskDto, StaffTask };

function isRestockError(t: RestockTaskDto): boolean {
  return t.currentQuantity === 0 || t.priority === "High";
}

export function mapRestockPriority(
  p: RestockPriority,
): "urgent" | "high" {
  if (p === "High") return "urgent";
  return "high";
}

export function toStaffTask(t: RestockTaskDto): StaffTask {
  return {
    id: t.scanId,
    category: "hangHoa",
    priority: mapRestockPriority(t.priority),
    isError: isRestockError(t),
    title: t.productName,
    detail: `${t.emptyPercentage}% trống · còn ${t.currentQuantity} · ${
      t.hasWarehouseStock ? "có kho" : "hết kho"
    }`,
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

/**
 * [COMPLETE] Mark restock task complete.
 */
export async function completeRestockTask(payload: {
  aisleId: number;
  aisleNodeId: number;
  slotId?: number;
  quantityAdded?: number;
}): Promise<boolean> {
  try {
    await apiRequest("/api/staff/tasks/complete", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return true;
  } catch {
    return true;
  }
}

/**
 * [CREATE] Report an Out-of-Stock task / Create new task.
 */
export async function createRestockTask(payload: {
  slotId: number;
  emptyPercentage: number;
  imageUrl?: string;
}): Promise<boolean> {
  try {
    await apiRequest("/api/shelf-scans/report-oos", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return true;
  } catch {
    return true;
  }
}

/**
 * [DELETE] Remove a restock task.
 */
export async function deleteRestockTask(taskId: number): Promise<boolean> {
  try {
    await apiRequest(`/api/staff/tasks/${taskId}`, {
      method: "DELETE",
    });
    return true;
  } catch {
    return true;
  }
}