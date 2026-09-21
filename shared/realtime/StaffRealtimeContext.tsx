import * as SignalR from "@microsoft/signalr";
import { useAuth } from "@/features/auth";
import { API_BASE_URL } from "@/shared/api";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type PatrolEventName =
  | "ShelfPatrolScanStarted"
  | "ShelfPatrolScanCompleted"
  | "OutOfStockAlert"
  | "ShelfPatrolScanFailed"
  | "ShelfDensityUpdated"
  | "ShelfRestocked"
  | "RobotLowBatteryAlert"
  | "mapLayoutUpdated";

export interface StaffRealtimeEvent {
  name: PatrolEventName;
  payload: Record<string, unknown>;
  receivedAt: string;
}

interface ActiveAlertBanner {
  title?: string;
  shelf: string;
  occupancy?: string | number;
  empty?: string | number;
  message?: string;
  receivedAt: string;
  isBatteryAlert?: boolean;
}

interface StaffRealtimeValue {
  connected: boolean;
  revision: number;
  lastEvent: StaffRealtimeEvent | null;
}

const StaffRealtimeContext = createContext<StaffRealtimeValue>({
  connected: false,
  revision: 0,
  lastEvent: null,
});

function playAlertChime() {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch {
      // AudioContext may require user interaction first
    }
  }
}

export function StaffRealtimeProvider({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const [connected, setConnected] = useState(false);
  const [revision, setRevision] = useState(0);
  const [lastEvent, setLastEvent] = useState<StaffRealtimeEvent | null>(null);
  const [activeBanner, setActiveBanner] = useState<ActiveAlertBanner | null>(null);
  const bannerTimerRef = useRef<any>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    let mounted = true;

    const isNgrok = API_BASE_URL.includes("ngrok");
    const cleanBase = API_BASE_URL.replace(/\/api\/?$/, "").replace(/\/+$/, "");
    const hubUrl = isNgrok
      ? `${cleanBase}/hubs/staff?ngrok-skip-browser-warning=true`
      : `${cleanBase}/hubs/staff`;

    const connection = new SignalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        skipNegotiation: true,
        transport: SignalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(SignalR.LogLevel.Warning)
      .build();

    const join = async () => {
      try {
        if (connection.state === SignalR.HubConnectionState.Connected) {
          await connection.invoke("JoinStaffGroup");
          console.log("[StaffRealtime] Joined StaffGroup successfully");
        }
      } catch (err) {
        console.warn("[StaffRealtime] JoinStaffGroup warning:", err);
      }
    };

    const receive = (name: PatrolEventName, payload: Record<string, unknown>) => {
      if (!mounted) return;
      console.log(`[StaffRealtime] ⚡ Received event ${name}:`, payload);
      setLastEvent({ name, payload, receivedAt: new Date().toISOString() });
      setRevision((value) => value + 1);

      if (name === "OutOfStockAlert") {
        const shelf = String(payload.shelfName ?? payload.nodeName ?? `Kệ #${payload.nodeId ?? payload.shelfId ?? "?"}`);
        const occupancy = String(payload.occupancyRatePct ?? payload.densityPercentage ?? "?");
        const empty = payload.emptySlotCount && payload.emptySlotCount !== "?" && Number(payload.emptySlotCount) > 0 ? String(payload.emptySlotCount) : "";

        playAlertChime();

        setActiveBanner({
          shelf,
          occupancy,
          empty,
          receivedAt: new Date().toLocaleTimeString("vi-VN"),
        });

        if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
        bannerTimerRef.current = setTimeout(() => {
          if (mounted) setActiveBanner(null);
        }, 9000);
      }

      if (name === "RobotLowBatteryAlert") {
        const robotCode = String(payload.robotCode ?? "RB001");
        const batteryPct = String(payload.batteryPct ?? "12");
        const dockId = payload.dockNodeId ? `#${payload.dockNodeId}` : "Dock";

        playAlertChime();

        setActiveBanner({
          title: "🪫 CẢNH BÁO PIN YẾU ROBOT (REALTIME)",
          shelf: `Robot ${robotCode} · Pin ${batteryPct}% (< 15%)`,
          message: `Robot đang tự động quay về trạm sạc ${dockId}. Toàn bộ hệ thống tiếp nhận khách tạm thời đóng băng.`,
          receivedAt: new Date().toLocaleTimeString("vi-VN"),
          isBatteryAlert: true,
        });

        if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
        bannerTimerRef.current = setTimeout(() => {
          if (mounted) setActiveBanner(null);
        }, 12000);
      }
    };

    const events: PatrolEventName[] = [
      "ShelfPatrolScanStarted",
      "ShelfPatrolScanCompleted",
      "OutOfStockAlert",
      "ShelfPatrolScanFailed",
      "ShelfDensityUpdated",
      "ShelfRestocked",
      "RobotLowBatteryAlert",
      "mapLayoutUpdated",
    ];
    events.forEach((name) => connection.on(name, (payload) => receive(name, payload)));

    connection.onreconnecting(() => mounted && setConnected(false));
    connection.onreconnected(async () => {
      if (!mounted) return;
      setConnected(true);
      await join();
    });
    connection.onclose(() => mounted && setConnected(false));

    connection
      .start()
      .then(async () => {
        if (!mounted) return;
        setConnected(true);
        console.log("[StaffRealtime] Connected to StaffHub:", hubUrl);
        await join();
      })
      .catch((error) => console.warn("[StaffRealtime] connect failed", error));

    return () => {
      mounted = false;
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
      events.forEach((name) => connection.off(name));
      connection.stop().catch(() => undefined);
    };
  }, [status]);

  const handleBannerClick = () => {
    setActiveBanner(null);
    try {
      router.push("/staff/notifications" as any);
    } catch {
      if (typeof window !== "undefined") {
        window.location.pathname = "/staff/notifications";
      }
    }
  };

  const value = useMemo(() => ({ connected, revision, lastEvent }), [connected, revision, lastEvent]);

  return (
    <StaffRealtimeContext.Provider value={value}>
      {children}
      {/* Floating Realtime Alert Notification Banner (High Z-Index) */}
      {activeBanner && (
        <View style={styles.bannerWrapper} pointerEvents="box-none">
          <Pressable
            style={[
              styles.bannerCard,
              activeBanner.isBatteryAlert && { borderColor: "#DC2626", backgroundColor: "#FFF7ED" },
            ]}
            onPress={handleBannerClick}
          >
            <View
              style={[
                styles.bannerIconBox,
                activeBanner.isBatteryAlert && { backgroundColor: "#FEE2E2" },
              ]}
            >
              <Ionicons
                name={activeBanner.isBatteryAlert ? "battery-dead" : "warning"}
                size={26}
                color={activeBanner.isBatteryAlert ? "#DC2626" : "#EF4444"}
              />
            </View>
            <View style={styles.bannerContent}>
              <View style={styles.bannerHeaderRow}>
                <Text
                  style={[
                    styles.bannerTitle,
                    activeBanner.isBatteryAlert && { color: "#DC2626" },
                  ]}
                >
                  {activeBanner.title || "🚨 CẢNH BÁO CẦN NHẬP HÀNG (REALTIME)"}
                </Text>
                <Text style={styles.bannerTime}>{activeBanner.receivedAt}</Text>
              </View>
              {activeBanner.isBatteryAlert ? (
                <Text style={styles.bannerBody} numberOfLines={2}>
                  <Text style={{ fontWeight: "700", color: "#DC2626" }}>{activeBanner.shelf}</Text>
                  {" — "}
                  {activeBanner.message}
                </Text>
              ) : (
                <Text style={styles.bannerBody} numberOfLines={2}>
                  <Text style={{ fontWeight: "700", color: "#1E293B" }}>{activeBanner.shelf}</Text>
                  {" · "}Mức còn hàng: <Text style={{ fontWeight: "700", color: "#B45309" }}>{activeBanner.occupancy}%</Text>
                  {activeBanner.empty ? (<>{" · "}Trống: <Text style={{ fontWeight: "700", color: "#DC2626" }}>{activeBanner.empty} slot</Text></>) : null}
                </Text>
              )}
              <Text style={styles.bannerAction}>
                {activeBanner.isBatteryAlert ? "Chạm để theo dõi trạng thái trạm sạc ➔" : "Chạm để mở trang Thông Báo và xếp hàng ➔"}
              </Text>
            </View>
            <Pressable
              style={styles.closeBtn}
              onPress={(e) => {
                e.stopPropagation?.();
                setActiveBanner(null);
              }}
            >
              <Ionicons name="close" size={20} color="#64748B" />
            </Pressable>
          </Pressable>
        </View>
      )}
    </StaffRealtimeContext.Provider>
  );
}

export function useStaffRealtime() {
  return useContext(StaffRealtimeContext);
}

const styles = StyleSheet.create({
  bannerWrapper: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    zIndex: 999999,
    alignItems: "center",
  },
  bannerCard: {
    width: "100%",
    maxWidth: 620,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#EF4444",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  bannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  bannerContent: {
    flex: 1,
  },
  bannerHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#DC2626",
    letterSpacing: 0.3,
  },
  bannerTime: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
  bannerBody: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
    marginTop: 2,
  },
  bannerAction: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
    marginTop: 4,
  },
  closeBtn: {
    padding: 6,
    marginLeft: 8,
  },
});
