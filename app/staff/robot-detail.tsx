/**
 * Staff Robot Detail Page — live data.
 * Reads ?code=XXX from the URL and calls `GET /api/robots/{code}/pose`
 * (via `services/api/robots#getRobot`, which also fetches the roster
 * for battery/mode/status so we don't need a separate per-robot GET).
 */
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  BotIcon,
  BatteryIcon,
  WifiIcon,
  MapPinIcon,
  ChevronLeftIcon,
} from "@/components/ui/staff-icons";
import { useIsDark, palette, DEVICE, robotStatusConfig } from "@/constants/theme";
import { getRobot, type NormalizedRobot } from "@/services/api/robots";
import { ApiError } from "@/services/api/http";

export default function RobotDetailPage() {
  const isDark = useIsDark();
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code?: string }>();
  const bg = isDark ? palette.gray[950] : "#f3f4f6";

  const [robot, setRobot] = useState<NormalizedRobot | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (codeStr: string) => {
      setError(null);
      try {
        const data = await getRobot(codeStr);
        setRobot(data);
      } catch (e) {
        const msg =
          e instanceof ApiError
            ? e.status === 401
              ? "Phiên đăng nhập đã hết hạn."
              : e.message
            : "Không thể kết nối máy chủ.";
        setError(msg);
      }
    },
    [],
  );

  useEffect(() => {
    if (code) load(code);
    else setRobot(null);
  }, [code, load]);

  const onRefresh = useCallback(async () => {
    if (!code) return;
    setRefreshing(true);
    await load(code);
    setRefreshing(false);
  }, [code, load]);

  const cfg = robot
    ? robotStatusConfig[robot.status as keyof typeof robotStatusConfig]
    : null;

  /* ─── States ──────────────────────────────────────────────── */
  if (robot === undefined) {
    return (
      <View style={[styles.page, { backgroundColor: bg }]}>
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
            <ChevronLeftIcon size={20} color={isDark ? "#fff" : palette.gray[900]} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? "#fff" : palette.gray[900] }]}>
            Đang tải…
          </Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator color={palette.violet[600]} />
        </View>
      </View>
    );
  }

  if (!robot) {
    return (
      <View style={[styles.page, { backgroundColor: bg }]}>
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
            <ChevronLeftIcon size={20} color={isDark ? "#fff" : palette.gray[900]} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? "#fff" : palette.gray[900] }]}>
            Không tìm thấy
          </Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.center}>
          <Text
            style={[
              styles.notFound,
              { color: isDark ? palette.gray[400] : palette.gray[500] },
            ]}
          >
            {error
              ? error
              : code
                ? `Robot "${code}" không tồn tại trong hệ thống.`
                : "Thiếu mã robot."}
          </Text>
          {code ? (
            <TouchableOpacity
              onPress={() => load(code)}
              style={[styles.retryBtn, { borderColor: palette.violet[600] }]}
            >
              <Text style={{ color: palette.violet[600], fontSize: 13, fontWeight: "700" }}>
                Thử lại
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }

  /* ─── Main view ───────────────────────────────────────────── */
  return (
    <View style={[styles.page, { backgroundColor: bg }]}>
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
          <ChevronLeftIcon size={20} color={isDark ? "#fff" : palette.gray[900]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? "#fff" : palette.gray[900] }]}>
          {robot.robotCode}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentPad}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? palette.gray[400] : palette.gray[500]}
          />
        }
      >
        {/* Hero card */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: isDark ? palette.gray[900] : "#fff",
              borderColor: isDark ? palette.gray[800] : palette.gray[200],
            },
          ]}
        >
          <View style={[styles.heroIcon, { backgroundColor: cfg?.bgAlpha }]}>
            <BotIcon size={36} color={cfg?.dot ?? "#fff"} />
          </View>
          <Text style={[styles.robotId, { color: isDark ? "#fff" : palette.gray[900] }]}>
            {robot.robotCode}
          </Text>
          <Text
            style={[styles.robotModel, { color: isDark ? palette.gray[400] : palette.gray[500] }]}
          >
            {robot.robotName}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: cfg?.bgAlpha }]}>
            <View style={[styles.statusDot, { backgroundColor: cfg?.dot }]} />
            <Text style={[styles.statusText, { color: cfg?.text }]}>{cfg?.label}</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: isDark ? palette.gray[900] : "#fff",
                borderColor: isDark ? palette.gray[800] : palette.gray[200],
              },
            ]}
          >
            <BatteryIcon size={18} color={isDark ? palette.violet[400] : palette.violet[600]} />
            <Text
              style={[
                styles.statValue,
                {
                  color:
                    robot.batteryPct < 20
                      ? palette.red[500]
                      : isDark
                        ? palette.gray[100]
                        : palette.gray[900],
                },
              ]}
            >
              {robot.batteryPct}%
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? palette.gray[500] : palette.gray[500] }]}>
              Pin
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: isDark ? palette.gray[900] : "#fff",
                borderColor: isDark ? palette.gray[800] : palette.gray[200],
              },
            ]}
          >
            <WifiIcon size={18} color={isDark ? palette.violet[400] : palette.violet[600]} />
            <Text
              style={[
                styles.statValue,
                { color: isDark ? palette.gray[100] : palette.gray[900] },
              ]}
            >
              {robot.mode}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? palette.gray[500] : palette.gray[500] }]}>
              Chế độ
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: isDark ? palette.gray[900] : "#fff",
                borderColor: isDark ? palette.gray[800] : palette.gray[200],
              },
            ]}
          >
            <MapPinIcon size={18} color={isDark ? palette.violet[400] : palette.violet[600]} />
            <Text
              style={[
                styles.statValue,
                { color: isDark ? palette.gray[100] : palette.gray[900] },
              ]}
              numberOfLines={1}
            >
              {robot.position
                ? `${robot.position.x.toFixed(0)}, ${robot.position.y.toFixed(0)}`
                : "—"}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? palette.gray[500] : palette.gray[500] }]}>
              Vị trí
            </Text>
          </View>
        </View>

        {/* Info section */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: isDark ? palette.gray[900] : "#fff",
              borderColor: isDark ? palette.gray[800] : palette.gray[200],
            },
          ]}
        >
          <Text style={[styles.infoTitle, { color: isDark ? "#fff" : palette.gray[900] }]}>
            Thông tin
          </Text>
          {[
            ["Mã robot", robot.robotCode],
            ["Tên", robot.robotName],
            [
              "Vị trí cuối",
              robot.position
                ? `(${robot.position.x.toFixed(1)}, ${robot.position.y.toFixed(1)}) · ${robot.position.headingDeg.toFixed(0)}°`
                : "Chưa có dữ liệu",
            ],
            [
              "Cập nhật lần cuối",
              robot.lastSeenAt ? formatRelativeTime(robot.lastSeenAt) : "—",
            ],
          ].map(([label, value]) => (
            <View key={label} style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: isDark ? palette.gray[500] : palette.gray[500] }]}>
                {label}
              </Text>
              <Text
                style={[styles.infoValue, { color: isDark ? palette.gray[100] : palette.gray[900] }]}
                numberOfLines={1}
              >
                {value}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

/** Render BE-issued ISO timestamps as a Vietnamese-feeling relative label. */
function formatRelativeTime(iso: string): string {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return iso;
  const diffMs = Date.now() - ts;
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.round(hours / 24);
  return `${days} ngày trước`;
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  header: {
    height: 57,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "700" },
  content: { flex: 1 },
  contentPad: { padding: 16, gap: 12, paddingBottom: 32 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  notFound: { fontSize: 15, textAlign: "center" },
  retryBtn: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  heroCard: {
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    padding: 24,
    gap: 8,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  robotId: { fontSize: 24, fontWeight: "800" },
  robotModel: { fontSize: 14 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 4,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 8 },
  statCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    padding: 12,
    gap: 4,
    minHeight: 92,
    justifyContent: "center",
  },
  statValue: { fontSize: 18, fontWeight: "800" },
  statLabel: { fontSize: 11, fontWeight: "600" },
  infoCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 12 },
  infoTitle: { fontSize: 15, fontWeight: "700" },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(128,128,128,0.2)",
  },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: "600", maxWidth: "60%", textAlign: "right" },
});
