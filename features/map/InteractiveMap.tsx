import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDecay,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { NormalizedRobot } from '@/shared/api/robots';
import { type AisleDensityDto, type ShelfDensityDto } from '@/shared/api/types';
import { MapCanvas } from '../staff/map/components/MapCanvas';
import { makeProjection } from '../staff/map/lib/map';

interface MapProps {
  showHeatmap: boolean;
  showRobots: boolean;
  robotsData?: NormalizedRobot[];
  densities?: AisleDensityDto[];
  shelfDensities?: ShelfDensityDto[];
}

export function InteractiveMap({ showHeatmap, showRobots, robotsData, densities, shelfDensities }: MapProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Pinch gesture for touch screens
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(0.6, Math.min(3.5, savedScale.value * e.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  // Pan gesture for touch & drag
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd((e) => {
      translateX.value = withDecay({ velocity: e.velocityX, clamp: [-400, 400] });
      translateY.value = withDecay({ velocity: e.velocityY, clamp: [-400, 400] });
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  // Zoom control helpers
  const handleZoomIn = () => {
    const next = Math.min(3.5, scale.value + 0.3);
    scale.value = withSpring(next);
    savedScale.value = next;
  };

  const handleZoomOut = () => {
    const next = Math.max(0.6, scale.value - 0.3);
    scale.value = withSpring(next);
    savedScale.value = next;
  };

  const handleReset = () => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  const projection = makeProjection(null, 600, 600);

  return (
    <View style={styles.outerContainer}>
      <GestureDetector gesture={composed}>
        <View style={styles.canvasWrapper}>
          <Animated.View style={[styles.animatedBox, animatedStyle]}>
            <MapCanvas 
              robots={showRobots && robotsData ? robotsData : []} 
              densities={densities}
              shelfDensities={shelfDensities}
              projection={projection} 
              showHeatmap={showHeatmap}
              width="100%"
              height="100%"
            />
          </Animated.View>
        </View>
      </GestureDetector>

      {/* Floating Map Controls Toolbar */}
      <View style={styles.toolbar}>
        <Pressable onPress={handleZoomIn} style={styles.toolBtn} accessibilityLabel="Phóng to">
          <Ionicons name="add" size={20} color="#11201a" />
        </Pressable>
        <View style={styles.toolDivider} />
        <Pressable onPress={handleZoomOut} style={styles.toolBtn} accessibilityLabel="Thu nhỏ">
          <Ionicons name="remove" size={20} color="#11201a" />
        </Pressable>
        <View style={styles.toolDivider} />
        <Pressable onPress={handleReset} style={styles.toolBtn} accessibilityLabel="Về trung tâm">
          <Ionicons name="scan-outline" size={18} color="#15803d" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    position: 'relative',
  },
  canvasWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedBox: {
    width: '92%',
    aspectRatio: 1,
    maxHeight: '92%',
  },
  toolbar: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(20,83,45,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 100,
    overflow: 'hidden',
  },
  toolBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  toolDivider: {
    height: 1,
    backgroundColor: 'rgba(20,83,45,0.08)',
  },
});
