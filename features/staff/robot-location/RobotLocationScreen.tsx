/**
 * RobotLocationScreen — reached from the Cảnh Báo screen when staff
 * taps "Đến robot" on a Robot-tab alert.
 *
 * Purpose: show where the target robot sits on the store map so the
 * staff member can walk over to it. No "Đã xử lý" action lives here —
 * the alert is resolved from the existing robot-nav flow (or from a
 * future dedicated handler).
 *
 * For this iteration there is no API call:
 *   - The target robot's display data (code, name, status, position) is
 *     read from `useLocalSearchParams` so the route stays stateless.
 *   - If the params lack a position, the map still renders centred on
 *     the map origin so the user can pan around and find the robot.
 */
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  palette,
  robotStatusConfig,
  useIsDark,
} from "@/shared/theme";
import { ChevronLeftIcon } from "@/shared/ui";
import type {
  BackendRobotMode,
  NormalizedRobot,
  RobotStatus,
} from "@/shared/api";
import { RobotLocationMap } from "./components/RobotLocationMap";

const KNOWN_STATUSES: RobotStatus[] = ["active", "standby", "error", "charging"];
const KNOWN_MODES: BackendRobotMode[] = [
  "idle",
  "navigating",
  "scanning",
  "charging",
  "returning",
];

function asStatus(v: string | undefined): RobotStatus {
  return (KNOWN_STATUSES as string[]).includes(v ?? "")
    ? (v as RobotStatus)
    : "standby";
}

function asMode(v: string | undefined): BackendRobotMode {
  return (KNOWN_MODES as string[]).includes(v ?? "")
    ? (v as BackendRobotMode)
    : "idle";
}

export default function RobotLocationScreen() {
  const isDark = useIsDark();
  const router = useRouter();
  const params = useLocalSearchParams<{
    code?: string;
    name?: string;
    status?: string;
    mode?: string;
    batteryPct?: string;
    /** "x,y" — map-unit coords from the alert. */
    position?: string;
  }>();

  const code = (params.code ?? "").trim();
  const name = (params.name ?? "").trim() || code || "Robot";
  const status = asStatus(params.status);
  const mode = asMode(params.mode);
  const batteryPct = Number.parseInt(params.batteryPct ?? "0", 10) || 0;

  let position: NormalizedRobot["position"] = null;
  if (params.position && params.position.includes(",")) {
    const [xs, ys] = params.position.split(",", 2);
    const x = Number.parseFloat(xs);
    const y = Number.parseFloat(ys);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      position = { x, y, headingDeg: 0, at: "" };
    }
  }

  const cfg = robotStatusConfig[status];

  const pageBg = isDark ? palette.gray[950] : "#e5e7eb";
  const cardBg = isDark ? palette.gray[900] : "#ffffff";
  const cardBorder = isDark ? palette.gray[800] : palette.gray[200];

  /* We don't have a real fetch, so a fully-empty params is the only
   * "missing" state worth showing. Fall back to a centre-of-map pin. */
  const fallback: NormalizedRobot = {
    robotId: 0,
    robotCode: code || "—",
    robotName: name,
    status,
    batteryPct,
    mode,
    lastSeenAt: null,
    position: position ?? { x: 500, y: 350, headingDeg: 0, at: "" },
  };

  if (!code) {
    return (
      <View style={[styles.page, { backgroundColor: pageBg }]}>
        <Header
          title="Không tìm thấy robot"
          statusColor={palette.gray[400]}
          onBack={() => router.back()}
          cardBg={cardBg}
          cardBorder={cardBorder}
          isDark={isDark}
        />
        <View style={styles.notFound}>
          <Text
            style={[
              styles.notFoundText,
              { color: isDark ? palette.gray[400] : palette.gray[500] },
            ]}
          >
            Không có mã robot trong đường dẫn.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.page, { backgroundColor: pageBg }]}>
      <Header
        title={code}
        statusColor={cfg.dot}
        statusLabel={cfg.label}
        subtitle={name !== code ? name : undefined}
        onBack={() => router.back()}
        cardBg={cardBg}
        cardBorder={cardBorder}
        isDark={isDark}
      />

      <RobotLocationMap robot={fallback} />
    </View>
  );
}

/* ── Local Header — kept inline to match the FleetMapScreen visual
 *    language without pulling in the full robot-nav header. ── */
function Header({
  title,
  subtitle,
  statusColor,
  statusLabel,
  onBack,
  cardBg,
  cardBorder,
  isDark,
}: {
  title: string;
  subtitle?: string;
  statusColor: string;
  statusLabel?: string;
  onBack: () => void;
  cardBg: string;
  cardBorder: string;
  isDark: boolean;
}) {
  return (
    <View
      style={[
        styles.header,
        { backgroundColor: cardBg, borderBottomColor: cardBorder },
      ]}
    >
      <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={10}>
        <ChevronLeftIcon
          size={20}
          color={isDark ? "#fff" : palette.gray[900]}
        />
      </TouchableOpacity>
      <View style={styles.center}>
        <View style={[styles.dot, { backgroundColor: statusColor }]} />
        <View>
          <Text
            style={[
              styles.title,
              { color: isDark ? "#fff" : palette.gray[900] },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle || statusLabel ? (
            <Text
              style={[
                styles.subtitle,
                { color: isDark ? palette.gray[400] : palette.gray[500] },
              ]}
              numberOfLines={1}
            >
              {subtitle ? `${subtitle}` : ""}
              {subtitle && statusLabel ? " · " : ""}
              {statusLabel ?? ""}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={{ width: 36 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  title: { fontSize: 16, fontWeight: "800", textAlign: "center" },
  subtitle: { fontSize: 11, fontWeight: "500", marginTop: 1 },

  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  notFoundText: { fontSize: 14 },
});