/**
 * SummaryStrip — the 4-column status-count banner at the top of the Robots
 * page. Shows totals for active / standby / error / charging.
 */
import { StyleSheet, Text, View } from "react-native";
import { DEVICE, palette, useIsDark } from "@/shared/theme";
import { type NormalizedRobot } from "@/shared/api";

interface SummaryStripProps {
  robots: NormalizedRobot[];
}

export function SummaryStrip({ robots }: SummaryStripProps) {
  const isDark = useIsDark();
  const active = robots.filter((r) => r.status === "active").length;
  const standby = robots.filter((r) => r.status === "standby").length;
  const error = robots.filter((r) => r.status === "error").length;
  const charging = robots.filter((r) => r.status === "charging").length;

  const items = [
    { label: "Hoạt động", count: active, color: palette.emerald[500] },
    { label: "Chờ", count: standby, color: palette.amber[500] },
    { label: "Lỗi", count: error, color: palette.red[500] },
    { label: "Sạc", count: charging, color: palette.blue[500] },
  ];

  return (
    <View
      style={[
        styles.strip,
        {
          backgroundColor: isDark ? palette.gray[900] : "#ffffff",
          borderColor: isDark ? palette.gray[800] : palette.gray[200],
        },
      ]}
    >
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: item.color }]} />
          <Text
            style={[
              styles.count,
              { color: isDark ? "#ffffff" : palette.gray[900] },
            ]}
          >
            {item.count}
          </Text>
          <Text
            style={[
              styles.label,
              { color: isDark ? palette.gray[400] : palette.gray[500] },
            ]}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
    gap: 0,
  },
  item: { flex: 1, alignItems: "center", gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  count: { fontSize: 18, fontWeight: "800" },
  label: { fontSize: 10, fontWeight: "600", textAlign: "center" },
});