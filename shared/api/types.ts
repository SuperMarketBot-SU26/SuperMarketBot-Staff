/**
 * API types — single source of truth for all backend DTOs the staff app talks to.
 * Keep these field-for-field aligned with the .NET DTOs in
 * SuperMarketBot-BE/src/SmartMarketBot.Application/Models/.
 *
 * Only types the staff app actually consumes live here. Anything not used
 * by the UI should be added only when needed, to keep the surface small.
 */

// ─── Common ────────────────────────────────────────────────────────────────
export type StaffRole = "Staff" | "Admin";

// BE ROBOT.Status column + UpdateRobotStatusRequestDto enum:
//   mode (DB Mode):    "idle" | "navigating" | "scanning" | "charging" | "returning"
//   runtime status:    "Power_Off" | "Idle" | "Moving" | "Interacting" | "Offline_Charging"
//   presence (DB):     "Online" | "Offline"
// We normalize all of these on the client to a single `status` field of
// RobotStatus (the UI-facing enum) in api/robots.ts.
export type BackendRobotMode =
  | "idle"
  | "navigating"
  | "scanning"
  | "charging"
  | "returning";

export type BackendRobotRuntimeStatus =
  | "Power_Off"
  | "Idle"
  | "Moving"
  | "Interacting"
  | "Offline_Charging";

export type BackendRobotPresence = "Online" | "Offline" | string;

export interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

// ─── Auth ──────────────────────────────────────────────────────────────────
export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string; // ISO 8601
  userId: number;
  email: string;
  fullName: string | null;
  roles: StaffRole[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

// ─── Robots ────────────────────────────────────────────────────────────────
export interface RobotDto {
  robotId: number;
  robotName: string;
  robotCode: string;
  batteryPct: number;
  mode: BackendRobotMode;
  status: BackendRobotRuntimeStatus;
  lastSeenAt: string | null;
  ipAddress: string | null;
}

export interface RobotPoseDto {
  robotCode: string;
  x: number;
  y: number;
  headingRad: number;
  headingDeg: number;
  timestampUtc: string | null;
}

// UI-normalized robot the screens consume. Built from `RobotDto` (+ optionally
// a `RobotPoseDto`) inside `api/robots.ts#normalizeRobot`. Screens and
// components only ever see this shape, never the raw BE DTOs.
export type RobotStatus = "active" | "standby" | "error" | "charging";

export interface NormalizedRobot {
  robotId: number;
  robotCode: string;
  robotName: string;
  status: RobotStatus;
  batteryPct: number;
  mode: BackendRobotMode;
  lastSeenAt: string | null;
  /** Last known (x, y) in map-units — may be null if the robot hasn't reported. */
  position: { x: number; y: number; headingDeg: number; at: string } | null;
}

// ─── Tasks (Out-of-Stock Handler) ──────────────────────────────────────────
export type RestockPriority = "High" | "Medium" | "Low";

export interface RestockTaskDto {
  scanId: number;
  slotId: number;
  slotCode: string;
  shelfLocation: string;
  productId: number;
  productName: string;
  productImageUrl: string | null;
  currentQuantity: number;
  emptyPercentage: number;
  reportedAt: string;
  priority: RestockPriority;
  hasWarehouseStock: boolean;
}

export interface RestockTaskListResponseDto {
  totalPending: number;
  tasks: RestockTaskDto[];
}

/**
 * UI-normalized task shape consumed by the Cảnh Báo screen.
 * The screen merges restock tasks (`StaffTask`) and robot-derived alerts
 * into a single `Task` union (see `features/staff/tasks/lib/deriveRobotAlerts.ts`).
 *
 * `priority` is the BE's own priority bucket normalised onto the 2-tier
 * colour rule the Cảnh Báo uses (urgent = red / not-urgent = orange).
 * `isError` is the *direct* boolean the row uses to pick its accent, so
 * the colour logic stays one read away from the underlying data.
 */
export interface StaffTask {
  id: number;
  category: "hangHoa";
  priority: "urgent" | "high";
  /** True when this row is in the "error" colour bucket (red). */
  isError: boolean;
  title: string;
  /** Composed-from-API-fields subtitle (empty%, has-warehouse-stock). */
  detail: string;
  location: string;
  /** ISO 8601 — rendered with `formatRelativeTime` in the screen. */
  reportedAt: string;
  acknowledged: boolean;
  /** Underlying restock payload — needed by the "Đã xử lý" action. */
  restock: RestockTaskDto;
}

// ─── Map / Floorplan ───────────────────────────────────────────────────────
// Mirrors `MapFloorplanDto` from
//   BE: SuperMarketBot-BE/src/SmartMarketBot.Application/Models/Maps/MapSyncDtos.cs
// returned by `GET /api/v1/maps/latest?floorId=N`.
// Only the fields the Staff app renders are typed; add more when needed.

export interface MapNodeDto {
  nodeId: number | null;
  nodeName: string;
  /** Map-unit x — same units as the FE's MAP_WIDTH in `features/staff/fleet/lib/map.ts`. */
  xCoord: number;
  /** Map-unit y — same units as the FE's MAP_HEIGHT. */
  yCoord: number;
  /** "intersection" | "aisle" | "shelf" | … */
  nodeType: string;
  isBlocked: boolean;
}

export interface MapEdgeDto {
  edgeId: number | null;
  fromNodeId: number;
  toNodeId: number;
  distance: number;
  isBidirectional: boolean;
}

export interface MapSemanticObjectDto {
  objectId: number | null;
  /** "shelf" | "zone" | "aisle" | … */
  objectType: string;
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
  label: string | null;
  confidence: number | null;
  detectedAt: string | null;
  imageUrl: string | null;
}

export interface MapFloorplanDto {
  mapId: number;
  floorId: number;
  mapName: string;
  /** ISO 8601. */
  createdAt: string;
  /** Absolute or app-relative URL for the floorplan background image. */
  floorplanImageUrl: string | null;
  /** Floor width in meters (BE-supplied; used as a fallback before the image's
   * natural size is loaded). Matches FE's `widthMeters` in `FleetMap.jsx`. */
  widthMeters: number;
  /** Floor height in meters (BE-supplied; used as a fallback). */
  heightMeters: number;
  nodes: MapNodeDto[];
  edges: MapEdgeDto[];
  semanticObjects: MapSemanticObjectDto[];
}

export interface MapSyncStatsDto {
  totalNodes: number;
  totalEdges: number;
  totalSemanticObjects: number;
  lastSyncedAt: string | null;
  mapId: number | null;
}