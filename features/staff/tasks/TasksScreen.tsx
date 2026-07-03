/**
 * Staff Tasks Page — Cảnh Báo.
 *
 * Two tabs:
 *   • Hàng hóa → live data from `GET /api/staff/tasks` (Out-of-Stock Handler)
 *   • Robot     → live data derived from `GET /api/robots`:
 *                 any robot that isn't "active" with healthy battery is
 *                 surfaced as a task (urgent when battery < 20% or offline).
 *
 * Both come from real APIs; the screen no longer ships hard-coded tasks.
 */
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { DEVICE, palette, useIsDark } from "@/shared/theme";
import { useApiErrorMessage } from "@/shared/hooks";
import { useRobotList, useStaffTasks } from "@/features/staff/hooks";
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
  const isDark = useIsDark();
  const message = useApiErrorMessage();
  const [category, setCategory] = useState<Category>("hangHoa");

  const {
    tasks: restockTasks,
    error: restockError,
    refreshing: restockRefreshing,
    onRefresh: onRefreshRestock,
    acknowledge: ackRestock,
  } = useStaffTasks();

  const {
    robots,
    error: robotError,
    refreshing: robotRefreshing,
    onRefresh: onRefreshRobots,
  } = useRobotList();

  // Restock tasks → unified Task shape
  const hhTasks: Task[] = useMemo(
    () => restockTasks.map(restockToTask),
    [restockTasks],
  );

  // Robot alerts → unified Task shape (filter out healthy ones)
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
    // Robot tasks are derived live — acknowledgment doesn't persist yet.
  };

  return (
    <View style={[styles.page, { backgroundColor: isDark ? palette.gray[950] : "#f3f4f6" }]}>
      <TasksHeader
        totalPending={totalPending}
        category={category}
        pendingHH={pendingHH}
        pendingRB={pendingRB}
        onChangeCategory={setCategory}
      />

      <ScrollView
        style={styles.taskList}
        contentContainerStyle={styles.taskListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? palette.gray[400] : palette.gray[500]}
          />
        }
      >
        {error ? (
          <View
            style={[
              styles.banner,
              {
                backgroundColor: isDark
                  ? "rgba(239,68,68,0.10)"
                  : palette.red[50],
                borderColor: palette.red[500],
              },
            ]}
          >
            <Text
              style={{
                color: palette.red[500],
                fontSize: 13,
                fontWeight: "700",
              }}
            >
              {message(new Error(error))}
            </Text>
          </View>
        ) : null}

        {isInitialLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={palette.violet[600]} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
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
});