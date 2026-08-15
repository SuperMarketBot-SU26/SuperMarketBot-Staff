import * as SignalR from "@microsoft/signalr";
import { useAuth } from "@/features/auth";
import { API_BASE_URL } from "@/shared/api";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Alert } from "react-native";

type PatrolEventName =
  | "ShelfPatrolScanStarted"
  | "ShelfPatrolScanCompleted"
  | "OutOfStockAlert"
  | "ShelfPatrolScanFailed";

export interface StaffRealtimeEvent {
  name: PatrolEventName;
  payload: Record<string, unknown>;
  receivedAt: string;
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

export function StaffRealtimeProvider({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const [connected, setConnected] = useState(false);
  const [revision, setRevision] = useState(0);
  const [lastEvent, setLastEvent] = useState<StaffRealtimeEvent | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    let mounted = true;
    const connection = new SignalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL.replace(/\/$/, "")}/hubs/staff`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(SignalR.LogLevel.Warning)
      .build();

    const join = async () => {
      if (connection.state === SignalR.HubConnectionState.Connected)
        await connection.invoke("JoinStaffGroup");
    };
    const receive = (name: PatrolEventName, payload: Record<string, unknown>) => {
      if (!mounted) return;
      setLastEvent({ name, payload, receivedAt: new Date().toISOString() });
      setRevision((value) => value + 1);
      if (name === "OutOfStockAlert") {
        const shelf = payload.shelfName ?? payload.nodeName ?? `Node ${payload.nodeId ?? "?"}`;
        const occupancy = payload.occupancyRatePct ?? "?";
        const empty = payload.emptySlotCount ?? "?";
        Alert.alert(
          "Cảnh báo cần nhập hàng",
          `${shelf}\nMức còn hàng: ${occupancy}%\nVị trí trống: ${empty}`,
        );
      }
    };
    const events: PatrolEventName[] = [
      "ShelfPatrolScanStarted",
      "ShelfPatrolScanCompleted",
      "OutOfStockAlert",
      "ShelfPatrolScanFailed",
    ];
    events.forEach((name) => connection.on(name, (payload) => receive(name, payload)));
    connection.onreconnecting(() => mounted && setConnected(false));
    connection.onreconnected(async () => {
      if (!mounted) return;
      setConnected(true);
      await join().catch(() => undefined);
    });
    connection.onclose(() => mounted && setConnected(false));
    connection.start().then(async () => {
      if (!mounted) return;
      setConnected(true);
      await join();
    }).catch((error) => console.warn("[StaffRealtime] connect failed", error));

    return () => {
      mounted = false;
      events.forEach((name) => connection.off(name));
      connection.stop().catch(() => undefined);
    };
  }, [status]);

  const value = useMemo(() => ({ connected, revision, lastEvent }), [connected, revision, lastEvent]);
  return <StaffRealtimeContext.Provider value={value}>{children}</StaffRealtimeContext.Provider>;
}

export function useStaffRealtime() {
  return useContext(StaffRealtimeContext);
}
