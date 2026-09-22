import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, Switch, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInUp, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { InteractiveMap } from '@/features/map/InteractiveMap';
import { getShelfDensities, type ShelfDensityDto } from '@/shared/api/aisles';
import { CustomHeader } from '@/shared/ui';
import { useFocusEffect } from 'expo-router';
import { useRobotMqtt, normalizeRobotCode } from '@/shared/mqtt/useRobotMqtt';
import { useStaffRealtime } from '@/shared/realtime/StaffRealtimeContext';
import type { NormalizedRobot } from '@/shared/api/robots';

export default function StaffMapPage() {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showRobots, setShowRobots] = useState(true);
  const [shelfDensities, setShelfDensities] = useState<ShelfDensityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [hudExpanded, setHudExpanded] = useState(false); // Collapsed by default so map is fully visible!

  // 1. Direct MQTT Hook (HiveMQ Cloud WSS with SignalR Fallback)
  const {
    telemetry,
    connectionState,
    isConnected,
    packetCount,
    latencyMs,
    brokerHost,
    sendTestTelemetry,
  } = useRobotMqtt('RB0001');

  const { revision } = useStaffRealtime();

  const fetchDensities = useCallback(() => {
    getShelfDensities()
      .then((data) => {
        setShelfDensities(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDensities();
    }, [fetchDensities])
  );

  useEffect(() => {
    fetchDensities();
  }, [revision, fetchDensities]);

  useEffect(() => {
    fetchDensities();
    const interval = setInterval(fetchDensities, 4000);
    return () => clearInterval(interval);
  }, [fetchDensities]);

  // Construct NormalizedRobot from realtime MQTT telemetry
  const activeRobots: NormalizedRobot[] = telemetry ? [{
    robotId: 1,
    robotCode: normalizeRobotCode(telemetry.robotCode),
    robotName: 'SmartMarketBot 01',
    status: (telemetry.isOnline ? 'active' : 'standby') as any,
    batteryPct: telemetry.batteryPct,
    mode: (telemetry.mode as any) || 'IDLE',
    lastSeenAt: telemetry.lastUpdated || new Date().toISOString(),
    position: {
      x: telemetry.x,
      y: telemetry.y,
      headingDeg: telemetry.headingDeg,
      at: telemetry.lastUpdated || new Date().toISOString(),
    },
  }] : [];

  const batteryPct = telemetry?.batteryPct ?? 100;
  const batteryColor = batteryPct >= 60 ? '#10B981' : batteryPct >= 25 ? '#F59E0B' : '#EF4444';
  const mode = telemetry?.mode ?? 'IDLE';

  const connectionLabel = connectionState === 'MQTT_WSS'
    ? 'MQTT Live (EMQX Cloud WSS:8084)'
    : connectionState === 'SIGNALR_FALLBACK'
    ? 'SignalR Live (/hubs/robot)'
    : 'Đang kết nối MQTT...';

  const connectionColor = connectionState === 'MQTT_WSS'
    ? '#10B981'
    : connectionState === 'SIGNALR_FALLBACK'
    ? '#3B82F6'
    : '#F59E0B';

  return (
    <View style={styles.container}>
      <CustomHeader title="Bản đồ Siêu thị" subtitle="Giám sát vị trí & trạng thái Robot Realtime" />

      {/* ── MQTT LIVE TELEMETRY BAR ── */}
      <View style={styles.mqttStatusBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
          <View style={[styles.pulseDot, { backgroundColor: connectionColor }]} />
          <Text style={[styles.mqttStatusText, { flex: 1 }]} numberOfLines={1}>
            {connectionLabel}
          </Text>
          <View style={styles.topicBadge}>
            <Text style={styles.topicBadgeText} numberOfLines={1}>
              {`RB0001 · ~${latencyMs}ms`}
            </Text>
          </View>
        </View>
      </View>

      {/* ── RESPONSIVE MAP VIEWPORT ── */}
      <Animated.View entering={FadeIn.duration(600)} style={styles.mapWrapper}>
        {loading && shelfDensities.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#16a34a" />
            <Text style={{ marginTop: 10, color: '#4a5a52', fontSize: 13 }}>Đang tải bản đồ siêu thị...</Text>
          </View>
        ) : (
          <InteractiveMap 
            showHeatmap={showHeatmap} 
            showRobots={showRobots} 
            robotsData={activeRobots}
            shelfDensities={shelfDensities} 
            onShelfRestocked={() => fetchDensities()}
          />
        )}
      </Animated.View>

      {/* ── FLOATING COMPACT TELEMETRY HUD CARD (Collapsed by default so map stays clear) ── */}
      {telemetry && (
        <Animated.View entering={FadeInUp.duration(400)} layout={Layout.springify()} style={styles.hudCard}>
          {/* Header Row */}
          <Pressable onPress={() => setHudExpanded(!hudExpanded)} style={styles.hudHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, paddingRight: 6 }}>
              <View style={styles.robotAvatar}>
                <Ionicons name="hardware-chip" size={16} color="#15803d" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.robotName} numberOfLines={1}>RB0001</Text>
                  <View style={[styles.miniBadge, { backgroundColor: isConnected ? '#dcfce7' : '#fee2e2' }]}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: isConnected ? '#15803d' : '#b91c1c' }}>
                      {mode}
                    </Text>
                  </View>
                </View>
                <Text style={styles.robotLocText} numberOfLines={1}>
                  📍 {telemetry.currentNodeId ? `Node ${telemetry.currentNodeId} · ` : ''}{telemetry.nearestLocation}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons 
                  name={telemetry.isCharging ? "battery-charging" : batteryPct > 80 ? "battery-full" : batteryPct > 35 ? "battery-half" : "battery-dead"} 
                  size={18} 
                  color={telemetry.isCharging ? "#10B981" : batteryColor} 
                />
                <Text style={[styles.batteryVal, { color: telemetry.isCharging ? "#10B981" : batteryColor }]}>
                  {batteryPct}%{telemetry.isCharging ? " ⚡" : ""}
                </Text>
              </View>
              <View style={styles.chevronBox}>
                <Ionicons name={hudExpanded ? "chevron-down" : "chevron-up"} size={16} color="#4b5563" />
              </View>
            </View>
          </Pressable>

          {/* Expanded Detail Panel */}
          {hudExpanded && (
            <View style={styles.hudBody}>
              <View style={styles.metricGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Dung lượng Pin</Text>
                  <Text style={[styles.metricValText, { color: batteryColor }]}>
                    {batteryPct}% {telemetry.isCharging ? '(Đang sạc ⚡)' : ''}
                  </Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Cập nhật lần cuối</Text>
                  <Text style={styles.metricValText}>{telemetry.lastUpdated}</Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Tọa độ X / Y / Hướng</Text>
                  <Text style={styles.metricValText}>{telemetry.x.toFixed(2)}m, {telemetry.y.toFixed(2)}m · {telemetry.headingDeg}°</Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Kênh kết nối</Text>
                  <Text style={[styles.metricValText, { color: connectionColor }]}>{connectionState}</Text>
                </View>
              </View>
            </View>
          )}
        </Animated.View>
      )}

      {/* ── BOTTOM TOGGLE CONTROLS BAR ── */}
      <View style={styles.bottomControls}>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Hiển thị % Mật độ</Text>
          <Switch
            value={showHeatmap}
            onValueChange={setShowHeatmap}
            trackColor={{ false: '#cbd5e1', true: '#86efac' }}
            thumbColor={showHeatmap ? '#16a34a' : '#f8fafc'}
          />
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Marker Robot (RB0001)</Text>
          <Switch
            value={showRobots}
            onValueChange={setShowRobots}
            trackColor={{ false: '#cbd5e1', true: '#86efac' }}
            thumbColor={showRobots ? '#16a34a' : '#f8fafc'}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mqttStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20,83,45,0.08)',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mqttStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  topicBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  topicBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  testTelemetryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  testTelemetryText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803d',
  },
  mapWrapper: {
    flex: 1,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  hudCard: {
    position: 'absolute',
    bottom: 58,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(20,83,45,0.14)',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 90,
  },
  hudHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  robotAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  robotName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  robotLocText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  batteryVal: {
    fontSize: 13,
    fontWeight: '800',
  },
  chevronBox: {
    padding: 2,
  },
  hudBody: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 8,
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  metricValText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 2,
  },
  bottomControls: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(20,83,45,0.08)',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
});
