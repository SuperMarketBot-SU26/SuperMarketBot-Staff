/**
 * Staff Tasks Page — Cảnh Báo
 * Shows real-time alerts for inventory and robot issues
 */
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useIsDark, palette, DEVICE, priorityConfig, FloorId } from "@/constants/theme";
import {
  BotIcon,
  ShoppingBagIcon,
  AlertIcon,
  ClockIcon,
  MapPinIcon,
  ChevronRightIcon,
  CheckCircleIcon,
} from "@/components/ui/staff-icons";
import { robotStatusConfig } from "@/constants/theme";

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
}

/* ─── Mock Data ────────────────────────────────────────────────── */
const INITIAL_TASKS: Task[] = [
  {
    id: 1, category: "hangHoa", priority: "urgent", issueType: "Hết kệ",
    title: "Sữa TH True Milk 1L",
    detail: "Kệ trống hoàn toàn — kho còn 24 hộp, cần bổ sung ngay",
    location: "Kệ A · Hàng 1", time: "2 phút trước", acknowledged: false,
  },
  {
    id: 2, category: "hangHoa", priority: "urgent", issueType: "Hết kệ",
    title: "Bánh Mì Sandwich Kinh Đô 75g",
    detail: "Kệ trống hoàn toàn — kho còn 20 gói",
    location: "Kệ B · Hàng 2", time: "5 phút trước", acknowledged: false,
  },
  {
    id: 3, category: "hangHoa", priority: "high", issueType: "Tồn thấp",
    title: "Nước Ép Cam Tropicana 1L",
    detail: "Chỉ còn 2 chai trên kệ (tối thiểu: 8) — kho trống",
    location: "Kệ A · Hàng 4", time: "15 phút trước", acknowledged: false,
  },
  {
    id: 4, category: "robot", priority: "urgent", issueType: "Pin thấp",
    title: "SMB-04",
    detail: "Robot mất kết nối WiFi đột ngột — không phản hồi lệnh",
    location: "Khu B · Lối 2", time: "1 phút trước", acknowledged: false,
  },
  {
    id: 5, category: "robot", priority: "high", issueType: "Lỗi điều hướng",
    title: "SMB-01",
    detail: "Sai lệch bản đồ, đang lặp vòng — cần hiệu chỉnh lại",
    location: "Khu D · Hành lang", time: "12 phút trước", acknowledged: false,
  },
  {
    id: 6, category: "robot", priority: "high", issueType: "Bị mắc kẹt",
    title: "SMB-05",
    detail: "Va chạm chướng ngại vật, tự dừng — cần nhân viên hỗ trợ",
    location: "Khu C · Cổng chính", time: "4 phút trước", acknowledged: false,
  },
  {
    id: 7, category: "hangHoa", priority: "normal", issueType: "Cần bổ sung",
    title: "Vinamilk Sữa Tươi 180ml",
    detail: "Tồn kệ: 4 hộp — dự kiến hết trong ~2 giờ",
    location: "Kệ A · Hàng 2", time: "22 phút trước", acknowledged: true,
  },
];

/* ─── Issue Icon Map ────────────────────────────────────────────── */
const ISSUE_ICONS: Record<string, React.ElementType> = {
  "Hết kệ": ShoppingBagIcon,
  "Tồn thấp": ShoppingBagIcon,
  "Cần bổ sung": ShoppingBagIcon,
  "Mất kết nối": AlertIcon,
  "Bị mắc kẹt": AlertIcon,
  "Pin thấp": AlertIcon,
  "Lỗi điều hướng": AlertIcon,
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
      {/* Priority top bar */}
      <View style={[styles.priorityBar, { backgroundColor: cfg.bar }]} />

      <View style={styles.taskCardBody}>
        {/* Top row */}
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
                  <Text style={[styles.taskBadgeText, { color: cfg.badgeText }]}>{cfg.bar === palette.red[500] ? "KHẨN CẤP" : cfg.bar === palette.orange[500] ? "CAO" : "THƯỜNG"}</Text>
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

        {/* Title */}
        <Text style={[styles.taskTitle, { color: isDark ? "#ffffff" : palette.gray[900] }]}>
          {task.category === "robot" ? `🤖 ${task.title}` : task.title}
        </Text>

        {/* Detail */}
        <Text style={[styles.taskDetail, { color: isDark ? palette.gray[400] : palette.gray[500] }]}>
          {task.detail}
        </Text>

        {/* Location */}
        <View style={styles.taskLocationRow}>
          <MapPinIcon size={11} color={isDark ? palette.gray[600] : palette.gray[400]} />
          <Text style={[styles.taskLocationText, { color: isDark ? palette.gray[400] : palette.gray[500] }]}>
            {task.location}
          </Text>
        </View>

        {/* Actions */}
        {!task.acknowledged && (
          <View style={styles.taskActions}>
            <TouchableOpacity
              style={[styles.taskActionBtn, { backgroundColor: cfg.bar }]}
              onPress={() => {
                if (task.category === "robot") {
                  const path = `/staff/robot-detail?id=${task.title.replace("🤖 ", "")}`;
                  router.push(path as any);
                } else {
                  // Non-robot tasks: route to the robots list as a generic target
                  router.push("/staff/robots" as any);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.taskActionBtnText}>Xử lý</Text>
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
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [filter, setFilter] = useState<Category>("hangHoa");

  const acknowledge = (id: number) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, acknowledged: true } : t)));

  const visible = tasks.filter((t) => t.category === filter);
  const pendingHH = tasks.filter((t) => t.category === "hangHoa" && !t.acknowledged).length;
  const pendingRB = tasks.filter((t) => t.category === "robot" && !t.acknowledged).length;
  const totalPending = pendingHH + pendingRB;

  const tabs: { key: Category; label: string; icon: React.ElementType }[] = [
    { key: "hangHoa", label: "Hàng hóa", icon: ShoppingBagIcon },
    { key: "robot",   label: "Robot",     icon: BotIcon },
  ];

  return (
    <View style={[styles.page, { backgroundColor: isDark ? palette.gray[950] : "#f3f4f6"}]}>
      {/* ── Header ──────────────────────────────────────────── */}
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

        {/* Tab switcher */}
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
                  {
                    backgroundColor: active ? palette.violet[600] : "transparent",
                  },
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

      {/* ── Task List ──────────────────────────────────────── */}
      <ScrollView
        style={styles.taskList}
        contentContainerStyle={styles.taskListContent}
        showsVerticalScrollIndicator={false}
      >
        {visible.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>{filter === "hangHoa" ? "📦" : "🤖"}</Text>
            <Text style={[styles.emptyText, { color: isDark ? palette.gray[500] : palette.gray[400] }]}>
              Không có cảnh báo nào
            </Text>
          </View>
        ) : (
          visible.map((task) => (
            <TaskCard key={task.id} task={task} onAcknowledge={acknowledge} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
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
  pageTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  pageSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
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
  badgeCountText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  tabSwitcher: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 14,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  taskList: {
    flex: 1,
  },
  taskListContent: {
    padding: 16,
    gap: 10,
    paddingBottom: 32,
  },
  taskCard: {
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
    overflow: "hidden",
  },
  priorityBar: {
    height: 3,
  },
  taskCardBody: {
    padding: 14,
    gap: 8,
  },
  taskTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  taskIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  taskIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  taskBadgeRow: {
    flexDirection: "row",
    gap: 4,
  },
  taskBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  taskBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  taskTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  taskTimeText: {
    fontSize: 10,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  taskDetail: {
    fontSize: 13,
    lineHeight: 20,
  },
  taskLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  taskLocationText: {
    fontSize: 12,
  },
  taskActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  taskActionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  taskActionBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  taskAckBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
