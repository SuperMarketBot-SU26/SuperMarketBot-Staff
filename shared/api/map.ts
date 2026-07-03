/**
 * Map API — floorplan metadata for the Staff App's bản đồ screen.
 *
 * BE endpoints used:
 *   GET /api/v1/maps/latest?floorId=N   → MapFloorplanDto
 *   GET /api/v1/maps/stats?floorId=N    → MapSyncStatsDto
 *
 * The "latest floorplan" payload is everything the Staff App needs to
 * draw the store: floorplan image, every registered NavigationNode,
 * every NavigationEdge, and every SemanticObject rectangle. The robot
 * pins live on top of it and come from a different endpoint
 * (`api/robots` + `api/robots/{code}/pose` — see `robots.ts`).
 */
import { apiRequest } from "./client";
import type { MapFloorplanDto, MapSyncStatsDto } from "./types";

export type { MapFloorplanDto, MapSyncStatsDto } from "./types";

/**
 * Fetch the most-recently-synced floorplan for `floorId`.
 *
 * Returns `null` when the BE has nothing for that floor yet (404) — the
 * UI treats that as "empty map" rather than an error, so the user can
 * still pan around the placeholder canvas.
 */
export async function getLatestMap(
  floorId: number,
): Promise<MapFloorplanDto | null> {
  try {
    const { data } = await apiRequest<MapFloorplanDto>("/api/v1/maps/latest", {
      query: { floorId },
    });
    return data;
  } catch (err) {
    if (err && typeof err === "object" && "status" in err) {
      const e = err as { status?: number };
      if (e.status === 404) return null;
    }
    throw err;
  }
}

/**
 * Fetch lightweight counts + last-synced timestamp for the given floor.
 * Cheap call used by the "Đồng bộ X phút trước" badge.
 */
export async function getMapStats(floorId: number): Promise<MapSyncStatsDto> {
  const { data } = await apiRequest<MapSyncStatsDto>("/api/v1/maps/stats", {
    query: { floorId },
  });
  return data;
}