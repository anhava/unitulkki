/**
 * Spinner Component
 *
 * Animated loading indicator with the glass morphism aesthetic.
 * Supports multiple variants and sizes.
 */

import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
} from "react-native-reanimated";
import { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { colors, componentSizes, type ComponentSize } from "@/lib/design-tokens";

type SpinnerVariant = "default" | "primary" | "accent" | "white";

type SpinnerProps = {
  /** Size preset */
  size?: ComponentSize;
  /** Color variant */
  variant?: SpinnerVariant;
  /** Custom size in pixels (overrides size preset) */
  customSize?: number;
  style?: ViewStyle;
};

export function Spinner({
  size = "md",
  variant = "primary",
  customSize,
  style,
}: SpinnerProps) {
  const rotation = useSharedValue(0);
  const iconSize = customSize || componentSizes.icon[size === "sm" ? "md" : size === "md" ? "lg" : "xl"];

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1, // Infinite
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const spinnerColor = getVariantColor(variant);
  const trackColor = variant === "white" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)";

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: iconSize,
          height: iconSize,
        },
        animatedStyle,
        style,
      ]}
    >
      {/* Background track */}
      <View
        style={[
          styles.track,
          {
            width: iconSize,
            height: iconSize,
            borderRadius: iconSize / 2,
            borderColor: trackColor,
          },
        ]}
      />
      {/* Spinning arc */}
      <View
        style={[
          styles.arc,
          {
            width: iconSize,
            height: iconSize,
            borderRadius: iconSize / 2,
            borderTopColor: spinnerColor,
            borderRightColor: "transparent",
            borderBottomColor: "transparent",
            borderLeftColor: "transparent",
          },
        ]}
      />
    </Animated.View>
  );
}

/**
 * Pulsing Dot Spinner - Three dots that pulse in sequence
 */
type DotSpinnerProps = {
  size?: ComponentSize;
  variant?: SpinnerVariant;
  style?: ViewStyle;
};

export function DotSpinner({
  size = "md",
  variant = "primary",
  style,
}: DotSpinnerProps) {
  const dot1Opacity = useSharedValue(0.3);
  const dot2Opacity = useSharedValue(0.3);
  const dot3Opacity = useSharedValue(0.3);

  const dotSize = { sm: 6, md: 8, lg: 10 }[size];
  const gap = { sm: 4, md: 6, lg: 8 }[size];

  useEffect(() => {
    const duration = 400;

    dot1Opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration }),
        withTiming(0.3, { duration })
      ),
      -1,
      false
    );

    setTimeout(() => {
      dot2Opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration }),
          withTiming(0.3, { duration })
        ),
        -1,
        false
      );
    }, duration / 3);

    setTimeout(() => {
      dot3Opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration }),
          withTiming(0.3, { duration })
        ),
        -1,
        false
      );
    }, (duration / 3) * 2);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: dot1Opacity.value,
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2Opacity.value,
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3Opacity.value,
  }));

  const spinnerColor = getVariantColor(variant);

  return (
    <View style={[styles.dotContainer, { gap }, style]}>
      <Animated.View
        style={[
          styles.dot,
          { width: dotSize, height: dotSize, backgroundColor: spinnerColor },
          dot1Style,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { width: dotSize, height: dotSize, backgroundColor: spinnerColor },
          dot2Style,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { width: dotSize, height: dotSize, backgroundColor: spinnerColor },
          dot3Style,
        ]}
      />
    </View>
  );
}

/**
 * Gradient Ring Spinner - Premium animated ring with gradient
 */
type GradientSpinnerProps = {
  size?: ComponentSize;
  style?: ViewStyle;
};

export function GradientSpinner({ size = "md", style }: GradientSpinnerProps) {
  const rotation = useSharedValue(0);
  const iconSize = componentSizes.icon[size === "sm" ? "md" : size === "md" ? "lg" : "xl"];
  const strokeWidth = { sm: 2, md: 3, lg: 4 }[size];

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1200,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: iconSize,
          height: iconSize,
        },
        animatedStyle,
        style,
      ]}
    >
      <LinearGradient
        colors={[colors.primary, colors.accent, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradientRing,
          {
            width: iconSize,
            height: iconSize,
            borderRadius: iconSize / 2,
            borderWidth: strokeWidth,
          },
        ]}
      />
    </Animated.View>
  );
}

// Utility
function getVariantColor(variant: SpinnerVariant): string {
  switch (variant) {
    case "primary":
      return colors.primary;
    case "accent":
      return colors.accent;
    case "white":
      return colors.white;
    case "default":
    default:
      return colors.textMuted;
  }
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  track: {
    position: "absolute",
    borderWidth: 2,
  },
  arc: {
    position: "absolute",
    borderWidth: 2,
  },
  dotContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    borderRadius: 999,
  },
  gradientRing: {
    borderColor: "transparent",
  },
});

export default Spinner;
