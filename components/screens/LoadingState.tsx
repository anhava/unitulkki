import { useEffect, useState } from "react";
import { View, Text, ViewStyle, TextStyle } from "react-native";
import Animated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { GlassCard } from "@/components/ui";
import { colors, typography, spacing, radius } from "@/lib/design-tokens";

interface LoadingStateProps {
  progress: number;
}

// Calming messages that rotate during loading
const LOADING_MESSAGES = [
  { emoji: "🌙", text: "Sukeltaudun unimaailmaasi..." },
  { emoji: "✨", text: "Etsin symboleja ja merkityksiä..." },
  { emoji: "🔮", text: "Tulkitsen piilotettuja viestejä..." },
  { emoji: "🌊", text: "Yhdistän tunteita ja muistoja..." },
  { emoji: "🌟", text: "Viimeistelen tulkintaa..." },
];

// Floating orb component with gentle animation
function FloatingOrb() {
  const floatY = useSharedValue(0);
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.3);

  useEffect(() => {
    // Gentle floating motion
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(8, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Subtle breathing scale
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Pulsing glow
    glow.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { scale: scale.value },
    ],
    shadowOpacity: glow.value,
  }));

  return (
    <Animated.View style={[styles.orbContainer, animatedStyle]}>
      <View style={styles.orbInner}>
        <Text style={styles.orbEmoji}>🌙</Text>
      </View>
      <View style={styles.orbRing} />
      <View style={styles.orbRingOuter} />
    </Animated.View>
  );
}

// Animated dots for "thinking" indicator
function ThinkingDots() {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const duration = 600;
    const delay = 200;

    dot1.value = withRepeat(
      withSequence(
        withTiming(1, { duration }),
        withTiming(0, { duration })
      ),
      -1
    );

    setTimeout(() => {
      dot2.value = withRepeat(
        withSequence(
          withTiming(1, { duration }),
          withTiming(0, { duration })
        ),
        -1
      );
    }, delay);

    setTimeout(() => {
      dot3.value = withRepeat(
        withSequence(
          withTiming(1, { duration }),
          withTiming(0, { duration })
        ),
        -1
      );
    }, delay * 2);
  }, []);

  const dotStyle1 = useAnimatedStyle(() => ({
    opacity: interpolate(dot1.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(dot1.value, [0, 1], [0.8, 1.2]) }],
  }));

  const dotStyle2 = useAnimatedStyle(() => ({
    opacity: interpolate(dot2.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(dot2.value, [0, 1], [0.8, 1.2]) }],
  }));

  const dotStyle3 = useAnimatedStyle(() => ({
    opacity: interpolate(dot3.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(dot3.value, [0, 1], [0.8, 1.2]) }],
  }));

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, dotStyle1]} />
      <Animated.View style={[styles.dot, dotStyle2]} />
      <Animated.View style={[styles.dot, dotStyle3]} />
    </View>
  );
}

export function LoadingState({ progress }: LoadingStateProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  // Rotate through messages based on progress
  useEffect(() => {
    const newIndex = Math.min(
      Math.floor(progress / 25),
      LOADING_MESSAGES.length - 1
    );
    if (newIndex !== messageIndex) {
      setMessageIndex(newIndex);
    }
  }, [progress, messageIndex]);

  const currentMessage = LOADING_MESSAGES[messageIndex];

  return (
    <Animated.View entering={FadeIn.duration(500)} style={styles.container}>
      {/* Floating moon orb */}
      <FloatingOrb />

      {/* Message card */}
      <Animated.View
        key={messageIndex}
        entering={FadeInUp.duration(400)}
        style={styles.messageContainer}
      >
        <GlassCard intensity="medium" style={styles.messageCard}>
          <Text style={styles.messageEmoji}>{currentMessage.emoji}</Text>
          <Text style={styles.messageText}>{currentMessage.text}</Text>
          <ThinkingDots />
        </GlassCard>
      </Animated.View>

      {/* Subtle progress indicator (no percentage) */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              { width: `${progress}%` },
            ]}
          />
        </View>
      </View>

      {/* Calming hint */}
      <Animated.Text
        entering={FadeIn.delay(1000).duration(500)}
        style={styles.hint}
      >
        Hengitä syvään ja rentoudu...
      </Animated.Text>
    </Animated.View>
  );
}

const styles = {
  container: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  } as ViewStyle,

  // Floating orb
  orbContainer: {
    width: 120,
    height: 120,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: spacing.xl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 30,
    elevation: 10,
  } as ViewStyle,
  orbInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary}20`,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 2,
    borderColor: `${colors.primary}40`,
  } as ViewStyle,
  orbEmoji: {
    fontSize: 40,
  } as TextStyle,
  orbRing: {
    position: "absolute" as const,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: `${colors.primary}20`,
  } as ViewStyle,
  orbRingOuter: {
    position: "absolute" as const,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: `${colors.primary}10`,
  } as ViewStyle,

  // Message card
  messageContainer: {
    width: "100%" as const,
    maxWidth: 300,
    marginBottom: spacing.lg,
  } as ViewStyle,
  messageCard: {
    alignItems: "center" as const,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  } as ViewStyle,
  messageEmoji: {
    fontSize: 28,
    marginBottom: spacing.sm,
  } as TextStyle,
  messageText: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.md,
    color: colors.text,
    textAlign: "center" as const,
    marginBottom: spacing.md,
  } as TextStyle,

  // Thinking dots
  dotsContainer: {
    flexDirection: "row" as const,
    gap: spacing.sm,
  } as ViewStyle,
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  } as ViewStyle,

  // Progress
  progressContainer: {
    width: "60%" as const,
    marginBottom: spacing.lg,
  } as ViewStyle,
  progressTrack: {
    height: 4,
    backgroundColor: `${colors.primary}15`,
    borderRadius: radius.full,
    overflow: "hidden" as const,
  } as ViewStyle,
  progressFill: {
    height: "100%" as const,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  } as ViewStyle,

  // Hint
  hint: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.sm,
    color: colors.textDim,
    fontStyle: "italic" as const,
  } as TextStyle,
};
