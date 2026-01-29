import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { colors, typography, spacing, radius } from "@/lib/design-tokens";
import { usePremium } from "@/contexts";
import { lightTap } from "@/lib/haptics";

type UsageMeterProps = {
  /** Compact mode for inline display */
  compact?: boolean;
  /** Show upgrade button */
  showUpgrade?: boolean;
  /** Custom styles */
  style?: object;
};

/**
 * UsageMeter - Displays remaining free interpretations
 *
 * Key conversion psychology:
 * - Shows concrete value being "used up"
 * - Creates urgency when low
 * - Naturally leads to premium consideration
 */
export function UsageMeter({ compact = false, showUpgrade = true, style }: UsageMeterProps) {
  const {
    isPremium,
    isTrialActive,
    interpretationsUsed,
    interpretationsLimit,
    trialDaysRemaining,
    openPremiumModal,
  } = usePremium();

  // Premium users don't see the meter
  if (isPremium) return null;

  // Trial users see trial status instead
  if (isTrialActive) {
    return (
      <Animated.View entering={FadeIn.duration(300)} style={[styles.container, style]}>
        <Pressable
          onPress={() => {
            lightTap();
            openPremiumModal();
          }}
          style={({ pressed }) => [
            styles.trialCard,
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.trialIcon}>
            <FontAwesome name="gift" size={16} color={colors.primary} />
          </View>
          <View style={styles.trialContent}>
            <Text style={styles.trialTitle}>Premium-kokeilu</Text>
            <Text style={styles.trialSubtitle}>
              {trialDaysRemaining} {trialDaysRemaining === 1 ? "päivä" : "päivää"} jäljellä
            </Text>
          </View>
          <FontAwesome name="chevron-right" size={12} color={colors.textDim} />
        </Pressable>
      </Animated.View>
    );
  }

  const remaining = interpretationsLimit - interpretationsUsed;
  const percentage = (interpretationsUsed / interpretationsLimit) * 100;
  const isLow = remaining <= 1;
  const isEmpty = remaining <= 0;

  // Compact inline version
  if (compact) {
    return (
      <Animated.View entering={FadeIn.duration(300)} style={[styles.compactContainer, style]}>
        <Pressable
          onPress={() => {
            lightTap();
            openPremiumModal();
          }}
          style={({ pressed }) => [
            styles.compactCard,
            isLow && styles.compactCardWarning,
            isEmpty && styles.compactCardEmpty,
            pressed && styles.cardPressed,
          ]}
        >
          <FontAwesome
            name={isEmpty ? "lock" : "moon-o"}
            size={12}
            color={isEmpty ? colors.error : isLow ? colors.warning : colors.textMuted}
          />
          <Text
            style={[
              styles.compactText,
              isLow && styles.compactTextWarning,
              isEmpty && styles.compactTextEmpty,
            ]}
          >
            {isEmpty ? "Tulkinnat loppu" : `${remaining}/${interpretationsLimit}`}
          </Text>
          {isEmpty && (
            <Text style={styles.compactUpgrade}>Päivitä</Text>
          )}
        </Pressable>
      </Animated.View>
    );
  }

  // Full version with progress bar
  return (
    <Animated.View entering={FadeIn.duration(300)} style={[styles.container, style]}>
      <Pressable
        onPress={() => {
          lightTap();
          openPremiumModal();
        }}
        style={({ pressed }) => [
          styles.card,
          isLow && styles.cardWarning,
          isEmpty && styles.cardEmpty,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <FontAwesome
              name={isEmpty ? "lock" : "moon-o"}
              size={16}
              color={isEmpty ? colors.error : isLow ? colors.warning : colors.primary}
            />
            <Text style={[styles.title, isEmpty && styles.titleEmpty]}>
              {isEmpty ? "Ilmaiset tulkinnat käytetty" : "Ilmaiset tulkinnat"}
            </Text>
          </View>
          <Text style={[styles.count, isLow && styles.countWarning, isEmpty && styles.countEmpty]}>
            {remaining}/{interpretationsLimit}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: `${Math.min(percentage, 100)}%` },
                isLow && styles.progressFillWarning,
                isEmpty && styles.progressFillEmpty,
              ]}
            />
          </View>
        </View>

        {/* Message & CTA */}
        <View style={styles.footer}>
          <Text style={styles.message}>
            {isEmpty
              ? "Päivitä Premiumiin rajattomia tulkintoja varten"
              : isLow
              ? "Viimeinen tulkinta! Harkitse päivitystä."
              : "Uusiutuu kuun alussa"}
          </Text>
          {showUpgrade && (isEmpty || isLow) && (
            <View style={styles.upgradeButton}>
              <FontAwesome name="diamond" size={10} color={colors.accent} />
              <Text style={styles.upgradeText}>Premium</Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {},
  // Full card styles
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardWarning: {
    borderColor: `${colors.warning}40`,
    backgroundColor: `${colors.warning}10`,
  },
  cardEmpty: {
    borderColor: `${colors.error}40`,
    backgroundColor: `${colors.error}10`,
  },
  cardPressed: {
    opacity: 0.85,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    fontFamily: typography.families.body.semiBold,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  titleEmpty: {
    color: colors.error,
  },
  count: {
    fontFamily: typography.families.heading.bold,
    fontSize: typography.sizes.lg,
    color: colors.primary,
  },
  countWarning: {
    color: colors.warning,
  },
  countEmpty: {
    color: colors.error,
  },
  // Progress bar
  progressContainer: {
    marginBottom: spacing.sm,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  progressFillWarning: {
    backgroundColor: colors.warning,
  },
  progressFillEmpty: {
    backgroundColor: colors.error,
  },
  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  message: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    flex: 1,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: `${colors.accent}20`,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  upgradeText: {
    fontFamily: typography.families.body.semiBold,
    fontSize: typography.sizes.xs,
    color: colors.accent,
  },
  // Compact styles
  compactContainer: {},
  compactCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compactCardWarning: {
    borderColor: `${colors.warning}40`,
    backgroundColor: `${colors.warning}10`,
  },
  compactCardEmpty: {
    borderColor: `${colors.error}40`,
    backgroundColor: `${colors.error}10`,
  },
  compactText: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  compactTextWarning: {
    color: colors.warning,
  },
  compactTextEmpty: {
    color: colors.error,
  },
  compactUpgrade: {
    fontFamily: typography.families.body.semiBold,
    fontSize: typography.sizes.xs,
    color: colors.accent,
    marginLeft: spacing.xs,
  },
  // Trial card styles
  trialCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.primary}15`,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  trialIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}20`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  trialContent: {
    flex: 1,
  },
  trialTitle: {
    fontFamily: typography.families.body.semiBold,
    fontSize: typography.sizes.sm,
    color: colors.primary,
  },
  trialSubtitle: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
});

export default UsageMeter;
