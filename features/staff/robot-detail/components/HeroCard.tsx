/**
 * HeroCard — top "big icon + name + status" block on the robot-detail page.
 */
import { StyleSheet, Text, View } from "react-native";
import { palette, robotStatusConfig, useIsDark } from "@/shared/theme";
import { type NormalizedRobot } from "@/shared/api";
import { BotIcon } from "@/shared/ui";

interface HeroCardProps {
  robot: NormalizedRobot;
}

export function HeroCard({ robot }: HeroCardProps) {
  const isDark = useIsDark();
  const cfg = robotStatusConfig[robot.status];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? palette.gray[900] : "#fff",
          borderColor: isDark ? palette.gray[800] : palette.gray[200],
        },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: cfg.bgAlpha }]}>
        <BotIcon size={36} color={cfg.dot} />
      </View>
      <Text
        style={[
          styles.robotId,
          { color: isDark ? "#fff" : palette.gray[900] },
        ]}
      >
        {robot.robotCode}
      </Text>
      <Text
        style={[
          styles.robotModel,
          { color: isDark ? palette.gray[400] : palette.gray[500] },
        ]}
      >
        {robot.robotName}
      </Text>
      <View style={[styles.badge, { backgroundColor: cfg.bgAlpha }]}>
        <View style={[styles.dot, { backgroundColor: cfg.dot }]} />
        <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    padding: 24,
    gap: 8,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  robotId: { fontSize: 24, fontWeight: "800" },
  robotModel: { fontSize: 14 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 4,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  badgeText: { fontSize: 13, fontWeight: "700" },
});