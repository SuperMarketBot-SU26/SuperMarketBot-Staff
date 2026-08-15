import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft, Layout } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { listRestockTasks, StaffTask, deleteRestockTask } from '@/shared/api/tasks';
import { CustomHeader } from '@/shared/ui';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<StaffTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

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

  const renderItem = ({ item, index }: { item: StaffTask; index: number }) => {
    const isUrgent = item.priority === 'urgent';
    return (
      <Animated.View
        entering={FadeInRight.delay(index * 150).springify()}
        exiting={FadeOutLeft.springify()}
        layout={Layout.springify()}
        style={[styles.notificationCard, isUrgent && styles.urgentCard]}
      >
        <Pressable 
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
          onPress={() => router.push(`/staff/notification-detail?id=${item.id}` as any)}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="warning-outline" size={24} color={isUrgent ? "#F44336" : "#FF9800"} />
          </View>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.location}>Vị trí: {item.location}</Text>
            <Text style={styles.time}>{item.detail}</Text>
          </View>
        </Pressable>
        <Pressable
          style={styles.dismissButton}
          onPress={() => dismissNotification(item.id)}
        >
          <Ionicons name="checkmark-circle-outline" size={28} color="#4CAF50" />
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
      {notifications.length === 0 ? (
        <Animated.View entering={FadeInRight} style={styles.emptyContainer}>
          <Ionicons name="checkmark-done-circle" size={64} color="#4CAF50" />
          <Text style={styles.emptyText}>Tất cả kệ hàng đều đã được châm đầy đủ!</Text>
        </Animated.View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchTasks}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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

