import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { palette, useIsDark } from "@/shared/theme";
import { ChevronLeftIcon } from "@/shared/ui";

interface DetailHeaderProps {
  title: string;
}

export function DetailHeader({ title }: DetailHeaderProps) {
  const isDark = useIsDark();
  const router = useRouter();
  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: isDark ? palette.gray[900] : "#fff",
          borderBottomColor: isDark ? palette.gray[800] : palette.gray[200],
        },
      ]}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <ChevronLeftIcon
          size={20}
          color={isDark ? "#fff" : palette.gray[900]}
        />
      </TouchableOpacity>
      <Text
        style={[
          styles.title,
          { color: isDark ? "#fff" : palette.gray[900] },
        ]}
      >
        {title}
      </Text>
      <View style={{ width: 36 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 57,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "700" },
});