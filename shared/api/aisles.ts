import { apiRequest } from "./client";
import type { AisleDensityDto } from "./types";

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
