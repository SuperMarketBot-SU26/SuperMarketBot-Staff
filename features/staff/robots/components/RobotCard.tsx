/**
 * RobotCard — Robot Card for Staff app.
 * Synchronized with Admin FE Design System.
 */
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { DEVICE, palette, robotStatusConfig, useIsDark } from "@/shared/theme";
import { type NormalizedRobot } from "@/shared/api";
import {
  BatteryIcon,
  BotIcon,
  ChevronRightIcon,
  MapPinIcon,
  WifiIcon,
} from "@/shared/ui";

interface RobotCardProps {
  robot: NormalizedRobot;
  index: number;
}

export function RobotCard({ robot, index }: RobotCardProps) {
  const isDark = useIsDark();
  const router = useRouter();
  const cfg = robotStatusConfig[robot.status] ?? robotStatusConfig.error;

  const batteryColor =
    robot.batteryPct < 20
      ? "#ef4444"
      : robot.batteryPct < 50
        ? "#d97706"
        : "#16a34a";

  const batteryBg =
    robot.batteryPct < 20
      ? isDark ? "rgba(239,68,68,0.15)" : "#fee2e2"
      : robot.batteryPct < 50
        ? isDark ? "rgba(245,158,11,0.15)" : "#fef3c7"
        : isDark ? "rgba(34,197,94,0.15)" : "#dcfce7";

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case "auto": return "Tự động";
      case "manual": return "Thủ công";
      case "paused": return "Tạm dừng";
      default: return mode;
    }
  };

  return (
    <Animated.View entering={FadeInRight.delay(index * 40).duration(250)}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: isDark ? "#0f172a" : "#ffffff",
            borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(20, 83, 45, 0.12)",
          },
        ]}
        onPress={() =>
          router.push(
            `/staff/robot-detail?code=${encodeURIComponent(robot.robotCode)}` as any,
          )
        }
        activeOpacity={0.7}
      >
        {/* Robot icon & status dot */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#f0fdf4" },
          ]}
        >
          <BotIcon size={26} color={cfg.dot} />
          <View style={[styles.statusIndicator, { backgroundColor: cfg.dot }]} />
        </View>

        {/* Info section */}
        <View style={styles.info}>
          <View style={styles.idRow}>
            <Text style={[styles.id, { color: isDark ? "#ffffff" : "#11201a" }]}>
              {robot.robotCode}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : `${cfg.dot}18` },
              ]}
            >
              <View style={[styles.statusDot, { backgroundColor: cfg.dot }]} />
              <Text style={[styles.statusText, { color: cfg.dot }]}>
                {cfg.label}
              </Text>
            </View>
          </View>

          <Text
            style={[
              styles.model,
              { color: isDark ? palette.slate[400] : "#4a5a52" },
            ]}
            numberOfLines={1}
          >
            {robot.robotName || "Robot di chuyển tự động"}
          </Text>

          <View style={styles.metaRow}>
            {robot.position && (
              <View style={styles.metaItem}>
                <MapPinIcon
                  size={12}
                  color={isDark ? palette.slate[400] : "#4a5a52"}
                />
                <Text
                  style={[
                    styles.metaText,
                    { color: isDark ? palette.slate[300] : "#11201a" },
                  ]}
                  numberOfLines={1}
                >
                  {`(${robot.position.x.toFixed(1)}m, ${robot.position.y.toFixed(1)}m)`}
                </Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <WifiIcon
                size={12}
                color={isDark ? palette.slate[400] : "#4a5a52"}
              />
              <Text
                style={[
                  styles.metaText,
                  { color: isDark ? palette.slate[300] : "#11201a" },
                ]}
              >
                {getModeLabel(robot.mode ?? "auto")}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats section */}
        <View style={styles.stats}>
          <View style={[styles.batteryContainer, { backgroundColor: batteryBg }]}>
            <BatteryIcon size={14} color={batteryColor} />
            <Text style={[styles.batteryText, { color: batteryColor }]}>
              {robot.batteryPct}%
            </Text>
          </View>

          <ChevronRightIcon
            size={18}
            color={isDark ? palette.slate[500] : "#4a5a52"}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  statusIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "transparent",
  },
  info: {
    flex: 1,
    gap: 3,
  },
  idRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  id: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  model: {
    fontSize: 12,
    fontWeight: "500",
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: "600",
  },
  stats: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 8,
  },
  batteryContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  batteryText: {
    fontSize: 12,
    fontWeight: "800",
  },
});
