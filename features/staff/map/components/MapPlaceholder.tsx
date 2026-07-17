/**
 * MapPlaceholder — live read-only map preview card on the Fleet overview.
 *
 * Renders the same SVG canvas the fullscreen map uses, but letterboxed to
 * the card's fixed height with `preserveAspectRatio="xMidYMid meet"` so
 * robots + floorplan are visible at a glance. Tapping the card navigates
 * to the fullscreen map (`onOpenFullscreen`).
 *
 * When the floorplan is not yet loaded, falls back to the static
 * "Bản đồ cửa hàng đang cập nhật" empty state so the layout doesn't jump.
 */
import { useState, useEffect } from "react";
import {
  Image as RNImage,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { DEVICE, palette, useIsDark } from "@/shared/theme";
import { GamepadIcon } from "@/shared/ui";
import { type NormalizedRobot, type MapFloorplanDto } from "@/shared/api";
import { MapCanvas } from "./MapCanvas";
import { makeProjection } from "../lib/map";

interface MapPlaceholderProps {
  floorplan: MapFloorplanDto | null;
  robots: NormalizedRobot[];
  onOpenFullscreen?: () => void;
  height?: number;
}

export function MapPlaceholder({
  floorplan,
  robots,
  onOpenFullscreen,
  height = 260,
}: MapPlaceholderProps) {
  const isDark = useIsDark();

  /* The canvas needs the floorplan image's natural pixel size to align
   * robot markers with shelves. Re-resolve it whenever the URL changes. */
  const [imageSize, setImageSize] = useState<
    { naturalWidth: number; naturalHeight: number } | null
  >(null);

  useEffect(() => {
    const raw = floorplan?.floorplanImageUrl;
    if (!raw) {
      setImageSize(null);
      return;
    }
    let cancelled = false;
    const resolved = /^https?:\/\//i.test(raw)
      ? raw
      : raw.startsWith("/")
        ? raw.slice(1)
        : raw;
    RNImage.getSize(
      resolved,
      (w, h) => {
        if (!cancelled) setImageSize({ naturalWidth: w, naturalHeight: h });
      },
      () => {
        if (!cancelled) setImageSize(null);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [floorplan?.floorplanImageUrl]);

  const projection = makeProjection(floorplan, imageSize);

  return (
    <Pressable
      onPress={onOpenFullscreen}
      style={[
        styles.container,
        {
          backgroundColor: isDark ? palette.gray[800] : palette.gray[100],
          borderColor: isDark ? palette.gray[700] : palette.gray[200],
          height,
        },
      ]}
    >
      {floorplan ? (
        <MapCanvas
          floorplan={floorplan}
          robots={robots}
          projection={projection}
          highlightedCode={null}
          width="100%"
          height="100%"
        />
      ) : (
        <View style={styles.empty}>
          <View
            style={[
              styles.emptyIcon,
              {
                backgroundColor: isDark
                  ? "rgba(124,58,237,0.18)"
                  : palette.violet[100],
                borderColor: isDark
                  ? "rgba(124,58,237,0.4)"
                  : palette.violet[300],
              },
            ]}
          >
            <GamepadIcon
              size={22}
              color={isDark ? palette.violet[300] : palette.violet[600]}
            />
          </View>
          <Text
            style={[
              styles.emptyTitle,
              { color: isDark ? "#fff" : palette.gray[900] },
            ]}
          >
            Bản đồ cửa hàng đang cập nhật
          </Text>
          <Text
            style={[
              styles.emptyHint,
              { color: isDark ? palette.gray[400] : palette.gray[500] },
            ]}
          >
            Robot sẽ xuất hiện trên bản đồ khi cửa hàng tải lên sơ đồ tầng.
            Nhấn để xem bản đồ đầy đủ.
          </Text>

          <View style={styles.chips}>
            {STATUS_CHIPS.map((chip) => (
              <View
                key={chip.label}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.05)"
                      : palette.gray[200],
                  },
                ]}
              >
                <View style={[styles.chipDot, { backgroundColor: chip.color }]} />
                <Text
                  style={[
                    styles.chipText,
                    { color: isDark ? palette.gray[300] : palette.gray[700] },
                  ]}
                >
                  {chip.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Pressable>
  );
}

const STATUS_CHIPS: { label: string; color: string }[] = [
  { label: "Hoạt động", color: palette.emerald[500] },
  { label: "Chờ", color: palette.amber[500] },
  { label: "Lỗi", color: palette.red[500] },
  { label: "Sạc", color: palette.blue[500] },
];

const styles = StyleSheet.create({
  container: {
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  gridLine: { position: "absolute" },
  empty: {
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 8,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 15, fontWeight: "800", textAlign: "center" },
  emptyHint: { fontSize: 12, textAlign: "center", lineHeight: 18 },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipText: { fontSize: 11, fontWeight: "600" },
});