/**
 * Root index — redirects to Staff fleet page (Bản Đồ Đội Robot).
 */
import { Redirect } from "expo-router";

export default function RootIndexPage() {
  return <Redirect href="/staff/fleet" />;
}