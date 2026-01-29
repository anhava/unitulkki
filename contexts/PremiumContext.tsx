/**
 * PremiumContext - Subscription state management with RevenueCat
 *
 * Provides:
 * - Subscription status (isPremium, isTrialActive)
 * - Usage tracking for free tier
 * - RevenueCat paywall presentation
 * - Customer Center access
 * - Premium modal control
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CustomerInfo } from "react-native-purchases";
import {
  RevenueCat,
  SubscriptionStatus,
  ENTITLEMENT_ID,
  type PremiumPlan,
} from "@/lib/revenuecat";
import { FREE_TIER_LIMITS, TRIAL_CONFIG } from "@/lib/premium";
import { Analytics } from "@/lib/analytics";

// Storage keys
const STORAGE_KEYS = {
  trialStartDate: "dreamai_trial_start",
  monthlyUsage: "dreamai_monthly_usage",
  currentMonth: "dreamai_current_month",
};

// Premium state
type PremiumState = {
  // Subscription status
  isPremium: boolean;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  subscriptionStatus: SubscriptionStatus | null;

  // Usage tracking
  interpretationsUsed: number;
  interpretationsLimit: number;
  canInterpret: boolean;

  // Loading state
  isLoading: boolean;
  isInitialized: boolean;
};

// Premium context type
type PremiumContextType = PremiumState & {
  // RevenueCat Paywall
  openPaywall: () => Promise<void>;
  openPaywallIfNeeded: () => Promise<void>;

  // Customer Center
  openCustomerCenter: () => Promise<void>;

  // Legacy modal (for custom UI)
  showPremiumModal: boolean;
  openPremiumModal: () => void;
  closePremiumModal: () => void;

  // Purchases
  purchasePlan: (plan: PremiumPlan) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;

  // Trial
  startTrial: () => Promise<void>;

  // Usage tracking
  incrementUsage: () => Promise<void>;
  resetUsage: () => Promise<void>;

  // Refresh
  refreshStatus: () => Promise<void>;
};

const PremiumContext = createContext<PremiumContextType | null>(null);

export function PremiumProvider({ children }: { children: ReactNode }) {
  // RevenueCat state
  const [isPremium, setIsPremium] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Trial state
  const [trialStartDate, setTrialStartDate] = useState<Date | null>(null);

  // Usage state
  const [interpretationsUsed, setInterpretationsUsed] = useState(0);

  // Modal state
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Initialize RevenueCat and load state
  useEffect(() => {
    initializeAndLoadState();
  }, []);

  // Listen for customer info updates
  useEffect(() => {
    if (!isInitialized) return;

    const unsubscribe = RevenueCat.addCustomerInfoListener(handleCustomerInfoUpdate);
    return unsubscribe;
  }, [isInitialized]);

  const initializeAndLoadState = async () => {
    try {
      // Initialize RevenueCat
      if (!RevenueCat.isInitialized()) {
        await RevenueCat.initialize();
      }

      // Load saved trial and usage state
      const [savedTrialStart, savedUsage, savedMonth] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.trialStartDate),
        AsyncStorage.getItem(STORAGE_KEYS.monthlyUsage),
        AsyncStorage.getItem(STORAGE_KEYS.currentMonth),
      ]);

      if (savedTrialStart) {
        setTrialStartDate(new Date(savedTrialStart));
      }

      // Check and reset monthly usage if needed
      const currentMonth = new Date().toISOString().slice(0, 7);
      if (savedMonth !== currentMonth) {
        await AsyncStorage.setItem(STORAGE_KEYS.currentMonth, currentMonth);
        await AsyncStorage.setItem(STORAGE_KEYS.monthlyUsage, "0");
        setInterpretationsUsed(0);
      } else if (savedUsage) {
        setInterpretationsUsed(parseInt(savedUsage, 10));
      }

      // Get subscription status from RevenueCat
      const status = await RevenueCat.getSubscriptionStatus();
      setSubscriptionStatus(status);
      setIsPremium(status.isActive);

      setIsInitialized(true);
    } catch (error) {
      console.error("[PremiumContext] Initialization error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerInfoUpdate = (info: CustomerInfo) => {
    const hasAccess = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
    setIsPremium(hasAccess);

    // Update full subscription status
    RevenueCat.getSubscriptionStatus().then(setSubscriptionStatus);
  };

  // Calculate trial status
  const getTrialStatus = useCallback(() => {
    if (!trialStartDate) {
      return { isActive: false, daysRemaining: 0 };
    }

    const now = new Date();
    const trialEnd = new Date(trialStartDate);
    trialEnd.setDate(trialEnd.getDate() + TRIAL_CONFIG.durationDays);

    if (now > trialEnd) {
      return { isActive: false, daysRemaining: 0 };
    }

    const daysRemaining = Math.ceil(
      (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return { isActive: true, daysRemaining };
  }, [trialStartDate]);

  const trialStatus = getTrialStatus();

  // Derived state
  const interpretationsLimit = FREE_TIER_LIMITS.interpretationsPerMonth;
  const canInterpret =
    isPremium ||
    trialStatus.isActive ||
    interpretationsUsed < interpretationsLimit;

  // ============================================================================
  // RevenueCat Paywall
  // ============================================================================

  const openPaywall = useCallback(async () => {
    try {
      Analytics.premiumModalOpened("paywall");
      const result = await RevenueCat.presentPaywall();

      if (result.purchased || result.restored) {
        const status = await RevenueCat.getSubscriptionStatus();
        setSubscriptionStatus(status);
        setIsPremium(status.isActive);
      }
    } catch (error) {
      console.error("[PremiumContext] Paywall error:", error);
    }
  }, []);

  const openPaywallIfNeeded = useCallback(async () => {
    try {
      const result = await RevenueCat.presentPaywallIfNeeded();

      if (result.purchased || result.restored) {
        const status = await RevenueCat.getSubscriptionStatus();
        setSubscriptionStatus(status);
        setIsPremium(status.isActive);
      }
    } catch (error) {
      console.error("[PremiumContext] Paywall error:", error);
    }
  }, []);

  // ============================================================================
  // Customer Center
  // ============================================================================

  const openCustomerCenter = useCallback(async () => {
    try {
      await RevenueCat.presentCustomerCenter();
      // Refresh after customer center closes
      const status = await RevenueCat.getSubscriptionStatus();
      setSubscriptionStatus(status);
      setIsPremium(status.isActive);
    } catch (error) {
      console.error("[PremiumContext] Customer center error:", error);
    }
  }, []);

  // ============================================================================
  // Legacy Modal (Custom UI)
  // ============================================================================

  const openPremiumModal = useCallback(() => {
    Analytics.premiumModalOpened("manual");
    setShowPremiumModal(true);
  }, []);

  const closePremiumModal = useCallback(() => {
    setShowPremiumModal(false);
  }, []);

  // ============================================================================
  // Purchases
  // ============================================================================

  const purchasePlan = useCallback(async (plan: PremiumPlan): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await RevenueCat.purchasePlan(plan);

      if (result.success) {
        const status = await RevenueCat.getSubscriptionStatus();
        setSubscriptionStatus(status);
        setIsPremium(status.isActive);
        setShowPremiumModal(false);
        return true;
      }

      return false;
    } catch (error) {
      console.error("[PremiumContext] Purchase error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await RevenueCat.restorePurchases();

      if (result.success) {
        const status = await RevenueCat.getSubscriptionStatus();
        setSubscriptionStatus(status);
        setIsPremium(status.isActive);
        return true;
      }

      return false;
    } catch (error) {
      console.error("[PremiumContext] Restore error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================================
  // Trial
  // ============================================================================

  const startTrial = useCallback(async () => {
    try {
      const now = new Date();
      await AsyncStorage.setItem(STORAGE_KEYS.trialStartDate, now.toISOString());
      setTrialStartDate(now);
      setShowPremiumModal(false);
      Analytics.trialStarted();
    } catch (error) {
      console.error("[PremiumContext] Start trial error:", error);
    }
  }, []);

  // ============================================================================
  // Usage Tracking
  // ============================================================================

  const incrementUsage = useCallback(async () => {
    if (isPremium || trialStatus.isActive) return;

    try {
      const newUsage = interpretationsUsed + 1;
      await AsyncStorage.setItem(STORAGE_KEYS.monthlyUsage, newUsage.toString());
      setInterpretationsUsed(newUsage);
    } catch (error) {
      console.error("[PremiumContext] Increment usage error:", error);
    }
  }, [isPremium, trialStatus.isActive, interpretationsUsed]);

  const resetUsage = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.monthlyUsage, "0");
      setInterpretationsUsed(0);
    } catch (error) {
      console.error("[PremiumContext] Reset usage error:", error);
    }
  }, []);

  // ============================================================================
  // Refresh
  // ============================================================================

  const refreshStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const status = await RevenueCat.getSubscriptionStatus();
      setSubscriptionStatus(status);
      setIsPremium(status.isActive);
    } catch (error) {
      console.error("[PremiumContext] Refresh error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================================
  // Context Value
  // ============================================================================

  const value: PremiumContextType = {
    // State
    isPremium,
    isTrialActive: trialStatus.isActive,
    trialDaysRemaining: trialStatus.daysRemaining,
    subscriptionStatus,
    interpretationsUsed,
    interpretationsLimit,
    canInterpret,
    isLoading,
    isInitialized,

    // RevenueCat Paywall
    openPaywall,
    openPaywallIfNeeded,

    // Customer Center
    openCustomerCenter,

    // Legacy Modal
    showPremiumModal,
    openPremiumModal,
    closePremiumModal,

    // Purchases
    purchasePlan,
    restorePurchases,

    // Trial
    startTrial,

    // Usage
    incrementUsage,
    resetUsage,

    // Refresh
    refreshStatus,
  };

  return (
    <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error("usePremium must be used within a PremiumProvider");
  }
  return context;
}

export default PremiumContext;
