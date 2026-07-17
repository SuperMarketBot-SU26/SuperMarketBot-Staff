/**
 * `features/staff/map` — legacy compatibility shim.
 *
 * The old `fleet/lib/map.ts` exported `MAP_WIDTH`, `MAP_HEIGHT`,
 * `projectPct`, `InlineBanner`, and `FleetRobotListItem`. This re-exports
 * the equivalent values from the new map module so that other features
 * (`restock-location`, `robot-nav`, `robots`) keep working without changes.
 *
 * These constants define a simplified 1000 × 700 coordinate space used by
 * the mini-map components (RestockPingMap, MiniRobotMap). They are NOT
 * used by the full-screen Skia canvas, which uses real meter units from
 * the floorplan API.
 */
export {
  STATUS_HEX,
  MIN_ZOOM,
  MAX_ZOOM,
  PX_PER_METER,
  DEFAULT_WIDTH_METERS,
  DEFAULT_HEIGHT_METERS,
  makeProjection,
  runtimeStatusFor,
  statusHexFor,
  describeRobot,
  describeRobot as describeRobotFromFleet,
} from "./lib/map";
export type { MapProjection } from "./lib/map";

/** Simplified coordinate space constants (legacy mini-map only). */
export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 700;

/** Project (x, y) in the legacy simplified space to a 0–100 percentage. */
export function projectPct(
  x: number,
  y: number,
): { leftPct: number; topPct: number } {
  return {
    leftPct: Math.min(100, Math.max(0, (x / MAP_WIDTH) * 100)),
    topPct: Math.min(100, Math.max(0, (y / MAP_HEIGHT) * 100)),
  };
}
