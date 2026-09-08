import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft, Layout } from 'react-native-reanimated';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { listRestockTasks, StaffTask, deleteRestockTask } from '@/shared/api/tasks';
import { CustomHeader } from '@/shared/ui';
import { useStaffRealtime } from '@/shared/realtime/StaffRealtimeContext';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<StaffTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'URGENT' | 'A01' | 'B01' | 'C01'>('ALL');

  const { revision, connected } = useStaffRealtime();

  useEffect(() => {
    fetchTasks();
  }, [revision]);

  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, [])
  );

  const fetchTasks = async () => {
    try {
      const data = await listRestockTasks();
      setNotifications(data);
    } catch (e) {
      console.log('Error fetching tasks', e);
    } finally {
      setLoading(false);
    }
  };

  const dismissNotification = async (id: number) => {
    // Optimistic UI update
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    try {
      await deleteRestockTask(id);
    } catch (e) {
      // Revert if error
      fetchTasks();
    }
  };

    const filteredNotifications = notifications.filter((task) => {
    if (activeFilter === 'URGENT') return task.priority === 'urgent' || task.isError;
    if (activeFilter === 'A01') return (task.location && task.location.includes('A01')) || task.title.toLowerCase().includes('ăn vặt') || task.title.toLowerCase().includes('nước');
    if (activeFilter === 'B01') return (task.location && task.location.includes('B01')) || task.title.toLowerCase().includes('tươi sống') || task.title.toLowerCase().includes('mì');
    if (activeFilter === 'C01') return (task.location && task.location.includes('C01')) || task.title.toLowerCase().includes('gia vị') || task.title.toLowerCase().includes('gia dụng');
    return true;
  });

  const renderItem = ({ item, index }: { item: StaffTask; index: number }) => {
    const isUrgent = item.priority === 'urgent';
    const density = item.densityPercentage ?? (item.restock ? Math.max(0, Math.min(100, Math.round(100 - item.restock.emptyPercentage))) : 50);
    const densityColor = density < 30 ? '#DC2626' : density < 70 ? '#D97706' : '#16A34A';
    const densityBg = density < 30 ? '#FEE2E2' : density < 70 ? '#FEF3C7' : '#DCFCE7';

    return (
      <Animated.View
        entering={FadeInRight.delay(index * 150).springify()}
        exiting={FadeOutLeft.springify()}
        layout={Layout.springify()}
        style={[styles.notificationCard, isUrgent && styles.urgentCard]}
      >
        <Pressable 
          style={{ flex: 1 }}
          onPress={() => router.push(`/staff/notification-detail?id=${item.id}` as any)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={[styles.iconContainer, { backgroundColor: isUrgent ? '#FEE2E2' : '#FEF3C7', marginTop: 2 }]}>
              <Ionicons name="warning-outline" size={24} color={isUrgent ? "#DC2626" : "#D97706"} />
            </View>
            <View style={styles.contentContainer}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text style={[styles.title, { flex: 1, marginRight: 8 }]} numberOfLines={1}>{item.title}</Text>
                <View style={[styles.densityBadge, { backgroundColor: densityBg, borderColor: densityColor }]}>
                  <Text style={[styles.densityBadgeText, { color: densityColor }]}>Mật độ: {density}%</Text>
                </View>
              </View>
              <Text style={styles.location}>Vị trí: {item.location ? item.location.replace(/\s*[-·]\s*Tầng\s*\d+/gi, "").trim() : ""}</Text>
              
              {/* Density Progress Bar */}
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: `${density}%`, backgroundColor: densityColor }]} />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                <Text style={styles.time}>{item.detail}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#16A34A' }}>Xem chi tiết & Châm hàng</Text>
                  <Ionicons name="chevron-forward" size={14} color="#16A34A" />
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader title="Cảnh báo hàng hóa" subtitle="Quản lý kệ trống" />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8, backgroundColor: connected ? '#ECFDF5' : '#FEF3C7', borderBottomWidth: 1, borderBottomColor: connected ? '#A7F3D0' : '#FDE68A' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: connected ? '#10B981' : '#F59E0B' }} />
          <Text style={{ fontSize: 12, fontWeight: '600', color: connected ? '#065F46' : '#92400E' }}>
            {connected ? 'SignalR Live: Đang đồng bộ tự động với Robot & AI Vision' : 'Đang kết nối SignalR...'}
          </Text>
        </View>
        <Text style={{ fontSize: 11, color: '#6B7280' }}>Auto-Sync</Text>
      </View>
      {/* Filter Chips Row Always Visible */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
          {[
            { key: 'ALL', label: `Tất cả (${notifications.length})` },
            { key: 'URGENT', label: `🚨 Khẩn cấp (${notifications.filter(t => t.priority === 'urgent' || t.isError).length})` },
            { key: 'A01', label: 'Dãy A01 (Kệ 1-2)' },
            { key: 'B01', label: 'Dãy B01 (Kệ 3-4)' },
            { key: 'C01', label: 'Dãy C01 (Kệ 5-6)' },
          ].map((chip) => {
            const active = activeFilter === chip.key;
            return (
              <Pressable
                key={chip.key}
                onPress={() => setActiveFilter(chip.key as any)}
                style={[styles.chipBtn, active && styles.chipBtnActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {chip.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {notifications.length === 0 ? (
        <Animated.View entering={FadeInRight} style={styles.emptyContainer}>
          <Ionicons name="checkmark-done-circle" size={64} color="#4CAF50" />
          <Text style={styles.emptyText}>Tất cả kệ hàng đều đã được châm đầy đủ!</Text>
        </Animated.View>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchTasks}
          ListEmptyComponent={
            <View style={styles.filterEmptyBox}>
              <Ionicons name="funnel-outline" size={36} color="#9ca3af" />
              <Text style={styles.filterEmptyTitle}>Không có cảnh báo trong danh mục này</Text>
              <Text style={styles.filterEmptySubtitle}>Hãy chọn bộ lọc khác hoặc kiểm tra lại sau.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  filterWrapper: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20,83,45,0.08)',
  },
  filterScrollContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterEmptyBox: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  filterEmptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginTop: 4,
  },
  filterEmptySubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20,83,45,0.08)',
  },
  chipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f2',
  },
  chipBtnActive: {
    backgroundColor: '#16a34a',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4a5a52',
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },

  container: {
    flex: 1,
    backgroundColor: '#f7faf7',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7faf7',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  listContent: {
    padding: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  urgentCard: {
    borderLeftColor: '#F44336',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  densityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  densityBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressTrack: {
    width: '100%',
    height: 7,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 6,
    marginBottom: 2,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  dismissButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});

