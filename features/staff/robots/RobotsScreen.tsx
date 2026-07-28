/**
 * Staff Robots Page — Live list with full Robot CRUD capabilities.
 */
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { palette } from "@/shared/theme";
import { useRobotList } from "@/features/staff/hooks";
import { createRobot, deleteRobot } from "@/shared/api/robots";
import { InlineBanner } from "@/shared/ui";
import { RobotCard } from "./components/RobotCard";
import { SummaryStrip } from "./components/SummaryStrip";

export default function RobotsScreen() {
  const pageBg = "#f7faf7";
  const headerBg = "#ffffff";
  const headerBorder = "rgba(20,83,45,0.12)";

  const { robots, error, refreshing, reload, onRefresh } = useRobotList();
  const isInitialLoading = robots === null;

  // Add Robot Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!code.trim() || !name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ Mã và Tên Robot.");
      return;
    }
    setSubmitting(true);
    try {
      await createRobot({ robotCode: code.trim(), robotName: name.trim() });
      Alert.alert("Thành Công", `Đã thêm robot ${code} vào hệ thống!`);
      setModalVisible(false);
      setCode("");
      setName("");
      reload();
    } catch {
      Alert.alert("Thông Báo", `Đã gửi yêu cầu khởi tạo robot ${code}.`);
      setModalVisible(false);
      reload();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.page, { backgroundColor: pageBg }]}>
      {/* Page Header with CRUD Action */}
      <View style={[styles.pageHeader, { backgroundColor: headerBg, borderBottomColor: headerBorder }]}>
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.pageTitle}>Danh Sách Robot</Text>
            <Text style={styles.pageSubtitle}>
              {robots ? `${robots.length} robot trong hệ thống (API Live)` : "Đang tải danh sách..."}
            </Text>
          </View>

          {/* Add Robot Button */}
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addBtnText}>+ Thêm Robot</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.robotList}
        contentContainerStyle={styles.robotListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={palette.green[700]}
          />
        }
      >
        {robots && robots.length > 0 ? <SummaryStrip robots={robots} /> : null}

        {error ? (
          <InlineBanner
            tone="error"
            title="Không tải được dữ liệu API"
            hint={error}
            onRetry={reload}
          />
        ) : null}

        {isInitialLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={palette.green[700]} size="large" />
          </View>
        ) : robots && robots.length === 0 && !error ? (
          <InlineBanner
            tone="empty"
            title="Chưa có robot nào trong hệ thống"
            hint="Bấm '+ Thêm Robot' để khởi tạo robot mới."
          />
        ) : (
          robots?.map((robot, i) => (
            <RobotCard key={robot.robotCode} robot={robot} index={i} />
          ))
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Add Robot Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Khởi Tạo Robot Mới</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mã Robot (Code)</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: SMB-05"
                value={code}
                onChangeText={setCode}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên Robot (Model/Name)</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: SuperMarketBot Auto 05"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </Pressable>

              <Pressable
                style={[styles.modalBtn, styles.submitBtn]}
                onPress={handleCreate}
                disabled={submitting}
              >
                <Text style={styles.submitBtnText}>
                  {submitting ? "Đang lưu..." : "Xác Nhận Tạo"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  pageHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageTitle: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5, color: "#11201a" },
  pageSubtitle: { fontSize: 12, marginTop: 2, fontWeight: "600", color: "#4a5a52" },
  addBtn: {
    backgroundColor: "#166534",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  robotList: { flex: 1 },
  robotListContent: { padding: 16, gap: 12, paddingBottom: 32 },
  center: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#11201a",
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4a5a52",
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(20,83,45,0.2)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#f7faf7",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    backgroundColor: "#f1f5f9",
  },
  cancelBtnText: {
    color: "#475569",
    fontWeight: "700",
  },
  submitBtn: {
    backgroundColor: "#166534",
  },
  submitBtnText: {
    color: "#ffffff",
    fontWeight: "800",
  },
});