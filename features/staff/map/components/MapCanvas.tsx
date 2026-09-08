/**
 * MapCanvas — Modern Supermarket Floorplan & Realtime Robot Telemetry Canvas.
 *
 * 3m x 3m Supermarket Layout:
 * - Dãy A01: Kệ 1 (ArUco #1, Bánh kẹo) & Kệ 2 (ArUco #2, Nước giải khát)
 * - Dãy B01: Kệ 3 (ArUco #3, Thực phẩm tươi) & Kệ 4 (ArUco #4, Mì & Khô)
 * - Dãy C01: Kệ 5 (ArUco #5, Gia dụng) & Kệ 6 (ArUco #6, Gia vị & Trà)
 * - Quầy Thu Ngân & Cửa vào
 * - Realtime Robot Telemetry (RB0001) with Directional Heading Radar Cone & Battery
 */
import React from "react";
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
  SHELVES_6,
  type StoreShelf,
} from "../lib/storeLayout";
import {
  type MapProjection,
  projectRobot,
  statusHexFor,
} from "../lib/map";
import type { NormalizedRobot, AisleDensityDto, ShelfDensityDto } from "@/shared/api";
import { useIsDark } from "@/shared/theme";

interface MapCanvasProps {
  robots: NormalizedRobot[];
  densities?: AisleDensityDto[];
  shelfDensities?: ShelfDensityDto[];
  projection: MapProjection;
  highlightedCode?: string | null;
  selectedZoneId?: string | null;
  onRobotPress?: (code: string) => void;
  onShelfPress?: (shelf: StoreShelf) => void;
  showLabels?: boolean;
  showDimensions?: boolean;
  showHeatmap?: boolean;
  width?: number | string;
  height?: number | string;
}

export function MapCanvas({
  robots,
  shelfDensities = [],
  highlightedCode,
  onRobotPress,
  onShelfPress,
  showLabels = true,
  showDimensions = true,
  showHeatmap = false,
  width = "100%",
  height = "100%",
}: MapCanvasProps) {
  const isDark = useIsDark();

  /* Modern Supermarket Architectural Styling */
  const gridLineColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(20,83,45,0.07)";
  const gridMajorColor = isDark ? "rgba(255,255,255,0.14)" : "rgba(20,83,45,0.16)";
  const wallStroke = isDark ? "#38a169" : "#14532d";
  const dimColor = isDark ? "#94a3b8" : "#4a5a52";
  const pathLineColor = isDark ? "#48bb78" : "#16a34a";
  const cornerDotFill = isDark ? "#2f855a" : "#15803d";
  const canvasBg = isDark ? "#0f172a" : "#ffffff";
  const floorTileBg = isDark ? "#1e293b" : "#f8faf9";

  const vbX = showDimensions ? -0.35 : -0.1;
  const vbY = showDimensions ? -0.35 : -0.1;
  const vbW = showDimensions ? 3.7 : 3.2;
  const vbH = showDimensions ? 3.8 : 3.3;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      style={{ flex: 1 }}
    >
      {/* ── 0. Canvas Background ── */}
      <Rect x={vbX} y={vbY} width={vbW} height={vbH} fill={canvasBg} />

      {/* ── 1. Supermarket Floor Tile Area (0,0 to 3,3) ── */}
      <Rect x={0} y={0} width={3} height={3} fill={floorTileBg} rx={0.04} />

      {/* ── 2. Measurement Grid (0.5m minor, 1.0m major) ── */}
      <G opacity={0.8}>
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

      {/* ── 3. Dimensions (3m x 3m Supermarket Layout) ── */}
      {showDimensions && (
        <G>
          {/* Top 3m Dimension */}
          <Line x1={0} y1={-0.16} x2={3} y2={-0.16} stroke={dimColor} strokeWidth={0.012} />
          <Line x1={0} y1={-0.22} x2={0} y2={-0.10} stroke={dimColor} strokeWidth={0.015} />
          <Line x1={3} y1={-0.22} x2={3} y2={-0.10} stroke={dimColor} strokeWidth={0.015} />
          <SvgText x={1.5} y={-0.22} fill={dimColor} fontSize={0.10} fontWeight="800" textAnchor="middle">
            3.0 m (Lối vào & Dãy kệ)
          </SvgText>

          {/* Left 3m Dimension */}
          <Line x1={-0.16} y1={0} x2={-0.16} y2={3} stroke={dimColor} strokeWidth={0.012} />
          <Line x1={-0.22} y1={0} x2={-0.10} y2={0} stroke={dimColor} strokeWidth={0.015} />
          <Line x1={-0.22} y1={3} x2={-0.10} y2={3} stroke={dimColor} strokeWidth={0.015} />
          <SvgText x={-0.24} y={1.54} fill={dimColor} fontSize={0.10} fontWeight="800" textAnchor="end">
            3.0 m
          </SvgText>
        </G>
      )}

      {/* ── 4. Outer Boundary Walls & Entrance Door ── */}
      <G>
        <Line x1={0} y1={0} x2={3} y2={0} stroke={wallStroke} strokeWidth={0.038} strokeLinecap="round" />
        <Line x1={0} y1={0} x2={0} y2={3} stroke={wallStroke} strokeWidth={0.038} strokeLinecap="round" />
        <Line x1={3} y1={0} x2={3} y2={3} stroke={wallStroke} strokeWidth={0.038} strokeLinecap="round" />

        {/* Bottom wall with entrance door gap */}
        <Line x1={0} y1={3} x2={DOOR.x} y2={3} stroke={wallStroke} strokeWidth={0.038} />
        <Line x1={DOOR.x + DOOR.width} y1={3} x2={3} y2={3} stroke={wallStroke} strokeWidth={0.038} />

        {/* Door Entry Marker */}
        <Line x1={DOOR.x} y1={3} x2={DOOR.x + 0.22} y2={2.78} stroke="#16a34a" strokeWidth={0.02} />
        <SvgText x={DOOR.x + 0.22} y={3.15} fill="#15803d" fontSize={0.075} fontWeight="800">
          CỬA VÀO ➔
        </SvgText>
      </G>

      {/* ── 5. Cashier Desk ("THU NGÂN") ── */}
      <G>
        <Rect
          x={CASHIER.x}
          y={CASHIER.y}
          width={CASHIER.width}
          height={CASHIER.height}
          fill={isDark ? "rgba(51, 65, 85, 0.4)" : "rgba(100, 116, 139, 0.12)"}
          stroke={isDark ? "#64748b" : "#475569"}
          strokeWidth={0.022}
          rx={0.03}
        />
        <G transform={`translate(${CASHIER.x + CASHIER.width / 2}, ${CASHIER.y + CASHIER.height / 2})`}>
          <SvgText
            x={0}
            y={-0.03}
            fill={isDark ? "#cbd5e1" : "#1e293b"}
            fontSize={0.085}
            fontWeight="900"
            textAnchor="middle"
          >
            QUẦY THU NGÂN
          </SvgText>
          <SvgText
            x={0}
            y={0.06}
            fill="#64748b"
            fontSize={0.06}
            fontWeight="600"
            textAnchor="middle"
          >
            POS & Checkout
          </SvgText>
        </G>
      </G>

      {/* ── 6. Navigation Waypoint Paths (Corridors) ── */}
      <G>
        {PATH_SEGMENTS.map((seg, idx) => (
          <Line
            key={`path-${idx}`}
            x1={seg.from.x}
            y1={seg.from.y}
            x2={seg.to.x}
            y2={seg.to.y}
            stroke={pathLineColor}
            strokeWidth={0.022}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="0.04, 0.02"
            opacity={0.85}
          />
        ))}

        {/* Corner Nodes */}
        {NAV_NODES.filter((n) => n.type === "corner").map((node) => (
          <Circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={0.038}
            fill={cornerDotFill}
            stroke="#ffffff"
            strokeWidth={0.008}
          />
        ))}

        {/* Stocking Interaction Nodes */}
        {NAV_NODES.filter((n) => n.type === "stocking").map((node) => {
          const tickLen = 0.06;
          const isVert = node.orientation === "vertical";
          return (
            <G key={node.id}>
              <Line
                x1={isVert ? node.x - tickLen : node.x}
                y1={isVert ? node.y : node.y - tickLen}
                x2={isVert ? node.x + tickLen : node.x}
                y2={isVert ? node.y : node.y + tickLen}
                stroke={pathLineColor}
                strokeWidth={0.02}
                strokeLinecap="round"
              />
              <Circle cx={node.x} cy={node.y} r={0.022} fill={cornerDotFill} />
            </G>
          );
        })}
      </G>

      {/* ── 7. Docking Station (`○` Symbol) ── */}
      <G transform={`translate(${DOCK.x}, ${DOCK.y})`}>
        <Circle cx={0} cy={0} r={DOCK.outerRadius} fill={canvasBg} stroke="#16a34a" strokeWidth={0.02} />
        <Circle cx={0} cy={0} r={DOCK.innerRadius} fill="#16a34a" />
        <SvgText x={0} y={0.16} fill="#15803d" fontSize={0.06} fontWeight="800" textAnchor="middle">
          DOCK SẠC
        </SvgText>
      </G>

      {/* ── 8. THE 6 OFFICIAL SHELVES (Clean, High Contrast, No Confusing Numbers) ── */}
      {SHELVES_6.map((shelf) => {
        const sData = shelfDensities.find((d) => d.shelfId === shelf.shelfId);
        const density = sData ? Math.round(sData.densityPercentage) : 45;
        const isOos = density < 50 || (sData?.needsRestock ?? false);

        // Density color status
        const statusColor = density >= 70 ? "#16a34a" : density >= 40 ? "#d97706" : "#dc2626";
        const statusBg = density >= 70 ? "rgba(22, 163, 74, 0.15)" : density >= 40 ? "rgba(217, 119, 6, 0.15)" : "rgba(220, 38, 38, 0.18)";

        const centerX = shelf.x + shelf.width / 2;
        const centerY = shelf.y + shelf.height / 2;
        const isHoriz = shelf.width > shelf.height;

        return (
          <G
            key={`shelf-block-${shelf.shelfId}`}
            onPress={onShelfPress ? () => onShelfPress(shelf) : undefined}
          >
            {/* Low stock pulsing beacon halo */}
            {isOos && (
              <Rect
                x={shelf.x - 0.025}
                y={shelf.y - 0.025}
                width={shelf.width + 0.05}
                height={shelf.height + 0.05}
                rx={0.035}
                fill="none"
                stroke="#ef4444"
                strokeWidth={0.016}
                strokeDasharray="0.04, 0.03"
                opacity={0.85}
              />
            )}

            {/* Shelf Box with Aisle Theme */}
            <Rect
              x={shelf.x}
              y={shelf.y}
              width={shelf.width}
              height={shelf.height}
              fill={shelf.themeBg}
              stroke={isOos ? "#dc2626" : shelf.themeColor}
              strokeWidth={isOos ? 0.028 : 0.022}
              rx={0.025}
            />

            {/* Internal Shelf Content */}
            <G transform={`translate(${centerX}, ${centerY})`}>
              {/* Badge: KỆ 1 (Tag #1) */}
              <Rect
                x={-0.16}
                y={isHoriz ? -0.14 : -0.28}
                width={0.32}
                height={0.11}
                rx={0.03}
                fill={isOos ? "#dc2626" : shelf.themeColor}
              />
              <SvgText
                x={0}
                y={isHoriz ? -0.06 : -0.20}
                fill="#ffffff"
                fontSize={0.065}
                fontWeight="900"
                textAnchor="middle"
              >
                {`KỆ ${shelf.shelfId}`}
              </SvgText>

              {/* Shelf Category Text */}
              <SvgText
                x={0}
                y={isHoriz ? 0.02 : -0.05}
                fill={isDark ? "#ffffff" : "#0f172a"}
                fontSize={0.055}
                fontWeight="800"
                textAnchor="middle"
              >
                {shelf.category}
              </SvgText>

              {/* Aisle Tag & ArUco */}
              <SvgText
                x={0}
                y={isHoriz ? 0.08 : 0.04}
                fill="#64748b"
                fontSize={0.045}
                fontWeight="600"
                textAnchor="middle"
              >
                {`Dãy ${shelf.aisleCode} · Tag #${shelf.arucoTag}`}
              </SvgText>

              {/* Live Density Badge Pill */}
              <Rect
                x={-0.15}
                y={isHoriz ? 0.10 : 0.16}
                width={0.30}
                height={0.09}
                rx={0.025}
                fill={statusBg}
                stroke={statusColor}
                strokeWidth={0.008}
              />
              <SvgText
                x={0}
                y={isHoriz ? 0.165 : 0.225}
                fill={statusColor}
                fontSize={0.055}
                fontWeight="900"
                textAnchor="middle"
              >
                {isOos ? `🚨 ${density}%` : `✓ ${density}%`}
              </SvgText>
            </G>
          </G>
        );
      })}

      {/* ── 9. REALTIME ROBOT TELEMETRY MARKER (RB0001) ── */}
      {robots.map((robot) => {
        if (!robot.position) return null;
        const x = Math.max(0.1, Math.min(2.9, robot.position.x));
        const y = Math.max(0.1, Math.min(2.9, robot.position.y));
        const heading = robot.position.headingDeg ?? 0;
        const battery = robot.batteryPct ?? 100;
        const hex = battery > 50 ? "#10b981" : battery > 20 ? "#f59e0b" : "#ef4444";
        const rSize = 0.085;

        return (
          <G
            key={robot.robotCode}
            onPress={onRobotPress ? () => onRobotPress(robot.robotCode) : undefined}
          >
            {/* Directional Radar Wave Fan */}
            <G transform={`translate(${x}, ${y}) rotate(${heading})`}>
              <Path
                d="M 0,0 L -0.22,-0.38 A 0.44,0.44 0 0,1 0.22,-0.38 Z"
                fill="rgba(16, 185, 129, 0.18)"
                stroke="#10b981"
                strokeWidth={0.008}
                strokeDasharray="0.02, 0.02"
              />
            </G>

            {/* Pulsing Ripple Circle */}
            <Circle
              cx={x}
              cy={y}
              r={rSize + 0.04}
              fill="rgba(16, 185, 129, 0.25)"
            />

            {/* Robot Physical Body Puck */}
            <Circle
              cx={x}
              cy={y}
              r={rSize}
              fill="#0f172a"
              stroke="#10b981"
              strokeWidth={0.016}
            />

            {/* Direction pointer triangle inside puck */}
            <G transform={`translate(${x}, ${y}) rotate(${heading})`}>
              <Path
                d="M 0,-0.065 L 0.038,0.035 L -0.038,0.035 Z"
                fill="#10b981"
              />
            </G>

            {/* Center LED Dot */}
            <Circle cx={x} cy={y} r={0.015} fill="#ffffff" />

            {/* Floating Live Telemetry Label Pill */}
            {showLabels && (
              <G transform={`translate(${x}, ${y + rSize + 0.07})`}>
                <Rect
                  x={-0.24}
                  y={-0.05}
                  width={0.48}
                  height={0.095}
                  rx={0.035}
                  fill="#0f172a"
                  stroke="#10b981"
                  strokeWidth={0.012}
                />
                <SvgText
                  x={0}
                  y={0.016}
                  fill="#ffffff"
                  fontSize={0.052}
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {`🤖 ${robot.robotCode} · 🔋${battery}%`}
                </SvgText>
              </G>
            )}
          </G>
        );
      })}
    </Svg>
  );
}
