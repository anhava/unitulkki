/**
 * English translations (Secondary locale)
 *
 * Unitulkki - AI-powered dream interpreter
 */

import type { TranslationKey } from "./fi";

export const en: Record<TranslationKey, string> = {
  // App
  appName: "Unitulkki",
  appTagline: "AI-powered dream interpretation",
  appDescription: "Tell your dream and get an AI-powered interpretation of its meaning",

  // Navigation
  navDreams: "Dreams",
  navHistory: "History",
  navSettings: "Settings",

  // Home screen
  homeTitle: "Unitulkki",
  homeSubtitle: "Tell your dream and get an AI-powered interpretation of its meaning",
  homeFeature1: "Structured interpretation",
  homeFeature2: "Real-time analysis",
  homeGetInterpretation: "Your interpretation includes:",
  homeSymbols: "Symbol meanings",
  homeEmotions: "Emotional analysis",
  homeConnections: "Life connections",
  homeInsights: "Insights & questions",
  homeTryExamples: "Try these examples:",
  homeExample1: "I flew above the clouds",
  homeExample2: "I was running but couldn't move forward",

  // Input
  inputPlaceholder: "Describe your dream...",
  inputSubmit: "Interpret",
  inputPoweredBy: "Powered by Aihio AI",

  // History
  historyTitle: "Dream History",
  historyEmpty: "No saved dreams yet",
  historyEmptyHint: "Start by telling your dream on the home screen. Interpretations are saved automatically.",
  historyTip: "Tip: Keep a dream journal to see patterns in your dreams",
  historyToday: "Today",
  historyYesterday: "Yesterday",
  historyDaysAgo: "days ago",
  historyReadMore: "Read more",
  historyDelete: "Delete",

  // Settings
  settingsTitle: "Settings",
  settingsLanguage: "Language",
  settingsLanguageFi: "Finnish",
  settingsLanguageEn: "English",
  settingsPreferences: "Preferences",
  settingsHaptics: "Haptic feedback",
  settingsHapticsDesc: "Tactile feedback for buttons",
  settingsLength: "Interpretation length",
  settingsLengthShort: "Short",
  settingsLengthNormal: "Normal",
  settingsLengthLong: "Long",
  settingsData: "Data management",
  settingsDreamsCount: "saved dreams",
  settingsClearHistory: "Clear dream history",
  settingsClearHistoryDesc: "Delete all saved dreams",
  settingsAbout: "About",
  settingsVersion: "Version",
  settingsPrivacy: "Privacy Policy",
  settingsMadeWith: "Made with AI SDK & Aihio AI",
  settingsCopyright: "Unitulkki © 2026",

  // Interpretation
  interpretationSummary: "Summary",
  interpretationSymbols: "Symbols",
  interpretationEmotions: "Emotional World",
  interpretationConnections: "Life Connections",
  interpretationKeyMessage: "Key Message",
  interpretationQuestions: "Reflection",
  interpretationDeepAnalysis: "Deep Analysis",
  interpretationYourDream: "Your Dream",
  interpretationThemes: "Themes",
  interpretationPrimaryEmotion: "Primary Emotion",
  interpretationHighConfidence: "Strong interpretation",
  interpretationMediumConfidence: "Moderate interpretation",
  interpretationLowConfidence: "General interpretation",
  interpretationDisclaimer: "Dream interpretations are indicative and based on general symbolism. Personal meaning may vary.",
  interpretationSavedAt: "Saved at",

  // Moods
  moodPeaceful: "Peaceful",
  moodHappy: "Happy",
  moodAnxious: "Anxious",
  moodSad: "Sad",
  moodConfused: "Confused",
  moodNostalgic: "Nostalgic",
  moodNeutral: "Neutral",

  // Actions
  actionShare: "Share",
  actionDelete: "Delete",
  actionClose: "Close",
  actionAnalyzing: "Analyzing...",
  actionNewDream: "New Dream",

  // Premium
  premiumTitle: "Unlock all features",
  premiumSubtitle: "Unitulkki Premium gives you deeper understanding of your dreams",
  premiumUnlimitedDreams: "Unlimited interpretations",
  premiumDeepAnalysis: "Deep analysis",
  premiumNoAds: "No ads",
  premiumMonthly: "Monthly",
  premiumYearly: "Yearly",
  premiumLifetime: "Lifetime",
  premiumMostPopular: "MOST POPULAR",
  premiumSave: "Save",
  premiumTrialDays: "days free",
  premiumTrialDesc: "Try all features without commitment",
  premiumStartTrial: "Start trial",
  premiumContinue: "Continue",
  premiumRestore: "Restore purchases",
  premiumLegal: "Subscription renews automatically. You can cancel anytime.",
  premiumUnlock: "Unlock Premium",
  premiumLockedDesc: "Unlock Premium to see deeper analysis",

  // Errors
  errorGeneric: "Something went wrong",
  errorNetwork: "Network error. Check your internet connection.",
  errorTryAgain: "Try again",
} as const;
