/**
 * Staff Robot Detail Page — live data.
 * Reads ?code=XXX from the URL and calls `GET /api/robots/{code}/pose`
 * (via `getRobot`, which also fetches the roster for battery/mode/status).
 */
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { palette, useIsDark } from "@/shared/theme";
import { DetailHeader } from "./components/DetailHeader";
import { HeroCard } from "./components/HeroCard";
import { InfoCard } from "./components/InfoCard";
import { StatsRow } from "./components/StatsRow";
import { useRobot } from "./hooks/useRobot";

export default function RobotDetailScreen() {
  const isDark = useIsDark();
  const { code } = useLocalSearchParams<{ code?: string }>();
  const pageBg = isDark ? palette.gray[950] : "#f3f4f6";

  const { robot, error, refreshing, reload } = useRobot(code);

  /* ── Loading ── */
  if (robot === undefined) {
    return (
      <View style={[styles.page, { backgroundColor: pageBg }]}>
        <DetailHeader title="Đang tải…" />
        <View style={styles.center}>
          <ActivityIndicator color={palette.violet[600]} />
        </View>
      </View>
    );
  }

  /* ── Not found / error ── */
  if (!robot) {
    return (
      <View style={[styles.page, { backgroundColor: pageBg }]}>
        <DetailHeader title="Không tìm thấy" />
        <View style={styles.center}>
          <Text
            style={[
              styles.notFound,
              { color: isDark ? palette.gray[400] : palette.gray[500] },
            ]}
          >
            {error
              ? error
              : code
                ? `Robot "${code}" không tồn tại trong hệ thống.`
                : "Thiếu mã robot."}
          </Text>
          {code ? (
            <TouchableOpacity
              onPress={() => reload()}
              style={[styles.retry, { borderColor: palette.violet[600] }]}
            >
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }

  /* ── Main view ── */
  return (
    <View style={[styles.page, { backgroundColor: pageBg }]}>
      <DetailHeader title={robot.robotCode} />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentPad}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={reload}
            tintColor={isDark ? palette.gray[400] : palette.gray[500]}
          />
        }
      >
        <HeroCard robot={robot} />
        <StatsRow robot={robot} />
        <InfoCard robot={robot} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { flex: 1 },
  contentPad: { padding: 16, gap: 12, paddingBottom: 32 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  notFound: { fontSize: 15, textAlign: "center" },
  retry: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: palette.violet[600],
    fontSize: 13,
    fontWeight: "700",
  },
});