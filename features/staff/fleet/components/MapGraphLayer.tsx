/**
 * MapGraphLayer — renders the BE-provided floorplan on top of the
 * MAP_WIDTH × MAP_HEIGHT canvas, in front of the loading-state grid
 * (rendered by `BackgroundLayer`) and behind the robot pins.
 *
 * z-order:
 *   1. Floorplan background image  (optional, fills canvas)
 *   2. Semantic-object rectangles  (aisles / shelves / zones)
 *   3. Edges                       (NavigationEdge lines)
 *   4. Nodes                       (NavigationNode circles; red if blocked)
 *
 * All coordinates come straight from the BE's `MapFloorplanDto` — they
 * use the same units as the FE's `MAP_WIDTH` / `MAP_HEIGHT`. When the
 * BE eventually seeds a real map row with width/height, replace those
 * constants with values pulled from the BE and the math below stays
 * the same.
 */
import { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { palette, useIsDark } from "@/shared/theme";
import { API_BASE_URL } from "@/shared/api/config";
import type { MapFloorplanDto } from "@/shared/api";
import { MAP_HEIGHT, MAP_WIDTH } from "../lib/map";

interface MapGraphLayerProps {
  floorplan: MapFloorplanDto | null;
}

export function MapGraphLayer({ floorplan }: MapGraphLayerProps) {
  const isDark = useIsDark();

  /** Index nodes by id so edges can look up their endpoints in O(1). */
  const nodesById = useMemo(() => {
    const map = new Map<number, MapFloorplanDto["nodes"][number]>();
    for (const n of floorplan?.nodes ?? []) {
      if (n.nodeId != null) map.set(n.nodeId, n);
    }
    return map;
  }, [floorplan?.nodes]);

  const imageUri = useMemo(() => {
    const raw = floorplan?.floorplanImageUrl;
    if (!raw) return null;
    if (/^https?:\/\//i.test(raw)) return raw;
    // BE-stored image paths are relative to the API root.
    const base = API_BASE_URL.replace(/\/$/, "");
    const path = raw.startsWith("/") ? raw : `/${raw}`;
    return `${base}${path}`;
  }, [floorplan?.floorplanImageUrl]);

  return (
    <View
      style={[
        styles.canvas,
        {
          backgroundColor: isDark ? palette.gray[800] : palette.gray[100],
        },
      ]}
    >
      {/* 1. Floorplan background image (optional) */}
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="contain"
        />
      ) : null}

      {/* 2. Semantic objects (shelves / aisles / zones) */}
      {(floorplan?.semanticObjects ?? []).map((obj) => {
        const left = Math.max(0, Math.min(MAP_WIDTH, obj.xMin));
        const top = Math.max(0, Math.min(MAP_HEIGHT, obj.yMin));
        const width = Math.max(
          0,
          Math.min(MAP_WIDTH - left, obj.xMax - obj.xMin),
        );
        const height = Math.max(
          0,
          Math.min(MAP_HEIGHT - top, obj.yMax - obj.yMin),
        );
        if (width <= 0 || height <= 0) return null;
        return (
          <View
            key={`so-${obj.objectId ?? `${obj.xMin}-${obj.yMin}-${obj.label ?? ""}`}`}
            style={[
              styles.semanticRect,
              { left, top, width, height },
            ]}
          >
            {obj.label ? (
              <View style={styles.semanticLabel}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.semanticLabelText,
                    { color: isDark ? palette.gray[100] : palette.gray[800] },
                  ]}
                >
                  {obj.label}
                </Text>
              </View>
            ) : null}
          </View>
        );
      })}

      {/* 3. Edges (lines between nodes) */}
      {(floorplan?.edges ?? []).map((edge) => {
        const from = nodesById.get(edge.fromNodeId);
        const to = nodesById.get(edge.toNodeId);
        if (!from || !to) return null;
        const x1 = clamp(from.xCoord, 0, MAP_WIDTH);
        const y1 = clamp(from.yCoord, 0, MAP_HEIGHT);
        const x2 = clamp(to.xCoord, 0, MAP_WIDTH);
        const y2 = clamp(to.yCoord, 0, MAP_HEIGHT);
        return (
          <EdgeLine
            key={`edge-${edge.edgeId ?? `${edge.fromNodeId}-${edge.toNodeId}`}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            isDark={isDark}
          />
        );
      })}

      {/* 4. Nodes (circles; red if blocked) */}
      {(floorplan?.nodes ?? []).map((node) => {
        const left = clamp(node.xCoord, 0, MAP_WIDTH);
        const top = clamp(node.yCoord, 0, MAP_HEIGHT);
        return (
          <View
            key={`node-${node.nodeId ?? `${node.xCoord}-${node.yCoord}`}`}
            style={[
              styles.nodeWrap,
              { left, top },
              node.isBlocked ? styles.nodeWrapBlocked : null,
            ]}
          >
            <View
              style={[
                styles.node,
                {
                  backgroundColor: node.isBlocked
                    ? palette.red[500]
                    : isDark
                      ? palette.gray[100]
                      : palette.gray[700],
                  borderColor: isDark ? palette.gray[950] : "#ffffff",
                },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

interface EdgeLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isDark: boolean;
}

/**
 * Draws a single straight line from (x1,y1) to (x2,y2) using a thin View
 * rotated to the correct angle. RN has no native <line> primitive, so we
 * position + rotate a 1px-wide rectangle. Length is `distance()`; the
 * rectangle's anchor is its centre so translateX/Y offset half-length.
 */
function EdgeLine({ x1, y1, x2, y2, isDark }: EdgeLineProps) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) return null;
  const angle = Math.atan2(dy, dx);

  // Anchor: rotate around the centre, then translate so the line's
  // left-centre starts at (x1, y1).
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: cx,
        top: cy,
        width: length,
        height: 1.5,
        marginLeft: -length / 2,
        marginTop: -0.75,
        backgroundColor: isDark
          ? "rgba(255,255,255,0.28)"
          : "rgba(0,0,0,0.28)",
        transform: [{ rotate: `${angle}rad` }],
      }}
    />
  );
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

const styles = StyleSheet.create({
  canvas: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    overflow: "hidden",
  },

  image: {
    position: "absolute",
    left: 0,
    top: 0,
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    opacity: 0.85,
  },

  /* Semantic-object rectangle (shelf / zone / aisle). */
  semanticRect: {
    position: "absolute",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.55)",
    backgroundColor: "rgba(124,58,237,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  semanticLabel: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "rgba(124,58,237,0.85)",
  },
  semanticLabelText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.3,
    color: "#ffffff",
  },

  /* Edge lines drawn via the rotated-View trick above (no extra styles). */

  /* Navigation nodes. */
  nodeWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateX: -8 }, { translateY: -8 }],
  },
  nodeWrapBlocked: {
    transform: [{ translateX: -8 }, { translateY: -8 }, { scale: 1.25 }],
  },
  node: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
});