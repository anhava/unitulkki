import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";

import { colors, typography, spacing, radius } from "@/lib/design-tokens";
import { usePremium } from "@/contexts";
import { lightTap } from "@/lib/haptics";
import { PREMIUM_FEATURES } from "@/lib/premium";
import { Analytics } from "@/lib/analytics";

type UpsellVariant =
  | "deep_analysis"    // After interpretation - unlock deeper analysis
  | "patterns"         // In history - unlock pattern tracking
  | "export"           // When trying to export
  | "visualization"    // Unlock AI visualization
  | "limit_warning"    // Running low on free interpretations
  | "generic";         // General upgrade prompt

type PremiumUpsellProps = {
  /** Which feature to highlight */
  variant?: UpsellVariant;
  /** Compact inline style */
  compact?: boolean;
  /** Show after delay (ms) */
  delay?: number;
  /** Custom styles */
  style?: object;
  /** Called when dismissed */
  onDismiss?: () => void;
};

// Variant configurations
const VARIANTS: Record<UpsellVariant, {
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  iconColor: string;
  title: string;
  description: string;
  ctaText: string;
  gradientColors: [string, string];
}> = {
  deep_analysis: {
    icon: "diamond",
    iconColor: colors.accent,
    title: "Avaa syvempi analyysi",
    description: "Jungilainen arkkityyppianalyysi ja alitajunnan oivallukset",
    ctaText: "Näytä mitä saat",
    gradientColors: ["#6366F1", "#8B5CF6"],
  },
  patterns: {
    icon: "line-chart",
    iconColor: colors.primary,
    title: "Unikuviot odottavat",
    description: "Löydä toistuvat teemat ja symbolit unistasi",
    ctaText: "Avaa analyysi",
    gradientColors: ["#06B6D4", "#3B82F6"],
  },
  export: {
    icon: "file-pdf-o",
    iconColor: "#EF4444",
    title: "Vie unipäiväkirjasi",
    description: "Tallenna kauniina PDF-dokumenttina",
    ctaText: "Avaa vienti",
    gradientColors: ["#EF4444", "#F97316"],
  },
  visualization: {
    icon: "paint-brush",
    iconColor: "#EC4899",
    title: "Visualisoi unesi",
    description: "Luo tekoälykuvia unistasi",
    ctaText: "Kokeile nyt",
    gradientColors: ["#EC4899", "#8B5CF6"],
  },
  limit_warning: {
    icon: "exclamation-circle",
    iconColor: colors.warning,
    title: "Tulkinnat loppumassa",
    description: "Päivitä Premiumiin rajattomia tulkintoja varten",
    ctaText: "Katso vaihtoehdot",
    gradientColors: ["#F59E0B", "#EF4444"],
  },
  generic: {
    icon: "star",
    iconColor: colors.accent,
    title: "Unitulkki Premium",
    description: "Rajattomat tulkinnat ja kaikki ominaisuudet",
    ctaText: "Tutustu",
    gradientColors: ["#8B5CF6", "#6366F1"],
  },
};

/**
 * PremiumUpsell - Contextual upgrade prompts
 *
 * Conversion psychology:
 * - Appears at high-motivation moments (after interpretation)
 * - Shows specific value (not generic "upgrade")
 * - Soft CTA that doesn't feel pushy
 */
export function PremiumUpsell({
  variant = "generic",
  compact = false,
  delay = 0,
  style,
  onDismiss,
}: PremiumUpsellProps) {
  const { isPremium, isTrialActive, openPremiumModal } = usePremium();
  const config = VARIANTS[variant];

  // Shimmer animation for premium feel
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + shimmerValue.value * 0.3,
  }));

  // Don't show for premium users
  if (isPremium || isTrialActive) return null;

  const handlePress = () => {
    lightTap();
    // Track upsell tap for analytics
    Analytics.upsellTapped(variant);
    openPremiumModal();
  };

  // Compact inline version
  if (compact) {
    return (
      <Animated.View
        entering={FadeInUp.duration(400).delay(delay)}
        style={[styles.compactContainer, style]}
      >
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [
            styles.compactCard,
            pressed && styles.cardPressed,
          ]}
        >
          <FontAwesome name={config.icon} size={14} color={config.iconColor} />
          <Text style={styles.compactTitle}>{config.title}</Text>
          <FontAwesome name="chevron-right" size={10} color={colors.textDim} />
        </Pressable>
      </Animated.View>
    );
  }

  // Full banner version
  return (
    <Animated.View
      entering={FadeInUp.duration(500).delay(delay)}
      style={[styles.container, style]}
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
      >
        <LinearGradient
          colors={[`${config.gradientColors[0]}15`, `${config.gradientColors[1]}08`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />

        {/* Shimmer effect */}
        <Animated.View style={[styles.shimmer, shimmerStyle]}>
          <LinearGradient
            colors={["transparent", `${config.gradientColors[0]}20`, "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Content */}
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: `${config.iconColor}20` }]}>
            <FontAwesome name={config.icon} size={20} color={config.iconColor} />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>{config.title}</Text>
            <Text style={styles.description}>{config.description}</Text>
          </View>

          <View style={styles.ctaContainer}>
            <LinearGradient
              colors={config.gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaButton}
            >
              <Text style={styles.ctaText}>{config.ctaText}</Text>
              <FontAwesome name="chevron-right" size={10} color={colors.white} />
            </LinearGradient>
          </View>
        </View>

        {/* Dismiss button (optional) */}
        {onDismiss && (
          <Pressable
            onPress={() => {
              lightTap();
              onDismiss();
            }}
            style={styles.dismissButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <FontAwesome name="times" size={12} color={colors.textDim} />
          </Pressable>
        )}
      </Pressable>
    </Animated.View>
  );
}

// Specialized upsell for locked features shown inline
export function LockedFeatureBanner({
  featureId,
  style,
}: {
  featureId: string;
  style?: object;
}) {
  const { openPremiumModal } = usePremium();
  const feature = PREMIUM_FEATURES.find((f) => f.id === featureId);

  if (!feature) return null;

  return (
    <Animated.View entering={FadeInUp.duration(400)} style={[styles.lockedContainer, style]}>
      <Pressable
        onPress={() => {
          lightTap();
          Analytics.lockedFeatureTapped(featureId);
          openPremiumModal();
        }}
        style={({ pressed }) => [
          styles.lockedCard,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.lockedIcon}>
          <FontAwesome name="lock" size={16} color={colors.textDim} />
        </View>
        <View style={styles.lockedContent}>
          <Text style={styles.lockedTitle}>{feature.title}</Text>
          <Text style={styles.lockedDescription}>{feature.description}</Text>
        </View>
        <View style={styles.lockedBadge}>
          <FontAwesome name="diamond" size={10} color={colors.accent} />
          <Text style={styles.lockedBadgeText}>Premium</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {},
  card: {
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: typography.families.body.semiBold,
    fontSize: typography.sizes.md,
    color: colors.text,
    marginBottom: 2,
  },
  description: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    lineHeight: 16,
  },
  ctaContainer: {},
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  ctaText: {
    fontFamily: typography.families.body.semiBold,
    fontSize: typography.sizes.xs,
    color: colors.white,
  },
  dismissButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  // Compact styles
  compactContainer: {},
  compactCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compactTitle: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.sm,
    color: colors.text,
    flex: 1,
  },
  // Locked feature styles
  lockedContainer: {},
  lockedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.surface}80`,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  lockedIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  lockedContent: {
    flex: 1,
  },
  lockedTitle: {
    fontFamily: typography.families.body.semiBold,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginBottom: 2,
  },
  lockedDescription: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.xs,
    color: colors.textDim,
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: `${colors.accent}15`,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  lockedBadgeText: {
    fontFamily: typography.families.body.semiBold,
    fontSize: typography.sizes.xs,
    color: colors.accent,
  },
});

export default PremiumUpsell;
