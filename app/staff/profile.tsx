import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/features/auth';
import { useRouter } from 'expo-router';
import { CustomHeader, AnimatedButton } from '@/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ProfilePage() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.replace('/login' as any);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Hồ sơ cá nhân" subtitle="Tài khoản nội bộ" />
      <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={64} color="#4CAF50" />
        </View>
        <Text style={styles.name}>Nhân viên Siêu thị</Text>
        <Text style={styles.role}>Tài khoản Nội bộ</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} style={styles.content}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={24} color="#666" style={styles.infoIcon} />
            <Text style={styles.infoText}>staff@smartmarket.com</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={24} color="#666" style={styles.infoIcon} />
            <Text style={styles.infoText}>Chi nhánh Trung tâm</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(600).springify()} style={styles.logoutContainer}>
        <AnimatedButton 
          title="Đăng xuất" 
          onPress={handleLogout}
          color="#F44336"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7faf7',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: '#888',
  },
  content: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  infoIcon: {
    marginRight: 16,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
  },
  logoutContainer: {
    padding: 20,
    marginTop: 'auto',
    marginBottom: 20,
  },
});
