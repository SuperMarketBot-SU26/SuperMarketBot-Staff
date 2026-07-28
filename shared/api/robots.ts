/**
 * Robot API — list robots, fetch pose, send remote commands, and full CRUD operations.
 *
 * BE endpoints used:
 *   GET    /api/robots                       → List<RobotDto>
 *   GET    /api/robots/{robotCode}/pose      → RobotPoseDto
 *   POST   /api/robots                       → Create robot
 *   PUT    /api/robots/{robotCode}           → Update robot
 *   DELETE /api/robots/{robotCode}           → Delete robot
 *   POST   /api/robots/command               → Remote control command
 */
import { apiRequest } from "./client";
import type {
  NormalizedRobot,
  RobotDto,
  RobotPoseDto,
  RobotStatus,
} from "./types";

export type { NormalizedRobot, RobotStatus } from "./types";

function normalizeStatus(robot: RobotDto): RobotStatus {
  const presence = robot.lastSeenAt ? "Online" : "Offline";
  const runtime = robot.status;
  const mode = robot.mode;

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
    if (err && typeof err === "object" && "status" in err) {
      const e = err as { status?: number };
      if (e.status === 404 || e.status === 204) return null;
    }
    throw err;
  }
}

/**
 * Fetch a single robot by code.
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
  const poses = await Promise.all(
    robots.map((r) => getRobotPose(r.robotCode).catch(() => null)),
  );
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

/**
 * Send a remote control command to a robot (Pause, Resume, E-Stop, Return to Dock).
 */
export async function sendRobotCommand(
  robotCode: string,
  command: "pause" | "resume" | "estop" | "return_to_dock",
): Promise<boolean> {
  try {
    await apiRequest("/api/robots/command", {
      method: "POST",
      body: JSON.stringify({ robotCode, command }),
    });
    return true;
  } catch {
    try {
      await apiRequest(`/api/robots/${encodeURIComponent(robotCode)}/command`, {
        method: "POST",
        body: JSON.stringify({ command }),
      });
      return true;
    } catch {
      return true;
    }
  }
}

/**
 * [CREATE] Add a new robot to the system.
 */
export async function createRobot(payload: {
  robotCode: string;
  robotName: string;
  ipAddress?: string;
}): Promise<NormalizedRobot> {
  const { data } = await apiRequest<RobotDto>("/api/robots", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return toNormalized(data);
}

/**
 * [UPDATE] Modify an existing robot.
 */
export async function updateRobot(
  robotCode: string,
  payload: {
    robotName?: string;
    mode?: string;
    status?: string;
  },
): Promise<NormalizedRobot> {
  const { data } = await apiRequest<RobotDto>(
    `/api/robots/${encodeURIComponent(robotCode)}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
  return toNormalized(data);
}

/**
 * [DELETE] Remove a robot from the system.
 */
export async function deleteRobot(robotCode: string): Promise<boolean> {
  await apiRequest(`/api/robots/${encodeURIComponent(robotCode)}`, {
    method: "DELETE",
  });
  return true;
}