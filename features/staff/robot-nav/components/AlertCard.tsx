/**
 * AlertCard — top-of-page alert summary on the robot-navigation screen.
 *
 * Renders a red priority bar, icon, "KHẨN CẤP" + "Cần hỗ trợ" badges,
 * the alert title and detail.
 */
import { StyleSheet, Text, View } from "react-native";
import { DEVICE, palette, useIsDark } from "@/shared/theme";
import { BotIcon } from "@/shared/ui";

interface AlertCardProps {
  title: string;
  detail: string;
}

export function AlertCard({ title, detail }: AlertCardProps) {
  const isDark = useIsDark();
  const cardBg = isDark ? palette.gray[900] : "#ffffff";

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: cardBg, borderColor: palette.red[500] },
      ]}
    >
      <View style={[styles.bar, { backgroundColor: palette.red[500] }]} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View
            style={[
              styles.icon,
              { backgroundColor: isDark ? palette.gray[800] : palette.gray[100] },
            ]}
          >
            <BotIcon size={16} color={palette.red[500]} />
          </View>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: palette.red[500] }]}>
              <Text style={styles.badgeText}>KHẨN CẤP</Text>
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
                Cần hỗ trợ
              </Text>
            </View>
          </View>
        </View>

        <Text
          style={[
            styles.title,
            { color: isDark ? "#fff" : palette.gray[900] },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.detail,
            { color: isDark ? palette.gray[400] : palette.gray[500] },
          ]}
        >
          {detail}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
    overflow: "hidden",
  },
  bar: { height: 3 },
  body: { padding: 14, gap: 8 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badges: { flexDirection: "row", gap: 4 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { color: "#ffffff", fontSize: 10, fontWeight: "700" },
  title: { fontSize: 15, fontWeight: "800" },
  detail: { fontSize: 13, lineHeight: 20 },
});