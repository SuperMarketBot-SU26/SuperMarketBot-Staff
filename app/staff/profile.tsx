import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '@/features/auth';
import { useRouter } from 'expo-router';
import { CustomHeader, AnimatedButton } from '@/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useStaffRealtime } from '@/shared/realtime/StaffRealtimeContext';

export default function ProfilePage() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const { connected } = useStaffRealtime();

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng Nhân viên?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } finally {
              router.replace('/login' as any);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Hồ sơ cá nhân" subtitle="Tài khoản nội bộ" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={54} color="#15803d" />
          </View>
          <Text style={styles.name}>{user?.fullName || 'Nhân viên Siêu thị'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Nhân viên Vận hành</Text>
          </View>

          {/* Realtime connection indicator */}
          <View style={styles.connectionBadge}>
            <View style={[styles.statusDot, { backgroundColor: connected ? '#10B981' : '#F59E0B' }]} />
            <Text style={styles.connectionText}>
              {connected ? 'Hệ thống Realtime: Kết nối' : 'Đang kết nối lại...'}
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} style={styles.content}>
          <Text style={styles.sectionHeaderTitle}>Thông tin tài khoản</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color="#15803d" style={styles.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoSubLabel}>Email đăng nhập</Text>
                <Text style={styles.infoText}>{user?.email || 'staff@smartmarket.local'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={20} color="#15803d" style={styles.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoSubLabel}>Khu vực làm việc</Text>
                <Text style={styles.infoText}>Chi nhánh Siêu thị Trung tâm (Khu A-B-C)</Text>
              </View>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#15803d" style={styles.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoSubLabel}>Quyền hạn</Text>
                <Text style={styles.infoText}>Điều khiển Robot & Châm hàng Kệ</Text>
              </View>
            </View>
          </View>

          <View style={styles.versionWrap}>
            <Text style={styles.versionText}>SmartMarketBot Staff · v2.1 Production</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(600).springify()} style={styles.logoutContainer}>
          <AnimatedButton 
            title="Đăng xuất tài khoản" 
            onPress={handleLogout}
            color="#DC2626"
          />
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
  scrollContent: {
    paddingBottom: 36,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20,83,45,0.12)',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#BBF7D0',
    shadowColor: '#15803d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
    textAlign: 'center',
  },
  roleBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  connectionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  content: {
    padding: 16,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 10,
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(20,83,45,0.08)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f1f5f9',
  },
  infoIcon: {
    marginRight: 14,
  },
  infoSubLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  versionWrap: {
    marginTop: 18,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 11.5,
    color: '#94a3b8',
    fontWeight: '600',
  },
  logoutContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
});
