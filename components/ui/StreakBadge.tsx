import { View, Text, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import { colors, typography, spacing, radius } from "@/lib/design-tokens";
import { getNextMilestone, getStreakMessage } from "@/lib/streak";

type StreakBadgeProps = {
  streak: number;
  longestStreak?: number;
  showMilestone?: boolean;
  compact?: boolean;
  style?: ViewStyle;
};

export function StreakBadge({
  streak,
  longestStreak,
  showMilestone = true,
  compact = false,
  style,
}: StreakBadgeProps) {
  const fireGlow = useSharedValue(0.6);
  const fireScale = useSharedValue(1);

  // Animate fire icon when streak is active
  useEffect(() => {
    if (streak > 0) {
      fireGlow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.6, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      fireScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [streak]);

  const animatedFireStyle = useAnimatedStyle(() => ({
    opacity: fireGlow.value,
    transform: [{ scale: fireScale.value }],
  }));

  const milestone = getNextMilestone(streak);
  const message = getStreakMessage(streak);

  if (compact) {
    return (
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[styles.compactContainer, style]}
      >
        <Animated.Text style={[styles.fireEmoji, animatedFireStyle]}>
          {streak > 0 ? "🔥" : "💤"}
        </Animated.Text>
        <Text style={styles.compactStreak}>{streak}</Text>
        <Text style={styles.compactLabel}>päivää</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[styles.container, style]}
    >
      {/* Streak header */}
      <View style={styles.header}>
        <Animated.Text style={[styles.fireEmoji, animatedFireStyle]}>
          {streak > 0 ? "🔥" : "💤"}
        </Animated.Text>
        <View style={styles.streakInfo}>
          <Text style={styles.streakNumber}>{streak}</Text>
          <Text style={styles.streakLabel}>
            {streak === 1 ? "päivän putki" : "päivän putki"}
          </Text>
        </View>
      </View>

      {/* Message */}
      <Text style={styles.message}>{message}</Text>

      {/* Progress to next milestone */}
      {showMilestone && milestone && streak > 0 && (
        <View style={styles.milestoneContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, (streak / milestone.target) * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.milestoneText}>
            {streak}/{milestone.target} → {milestone.label}
          </Text>
        </View>
      )}

      {/* Best streak */}
      {longestStreak !== undefined && longestStreak > streak && (
        <Text style={styles.bestStreak}>
          Paras putki: {longestStreak} päivää ⭐
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${colors.primary}10`,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.primary}20`,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  fireEmoji: {
    fontSize: 28,
  },
  streakInfo: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.xs,
  },
  streakNumber: {
    fontFamily: typography.families.heading.bold,
    fontSize: 32,
    color: colors.primary,
  },
  streakLabel: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
  },
  message: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.sm,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  milestoneContainer: {
    marginTop: spacing.xs,
  },
  progressTrack: {
    height: 6,
    backgroundColor: `${colors.primary}15`,
    borderRadius: radius.full,
    overflow: "hidden",
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  milestoneText: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.xs,
    color: colors.textDim,
  },
  bestStreak: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.xs,
    color: colors.accent,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  // Compact style
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: `${colors.primary}15`,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: `${colors.primary}25`,
  },
  compactStreak: {
    fontFamily: typography.families.heading.bold,
    fontSize: typography.sizes.md,
    color: colors.primary,
  },
  compactLabel: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
});

export default StreakBadge;
