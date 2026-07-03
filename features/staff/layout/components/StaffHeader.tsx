/**
 * StaffHeader — top bar rendered inside <StaffLayout>.
 *
 * Shows: hamburger (opens sidebar) | title | dark-mode toggle.
 * Hamburger is a small interactive square; theme toggle is the same shape.
 */
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DEVICE, palette, useIsDark, useThemeToggle } from "@/shared/theme";
import { MoonIcon, SunIcon } from "@/shared/ui";
import { HamburgerIcon } from "./HamburgerIcon";

interface StaffHeaderProps {
  sidebarOpen: boolean;
  onOpenSidebar: () => void;
}

export function StaffHeader({
  sidebarOpen,
  onOpenSidebar,
}: StaffHeaderProps) {
  const isDark = useIsDark();
  const { toggle: toggleDark } = useThemeToggle();

  const headerBg = isDark ? palette.gray[900] : "#ffffff";
  const headerBorder = isDark ? palette.gray[800] : palette.gray[200];

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: headerBg,
          borderBottomColor: headerBorder,
          height: DEVICE.headerHeight,
        },
      ]}
    >
      {/* Hamburger */}
      <TouchableOpacity
        onPress={onOpenSidebar}
        style={[
          styles.headerButton,
          {
            backgroundColor: sidebarOpen
              ? palette.violet[600]
              : isDark ? palette.gray[800] : palette.gray[100],
          },
        ]}
        activeOpacity={0.7}
      >
        <HamburgerIcon
          open={sidebarOpen}
          color={
            sidebarOpen
              ? "#ffffff"
              : isDark ? palette.gray[300] : palette.gray[600]
          }
        />
      </TouchableOpacity>

      {/* Title */}
      <View style={styles.headerTitle}>
        <View style={[styles.headerLiveDot, { backgroundColor: palette.violet[500] }]} />
        <Text
          style={[
            styles.headerTitleText,
            { color: isDark ? "#ffffff" : palette.gray[900] },
          ]}
        >
          Staff App
        </Text>
      </View>

      {/* Dark mode toggle */}
      <TouchableOpacity
        onPress={toggleDark}
        style={[
          styles.headerButton,
          { backgroundColor: isDark ? palette.gray[800] : palette.gray[100] },
        ]}
        activeOpacity={0.7}
      >
        {isDark ? (
          <SunIcon size={16} color={palette.amber[400] ?? "#fbbf24"} />
        ) : (
          <MoonIcon
            size={16}
            color={isDark ? palette.gray[300] : palette.gray[600]}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerTitleText: {
    fontSize: 14,
    fontWeight: "700",
  },
});