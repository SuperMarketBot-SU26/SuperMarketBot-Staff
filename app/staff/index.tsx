import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CustomHeader, AnimatedButton } from '@/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import { listRestockTasks, StaffTask } from '@/shared/api/tasks';
import { listRobots } from '@/shared/api/robots';

export default function StaffIndexPage() {
  const router = useRouter();
  const [taskCount, setTaskCount] = useState(0);
  const [recentTasks, setRecentTasks] = useState<StaffTask[]>([]);
  const [robotCount, setRobotCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [tasks, robots] = await Promise.all([
          listRestockTasks(),
          listRobots()
        ]);
        setTaskCount(tasks.length);
        setRecentTasks(tasks.slice(0, 5));
        const activeRobots = robots.filter(r => r.status === 'active' || r.status === 'standby').length;
        setRobotCount(activeRobots);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <View style={styles.container}>
      <CustomHeader title="Trang chủ" subtitle="Xin chào, Nhân viên" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* We removed the old header since CustomHeader handles it */}

      <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="cube-outline" size={32} color="#4CAF50" />
          {loading ? (
            <ActivityIndicator style={{ marginVertical: 8 }} color="#4CAF50" />
          ) : (
            <Text style={styles.statValue}>{taskCount}</Text>
          )}
          <Text style={styles.statLabel}>Kệ cần châm</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="hardware-chip-outline" size={32} color="#2196F3" />
          {loading ? (
            <ActivityIndicator style={{ marginVertical: 8 }} color="#2196F3" />
          ) : (
             <Text style={styles.statValue}>{robotCount}</Text>
          )}
          <Text style={styles.statLabel}>Robot sẵn sàng</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(600).springify()} style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Tác vụ nhanh</Text>
        <AnimatedButton 
          title="Xem bản đồ Heatmap" 
          onPress={() => router.push('/staff/map')}
          style={{ marginBottom: 16 }}
        />
        <AnimatedButton 
          title="Kiểm tra hàng hết" 
          onPress={() => router.push('/staff/notifications')}
          color="#FF9800"
          style={{ marginBottom: 16 }}
        />
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
    marginBottom: 30,
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
