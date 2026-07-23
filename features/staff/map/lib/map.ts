/**
 * Map coordinate helpers + constants shared across the map feature.
 *
 * Coordinate system: viewBox="0 0 3 3" (Meters)
 * - Origin (0,0) is TOP-LEFT
 * - x: 0 → 3 (left → right)
 * - y: 0 → 3 (top → bottom)
 */
import type {
  BackendRobotRuntimeStatus,
  MapFloorplanDto,
  NormalizedRobot,
} from "@/shared/api";

export const DEFAULT_WIDTH_METERS = 3;
export const DEFAULT_HEIGHT_METERS = 3;
export const PX_PER_METER = 200;

export const MIN_ZOOM = 0.3;
export const MAX_ZOOM = 4;

export const ROBOT_LOGO_HALF = 14;
export const ROBOT_LOGO_SIZE = ROBOT_LOGO_HALF * 2;
export const ROBOT_ARROW_OFFSET = 26;
export const ROBOT_ARROW_HALF_W = 6;
export const ROBOT_ARROW_HALF_H = 8;
export const ROBOT_RING_R = 22;

/* Status palette */
export const STATUS_HEX: Record<BackendRobotRuntimeStatus | "Unknown", string> = {
  Power_Off: "#ef4444",
  Idle: "#ca8a04",
  Moving: "#22c55e",
  Interacting: "#3b82f6",
  Offline_Charging: "#a855f7",
  Unknown: "#94a3b8",
};

export interface MapProjection {
  widthPx: number;
  heightPx: number;
  widthMeters: number;
  heightMeters: number;
  pxPerMeter: number;
}

export function makeProjection(
  floorplan: MapFloorplanDto | null,
  viewportWidth: number,
  viewportHeight: number,
): MapProjection {
  const mapWidthMeters = floorplan?.widthMeters ?? DEFAULT_WIDTH_METERS;
  const mapHeightMeters = floorplan?.heightMeters ?? DEFAULT_HEIGHT_METERS;

  const padding = 20;
  const availableWidth = Math.max(viewportWidth - padding * 2, 100);
  const availableHeight = Math.max(viewportHeight - padding * 2, 100);

  const scaleX = availableWidth / mapWidthMeters;
  const scaleY = availableHeight / mapHeightMeters;
  const pxPerMeter = Math.min(scaleX, scaleY, 300);

  const widthPx = mapWidthMeters * pxPerMeter;
  const heightPx = mapHeightMeters * pxPerMeter;

  return {
    widthPx,
    heightPx,
    widthMeters: mapWidthMeters,
    heightMeters: mapHeightMeters,
    pxPerMeter,
  };
}

export function projectRobot(
  pos: NormalizedRobot["position"],
  projection: MapProjection,
): { x: number; y: number } {
  if (!pos) {
    return {
      x: projection.widthMeters / 2,
      y: projection.heightMeters / 2,
    };
  }
  return {
    x: pos.x,
    y: pos.y,
  };
}

export function runtimeStatusFor(r: NormalizedRobot): BackendRobotRuntimeStatus {
  switch (r.status) {
    case "active":
      return "Moving";
    case "standby":
      return r.mode === "charging" ? "Offline_Charging" : "Idle";
    case "charging":
      return "Offline_Charging";
    case "error":
      return "Power_Off";
    default:
      return "Idle";
  }
}

export function statusHexFor(r: NormalizedRobot): string {
  return STATUS_HEX[runtimeStatusFor(r)] ?? STATUS_HEX.Unknown;
}

export function describeRobot(r: NormalizedRobot): string {
  switch (r.status) {
    case "active":
      return "Đang di chuyển / kê hàng";
    case "standby":
      return "Chờ nhiệm vụ";
    case "charging":
      return "Đang sạc pin tại Dock";
    case "error":
      return r.batteryPct < 15 ? "Pin yếu — Cần sạc" : "Báo lỗi sự cố";
    default:
      return "Đang hoạt động";
  }
}
