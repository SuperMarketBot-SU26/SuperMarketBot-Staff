/**
 * SmartMarket Staff App — Robots List Page
 * Live data from `GET /api/robots` (+ pose per-robot).
 *
 * Pulls a flat roster; no map (we have no SVG / seed map on the BE yet).
 * Tapping a row opens /staff/robot-detail?code=XXX, which lazily calls
 * `GET /api/robots/{code}/pose` for the live position.
 */
import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useIsDark, palette, DEVICE, robotStatusConfig } from "@/constants/theme";
import {
  BotIcon,
  BatteryIcon,
  WifiIcon,
  MapPinIcon,
  ChevronRightIcon,
} from "@/components/ui/staff-icons";
import type { NormalizedRobot } from "@/services/api/robots";
import { useRobotList } from "@/hooks/useRobotList";

/* ─── Status Badge ────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: NormalizedRobot["status"] }) {
  const cfg = robotStatusConfig[status as keyof typeof robotStatusConfig];
  return (
    <View style={[styles.statusBadge, { backgroundColor: cfg.bgAlpha }]}>
      <View style={[styles.statusDotSmall, { backgroundColor: cfg.dot }]} />
      <Text style={[styles.statusBadgeText, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

/* ─── Robot Card ─────────────────────────────────────────────────── */
function RobotCard({ robot, index }: { robot: NormalizedRobot; index: number }) {
  const isDark = useIsDark();
  const router = useRouter();
  const cfg = robotStatusConfig[robot.status as keyof typeof robotStatusConfig];
  const batteryColor =
    robot.batteryPct < 20 ? palette.red[500] : isDark ? palette.gray[400] : palette.gray[500];

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
        onPress={() => router.push(`/staff/robot-detail?code=${encodeURIComponent(robot.robotCode)}` as any)}
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
              {robot.robotCode}
            </Text>
            <StatusBadge status={robot.status} />
          </View>
          <Text style={[styles.robotCardModel, { color: isDark ? palette.gray[400] : palette.gray[500] }]}>
            {robot.robotName}
          </Text>
          <View style={styles.robotCardMeta}>
            <View style={styles.robotCardMetaItem}>
              <MapPinIcon size={11} color={isDark ? palette.gray[600] : palette.gray[400]} />
              <Text style={[styles.robotCardMetaText, { color: isDark ? palette.gray[400] : palette.gray[500] }]}>
                {robot.position
                  ? `(${robot.position.x.toFixed(0)}, ${robot.position.y.toFixed(0)})`
                  : "Chưa có tọa độ"}
              </Text>
            </View>
          </View>
        </View>

        {/* Right: battery + arrow */}
        <View style={styles.robotCardStats}>
          <View style={styles.robotCardStatItem}>
            <BatteryIcon size={14} color={batteryColor} />
            <Text style={[styles.robotCardStatText, { color: batteryColor }]}>
              {robot.batteryPct}%
            </Text>
          </View>
          <View style={styles.robotCardStatItem}>
            <WifiIcon size={14} color={isDark ? palette.gray[500] : palette.gray[400]} />
            <Text style={[styles.robotCardStatText, { color: isDark ? palette.gray[500] : palette.gray[400] }]}>
              {robot.mode}
            </Text>
          </View>
          <ChevronRightIcon size={16} color={isDark ? palette.gray[600] : palette.gray[400]} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

/* ─── Summary Strip ──────────────────────────────────────────────── */
function SummaryStrip({ robots }: { robots: NormalizedRobot[] }) {
  const isDark = useIsDark();
  const active = robots.filter((r) => r.status === "active").length;
  const standby = robots.filter((r) => r.status === "standby").length;
  const error = robots.filter((r) => r.status === "error").length;
  const charging = robots.filter((r) => r.status === "charging").length;

  const items: { label: string; count: number; color: string }[] = [
    { label: "Hoạt động", count: active, color: palette.emerald[500] },
    { label: "Chờ", count: standby, color: palette.amber[500] },
    { label: "Lỗi", count: error, color: palette.red[500] },
    { label: "Sạc", count: charging, color: palette.blue[500] },
  ];

  return (
    <View
      style={[
        styles.summaryStrip,
        {
          backgroundColor: isDark ? palette.gray[900] : "#ffffff",
          borderColor: isDark ? palette.gray[800] : palette.gray[200],
        },
      ]}
    >
      {items.map((item) => (
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

/* ─── Empty state / error state ──────────────────────────────────── */
function InlineBanner({
  tone,
  title,
  hint,
  onRetry,
}: {
  tone: "error" | "empty";
  title: string;
  hint?: string;
  onRetry?: () => void;
}) {
  const isDark = useIsDark();
  const bg = tone === "error" ? "rgba(239,68,68,0.10)" : (isDark ? palette.gray[900] : "#ffffff");
  const border = tone === "error" ? palette.red[500] : (isDark ? palette.gray[800] : palette.gray[200]);
  const titleColor = tone === "error" ? palette.red[500] : (isDark ? "#fff" : palette.gray[900]);
  const hintColor = isDark ? palette.gray[400] : palette.gray[500];

  return (
    <View style={[styles.banner, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.bannerTitle, { color: titleColor }]}>{title}</Text>
      {hint ? <Text style={[styles.bannerHint, { color: hintColor }]}>{hint}</Text> : null}
      {onRetry ? (
        <TouchableOpacity onPress={onRetry} style={[styles.retryBtn, { borderColor: palette.violet[600] }]}>
          <Text style={{ color: palette.violet[600], fontSize: 13, fontWeight: "700" }}>
            Thử lại
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

/* ─── Main ─────────────────────────────────────────────────────── */
export default function StaffRobotsPage() {
  const isDark = useIsDark();
  const bg = isDark ? palette.gray[950] : "#f3f4f6";
  const { robots, error, refreshing, reload, onRefresh } = useRobotList();

  const isInitialLoading = robots === null;

  return (
    <View style={[styles.page, { backgroundColor: bg }]}>
      <View
        style={[
          styles.pageHeader,
          { borderBottomColor: isDark ? palette.gray[800] : palette.gray[200] },
        ]}
      >
        <Text style={[styles.pageTitle, { color: isDark ? "#ffffff" : palette.gray[900] }]}>
          Robot
        </Text>
        <Text
          style={[styles.pageSubtitle, { color: isDark ? palette.gray[400] : palette.gray[500] }]}
        >
          {robots ? `${robots.length} robot trong hệ thống` : "Đang tải…"}
        </Text>
      </View>

      {robots && robots.length > 0 ? <SummaryStrip robots={robots} /> : null}

      <ScrollView
        style={styles.robotList}
        contentContainerStyle={styles.robotListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? palette.gray[400] : palette.gray[500]}
          />
        }
      >
        {error ? (
          <InlineBanner
            tone="error"
            title="Không tải được dữ liệu"
            hint={error}
            onRetry={reload}
          />
        ) : null}

        {isInitialLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={palette.violet[600]} />
          </View>
        ) : robots && robots.length === 0 && !error ? (
          <InlineBanner
            tone="empty"
            title="Chưa có robot nào trong hệ thống"
            hint="Hãy thêm robot ở phần quản trị hoặc seed dữ liệu mẫu."
          />
        ) : (
          robots?.map((robot, i) => (
            <RobotCard key={robot.robotCode} robot={robot} index={i} />
          ))
        )}

        <View style={{ height: 8 }} />
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
  center: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  banner: {
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
    padding: 16,
    marginBottom: 8,
    gap: 6,
  },
  bannerTitle: { fontSize: 14, fontWeight: "800" },
  bannerHint: { fontSize: 12, fontWeight: "500" },
  retryBtn: {
    alignSelf: "flex-start",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
  },
});
