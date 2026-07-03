/**
 * NavHeader — back button + robot code + status dot used by the
 * robot-navigation screen.
 */
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { palette, useIsDark } from "@/shared/theme";
import { ChevronLeftIcon } from "@/shared/ui";

interface NavHeaderProps {
  title: string;
  statusColor: string;
}

export function NavHeader({ title, statusColor }: NavHeaderProps) {
  const isDark = useIsDark();
  const router = useRouter();
  const cardBg = isDark ? palette.gray[900] : "#ffffff";
  const border = isDark ? palette.gray[800] : palette.gray[200];

  return (
    <View
      style={[styles.header, { backgroundColor: cardBg, borderBottomColor: border }]}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.btn}>
        <ChevronLeftIcon
          size={20}
          color={isDark ? "#fff" : palette.gray[900]}
        />
      </TouchableOpacity>
      <View style={styles.center}>
        <View style={[styles.dot, { backgroundColor: statusColor }]} />
        <Text
          style={[styles.title, { color: isDark ? "#fff" : palette.gray[900] }]}
        >
          {title}
        </Text>
      </View>
      <View style={{ width: 36 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  title: { fontSize: 16, fontWeight: "800" },
});