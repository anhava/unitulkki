import { View, Text, StyleSheet, ScrollView } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { GlassCard } from "@/components/ui";
import { PremiumUpsell, LockedFeatureBanner } from "@/components/premium";
import { colors, typography, spacing, radius } from "@/lib/design-tokens";
import {
  type DreamInterpretation,
  moodEmojis,
  moodLabels,
  lifeAreaConfig,
  relevanceColors,
} from "@/lib/schemas/dreamInterpretation";
import { InterpretationSection } from "./InterpretationSection";

// Deep partial for streaming objects
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

type DreamInterpretationViewProps = {
  interpretation: DeepPartial<DreamInterpretation>;
  dreamContent: string;
  isLoading?: boolean;
  progress?: number;
  isPremiumUser?: boolean;
  onUnlockPremium?: () => void;
  footer?: React.ReactNode;
};

export function DreamInterpretationView({
  interpretation,
  dreamContent,
  isLoading = false,
  progress = 0,
  isPremiumUser = false,
  onUnlockPremium,
  footer,
}: DreamInterpretationViewProps) {
  const mood = interpretation.mood || "neutral";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Dream Content Card */}
      <Animated.View entering={FadeInUp.duration(300)}>
        <GlassCard intensity="light" style={styles.dreamCard}>
          <View style={styles.dreamHeader}>
            <Text style={styles.moodEmoji}>{moodEmojis[mood]}</Text>
            <View style={styles.dreamMeta}>
              <Text style={styles.dreamLabel}>Unesi</Text>
              {interpretation.mood && (
                <Text style={styles.moodLabel}>{moodLabels[mood]}</Text>
              )}
            </View>
          </View>
          <Text style={styles.dreamText}>{dreamContent}</Text>
        </GlassCard>
      </Animated.View>

      {/* Progress indicator during loading */}
      {isLoading && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>Analysoidaan... {progress}%</Text>
        </Animated.View>
      )}

      {/* Summary */}
      {interpretation.summary && (
        <InterpretationSection
          title="Yhteenveto"
          icon="lightbulb-o"
          iconColor="#F59E0B"
          delay={100}
        >
          <Text style={styles.summaryText}>{interpretation.summary}</Text>
          {interpretation.confidence && (
            <View style={styles.confidenceBadge}>
              <FontAwesome
                name="check-circle"
                size={12}
                color={
                  interpretation.confidence === "high"
                    ? "#10B981"
                    : interpretation.confidence === "medium"
                    ? "#F59E0B"
                    : "#6B7280"
                }
              />
              <Text style={styles.confidenceText}>
                {interpretation.confidence === "high"
                  ? "Vahva tulkinta"
                  : interpretation.confidence === "medium"
                  ? "Kohtuullinen tulkinta"
                  : "Yleinen tulkinta"}
              </Text>
            </View>
          )}
        </InterpretationSection>
      )}

      {/* Symbols */}
      {interpretation.symbols && interpretation.symbols.length > 0 && (
        <InterpretationSection
          title="Symbolit"
          icon="puzzle-piece"
          iconColor="#8B5CF6"
          delay={200}
        >
          <View style={styles.symbolsGrid}>
            {interpretation.symbols.map((symbol, index) => {
              if (!symbol) return null;
              return (
                <View key={index} style={styles.symbolCard}>
                  <View style={styles.symbolHeader}>
                    <View
                      style={[
                        styles.relevanceDot,
                        { backgroundColor: symbol.relevance ? relevanceColors[symbol.relevance] : colors.textDim },
                      ]}
                    />
                    <Text style={styles.symbolName}>{symbol.symbol || ""}</Text>
                  </View>
                  <Text style={styles.symbolMeaning}>{symbol.meaning || ""}</Text>
                </View>
              );
            })}
          </View>
        </InterpretationSection>
      )}

      {/* Emotional Analysis */}
      {interpretation.emotionalAnalysis && (
        <InterpretationSection
          title="Tunnemaailma"
          icon="heart"
          iconColor="#EC4899"
          delay={300}
        >
          <View style={styles.emotionContent}>
            <View style={styles.primaryEmotion}>
              <Text style={styles.emotionLabel}>Päätunne</Text>
              <Text style={styles.emotionValue}>
                {interpretation.emotionalAnalysis.primaryEmotion}
              </Text>
            </View>
            {interpretation.emotionalAnalysis.secondaryEmotions && interpretation.emotionalAnalysis.secondaryEmotions.length > 0 && (
              <View style={styles.secondaryEmotions}>
                {interpretation.emotionalAnalysis.secondaryEmotions.map(
                  (emotion, index) => emotion ? (
                    <View key={index} style={styles.emotionTag}>
                      <Text style={styles.emotionTagText}>{emotion}</Text>
                    </View>
                  ) : null
                )}
              </View>
            )}
            <Text style={styles.subconscious}>
              {interpretation.emotionalAnalysis.subconscious}
            </Text>
            {interpretation.emotionalAnalysis.jungianPerspective && (
              <View style={styles.jungianBox}>
                <FontAwesome name="quote-left" size={12} color={colors.textDim} />
                <Text style={styles.jungianText}>
                  {interpretation.emotionalAnalysis.jungianPerspective}
                </Text>
              </View>
            )}
          </View>
        </InterpretationSection>
      )}

      {/* Life Connections */}
      {interpretation.lifeConnections && interpretation.lifeConnections.length > 0 && (
        <InterpretationSection
          title="Yhteydet elämään"
          icon="link"
          iconColor="#10B981"
          delay={400}
        >
          <View style={styles.connectionsContainer}>
            {interpretation.lifeConnections.map((connection, index) => {
              if (!connection || !connection.area) return null;
              const config = lifeAreaConfig[connection.area];
              if (!config) return null;
              return (
                <View key={index} style={styles.connectionCard}>
                  <View
                    style={[
                      styles.connectionIcon,
                      { backgroundColor: `${config.color}20` },
                    ]}
                  >
                    <FontAwesome
                      name={config.icon as any}
                      size={14}
                      color={config.color}
                    />
                  </View>
                  <View style={styles.connectionContent}>
                    <Text style={[styles.connectionArea, { color: config.color }]}>
                      {config.label}
                    </Text>
                    <Text style={styles.connectionInsight}>{connection.insight || ""}</Text>
                    {connection.actionSuggestion && (
                      <View style={styles.actionSuggestion}>
                        <FontAwesome name="arrow-right" size={10} color={colors.accent} />
                        <Text style={styles.actionText}>
                          {connection.actionSuggestion}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </InterpretationSection>
      )}

      {/* Key Message */}
      {interpretation.keyMessage && (
        <InterpretationSection
          title="Avainviesti"
          icon="star"
          iconColor="#F59E0B"
          delay={500}
        >
          <View style={styles.keyMessageContainer}>
            <Text style={styles.keyMessageText}>{interpretation.keyMessage}</Text>
          </View>
        </InterpretationSection>
      )}

      {/* Reflection Questions */}
      {interpretation.reflectionQuestions && interpretation.reflectionQuestions.length > 0 && (
        <InterpretationSection
          title="Pohdittavaa"
          icon="question-circle"
          iconColor="#6366F1"
          delay={600}
        >
          <View style={styles.questionsContainer}>
            {interpretation.reflectionQuestions.map((question, index) => (
              <View key={index} style={styles.questionCard}>
                <Text style={styles.questionNumber}>{index + 1}</Text>
                <Text style={styles.questionText}>{question}</Text>
              </View>
            ))}
          </View>
        </InterpretationSection>
      )}

      {/* Premium Deep Analysis (locked for non-premium) */}
      {interpretation.premium && (
        <InterpretationSection
          title="Syvempi analyysi"
          icon="diamond"
          iconColor={colors.accent}
          delay={700}
          isPremium
          isLocked={!isPremiumUser}
          onUnlock={onUnlockPremium}
        >
          {isPremiumUser && (
            <View style={styles.premiumContent}>
              <Text style={styles.premiumText}>
                {interpretation.premium.deepAnalysis}
              </Text>
              {interpretation.premium.archetypeConnection && (
                <View style={styles.archetypeBox}>
                  <Text style={styles.archetypeLabel}>Arkkityyppi</Text>
                  <Text style={styles.archetypeText}>
                    {interpretation.premium.archetypeConnection}
                  </Text>
                </View>
              )}
            </View>
          )}
        </InterpretationSection>
      )}

      {/* Tags */}
      {interpretation.tags && interpretation.tags.length > 0 && (
        <Animated.View
          entering={FadeInUp.duration(300).delay(800)}
          style={styles.tagsContainer}
        >
          <Text style={styles.tagsLabel}>Teemat</Text>
          <View style={styles.tagsRow}>
            {interpretation.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Premium Upsell Banner - shown after interpretation for non-premium users */}
      {!isPremiumUser && !isLoading && interpretation.summary && (
        <PremiumUpsell
          variant="deep_analysis"
          delay={850}
          style={styles.upsellBanner}
        />
      )}

      {/* Footer disclaimer */}
      <Animated.View
        entering={FadeIn.duration(300).delay(900)}
        style={styles.disclaimer}
      >
        <FontAwesome name="info-circle" size={12} color={colors.textDim} />
        <Text style={styles.disclaimerText}>
          Unitulkinnat ovat suuntaa-antavia ja perustuvat yleiseen symboliikkaan.
          Henkilökohtainen merkitys voi vaihdella.
        </Text>
      </Animated.View>

      {/* Optional footer (e.g., new dream button) */}
      {footer}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  // Dream card
  dreamCard: {
    padding: 16,
    marginBottom: 16,
  },
  dreamHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  moodEmoji: {
    fontSize: 32,
  },
  dreamMeta: {
    flex: 1,
  },
  dreamLabel: {
    fontFamily: typography.families.body.medium,
    fontSize: 12,
    color: colors.textDim,
  },
  moodLabel: {
    fontFamily: typography.families.heading.semiBold,
    fontSize: 16,
    color: colors.text,
  },
  dreamText: {
    fontFamily: typography.families.body.regular,
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
  },
  // Progress
  progressContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontFamily: typography.families.body.medium,
    fontSize: 12,
    color: colors.textDim,
    marginTop: 8,
  },
  // Summary
  summaryText: {
    fontFamily: typography.families.body.medium,
    fontSize: 16,
    lineHeight: 26,
    color: colors.text,
  },
  confidenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  confidenceText: {
    fontFamily: typography.families.body.regular,
    fontSize: 12,
    color: colors.textDim,
  },
  // Symbols
  symbolsGrid: {
    gap: 10,
  },
  symbolCard: {
    backgroundColor: `${colors.primary}10`,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  symbolHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  relevanceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  symbolName: {
    fontFamily: typography.families.heading.semiBold,
    fontSize: 15,
    color: colors.text,
    textTransform: "capitalize",
  },
  symbolMeaning: {
    fontFamily: typography.families.body.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
  },
  // Emotions
  emotionContent: {
    gap: 12,
  },
  primaryEmotion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: `${colors.primary}10`,
    padding: 12,
    borderRadius: 12,
  },
  emotionLabel: {
    fontFamily: typography.families.body.medium,
    fontSize: 13,
    color: colors.textDim,
  },
  emotionValue: {
    fontFamily: typography.families.heading.semiBold,
    fontSize: 16,
    color: colors.primary,
    textTransform: "capitalize",
  },
  secondaryEmotions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  emotionTag: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  emotionTagText: {
    fontFamily: typography.families.body.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  subconscious: {
    fontFamily: typography.families.body.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
  },
  jungianBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
  },
  jungianText: {
    flex: 1,
    fontFamily: typography.families.body.regular,
    fontStyle: "italic",
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },
  // Connections
  connectionsContainer: {
    gap: 12,
  },
  connectionCard: {
    flexDirection: "row",
    gap: 12,
  },
  connectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  connectionContent: {
    flex: 1,
  },
  connectionArea: {
    fontFamily: typography.families.body.semiBold,
    fontSize: 13,
    marginBottom: 4,
  },
  connectionInsight: {
    fontFamily: typography.families.body.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
  },
  actionSuggestion: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
  },
  actionText: {
    fontFamily: typography.families.body.medium,
    fontSize: 13,
    color: colors.accent,
  },
  // Key message
  keyMessageContainer: {
    backgroundColor: `${colors.accent}15`,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${colors.accent}30`,
  },
  keyMessageText: {
    fontFamily: typography.families.body.medium,
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
    textAlign: "center",
  },
  // Questions
  questionsContainer: {
    gap: 10,
  },
  questionCard: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  questionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    textAlign: "center",
    lineHeight: 24,
    fontFamily: typography.families.body.bold,
    fontSize: 12,
    color: colors.white,
  },
  questionText: {
    flex: 1,
    fontFamily: typography.families.body.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
  },
  // Premium
  premiumContent: {
    gap: 12,
  },
  premiumText: {
    fontFamily: typography.families.body.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
  },
  archetypeBox: {
    backgroundColor: `${colors.accent}15`,
    padding: 12,
    borderRadius: 10,
  },
  archetypeLabel: {
    fontFamily: typography.families.body.semiBold,
    fontSize: 12,
    color: colors.accent,
    marginBottom: 4,
  },
  archetypeText: {
    fontFamily: typography.families.body.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
  },
  // Tags
  tagsContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  tagsLabel: {
    fontFamily: typography.families.body.semiBold,
    fontSize: 13,
    color: colors.textDim,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontFamily: typography.families.body.medium,
    fontSize: 13,
    color: colors.primary,
    textTransform: "capitalize",
  },
  // Upsell banner
  upsellBanner: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  // Disclaimer
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  disclaimerText: {
    flex: 1,
    fontFamily: typography.families.body.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textDim,
  },
});

export default DreamInterpretationView;
