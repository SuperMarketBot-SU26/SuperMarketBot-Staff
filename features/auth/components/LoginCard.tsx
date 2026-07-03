/**
 * LoginCard — the visible "card" inside the Login screen.
 *
 * Pure presentational component. The screen owns the form state and the
 * submit handler (because it also handles the redirect after success);
 * this component just renders + reports changes via callbacks.
 */
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { palette, DEVICE, useIsDark } from "@/shared/theme";
import { BotIcon } from "@/shared/ui";

export interface LoginCardProps {
  email: string;
  password: string;
  submitting: boolean;
  error: string | null;
  onChangeEmail: (next: string) => void;
  onChangePassword: (next: string) => void;
  onSubmit: () => void;
}

export function LoginCard({
  email,
  password,
  submitting,
  error,
  onChangeEmail,
  onChangePassword,
  onSubmit,
}: LoginCardProps) {
  const isDark = useIsDark();
  const disabled = submitting || !email || !password;

  return (
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
        onChangeText={onChangeEmail}
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
        onChangeText={onChangePassword}
        placeholder="••••••••"
        placeholderTextColor={isDark ? palette.gray[600] : palette.gray[400]}
        secureTextEntry
        editable={!submitting}
        onSubmitEditing={onSubmit}
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
        onPress={onSubmit}
        disabled={disabled}
        style={({ pressed }) => [
          styles.submit,
          {
            backgroundColor: disabled
              ? isDark ? palette.gray[700] : palette.gray[300]
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
  );
}

const styles = StyleSheet.create({
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