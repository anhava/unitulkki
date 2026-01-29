import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInUp,
  FadeOut,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import { GlassCard, GlowButton } from "@/components/ui";
import { colors, typography, spacing, radius } from "@/lib/design-tokens";
import {
  PRICING,
  PREMIUM_BENEFITS,
  TRIAL_CONFIG,
  formatPrice,
  type PremiumPlan,
} from "@/lib/premium";
import { usePremium } from "@/contexts/PremiumContext";
import { lightTap, selectionChange } from "@/lib/haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type PremiumModalProps = {
  visible: boolean;
  onClose: () => void;
  source?: "locked_feature" | "limit_reached" | "manual";
};

// Animated badge component
function PulseBadge({ children }: { children: React.ReactNode }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

// Plan card component
function PlanCard({
  plan,
  isSelected,
  onSelect,
  isPopular,
}: {
  plan: PremiumPlan;
  isSelected: boolean;
  onSelect: () => void;
  isPopular?: boolean;
}) {
  const pricing = PRICING[plan];
  const isYearly = plan === "yearly";

  return (
    <Pressable
      onPress={() => {
        selectionChange();
        onSelect();
      }}
      style={({ pressed }) => [
        styles.planCard,
        isSelected && styles.planCardSelected,
        pressed && styles.planCardPressed,
      ]}
    >
      {isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>SUOSITUIN</Text>
        </View>
      )}

      <View style={styles.planHeader}>
        <Text style={[styles.planName, isSelected && styles.planNameSelected]}>
          {plan === "monthly" && "Kuukausitilaus"}
          {plan === "yearly" && "Vuositilaus"}
          {plan === "lifetime" && "Elinikäinen"}
        </Text>
        {isYearly && (
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>Säästä {pricing.savings}%</Text>
          </View>
        )}
      </View>

      <View style={styles.priceContainer}>
        <Text style={[styles.price, isSelected && styles.priceSelected]}>
          {formatPrice(pricing.price)}
        </Text>
        {plan !== "lifetime" && (
          <Text style={styles.pricePeriod}>/{pricing.periodShort}</Text>
        )}
      </View>

      {isYearly && "monthlyEquivalent" in pricing && (
        <Text style={styles.monthlyEquivalent}>
          vain {formatPrice(pricing.monthlyEquivalent)}/kk
        </Text>
      )}

      {/* Selection indicator */}
      <View
        style={[
          styles.selectionIndicator,
          isSelected && styles.selectionIndicatorSelected,
        ]}
      >
        {isSelected && (
          <FontAwesome name="check" size={12} color={colors.white} />
        )}
      </View>
    </Pressable>
  );
}

export function PremiumModal({ visible, onClose, source = "manual" }: PremiumModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlan>("yearly");
  const [isProcessing, setIsProcessing] = useState(false);
  const { startTrial, purchasePlan, restorePurchases, isTrialActive } = usePremium();

  // Get contextual headline based on source
  const getHeadline = () => {
    switch (source) {
      case "locked_feature":
        return "Avaa syvempi analyysi";
      case "limit_reached":
        return "Tulkinnat loppuivat tältä kuulta";
      default:
        return "Avaa kaikki ominaisuudet";
    }
  };

  const handleStartTrial = async () => {
    lightTap();
    setIsProcessing(true);
    try {
      await startTrial();
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePurchase = async () => {
    lightTap();
    setIsProcessing(true);
    try {
      await purchasePlan(selectedPlan);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.overlay}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />

        <Animated.View
          entering={SlideInDown.duration(400).springify()}
          style={styles.modalContainer}
        >
          <LinearGradient
            colors={["#1a1025", "#0d0a12"]}
            style={styles.modalContent}
          >
            {/* Close button */}
            <Pressable
              onPress={() => {
                lightTap();
                onClose();
              }}
              style={styles.closeButton}
            >
              <FontAwesome name="times" size={20} color={colors.textDim} />
            </Pressable>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Header */}
              <Animated.View entering={FadeInUp.delay(100).duration(300)}>
                <PulseBadge>
                  <View style={styles.premiumBadge}>
                    <FontAwesome name="diamond" size={24} color={colors.accent} />
                  </View>
                </PulseBadge>
                <Text style={styles.headline}>{getHeadline()}</Text>
                <Text style={styles.subheadline}>
                  Unitulkki Premium antaa sinulle syvemmän ymmärryksen unistasi
                </Text>
              </Animated.View>

              {/* Benefits list */}
              <Animated.View
                entering={FadeInUp.delay(200).duration(300)}
                style={styles.benefitsContainer}
              >
                {PREMIUM_BENEFITS.map((benefit, index) => (
                  <View
                    key={benefit.title}
                    style={[
                      styles.benefitItem,
                      benefit.highlight && styles.benefitItemHighlight,
                    ]}
                  >
                    <Text style={styles.benefitEmoji}>{benefit.emoji}</Text>
                    <Text
                      style={[
                        styles.benefitText,
                        benefit.highlight && styles.benefitTextHighlight,
                      ]}
                    >
                      {benefit.title}
                    </Text>
                    {benefit.highlight && (
                      <FontAwesome name="star" size={12} color={colors.accent} />
                    )}
                  </View>
                ))}
              </Animated.View>

              {/* Plan selection */}
              <Animated.View
                entering={FadeInUp.delay(300).duration(300)}
                style={styles.plansContainer}
              >
                <PlanCard
                  plan="yearly"
                  isSelected={selectedPlan === "yearly"}
                  onSelect={() => setSelectedPlan("yearly")}
                  isPopular
                />
                <PlanCard
                  plan="monthly"
                  isSelected={selectedPlan === "monthly"}
                  onSelect={() => setSelectedPlan("monthly")}
                />
              </Animated.View>

              {/* Trial offer (if not already on trial) */}
              {!isTrialActive && (
                <Animated.View
                  entering={FadeInUp.delay(400).duration(300)}
                  style={styles.trialContainer}
                >
                  <GlassCard intensity="light" style={styles.trialCard}>
                    <View style={styles.trialContent}>
                      <FontAwesome name="gift" size={20} color={colors.primary} />
                      <View style={styles.trialTextContainer}>
                        <Text style={styles.trialTitle}>
                          {TRIAL_CONFIG.durationDays} päivää ilmaiseksi
                        </Text>
                        <Text style={styles.trialSubtext}>
                          Kokeile kaikkia ominaisuuksia ilman sitoumusta
                        </Text>
                      </View>
                    </View>
                    <GlowButton
                      variant="ghost"
                      size="sm"
                      onPress={handleStartTrial}
                      disabled={isProcessing}
                    >
                      <Text style={styles.trialButtonText}>Aloita kokeilu</Text>
                    </GlowButton>
                  </GlassCard>
                </Animated.View>
              )}

              {/* CTA Button */}
              <Animated.View
                entering={FadeInUp.delay(500).duration(300)}
                style={styles.ctaContainer}
              >
                <GlowButton
                  variant="primary"
                  size="lg"
                  onPress={handlePurchase}
                  disabled={isProcessing}
                  style={styles.ctaButton}
                >
                  {isProcessing ? (
                    <Text style={styles.ctaText}>Käsitellään...</Text>
                  ) : (
                    <>
                      <Text style={styles.ctaText}>
                        Jatka - {formatPrice(PRICING[selectedPlan].price)}
                        {selectedPlan !== "lifetime" && `/${PRICING[selectedPlan].periodShort}`}
                      </Text>
                    </>
                  )}
                </GlowButton>

                <Text style={styles.legalText}>
                  Tilaus uusiutuu automaattisesti. Voit peruuttaa milloin tahansa.
                </Text>

                {/* Restore purchases */}
                <Pressable
                  onPress={async () => {
                    lightTap();
                    setIsProcessing(true);
                    try {
                      const restored = await restorePurchases();
                      if (restored) {
                        onClose();
                      }
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                  style={styles.restoreButton}
                  disabled={isProcessing}
                >
                  <Text style={[styles.restoreText, isProcessing && { opacity: 0.5 }]}>
                    Palauta ostokset
                  </Text>
                </Pressable>
              </Animated.View>
            </ScrollView>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    maxHeight: "90%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  // Header
  premiumBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.accent}20`,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  headline: {
    fontFamily: typography.families.heading.bold,
    fontSize: 28,
    color: colors.white,
    textAlign: "center",
    marginBottom: 8,
  },
  subheadline: {
    fontFamily: typography.families.body.regular,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  // Benefits
  benefitsContainer: {
    gap: 8,
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  benefitItemHighlight: {
    backgroundColor: `${colors.primary}15`,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  benefitEmoji: {
    fontSize: 20,
  },
  benefitText: {
    flex: 1,
    fontFamily: typography.families.body.medium,
    fontSize: 15,
    color: colors.text,
  },
  benefitTextHighlight: {
    color: colors.white,
  },
  // Plans
  plansContainer: {
    gap: 12,
    marginBottom: 20,
  },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  planCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  planCardPressed: {
    opacity: 0.8,
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    right: 16,
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popularText: {
    fontFamily: typography.families.body.bold,
    fontSize: 10,
    color: colors.white,
    letterSpacing: 0.5,
  },
  planHeader: {
    flex: 1,
  },
  planName: {
    fontFamily: typography.families.body.semiBold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 2,
  },
  planNameSelected: {
    color: colors.white,
  },
  savingsBadge: {
    backgroundColor: `${colors.success}20`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  savingsText: {
    fontFamily: typography.families.body.semiBold,
    fontSize: 11,
    color: colors.success,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontFamily: typography.families.heading.bold,
    fontSize: 24,
    color: colors.text,
  },
  priceSelected: {
    color: colors.white,
  },
  pricePeriod: {
    fontFamily: typography.families.body.regular,
    fontSize: 14,
    color: colors.textDim,
    marginLeft: 2,
  },
  monthlyEquivalent: {
    fontFamily: typography.families.body.regular,
    fontSize: 12,
    color: colors.primary,
    position: "absolute",
    bottom: 8,
    left: 16,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  selectionIndicatorSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  // Trial
  trialContainer: {
    marginBottom: 20,
  },
  trialCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  trialContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  trialTextContainer: {
    flex: 1,
  },
  trialTitle: {
    fontFamily: typography.families.body.semiBold,
    fontSize: 15,
    color: colors.white,
  },
  trialSubtext: {
    fontFamily: typography.families.body.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  trialButtonText: {
    fontFamily: typography.families.body.semiBold,
    fontSize: 14,
    color: colors.primary,
  },
  // CTA
  ctaContainer: {
    alignItems: "center",
  },
  ctaButton: {
    width: "100%",
  },
  ctaText: {
    fontFamily: typography.families.body.bold,
    fontSize: 16,
    color: colors.white,
  },
  legalText: {
    fontFamily: typography.families.body.regular,
    fontSize: 11,
    color: colors.textDim,
    textAlign: "center",
    marginTop: 12,
  },
  restoreButton: {
    marginTop: 16,
    padding: 8,
  },
  restoreText: {
    fontFamily: typography.families.body.medium,
    fontSize: 13,
    color: colors.textMuted,
    textDecorationLine: "underline",
  },
});

export default PremiumModal;
