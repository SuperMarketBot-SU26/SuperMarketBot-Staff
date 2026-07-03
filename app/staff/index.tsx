/**
 * Staff Index — redirects to /staff/fleet (Bản Đồ).
 */
import { Redirect } from "expo-router";

export default function StaffIndexPage() {
  return <Redirect href="/staff/fleet" />;
}