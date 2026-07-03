/**
 * Staff Fleet Page — Bản Đồ Đội Robot (top-level overview).
 *
 * Map section is an empty-state placeholder for now: the BE has no
 * seeded store-map data yet (no SVG / no `MAP` rows), so we render a
 * "Bản đồ sẽ sớm cập nhật" card and link the user to the robot list.
 *
 * Robot list section uses live data from `GET /api/robots` (+ pose).
 */
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { palette, useIsDark } from "@/shared/theme";
import { type NormalizedRobot } from "@/shared/api";
import { useRobotList } from "@/features/staff/hooks";
import { FleetRobotListItem } from "./components/FleetRobotListItem";
import { InlineBanner } from "./components/InlineBanner";
import { MapPlaceholder } from "./components/MapPlaceholder";

export default function FleetScreen() {
  const isDark = useIsDark();
  const router = useRouter();
  const { robots, error, refreshing, reload, onRefresh } = useRobotList();

  const initialLoading = robots === null;
  const pageBg = isDark ? palette.gray[950] : "#f3f4f6";

  return (
    <ScrollView
      style={[styles.page, { backgroundColor: pageBg }]}
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
      {/* Page header */}
      <View style={styles.pageHeader}>
        <Text
          style={[
            styles.pageTitle,
            { color: isDark ? "#ffffff" : palette.gray[900] },
          ]}
        >
          Bản Đồ Đội Robot
        </Text>
        <Text
          style={[
            styles.pageSubtitle,
            { color: isDark ? palette.gray[400] : palette.gray[500] },
          ]}
        >
          {robots ? `${robots.length} robot đang hoạt động` : "Đang tải…"}
        </Text>
      </View>

      {/* Map (read-only empty state) */}
      <MapPlaceholder
        onOpenFullscreen={() => router.push("/staff/fleet-map" as any)}
      />

      {/* Inline error banner */}
      {error ? (
        <View style={{ marginTop: 4 }}>
          <InlineBanner tone="error" title={error} onRetry={reload} />
        </View>
      ) : null}

      {/* Robot list */}
      <View style={styles.robotListSection}>
        <Text
          style={[
            styles.sectionTitle,
            { color: isDark ? "#ffffff" : palette.gray[900] },
          ]}
        >
          Robot
        </Text>

        {initialLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={palette.violet[600]} />
          </View>
        ) : robots && robots.length > 0 ? (
          <View style={styles.robotList}>
            {robots.map((robot: NormalizedRobot, i: number) => (
              <FleetRobotListItem key={robot.robotCode} robot={robot} index={i} />
            ))}
          </View>
        ) : !error ? (
          <InlineBanner
            tone="empty"
            title="Chưa có robot nào trong hệ thống."
          />
        ) : null}
      </View>
    </ScrollView>
  );
}

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
  robotListSection: { gap: 8, marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  robotList: { gap: 8 },
  center: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});