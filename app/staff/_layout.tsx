/**
 * SmartMarket Staff App — Staff Layout
 * Contains: top header, sidebar overlay, outlet for child pages
 * Adapts from Figma StaffLayout.tsx to React Native
 */
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, usePathname, Slot } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  FadeIn,
  SlideInLeft,
} from "react-native-reanimated";
import { useIsDark, useThemeToggle, palette, DEVICE } from "@/constants/theme";
import {
  MapIcon,
  BotIcon,
  AlertIcon,
  MenuIcon,
  XIcon,
  SunIcon,
  MoonIcon,
} from "@/components/ui/staff-icons";

/* ─── Tab definitions ───────────────────────────────────────────────── */
const tabs = [
  { path: "/staff/fleet",  icon: MapIcon,   label: "Bản Đồ"  },
  { path: "/staff/tasks",  icon: AlertIcon, label: "Cảnh Báo" },
  { path: "/staff/robots", icon: BotIcon,   label: "Robot"   },
];

/* ─── Animated Hamburger ────────────────────────────────────────────── */
function HamburgerIcon({ open, color }: { open: boolean; color: string }) {
  const rotation = useSharedValue(open ? 90 : 0);
  rotation.value = withSpring(open ? 90 : 0, { stiffness: 400, damping: 30 });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      {open ? <XIcon size={18} color={color} /> : <MenuIcon size={18} color={color} />}
    </Animated.View>
  );
}

/* ─── Sidebar nav button ─────────────────────────────────────────────── */
function SidebarButton({
  tab,
  active,
  onPress,
  isDark,
  index,
}: {
  tab: (typeof tabs)[0];
  active: boolean;
  onPress: () => void;
  isDark: boolean;
  index: number;
}) {
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
            {
              color: textColor,
              fontWeight: active ? "700" : "600",
            },
          ]}
        >
          {tab.label}
        </Text>
        {active && (
          <View style={styles.sidebarActiveDot} />
        )}
      </Pressable>
    </Animated.View>
  );
}

/* ─── Sidebar ───────────────────────────────────────────────────────── */
function Sidebar({
  open,
  onClose,
  isDark,
}: {
  open: boolean;
  onClose: () => void;
  isDark: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  if (!open) return null;

  const activeTab = tabs.find((t) => pathname.startsWith(t.path))?.path ?? "";

  return (
    <>
      {/* Backdrop */}
      <Pressable
        style={[styles.backdrop, { top: insets.top, bottom: insets.bottom, left: insets.left, right: insets.right }]}
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
        <View style={styles.sidebarBrand}>
          <View style={[styles.sidebarBrandIcon, { backgroundColor: palette.violet[600] }]}>
            <BotIcon size={17} color="#ffffff" />
          </View>
          <View>
            <Text style={[styles.sidebarBrandName, { color: isDark ? "#ffffff" : palette.gray[900] }]}>
              Staff App
            </Text>
            <View style={styles.sidebarBrandStatus}>
              <View style={[styles.statusDot, { backgroundColor: palette.emerald[400] }]} />
              <Text
                style={[
                  styles.statusDotLabel,
                  { color: isDark ? palette.gray[500] : palette.gray[400] },
                ]}
              >
                TRỰC TUYẾN
              </Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: isDark ? palette.gray[800] : palette.gray[100] }]} />

        {/* Nav */}
        <ScrollView style={styles.sidebarNav} showsVerticalScrollIndicator={false}>
          {tabs.map((tab, i) => (
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

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: isDark ? palette.gray[800] : palette.gray[100] }]} />
      </Animated.View>
    </>
  );
}

/* ─── Main Layout ────────────────────────────────────────────────────── */
interface StaffLayoutProps {
  children?: React.ReactNode;
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  const isDark = useIsDark();
  const { toggle: toggleDark } = useThemeToggle();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeTab = tabs.find((t) => pathname.startsWith(t.path))?.path ?? "";

  const sidebarBg = isDark ? palette.gray[900] : "#ffffff";
  const headerBg  = sidebarBg;
  const headerBorder = isDark ? palette.gray[800] : palette.gray[200];

  return (
    <View style={[styles.wrapper, { backgroundColor: isDark ? palette.gray[950] : palette.gray[100] }]}>
      {/* Fixed-width phone frame on the phone's own display */}
      <SafeAreaView
        style={[styles.phoneFrame, { backgroundColor: sidebarBg }]}
        edges={["top", "left", "right"]}
      >
        {/* ── Status bar ───────────────────────────────────────────── */}
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={headerBg}
        />

        {/* ── Header ──────────────────────────────────────────────── */}
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
            onPress={() => setSidebarOpen(true)}
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
            <HamburgerIcon open={sidebarOpen} color={sidebarOpen ? "#ffffff" : isDark ? palette.gray[300] : palette.gray[600]} />
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
              {
                backgroundColor: isDark ? palette.gray[800] : palette.gray[100],
              },
            ]}
            activeOpacity={0.7}
          >
            {isDark ? (
              <SunIcon size={16} color={palette.amber[400] ?? "#fbbf24"} />
            ) : (
              <MoonIcon size={16} color={isDark ? palette.gray[300] : palette.gray[600]} />
            )}
          </TouchableOpacity>
        </View>

        {/* ── Content (Slot for child routes) ─────────────────────── */}
        <View style={styles.content}>
          <Slot />
        </View>

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isDark={isDark}
        />
      </SafeAreaView>
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────── */
const { width: SCREEN_W } = Dimensions.get("window");

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  phoneFrame: {
    width: SCREEN_W,
    minHeight: Dimensions.get("window").height,
    flex: 1,
    // Shadow for phone-frame effect on larger screens
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    height: DEVICE.headerHeight,
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
  content: {
    flex: 1,
  },
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
    width: DEVICE.sidebarWidth,
    borderRightWidth: 1,
    zIndex: 30,
  },
  sidebarBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sidebarBrandIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sidebarBrandName: {
    fontSize: 14,
    fontWeight: "900",
  },
  sidebarBrandStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
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
  sidebarNav: {
    flex: 1,
    paddingHorizontal: 12,
    gap: 4,
  },
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
