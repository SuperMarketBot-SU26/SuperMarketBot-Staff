import { useEffect } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
} from "react-native-reanimated";
import { palette, useIsDark } from "@/shared/theme";

function Blob({
  size,
  color,
  initialX,
  initialY,
  offsetX,
  offsetY,
  duration,
}: {
  size: number;
  color: string;
  initialX: number;
  initialY: number;
  offsetX: number;
  offsetY: number;
  duration: number;
}) {
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);

  useEffect(() => {
    translateX.value = withRepeat(
      withSequence(
        withTiming(initialX + offsetX, {
          duration,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(initialX, {
          duration,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );
    translateY.value = withRepeat(
      withSequence(
        withTiming(initialY + offsetY, {
          duration: duration * 1.2, // Slightly offset the Y timing
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(initialY, {
          duration: duration * 1.2,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );
  }, [initialX, initialY, offsetX, offsetY, duration, translateX, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: 0.6,
        },
        animatedStyle,
      ]}
    />
  );
}

export function AnimatedBackground() {
  const isDark = useIsDark();
  const { width, height } = useWindowDimensions();
  // Pure White & Soft Mint Slate palette
  const color1 = palette.emerald[200];
  const color2 = palette.green[100]; 
  const color3 = palette.teal[100];
  
  const bgColor = "#ffffff"; // Always pure white background
  return (
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: bgColor, overflow: "hidden" }]}>
      <Blob
        size={width * 1.2}
        color={color1}
        initialX={-width * 0.4}
        initialY={-height * 0.2}
        offsetX={width * 0.3}
        offsetY={height * 0.1}
        duration={12000}
      />
      <Blob
        size={width * 1.5}
        color={color2}
        initialX={width * 0.2}
        initialY={height * 0.4}
        offsetX={-width * 0.4}
        offsetY={-height * 0.2}
        duration={15000}
      />
      <Blob
        size={width * 1.4}
        color={color3}
        initialX={width * 0.1}
        initialY={-height * 0.3}
        offsetX={width * 0.2}
        offsetY={height * 0.4}
        duration={18000}
      />
      {/* We add an overlay view to soften the blobs further, giving a pseudo-blur effect to the background itself */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: isDark ? "rgba(17,24,39,0.7)" : "rgba(255,255,255,0.6)" }, // Soften overlay
        ]}
      />
    </View>
  );
}
