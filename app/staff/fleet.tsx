/**
 * SmartMarket Staff App — Staff Fleet Map Page
 * Bản Đồ Đội Robot — interactive robot fleet map (single store layout)
 */
import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useIsDark, palette, DEVICE, MAP_ROBOTS } from "@/constants/theme";
import {
  BotIcon,
  BatteryIcon,
  WifiIcon,
  GamepadIcon,
  ChevronRightIcon,
} from "@/components/ui/staff-icons";

/* ─── Store aisle configuration ──────────────────────────────────────── */
const AISLES = [
  { label: "Kệ A", x: 8  },
  { label: "Kệ B", x: 30 },
  { label: "Kệ C", x: 52 },
  { label: "Kệ D", x: 74 },
];

/* ─── Robot Status Dot with pulse animation ──────────────────────────── */
function StatusDot({ status, pulse = false }: { status: "active" | "standby" | "error" | "charging"; pulse?: boolean }) {
  const dotColors = {
    active:   "#34d399",
    standby:  "#fbbf24",
    error:    "#f87171",
    charging: "#60a5fa",
  };
  const dot = dotColors[status];
  const scale = useSharedValue(1);

  if (pulse && status === "active") {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 1000, easing: Easing.out(Easing.ease) }),
        withTiming(1,   { duration: 0 })
      ),
      -1,
      false
    );
  }

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 2 - scale.value,
  }));

  return (
    <View style={styles.statusDotWrapper}>
      {pulse && (
        <Animated.View
          style={[styles.statusDotPulse, { backgroundColor: dot }, pulseStyle]}
        />
      )}
      <View style={[styles.statusDotInner, { backgroundColor: dot }]} />
    </View>
  );
}

/* ─── Map Canvas ─────────────────────────────────────────────────────── */
function MapCanvas({ onRobotPress }: { onRobotPress: (id: string) => void }) {
  const isDark = useIsDark();
  const mapH = 260;

  return (
    <Pressable
      style={[
        styles.mapContainer,
        {
          backgroundColor: isDark ? palette.gray[800] : palette.gray[100],
          borderColor: isDark ? palette.gray[700] : palette.gray[200],
          height: mapH,
        },
      ]}
    >
      {/* Grid lines */}
      <View style={StyleSheet.absoluteFill}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={`v-${i}`}
            style={[styles.gridLine, { left: `${i * 20}%`, top: 0, bottom: 0, width: 1, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }]}
          />
        ))}
        {[1, 2, 3, 4].map((i) => (
          <View
            key={`h-${i}`}
            style={[styles.gridLine, { top: `${i * 20}%`, left: 0, right: 0, height: 1, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }]}
          />
        ))}
      </View>

      {/* Store boundary */}
      <View style={[styles.storeBoundary, { borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)" }]} />

      {/* Store label */}
      <Text style={[styles.mapLabel, { color: isDark ? palette.gray[600] : palette.gray[400] }]}>
        STORE MAP — TẦNG CHÍNH
      </Text>

      {/* Aisle blocks */}
      {AISLES.map((aisle) => (
        <View
          key={aisle.label}
          style={[styles.aisleBlock, { left: `${aisle.x}%`, top: "18%", width: "14%", height: "52%", backgroundColor: isDark ? palette.gray[700] : palette.gray[300] }]}
        >
          <Text style={[styles.aisleLabel, { color: isDark ? palette.gray[500] : palette.gray[400], top: -18 }]}>
            {aisle.label}
          </Text>
          {[0, 1, 2].map((row) => (
            <View key={row} style={[styles.aisleRow, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)", marginTop: row === 0 ? 8 : 4 }]} />
          ))}
        </View>
      ))}

      {/* Entrance label */}
      <View style={[styles.entranceLabel, { backgroundColor: isDark ? "rgba(124,58,237,0.3)" : palette.violet[100], borderColor: isDark ? "rgba(124,58,237,0.5)" : palette.violet[300] }]}>
        <Text style={[styles.entranceLabelText, { color: isDark ? palette.violet[300] : palette.violet[700] }]}>
          LỐI VÀO / RA
        </Text>
      </View>

      {/* Control hint */}
      <View style={[styles.controlHint, { backgroundColor: isDark ? "rgba(124,58,237,0.3)" : "rgba(124,58,237,0.08)", borderColor: isDark ? palette.violet[700] : palette.violet[300] }]}>
        <GamepadIcon size={12} color={isDark ? palette.violet[300] : palette.violet[600]} />
        <Text style={{ color: isDark ? palette.violet[300] : palette.violet[600], fontSize: 11, fontWeight: "500" }}>
          Điều khiển
        </Text>
      </View>

      {/* Robot markers */}
      {MAP_ROBOTS.map((robot) => {
        const dotColors = {
          active:   { bg: "rgba(16,185,129,0.15)", border: "#34d399" },
          standby:  { bg: "rgba(245,158,11,0.15)", border: "#fbbf24" },
          error:    { bg: "rgba(239,68,68,0.15)",  border: "#f87171" },
          charging: { bg: "rgba(59,130,246,0.15)", border: "#60a5fa" },
        } as const;
        const cfg = dotColors[robot.status];
        return (
          <TouchableOpacity
            key={robot.id}
            style={[styles.robotMarker, { left: `${robot.x}%`, top: `${robot.y}%` }]}
            onPress={() => onRobotPress(robot.id)}
            activeOpacity={0.7}
          >
            <StatusDot status={robot.status} pulse />
            <View style={[styles.robotMarkerInner, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
              <BotIcon size={14} color={cfg.border} />
            </View>
            {/* Tooltip */}
            <View style={[styles.robotTooltip, { backgroundColor: isDark ? palette.gray[900] : "#ffffff" }]}>
              <Text style={[styles.robotTooltipId, { color: isDark ? "#ffffff" : palette.gray[900] }]}>
                {robot.id}
              </Text>
              <Text style={[styles.robotTooltipTask, { color: isDark ? palette.gray[400] : palette.gray[500] }]}>
                {robot.task}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </Pressable>
  );
}

/* ─── Robot List Item ────────────────────────────────────────────────── */
function RobotListItem({ robot, index }: { robot: typeof MAP_ROBOTS[0]; index: number }) {
  const isDark = useIsDark();
  const router = useRouter();
  const dotColors = {
    active:   { bg: "rgba(16,185,129,0.15)", border: "#34d399" },
    standby:  { bg: "rgba(245,158,11,0.15)", border: "#fbbf24" },
    error:    { bg: "rgba(239,68,68,0.15)",  border: "#f87171" },
    charging: { bg: "rgba(59,130,246,0.15)", border: "#60a5fa" },
  } as const;
  const cfg = dotColors[robot.status];
  const batteryColor =
    robot.battery < 20 ? palette.red[500] : isDark ? palette.gray[400] : palette.gray[500];

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
        onPress={() => {
          const path = `/staff/robot-detail?id=${robot.id}`;
          router.push(path as any);
        }}
        activeOpacity={0.7}
      >
        <View style={[styles.robotListIcon, { backgroundColor: cfg.bg }]}>
          <BotIcon size={18} color={cfg.border} />
        </View>
        <View style={styles.robotListInfo}>
          <View style={styles.robotListIdRow}>
            <Text style={[styles.robotListId, { color: isDark ? "#ffffff" : palette.gray[900] }]}>
              {robot.id}
            </Text>
            <View style={[styles.robotListStatusDot, { backgroundColor: cfg.border }]} />
          </View>
          <Text
            style={[styles.robotListTask, { color: isDark ? palette.gray[400] : palette.gray[500] }]}
            numberOfLines={1}
          >
            {robot.task}
          </Text>
        </View>
        <View style={styles.robotListMeta}>
          <View style={styles.robotListBattery}>
            <BatteryIcon size={13} color={batteryColor} />
            <Text style={[styles.robotListBatteryText, { color: batteryColor }]}>
              {robot.battery}%
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <WifiIcon size={13} color={isDark ? palette.gray[500] : palette.gray[400]} />
            <ChevronRightIcon size={14} color={isDark ? palette.gray[500] : palette.gray[400]} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

/* ─── Legend ─────────────────────────────────────────────────────────── */
function Legend() {
  const isDark = useIsDark();
  const entries = [
    { label: "Đang hoạt động", color: "#34d399" },
    { label: "Chờ nhiệm vụ",   color: "#fbbf24" },
    { label: "Lỗi / Pin yếu",  color: "#f87171" },
    { label: "Đang sạc",       color: "#60a5fa" },
  ];

  return (
    <View style={styles.legend}>
      {entries.map((e) => (
        <View key={e.label} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: e.color }]} />
          <Text style={[styles.legendLabel, { color: isDark ? palette.gray[400] : palette.gray[500] }]}>
            {e.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function StaffFleetPage() {
  const isDark = useIsDark();
  const router = useRouter();

  const handleRobotPress = (id: string) => {
    const path = `/staff/robot-detail?id=${id}`;
    router.push(path as any);
  };

  return (
    <ScrollView
      style={[styles.page, { backgroundColor: isDark ? palette.gray[950] : "#f3f4f6" }]}
      contentContainerStyle={styles.pageContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Page Header ──────────────────────────────────────────── */}
      <View style={styles.pageHeader}>
        <Text style={[styles.pageTitle, { color: isDark ? "#ffffff" : palette.gray[900] }]}>
          Bản Đồ Đội Robot
        </Text>
        <Text style={[styles.pageSubtitle, { color: isDark ? palette.gray[400] : palette.gray[500] }]}>
          {MAP_ROBOTS.length} robot đang hoạt động
        </Text>
      </View>

      {/* ── Legend ──────────────────────────────────────────────── */}
      <Legend />

      {/* ── Map ────────────────────────────────────────────────── */}
      <MapCanvas onRobotPress={handleRobotPress} />

      {/* ── Robot List ─────────────────────────────────────────── */}
      <View style={styles.robotListSection}>
        <Text style={[styles.sectionTitle, { color: isDark ? "#ffffff" : palette.gray[900] }]}>
          Robot
        </Text>

        <View style={styles.robotList}>
          {MAP_ROBOTS.map((robot, i) => (
            <RobotListItem key={robot.id} robot={robot} index={i} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

/* ─── Styles ────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  page: { flex: 1 },
  pageContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  pageHeader: {
    gap: 4,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  pageSubtitle: {
    fontSize: 13,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 12,
  },
  mapContainer: {
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  gridLine: { position: "absolute" },
  storeBoundary: {
    position: "absolute",
    top: "5%",
    left: "5%",
    right: "5%",
    bottom: "5%",
    borderWidth: 1,
    borderRadius: 8,
  },
  mapLabel: {
    position: "absolute",
    top: 8,
    left: 10,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  aisleBlock: {
    position: "absolute",
    borderRadius: 6,
    paddingTop: 4,
    paddingHorizontal: 2,
  },
  aisleLabel: {
    position: "absolute",
    fontSize: 9,
    fontWeight: "700",
    textAlign: "center",
    width: 60,
    left: -5,
  },
  aisleRow: {
    height: 12,
    borderRadius: 2,
    marginHorizontal: 4,
  },
  entranceLabel: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  entranceLabelText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
  controlHint: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  robotMarker: {
    position: "absolute",
    alignItems: "center",
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  statusDotWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    top: -2,
    right: -2,
  },
  statusDotPulse: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  statusDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  robotMarkerInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  robotTooltip: {
    position: "absolute",
    bottom: 38,
    left: "50%",
    transform: [{ translateX: -50 }],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 100,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  robotTooltipId: {
    fontSize: 12,
    fontWeight: "700",
  },
  robotTooltipTask: {
    fontSize: 10,
    marginTop: 1,
  },
  robotListSection: {
    gap: 8,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  robotList: {
    gap: 8,
  },
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
  robotListInfo: {
    flex: 1,
    gap: 2,
  },
  robotListIdRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  robotListId: {
    fontSize: 14,
    fontWeight: "700",
  },
  robotListStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  robotListTask: {
    fontSize: 12,
  },
  robotListMeta: {
    alignItems: "flex-end",
    gap: 6,
  },
  robotListBattery: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  robotListBatteryText: {
    fontSize: 12,
    fontWeight: "600",
  },
});