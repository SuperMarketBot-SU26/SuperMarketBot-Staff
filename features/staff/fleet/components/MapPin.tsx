/**
 * MapPin — single robot pin on the fullscreen fleet map.
 *
 * Status-coloured dot with a tiny code label underneath. Position is
 * already in map-units (see BackgroundLayer / lib/map.ts).
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { palette, robotStatusConfig, useIsDark } from "@/shared/theme";
import { type NormalizedRobot } from "@/shared/api";
import { project } from "../lib/map";

interface MapPinProps {
  robot: NormalizedRobot;
  onPress: (code: string) => void;
}

export function MapPin({ robot, onPress }: MapPinProps) {
  const isDark = useIsDark();
  const cfg = robotStatusConfig[robot.status];
  const { left, top } = project(robot.position);

  return (
    <Pressable
      onPress={() => onPress(robot.robotCode)}
      style={[styles.wrap, { left, top }]}
      hitSlop={12}
    >
      <View
        style={[
          styles.dot,
          {
            backgroundColor: cfg.dot,
            borderColor: isDark ? palette.gray[950] : "#ffffff",
          },
        ]}
      />
      <View
        style={[
          styles.label,
          {
            backgroundColor: isDark ? palette.gray[900] : "#ffffff",
            borderColor: isDark ? palette.gray[800] : palette.gray[200],
          },
        ]}
      >
        <Text
          style={[
            styles.labelText,
            { color: isDark ? "#ffffff" : palette.gray[900] },
          ]}
        >
          {robot.robotCode}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    alignItems: "center",
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  dot: {
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
  label: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  labelText: {
    fontSize: 10,
    fontWeight: "800",
  },
});