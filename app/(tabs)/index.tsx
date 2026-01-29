import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  GradientBackground,
  GlassCard,
  GlowButton,
  DreamInput,
  Toast,
  DotSpinner,
  QuickActions,
  useInterpretationActions,
} from "@/components/ui";
import { DreamInterpretationView } from "@/components/interpretation";
import { UsageMeter } from "@/components/premium";
import { colors, typography, spacing, radius } from "@/lib/design-tokens";
import { useStructuredDream } from "@/hooks/useStructuredDream";
import { useToast } from "@/hooks/useToast";
import { usePremium } from "@/contexts";
import { lightTap, selectionChange } from "@/lib/haptics";
import { voiceRecorder, transcribeAudio } from "@/lib/voice-input";
import { recordDream } from "@/lib/streak";
import { WelcomeScreen } from "@/components/screens/WelcomeScreen";
import { LoadingState } from "@/components/screens/LoadingState";

// Mini header bar component for quick navigation
function HeaderBar() {
  return (
    <View style={styles.headerBar}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerLogo}>🌙</Text>
        <Text style={styles.headerTitle}>Unitulkki</Text>
      </View>
      <View style={styles.headerRight}>
        <Pressable
          onPress={() => router.push("/history")}
          style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome name="book" size={18} color={colors.textMuted} />
        </Pressable>
        <Pressable
          onPress={() => router.push("/settings")}
          style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome name="cog" size={18} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { toast, showError, hideToast } = useToast();
  const { isPremium, isTrialActive, openPremiumModal, canInterpret, incrementUsage } = usePremium();
  const insets = useSafeAreaInsets();

  const {
    interpretation,
    dreamContent,
    isLoading,
    error,
    progress,
    isComplete,
    interpretDream,
    reset,
    lastSavedDream,
  } = useStructuredDream({
    onDreamSaved: async () => {
      // Record streak when dream is saved
      try {
        await recordDream();
      } catch (err) {
        console.error("Failed to record streak:", err);
      }
    },
  });

  // Premium status for UI
  const hasPremiumAccess = isPremium || isTrialActive;

  // Show toast on error
  useEffect(() => {
    if (error) {
      showError(error.message);
    }
  }, [error, showError]);

  // Auto-scroll when interpretation updates
  useEffect(() => {
    if (interpretation) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [interpretation]);

  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Check if user can interpret (premium, trial, or has free uses left)
    if (!canInterpret) {
      openPremiumModal();
      return;
    }

    interpretDream(inputValue.trim());
    setInputValue("");

    // Increment usage counter for free tier users
    await incrementUsage();
  };

  const handleNewChat = () => {
    lightTap();
    reset();
    setInputValue("");
  };

  const handleVoicePress = async () => {
    lightTap();
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setIsTranscribing(true);
      try {
        const { uri } = await voiceRecorder.stopRecording();
        const text = await transcribeAudio(uri);
        setInputValue((prev) => (prev ? prev + " " + text : text));
      } catch (err) {
        console.error(err);
        showError("Puheentunnistus epäonnistui");
      } finally {
        setIsTranscribing(false);
      }
    } else {
      // Start recording
      try {
        const hasPermission = await voiceRecorder.requestPermission();
        if (!hasPermission) {
          showError("Mikrofonin käyttö estetty");
          return;
        }
        await voiceRecorder.startRecording();
        setIsRecording(true);
      } catch (err) {
        console.error(err);
        showError("Nauhoitusta ei voitu aloittaa");
      }
    }
  };

  const handleToastHide = () => {
    hideToast();
  };

  const hasInterpretation = !!interpretation && !!dreamContent;

  // Quick actions for after interpretation
  const quickActions = useInterpretationActions({
    onNewDream: handleNewChat,
    dreamContent: dreamContent,
    interpretation: interpretation?.summary || "",
    isSaved: !!lastSavedDream,
  });

  return (
    <GradientBackground>
      {/* Toast notifications */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={handleToastHide}
      />

      {/* Mini header for navigation */}
      <HeaderBar />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Show interpretation view when we have results */}
        {hasInterpretation ? (
          <DreamInterpretationView
            interpretation={interpretation}
            dreamContent={dreamContent}
            isLoading={isLoading}
            progress={progress}
            isPremiumUser={hasPremiumAccess}
            onUnlockPremium={openPremiumModal}
            footer={
              isComplete ? (
                <View style={styles.quickActionsContainer}>
                  <QuickActions actions={quickActions} delay={300} />
                </View>
              ) : undefined
            }
          />
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Welcome message or loading state */}
            {!isLoading && !interpretation ? (
              <WelcomeScreen setInputValue={setInputValue} />
            ) : isLoading && !interpretation ? (
              <LoadingState progress={progress} />
            ) : null}
          </ScrollView>
        )}

        {/* Input area - always visible */}
        {!hasInterpretation && (
          <View style={styles.inputContainer}>
            {/* Suggestions Chips - Visible only when input is empty */}
            {!inputValue.trim() && (
              <Animated.View 
                entering={FadeInUp.delay(200).duration(400)}
                style={styles.suggestionsContainer}
              >
                <Text style={styles.suggestionsLabel}>Kokeile:</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.suggestionsScroll}
                >
                  {[
                    "Lensin pilvien yläpuolella...",
                    "Hampaani putosivat...",
                    "Olin myöhässä junasta...",
                    "Löysin salaisen huoneen..."
                  ].map((suggestion, index) => (
                    <Pressable
                      key={index}
                      onPress={() => {
                        lightTap();
                        setInputValue(suggestion);
                      }}
                      style={({ pressed }) => [
                        styles.suggestionChip,
                        pressed && styles.suggestionChipPressed,
                      ]}
                    >
                      <Text style={styles.suggestionText}>"{suggestion}"</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </Animated.View>
            )}

              <View style={styles.inputRow}>
                <View style={styles.inputWrapper}>
                  <DreamInput
                    value={inputValue}
                    onChangeText={setInputValue}
                    placeholder="Kuvaile unesi..."
                    disabled={isLoading}
                    onSubmit={handleSubmit}
                    maxLength={2000}
                    onVoicePress={handleVoicePress}
                    isRecording={isRecording}
                    isTranscribing={isTranscribing}
                  />
                  <View style={styles.charCountContainer}>
                    <Text
                      style={[
                        styles.charCount,
                        inputValue.length > 1800 && styles.charCountWarning,
                        inputValue.length >= 2000 && styles.charCountError,
                      ]}
                    >
                      {inputValue.length}/2000
                    </Text>
                  </View>
                </View>
                <GlowButton
                onPress={handleSubmit}
                disabled={!inputValue.trim() || isLoading}
                variant={inputValue.trim() ? "primary" : "ghost"}
                size="md"
                style={styles.sendButton}
              >
                <FontAwesome
                  name="send"
                  size={18}
                  color={inputValue.trim() ? colors.white : colors.textDim}
                />
              </GlowButton>
            </View>
            <Text style={styles.poweredBy}>Powered by Aihio AI</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header bar
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.border}50`,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerLogo: {
    fontSize: 20,
  },
  headerTitle: {
    fontFamily: typography.families.heading.semiBold,
    fontSize: typography.sizes.lg,
    color: colors.text,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.surface}80`,
  },
  headerButtonPressed: {
    backgroundColor: colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  // Welcome section
  welcomeContainer: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  moonIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: `${colors.primary}26`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  moonEmoji: {
    fontSize: 40,
  },
  welcomeTitle: {
    fontFamily: typography.families.heading.bold,
    fontSize: typography.sizes.xxxl,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  welcomeSubtitle: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  // Usage meter
  usageMeter: {
    marginBottom: spacing.lg,
    width: "100%",
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxxl,
  },
  loadingCard: {
    padding: spacing.lg,
    width: "100%",
    alignItems: "center",
  },
  loadingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  loadingTitle: {
    fontFamily: typography.families.heading.semiBold,
    fontSize: typography.sizes.lg,
    color: colors.text,
  },
  loadingProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    width: "100%",
    marginBottom: spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: radius.xs,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.xs,
  },
  progressText: {
    fontFamily: typography.families.body.semiBold,
    fontSize: typography.sizes.sm,
    color: colors.primary,
    minWidth: 40,
    textAlign: "right",
  },
  loadingSubtext: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.sm,
    color: colors.textDim,
    textAlign: "center",
    lineHeight: 20,
  },
  // Quick actions after interpretation
  quickActionsContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  // Input area
  inputContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    marginBottom: spacing.md, // Add margin to avoid char count overlap
  },
  charCountContainer: {
    position: "absolute",
    bottom: -22,
    right: 4,
  },
  charCount: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.xs,
    color: colors.textDim,
    opacity: 0.6,
  },
  charCountWarning: {
    color: colors.warning,
    opacity: 1,
  },
  charCountError: {
    color: colors.error,
    opacity: 1,
  },
  sendButton: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
  },
  poweredBy: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.xs,
    color: colors.textDim,
    textAlign: "center",
    marginTop: spacing.sm,
    opacity: 0.6,
  },
  // Suggestions
  suggestionsContainer: {
    marginBottom: spacing.sm,
  },
  suggestionsLabel: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.xs,
    color: colors.textDim,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  suggestionsScroll: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  suggestionChip: {
    backgroundColor: `${colors.primary}15`,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  suggestionChipPressed: {
    backgroundColor: `${colors.primary}25`,
    borderColor: colors.primary,
  },
  suggestionText: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
});
