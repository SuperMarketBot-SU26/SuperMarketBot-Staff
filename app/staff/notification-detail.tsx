import { listRestockTasks, StaffTask } from '@/shared/api/tasks';
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

  useEffect(() => {
    async function loadData() {
      try {
        const tasks = await listRestockTasks();
        const found = tasks.find(t => t.id.toString() === id);
        if (found) {
          setTask(found);
        } else {
          // fallback mock data
          setTask({
            id: Number(id),
            title: "Cảnh báo hết hàng (Mock)",
            location: "Kệ A-12",
            priority: "urgent",
            detail: "Phát hiện kệ hàng trống qua camera AI.",
            category: "hangHoa",
            isError: true,
            reportedAt: new Date().toISOString(),
            acknowledged: false,
            restock: {
              scanId: Number(id),
              slotId: 0,
              slotCode: "A-12",
              shelfLocation: "Kệ A-12",
              productId: 0,
              productName: "Mock Product",
              productImageUrl: null,
              currentQuantity: 0,
              emptyPercentage: 100,
              reportedAt: new Date().toISOString(),
              priority: "High",
              hasWarehouseStock: false,
            }
          });
        }
      } catch (e) {
        console.error(e);
        // fallback on error
        setTask({
          id: Number(id),
          title: "Cảnh báo khẩn cấp (Mock)",
          location: "Khu vực B-03",
          priority: "urgent",
          detail: "Sự cố cần kiểm tra lập tức.",
          category: "hangHoa",
          isError: true,
          reportedAt: new Date().toISOString(),
          acknowledged: false,
          restock: {
            scanId: Number(id),
            slotId: 0,
            slotCode: "B-03",
            shelfLocation: "Khu vực B-03",
            productId: 0,
            productName: "Mock Product",
            productImageUrl: null,
            currentQuantity: 0,
            emptyPercentage: 100,
            reportedAt: new Date().toISOString(),
            priority: "High",
            hasWarehouseStock: false,
          }
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

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

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Chi tiết thông báo"
        subtitle={`ID: ${task.id}`}
      />

      <View style={styles.backButtonContainer}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#2E7D32" />
          <Text style={styles.backButtonText}>Quay lại</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.card}>
          <View style={styles.headerRow}>
            <View style={[styles.iconBox, { backgroundColor: isUrgent ? '#FFEBEE' : '#FFF3E0' }]}>
              <Ionicons name="warning" size={28} color={isUrgent ? "#F44336" : "#FF9800"} />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{task.title}</Text>
              <Text style={styles.timeLabel}>Vừa xong</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.infoText}>Vị trí: <Text style={{ fontWeight: '600', color: '#333' }}>{task.location}</Text></Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={20} color="#666" />
            <Text style={styles.infoText}>Trạng thái: <Text style={{ fontWeight: '600', color: isUrgent ? '#F44336' : '#FF9800' }}>{isUrgent ? 'Khẩn cấp' : 'Cần xử lý'}</Text></Text>
          </View>

          <View style={styles.detailBox}>
            <Text style={styles.detailTitle}>Mô tả chi tiết:</Text>
            <Text style={styles.detailContent}>{task.detail}</Text>
            <Text style={styles.detailContent}>Đây là dữ liệu chi tiết giả lập. Hệ thống AI đã phát hiện kệ hàng trống hoặc có vấn đề cần nhân viên kiểm tra trực tiếp để tiến hành bổ sung hàng hóa vào kệ.</Text>
          </View>

          {/* Mock Image Placeholder */}
          <View style={styles.imagePlaceholder}>
            <Ionicons name="camera-outline" size={40} color="#ccc" />
            <Text style={styles.imageText}>Ảnh chụp từ Robot AI (Mock)</Text>
          </View>

        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.actionContainer}>
          <AnimatedButton
            title="Xác nhận đã xử lý"
            onPress={() => router.back()}
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
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#11201a',
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 13,
    color: '#888',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#4a5a52',
  },
  detailBox: {
    marginTop: 8,
    backgroundColor: '#f8faf9',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8e5',
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#11201a',
    marginBottom: 8,
  },
  detailContent: {
    fontSize: 14,
    color: '#4a5a52',
    lineHeight: 22,
    marginBottom: 8,
  },
  imagePlaceholder: {
    marginTop: 20,
    height: 160,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  imageText: {
    marginTop: 8,
    color: '#888',
    fontSize: 13,
  },
  actionContainer: {
    marginTop: 24,
  }
});
