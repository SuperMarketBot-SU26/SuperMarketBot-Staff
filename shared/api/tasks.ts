/**
 * Staff tasks — Flow 4 (Out-of-Stock Handler).
 *
 * BE endpoint: GET /api/staff/tasks → RestockTaskListResponseDto
 *
 * The BE DTO is the single source of truth — see `shared/api/types.ts`.
 * We expose the raw `RestockTaskDto` plus a normalized UI shape
 * (`StaffTask`) that the screen consumes. Normalization here is limited
 * to:
 *   - mapping the BE's 3-tier priority string (High / Medium / Low)
 *     onto the 2-tier color rule the Cảnh Báo UI uses (urgent / not).
 *   - carrying the raw DTO through on the `restock` field so the
 *     per-row screens can read whatever the BE returns without losing
 *     data.
 *
 * No description / detail text is generated on the client. Anything that
 * shows up in the UI must come from the API.
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
 * A restock task is an "error" (red) when the slot is fully empty
 * (currentQuantity === 0) OR the BE marked it High priority.
 * Everything else stays orange.
 */
function isRestockError(t: RestockTaskDto): boolean {
  return t.currentQuantity === 0 || t.priority === "High";
}

/**
 * Map the BE's 3-tier priority string onto the 2-tier priority the UI
 * uses to pick a color: urgent (red, "error") or normal (orange,
 * "not-error"). The `medium` and `low` rows render the same.
 */
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
    /** True when the slot is empty or the BE marks the row High. Drives
     * the red-vs-orange accent on the row; the field is computed, not a
     * human-readable description. */
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