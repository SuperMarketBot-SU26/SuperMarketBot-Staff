/**
 * Robot Navigation Screen — reached when staff taps "Xử lý" on a
 * robot alert from the Tasks page.
 *
 * Purpose: ping the robot's current location on the store map and help the
 * staff member walk over to resolve the issue on the spot.
 *
 * The "Đã xử lý" button at the bottom pops a confirmation alert; on confirm
 * it flips the local "resolved" state and pops back to the caller.
 */
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  palette,
  robotStatusConfig,
  useIsDark,
} from "@/shared/theme";
import { CheckCircleIcon, ClockIcon, NavigationIcon, RefreshIcon } from "@/shared/ui";
import { AlertCard } from "./components/AlertCard";
import { MiniRobotMap } from "./components/MiniRobotMap";
import { NavHeader } from "./components/NavHeader";
import { RobotStatusCard } from "./components/RobotStatusCard";
import { useRobotNav } from "./hooks/useRobotNav";

const MAP_FALLBACK_W = 1000;
const MAP_FALLBACK_H = 700;

export default function RobotNavScreen() {
  const isDark = useIsDark();
  const router = useRouter();
  const { code, id } = useLocalSearchParams<{ code?: string; id?: string }>();
  // Tasks page links here as `/staff/robot-nav?id=SMB-01` (legacy)
  // or `/staff/robot-nav?code=SMB-01` (the live route we use elsewhere).
  // Accept both so existing deep-links keep working.
  const robotCode = (code ?? id ?? "") as string;

  const { robot, error, pinging, pingedAt, reload } = useRobotNav(robotCode);
  const [resolved, setResolved] = useState(false);

  const cfg = robot ? robotStatusConfig[robot.status] : null;
  const pageBg = isDark ? palette.gray[950] : "#f3f4f6";
  const cardBg = isDark ? palette.gray[900] : "#ffffff";
  const border = isDark ? palette.gray[800] : palette.gray[200];

  /* ── Loading ── */
  if (robot === undefined) {
    return (
      <View style={[styles.page, { backgroundColor: pageBg }]}>
        <NavHeader title="Đang tải…" statusColor={palette.gray[400]} />
        <View style={styles.notFoundWrap}>
          <ActivityIndicator color={palette.violet[600]} />
        </View>
      </View>
    );
  }

  /* ── Not found ── */
  if (!robot) {
    return (
      <View style={[styles.page, { backgroundColor: pageBg }]}>
        <NavHeader title="Không tìm thấy" statusColor={palette.gray[400]} />
        <View style={styles.notFoundWrap}>
          <Text
            style={[
              styles.notFoundText,
              { color: isDark ? palette.gray[400] : palette.gray[500] },
            ]}
          >
            {error ?? `Robot "${robotCode}" không tồn tại`}
          </Text>
          <TouchableOpacity
            onPress={reload}
            style={[styles.retry, { borderColor: palette.violet[600] }]}
          >
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const statusDot = cfg?.dot ?? palette.gray[400];

  const alertTitle =
    robot.status === "error"
      ? robot.batteryPct < 15
        ? "Pin yếu — cần sạc ngay"
        : "Robot báo lỗi"
      : robot.status === "charging"
        ? "Robot đang sạc"
        : !robot.lastSeenAt
          ? "Robot mất kết nối"
          : "Cần nhân viên hỗ trợ";

  const handleResolved = () => {
    Alert.alert(
      "Xác nhận đã xử lý",
      `Đánh dấu ${robotCode} đã được xử lý xong?`,
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Đã xử lý",
          style: "default",
          onPress: () => {
            setResolved(true);
            setTimeout(() => router.back(), 400);
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.page, { backgroundColor: pageBg }]}>
      <NavHeader title={robot.robotCode} statusColor={statusDot} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Alert summary */}
        <Animated.View entering={FadeIn.duration(280)}>
          <AlertCard
            title={alertTitle}
            detail={`Hãy đến vị trí của ${robot.robotCode} để xử lý trực tiếp.`}
          />
        </Animated.View>

        {/* Map */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <NavigationIcon
                size={14}
                color={isDark ? palette.gray[400] : palette.gray[500]}
              />
              <Text
                style={[
                  styles.sectionTitle,
                  { color: isDark ? "#fff" : palette.gray[900] },
                ]}
              >
                Vị trí robot
              </Text>
            </View>
            <View style={styles.pingMeta}>
              {pinging ? (
                <ActivityIndicator size="small" color={palette.violet[500]} />
              ) : (
                <ClockIcon
                  size={11}
                  color={isDark ? palette.gray[500] : palette.gray[400]}
                />
              )}
              <Text
                style={[
                  styles.pingMetaText,
                  { color: isDark ? palette.gray[500] : palette.gray[400] },
                ]}
              >
                {pinging ? "Đang định vị…" : `Cập nhật ${pingedAt}`}
              </Text>
            </View>
          </View>

          <MiniRobotMap
            x={robot.position?.x ?? MAP_FALLBACK_W / 2}
            y={robot.position?.y ?? MAP_FALLBACK_H / 2}
            statusColor={statusDot}
            robotId={robot.robotCode}
          />

          <TouchableOpacity
            style={[
              styles.refreshBtn,
              {
                backgroundColor: isDark
                  ? palette.gray[800]
                  : palette.gray[100],
              },
            ]}
            onPress={reload}
            activeOpacity={0.7}
            disabled={pinging}
          >
            <RefreshIcon
              size={14}
              color={pinging ? palette.gray[500] : palette.violet[500]}
            />
            <Text
              style={[
                styles.refreshBtnText,
                {
                  color: pinging
                    ? isDark
                      ? palette.gray[500]
                      : palette.gray[400]
                    : palette.violet[600],
                },
              ]}
            >
              {pinging ? "Đang ping…" : "Làm mới vị trí"}
            </Text>
          </TouchableOpacity>
        </View>

        <RobotStatusCard robot={robot} />
      </ScrollView>

      {/* Footer actions */}
      <View
        style={[
          styles.footer,
          { backgroundColor: cardBg, borderTopColor: border },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            {
              backgroundColor: resolved
                ? palette.emerald[500]
                : palette.violet[600],
              opacity: resolved ? 0.7 : 1,
            },
          ]}
          onPress={handleResolved}
          activeOpacity={0.85}
          disabled={resolved}
        >
          <CheckCircleIcon size={18} color="#ffffff" />
          <Text style={styles.primaryBtnText}>Đã xử lý</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32, gap: 16 },

  /* Not-found */
  notFoundWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  notFoundText: { fontSize: 14 },
  retry: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: { color: palette.violet[600], fontSize: 13, fontWeight: "700" },

  /* Section */
  section: { gap: 10 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  pingMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  pingMetaText: { fontSize: 11, fontWeight: "500" },

  /* Refresh button */
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  refreshBtnText: { fontSize: 13, fontWeight: "700" },

  /* Footer */
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});