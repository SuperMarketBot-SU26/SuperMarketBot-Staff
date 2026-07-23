/**
 * MapScreen — Full-screen Interactive Store Map with Legend & Shelf Inspection.
 *
 * Implements:
 * - Precise 3m x 3m store floorplan SVG with 4 zones & outer dimensions
 * - Pan/Zoom gestures via GestureHandler & Reanimated
 * - Interactive Legend overlay (Chú thích bản đồ)
 * - Interactive shelf/zone inspector sheet
 * - Floating controls (Zoom +/- , Fit to Screen, Toggle Legend)
 * - Fleet list bottom sheet with live status badges
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { palette, useIsDark } from "@/shared/theme";
import {
  BotIcon,
  ChevronLeftIcon,
  CrosshairIcon,
  InfoIcon,
  PlusIcon,
  RefreshIcon,
  XIcon,
} from "@/shared/ui";
import type { NormalizedRobot } from "@/shared/api";
import { useRobotList } from "./hooks";
import { MapCanvas } from "./components";
import {
  makeProjection,
  MIN_ZOOM,
  MAX_ZOOM,
  statusHexFor,
  describeRobot,
} from "./lib/map";
import { LEGEND_ITEMS, ZONES, type Zone } from "./lib/storeLayout";

const SPRING = { stiffness: 180, damping: 22 };
const SCREEN = Dimensions.get("window");

/* ─── Zoom Level Indicator Pill ─── */
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

/* ─── Legend Overlay Card (Chú thích) ─── */
function MapLegendModal({
  visible,
  onClose,
  isDark,
}: {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
}) {
  const cardBg = isDark ? palette.gray[900] : "#ffffff";
  const textColor = isDark ? "#ffffff" : palette.gray[900];
  const subColor = isDark ? palette.gray[400] : palette.gray[600];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[styles.legendModalCard, { backgroundColor: cardBg }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.legendHeader}>
            <View style={styles.legendTitleRow}>
              <InfoIcon size={20} color={palette.violet[500]} />
              <Text style={[styles.legendTitle, { color: textColor }]}>
                Chú thích bản đồ
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <XIcon size={18} color={subColor} />
            </TouchableOpacity>
          </View>

          <View style={styles.legendList}>
            {LEGEND_ITEMS.map((item, idx) => (
              <View key={idx} style={styles.legendItemRow}>
                <View
                  style={[
                    styles.symbolBadge,
                    {
                      backgroundColor: isDark
                        ? palette.gray[800]
                        : palette.gray[100],
                    },
                  ]}
                >
                  <Text style={styles.symbolText}>{item.symbol}</Text>
                </View>
                <View style={styles.legendTextWrap}>
                  <Text style={[styles.legendItemLabel, { color: textColor }]}>
                    : {item.label}
                  </Text>
                  <Text style={[styles.legendItemDesc, { color: subColor }]}>
                    {item.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ─── Zone Details Modal (Shelf Inspector) ─── */
function ZoneDetailModal({
  zone,
  onClose,
  isDark,
}: {
  zone: Zone | null;
  onClose: () => void;
  isDark: boolean;
}) {
  if (!zone) return null;
  const cardBg = isDark ? palette.gray[900] : "#ffffff";
  const textColor = isDark ? "#ffffff" : palette.gray[900];
  const subColor = isDark ? palette.gray[400] : palette.gray[600];

  return (
    <Modal visible={!!zone} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.zoneModalCard, { backgroundColor: cardBg }]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.zoneHeader}>
            <View style={[styles.zoneBadge, { backgroundColor: zone.stroke }]}>
              <Text style={styles.zoneBadgeText}>Zone {zone.zoneNumber}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <XIcon size={18} color={subColor} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.zoneName, { color: textColor }]}>{zone.name}</Text>
          <Text style={[styles.zoneCategory, { color: palette.violet[500] }]}>{zone.category}</Text>
          <Text style={[styles.zoneDesc, { color: subColor }]}>{zone.description}</Text>

          <View style={styles.zoneMetaRow}>
            <View style={[styles.zoneMetaPill, { backgroundColor: isDark ? palette.gray[800] : palette.gray[100] }]}>
              <Text style={[styles.zoneMetaLabel, { color: subColor }]}>Kích thước kệ</Text>
              <Text style={[styles.zoneMetaVal, { color: textColor }]}>{zone.width}m × {zone.height}m</Text>
            </View>
            <View style={[styles.zoneMetaPill, { backgroundColor: isDark ? palette.gray[800] : palette.gray[100] }]}>
              <Text style={[styles.zoneMetaLabel, { color: subColor }]}>Trạng thái hàng</Text>
              <Text style={[styles.zoneMetaVal, { color: "#22c55e" }]}>Đầy đủ</Text>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ─── Robot List Row ─── */
function RobotRow({
  robot,
  onPress,
  isDark,
}: {
  robot: NormalizedRobot;
  onPress: (code: string) => void;
  isDark: boolean;
}) {
  const hex = statusHexFor(robot);
  const batteryColor =
    robot.batteryPct < 25
      ? palette.red[500]
      : robot.batteryPct < 50
      ? palette.amber[500]
      : isDark
      ? palette.gray[400]
      : palette.gray[600];

  return (
    <TouchableOpacity
      style={[
        styles.robotRow,
        { backgroundColor: isDark ? palette.gray[800] : palette.gray[50] },
      ]}
      onPress={() => onPress(robot.robotCode)}
      activeOpacity={0.7}
    >
      <View style={[styles.robotIcon, { backgroundColor: `${hex}25` }]}>
        <BotIcon size={20} color={hex} />
      </View>

      <View style={styles.robotInfo}>
        <Text style={[styles.robotCode, { color: isDark ? "#fff" : palette.gray[900] }]}>
          {robot.robotCode}
        </Text>
        <Text style={[styles.robotStatus, { color: isDark ? palette.gray[400] : palette.gray[500] }]}>
          {describeRobot(robot)}
        </Text>
      </View>

      <View style={styles.robotBattery}>
        <Text style={[styles.batteryText, { color: batteryColor }]}>
          ⚡ {robot.batteryPct}%
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/* ─── Main Screen Component ─── */
export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useIsDark();
  const { robots, refreshing, onRefresh } = useRobotList();

  const [legendVisible, setLegendVisible] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [bottomSheetExpanded, setBottomSheetExpanded] = useState(false);

  /* Viewport dimensions */
  const [viewport, setViewport] = useState({
    width: SCREEN.width,
    height: SCREEN.height,
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setViewport({
        width: Math.max(window.width ?? SCREEN.width, 100),
        height: Math.max(window.height ?? SCREEN.height, 100),
      });
    });
    return () => subscription?.remove();
  }, []);

  /* Projection */
  const projection = useMemo(() => {
    return makeProjection(null, viewport.width, viewport.height);
  }, [viewport.width, viewport.height]);

  /* Transform shared values */
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const scale = useSharedValue(1);

  const fitToScreen = useCallback(() => {
    const vw = viewport.width;
    const vh = viewport.height;
    if (!vw || !vh) return;

    const padding = 20;
    const zoomX = (vw - padding * 2) / projection.widthPx;
    const zoomY = (vh - padding * 2) / projection.heightPx;
    const z = Math.max(MIN_ZOOM, Math.min(zoomX, zoomY, MAX_ZOOM));

    scale.value = withSpring(z, SPRING);
    tx.value = withSpring((vw - projection.widthPx * z) / 2, SPRING);
    ty.value = withSpring((vh - projection.heightPx * z) / 2, SPRING);
  }, [viewport.width, viewport.height, projection.widthPx, projection.heightPx, scale, tx, ty]);

  useEffect(() => {
    const timer = setTimeout(fitToScreen, 100);
    return () => clearTimeout(timer);
  }, [fitToScreen]);

  /* Gestures */
  const startTx = useSharedValue(0);
  const startTy = useSharedValue(0);
  const startScale = useSharedValue(1);

  const pan = Gesture.Pan()
    .averageTouches(true)
    .onStart(() => {
      startTx.value = tx.value;
      startTy.value = ty.value;
    })
    .onUpdate((e) => {
      tx.value = startTx.value + e.translationX;
      ty.value = startTy.value + e.translationY;
    });

  const pinch = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
      startTx.value = tx.value;
      startTy.value = ty.value;
    })
    .onUpdate((e) => {
      const ns = Math.min(
        Math.max(startScale.value * e.scale, MIN_ZOOM),
        MAX_ZOOM,
      );
      const fx = e.focalX - viewport.width / 2;
      const fy = e.focalY - viewport.height / 2;
      const ratio = ns / startScale.value;
      tx.value = fx - (fx - startTx.value) * ratio;
      ty.value = fy - (fy - startTy.value) * ratio;
      scale.value = ns;
    });

  const composed = Gesture.Simultaneous(pan, pinch);

  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  const zoomBy = useCallback(
    (factor: number) => {
      const vw = viewport.width;
      const vh = viewport.height;
      if (!vw || !vh) return;
      const target = Math.min(
        Math.max(scale.value * factor, MIN_ZOOM),
        MAX_ZOOM,
      );
      const ratio = target / scale.value;
      tx.value = withSpring(vw / 2 - (vw / 2 - tx.value) * ratio, SPRING);
      ty.value = withSpring(vh / 2 - (vh / 2 - ty.value) * ratio, SPRING);
      scale.value = withSpring(target, SPRING);
    },
    [viewport.width, viewport.height, scale, tx, ty],
  );

  const handleRobotPress = useCallback(
    (code: string) => {
      router.push(`/staff/robot-detail?code=${encodeURIComponent(code)}` as any);
    },
    [router],
  );

  const pageBg = isDark ? palette.gray[950] : "#f0f2f5";
  const textPrimary = isDark ? "#ffffff" : palette.gray[900];
  const robotList = robots ?? [];

  return (
    <View style={[styles.page, { backgroundColor: pageBg }]}>
      {/* ── 1. Interactive Map Viewport ── */}
      <GestureDetector gesture={composed}>
        <Animated.View style={[styles.viewport, contentStyle]}>
          <MapCanvas
            robots={robotList}
            projection={projection}
            highlightedCode={null}
            selectedZoneId={selectedZone?.id}
            onRobotPress={handleRobotPress}
            onZonePress={(z) => setSelectedZone(z)}
            showLabels={true}
            showDimensions={true}
            width={projection.widthPx}
            height={projection.heightPx}
          />
        </Animated.View>
      </GestureDetector>

      {/* ── 2. Top Bar Navigation ── */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={[styles.topBtn, { backgroundColor: isDark ? palette.gray[800] : "#fff" }]}
          onPress={() => router.back()}
        >
          <ChevronLeftIcon size={20} color={textPrimary} />
        </TouchableOpacity>

        <View style={[styles.titleBox, { backgroundColor: isDark ? palette.gray[800] : "#fff" }]}>
          <Text style={[styles.titleText, { color: textPrimary }]} numberOfLines={1}>
            Sơ đồ Cửa Hàng (3m × 3m)
          </Text>
        </View>

        {/* Legend Button */}
        <TouchableOpacity
          style={[styles.topBtn, { backgroundColor: isDark ? palette.gray[800] : "#fff" }]}
          onPress={() => setLegendVisible(true)}
        >
          <InfoIcon size={18} color={palette.violet[500]} />
        </TouchableOpacity>

        {/* Recenter Button */}
        <TouchableOpacity
          style={[styles.topBtn, { backgroundColor: isDark ? palette.gray[800] : "#fff" }]}
          onPress={fitToScreen}
        >
          <CrosshairIcon size={18} color={palette.violet[500]} />
        </TouchableOpacity>
      </View>

      {/* ── 3. Zoom Controls (Floating Right) ── */}
      <View style={[styles.zoomControls, { bottom: 210 + insets.bottom }]}>
        <TouchableOpacity
          style={[styles.zoomBtn, { backgroundColor: isDark ? palette.gray[800] : "#fff" }]}
          onPress={() => zoomBy(1.4)}
        >
          <PlusIcon size={20} color={textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.zoomBtn, { backgroundColor: isDark ? palette.gray[800] : "#fff" }]}
          onPress={() => zoomBy(1 / 1.4)}
        >
          <Text style={[styles.zoomBtnText, { color: textPrimary }]}>−</Text>
        </TouchableOpacity>
      </View>

      {/* Zoom Level Indicator */}
      <ZoomIndicator scale={scale} />

      {/* ── 4. Bottom Sheet (Robot List & Zone Overview) ── */}
      <View
        style={[
          styles.bottomSheet,
          { backgroundColor: isDark ? palette.gray[900] : "#ffffff" },
        ]}
      >
        <View style={styles.handleContainer}>
          <View
            style={[
              styles.handle,
              { backgroundColor: isDark ? palette.gray[700] : palette.gray[300] },
            ]}
          />
        </View>

        <View style={styles.sheetHeader}>
          <View style={styles.sheetTitleRow}>
            <BotIcon size={20} color={palette.violet[500]} />
            <Text style={[styles.sheetTitle, { color: textPrimary }]}>
              Đội Robot ({robotList.length})
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setBottomSheetExpanded(!bottomSheetExpanded)}
            style={[
              styles.expandBtn,
              { backgroundColor: isDark ? palette.gray[800] : palette.gray[100] },
            ]}
          >
            <Text style={[styles.expandBtnText, { color: palette.violet[500] }]}>
              {bottomSheetExpanded ? "Thu gọn" : "Xem tất cả"}
            </Text>
          </TouchableOpacity>
        </View>

        {bottomSheetExpanded && (
          <ScrollView
            style={styles.robotList}
            contentContainerStyle={styles.robotListContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={palette.violet[500]}
              />
            }
          >
            {robotList.map((r) => (
              <RobotRow
                key={r.robotCode}
                robot={r}
                onPress={handleRobotPress}
                isDark={isDark}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {/* Legend Modal */}
      <MapLegendModal
        visible={legendVisible}
        onClose={() => setLegendVisible(false)}
        isDark={isDark}
      />

      {/* Zone Detail Inspector Modal */}
      <ZoneDetailModal
        zone={selectedZone}
        onClose={() => setSelectedZone(null)}
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  viewport: { ...StyleSheet.absoluteFillObject, overflow: "hidden" },

  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  topBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  titleBox: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  titleText: { fontSize: 14, fontWeight: "800" },

  zoomControls: { position: "absolute", right: 16, gap: 8 },
  zoomBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  zoomBtnText: { fontSize: 24, fontWeight: "700", marginTop: -2 },

  zoomPill: {
    position: "absolute",
    bottom: 220,
    alignSelf: "center",
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  zoomPillText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  handleContainer: { alignItems: "center", paddingVertical: 10 },
  handle: { width: 40, height: 4, borderRadius: 2 },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sheetTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sheetTitle: { fontSize: 17, fontWeight: "800" },
  expandBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  expandBtnText: { fontSize: 13, fontWeight: "700" },

  robotList: { maxHeight: 280 },
  robotListContent: { paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
  robotRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    gap: 12,
  },
  robotIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  robotInfo: { flex: 1 },
  robotCode: { fontSize: 15, fontWeight: "800" },
  robotStatus: { fontSize: 12, marginTop: 2 },
  robotBattery: { paddingHorizontal: 8 },
  batteryText: { fontSize: 13, fontWeight: "800" },

  /* Modal Overlay */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  legendModalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  legendHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  legendTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendTitle: { fontSize: 18, fontWeight: "800" },
  closeBtn: { padding: 4 },
  legendList: { gap: 12 },
  legendItemRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  symbolBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  symbolText: { fontSize: 18, fontWeight: "800" },
  legendTextWrap: { flex: 1 },
  legendItemLabel: { fontSize: 14, fontWeight: "700" },
  legendItemDesc: { fontSize: 12, marginTop: 2 },

  zoneModalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 20,
    padding: 20,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  zoneHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  zoneBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  zoneBadgeText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  zoneName: { fontSize: 18, fontWeight: "800" },
  zoneCategory: { fontSize: 13, fontWeight: "700" },
  zoneDesc: { fontSize: 13, lineHeight: 18 },
  zoneMetaRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  zoneMetaPill: { flex: 1, padding: 10, borderRadius: 10, gap: 2 },
  zoneMetaLabel: { fontSize: 11, fontWeight: "600" },
  zoneMetaVal: { fontSize: 14, fontWeight: "800" },
});
