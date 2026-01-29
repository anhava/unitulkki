import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ReactNode } from "react";

import { GlassCard } from "@/components/ui";
import { colors, typography, spacing, radius } from "@/lib/design-tokens";
import { lightTap } from "@/lib/haptics";

type InterpretationSectionProps = {
  title: string;
  icon: string;
  iconColor?: string;
  children: ReactNode;
  delay?: number;
  isPremium?: boolean;
  isLocked?: boolean;
  onUnlock?: () => void;
};

export function InterpretationSection({
  title,
  icon,
  iconColor = colors.primary,
  children,
  delay = 0,
  isPremium = false,
  isLocked = false,
  onUnlock,
}: InterpretationSectionProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    if (isLocked && onUnlock) {
      lightTap();
      onUnlock();
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(delay).springify()}
      style={animatedStyle}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={!isLocked}
      >
        <GlassCard
          intensity={isPremium ? "strong" : "medium"}
          withGradient={isPremium}
          style={styles.card}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
              <FontAwesome name={icon as any} size={16} color={iconColor} />
            </View>
            <Text style={styles.title}>{title}</Text>
            {isPremium && (
              <View style={styles.premiumBadge}>
                <FontAwesome name="star" size={10} color={colors.accent} />
                <Text style={styles.premiumText}>PRO</Text>
              </View>
            )}
          </View>

          {/* Content */}
          {isLocked ? (
            <View style={styles.lockedContent}>
              <FontAwesome name="lock" size={24} color={colors.textDim} />
              <Text style={styles.lockedText}>
                Avaa Premium nähdäksesi syvemmän analyysin
              </Text>
              <View style={styles.unlockButton}>
                <Text style={styles.unlockButtonText}>Avaa Premium</Text>
              </View>
            </View>
          ) : (
            <View style={styles.content}>{children}</View>
          )}
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontFamily: typography.families.heading.semiBold,
    fontSize: 16,
    color: colors.text,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${colors.accent}20`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  premiumText: {
    fontFamily: typography.families.body.bold,
    fontSize: 10,
    color: colors.accent,
  },
  content: {},
  lockedContent: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 12,
  },
  lockedText: {
    fontFamily: typography.families.body.regular,
    fontSize: 14,
    color: colors.textDim,
    textAlign: "center",
  },
  unlockButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  unlockButtonText: {
    fontFamily: typography.families.body.semiBold,
    fontSize: 14,
    color: colors.white,
  },
});

export default InterpretationSection;
