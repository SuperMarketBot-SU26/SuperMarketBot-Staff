/**
 * Hardcoded store layout (2D floorplan) - EXACT from Paint architecture diagram.
 * Map: 3m x 3m
 *
 * Fixed:
 * - Extended bottom main horizontal corridor at y=2.0 continuously from x=1.08 to x=2.45
 *   so the bottom-left corner (1.08, 2.0) of Shelf 4 loop connects seamlessly without gaps.
 *
 * Coordinate system: viewBox 0 0 3 3
 * - Origin (0,0) is TOP-LEFT
 * - x: 0 → 3 (left → right)
 * - y: 0 → 3 (top → bottom)
 */

export interface Zone {
  id: string;
  zoneNumber: number;
  label: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth?: number;
  fontSize?: number;
  description?: string;
  category?: string;
}

export interface NavNode {
  id: string;
  x: number;
  y: number;
  type: "corner" | "stocking" | "dock" | "entry";
  label?: string;
  orientation?: "horizontal" | "vertical";
}

export interface PathSegment {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

export interface LegendItem {
  symbol: string;
  label: string;
  description: string;
  type: "corner" | "stocking" | "dock" | "zone";
}

/* ─── 6 Official Shelves (Tag #1 to #6 across Aisles A01, B01, C01) ─── */
export interface StoreShelf {
  shelfId: number;
  arucoTag: number;
  aisleCode: string;
  name: string;
  category: string;
  x: number;
  y: number;
  width: number;
  height: number;
  themeColor: string;
  themeBg: string;
}

export const SHELVES_6: StoreShelf[] = [
  // ── DÃY A01: Đồ Ăn Vặt & Nước Giải Khát (Xanh dương / Indigo) ──
  {
    shelfId: 1,
    arucoTag: 1,
    aisleCode: "A01",
    name: "Kệ 1 - Đồ Ăn Vặt & Bánh Kẹo",
    category: "Bánh Kẹo & Snack",
    x: 1.8,
    y: 0.04,
    width: 0.75,
    height: 0.38,
    themeColor: "#2563eb",
    themeBg: "rgba(37, 99, 235, 0.12)",
  },
  {
    shelfId: 2,
    arucoTag: 2,
    aisleCode: "A01",
    name: "Kệ 2 - Nước Giải Khát & Đồ Uống",
    category: "Nước Giải Khát",
    x: 2.58,
    y: 0.42,
    width: 0.38,
    height: 0.75,
    themeColor: "#2563eb",
    themeBg: "rgba(37, 99, 235, 0.12)",
  },

  // ── DÃY B01: Thực Phẩm Tươi Sống & Đóng Gói (Xanh lá / Emerald) ──
  {
    shelfId: 4,
    arucoTag: 4,
    aisleCode: "B01",
    name: "Kệ 4 - Mì Ăn Liền & Đóng Gói",
    category: "Mì & Thực Phẩm Khô",
    x: 0.42,
    y: 0.04,
    width: 0.75,
    height: 0.38,
    themeColor: "#16a34a",
    themeBg: "rgba(22, 163, 74, 0.12)",
  },
  {
    shelfId: 3,
    arucoTag: 3,
    aisleCode: "B01",
    name: "Kệ 3 - Thực Phẩm Tươi Sống",
    category: "Thực Phẩm Tươi",
    x: 0.04,
    y: 0.42,
    width: 0.38,
    height: 0.75,
    themeColor: "#16a34a",
    themeBg: "rgba(22, 163, 74, 0.12)",
  },

  // ── DÃY C01: Đồ Gia Dụng & Gia Vị (Cam ấm / Amber) ──
  {
    shelfId: 5,
    arucoTag: 5,
    aisleCode: "C01",
    name: "Kệ 5 - Đồ Gia Dụng & Tiện Ích",
    category: "Đồ Gia Dụng",
    x: 1.3,
    y: 1.05,
    width: 0.4,
    height: 0.85,
    themeColor: "#d97706",
    themeBg: "rgba(217, 119, 6, 0.12)",
  },
  {
    shelfId: 6,
    arucoTag: 6,
    aisleCode: "C01",
    name: "Kệ 6 - Gia Vị & Trà",
    category: "Gia Vị & Trà",
    x: 0.04,
    y: 1.75,
    width: 0.38,
    height: 0.75,
    themeColor: "#d97706",
    themeBg: "rgba(217, 119, 6, 0.12)",
  },
];

// Compatibility ZONES array for any legacy references
export const ZONES: Zone[] = SHELVES_6.map((s) => ({
  id: `shelf-${s.shelfId}`,
  zoneNumber: s.shelfId,
  label: `K${s.shelfId}`,
  name: s.name,
  category: s.category,
  x: s.x,
  y: s.y,
  width: s.width,
  height: s.height,
  fill: s.themeBg,
  stroke: s.themeColor,
  strokeWidth: 0.025,
  fontSize: 0.1,
  description: s.name,
}));

/* ─── Cashier desk ("Thu Ngan") ─── */
export const CASHIER = {
  id: "cashier-counter",
  label: "Thu Ngan",
  x: 1.8,
  y: 2.2,
  width: 1.18,
  height: 0.78,
  fill: "rgba(100, 116, 139, 0.12)",
  stroke: "#475569",
  strokeWidth: 0.025,
  fontSize: 0.1,
};

/* ─── Door (Bottom wall entrance gap) ─── */
export const DOOR = {
  x: 1.15,
  y: 3.0,
  width: 0.45,
  label: "Door",
};

/* ─── Dock / Start Point `○` ─── */
export const DOCK = {
  x: 2.8,
  y: 2.0,
  outerRadius: 0.09,
  innerRadius: 0.045,
  label: "Dock / Start",
};

/* ─── Navigation Nodes ─── */
export const NAV_NODES: NavNode[] = [
  // ── 1. CORNER NODES (`•` Black filled dots) ──
  { id: "c-tleft", x: 0.48, y: 0.48, type: "corner" },
  { id: "c-tright", x: 2.45, y: 0.48, type: "corner" },
  { id: "c-bright", x: 2.45, y: 2.0, type: "corner" },

  // Shelf 4 loop corners
  { id: "c-s4-top-left", x: 1.08, y: 0.85, type: "corner" },
  { id: "c-s4-top-right", x: 1.92, y: 0.85, type: "corner" },
  { id: "c-s4-bot-left", x: 1.08, y: 2.0, type: "corner" },
  { id: "c-s4-bot-right", x: 1.92, y: 2.0, type: "corner" },

  // Zone 3 U-notch corridor corners
  { id: "c-z3-bot-left", x: 0.48, y: 2.5, type: "corner" },
  { id: "c-z3-bot-right", x: 1.28, y: 2.5, type: "corner" },
  { id: "c-z3-step-top", x: 1.28, y: 2.0, type: "corner" },

  // ── 2. STOCKING INTERACTION NODES (Cross-ticks `┿` / `-`) ──
  { id: "s-z2-top", x: 0.8, y: 0.48, type: "stocking", orientation: "horizontal", label: "Node Kệ 2" },
  { id: "s-z2-left", x: 0.48, y: 0.8, type: "stocking", orientation: "vertical", label: "Node Kệ 2" },
  { id: "s-z1-top", x: 2.18, y: 0.48, type: "stocking", orientation: "horizontal", label: "Node Kệ 1" },
  { id: "s-z1-right", x: 2.45, y: 0.8, type: "stocking", orientation: "vertical", label: "Node Kệ 1" },

  // Zone 3 stocking nodes
  { id: "s-z3-left", x: 0.48, y: 2.12, type: "stocking", orientation: "vertical", label: "Node Kệ 3" },
  { id: "s-z3-bot", x: 0.8, y: 2.5, type: "stocking", orientation: "horizontal", label: "Node Kệ 3" },

  // Zone 4 stocking nodes
  { id: "s-z4-left", x: 1.08, y: 1.45, type: "stocking", orientation: "vertical", label: "Node Kệ 4" },
  { id: "s-z4-right", x: 1.92, y: 1.45, type: "stocking", orientation: "vertical", label: "Node Kệ 4" },

  // ── 3. DOCK POINT (`○`) ──
  { id: "n-dock", x: 2.8, y: 2.0, type: "dock", label: "Dock" },
];

/* ─── Path Line Segments ─── */
export const PATH_SEGMENTS: PathSegment[] = [
  // Door entrance path
  { from: { x: 0.48, y: 2.98 }, to: { x: 0.48, y: 2.5 } },

  // Left vertical corridor down to Zone 3 bottom-left corner
  { from: { x: 0.48, y: 0.48 }, to: { x: 0.48, y: 2.5 } },

  // Zone 3 bottom horizontal corridor
  { from: { x: 0.48, y: 2.5 }, to: { x: 1.28, y: 2.5 } },

  // Zone 3 vertical step UP to y=2.0
  { from: { x: 1.28, y: 2.5 }, to: { x: 1.28, y: 2.0 } },

  // Bottom main horizontal corridor (continuous from 1.08 through 1.28 to 2.45)
  { from: { x: 1.08, y: 2.0 }, to: { x: 2.45, y: 2.0 } },

  // Top horizontal main corridor
  { from: { x: 0.48, y: 0.48 }, to: { x: 2.45, y: 0.48 } },

  // Right vertical main corridor
  { from: { x: 2.45, y: 0.48 }, to: { x: 2.45, y: 2.0 } },

  // Connection to Dock `○`
  { from: { x: 2.45, y: 2.0 }, to: { x: 2.8, y: 2.0 } },

  // Rectangular loop around Shelf 4
  { from: { x: 1.08, y: 2.0 }, to: { x: 1.08, y: 0.85 } },
  { from: { x: 1.92, y: 2.0 }, to: { x: 1.92, y: 0.85 } },
  { from: { x: 1.08, y: 0.85 }, to: { x: 1.92, y: 0.85 } },
];

/* ─── Map Legend Items ─── */
export const LEGEND_ITEMS: LegendItem[] = [
  {
    symbol: "┿",
    label: "Node / Điểm kệ hàng",
    description: "Vị trí robot dừng tương tác & kê hàng",
    type: "stocking",
  },
  {
    symbol: "•",
    label: "Khúc cua / Ngã rẽ",
    description: "Giao điểm và điểm chuyển hướng di chuyển",
    type: "corner",
  },
  {
    symbol: "○",
    label: "Điểm bắt đầu / dock / checkout",
    description: "Trạm sạc, điểm khởi đầu và kết thúc",
    type: "dock",
  },
  {
    symbol: "1",
    label: "Kệ trong khu vực (4 Zone)",
    description: "Khu vực trưng bày sản phẩm (Zone 1 - 4)",
    type: "zone",
  },
];

export const DEFAULT_WIDTH_METERS = 3;
export const DEFAULT_HEIGHT_METERS = 3;