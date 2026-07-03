/**
 * PulseRing — animated pulsing halo around the target pin on the
 * robot-navigation screen. Driven entirely on the UI thread.
 */
import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet } from "react-native";

interface PulseRingProps {
  color: string;
}

export function PulseRing({ color }: PulseRingProps) {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0.7);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(2.4, { duration: 1600, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1600, easing: Easing.out(Easing.ease) }),
        withTiming(0.7, { duration: 0 }),
      ),
      -1,
      false,
    );
  }, [scale, opacity]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.ring, { backgroundColor: color }, ringStyle]}
    />
  );
}

const styles = StyleSheet.create({
  ring: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    top: -30,
    left: -30,
  },
});