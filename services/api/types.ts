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
