/**
 * InfoCard — "Thông tin" block listing robot fields in key/value rows.
 *
 * The list of rows is built up here rather than passed in so the
 * robot-detail screen stays short.
 */
import { StyleSheet, Text, View } from "react-native";
import { palette, useIsDark } from "@/shared/theme";
import { type NormalizedRobot } from "@/shared/api";
import { formatRelativeTime } from "@/shared/lib";

interface InfoCardProps {
  robot: NormalizedRobot;
}

export function InfoCard({ robot }: InfoCardProps) {
  const isDark = useIsDark();

  const rows: [string, string][] = [
    ["Mã robot", robot.robotCode],
    ["Tên", robot.robotName],
    [
      "Vị trí cuối",
      robot.position
        ? `(${robot.position.x.toFixed(1)}, ${robot.position.y.toFixed(1)}) · ${robot.position.headingDeg.toFixed(0)}°`
        : "Chưa có dữ liệu",
    ],
    [
      "Cập nhật lần cuối",
      robot.lastSeenAt ? formatRelativeTime(robot.lastSeenAt) : "—",
    ],
  ];

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
      <Text
        style={[styles.title, { color: isDark ? "#fff" : palette.gray[900] }]}
      >
        Thông tin
      </Text>
      {rows.map(([label, value]) => (
        <View key={label} style={styles.row}>
          <Text style={[styles.label, { color: palette.gray[500] }]}>
            {label}
          </Text>
          <Text
            style={[
              styles.value,
              { color: isDark ? palette.gray[100] : palette.gray[900] },
            ]}
            numberOfLines={1}
          >
            {value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 12 },
  title: { fontSize: 15, fontWeight: "700" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(128,128,128,0.2)",
  },
  label: { fontSize: 13 },
  value: { fontSize: 13, fontWeight: "600", maxWidth: "60%", textAlign: "right" },
});