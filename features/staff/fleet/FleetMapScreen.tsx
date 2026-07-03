/**
 * FleetMapScreen — fullscreen interactive map with pan / pinch / zoom.
 *
 * Reached from Bản Đồ when staff taps the small map placeholder.
 *
 * Capabilities
 *   - Pan + pinch-to-zoom (driven on the UI thread via Reanimated)
 *   - Double-tap to zoom in 2× at the focal point
 *   - Pinch focal point is preserved while zooming
 *   - Tap on a robot pin → opens /staff/robot-detail?code=XXX
 *   - Reset / fit-to-screen button (top right)
 *   - Zoom +/− buttons (bottom right)
 *   - Bottom sheet with robot list, collapsible
 *
 * Robot pin coordinates come from `NormalizedRobot.position.{x,y}`
 * (in map-units) — see lib/map.ts.
 */
import { useCallback, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import {
  DEVICE,
  palette,
  useIsDark,
} from "@/shared/theme";
import { ChevronLeftIcon, PlusIcon, RefreshIcon } from "@/shared/ui";
import { useFleetMap, useRobotList } from "@/features/staff/hooks";
import { BackgroundLayer } from "./components/BackgroundLayer";
import { MapGraphLayer } from "./components/MapGraphLayer";
import { MapPin } from "./components/MapPin";
import { RobotRow } from "./components/RobotRow";
import { ZoomIndicator } from "./components/ZoomIndicator";
import { MAP_HEIGHT, MAP_WIDTH } from "./lib/map";

const MIN_SCALE = 0.5;
const MAX_SCALE = 6;

export default function FleetMapScreen() {
  const router = useRouter();
  const isDark = useIsDark();
  const containerW = useRef(0);
  const containerH = useRef(0);
  const { robots } = useRobotList();
  const { floorplan } = useFleetMap();

  // Shared values drive the viewport transform on the UI thread.
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const scale = useSharedValue(1);

  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  /* ── Initial fit: when container is measured, scale to fit & center ── */
  const [ready, setReady] = useState(false);

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
    [ready, fitToScreen],
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
      const newScale = Math.min(
        Math.max(startScale.value * e.scale, MIN_SCALE),
        MAX_SCALE,
      );
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
      const target = Math.min(scale.value * 2, MAX_SCALE);
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

  /* ── Public zoom controls ── */
  const zoomBy = useCallback(
    (factor: number) => {
      const cx = containerW.current / 2;
      const cy = containerH.current / 2;
      const target = Math.min(
        Math.max(scale.value * factor, MIN_SCALE),
        MAX_SCALE,
      );
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
    [scale, tx, ty],
  );

  /* ── Pin / row tap → robot detail ── */
  const handleRobotPress = useCallback(
    (robotCode: string) => {
      router.push(
        `/staff/robot-detail?code=${encodeURIComponent(robotCode)}` as any,
      );
    },
    [router],
  );

  const [bottomExpanded, setBottomExpanded] = useState(true);

  const pageBg = isDark ? palette.gray[950] : "#e5e7eb";
  const cardBg = isDark ? palette.gray[900] : "#ffffff";
  const cardBorder = isDark ? palette.gray[800] : palette.gray[200];
  const pillBg = isDark ? "rgba(20,20,30,0.85)" : "rgba(255,255,255,0.92)";

  return (
    <View style={[styles.page, { backgroundColor: pageBg }]}>
      {/* Interactive viewport */}
      <GestureDetector gesture={composed}>
        <Animated.View
          style={styles.viewport}
          onLayout={onContainerLayout}
          collapsable={false}
        >
          <Animated.View style={[styles.content, contentStyle]}>
            {floorplan ? (
              <MapGraphLayer floorplan={floorplan} />
            ) : (
              <BackgroundLayer />
            )}
            {(robots ?? []).map((robot) => (
              <MapPin
                key={robot.robotCode}
                robot={robot}
                onPress={handleRobotPress}
              />
            ))}
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      {/* Top controls */}
      <View style={styles.topBar} pointerEvents="box-none">
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: pillBg, borderColor: cardBorder }]}
          activeOpacity={0.8}
        >
          <ChevronLeftIcon
            size={18}
            color={isDark ? "#ffffff" : palette.gray[900]}
          />
        </TouchableOpacity>

        <View style={[styles.titlePill, { backgroundColor: pillBg, borderColor: cardBorder }]}>
          <Text
            style={[
              styles.titleText,
              { color: isDark ? "#ffffff" : palette.gray[900] },
            ]}
          >
            {floorplan
              ? `${floorplan.mapName} · ${floorplan.nodes.length} node · ${floorplan.edges.length} cạnh`
              : "Bản đồ đội robot"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={fitToScreen}
          style={[styles.iconBtn, { backgroundColor: pillBg, borderColor: cardBorder }]}
          activeOpacity={0.8}
        >
          <RefreshIcon
            size={16}
            color={isDark ? "#ffffff" : palette.gray[900]}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom-right zoom controls */}
      <View style={styles.zoomGroup} pointerEvents="box-none">
        <TouchableOpacity
          onPress={() => zoomBy(1.4)}
          style={[styles.iconBtn, { backgroundColor: pillBg, borderColor: cardBorder }]}
          activeOpacity={0.8}
        >
          <PlusIcon
            size={18}
            color={isDark ? "#ffffff" : palette.gray[900]}
          />
        </TouchableOpacity>
        <View
          style={[
            styles.zoomDivider,
            { backgroundColor: isDark ? palette.gray[700] : palette.gray[200] },
          ]}
        />
        <TouchableOpacity
          onPress={() => zoomBy(1 / 1.4)}
          style={[styles.iconBtn, { backgroundColor: pillBg, borderColor: cardBorder }]}
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

      {/* Zoom indicator */}
      <View style={styles.zoomIndicatorWrap} pointerEvents="none">
        <ZoomIndicator scale={scale} />
      </View>

      {/* Bottom robot list */}
      <View
        style={[
          styles.bottomSheet,
          { backgroundColor: cardBg, borderColor: cardBorder },
        ]}
      >
        <View style={styles.bottomHeader}>
          <Text
            style={[
              styles.bottomTitle,
              { color: isDark ? "#ffffff" : palette.gray[900] },
            ]}
          >
            {robots ? `${robots.length} robot trên bản đồ` : "Đang tải…"}
          </Text>
          <TouchableOpacity
            onPress={() => setBottomExpanded((v) => !v)}
            hitSlop={10}
          >
            <Text style={[styles.bottomToggle, { color: palette.violet[500] }]}>
              {bottomExpanded ? "Thu gọn" : "Mở rộng"}
            </Text>
          </TouchableOpacity>
        </View>

        {bottomExpanded ? (
          <View style={styles.robotList}>
            {(robots ?? []).map((robot) => (
              <RobotRow
                key={robot.robotCode}
                robot={robot}
                onPress={handleRobotPress}
              />
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

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
  bottomTitle: { fontSize: 13, fontWeight: "800" },
  bottomToggle: { fontSize: 12, fontWeight: "700" },
  robotList: { gap: 6, maxHeight: 220 },
});