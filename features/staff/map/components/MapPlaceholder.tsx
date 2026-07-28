/**
 * MapPlaceholder — Live interactive store floorplan preview card on FleetScreen.
 * Pure White container with seamless background.
 */
import { StyleSheet, View } from "react-native";
import { DEVICE } from "@/shared/theme";
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
  height = 280,
}: MapPlaceholderProps) {
  const projection = makeProjection(null, 450, height);

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor: "#ffffff",
          borderColor: "rgba(20,83,45,0.12)",
        },
      ]}
    >
      <MapCanvas
        robots={robots}
        projection={projection}
        showLabels={true}
        showDimensions={false}
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
    width: "100%",
  },
});
