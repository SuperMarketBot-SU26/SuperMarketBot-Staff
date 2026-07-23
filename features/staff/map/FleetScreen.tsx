/**
 * FleetScreen — Bản Đồ Đội Robot overview page.
 *
 * Modern UI với glassmorphism cards, smooth animations,
 * và polished robot list.
 */
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { DEVICE, palette, useIsDark } from "@/shared/theme";
import { type NormalizedRobot } from "@/shared/api";
import { useRobotList, useFleetMap } from "./hooks";
import { MapPlaceholder } from "./components/MapPlaceholder";
import { InlineBanner } from "@/shared/ui";
import { RobotCard } from "../robots/components/RobotCard";
import { SummaryStrip } from "../robots/components/SummaryStrip";

export default function FleetScreen() {
  const isDark = useIsDark();
  const router = useRouter();
  const { robots, error, refreshing, onRefresh } = useRobotList();
  const { floorplan } = useFleetMap();

  const initialLoading = robots === null;
  const onlineCount = robots?.filter((r) => r.status === "active" || r.status === "standby").length ?? 0;
  const totalCount = robots?.length ?? 0;

  const bgGradient = isDark
    ? ["#0f172a", "#1e293b"]
    : ["#f8fafc", "#f1f5f9"];

  return (
    <View style={[styles.page, { backgroundColor: isDark ? palette.gray[950] : "#f8fafc" }]}>
      {/* Header */}
      <View style={[
        styles.header,
        { backgroundColor: isDark ? palette.gray[900] : "#ffffff" }
      ]}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={[
              styles.headerTitle,
              { color: isDark ? "#ffffff" : palette.gray[900] }
            ]}>
              Đội Robot
            </Text>
            <Text style={[
              styles.headerSubtitle,
              { color: isDark ? palette.gray[400] : palette.gray[500] }
            ]}>
              {initialLoading
                ? "Đang kết nối..."
                : `${onlineCount}/${totalCount} robot hoạt động`}
            </Text>
          </View>

          {/* Live indicator */}
          {!initialLoading && (
            <View style={[
              styles.liveBadge,
              {
                backgroundColor: isDark
                  ? "rgba(34,197,94,0.15)"
                  : "rgba(34,197,94,0.1)"
              }
            ]}>
              <View style={styles.liveDot} />
              <Text style={[
                styles.liveText,
                { color: "#22c55e" }
              ]}>
                Live
              </Text>
            </View>
          )}
        </View>

        {/* Status pills */}
        {!initialLoading && totalCount > 0 && (
          <View style={styles.statusRow}>
            <StatusPill
              label="Hoạt động"
              count={onlineCount}
              color="#22c55e"
              isDark={isDark}
            />
            <StatusPill
              label="Đang chạy"
              count={robots?.filter((r) => r.status === "active").length ?? 0}
              color="#3b82f6"
              isDark={isDark}
            />
            <StatusPill
              label="Sạc pin"
              count={robots?.filter((r) => r.status === "charging").length ?? 0}
              color="#f59e0b"
              isDark={isDark}
            />
            <StatusPill
              label="Báo lỗi"
              count={robots?.filter((r) => r.status === "error").length ?? 0}
              color="#ef4444"
              isDark={isDark}
            />
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={palette.violet[500]}
            colors={[palette.violet[500]]}
          />
        }
      >
        {/* Map preview */}
        <Pressable
          onPress={() => router.push("/staff/fleet-map" as any)}
          style={({ pressed }) => [
            styles.mapCard,
            {
              backgroundColor: isDark ? palette.gray[800] : "#ffffff",
              borderColor: isDark ? palette.gray[700] : palette.gray[200],
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          <MapPlaceholder
            floorplan={floorplan}
            robots={robots ?? []}
            height={200}
          />

          {/* Fullscreen hint */}
          <View style={[
            styles.mapHint,
            { backgroundColor: isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.4)" }
          ]}>
            <Text style={styles.mapHintText}>Nhấn để xem bản đồ đầy đủ</Text>
            <View style={styles.mapHintArrow}>
              <Text style={styles.mapHintArrowText}>→</Text>
            </View>
          </View>
        </Pressable>

        {/* Error banner */}
        {error ? (
          <View style={{ marginTop: 4 }}>
            <InlineBanner tone="error" title={error} />
          </View>
        ) : null}

        {/* Robot list */}
        <View style={styles.robotListSection}>
          <View style={styles.sectionHeader}>
            <Text style={[
              styles.sectionTitle,
              { color: isDark ? "#ffffff" : palette.gray[900] }
            ]}>
              Danh sách Robot
            </Text>
            {!initialLoading && totalCount > 0 && (
              <View style={[
                styles.countBadge,
                { backgroundColor: isDark ? palette.gray[700] : palette.gray[100] }
              ]}>
                <Text style={[
                  styles.countBadgeText,
                  { color: isDark ? palette.gray[300] : palette.gray[600] }
                ]}>
                  {totalCount}
                </Text>
              </View>
            )}
          </View>

          {initialLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={palette.violet[500]} size="large" />
              <Text style={[
                styles.loadingText,
                { color: isDark ? palette.gray[400] : palette.gray[500] }
              ]}>
                Đang tải danh sách robot...
              </Text>
            </View>
          ) : robots && robots.length > 0 ? (
            <>
              <SummaryStrip robots={robots} />
              <View style={styles.robotList}>
                {robots.map((robot: NormalizedRobot, i: number) => (
                  <RobotCard key={robot.robotCode} robot={robot} index={i} />
                ))}
              </View>
            </>
          ) : !error ? (
            <View style={[
              styles.emptyState,
              { backgroundColor: isDark ? palette.gray[800] : "#ffffff" }
            ]}>
              <View style={[
                styles.emptyIcon,
                { backgroundColor: isDark ? "rgba(124,58,237,0.2)" : palette.violet[50] }
              ]}>
                <Text style={{ fontSize: 24 }}>🤖</Text>
              </View>
              <Text style={[
                styles.emptyTitle,
                { color: isDark ? "#ffffff" : palette.gray[900] }
              ]}>
                Chưa có robot nào
              </Text>
              <Text style={[
                styles.emptySubtitle,
                { color: isDark ? palette.gray[400] : palette.gray[500] }
              ]}>
                Robot sẽ xuất hiện khi được kết nối với hệ thống
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function StatusPill({
  label,
  count,
  color,
  isDark,
}: {
  label: string;
  count: number;
  color: string;
  isDark: boolean;
}) {
  return (
    <View style={[
      styles.statusPill,
      {
        backgroundColor: isDark ? palette.gray[800] : `${color}15`,
        borderColor: isDark ? palette.gray[700] : `${color}30`,
      }
    ]}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={[
        styles.statusLabel,
        { color: isDark ? palette.gray[300] : palette.gray[600] }
      ]}>
        {label}
      </Text>
      <Text style={[styles.statusCount, { color }]}>
        {count}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
  },
  liveText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    flexWrap: "wrap",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  statusCount: {
    fontSize: 13,
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },
  mapCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  mapHint: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  mapHintText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },
  mapHintArrow: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  mapHintArrowText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  robotListSection: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  robotList: {
    gap: 10,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    borderRadius: 20,
    gap: 12,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
