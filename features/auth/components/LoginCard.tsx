/**
 * LoginCard — the visible "card" inside the Login screen.
 */
import { DEVICE, palette } from "@/shared/theme";
import { BlurView } from "expo-blur";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { Easing, ZoomIn } from "react-native-reanimated";

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
  const disabled = submitting || !email || !password;

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  return (
    <Animated.View
      entering={ZoomIn.duration(800).easing(Easing.out(Easing.exp)).delay(100)}
      style={styles.cardContainer}
    >
      <BlurView
        intensity={80}
        tint="light"
        style={styles.card}
      >
        {/* Brand */}
        <View style={styles.brandIcon}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={{ width: 64, height: 64, resizeMode: 'contain' }}
          />
        </View>
        <Text style={styles.title}>
          SmartMarket Staff
        </Text>
        <Text style={styles.subtitle}>
          Đăng nhập để tiếp tục
        </Text>

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={onChangeEmail}
          placeholder="staff@example.com"
          placeholderTextColor="rgba(0,0,0,0.3)"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          editable={!submitting}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
          style={[
            styles.input,
            emailFocused && styles.inputFocused
          ]}
        />

        {/* Password */}
        <Text style={styles.label}>Mật khẩu</Text>
        <TextInput
          value={password}
          onChangeText={onChangePassword}
          placeholder="••••••••"
          placeholderTextColor="rgba(0,0,0,0.3)"
          secureTextEntry
          editable={!submitting}
          onSubmitEditing={onSubmit}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          style={[
            styles.input,
            passwordFocused && styles.inputFocused
          ]}
        />

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
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
              backgroundColor: disabled ? "rgba(0,0,0,0.1)" : palette.green[500],
              opacity: pressed ? 0.8 : 1,
              shadowColor: palette.green[500],
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: disabled ? 0 : 0.4,
              shadowRadius: 12,
              elevation: disabled ? 0 : 8,
            },
          ]}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Đăng nhập</Text>
          )}
        </Pressable>


      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: DEVICE.borderRadius.card + 4,
    overflow: "hidden",
    marginHorizontal: 16,
    shadowColor: palette.green[900],
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // subtle white backup for blur
  },
  card: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    backgroundColor: "rgba(255,255,255,0.6)",
    padding: 24,
    gap: 8,
    alignItems: "stretch",
  },
  brandIcon: {
    alignSelf: "center",
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    shadowColor: palette.green[200],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  title: { fontSize: 26, fontWeight: "800", textAlign: "center", color: palette.gray[900] },
  subtitle: { fontSize: 14, textAlign: "center", marginBottom: 16, color: palette.gray[600] },
  label: { fontSize: 13, fontWeight: "700", marginTop: 8, marginBottom: 4, color: palette.gray[800] },
  input: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.05)",
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: palette.gray[900],
  },
  inputFocused: {
    borderColor: palette.green[400],
    backgroundColor: "#ffffff",
    shadowColor: palette.green[400],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  errorBox: {
    marginTop: 8,
    borderLeftWidth: 3,
    borderColor: palette.red[500],
    backgroundColor: "rgba(239,68,68,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  errorText: {
    color: palette.red[600],
    fontSize: 13,
    fontWeight: "600"
  },
  submit: {
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "800", letterSpacing: 0.5 },
  devHint: { fontSize: 11, textAlign: "center", marginTop: 12, color: "rgba(0,0,0,0.4)" },
});