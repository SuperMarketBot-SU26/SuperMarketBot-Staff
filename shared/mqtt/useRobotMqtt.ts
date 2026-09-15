import { useState, useEffect, useRef, useCallback } from 'react';
import Paho from 'paho-mqtt';
import * as signalR from '@microsoft/signalr';
import { API_BASE_URL } from '@/shared/api/config';
import { resolveRobotNodePosition, SUPERMARKET_NODES } from '@/features/staff/map/lib/storeLayout';

export interface RobotMqttTelemetry {
  robotCode: string;
  currentNodeId?: number | null;
  x: number;
  y: number;
  headingDeg: number;
  batteryPct: number;
  isCharging?: boolean;
  deviceBatteryPct?: number | null;
  espBatteryPct?: number | null;
  espBatteryVolts?: number | null;
  mode: string;
  status: string;
  isOnline: boolean;
  lastUpdated: string;
  nearestLocation?: string;
}

export interface UseRobotMqttResult {
  telemetry: RobotMqttTelemetry | null;
  connectionState: 'MQTT_WSS' | 'SIGNALR_FALLBACK' | 'CONNECTING' | 'DISCONNECTED';
  isConnected: boolean;
  packetCount: number;
  latencyMs: number;
  brokerHost: string;
  sendTestTelemetry: (custom?: Partial<RobotMqttTelemetry>) => Promise<boolean>;
}

const MQTT_CONFIG = {
  host: '60922debd474446a84747b871c4a8182.s1.eu.hivemq.cloud',
  port: 8884,
  path: '/mqtt',
  username: 'Smartmarketbot',
  password: 'Passsep490',
  useSSL: true,
};

export function normalizeRobotCode(code?: string): string {
  if (!code) return 'RB0001';
  const clean = String(code).trim().toUpperCase();
  if (clean === 'RB001' || clean === 'RB0001') {
    return 'RB0001';
  }
  return clean;
}

export function useRobotMqtt(targetRobotCode: string = 'RB0001'): UseRobotMqttResult {
  const normalizedTarget = normalizeRobotCode(targetRobotCode);
  const initialNode = SUPERMARKET_NODES[8];
  const [telemetry, setTelemetry] = useState<RobotMqttTelemetry | null>({
    robotCode: normalizedTarget,
    currentNodeId: 8,
    x: initialNode.mapX,
    y: initialNode.mapY,
    headingDeg: 90,
    batteryPct: 100,
    mode: 'IDLE',
    status: 'Online',
    isOnline: true,
    lastUpdated: new Date().toLocaleTimeString('vi-VN'),
    nearestLocation: initialNode.name,
  });

  const [connectionState, setConnectionState] = useState<'MQTT_WSS' | 'SIGNALR_FALLBACK' | 'CONNECTING' | 'DISCONNECTED'>('CONNECTING');
  const [packetCount, setPacketCount] = useState<number>(0);
  const [latencyMs, setLatencyMs] = useState<number>(32);

  const clientRef = useRef<Paho.Client | null>(null);
  const signalrRef = useRef<signalR.HubConnection | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const resolveLocation = (x: number, y: number): string => {
    if (x >= 1.8 && y <= 0.6) return 'Kệ 1 - Đồ Ăn Vặt (A01)';
    if (x >= 2.4 && y <= 1.5) return 'Kệ 2 - Nước Giải Khát (A01)';
    if (x <= 0.6 && y <= 1.5) return 'Kệ 3 - Thực Phẩm Tươi (B01)';
    if (x <= 1.2 && y <= 0.6) return 'Kệ 4 - Thực Phẩm Khô (B01)';
    if (x >= 1.0 && x <= 2.0 && y >= 1.0 && y <= 2.0) return 'Kệ 5 - Đồ Gia Dụng (C01)';
    if (x <= 0.8 && y >= 1.8) return 'Kệ 6 - Gia Vị & Trà (C01)';
    if (x >= 2.4 && y >= 1.8) return 'Trạm sạc / Dock';
    return `Tọa độ (${x.toFixed(1)}m, ${y.toFixed(1)}m)`;
  };

  const processIncomingPayload = useCallback((jsonStr: string, topic?: string) => {
    try {
      const data = JSON.parse(jsonStr);
      const topicCodeMatch = topic?.match(/smartmarketbot\/robot\/([^/]+)/);
      const topicCode = topicCodeMatch ? topicCodeMatch[1] : undefined;
      const rawCode =
        data.robotCode ||
        data.RobotCode ||
        data.code ||
        data.Code ||
        topicCode ||
        normalizedTarget;
      const incomingCode = normalizeRobotCode(rawCode);

      // Khớp robot đích hoặc bí danh RB001 <-> RB0001
      const isTarget =
        incomingCode === normalizedTarget ||
        (normalizedTarget === 'RB0001' && (incomingCode === 'RB001' || incomingCode === 'RB0001'));
      if (!isTarget && incomingCode) return;

      setTelemetry((prev) => {
        // Truyền vị trí trước đó vào resolveRobotNodePosition để bảo toàn vị trí khi nhận sự kiện dwell/quảng cáo
        const prevPos = prev
          ? {
              nodeId: prev.currentNodeId,
              nodeName: prev.nearestLocation,
              x: prev.x,
              y: prev.y,
              headingDeg: prev.headingDeg,
            }
          : undefined;

        const resolved = resolveRobotNodePosition(data, prevPos);

        let heading = resolved.headingDeg ?? prev?.headingDeg ?? 90;
        const rawHeading = data.headingDeg ?? data.HeadingDeg ?? data.heading ?? data.Heading;
        if (typeof rawHeading === 'number') {
          heading = rawHeading;
        } else {
          const rawRad = data.headingRad ?? data.HeadingRad ?? data.heading_rad;
          if (typeof rawRad === 'number') {
            heading = (rawRad * 180) / Math.PI;
          }
        }

        let batVal = prev?.batteryPct ?? 100;
        const rawBat =
          data.battery ??
          data.Battery ??
          data.batteryPct ??
          data.BatteryPct ??
          data.overallBattery ??
          data.OverallBattery ??
          data.deviceBattery ??
          data.DeviceBattery ??
          data.deviceBatteryPct ??
          data.DeviceBatteryPct ??
          data.batPct ??
          data.BatPct;
        if (typeof rawBat === 'number') {
          batVal = rawBat;
        }

        const isCharging =
          typeof data.isCharging === 'boolean'
            ? data.isCharging
            : typeof data.IsCharging === 'boolean'
            ? data.IsCharging
            : typeof data.deviceIsCharging === 'boolean'
            ? data.deviceIsCharging
            : typeof data.DeviceIsCharging === 'boolean'
            ? data.DeviceIsCharging
            : prev?.isCharging ?? false;

        const deviceBat =
          typeof data.deviceBattery === 'number'
            ? data.deviceBattery
            : typeof data.DeviceBattery === 'number'
            ? data.DeviceBattery
            : typeof data.deviceBatteryPct === 'number'
            ? data.deviceBatteryPct
            : typeof data.DeviceBatteryPct === 'number'
            ? data.DeviceBatteryPct
            : prev?.deviceBatteryPct;

        const espBat =
          typeof data.espBattery === 'number'
            ? data.espBattery
            : typeof data.EspBattery === 'number'
            ? data.EspBattery
            : typeof data.espBatteryPct === 'number'
            ? data.espBatteryPct
            : typeof data.EspBatteryPct === 'number'
            ? data.EspBatteryPct
            : prev?.espBatteryPct;

        const espVolts =
          typeof data.espBatteryVolts === 'number'
            ? data.espBatteryVolts
            : typeof data.EspBatteryVolts === 'number'
            ? data.EspBatteryVolts
            : typeof data.espVolts === 'number'
            ? data.espVolts
            : typeof data.EspVolts === 'number'
            ? data.EspVolts
            : prev?.espBatteryVolts;

        const rawMode = data.mode ?? data.Mode ?? data.navState ?? data.NavState;
        const rawStatus = data.status ?? data.Status ?? data.navStatus ?? data.NavStatus;
        const mode = rawMode
          ? String(rawMode).toUpperCase()
          : rawStatus
          ? String(rawStatus).toUpperCase()
          : prev?.mode || 'IDLE';

        const status = rawStatus
          ? String(rawStatus)
          : data.isOnline !== false && data.IsOnline !== false
          ? prev?.status || 'Online'
          : 'Offline';

        console.log(
          `[useRobotMqtt] 📍 Robot ${incomingCode}: Node ${resolved.nodeId} (${resolved.nodeName}) @ (${resolved.x.toFixed(2)}, ${resolved.y.toFixed(2)}) | Mode: ${mode}`
        );

        return {
          robotCode: normalizedTarget,
          currentNodeId: resolved.nodeId,
          x: resolved.x,
          y: resolved.y,
          headingDeg: Math.round(heading % 360),
          batteryPct: Math.max(0, Math.min(100, Math.round(batVal))),
          isCharging,
          deviceBatteryPct: deviceBat,
          espBatteryPct: espBat,
          espBatteryVolts: espVolts,
          mode: mode.toUpperCase(),
          status,
          isOnline: status.toLowerCase() !== 'offline',
          lastUpdated: new Date().toLocaleTimeString('vi-VN'),
          nearestLocation: resolved.nodeName,
        };
      });

      setPacketCount((prev) => prev + 1);
      // Simulated jitter between 25ms - 45ms for ping
      setLatencyMs(Math.floor(25 + Math.random() * 20));
    } catch (e) {
      console.warn('[useRobotMqtt] Error parsing telemetry payload:', e);
    }
  }, [targetRobotCode]);

  // 1. Initialize Direct MQTT (HiveMQ Cloud WSS)
  useEffect(() => {
    isMountedRef.current = true;
    const clientId = `staff_fe_${Math.random().toString(16).substring(2, 8)}`;

    const client = new Paho.Client(
      MQTT_CONFIG.host,
      MQTT_CONFIG.port,
      MQTT_CONFIG.path,
      clientId
    );
    clientRef.current = client;

    client.onConnectionLost = (responseObject) => {
      if (responseObject.errorCode !== 0 && isMountedRef.current) {
        console.warn('[useRobotMqtt] MQTT connection lost:', responseObject.errorMessage);
        setConnectionState('CONNECTING');
        // Fallback to SignalR immediately if MQTT drops
        startSignalRFallback();
      }
    };

    client.onMessageArrived = (message) => {
      const topic = message.destinationName;
      const payload = message.payloadString;
      if (
        topic.includes('/telemetry') ||
        topic.includes('/status') ||
        topic.includes('/navigation_status')
      ) {
        processIncomingPayload(payload, topic);
      }
    };

    try {
      client.connect({
        useSSL: MQTT_CONFIG.useSSL,
        userName: MQTT_CONFIG.username,
        password: MQTT_CONFIG.password,
        timeout: 8,
        keepAliveInterval: 30,
        cleanSession: true,
        onSuccess: () => {
          if (!isMountedRef.current) return;
          console.log('[useRobotMqtt] Successfully connected to HiveMQ Cloud MQTT WSS!');
          setConnectionState('MQTT_WSS');

          // Subscribe to telemetry, status, and navigation_status
          client.subscribe(`smartmarketbot/robot/${targetRobotCode}/telemetry`, { qos: 0 });
          client.subscribe(`smartmarketbot/robot/${targetRobotCode}/status`, { qos: 0 });
          client.subscribe(`smartmarketbot/robot/${targetRobotCode}/navigation_status`, { qos: 0 });
          client.subscribe(`smartmarketbot/robot/+/telemetry`, { qos: 0 });
          client.subscribe(`smartmarketbot/robot/+/status`, { qos: 0 });
          client.subscribe(`smartmarketbot/robot/+/navigation_status`, { qos: 0 });
        },
        onFailure: (err) => {
          if (!isMountedRef.current) return;
          console.warn('[useRobotMqtt] Direct MQTT connection failed, activating SignalR fallback:', err.errorMessage);
          startSignalRFallback();
        },
      });
    } catch (e) {
      console.warn('[useRobotMqtt] Error initializing MQTT client:', e);
      startSignalRFallback();
    }

    // 2. Start SignalR Hub connection alongside MQTT for real-time tablet battery & telemetry
    startSignalRFallback();

    function startSignalRFallback() {
      if (signalrRef.current) return;
      const isNgrok = API_BASE_URL.includes('ngrok');
      const cleanBase = API_BASE_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '');
      const hubUrl = isNgrok
        ? `${cleanBase}/hubs/robot?ngrok-skip-browser-warning=true`
        : `${cleanBase}/hubs/robot`;

      const hub = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      signalrRef.current = hub;

      hub.on('telemetry', (data: any) => {
        if (!isMountedRef.current) return;
        processIncomingPayload(typeof data === 'string' ? data : JSON.stringify(data), 'signalr/telemetry');
      });
      hub.on('navigationStatus', (data: any) => {
        if (!isMountedRef.current) return;
        processIncomingPayload(typeof data === 'string' ? data : JSON.stringify(data), 'signalr/navigationStatus');
      });
      hub.on('status', (data: any) => {
        if (!isMountedRef.current) return;
        processIncomingPayload(typeof data === 'string' ? data : JSON.stringify(data), 'signalr/status');
      });
      hub.on('zoneEntered', (data: any) => {
        if (!isMountedRef.current || !data) return;
        if (data.objectName) {
          setTelemetry((prev) => prev ? { ...prev, nearestLocation: data.objectName } : prev);
        }
      });
      hub.on('robotLog', () => {});
      hub.on('slamMapStream', () => {});
      hub.on('missionAssigned', () => {});
      hub.on('shelfReport', () => {});

      hub.start()
        .then(async () => {
          if (isMountedRef.current) {
            console.log('[useRobotMqtt] SignalR Hub connected successfully via direct WebSocket');
            if (connectionState !== 'MQTT_WSS') {
              setConnectionState('SIGNALR_FALLBACK');
            }
            try {
              await hub.invoke('JoinRobotGroup', targetRobotCode);
            } catch {}
          }
        })
        .catch((e) => {
          console.log('[useRobotMqtt] SignalR fallback inactive (MQTT WSS is primary):', e?.message || e);
        });
    }

    // 3. Periodic API sync for battery & online status
    const syncApiRobot = async () => {
      try {
        const cleanBase = API_BASE_URL.replace(/\/$/, '');
        const res = await fetch(`${cleanBase}/api/robots`, {
          headers: { 'ngrok-skip-browser-warning': 'true', Accept: 'application/json' },
        });
        if (!res.ok) return;
        const robots: any[] = await res.json();
        const r = robots.find((item: any) =>
          item.robotCode === targetRobotCode ||
          (targetRobotCode === 'RB0001' && item.robotCode === 'RB001') ||
          (targetRobotCode === 'RB001' && item.robotCode === 'RB0001')
        ) || robots[0];

        if (r && isMountedRef.current) {
          setTelemetry((prev) => {
            const rawBat = r.batteryPct ?? r.deviceBatteryPct;
            const bat = typeof rawBat === 'number' ? rawBat : prev?.batteryPct ?? 100;
            return {
              robotCode: normalizedTarget,
              currentNodeId: prev?.currentNodeId ?? 8,
              x: prev?.x ?? SUPERMARKET_NODES[8].mapX,
              y: prev?.y ?? SUPERMARKET_NODES[8].mapY,
              headingDeg: prev?.headingDeg ?? SUPERMARKET_NODES[8].headingDeg,
              batteryPct: Math.max(0, Math.min(100, Math.round(bat))),
              isCharging: r.deviceIsCharging ?? prev?.isCharging ?? false,
              deviceBatteryPct: r.deviceBatteryPct ?? prev?.deviceBatteryPct,
              espBatteryPct: r.espBatteryPct ?? prev?.espBatteryPct,
              espBatteryVolts: r.espBatteryVolts ?? prev?.espBatteryVolts,
              mode: (r.mode || prev?.mode || 'IDLE').toUpperCase(),
              status: r.status || prev?.status || 'Online',
              isOnline: r.status ? r.status.toLowerCase() !== 'offline' : true,
              lastUpdated: prev?.lastUpdated || new Date().toLocaleTimeString('vi-VN'),
              nearestLocation: prev?.nearestLocation ?? SUPERMARKET_NODES[8].name,
            };
          });
        }
      } catch {}
    };

    syncApiRobot();
    const pollInterval = setInterval(syncApiRobot, 4000);

    return () => {
      isMountedRef.current = false;
      clearInterval(pollInterval);
      try {
        if (client.isConnected()) {
          client.disconnect();
        }
      } catch {}
      try {
        if (signalrRef.current) {
          signalrRef.current.stop();
        }
      } catch {}
    };
  }, [targetRobotCode, processIncomingPayload]);

  // 3. Send test telemetry packet via MQTT
  const sendTestTelemetry = useCallback(async (custom?: Partial<RobotMqttTelemetry>): Promise<boolean> => {
    const testPayload = {
      robotCode: targetRobotCode,
      x: custom?.x ?? (telemetry?.x === 1.9 ? 1.08 : telemetry?.x === 1.08 ? 0.48 : 1.9),
      y: custom?.y ?? (telemetry?.y === 0.22 ? 1.45 : telemetry?.y === 1.45 ? 2.12 : 0.22),
      headingDeg: custom?.headingDeg ?? ((telemetry?.headingDeg ?? 0) + 45) % 360,
      battery: custom?.batteryPct ?? Math.max(10, (telemetry?.batteryPct ?? 100) - 2),
      mode: custom?.mode ?? 'NAVIGATING',
      status: 'Online',
      isOnline: true,
      timestamp: new Date().toISOString(),
    };

    const topic = `smartmarketbot/robot/${targetRobotCode}/telemetry`;
    const json = JSON.stringify(testPayload);

    // If MQTT client connected, publish directly
    if (clientRef.current && clientRef.current.isConnected()) {
      const msg = new Paho.Message(json);
      msg.destinationName = topic;
      msg.qos = 0;
      clientRef.current.send(msg);
      processIncomingPayload(json);
      return true;
    }

    // Local state update fallback
    processIncomingPayload(json);
    return true;
  }, [targetRobotCode, telemetry, processIncomingPayload]);

  return {
    telemetry,
    connectionState,
    isConnected: connectionState === 'MQTT_WSS' || connectionState === 'SIGNALR_FALLBACK',
    packetCount,
    latencyMs,
    brokerHost: MQTT_CONFIG.host,
    sendTestTelemetry,
  };
}
