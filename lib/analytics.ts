/**
 * Analytics Wrapper for DreamAI
 * 
 * Provides a unified interface for tracking user events.
 * Currently logs to console in development, ready for production analytics.
 * 
 * Recommended production integrations:
 * - expo-insights (Expo's built-in analytics)
 * - Amplitude
 * - Mixpanel
 * - PostHog
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Event types
export type AnalyticsEvent =
  | "app_opened"
  | "dream_submitted"
  | "dream_interpretation_started"
  | "dream_interpretation_completed"
  | "dream_interpretation_failed"
  | "dream_saved"
  | "dream_deleted"
  | "dream_exported_pdf"
  | "voice_recording_started"
  | "voice_recording_completed"
  | "pattern_analysis_viewed"
  | "premium_modal_opened"
  | "premium_trial_started"
  | "premium_purchased"
  | "premium_purchase_failed"
  | "settings_changed"
  | "language_changed"
  | "notifications_toggled"
  | "history_viewed"
  | "share_initiated";

// Event properties type
export type EventProperties = Record<string, string | number | boolean>;

// User properties
export type UserProperties = {
  isPremium?: boolean;
  isTrialActive?: boolean;
  language?: string;
  dreamCount?: number;
  appVersion?: string;
  platform?: string;
};

// Storage keys
const STORAGE_KEYS = {
  analyticsEnabled: "dreamai_analytics_enabled",
  userId: "dreamai_user_id",
  sessionId: "dreamai_session_id",
  eventQueue: "dreamai_event_queue",
};

// Analytics state
let isInitialized = false;
let analyticsEnabled = true;
let userId: string | null = null;
let sessionId: string | null = null;

/**
 * Generate a random ID
 */
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Initialize analytics
 */
export async function initializeAnalytics(): Promise<void> {
  if (isInitialized) return;

  try {
    // Check if analytics is enabled
    const enabled = await AsyncStorage.getItem(STORAGE_KEYS.analyticsEnabled);
    analyticsEnabled = enabled !== "false";

    // Get or create user ID
    let storedUserId = await AsyncStorage.getItem(STORAGE_KEYS.userId);
    if (!storedUserId) {
      storedUserId = `user_${generateId()}`;
      await AsyncStorage.setItem(STORAGE_KEYS.userId, storedUserId);
    }
    userId = storedUserId;

    // Create new session
    sessionId = `session_${generateId()}`;

    isInitialized = true;

    // Track app opened
    trackEvent("app_opened", {
      platform: Platform.OS,
      version: Platform.Version.toString(),
    });

    console.log("[Analytics] Initialized", { userId, sessionId });
  } catch (error) {
    console.error("[Analytics] Initialization error:", error);
  }
}

/**
 * Track an event
 */
export function trackEvent(
  event: AnalyticsEvent,
  properties?: EventProperties
): void {
  if (!analyticsEnabled) return;

  const eventData = {
    event,
    properties: {
      ...properties,
      timestamp: new Date().toISOString(),
      sessionId,
      userId,
      platform: Platform.OS,
    },
  };

  // In development, log to console
  if (__DEV__) {
    console.log("[Analytics] Event:", event, properties || {});
  }

  // In production, send to analytics service
  // Example with expo-insights:
  // Analytics.track(event, eventData.properties);

  // Example with Amplitude:
  // Amplitude.logEvent(event, eventData.properties);

  // For now, we could queue events for batch sending
  queueEvent(eventData);
}

/**
 * Set user properties
 */
export function setUserProperties(properties: UserProperties): void {
  if (!analyticsEnabled) return;

  if (__DEV__) {
    console.log("[Analytics] User properties:", properties);
  }

  // In production:
  // Analytics.setUserProperties(properties);
}

/**
 * Identify user (for premium/trial status)
 */
export function identifyUser(
  isPremium: boolean,
  isTrialActive: boolean
): void {
  setUserProperties({
    isPremium,
    isTrialActive,
    platform: Platform.OS,
  });
}

/**
 * Track screen view
 */
export function trackScreen(screenName: string): void {
  if (!analyticsEnabled) return;

  if (__DEV__) {
    console.log("[Analytics] Screen:", screenName);
  }

  // In production:
  // Analytics.trackScreen(screenName);
}

/**
 * Track conversion events (for revenue tracking)
 */
export function trackConversion(
  plan: string,
  revenue: number,
  currency: string = "EUR"
): void {
  trackEvent("premium_purchased", {
    plan,
    revenue,
    currency,
  });

  // In production, also track revenue:
  // Analytics.trackRevenue(revenue, currency, { plan });
}

/**
 * Enable/disable analytics
 */
export async function setAnalyticsEnabled(enabled: boolean): Promise<void> {
  analyticsEnabled = enabled;
  await AsyncStorage.setItem(
    STORAGE_KEYS.analyticsEnabled,
    enabled ? "true" : "false"
  );
  
  if (__DEV__) {
    console.log("[Analytics] Enabled:", enabled);
  }
}

/**
 * Check if analytics is enabled
 */
export async function isAnalyticsEnabled(): Promise<boolean> {
  const stored = await AsyncStorage.getItem(STORAGE_KEYS.analyticsEnabled);
  return stored !== "false";
}

/**
 * Queue event for batch sending
 */
async function queueEvent(eventData: object): Promise<void> {
  try {
    const queueStr = await AsyncStorage.getItem(STORAGE_KEYS.eventQueue);
    const queue: object[] = queueStr ? JSON.parse(queueStr) : [];
    
    queue.push(eventData);
    
    // Keep only last 100 events
    const trimmedQueue = queue.slice(-100);
    
    await AsyncStorage.setItem(
      STORAGE_KEYS.eventQueue,
      JSON.stringify(trimmedQueue)
    );
  } catch (error) {
    console.error("[Analytics] Queue error:", error);
  }
}

/**
 * Flush event queue (send to server)
 */
export async function flushEvents(): Promise<void> {
  try {
    const queueStr = await AsyncStorage.getItem(STORAGE_KEYS.eventQueue);
    if (!queueStr) return;

    const queue: object[] = JSON.parse(queueStr);
    if (queue.length === 0) return;

    // In production, send to analytics server
    // await fetch('https://analytics.dreamai.app/events', {
    //   method: 'POST',
    //   body: JSON.stringify(queue),
    // });

    // Clear queue after successful send
    await AsyncStorage.removeItem(STORAGE_KEYS.eventQueue);

    if (__DEV__) {
      console.log("[Analytics] Flushed", queue.length, "events");
    }
  } catch (error) {
    console.error("[Analytics] Flush error:", error);
  }
}

/**
 * Reset analytics (for logout/testing)
 */
export async function resetAnalytics(): Promise<void> {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.userId,
    STORAGE_KEYS.sessionId,
    STORAGE_KEYS.eventQueue,
  ]);
  
  userId = null;
  sessionId = null;
  isInitialized = false;
}

// Convenience functions for common events
export const Analytics = {
  init: initializeAnalytics,
  track: trackEvent,
  screen: trackScreen,
  identify: identifyUser,
  setEnabled: setAnalyticsEnabled,
  flush: flushEvents,
  reset: resetAnalytics,

  // Typed event helpers
  dreamSubmitted: (dreamLength: number) =>
    trackEvent("dream_submitted", { dreamLength }),

  interpretationCompleted: (duration: number) =>
    trackEvent("dream_interpretation_completed", { duration }),

  dreamSaved: () => trackEvent("dream_saved"),

  premiumModalOpened: (source: string) =>
    trackEvent("premium_modal_opened", { source }),

  trialStarted: () => trackEvent("premium_trial_started"),

  purchased: (plan: string, revenue: number) =>
    trackConversion(plan, revenue),

  // Freemium conversion funnel events
  upsellShown: (variant: string, location: string) =>
    trackEvent("premium_modal_opened", { variant, location, type: "upsell" }),

  upsellTapped: (variant: string) =>
    trackEvent("premium_modal_opened", { variant, type: "upsell_tap" }),

  lockedFeatureTapped: (featureId: string) =>
    trackEvent("premium_modal_opened", { featureId, type: "locked_feature" }),

  usageMeterShown: (remaining: number, total: number) =>
    trackEvent("premium_modal_opened", { remaining, total, type: "usage_meter" }),

  limitReached: () =>
    trackEvent("premium_modal_opened", { type: "limit_reached" }),

  trialReminder: (daysRemaining: number) =>
    trackEvent("premium_modal_opened", { daysRemaining, type: "trial_reminder" }),

  purchaseFailed: (plan: string, error: string) =>
    trackEvent("premium_purchase_failed", { plan, error }),
};

export default Analytics;
