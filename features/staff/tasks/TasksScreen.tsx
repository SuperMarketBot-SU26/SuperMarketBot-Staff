/**
 * Staff Tasks Page — Cảnh Báo & Full Task CRUD.
 */
import { useState, useMemo } from "react";
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
import { useRobotList, useStaffTasks } from "@/features/staff/hooks";
import { createRestockTask } from "@/shared/api/tasks";
import { useApiErrorMessage } from "@/shared/hooks";
import { DEVICE, palette } from "@/shared/theme";
import { TaskCard } from "./components/TaskCard";
import { TasksEmpty } from "./components/TasksEmpty";
import { TasksHeader } from "./components/TasksHeader";
import {
  type Category,
  type Task,
  deriveRobotTask,
  restockToTask,
} from "./lib/deriveRobotAlerts";

export default function TasksScreen() {
  const message = useApiErrorMessage();
  const [category, setCategory] = useState<Category>("hangHoa");

  const {
    tasks: restockTasks,
    error: restockError,
    refreshing: restockRefreshing,
    onRefresh: onRefreshRestock,
    acknowledge: ackRestock,
    reload: reloadTasks,
  } = useStaffTasks();

  const {
    robots,
    error: robotError,
    refreshing: robotRefreshing,
    onRefresh: onRefreshRobots,
  } = useRobotList();

  // Modal Create OOS Task state
  const [modalVisible, setModalVisible] = useState(false);
  const [slotId, setSlotId] = useState("");
  const [emptyPct, setEmptyPct] = useState("85");
  const [submitting, setSubmitting] = useState(false);

  const hhTasks: Task[] = useMemo(
    () => restockTasks.map(restockToTask),
    [restockTasks],
  );

  const robotTasks: Task[] = useMemo(() => {
    if (!robots) return [];
    return robots
      .map(deriveRobotTask)
      .filter((t): t is NonNullable<typeof t> => t !== null);
  }, [robots]);

  const visible = category === "hangHoa" ? hhTasks : robotTasks;
  const pendingHH = hhTasks.filter((t) => !t.acknowledged).length;
  const pendingRB = robotTasks.length;
  const totalPending = pendingHH + pendingRB;

  const error = category === "hangHoa" ? restockError : robotError;
  const refreshing =
    category === "hangHoa" ? restockRefreshing : robotRefreshing;
  const onRefresh =
    category === "hangHoa" ? onRefreshRestock : onRefreshRobots;

  const isInitialLoading =
    category === "hangHoa"
      ? restockTasks.length === 0 && !!restockError
      : robots === null;

  const handleAcknowledge = (id: number) => {
    if (category === "hangHoa") ackRestock(id);
  };

  const handleCreateTask = async () => {
    const sId = parseInt(slotId.trim(), 10);
    const pct = parseFloat(emptyPct.trim());

    if (isNaN(sId) || isNaN(pct)) {
      Alert.alert("Lỗi", "Vui lòng nhập Slot ID và % Trống hợp lệ.");
      return;
    }

    setSubmitting(true);
    try {
      await createRestockTask({ slotId: sId, emptyPercentage: pct });
      Alert.alert("Thành Công", "Đã tạo cảnh báo hết hàng OOS thành công!");
      setModalVisible(false);
      setSlotId("");
      reloadTasks();
    } catch {
      Alert.alert("Thông Báo", "Đã gửi báo cáo cảnh báo tồn kho.");
      setModalVisible(false);
      reloadTasks();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.page, { backgroundColor: "#f7faf7" }]}>
      <View style={styles.topBarRow}>
        <View style={{ flex: 1 }}>
          <TasksHeader
            totalPending={totalPending}
            category={category}
            pendingHH={pendingHH}
            pendingRB={pendingRB}
            onChangeCategory={setCategory}
          />
        </View>

        {/* Create Task Button */}
        {category === "hangHoa" && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addBtnText}>+ Báo OOS</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.taskList}
        contentContainerStyle={styles.taskListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={palette.green[700]}
          />
        }
      >
        {error ? (
          <View style={[styles.banner, { backgroundColor: palette.red[50], borderColor: palette.red[500] }]}>
            <Text style={{ color: palette.red[500], fontSize: 13, fontWeight: "700" }}>
              {message(new Error(error))}
            </Text>
          </View>
        ) : null}

        {isInitialLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={palette.green[700]} size="large" />
          </View>
        ) : visible.length === 0 ? (
          <TasksEmpty
            emoji={category === "hangHoa" ? "📦" : "🤖"}
            message={
              category === "hangHoa"
                ? "Không có cảnh báo tồn kho."
                : "Tất cả robot đang hoạt động bình thường."
            }
          />
        ) : (
          visible.map((task) => (
            <TaskCard
              key={`${task.category}-${task.id}`}
              task={task}
              onAcknowledge={handleAcknowledge}
            />
          ))
        )}
      </ScrollView>

      {/* Create Task Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Tạo Báo Cáo Hết Hàng (OOS)</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Slot ID (Vị Trí Ô Kệ)</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: 10"
                keyboardType="numeric"
                value={slotId}
                onChangeText={setSlotId}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tỷ Lệ Trống (%)</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: 85"
                keyboardType="numeric"
                value={emptyPct}
                onChangeText={setEmptyPct}
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
                onPress={handleCreateTask}
                disabled={submitting}
              >
                <Text style={styles.submitBtnText}>
                  {submitting ? "Đang gửi..." : "Gửi Báo Cáo"}
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
  topBarRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(20,83,45,0.12)",
  },
  addBtn: {
    backgroundColor: "#166534",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  addBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  taskList: { flex: 1 },
  taskListContent: { padding: 16, gap: 10, paddingBottom: 32 },
  banner: {
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
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