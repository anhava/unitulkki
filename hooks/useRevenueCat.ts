/**
 * useRevenueCat Hook
 *
 * React hook for easy RevenueCat integration in components.
 * Provides reactive subscription state and purchase methods.
 */

import { useState, useEffect, useCallback } from "react";
import { CustomerInfo } from "react-native-purchases";
import {
  RevenueCat,
  SubscriptionStatus,
  PaywallResult,
  PurchaseResult,
  PremiumPlan,
  ENTITLEMENT_ID,
} from "@/lib/revenuecat";

type UseRevenueCatReturn = {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  isPro: boolean;
  subscriptionStatus: SubscriptionStatus | null;
  customerInfo: CustomerInfo | null;
  error: string | null;

  // Actions
  presentPaywall: () => Promise<PaywallResult>;
  presentPaywallIfNeeded: () => Promise<PaywallResult>;
  presentCustomerCenter: () => Promise<void>;
  purchasePlan: (plan: PremiumPlan) => Promise<PurchaseResult>;
  restorePurchases: () => Promise<PurchaseResult>;
  refreshStatus: () => Promise<void>;
};

export function useRevenueCat(): UseRevenueCatReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize and load initial status
  useEffect(() => {
    async function init() {
      try {
        // Initialize RevenueCat if needed
        if (!RevenueCat.isInitialized()) {
          await RevenueCat.initialize();
        }
        setIsInitialized(true);

        // Get initial status
        await refreshStatusInternal();
      } catch (err) {
        console.error("[useRevenueCat] Initialization error:", err);
        setError(err instanceof Error ? err.message : "Initialization failed");
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  // Listen for customer info updates
  useEffect(() => {
    if (!isInitialized) return;

    const unsubscribe = RevenueCat.addCustomerInfoListener((info) => {
      setCustomerInfo(info);
      const hasAccess = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
      setIsPro(hasAccess);
    });

    return unsubscribe;
  }, [isInitialized]);

  // Internal refresh function
  const refreshStatusInternal = async () => {
    try {
      const [status, info] = await Promise.all([
        RevenueCat.getSubscriptionStatus(),
        RevenueCat.getCustomerInfo(),
      ]);

      setSubscriptionStatus(status);
      setCustomerInfo(info);
      setIsPro(status.isActive);
      setError(null);
    } catch (err) {
      console.error("[useRevenueCat] Refresh error:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh status");
    }
  };

  // Public refresh function
  const refreshStatus = useCallback(async () => {
    setIsLoading(true);
    await refreshStatusInternal();
    setIsLoading(false);
  }, []);

  // Present paywall
  const presentPaywall = useCallback(async (): Promise<PaywallResult> => {
    try {
      setError(null);
      const result = await RevenueCat.presentPaywall();

      if (result.purchased || result.restored) {
        await refreshStatusInternal();
      }

      return result;
    } catch (err) {
      console.error("[useRevenueCat] Paywall error:", err);
      setError(err instanceof Error ? err.message : "Paywall error");
      return { purchased: false, restored: false, cancelled: false, error: true };
    }
  }, []);

  // Present paywall if needed
  const presentPaywallIfNeeded = useCallback(async (): Promise<PaywallResult> => {
    try {
      setError(null);
      const result = await RevenueCat.presentPaywallIfNeeded();

      if (result.purchased || result.restored) {
        await refreshStatusInternal();
      }

      return result;
    } catch (err) {
      console.error("[useRevenueCat] Paywall error:", err);
      setError(err instanceof Error ? err.message : "Paywall error");
      return { purchased: false, restored: false, cancelled: false, error: true };
    }
  }, []);

  // Present customer center
  const presentCustomerCenter = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await RevenueCat.presentCustomerCenter();
      // Refresh status after customer center closes (user might have cancelled)
      await refreshStatusInternal();
    } catch (err) {
      console.error("[useRevenueCat] Customer center error:", err);
      setError(err instanceof Error ? err.message : "Customer center error");
    }
  }, []);

  // Purchase a plan
  const purchasePlan = useCallback(async (plan: PremiumPlan): Promise<PurchaseResult> => {
    try {
      setError(null);
      setIsLoading(true);
      const result = await RevenueCat.purchasePlan(plan);

      if (result.success) {
        await refreshStatusInternal();
      } else if (result.error && !result.cancelled) {
        setError(result.error);
      }

      return result;
    } catch (err) {
      console.error("[useRevenueCat] Purchase error:", err);
      const errorMsg = err instanceof Error ? err.message : "Purchase failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Restore purchases
  const restorePurchases = useCallback(async (): Promise<PurchaseResult> => {
    try {
      setError(null);
      setIsLoading(true);
      const result = await RevenueCat.restorePurchases();

      if (result.success) {
        await refreshStatusInternal();
      } else if (result.error) {
        setError(result.error);
      }

      return result;
    } catch (err) {
      console.error("[useRevenueCat] Restore error:", err);
      const errorMsg = err instanceof Error ? err.message : "Restore failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    isInitialized,
    isLoading,
    isPro,
    subscriptionStatus,
    customerInfo,
    error,

    // Actions
    presentPaywall,
    presentPaywallIfNeeded,
    presentCustomerCenter,
    purchasePlan,
    restorePurchases,
    refreshStatus,
  };
}

export default useRevenueCat;
