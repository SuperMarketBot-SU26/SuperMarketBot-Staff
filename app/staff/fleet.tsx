/**
 * SmartMarket Staff App — Staff Fleet Page
 * Bản Đồ Đội Robot — top-level overview.
 *
 * Map section is an empty-state placeholder for now: the BE has no
 * seeded store-map data yet (no SVG / no `MAP` rows), so we render a
 * "Bản đồ sẽ sớm cập nhật" card and link the user to the robot list.
 *
 * Robot list section uses live data from `GET /api/robots` (+ pose).
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
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import { useIsDark, palette, DEVICE, robotStatusConfig } from "@/constants/theme";
import {
  BotIcon,
  BatteryIcon,
  WifiIcon,
  GamepadIcon,
  ChevronRightIcon,
} from "@/components/ui/staff-icons";
import type { NormalizedRobot } from "@/services/api/robots";
import { useRobotList } from "@/hooks/useRobotList";

/* ─── Map placeholder (read-only empty state for now) ─────────────── */
function MapPlaceholder({ onOpenFullscreen }: { onOpenFullscreen?: () => void }) {
  const isDark = useIsDark();
  const mapH = 260;

  return (
    <Pressable
      onPress={onOpenFullscreen}
      style={[
        styles.mapContainer,
        {
          backgroundColor: isDark ? palette.gray[800] : palette.gray[100],
          borderColor: isDark ? palette.gray[700] : palette.gray[200],
          height: mapH,
        },
      ]}
    >
      {/* Light grid backdrop so the area doesn't read as a broken empty box */}
      <View style={StyleSheet.absoluteFill}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={`v-${i}`}
            style={[
              styles.gridLine,
              {
                left: `${i * 20}%`,
                top: 0,
                bottom: 0,
                width: 1,
                backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
              },
            ]}
          />
        ))}
        {[1, 2, 3, 4].map((i) => (
          <View
            key={`h-${i}`}
            style={[
              styles.gridLine,
              {
                top: `${i * 20}%`,
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
              },
            ]}
          />
        ))}
      </View>

      {/* Centered empty-state */}
      <View style={styles.mapEmpty}>
        <View
          style={[
            styles.mapEmptyIcon,
            {
              backgroundColor: isDark
                ? "rgba(124,58,237,0.18)"
                : palette.violet[100],
              borderColor: isDark
                ? "rgba(124,58,237,0.4)"
                : palette.violet[300],
            },
          ]}
        >
          <GamepadIcon size={22} color={isDark ? palette.violet[300] : palette.violet[600]} />
        </View>
        <Text style={[styles.mapEmptyTitle, { color: isDark ? "#fff" : palette.gray[900] }]}>
          Bản đồ cửa hàng đang cập nhật
        </Text>
        <Text
          style={[
            styles.mapEmptyHint,
            { color: isDark ? palette.gray[400] : palette.gray[500] },
          ]}
        >
          Robot sẽ xuất hiện trên bản đồ khi cửa hàng tải lên sơ đồ tầng.
          Hiện tại bạn có thể xem danh sách robot bên dưới.
        </Text>

        <View style={styles.mapEmptyChips}>
          <View
            style={[
              styles.chip,
              {
                backgroundColor: isDark ? "rgba(255,255,255,0.05)" : palette.gray[200],
              },
            ]}
          >
            <View style={[styles.chipDot, { backgroundColor: palette.emerald[500] }]} />
            <Text style={[styles.chipText, { color: isDark ? palette.gray[300] : palette.gray[700] }]}>
              Hoạt động
            </Text>
          </View>
          <View
            style={[
              styles.chip,
              {
                backgroundColor: isDark ? "rgba(255,255,255,0.05)" : palette.gray[200],
              },
            ]}
          >
            <View style={[styles.chipDot, { backgroundColor: palette.amber[500] }]} />
            <Text style={[styles.chipText, { color: isDark ? palette.gray[300] : palette.gray[700] }]}>
              Chờ
            </Text>
          </View>
          <View
            style={[
              styles.chip,
              {
                backgroundColor: isDark ? "rgba(255,255,255,0.05)" : palette.gray[200],
              },
            ]}
          >
            <View style={[styles.chipDot, { backgroundColor: palette.red[500] }]} />
            <Text style={[styles.chipText, { color: isDark ? palette.gray[300] : palette.gray[700] }]}>
              Lỗi
            </Text>
          </View>
          <View
            style={[
              styles.chip,
              {
                backgroundColor: isDark ? "rgba(255,255,255,0.05)" : palette.gray[200],
              },
            ]}
          >
            <View style={[styles.chipDot, { backgroundColor: palette.blue[500] }]} />
            <Text style={[styles.chipText, { color: isDark ? palette.gray[300] : palette.gray[700] }]}>
              Sạc
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

/* ─── Robot List Item ────────────────────────────────────────────── */
function RobotListItem({ robot, index }: { robot: NormalizedRobot; index: number }) {
  const isDark = useIsDark();
  const router = useRouter();
  const cfg = robotStatusConfig[robot.status as keyof typeof robotStatusConfig];
  const batteryColor =
    robot.batteryPct < 20
      ? palette.red[500]
      : isDark
        ? palette.gray[400]
        : palette.gray[500];

  return (
    <Animated.View entering={FadeIn.delay(index * 70)}>
      <TouchableOpacity
        style={[
          styles.robotListItem,
          {
            backgroundColor: isDark ? palette.gray[800] : palette.gray[50],
            borderColor: isDark ? palette.gray[700] : palette.gray[200],
          },
        ]}
        onPress={() =>
          router.push(
            `/staff/robot-detail?code=${encodeURIComponent(robot.robotCode)}` as any,
          )
        }
        activeOpacity={0.7}
      >
        <View style={[styles.robotListIcon, { backgroundColor: cfg.bgAlpha }]}>
          <BotIcon size={18} color={cfg.dot} />
        </View>
        <View style={styles.robotListInfo}>
          <View style={styles.robotListIdRow}>
            <Text
              style={[styles.robotListId, { color: isDark ? "#ffffff" : palette.gray[900] }]}
            >
              {robot.robotCode}
            </Text>
            <View style={[styles.robotListStatusDot, { backgroundColor: cfg.dot }]} />
          </View>
          <Text
            style={[
              styles.robotListTask,
              { color: isDark ? palette.gray[400] : palette.gray[500] },
            ]}
            numberOfLines={1}
          >
            {robot.position
              ? `Tọa độ (${robot.position.x.toFixed(0)}, ${robot.position.y.toFixed(0)})`
              : "Chưa có tọa độ"}
          </Text>
        </View>
        <View style={styles.robotListMeta}>
          <View style={styles.robotListBattery}>
            <BatteryIcon size={13} color={batteryColor} />
            <Text style={[styles.robotListBatteryText, { color: batteryColor }]}>
              {robot.batteryPct}%
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <WifiIcon size={13} color={isDark ? palette.gray[500] : palette.gray[400]} />
            <ChevronRightIcon
              size={14}
              color={isDark ? palette.gray[500] : palette.gray[400]}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function StaffFleetPage() {
  const isDark = useIsDark();
  const router = useRouter();
  const { robots, error, refreshing, reload, onRefresh } = useRobotList();

  const initialLoading = robots === null;

  return (
    <ScrollView
      style={[styles.page, { backgroundColor: isDark ? palette.gray[950] : "#f3f4f6" }]}
      contentContainerStyle={styles.pageContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDark ? palette.gray[400] : palette.gray[500]}
        />
      }
    >
      {/* ── Page Header ──────────────────────────────────────────── */}
      <View style={styles.pageHeader}>
        <Text style={[styles.pageTitle, { color: isDark ? "#ffffff" : palette.gray[900] }]}>
          Bản Đồ Đội Robot
        </Text>
        <Text
          style={[styles.pageSubtitle, { color: isDark ? palette.gray[400] : palette.gray[500] }]}
        >
          {robots ? `${robots.length} robot đang hoạt động` : "Đang tải…"}
        </Text>
      </View>

      {/* ── Map (read-only empty state for now) ─────────────────── */}
      <MapPlaceholder onOpenFullscreen={() => router.push("/staff/fleet-map" as any)} />

      {/* ── Inline error banner if needed ────────────────────────── */}
      {error ? (
        <View
          style={[
            styles.banner,
            {
              backgroundColor: isDark ? "rgba(239,68,68,0.10)" : palette.red[50],
              borderColor: palette.red[500],
            },
          ]}
        >
          <Text style={{ color: palette.red[500], fontSize: 13, fontWeight: "700" }}>
            {error}
          </Text>
          <TouchableOpacity onPress={reload} style={styles.retryBtn}>
            <Text style={{ color: palette.violet[600], fontSize: 12, fontWeight: "700" }}>
              Thử lại
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* ── Robot List ─────────────────────────────────────────── */}
      <View style={styles.robotListSection}>
        <Text style={[styles.sectionTitle, { color: isDark ? "#ffffff" : palette.gray[900] }]}>
          Robot
        </Text>

        {initialLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={palette.violet[600]} />
          </View>
        ) : robots && robots.length > 0 ? (
          <View style={styles.robotList}>
            {robots.map((robot, i) => (
              <RobotListItem key={robot.robotCode} robot={robot} index={i} />
            ))}
          </View>
        ) : !error ? (
          <View
            style={[
              styles.empty,
              {
                backgroundColor: isDark ? palette.gray[900] : "#ffffff",
                borderColor: isDark ? palette.gray[800] : palette.gray[200],
              },
            ]}
          >
            <Text
              style={[styles.emptyText, { color: isDark ? palette.gray[400] : palette.gray[500] }]}
            >
              Chưa có robot nào trong hệ thống.
            </Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

/* ─── Styles ────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  page: { flex: 1 },
  pageContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  pageHeader: { gap: 4 },
  pageTitle: { fontSize: 22, fontWeight: "800" },
  pageSubtitle: { fontSize: 13 },

  /* Map placeholder */
  mapContainer: {
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  gridLine: { position: "absolute" },
  mapEmpty: {
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 8,
  },
  mapEmptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 4,
  },
  mapEmptyTitle: { fontSize: 15, fontWeight: "800", textAlign: "center" },
  mapEmptyHint: { fontSize: 12, textAlign: "center", lineHeight: 18 },
  mapEmptyChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipText: { fontSize: 11, fontWeight: "600" },

  /* List */
  robotListSection: { gap: 8, marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  robotList: { gap: 8 },
  robotListItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
  },
  robotListIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  robotListInfo: { flex: 1, gap: 2 },
  robotListIdRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  robotListId: { fontSize: 14, fontWeight: "700" },
  robotListStatusDot: { width: 8, height: 8, borderRadius: 4 },
  robotListTask: { fontSize: 12 },
  robotListMeta: { alignItems: "flex-end", gap: 6 },
  robotListBattery: { flexDirection: "row", alignItems: "center", gap: 4 },
  robotListBatteryText: { fontSize: 12, fontWeight: "600" },

  /* Empty / error */
  center: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    padding: 16,
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
    alignItems: "center",
  },
  emptyText: { fontSize: 13 },
  banner: {
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  retryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
});
