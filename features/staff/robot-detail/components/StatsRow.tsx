/**
 * StatsRow — 3-column strip showing battery / mode / position.
 */
import { StyleSheet, Text, View } from "react-native";
import { palette, useIsDark } from "@/shared/theme";
import { type NormalizedRobot } from "@/shared/api";
import { BatteryIcon, MapPinIcon, WifiIcon } from "@/shared/ui";

interface StatsRowProps {
  robot: NormalizedRobot;
}

export function StatsRow({ robot }: StatsRowProps) {
  const isDark = useIsDark();
  const iconColor = isDark ? palette.violet[400] : palette.violet[600];

  return (
    <View style={styles.row}>
      <StatCard
        icon={<BatteryIcon size={18} color={iconColor} />}
        value={
          <Text
            style={[
              styles.value,
              {
                color:
                  robot.batteryPct < 20
                    ? palette.red[500]
                    : isDark ? palette.gray[100] : palette.gray[900],
              },
            ]}
          >
            {robot.batteryPct}%
          </Text>
        }
        label="Pin"
      />
      <StatCard
        icon={<WifiIcon size={18} color={iconColor} />}
        value={
          <Text
            style={[
              styles.value,
              { color: isDark ? palette.gray[100] : palette.gray[900] },
            ]}
          >
            {robot.mode}
          </Text>
        }
        label="Chế độ"
      />
      <StatCard
        icon={<MapPinIcon size={18} color={iconColor} />}
        value={
          <Text
            style={[
              styles.value,
              { color: isDark ? palette.gray[100] : palette.gray[900] },
            ]}
            numberOfLines={1}
          >
            {robot.position
              ? `${robot.position.x.toFixed(0)}, ${robot.position.y.toFixed(0)}`
              : "—"}
          </Text>
        }
        label="Vị trí"
      />
    </View>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
}

function StatCard({ icon, value, label }: StatCardProps) {
  const isDark = useIsDark();
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
      {icon}
      {value}
      <Text style={[styles.label, { color: palette.gray[500] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  card: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    padding: 12,
    gap: 4,
    minHeight: 92,
    justifyContent: "center",
  },
  value: { fontSize: 18, fontWeight: "800" },
  label: { fontSize: 11, fontWeight: "600" },
});