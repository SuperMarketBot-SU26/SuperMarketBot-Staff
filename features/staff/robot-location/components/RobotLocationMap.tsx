/**
 * RobotLocationMap — full-bleed interactive map for the robot-location
 * screen. Mirrors `FleetMapScreen` for the viewport + pan/pinch/double-tap
 * gestures + zoom controls, but renders a single target robot pin instead
 * of the whole fleet and skips the bottom sheet.
 *
 * The target robot's map-unit coordinates are passed in by the parent
 * (which gets them from navigation params today; will be fetched live
 * later).
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
import {
  DEVICE,
  palette,
  useIsDark,
} from "@/shared/theme";
import { PlusIcon } from "@/shared/ui";
import {
  BackgroundLayer,
  MapPin,
  ZoomIndicator,
} from "@/features/staff/fleet";
import { MAP_HEIGHT, MAP_WIDTH, project } from "@/features/staff/fleet/lib/map";
import type { NormalizedRobot } from "@/shared/api";

const MIN_SCALE = 0.5;
const MAX_SCALE = 6;

interface RobotLocationMapProps {
  robot: NormalizedRobot;
}

export function RobotLocationMap({ robot }: RobotLocationMapProps) {
  const isDark = useIsDark();
  const containerW = useRef(0);
  const containerH = useRef(0);

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

  const [ready, setReady] = useState(false);

  /** Centre the viewport on the target robot (with a small padding so the
   * pin tooltip stays comfortably in frame). */
  const focusOnRobot = useCallback(() => {
    if (!containerW.current || !containerH.current) return;
    const { left, top } = project(robot.position);
    // Aim for ~1.4× so the pin reads clearly without being cramped.
    const target = 1.4;
    scale.value = withSpring(target, { stiffness: 180, damping: 22 });
    tx.value = withSpring(
      containerW.current / 2 - left * target,
      { stiffness: 180, damping: 22 },
    );
    ty.value = withSpring(
      containerH.current / 2 - top * target,
      { stiffness: 180, damping: 22 },
    );
  }, [robot.position, scale, tx, ty]);

  const onContainerLayout = useCallback(
    (e: { nativeEvent: { layout: { width: number; height: number } } }) => {
      containerW.current = e.nativeEvent.layout.width;
      containerH.current = e.nativeEvent.layout.height;
      if (!ready) {
        focusOnRobot();
        setReady(true);
      }
    },
    [ready, focusOnRobot],
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

  const pageBg = isDark ? palette.gray[950] : "#e5e7eb";
  const cardBorder = isDark ? palette.gray[800] : palette.gray[200];
  const pillBg = isDark ? "rgba(20,20,30,0.85)" : "rgba(255,255,255,0.92)";

  return (
    <View style={[styles.page, { backgroundColor: pageBg }]}>
      <GestureDetector gesture={composed}>
        <Animated.View
          style={styles.viewport}
          onLayout={onContainerLayout}
          collapsable={false}
        >
          <Animated.View style={[styles.content, contentStyle]}>
            <BackgroundLayer />
            <MapPin robot={robot} onPress={() => {}} />
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      {/* Zoom indicator */}
      <View style={styles.zoomIndicatorWrap} pointerEvents="none">
        <ZoomIndicator scale={scale} />
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

      {/* Footer hint — bottom centred */}
      <View pointerEvents="none" style={styles.hintWrap}>
        <View
          style={[
            styles.hintPill,
            { backgroundColor: pillBg, borderColor: cardBorder },
          ]}
        >
          <Text
            style={[
              styles.hintText,
              { color: isDark ? palette.gray[300] : palette.gray[700] },
            ]}
          >
            Vị trí của {robot.robotCode}
          </Text>
        </View>
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

  /* Zoom indicator */
  zoomIndicatorWrap: {
    position: "absolute",
    top: 16,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  /* Zoom group */
  zoomGroup: {
    position: "absolute",
    right: 16,
    bottom: 96,
    alignItems: "stretch",
    borderRadius: 12,
    overflow: "hidden",
    gap: 0,
  },
  zoomDivider: {
    height: 1,
    width: "100%",
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

  /* Footer hint */
  hintWrap: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 16,
    alignItems: "center",
  },
  hintPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  hintText: {
    fontSize: 12,
    fontWeight: "700",
  },

  /* Avoid header overlap — viewport already excludes the header. */
  deviceHeaderSpacer: { height: DEVICE.headerHeight },
});