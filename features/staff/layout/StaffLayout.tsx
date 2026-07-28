/**
 * StaffLayout — top-level layout for `/staff/*` routes.
 * 100% Pure White & Mint Slate Theme (Matching Admin FE).
 */
import { useCallback, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Slot, useRouter } from "expo-router";
import { useAuth } from "@/features/auth";
import { StaffHeader } from "./components/StaffHeader";
import { StaffSidebar } from "./components/StaffSidebar";

interface StaffLayoutProps {
  children?: React.ReactNode;
}

export function StaffLayout({ children }: StaffLayoutProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } finally {
      router.replace("/login" as any);
    }
  }, [logout, router]);

  return (
    <View
      style={[
        styles.wrapper,
        { backgroundColor: "#f7faf7" },
      ]}
    >
      <SafeAreaView
        style={[styles.phoneFrame, { backgroundColor: "#f7faf7" }]}
        edges={["top", "left", "right"]}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#ffffff"
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
          isDark={false}
          onLogout={handleLogout}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
  },
  phoneFrame: {
    width: "100%",
    flex: 1,
  },
  content: { flex: 1 },
});