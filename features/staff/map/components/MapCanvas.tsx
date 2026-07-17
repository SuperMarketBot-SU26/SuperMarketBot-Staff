/**
 * MapCanvas — pure SVG canvas that renders the full store map.
 *
 * All drawing happens on the UI thread via react-native-svg.
 *
 * z-order (back → front):
 *   1. Floorplan background (image or 1m grid placeholder)
 *   2. Semantic object rectangles (shelves / aisles / zones)
 *   3. Navigation edges (graph lines)
 *   4. Navigation nodes (circles)
 *   5. Robot markers (pins with status ring + direction arrow)
 *
 * Tap-to-zoom was removed: robots can only be focused via tap, which
 * zooms the camera (handled by the parent MapScreen) and dims the
 * other robots in the canvas. Robot pin taps are intercepted by
 * `Pressable` wrappers rather than a Skia gesture tree, so they coexist
 * with the parent `GestureDetector` (pan + pinch).
 */
import { useMemo } from "react";
import Svg, {
  Circle,
  G,
  Image as SvgImage,
  Line,
  Path,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import type { NumberProp } from "react-native-svg";
import type { NormalizedRobot } from "@/shared/api";
import type { MapFloorplanDto } from "@/shared/api/types";
import { ROBOT_LOGO_SIZE } from "@/features/staff/map/lib/map";
import {
  ROBOT_ARROW_HALF_H,
  ROBOT_ARROW_HALF_W,
  ROBOT_ARROW_OFFSET,
  ROBOT_LOGO_HALF,
  ROBOT_RING_R,
  type MapProjection,
  projectRobot,
  statusHexFor,
} from "../lib/map";

/* ─── Floorplan background ──────────────────────────────────────── */

function FloorplanLayer({
  floorplan,
  projection,
}: {
  floorplan: MapFloorplanDto | null;
  projection: MapProjection;
}) {
  const { widthPx, heightPx, widthMeters, heightMeters, pxPerMeter } = projection;

  const verticals = useMemo(() => {
    const lines: { x: number; major: boolean }[] = [];
    for (let x = 0; x <= widthMeters; x += 1) {
      lines.push({ x: x * pxPerMeter, major: x % 5 === 0 });
    }
    return lines;
  }, [widthMeters, pxPerMeter]);

  const horizontals = useMemo(() => {
    const lines: { y: number; major: boolean }[] = [];
    for (let y = 0; y <= heightMeters; y += 1) {
      lines.push({ y: y * pxPerMeter, major: y % 5 === 0 });
    }
    return lines;
  }, [heightMeters, pxPerMeter]);

  const imageUri = useMemo(() => {
    const raw = floorplan?.floorplanImageUrl ?? "";
    if (!raw) return null;
    if (/^https?:\/\//i.test(raw)) return raw;
    return raw;
  }, [floorplan?.floorplanImageUrl]);

  if (imageUri) {
    return (
      <SvgImage
        href={{ uri: imageUri }}
        x={0}
        y={0}
        width={widthPx}
        height={heightPx}
        preserveAspectRatio="xMidYMid slice"
      />
    );
  }

  return (
    <>
      {/* Floor background */}
      <Rect x={0} y={0} width={widthPx} height={heightPx} fill="#f0f2f5" />
      {/* Outer wall */}
      <Rect
        x={1}
        y={1}
        width={widthPx - 2}
        height={heightPx - 2}
        fill="none"
        stroke="#374151"
        strokeWidth={3}
      />
      {/* Vertical grid lines */}
      {verticals.map((l, i) => (
        <Line
          key={`v${i}`}
          x1={l.x}
          y1={0}
          x2={l.x}
          y2={heightPx}
          stroke={l.major ? "#9ca3af" : "#e5e7eb"}
          strokeWidth={l.major ? 1 : 0.5}
        />
      ))}
      {/* Horizontal grid lines */}
      {horizontals.map((l, i) => (
        <Line
          key={`h${i}`}
          x1={0}
          y1={l.y}
          x2={widthPx}
          y2={l.y}
          stroke={l.major ? "#9ca3af" : "#e5e7eb"}
          strokeWidth={l.major ? 1 : 0.5}
        />
      ))}
    </>
  );
}

/* ─── Semantic objects ────────────────────────────────────────────── */

function SemanticObjectsLayer({
  objects,
  pxPerMeter,
}: {
  objects: MapFloorplanDto["semanticObjects"];
  pxPerMeter: number;
}) {
  const rects = useMemo(() => {
    if (!objects || objects.length === 0) return [];
    return objects
      .map((o, i) => {
        const xMin = (o.xMin ?? 0) * pxPerMeter;
        const yMin = (o.yMin ?? 0) * pxPerMeter;
        const w = ((o.xMax ?? 0) - (o.xMin ?? 0)) * pxPerMeter;
        const h = ((o.yMax ?? 0) - (o.yMin ?? 0)) * pxPerMeter;
        if (w <= 0 || h <= 0) return null;
        const type = o.objectType ?? "";
        const color =
          type === "shelf"
            ? { fill: "rgba(147,197,253,0.5)", stroke: "#60a5fa" }
            : type === "zone"
              ? { fill: "rgba(167,243,208,0.5)", stroke: "#34d399" }
              : { fill: "rgba(254,215,170,0.5)", stroke: "#fb923c" };
        return { o, xMin, yMin, w, h, color, i, label: o.label ?? "" };
      })
      .filter(Boolean) as {
      o: (typeof objects)[number];
      xMin: number;
      yMin: number;
      w: number;
      h: number;
      color: { fill: string; stroke: string };
      i: number;
      label: string;
    }[];
  }, [objects, pxPerMeter]);

  return (
    <>
      {rects.map(({ o, xMin, yMin, w, h, color, i, label }) => (
        <G key={o.objectId ?? i}>
          {/* Fill */}
          <Rect x={xMin} y={yMin} width={w} height={h} fill={color.fill} rx={4} ry={4} />
          {/* Stroke */}
          <Rect
            x={xMin}
            y={yMin}
            width={w}
            height={h}
            fill="none"
            stroke={color.stroke}
            strokeWidth={1.5}
            rx={4}
            ry={4}
          />
          {/* Label */}
          {label ? (
            <SvgText
              x={xMin + 4}
              y={yMin + h / 2 + 4}
              fill={color.stroke}
              fontSize={Math.max(8, Math.min(11, Math.min(w, h) / (label.length || 1) * 1.8))}
              fontWeight="600"
              fontFamily="System"
            >
              {label}
            </SvgText>
          ) : null}
        </G>
      ))}
    </>
  );
}

/* ─── Navigation graph ─────────────────────────────────────────────── */

function NavigationLayer({
  nodes,
  edges,
  pxPerMeter,
}: {
  nodes: MapFloorplanDto["nodes"];
  edges: MapFloorplanDto["edges"];
  pxPerMeter: number;
}) {
  const nodeById = useMemo(() => {
    const m = new Map<number, (typeof nodes)[number]>();
    nodes?.forEach((n) => {
      if (n.nodeId != null) m.set(n.nodeId, n);
    });
    return m;
  }, [nodes]);

  const nodeRenders = useMemo(() => {
    if (!nodes) return [];
    return nodes.map((n, i) => {
      const x = n.xCoord * pxPerMeter;
      const y = n.yCoord * pxPerMeter;
      const r = n.nodeType === "dock" ? 7 : n.nodeType === "poi" ? 6 : 4.5;
      const blocked = n.isBlocked;
      const nodeName = n.nodeName ?? "";
      return { n, x, y, r, blocked, nodeName, i };
    });
  }, [nodes, pxPerMeter]);

  const edgeRenders = useMemo(() => {
    if (!edges) return [];
    return edges
      .map((e, i) => {
        const a = nodeById.get(e.fromNodeId);
        const b = nodeById.get(e.toNodeId);
        if (!a || !b) return null;
        return {
          x1: a.xCoord * pxPerMeter,
          y1: a.yCoord * pxPerMeter,
          x2: b.xCoord * pxPerMeter,
          y2: b.yCoord * pxPerMeter,
          isBidirectional: e.isBidirectional,
          i,
        };
      })
      .filter(Boolean) as {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      isBidirectional: boolean;
      i: number;
    }[];
  }, [edges, nodeById, pxPerMeter]);

  return (
    <>
      {/* Edges */}
      {edgeRenders.map(({ x1, y1, x2, y2, isBidirectional, i }) => (
        <Line
          key={`e${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#b0b7c3"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      ))}
      {/* Nodes */}
      {nodeRenders.map(({ n, x, y, r, blocked, nodeName, i }) => (
        <G key={n.nodeId ?? `n${i}`}>
          <Circle cx={x} cy={y} r={r + 2} fill={blocked ? "#7f1d1d" : "#1e3a8a"} />
          <Circle cx={x} cy={y} r={r} fill={blocked ? "#ef4444" : "#ffffff"} />
          {nodeName ? (
            <SvgText
              x={x - 20}
              y={y + r + 14}
              fill="#6b7280"
              fontSize={9}
              fontWeight="500"
              fontFamily="System"
            >
              {nodeName}
            </SvgText>
          ) : null}
        </G>
      ))}
    </>
  );
}

/* ─── Robot markers ───────────────────────────────────────────────── */

function RobotMarkerLayer({
  robots,
  projection,
  highlightedCode,
  onRobotPress,
}: {
  robots: NormalizedRobot[];
  projection: MapProjection;
  highlightedCode: string | null;
  onRobotPress?: (code: string) => void;
}) {
  // Robot logo: Metro-resolved asset. Falls back to coloured circle + initials if absent.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const logoSrc = require("@/assets/images/logo.png") as number;

  const renders = useMemo(() => {
    if (!robots || robots.length === 0) return [];
    return robots
      .filter((r) => !!r.position)
      .map((robot) => {
        const { x, y } = projectRobot(robot.position, projection);
        const heading = robot.position!.headingDeg ?? 0;
        const hex = statusHexFor(robot);
        const isHighlighted = highlightedCode === robot.robotCode;
        const isDimmed = highlightedCode !== null && !isHighlighted;
        const R = ROBOT_RING_R;

        // Arrow polygon points in robot-local space (0,0 at centre, -Y = forward).
        const aw = ROBOT_ARROW_HALF_W;
        const ah = ROBOT_ARROW_HALF_H;
        const ao = ROBOT_ARROW_OFFSET;
        // Arrow: tip at (0, -ao), base at (aw, -ao+ah) and (-aw, -ao+ah).
        const arrowPath =
          `M 0,${-ao} ` +
          `L ${aw},${-ao + ah} ` +
          `L ${aw * 0.4},${-ao + ah} ` +
          `L ${aw * 0.4},${-ao + ah + 3} ` +
          `L ${-aw * 0.4},${-ao + ah + 3} ` +
          `L ${-aw * 0.4},${-ao + ah} ` +
          `L ${-aw},${-ao + ah} Z`;

        return { robot, x, y, heading, hex, isHighlighted, isDimmed, R, arrowPath };
      });
  }, [robots, projection, highlightedCode]);

  return (
    <>
      {renders.map(({ robot, x, y, heading, hex, isHighlighted, isDimmed, R, arrowPath }) => (
        <G
          key={robot.robotCode}
          opacity={isDimmed ? 0.18 : 1}
          onPress={onRobotPress ? () => onRobotPress(robot.robotCode) : undefined}
          transform={`translate(${x}, ${y}) rotate(${heading})`}
        >
          {/* Selection ring */}
          <Circle
            cx={0}
            cy={0}
            r={R}
            fill={isHighlighted ? "#22c55e" : "#3b82f6"}
            opacity={isHighlighted ? 0.3 : 0.12}
          />
          {isHighlighted ? (
            <Circle
              cx={0}
              cy={0}
              r={R}
              fill="none"
              stroke="#22c55e"
              strokeWidth={2.5}
            />
          ) : null}

          {/* Logo image — centred at (0,0), falls back to coloured circle + code initials */}
          {logoSrc ? (
            <SvgImage
              x={-ROBOT_LOGO_HALF}
              y={-ROBOT_LOGO_HALF}
              width={ROBOT_LOGO_SIZE}
              height={ROBOT_LOGO_SIZE}
              href={logoSrc}
            />
          ) : (
            <>
              <Circle cx={0} cy={0} r={ROBOT_LOGO_HALF} fill={hex} />
              <SvgText
                x={-ROBOT_LOGO_HALF + 1}
                y={ROBOT_LOGO_HALF / 2 + 3}
                fill="#ffffff"
                fontSize={9}
                fontWeight="bold"
                fontFamily="System"
              >
                {robot.robotCode.slice(0, 2).toUpperCase()}
              </SvgText>
            </>
          )}

          {/* Direction arrow */}
          <Path
            d={arrowPath}
            fill={hex}
            stroke="rgba(255,255,255,0.7)"
            strokeWidth={0.8}
            strokeLinejoin="round"
          />
        </G>
      ))}
    </>
  );
}

/* ─── Main canvas ─────────────────────────────────────────────────── */

interface MapCanvasProps {
  floorplan: MapFloorplanDto | null;
  robots: NormalizedRobot[];
  projection: MapProjection;
  highlightedCode: string | null;
  onRobotPress?: (code: string) => void;
  /**
   * Optional render-size overrides. Defaults to `projection.widthPx ×
   * projection.heightPx`. Pass `"100%"` for either to make the canvas
   * fill its container; pair with `preserveAspectRatio` (default
   * `"xMidYMid meet"`) for letterboxing.
   */
  width?: NumberProp;
  height?: NumberProp;
  preserveAspectRatio?: string;
}

export function MapCanvas({
  floorplan,
  robots,
  projection,
  highlightedCode,
  onRobotPress,
  width,
  height,
  preserveAspectRatio = "xMidYMid meet",
}: MapCanvasProps) {
  const { widthPx, heightPx, pxPerMeter } = projection;
  const renderW = width ?? widthPx;
  const renderH = height ?? heightPx;

  return (
    <Svg
      width={renderW}
      height={renderH}
      viewBox={`0 0 ${widthPx} ${heightPx}`}
      preserveAspectRatio={preserveAspectRatio}
    >
      {/* Layer 1: Floorplan background (image or grid) */}
      <FloorplanLayer floorplan={floorplan} projection={projection} />

      {/* Layer 2: Semantic objects (shelves / aisles / zones) */}
      <SemanticObjectsLayer
        objects={floorplan?.semanticObjects ?? []}
        pxPerMeter={pxPerMeter}
      />

      {/* Layer 3: Navigation graph (nodes + edges) */}
      <NavigationLayer
        nodes={floorplan?.nodes ?? []}
        edges={floorplan?.edges ?? []}
        pxPerMeter={pxPerMeter}
      />

      {/* Layer 4: Robot markers — dimmed except the highlighted one */}
      <RobotMarkerLayer
        robots={robots}
        projection={projection}
        highlightedCode={highlightedCode}
        onRobotPress={onRobotPress}
      />
    </Svg>
  );
}
