/**
 * `shared/api` — HTTP client, auth helpers, token storage, BE DTOs.
 *
 * Public surface (what features import):
 *   - client:    apiRequest, ApiError, logoutAndClear
 *   - tokens:    getTokens, save, clear (used by auth context)
 *   - auth.ts:   login, refresh, logout
 *   - robots.ts: listRobots, listRobotsWithPositions, getRobot, ...
 *   - tasks.ts:  listRestockTasks
 *   - types.ts:  AuthResponseDto, NormalizedRobot, RobotStatus, ...
 *
 * Token storage lives in `shared/api/tokens.ts` because it's the single
 * place that knows about SecureStore keys. The auth feature re-exports
 * just the login/logout helpers and the context — it doesn't expose
 * token storage to the rest of the app.
 */

export { ApiError, TOKEN_KEYS, apiRequest, logoutAndClear } from "./client";
export type { ApiResponse } from "./client";

export * from "./tokens";

export * from "./types";

export {
    getRobot,
    getRobotPose, listRobots,
    listRobotsWithPositions
} from "./robots";

export { listRestockTasks, mapRestockPriority } from "./tasks";

export { getLatestMap, getMapStats } from "./map";

export * as AuthApi from "./auth";
export { API_BASE_URL } from "./config";
