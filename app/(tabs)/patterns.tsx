import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  RefreshControl,
} from "react-native";
import Animated, { FadeIn, FadeInUp, FadeInRight } from "react-native-reanimated";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { GradientBackground, GlassCard, GlowButton, Toast } from "@/components/ui";
import { PremiumModal } from "@/components/premium";
import { colors, typography, spacing, radius } from "@/lib/design-tokens";
import {
  analyzeDreamPatterns,
  getTrendIcon,
  getSymbolLabel,
  type DreamPatternAnalysis,
  type SymbolPattern,
  type MoodPattern,
} from "@/lib/patterns";
import { usePremium } from "@/contexts";
import { useToast } from "@/hooks/useToast";
import { lightTap } from "@/lib/haptics";

// Premium lock overlay component
function PremiumLock({ onUnlock }: { onUnlock: () => void }) {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.lockOverlay}>
      <View style={styles.lockContent}>
        <View style={styles.lockIcon}>
          <FontAwesome name="diamond" size={32} color={colors.accent} />
        </View>
        <Text style={styles.lockTitle}>Premium-ominaisuus</Text>
        <Text style={styles.lockSubtitle}>
          Unikuvioiden seuranta näyttää toistuvat teemat ja symbolit unissasi ajan myötä.
        </Text>
        <GlowButton variant="primary" size="md" onPress={onUnlock}>
          <Text style={styles.unlockButtonText}>Avaa Premium</Text>
        </GlowButton>
      </View>
    </Animated.View>
  );
}

// Symbol card component
function SymbolCard({ symbol, index }: { symbol: SymbolPattern; index: number }) {
  const trendIcon = getTrendIcon(symbol.trend);
  const trendColor =
    symbol.trend === "increasing"
      ? colors.success
      : symbol.trend === "decreasing"
      ? colors.error
      : colors.textMuted;

  return (
    <Animated.View entering={FadeInRight.delay(index * 100).duration(300)}>
      <GlassCard intensity="light" style={styles.symbolCard}>
        <View style={styles.symbolHeader}>
          <Text style={styles.symbolName}>{getSymbolLabel(symbol.symbol)}</Text>
          <View style={styles.symbolStats}>
            <Text style={styles.symbolCount}>{symbol.count}×</Text>
            <Text style={[styles.symbolTrend, { color: trendColor }]}>
              {trendIcon}
            </Text>
          </View>
        </View>
        <View style={styles.symbolBar}>
          <View
            style={[styles.symbolBarFill, { width: `${symbol.percentage}%` }]}
          />
        </View>
        <Text style={styles.symbolPercentage}>{symbol.percentage}% unista</Text>
      </GlassCard>
    </Animated.View>
  );
}

// Mood chip component
function MoodChip({ mood, index }: { mood: MoodPattern; index: number }) {
  return (
    <Animated.View entering={FadeInUp.delay(index * 50).duration(200)}>
      <View style={styles.moodChip}>
        <Text style={styles.moodEmoji}>{mood.emoji}</Text>
        <View>
          <Text style={styles.moodLabel}>{mood.moodLabel}</Text>
          <Text style={styles.moodCount}>{mood.percentage}%</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// Insight card component
function InsightCard({ insight, index }: { insight: string; index: number }) {
  return (
    <Animated.View entering={FadeInUp.delay(index * 100).duration(300)}>
      <View style={styles.insightCard}>
        <FontAwesome name="lightbulb-o" size={16} color={colors.accent} />
        <Text style={styles.insightText}>{insight}</Text>
      </View>
    </Animated.View>
  );
}

export default function PatternsScreen() {
  const [analysis, setAnalysis] = useState<DreamPatternAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast, showError, hideToast } = useToast();
  const { isPremium, isTrialActive, openPremiumModal, showPremiumModal, closePremiumModal } = usePremium();

  const hasPremiumAccess = isPremium || isTrialActive;

  // Load analysis
  const loadAnalysis = useCallback(async () => {
    try {
      const result = await analyzeDreamPatterns();
      setAnalysis(result);
    } catch (error) {
      console.error("Error loading patterns:", error);
      showError("Kuvioiden lataaminen epäonnistui");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [showError]);

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadAnalysis();
  }, [loadAnalysis]);

  // Render empty state
  if (!isLoading && analysis && analysis.totalDreams === 0) {
    return (
      <GradientBackground safeAreaTop={false}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <FontAwesome name="line-chart" size={48} color={colors.textDim} />
          </View>
          <Text style={styles.emptyTitle}>Ei vielä dataa</Text>
          <Text style={styles.emptySubtitle}>
            Kirjaa muutama uni nähdäksesi kuvioita ja trendejä unissasi.
          </Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* Premium modal */}
      <PremiumModal
        visible={showPremiumModal}
        onClose={closePremiumModal}
        source="locked_feature"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(400)}>
          <Text style={styles.header}>Unikuviot</Text>
          {analysis && (
            <Text style={styles.subheader}>
              Perustuu {analysis.totalDreams} uneen • {analysis.analyzedPeriodDays} päivän ajalta
            </Text>
          )}
        </Animated.View>

        {/* Premium lock or content */}
        {!hasPremiumAccess ? (
          <PremiumLock onUnlock={openPremiumModal} />
        ) : (
          <>
            {/* Stats overview */}
            {analysis && (
              <Animated.View entering={FadeInUp.delay(100).duration(400)}>
                <View style={styles.statsRow}>
                  <GlassCard intensity="medium" style={styles.statCard}>
                    <Text style={styles.statNumber}>
                      {analysis.timePatterns.averagePerWeek}
                    </Text>
                    <Text style={styles.statLabel}>unta/viikko</Text>
                  </GlassCard>
                  <GlassCard intensity="medium" style={styles.statCard}>
                    <Text style={styles.statNumber}>
                      {analysis.symbols.length}
                    </Text>
                    <Text style={styles.statLabel}>symbolia</Text>
                  </GlassCard>
                  <GlassCard intensity="medium" style={styles.statCard}>
                    <Text style={styles.statNumber}>
                      {analysis.recurringThemes.length}
                    </Text>
                    <Text style={styles.statLabel}>teemaa</Text>
                  </GlassCard>
                </View>
              </Animated.View>
            )}

            {/* Insights */}
            {analysis && analysis.insights.length > 0 && (
              <Animated.View entering={FadeInUp.delay(200).duration(400)}>
                <Text style={styles.sectionTitle}>Oivalluksia</Text>
                <View style={styles.insightsContainer}>
                  {analysis.insights.map((insight, index) => (
                    <InsightCard key={index} insight={insight} index={index} />
                  ))}
                </View>
              </Animated.View>
            )}

            {/* Top symbols */}
            {analysis && analysis.symbols.length > 0 && (
              <Animated.View entering={FadeInUp.delay(300).duration(400)}>
                <Text style={styles.sectionTitle}>Yleisimmät symbolit</Text>
                <View style={styles.symbolsContainer}>
                  {analysis.symbols.slice(0, 5).map((symbol, index) => (
                    <SymbolCard key={symbol.symbol} symbol={symbol} index={index} />
                  ))}
                </View>
              </Animated.View>
            )}

            {/* Mood distribution */}
            {analysis && analysis.moods.length > 0 && (
              <Animated.View entering={FadeInUp.delay(400).duration(400)}>
                <Text style={styles.sectionTitle}>Tunnetilat</Text>
                <GlassCard intensity="light" style={styles.moodsCard}>
                  <View style={styles.moodsGrid}>
                    {analysis.moods.map((mood, index) => (
                      <MoodChip key={mood.mood} mood={mood} index={index} />
                    ))}
                  </View>
                </GlassCard>
              </Animated.View>
            )}

            {/* Most active day */}
            {analysis && analysis.timePatterns.mostActiveDay && (
              <Animated.View entering={FadeInUp.delay(500).duration(400)}>
                <GlassCard intensity="light" style={styles.timeCard}>
                  <FontAwesome name="calendar" size={20} color={colors.primary} />
                  <View style={styles.timeContent}>
                    <Text style={styles.timeLabel}>Aktiivisin päivä</Text>
                    <Text style={styles.timeValue}>
                      {analysis.timePatterns.mostActiveDay}
                    </Text>
                  </View>
                </GlassCard>
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  // Header
  header: {
    fontFamily: typography.families.heading.bold,
    fontSize: typography.sizes.xxl + 4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subheader: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontFamily: typography.families.heading.semiBold,
    fontSize: typography.sizes.xl,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  // Premium lock
  lockOverlay: {
    marginTop: spacing.xl,
    alignItems: "center",
  },
  lockContent: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lockIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: `${colors.accent}20`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  lockTitle: {
    fontFamily: typography.families.heading.semiBold,
    fontSize: typography.sizes.lg,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  lockSubtitle: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.lg,
    maxWidth: 280,
  },
  unlockButtonText: {
    fontFamily: typography.families.body.semiBold,
    fontSize: typography.sizes.md,
    color: colors.white,
  },
  // Stats
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  statNumber: {
    fontFamily: typography.families.heading.bold,
    fontSize: typography.sizes.xxl,
    color: colors.primary,
  },
  statLabel: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  // Section title
  sectionTitle: {
    fontFamily: typography.families.body.semiBold,
    fontSize: typography.sizes.xs,
    color: colors.textDim,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  // Insights
  insightsContainer: {
    gap: spacing.sm,
  },
  insightCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: `${colors.accent}15`,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  insightText: {
    flex: 1,
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.sm,
    color: colors.text,
    lineHeight: 20,
  },
  // Symbols
  symbolsContainer: {
    gap: spacing.sm,
  },
  symbolCard: {
    padding: spacing.md,
  },
  symbolHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  symbolName: {
    fontFamily: typography.families.body.semiBold,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  symbolStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  symbolCount: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  symbolTrend: {
    fontFamily: typography.families.body.bold,
    fontSize: typography.sizes.md,
  },
  symbolBar: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: radius.xs,
    marginBottom: spacing.xs,
  },
  symbolBarFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.xs,
  },
  symbolPercentage: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.xs,
    color: colors.textDim,
  },
  // Moods
  moodsCard: {
    padding: spacing.md,
  },
  moodsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  moodChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodLabel: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  moodCount: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  // Time pattern
  timeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  timeContent: {
    flex: 1,
  },
  timeLabel: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  timeValue: {
    fontFamily: typography.families.body.semiBold,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
});
