/**
 * RobotStatusCard — bottom-of-page strip showing robot + status + battery + mode.
 */
import { StyleSheet, Text, View } from "react-native";
import { DEVICE, palette, robotStatusConfig, useIsDark } from "@/shared/theme";
import { type NormalizedRobot } from "@/shared/api";
import { BatteryIcon, BotIcon, WifiIcon } from "@/shared/ui";

interface RobotStatusCardProps {
  robot: NormalizedRobot;
}

export function RobotStatusCard({ robot }: RobotStatusCardProps) {
  const isDark = useIsDark();
  const cfg = robotStatusConfig[robot.status];
  const statusDot = cfg.dot;
  const statusLabel = cfg.label;
  const cardBg = isDark ? palette.gray[900] : "#ffffff";
  const border = isDark ? palette.gray[800] : palette.gray[200];

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
      <View style={styles.left}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: cfg.bgAlpha ?? "rgba(124,58,237,0.15)" },
          ]}
        >
          <BotIcon size={18} color={statusDot} />
        </View>
        <View>
          <Text
            style={[
              styles.name,
              { color: isDark ? "#fff" : palette.gray[900] },
            ]}
          >
            {robot.robotCode}
          </Text>
          <View style={styles.metaRow}>
            <View style={[styles.dot, { backgroundColor: statusDot }]} />
            <Text
              style={[
                styles.metaText,
                { color: isDark ? palette.gray[400] : palette.gray[500] },
              ]}
            >
              {statusLabel}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.right}>
        <View style={styles.metric}>
          <BatteryIcon
            size={14}
            color={isDark ? palette.gray[400] : palette.gray[500]}
          />
          <Text
            style={[
              styles.metricText,
              { color: isDark ? "#fff" : palette.gray[900] },
            ]}
          >
            {robot.batteryPct}%
          </Text>
        </View>
        <View style={styles.metric}>
          <WifiIcon
            size={14}
            color={isDark ? palette.gray[400] : palette.gray[500]}
          />
          <Text
            style={[
              styles.metricText,
              { color: isDark ? "#fff" : palette.gray[900] },
            ]}
          >
            {robot.mode}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 14, fontWeight: "800" },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  metaText: { fontSize: 11, fontWeight: "500" },
  right: { flexDirection: "row", gap: 12 },
  metric: { flexDirection: "row", alignItems: "center", gap: 4 },
  metricText: { fontSize: 12, fontWeight: "700" },
});