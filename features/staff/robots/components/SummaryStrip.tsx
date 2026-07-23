/**
 * SummaryStrip — Modern status summary with animated progress rings.
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
  const charging = robots.filter((r) => r.status === "charging").length;
  const error = robots.filter((r) => r.status === "error").length;

  const items = [
    { label: "Đang chạy", count: active, color: "#22c55e", bgColor: isDark ? "rgba(34,197,94,0.15)" : "rgba(34,197,94,0.1)" },
    { label: "Chờ", count: standby, color: "#3b82f6", bgColor: isDark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.1)" },
    { label: "Sạc", count: charging, color: "#f59e0b", bgColor: isDark ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.1)" },
    { label: "Lỗi", count: error, color: "#ef4444", bgColor: isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.1)" },
  ];

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: isDark ? palette.gray[800] : "#ffffff",
        borderColor: isDark ? palette.gray[700] : palette.gray[200],
      }
    ]}>
      {items.map((item, index) => (
        <View key={item.label} style={styles.item}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: item.bgColor }
          ]}>
            <View style={[
              styles.statusDot,
              { backgroundColor: item.color }
            ]} />
          </View>
          <Text style={[
            styles.count,
            { color: item.color }
          ]}>
            {item.count}
          </Text>
          <Text style={[
            styles.label,
            { color: isDark ? palette.gray[400] : palette.gray[500] }
          ]}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    gap: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  count: {
    fontSize: 22,
    fontWeight: "800",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
