/**
 * MapScreen — full-screen interactive store map for the Staff app.
 *
 * Uses react-native-svg for all map rendering (see MapCanvas.tsx).
 * Pan/pinch handled by Reanimated animated values driving the
 * transform on an Animated.View container that wraps the SVG canvas.
 * GestureDetector wires pan + pinch only (double-tap disabled).
 * One-tap on a robot pin in the canvas is handled inside MapCanvas.
 *
 * Layers (back → front):
 *   1. SVG Canvas: floorplan + semantic objects + graph + robot pins
 *   2. Animated.View: applies pan/zoom transform on top
 *   3. UI overlays: live pill, top bar, zoom controls, legend, robot list
 *
 * Robot focus: tapping a robot (from list row OR canvas pin) zooms the
 * camera onto the robot, sets `highlightedCode` so the canvas dims the
 * other robots, and pushes the robot detail modal which reads ?code=.
 */
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image as RNImage,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { palette, useIsDark } from "@/shared/theme";
import { BotIcon, ChevronLeftIcon, PlusIcon, RefreshIcon } from "@/shared/ui";
import type { NormalizedRobot } from "@/shared/api";
import { useFleetMap, useRobotList } from "./hooks";
import { MapCanvas } from "./components";
import {
  makeProjection,
  MIN_ZOOM,
  MAX_ZOOM,
  statusHexFor,
  describeRobot,
  type MapProjection,
} from "./lib/map";

/* ─── Constants ─────────────────────────────────────────────────── */

const SPRING = { stiffness: 180, damping: 22 };

const STATUS_LEGEND: { label: string; hex: string }[] = [
  { label: "Đang di chuyển", hex: "#22c55e" },
  { label: "Đang rảnh",    hex: "#4a4458" },
  { label: "Đang tương tác", hex: "#7d5260" },
  { label: "Sạc / ngoại tuyến", hex: "#cac4d0" },
  { label: "Đã tắt nguồn", hex: "#79747e" },
];

/* ─── Zoom indicator (UI-thread shared value → label) ────────────── */

function ZoomIndicator({ scale }: { scale: SharedValue<number> }) {
  const [label, setLabel] = useState("100%");

  useEffect(() => {
    const id = setInterval(() => {
      setLabel(`${Math.round(scale.value * 100)}%`);
    }, 120);
    return () => clearInterval(id);
  }, [scale]);

  return (
    <View style={styles.zoomPill}>
      <Text style={styles.zoomPillText}>{label}</Text>
    </View>
  );
}

/* ─── Robot row inside bottom sheet ──────────────────────────────── */

function RobotRow({
  robot,
  onPress,
  isDark,
}: {
  robot: NormalizedRobot;
  onPress: (code: string) => void;
  isDark: boolean;
}) {
  const cfg = palette;
  const batteryColor =
    robot.batteryPct < 25
      ? palette.red[500]
      : isDark ? palette.gray[400] : palette.gray[500];
  const hex = statusHexFor(robot);

  return (
    <TouchableOpacity
      style={[styles.robotRow, { backgroundColor: isDark ? palette.gray[800] : palette.gray[100] }]}
      onPress={() => onPress(robot.robotCode)}
      activeOpacity={0.7}
    >
      <View style={[styles.robotAvatar, { backgroundColor: `${hex}22` }]}>
        <BotIcon size={14} color={hex} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.robotId, { color: isDark ? "#ffffff" : palette.gray[900] }]}>
          {robot.robotCode}
        </Text>
        <Text style={[styles.robotTask, { color: isDark ? palette.gray[400] : palette.gray[500] }]}>
          {describeRobot(robot)}
        </Text>
      </View>
      <Text style={[styles.batteryText, { color: batteryColor }]}>
        {robot.batteryPct}%
      </Text>
    </TouchableOpacity>
  );
}

/* ─── Status legend (collapsible card, top-left) ────────────────── */

function StatusLegendCard({ isDark }: { isDark: boolean }) {
  const pillBg = isDark ? "rgba(20,20,30,0.85)" : "rgba(255,255,255,0.92)";
  const cardBorder = isDark ? palette.gray[800] : palette.gray[200];
  const textPrimary = isDark ? "#ffffff" : palette.gray[900];
  const textSecondary = isDark ? palette.gray[300] : palette.gray[700];
  // Faint green — easier to read than pure white on the translucent card.
  const titleColor = isDark ? "#86efac" : "#15803d";
  const [expanded, setExpanded] = useState(true);

  return (
    <View style={styles.legendWrap} pointerEvents="box-none">
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={[styles.legendCard, { backgroundColor: pillBg, borderColor: cardBorder }]}
      >
        <Text style={[styles.legendTitle, { color: titleColor }]}>
          Trạng thái Robot
        </Text>
        {expanded
          ? STATUS_LEGEND.map((s) => (
              <View key={s.label} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: s.hex }]} />
                <Text style={[styles.legendLabel, { color: textSecondary }]}>
                  {s.label}
                </Text>
              </View>
            ))
          : null}
      </Pressable>
    </View>
  );
}

/* ─── Bottom robot list ──────────────────────────────────────────── */

function RobotListSheet({
  robots,
  onPress,
  onRefresh,
  refreshing,
  error,
  isDark,
}: {
  robots: NormalizedRobot[];
  onPress: (code: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
  error: string | null;
  isDark: boolean;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <View
      style={[
        styles.sheet,
        { backgroundColor: isDark ? palette.gray[900] : "#ffffff", borderColor: isDark ? palette.gray[800] : palette.gray[200] },
      ]}
    >
      <View style={styles.sheetHeader}>
        <Text style={[styles.sheetTitle, { color: isDark ? "#ffffff" : palette.gray[900] }]}>
          {robots.length > 0 ? `${robots.length} robot trên bản đồ` : "Chưa có robot"}
        </Text>
        <TouchableOpacity onPress={() => setExpanded((v) => !v)} hitSlop={10}>
          <Text style={[styles.sheetToggle, { color: palette.violet[500] }]}>
            {expanded ? "Thu gọn" : "Mở rộng"}
          </Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <Text style={[styles.sheetError, { color: palette.red[500] }]}>{error}</Text>
      ) : null}

      {expanded ? (
        robots.length === 0 && !error ? (
          <View style={styles.sheetCenter}>
            <ActivityIndicator color={palette.violet[600]} />
          </View>
        ) : (
          <ScrollView
            style={styles.robotScroll}
            contentContainerStyle={styles.robotScrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={isDark ? palette.gray[400] : palette.gray[500]}
              />
            }
          >
            {robots.map((r) => (
              <RobotRow
                key={r.robotCode}
                robot={r}
                onPress={onPress}
                isDark={isDark}
              />
            ))}
          </ScrollView>
        )
      ) : null}
    </View>
  );
}

/* ─── Main screen ─────────────────────────────────────────────────── */

export default function MapScreen() {
  const router = useRouter();
  const isDark = useIsDark();
  const { robots, error: robotsError, refreshing, reload: reloadRobots } = useRobotList();
  const { floorplan, error: mapError, stale, onRefresh: refreshMap } = useFleetMap();

  /* ── Image size discovery (from floorplan image) ──────────────── */
  const [imageSize, setImageSize] = useState<{
    naturalWidth: number;
    naturalHeight: number;
  } | null>(null);

  useEffect(() => {
    const raw = floorplan?.floorplanImageUrl;
    if (!raw) { setImageSize(null); return; }
    let cancelled = false;
    const resolved = /^https?:\/\//i.test(raw) ? raw : raw.startsWith("/") ? raw.slice(1) : raw;
    RNImage.getSize(
      resolved,
      (w, h) => {
        if (cancelled) return;
        setImageSize({ naturalWidth: w, naturalHeight: h });
      },
      () => { if (!cancelled) setImageSize(null); },
    );
    return () => { cancelled = true; };
  }, [floorplan?.floorplanImageUrl]);

  const projection: MapProjection = makeProjection(floorplan, imageSize);

  /* ── Transform state ──────────────────────────────────────────── */
  const containerW = useSharedValue(0);
  const containerH = useSharedValue(0);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const scale = useSharedValue(1);
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  /* ── Fit to screen ────────────────────────────────────────────── */
  const fitToScreen = useCallback(() => {
    const cw = containerW.value;
    const ch = containerH.value;
    if (!cw || !ch) return;
    const zoom = Math.min(
      (cw - 60) / projection.widthPx,
      (ch - 60) / projection.heightPx,
      MAX_ZOOM,
    );
    const z = Math.max(MIN_ZOOM, zoom);
    scale.value = withSpring(z, SPRING);
    tx.value = withSpring((cw - projection.widthPx * z) / 2, SPRING);
    ty.value = withSpring((ch - projection.heightPx * z) / 2, SPRING);
  }, [containerH, containerW, projection.heightPx, projection.widthPx, scale, tx, ty]);

  useEffect(() => {
    if (ready) fitToScreen();
  }, [ready, fitToScreen, projection.widthPx, projection.heightPx]);

  /* ── Zoom on a specific robot ─────────────────────────────────
   * Sets highlightedCode (so canvas dims other robots) AND animates
   * the camera to centre the chosen robot pin.
   */
  const zoomOnRobot = useCallback(
    (code: string) => {
      const list = robots ?? [];
      const target = list.find((r) => r.robotCode === code);
      if (!target?.position) return;
      const cw = containerW.value;
      const ch = containerH.value;
      if (!cw || !ch) return;
      const px = target.position.x * projection.pxPerMeter;
      const py = target.position.y * projection.pxPerMeter;
      const targetZoom = Math.min(Math.max(scale.value, 1.6), MAX_ZOOM);
      tx.value = withSpring(cw / 2 - px * targetZoom, SPRING);
      ty.value = withSpring(ch / 2 - py * targetZoom, SPRING);
      scale.value = withSpring(targetZoom, SPRING);
    },
    [containerH, containerW, projection.pxPerMeter, robots, scale, tx, ty],
  );

  /* ── Robot tap (canvas pin or list row) ──────────────────────── */
  const handleRobotPress = useCallback(
    (code: string) => {
      setHighlightedCode((prev) => {
        // Toggle off if tapping the same robot again.
        if (prev === code) return null;
        return code;
      });
      // Zoom on the chosen robot (camera animates either way).
      zoomOnRobot(code);
      router.push(`/staff/robot-detail?code=${encodeURIComponent(code)}` as any);
    },
    [router, zoomOnRobot],
  );

  /* ── Container layout ─────────────────────────────────────────── */
  const onContainerLayout = useCallback(
    (e: { nativeEvent: { layout: { width: number; height: number } } }) => {
      containerW.value = e.nativeEvent.layout.width;
      containerH.value = e.nativeEvent.layout.height;
      if (!ready) {
        fitToScreen();
        setReady(true);
      }
    },
    [containerH, containerW, fitToScreen, ready],
  );

  /* ── Gesture handlers ───────────────────────────────────────────
   * Pan + Pinch only. One-tap on a robot pin handled via TouchableOpacity
   * inside the canvas (Touchable on the SVG element).
   */
  const startTx = useSharedValue(0);
  const startTy = useSharedValue(0);
  const startScale = useSharedValue(1);

  const pan = Gesture.Pan()
    .averageTouches(true)
    .onStart(() => { startTx.value = tx.value; startTy.value = ty.value; })
    .onUpdate((e) => { tx.value = startTx.value + e.translationX; ty.value = startTy.value + e.translationY; });

  const pinch = Gesture.Pinch()
    .onStart(() => { startScale.value = scale.value; startTx.value = tx.value; startTy.value = ty.value; })
    .onUpdate((e) => {
      const ns = Math.min(Math.max(startScale.value * e.scale, MIN_ZOOM), MAX_ZOOM);
      const fx = e.focalX - containerW.value / 2;
      const fy = e.focalY - containerH.value / 2;
      const ratio = ns / startScale.value;
      tx.value = fx - (fx - startTx.value) * ratio;
      ty.value = fy - (fy - startTy.value) * ratio;
      scale.value = ns;
    });

  const composed = Gesture.Simultaneous(pan, pinch);

  /* ── Animated transform style ─────────────────────────────────── */
  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  /* ── Zoom controls ────────────────────────────────────────────── */
  const zoomBy = useCallback(
    (factor: number) => {
      const cw = containerW.value;
      const ch = containerH.value;
      if (!cw || !ch) return;
      const target = Math.min(Math.max(scale.value * factor, MIN_ZOOM), MAX_ZOOM);
      const ratio = target / scale.value;
      tx.value = withSpring((cw / 2) - (cw / 2 - tx.value) * ratio, SPRING);
      ty.value = withSpring((ch / 2) - (ch / 2 - ty.value) * ratio, SPRING);
      scale.value = withSpring(target, SPRING);
    },
    [containerH, containerW, scale, tx, ty],
  );

  /* ── Theme colours ─────────────────────────────────────────────── */
  const pageBg = isDark ? palette.gray[950] : "#e5e7eb";
  const pillBg = isDark ? "rgba(20,20,30,0.85)" : "rgba(255,255,255,0.92)";
  const cardBorder = isDark ? palette.gray[800] : palette.gray[200];
  const textPrimary = isDark ? "#ffffff" : palette.gray[900];

  const robotList = robots ?? [];
  const mapError_ = mapError ?? robotsError;

  return (
    <View style={[styles.page, { backgroundColor: pageBg }]}>
      {/* ── Map viewport ─────────────────────────────────────── */}
      <GestureDetector gesture={composed}>
        <Animated.View
          style={styles.viewport}
          onLayout={onContainerLayout}
          collapsable={false}
        >
          <Animated.View
            style={[styles.canvasContainer, { width: projection.widthPx, height: projection.heightPx }, contentStyle]}
          >
            <MapCanvas
              floorplan={floorplan}
              robots={robotList}
              projection={projection}
              highlightedCode={highlightedCode}
              onRobotPress={handleRobotPress}
            />
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      {/* ── Stale-map banner (shown when /maps/latest disagrees with /maps/stats) ── */}
      {stale ? (
        <View style={styles.staleBannerWrap} pointerEvents="none">
          <View style={styles.staleBanner}>
            <Text style={styles.staleBannerText}>
              ⚠ Bản đồ có thể chưa phải mới nhất — BE API đang trả về sai.
            </Text>
          </View>
        </View>
      ) : null}

      {/* ── Status legend (collapsible card, top-left) ───────────── */}
      <StatusLegendCard isDark={isDark} />

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <View style={styles.topBar} pointerEvents="box-none">
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: pillBg, borderColor: cardBorder }]}
          activeOpacity={0.8}
        >
          <ChevronLeftIcon size={18} color={textPrimary} />
        </TouchableOpacity>

        <View style={[styles.titlePill, { backgroundColor: pillBg, borderColor: cardBorder }]}>
          <Text style={[styles.titleText, { color: textPrimary }]} numberOfLines={1}>
            {floorplan
              ? `${floorplan.mapName} · ${floorplan.nodes.length} node · ${floorplan.edges.length} cạnh`
              : "Bản đồ cửa hàng"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={fitToScreen}
          style={[styles.iconBtn, { backgroundColor: pillBg, borderColor: cardBorder }]}
          activeOpacity={0.8}
        >
          <RefreshIcon size={16} color={textPrimary} />
        </TouchableOpacity>
      </View>

      {/* ── Zoom controls (right) ───────────────────────────────── */}
      <View style={styles.zoomGroup} pointerEvents="box-none">
        <TouchableOpacity
          onPress={() => zoomBy(1.25)}
          style={[styles.iconBtn, { backgroundColor: pillBg, borderColor: cardBorder }]}
          activeOpacity={0.8}
        >
          <PlusIcon size={18} color={textPrimary} />
        </TouchableOpacity>
        <View style={[styles.zoomDivider, { backgroundColor: isDark ? palette.gray[700] : palette.gray[200] }]} />
        <TouchableOpacity
          onPress={() => zoomBy(1 / 1.25)}
          style={[styles.iconBtn, { backgroundColor: pillBg, borderColor: cardBorder }]}
          activeOpacity={0.8}
        >
          <Text style={[styles.zoomOutText, { color: textPrimary }]}>−</Text>
        </TouchableOpacity>
      </View>

      {/* ── Zoom % indicator ────────────────────────────────────── */}
      <View style={styles.zoomIndicatorWrap} pointerEvents="none">
        <ZoomIndicator scale={scale} />
      </View>

      {/* ── Robot list bottom sheet ─────────────────────────────── */}
      <RobotListSheet
        robots={robotList}
        onPress={handleRobotPress}
        onRefresh={reloadRobots}
        refreshing={refreshing}
        error={mapError_}
        isDark={isDark}
      />
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  page: { flex: 1 },

  /* Map viewport */
  viewport: { flex: 1, overflow: "hidden" },
  canvasContainer: {
    position: "absolute",
    left: 0,
    top: 0,
  },

  /* Status legend (top-left, where live pill used to sit) */
  legendWrap: { position: "absolute", top: 70, left: 16, zIndex: 20 },
  legendCard: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  legendTitle: { fontSize: 11, fontWeight: "800" },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11, fontWeight: "600" },

  /* Stale-map banner — sits below the top bar and the legend card */
  staleBannerWrap: { position: "absolute", top: 102, left: 16, right: 16, zIndex: 30 },
  staleBanner: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(245,158,11,0.95)",
    borderWidth: 1,
    borderColor: "#b45309",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  staleBannerText: { color: "#ffffff", fontSize: 12, fontWeight: "700" },

  topBar: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  titlePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    alignItems: "center",
  },
  titleText: { fontSize: 13, fontWeight: "800" },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  zoomOutText: { fontSize: 20, fontWeight: "800", lineHeight: 22 },

  /* Zoom group */
  zoomGroup: {
    position: "absolute",
    right: 16,
    top: 110,
    alignItems: "stretch",
    borderRadius: 12,
    overflow: "hidden",
    gap: 0,
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  zoomDivider: { height: 1, width: "100%" },

  /* Zoom indicator */
  zoomIndicatorWrap: {
    position: "absolute",
    top: 64,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 15,
  },
  zoomPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  zoomPillText: { color: "#ffffff", fontSize: 11, fontWeight: "700", letterSpacing: 0.4 },

  /* Bottom sheet */
  sheet: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 16,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    gap: 8,
    maxHeight: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitle: { fontSize: 13, fontWeight: "800" },
  sheetToggle: { fontSize: 12, fontWeight: "700" },
  sheetError: { fontSize: 11, fontWeight: "600" },
  sheetCenter: { paddingVertical: 20, alignItems: "center", justifyContent: "center" },
  robotScroll: { maxHeight: 200 },
  robotScrollContent: { gap: 6 },

  /* Robot row */
  robotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  robotAvatar: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  robotId: { fontSize: 12, fontWeight: "800" },
  robotTask: { fontSize: 11 },
  batteryText: { fontSize: 11, fontWeight: "700" },
});
