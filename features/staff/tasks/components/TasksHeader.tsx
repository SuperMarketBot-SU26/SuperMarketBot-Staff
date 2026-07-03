/**
 * TasksHeader — top of the Cảnh Báo page: title, pending count, tab switcher.
 */
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { palette, useIsDark } from "@/shared/theme";
import { BotIcon, ShoppingBagIcon } from "@/shared/ui";
import type { Category } from "../lib/deriveRobotAlerts";

interface TasksHeaderProps {
  totalPending: number;
  category: Category;
  pendingHH: number;
  pendingRB: number;
  onChangeCategory: (next: Category) => void;
}

export function TasksHeader({
  totalPending,
  category,
  pendingHH,
  pendingRB,
  onChangeCategory,
}: TasksHeaderProps) {
  const isDark = useIsDark();
  const headerBg = isDark ? palette.gray[900] : "#ffffff";
  const border = isDark ? palette.gray[800] : palette.gray[200];

  const tabs: { key: Category; label: string; Icon: React.ElementType; count: number }[] = [
    { key: "hangHoa", label: "Hàng hóa", Icon: ShoppingBagIcon, count: pendingHH },
    { key: "robot", label: "Robot", Icon: BotIcon, count: pendingRB },
  ];

  return (
    <View
      style={[
        styles.pageHeader,
        { backgroundColor: headerBg, borderBottomColor: border },
      ]}
    >
      <View style={styles.pageHeaderTop}>
        <View>
          <Text
            style={[
              styles.pageTitle,
              { color: isDark ? "#ffffff" : palette.gray[900] },
            ]}
          >
            Cảnh Báo
          </Text>
          <Text
            style={[
              styles.pageSubtitle,
              { color: isDark ? palette.gray[400] : palette.gray[500] },
            ]}
          >
            {totalPending > 0 ? `${totalPending} chưa xử lý` : "Tất cả đã xử lý"}
          </Text>
        </View>

        {totalPending > 0 ? (
          <View style={styles.badgeCount}>
            <Text style={styles.badgeCountText}>{totalPending}</Text>
          </View>
        ) : null}
      </View>

      <View
        style={[
          styles.tabSwitcher,
          {
            backgroundColor: isDark
              ? palette.gray[800]
              : palette.gray[100],
          },
        ]}
      >
        {tabs.map((tab) => {
          const active = category === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabBtn,
                {
                  backgroundColor: active
                    ? palette.violet[600]
                    : "transparent",
                },
              ]}
              onPress={() => onChangeCategory(tab.key)}
              activeOpacity={0.7}
            >
              <tab.Icon
                size={15}
                color={
                  active
                    ? "#ffffff"
                    : isDark ? palette.gray[400] : palette.gray[500]
                }
              />
              <Text
                style={[
                  styles.tabBtnText,
                  {
                    color: active
                      ? "#ffffff"
                      : isDark ? palette.gray[400] : palette.gray[500],
                  },
                ]}
              >
                {tab.label}
              </Text>
              {tab.count > 0 ? (
                <View
                  style={[
                    styles.tabBadge,
                    {
                      backgroundColor: active
                        ? "rgba(255,255,255,0.25)"
                        : palette.red[500],
                    },
                  ]}
                >
                  <Text style={styles.tabBadgeText}>{tab.count}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  tabBadgeText: { color: "#ffffff", fontSize: 10, fontWeight: "800" },
});