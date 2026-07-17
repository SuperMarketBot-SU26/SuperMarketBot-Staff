/**
 * FleetScreen — Bản Đồ Đội Robot overview page.
 *
 * Shows a map placeholder (links to full-screen map) and the live robot list.
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
import { useRobotList } from "./hooks";
import { MapPlaceholder } from "./components/MapPlaceholder";
import { InlineBanner } from "@/shared/ui";
import { RobotCard } from "../robots/components/RobotCard";
import { SummaryStrip } from "../robots/components/SummaryStrip";

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

      {/* Map placeholder (links to fullscreen Skia map) */}
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
          <>
            <SummaryStrip robots={robots} />
            <View style={styles.robotList}>
              {robots.map((robot: NormalizedRobot, i: number) => (
                <RobotCard key={robot.robotCode} robot={robot} index={i} />
              ))}
            </View>
          </>
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
