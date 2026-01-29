import { View, Text, ViewStyle, TextStyle } from "react-native";
import Animated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect, useState } from "react";
import { colors, typography, spacing, radius } from "@/lib/design-tokens";
import { UsageMeter } from "@/components/premium";
import { StreakBadge } from "@/components/ui";
import { getStreakData, type StreakData } from "@/lib/streak";

interface WelcomeScreenProps {
  setInputValue: (value: string) => void;
}

// Animated moon icon with gentle glow
function AnimatedMoon() {
  const glow = useSharedValue(0.2);
  const scale = useSharedValue(1);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.98, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: glow.value,
  }));

  return (
    <Animated.View style={[styles.moonIcon, animatedStyle]}>
      <Text style={styles.moonEmoji}>🌙</Text>
    </Animated.View>
  );
}

export function WelcomeScreen({ setInputValue }: WelcomeScreenProps) {
  const [streakData, setStreakData] = useState<StreakData | null>(null);

  // Load streak data on mount
  useEffect(() => {
    getStreakData().then(setStreakData);
  }, []);

  return (
    <View style={styles.welcomeContainer}>
      {/* Hero Section with staggered animations */}
      <Animated.View
        entering={FadeIn.duration(800)}
        style={styles.heroContent}
      >
        <AnimatedMoon />

        <Animated.Text
          entering={FadeInUp.delay(200).duration(600)}
          style={styles.welcomeTitle}
        >
          Unitulkki
        </Animated.Text>

        <Animated.Text
          entering={FadeInUp.delay(400).duration(600)}
          style={styles.welcomeSubtitle}
        >
          Kerro unesi ja anna tekoälyn{"\n"}paljastaa sen merkitykset
        </Animated.Text>
      </Animated.View>

      {/* Decorative divider */}
      <Animated.View
        entering={FadeIn.delay(600).duration(400)}
        style={styles.divider}
      >
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>✨</Text>
        <View style={styles.dividerLine} />
      </Animated.View>

      {/* Streak Badge - shows streak progress */}
      {streakData && (
        <Animated.View
          entering={FadeInUp.delay(700).duration(600)}
          style={styles.streakContainer}
        >
          <StreakBadge
            streak={streakData.currentStreak}
            longestStreak={streakData.longestStreak}
            showMilestone={true}
          />
        </Animated.View>
      )}

      {/* Usage Meter with fade in */}
      <Animated.View
        entering={FadeInUp.delay(900).duration(600)}
        style={styles.meterContainer}
      >
        <UsageMeter style={styles.usageMeter} />
      </Animated.View>

      {/* Hint text */}
      <Animated.Text
        entering={FadeIn.delay(1100).duration(500)}
        style={styles.hintText}
      >
        Kirjoita tai sano unesi alla olevaan kenttään
      </Animated.Text>
    </View>
  );
}

const styles = {
  welcomeContainer: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    minHeight: 420,
  } as ViewStyle,

  heroContent: {
    alignItems: "center" as const,
    marginBottom: spacing.xl,
  } as ViewStyle,

  moonIcon: {
    width: 110,
    height: 110,
    borderRadius: radius.full,
    backgroundColor: `${colors.primary}12`,
    borderWidth: 2,
    borderColor: `${colors.primary}25`,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 30,
    elevation: 10,
  } as ViewStyle,

  moonEmoji: {
    fontSize: 52,
  } as TextStyle,

  welcomeTitle: {
    fontFamily: typography.families.heading.bold,
    fontSize: 48,
    color: colors.white,
    marginBottom: spacing.sm,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: -1,
  } as TextStyle,

  welcomeSubtitle: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.lg,
    color: colors.textMuted,
    textAlign: "center" as const,
    lineHeight: 28,
  } as TextStyle,

  // Decorative divider
  divider: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: spacing.xl,
    width: "60%" as const,
  } as ViewStyle,

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: `${colors.primary}20`,
  } as ViewStyle,

  dividerText: {
    fontSize: 16,
    marginHorizontal: spacing.md,
  } as TextStyle,

  // Streak badge
  streakContainer: {
    width: "100%" as const,
    maxWidth: 340,
    marginBottom: spacing.md,
  } as ViewStyle,

  // Usage meter
  meterContainer: {
    width: "100%" as const,
    maxWidth: 340,
    marginBottom: spacing.lg,
  } as ViewStyle,

  usageMeter: {
    width: "100%" as const,
  } as ViewStyle,

  // Hint
  hintText: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.sm,
    color: colors.textDim,
    textAlign: "center" as const,
  } as TextStyle,
};
