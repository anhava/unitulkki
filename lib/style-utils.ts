/**
 * Unitulkki Style Utilities
 *
 * Helper functions for creating consistent styles from design tokens.
 * Cross-platform compatible (iOS, Android, Web).
 */

import { ViewStyle, TextStyle, Platform } from "react-native";
import {
  colors,
  spacing,
  radius,
  shadows,
  glass,
  typography,
  type SpacingKey,
  type RadiusKey,
  type ShadowKey,
  type GlassIntensity,
} from "./design-tokens";

// =============================================================================
// GLASS MORPHISM STYLES
// =============================================================================

/**
 * Creates a glass morphism style with specified intensity
 */
export function createGlassStyle(
  intensity: GlassIntensity = "medium",
  borderRadius: RadiusKey = "xl"
): ViewStyle {
  return {
    ...glass[intensity],
    borderRadius: radius[borderRadius],
    borderWidth: 1,
    overflow: "hidden",
  };
}

/**
 * Creates a glass card style with optional shadow
 */
export function createGlassCardStyle(
  intensity: GlassIntensity = "medium",
  withShadow: boolean = false
): ViewStyle {
  return {
    ...createGlassStyle(intensity, "xl"),
    ...(withShadow ? shadows.md : {}),
  };
}

// =============================================================================
// SPACING UTILITIES
// =============================================================================

/**
 * Creates padding style from spacing tokens
 */
export function createPadding(
  vertical?: SpacingKey,
  horizontal?: SpacingKey
): ViewStyle {
  return {
    ...(vertical && { paddingVertical: spacing[vertical] }),
    ...(horizontal && { paddingHorizontal: spacing[horizontal] }),
  };
}

/**
 * Creates margin style from spacing tokens
 */
export function createMargin(
  vertical?: SpacingKey,
  horizontal?: SpacingKey
): ViewStyle {
  return {
    ...(vertical && { marginVertical: spacing[vertical] }),
    ...(horizontal && { marginHorizontal: spacing[horizontal] }),
  };
}

/**
 * Creates uniform spacing (padding or margin)
 */
export function createUniformSpacing(
  size: SpacingKey,
  type: "padding" | "margin" = "padding"
): ViewStyle {
  const value = spacing[size];
  return type === "padding" ? { padding: value } : { margin: value };
}

// =============================================================================
// SHADOW UTILITIES
// =============================================================================

/**
 * Creates cross-platform shadow styles
 * Uses boxShadow for web to avoid deprecation warnings
 */
export function createShadow(
  color: string = "#000",
  offsetX: number = 0,
  offsetY: number = 4,
  blurRadius: number = 8,
  opacity: number = 0.3,
  elevation: number = 4
): ViewStyle {
  if (Platform.OS === "web") {
    const r = parseInt(color.slice(1, 3), 16) || 0;
    const g = parseInt(color.slice(3, 5), 16) || 0;
    const b = parseInt(color.slice(5, 7), 16) || 0;
    return {
      boxShadow: `${offsetX}px ${offsetY}px ${blurRadius}px rgba(${r}, ${g}, ${b}, ${opacity})`,
    } as ViewStyle;
  }
  return {
    shadowColor: color,
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: blurRadius,
    elevation,
  };
}

/**
 * Creates a glow effect with custom color (cross-platform)
 */
export function createGlow(
  color: string = colors.primary,
  intensity: "subtle" | "normal" | "strong" = "normal"
): ViewStyle {
  const opacityMap = { subtle: 0.3, normal: 0.5, strong: 0.7 };
  const radiusMap = { subtle: 12, normal: 20, strong: 30 };

  return createShadow(color, 0, 0, radiusMap[intensity], opacityMap[intensity], 8);
}

/**
 * Gets a predefined shadow style
 */
export function getShadow(key: ShadowKey): ViewStyle {
  return shadows[key];
}

// =============================================================================
// TYPOGRAPHY UTILITIES
// =============================================================================

/**
 * Creates a text style for body text
 */
export function createBodyText(
  weight: keyof typeof typography.families.body = "regular",
  size: keyof typeof typography.sizes = "md"
): TextStyle {
  return {
    fontFamily: typography.families.body[weight],
    fontSize: typography.sizes[size],
    color: colors.text,
  };
}

/**
 * Creates a text style for headings
 */
export function createHeadingText(
  weight: keyof typeof typography.families.heading = "semiBold",
  size: keyof typeof typography.sizes = "xl"
): TextStyle {
  return {
    fontFamily: typography.families.heading[weight],
    fontSize: typography.sizes[size],
    color: colors.text,
    letterSpacing: typography.letterSpacing.tight,
  };
}

// =============================================================================
// LAYOUT UTILITIES
// =============================================================================

/**
 * Creates a flex row with common options
 */
export function createFlexRow(
  justify: ViewStyle["justifyContent"] = "flex-start",
  align: ViewStyle["alignItems"] = "center",
  gap?: SpacingKey
): ViewStyle {
  return {
    flexDirection: "row",
    justifyContent: justify,
    alignItems: align,
    ...(gap && { gap: spacing[gap] }),
  };
}

/**
 * Creates a flex column with common options
 */
export function createFlexColumn(
  justify: ViewStyle["justifyContent"] = "flex-start",
  align: ViewStyle["alignItems"] = "stretch",
  gap?: SpacingKey
): ViewStyle {
  return {
    flexDirection: "column",
    justifyContent: justify,
    alignItems: align,
    ...(gap && { gap: spacing[gap] }),
  };
}

/**
 * Centers content both horizontally and vertically
 */
export const centered: ViewStyle = {
  justifyContent: "center",
  alignItems: "center",
};

/**
 * Fills the parent container
 */
export const fill: ViewStyle = {
  flex: 1,
};

/**
 * Absolutely fills the parent container
 */
export const absoluteFill: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

// =============================================================================
// BORDER UTILITIES
// =============================================================================

/**
 * Creates a border style
 */
export function createBorder(
  width: number = 1,
  color: string = colors.border,
  borderRadius?: RadiusKey
): ViewStyle {
  return {
    borderWidth: width,
    borderColor: color,
    ...(borderRadius && { borderRadius: radius[borderRadius] }),
  };
}

// =============================================================================
// SEMANTIC COLOR UTILITIES
// =============================================================================

type SemanticColor = "primary" | "accent" | "error" | "success" | "warning" | "info";

/**
 * Gets semantic color pair (main + dark variant)
 */
export function getSemanticColors(semantic: SemanticColor): {
  main: string;
  dark: string;
  gradient: readonly [string, string];
} {
  const colorMap: Record<SemanticColor, { main: string; dark: string }> = {
    primary: { main: colors.primary, dark: colors.primaryDark },
    accent: { main: colors.accent, dark: colors.accentDark },
    error: { main: colors.error, dark: colors.errorDark },
    success: { main: colors.success, dark: colors.successDark },
    warning: { main: colors.warning, dark: colors.warningDark },
    info: { main: colors.info, dark: colors.infoDark },
  };

  const { main, dark } = colorMap[semantic];
  return { main, dark, gradient: [main, dark] as const };
}

// =============================================================================
// ACCESSIBILITY UTILITIES
// =============================================================================

/**
 * Creates accessibility props for interactive elements
 */
export function createAccessibilityProps(
  label: string,
  hint?: string,
  role: "button" | "link" | "checkbox" | "radio" | "switch" | "tab" = "button"
) {
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: role,
  };
}

// =============================================================================
// PRECOMPOSED STYLES
// =============================================================================

/**
 * Common screen container style
 */
export const screenContainer: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
};

/**
 * Common content container with padding
 */
export const contentContainer: ViewStyle = {
  flex: 1,
  paddingHorizontal: spacing.md,
};

/**
 * Divider line style
 */
export const divider: ViewStyle = {
  height: 1,
  backgroundColor: colors.border,
  marginVertical: spacing.md,
};
