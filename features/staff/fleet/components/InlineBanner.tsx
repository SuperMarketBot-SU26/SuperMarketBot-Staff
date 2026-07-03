/**
 * InlineBanner — small banner used by both fleet and robots pages for
 * "couldn't load" and "empty" states.
 */
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DEVICE, palette, useIsDark } from "@/shared/theme";

interface InlineBannerProps {
  tone: "error" | "empty";
  title: string;
  hint?: string;
  onRetry?: () => void;
}

export function InlineBanner({
  tone,
  title,
  hint,
  onRetry,
}: InlineBannerProps) {
  const isDark = useIsDark();
  const bg =
    tone === "error"
      ? "rgba(239,68,68,0.10)"
      : isDark ? palette.gray[900] : "#ffffff";
  const border =
    tone === "error"
      ? palette.red[500]
      : isDark ? palette.gray[800] : palette.gray[200];
  const titleColor =
    tone === "error" ? palette.red[500] : isDark ? "#fff" : palette.gray[900];
  const hintColor = isDark ? palette.gray[400] : palette.gray[500];

  return (
    <View style={[styles.banner, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
      {hint ? <Text style={[styles.hint, { color: hintColor }]}>{hint}</Text> : null}
      {onRetry ? (
        <TouchableOpacity
          onPress={onRetry}
          style={[styles.retry, { borderColor: palette.violet[600] }]}
        >
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: { fontSize: 13, fontWeight: "700", flex: 1 },
  hint: { fontSize: 12, fontWeight: "500", flex: 1 },
  retry: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  retryText: {
    color: palette.violet[600],
    fontSize: 12,
    fontWeight: "700",
  },
});