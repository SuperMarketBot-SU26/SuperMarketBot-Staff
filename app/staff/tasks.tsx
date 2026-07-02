/**
 * Staff Tasks Page — Cảnh Báo
 *
 * Two tabs:
 *   • Hàng hóa → live data from `GET /api/staff/tasks` (Out-of-Stock Handler)
 *   • Robot     → live data derived from `GET /api/robots`:
 *                 any robot that isn't "active" with healthy battery is
 *                 surfaced as a task (urgent when battery < 20% or offline).
 *
 * Both come from real APIs; the screen no longer ships hard-coded tasks.
 */
import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useIsDark, palette, DEVICE, priorityConfig } from "@/constants/theme";
import {
  BotIcon,
  ShoppingBagIcon,
  AlertIcon,
  ClockIcon,
  MapPinIcon,
  ChevronRightIcon,
  CheckCircleIcon,
} from "@/components/ui/staff-icons";
import { useStaffTasks } from "@/hooks/useStaffTasks";
import { useRobotList } from "@/hooks/useRobotList";
import type { NormalizedRobot } from "@/services/api/robots";
import { useApiErrorMessage } from "@/hooks/useApiErrorMessage";

/* ─── Types ─────────────────────────────────────────────────────── */
type Priority = "urgent" | "high" | "normal";
type Category = "hangHoa" | "robot";

interface Task {
  id: number;
  category: Category;
  priority: Priority;
  issueType: string;
  title: string;
  detail: string;
  location: string;
  time: string;
  acknowledged: boolean;
  /** When `category === "robot"`, the underlying robot for deep-linking. */
  robot?: NormalizedRobot;
}

/* ─── Derive robot alerts from a robot list ────────────────────────── */
function robotToTask(r: NormalizedRobot): Task | null {
  // Anything that already reads as a real problem on the UI:
  //   "error"      — battery < 15% / hard error
  //   "charging"   — possibly stuck at dock
  //   "standby"    — only flag if we've never heard from the robot
  //   "active"     — only flag if battery is low (< 20%)
  if (r.status === "active" && r.batteryPct >= 20) return null;

  const priority: Priority =
    r.status === "error" || r.batteryPct < 20 ? "urgent" : "high";

  const issueType =
    r.status === "error"
      ? r.batteryPct < 15
        ? "Pin yếu"
        : "Lỗi"
      : r.status === "charging"
        ? "Đang sạc"
        : !r.lastSeenAt
          ? "Mất kết nối"
          : "Chờ quá lâu";

  return {
    id: r.robotId,
    category: "robot",
    priority,
    issueType,
    title: r.robotCode,
    detail:
      r.status === "error"
        ? `Pin ${r.batteryPct}% — cần kiểm tra.`
        : r.status === "charging"
          ? `Robot đang ở trạm sạc — pin ${r.batteryPct}%.`
          : !r.lastSeenAt
            ? "Chưa có dữ liệu telemetry trong hệ thống."
            : "Robot đang chờ nhưng chưa được giao nhiệm vụ.",
    location: r.position
      ? `(${r.position.x.toFixed(0)}, ${r.position.y.toFixed(0)})`
      : "Chưa có tọa độ",
    time: r.lastSeenAt ? formatRelativeTime(r.lastSeenAt) : "—",
    acknowledged: false,
    robot: r,
  };
}

/** Vietnamese-feeling relative label, reused from robot-detail. */
function formatRelativeTime(iso: string): string {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return iso;
  const diffMs = Date.now() - ts;
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.round(hours / 24);
  return `${days} ngày trước`;
}

/* ─── Issue Icon Map ────────────────────────────────────────────── */
const ISSUE_ICONS: Record<string, React.ElementType> = {
  "Hết kệ": ShoppingBagIcon,
  "Tồn thấp": ShoppingBagIcon,
  "Sắp hết": ShoppingBagIcon,
  "Cần bổ sung": ShoppingBagIcon,
  "Mất kết nối": AlertIcon,
  "Pin yếu": AlertIcon,
  "Lỗi": AlertIcon,
  "Đang sạc": AlertIcon,
  "Chờ quá lâu": AlertIcon,
};

/* ─── Task Card ─────────────────────────────────────────────────── */
function TaskCard({ task, onAcknowledge }: { task: Task; onAcknowledge: (id: number) => void }) {
  const isDark = useIsDark();
  const router = useRouter();
  const cfg = priorityConfig[task.priority];
  const IssueIcon = ISSUE_ICONS[task.issueType] ?? (task.category === "robot" ? BotIcon : ShoppingBagIcon);

  return (
    <Animated.View
      entering={FadeIn}
      style={[
        styles.taskCard,
        {
          backgroundColor: isDark ? palette.gray[900] : "#ffffff",
          borderColor: cfg.border,
          opacity: task.acknowledged ? 0.5 : 1,
        },
      ]}
    >
      <View style={[styles.priorityBar, { backgroundColor: cfg.bar }]} />

      <View style={styles.taskCardBody}>
        <View style={styles.taskTopRow}>
          <View style={styles.taskIconRow}>
            <View
              style={[
                styles.taskIcon,
                { backgroundColor: isDark ? palette.gray[800] : palette.gray[100] },
              ]}
            >
              <IssueIcon size={16} color={cfg.iconText} />
            </View>
            <View>
              <View style={styles.taskBadgeRow}>
                <View style={[styles.taskBadge, { backgroundColor: cfg.badge }]}>
                  <Text style={[styles.taskBadgeText, { color: cfg.badgeText }]}>
                    {task.priority === "urgent"
                      ? "KHẨN CẤP"
                      : task.priority === "high"
                        ? "CAO"
                        : "THƯỜNG"}
                  </Text>
                </View>
                <View style={[styles.taskBadge, { backgroundColor: isDark ? palette.gray[700] : palette.gray[100] }]}>
                  <Text style={[styles.taskBadgeText, { color: isDark ? palette.gray[400] : palette.gray[500] }]}>
                    {task.issueType}
                  </Text>
                </View>
              </View>
              <View style={styles.taskTimeRow}>
                <ClockIcon size={10} color={isDark ? palette.gray[600] : palette.gray[400]} />
                <Text style={[styles.taskTimeText, { color: isDark ? palette.gray[500] : palette.gray[400] }]}>
                  {task.time}
                </Text>
              </View>
            </View>
          </View>
          {task.acknowledged && <CheckCircleIcon size={18} color={palette.emerald[500]} />}
        </View>

        <Text style={[styles.taskTitle, { color: isDark ? "#ffffff" : palette.gray[900] }]}>
          {task.title}
        </Text>

        <Text style={[styles.taskDetail, { color: isDark ? palette.gray[400] : palette.gray[500] }]}>
          {task.detail}
        </Text>

        <View style={styles.taskLocationRow}>
          <MapPinIcon size={11} color={isDark ? palette.gray[600] : palette.gray[400]} />
          <Text style={[styles.taskLocationText, { color: isDark ? palette.gray[400] : palette.gray[500] }]}>
            {task.location}
          </Text>
        </View>

        {!task.acknowledged && (
          <View style={styles.taskActions}>
            <TouchableOpacity
              style={[styles.taskActionBtn, { backgroundColor: cfg.bar }]}
              onPress={() => {
                if (task.category === "robot" && task.robot) {
                  router.push(
                    `/staff/robot-detail?code=${encodeURIComponent(task.robot.robotCode)}` as any,
                  );
                } else {
                  router.push("/staff/robots" as any);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.taskActionBtnText}>
                {task.category === "robot" ? "Đến robot" : "Xử lý"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.taskAckBtn, { backgroundColor: isDark ? palette.gray[800] : palette.gray[100] }]}
              onPress={() => onAcknowledge(task.id)}
              activeOpacity={0.7}
            >
              <ChevronRightIcon size={16} color={isDark ? palette.gray[400] : palette.gray[500]} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────── */
export default function StaffTasksPage() {
  const isDark = useIsDark();
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
  const message = useApiErrorMessage();

  const [filter, setFilter] = React.useState<Category>("hangHoa");

  // Restock tasks → unified Task shape
  const hhTasks: Task[] = useMemo(
    () =>
      restockTasks.map((t) => ({
        id: t.id,
        category: "hangHoa" as const,
        priority: t.priority,
        issueType: t.issueType,
        title: t.title,
        detail: t.detail,
        location: t.location,
        time: formatRelativeTime(t.reportedAt),
        acknowledged: t.acknowledged,
      })),
    [restockTasks],
  );

  // Robot alerts → unified Task shape (filter out healthy ones)
  const robotTasks: Task[] = useMemo(() => {
    if (!robots) return [];
    return robots
      .map(robotToTask)
      .filter((t): t is Task => t !== null);
  }, [robots]);

  const visible = filter === "hangHoa" ? hhTasks : robotTasks;
  const pendingHH = hhTasks.filter((t) => !t.acknowledged).length;
  const pendingRB = robotTasks.length;
  const totalPending = pendingHH + pendingRB;

  const tabs: { key: Category; label: string; icon: React.ElementType }[] = [
    { key: "hangHoa", label: "Hàng hóa", icon: ShoppingBagIcon },
    { key: "robot", label: "Robot", icon: BotIcon },
  ];

  const error = filter === "hangHoa" ? restockError : robotError;
  const onRefresh = filter === "hangHoa" ? onRefreshRestock : onRefreshRobots;
  const refreshing = filter === "hangHoa" ? restockRefreshing : robotRefreshing;
  const ack = (id: number) => {
    if (filter === "hangHoa") ackRestock(id);
    // Robot tasks are derived live — acknowledgment doesn't persist yet.
  };

  const isInitialLoading =
    filter === "hangHoa" ? restockTasks.length === 0 && !!restockError : robots === null;

  return (
    <View style={[styles.page, { backgroundColor: isDark ? palette.gray[950] : "#f3f4f6" }]}>
      <View
        style={[
          styles.pageHeader,
          {
            backgroundColor: isDark ? palette.gray[900] : "#ffffff",
            borderBottomColor: isDark ? palette.gray[800] : palette.gray[200],
          },
        ]}
      >
        <View style={styles.pageHeaderTop}>
          <View>
            <Text style={[styles.pageTitle, { color: isDark ? "#ffffff" : palette.gray[900] }]}>
              Cảnh Báo
            </Text>
            <Text style={[styles.pageSubtitle, { color: isDark ? palette.gray[400] : palette.gray[500] }]}>
              {totalPending > 0 ? `${totalPending} chưa xử lý` : "Tất cả đã xử lý"}
            </Text>
          </View>

          {totalPending > 0 && (
            <View style={styles.badgeCount}>
              <Text style={styles.badgeCountText}>{totalPending}</Text>
            </View>
          )}
        </View>

        <View style={[styles.tabSwitcher, { backgroundColor: isDark ? palette.gray[800] : palette.gray[100] }]}>
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const active = filter === tab.key;
            const count = tab.key === "hangHoa" ? pendingHH : pendingRB;

            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabBtn,
                  { backgroundColor: active ? palette.violet[600] : "transparent" },
                ]}
                onPress={() => setFilter(tab.key)}
                activeOpacity={0.7}
              >
                <TabIcon size={15} color={active ? "#ffffff" : isDark ? palette.gray[400] : palette.gray[500]} />
                <Text
                  style={[
                    styles.tabBtnText,
                    { color: active ? "#ffffff" : isDark ? palette.gray[400] : palette.gray[500] },
                  ]}
                >
                  {tab.label}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.tabBadge,
                      { backgroundColor: active ? "rgba(255,255,255,0.25)" : palette.red[500] },
                    ]}
                  >
                    <Text style={[styles.tabBadgeText, { color: "#ffffff" }]}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

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
                backgroundColor: isDark ? "rgba(239,68,68,0.10)" : palette.red[50],
                borderColor: palette.red[500],
              },
            ]}
          >
            <Text style={{ color: palette.red[500], fontSize: 13, fontWeight: "700" }}>
              {message(new Error(error))}
            </Text>
          </View>
        ) : null}

        {isInitialLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={palette.violet[600]} />
          </View>
        ) : visible.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>{filter === "hangHoa" ? "📦" : "🤖"}</Text>
            <Text style={[styles.emptyText, { color: isDark ? palette.gray[500] : palette.gray[400] }]}>
              {filter === "hangHoa"
                ? "Không có cảnh báo tồn kho."
                : "Tất cả robot đang hoạt động bình thường."}
            </Text>
          </View>
        ) : (
          visible.map((task) => (
            <TaskCard key={task.id} task={task} onAcknowledge={ack} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  page: { flex: 1 },
  pageHeader: {
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  pageHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageTitle: { fontSize: 20, fontWeight: "800" },
  pageSubtitle: { fontSize: 13, marginTop: 2 },
  badgeCount: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.red[500],
    alignItems: "center",
    justifyContent: "center",
    shadowColor: palette.red[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  badgeCountText: { color: "#ffffff", fontSize: 14, fontWeight: "800" },
  tabSwitcher: { flexDirection: "row", padding: 4, borderRadius: 14 },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabBtnText: { fontSize: 14, fontWeight: "700" },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tabBadgeText: { fontSize: 10, fontWeight: "800" },
  taskList: { flex: 1 },
  taskListContent: { padding: 16, gap: 10, paddingBottom: 32 },
  taskCard: {
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
    overflow: "hidden",
  },
  priorityBar: { height: 3 },
  taskCardBody: { padding: 14, gap: 8 },
  taskTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  taskIconRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  taskIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  taskBadgeRow: { flexDirection: "row", gap: 4 },
  taskBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  taskBadgeText: { fontSize: 10, fontWeight: "700" },
  taskTimeRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  taskTimeText: { fontSize: 10 },
  taskTitle: { fontSize: 15, fontWeight: "800" },
  taskDetail: { fontSize: 13, lineHeight: 20 },
  taskLocationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  taskLocationText: { fontSize: 12 },
  taskActions: { flexDirection: "row", gap: 8, marginTop: 4 },
  taskActionBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  taskActionBtnText: { color: "#ffffff", fontSize: 14, fontWeight: "700" },
  taskAckBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 80, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 14, fontWeight: "500" },
  banner: { borderRadius: DEVICE.borderRadius.card, borderWidth: 1, padding: 12, marginBottom: 8 },
  center: { paddingVertical: 48, alignItems: "center", justifyContent: "center" },
});