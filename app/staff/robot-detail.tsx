/**
 * Staff Robot Detail Page — placeholder
 * Displays detailed info for a single robot
 */
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useIsDark, palette, ROBOTS, robotStatusConfig } from "@/constants/theme";
import { BotIcon, BatteryIcon, WifiIcon, MapPinIcon, ChevronLeftIcon, XIcon } from "@/components/ui/staff-icons";

export default function RobotDetailPage() {
  const isDark = useIsDark();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const bg = isDark ? palette.gray[950] : "#f3f4f6";
  const robot = ROBOTS.find((r) => r.id === id);
  const cfg = robot ? robotStatusConfig[robot.status] : null;

  if (!robot) {
    return (
      <View style={[styles.page, { backgroundColor: bg }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeftIcon size={20} color={isDark ? "#fff" : palette.gray[900]} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? "#fff" : palette.gray[900] }]}>Không tìm thấy</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.center}>
          <Text style={[styles.notFound, { color: isDark ? palette.gray[400] : palette.gray[500] }]}>
            Robot "{id}" không tồn tại
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.page, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? palette.gray[900] : "#fff", borderBottomColor: isDark ? palette.gray[800] : palette.gray[200] }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeftIcon size={20} color={isDark ? "#fff" : palette.gray[900]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? "#fff" : palette.gray[900] }]}>
          {robot.id}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentPad} showsVerticalScrollIndicator={false}>
        {/* Hero card */}
        <View style={[styles.heroCard, { backgroundColor: isDark ? palette.gray[900] : "#fff", borderColor: isDark ? palette.gray[800] : palette.gray[200] }]}>
          <View style={[styles.heroIcon, { backgroundColor: cfg?.bgAlpha }]}>
            <BotIcon size={36} color={cfg?.dot ?? "#fff"} />
          </View>
          <Text style={[styles.robotId, { color: isDark ? "#fff" : palette.gray[900] }]}>{robot.id}</Text>
          <Text style={[styles.robotModel, { color: isDark ? palette.gray[400] : palette.gray[500] }]}>{robot.model}</Text>
          <View style={[styles.statusBadge, { backgroundColor: cfg?.bgAlpha }]}>
            <View style={[styles.statusDot, { backgroundColor: cfg?.dot }]} />
            <Text style={[styles.statusText, { color: cfg?.text }]}>{cfg?.label}</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { icon: BatteryIcon, label: "Pin", value: `${robot.battery}%`, color: robot.battery < 20 ? palette.red[500] : isDark ? palette.gray[100] : palette.gray[900] },
            { icon: WifiIcon, label: "Tín hiệu", value: `${robot.signalStrength}%`, color: isDark ? palette.gray[100] : palette.gray[900] },
            { icon: MapPinIcon, label: "Nhiệm vụ", value: `${robot.tasks}`, color: isDark ? palette.gray[100] : palette.gray[900] },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <View key={stat.label} style={[styles.statCard, { backgroundColor: isDark ? palette.gray[900] : "#fff", borderColor: isDark ? palette.gray[800] : palette.gray[200] }]}>
                <Icon size={18} color={isDark ? palette.violet[400] : palette.violet[600]} />
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: isDark ? palette.gray[500] : palette.gray[500] }]}>{stat.label}</Text>
              </View>
            );
          })}
        </View>

        {/* Info section */}
        <View style={[styles.infoCard, { backgroundColor: isDark ? palette.gray[900] : "#fff", borderColor: isDark ? palette.gray[800] : palette.gray[200] }]}>
          <Text style={[styles.infoTitle, { color: isDark ? "#fff" : palette.gray[900] }]}>Thông tin</Text>
          {[
            ["Vị trí", robot.location],
            ["Serial", robot.serialNumber],
            ["Firmware", robot.firmware],
            ["Thời gian hoạt động", robot.totalRuntime],
            ["Nhiệm vụ hoàn thành", String(robot.completedTasks)],
            ["Kích thước", robot.dimensions],
            ["Tốc độ tối đa", robot.maxSpeed],
            ["Tải trọng tối đa", robot.maxPayload],
          ].map(([label, value]) => (
            <View key={label} style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: isDark ? palette.gray[500] : palette.gray[500] }]}>{label}</Text>
              <Text style={[styles.infoValue, { color: isDark ? palette.gray[100] : palette.gray[900] }]}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Sensors */}
        <View style={[styles.infoCard, { backgroundColor: isDark ? palette.gray[900] : "#fff", borderColor: isDark ? palette.gray[800] : palette.gray[200] }]}>
          <Text style={[styles.infoTitle, { color: isDark ? "#fff" : palette.gray[900] }]}>Cảm biến</Text>
          <View style={styles.sensorTags}>
            {robot.sensors.map((s) => (
              <View key={s} style={[styles.sensorTag, { backgroundColor: isDark ? palette.gray[800] : palette.gray[100] }]}>
                <Text style={[styles.sensorTagText, { color: isDark ? palette.gray[300] : palette.gray[700] }]}>{s}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  header: {
    height: 57,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "700" },
  content: { flex: 1 },
  contentPad: { padding: 16, gap: 12, paddingBottom: 32 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFound: { fontSize: 16 },
  heroCard: {
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    padding: 24,
    gap: 8,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  robotId: { fontSize: 24, fontWeight: "800" },
  robotModel: { fontSize: 14 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 4,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 8 },
  statCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    padding: 12,
    gap: 4,
  },
  statValue: { fontSize: 18, fontWeight: "800" },
  statLabel: { fontSize: 11, fontWeight: "600" },
  infoCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 12 },
  infoTitle: { fontSize: 15, fontWeight: "700" },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "rgba(128,128,128,0.2)" },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: "600" },
  sensorTags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  sensorTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  sensorTagText: { fontSize: 12, fontWeight: "600" },
});
