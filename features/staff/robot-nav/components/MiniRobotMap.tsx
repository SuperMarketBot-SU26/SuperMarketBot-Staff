/**
 * MiniRobotMap — store map rendering used on the robot-navigation screen.
 * Shows the store floorplan with target robot pinned in real-time.
 */
import { StyleSheet, Text, View } from "react-native";
import { DEVICE, palette, useIsDark } from "@/shared/theme";
import { MapCanvas } from "@/features/staff/map/components/MapCanvas";
import { makeProjection } from "@/features/staff/map/lib/map";
import type { NormalizedRobot } from "@/shared/api";

interface MiniRobotMapProps {
  x: number;
  y: number;
  statusColor: string;
  robotId: string;
}

export function MiniRobotMap({ x, y, statusColor, robotId }: MiniRobotMapProps) {
  const isDark = useIsDark();
  const projection = makeProjection(null, 360, 240);

  // Single target robot to render on mini map
  const targetRobot: NormalizedRobot = {
    robotId: 99,
    robotCode: robotId,
    robotName: robotId,
    status: "active",
    mode: "navigating",
    batteryPct: 90,
    lastSeenAt: new Date().toISOString(),
    position: {
      x,
      y,
      headingDeg: 0,
      at: new Date().toISOString(),
    },
  };

  return (
    <View
      style={[
        styles.mapContainer,
        {
          backgroundColor: isDark ? "#090d16" : "#f8fafc",
          borderColor: isDark ? palette.gray[700] : palette.gray[200],
        },
      ]}
    >
      {/* Top Header Badge */}
      <View style={[styles.badgeWrap, { backgroundColor: isDark ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.8)" }]}>
        <View style={[styles.dot, { backgroundColor: statusColor }]} />
        <Text style={[styles.mapLabel, { color: isDark ? "#fff" : palette.gray[900] }]}>
          ĐÃ ĐỊNH VỊ — {robotId}
        </Text>
      </View>

      <MapCanvas
        robots={[targetRobot]}
        projection={projection}
        highlightedCode={robotId}
        showLabels={true}
        showDimensions={true}
        width="100%"
        height="100%"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 240,
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  badgeWrap: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mapLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});