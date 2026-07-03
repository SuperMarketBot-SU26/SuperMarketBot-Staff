/**
 * RobotRow — one robot entry inside the FleetMap bottom sheet.
 *
 * Compact card showing the status icon, robot code, status subtitle,
 * battery %. Tapping deep-links into the robot detail page.
 */
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { palette, robotStatusConfig, useIsDark } from "@/shared/theme";
import { type NormalizedRobot } from "@/shared/api";
import { BatteryIcon, BotIcon } from "@/shared/ui";
import { describeRobot } from "../lib/map";

interface RobotRowProps {
  robot: NormalizedRobot;
  onPress: (code: string) => void;
}

export function RobotRow({ robot, onPress }: RobotRowProps) {
  const isDark = useIsDark();
  const cfg = robotStatusConfig[robot.status];
  const batteryColor =
    robot.batteryPct < 25
      ? palette.red[500]
      : isDark ? palette.gray[400] : palette.gray[500];

  return (
    <TouchableOpacity
      style={[
        styles.row,
        {
          backgroundColor: isDark ? palette.gray[800] : palette.gray[100],
        },
      ]}
      onPress={() => onPress(robot.robotCode)}
      activeOpacity={0.7}
    >
      <View style={[styles.avatar, { backgroundColor: cfg.bgAlpha }]}>
        <BotIcon size={14} color={cfg.dot} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.id,
            { color: isDark ? "#ffffff" : palette.gray[900] },
          ]}
        >
          {robot.robotCode}
        </Text>
        <Text
          style={[
            styles.task,
            { color: isDark ? palette.gray[400] : palette.gray[500] },
          ]}
          numberOfLines={1}
        >
          {describeRobot(robot)}
        </Text>
      </View>
      <View style={styles.battery}>
        <BatteryIcon size={12} color={batteryColor} />
        <Text
          style={[
            styles.batteryText,
            {
              color:
                robot.batteryPct < 25
                  ? palette.red[500]
                  : isDark ? "#ffffff" : palette.gray[900],
            },
          ]}
        >
          {robot.batteryPct}%
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  id: { fontSize: 12, fontWeight: "800" },
  task: { fontSize: 11 },
  battery: { flexDirection: "row", alignItems: "center", gap: 4 },
  batteryText: { fontSize: 11, fontWeight: "700" },
});