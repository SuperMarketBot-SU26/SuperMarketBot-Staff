/**
 * Status / priority colour configs used by the UI.
 *
 * Lives in `shared/theme/` because that's where tokens live, but it
 * imports the type-only `RobotStatus` from `shared/api/` to stay in
 * lock-step with whatever the BE sends us. The import is type-only so
 * there's no runtime cycle with the API layer.
 */
import type { RobotStatus } from "@/shared/api/types";

export type Priority = "urgent" | "high" | "normal";

export const robotStatusConfig: Record<
  RobotStatus,
  { bg: string; bgAlpha: string; dot: string; text: string; label: string }
> = {
  active: {
    bg: "#10b981",
    bgAlpha: "rgba(16,185,129,0.15)",
    dot: "#34d399",
    text: "#34d399",
    label: "Đang hoạt động",
  },
  standby: {
    bg: "#f59e0b",
    bgAlpha: "rgba(245,158,11,0.15)",
    dot: "#fbbf24",
    text: "#fbbf24",
    label: "Chờ nhiệm vụ",
  },
  error: {
    bg: "#ef4444",
    bgAlpha: "rgba(239,68,68,0.15)",
    dot: "#f87171",
    text: "#f87171",
    label: "Lỗi / Pin yếu",
  },
  charging: {
    bg: "#3b82f6",
    bgAlpha: "rgba(59,130,246,0.15)",
    dot: "#60a5fa",
    text: "#60a5fa",
    label: "Đang sạc",
  },
};

export const priorityConfig: Record<
  Priority,
  { bg: string; border: string; badge: string; badgeText: string; bar: string; iconText: string }
> = {
  urgent: {
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.3)",
    badge: "#ef4444",
    badgeText: "#ffffff",
    bar: "#ef4444",
    iconText: "#ef4444",
  },
  high: {
    bg: "rgba(249,115,22,0.08)",
    border: "rgba(249,115,22,0.3)",
    badge: "#f97316",
    badgeText: "#ffffff",
    bar: "#f97316",
    iconText: "#f97316",
  },
  normal: {
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.3)",
    badge: "rgba(59,130,246,0.15)",
    badgeText: "#60a5fa",
    bar: "#3b82f6",
    iconText: "#60a5fa",
  },
};