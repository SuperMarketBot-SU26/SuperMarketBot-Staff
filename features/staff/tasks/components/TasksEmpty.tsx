/**
 * TasksEmpty — the friendly empty/zero-state for the Cảnh Báo list.
 */
import { StyleSheet, Text, View } from "react-native";
import { palette, useIsDark } from "@/shared/theme";

interface TasksEmptyProps {
  /** "📦" for hangHoa, "🤖" for robot — emoji communicates the category fast. */
  emoji: string;
  message: string;
}

export function TasksEmpty({ emoji, message }: TasksEmptyProps) {
  const isDark = useIsDark();
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text
        style={[
          styles.text,
          { color: isDark ? palette.gray[500] : palette.gray[400] },
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },
  emoji: { fontSize: 48 },
  text: { fontSize: 14, fontWeight: "500" },
});