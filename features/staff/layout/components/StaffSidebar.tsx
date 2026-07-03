/**
 * StaffSidebar — the slide-in left panel that overlays the screen when open.
 *
 * Renders a brand header, the nav list (highlighting the active route), and a
 * logout button at the bottom. Backdrop click closes the sidebar.
 *
 * Why this is its own component: the same shape (sidebar + backdrop + nav)
 * could easily grow into a generic `<Drawer>` later.
 */
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { SlideInLeft } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePathname, useRouter } from "expo-router";
import { palette } from "@/shared/theme";
import { AlertIcon, BotIcon, LogOutIcon, MapIcon } from "@/shared/ui";
import { SidebarButton, type SidebarTab } from "./SidebarButton";

const TABS: SidebarTab[] = [
  { path: "/staff/fleet",  icon: MapIcon,   label: "Bản Đồ"   },
  { path: "/staff/tasks",  icon: AlertIcon, label: "Cảnh Báo" },
  { path: "/staff/robots", icon: BotIcon,   label: "Robot"    },
];

interface StaffSidebarProps {
  open: boolean;
  onClose: () => void;
  isDark: boolean;
  onLogout: () => void;
}

export function StaffSidebar({
  open,
  onClose,
  isDark,
  onLogout,
}: StaffSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  if (!open) return null;

  const activeTab = TABS.find((t) => pathname.startsWith(t.path))?.path ?? "";

  return (
    <>
      {/* Backdrop */}
      <Pressable
        style={[
          styles.backdrop,
          {
            top: insets.top,
            bottom: insets.bottom,
            left: insets.left,
            right: insets.right,
          },
        ]}
        onPress={onClose}
      />

      {/* Panel */}
      <Animated.View
        entering={SlideInLeft.springify().damping(36).stiffness(360)}
        style={[
          styles.sidebar,
          {
            backgroundColor: isDark ? palette.gray[950] : "#ffffff",
            borderRightColor: isDark ? palette.gray[800] : palette.gray[200],
            top: insets.top,
            bottom: insets.bottom,
            left: insets.left,
            paddingTop: 20,
            paddingBottom: 20 + insets.bottom,
          },
        ]}
      >
        {/* Brand */}
        <View style={styles.brand}>
          <View style={[styles.brandIcon, { backgroundColor: palette.violet[600] }]}>
            <BotIcon size={17} color="#ffffff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.brandName,
                { color: isDark ? "#ffffff" : palette.gray[900] },
              ]}
            >
              Staff App
            </Text>
            <View style={styles.brandStatus}>
              <View style={[styles.statusDot, { backgroundColor: palette.emerald[400] }]} />
              <Text
                style={[
                  styles.statusDotLabel,
                  { color: isDark ? palette.gray[500] : palette.gray[400] },
                ]}
                numberOfLines={1}
              >
                TRỰC TUYẾN
              </Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View
          style={[
            styles.divider,
            { backgroundColor: isDark ? palette.gray[800] : palette.gray[100] },
          ]}
        />

        {/* Nav */}
        <ScrollView style={styles.nav} showsVerticalScrollIndicator={false}>
          {TABS.map((tab, i) => (
            <SidebarButton
              key={tab.path}
              tab={tab}
              active={activeTab === tab.path}
              onPress={() => {
                router.push(tab.path as any);
                onClose();
              }}
              isDark={isDark}
              index={i}
            />
          ))}
        </ScrollView>

        {/* Footer / Logout */}
        <View style={styles.footer}>
          <Pressable
            onPress={() => {
              onClose();
              onLogout();
            }}
            style={({ pressed }) => [
              styles.logoutBtn,
              {
                borderColor: isDark ? palette.gray[800] : palette.gray[200],
                backgroundColor: pressed
                  ? isDark ? palette.gray[800] : palette.gray[100]
                  : "transparent",
              },
            ]}
          >
            <LogOutIcon
              size={16}
              color={isDark ? palette.gray[300] : palette.gray[600]}
            />
            <Text
              style={[
                styles.logoutText,
                { color: isDark ? palette.gray[300] : palette.gray[700] },
              ]}
            >
              Đăng xuất
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 20,
  },
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 200,
    borderRightWidth: 1,
    zIndex: 30,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: { fontSize: 14, fontWeight: "900" },
  brandStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusDotLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  nav: {
    flex: 1,
    paddingHorizontal: 12,
    gap: 4,
  },
  footer: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
});