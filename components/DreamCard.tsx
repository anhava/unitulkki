import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { GlassCard } from "@/components/ui";
import { colors, typography, spacing, radius } from "@/lib/design-tokens";
import { type Dream } from "@/lib/storage";
import { lightTap, warningFeedback } from "@/lib/haptics";

type DreamCardProps = {
  dream: Dream;
  onPress: (dream: Dream) => void;
  onDelete: (dream: Dream) => void;
};

// Mood emoji mapping
const moodEmojis: Record<string, string> = {
  peaceful: "😌",
  happy: "😊",
  anxious: "😰",
  sad: "😢",
  confused: "😕",
  nostalgic: "🕰️",
  neutral: "🌙",
};

// Tag color mapping
const tagColors: Record<string, string> = {
  lentäminen: "#8B5CF6", // violet
  vesi: "#06B6D4", // cyan
  putoaminen: "#F59E0B", // amber
  jahtaaminen: "#EF4444", // red
  perhe: "#10B981", // emerald
  työ: "#3B82F6", // blue
  koulu: "#EC4899", // pink
  eläimet: "#84CC16", // lime
  kuolema: "#6B7280", // gray
  rakkaus: "#F43F5E", // rose
};

// Format date in Finnish
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Tänään";
  } else if (diffDays === 1) {
    return "Eilen";
  } else if (diffDays < 7) {
    return `${diffDays} päivää sitten`;
  } else {
    return date.toLocaleDateString("fi-FI", {
      day: "numeric",
      month: "short",
    });
  }
}

// Truncate text with ellipsis
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

const SWIPE_THRESHOLD = -80;

export function DreamCard({ dream, onPress, onDelete }: DreamCardProps) {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handleDelete = () => {
    warningFeedback();
    // Animate out
    itemHeight.value = withTiming(0, { duration: 300 });
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onDelete)(dream);
    });
  };

  const handlePress = () => {
    lightTap();
    onPress(dream);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow swiping left
      if (event.translationX < 0) {
        translateX.value = Math.max(event.translationX, -120);
      }
    })
    .onEnd((event) => {
      if (event.translationX < SWIPE_THRESHOLD) {
        // Swipe to delete
        translateX.value = withTiming(-400, { duration: 200 });
        runOnJS(handleDelete)();
      } else {
        // Snap back
        translateX.value = withSpring(0);
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    height: itemHeight.value === 1 ? "auto" : 0,
    opacity: opacity.value,
    overflow: "hidden",
  }));

  const deleteButtonStyle = useAnimatedStyle(() => ({
    opacity: Math.min(Math.abs(translateX.value) / 80, 1),
  }));

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      {/* Delete background */}
      <Animated.View style={[styles.deleteBackground, deleteButtonStyle]}>
        <FontAwesome name="trash" size={24} color={colors.white} />
        <Text style={styles.deleteText}>Poista</Text>
      </Animated.View>

      {/* Swipeable card */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedCardStyle}>
          <Pressable onPress={handlePress}>
            <GlassCard intensity="medium" withGradient style={styles.card}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.dateContainer}>
                  <FontAwesome
                    name="calendar-o"
                    size={12}
                    color={colors.textDim}
                  />
                  <Text style={styles.date}>{formatDate(dream.createdAt)}</Text>
                </View>
                <Text style={styles.moodEmoji}>
                  {moodEmojis[dream.mood || "neutral"]}
                </Text>
              </View>

              {/* Dream preview */}
              <Text style={styles.preview} numberOfLines={2}>
                {truncate(dream.content, 100)}
              </Text>

              {/* Interpretation preview */}
              <Text style={styles.interpretation} numberOfLines={2}>
                {truncate(dream.interpretation, 120)}
              </Text>

              {/* Tags */}
              {dream.tags && dream.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {dream.tags.map((tag) => (
                    <View
                      key={tag}
                      style={[
                        styles.tag,
                        { backgroundColor: `${tagColors[tag] || colors.primary}20` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tagText,
                          { color: tagColors[tag] || colors.primary },
                        ]}
                      >
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.readMore}>Lue lisää</Text>
                <FontAwesome
                  name="chevron-right"
                  size={12}
                  color={colors.textDim}
                />
              </View>
            </GlassCard>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  deleteBackground: {
    position: "absolute",
    right: spacing.md,
    top: 0,
    bottom: spacing.sm,
    width: 100,
    backgroundColor: colors.error,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  deleteText: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.xs,
    color: colors.white,
  },
  card: {
    padding: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  date: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.xs,
    color: colors.textDim,
  },
  moodEmoji: {
    fontSize: 20,
  },
  preview: {
    fontFamily: typography.families.body.semiBold,
    fontSize: typography.sizes.md,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  interpretation: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  tagText: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.xs,
    textTransform: "capitalize",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  readMore: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.xs,
    color: colors.textDim,
  },
});

export default DreamCard;
