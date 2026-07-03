/**
 * Map coordinate helpers + constants shared between FleetMapScreen and
 * RobotNavScreen.
 *
 * The map's *natural* canvas. When the SVG background is added, render
 * it at MAP_WIDTH × MAP_HEIGHT dp (BackgroundLayer) or use Svg
 * viewBox="0 0 MAP_WIDTH MAP_HEIGHT" + preserveAspectRatio so robot
 * pin positions map 1:1 to SVG coordinates.
 *
 * The BE's pose payload returns map-units in `position.{x,y}`. We treat
 * those as the same coordinate system as the canvas for now. When the BE
 * seeds a real MAP row with width/height, replace these with values
 * pulled from the BE (or expose them on a useFleetMapData hook).
 */
import type { NormalizedRobot } from "@/shared/api";

export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 700;

/** Project a robot's map-unit position onto the canvas, clamped to bounds. */
export function project(pos: NormalizedRobot["position"]): {
  left: number;
  top: number;
} {
  if (!pos) return { left: MAP_WIDTH / 2, top: MAP_HEIGHT / 2 };
  return {
    left: Math.min(MAP_WIDTH, Math.max(0, pos.x)),
    top: Math.min(MAP_HEIGHT, Math.max(0, pos.y)),
  };
}

/** Project (x, y) map-units to a percentage of the rendered canvas. */
export function projectPct(
  x: number,
  y: number,
): { leftPct: number; topPct: number } {
  return {
    leftPct: Math.min(100, Math.max(0, (x / MAP_WIDTH) * 100)),
    topPct: Math.min(100, Math.max(0, (y / MAP_HEIGHT) * 100)),
  };
}

/** Short subtitle for a robot on the bottom-sheet row. */
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