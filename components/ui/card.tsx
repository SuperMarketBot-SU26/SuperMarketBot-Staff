import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { getShadow, divider } from "./utils";
import { DEVICE, palette, useIsDark } from "@/constants/theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "default" | "elevated";
}

export function Card({ children, style, variant = "default" }: CardProps) {
  const isDark = useIsDark();
  const shadow = getShadow(variant === "elevated" ? "md" : "sm", isDark);
  const borderColor = isDark ? palette.gray[800] : palette.gray[200];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? palette.gray[900] : "#ffffff",
          borderColor,
        },
        shadow,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: DEVICE.borderRadius.card,
    borderWidth: 1,
    overflow: "hidden",
  },
});
