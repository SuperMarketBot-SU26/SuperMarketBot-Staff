/**
 * Login screen — bare minimum.
 *
 * POST /api/auth/login with email + password. On success, the
 * AuthProvider switches to "authenticated" and `_layout.tsx` routes us
 * into the staff section.
 */
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import { useIsDark, palette, DEVICE } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/services/api/http";
import { BotIcon } from "@/components/ui/staff-icons";

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
      // AuthProvider will flip status to "authenticated"; the root layout
      // will re-route into the staff section automatically.
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

  const disabled = submitting || !email || !password;

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
          <View
            style={[
              styles.card,
              {
                backgroundColor: isDark ? palette.gray[900] : "#ffffff",
                borderColor: isDark ? palette.gray[800] : palette.gray[200],
              },
            ]}
          >
            {/* Brand */}
            <View
              style={[
                styles.brandIcon,
                {
                  backgroundColor: isDark
                    ? "rgba(124,58,237,0.2)"
                    : palette.violet[100],
                },
              ]}
            >
              <BotIcon
                size={28}
                color={isDark ? palette.violet[300] : palette.violet[600]}
              />
            </View>
            <Text style={[styles.title, { color: isDark ? "#fff" : palette.gray[900] }]}>
              SmartMarket Staff
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: isDark ? palette.gray[400] : palette.gray[500] },
              ]}
            >
              Đăng nhập để tiếp tục
            </Text>

            {/* Email */}
            <Text style={[styles.label, { color: isDark ? palette.gray[300] : palette.gray[700] }]}>
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="staff@example.com"
              placeholderTextColor={isDark ? palette.gray[600] : palette.gray[400]}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!submitting}
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? palette.gray[800] : palette.gray[100],
                  borderColor: isDark ? palette.gray[700] : palette.gray[200],
                  color: isDark ? "#fff" : palette.gray[900],
                },
              ]}
            />

            {/* Password */}
            <Text style={[styles.label, { color: isDark ? palette.gray[300] : palette.gray[700] }]}>
              Mật khẩu
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={isDark ? palette.gray[600] : palette.gray[400]}
              secureTextEntry
              editable={!submitting}
              onSubmitEditing={handleSubmit}
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? palette.gray[800] : palette.gray[100],
                  borderColor: isDark ? palette.gray[700] : palette.gray[200],
                  color: isDark ? "#fff" : palette.gray[900],
                },
              ]}
            />

            {/* Error */}
            {error ? (
              <View
                style={[
                  styles.errorBox,
                  {
                    backgroundColor: isDark ? "rgba(239,68,68,0.15)" : palette.red[50],
                    borderColor: palette.red[500],
                  },
                ]}
              >
                <Text style={{ color: palette.red[500], fontSize: 13, fontWeight: "600" }}>
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Submit */}
            <Pressable
              onPress={handleSubmit}
              disabled={disabled}
              style={({ pressed }) => [
                styles.submit,
                {
                  backgroundColor: disabled
                    ? (isDark ? palette.gray[700] : palette.gray[300])
                    : palette.violet[600],
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Đăng nhập</Text>
              )}
            </Pressable>

            <Text
              style={[
                styles.devHint,
                { color: isDark ? palette.gray[600] : palette.gray[400] },
              ]}
            >
              Môi trường dev: tài khoản staff seed sẵn trong db/seed_*.sql
            </Text>
          </View>
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
  card: {
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
    padding: 24,
    gap: 8,
    alignItems: "stretch",
  },
  brandIcon: {
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  title: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  subtitle: { fontSize: 13, textAlign: "center", marginBottom: 16 },
  label: { fontSize: 12, fontWeight: "700", marginTop: 8, marginBottom: 4 },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  errorBox: {
    marginTop: 8,
    borderLeftWidth: 3,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
  },
  submit: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  devHint: { fontSize: 11, textAlign: "center", marginTop: 8 },
});
