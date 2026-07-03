/**
 * MiniRobotMap — small "store map" rendering used on the robot-navigation
 * screen. Shows a soft grid, four placeholder aisles, and the target
 * robot's pulsing pin at the projected map-units position.
 *
 * Uses the same MAP_WIDTH/MAP_HEIGHT constants as the fullscreen map
 * (see `features/staff/fleet/lib/map.ts`).
 */
import { StyleSheet, Text, View } from "react-native";
import { DEVICE, palette, useIsDark } from "@/shared/theme";
import { MapPinIcon } from "@/shared/ui";
import { projectPct } from "@/features/staff/fleet/lib/map";
import { PulseRing } from "./PulseRing";

const AISLES = [
  { label: "Kệ A", x: 8 },
  { label: "Kệ B", x: 30 },
  { label: "Kệ C", x: 52 },
  { label: "Kệ D", x: 74 },
];

interface MiniRobotMapProps {
  x: number;
  y: number;
  statusColor: string;
  robotId: string;
}

export function MiniRobotMap({ x, y, statusColor, robotId }: MiniRobotMapProps) {
  const isDark = useIsDark();
  const { leftPct, topPct } = projectPct(x, y);

  return (
    <View
      style={[
        styles.mapContainer,
        {
          backgroundColor: isDark ? palette.gray[800] : palette.gray[100],
          borderColor: isDark ? palette.gray[700] : palette.gray[200],
        },
      ]}
    >
      {/* Grid */}
      <View style={StyleSheet.absoluteFill}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={`v-${i}`}
            style={[
              styles.gridLine,
              {
                left: `${i * 20}%`,
                top: 0,
                bottom: 0,
                width: 1,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.06)",
              },
            ]}
          />
        ))}
        {[1, 2, 3, 4].map((i) => (
          <View
            key={`h-${i}`}
            style={[
              styles.gridLine,
              {
                top: `${i * 20}%`,
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.06)",
              },
            ]}
          />
        ))}
      </View>

      {/* Store boundary */}
      <View
        style={[
          styles.storeBoundary,
          {
            borderColor: isDark
              ? "rgba(255,255,255,0.15)"
              : "rgba(0,0,0,0.1)",
          },
        ]}
      />

      {/* Label */}
      <Text
        style={[
          styles.mapLabel,
          { color: isDark ? palette.gray[600] : palette.gray[400] },
        ]}
      >
        VỊ TRÍ ROBOT — ĐÃ ĐỊNH VỊ
      </Text>

      {/* Aisles */}
      {AISLES.map((aisle) => (
        <View
          key={aisle.label}
          style={[
            styles.aisleBlock,
            {
              left: `${aisle.x}%`,
              top: "18%",
              width: "14%",
              height: "52%",
              backgroundColor: isDark ? palette.gray[700] : palette.gray[300],
            },
          ]}
        >
          <Text
            style={[
              styles.aisleLabel,
              {
                color: isDark ? palette.gray[500] : palette.gray[400],
                top: -18,
              },
            ]}
          >
            {aisle.label}
          </Text>
          {[0, 1, 2].map((row) => (
            <View
              key={row}
              style={[
                styles.aisleRow,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.07)",
                  marginTop: row === 0 ? 8 : 4,
                },
              ]}
            />
          ))}
        </View>
      ))}

      {/* Target pin */}
      <View
        style={[styles.targetPin, { left: `${leftPct}%`, top: `${topPct}%` }]}
      >
        <PulseRing color={statusColor} />
        <View
          style={[
            styles.targetPinInner,
            {
              backgroundColor: isDark ? palette.gray[950] : "#ffffff",
              borderColor: statusColor,
            },
          ]}
        >
          <MapPinIcon size={20} color={statusColor} />
        </View>
        <View
          style={[
            styles.targetTooltip,
            { backgroundColor: isDark ? palette.gray[900] : "#ffffff" },
          ]}
        >
          <Text
            style={[
              styles.targetTooltipId,
              { color: isDark ? "#ffffff" : palette.gray[900] },
            ]}
          >
            {robotId}
          </Text>
          <Text
            style={[
              styles.targetTooltipSub,
              { color: isDark ? palette.gray[400] : palette.gray[500] },
            ]}
          >
            Đang ở đây
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 260,
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  gridLine: { position: "absolute" },
  storeBoundary: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  mapLabel: {
    position: "absolute",
    top: 16,
    left: 16,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  aisleBlock: {
    position: "absolute",
    borderRadius: 6,
    padding: 6,
    justifyContent: "flex-start",
  },
  aisleLabel: { position: "absolute", fontSize: 10, fontWeight: "700" },
  aisleRow: { height: 6, borderRadius: 3, width: "100%" },

  targetPin: {
    position: "absolute",
    width: 0,
    height: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  targetPinInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  targetTooltip: {
    position: "absolute",
    bottom: 32,
    left: "50%",
    transform: [{ translateX: -50 }],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 96,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  targetTooltipId: { fontSize: 12, fontWeight: "800" },
  targetTooltipSub: { fontSize: 10, marginTop: 1 },
});