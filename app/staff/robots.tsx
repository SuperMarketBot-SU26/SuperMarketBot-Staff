/**
 * SmartMarket Staff App — Robots List Page
 */
import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useIsDark, palette, DEVICE, robotStatusConfig, ROBOTS } from "@/constants/theme";
import {
  BotIcon,
  BatteryIcon,
  WifiIcon,
  MapPinIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  AlertIcon,
} from "@/components/ui/staff-icons";

/* ─── Status Badge ────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: keyof typeof robotStatusConfig }) {
  const cfg = robotStatusConfig[status];
  return (
    <View style={[styles.statusBadge, { backgroundColor: cfg.bgAlpha }]}>
      <View style={[styles.statusDotSmall, { backgroundColor: cfg.dot }]} />
      <Text style={[styles.statusBadgeText, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

/* ─── Robot Card ─────────────────────────────────────────────────── */
function RobotCard({ robot, index }: { robot: typeof ROBOTS[0]; index: number }) {
  const isDark = useIsDark();
  const router = useRouter();
  const cfg = robotStatusConfig[robot.status];
  const batteryColor =
    robot.battery < 20 ? palette.red[500] : isDark ? palette.gray[400] : palette.gray[500];

  return (
    <Animated.View entering={FadeIn.delay(index * 60)}>
      <TouchableOpacity
        style={[
          styles.robotCard,
          {
            backgroundColor: isDark ? palette.gray[900] : "#ffffff",
            borderColor: isDark ? palette.gray[800] : palette.gray[200],
          },
        ]}
        onPress={() => {
          const path = `/staff/robot-detail?id=${robot.id}`;
          router.push(path as any);
        }}
        activeOpacity={0.7}
      >
        {/* Left: robot icon */}
        <View style={[styles.robotCardIcon, { backgroundColor: cfg.bgAlpha }]}>
          <BotIcon size={22} color={cfg.dot} />
        </View>

        {/* Middle: info */}
        <View style={styles.robotCardInfo}>
          <View style={styles.robotCardIdRow}>
            <Text style={[styles.robotCardId, { color: isDark ? "#ffffff" : palette.gray[900] }]}>
              {robot.id}
            </Text>
            <StatusBadge status={robot.status} />
          </View>
          <Text style={[styles.robotCardModel, { color: isDark ? palette.gray[400] : palette.gray[500] }]}>
            {robot.model}
          </Text>
          <View style={styles.robotCardMeta}>
            <View style={styles.robotCardMetaItem}>
              <MapPinIcon size={11} color={isDark ? palette.gray[600] : palette.gray[400]} />
              <Text style={[styles.robotCardMetaText, { color: isDark ? palette.gray[400] : palette.gray[500] }]}>
                {robot.location}
              </Text>
            </View>
          </View>
        </View>

        {/* Right: battery + signal */}
        <View style={styles.robotCardStats}>
          <View style={styles.robotCardStatItem}>
            <BatteryIcon size={14} color={batteryColor} />
            <Text style={[styles.robotCardStatText, { color: batteryColor }]}>
              {robot.battery}%
            </Text>
          </View>
          <View style={styles.robotCardStatItem}>
            <WifiIcon size={14} color={isDark ? palette.gray[500] : palette.gray[400]} />
            <Text style={[styles.robotCardStatText, { color: isDark ? palette.gray[500] : palette.gray[400] }]}>
              {robot.signalStrength}%
            </Text>
          </View>
          <ChevronRightIcon size={16} color={isDark ? palette.gray[600] : palette.gray[400]} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

/* ─── Summary Strip ──────────────────────────────────────────────── */
function SummaryStrip() {
  const isDark = useIsDark();
  const active = ROBOTS.filter((r) => r.status === "active").length;
  const standby = ROBOTS.filter((r) => r.status === "standby").length;
  const error = ROBOTS.filter((r) => r.status === "error").length;
  const charging = ROBOTS.filter((r) => r.status === "charging").length;

  const items: { label: string; count: number; color: string }[] = [
    { label: "Hoạt động", count: active, color: palette.emerald[500] },
    { label: "Chờ", count: standby, color: palette.amber[500] },
    { label: "Lỗi", count: error, color: palette.red[500] },
    { label: "Sạc", count: charging, color: palette.blue[500] },
  ];

  return (
    <View style={[styles.summaryStrip, { backgroundColor: isDark ? palette.gray[900] : "#ffffff", borderColor: isDark ? palette.gray[800] : palette.gray[200] }]}>
      {items.map((item, i) => (
        <View key={item.label} style={styles.summaryItem}>
          <View style={[styles.summaryDot, { backgroundColor: item.color }]} />
          <Text style={[styles.summaryCount, { color: isDark ? "#ffffff" : palette.gray[900] }]}>
            {item.count}
          </Text>
          <Text style={[styles.summaryLabel, { color: isDark ? palette.gray[400] : palette.gray[500] }]}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

/* ─── Main ─────────────────────────────────────────────────────── */
export default function StaffRobotsPage() {
  const isDark = useIsDark();
  const bg = isDark ? palette.gray[950] : "#f3f4f6";

  return (
    <View style={[styles.page, { backgroundColor: bg }]}>
      <View style={[styles.pageHeader, { borderBottomColor: isDark ? palette.gray[800] : palette.gray[200] }]}>
        <Text style={[styles.pageTitle, { color: isDark ? "#ffffff" : palette.gray[900] }]}>
          Robot
        </Text>
        <Text style={[styles.pageSubtitle, { color: isDark ? palette.gray[400] : palette.gray[500] }]}>
          {ROBOTS.length} robot trong hệ thống
        </Text>
      </View>

      <SummaryStrip />

      <ScrollView
        style={styles.robotList}
        contentContainerStyle={styles.robotListContent}
        showsVerticalScrollIndicator={false}
      >
        {ROBOTS.map((robot, i) => (
          <RobotCard key={robot.id} robot={robot} index={i} />
        ))}
      </ScrollView>
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  page: { flex: 1 },
  pageHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  pageTitle: { fontSize: 20, fontWeight: "800" },
  pageSubtitle: { fontSize: 13, marginTop: 2 },
  summaryStrip: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
    gap: 0,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  summaryDot: { width: 8, height: 8, borderRadius: 4 },
  summaryCount: { fontSize: 18, fontWeight: "800" },
  summaryLabel: { fontSize: 10, fontWeight: "600", textAlign: "center" },
  robotList: { flex: 1 },
  robotListContent: { padding: 16, gap: 8, paddingBottom: 32 },
  robotCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
  },
  robotCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  robotCardInfo: { flex: 1, gap: 4 },
  robotCardIdRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  robotCardId: { fontSize: 16, fontWeight: "800" },
  robotCardModel: { fontSize: 12 },
  robotCardMeta: { flexDirection: "row", gap: 12 },
  robotCardMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  robotCardMetaText: { fontSize: 11 },
  robotCardStats: { alignItems: "flex-end", gap: 6 },
  robotCardStatItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  robotCardStatText: { fontSize: 12, fontWeight: "600" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusDotSmall: { width: 6, height: 6, borderRadius: 3 },
  statusBadgeText: { fontSize: 10, fontWeight: "700" },
});
