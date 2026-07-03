/**
 * StatusBadge — small inline pill with status dot + label.
 * Used by the Robots list to show the live state of each robot.
 */
import { StyleSheet, Text, View } from "react-native";
import { robotStatusConfig } from "@/shared/theme";
import { type RobotStatus } from "@/shared/api";

interface StatusBadgeProps {
  status: RobotStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = robotStatusConfig[status];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bgAlpha }]}>
      <View style={[styles.dot, { backgroundColor: cfg.dot }]} />
      <Text style={[styles.text, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 10, fontWeight: "700" },
});