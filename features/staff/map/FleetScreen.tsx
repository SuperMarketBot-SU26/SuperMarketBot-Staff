/**
 * FleetScreen — Bản Đồ Đội Robot overview page.
 * Pure White Theme matching Admin FE 100%.
 */
import { useState } from "react";
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
import { DEVICE, palette } from "@/shared/theme";
import { type NormalizedRobot } from "@/shared/api";
import { useRobotList, useFleetMap } from "./hooks";
import { MapPlaceholder } from "./components/MapPlaceholder";
import { InlineBanner } from "@/shared/ui";
import { RobotCard } from "../robots/components/RobotCard";
import { SummaryStrip } from "../robots/components/SummaryStrip";

export default function FleetScreen() {
  const router = useRouter();
  const { robots, error, refreshing, onRefresh } = useRobotList();
  const { floorplan } = useFleetMap();
  const [estop, setEstop] = useState(false);

  const initialLoading = robots === null;
  const onlineCount = robots?.filter((r) => r.status === "active" || r.status === "standby").length ?? 0;
  const totalCount = robots?.length ?? 0;

  return (
    <View style={[styles.page, { backgroundColor: "#f7faf7" }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: "#ffffff",
            borderBottomColor: "rgba(20,83,45,0.12)",
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <View style={styles.titleRow}>
              <Text style={[styles.headerTitle, { color: "#11201a" }]}>
                Đội Robot Siêu Thị
              </Text>
              <View style={[styles.tealTag, { backgroundColor: "#dcfce7" }]}>
                <Text style={[styles.tealTagText, { color: "#166534" }]}>STAFF OPS</Text>
              </View>
            </View>
            <Text style={[styles.headerSubtitle, { color: "#4a5a52" }]}>
              {initialLoading
                ? "Đang kết nối..."
                : `${onlineCount}/${totalCount} robot đang kết nối`}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {/* Safety E-Stop Button */}
            <Pressable
              onPress={() => setEstop((prev) => !prev)}
              style={[
                styles.estopBtn,
                { backgroundColor: estop ? "#ef4444" : "rgba(239,68,68,0.08)" },
              ]}
            >
              <Text style={[styles.estopText, { color: estop ? "#ffffff" : "#ef4444" }]}>
                {estop ? "🚨 E-STOPPED" : "🚨 E-STOP"}
              </Text>
            </Pressable>

            {/* Live Indicator */}
            {!initialLoading && (
              <View
                style={[
                  styles.liveBadge,
                  { backgroundColor: "#dcfce7" },
                ]}
              >
                <View style={styles.liveDot} />
                <Text style={[styles.liveText, { color: "#15803d" }]}>
                  Live
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Status pills */}
        {!initialLoading && totalCount > 0 && (
          <View style={styles.statusRow}>
            <StatusPill
              label="Hoạt động"
              count={onlineCount}
              color="#16a34a"
            />
            <StatusPill
              label="Đang chạy"
              count={robots?.filter((r) => r.status === "active").length ?? 0}
              color="#2563eb"
            />
            <StatusPill
              label="Sạc pin"
              count={robots?.filter((r) => r.status === "charging").length ?? 0}
              color="#d97706"
            />
            <StatusPill
              label="Báo lỗi"
              count={robots?.filter((r) => r.status === "error").length ?? 0}
              color="#dc2626"
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
            tintColor={palette.green[700]}
          />
        }
      >
        {/* Map preview */}
        <Pressable
          onPress={() => router.push("/staff/fleet-map" as any)}
          style={({ pressed }) => [
            styles.mapCard,
            {
              backgroundColor: "#ffffff",
              borderColor: "rgba(20,83,45,0.12)",
              transform: [{ scale: pressed ? 0.985 : 1 }],
            },
          ]}
        >
          <MapPlaceholder
            floorplan={floorplan}
            robots={robots ?? []}
            height={260}
          />

          {/* Fullscreen hint */}
          <View
            style={[
              styles.mapHint,
              { backgroundColor: "rgba(17,32,26,0.85)" },
            ]}
          >
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
            <Text
              style={[
                styles.sectionTitle,
                { color: "#11201a" },
              ]}
            >
              Danh sách Robot
            </Text>
            {!initialLoading && totalCount > 0 && (
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: "#dcfce7" },
                ]}
              >
                <Text
                  style={[
                    styles.countBadgeText,
                    { color: "#14532d" },
                  ]}
                >
                  {totalCount} Units
                </Text>
              </View>
            )}
          </View>

          {initialLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={palette.green[700]} size="large" />
              <Text
                style={[
                  styles.loadingText,
                  { color: "#4a5a52" },
                ]}
              >
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
            <View
              style={[
                styles.emptyState,
                { backgroundColor: "#ffffff" },
              ]}
            >
              <View
                style={[
                  styles.emptyIcon,
                  { backgroundColor: "#dcfce7" },
                ]}
              >
                <Text style={{ fontSize: 28 }}>🤖</Text>
              </View>
              <Text
                style={[
                  styles.emptyTitle,
                  { color: "#11201a" },
                ]}
              >
                Chưa có robot nào
              </Text>
              <Text
                style={[
                  styles.emptySubtitle,
                  { color: "#4a5a52" },
                ]}
              >
                Robot sẽ xuất hiện khi kết nối hệ thống
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
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <View
      style={[
        styles.statusPill,
        {
          backgroundColor: `${color}12`,
          borderColor: `${color}25`,
        },
      ]}
    >
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text
        style={[
          styles.statusLabel,
          { color: "#4a5a52" },
        ]}
      >
        {label}
      </Text>
      <Text style={[styles.statusCount, { color }]}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  header: {
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    gap: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  tealTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tealTagText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "600",
  },
  estopBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
  },
  estopText: {
    fontSize: 11,
    fontWeight: "800",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22c55e",
  },
  liveText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statusRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 12,
  },
  statusPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: "700",
    flex: 1,
  },
  statusCount: {
    fontSize: 12,
    fontWeight: "800",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  mapCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  mapHint: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  mapHintText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  mapHintArrow: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  mapHintArrowText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
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
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  robotList: {
    gap: 10,
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: "500",
  },
  emptyState: {
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: "center",
  },
});
