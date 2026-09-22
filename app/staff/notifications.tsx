import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, ScrollView, Alert, ToastAndroid, Platform } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft, Layout } from 'react-native-reanimated';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { listRestockTasks, StaffTask, deleteRestockTask, listRobotIncidents, acknowledgeCharging, RobotIncidentDto } from '@/shared/api/tasks';
import { CustomHeader } from '@/shared/ui';
import { useStaffRealtime } from '@/shared/realtime/StaffRealtimeContext';
import { useAuth } from '@/features/auth';

type NotificationItem = 
  | { type: 'TASK'; data: StaffTask }
  | { type: 'INCIDENT'; data: RobotIncidentDto };

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<StaffTask[]>([]);
  const [incidents, setIncidents] = useState<RobotIncidentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'URGENT' | 'BATTERY' | 'A01' | 'B01' | 'C01'>('ALL');
  const [acknowledgingIds, setAcknowledgingIds] = useState<Record<string, boolean>>({});

  const { revision, connected } = useStaffRealtime();

  const fetchAllData = useCallback(async () => {
    try {
      const [tasksData, incidentsData] = await Promise.all([
        listRestockTasks(),
        listRobotIncidents(),
      ]);
      setTasks(tasksData || []);
      setIncidents(incidentsData || []);
    } catch (e) {
      console.log('Error fetching notifications data', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [revision, fetchAllData]);

  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [fetchAllData])
  );

  const handleAcknowledgeCharging = async (incident: RobotIncidentDto) => {
    const staffName = user?.fullName || 'Nhân viên trực ca';
    setAcknowledgingIds((prev) => ({ ...prev, [incident.incidentId]: true }));
    
    // Optimistic UI update
    setIncidents((prev) =>
      prev.map((item) =>
        item.incidentId === incident.incidentId
          ? {
              ...item,
              status: 'RESOLVED',
              resolvedByStaffName: staffName,
              resolvedAtUtc: new Date().toISOString(),
            }
          : item
      )
    );

    try {
      await acknowledgeCharging(incident.incidentId, staffName);
      const msg = `Đã xác nhận đưa Robot ${incident.robotCode} vào trạm sạc!`;
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.LONG);
      } else {
        Alert.alert('Thành công', msg);
      }
    } catch (e) {
      console.error('Error acknowledging charging', e);
      // Revert if error
      fetchAllData();
    } finally {
      setAcknowledgingIds((prev) => ({ ...prev, [incident.incidentId]: false }));
    }
  };

  const pendingIncidentsCount = incidents.filter((i) => i.status === 'PENDING').length;
  const urgentTasksCount = tasks.filter((t) => t.priority === 'urgent' || t.isError).length;

  // Build unified list based on active filter
  const items: NotificationItem[] = [];

  if (activeFilter === 'BATTERY') {
    incidents.forEach((i) => items.push({ type: 'INCIDENT', data: i }));
  } else if (activeFilter === 'URGENT') {
    incidents.filter((i) => i.status === 'PENDING').forEach((i) => items.push({ type: 'INCIDENT', data: i }));
    tasks.filter((t) => t.priority === 'urgent' || t.isError).forEach((t) => items.push({ type: 'TASK', data: t }));
  } else if (activeFilter === 'A01') {
    tasks.filter((t) => (t.location && t.location.includes('A01')) || t.title.toLowerCase().includes('ăn vặt') || t.title.toLowerCase().includes('nước')).forEach((t) => items.push({ type: 'TASK', data: t }));
  } else if (activeFilter === 'B01') {
    tasks.filter((t) => (t.location && t.location.includes('B01')) || t.title.toLowerCase().includes('tươi sống') || t.title.toLowerCase().includes('mì')).forEach((t) => items.push({ type: 'TASK', data: t }));
  } else if (activeFilter === 'C01') {
    tasks.filter((t) => (t.location && t.location.includes('C01')) || t.title.toLowerCase().includes('gia vị') || t.title.toLowerCase().includes('gia dụng')).forEach((t) => items.push({ type: 'TASK', data: t }));
  } else {
    // ALL: pending incidents first, then tasks, then resolved incidents
    incidents.filter((i) => i.status === 'PENDING').forEach((i) => items.push({ type: 'INCIDENT', data: i }));
    tasks.forEach((t) => items.push({ type: 'TASK', data: t }));
    incidents.filter((i) => i.status !== 'PENDING').forEach((i) => items.push({ type: 'INCIDENT', data: i }));
  }

  const renderItem = ({ item, index }: { item: NotificationItem; index: number }) => {
    if (item.type === 'INCIDENT') {
      const inc = item.data;
      const isPending = inc.status === 'PENDING';
      const isAcknowledging = !!acknowledgingIds[inc.incidentId];
      const reportedTime = inc.reportedAtUtc ? new Date(inc.reportedAtUtc).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';

      return (
        <Animated.View
          entering={FadeInRight.delay(index * 80).springify()}
          exiting={FadeOutLeft.springify()}
          layout={Layout.springify()}
          style={[styles.notificationCard, isPending ? styles.incidentUrgentCard : styles.incidentResolvedCard]}
        >
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={[styles.iconContainer, { backgroundColor: isPending ? '#FEE2E2' : '#DCFCE7', marginTop: 2 }]}>
                <Ionicons 
                  name={isPending ? "flash" : "battery-charging"} 
                  size={24} 
                  color={isPending ? "#DC2626" : "#16A34A"} 
                />
              </View>
              <View style={styles.contentContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={[styles.title, { flex: 1, marginRight: 8 }]} numberOfLines={1}>
                    Báo động: Robot {inc.robotCode} pin yếu
                  </Text>
                  <View style={[styles.densityBadge, { 
                    backgroundColor: isPending ? '#FEE2E2' : '#DCFCE7', 
                    borderColor: isPending ? '#DC2626' : '#16A34A' 
                  }]}>
                    <Text style={[styles.densityBadgeText, { color: isPending ? '#DC2626' : '#16A34A' }]}>
                      Pin: {inc.batteryPct}%
                    </Text>
                  </View>
                </View>

                <Text style={styles.location}>
                  {inc.description || `Robot đang di chuyển về Trạm sạc (Node ${inc.targetDockNodeId ?? 'Dock'})`}
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <Text style={styles.time}>
                    {reportedTime ? `Lúc ${reportedTime}` : ''} · {isPending ? 'Cần hỗ trợ cắm sạc' : `Đã sạc bởi ${inc.resolvedByStaffName || 'Nhân viên'}`}
                  </Text>
                  <View style={[styles.statusTag, isPending ? styles.statusTagPending : styles.statusTagResolved]}>
                    <Text style={[styles.statusTagText, isPending ? styles.statusTagTextPending : styles.statusTagTextResolved]}>
                      {isPending ? '⏳ Chờ sạc' : '✅ Đang sạc'}
                    </Text>
                  </View>
                </View>

                {isPending && (
                  <Pressable
                    style={[styles.ackChargingBtn, isAcknowledging && { opacity: 0.7 }]}
                    disabled={isAcknowledging}
                    onPress={() => handleAcknowledgeCharging(inc)}
                  >
                    {isAcknowledging ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Ionicons name="flash-outline" size={16} color="#ffffff" />
                    )}
                    <Text style={styles.ackChargingBtnText}>
                      {isAcknowledging ? 'Đang xác nhận...' : '🔌 Xác nhận đã đưa vào trạm sạc'}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </Animated.View>
      );
    }

    // Task rendering
    const taskItem = item.data;
    const isUrgent = taskItem.priority === 'urgent';
    const density = taskItem.densityPercentage ?? (taskItem.restock ? Math.max(0, Math.min(100, Math.round(100 - taskItem.restock.emptyPercentage))) : 50);
    const densityColor = density < 30 ? '#DC2626' : density < 70 ? '#D97706' : '#16A34A';
    const densityBg = density < 30 ? '#FEE2E2' : density < 70 ? '#FEF3C7' : '#DCFCE7';

    return (
      <Animated.View
        entering={FadeInRight.delay(index * 80).springify()}
        exiting={FadeOutLeft.springify()}
        layout={Layout.springify()}
        style={[styles.notificationCard, isUrgent && styles.urgentCard]}
      >
        <Pressable 
          style={{ flex: 1 }}
          onPress={() => router.push(`/staff/notification-detail?id=${taskItem.id}` as any)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={[styles.iconContainer, { backgroundColor: isUrgent ? '#FEE2E2' : '#FEF3C7', marginTop: 2 }]}>
              <Ionicons name="warning-outline" size={24} color={isUrgent ? "#DC2626" : "#D97706"} />
            </View>
            <View style={styles.contentContainer}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text style={[styles.title, { flex: 1, marginRight: 8 }]} numberOfLines={1}>{taskItem.title}</Text>
                <View style={[styles.densityBadge, { backgroundColor: densityBg, borderColor: densityColor }]}>
                  <Text style={[styles.densityBadgeText, { color: densityColor }]}>Mật độ: {density}%</Text>
                </View>
              </View>
              <Text style={styles.location}>Vị trí: {taskItem.location ? taskItem.location.replace(/\s*[-·]\s*Tầng\s*\d+/gi, "").trim() : ""}</Text>
              
              {/* Density Progress Bar */}
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: `${density}%`, backgroundColor: densityColor }]} />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                <Text style={styles.time}>{taskItem.detail}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#16A34A' }}>Chi tiết & Châm hàng</Text>
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
      <CustomHeader title="Trung tâm Thông báo" subtitle="Cảnh báo hàng hóa & Vận hành Robot" />
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
            { key: 'ALL', label: `Tất cả (${tasks.length + incidents.length})` },
            { key: 'URGENT', label: `🚨 Khẩn cấp (${urgentTasksCount + pendingIncidentsCount})` },
            { key: 'BATTERY', label: `⚡ Năng lượng & Sạc (${incidents.length})` },
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

      {items.length === 0 ? (
        <Animated.View entering={FadeInRight} style={styles.emptyContainer}>
          <Ionicons name="checkmark-done-circle" size={64} color="#4CAF50" />
          <Text style={styles.emptyText}>Hệ thống vận hành an toàn, không có cảnh báo nào!</Text>
        </Animated.View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.type === 'INCIDENT' ? `inc-${item.data.incidentId}` : `task-${item.data.id}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchAllData}
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
  incidentUrgentCard: {
    borderLeftColor: '#DC2626',
    backgroundColor: '#FFFBFB',
    borderColor: '#FEE2E2',
    borderWidth: 1,
    borderLeftWidth: 5,
  },
  incidentResolvedCard: {
    borderLeftColor: '#16A34A',
    backgroundColor: '#F7FCF9',
    borderColor: '#DCFCE7',
    borderWidth: 1,
    borderLeftWidth: 5,
  },
  ackChargingBtn: {
    marginTop: 10,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  ackChargingBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusTagPending: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  statusTagResolved: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTagTextPending: {
    color: '#DC2626',
  },
  statusTagTextResolved: {
    color: '#16A34A',
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

