/**
 * RobotCard — single robot row in the Robots list page.
 *
 * Shows: status icon | code + status badge + name + position | battery + mode + chevron.
 */
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
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
import { StatusBadge } from "./StatusBadge";

interface RobotCardProps {
  robot: NormalizedRobot;
  index: number;
}

export function RobotCard({ robot, index }: RobotCardProps) {
  const isDark = useIsDark();
  const router = useRouter();
  const cfg = robotStatusConfig[robot.status];
  const batteryColor =
    robot.batteryPct < 20
      ? palette.red[500]
      : isDark ? palette.gray[400] : palette.gray[500];

  return (
    <Animated.View entering={FadeIn.delay(index * 60)}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: isDark ? palette.gray[900] : "#ffffff",
            borderColor: isDark ? palette.gray[800] : palette.gray[200],
          },
        ]}
        onPress={() =>
          router.push(
            `/staff/robot-detail?code=${encodeURIComponent(robot.robotCode)}` as any,
          )
        }
        activeOpacity={0.7}
      >
        <View style={[styles.icon, { backgroundColor: cfg.bgAlpha }]}>
          <BotIcon size={22} color={cfg.dot} />
        </View>

        <View style={styles.info}>
          <View style={styles.idRow}>
            <Text style={[styles.id, { color: isDark ? "#fff" : palette.gray[900] }]}>
              {robot.robotCode}
            </Text>
            <StatusBadge status={robot.status} />
          </View>
          <Text
            style={[
              styles.model,
              { color: isDark ? palette.gray[400] : palette.gray[500] },
            ]}
          >
            {robot.robotName}
          </Text>
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <MapPinIcon
                size={11}
                color={isDark ? palette.gray[600] : palette.gray[400]}
              />
              <Text
                style={[
                  styles.metaText,
                  { color: isDark ? palette.gray[400] : palette.gray[500] },
                ]}
              >
                {robot.position
                  ? `(${robot.position.x.toFixed(0)}, ${robot.position.y.toFixed(0)})`
                  : "Chưa có tọa độ"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <BatteryIcon size={14} color={batteryColor} />
            <Text style={[styles.statText, { color: batteryColor }]}>
              {robot.batteryPct}%
            </Text>
          </View>
          <View style={styles.statItem}>
            <WifiIcon
              size={14}
              color={isDark ? palette.gray[500] : palette.gray[400]}
            />
            <Text
              style={[
                styles.statText,
                { color: isDark ? palette.gray[500] : palette.gray[400] },
              ]}
            >
              {robot.mode}
            </Text>
          </View>
          <ChevronRightIcon
            size={16}
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
    gap: 12,
    padding: 12,
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1, gap: 4 },
  idRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  id: { fontSize: 16, fontWeight: "800" },
  model: { fontSize: 12 },
  meta: { flexDirection: "row", gap: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11 },
  stats: { alignItems: "flex-end", gap: 6 },
  statItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { fontSize: 12, fontWeight: "600" },
});