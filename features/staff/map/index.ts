export { default as FleetScreen } from "./FleetScreen";
export { default as MapScreen } from "./MapScreen";

export { MapPlaceholder } from "./components/MapPlaceholder";

export { useFleetMap } from "./hooks/useFleetMap";
export type { FleetMapState } from "./hooks/useFleetMap";
export { useRobotList } from "./hooks/useRobotList";
export type { RobotListState } from "./hooks/useRobotList";

export {
  MIN_ZOOM,
  MAX_ZOOM,
  PX_PER_METER,
  DEFAULT_WIDTH_METERS,
  DEFAULT_HEIGHT_METERS,
  ROBOT_RING_R,
  ROBOT_LOGO_HALF,
  ROBOT_ARROW_OFFSET,
  ROBOT_ARROW_HALF_W,
  ROBOT_ARROW_HALF_H,
  STATUS_HEX,
  makeProjection,
  projectRobot,
  statusHexFor,
  runtimeStatusFor,
  describeRobot,
} from "./lib/map";
export type { MapProjection } from "./lib/map";
