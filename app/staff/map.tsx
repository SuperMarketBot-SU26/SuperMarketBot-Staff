import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Switch, ActivityIndicator } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { InteractiveMap } from '@/features/map/InteractiveMap';
import { listRobotsWithPositions, NormalizedRobot } from '@/shared/api/robots';
import { CustomHeader } from '@/shared/ui';

export default function StaffMapPage() {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showRobots, setShowRobots] = useState(true);
  const [robots, setRobots] = useState<NormalizedRobot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRobots() {
      try {
        const data = await listRobotsWithPositions();
        setRobots(data);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    }
    loadRobots();
    
    // Optionally poll every 5 seconds for robot updates
    const interval = setInterval(loadRobots, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <CustomHeader title="Bản đồ Siêu thị" subtitle="Vuốt để di chuyển, chụm để phóng to/thu nhỏ" />

      <Animated.View entering={FadeIn.duration(800)} style={styles.mapWrapper}>
        {loading && robots.length === 0 ? (
           <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
             <ActivityIndicator size="large" color="#4CAF50" />
           </View>
        ) : (
          <InteractiveMap 
            showHeatmap={showHeatmap} 
            showRobots={showRobots} 
            robotsData={robots} 
          />
        )}
      </Animated.View>

      <View style={styles.controlsContainer}>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Hiển thị Heatmap (Hàng hóa)</Text>
          <Switch
            value={showHeatmap}
            onValueChange={setShowHeatmap}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={showHeatmap ? '#2196F3' : '#f4f3f4'}
          />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Hiển thị Vị trí Robot</Text>
          <Switch
            value={showRobots}
            onValueChange={setShowRobots}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={showRobots ? '#2196F3' : '#f4f3f4'}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7faf7',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  mapWrapper: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#FAFAFA',
  },
  controlsContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

