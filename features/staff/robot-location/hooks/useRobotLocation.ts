/**
 * useRobotLocation — placeholder hook for the robot-location screen.
 *
 * Reads the robot code passed via navigation params; today we don't fetch
 * live telemetry here because the user asked for a no-API iteration. The
 * real ping hook (likely a refactored `useRobotNav` that targets a single
 * record by id) will slot in here without touching the screen.
 */
import { useLocalSearchParams } from "expo-router";

export interface UseRobotLocationResult {
  /** Robot code from the URL (e.g. "SMB-01"). */
  robotCode: string;
}

export function useRobotLocation(): UseRobotLocationResult {
  const params = useLocalSearchParams<{ code?: string; id?: string }>();
  // Same dual-key fallback as RobotNavScreen — keeps existing deep-links
  // working while we settle on `code`.
  const robotCode = (params.code ?? params.id ?? "") as string;
  return { robotCode };
}