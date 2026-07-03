/**
 * MapPlaceholder — the read-only "Bản đồ cửa hàng đang cập nhật" card on
 * the Fleet overview page.
 *
 * Lives in its own component because the FleetMap screen also reuses
 * parts of this visual language (grid backdrop, status chips), and we
 * want one place to change the look.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DEVICE, palette, useIsDark } from "@/shared/theme";
import { GamepadIcon } from "@/shared/ui";

interface MapPlaceholderProps {
  onOpenFullscreen?: () => void;
  /** Optional override of the rendered height. */
  height?: number;
}

export function MapPlaceholder({
  onOpenFullscreen,
  height = 260,
}: MapPlaceholderProps) {
  const isDark = useIsDark();

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
      {/* Light grid backdrop so the area doesn't read as a broken empty box */}
      <View style={StyleSheet.absoluteFill}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={`v-${i}`}
            style={[
              styles.gridLine,
              {
                left: `${i * 20}%`,
                top: 0,
                bottom: 0,
                width: 1,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.06)",
              },
            ]}
          />
        ))}
        {[1, 2, 3, 4].map((i) => (
          <View
            key={`h-${i}`}
            style={[
              styles.gridLine,
              {
                top: `${i * 20}%`,
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.06)",
              },
            ]}
          />
        ))}
      </View>

      {/* Centered empty-state */}
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
        <Text style={[styles.emptyTitle, { color: isDark ? "#fff" : palette.gray[900] }]}>
          Bản đồ cửa hàng đang cập nhật
        </Text>
        <Text
          style={[
            styles.emptyHint,
            { color: isDark ? palette.gray[400] : palette.gray[500] },
          ]}
        >
          Robot sẽ xuất hiện trên bản đồ khi cửa hàng tải lên sơ đồ tầng.
          Hiện tại bạn có thể xem danh sách robot bên dưới.
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