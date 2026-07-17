/**
 * Map coordinate helpers + constants shared across the map feature.
 *
 * Mirrors the projection system used by the BE/Web FE:
 *   - When a floorplan image is present, the canvas dimensions equal the
 *     image's natural pixel size; widthMeters/heightMeters are derived
 *     from `naturalSize / PX_PER_METER`.
 *   - When no image is available, the canvas is sized from the BE's
 *     `widthMeters` / `heightMeters` at `PX_PER_METER`.
 *
 * Coordinate system: world units are meters (origin = top-left of the
 * floorplan, matching the DB convention).
 */
import type {
  BackendRobotRuntimeStatus,
  MapFloorplanDto,
  NormalizedRobot,
} from "@/shared/api";

/* ─── Scale constants ──────────────────────────────────────────────── */

export const PX_PER_METER = 64;
export const DEFAULT_WIDTH_METERS = 20;
export const DEFAULT_HEIGHT_METERS = 15;

/* ─── Zoom limits ─────────────────────────────────────────────────── */

export const MIN_ZOOM = 0.3;
export const MAX_ZOOM = 4;

/* ─── Robot marker sizing ─────────────────────────────────────────── */

export const ROBOT_LOGO_HALF = 12;
export const ROBOT_ARROW_OFFSET = 22;
export const ROBOT_ARROW_HALF_W = 5;
export const ROBOT_ARROW_HALF_H = 7;
export const ROBOT_RING_R = 18;

/* ─── Status palette (matches Web FE) ────────────────────────────── */

export const STATUS_HEX: Record<BackendRobotRuntimeStatus | "Unknown", string> = {
  Power_Off: "#79747e",
  Idle: "#4a4458",
  Moving: "#22c55e",
  Interacting: "#7d5260",
  Offline_Charging: "#cac4d0",
  Unknown: "#cac4d0",
};

/* ─── Projection ─────────────────────────────────────────────────── */

export interface MapProjection {
  widthPx: number;
  heightPx: number;
  widthMeters: number;
  heightMeters: number;
  pxPerMeter: number;
}

export function makeProjection(
  floorplan: MapFloorplanDto | null,
  imageSize: { naturalWidth: number; naturalHeight: number } | null,
): MapProjection {
  const fallbackMeters = {
    w: floorplan?.widthMeters ?? DEFAULT_WIDTH_METERS,
    h: floorplan?.heightMeters ?? DEFAULT_HEIGHT_METERS,
  };

  if (imageSize && imageSize.naturalWidth > 0 && imageSize.naturalHeight > 0) {
    const widthMeters = imageSize.naturalWidth / PX_PER_METER;
    const heightMeters = imageSize.naturalHeight / PX_PER_METER;
    return {
      widthPx: imageSize.naturalWidth,
      heightPx: imageSize.naturalHeight,
      widthMeters,
      heightMeters,
      pxPerMeter: PX_PER_METER,
    };
  }

  return {
    widthPx: fallbackMeters.w * PX_PER_METER,
    heightPx: fallbackMeters.h * PX_PER_METER,
    widthMeters: fallbackMeters.w,
    heightMeters: fallbackMeters.h,
    pxPerMeter: PX_PER_METER,
  };
}

/* ─── Coordinate projection ──────────────────────────────────────── */

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/**
 * Project a robot's meter-space position to canvas pixel coordinates.
 * Falls back to canvas centre if the robot has no recorded position.
 */
export function projectRobot(
  pos: NormalizedRobot["position"],
  projection: MapProjection,
): { x: number; y: number } {
  if (!pos) {
    return { x: projection.widthPx / 2, y: projection.heightPx / 2 };
  }
  return {
    x: clamp(pos.x * projection.pxPerMeter, 0, projection.widthPx),
    y: clamp(pos.y * projection.pxPerMeter, 0, projection.heightPx),
  };
}

/* ─── Status helpers ──────────────────────────────────────────────── */

export function runtimeStatusFor(r: NormalizedRobot): BackendRobotRuntimeStatus {
  switch (r.status) {
    case "active":
      return r.mode === "scanning" || r.mode === "navigating" ? "Moving" : "Moving";
    case "standby":
      return r.mode === "charging" ? "Offline_Charging" : "Idle";
    case "charging":
      return "Offline_Charging";
    case "error":
      return "Power_Off";
  }
}

export function statusHexFor(r: NormalizedRobot): string {
  return STATUS_HEX[runtimeStatusFor(r)] ?? STATUS_HEX.Unknown;
}

export function describeRobot(r: NormalizedRobot): string {
  switch (r.status) {
    case "active":
      return r.mode === "scanning"
        ? "Đang kiểm kê"
        : r.mode === "navigating"
          ? "Đang dẫn đường"
          : "Đang hoạt động";
    case "standby":
      return "Chờ nhiệm vụ";
    case "charging":
      return "Đang sạc";
    case "error":
      return r.batteryPct < 15 ? "Pin yếu — cần sạc" : "Đang báo lỗi";
  }
}
