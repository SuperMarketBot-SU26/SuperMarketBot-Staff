/**
 * TaskCard — one row in the Cảnh Báo task list.
 *
 * Renders the priority bar + icon + title + detail + location + actions.
 * For "robot" tasks, the primary action deep-links to /staff/robot-detail;
 * for "hangHoa" tasks it routes to /staff/robots.
 */
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useRouter } from "expo-router";
import {
  DEVICE,
  palette,
  priorityConfig,
  useIsDark,
} from "@/shared/theme";
import {
  AlertIcon,
  BotIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  MapPinIcon,
  ShoppingBagIcon,
} from "@/shared/ui";
import { type Task } from "../lib/deriveRobotAlerts";

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

interface TaskCardProps {
  task: Task;
  onAcknowledge: (id: number) => void;
}

export function TaskCard({ task, onAcknowledge }: TaskCardProps) {
  const isDark = useIsDark();
  const router = useRouter();
  const cfg = priorityConfig[task.priority];
  const IssueIcon =
    ISSUE_ICONS[task.issueType] ??
    (task.category === "robot" ? BotIcon : ShoppingBagIcon);

  return (
    <Animated.View
      entering={FadeIn}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? palette.gray[900] : "#ffffff",
          borderColor: cfg.border,
          opacity: task.acknowledged ? 0.5 : 1,
        },
      ]}
    >
      <View style={[styles.priorityBar, { backgroundColor: cfg.bar }]} />

      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={styles.iconRow}>
            <View
              style={[
                styles.icon,
                {
                  backgroundColor: isDark
                    ? palette.gray[800]
                    : palette.gray[100],
                },
              ]}
            >
              <IssueIcon size={16} color={cfg.iconText} />
            </View>
            <View>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: cfg.badge }]}>
                  <Text
                    style={[styles.badgeText, { color: cfg.badgeText }]}
                  >
                    {task.priority === "urgent"
                      ? "KHẨN CẤP"
                      : task.priority === "high"
                        ? "CAO"
                        : "THƯỜNG"}
                  </Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: isDark
                        ? palette.gray[700]
                        : palette.gray[100],
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color: isDark
                          ? palette.gray[400]
                          : palette.gray[500],
                      },
                    ]}
                  >
                    {task.issueType}
                  </Text>
                </View>
              </View>
              <View style={styles.timeRow}>
                <ClockIcon
                  size={10}
                  color={isDark ? palette.gray[600] : palette.gray[400]}
                />
                <Text
                  style={[
                    styles.timeText,
                    {
                      color: isDark
                        ? palette.gray[500]
                        : palette.gray[400],
                    },
                  ]}
                >
                  {task.time}
                </Text>
              </View>
            </View>
          </View>
          {task.acknowledged ? (
            <CheckCircleIcon size={18} color={palette.emerald[500]} />
          ) : null}
        </View>

        <Text
          style={[
            styles.title,
            { color: isDark ? "#ffffff" : palette.gray[900] },
          ]}
        >
          {task.title}
        </Text>

        <Text
          style={[
            styles.detail,
            { color: isDark ? palette.gray[400] : palette.gray[500] },
          ]}
        >
          {task.detail}
        </Text>

        <View style={styles.locationRow}>
          <MapPinIcon
            size={11}
            color={isDark ? palette.gray[600] : palette.gray[400]}
          />
          <Text
            style={[
              styles.locationText,
              { color: isDark ? palette.gray[400] : palette.gray[500] },
            ]}
          >
            {task.location}
          </Text>
        </View>

        {!task.acknowledged ? (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: cfg.bar }]}
              onPress={() => {
                if (task.category === "robot") {
                  router.push(
                    `/staff/robot-detail?code=${encodeURIComponent(task.robot.robotCode)}` as any,
                  );
                } else {
                  router.push("/staff/robots" as any);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>
                {task.category === "robot" ? "Đến robot" : "Xử lý"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.ackBtn,
                {
                  backgroundColor: isDark
                    ? palette.gray[800]
                    : palette.gray[100],
                },
              ]}
              onPress={() => onAcknowledge(task.id)}
              activeOpacity={0.7}
            >
              <ChevronRightIcon
                size={16}
                color={isDark ? palette.gray[400] : palette.gray[500]}
              />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
    overflow: "hidden",
  },
  priorityBar: { height: 3 },
  body: { padding: 14, gap: 8 },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  iconRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeRow: { flexDirection: "row", gap: 4 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  timeText: { fontSize: 10 },
  title: { fontSize: 15, fontWeight: "800" },
  detail: { fontSize: 13, lineHeight: 20 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: { fontSize: 12 },
  actions: { flexDirection: "row", gap: 8, marginTop: 4 },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  actionBtnText: { color: "#ffffff", fontSize: 14, fontWeight: "700" },
  ackBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});