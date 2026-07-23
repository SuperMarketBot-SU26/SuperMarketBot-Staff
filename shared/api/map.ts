/**
 * Map API — floorplan metadata for the Staff App's bản đồ screen.
 *
 * BE endpoints used:
 *   GET /api/v1/maps/latest?floorId={floorId}     → MapFloorplanDto (bản đồ mới nhất)
 *   GET /api/v1/maps/{mapId}                      → MapFloorplanDto (bản đồ theo ID)
 *   POST /api/Navigation/optimize-shopping-route  → Route optimization
 *
 * Response structure (from BE):
 * {
 *   "mapId": 1,
 *   "floorId": 1,
 *   "mapName": "Supermarket_3x3m_InAisle",
 *   "widthMeters": 3.0,
 *   "heightMeters": 3.0,
 *   "floorplanImageUrl": null,
 *   "nodes": [...],
 *   "edges": [...],
 *   "semanticObjects": []
 * }
 */
import { apiRequest } from "./client";
import type { MapFloorplanDto } from "./types";

export type { MapFloorplanDto } from "./types";

// Default floor ID (can be overridden via env var EXPO_PUBLIC_DEFAULT_FLOOR_ID)
const DEFAULT_FLOOR_ID = 1;

/**
 * Lấy bản đồ mới nhất cho floor mặc định.
 */
export async function getLatestMap(): Promise<MapFloorplanDto | null> {
  return getLatestMapByFloor(DEFAULT_FLOOR_ID);
}

/**
 * Lấy bản đồ mới nhất cho floor cụ thể.
 */
export async function getLatestMapByFloor(floorId: number): Promise<MapFloorplanDto | null> {
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
 * Lấy bản đồ theo ID cụ thể.
 */
export async function getMapById(mapId: number): Promise<MapFloorplanDto | null> {
  try {
    const { data } = await apiRequest<MapFloorplanDto>(`/api/v1/maps/${mapId}`);
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
 * Request body cho route optimization.
 */
export interface OptimizeRouteRequest {
  robotCode: string;
  targetNodeIds: number[];
}

/**
 * Response từ route optimization.
 */
export interface OptimizeRouteResponse {
  optimalRoute: number[]; // Array of node IDs in order
  totalDistance: number;
  estimatedTime: number; // seconds
}

/**
 * Tối ưu hóa lộ trình di chuyển của Robot.
 */
export async function optimizeRoute(
  request: OptimizeRouteRequest
): Promise<OptimizeRouteResponse> {
  const { data } = await apiRequest<OptimizeRouteResponse>(
    "/api/Navigation/optimize-shopping-route",
    {
      method: "POST",
      body: request,
    }
  );
  return data;
}
