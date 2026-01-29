/**
 * Unitulkki Design Tokens
 *
 * Single source of truth for all design values.
 * Import from here instead of scattered constants.
 */

// =============================================================================
// COLORS
// =============================================================================

export const colors = {
  // Brand
  primary: "#8B5CF6",
  primaryDark: "#7C3AED",
  primaryLight: "#A78BFA",

  accent: "#06B6D4",
  accentDark: "#0891B2",
  accentLight: "#22D3EE",

  // Backgrounds
  background: "#0f0f23",
  backgroundDark: "#0a0a1a",
  backgroundElevated: "#1a1a2e",
  backgroundGradientStart: "#1a0a2e",
  backgroundGradientEnd: "#0f0f23",

  // Gradients (as tuples for LinearGradient)
  gradientPrimary: ["#8B5CF6", "#7C3AED"] as const,
  gradientAccent: ["#06B6D4", "#0891B2"] as const,
  gradientBackground: ["#1a0a2e", "#0f0f23"] as const,
  gradientGlass: ["rgba(139, 92, 246, 0.1)", "rgba(6, 182, 212, 0.05)", "transparent"] as const,

  // Surfaces (glass morphism)
  surface: "rgba(255,255,255,0.05)",
  surfaceHover: "rgba(255,255,255,0.08)",
  surfaceActive: "rgba(255,255,255,0.12)",

  // Borders
  border: "rgba(255,255,255,0.1)",
  borderLight: "rgba(255,255,255,0.15)",
  borderFocus: "rgba(139, 92, 246, 0.5)",

  // Text
  text: "#E2E8F0",
  textMuted: "#94A3B8",
  textDim: "#64748B",
  textInverse: "#0f0f23",

  // Neutrals
  white: "#FFFFFF",
  black: "#000000",

  // Semantic
  error: "#EF4444",
  errorDark: "#DC2626",
  success: "#10B981",
  successDark: "#059669",
  warning: "#F59E0B",
  warningDark: "#D97706",
  info: "#3B82F6",
  infoDark: "#2563EB",
} as const;

// =============================================================================
// SPACING - Generous padding for "breathing room" (Calm/Headspace style)
// =============================================================================

export const spacing = {
  xs: 6,
  sm: 12,
  md: 20,
  lg: 28,
  xl: 40,
  xxl: 56,
  xxxl: 80,
} as const;

// =============================================================================
// BORDER RADIUS - Softer, rounder shapes (avoid sharp edges)
// =============================================================================

export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 40,
  full: 9999,
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  families: {
    body: {
      regular: "Inter_400Regular",
      medium: "Inter_500Medium",
      semiBold: "Inter_600SemiBold",
      bold: "Inter_700Bold",
    },
    heading: {
      regular: "SpaceGrotesk_400Regular",
      medium: "SpaceGrotesk_500Medium",
      semiBold: "SpaceGrotesk_600SemiBold",
      bold: "SpaceGrotesk_700Bold",
    },
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
} as const;

// =============================================================================
// SHADOWS
// =============================================================================

export const shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  glowAccent: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

// =============================================================================
// GLASS MORPHISM - Softer, dreamier glass effects
// =============================================================================

export const glass = {
  light: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.08)",
  },
  medium: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.12)",
  },
  strong: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.18)",
  },
  dark: {
    backgroundColor: "rgba(0,0,0,0.25)",
    borderColor: "rgba(255,255,255,0.06)",
  },
  // Dream-themed glass for special elements
  dream: {
    backgroundColor: "rgba(139, 92, 246, 0.08)",
    borderColor: "rgba(139, 92, 246, 0.15)",
  },
} as const;

// =============================================================================
// ANIMATION
// =============================================================================

export const animation = {
  spring: {
    gentle: { damping: 20, stiffness: 300 },
    snappy: { damping: 15, stiffness: 400 },
    bouncy: { damping: 10, stiffness: 350 },
  },
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
  },
} as const;

// =============================================================================
// Z-INDEX
// =============================================================================

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  modal: 300,
  popover: 400,
  tooltip: 500,
  toast: 600,
} as const;

// =============================================================================
// COMPONENT SIZE PRESETS
// =============================================================================

export const componentSizes = {
  button: {
    sm: { paddingVertical: 10, paddingHorizontal: 16, fontSize: 14, iconSize: 16 },
    md: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 16, iconSize: 20 },
    lg: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 18, iconSize: 24 },
  },
  input: {
    sm: { height: 40, paddingHorizontal: 12, fontSize: 14 },
    md: { height: 48, paddingHorizontal: 16, fontSize: 16 },
    lg: { height: 56, paddingHorizontal: 20, fontSize: 18 },
  },
  avatar: {
    xs: { size: 24, fontSize: 10 },
    sm: { size: 32, fontSize: 12 },
    md: { size: 40, fontSize: 14 },
    lg: { size: 56, fontSize: 18 },
    xl: { size: 80, fontSize: 24 },
  },
  badge: {
    sm: { paddingVertical: 2, paddingHorizontal: 6, fontSize: 10 },
    md: { paddingVertical: 4, paddingHorizontal: 8, fontSize: 12 },
    lg: { paddingVertical: 6, paddingHorizontal: 12, fontSize: 14 },
  },
  icon: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type ColorKey = keyof typeof colors;
export type SpacingKey = keyof typeof spacing;
export type RadiusKey = keyof typeof radius;
export type ShadowKey = keyof typeof shadows;
export type GlassIntensity = keyof typeof glass;
export type ComponentSize = "sm" | "md" | "lg";
export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type BadgeSize = "sm" | "md" | "lg";
