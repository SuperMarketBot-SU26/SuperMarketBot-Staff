import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import { useIsDark } from "@/constants/theme";
import { palette, DEVICE } from "@/constants/theme";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

const variantStyles = (isDark: boolean): Record<ButtonVariant, ViewStyle> => ({
  primary: {
    backgroundColor: palette.violet[600],
  },
  secondary: {
    backgroundColor: isDark ? palette.gray[800] : palette.gray[100],
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: isDark ? palette.gray[700] : palette.gray[200],
  },
  ghost: {
    backgroundColor: "transparent",
  },
  destructive: {
    backgroundColor: palette.red[600],
  },
});

const textVariantStyles = (isDark: boolean): Record<ButtonVariant, TextStyle> => ({
  primary: { color: "#ffffff" },
  secondary: { color: isDark ? palette.gray[100] : palette.gray[900] },
  outline: { color: isDark ? palette.gray[100] : palette.gray[900] },
  ghost: { color: isDark ? palette.gray[100] : palette.gray[900] },
  destructive: { color: "#ffffff" },
});

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: { height: 34, paddingHorizontal: 12, borderRadius: DEVICE.borderRadius.button },
  md: { height: 42, paddingHorizontal: 16, borderRadius: DEVICE.borderRadius.button },
  lg: { height: 50, paddingHorizontal: 24, borderRadius: DEVICE.borderRadius.button },
  icon: { height: 42, width: 42, paddingHorizontal: 0, borderRadius: DEVICE.borderRadius.button },
};

const sizeTextStyles: Record<ButtonSize, TextStyle> = {
  sm: { fontSize: 13, fontWeight: "600" },
  md: { fontSize: 15, fontWeight: "600" },
  lg: { fontSize: 17, fontWeight: "600" },
  icon: { fontSize: 15, fontWeight: "600" },
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  disabled = false,
  loading = false,
  onPress,
  children,
  style,
}: ButtonProps) {
  const isDark = useIsDark();

  const containerStyle: ViewStyle = {
    ...styles.container,
    ...sizeStyles[size],
    ...variantStyles(isDark)[variant],
    ...(disabled ? { opacity: 0.45 } : {}),
  };

  return (
    <TouchableOpacity
      style={[containerStyle, style]}
      disabled={disabled || loading}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={textVariantStyles(isDark)[variant].color}
        />
      ) : (
        <Text
          style={[
            styles.text,
            sizeTextStyles[size],
            textVariantStyles(isDark)[variant],
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  text: {
    textAlign: "center",
  },
});
