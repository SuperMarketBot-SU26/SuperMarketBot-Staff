import { apiRequest } from "./client";
import type { AisleDensityDto, ShelfDensityDto } from "./types";

export type { ShelfDensityDto, AisleDensityDto };

/**
 * Fetch the latest density per aisle.
 */
export async function getAisleDensities(params?: { zoneId?: number }): Promise<AisleDensityDto[]> {
  const qs = params?.zoneId != null ? `?zoneId=${params.zoneId}` : "";
  try {
    const { data } = await apiRequest<AisleDensityDto[]>(`/api/v1/aisles/density${qs}`);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

/**
 * Fetch the latest density for all 6 shelves in the supermarket (ArUco Tag #1..#6).
 */
export async function getShelfDensities(): Promise<ShelfDensityDto[]> {
  try {
    const { data } = await apiRequest<ShelfDensityDto[]>("/api/shelf-scans/shelves/density");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    try {
      const { data } = await apiRequest<ShelfDensityDto[]>("/api/staff/shelves/density");
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }
}
