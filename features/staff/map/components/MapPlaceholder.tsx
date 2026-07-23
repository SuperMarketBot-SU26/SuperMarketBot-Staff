/**
 * MapPlaceholder — Live interactive store floorplan preview card on FleetScreen.
 */
import { StyleSheet, View } from "react-native";
import { DEVICE, palette, useIsDark } from "@/shared/theme";
import { type NormalizedRobot, type MapFloorplanDto } from "@/shared/api";
import { MapCanvas } from "./MapCanvas";
import { makeProjection } from "../lib/map";

interface MapPlaceholderProps {
  floorplan?: MapFloorplanDto | null;
  robots: NormalizedRobot[];
  onOpenFullscreen?: () => void;
  height?: number;
}

export function MapPlaceholder({
  robots,
  height = 220,
}: MapPlaceholderProps) {
  const isDark = useIsDark();
  const projection = makeProjection(null, 380, height);

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor: isDark ? "#090d16" : "#f8fafc",
          borderColor: isDark ? palette.gray[700] : palette.gray[200],
        },
      ]}
    >
      <MapCanvas
        robots={robots}
        projection={projection}
        showLabels={false}
        showDimensions={true}
        width="100%"
        height="100%"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
});
