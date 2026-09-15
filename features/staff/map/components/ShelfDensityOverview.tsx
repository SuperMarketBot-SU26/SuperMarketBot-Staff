import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getShelfDensities, type ShelfDensityDto } from "@/shared/api/aisles";
import { useStaffRealtime } from "@/shared/realtime/StaffRealtimeContext";
import { SHELVES_6, type StoreShelf } from "@/features/staff/map/lib/storeLayout";
import { completeRestockTask } from "@/shared/api/tasks";

export function ShelfDensityOverview() {
  const router = useRouter();
  const [shelves, setShelves] = useState<ShelfDensityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAisle, setSelectedAisle] = useState<string>("ALL");

  // In-place Fill Shelf Confirmation Modal state
  const [selectedShelfForFill, setSelectedShelfForFill] = useState<ShelfDensityDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fillSuccessMsg, setFillSuccessMsg] = useState<string | null>(null);

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

  // Handle staff confirming shelf refill
  const handleConfirmFill = async (shelf: ShelfDensityDto) => {
    setIsSubmitting(true);
    try {
      // 1. Optimistic local update (instant 100% feedback)
      setShelves((prev) =>
        prev.map((s) =>
          s.shelfId === shelf.shelfId
            ? {
                ...s,
                densityPercentage: 100,
                emptyPercentage: 0,
                needsRestock: false,
                scannedAt: new Date().toISOString(),
              }
            : s
        )
      );

      // 2. Call backend API to close scans, update slots, and broadcast SignalR
      await completeRestockTask({
        shelfId: shelf.shelfId,
        aisleId: shelf.aisleId || shelf.shelfId,
        aisleNodeId: shelf.nodeId,
      });

      setFillSuccessMsg(`✅ Đã xác nhận Fill đầy Kệ ${shelf.shelfId} (100%) thành công!`);

      setTimeout(() => {
        setFillSuccessMsg(null);
        setSelectedShelfForFill(null);
        fetchDensities();
      }, 900);
    } catch (e: any) {
      Alert.alert(
        "Không thể hoàn tất",
        e?.message || "Hệ thống không xác nhận được thao tác. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
            const storeShelf = SHELVES_6.find((s) => s.shelfId === shelf.shelfId);
            const icon = storeShelf?.icon || "📦";
            const themeColor = storeShelf?.themeColor || "#15803d";
            const themeBg = storeShelf?.themeBg || "rgba(22, 163, 74, 0.12)";
            const category = storeShelf?.category || "";

            const density = Math.round(shelf.densityPercentage);
            const isOos = density < 50 || shelf.needsRestock;
            const needsFill = density <= 70 || shelf.needsRestock;
            const canFill = density < 100;

            const barColor = density >= 70 ? "#16a34a" : density >= 40 ? "#f59e0b" : "#ef4444";
            const badgeBg = density >= 70 ? "#dcfce7" : density >= 40 ? "#fef3c7" : "#fee2e2";
            const badgeColor = density >= 70 ? "#15803d" : density >= 40 ? "#b45309" : "#b91c1c";
            const statusLabel = density >= 90 ? "Đầy đủ" : density >= 70 ? "Còn 70%" : density >= 40 ? "Ổn định" : "Cần châm hàng";

            return (
              <Pressable
                key={shelf.shelfId}
                onPress={() => setSelectedShelfForFill(shelf)}
                style={({ pressed }) => [
                  styles.shelfCard,
                  isOos && styles.shelfCardAlert,
                  pressed && { opacity: 0.92 },
                ]}
              >
                {/* Top: Icon + Shelf ID + Name + Aisle Tag */}
                <View style={styles.shelfTopRow}>
                  <View style={styles.shelfIdentity}>
                    {/* Visual Category Icon Circle */}
                    <View
                      style={[
                        styles.shelfIconCircle,
                        { backgroundColor: themeBg, borderColor: themeColor },
                      ]}
                    >
                      <Text style={styles.shelfIconEmoji}>{icon}</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <View
                          style={[
                            styles.shelfNumberBadge,
                            { backgroundColor: themeColor },
                          ]}
                        >
                          <Text style={styles.shelfNumberText}>KỆ {shelf.shelfId}</Text>
                        </View>
                        <Text style={styles.shelfName} numberOfLines={1}>
                          {shelf.shelfName}
                        </Text>
                      </View>
                      <Text style={styles.shelfMeta}>
                        {shelf.aisleCode ? `Dãy ${shelf.aisleCode}` : ""} · Tag #{shelf.shelfId} · {category}
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

                {/* Bottom: Timestamp & Quick Fill Action */}
                <View style={styles.shelfBottomRow}>
                  <Text style={styles.shelfScanTime}>
                    🕒 {shelf.scannedAt ? new Date(shelf.scannedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "Vừa cập nhật"}
                  </Text>

                  {/* Prominent Fill Hàng button: appears at <= 70% or when not full */}
                  {needsFill ? (
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        setSelectedShelfForFill(shelf);
                      }}
                      style={[
                        styles.actionFillBtn,
                        density < 50 ? styles.actionFillBtnUrgent : styles.actionFillBtnWarning,
                      ]}
                    >
                      <Text style={styles.actionFillBtnIcon}>⚡</Text>
                      <Text
                        style={[
                          styles.actionFillText,
                          density < 50 ? styles.actionFillTextUrgent : styles.actionFillTextWarning,
                        ]}
                      >
                        Fill hàng ngay
                      </Text>
                    </Pressable>
                  ) : canFill ? (
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        setSelectedShelfForFill(shelf);
                      }}
                      style={styles.actionFillBtnNormal}
                    >
                      <Text style={styles.actionFillTextNormal}>📦 Bổ sung thêm</Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        setSelectedShelfForFill(shelf);
                      }}
                      style={styles.actionFillBtnFull}
                    >
                      <Text style={styles.actionFillTextFull}>✓ Đầy đủ · Fill lại</Text>
                    </Pressable>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* ── Modal Xác Nhận Fill Hàng (In-place Confirmation UI) ── */}
      <Modal
        visible={!!selectedShelfForFill}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isSubmitting) setSelectedShelfForFill(null);
        }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            if (!isSubmitting) setSelectedShelfForFill(null);
          }}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            {selectedShelfForFill && (() => {
              const activeStoreShelf = SHELVES_6.find(
                (s) => s.shelfId === selectedShelfForFill.shelfId
              );
              const dVal = Math.round(selectedShelfForFill.densityPercentage);
              const barC = dVal >= 70 ? "#16a34a" : dVal >= 40 ? "#f59e0b" : "#ef4444";
              const sColor = activeStoreShelf?.themeColor || "#15803d";
              const sBg = activeStoreShelf?.themeBg || "rgba(22, 163, 74, 0.12)";

              return (
                <View style={{ gap: 14 }}>
                  {/* Modal Header */}
                  <View style={styles.modalHeader}>
                    <View style={styles.modalHeaderTitleGroup}>
                      <View style={[styles.modalIconCircle, { backgroundColor: sBg, borderColor: sColor }]}>
                        <Text style={{ fontSize: 26 }}>{activeStoreShelf?.icon || "📦"}</Text>
                      </View>
                      <View>
                        <Text style={styles.modalTitle}>Xác Nhận Fill Hàng</Text>
                        <Text style={styles.modalSubtitle}>
                          {`KỆ ${selectedShelfForFill.shelfId} · Dãy ${selectedShelfForFill.aisleCode || ""}`}
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      disabled={isSubmitting}
                      onPress={() => setSelectedShelfForFill(null)}
                      style={styles.modalCloseBtn}
                    >
                      <Ionicons name="close" size={20} color="#6b7280" />
                    </Pressable>
                  </View>

                  {/* Success Banner if just completed */}
                  {fillSuccessMsg && (
                    <View style={styles.successBanner}>
                      <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                      <Text style={styles.successBannerText}>{fillSuccessMsg}</Text>
                    </View>
                  )}

                  {/* Shelf Detail Box */}
                  <View style={styles.modalDetailBox}>
                    <Text style={styles.modalShelfName}>
                      {selectedShelfForFill.shelfName}
                    </Text>
                    <Text style={styles.modalShelfMeta}>
                      {`Vị trí: Dãy ${selectedShelfForFill.aisleCode || "A01"} · ArUco Marker #${selectedShelfForFill.shelfId} · ${activeStoreShelf?.category || ""}`}
                    </Text>

                    {/* Density indicator */}
                    <View style={styles.modalDensityRow}>
                      <Text style={styles.modalDensityLabel}>Mật độ hiện tại:</Text>
                      <Text style={[styles.modalDensityValue, { color: barC }]}>
                        {dVal}% {dVal <= 70 ? "(Cần bổ sung)" : "(Ổn định)"}
                      </Text>
                    </View>

                    {/* Progress Track */}
                    <View style={styles.modalProgressTrack}>
                      <View
                        style={[
                          styles.modalProgressBar,
                          {
                            width: `${Math.min(100, Math.max(5, dVal))}%`,
                            backgroundColor: barC,
                          },
                        ]}
                      />
                    </View>

                    <Text style={styles.modalEmptyEstimate}>
                      {`Khoảng trống ước tính: ~${Math.max(0, 100 - dVal)}% diện tích kệ`}
                    </Text>
                  </View>

                  {/* Confirmation explanation */}
                  <View style={styles.modalNoticeBox}>
                    <Ionicons name="information-circle-outline" size={20} color="#15803d" />
                    <Text style={styles.modalNoticeText}>
                      Xác nhận nhân viên đã châm đầy hàng lên kệ. Hệ thống sẽ cập nhật mật độ về 100% và đóng cảnh báo thiếu hàng liên quan.
                    </Text>
                  </View>

                  {/* Link to view on map */}
                  <Pressable
                    onPress={() => {
                      setSelectedShelfForFill(null);
                      router.push("/staff/map");
                    }}
                    style={styles.modalMapLink}
                  >
                    <Ionicons name="map-outline" size={16} color="#15803d" />
                    <Text style={styles.modalMapLinkText}>Xem vị trí kệ này trên bản đồ 2D →</Text>
                  </Pressable>

                  {/* Action Buttons */}
                  <View style={styles.modalActionsRow}>
                    <Pressable
                      disabled={isSubmitting}
                      onPress={() => setSelectedShelfForFill(null)}
                      style={styles.modalCancelBtn}
                    >
                      <Text style={styles.modalCancelBtnText}>Hủy</Text>
                    </Pressable>

                    <Pressable
                      disabled={isSubmitting}
                      onPress={() => handleConfirmFill(selectedShelfForFill)}
                      style={[styles.modalConfirmBtn, isSubmitting && { opacity: 0.7 }]}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <>
                          <Ionicons name="checkmark-done" size={18} color="#ffffff" />
                          <Text style={styles.modalConfirmBtnText}>Xác nhận đã Fill xong</Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                </View>
              );
            })()}
          </Pressable>
        </Pressable>
      </Modal>
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
    gap: 10,
    flex: 1,
  },
  shelfIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  shelfIconEmoji: {
    fontSize: 24,
  },
  shelfNumberBadge: {
    backgroundColor: "#11201a",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  shelfNumberText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  shelfName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#11201a",
    flex: 1,
  },
  shelfMeta: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
    fontWeight: "500",
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
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: "500",
  },

  /* Fill Action Buttons */
  actionFillBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionFillBtnUrgent: {
    backgroundColor: "rgba(239,68,68,0.12)",
    borderColor: "rgba(239,68,68,0.3)",
  },
  actionFillBtnWarning: {
    backgroundColor: "rgba(217,119,6,0.12)",
    borderColor: "rgba(217,119,6,0.3)",
  },
  actionFillBtnNormal: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "rgba(22,163,74,0.08)",
  },
  actionFillBtnFull: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
  },
  actionFillBtnIcon: {
    fontSize: 12,
  },
  actionFillText: {
    fontSize: 11,
    fontWeight: "800",
  },
  actionFillTextUrgent: {
    color: "#dc2626",
  },
  actionFillTextWarning: {
    color: "#d97706",
  },
  actionFillTextNormal: {
    fontSize: 11,
    fontWeight: "700",
    color: "#15803d",
  },
  actionFillTextFull: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6b7280",
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalHeaderTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  modalIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#11201a",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#dcfce7",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#86efac",
  },
  successBannerText: {
    color: "#15803d",
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },
  modalDetailBox: {
    backgroundColor: "#f8faf9",
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(20,83,45,0.08)",
  },
  modalShelfName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#11201a",
  },
  modalShelfMeta: {
    fontSize: 12,
    color: "#4b5563",
  },
  modalDensityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  modalDensityLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4b5563",
  },
  modalDensityValue: {
    fontSize: 14,
    fontWeight: "800",
  },
  modalProgressTrack: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  modalProgressBar: {
    height: "100%",
    borderRadius: 4,
  },
  modalEmptyEstimate: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
  },
  modalNoticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#f0fdf4",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(22,163,74,0.15)",
  },
  modalNoticeText: {
    fontSize: 11,
    color: "#166534",
    lineHeight: 16,
    flex: 1,
  },
  modalMapLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  modalMapLinkText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#15803d",
  },
  modalActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4b5563",
  },
  modalConfirmBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#16a34a",
  },
  modalConfirmBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
});
