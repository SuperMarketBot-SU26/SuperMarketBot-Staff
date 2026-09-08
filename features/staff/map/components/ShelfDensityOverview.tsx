import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getShelfDensities, type ShelfDensityDto } from "@/shared/api/aisles";
import { useStaffRealtime } from "@/shared/realtime/StaffRealtimeContext";

export function ShelfDensityOverview() {
  const router = useRouter();
  const [shelves, setShelves] = useState<ShelfDensityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAisle, setSelectedAisle] = useState<string>("ALL");

  const fetchDensities = useCallback(async () => {
    try {
      const data = await getShelfDensities();
      if (data && data.length > 0) {
        setShelves(data);
      }
    } catch (e) {
      console.warn("Error fetching shelf densities:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const { revision } = useStaffRealtime();

  // Instant refresh when returning to screen/tab
  useFocusEffect(
    useCallback(() => {
      fetchDensities();
    }, [fetchDensities])
  );

  // Instant refresh when SignalR updates
  useEffect(() => {
    fetchDensities();
  }, [revision, fetchDensities]);

  useEffect(() => {
    fetchDensities();
    const interval = setInterval(fetchDensities, 5000);
    return () => clearInterval(interval);
  }, [fetchDensities]);

  const filteredShelves = selectedAisle === "ALL"
    ? shelves
    : shelves.filter(s => s.aisleCode === selectedAisle);

  // Summary stats
  const totalShelves = shelves.length;
  const avgDensity = totalShelves > 0
    ? Math.round(shelves.reduce((acc, s) => acc + (s.densityPercentage || 0), 0) / totalShelves)
    : 0;
  const oosCount = shelves.filter(s => s.densityPercentage < 50 || s.needsRestock).length;
  const healthyCount = totalShelves - oosCount;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.iconCircle}>
            <Ionicons name="layers" size={18} color="#15803d" />
          </View>
          <View>
            <Text style={styles.sectionTitle}>Mật Độ 6 Kệ Hàng Siêu Thị</Text>
            <Text style={styles.sectionSubtitle}>
              Giám sát AI & ArUco Marker #1 → #6
            </Text>
          </View>
        </View>

        <Pressable onPress={fetchDensities} style={styles.refreshBtn}>
          <Ionicons name="reload" size={15} color="#15803d" />
          <Text style={styles.refreshText}>Cập nhật</Text>
        </Pressable>
      </View>

      {/* Summary KPI Strip */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Mật độ TB</Text>
          <Text style={[styles.kpiVal, { color: avgDensity >= 70 ? "#16a34a" : avgDensity >= 50 ? "#d97706" : "#dc2626" }]}>
            {avgDensity}%
          </Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Đạt chuẩn</Text>
          <Text style={[styles.kpiVal, { color: "#16a34a" }]}>
            {healthyCount} kệ
          </Text>
        </View>

        <View style={[styles.kpiCard, oosCount > 0 && styles.kpiAlertCard]}>
          <Text style={[styles.kpiLabel, oosCount > 0 && { color: "#dc2626", fontWeight: "700" }]}>
            Cần bổ sung
          </Text>
          <Text style={[styles.kpiVal, { color: oosCount > 0 ? "#dc2626" : "#4a5a52" }]}>
            {oosCount > 0 ? `🚨 ${oosCount} kệ` : "0 kệ"}
          </Text>
        </View>
      </View>

      {/* Aisle Filter Tabs */}
      <View style={styles.filterRow}>
        {[
          { key: "ALL", label: "Tất cả (6)" },
          { key: "A01", label: "Dãy A01" },
          { key: "B01", label: "Dãy B01" },
          { key: "C01", label: "Dãy C01" },
        ].map((tab) => {
          const active = selectedAisle === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setSelectedAisle(tab.key)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Shelves List / Cards */}
      {loading && shelves.length === 0 ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#16a34a" />
          <Text style={styles.loadingText}>Đang đo mật độ 6 kệ hàng...</Text>
        </View>
      ) : (
        <View style={styles.cardsList}>
          {filteredShelves.map((shelf) => {
            const density = Math.round(shelf.densityPercentage);
            const isOos = density < 50 || shelf.needsRestock;
            const barColor = density >= 70 ? "#16a34a" : density >= 40 ? "#f59e0b" : "#ef4444";
            const badgeBg = density >= 70 ? "#dcfce7" : density >= 40 ? "#fef3c7" : "#fee2e2";
            const badgeColor = density >= 70 ? "#15803d" : density >= 40 ? "#b45309" : "#b91c1c";
            const statusLabel = density >= 70 ? "Đầy đủ" : density >= 40 ? "Ổn định" : "Cần châm hàng";

            return (
              <View key={shelf.shelfId} style={[styles.shelfCard, isOos && styles.shelfCardAlert]}>
                {/* Top: Shelf ID + Name + Aisle Tag */}
                <View style={styles.shelfTopRow}>
                  <View style={styles.shelfIdentity}>
                    <View style={styles.shelfNumberBadge}>
                      <Text style={styles.shelfNumberText}>KỆ {shelf.shelfId}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.shelfName} numberOfLines={1}>
                        {shelf.shelfName}
                      </Text>
                      <Text style={styles.shelfMeta}>
                        {shelf.aisleCode ? `Dãy ${shelf.aisleCode}` : ""} · Tag #{shelf.shelfId}
                      </Text>
                    </View>
                  </View>

                  {/* Density Value Badge */}
                  <View style={[styles.densityBadge, { backgroundColor: badgeBg }]}>
                    <Text style={[styles.densityValText, { color: badgeColor }]}>
                      {density}%
                    </Text>
                    <Text style={[styles.densityLabelText, { color: badgeColor }]}>
                      {statusLabel}
                    </Text>
                  </View>
                </View>

                {/* Middle: Progress Bar */}
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${Math.min(100, Math.max(5, density))}%`,
                        backgroundColor: barColor,
                      },
                    ]}
                  />
                </View>

                {/* Bottom: Timestamp & Quick Action if OOS */}
                <View style={styles.shelfBottomRow}>
                  <Text style={styles.shelfScanTime}>
                    🕒 {shelf.scannedAt ? new Date(shelf.scannedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "Vừa cập nhật"}
                  </Text>

                  {isOos && (
                    <Pressable
                      onPress={() => router.push("/staff/notifications")}
                      style={styles.actionOosBtn}
                    >
                      <Text style={styles.actionOosText}>Châm hàng ngay →</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(20,83,45,0.12)",
    padding: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#11201a",
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: "#4a5a52",
    fontWeight: "500",
    marginTop: 1,
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "rgba(22,163,74,0.08)",
  },
  refreshText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#15803d",
  },
  kpiRow: {
    flexDirection: "row",
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: "#f7faf7",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(20,83,45,0.08)",
  },
  kpiAlertCard: {
    backgroundColor: "#fef2f2",
    borderColor: "rgba(239,68,68,0.2)",
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#4a5a52",
    marginBottom: 2,
  },
  kpiVal: {
    fontSize: 16,
    fontWeight: "800",
  },
  filterRow: {
    flexDirection: "row",
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: "#f0f4f1",
  },
  filterChipActive: {
    backgroundColor: "#15803d",
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4a5a52",
  },
  filterChipTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  loadingBox: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: "#4a5a52",
  },
  cardsList: {
    gap: 10,
  },
  shelfCard: {
    backgroundColor: "#fcfdfc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(20,83,45,0.09)",
    padding: 12,
    gap: 8,
  },
  shelfCardAlert: {
    backgroundColor: "#fffafa",
    borderColor: "rgba(239,68,68,0.25)",
  },
  shelfTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  shelfIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  shelfNumberBadge: {
    backgroundColor: "#11201a",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  shelfNumberText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  shelfName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#11201a",
  },
  shelfMeta: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 1,
  },
  densityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: "flex-end",
  },
  densityValText: {
    fontSize: 14,
    fontWeight: "800",
  },
  densityLabelText: {
    fontSize: 9,
    fontWeight: "700",
  },
  progressTrack: {
    height: 7,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  shelfBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  shelfScanTime: {
    fontSize: 10,
    color: "#9ca3af",
  },
  actionOosBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "rgba(239,68,68,0.1)",
  },
  actionOosText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#dc2626",
  },
});
