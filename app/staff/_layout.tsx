import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/features/auth';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStaffRealtime } from '@/shared/realtime/StaffRealtimeContext';
import { listRestockTasks, listRobotIncidents } from '@/shared/api/tasks';

export default function StaffLayout() {
  const { status } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { revision } = useStaffRealtime();
  const [pendingCount, setPendingCount] = useState<number>(0);

  const fetchPendingTasks = useCallback(async () => {
    try {
      const [tasks, incidents] = await Promise.all([
        listRestockTasks(),
        listRobotIncidents(),
      ]);
      const pendingIncidents = incidents.filter((i) => i.status === 'PENDING').length;
      setPendingCount(tasks.length + pendingIncidents);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPendingTasks();
    }
  }, [status, revision, fetchPendingTasks]);

  useEffect(() => {
    const timer = setInterval(fetchPendingTasks, 5000);
    return () => clearInterval(timer);
  }, [fetchPendingTasks]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login' as any);
    }
  }, [status, router]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#2E7D32',
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: insets.bottom > 0 ? insets.bottom : 5,
          paddingTop: 5,
          height: 60 + (insets.bottom > 0 ? insets.bottom - 5 : 0),
          backgroundColor: '#ffffff',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Bản đồ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Thông báo',
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#dc2626',
            color: '#ffffff',
            fontSize: 10,
            fontWeight: '700',
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            lineHeight: 18,
            textAlign: 'center',
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Tài khoản',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      {/* Hide the other routes from tabs if they still exist, or we can delete them. */}
      <Tabs.Screen name="robots" options={{ href: null }} />
      <Tabs.Screen name="fleet" options={{ href: null }} />
      <Tabs.Screen name="fleet-map" options={{ href: null }} />
      <Tabs.Screen name="restock-location" options={{ href: null }} />
      <Tabs.Screen name="robot-detail" options={{ href: null }} />
      <Tabs.Screen name="robot-location" options={{ href: null }} />
      <Tabs.Screen name="robot-nav" options={{ href: null }} />
      <Tabs.Screen name="tasks" options={{ href: null }} />
      <Tabs.Screen name="notification-detail" options={{ href: null }} />
    </Tabs>
  );
}
