/**
 * `features/staff` — everything the staff section of the app does.
 *
 * Sub-features (each owns its own screen, components, and any helpers):
 *   - layout   → StaffLayout, header, sidebar
 *   - map      → Skia-powered fullscreen store map + fleet overview
 *   - robots   → Robot list
 *   - tasks    → Cảnh Báo (restock + robot alerts)
 *   - robot-detail → per-robot deep view
 *   - robot-nav    → ping / "Đã xử lý" flow
 *
 * Cross-feature hooks (used by ≥2 sub-features) live in `hooks/`.
 */
export * from "./layout";
export * from "./map";
export * from "./map/legacy";   // backwards-compat: MAP_WIDTH/HEIGHT, projectPct
export * from "./robots";
export * from "./tasks";
export * from "./restock-location";
export * from "./robot-detail";
export * from "./robot-nav";
export * from "./hooks";
export { StaffLayout as default } from "./layout/StaffLayout";