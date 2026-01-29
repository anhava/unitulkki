/**
 * RevenueCat Integration for Unitulkki
 *
 * Features:
 * - SDK initialization with environment-based API keys
 * - Entitlement checking (Unitulkki Pro)
 * - Paywall presentation (RevenueCatUI)
 * - Customer Center for subscription management
 * - Purchase handling with error mapping
 *
 * @see https://www.revenuecat.com/docs/getting-started/installation/expo
 */

import { Platform } from "react-native";
import Purchases, {
  LOG_LEVEL,
  CustomerInfo,
  PurchasesOffering,
  PurchasesOfferings,
  PurchasesPackage,
  PURCHASES_ERROR_CODE,
} from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import { Analytics } from "./analytics";

// ============================================================================
// Debug Logger - Only logs in development
// ============================================================================

const log = {
  info: (...args: unknown[]) => __DEV__ && console.log("[RevenueCat]", ...args),
  warn: (...args: unknown[]) => __DEV__ && console.warn("[RevenueCat]", ...args),
  error: (...args: unknown[]) => console.error("[RevenueCat]", ...args),
};

// ============================================================================
// Configuration
// ============================================================================

/**
 * Platform-specific API keys from environment variables
 * Set these in your .env.local file:
 * - EXPO_PUBLIC_REVENUECAT_IOS_KEY
 * - EXPO_PUBLIC_REVENUECAT_ANDROID_KEY
 */
const REVENUECAT_API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || "",
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || "",
  default: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || "",
});

/** Entitlement identifier - grants access to premium features */
export const ENTITLEMENT_ID = "Unitulkki Pro";

/** Offering identifiers for different paywall configurations */
export const OFFERING_IDS = {
  default: "default",
  special: "special_offer",
} as const;

/** Product identifiers matching RevenueCat dashboard */
export const PRODUCT_IDS = {
  monthly: Platform.select({
    ios: "unitulkki_pro_monthly",
    android: "unitulkki_pro_monthly",
    default: "unitulkki_pro_monthly",
  })!,
  yearly: Platform.select({
    ios: "unitulkki_pro_yearly",
    android: "unitulkki_pro_yearly",
    default: "unitulkki_pro_yearly",
  })!,
  lifetime: Platform.select({
    ios: "unitulkki_pro_lifetime",
    android: "unitulkki_pro_lifetime",
    default: "unitulkki_pro_lifetime",
  })!,
} as const;

// ============================================================================
// Types
// ============================================================================

export type PremiumPlan = "monthly" | "yearly" | "lifetime";

export type SubscriptionStatus = {
  isActive: boolean;
  entitlementId: string | null;
  productId: string | null;
  plan: PremiumPlan | null;
  expiresAt: Date | null;
  willRenew: boolean;
  isInTrial: boolean;
  isSandbox: boolean;
};

export type PurchaseResult = {
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
  errorCode?: string;
  cancelled?: boolean;
};

export type PaywallResult = {
  purchased: boolean;
  restored: boolean;
  cancelled: boolean;
  error: boolean;
};

// ============================================================================
// Internal State
// ============================================================================

let isInitialized = false;
let currentListener: ((info: CustomerInfo) => void) | null = null;

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize RevenueCat SDK
 *
 * Call this early in your app lifecycle (e.g., in _layout.tsx).
 * Safe to call multiple times - subsequent calls are no-ops.
 *
 * @throws Error if API key is not configured
 */
export async function initializeRevenueCat(): Promise<void> {
  if (isInitialized) {
    log.info("Already initialized");
    return;
  }

  if (!REVENUECAT_API_KEY) {
    throw new Error(
      "RevenueCat API key not configured. " +
      "Set EXPO_PUBLIC_REVENUECAT_IOS_KEY and/or EXPO_PUBLIC_REVENUECAT_ANDROID_KEY in .env.local"
    );
  }

  try {
    // Development: verbose logs, Production: warnings only
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.WARN);

    await Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
      appUserID: null, // Anonymous ID - use logIn() to identify users
    });

    isInitialized = true;
    log.info("SDK initialized successfully");

    // Log current entitlements for debugging
    const customerInfo = await Purchases.getCustomerInfo();
    log.info("Active entitlements:", Object.keys(customerInfo.entitlements.active));
  } catch (error) {
    log.error("Initialization failed:", error);
    throw error;
  }
}

/** Check if SDK is initialized */
export function isRevenueCatInitialized(): boolean {
  return isInitialized;
}

// ============================================================================
// Customer Info & Entitlements
// ============================================================================

/** Get current customer info from RevenueCat */
export async function getCustomerInfo(): Promise<CustomerInfo> {
  ensureInitialized();
  return Purchases.getCustomerInfo();
}

/** Check if user has active "Unitulkki Pro" entitlement */
export async function hasProAccess(): Promise<boolean> {
  try {
    const customerInfo = await getCustomerInfo();
    return ENTITLEMENT_ID in customerInfo.entitlements.active;
  } catch (error) {
    log.error("Error checking pro access:", error);
    return false;
  }
}

/** Get detailed subscription status */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const emptyStatus: SubscriptionStatus = {
    isActive: false,
    entitlementId: null,
    productId: null,
    plan: null,
    expiresAt: null,
    willRenew: false,
    isInTrial: false,
    isSandbox: false,
  };

  try {
    const customerInfo = await getCustomerInfo();
    const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];

    if (!entitlement) {
      return emptyStatus;
    }

    return {
      isActive: true,
      entitlementId: ENTITLEMENT_ID,
      productId: entitlement.productIdentifier,
      plan: getPlanFromProductId(entitlement.productIdentifier),
      expiresAt: entitlement.expirationDate
        ? new Date(entitlement.expirationDate)
        : null,
      willRenew: Boolean(entitlement.willRenew),
      isInTrial: entitlement.periodType === "TRIAL",
      isSandbox: entitlement.isSandbox,
    };
  } catch (error) {
    log.error("Error getting subscription status:", error);
    return emptyStatus;
  }
}

/**
 * Listen for customer info updates
 *
 * @returns Cleanup function to remove the listener
 */
export function addCustomerInfoListener(
  listener: (info: CustomerInfo) => void
): () => void {
  currentListener = listener;
  Purchases.addCustomerInfoUpdateListener(listener);

  return () => {
    if (currentListener === listener) {
      Purchases.removeCustomerInfoUpdateListener(listener);
      currentListener = null;
    }
  };
}

// ============================================================================
// Offerings & Products
// ============================================================================

/** Get all available offerings */
export async function getOfferings(): Promise<PurchasesOfferings> {
  ensureInitialized();
  return Purchases.getOfferings();
}

/** Get the current (default) offering */
export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  const offerings = await getOfferings();
  return offerings.current;
}

/** Get a specific offering by identifier */
export async function getOffering(
  identifier: string
): Promise<PurchasesOffering | null> {
  const offerings = await getOfferings();
  return offerings.all[identifier] ?? null;
}

/** Product info formatted for purchase UI */
export type ProductInfo = {
  package: PurchasesPackage;
  plan: PremiumPlan;
  price: string;
  pricePerMonth: string;
  introPrice?: string;
  isPopular: boolean;
};

/**
 * Get products formatted for purchase display
 *
 * Returns products sorted by popularity (yearly first)
 */
export async function getAvailableProducts(): Promise<ProductInfo[]> {
  const offering = await getCurrentOffering();
  if (!offering) return [];

  const packageToPlan: Record<string, PremiumPlan> = {
    "$rc_monthly": "monthly",
    "$rc_annual": "yearly",
    "$rc_lifetime": "lifetime",
  };

  const products: ProductInfo[] = [];

  for (const pkg of offering.availablePackages) {
    const plan = packageToPlan[pkg.identifier];
    if (!plan) continue;

    const product = pkg.product;

    // Calculate equivalent monthly price for yearly plan
    let pricePerMonth = product.priceString;
    if (plan === "yearly") {
      const monthlyEquivalent = product.price / 12;
      pricePerMonth = `${monthlyEquivalent.toFixed(2)} €/kk`;
    }

    products.push({
      package: pkg,
      plan,
      price: product.priceString,
      pricePerMonth,
      introPrice: product.introPrice?.priceString,
      isPopular: plan === "yearly",
    });
  }

  // Sort: yearly (popular) first, then monthly, then lifetime
  const sortOrder: Record<PremiumPlan, number> = {
    yearly: 0,
    monthly: 1,
    lifetime: 2,
  };
  return products.sort((a, b) => sortOrder[a.plan] - sortOrder[b.plan]);
}

// ============================================================================
// Purchases
// ============================================================================

/** Purchase a specific package */
export async function purchasePackage(
  pkg: PurchasesPackage
): Promise<PurchaseResult> {
  ensureInitialized();

  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isActive = ENTITLEMENT_ID in customerInfo.entitlements.active;

    if (isActive) {
      Analytics.purchased(
        getPlanFromProductId(pkg.product.identifier),
        pkg.product.price
      );
    }

    return { success: isActive, customerInfo };
  } catch (error) {
    return handlePurchaseError(error);
  }
}

/** Purchase by plan type (monthly, yearly, lifetime) */
export async function purchasePlan(plan: PremiumPlan): Promise<PurchaseResult> {
  const offering = await getCurrentOffering();
  if (!offering) {
    return {
      success: false,
      error: "No offering available",
      errorCode: "NO_OFFERING",
    };
  }

  const packageIdMap: Record<PremiumPlan, string> = {
    monthly: "$rc_monthly",
    yearly: "$rc_annual",
    lifetime: "$rc_lifetime",
  };

  const pkg = offering.availablePackages.find(
    (p) => p.identifier === packageIdMap[plan]
  );

  if (!pkg) {
    return {
      success: false,
      error: `Package not found for plan: ${plan}`,
      errorCode: "PACKAGE_NOT_FOUND",
    };
  }

  return purchasePackage(pkg);
}

/** Restore previous purchases */
export async function restorePurchases(): Promise<PurchaseResult> {
  ensureInitialized();

  try {
    const customerInfo = await Purchases.restorePurchases();
    const isActive = ENTITLEMENT_ID in customerInfo.entitlements.active;
    return { success: isActive, customerInfo };
  } catch (error) {
    return handlePurchaseError(error);
  }
}

// ============================================================================
// Paywalls (RevenueCatUI)
// ============================================================================

/** Present the default paywall */
export async function presentPaywall(): Promise<PaywallResult> {
  ensureInitialized();

  try {
    const result = await RevenueCatUI.presentPaywall();
    return mapPaywallResult(result);
  } catch (error) {
    log.error("Paywall error:", error);
    return { purchased: false, restored: false, cancelled: false, error: true };
  }
}

/** Present paywall only if user doesn't have pro access */
export async function presentPaywallIfNeeded(): Promise<PaywallResult> {
  ensureInitialized();

  try {
    const result = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: ENTITLEMENT_ID,
    });
    return mapPaywallResult(result);
  } catch (error) {
    log.error("Paywall error:", error);
    return { purchased: false, restored: false, cancelled: false, error: true };
  }
}

/** Present paywall for a specific offering */
export async function presentPaywallForOffering(
  offeringId: string
): Promise<PaywallResult> {
  ensureInitialized();

  try {
    const offerings = await Purchases.getOfferings();
    const offering = offerings.all[offeringId];

    if (!offering) {
      log.warn(`Offering not found: ${offeringId}`);
      return { purchased: false, restored: false, cancelled: false, error: true };
    }

    const result = await RevenueCatUI.presentPaywall({ offering });
    return mapPaywallResult(result);
  } catch (error) {
    log.error("Paywall error:", error);
    return { purchased: false, restored: false, cancelled: false, error: true };
  }
}

// ============================================================================
// Customer Center
// ============================================================================

/**
 * Present Customer Center for subscription management
 *
 * Users can:
 * - View subscription status
 * - Cancel subscriptions
 * - Restore purchases
 * - Request refunds (iOS)
 * - Change plans (iOS)
 */
export async function presentCustomerCenter(): Promise<void> {
  ensureInitialized();

  try {
    await RevenueCatUI.presentCustomerCenter({
      callbacks: {
        onFeedbackSurveyCompleted: ({ feedbackSurveyOptionId }) => {
          log.info("Feedback survey completed:", feedbackSurveyOptionId);
        },
        onShowingManageSubscriptions: () => {
          log.info("Showing manage subscriptions");
        },
        onRestoreStarted: () => {
          log.info("Restore started from Customer Center");
        },
        onRestoreCompleted: ({ customerInfo }) => {
          log.info("Restore completed:", customerInfo.entitlements.active);
        },
        onRestoreFailed: ({ error }) => {
          log.error("Restore failed:", error);
        },
        onRefundRequestStarted: ({ productIdentifier }) => {
          log.info("Refund requested for:", productIdentifier);
        },
        onRefundRequestCompleted: ({ refundRequestStatus }) => {
          log.info("Refund status:", refundRequestStatus);
        },
        onManagementOptionSelected: ({ option }) => {
          log.info("Management option selected:", option);
        },
      },
    });
  } catch (error) {
    log.error("Customer Center error:", error);
    throw error;
  }
}

// ============================================================================
// User Management
// ============================================================================

/**
 * Log in a user for cross-device subscription sync
 *
 * Call this after user authentication to link purchases to their account.
 */
export async function logIn(userId: string): Promise<CustomerInfo> {
  ensureInitialized();
  const { customerInfo } = await Purchases.logIn(userId);
  return customerInfo;
}

/** Log out the current user (returns to anonymous) */
export async function logOut(): Promise<CustomerInfo> {
  ensureInitialized();
  return Purchases.logOut();
}

/** Get the current RevenueCat app user ID */
export async function getAppUserID(): Promise<string> {
  ensureInitialized();
  return Purchases.getAppUserID();
}

// ============================================================================
// Internal Helpers
// ============================================================================

function ensureInitialized(): void {
  if (!isInitialized) {
    throw new Error(
      "RevenueCat SDK not initialized. Call RevenueCat.initialize() first."
    );
  }
}

/** Map RevenueCat error to user-friendly result */
function handlePurchaseError(error: unknown): PurchaseResult {
  const rcError = error as { code?: PURCHASES_ERROR_CODE; message?: string };

  // User cancelled - not an error condition
  if (rcError.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
    return { success: false, cancelled: true };
  }

  // Map error codes to Finnish user-friendly messages
  const errorMessages: Partial<Record<PURCHASES_ERROR_CODE, [string, string]>> = {
    [PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR]: [
      "PAYMENT_PENDING",
      "Maksu odottaa vahvistusta",
    ],
    [PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR]: [
      "ALREADY_PURCHASED",
      "Sinulla on jo tämä tilaus",
    ],
    [PURCHASES_ERROR_CODE.NETWORK_ERROR]: [
      "NETWORK_ERROR",
      "Verkkovirhe. Tarkista yhteys.",
    ],
    [PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR]: [
      "STORE_ERROR",
      "Ongelma kaupassa. Yritä myöhemmin.",
    ],
    [PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR]: [
      "NOT_ALLOWED",
      "Ostot eivät ole sallittuja tällä laitteella",
    ],
  };

  const [errorCode, errorMessage] =
    (rcError.code !== undefined && errorMessages[rcError.code]) ||
    ["UNKNOWN", rcError.message || "Osto epäonnistui"];

  log.error("Purchase error:", errorCode, errorMessage);
  Analytics.purchaseFailed(errorCode, errorMessage);

  return { success: false, error: errorMessage, errorCode };
}

/** Map RevenueCatUI paywall result to our PaywallResult type */
function mapPaywallResult(result: PAYWALL_RESULT): PaywallResult {
  const resultMap: Record<PAYWALL_RESULT, PaywallResult> = {
    [PAYWALL_RESULT.PURCHASED]: {
      purchased: true,
      restored: false,
      cancelled: false,
      error: false,
    },
    [PAYWALL_RESULT.RESTORED]: {
      purchased: false,
      restored: true,
      cancelled: false,
      error: false,
    },
    [PAYWALL_RESULT.CANCELLED]: {
      purchased: false,
      restored: false,
      cancelled: true,
      error: false,
    },
    [PAYWALL_RESULT.ERROR]: {
      purchased: false,
      restored: false,
      cancelled: false,
      error: true,
    },
    [PAYWALL_RESULT.NOT_PRESENTED]: {
      purchased: false,
      restored: false,
      cancelled: false,
      error: false,
    },
  };

  return resultMap[result] ?? resultMap[PAYWALL_RESULT.NOT_PRESENTED];
}

/** Extract plan type from product identifier */
function getPlanFromProductId(productId: string): PremiumPlan {
  if (productId.includes("yearly") || productId.includes("annual")) {
    return "yearly";
  }
  if (productId.includes("lifetime")) {
    return "lifetime";
  }
  return "monthly";
}

// ============================================================================
// Public API
// ============================================================================

export const RevenueCat = {
  // Initialization
  initialize: initializeRevenueCat,
  isInitialized: isRevenueCatInitialized,

  // Customer Info
  getCustomerInfo,
  hasProAccess,
  getSubscriptionStatus,
  addCustomerInfoListener,

  // Offerings & Products
  getOfferings,
  getCurrentOffering,
  getOffering,
  getAvailableProducts,

  // Purchases
  purchasePackage,
  purchasePlan,
  restorePurchases,

  // Paywalls
  presentPaywall,
  presentPaywallIfNeeded,
  presentPaywallForOffering,

  // Customer Center
  presentCustomerCenter,

  // User Management
  logIn,
  logOut,
  getAppUserID,

  // Constants
  ENTITLEMENT_ID,
  OFFERING_IDS,
  PRODUCT_IDS,
};

export default RevenueCat;
