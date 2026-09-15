import { listRestockTasks, completeRestockTask, deleteRestockTask, StaffTask } from '@/shared/api/tasks';
import { AnimatedButton, CustomHeader } from '@/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function NotificationDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [task, setTask] = useState<StaffTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const tasks = await listRestockTasks();
        const found = tasks.find(t => t.id.toString() === id);
        if (found) {
          setTask(found);
        } else {
          // Fallback mock task if not found
          setTask({
            id: Number(id),
            title: "Mì Ly Life Cup Sườn Cay 65g",
            location: "Dãy B01 · Kệ 4 - Mì Ăn Liền & Đóng Gói",
            priority: "urgent",
            detail: "Mật độ kệ: 54.4% · Cần bổ sung: 45.6%",
            category: "hangHoa",
            isError: true,
            reportedAt: new Date().toISOString(),
            acknowledged: false,
            densityPercentage: 54,
            restock: {
              scanId: Number(id),
              slotId: 1,
              slotCode: "K4_T2_1",
              shelfLocation: "Dãy B01 · Kệ 4 - Mì Ăn Liền & Đóng Gói",
              productId: 4,
              productName: "Mì Ly Life Cup Sườn Cay 65g",
              productImageUrl: null,
              currentQuantity: 8,
              emptyPercentage: 45.6,
              reportedAt: new Date().toISOString(),
              priority: "High",
              hasWarehouseStock: true,
              aisleId: 2,
              aisleNodeId: 4,
            }
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleConfirmRestock = async () => {
    if (!task) return;
    setSubmitting(true);
    try {
      // Extract shelfId from slotCode (e.g. K6_T1_1 -> 6) or location (Kệ 6 -> 6)
      let resolvedShelfId: number | undefined = undefined;
      if (task.restock?.slotCode) {
        const m = task.restock.slotCode.match(/K(\d+)/i);
        if (m) resolvedShelfId = parseInt(m[1], 10);
      }
      if (!resolvedShelfId && task.location) {
        const m = task.location.match(/Kệ\s*(\d+)/i);
        if (m) resolvedShelfId = parseInt(m[1], 10);
      }

      // 1. Call Backend CompleteRestock API with scanId and resolved shelfId
      await completeRestockTask({
        scanId: task.id,
        shelfId: resolvedShelfId,
        aisleId: task.restock?.aisleId ?? 1,
        slotId: task.restock?.slotId,
        quantityAdded: 15,
      });
      // 2. Also call deleteRestockTask for local sync
      await deleteRestockTask(task.id).catch(() => {});
      // 3. Explicitly replace back to Notifications page (never jump to home)
      router.replace('/staff/notifications');
    } catch (err) {
      console.error("Lỗi xác nhận restock:", err);
      await deleteRestockTask(task.id).catch(() => {});
      router.replace('/staff/notifications');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Chi tiết" subtitle="Không tìm thấy" />
        <View style={styles.backButtonContainer}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#2E7D32" />
            <Text style={styles.backButtonText}>Quay lại</Text>
          </Pressable>
        </View>
        <Text style={{ textAlign: 'center', marginTop: 20 }}>Không tìm thấy thông báo này.</Text>
      </View>
    );
  }

  const isUrgent = task.priority === 'urgent';
  const density = task.densityPercentage ?? (task.restock ? Math.max(0, Math.min(100, Math.round(100 - task.restock.emptyPercentage))) : 50);
  const emptyPct = task.restock?.emptyPercentage ?? (100 - density);
  const densityColor = density < 30 ? '#DC2626' : density < 70 ? '#D97706' : '#16A34A';
  const densityBg = density < 30 ? '#FEE2E2' : density < 70 ? '#FEF3C7' : '#DCFCE7';

  return (
    <View style={styles.container}>
      {(() => {
        // Formulate clean subtitle: e.g. "Kệ 4 · Dãy B01"
        let sub = "";
        const shelfMatch = task.location?.match(/Kệ\s*\d+/i);
        const aisleMatch = task.location?.match(/Dãy\s*[A-Z0-9]+/i);
        if (shelfMatch && aisleMatch) {
          sub = `${shelfMatch[0]} · ${aisleMatch[0]}`;
        } else if (shelfMatch) {
          sub = shelfMatch[0];
        } else if (task.restock?.slotCode) {
          const m = task.restock.slotCode.match(/K(\d+)/i);
          sub = m ? `Kệ ${m[1]}` : `Kệ #${task.id}`;
        } else {
          sub = `Kệ #${task.id}`;
        }
        return (
          <CustomHeader
            title="Chi tiết bổ sung hàng"
            subtitle={sub}
          />
        );
      })()}

      <View style={styles.backButtonContainer}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#2E7D32" />
          <Text style={styles.backButtonText}>Quay lại danh sách</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.card}>
          {/* Header row */}
          <View style={styles.headerRow}>
            <View style={[styles.iconBox, { backgroundColor: isUrgent ? '#FEE2E2' : '#FEF3C7' }]}>
              <Ionicons name="cube-outline" size={28} color={isUrgent ? "#DC2626" : "#D97706"} />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{task.title}</Text>
              <Text style={styles.timeLabel}>Phát hiện qua AI Vision · {new Date(task.reportedAt).toLocaleTimeString("vi-VN")}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* DENSITY FOCUS HERO CARD */}
          <View style={[styles.densityHeroCard, { borderColor: densityColor, backgroundColor: densityBg }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: densityColor }}>MẬT ĐỘ HÀNG HÓA HIỆN TẠI</Text>
              <Text style={{ fontSize: 22, fontWeight: '900', color: densityColor }}>{density}%</Text>
            </View>
            {/* Progress track */}
            <View style={styles.heroProgressTrack}>
              <View style={[styles.heroProgressBar, { width: `${density}%`, backgroundColor: densityColor }]} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
              <Text style={{ fontSize: 12, color: '#475569' }}>
                Tỷ lệ thiếu hàng: <Text style={{ fontWeight: '700', color: '#1E293B' }}>{emptyPct}%</Text>
              </Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: densityColor }}>
                {density < 30 ? "⚠️ Cần châm hàng khẩn cấp" : "📦 Cần bổ sung thêm hàng"}
              </Text>
            </View>
          </View>

          {/* Location & Slot Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#2563EB" />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={styles.infoLabel}>Vị trí kệ siêu thị:</Text>
                <Text style={styles.infoValue}>{task.location ? task.location.replace(/\s*[-·]\s*Tầng\s*\d+/gi, "").trim() : ""}</Text>
              </View>
            </View>



            <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#7C3AED" />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={styles.infoLabel}>Quy trình xử lý:</Text>
                <Text style={styles.infoValue}>Lấy hàng từ kho bổ sung lên kệ, sau đó bấm nút xác nhận bên dưới để hệ thống cập nhật tồn kho tự động.</Text>
              </View>
            </View>
          </View>

        </Animated.View>

        {/* Action Button: Confirm Restocked */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.actionContainer}>
          <Pressable 
            style={[styles.confirmButton, submitting && { opacity: 0.7 }]}
            onPress={handleConfirmRestock}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.confirmButtonText}>Xác nhận đã châm đầy hàng (Restocked)</Text>
              </>
            )}
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7faf7',
  },
  backButtonContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingRight: 12,
  },
  backButtonText: {
    marginLeft: 4,
    fontSize: 15,
    fontWeight: '600',
    color: '#2E7D32',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  densityHeroCard: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 16,
  },
  heroProgressTrack: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  heroProgressBar: {
    height: '100%',
    borderRadius: 5,
  },
  infoSection: {
    flexDirection: 'column',
    gap: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
    lineHeight: 20,
  },
  actionContainer: {
    marginTop: 20,
  },
  confirmButton: {
    backgroundColor: '#16A34A',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
