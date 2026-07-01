/**
 * SmartMarket Staff App — Fullscreen Fleet Map
 * Reached from Bản Đồ when staff taps a blank area of the small map.
 *
 * Capabilities
 *  - Pan + pinch-to-zoom (driven on the UI thread via Reanimated + worklets)
 *  - Double-tap to zoom in 2× at the focal point
 *  - Pinch focal point is preserved while zooming
 *  - Tap on a robot pin → opens /staff/robot-detail
 *  - Tap on background → no-op (so it doesn't conflict with gestures)
 *  - Reset / fit-to-screen button
 *  - Zoom +/− buttons (bottom-right)
 *
 * Robot pin coordinates come from MAP_ROBOTS.{x,y} (percent of the map's
 * natural size). When an SVG background is added, the SVG should be sized
 * to the same natural dimensions so the pins stay aligned. See
 * BackgroundLayer / MAP constants below for the integration contract.
 */

import React, { useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  type SharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import {
  useIsDark,
  palette,
  DEVICE,
  MAP_ROBOTS,
  robotStatusConfig,
} from "@/constants/theme";
import {
  BotIcon,
  BatteryIcon,
  XIcon,
  RefreshIcon,
  PlusIcon,
  ChevronLeftIcon,
} from "@/components/ui/staff-icons";

/* ─── Map coordinate system ─────────────────────────────────────────
 * The map's *natural* canvas. When the SVG background is added, render
 * it at MAP_WIDTH × MAP_HEIGHT dp inside BackgroundLayer (or, better,
 * use Svg viewBox="0 0 MAP_WIDTH MAP_HEIGHT" + preserveAspectRatio="xMidYMid meet"
 * so robot pin percentages map 1:1 to SVG coordinates).
 */
const MAP_WIDTH = 1000;
const MAP_HEIGHT = 700;

/* ─── Single-robot pin (status-coloured, animated) ───────────────── */
function MapPin({
  robot,
  onPress,
}: {
  robot: (typeof MAP_ROBOTS)[number];
  onPress: (id: string) => void;
}) {
  const isDark = useIsDark();
  const cfg = robotStatusConfig[robot.status];
  const left = (robot.x / 100) * MAP_WIDTH;
  const top = (robot.y / 100) * MAP_HEIGHT;

  return (
    <Pressable
      onPress={() => onPress(robot.id)}
      style={[styles.pinWrap, { left, top }]}
      hitSlop={12}
    >
      <View
        style={[
          styles.pinDot,
          {
            backgroundColor: cfg.dot,
            borderColor: isDark ? palette.gray[950] : "#ffffff",
          },
        ]}
      />
      <View
        style={[
          styles.pinLabel,
          {
            backgroundColor: isDark ? palette.gray[900] : "#ffffff",
            borderColor: isDark ? palette.gray[800] : palette.gray[200],
          },
        ]}
      >
        <Text
          style={[
            styles.pinLabelText,
            { color: isDark ? "#ffffff" : palette.gray[900] },
          ]}
        >
          {robot.id}
        </Text>
      </View>
    </Pressable>
  );
}

/* ─── Background layer (placeholder grid) ──────────────────────────
 * REPLACE THIS when the SVG is provided.
 *
 *  Option A (simplest): import the SVG via react-native-svg-transformer
 *    import StoreSvg from "@/assets/maps/store.svg";
 *    <View style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}>
 *      <StoreSvg width="100%" height="100%" />
 *    </View>
 *
 *  Option B: load via SvgUri / SvgXml
 *    import { SvgXml } from "react-native-svg";
 *    <SvgXml xml={storeXmlString} width="100%" height="100%" />
 *
 *  Option C: keep using react-native-svg primitives and rebuild the
 *    store layout (aisles, walls) in code. Same coordinate system
 *    (MAP_WIDTH × MAP_HEIGHT) so pins still line up.
 *
 *  IMPORTANT: Whatever you use, the rendered element must occupy
 *  exactly MAP_WIDTH × MAP_HEIGHT dp at scale=1.
 */
function BackgroundLayer() {
  const isDark = useIsDark();
  return (
    <View
      style={{
        width: MAP_WIDTH,
        height: MAP_HEIGHT,
        backgroundColor: isDark ? palette.gray[800] : palette.gray[100],
      }}
    >
      {/* Subtle grid */}
      {Array.from({ length: 11 }).map((_, i) => (
        <View
          key={`v-${i}`}
          style={{
            position: "absolute",
            left: (MAP_WIDTH / 10) * i,
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          }}
        />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <View
          key={`h-${i}`}
          style={{
            position: "absolute",
            top: (MAP_HEIGHT / 7) * i,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          }}
        />
      ))}

      {/* SVG slot label so the area is visibly a placeholder */}
      <View style={styles.placeholderBadge}>
        <Text style={styles.placeholderBadgeText}>SVG slot · {MAP_WIDTH}×{MAP_HEIGHT}</Text>
      </View>
    </View>
  );
}

/* ─── Main page ───────────────────────────────────────────────────── */
export default function FleetMapPage() {
  const router = useRouter();
  const isDark = useIsDark();
  const containerW = useRef(0);
  const containerH = useRef(0);

  // Shared values drive the viewport transform on the UI thread.
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const scale = useSharedValue(1);

  // Reanimated style for the inner content layer
  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  /* ── Initial fit: when container is measured, scale to fit & center ── */
  const [ready, setReady] = React.useState(false);
  const fitToScreen = useCallback(() => {
    if (!containerW.current || !containerH.current) return;
    const sx = containerW.current / MAP_WIDTH;
    const sy = containerH.current / MAP_HEIGHT;
    const s = Math.min(sx, sy);
    scale.value = withSpring(s, { stiffness: 180, damping: 22 });
    tx.value = withSpring((containerW.current - MAP_WIDTH * s) / 2, {
      stiffness: 180,
      damping: 22,
    });
    ty.value = withSpring((containerH.current - MAP_HEIGHT * s) / 2, {
      stiffness: 180,
      damping: 22,
    });
  }, [scale, tx, ty]);

  const onContainerLayout = useCallback(
    (e: { nativeEvent: { layout: { width: number; height: number } } }) => {
      containerW.current = e.nativeEvent.layout.width;
      containerH.current = e.nativeEvent.layout.height;
      if (!ready) {
        fitToScreen();
        setReady(true);
      }
    },
    [ready, fitToScreen]
  );

  /* ── Gesture: pinch (with focal point) + pan + double-tap-to-zoom ── */
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
      const newScale = Math.min(Math.max(startScale.value * e.scale, 0.5), 6);
      // Zoom around the pinch focal point
      const fx = e.focalX - containerW.current / 2;
      const fy = e.focalY - containerH.current / 2;
      const ratio = newScale / startScale.value;
      tx.value = fx - (fx - startTx.value) * ratio;
      ty.value = fy - (fy - startTy.value) * ratio;
      scale.value = newScale;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((e) => {
      const fx = e.x - containerW.current / 2;
      const fy = e.y - containerH.current / 2;
      const target = Math.min(scale.value * 2, 6);
      const ratio = target / scale.value;
      tx.value = withSpring(fx - (fx - tx.value) * ratio, {
        stiffness: 180,
        damping: 22,
      });
      ty.value = withSpring(fy - (fy - ty.value) * ratio, {
        stiffness: 180,
        damping: 22,
      });
      scale.value = withSpring(target, { stiffness: 180, damping: 22 });
    });

  const composed = Gesture.Simultaneous(pan, pinch, doubleTap);

  /* ── Public zoom controls (always work, even if gestures don't fire) ── */
  const zoomBy = useCallback(
    (factor: number) => {
      const cx = containerW.current / 2;
      const cy = containerH.current / 2;
      const target = Math.min(Math.max(scale.value * factor, 0.5), 6);
      const ratio = target / scale.value;
      tx.value = withSpring(cx - (cx - tx.value) * ratio, {
        stiffness: 180,
        damping: 22,
      });
      ty.value = withSpring(cy - (cy - ty.value) * ratio, {
        stiffness: 180,
        damping: 22,
      });
      scale.value = withSpring(target, { stiffness: 180, damping: 22 });
    },
    [scale, tx, ty]
  );

  /* ── Pin tap → /staff/robot-detail ── */
  const handlePinPress = useCallback(
    (robotId: string) => {
      router.push(`/staff/robot-detail?id=${robotId}` as any);
    },
    [router]
  );

  /* ── Bottom sheet state ── */
  const [bottomExpanded, setBottomExpanded] = React.useState(true);

  return (
    <View style={[styles.page, { backgroundColor: isDark ? palette.gray[950] : "#e5e7eb" }]}>
      {/* ── Interactive viewport ─────────────────────────────── */}
      <GestureDetector gesture={composed}>
        <Animated.View
          style={styles.viewport}
          onLayout={onContainerLayout}
          collapsable={false}
        >
          <Animated.View style={[styles.content, contentStyle]}>
            <BackgroundLayer />
            {MAP_ROBOTS.map((robot) => (
              <MapPin key={robot.id} robot={robot} onPress={handlePinPress} />
            ))}
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      {/* ── Top controls ─────────────────────────────────────── */}
      <View style={styles.topBar} pointerEvents="box-none">
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.iconBtn,
            {
              backgroundColor: isDark ? "rgba(20,20,30,0.85)" : "rgba(255,255,255,0.92)",
              borderColor: isDark ? palette.gray[800] : palette.gray[200],
            },
          ]}
          activeOpacity={0.8}
        >
          <ChevronLeftIcon size={18} color={isDark ? "#ffffff" : palette.gray[900]} />
        </TouchableOpacity>

        <View
          style={[
            styles.titlePill,
            {
              backgroundColor: isDark ? "rgba(20,20,30,0.85)" : "rgba(255,255,255,0.92)",
              borderColor: isDark ? palette.gray[800] : palette.gray[200],
            },
          ]}
        >
          <Text
            style={[
              styles.titleText,
              { color: isDark ? "#ffffff" : palette.gray[900] },
            ]}
          >
            Bản đồ đội robot
          </Text>
        </View>

        <TouchableOpacity
          onPress={fitToScreen}
          style={[
            styles.iconBtn,
            {
              backgroundColor: isDark ? "rgba(20,20,30,0.85)" : "rgba(255,255,255,0.92)",
              borderColor: isDark ? palette.gray[800] : palette.gray[200],
            },
          ]}
          activeOpacity={0.8}
        >
          <RefreshIcon size={16} color={isDark ? "#ffffff" : palette.gray[900]} />
        </TouchableOpacity>
      </View>

      {/* ── Bottom-right zoom controls ───────────────────────── */}
      <View style={styles.zoomGroup} pointerEvents="box-none">
        <TouchableOpacity
          onPress={() => zoomBy(1.4)}
          style={[
            styles.iconBtn,
            {
              backgroundColor: isDark ? "rgba(20,20,30,0.85)" : "rgba(255,255,255,0.92)",
              borderColor: isDark ? palette.gray[800] : palette.gray[200],
            },
          ]}
          activeOpacity={0.8}
        >
          <PlusIcon size={18} color={isDark ? "#ffffff" : palette.gray[900]} />
        </TouchableOpacity>
        <View
          style={[
            styles.zoomDivider,
            { backgroundColor: isDark ? palette.gray[700] : palette.gray[200] },
          ]}
        />
        <TouchableOpacity
          onPress={() => zoomBy(1 / 1.4)}
          style={[
            styles.iconBtn,
            {
              backgroundColor: isDark ? "rgba(20,20,30,0.85)" : "rgba(255,255,255,0.92)",
              borderColor: isDark ? palette.gray[800] : palette.gray[200],
            },
          ]}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.zoomOutText,
              { color: isDark ? "#ffffff" : palette.gray[900] },
            ]}
          >
            −
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Zoom indicator (subtle, top-center under pill) ──── */}
      <View style={styles.zoomIndicatorWrap} pointerEvents="none">
        <ZoomIndicator scale={scale} />
      </View>

      {/* ── Bottom robot list ───────────────────────────────── */}
      <View
        style={[
          styles.bottomSheet,
          {
            backgroundColor: isDark ? palette.gray[900] : "#ffffff",
            borderColor: isDark ? palette.gray[800] : palette.gray[200],
          },
        ]}
      >
        <View style={styles.bottomHeader}>
          <Text
            style={[
              styles.bottomTitle,
              { color: isDark ? "#ffffff" : palette.gray[900] },
            ]}
          >
            {MAP_ROBOTS.length} robot trên bản đồ
          </Text>
          <TouchableOpacity
            onPress={() => setBottomExpanded((v) => !v)}
            hitSlop={10}
          >
            <Text
              style={[
                styles.bottomToggle,
                { color: palette.violet[500] },
              ]}
            >
              {bottomExpanded ? "Thu gọn" : "Mở rộng"}
            </Text>
          </TouchableOpacity>
        </View>

        {bottomExpanded && (
          <View style={styles.robotList}>
            {MAP_ROBOTS.map((robot) => {
              const cfg = robotStatusConfig[robot.status];
              return (
                <TouchableOpacity
                  key={robot.id}
                  style={[
                    styles.robotRow,
                    {
                      backgroundColor: isDark ? palette.gray[800] : palette.gray[100],
                    },
                  ]}
                  onPress={() => handlePinPress(robot.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.robotAvatar,
                      { backgroundColor: cfg.bgAlpha },
                    ]}
                  >
                    <BotIcon size={14} color={cfg.dot} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.robotId,
                        { color: isDark ? "#ffffff" : palette.gray[900] },
                      ]}
                    >
                      {robot.id}
                    </Text>
                    <Text
                      style={[
                        styles.robotTask,
                        { color: isDark ? palette.gray[400] : palette.gray[500] },
                      ]}
                      numberOfLines={1}
                    >
                      {robot.task}
                    </Text>
                  </View>
                  <View style={styles.robotBattery}>
                    <BatteryIcon
                      size={12}
                      color={
                        robot.battery < 25
                          ? palette.red[500]
                          : isDark
                            ? palette.gray[400]
                            : palette.gray[500]
                      }
                    />
                    <Text
                      style={[
                        styles.robotBatteryText,
                        {
                          color:
                            robot.battery < 25
                              ? palette.red[500]
                              : isDark
                                ? "#ffffff"
                                : palette.gray[900],
                        },
                      ]}
                    >
                      {robot.battery}%
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

/* ─── Live zoom % indicator (worklet-driven) ──────────────────────── */
function ZoomIndicator({ scale }: { scale: SharedValue<number> }) {
  const [label, setLabel] = React.useState("100%");
  const animStyle = useAnimatedStyle(() => ({ opacity: 1 }));
  // JS-side bridge: read shared value periodically
  React.useEffect(() => {
    const id = setInterval(() => {
      setLabel(`${Math.round(scale.value * 100)}%`);
    }, 120);
    return () => clearInterval(id);
  }, [scale]);
  return (
    <Animated.View style={[styles.zoomIndicator, animStyle]}>
      <Text style={styles.zoomIndicatorText}>{label}</Text>
    </Animated.View>
  );
}

/* ─── Styles ──────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  page: { flex: 1 },

  /* Viewport */
  viewport: {
    flex: 1,
    overflow: "hidden",
  },
  content: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
  },

  /* Placeholder badge inside background */
  placeholderBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(124,58,237,0.12)",
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.4)",
  },
  placeholderBadgeText: {
    color: palette.violet[600],
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  /* Pins */
  pinWrap: {
    position: "absolute",
    alignItems: "center",
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  pinLabel: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  pinLabelText: {
    fontSize: 10,
    fontWeight: "800",
  },

  /* Top bar */
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
  titleText: {
    fontSize: 13,
    fontWeight: "800",
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  zoomOutText: {
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 22,
  },

  /* Zoom group */
  zoomGroup: {
    position: "absolute",
    right: 16,
    bottom: 220,
    alignItems: "stretch",
    borderRadius: 12,
    overflow: "hidden",
    gap: 0,
  },
  zoomDivider: {
    height: 1,
    width: "100%",
  },

  /* Zoom indicator */
  zoomIndicatorWrap: {
    position: "absolute",
    top: 64,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  zoomIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  zoomIndicatorText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  /* Bottom sheet */
  bottomSheet: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 16,
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
    padding: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  bottomHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottomTitle: {
    fontSize: 13,
    fontWeight: "800",
  },
  bottomToggle: {
    fontSize: 12,
    fontWeight: "700",
  },
  robotList: {
    gap: 6,
    maxHeight: 220,
  },
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
  robotId: {
    fontSize: 12,
    fontWeight: "800",
  },
  robotTask: {
    fontSize: 11,
  },
  robotBattery: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  robotBatteryText: {
    fontSize: 11,
    fontWeight: "700",
  },
});