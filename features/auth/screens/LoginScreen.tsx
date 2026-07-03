/**
 * Login screen — bare minimum.
 *
 * POST /api/auth/login with email + password. On success, the
 * AuthProvider switches to "authenticated" and the root layout routes us
 * into the staff section.
 *
 * Form state + submit live here; presentation lives in `LoginCard`.
 */
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import { palette, useIsDark } from "@/shared/theme";
import { ApiError } from "@/shared/api";
import { useAuth } from "../context";
import { LoginCard } from "../components/LoginCard";

export default function LoginScreen() {
  const isDark = useIsDark();
  const router = useRouter();
  const auth = useAuth();

  const [email, setEmail] = useState("staff@smartmarket.local");
  const [password, setPassword] = useState("123456");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (submitting) return;
    setError(null);
    Keyboard.dismiss();
    setSubmitting(true);
    try {
      await auth.login(email.trim(), password);
      // AuthProvider flips status → root layout redirects to /staff/fleet.
      // We also call router.replace as a belt-and-braces in case the user
      // was already deep in the stack.
      router.replace("/staff/fleet" as any);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.status === 401
            ? "Sai email hoặc mật khẩu."
            : e.message
          : "Không thể kết nối máy chủ.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerStyle={[
            styles.page,
            { backgroundColor: isDark ? palette.gray[950] : "#f3f4f6" },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <LoginCard
            email={email}
            password={password}
            submitting={submitting}
            error={error}
            onChangeEmail={setEmail}
            onChangePassword={setPassword}
            onSubmit={handleSubmit}
          />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    padding: 16,
    justifyContent: "center",
  },
});