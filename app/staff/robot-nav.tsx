/**
 * SmartMarket Staff App — Robot Navigation Screen
 * Reached when staff taps "Xử lý" on a robot alert from the Tasks page.
 *
 * Purpose: ping the robot's current location on the store map and help the
 * staff member walk over to resolve the issue on the spot.
 *
 * Removed (vs. original figma):
 *  - Floor switcher
 *  - Staff location / route polyline
 *
 * Button rename: "Đã đến nơi" → "Đã xử lý"
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeIn,
} from "react-native-reanimated";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useIsDark, palette, DEVICE, MAP_ROBOTS, ROBOTS, robotStatusConfig } from "@/constants/theme";
import {
  BotIcon,
  BatteryIcon,
  WifiIcon,
  MapPinIcon,
  RefreshIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  NavigationIcon,
} from "@/components/ui/staff-icons";

/* ─── Aisle config (matches fleet.tsx visual language) ─────────────── */
const AISLES = [
  { label: "Kệ A", x: 8 },
  { label: "Kệ B", x: 30 },
  { label: "Kệ C", x: 52 },
  { label: "Kệ D", x: 74 },
];

/* ─── Pulsing ring around the target pin ───────────────────────────── */
function PulseRing({ color }: { color: string }) {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0.7);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(2.4, { duration: 1600, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1600, easing: Easing.out(Easing.ease) }),
        withTiming(0.7, { duration: 0 })
      ),
      -1,
      false
    );
  }, [scale, opacity]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.pulseRing,
        { backgroundColor: color },
        ringStyle,
      ]}
    />
  );
}

/* ─── Mini store-map with just the target robot pinned ─────────────── */
function RobotMap({
  x,
  y,
  statusColor,
  robotId,
}: {
  x: number;
  y: number;
  statusColor: string;
  robotId: string;
}) {
  const isDark = useIsDark();

  return (
    <View
      style={[
        styles.mapContainer,
        {
          backgroundColor: isDark ? palette.gray[800] : palette.gray[100],
          borderColor: isDark ? palette.gray[700] : palette.gray[200],
        },
      ]}
    >
      {/* Grid */}
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

      {/* Store boundary */}
      <View
        style={[
          styles.storeBoundary,
          { borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)" },
        ]}
      />

      {/* Label */}
      <Text
        style={[
          styles.mapLabel,
          { color: isDark ? palette.gray[600] : palette.gray[400] },
        ]}
      >
        VỊ TRÍ ROBOT — ĐÃ ĐỊNH VỊ
      </Text>

      {/* Aisles */}
      {AISLES.map((aisle) => (
        <View
          key={aisle.label}
          style={[
            styles.aisleBlock,
            {
              left: `${aisle.x}%`,
              top: "18%",
              width: "14%",
              height: "52%",
              backgroundColor: isDark ? palette.gray[700] : palette.gray[300],
            },
          ]}
        >
          <Text
            style={[
              styles.aisleLabel,
              { color: isDark ? palette.gray[500] : palette.gray[400], top: -18 },
            ]}
          >
            {aisle.label}
          </Text>
          {[0, 1, 2].map((row) => (
            <View
              key={row}
              style={[
                styles.aisleRow,
                {
                  backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
                  marginTop: row === 0 ? 8 : 4,
                },
              ]}
            />
          ))}
        </View>
      ))}

      {/* Target pin */}
      <View
        style={[
          styles.targetPin,
          { left: `${x}%`, top: `${y}%` },
        ]}
      >
        <PulseRing color={statusColor} />
        <View
          style={[
            styles.targetPinInner,
            {
              backgroundColor: isDark ? palette.gray[950] : "#ffffff",
              borderColor: statusColor,
            },
          ]}
        >
          <MapPinIcon size={20} color={statusColor} />
        </View>
        <View
          style={[
            styles.targetTooltip,
            { backgroundColor: isDark ? palette.gray[900] : "#ffffff" },
          ]}
        >
          <Text
            style={[
              styles.targetTooltipId,
              { color: isDark ? "#ffffff" : palette.gray[900] },
            ]}
          >
            {robotId}
          </Text>
          <Text
            style={[
              styles.targetTooltipSub,
              { color: isDark ? palette.gray[400] : palette.gray[500] },
            ]}
          >
            Đang ở đây
          </Text>
        </View>
      </View>
    </View>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────── */
export default function RobotNavPage() {
  const isDark = useIsDark();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const mapRobot = MAP_ROBOTS.find((r) => r.id === id);
  const fullRobot = ROBOTS.find((r) => r.id === id);
  const cfg = fullRobot ? robotStatusConfig[fullRobot.status] : null;

  // Pinging state — simulates a roundtrip to the backend
  const [pinging, setPinging] = useState(false);
  const [pingedAt, setPingedAt] = useState<string>("vừa xong");
  const [resolved, setResolved] = useState(false);

  const handlePing = useCallback(() => {
    if (pinging) return;
    setPinging(true);
    // Simulated network delay
    setTimeout(() => {
      setPinging(false);
      const now = new Date();
      setPingedAt(
        `${now.getHours().toString().padStart(2, "0")}:${now
          .getMinutes()
          .toString()
          .padStart(2, "0")}`
      );
    }, 1200);
  }, [pinging]);

  // Auto-ping once on mount so the staff sees the latest position immediately
  useEffect(() => {
    handlePing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResolved = () => {
    Alert.alert(
      "Xác nhận đã xử lý",
      `Đánh dấu ${id} đã được xử lý xong?`,
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Đã xử lý",
          style: "default",
          onPress: () => {
            setResolved(true);
            // Pop back to the alert list; tasks.tsx reads the resolved state via router events.
            setTimeout(() => router.back(), 400);
          },
        },
      ]
    );
  };

  /* ── Not-found fallback ─────────────────────────────────────────── */
  if (!mapRobot || !fullRobot) {
    return (
      <View style={[styles.page, { backgroundColor: isDark ? palette.gray[950] : "#f3f4f6" }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <ChevronLeftIcon size={20} color={isDark ? "#fff" : palette.gray[900]} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? "#fff" : palette.gray[900] }]}>
            Không tìm thấy
          </Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.notFoundWrap}>
          <Text style={[styles.notFoundText, { color: isDark ? palette.gray[400] : palette.gray[500] }]}>
            Robot "{id}" không tồn tại
          </Text>
        </View>
      </View>
    );
  }

  const bg = isDark ? palette.gray[950] : "#f3f4f6";
  const cardBg = isDark ? palette.gray[900] : "#ffffff";
  const border = isDark ? palette.gray[800] : palette.gray[200];

  const statusLabel = cfg?.label ?? "Không rõ";
  const statusDot = cfg?.dot ?? palette.gray[400];

  return (
    <View style={[styles.page, { backgroundColor: bg }]}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: cardBg,
            borderBottomColor: border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <ChevronLeftIcon size={20} color={isDark ? "#fff" : palette.gray[900]} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.headerLiveDot, { backgroundColor: statusDot }]} />
          <Text style={[styles.headerTitle, { color: isDark ? "#fff" : palette.gray[900] }]}>
            {id}
          </Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Alert summary card ───────────────────────────────── */}
        <Animated.View
          entering={FadeIn.duration(280)}
          style={[
            styles.alertCard,
            {
              backgroundColor: cardBg,
              borderColor: palette.red[500],
            },
          ]}
        >
          <View style={[styles.alertBar, { backgroundColor: palette.red[500] }]} />
          <View style={styles.alertBody}>
            <View style={styles.alertTopRow}>
              <View
                style={[
                  styles.alertIcon,
                  { backgroundColor: isDark ? palette.gray[800] : palette.gray[100] },
                ]}
              >
                <BotIcon size={16} color={palette.red[500]} />
              </View>
              <View style={styles.alertBadges}>
                <View style={[styles.alertBadge, { backgroundColor: palette.red[500] }]}>
                  <Text style={styles.alertBadgeText}>KHẨN CẤP</Text>
                </View>
                <View
                  style={[
                    styles.alertBadge,
                    {
                      backgroundColor: isDark ? palette.gray[700] : palette.gray[100],
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.alertBadgeText,
                      { color: isDark ? palette.gray[400] : palette.gray[500] },
                    ]}
                  >
                    Cần hỗ trợ
                  </Text>
                </View>
              </View>
            </View>

            <Text style={[styles.alertTitle, { color: isDark ? "#fff" : palette.gray[900] }]}>
              {fullRobot.errors[0] ?? "Cần nhân viên hỗ trợ"}
            </Text>
            <Text
              style={[
                styles.alertDetail,
                { color: isDark ? palette.gray[400] : palette.gray[500] },
              ]}
            >
              Hãy đến vị trí của {id} để xử lý trực tiếp.
            </Text>
          </View>
        </Animated.View>

        {/* ── Map card ─────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <NavigationIcon size={14} color={isDark ? palette.gray[400] : palette.gray[500]} />
              <Text style={[styles.sectionTitle, { color: isDark ? "#fff" : palette.gray[900] }]}>
                Vị trí robot
              </Text>
            </View>
            <View style={styles.pingMeta}>
              {pinging ? (
                <ActivityIndicator size="small" color={palette.violet[500]} />
              ) : (
                <ClockIcon size={11} color={isDark ? palette.gray[500] : palette.gray[400]} />
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

          <RobotMap
            x={mapRobot.x}
            y={mapRobot.y}
            statusColor={statusDot}
            robotId={id as string}
          />

          <TouchableOpacity
            style={[
              styles.refreshBtn,
              { backgroundColor: isDark ? palette.gray[800] : palette.gray[100] },
            ]}
            onPress={handlePing}
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

        {/* ── Robot status strip ───────────────────────────────── */}
        <View
          style={[
            styles.statusCard,
            { backgroundColor: cardBg, borderColor: border },
          ]}
        >
          <View style={styles.statusLeft}>
            <View
              style={[
                styles.statusAvatar,
                { backgroundColor: cfg?.bgAlpha ?? "rgba(124,58,237,0.15)" },
              ]}
            >
              <BotIcon size={18} color={statusDot} />
            </View>
            <View>
              <Text style={[styles.statusName, { color: isDark ? "#fff" : palette.gray[900] }]}>
                {fullRobot.id}
              </Text>
              <View style={styles.statusMetaRow}>
                <View style={[styles.statusDotSmall, { backgroundColor: statusDot }]} />
                <Text
                  style={[
                    styles.statusMetaText,
                    { color: isDark ? palette.gray[400] : palette.gray[500] },
                  ]}
                >
                  {statusLabel}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.statusRight}>
            <View style={styles.statusMetric}>
              <BatteryIcon size={14} color={isDark ? palette.gray[400] : palette.gray[500]} />
              <Text style={[styles.statusMetricText, { color: isDark ? "#fff" : palette.gray[900] }]}>
                {fullRobot.battery}%
              </Text>
            </View>
            <View style={styles.statusMetric}>
              <WifiIcon size={14} color={isDark ? palette.gray[400] : palette.gray[500]} />
              <Text style={[styles.statusMetricText, { color: isDark ? "#fff" : palette.gray[900] }]}>
                {fullRobot.signalStrength}%
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Footer actions ────────────────────────────────────── */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: cardBg,
            borderTopColor: border,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            {
              backgroundColor: resolved ? palette.emerald[500] : palette.violet[600],
              opacity: resolved ? 0.7 : 1,
            },
          ]}
          onPress={handleResolved}
          activeOpacity={0.85}
          disabled={resolved}
        >
          {resolved ? (
            <CheckCircleIcon size={18} color="#ffffff" />
          ) : (
            <CheckCircleIcon size={18} color="#ffffff" />
          )}
          <Text style={styles.primaryBtnText}>
            {resolved ? "Đã xử lý" : "Đã xử lý"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ─── Styles ──────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  page: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32, gap: 16 },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
  },

  /* Not-found */
  notFoundWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  notFoundText: { fontSize: 14 },

  /* Alert card */
  alertCard: {
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
    overflow: "hidden",
  },
  alertBar: { height: 3 },
  alertBody: { padding: 14, gap: 8 },
  alertTopRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  alertBadges: { flexDirection: "row", gap: 4 },
  alertBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  alertBadgeText: { color: "#ffffff", fontSize: 10, fontWeight: "700" },
  alertTitle: { fontSize: 15, fontWeight: "800" },
  alertDetail: { fontSize: 13, lineHeight: 20 },

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

  /* Map */
  mapContainer: {
    height: 260,
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  gridLine: { position: "absolute" },
  storeBoundary: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  mapLabel: {
    position: "absolute",
    top: 16,
    left: 16,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  aisleBlock: {
    position: "absolute",
    borderRadius: 6,
    padding: 6,
    justifyContent: "flex-start",
  },
  aisleLabel: { position: "absolute", fontSize: 10, fontWeight: "700" },
  aisleRow: { height: 6, borderRadius: 3, width: "100%" },

  targetPin: {
    position: "absolute",
    width: 0,
    height: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    top: -30,
    left: -30,
  },
  targetPinInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  targetTooltip: {
    position: "absolute",
    bottom: 32,
    left: "50%",
    transform: [{ translateX: -50 }],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 96,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  targetTooltipId: { fontSize: 12, fontWeight: "800" },
  targetTooltipSub: { fontSize: 10, marginTop: 1 },

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

  /* Status card */
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
  },
  statusLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  statusAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statusName: { fontSize: 14, fontWeight: "800" },
  statusMetaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  statusDotSmall: { width: 6, height: 6, borderRadius: 3 },
  statusMetaText: { fontSize: 11, fontWeight: "500" },
  statusRight: { flexDirection: "row", gap: 12 },
  statusMetric: { flexDirection: "row", alignItems: "center", gap: 4 },
  statusMetricText: { fontSize: 12, fontWeight: "700" },

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