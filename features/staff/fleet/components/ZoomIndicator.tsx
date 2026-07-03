/**
 * ZoomIndicator — small live "123%" pill that mirrors the current
 * map scale. Driven entirely off the UI thread; we poll the shared
 * value back to JS at 120ms intervals to update the label.
 */
import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

interface ZoomIndicatorProps {
  scale: SharedValue<number>;
}

export function ZoomIndicator({ scale }: ZoomIndicatorProps) {
  const [label, setLabel] = useState("100%");
  const animStyle = useAnimatedStyle(() => ({ opacity: 1 }));

  useEffect(() => {
    const id = setInterval(() => {
      setLabel(`${Math.round(scale.value * 100)}%`);
    }, 120);
    return () => clearInterval(id);
  }, [scale]);

  return (
    <Animated.View style={[styles.pill, animStyle]}>
      <Text style={styles.text}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  text: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});