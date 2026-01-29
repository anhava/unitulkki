import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  Share,
} from "react-native";
import { exportDreamAsPdf } from "@/lib/pdf-export";
import { usePremium } from "@/contexts";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { GlassCard, GlowButton, MarkdownContent, Badge } from "@/components/ui";
import { colors, typography, spacing, radius, animation } from "@/lib/design-tokens";
import { type Dream } from "@/lib/storage";
import { lightTap, successFeedback, warningFeedback } from "@/lib/haptics";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type DreamDetailModalProps = {
  dream: Dream | null;
  visible: boolean;
  onClose: () => void;
  onDelete: (dream: Dream) => void;
};

// Mood labels in Finnish
const moodLabels: Record<string, string> = {
  peaceful: "Rauhallinen",
  happy: "Iloinen",
  anxious: "Ahdistunut",
  sad: "Surullinen",
  confused: "Hämmentynyt",
  nostalgic: "Nostalginen",
  neutral: "Neutraali",
};

// Mood emojis
const moodEmojis: Record<string, string> = {
  peaceful: "😌",
  happy: "😊",
  anxious: "😰",
  sad: "😢",
  confused: "😕",
  nostalgic: "🕰️",
  neutral: "🌙",
};

// Format date in Finnish
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fi-FI", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("fi-FI", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DreamDetailModal({
  dream,
  visible,
  onClose,
  onDelete,
}: DreamDetailModalProps) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const [isExporting, setIsExporting] = useState(false);
  const { isPremium, isTrialActive, openPremiumModal } = usePremium();
  const hasPremiumAccess = isPremium || isTrialActive;

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 200,
      });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, translateY, backdropOpacity]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleShare = async () => {
    if (!dream) return;
    lightTap();

    try {
      await Share.share({
        message: `🌙 Uneni ${formatDate(dream.createdAt)}:\n\n${dream.content}\n\n✨ Tulkinta:\n${dream.interpretation}`,
        title: "Unitulkki - Unitulkinta",
      });
      successFeedback();
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleExportPdf = async () => {
    if (!dream) return;

    if (!hasPremiumAccess) {
      openPremiumModal();
      return;
    }

    lightTap();
    setIsExporting(true);
    try {
      await exportDreamAsPdf(dream);
      successFeedback();
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = () => {
    if (dream) {
      warningFeedback();
      onDelete(dream);
      onClose();
    }
  };

  const handleClose = () => {
    lightTap();
    onClose();
  };

  if (!dream) return null;

  return (
    <View style={[styles.container, { pointerEvents: visible ? "auto" : "none" }]}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      {/* Modal */}
      <Animated.View style={[styles.modal, modalStyle]}>
        <View style={styles.modalContent}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.moodEmoji}>
                {moodEmojis[dream.mood || "neutral"]}
              </Text>
              <View>
                <Text style={styles.moodLabel}>
                  {moodLabels[dream.mood || "neutral"]}
                </Text>
                <Text style={styles.date}>{formatDate(dream.createdAt)}</Text>
              </View>
            </View>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <FontAwesome name="times" size={20} color={colors.textDim} />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Dream content */}
            <GlassCard intensity="medium" style={styles.section}>
              <View style={styles.sectionHeader}>
                <FontAwesome name="moon-o" size={16} color={colors.accent} />
                <Text style={styles.sectionTitle}>Unesi</Text>
              </View>
              <Text style={styles.dreamContent}>{dream.content}</Text>
            </GlassCard>

            {/* Interpretation */}
            <GlassCard intensity="strong" withGradient style={styles.section}>
              <View style={styles.sectionHeader}>
                <FontAwesome name="magic" size={16} color={colors.primary} />
                <Text style={styles.sectionTitle}>Tulkinta</Text>
                <View style={styles.aiTag}>
                  <Text style={styles.aiTagText}>AI</Text>
                </View>
              </View>
              <MarkdownContent content={dream.interpretation} variant="interpretation" />
            </GlassCard>

            {/* Tags */}
            {dream.tags && dream.tags.length > 0 && (
              <View style={styles.tagsSection}>
                <Text style={styles.tagsTitle}>Teemat</Text>
                <View style={styles.tagsContainer}>
                  {dream.tags.map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Meta */}
            <View style={styles.metaSection}>
              <View style={styles.metaItem}>
                <FontAwesome name="clock-o" size={14} color={colors.textDim} />
                <Text style={styles.metaText}>
                  Tallennettu klo {formatTime(dream.createdAt)}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <GlowButton
              variant="ghost"
              size="sm"
              onPress={handleShare}
              style={styles.actionButton}
            >
              <FontAwesome name="share" size={16} color={colors.text} />
              <Text style={styles.actionText}>Jaa</Text>
            </GlowButton>
            <GlowButton
              variant="ghost"
              size="sm"
              onPress={handleExportPdf}
              disabled={isExporting}
              style={styles.actionButton}
            >
              <FontAwesome name="file-pdf-o" size={16} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>
                {isExporting ? "..." : "PDF"}
              </Text>
              {!hasPremiumAccess && (
                <FontAwesome name="diamond" size={10} color={colors.accent} />
              )}
            </GlowButton>
            <GlowButton
              variant="ghost"
              size="sm"
              onPress={handleDelete}
              style={{ ...styles.actionButton, ...styles.deleteButton }}
            >
              <FontAwesome name="trash" size={16} color="#EF4444" />
              <Text style={[styles.actionText, { color: "#EF4444" }]}>
                Poista
              </Text>
            </GlowButton>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modal: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.9,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    overflow: "hidden",
  },
  modalContent: {
    flex: 1,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radius.xs,
    backgroundColor: colors.textDim,
    opacity: 0.5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  moodEmoji: {
    fontSize: 36,
  },
  moodLabel: {
    fontFamily: typography.families.heading.semiBold,
    fontSize: typography.sizes.lg,
    color: colors.text,
  },
  date: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  section: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: typography.families.body.semiBold,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    flex: 1,
  },
  aiTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  aiTagText: {
    fontFamily: typography.families.body.bold,
    fontSize: typography.sizes.xs,
    color: colors.white,
  },
  dreamContent: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.md,
    lineHeight: 24,
    color: colors.text,
  },
  interpretation: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.md,
    lineHeight: 24,
    color: colors.text,
  },
  tagsSection: {
    marginBottom: spacing.md,
  },
  tagsTitle: {
    fontFamily: typography.families.body.semiBold,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: `${colors.primary}33`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
  },
  tagText: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.sm,
    color: colors.primary,
    textTransform: "capitalize",
  },
  metaSection: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  metaText: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.sm,
    color: colors.textDim,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.lg,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  deleteButton: {
    borderColor: `${colors.error}4D`,
  },
  actionText: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
});

export default DreamDetailModal;
