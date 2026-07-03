/**
 * `formatRelativeTime` — render a BE ISO timestamp as a Vietnamese-feeling
 * relative label ("vừa xong", "5 phút trước", "2 giờ trước", "3 ngày trước").
 *
 * Lives in `shared/lib/` because it's used by the tasks screen, the
 * robot-detail screen, and possibly more in the future.
 */
export function formatRelativeTime(iso: string): string {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return iso;
  const diffMs = Date.now() - ts;
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.round(hours / 24);
  return `${days} ngày trước`;
}