/**
 * RestockLocationScreen — reached from the Cảnh Báo screen when staff
 * taps "Xử lý" on a Hàng hóa (restock) task.
 *
 * Purpose: show where the aisle node for the empty shelf sits on the
 * store map so the staff member can walk over, restock, and confirm
 * with "Đã xử lý".
 *
 * For this iteration there is no API call yet:
 *   - The full task payload is read from `useLocalSearchParams` (so the
 *     route stays stateless and works with the React Navigation stack).
 *   - The aisle pin is derived from `slotCode` so the position is
 *     deterministic without a fetch.
 *   - "Đã xử lý" only flips local state + pops back. The task list page
 *     will keep showing the task as pending until a real acknowledge
 *     API exists.
 */
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useLocalSearchParams, useRouter } from "expo-router";
import { DEVICE, palette, priorityConfig, useIsDark } from "@/shared/theme";
import { AlertCard } from "@/features/staff/robot-nav";
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  NavigationIcon,
} from "@/shared/ui";
import {
  RestockPingMap,
  deriveAislePosition,
} from "./components/RestockPingMap";
import { RestockInfoCard } from "./components/RestockInfoCard";
import { completeRestockTask } from "@/shared/api/tasks";

/**
 * Map-units for the centre fallback, shared with the rest of the map
 * code (see `features/staff/fleet/lib/map.ts`).
 */
const MAP_FALLBACK_W = 1000;
const MAP_FALLBACK_H = 700;

export default function RestockLocationScreen() {
  const isDark = useIsDark();
  const router = useRouter();
  const {
    title,
    detail,
    location,
    priority,
    slotCode,
    shelfLocation,
    productName,
    emptyPercentage,
    aisleId,
    aisleNodeId,
    slotId,
  } = useLocalSearchParams<{
    title?: string;
    detail?: string;
    location?: string;
/** "urgent" | "high". URL params are loosely typed; we fall back to
   * "high" if the value doesn't match one of the two. */
  priority?: string;
  slotCode?: string;
  shelfLocation?: string;
  productName?: string;
  emptyPercentage?: string;
  aisleId?: string;
  aisleNodeId?: string;
  slotId?: string;
  }>();

  const [resolved, setResolved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const priorityKey: "urgent" | "high" =
    priority === "urgent" ? priority : "high";
  const cfg = priorityConfig[priorityKey];
  const pageBg = isDark ? palette.gray[950] : "#f3f4f6";
  const cardBg = isDark ? palette.gray[900] : "#ffffff";
  const border = isDark ? palette.gray[800] : palette.gray[200];

  const headerTitle = title || slotCode || "Vị trí kệ";
  const fallbackLocation = location || shelfLocation || "—";
  const fallbackDetail =
    detail || "Hãy đến vị trí kệ để bổ sung hàng.";
  const slot = slotCode ?? "A1";
  const shelf = shelfLocation ?? "";
  const product = productName ?? title ?? "Sản phẩm";
  const emptyPct = Number.parseInt(emptyPercentage ?? "0", 10) || 0;

  const aisle = deriveAislePosition(slot);
  const tooltipCaption = `Kệ ${aisle.aisleLabel[0]} — ${fallbackLocation}`;

  const handleResolved = async () => {
    const parsedAisleId = Number(aisleId);
    if (!Number.isInteger(parsedAisleId) || parsedAisleId <= 0) {
      Alert.alert("Không thể hoàn tất", "Cảnh báo thiếu Aisle ID hợp lệ.");
      return;
    }
    setSubmitting(true);
    try {
      await completeRestockTask({
        aisleId: parsedAisleId,
        aisleNodeId: Number(aisleNodeId) > 0 ? Number(aisleNodeId) : undefined,
        slotId: Number(slotId) > 0 ? Number(slotId) : undefined,
      });
      setResolved(true);
      setTimeout(() => router.back(), 350);
    } catch (error) {
      Alert.alert("Không thể hoàn tất", error instanceof Error ? error.message : "Backend không xác nhận cập nhật kệ.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.page, { backgroundColor: pageBg }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: cardBg, borderBottomColor: border },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={10}
        >
          <ChevronLeftIcon
            size={20}
            color={isDark ? "#fff" : palette.gray[900]}
          />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.statusDot, { backgroundColor: cfg.bar }]} />
          <Text
            style={[
              styles.headerTitle,
              { color: isDark ? "#fff" : palette.gray[900] },
            ]}
            numberOfLines={1}
          >
            {headerTitle}
          </Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Alert summary */}
        <Animated.View entering={FadeIn.duration(280)}>
          <AlertCard
            title={`Cần bổ sung kệ ${aisle.aisleLabel}`}
            detail={fallbackDetail}
          />
        </Animated.View>

        {/* Map */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <NavigationIcon
                size={14}
                color={isDark ? palette.gray[400] : palette.gray[500]}
              />
              <Text
                style={[
                  styles.sectionTitle,
                  { color: isDark ? "#fff" : palette.gray[900] },
                ]}
              >
                Vị trí kệ
              </Text>
            </View>
            <Text
              style={[
                styles.slotChip,
                {
                  color: isDark ? palette.gray[300] : palette.gray[600],
                  backgroundColor: isDark
                    ? palette.gray[800]
                    : palette.gray[100],
                },
              ]}
            >
              {aisle.aisleLabel}
            </Text>
          </View>

          <RestockPingMap
            x={aisle.x || MAP_FALLBACK_W / 2}
            y={aisle.y || MAP_FALLBACK_H / 2}
            aisleLabel={aisle.aisleLabel}
            tooltipCaption={tooltipCaption}
          />
        </View>

        {/* Info card */}
        <RestockInfoCard
          slotCode={slot}
          shelfLocation={shelf || fallbackLocation}
          productName={product}
          emptyPercentage={emptyPct}
        />
      </ScrollView>

      {/* Footer action */}
      <View
        style={[
          styles.footer,
          { backgroundColor: cardBg, borderTopColor: border },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            {
              backgroundColor: resolved
                ? palette.emerald[500]
                : palette.violet[600],
              opacity: resolved ? 0.7 : 1,
            },
          ]}
          onPress={handleResolved}
          activeOpacity={0.85}
          disabled={resolved || submitting}
        >
          <CheckCircleIcon size={18} color="#ffffff" />
          <Text style={styles.primaryBtnText}>
            {resolved ? "Đã cập nhật Backend" : submitting ? "Đang cập nhật…" : "Đã xử lý"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32, gap: 16 },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "center",
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  headerTitle: { fontSize: 16, fontWeight: "800", flexShrink: 1 },

  /* Section */
  section: { gap: 10 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  slotChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: DEVICE.borderRadius.pill,
    fontSize: 12,
    fontWeight: "700",
  },

  /* Footer */
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
