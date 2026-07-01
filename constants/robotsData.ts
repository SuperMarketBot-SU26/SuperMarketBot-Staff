/**
 * SmartMarket Staff App — Robot Data
 * Single source of truth for all robot entities
 */

export type RobotStatus = "active" | "standby" | "error" | "charging";
export type FloorId = 1 | 2 | 3;

export interface Robot {
  id: string;
  model: string;
  battery: number;
  status: RobotStatus;
  uptime: string;
  errors: string[];
  active: boolean;
  tasks: number;
  signalStrength: number;
  firmware: string;
  serialNumber: string;
  location: string;
  weight: string;
  dimensions: string;
  maxSpeed: string;
  maxPayload: string;
  sensors: string[];
  temperature: number;
  currentSpeed: number;
  currentPayload: number;
  totalRuntime: string;
  completedTasks: number;
}

export interface MapRobot {
  id: string;
  x: number;   // percentage 0–100
  y: number;   // percentage 0–100
  status: RobotStatus;
  battery: number;
  task: string;
  signal: number;
  floor: FloorId;
}

export interface FloorInfo {
  id: FloorId;
  label: string;
  short: string;
  desc: string;
}

export const FLOORS: FloorInfo[] = [
  { id: 1, label: "Tầng 1", short: "T1", desc: "Bán lẻ chính" },
  { id: 2, label: "Tầng 2", short: "T2", desc: "Điện tử & Gia dụng" },
  { id: 3, label: "Tầng hầm", short: "TH", desc: "Kho & Nhận hàng" },
];

export const MAP_ROBOTS: MapRobot[] = [
  { id: "SMB-01", x: 20, y: 25, status: "active",  battery: 87, task: "Dẫn đường KH #1204", signal: 92, floor: 1 },
  { id: "SMB-02", x: 65, y: 40, status: "active",  battery: 62, task: "Dẫn đường KH #1205", signal: 78, floor: 1 },
  { id: "SMB-03", x: 45, y: 35, status: "standby", battery: 95, task: "Chờ nhiệm vụ",        signal: 88, floor: 2 },
  { id: "SMB-04", x: 75, y: 60, status: "error",   battery: 12, task: "Pin yếu — cần sạc",   signal: 45, floor: 3 },
  { id: "SMB-05", x: 30, y: 55, status: "active",  battery: 74, task: "Kiểm kê hàng Kệ C",   signal: 85, floor: 1 },
  { id: "SMB-06", x: 25, y: 65, status: "charging", battery: 55, task: "Vận chuyển hàng kho", signal: 72, floor: 3 },
];

export const ROBOTS: Robot[] = [
  {
    id: "SMB-01",
    model: "SmartBot Pro v2",
    battery: 87,
    status: "active",
    uptime: "5h 23m",
    errors: [],
    active: true,
    tasks: 12,
    signalStrength: 95,
    firmware: "v3.4.2",
    serialNumber: "SN-2024-001",
    location: "Khu vực A — Kệ 1-5",
    weight: "28 kg",
    dimensions: "60 × 50 × 120 cm",
    maxSpeed: "1.5 m/s",
    maxPayload: "30 kg",
    sensors: ["LiDAR 360°", "Camera RGB-D", "IMU", "Cảm biến va chạm", "GPS nội nhà"],
    temperature: 38,
    currentSpeed: 1.1,
    currentPayload: 4.2,
    totalRuntime: "312h 45m",
    completedTasks: 1248,
  },
  {
    id: "SMB-02",
    model: "SmartBot Pro v2",
    battery: 62,
    status: "active",
    uptime: "3h 41m",
    errors: [],
    active: true,
    tasks: 8,
    signalStrength: 88,
    firmware: "v3.4.2",
    serialNumber: "SN-2024-002",
    location: "Khu vực B — Kệ 6-10",
    weight: "28 kg",
    dimensions: "60 × 50 × 120 cm",
    maxSpeed: "1.5 m/s",
    maxPayload: "30 kg",
    sensors: ["LiDAR 360°", "Camera RGB-D", "IMU", "Cảm biến va chạm", "GPS nội nhà"],
    temperature: 41,
    currentSpeed: 0.9,
    currentPayload: 2.8,
    totalRuntime: "198h 12m",
    completedTasks: 876,
  },
  {
    id: "SMB-03",
    model: "SmartBot Standard",
    battery: 95,
    status: "standby",
    uptime: "0h 00m",
    errors: [],
    active: false,
    tasks: 0,
    signalStrength: 72,
    firmware: "v2.9.1",
    serialNumber: "SN-2023-003",
    location: "Trạm chờ — Cửa vào",
    weight: "22 kg",
    dimensions: "55 × 45 × 115 cm",
    maxSpeed: "1.2 m/s",
    maxPayload: "20 kg",
    sensors: ["LiDAR 180°", "Camera RGB", "IMU", "Cảm biến va chạm"],
    temperature: 34,
    currentSpeed: 0,
    currentPayload: 0,
    totalRuntime: "523h 08m",
    completedTasks: 2103,
  },
  {
    id: "SMB-04",
    model: "SmartBot Standard",
    battery: 12,
    status: "error",
    uptime: "7h 12m",
    errors: ["Pin thấp — cần sạc ngay", "Cảm biến LiDAR cần kiểm tra"],
    active: true,
    tasks: 0,
    signalStrength: 45,
    firmware: "v2.9.1",
    serialNumber: "SN-2023-004",
    location: "Khu vực C — Hành lang 3",
    weight: "22 kg",
    dimensions: "55 × 45 × 115 cm",
    maxSpeed: "1.2 m/s",
    maxPayload: "20 kg",
    sensors: ["LiDAR 180°", "Camera RGB", "IMU", "Cảm biến va chạm"],
    temperature: 58,
    currentSpeed: 0,
    currentPayload: 0,
    totalRuntime: "487h 33m",
    completedTasks: 1965,
  },
  {
    id: "SMB-05",
    model: "SmartBot Pro v2",
    battery: 74,
    status: "active",
    uptime: "2h 55m",
    errors: [],
    active: true,
    tasks: 6,
    signalStrength: 91,
    firmware: "v3.4.2",
    serialNumber: "SN-2024-005",
    location: "Khu vực D — Quầy thanh toán",
    weight: "28 kg",
    dimensions: "60 × 50 × 120 cm",
    maxSpeed: "1.5 m/s",
    maxPayload: "30 kg",
    sensors: ["LiDAR 360°", "Camera RGB-D", "IMU", "Cảm biến va chạm", "GPS nội nhà"],
    temperature: 39,
    currentSpeed: 0.7,
    currentPayload: 1.5,
    totalRuntime: "145h 22m",
    completedTasks: 612,
  },
  {
    id: "SMB-06",
    model: "SmartBot Standard",
    battery: 100,
    status: "charging",
    uptime: "0h 00m",
    errors: [],
    active: false,
    tasks: 0,
    signalStrength: 99,
    firmware: "v2.9.1",
    serialNumber: "SN-2023-006",
    location: "Trạm sạc — Kho hậu cần",
    weight: "22 kg",
    dimensions: "55 × 45 × 115 cm",
    maxSpeed: "1.2 m/s",
    maxPayload: "20 kg",
    sensors: ["LiDAR 180°", "Camera RGB", "IMU", "Cảm biến va chạm"],
    temperature: 36,
    currentSpeed: 0,
    currentPayload: 0,
    totalRuntime: "634h 50m",
    completedTasks: 2540,
  },
];