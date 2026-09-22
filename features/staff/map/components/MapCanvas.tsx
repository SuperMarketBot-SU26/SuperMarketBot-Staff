/**
 * MapCanvas — Modern Supermarket Floorplan & Realtime Robot Telemetry Canvas.
 *
 * 3m x 3m Supermarket Layout (REAL ARENA - updated from physical photos):
 * - Tường trên: Kệ 2 (A01, trái) & Kệ 3 (B01, phải)
 * - Tường trái giữa: Kệ 4 (B01) | Tường phải giữa: Kệ 1 (A01)
 * - Đáy: Quầy Thu Ngân (TN, góc trái) | Kệ 6 (C01, giữa dọc) | Kệ 5 (C01, góc phải)
 * - Dock Sạc: Dọc tường trái, ngay trên Quầy Thu Ngân
 * - Cửa vào: Cạnh đáy giữa TN và Kệ 6
 * - Thảm trung tâm: Khu vực lưu thông trung tâm (tái hiện thảm xanh thực tế)
 * - Realtime Robot Telemetry (RB0001) with Directional Heading Radar Cone & Battery
 *
 * NOTE: Scaled to SCALE = 1000 (3000 x 3000 SVG units) to ensure Android
 * Skia / HarfBuzz font engine calculates textAnchor="middle" with 100% precision.
 * Path lines & nav node dots are hidden per user request for clean map view.
 */
import React from "react";
import { Platform } from "react-native";
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
  SHELVES_6,
  type StoreShelf,
} from "../lib/storeLayout";
import {
  type MapProjection,
} from "../lib/map";
import type { NormalizedRobot, AisleDensityDto, ShelfDensityDto } from "@/shared/api";
import { useIsDark } from "@/shared/theme";

const SCALE = 1000;
const s = (v: number) => Math.round(v * SCALE);

interface MapCanvasProps {
  robots: NormalizedRobot[];
  densities?: AisleDensityDto[];
  shelfDensities?: ShelfDensityDto[];
  projection?: MapProjection;
  highlightedCode?: string | null;
  selectedZoneId?: string | null;
  onRobotPress?: (code: string) => void;
  onShelfPress?: (shelf: StoreShelf) => void;
  onZonePress?: (zone: any) => void;
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
  onZonePress,
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
  const canvasBg = isDark ? "#0f172a" : "#ffffff";
  const floorTileBg = isDark ? "#1e293b" : "#f8faf9";

  const vbX = showDimensions ? -450 : -100;
  const vbY = showDimensions ? -350 : -100;
  const vbW = showDimensions ? 3900 : 3200;
  const vbH = showDimensions ? 3800 : 3300;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      style={{ flex: 1 }}
    >
      {/* ── 0. Canvas Background ── */}
      <Rect x={vbX} y={vbY} width={vbW} height={vbH} fill={canvasBg} />

      {/* ── 1. Supermarket Floor Tile Area (0,0 to 3000,3000) ── */}
      <Rect x={0} y={0} width={3000} height={3000} fill={floorTileBg} rx={40} />

      {/* ── 2. Measurement Grid (0.5m minor, 1.0m major) ── */}
      <G opacity={0.8}>
        {[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0].map((v) => {
          const pos = s(v);
          const isMajor = v % 1 === 0;
          return (
            <G key={`grid-${v}`}>
              <Line
                x1={pos}
                y1={0}
                x2={pos}
                y2={3000}
                stroke={isMajor ? gridMajorColor : gridLineColor}
                strokeWidth={isMajor ? 12 : 6}
                strokeDasharray={isMajor ? undefined : "20, 20"}
              />
              <Line
                x1={0}
                y1={pos}
                x2={3000}
                y2={pos}
                stroke={isMajor ? gridMajorColor : gridLineColor}
                strokeWidth={isMajor ? 12 : 6}
                strokeDasharray={isMajor ? undefined : "20, 20"}
              />
            </G>
          );
        })}
      </G>

      {/* ── 3. Dimensions (3m x 3m Supermarket Layout) ── */}
      {showDimensions && (
        <G>
          {/* Top 3m Dimension */}
          <Line x1={0} y1={-160} x2={3000} y2={-160} stroke={dimColor} strokeWidth={12} />
          <Line x1={0} y1={-220} x2={0} y2={-100} stroke={dimColor} strokeWidth={15} />
          <Line x1={3000} y1={-220} x2={3000} y2={-100} stroke={dimColor} strokeWidth={15} />
          <SvgText x={1500} y={-210} fill={dimColor} fontSize={95} fontWeight="800" textAnchor="middle">
            3.0 m (Lối vào & Dãy kệ)
          </SvgText>

          {/* Left 3m Dimension */}
          <Line x1={-160} y1={0} x2={-160} y2={3000} stroke={dimColor} strokeWidth={12} />
          <Line x1={-220} y1={0} x2={-100} y2={0} stroke={dimColor} strokeWidth={15} />
          <Line x1={-220} y1={3000} x2={-100} y2={3000} stroke={dimColor} strokeWidth={15} />
          <SvgText
            x={-240}
            y={1500}
            fill={dimColor}
            fontSize={95}
            fontWeight="800"
            textAnchor="middle"
            transform="rotate(-90, -240, 1500)"
          >
            3.0 m
          </SvgText>
        </G>
      )}

      {/* ── 5. Outer Boundary Walls & Entrance Door ── */}
      <G>
        <Line x1={0} y1={0} x2={3000} y2={0} stroke={wallStroke} strokeWidth={38} strokeLinecap="round" />
        <Line x1={3000} y1={0} x2={3000} y2={3000} stroke={wallStroke} strokeWidth={38} strokeLinecap="round" />
        <Line x1={0} y1={3000} x2={3000} y2={3000} stroke={wallStroke} strokeWidth={38} strokeLinecap="round" />

        {/* Left wall with entrance door gap */}
        <Line x1={0} y1={0} x2={0} y2={s(DOOR.y)} stroke={wallStroke} strokeWidth={38} strokeLinecap="round" />
        <Line x1={0} y1={s(DOOR.y + DOOR.height)} x2={0} y2={3000} stroke={wallStroke} strokeWidth={38} strokeLinecap="round" />

        {/* Door Entry Marker */}
        <Rect
          x={s(DOOR.x)}
          y={s(DOOR.y)}
          width={s(DOOR.width)}
          height={s(DOOR.height)}
          rx={15}
          fill={isDark ? "rgba(16, 185, 129, 0.15)" : "#ecfdf5"}
          stroke="#10b981"
          strokeWidth={8}
        />
        <SvgText
          x={s(DOOR.x + DOOR.width / 2)}
          y={s(DOOR.y + DOOR.height / 2)}
          fill="#15803d"
          fontSize={38}
          fontWeight="800"
          textAnchor="middle"
          transform={`rotate(-90, ${s(DOOR.x + DOOR.width / 2)}, ${s(DOOR.y + DOOR.height / 2)})`}
        >
          {DOOR.label}
        </SvgText>
      </G>

      {/* ── 6. Cashier Desk ("QUẦY THU NGÂN" - Góc trên bên trái) ── */}
      <G>
        <Rect
          x={s(CASHIER.x)}
          y={s(CASHIER.y)}
          width={s(CASHIER.width)}
          height={s(CASHIER.height)}
          fill={isDark ? "rgba(51, 65, 85, 0.4)" : "rgba(100, 116, 139, 0.12)"}
          stroke={isDark ? "#64748b" : "#475569"}
          strokeWidth={22}
          rx={25}
        />
        {/* Cashier Icon Badge */}
        <Circle
          cx={s(CASHIER.x + CASHIER.width / 2)}
          cy={s(CASHIER.y + CASHIER.height / 2) - 60}
          r={75}
          fill={isDark ? "rgba(255, 255, 255, 0.08)" : "#ffffff"}
          stroke={isDark ? "#64748b" : "#475569"}
          strokeWidth={8}
        />
        <SvgText
          x={s(CASHIER.x + CASHIER.width / 2)}
          y={s(CASHIER.y + CASHIER.height / 2) - 34}
          fontSize={68}
          textAnchor="middle"
        >
          {CASHIER.icon}
        </SvgText>
        <SvgText
          x={s(CASHIER.x + CASHIER.width / 2)}
          y={s(CASHIER.y + CASHIER.height / 2) + 65}
          fill={isDark ? "#cbd5e1" : "#1e293b"}
          fontSize={50}
          fontWeight="900"
          textAnchor="middle"
        >
          THU NGÂN
        </SvgText>
        <SvgText
          x={s(CASHIER.x + CASHIER.width / 2)}
          y={s(CASHIER.y + CASHIER.height / 2) + 120}
          fill="#64748b"
          fontSize={36}
          fontWeight="700"
          textAnchor="middle"
        >
          {CASHIER.subLabel}
        </SvgText>
      </G>

      {/* ── 7. Docking Station / Trạm Sạc Robot (Cạnh trên giữa Thu Ngân & Kệ 1) ── */}
      <G>
        <Circle cx={s(DOCK.x)} cy={s(DOCK.y)} r={s(DOCK.outerRadius)} fill={canvasBg} stroke="#16a34a" strokeWidth={14} />
        <Circle cx={s(DOCK.x)} cy={s(DOCK.y)} r={s(DOCK.innerRadius) + 20} fill="#16a34a" />
        <SvgText
          x={s(DOCK.x)}
          y={s(DOCK.y) + 24}
          fontSize={54}
          textAnchor="middle"
        >
          {DOCK.icon}
        </SvgText>
        <SvgText x={s(DOCK.x)} y={s(DOCK.y) + s(DOCK.outerRadius) + 55} fill="#15803d" fontSize={46} fontWeight="800" textAnchor="middle">
          DOCK SẠC
        </SvgText>
      </G>

      {/* ── 8. THE 6 OFFICIAL SHELVES WITH CATEGORY ICONS ── */}
      {SHELVES_6.map((shelf) => {
        const sData = shelfDensities.find((d) => d.shelfId === shelf.shelfId);
        const density = sData ? Math.round(sData.densityPercentage) : 100;
        const isOos = density < 50 || (sData?.needsRestock ?? false);

        // Density color status
        const statusColor = density >= 70 ? "#16a34a" : density >= 40 ? "#d97706" : "#dc2626";
        const statusBg = density >= 70 ? "rgba(22, 163, 74, 0.18)" : density >= 40 ? "rgba(217, 119, 6, 0.18)" : "rgba(220, 38, 38, 0.22)";

        const shX = s(shelf.x);
        const shY = s(shelf.y);
        const shW = s(shelf.width);
        const shH = s(shelf.height);
        const cX = shX + shW / 2;
        const cY = shY + shH / 2;
        const isHoriz = shelf.width > shelf.height;
        const isRobotHere = robots.some(
          (r) => r.position && Math.hypot(r.position.x - (shelf.x + shelf.width / 2), r.position.y - (shelf.y + shelf.height / 2)) < 0.25
        );

        const isInteractive = Boolean(onShelfPress || onZonePress);
        const handleShelfPress = () => {
          onShelfPress?.(shelf);
          onZonePress?.(shelf);
        };

        // Proportional layout helpers
        const iconR = isHoriz ? Math.min(95, shH * 0.28) : 85;
        const iconCx = isHoriz ? shX + iconR + 35 : cX;
        const rightColX = iconCx + iconR + 25;
        const rightColW = Math.max(100, shX + shW - rightColX - 25);
        const rightColMidX = rightColX + rightColW / 2;

        return (
          <G
            key={`shelf-block-${shelf.shelfId}`}
            {...(isInteractive
              ? Platform.OS === "web"
                ? { onClick: handleShelfPress, style: { cursor: "pointer" } as any }
                : { onPress: handleShelfPress }
              : {})}
          >
            {/* Active robot present beacon halo */}
            {isRobotHere && (
              <Rect
                x={shX - 30}
                y={shY - 30}
                width={shW + 60}
                height={shH + 60}
                rx={40}
                fill="none"
                stroke="#10b981"
                strokeWidth={14}
                strokeDasharray="24, 16"
                opacity={0.9}
              />
            )}

            {/* Low stock pulsing beacon halo */}
            {isOos && (
              <Rect
                x={shX - 25}
                y={shY - 25}
                width={shW + 50}
                height={shH + 50}
                rx={35}
                fill="none"
                stroke="#ef4444"
                strokeWidth={16}
                strokeDasharray="40, 30"
                opacity={0.85}
              />
            )}

            {/* Shelf Box with Aisle Theme */}
            <Rect
              x={shX}
              y={shY}
              width={shW}
              height={shH}
              fill={shelf.themeBg}
              stroke={isOos ? "#dc2626" : shelf.themeColor}
              strokeWidth={isOos ? 28 : 22}
              rx={25}
            />

            {isHoriz ? (
              /* ── Horizontal Shelf Layout (Kệ 1, Kệ 2, Kệ 4, Kệ 5, Kệ 6) ── */
              <G>
                {/* Left Column: Category Icon Badge */}
                <Circle
                  cx={iconCx}
                  cy={cY}
                  r={iconR}
                  fill={isDark ? "rgba(255, 255, 255, 0.08)" : "#ffffff"}
                  stroke={isOos ? "#dc2626" : shelf.themeColor}
                  strokeWidth={8}
                />
                <SvgText
                  x={iconCx}
                  y={cY + 28}
                  fontSize={iconR * 0.9}
                  textAnchor="middle"
                >
                  {shelf.icon}
                </SvgText>

                {/* Right Column: Info Stack */}
                {/* Header Pill: KỆ X · Tag #Y */}
                <Rect
                  x={rightColMidX - Math.min(140, rightColW * 0.46)}
                  y={cY - 120}
                  width={Math.min(280, rightColW * 0.92)}
                  height={62}
                  rx={18}
                  fill={isOos ? "#dc2626" : shelf.themeColor}
                />
                <SvgText
                  x={rightColMidX}
                  y={cY - 75}
                  fill="#ffffff"
                  fontSize={40}
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {`KỆ ${shelf.shelfId} · #${shelf.arucoTag}`}
                </SvgText>

                {/* Category Text */}
                <SvgText
                  x={rightColMidX}
                  y={cY - 6}
                  fill={isDark ? "#f8fafc" : "#0f172a"}
                  fontSize={42}
                  fontWeight="800"
                  textAnchor="middle"
                >
                  {shelf.category}
                </SvgText>

                {/* Live Density Badge */}
                <Rect
                  x={rightColMidX - Math.min(105, rightColW * 0.38)}
                  y={cY + 44}
                  width={Math.min(210, rightColW * 0.76)}
                  height={58}
                  rx={16}
                  fill={statusBg}
                  stroke={statusColor}
                  strokeWidth={6}
                />
                <SvgText
                  x={rightColMidX}
                  y={cY + 88}
                  fill={statusColor}
                  fontSize={38}
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {isOos ? `🚨 ${density}%` : `✓ ${density}%`}
                </SvgText>
              </G>
            ) : (
              /* ── Vertical Shelf Layout (Kệ 3) ── */
              <G>
                {/* Header Pill: KỆ X */}
                <Rect
                  x={cX - 110}
                  y={cY - 325}
                  width={220}
                  height={68}
                  rx={20}
                  fill={isOos ? "#dc2626" : shelf.themeColor}
                />
                <SvgText
                  x={cX}
                  y={cY - 276}
                  fill="#ffffff"
                  fontSize={46}
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {`KỆ ${shelf.shelfId}`}
                </SvgText>

                {/* Center: Category Icon Badge */}
                <Circle
                  cx={cX}
                  cy={cY - 140}
                  r={85}
                  fill={isDark ? "rgba(255, 255, 255, 0.08)" : "#ffffff"}
                  stroke={isOos ? "#dc2626" : shelf.themeColor}
                  strokeWidth={9}
                />
                <SvgText
                  x={cX}
                  y={cY - 110}
                  fontSize={78}
                  textAnchor="middle"
                >
                  {shelf.icon}
                </SvgText>

                {/* Category Text */}
                <SvgText
                  x={cX}
                  y={cY + 28}
                  fill={isDark ? "#f8fafc" : "#0f172a"}
                  fontSize={42}
                  fontWeight="800"
                  textAnchor="middle"
                >
                  {shelf.category}
                </SvgText>

                {/* Tag & Aisle */}
                <SvgText
                  x={cX}
                  y={cY + 88}
                  fill="#64748b"
                  fontSize={34}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {`Dãy ${shelf.aisleCode} · #${shelf.arucoTag}`}
                </SvgText>

                {/* Live Density Badge */}
                <Rect
                  x={cX - 95}
                  y={cY + 148}
                  width={190}
                  height={66}
                  rx={16}
                  fill={statusBg}
                  stroke={statusColor}
                  strokeWidth={6}
                />
                <SvgText
                  x={cX}
                  y={cY + 196}
                  fill={statusColor}
                  fontSize={38}
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {isOos ? `🚨 ${density}%` : `✓ ${density}%`}
                </SvgText>
              </G>
            )}
          </G>
        );
      })}

      {/* ── 9. REALTIME ROBOT TELEMETRY MARKER (RB0001) ── */}
      {robots.map((robot) => {
        if (!robot.position) return null;
        const rx = s(Math.max(0.1, Math.min(2.9, robot.position.x)));
        const ry = s(Math.max(0.1, Math.min(2.9, robot.position.y)));
        const heading = robot.position.headingDeg ?? 0;
        const battery = robot.batteryPct ?? 100;
        const rSize = 85;

        return (
          <G
            key={robot.robotCode}
            {...(onRobotPress
              ? Platform.OS === "web"
                ? { onClick: () => onRobotPress(robot.robotCode), style: { cursor: "pointer" } as any }
                : { onPress: () => onRobotPress(robot.robotCode) }
              : {})}
          >
            {/* Directional Radar Wave Fan */}
            <G transform={`translate(${rx}, ${ry}) rotate(${heading})`}>
              <Path
                d="M 0,0 L -220,-380 A 440,440 0 0,1 220,-380 Z"
                fill="rgba(16, 185, 129, 0.18)"
                stroke="#10b981"
                strokeWidth={8}
                strokeDasharray="20, 20"
              />
            </G>

            {/* Pulsing Ripple Circle */}
            <Circle
              cx={rx}
              cy={ry}
              r={rSize + 40}
              fill="rgba(16, 185, 129, 0.25)"
            />

            {/* Robot Physical Body Puck */}
            <Circle
              cx={rx}
              cy={ry}
              r={rSize}
              fill="#0f172a"
              stroke="#10b981"
              strokeWidth={16}
            />

            {/* Direction pointer triangle inside puck */}
            <G transform={`translate(${rx}, ${ry}) rotate(${heading})`}>
              <Path
                d="M 0,-65 L 38,35 L -38,35 Z"
                fill="#10b981"
              />
            </G>

            {/* Center LED Dot */}
            <Circle cx={rx} cy={ry} r={15} fill="#ffffff" />

            {/* Floating Live Telemetry Label Pill */}
            {showLabels && (
              <G>
                <Rect
                  x={rx - 250}
                  y={ry + rSize + 25}
                  width={500}
                  height={95}
                  rx={35}
                  fill="#0f172a"
                  stroke="#10b981"
                  strokeWidth={12}
                />
                <SvgText
                  x={rx}
                  y={ry + rSize + 90}
                  fill="#ffffff"
                  fontSize={46}
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
