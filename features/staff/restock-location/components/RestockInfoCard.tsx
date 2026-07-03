/**
 * RestockInfoCard — strip below the map on the restock-location screen.
 *
 * Renders a 3-metric strip (slot code / shelf location / product) mirroring
 * the visual language of `RobotStatusCard` but lighter (no avatar).
 */
import { StyleSheet, Text, View } from "react-native";
import { DEVICE, palette, useIsDark } from "@/shared/theme";
import { MapPinIcon, ShoppingBagIcon } from "@/shared/ui";

interface RestockInfoCardProps {
  slotCode: string;
  shelfLocation: string;
  productName: string;
  emptyPercentage: number;
}

export function RestockInfoCard({
  slotCode,
  shelfLocation,
  productName,
  emptyPercentage,
}: RestockInfoCardProps) {
  const isDark = useIsDark();
  const cardBg = isDark ? palette.gray[900] : "#ffffff";
  const border = isDark ? palette.gray[800] : palette.gray[200];
  const muted = isDark ? palette.gray[400] : palette.gray[500];
  const heading = isDark ? "#ffffff" : palette.gray[900];

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
      <View style={styles.row}>
        <View style={styles.metric}>
          <Text style={[styles.label, { color: muted }]}>MÃ KỆ</Text>
          <Text style={[styles.value, { color: heading }]}>{slotCode}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.metric}>
          <Text style={[styles.label, { color: muted }]}>VỊ TRÍ</Text>
          <Text style={[styles.value, { color: heading }]} numberOfLines={1}>
            {shelfLocation}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.metric}>
          <Text style={[styles.label, { color: muted }]}>TRỐNG</Text>
          <Text style={[styles.value, { color: palette.red[500] }]}>
            {emptyPercentage}%
          </Text>
        </View>
      </View>

      <View style={[styles.separator, { backgroundColor: border }]} />

      <View style={styles.footer}>
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: isDark
                ? "rgba(124,58,237,0.15)"
                : palette.violet[100],
            },
          ]}
        >
          <ShoppingBagIcon size={14} color={palette.violet[600]} />
        </View>
        <Text
          style={[styles.productName, { color: heading }]}
          numberOfLines={2}
        >
          {productName}
        </Text>
        <MapPinIcon size={12} color={muted} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  row: { flexDirection: "row", alignItems: "stretch" },
  metric: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3 },
  divider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: "rgba(0,0,0,0.06)",
    marginHorizontal: 6,
  },
  label: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  value: {
    fontSize: 14,
    fontWeight: "800",
  },
  separator: { height: 1, opacity: 0.5 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  productName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
});
