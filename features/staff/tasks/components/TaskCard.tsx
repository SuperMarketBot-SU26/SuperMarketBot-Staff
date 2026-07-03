/**
 * TaskCard — one row in the Cảnh Báo task list.
 *
 * Renders the priority bar + icon + title + detail + location + actions.
 *
 * Categories:
 *   - "robot"    → primary "Đến robot" opens /staff/robot-location
 *                 (full-bleed map of the robot's position);
 *                 chevron pill on the right acknowledges locally.
 *   - "hangHoa"  → single "Xử lý" button opens /staff/restock-location,
 *                 where the staff member confirms "Đã xử lý" on the spot.
 */
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
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
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

const enc = (v: string | number) => encodeURIComponent(String(v));

/** Build the deep-link URL + params for the restock-location screen. */
function buildRestockHref(task: Task): string {
  if (task.category !== "hangHoa") return "";
  const params = new URLSearchParams({
    id: enc(task.id),
    title: enc(task.title),
    detail: enc(task.detail),
    location: enc(task.location),
    priority: task.priority,
    slotCode: enc(task.restock.slotCode),
    shelfLocation: enc(task.restock.shelfLocation),
    productName: enc(task.restock.productName),
    emptyPercentage: enc(task.restock.emptyPercentage),
  });
  return `/staff/restock-location?${params.toString()}`;
}

/** Build the deep-link URL + params for the robot-location screen. */
function buildRobotLocationHref(task: Task): string {
  if (task.category !== "robot") return "";
  const r = task.robot;
  const params = new URLSearchParams({
    code: enc(r.robotCode),
    name: enc(r.robotName),
    status: r.status,
    mode: r.mode,
    batteryPct: enc(r.batteryPct),
  });
  if (r.position) {
    params.set("position", `${r.position.x.toFixed(2)},${r.position.y.toFixed(2)}`);
  }
  return `/staff/robot-location?${params.toString()}`;
}

export function TaskCard({ task, onAcknowledge }: TaskCardProps) {
  const isDark = useIsDark();
  const router = useRouter();
  const cfg = priorityConfig[task.priority];
  const IssueIcon =
    ISSUE_ICONS[task.issueType] ??
    (task.category === "robot" ? BotIcon : ShoppingBagIcon);

  const handlePrimaryAction = () => {
    if (task.category === "robot") {
      router.push(buildRobotLocationHref(task) as any);
    } else {
      router.push(buildRestockHref(task) as any);
    }
  };

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
              onPress={handlePrimaryAction}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>
                {task.category === "robot" ? "Đến robot" : "Xử lý"}
              </Text>
            </TouchableOpacity>
            {task.category === "robot" ? (
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
            ) : null}
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