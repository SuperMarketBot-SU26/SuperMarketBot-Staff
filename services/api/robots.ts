/**
 * Robot API — list robots, fetch a single robot's pose.
 *
 * BE endpoints used:
 *   GET   /api/robots                       → RobotDto[]
 *   GET   /api/robots/{robotCode}/pose      → RobotPoseDto
 *   GET   /api/robots/status-values         → string[]
 *
 * The UI-facing shape `NormalizedRobot` (see types.ts) is intentionally
 * flatter and stable across BE schema changes. Screens import only this.
 */
import { apiRequest } from "./http";
import type {
  NormalizedRobot,
  RobotDto,
  RobotPoseDto,
  RobotStatus,
} from "./types";

// Re-export so screens can `import type { NormalizedRobot } from "@/services/api/robots"`.
export type { NormalizedRobot, RobotStatus } from "./types";

/**
 * Translate BE's several status strings into the four-state UI enum.
 * Keep this conservative — when in doubt, prefer "standby".
 */
function normalizeStatus(robot: RobotDto): RobotStatus {
  const presence = robot.lastSeenAt ? "Online" : "Offline";
  const runtime = robot.status;
  const mode = robot.mode;

  // Battery-based error. Keep this as the first check so a charging robot
  // with low battery still shows up as "error".
  if (robot.batteryPct < 15) return "error";

  if (runtime === "Offline_Charging" || mode === "charging") return "charging";
  if (
    runtime === "Moving" ||
    runtime === "Interacting" ||
    mode === "navigating" ||
    mode === "scanning"
  )
    return "active";
  if (runtime === "Idle" || mode === "idle" || mode === "returning")
    return "standby";
  if (runtime === "Power_Off" || presence === "Offline") return "standby";

  // Unknown / future BE value — don't show as error, just standby.
  return "standby";
}

function toNormalized(robot: RobotDto): NormalizedRobot {
  return {
    robotId: robot.robotId,
    robotCode: robot.robotCode,
    robotName: robot.robotName,
    status: normalizeStatus(robot),
    batteryPct: robot.batteryPct,
    mode: robot.mode,
    lastSeenAt: robot.lastSeenAt,
    position: null,
  };
}

/** Lightweight list. Position is null until you call `getRobot`. */
export async function listRobots(): Promise<NormalizedRobot[]> {
  const { data } = await apiRequest<RobotDto[]>("/api/robots");
  return data.map(toNormalized);
}

/**
 * Fetch a single robot's current pose and merge it into a NormalizedRobot.
 * Returns `null` if the BE has no pose recorded yet (new robot, no telemetry).
 */
export async function getRobotPose(
  robotCode: string,
): Promise<RobotPoseDto | null> {
  try {
    const { data } = await apiRequest<RobotPoseDto>(
      `/api/robots/${encodeURIComponent(robotCode)}/pose`,
    );
    return data;
  } catch (err) {
    // 404 → no telemetry yet. Anything else bubbles up.
    if (err && typeof err === "object" && "status" in err) {
      const e = err as { status?: number };
      if (e.status === 404 || e.status === 204) return null;
    }
    throw err;
  }
}

/**
 * Fetch a single robot by code — calls list + pose. The list response
 * carries the live battery/mode/status; the pose call adds the (x, y)
 * tail if available. Returns null if the robot is not in the roster.
 */
export async function getRobot(robotCode: string): Promise<NormalizedRobot | null> {
  const all = await listRobots();
  const base = all.find((r) => r.robotCode === robotCode);
  if (!base) return null;
  const pose = await getRobotPose(robotCode);
  if (!pose) return base;
  return {
    ...base,
    position: {
      x: pose.x,
      y: pose.y,
      headingDeg: pose.headingDeg,
      at: pose.timestampUtc ?? new Date().toISOString(),
    },
  };
}

/** Fetches list + pose for every robot in parallel. Used by the fleet screen. */
export async function listRobotsWithPositions(): Promise<NormalizedRobot[]> {
  const robots = await listRobots();
  const poses = await Promise.all(robots.map((r) => getRobotPose(r.robotCode).catch(() => null)));
  return robots.map((r, i) => {
    const p = poses[i];
    if (!p) return r;
    return {
      ...r,
      position: {
        x: p.x,
        y: p.y,
        headingDeg: p.headingDeg,
        at: p.timestampUtc ?? new Date().toISOString(),
      },
    };
  });
}
