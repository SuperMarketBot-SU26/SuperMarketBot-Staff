import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CustomHeader } from '@/shared/ui';
import { ShelfDensityOverview } from '@/features/staff/map/components/ShelfDensityOverview';
import { Ionicons } from '@expo/vector-icons';
import { listRestockTasks, StaffTask } from '@/shared/api/tasks';
import { listRobots } from '@/shared/api/robots';
import { useStaffRealtime } from '@/shared/realtime/StaffRealtimeContext';

export default function StaffIndexPage() {
  const router = useRouter();
  const [taskCount, setTaskCount] = useState(0);
  const [recentTasks, setRecentTasks] = useState<StaffTask[]>([]);
  const [robotCount, setRobotCount] = useState(0);
  const [primaryRobot, setPrimaryRobot] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { revision } = useStaffRealtime();

  const loadData = useCallback(async () => {
    try {
      const [tasks, robots] = await Promise.all([
        listRestockTasks(),
        listRobots()
      ]);
      setTaskCount(tasks.length);
      setRecentTasks(tasks.slice(0, 5));
      const activeRobots = robots.filter(r => r.status === 'active' || r.status === 'standby').length;
      setRobotCount(activeRobots);
      const rb1 = robots.find(r => r.robotCode === 'RB0001' || r.robotCode === 'RB001') || robots[0] || null;
      setPrimaryRobot(rb1);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  useEffect(() => {
    loadData();
  }, [revision, loadData]);

  return (
    <View style={styles.container}>
      <CustomHeader title="Trang chủ" subtitle="Xin chào, Nhân viên" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* We removed the old header since CustomHeader handles it */}

      <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} style={styles.statsContainer}>
        <Pressable
          style={({ pressed }) => [styles.statCard, pressed && { opacity: 0.75 }]}
          onPress={() => router.push('/staff/notifications')}
        >
          <Ionicons name="cube-outline" size={32} color="#4CAF50" />
          {loading ? (
            <ActivityIndicator style={{ marginVertical: 8 }} color="#4CAF50" />
          ) : (
            <Text style={styles.statValue}>{taskCount}</Text>
          )}
          <Text style={styles.statLabel}>Kệ cần châm →</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.statCard, pressed && { opacity: 0.75 }]}
          onPress={() => router.push('/staff/robots')}
        >
          <Ionicons name="hardware-chip-outline" size={32} color="#2196F3" />
          {loading ? (
            <ActivityIndicator style={{ marginVertical: 8 }} color="#2196F3" />
          ) : (
             <Text style={styles.statValue}>{robotCount}</Text>
          )}
          <Text style={styles.statLabel}>Robot sẵn sàng →</Text>
        </Pressable>
      </Animated.View>

      {/* Quick Action Navigation Toolbar */}
      <Animated.View entering={FadeInDown.delay(250).duration(600).springify()} style={styles.quickActionsContainer}>
        <Pressable
          style={({ pressed }) => [styles.quickActionItem, pressed && { opacity: 0.7 }]}
          onPress={() => router.push('/staff/map')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="map-outline" size={20} color="#2E7D32" />
          </View>
          <Text style={styles.quickActionLabel}>Bản đồ 2D</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.quickActionItem, pressed && { opacity: 0.7 }]}
          onPress={() => router.push('/staff/robots')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="hardware-chip-outline" size={20} color="#1565C0" />
          </View>
          <Text style={styles.quickActionLabel}>Robot AMR</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.quickActionItem, pressed && { opacity: 0.7 }]}
          onPress={() => router.push('/staff/tasks')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="checkbox-outline" size={20} color="#E65100" />
          </View>
          <Text style={styles.quickActionLabel}>Nhiệm vụ</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.quickActionItem, pressed && { opacity: 0.7 }]}
          onPress={() => router.push('/staff/notifications')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#F3E5F5' }]}>
            <Ionicons name="notifications-outline" size={20} color="#7B1FA2" />
          </View>
          <Text style={styles.quickActionLabel}>Thông báo</Text>
        </Pressable>
      </Animated.View>

      {/* 6 Shelves Density Overview on Home */}
      <Animated.View entering={FadeInDown.delay(300).duration(600).springify()} style={{ marginBottom: 20 }}>
        <ShelfDensityOverview />
      </Animated.View>

      {/* Dedicated Robot RB0001 Live Status Card */}
      <Animated.View entering={FadeInDown.delay(350).duration(600).springify()} style={styles.robotCard}>
        <View style={styles.robotTopRow}>
          <View style={styles.robotIdentity}>
            <View style={styles.robotAvatarBox}>
              <Ionicons name="hardware-chip" size={20} color="#15803d" />
            </View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.robotNameText}>
                  {primaryRobot?.robotName || 'SmartMarketBot 01'}
                </Text>
                <View style={styles.robotCodePill}>
                  <Text style={styles.robotCodePillText}>{primaryRobot?.robotCode === 'RB001' ? 'RB0001' : (primaryRobot?.robotCode || 'RB0001')}</Text>
                </View>
              </View>
              <Text style={styles.robotModeText}>
                Trạng thái: <Text style={{ color: '#15803d', fontWeight: '700' }}>{primaryRobot?.mode || 'IDLE'} (Sẵn sàng)</Text>
              </Text>
            </View>
          </View>

          <View style={styles.robotBatteryBadge}>
            <Text style={styles.robotBatteryVal}>
              🔋 {primaryRobot?.batteryPct ?? 100}%
            </Text>
          </View>
        </View>

        <View style={styles.robotBottomRow}>
          <Text style={styles.robotLocText}>
            📍 Tọa độ: ({primaryRobot?.position?.x?.toFixed(1) ?? '1.5'}, {primaryRobot?.position?.y?.toFixed(1) ?? '1.5'})
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={() => router.push(`/staff/robot-detail?code=${primaryRobot?.robotCode === 'RB001' ? 'RB0001' : (primaryRobot?.robotCode || 'RB0001')}` as any)}
              style={[styles.robotMapBtn, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe', borderWidth: 1 }]}
            >
              <Text style={[styles.robotMapBtnText, { color: '#1d4ed8' }]}>⚡ Chi tiết</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/staff/map')}
              style={styles.robotMapBtn}
            >
              <Text style={styles.robotMapBtnText}>Bản đồ →</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>


      {/* Activity Feed Section */}
      <Animated.View entering={FadeInDown.delay(600).duration(600).springify()} style={styles.activityContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
          <Pressable onPress={() => router.push('/staff/notifications')}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator color="#4CAF50" style={{ padding: 20 }} />
        ) : recentTasks.length === 0 ? (
          <View style={styles.emptyFeed}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color="#4CAF50" />
            <Text style={styles.emptyFeedText}>Không có thông báo mới.</Text>
          </View>
        ) : (
          <View style={styles.feedList}>
            {recentTasks.map((task, index) => {
              const isUrgent = task.priority === 'urgent';
              return (
                <Pressable
                  key={task.id}
                  style={({ pressed }) => [
                    styles.feedItem,
                    isUrgent && styles.urgentFeedItem,
                    pressed && { opacity: 0.7 }
                  ]}
                  onPress={() => router.push(`/staff/notification-detail?id=${task.id}` as any)}
                >
                  <View style={[styles.feedIcon, isUrgent ? { backgroundColor: '#FFEBEE' } : { backgroundColor: '#FFF3E0' }]}>
                    <Ionicons name="warning-outline" size={20} color={isUrgent ? "#F44336" : "#FF9800"} />
                  </View>
                  <View style={styles.feedContent}>
                    <Text style={styles.feedTitle} numberOfLines={1}>{task.title}</Text>
                    <Text style={styles.feedLocation}>{task.location}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </Pressable>
              );
            })}
          </View>
        )}
      </Animated.View>

    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  robotCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(20,83,45,0.12)',
    padding: 16,
    marginBottom: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  robotTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  robotIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  robotAvatarBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  robotNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#11201a',
  },
  robotCodePill: {
    backgroundColor: '#11201a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  robotCodePillText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  robotModeText: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 2,
  },
  robotBatteryBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  robotBatteryVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803d',
  },
  robotBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  robotLocText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  robotMapBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(21,128,61,0.08)',
  },
  robotMapBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
  },

  container: {
    flex: 1,
    backgroundColor: '#f7faf7',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    marginTop: 20,
  },
  greeting: {
    fontSize: 18,
    color: '#666',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  quickActionItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  actionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  activityContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#2E7D32',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyFeed: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  emptyFeedText: {
    marginTop: 8,
    color: '#888',
    fontSize: 14,
  },
  feedList: {
    gap: 12,
  },
  feedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  urgentFeedItem: {
    // borderLeftWidth: 3,
    // borderLeftColor: '#F44336',
    // paddingLeft: 8,
  },
  feedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  feedContent: {
    flex: 1,
    justifyContent: 'center',
  },
  feedTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  feedLocation: {
    fontSize: 13,
    color: '#666',
  },
});

