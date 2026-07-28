/**
 * StaffHeader — Pure White Header top bar.
 * Matching Forest Green & Mint Slate design language of Admin FE 100%.
 */
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DEVICE, palette } from "@/shared/theme";
import { HamburgerIcon } from "./HamburgerIcon";

interface StaffHeaderProps {
  sidebarOpen: boolean;
  onOpenSidebar: () => void;
}

export function StaffHeader({
  sidebarOpen,
  onOpenSidebar,
}: StaffHeaderProps) {
  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: "#ffffff",
          borderBottomColor: "rgba(20, 83, 45, 0.12)",
          height: DEVICE.headerHeight,
        },
      ]}
    >
      {/* Hamburger Menu Toggle */}
      <TouchableOpacity
        onPress={onOpenSidebar}
        style={[
          styles.headerButton,
          {
            backgroundColor: sidebarOpen ? palette.green[700] : "#f0fdf4",
          },
        ]}
        activeOpacity={0.7}
      >
        <HamburgerIcon
          open={sidebarOpen}
          color={sidebarOpen ? "#ffffff" : palette.green[800]}
        />
      </TouchableOpacity>

      {/* Brand Title */}
      <View style={styles.headerTitle}>
        <View style={[styles.headerLiveDot, { backgroundColor: "#22c55e" }]} />
        <Text
          style={[
            styles.headerTitleText,
            { color: "#11201a" },
          ]}
        >
          SuperMarketBot Staff
        </Text>
      </View>

      {/* Status Badge */}
      <View style={styles.headerBadge}>
        <Text style={styles.headerBadgeText}>ONLINE</Text>
      </View>
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
    width: 38,
    height: 38,
    borderRadius: 12,
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
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  headerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#dcfce7",
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#166534",
  },
});