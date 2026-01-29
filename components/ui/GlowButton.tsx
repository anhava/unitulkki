import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { ReactNode } from "react";
import {
  colors,
  typography,
  componentSizes,
  radius,
  animation,
  type ComponentSize,
} from "@/lib/design-tokens";
import { mediumTap } from "@/lib/haptics";
import { Spinner } from "./Spinner";

type ButtonVariant = "primary" | "accent" | "ghost" | "outline" | "danger";

type GlowButtonProps = {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  /** Loading state - shows spinner and disables interactions */
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ComponentSize;
  /** Makes button take full width of container */
  fullWidth?: boolean;
  /** Icon to display before the text */
  leftIcon?: ReactNode;
  /** Icon to display after the text */
  rightIcon?: ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
  className?: string;
};

export function GlowButton({
  children,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  size = "md",
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  accessibilityLabel,
  className,
}: GlowButtonProps) {
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!isDisabled) {
      mediumTap();
    }
    scale.value = withSpring(0.98, animation.spring.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animation.spring.snappy);
  };

  const variantStyles: Record<ButtonVariant, {
    colors: readonly [string, string];
    shadowColor: string;
    textColor: string;
  }> = {
    primary: {
      colors: colors.gradientPrimary,
      shadowColor: colors.primary,
      textColor: colors.white,
    },
    accent: {
      colors: colors.gradientAccent,
      shadowColor: colors.accent,
      textColor: colors.white,
    },
    ghost: {
      colors: ["transparent", "transparent"] as const,
      shadowColor: "transparent",
      textColor: colors.text,
    },
    outline: {
      colors: ["transparent", "transparent"] as const,
      shadowColor: colors.primary,
      textColor: colors.primary,
    },
    danger: {
      colors: [colors.error, colors.errorDark] as const,
      shadowColor: colors.error,
      textColor: colors.white,
    },
  };

  const currentVariant = variantStyles[variant];
  const currentSize = componentSizes.button[size];

  const spinnerVariant = variant === "primary" || variant === "danger" ? "white" : "primary";

  return (
    <Animated.View
      style={[
        animatedStyle,
        styles.container,
        fullWidth && styles.fullWidth,
        variant !== "ghost" && variant !== "outline" && {
          shadowColor: currentVariant.shadowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: isDisabled ? 0 : 0.5,
          shadowRadius: 20,
        },
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || (typeof children === "string" ? children : undefined)}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        style={styles.pressable}
      >
        <LinearGradient
          colors={
            isDisabled
              ? ["rgba(100,100,100,0.3)", "rgba(80,80,80,0.3)"]
              : currentVariant.colors
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            {
              paddingVertical: currentSize.paddingVertical,
              paddingHorizontal: currentSize.paddingHorizontal,
            },
            (variant === "ghost" || variant === "outline") && styles.outlineGradient,
            variant === "outline" && styles.outlineBorder,
          ]}
        >
          {/* Loading spinner */}
          {loading ? (
            <Spinner size={size} variant={spinnerVariant} />
          ) : (
            <>
              {/* Left icon */}
              {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

              {/* Button text */}
              {typeof children === "string" ? (
                <Text
                  style={[
                    styles.text,
                    {
                      fontSize: currentSize.fontSize,
                      color: isDisabled ? colors.textDim : currentVariant.textColor,
                    },
                    textStyle,
                  ]}
                >
                  {children}
                </Text>
              ) : (
                children
              )}

              {/* Right icon */}
              {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
            </>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  pressable: {
    flex: 1,
  },
  fullWidth: {
    width: "100%",
  },
  gradient: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  outlineGradient: {
    borderRadius: radius.lg,
  },
  outlineBorder: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  text: {
    fontFamily: typography.families.body.semiBold,
    fontWeight: "600",
    letterSpacing: typography.letterSpacing.wide,
  },
  disabled: {
    opacity: 0.6,
  },
  iconLeft: {
    marginRight: 4,
  },
  iconRight: {
    marginLeft: 4,
  },
});

export default GlowButton;
