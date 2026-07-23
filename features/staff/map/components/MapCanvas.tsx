/**
 * MapCanvas — Hardcoded SVG Store Floorplan & Robot Canvas.
 *
 * Implements clean 2D sketch layout with exact Zone 3 path from Paint diagram:
 * - Zone 3 U-notch step path around Shelf 3-left and Shelf 3-bottom
 * - Numbers (1, 2, 3, 4) centered INSIDE shelf boxes via translate(centerX, centerY)
 * - Corner dots (•) represent turns/junctions
 * - Cross-ticks (┿) represent Stocking Nodes
 */
import Svg, {
  Circle,
  G,
  Line,
  Path,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import {
  CASHIER,
  DOCK,
  DOOR,
  NAV_NODES,
  PATH_SEGMENTS,
  ZONES,
} from "../lib/storeLayout";
import {
  type MapProjection,
  projectRobot,
  statusHexFor,
} from "../lib/map";
import type { NormalizedRobot } from "@/shared/api";
import { useIsDark } from "@/shared/theme";

interface MapCanvasProps {
  robots: NormalizedRobot[];
  projection: MapProjection;
  highlightedCode?: string | null;
  selectedZoneId?: string | null;
  onRobotPress?: (code: string) => void;
  onZonePress?: (zone: any) => void;
  showLabels?: boolean;
  showDimensions?: boolean;
  width?: number | string;
  height?: number | string;
}

export function MapCanvas({
  robots,
  projection,
  highlightedCode,
  selectedZoneId,
  onRobotPress,
  onZonePress,
  showLabels = true,
  showDimensions = true,
  width,
  height,
}: MapCanvasProps) {
  const isDark = useIsDark();

  /* Theme Styling */
  const gridLineColor = isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0";
  const gridMajorColor = isDark ? "rgba(255,255,255,0.12)" : "#cbd5e1";
  const wallStroke = isDark ? "#94a3b8" : "#0f172a";
  const dimColor = isDark ? "#94a3b8" : "#475569";
  const pathLineColor = isDark ? "#94a3b8" : "#0f172a";
  const cornerDotFill = isDark ? "#ffffff" : "#000000";
  const canvasBg = isDark ? "#090d16" : "#ffffff";

  const vbX = showDimensions ? -0.4 : -0.1;
  const vbY = showDimensions ? -0.4 : -0.1;
  const vbW = showDimensions ? 3.8 : 3.2;
  const vbH = showDimensions ? 3.9 : 3.3;

  return (
    <Svg
      width={width ?? "100%"}
      height={height ?? "100%"}
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
    >
      {/* ── 0. Background ── */}
      <Rect x={vbX} y={vbY} width={vbW} height={vbH} fill={canvasBg} />

      {/* ── 1. Grid (0.5m minor, 1.0m major) ── */}
      <G opacity={0.75}>
        {[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0].map((v) => (
          <G key={`grid-${v}`}>
            <Line
              x1={v} y1={0} x2={v} y2={3}
              stroke={v % 1 === 0 ? gridMajorColor : gridLineColor}
              strokeWidth={v % 1 === 0 ? 0.012 : 0.006}
              strokeDasharray={v % 1 === 0 ? undefined : "0.02, 0.02"}
            />
            <Line
              x1={0} y1={v} x2={3} y2={v}
              stroke={v % 1 === 0 ? gridMajorColor : gridLineColor}
              strokeWidth={v % 1 === 0 ? 0.012 : 0.006}
              strokeDasharray={v % 1 === 0 ? undefined : "0.02, 0.02"}
            />
          </G>
        ))}
      </G>

      {/* ── 2. Outer Dimension Lines (3 m) ── */}
      {showDimensions && (
        <G>
          {/* Top 3m Dimension */}
          <Line x1={0} y1={-0.18} x2={3} y2={-0.18} stroke={dimColor} strokeWidth={0.012} />
          <Line x1={0} y1={-0.24} x2={0} y2={-0.12} stroke={dimColor} strokeWidth={0.015} />
          <Line x1={3} y1={-0.24} x2={3} y2={-0.12} stroke={dimColor} strokeWidth={0.015} />
          <SvgText x={1.5} y={-0.24} fill={dimColor} fontSize={0.11} fontWeight="700" textAnchor="middle">
            3 m
          </SvgText>

          {/* Left 3m Dimension */}
          <Line x1={-0.18} y1={0} x2={-0.18} y2={3} stroke={dimColor} strokeWidth={0.012} />
          <Line x1={-0.24} y1={0} x2={-0.12} y2={0} stroke={dimColor} strokeWidth={0.015} />
          <Line x1={-0.24} y1={3} x2={-0.12} y2={3} stroke={dimColor} strokeWidth={0.015} />
          <SvgText x={-0.26} y={1.54} fill={dimColor} fontSize={0.11} fontWeight="700" textAnchor="end">
            3 m
          </SvgText>

          {/* Bottom 3m Dimension */}
          <Line x1={0} y1={3.38} x2={3} y2={3.38} stroke={dimColor} strokeWidth={0.012} />
          <Line x1={0} y1={3.3} x2={0} y2={3.46} stroke={dimColor} strokeWidth={0.015} />
          <Line x1={3} y1={3.3} x2={3} y2={3.46} stroke={dimColor} strokeWidth={0.015} />
          <SvgText x={1.5} y={3.54} fill={dimColor} fontSize={0.11} fontWeight="700" textAnchor="middle">
            3 m
          </SvgText>
        </G>
      )}

      {/* ── 3. Outer Walls & Door Entrance ── */}
      <G>
        <Line x1={0} y1={0} x2={3} y2={0} stroke={wallStroke} strokeWidth={0.035} />
        <Line x1={0} y1={0} x2={0} y2={3} stroke={wallStroke} strokeWidth={0.035} />
        <Line x1={3} y1={0} x2={3} y2={3} stroke={wallStroke} strokeWidth={0.035} />

        {/* Bottom wall with entrance door gap */}
        <Line x1={0} y1={3} x2={DOOR.x} y2={3} stroke={wallStroke} strokeWidth={0.035} />
        <Line x1={DOOR.x + DOOR.width} y1={3} x2={3} y2={3} stroke={wallStroke} strokeWidth={0.035} />

        {/* Door swing line & Arrow */}
        <Line x1={DOOR.x} y1={3} x2={DOOR.x + 0.25} y2={2.75} stroke={wallStroke} strokeWidth={0.02} />
        <Line x1={1.375} y1={3.35} x2={1.375} y2={3.05} stroke={wallStroke} strokeWidth={0.018} />
        <Path d="M 1.335,3.12 L 1.375,3.05 L 1.415,3.12" fill="none" stroke={wallStroke} strokeWidth={0.018} />
      </G>

      {/* ── 4. Cashier Counter ("Thu Ngan") ── */}
      <G>
        <Rect
          x={CASHIER.x}
          y={CASHIER.y}
          width={CASHIER.width}
          height={CASHIER.height}
          fill={CASHIER.fill}
          stroke={CASHIER.stroke}
          strokeWidth={CASHIER.strokeWidth}
          rx={0.02}
        />
        <G transform={`translate(${CASHIER.x + CASHIER.width / 2}, ${CASHIER.y + CASHIER.height / 2})`}>
          <SvgText
            x={0}
            y={CASHIER.fontSize * 0.35}
            fill={isDark ? "#e2e8f0" : "#0f172a"}
            fontSize={CASHIER.fontSize}
            fontWeight="800"
            textAnchor="middle"
          >
            {CASHIER.label}
          </SvgText>
        </G>
      </G>

      {/* ── 5. Navigation Paths & Lines ── */}
      <G>
        {PATH_SEGMENTS.map((seg, idx) => (
          <Line
            key={`path-${idx}`}
            x1={seg.from.x}
            y1={seg.from.y}
            x2={seg.to.x}
            y2={seg.to.y}
            stroke={pathLineColor}
            strokeWidth={0.02}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* ── Corner Nodes (`•` Black filled dots) ── */}
        {NAV_NODES.filter((n) => n.type === "corner").map((node) => (
          <Circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={0.045}
            fill={cornerDotFill}
            stroke={isDark ? "#090d16" : "#ffffff"}
            strokeWidth={0.008}
          />
        ))}

        {/* ── Stocking Interaction Nodes (`┿` / Cross-ticks) ── */}
        {NAV_NODES.filter((n) => n.type === "stocking").map((node) => {
          const tickLen = 0.075;
          const isVert = node.orientation === "vertical";
          const x1 = isVert ? node.x - tickLen : node.x;
          const x2 = isVert ? node.x + tickLen : node.x;
          const y1 = isVert ? node.y : node.y - tickLen;
          const y2 = isVert ? node.y : node.y + tickLen;

          return (
            <G key={node.id}>
              {/* Cross-tick line perpendicular to path */}
              <Line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={pathLineColor}
                strokeWidth={0.022}
                strokeLinecap="round"
              />
              {/* Central node dot */}
              <Circle
                cx={node.x}
                cy={node.y}
                r={0.025}
                fill={cornerDotFill}
              />
            </G>
          );
        })}
      </G>

      {/* ── 6. Dock Point (`○` Circle Symbol) ── */}
      <G transform={`translate(${DOCK.x}, ${DOCK.y})`}>
        <Circle
          cx={0}
          cy={0}
          r={DOCK.outerRadius}
          fill={canvasBg}
          stroke={wallStroke}
          strokeWidth={0.022}
        />
      </G>

      {/* ── 7. Zones / Shelves (Numbers 100% centered INSIDE) ── */}
      {ZONES.map((zone) => {
        const isSelected = selectedZoneId === zone.id;
        const centerX = zone.x + zone.width / 2;
        const centerY = zone.y + zone.height / 2;
        const fontSize = zone.fontSize ?? 0.18;

        return (
          <G
            key={zone.id}
            onPress={onZonePress ? () => onZonePress(zone) : undefined}
          >
            {/* Shelf Box */}
            <Rect
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height}
              fill={isSelected ? `${zone.stroke}35` : zone.fill}
              stroke={zone.stroke}
              strokeWidth={isSelected ? (zone.strokeWidth ?? 0.025) * 1.5 : (zone.strokeWidth ?? 0.025)}
              rx={0.02}
            />

            {/* Zone Number Label 100% Centered INSIDE */}
            <G transform={`translate(${centerX}, ${centerY})`}>
              <SvgText
                x={0}
                y={fontSize * 0.35}
                fill={zone.stroke}
                fontSize={fontSize}
                fontWeight="900"
                textAnchor="middle"
              >
                {zone.label}
              </SvgText>
            </G>
          </G>
        );
      })}

      {/* ── 8. Robot Markers ── */}
      {robots.map((robot) => {
        if (!robot.position) return null;
        const { x, y } = projectRobot(robot.position, projection);
        const heading = robot.position.headingDeg ?? 0;
        const hex = statusHexFor(robot);
        const isHighlighted = highlightedCode === robot.robotCode;

        const rSize = 0.075;
        const transform = `translate(${x}, ${y}) rotate(${heading})`;

        return (
          <G
            key={robot.robotCode}
            onPress={onRobotPress ? () => onRobotPress(robot.robotCode) : undefined}
          >
            {/* Pulsing Halo */}
            <Circle
              cx={x}
              cy={y}
              r={rSize + 0.035}
              fill={hex}
              opacity={isHighlighted ? 0.45 : 0.22}
            />

            {/* Robot Body Circle + Direction Arrow */}
            <G transform={transform}>
              <Circle cx={0} cy={0} r={rSize} fill={hex} stroke="#ffffff" strokeWidth={0.012} />
              <Path d="M 0,-0.055 L 0.03,0.02 L -0.03,0.02 Z" fill="#ffffff" />
            </G>

            {/* Robot Code Badge */}
            {showLabels && (
              <G transform={`translate(${x}, ${y + rSize + 0.06})`}>
                <Rect
                  x={-0.16}
                  y={-0.045}
                  width={0.32}
                  height={0.08}
                  fill={isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)"}
                  stroke={hex}
                  strokeWidth={0.008}
                  rx={0.03}
                />
                <SvgText
                  x={0}
                  y={0.018}
                  fill={isDark ? "#ffffff" : "#0f172a"}
                  fontSize={0.05}
                  fontWeight="800"
                  textAnchor="middle"
                >
                  {robot.robotCode}
                </SvgText>
              </G>
            )}
          </G>
        );
      })}
    </Svg>
  );
}
