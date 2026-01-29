/**
 * Badge Component
 *
 * A small label for status, counts, or categorization.
 * Supports multiple variants and sizes with the glass morphism aesthetic.
 */

import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  colors,
  radius,
  typography,
  componentSizes,
  type BadgeSize,
} from "@/lib/design-tokens";
import { getSemanticColors } from "@/lib/style-utils";

type BadgeVariant = "default" | "primary" | "accent" | "success" | "warning" | "error" | "outline";

type BadgeProps = {
  children: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Displays as a small dot instead of text */
  dot?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  style,
  textStyle,
}: BadgeProps) {
  const sizeConfig = componentSizes.badge[size];

  // Dot badge - just a small colored circle
  if (dot) {
    const dotSize = { sm: 6, md: 8, lg: 10 }[size];
    const dotColor = variant === "default" ? colors.textMuted : getVariantColor(variant);

    return (
      <View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            backgroundColor: dotColor,
          },
          style,
        ]}
      />
    );
  }

  // Outline variant
  if (variant === "outline") {
    return (
      <View
        style={[
          styles.container,
          styles.outline,
          {
            paddingVertical: sizeConfig.paddingVertical,
            paddingHorizontal: sizeConfig.paddingHorizontal,
          },
          style,
        ]}
      >
        <Text
          style={[
            styles.text,
            { fontSize: sizeConfig.fontSize, color: colors.text },
            textStyle,
          ]}
        >
          {children}
        </Text>
      </View>
    );
  }

  // Default (glass) variant
  if (variant === "default") {
    return (
      <View
        style={[
          styles.container,
          styles.glass,
          {
            paddingVertical: sizeConfig.paddingVertical,
            paddingHorizontal: sizeConfig.paddingHorizontal,
          },
          style,
        ]}
      >
        <Text
          style={[
            styles.text,
            { fontSize: sizeConfig.fontSize, color: colors.text },
            textStyle,
          ]}
        >
          {children}
        </Text>
      </View>
    );
  }

  // Colored variants with gradient
  const { gradient } = getSemanticColors(variant as any);

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.container,
        {
          paddingVertical: sizeConfig.paddingVertical,
          paddingHorizontal: sizeConfig.paddingHorizontal,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { fontSize: sizeConfig.fontSize, color: colors.white },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </LinearGradient>
  );
}

function getVariantColor(variant: BadgeVariant): string {
  switch (variant) {
    case "primary":
      return colors.primary;
    case "accent":
      return colors.accent;
    case "success":
      return colors.success;
    case "warning":
      return colors.warning;
    case "error":
      return colors.error;
    default:
      return colors.textMuted;
  }
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.full,
    alignSelf: "flex-start",
  },
  glass: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    fontFamily: typography.families.body.medium,
    fontWeight: "500",
    textAlign: "center",
  },
  dot: {
    borderRadius: radius.full,
  },
});

export default Badge;
