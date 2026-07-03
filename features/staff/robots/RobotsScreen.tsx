/**
 * Staff Robots Page — Live list of every robot in the system.
 *
 * Pulls a flat roster; no map (we have no SVG / seed map on the BE yet).
 * Tapping a row opens /staff/robot-detail?code=XXX, which lazily calls
 * `GET /api/robots/{code}/pose` for the live position.
 */
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { palette, useIsDark } from "@/shared/theme";
import { useRobotList } from "@/features/staff/hooks";
import { InlineBanner } from "@/features/staff/fleet";
import { RobotCard } from "./components/RobotCard";
import { SummaryStrip } from "./components/SummaryStrip";

export default function RobotsScreen() {
  const isDark = useIsDark();
  const pageBg = isDark ? palette.gray[950] : "#f3f4f6";
  const headerBorder = isDark ? palette.gray[800] : palette.gray[200];

  const { robots, error, refreshing, reload, onRefresh } = useRobotList();
  const isInitialLoading = robots === null;

  return (
    <View style={[styles.page, { backgroundColor: pageBg }]}>
      <View style={[styles.pageHeader, { borderBottomColor: headerBorder }]}>
        <Text
          style={[
            styles.pageTitle,
            { color: isDark ? "#ffffff" : palette.gray[900] },
          ]}
        >
          Robot
        </Text>
        <Text
          style={[
            styles.pageSubtitle,
            { color: isDark ? palette.gray[400] : palette.gray[500] },
          ]}
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
  robotList: { flex: 1 },
  robotListContent: { padding: 16, gap: 8, paddingBottom: 32 },
  center: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
  },
});