/**
 * StaffLayout — top-level layout for `/staff/*` routes.
 *
 * Owns:
 *   - the phone-frame outer View (so the same app can be embedded
 *     inside a wider canvas later without re-doing safe-area math)
 *   - the staff header (sidebar toggle + dark-mode toggle)
 *   - the slide-in sidebar (nav + logout)
 *   - the `<Slot />` for child routes
 *
 * Logout goes through AuthContext; the root layout redirects to /login
 * once auth status flips to "unauthenticated".
 */
import { useCallback, useState } from "react";
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Slot, useRouter } from "expo-router";
import { palette, useIsDark } from "@/shared/theme";
import { useAuth } from "@/features/auth";
import { StaffHeader } from "./components/StaffHeader";
import { StaffSidebar } from "./components/StaffSidebar";

interface StaffLayoutProps {
  children?: React.ReactNode;
}

export function StaffLayout({ children }: StaffLayoutProps) {
  const isDark = useIsDark();
  const { logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } finally {
      // AuthProvider flips status → root layout redirects to /login.
      router.replace("/login" as any);
    }
  }, [logout, router]);

  return (
    <View
      style={[
        styles.wrapper,
        { backgroundColor: isDark ? palette.gray[950] : palette.gray[100] },
      ]}
    >
      <SafeAreaView
        style={[styles.phoneFrame, { backgroundColor: isDark ? palette.gray[900] : "#ffffff" }]}
        edges={["top", "left", "right"]}
      >
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={isDark ? palette.gray[900] : "#ffffff"}
        />

        <StaffHeader
          sidebarOpen={sidebarOpen}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <View style={styles.content}>
          {children ?? <Slot />}
        </View>

        <StaffSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isDark={isDark}
          onLogout={handleLogout}
        />
      </SafeAreaView>
    </View>
  );
}

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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  content: { flex: 1 },
});