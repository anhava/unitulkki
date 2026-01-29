/**
 * GlassCard Component
 *
 * A flexible glass morphism card with compound component pattern.
 * Supports headers, bodies, footers, and various intensities.
 *
 * @example
 * // Simple usage
 * <GlassCard>
 *   <Text>Content</Text>
 * </GlassCard>
 *
 * @example
 * // Compound usage
 * <GlassCard>
 *   <GlassCard.Header>
 *     <GlassCard.Title>Dream Title</GlassCard.Title>
 *     <GlassCard.Subtitle>Last night</GlassCard.Subtitle>
 *   </GlassCard.Header>
 *   <GlassCard.Body>
 *     <Text>Dream content...</Text>
 *   </GlassCard.Body>
 *   <GlassCard.Footer>
 *     <GlowButton size="sm">View</GlowButton>
 *   </GlassCard.Footer>
 * </GlassCard>
 */

import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { ReactNode, createContext, useContext } from "react";
import {
  colors,
  glass,
  radius,
  spacing,
  typography,
  shadows,
  animation,
  type GlassIntensity,
} from "@/lib/design-tokens";
import { lightTap } from "@/lib/haptics";

// =============================================================================
// CONTEXT
// =============================================================================

type GlassCardContextValue = {
  intensity: GlassIntensity;
};

const GlassCardContext = createContext<GlassCardContextValue>({
  intensity: "medium",
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

type GlassCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  /** Glass effect intensity */
  intensity?: GlassIntensity;
  /** Adds gradient overlay */
  withGradient?: boolean;
  /** Adds subtle shadow glow */
  withGlow?: boolean;
  /** Makes card pressable with scale animation */
  onPress?: () => void;
  /** Accessibility label */
  accessibilityLabel?: string;
};

function GlassCardRoot({
  children,
  style,
  className,
  intensity = "medium",
  withGradient = false,
  withGlow = false,
  onPress,
  accessibilityLabel,
}: GlassCardProps) {
  const scale = useSharedValue(1);
  const currentIntensity = glass[intensity];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      lightTap();
      scale.value = withSpring(0.98, animation.spring.snappy);
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, animation.spring.snappy);
    }
  };

  const cardContent = (
    <>
      {withGradient && (
        <LinearGradient
          colors={colors.gradientGlass}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <GlassCardContext.Provider value={{ intensity }}>
        {children}
      </GlassCardContext.Provider>
    </>
  );

  const containerStyle = [
    styles.container,
    {
      backgroundColor: currentIntensity.backgroundColor,
      borderColor: currentIntensity.borderColor,
    },
    withGlow && shadows.md,
    style,
  ];

  if (onPress) {
    return (
      <Animated.View style={[animatedStyle, containerStyle]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          style={{ flex: 1 }}
        >
          {cardContent}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View style={containerStyle} className={className}>
      {cardContent}
    </View>
  );
}

// =============================================================================
// COMPOUND COMPONENTS
// =============================================================================

type HeaderProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Adds bottom border */
  bordered?: boolean;
};

function Header({ children, style, bordered = false }: HeaderProps) {
  return (
    <View style={[styles.header, bordered && styles.headerBordered, style]}>
      {children}
    </View>
  );
}

type TitleProps = {
  children: string;
  style?: StyleProp<TextStyle>;
};

function Title({ children, style }: TitleProps) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

type SubtitleProps = {
  children: string;
  style?: StyleProp<TextStyle>;
};

function Subtitle({ children, style }: SubtitleProps) {
  return <Text style={[styles.subtitle, style]}>{children}</Text>;
}

type BodyProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

function Body({ children, style }: BodyProps) {
  return <View style={[styles.body, style]}>{children}</View>;
}

type FooterProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Adds top border */
  bordered?: boolean;
};

function Footer({ children, style, bordered = false }: FooterProps) {
  return (
    <View style={[styles.footer, bordered && styles.footerBordered, style]}>
      {children}
    </View>
  );
}

type DividerProps = {
  style?: StyleProp<ViewStyle>;
};

function Divider({ style }: DividerProps) {
  return <View style={[styles.divider, style]} />;
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  headerBordered: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontFamily: typography.families.heading.semiBold,
    fontSize: typography.sizes.lg,
    color: colors.text,
    fontWeight: "600",
  },
  subtitle: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  body: {
    padding: spacing.md,
  },
  footer: {
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  footerBordered: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
});

// =============================================================================
// EXPORTS
// =============================================================================

// Compose the compound component
export const GlassCard = Object.assign(GlassCardRoot, {
  Header,
  Title,
  Subtitle,
  Body,
  Footer,
  Divider,
});

// Hook to access card context in custom components
export function useGlassCard() {
  return useContext(GlassCardContext);
}

export default GlassCard;
