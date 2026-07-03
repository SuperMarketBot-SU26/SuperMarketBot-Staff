/**
 * SidebarButton — one entry in the staff sidebar's nav list.
 *
 * Animates in from the left (staggered via `index * 50ms`) and shows
 * a small dot on the right when active.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { SlideInLeft } from "react-native-reanimated";
import { palette } from "@/shared/theme";

export interface SidebarTab {
  path: string;
  icon: React.ElementType;
  label: string;
}

interface SidebarButtonProps {
  tab: SidebarTab;
  active: boolean;
  onPress: () => void;
  isDark: boolean;
  index: number;
}

export function SidebarButton({
  tab,
  active,
  onPress,
  isDark,
  index,
}: SidebarButtonProps) {
  const Icon = tab.icon;
  const iconColor = active
    ? "#ffffff"
    : isDark ? palette.gray[400] : palette.gray[500];
  const textColor = active
    ? "#ffffff"
    : isDark ? palette.gray[400] : palette.gray[500];

  return (
    <Animated.View entering={SlideInLeft.delay(index * 50).springify()}>
      <Pressable
        onPress={onPress}
        style={[
          styles.sidebarButton,
          {
            backgroundColor: active ? palette.violet[600] : "transparent",
            borderRadius: 14,
          },
        ]}
      >
        <Icon size={18} color={iconColor} />
        <Text
          style={[
            styles.sidebarButtonText,
            { color: textColor, fontWeight: active ? "700" : "600" },
          ]}
        >
          {tab.label}
        </Text>
        {active ? <View style={styles.sidebarActiveDot} /> : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sidebarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  sidebarButtonText: {
    fontSize: 14,
    flex: 1,
  },
  sidebarActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.7)",
    marginLeft: "auto",
  },
});