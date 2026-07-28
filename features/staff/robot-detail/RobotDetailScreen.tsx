/**
 * Staff Robot Detail Page — Live pose telemetry + Remote Control Action Bar.
 */
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { palette } from "@/shared/theme";
import { sendRobotCommand } from "@/shared/api/robots";
import { DetailHeader } from "./components/DetailHeader";
import { HeroCard } from "./components/HeroCard";
import { InfoCard } from "./components/InfoCard";
import { StatsRow } from "./components/StatsRow";
import { useRobot } from "./hooks/useRobot";

export default function RobotDetailScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const pageBg = "#f7faf7";

  const { robot, error, refreshing, reload } = useRobot(code);
  const [sendingCmd, setSendingCmd] = useState<string | null>(null);

  const handleCommand = async (command: "pause" | "resume" | "estop" | "return_to_dock") => {
    if (!robot) return;
    setSendingCmd(command);
    try {
      await sendRobotCommand(robot.robotCode, command);
      const labels: Record<string, string> = {
        pause: "Đã gửi lệnh TẠM DỪNG robot",
        resume: "Đã gửi lệnh TIẾP TỤC di chuyển",
        estop: "🚨 ĐÃ DỪNG KHẨN CẤP ROBOT",
        return_to_dock: "Đã gọi robot VỀ TRẠM SẠC",
      };
      Alert.alert("Thành Công", labels[command] ?? "Đã gửi lệnh tới robot");
      reload();
    } catch {
      Alert.alert("Lỗi", "Không thể kết nối lệnh tới robot.");
    } finally {
      setSendingCmd(null);
    }
  };

  /* ── Loading ── */
  if (robot === undefined) {
    return (
      <View style={[styles.page, { backgroundColor: pageBg }]}>
        <DetailHeader title="Đang tải…" />
        <View style={styles.center}>
          <ActivityIndicator color={palette.green[700]} size="large" />
        </View>
      </View>
    );
  }

  /* ── Not found / error ── */
  if (!robot) {
    return (
      <View style={[styles.page, { backgroundColor: pageBg }]}>
        <DetailHeader title="Không tìm thấy" />
        <View style={styles.center}>
          <Text style={styles.notFound}>
            {error
              ? error
              : code
                ? `Robot "${code}" không tồn tại trong hệ thống.`
                : "Thiếu mã robot."}
          </Text>
          {code ? (
            <TouchableOpacity
              onPress={() => reload()}
              style={[styles.retry, { borderColor: palette.green[700] }]}
            >
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }

  /* ── Main view ── */
  return (
    <View style={[styles.page, { backgroundColor: pageBg }]}>
      <DetailHeader title={robot.robotCode} />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentPad}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={reload}
            tintColor={palette.green[700]}
          />
        }
      >
        <HeroCard robot={robot} />

        {/* Remote Command Teleop Panel */}
        <View style={styles.cmdCard}>
          <Text style={styles.cmdTitle}>Bảng Điều Khiển Nhanh</Text>
          <View style={styles.cmdGrid}>
            <TouchableOpacity
              style={[styles.cmdBtn, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]}
              onPress={() => handleCommand("pause")}
              disabled={!!sendingCmd}
            >
              <Text style={[styles.cmdBtnText, { color: "#2563eb" }]}>
                {sendingCmd === "pause" ? "Đang gửi..." : "⏸️ Tạm Dừng"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cmdBtn, { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }]}
              onPress={() => handleCommand("resume")}
              disabled={!!sendingCmd}
            >
              <Text style={[styles.cmdBtnText, { color: "#16a34a" }]}>
                {sendingCmd === "resume" ? "Đang gửi..." : "▶️ Tiếp Tục"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cmdBtn, { backgroundColor: "#fffbeb", borderColor: "#fde68a" }]}
              onPress={() => handleCommand("return_to_dock")}
              disabled={!!sendingCmd}
            >
              <Text style={[styles.cmdBtnText, { color: "#d97706" }]}>
                {sendingCmd === "return_to_dock" ? "Đang gửi..." : "⚡ Về Trạm Sạc"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cmdBtn, { backgroundColor: "#fef2f2", borderColor: "#fecaca" }]}
              onPress={() => handleCommand("estop")}
              disabled={!!sendingCmd}
            >
              <Text style={[styles.cmdBtnText, { color: "#dc2626" }]}>
                {sendingCmd === "estop" ? "Đang gửi..." : "🚨 E-STOP"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <StatsRow robot={robot} />
        <InfoCard robot={robot} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { flex: 1 },
  contentPad: { padding: 16, gap: 12, paddingBottom: 32 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  notFound: { fontSize: 15, textAlign: "center", color: "#4a5a52" },
  retry: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: palette.green[700],
    fontSize: 13,
    fontWeight: "700",
  },
  cmdCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(20,83,45,0.12)",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cmdTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#11201a",
  },
  cmdGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cmdBtn: {
    flex: 1,
    minWidth: "47%",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cmdBtnText: {
    fontSize: 12,
    fontWeight: "800",
  },
});