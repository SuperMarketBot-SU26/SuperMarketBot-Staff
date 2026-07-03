/**
 * FleetRobotListItem — single robot row on the Fleet overview page.
 *
 * Compact card showing: status icon, robot code, position-or-placeholder,
 * battery %, chevron. Tapping opens /staff/robot-detail.
 */
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { DEVICE, palette, robotStatusConfig, useIsDark } from "@/shared/theme";
import { type NormalizedRobot } from "@/shared/api";
import { BatteryIcon, BotIcon, ChevronRightIcon, WifiIcon } from "@/shared/ui";

interface FleetRobotListItemProps {
  robot: NormalizedRobot;
  index: number;
}

export function FleetRobotListItem({ robot, index }: FleetRobotListItemProps) {
  const isDark = useIsDark();
  const router = useRouter();
  const cfg = robotStatusConfig[robot.status];
  const batteryColor =
    robot.batteryPct < 20
      ? palette.red[500]
      : isDark
        ? palette.gray[400]
        : palette.gray[500];

  return (
    <Animated.View entering={FadeIn.delay(index * 70)}>
      <TouchableOpacity
        style={[
          styles.item,
          {
            backgroundColor: isDark ? palette.gray[800] : palette.gray[50],
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
        <View style={[styles.icon, { backgroundColor: cfg.bgAlpha }]}>
          <BotIcon size={18} color={cfg.dot} />
        </View>
        <View style={styles.info}>
          <View style={styles.idRow}>
            <Text
              style={[
                styles.id,
                { color: isDark ? "#ffffff" : palette.gray[900] },
              ]}
            >
              {robot.robotCode}
            </Text>
            <View style={[styles.statusDot, { backgroundColor: cfg.dot }]} />
          </View>
          <Text
            style={[
              styles.task,
              { color: isDark ? palette.gray[400] : palette.gray[500] },
            ]}
            numberOfLines={1}
          >
            {robot.position
              ? `Tọa độ (${robot.position.x.toFixed(0)}, ${robot.position.y.toFixed(0)})`
              : "Chưa có tọa độ"}
          </Text>
        </View>
        <View style={styles.meta}>
          <View style={styles.battery}>
            <BatteryIcon size={13} color={batteryColor} />
            <Text style={[styles.batteryText, { color: batteryColor }]}>
              {robot.batteryPct}%
            </Text>
          </View>
          <View style={styles.metaIcons}>
            <WifiIcon
              size={13}
              color={isDark ? palette.gray[500] : palette.gray[400]}
            />
            <ChevronRightIcon
              size={14}
              color={isDark ? palette.gray[500] : palette.gray[400]}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1, gap: 2 },
  idRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  id: { fontSize: 14, fontWeight: "700" },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  task: { fontSize: 12 },
  meta: { alignItems: "flex-end", gap: 6 },
  battery: { flexDirection: "row", alignItems: "center", gap: 4 },
  batteryText: { fontSize: 12, fontWeight: "600" },
  metaIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});