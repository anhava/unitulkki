import { View, Text, StyleSheet, Pressable, Share, ViewStyle } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { colors, typography, spacing, radius } from "@/lib/design-tokens";
import { lightTap, successFeedback } from "@/lib/haptics";

type QuickAction = {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
};

type QuickActionsProps = {
  actions: QuickAction[];
  style?: ViewStyle;
  delay?: number;
};

export function QuickActions({ actions, style, delay = 0 }: QuickActionsProps) {
  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(delay)}
      style={[styles.container, style]}
    >
      {actions.map((action, index) => (
        <Pressable
          key={index}
          onPress={() => {
            lightTap();
            action.onPress();
          }}
          disabled={action.disabled}
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionButtonPressed,
            action.disabled && styles.actionButtonDisabled,
          ]}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${action.color}15` },
            ]}
          >
            <FontAwesome
              name={action.icon as any}
              size={18}
              color={action.disabled ? colors.textDim : action.color}
            />
          </View>
          <Text
            style={[
              styles.actionLabel,
              action.disabled && styles.actionLabelDisabled,
            ]}
          >
            {action.label}
          </Text>
        </Pressable>
      ))}
    </Animated.View>
  );
}

// Pre-built quick action configurations
export function useInterpretationActions({
  onSave,
  onNewDream,
  onShare,
  dreamContent,
  interpretation,
  isSaved = false,
}: {
  onSave?: () => void;
  onNewDream: () => void;
  onShare?: () => void;
  dreamContent: string;
  interpretation: string;
  isSaved?: boolean;
}): QuickAction[] {
  const handleShare = async () => {
    try {
      await Share.share({
        message: `🌙 Uneni:\n${dreamContent}\n\n✨ Tulkinta:\n${interpretation}\n\n— Unitulkki`,
        title: "Jaa unesi tulkinta",
      });
      successFeedback();
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const actions: QuickAction[] = [];

  // Only show save button if onSave is provided and not already saved
  if (onSave && !isSaved) {
    actions.push({
      icon: "bookmark-o",
      label: "Tallenna",
      color: colors.success,
      onPress: onSave,
    });
  }

  // Show saved indicator if already saved
  if (isSaved) {
    actions.push({
      icon: "bookmark",
      label: "Tallennettu",
      color: colors.success,
      onPress: () => {},
      disabled: true,
    });
  }

  // New dream action
  actions.push({
    icon: "plus",
    label: "Uusi uni",
    color: colors.primary,
    onPress: onNewDream,
  });

  // Share action
  actions.push({
    icon: "share",
    label: "Jaa",
    color: colors.accent,
    onPress: onShare || handleShare,
  });

  return actions;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: `${colors.surface}50`,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButton: {
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  actionButtonPressed: {
    backgroundColor: `${colors.surface}80`,
    transform: [{ scale: 0.95 }],
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.xs,
    color: colors.text,
  },
  actionLabelDisabled: {
    color: colors.textDim,
  },
});

export default QuickActions;
