import React from "react";
import Svg, { Path, Circle, Rect, Line, Polyline, Polygon, G, Ellipse } from "react-native-svg";
import { useIsDark } from "@/constants/theme";
import { palette } from "@/constants/theme";

interface IconProps {
  size?: number;
  color?: string;
}

/* ─── Map / Bản Đồ ──────────────────────────────────────────────────── */
export function MapIcon({ size = 20, color }: IconProps) {
  const c = color ?? palette.gray[500];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polygon points="3,6 3,22 9,18 15,22 21,18 21,2 15,6 9,2" stroke={c} strokeWidth="2" strokeLinejoin="round" />
      <Line x1="9" y1="2" x2="9" y2="18" stroke={c} strokeWidth="2" />
      <Line x1="15" y1="6" x2="15" y2="22" stroke={c} strokeWidth="2" />
    </Svg>
  );
}

/* ─── Bot / Robot ────────────────────────────────────────────────────── */
export function BotIcon({ size = 20, color }: IconProps) {
  const c = color ?? palette.gray[500];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="11" width="18" height="10" rx="2" stroke={c} strokeWidth="2" />
      <Circle cx="8.5" cy="16" r="1.5" fill={c} />
      <Circle cx="15.5" cy="16" r="1.5" fill={c} />
      <Path d="M7 3 L7 8 M17 3 L17 8" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Path d="M12 3 L12 8" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Path d="M9 8 Q9 2 12 2 Q15 2 15 8" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="12" cy="5" r="1" fill={c} />
    </Svg>
  );
}

/* ─── Battery ────────────────────────────────────────────────────────── */
export function BatteryIcon({ size = 20, color }: IconProps) {
  const c = color ?? palette.gray[500];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="7" width="18" height="10" rx="2" stroke={c} strokeWidth="2" />
      <Path d="M22 11 L22 13 L22 11 Z" fill={c} />
      <Line x1="6" y1="12" x2="10" y2="12" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

/* ─── Wifi ───────────────────────────────────────────────────────────── */
export function WifiIcon({ size = 20, color }: IconProps) {
  const c = color ?? palette.gray[500];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 13 Q12 6 19 13" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Path d="M8 16 Q12 11 16 16" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="12" cy="19" r="2" fill={c} />
    </Svg>
  );
}

/* ─── Layers ────────────────────────────────────────────────────────── */
export function LayersIcon({ size = 20, color }: IconProps) {
  const c = color ?? palette.gray[500];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polygon points="12,2 2,7 12,12 22,7" stroke={c} strokeWidth="2" strokeLinejoin="round" />
      <Polygon points="2,12 12,17 22,12" stroke={c} strokeWidth="2" strokeLinejoin="round" />
      <Polygon points="2,17 12,22 22,17" stroke={c} strokeWidth="2" strokeLinejoin="round" />
    </Svg>
  );
}

/* ─── Package / Tồn Kho ──────────────────────────────────────────────── */
export function PackageIcon({ size = 20, color }: IconProps) {
  const c = color ?? palette.gray[500];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="16.5" y1="9" x2="4.5" y2="9" stroke={c} strokeWidth="2" />
      <Line x1="16.5" y1="15" x2="4.5" y2="15" stroke={c} strokeWidth="2" />
      <Path d="M12 2 L12 9 M8 2 L8 9 M16 2 L16 9" stroke={c} strokeWidth="2" />
      <Path d="M20 9 L20 20 Q20 22 18 22 L6 22 Q4 22 4 20 L4 9" stroke={c} strokeWidth="2" />
    </Svg>
  );
}

/* ─── Tag / Khuyến Mãi ────────────────────────────────────────────────── */
export function TagIcon({ size = 20, color }: IconProps) {
  const c = color ?? palette.gray[500];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2 L4 10 L4 20 L14 20 L20 14 Z" stroke={c} strokeWidth="2" strokeLinejoin="round" />
      <Circle cx="8" cy="8" r="1.5" fill={c} />
    </Svg>
  );
}

/* ─── AlertTriangle / Cảnh Báo ──────────────────────────────────────── */
export function AlertIcon({ size = 20, color }: IconProps) {
  const c = color ?? palette.gray[500];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M10.29 3.86 L1.82 18 Q1.64 18.44 1.96 18.73 Q2.28 19.02 2.73 18.99 L21.26 18.16 Q21.71 18.12 21.91 17.78 Q22.11 17.44 21.92 17 L13.71 3.12 Q13.5 2.72 13.1 2.64 Q12.7 2.56 12.33 2.75 Z" stroke={c} strokeWidth="2" strokeLinejoin="round" />
      <Line x1="12" y1="9" x2="12" y2="13" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="12" cy="17" r="1" fill={c} />
    </Svg>
  );
}

/* ─── ChevronLeft ─────────────────────────────────────────────────────── */
export function ChevronLeftIcon({ size = 20, color }: IconProps) {
  const c = color ?? palette.gray[500];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="15,18 9,12 15,6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/* ─── ChevronRight ───────────────────────────────────────────────────── */
export function ChevronRightIcon({ size = 20, color }: IconProps) {
  const c = color ?? palette.gray[500];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="9,18 15,12 9,6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/* ─── ChevronDown ────────────────────────────────────────────────────── */
export function ChevronDownIcon({ size = 20, color }: IconProps) {
  const c = color ?? palette.gray[500];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="6,9 12,15 18,9" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/* ─── ChevronUp ─────────────────────────────────────────────────────── */
export function ChevronUpIcon({ size = 20, color }: IconProps) {
  const c = color ?? palette.gray[500];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="18,15 12,9 6,15" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/* ─── Menu / Hamburger ───────────────────────────────────────────────── */
export function MenuIcon({ size = 20, color }: IconProps) {
  const c = color ?? palette.gray[500];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="3" y1="6" x2="21" y2="6" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Line x1="3" y1="12" x2="21" y2="12" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Line x1="3" y1="18" x2="21" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

/* ─── X / Close ──────────────────────────────────────────────────────── */
export function XIcon({ size = 20, color }: IconProps) {
  const c = color ?? palette.gray[500];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="18" y1="6" x2="6" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Line x1="6" y1="6" x2="18" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

/* ─── Sun ─────────────────────────────────────────────────────────────── */
export function SunIcon({ size = 20, color }: IconProps) {
  const c = color ?? palette.gray[500];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="4" stroke={c} strokeWidth="2" />
      <Line x1="12" y1="2" x2="12" y2="4" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Line x1="12" y1="20" x2="12" y2="22" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Line x1="2" y1="12" x2="4" y2="12" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Line x1="20" y1="12" x2="22" y2="12" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

/* ─── Moon ─────────────────────────────────────────────────────────────── */
export function MoonIcon({ size = 20, color }: IconProps) {
  const c = color ?? palette.gray[500];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.79 A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79 Z" stroke={c} strokeWidth="2" strokeLinejoin="round" />
    </Svg>
  );
}

/* ─── ShoppingBag ─────────────────────────────────────────────────────── */
export function ShoppingBagIcon({ size = 20, color }: IconProps) {
  const c = color ?? palette.gray[500];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 2 L3 6 L3 20 Q3 22 5 22 L19 22 Q21 22 21 20 L21 6 L18 2" stroke={c} strokeWidth="2" strokeLinejoin="round" />
      <Line x1="3" y1="6" x2="21" y2="6" stroke={c} strokeWidth="2" />
      <Path d="M16 10 Q16 14 12 14 Q8 14 8 10" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

/* ─── Navigation ─────────────────────────────────────────────────────── */
export function NavigationIcon({ size = 20, color }: IconProps) {
  const c = color ?? palette.gray[500];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polygon points="3,11 22,2 13,21 11,13" stroke={c} strokeWidth="2" strokeLinejoin="round" />
    </Svg>
  );
}

/* ─── Truck ───────────────────────────────────────────────────────────── */
export function TruckIcon({ size = 20, color }: IconProps) {
  const c = color ?? palette.gray[500];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M1 3 L15 3 L15 13 L22 13 L22 18 L15 18 L15 13" stroke={c} strokeWidth="2" strokeLinejoin="round" />
      <Circle cx="6" cy="18" r="2" stroke={c} strokeWidth="2" />
      <Circle cx="18" cy="18" r="2" stroke={c} strokeWidth="2" />
    </Svg>
  );
}

/* ─── CheckCircle ─────────────────────────────────────────────────────── */
export function CheckCircleIcon({ size = 20, color }: IconProps) {
  const c = color ?? palette.gray[500];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={c} strokeWidth="2" />
      <Polyline points="9,12 11,14 15,10" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/* ─── Clock ───────────────────────────────────────────────────────────── */
export function ClockIcon({ size = 20, color }: IconProps) {
  const c = color ?? palette.gray[500];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={c} strokeWidth="2" />
      <Polyline points="12,7 12,12 15,15" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/* ─── MapPin ─────────────────────────────────────────────────────────── */
export function MapPinIcon({ size = 20, color }: IconProps) {
  const c = color ?? palette.gray[500];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 10 Q21 3 12 3 Q3 3 3 10 Q3 17 12 22 Q21 17 21 10 Z" stroke={c} strokeWidth="2" strokeLinejoin="round" />
      <Circle cx="12" cy="10" r="3" stroke={c} strokeWidth="2" />
    </Svg>
  );
}

/* ─── Gamepad / Control ──────────────────────────────────────────────── */
export function GamepadIcon({ size = 20, color }: IconProps) {
  const c = color ?? palette.gray[500];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="6" width="20" height="12" rx="3" stroke={c} strokeWidth="2" />
      <Line x1="6" y1="10" x2="10" y2="10" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Line x1="8" y1="8" x2="8" y2="12" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="16" cy="12" r="1.5" fill={c} />
      <Circle cx="19" cy="10" r="1.5" fill={c} />
    </Svg>
  );
}

/* ─── Settings / Cogs ────────────────────────────────────────────────── */
export function SettingsIcon({ size = 20, color }: IconProps) {
  const c = color ?? palette.gray[500];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={c} strokeWidth="2" />
      <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={c} strokeWidth="2" />
    </Svg>
  );
}

/* ─── Plus ────────────────────────────────────────────────────────────── */
export function PlusIcon({ size = 20, color }: IconProps) {
  const c = color ?? palette.gray[500];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="12" y1="5" x2="12" y2="19" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Line x1="5" y1="12" x2="19" y2="12" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

/* ─── Refresh ─────────────────────────────────────────────────────────── */
export function RefreshIcon({ size = 20, color }: IconProps) {
  const c = color ?? palette.gray[500];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="23,4 23,10 17,10" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
