import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
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
import { type StoreShelf } from '../staff/map/lib/storeLayout';
import { completeRestockTask } from '@/shared/api/tasks';

interface MapProps {
  showHeatmap: boolean;
  showRobots: boolean;
  robotsData?: NormalizedRobot[];
  densities?: AisleDensityDto[];
  shelfDensities?: ShelfDensityDto[];
  onShelfRestocked?: (shelfId: number) => void;
}

export function InteractiveMap({
  showHeatmap,
  showRobots,
  robotsData,
  densities,
  shelfDensities = [],
  onShelfRestocked,
}: MapProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Selected shelf for Fill Hàng modal
  const [selectedShelf, setSelectedShelf] = useState<StoreShelf | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fillSuccessMsg, setFillSuccessMsg] = useState<string | null>(null);

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

  const handleConfirmFill = async (shelf: StoreShelf) => {
    setIsSubmitting(true);
    try {
      await completeRestockTask({
        shelfId: shelf.shelfId,
        aisleId: shelf.shelfId,
      });
      setFillSuccessMsg(`✅ Đã xác nhận Fill đầy Kệ ${shelf.shelfId} (100%) thành công!`);
      onShelfRestocked?.(shelf.shelfId);
      setTimeout(() => {
        setFillSuccessMsg(null);
        setSelectedShelf(null);
      }, 900);
    } catch (e: any) {
      Alert.alert(
        'Không thể hoàn tất',
        e?.message || 'Hệ thống không xác nhận được thao tác. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const projection = makeProjection(null, 600, 600);

  // Lookup live density for the selected shelf
  const selectedDensity = selectedShelf
    ? Math.round(
        shelfDensities.find((d) => d.shelfId === selectedShelf.shelfId)?.densityPercentage ?? 100
      )
    : 100;

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
              onShelfPress={(shelf) => setSelectedShelf(shelf)}
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

      {/* ── Modal Xác Nhận Fill Hàng từ Bản Đồ ── */}
      <Modal
        visible={!!selectedShelf}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isSubmitting) setSelectedShelf(null);
        }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            if (!isSubmitting) setSelectedShelf(null);
          }}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            {selectedShelf && (
              <View style={{ gap: 14 }}>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderTitleGroup}>
                    <View
                      style={[
                        styles.modalIconCircle,
                        {
                          backgroundColor: selectedShelf.themeBg,
                          borderColor: selectedShelf.themeColor,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 26 }}>{selectedShelf.icon}</Text>
                    </View>
                    <View>
                      <Text style={styles.modalTitle}>Xác Nhận Fill Hàng</Text>
                      <Text style={styles.modalSubtitle}>
                        {`KỆ ${selectedShelf.shelfId} · Dãy ${selectedShelf.aisleCode}`}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    disabled={isSubmitting}
                    onPress={() => setSelectedShelf(null)}
                    style={styles.modalCloseBtn}
                  >
                    <Ionicons name="close" size={20} color="#6b7280" />
                  </Pressable>
                </View>

                {/* Success Banner */}
                {fillSuccessMsg && (
                  <View style={styles.successBanner}>
                    <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                    <Text style={styles.successBannerText}>{fillSuccessMsg}</Text>
                  </View>
                )}

                {/* Detail Box */}
                <View style={styles.modalDetailBox}>
                  <Text style={styles.modalShelfName}>{selectedShelf.name}</Text>
                  <Text style={styles.modalShelfMeta}>
                    {`Vị trí: Dãy ${selectedShelf.aisleCode} · ArUco #${selectedShelf.arucoTag} · ${selectedShelf.category}`}
                  </Text>

                  {/* Density row */}
                  <View style={styles.modalDensityRow}>
                    <Text style={styles.modalDensityLabel}>Mật độ hiện tại:</Text>
                    <Text
                      style={[
                        styles.modalDensityValue,
                        {
                          color:
                            selectedDensity >= 70
                              ? '#16a34a'
                              : selectedDensity >= 40
                              ? '#f59e0b'
                              : '#ef4444',
                        },
                      ]}
                    >
                      {selectedDensity}% {selectedDensity <= 70 ? '(Cần bổ sung)' : '(Ổn định)'}
                    </Text>
                  </View>

                  <View style={styles.modalProgressTrack}>
                    <View
                      style={[
                        styles.modalProgressBar,
                        {
                          width: `${Math.min(100, Math.max(5, selectedDensity))}%`,
                          backgroundColor:
                            selectedDensity >= 70
                              ? '#16a34a'
                              : selectedDensity >= 40
                              ? '#f59e0b'
                              : '#ef4444',
                        },
                      ]}
                    />
                  </View>

                  <Text style={styles.modalEmptyEstimate}>
                    {`Khoảng trống cần bổ sung: ~${Math.max(0, 100 - selectedDensity)}% dung lượng`}
                  </Text>
                </View>

                {/* Notice text */}
                <View style={styles.modalNoticeBox}>
                  <Ionicons name="information-circle-outline" size={20} color="#15803d" />
                  <Text style={styles.modalNoticeText}>
                    Xác nhận nhân viên đã bổ sung đầy hàng lên kệ. Hệ thống sẽ cập nhật mật độ về 100% và đóng các cảnh báo liên quan.
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.modalActionsRow}>
                  <Pressable
                    disabled={isSubmitting}
                    onPress={() => setSelectedShelf(null)}
                    style={styles.modalCancelBtn}
                  >
                    <Text style={styles.modalCancelBtnText}>Hủy</Text>
                  </Pressable>

                  <Pressable
                    disabled={isSubmitting}
                    onPress={() => handleConfirmFill(selectedShelf)}
                    style={[styles.modalConfirmBtn, isSubmitting && { opacity: 0.7 }]}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-done" size={18} color="#ffffff" />
                        <Text style={styles.modalConfirmBtnText}>Xác nhận đã Fill xong</Text>
                      </>
                    )}
                  </Pressable>
                </View>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
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

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 999,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#11201a',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#dcfce7',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  successBannerText: {
    color: '#15803d',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  modalDetailBox: {
    backgroundColor: '#f8faf9',
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(20,83,45,0.08)',
  },
  modalShelfName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#11201a',
  },
  modalShelfMeta: {
    fontSize: 12,
    color: '#4b5563',
  },
  modalDensityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  modalDensityLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  modalDensityValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  modalProgressTrack: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  modalProgressBar: {
    height: '100%',
    borderRadius: 4,
  },
  modalEmptyEstimate: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  modalNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(22,163,74,0.15)',
  },
  modalNoticeText: {
    fontSize: 11,
    color: '#166534',
    lineHeight: 16,
    flex: 1,
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4b5563',
  },
  modalConfirmBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#16a34a',
  },
  modalConfirmBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
});
