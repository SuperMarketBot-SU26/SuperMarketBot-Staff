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
  icon?: string;
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
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  themeColor: string;
  themeBg: string;
}

export const SHELVES_6: StoreShelf[] = [
  // ── DÃY A01: Bánh Kẹo & Nước Giải Khát (Xanh dương / Indigo) ──
  {
    shelfId: 1,
    arucoTag: 1,
    aisleCode: "A01",
    name: "Kệ 1 - Đồ Ăn Vặt & Bánh Kẹo",
    category: "Bánh Kẹo",
    icon: "🍪",
    x: 0.08,
    y: 0.85,
    width: 0.38,
    height: 0.85,
    themeColor: "#2563eb",
    themeBg: "rgba(37, 99, 235, 0.12)",
  },
  {
    shelfId: 2,
    arucoTag: 2,
    aisleCode: "A01",
    name: "Kệ 2 - Nước Giải Khát & Đồ Uống",
    category: "Giải Khát",
    icon: "🥤",
    x: 0.45,
    y: 0.08,
    width: 0.85,
    height: 0.38,
    themeColor: "#2563eb",
    themeBg: "rgba(37, 99, 235, 0.12)",
  },

  // ── DÃY B01: Thực Phẩm Tươi Sống & Mì Ăn Liền (Xanh lá / Emerald) ──
  {
    shelfId: 3,
    arucoTag: 3,
    aisleCode: "B01",
    name: "Kệ 3 - Thực Phẩm Tươi Sống",
    category: "Tươi Sống",
    icon: "🥩",
    x: 1.70,
    y: 0.08,
    width: 0.85,
    height: 0.38,
    themeColor: "#16a34a",
    themeBg: "rgba(22, 163, 74, 0.12)",
  },
  {
    shelfId: 4,
    arucoTag: 4,
    aisleCode: "B01",
    name: "Kệ 4 - Mì Ăn Liền & Đóng Gói",
    category: "Mì & Khô",
    icon: "🍜",
    x: 2.54,
    y: 0.85,
    width: 0.38,
    height: 0.85,
    themeColor: "#16a34a",
    themeBg: "rgba(22, 163, 74, 0.12)",
  },

  // ── DÃY C01: Đồ Gia Dụng & Gia Vị (Cam ấm / Amber) ──
  {
    shelfId: 5,
    arucoTag: 5,
    aisleCode: "C01",
    name: "Kệ 5 - Đồ Gia Dụng & Tiện Ích",
    category: "Gia Dụng",
    icon: "🧴",
    x: 2.47,
    y: 1.90,
    width: 0.45,
    height: 0.95,
    themeColor: "#d97706",
    themeBg: "rgba(217, 119, 6, 0.12)",
  },
  {
    shelfId: 6,
    arucoTag: 6,
    aisleCode: "C01",
    name: "Kệ 6 - Gia Vị & Trà",
    category: "Gia Vị",
    icon: "🧂",
    x: 1.35,
    y: 1.95,
    width: 0.38,
    height: 0.95,
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
  icon: s.icon,
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

/* ─── Cashier desk ("Thu Ngân" - Góc dưới trái) ─── */
export const CASHIER = {
  id: "cashier-counter",
  label: "Thu Ngân",
  icon: "💳",
  x: 0.08,
  y: 2.30,
  width: 0.60,
  height: 0.58,
  fill: "rgba(100, 116, 139, 0.12)",
  stroke: "#475569",
  strokeWidth: 0.025,
  fontSize: 0.1,
};

/* ─── Door (Cửa vào - Cạnh dưới giữa Thu Ngân & Kệ 6) ─── */
export const DOOR = {
  x: 0.80,
  y: 3.0,
  width: 0.45,
  label: "Cửa vào",
};

/* ─── Dock / Trạm sạc Robot (sát phía trên quầy thu ngân) ─── */
export const DOCK = {
  x: 0.27,
  y: 2.09,
  outerRadius: 0.09,
  innerRadius: 0.045,
  label: "Dock Sạc",
  icon: "⚡",
};

/* ─── Thảm trung tâm (Central Playmat Area) ─── */
export const CENTRAL_MAT = {
  x: 0.55,
  y: 0.58,
  width: 1.90,
  height: 1.30,
};

/* ─── 8 Official Supermarket Nodes (Khớp 100% database dbo.NAVIGATION_NODE) ─── */
export interface SupermarketNode {
  nodeId: number;
  name: string;
  shelfId?: number;
  role: string;
  // Tọa độ ROS thực tế từ database dbo.NAVIGATION_NODE
  rosX: number;
  rosY: number;
  // Tọa độ 2D trên sơ đồ SVG 3m x 3m (mét)
  mapX: number;
  mapY: number;
  headingDeg: number;
}

export const SUPERMARKET_NODES: Record<number, SupermarketNode> = {
  1: {
    nodeId: 1,
    name: "Kệ 1 - Bánh kẹo & Snack",
    shelfId: 1,
    role: "shelf",
    rosX: 1.5741,
    rosY: 0.0809,
    mapX: 0.27,
    mapY: 1.28,
    headingDeg: 90,
  },
  2: {
    nodeId: 2,
    name: "Kệ 2 - Nước giải khát",
    shelfId: 2,
    role: "shelf",
    rosX: 2.1035,
    rosY: -0.2687,
    mapX: 0.88,
    mapY: 0.27,
    headingDeg: 180,
  },
  3: {
    nodeId: 3,
    name: "Kệ 3 - Thực phẩm tươi sống",
    shelfId: 3,
    role: "shelf",
    rosX: 1.8738,
    rosY: -1.5971,
    mapX: 2.13,
    mapY: 0.27,
    headingDeg: 180,
  },
  4: {
    nodeId: 4,
    name: "Kệ 4 - Mì ăn liền & Đóng gói",
    shelfId: 4,
    role: "shelf",
    rosX: 1.3943,
    rosY: -1.747,
    mapX: 2.73,
    mapY: 1.28,
    headingDeg: 270,
  },
  5: {
    nodeId: 5,
    name: "Kệ 5 - Đồ gia dụng & Tiện ích",
    shelfId: 5,
    role: "shelf",
    rosX: 0.0558,
    rosY: -1.5472,
    mapX: 2.70,
    mapY: 2.38,
    headingDeg: 270,
  },
  6: {
    nodeId: 6,
    name: "Kệ 6 - Gia vị & Trà",
    shelfId: 6,
    role: "shelf",
    rosX: 0.0858,
    rosY: -1.1976,
    mapX: 1.54,
    mapY: 2.43,
    headingDeg: 90,
  },
  7: {
    nodeId: 7,
    name: "Quầy Thu Ngân (TN)",
    role: "cashier",
    rosX: 0.2257,
    rosY: 0.0809,
    mapX: 0.38,
    mapY: 2.59,
    headingDeg: 0,
  },
  8: {
    nodeId: 8,
    name: "Trạm Sạc Robot (Dock)",
    role: "dock",
    rosX: 0.8949,
    rosY: 0.4006,
    mapX: 0.27,
    mapY: 2.09,
    headingDeg: 90,
  },
};

export interface RobotPositionState {
  nodeId?: number | null;
  nodeName?: string;
  x: number;
  y: number;
  headingDeg?: number;
}

export function resolveRobotNodePosition(
  payload: any,
  prevPosition?: RobotPositionState
): {
  nodeId: number;
  nodeName: string;
  x: number;
  y: number;
  headingDeg: number;
} {
  if (!payload || typeof payload !== 'object') {
    if (prevPosition && Number.isFinite(prevPosition.x) && Number.isFinite(prevPosition.y)) {
      return {
        nodeId: prevPosition.nodeId ?? 8,
        nodeName: prevPosition.nodeName ?? SUPERMARKET_NODES[8].name,
        x: prevPosition.x,
        y: prevPosition.y,
        headingDeg: prevPosition.headingDeg ?? 90,
      };
    }
    const def = SUPERMARKET_NODES[8];
    return { nodeId: 8, nodeName: def.name, x: def.mapX, y: def.mapY, headingDeg: def.headingDeg };
  }

  // 1. Ưu tiên cao nhất: Trường nodeId / currentNodeId / waypointId từ MQTT/SignalR (hỗ trợ camelCase, PascalCase, snake_case)
  const rawNodeId =
    payload.nodeId ??
    payload.NodeId ??
    payload.currentNodeId ??
    payload.CurrentNodeId ??
    payload.current_node_id ??
    payload.targetNodeId ??
    payload.TargetNodeId ??
    payload.target_node_id ??
    payload.waypointId ??
    payload.WaypointId ??
    payload.node ??
    payload.Node ??
    payload.shelfId ??
    payload.ShelfId;

  const explicitNodeId = Number(rawNodeId);
  if (Number.isFinite(explicitNodeId) && explicitNodeId > 0 && SUPERMARKET_NODES[explicitNodeId]) {
    const node = SUPERMARKET_NODES[explicitNodeId];
    return {
      nodeId: node.nodeId,
      nodeName: node.name,
      x: node.mapX,
      y: node.mapY,
      headingDeg: node.headingDeg,
    };
  }

  // 2. Tên waypoint hoặc location text từ MQTT / SignalR
  const rawLoc =
    payload.location ??
    payload.Location ??
    payload.waypoint ??
    payload.Waypoint ??
    payload.currentWaypoint ??
    payload.CurrentWaypoint ??
    payload.nearestShelf ??
    payload.NearestShelf ??
    payload.nearestLocation ??
    payload.NearestLocation ??
    payload.shelf ??
    payload.Shelf ??
    payload.name ??
    payload.Name;

  const locStr = String(rawLoc ?? '').toLowerCase().trim();
  if (locStr) {
    // Regex trích xuất Node / Kệ / Shelf / WP số (VD: "node_2", "Node 2", "Kệ 2", "K2", "wp_2")
    const match = locStr.match(/(?:node|kệ|ke|shelf|k|wp)[_\s-]*([1-8])\b/i);
    if (match) {
      const nid = Number(match[1]);
      if (SUPERMARKET_NODES[nid]) {
        const n = SUPERMARKET_NODES[nid];
        return { nodeId: n.nodeId, nodeName: n.name, x: n.mapX, y: n.mapY, headingDeg: n.headingDeg };
      }
    }

    // So khớp danh mục sản phẩm & khu vực đặc trưng
    if (locStr.includes('kệ 1') || locStr.includes('bánh kẹo') || locStr.includes('snack')) {
      const n = SUPERMARKET_NODES[1]; return { nodeId: 1, nodeName: n.name, x: n.mapX, y: n.mapY, headingDeg: n.headingDeg };
    }
    if (locStr.includes('kệ 2') || locStr.includes('nước giải khát') || locStr.includes('đồ uống') || locStr.includes('beverage')) {
      const n = SUPERMARKET_NODES[2]; return { nodeId: 2, nodeName: n.name, x: n.mapX, y: n.mapY, headingDeg: n.headingDeg };
    }
    if (locStr.includes('kệ 3') || locStr.includes('tươi sống') || locStr.includes('fresh')) {
      const n = SUPERMARKET_NODES[3]; return { nodeId: 3, nodeName: n.name, x: n.mapX, y: n.mapY, headingDeg: n.headingDeg };
    }
    if (locStr.includes('kệ 4') || locStr.includes('mì') || locStr.includes('đóng gói') || locStr.includes('packaged')) {
      const n = SUPERMARKET_NODES[4]; return { nodeId: 4, nodeName: n.name, x: n.mapX, y: n.mapY, headingDeg: n.headingDeg };
    }
    if (locStr.includes('kệ 5') || locStr.includes('gia dụng') || locStr.includes('household')) {
      const n = SUPERMARKET_NODES[5]; return { nodeId: 5, nodeName: n.name, x: n.mapX, y: n.mapY, headingDeg: n.headingDeg };
    }
    if (locStr.includes('kệ 6') || locStr.includes('gia vị') || locStr.includes('trà') || locStr.includes('spice') || locStr.includes('tea')) {
      const n = SUPERMARKET_NODES[6]; return { nodeId: 6, nodeName: n.name, x: n.mapX, y: n.mapY, headingDeg: n.headingDeg };
    }
    if (locStr.includes('thu ngân') || locStr.includes('pos') || locStr.includes('checkout') || locStr.includes('cashier')) {
      const n = SUPERMARKET_NODES[7]; return { nodeId: 7, nodeName: n.name, x: n.mapX, y: n.mapY, headingDeg: n.headingDeg };
    }
    if (locStr.includes('trạm sạc') || locStr.includes('dock') || locStr.includes('charging')) {
      const n = SUPERMARKET_NODES[8]; return { nodeId: 8, nodeName: n.name, x: n.mapX, y: n.mapY, headingDeg: n.headingDeg };
    }
  }

  // 3. Tọa độ thực tế từ robot (hỗ trợ cả ROS coordinates và Map coordinates)
  const valX = payload.xCoord ?? payload.XCoord ?? payload.x ?? payload.X ?? payload.x_coord;
  const valY = payload.yCoord ?? payload.YCoord ?? payload.y ?? payload.Y ?? payload.y_coord;
  const numX = typeof valX === 'number' ? valX : typeof valX === 'string' && valX !== '' ? Number(valX) : null;
  const numY = typeof valY === 'number' ? valY : typeof valY === 'string' && valY !== '' ? Number(valY) : null;

  if (numX !== null && numY !== null && Number.isFinite(numX) && Number.isFinite(numY)) {
    // 3a. So khớp Euclid với tọa độ ROS thực tế (rosX, rosY) của 8 Node
    let nearestNode: SupermarketNode | null = null;
    let minDistance = Infinity;

    for (const n of Object.values(SUPERMARKET_NODES)) {
      const d = Math.hypot(numX - n.rosX, numY - n.rosY);
      if (d < minDistance) {
        minDistance = d;
        nearestNode = n;
      }
    }

    if (nearestNode && minDistance <= 1.5) {
      return {
        nodeId: nearestNode.nodeId,
        nodeName: nearestNode.name,
        x: nearestNode.mapX,
        y: nearestNode.mapY,
        headingDeg: nearestNode.headingDeg,
      };
    }

    // 3b. Nếu là tọa độ trực tiếp trên Map SVG (0.1m - 2.9m)
    if (numX >= 0.1 && numX <= 2.9 && numY >= 0.1 && numY <= 2.9) {
      return {
        nodeId: nearestNode ? nearestNode.nodeId : 0,
        nodeName: nearestNode ? `Gần ${nearestNode.name}` : `Tọa độ (${numX.toFixed(2)}m, ${numY.toFixed(2)}m)`,
        x: numX,
        y: numY,
        headingDeg: nearestNode ? nearestNode.headingDeg : prevPosition?.headingDeg ?? 90,
      };
    }
  }

  // 4. BẢO TOÀN VỊ TRÍ HIỆN TẠI (CRITICAL): Tuyệt đối không tự ý fallback về Node 8 nếu robot đang ở một vị trí khác!
  if (prevPosition && Number.isFinite(prevPosition.x) && Number.isFinite(prevPosition.y) && (prevPosition.x !== 0 || prevPosition.y !== 0)) {
    return {
      nodeId: prevPosition.nodeId ?? 8,
      nodeName: prevPosition.nodeName ?? SUPERMARKET_NODES[8].name,
      x: prevPosition.x,
      y: prevPosition.y,
      headingDeg: prevPosition.headingDeg ?? 90,
    };
  }

  // 5. Fallback mặc định duy nhất khi chưa từng nhận được bất kỳ vị trí nào: Trạm sạc (Node 8)
  const defaultNode = SUPERMARKET_NODES[8];
  return {
    nodeId: 8,
    nodeName: defaultNode.name,
    x: defaultNode.mapX,
    y: defaultNode.mapY,
    headingDeg: defaultNode.headingDeg,
  };
}

export const NAV_NODES: NavNode[] = Object.values(SUPERMARKET_NODES).map((n) => ({
  id: `node-${n.nodeId}`,
  x: n.mapX,
  y: n.mapY,
  type: n.role === "cashier" ? "entry" : n.role === "dock" ? "dock" : "stocking",
  label: n.name,
}));

/* ─── Path Line Segments: Empty as user requested no path lines on map ─── */
export const PATH_SEGMENTS: PathSegment[] = [];

/* ─── Map Legend Items ─── */
export const LEGEND_ITEMS: LegendItem[] = [
  {
    symbol: "🍪",
    label: "Kệ 1 (Dãy A01)",
    description: "Bánh kẹo & Đồ ăn vặt",
    type: "stocking",
  },
  {
    symbol: "🥤",
    label: "Kệ 2 (Dãy A01)",
    description: "Nước giải khát & Đồ uống",
    type: "stocking",
  },
  {
    symbol: "🥩",
    label: "Kệ 3 (Dãy B01)",
    description: "Thực phẩm tươi sống",
    type: "stocking",
  },
  {
    symbol: "🍜",
    label: "Kệ 4 (Dãy B01)",
    description: "Mì ăn liền & Đóng gói",
    type: "stocking",
  },
  {
    symbol: "🧴",
    label: "Kệ 5 (Dãy C01)",
    description: "Đồ gia dụng & Tiện ích",
    type: "stocking",
  },
  {
    symbol: "🧂",
    label: "Kệ 6 (Dãy C01)",
    description: "Gia vị & Trà",
    type: "stocking",
  },
  {
    symbol: "💳",
    label: "Quầy Thu Ngân",
    description: "Khu vực thanh toán POS",
    type: "zone",
  },
  {
    symbol: "⚡",
    label: "Trạm Sạc (Dock)",
    description: "Trạm sạc pin tự động robot",
    type: "dock",
  },
  {
    symbol: "🤖",
    label: "Robot (RB0001)",
    description: "Vị trí & hướng di chuyển trực tuyến",
    type: "corner",
  },
];

export const DEFAULT_WIDTH_METERS = 3;
export const DEFAULT_HEIGHT_METERS = 3;