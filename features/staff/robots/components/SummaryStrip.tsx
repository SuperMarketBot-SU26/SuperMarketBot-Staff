/**
 * SummaryStrip — Sleek status metrics strip for Staff app.
 * Synchronized with Admin FE Design System.
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
    { label: "Đang Chạy", count: active, color: "#16a34a", bgColor: isDark ? "rgba(34,197,94,0.15)" : "#dcfce7" },
    { label: "Chờ Sẵn", count: standby, color: "#2563eb", bgColor: isDark ? "rgba(59,130,246,0.15)" : "#dbeafe" },
    { label: "Đang Sạc", count: charging, color: "#d97706", bgColor: isDark ? "rgba(245,158,11,0.15)" : "#fef3c7" },
    { label: "Báo Lỗi", count: error, color: "#dc2626", bgColor: isDark ? "rgba(239,68,68,0.15)" : "#fee2e2" },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "#0f172a" : "#ffffff",
          borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(20, 83, 45, 0.12)",
        },
      ]}
    >
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <View style={[styles.iconBadge, { backgroundColor: item.bgColor }]}>
            <View style={[styles.statusDot, { backgroundColor: item.color }]} />
          </View>
          <Text style={[styles.count, { color: item.color }]}>
            {item.count}
          </Text>
          <Text
            style={[
              styles.label,
              { color: isDark ? palette.slate[400] : "#4a5a52" },
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
  container: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  count: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
