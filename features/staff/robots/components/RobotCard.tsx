/**
 * RobotCard — Modern robot card with smooth animations and status indicators.
 */
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInRight, FadeIn } from "react-native-reanimated";
import { useRouter } from "expo-router";
import {
  DEVICE,
  palette,
  robotStatusConfig,
  useIsDark,
} from "@/shared/theme";
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
        ? "#f59e0b"
        : "#22c55e";

  const batteryBg =
    robot.batteryPct < 20
      ? isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.1)"
      : robot.batteryPct < 50
        ? isDark ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.1)"
        : isDark ? "rgba(34,197,94,0.15)" : "rgba(34,197,94,0.1)";

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case "auto": return "Tự động";
      case "manual": return "Thủ công";
      case "paused": return "Tạm dừng";
      default: return mode;
    }
  };

  return (
    <Animated.View entering={FadeInRight.delay(index * 50).duration(300)}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: isDark ? palette.gray[800] : "#ffffff",
            borderColor: isDark ? palette.gray[700] : palette.gray[200],
          },
        ]}
        onPress={() =>
          router.push(
            `/staff/robot-detail?code=${encodeURIComponent(robot.robotCode)}` as any,
          )
        }
        activeOpacity={0.7}
      >
        {/* Robot icon */}
        <View style={[
          styles.iconContainer,
          { backgroundColor: isDark ? palette.gray[700] : `${cfg.dot}15` }
        ]}>
          <BotIcon size={24} color={cfg.dot} />
          <View style={[
            styles.statusIndicator,
            { backgroundColor: cfg.dot }
          ]} />
        </View>

        {/* Info section */}
        <View style={styles.info}>
          <View style={styles.idRow}>
            <Text style={[styles.id, { color: isDark ? "#ffffff" : palette.gray[900] }]}>
              {robot.robotCode}
            </Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : `${cfg.dot}15` }
            ]}>
              <View style={[styles.statusDot, { backgroundColor: cfg.dot }]} />
              <Text style={[styles.statusText, { color: cfg.dot }]}>
                {cfg.label}
              </Text>
            </View>
          </View>

          <Text
            style={[
              styles.model,
              { color: isDark ? palette.gray[400] : palette.gray[500] },
            ]}
            numberOfLines={1}
          >
            {robot.robotName || "Robot tự di chuyển"}
          </Text>

          <View style={styles.metaRow}>
            {robot.position && (
              <View style={styles.metaItem}>
                <MapPinIcon
                  size={12}
                  color={isDark ? palette.gray[500] : palette.gray[400]}
                />
                <Text
                  style={[
                    styles.metaText,
                    { color: isDark ? palette.gray[400] : palette.gray[500] },
                  ]}
                  numberOfLines={1}
                >
                  {`(${robot.position.x.toFixed(1)}, ${robot.position.y.toFixed(1)})`}
                </Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <WifiIcon
                size={12}
                color={isDark ? palette.gray[500] : palette.gray[400]}
              />
              <Text
                style={[
                  styles.metaText,
                  { color: isDark ? palette.gray[400] : palette.gray[500] },
                ]}
              >
                {getModeLabel(robot.mode ?? "auto")}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats section */}
        <View style={styles.stats}>
          <View style={[
            styles.batteryContainer,
            { backgroundColor: batteryBg }
          ]}>
            <BatteryIcon size={16} color={batteryColor} />
            <Text style={[styles.batteryText, { color: batteryColor }]}>
              {robot.batteryPct}%
            </Text>
          </View>

          <ChevronRightIcon
            size={18}
            color={isDark ? palette.gray[600] : palette.gray[400]}
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
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
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
    gap: 4,
  },
  idRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  id: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    fontSize: 13,
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
    fontWeight: "500",
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
    borderRadius: 8,
    gap: 4,
  },
  batteryText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
