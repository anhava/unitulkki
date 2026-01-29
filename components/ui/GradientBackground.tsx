import { StyleSheet, Dimensions, View, StatusBar, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useEffect, ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/lib/design-tokens";

const { width, height } = Dimensions.get("window");

type GradientBackgroundProps = {
  children: ReactNode;
  /** Whether to add safe area padding at the top (default: true) */
  safeAreaTop?: boolean;
  /** Whether to add safe area padding at the bottom (default: false, handled by tab bar) */
  safeAreaBottom?: boolean;
};

// Animated floating orb component
function FloatingOrb({
  color,
  size,
  initialX,
  initialY,
  delay,
}: {
  color: string;
  size: number;
  initialX: number;
  initialY: number;
  delay: number;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    // Horizontal movement
    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming(30, {
          duration: 8000,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      )
    );

    // Vertical movement
    translateY.value = withDelay(
      delay + 500,
      withRepeat(
        withTiming(40, {
          duration: 10000,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      )
    );

    // Opacity pulse
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0.6, {
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          width: size,
          height: size,
          left: initialX,
          top: initialY,
          backgroundColor: color,
          shadowColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

export function GradientBackground({
  children,
  safeAreaTop = true,
  safeAreaBottom = false,
}: GradientBackgroundProps) {
  const insets = useSafeAreaInsets();

  // Calculate padding based on safe area settings
  const contentStyle = {
    paddingTop: safeAreaTop ? insets.top : 0,
    paddingBottom: safeAreaBottom ? insets.bottom : 0,
  };

  return (
    <View style={styles.container}>
      {/* Configure status bar */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={Platform.OS === "android"}
      />

      {/* Main gradient */}
      <LinearGradient
        colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating orbs */}
      <FloatingOrb
        color={colors.primary}
        size={200}
        initialX={-50}
        initialY={100}
        delay={0}
      />
      <FloatingOrb
        color={colors.accent}
        size={150}
        initialX={width - 100}
        initialY={height * 0.4}
        delay={2000}
      />
      <FloatingOrb
        color={colors.primary}
        size={120}
        initialX={width * 0.3}
        initialY={height * 0.7}
        delay={4000}
      />
      <FloatingOrb
        color={colors.accent}
        size={80}
        initialX={width * 0.7}
        initialY={50}
        delay={1000}
      />

      {/* Content with safe area padding */}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  orb: {
    position: "absolute",
    borderRadius: 9999,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 60,
    elevation: 0, // Disable on Android for performance
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});

export default GradientBackground;
