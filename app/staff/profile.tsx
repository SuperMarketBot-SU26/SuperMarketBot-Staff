import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '@/features/auth';
import { useRouter } from 'expo-router';
import { CustomHeader, AnimatedButton } from '@/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useStaffRealtime } from '@/shared/realtime/StaffRealtimeContext';
import { getStaffProfile, type StaffProfileDto } from '@/shared/api';

export default function ProfilePage() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const { connected } = useStaffRealtime();

  const [profile, setProfile] = useState<StaffProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        setIsLoading(true);
        const data = await getStaffProfile(user?.userId);
        if (isMounted) setProfile(data);
      } catch (err) {
        console.warn('Failed to load staff profile:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadProfile();
    return () => { isMounted = false; };
  }, [user?.userId]);

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

  const formattedJoinedDate = profile?.joinedAt 
    ? new Date(profile.joinedAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : '---';

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
          <Text style={styles.name}>{profile?.fullName || user?.fullName || 'Nhân viên Siêu thị'}</Text>
          
          <View style={styles.badgeRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{profile?.roleTitle || 'Nhân viên Vận hành'}</Text>
            </View>
            <View style={styles.codeBadge}>
              <Text style={styles.codeText}>{profile?.staffCode || (user?.userId ? `#NV${String(user.userId).padStart(4, '0')}` : '#NV0001')}</Text>
            </View>
          </View>

          {/* Realtime & Shift indicator */}
          <View style={styles.metaRow}>
            <View style={styles.connectionBadge}>
              <View style={[styles.statusDot, { backgroundColor: connected ? '#10B981' : '#F59E0B' }]} />
              <Text style={styles.connectionText}>
                {connected ? 'Realtime: Đã kết nối' : 'Đang kết nối lại...'}
              </Text>
            </View>
            <View style={[styles.connectionBadge, { borderColor: '#BBF7D0', backgroundColor: '#F0FDF4' }]}>
              <View style={[styles.statusDot, { backgroundColor: '#15803d' }]} />
              <Text style={[styles.connectionText, { color: '#15803d', fontWeight: '700' }]}>
                {profile?.shiftStatus || 'Đang trong ca trực'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Operational Stats: Pending vs Completed */}
        <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconWrapPending}>
              <Ionicons name="hourglass-outline" size={20} color="#D97706" />
            </View>
            <Text style={styles.statValue}>{profile?.pendingTasksCount ?? 0}</Text>
            <Text style={styles.statLabel}>Chờ tiếp hàng</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconWrapDone}>
              <Ionicons name="checkmark-done-outline" size={20} color="#15803d" />
            </View>
            <Text style={[styles.statValue, { color: '#15803d' }]}>{profile?.completedTodayCount ?? 0}</Text>
            <Text style={styles.statLabel}>Đã xong hôm nay</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} style={styles.content}>
          <Text style={styles.sectionHeaderTitle}>Thông tin công tác</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="barcode-outline" size={20} color="#15803d" style={styles.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoSubLabel}>Mã nhân viên</Text>
                <Text style={styles.infoText}>{profile?.staffCode || '#NV0001'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color="#15803d" style={styles.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoSubLabel}>Số điện thoại</Text>
                <Text style={styles.infoText}>{profile?.phone || 'Chưa cập nhật'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color="#15803d" style={styles.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoSubLabel}>Email công vụ</Text>
                <Text style={styles.infoText}>{profile?.email || user?.email || 'staff@smartmarket.local'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="storefront-outline" size={20} color="#15803d" style={styles.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoSubLabel}>Chi nhánh làm việc</Text>
                <Text style={styles.infoText}>{profile?.branchName || 'Chi nhánh Siêu thị Trung tâm'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="map-outline" size={20} color="#15803d" style={styles.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoSubLabel}>Khu vực phụ trách</Text>
                <Text style={styles.infoText}>{profile?.workingZones || 'Khu A, Khu B, Khu C'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#15803d" style={styles.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoSubLabel}>Quyền hạn vận hành</Text>
                <Text style={styles.infoText}>{profile?.permissions || 'Điều khiển Robot & Châm hàng Kệ'}</Text>
              </View>
            </View>

            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Ionicons name="calendar-outline" size={20} color="#15803d" style={styles.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoSubLabel}>Ngày nhận việc</Text>
                <Text style={styles.infoText}>{formattedJoinedDate}</Text>
              </View>
            </View>
          </View>

          <View style={styles.versionWrap}>
            <Text style={styles.versionText}>SmartMarketBot Staff · v2.1 Production</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(600).springify()} style={styles.logoutContainer}>
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
  },
  codeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  codeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#047857',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
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
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(20,83,45,0.08)',
  },
  statIconWrapPending: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIconWrapDone: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
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
