import React from "react";
import { View, Text, StyleSheet, TextStyle, ViewStyle } from "react-native";
import { DEVICE, palette } from "@/constants/theme";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "active" | "standby" | "error" | "charging";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  style?: ViewStyle;
}

const variantStyles: Record<BadgeVariant, ViewStyle> = {
  default:    { backgroundColor: palette.violet[600], borderColor: "transparent" },
  secondary:  { backgroundColor: palette.gray[200], borderColor: "transparent" },
  destructive: { backgroundColor: palette.red[600], borderColor: "transparent" },
  outline:    { backgroundColor: "transparent", borderColor: palette.gray[300] },
  active:     { backgroundColor: "rgba(16,185,129,0.15)", borderColor: "transparent" },
  standby:    { backgroundColor: "rgba(245,158,11,0.15)", borderColor: "transparent" },
  error:      { backgroundColor: "rgba(239,68,68,0.15)", borderColor: "transparent" },
  charging:   { backgroundColor: "rgba(59,130,246,0.15)", borderColor: "transparent" },
};

const textVariantStyles: Record<BadgeVariant, { color: string; fontWeight: TextStyle["fontWeight"] }> = {
  default:    { color: "#ffffff", fontWeight: "700" },
  secondary:  { color: palette.gray[700], fontWeight: "500" },
  destructive: { color: "#ffffff", fontWeight: "700" },
  outline:    { color: palette.gray[700], fontWeight: "500" },
  active:     { color: palette.emerald[500], fontWeight: "600" },
  standby:    { color: palette.amber[600], fontWeight: "600" },
  error:      { color: palette.red[500], fontWeight: "600" },
  charging:   { color: palette.blue[500], fontWeight: "600" },
};

export function Badge({ variant = "default", children, style }: BadgeProps) {
  return (
    <View style={[styles.container, variantStyles[variant], style]}>
      <Text style={[styles.text, textVariantStyles[variant]]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: DEVICE.borderRadius.badge,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
});
