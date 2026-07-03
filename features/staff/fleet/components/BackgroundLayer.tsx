/**
 * BackgroundLayer — the placeholder grid behind the robot pins on the
 * fullscreen fleet map.
 *
 * REPLACE THIS when the SVG is provided:
 *
 *   Option A (simplest): import the SVG via react-native-svg-transformer
 *     import StoreSvg from "@/assets/maps/store.svg";
 *     <View style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}>
 *       <StoreSvg width="100%" height="100%" />
 *     </View>
 *
 *   Option B: load via SvgUri / SvgXml
 *
 *   Option C: keep using react-native-svg primitives and rebuild the
 *     store layout in code. Same coordinate system (MAP_WIDTH × MAP_HEIGHT)
 *     so pins still line up.
 *
 *   IMPORTANT: whatever you use, the rendered element must occupy
 *   exactly MAP_WIDTH × MAP_HEIGHT dp at scale=1.
 */
import { StyleSheet, Text, View } from "react-native";
import { palette, useIsDark } from "@/shared/theme";
import { MAP_HEIGHT, MAP_WIDTH } from "../lib/map";

export function BackgroundLayer() {
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
            backgroundColor: isDark
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.06)",
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
            backgroundColor: isDark
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.06)",
          }}
        />
      ))}

      {/* SVG slot label so the area is visibly a placeholder */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>SVG slot · {MAP_WIDTH}×{MAP_HEIGHT}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
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
  badgeText: {
    color: palette.violet[600],
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});