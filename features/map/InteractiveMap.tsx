import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDecay,
  withSpring,
} from 'react-native-reanimated';
import { NormalizedRobot } from '@/shared/api/robots';
import { type AisleDensityDto } from '@/shared/api/types';
import { MapCanvas } from '../staff/map/components/MapCanvas';
import { makeProjection } from '../staff/map/lib/map';

interface MapProps {
  showHeatmap: boolean;
  showRobots: boolean;
  robotsData?: NormalizedRobot[];
  densities?: AisleDensityDto[];
}

export function InteractiveMap({ showHeatmap, showRobots, robotsData, densities }: MapProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      if (scale.value < 0.5) scale.value = withSpring(0.5);
      if (scale.value > 3) scale.value = withSpring(3);
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd((e) => {
      translateX.value = withDecay({
        velocity: e.velocityX,
        clamp: [-500, 500],
      });
      translateY.value = withDecay({
        velocity: e.velocityY,
        clamp: [-500, 500],
      });
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

  const projection = makeProjection(null, 400, 500);

  return (
    <GestureDetector gesture={composed}>
      <View style={styles.container}>
        <Animated.View style={[styles.mapContainer, animatedStyle]}>
          <MapCanvas 
            robots={showRobots && robotsData ? robotsData : []} 
            densities={densities}
            projection={projection} 
            showHeatmap={showHeatmap}
            width={400}
            height={500}
          />
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    width: 400,
    height: 500,
  },
});
