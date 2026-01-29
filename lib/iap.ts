/**
 * In-App Purchases with RevenueCat
 *
 * RevenueCat provides:
 * - Server-side receipt validation
 * - Cross-platform subscription management
 * - Analytics and conversion tracking
 * - Handles edge cases (refunds, family sharing, etc.)
 *
 * Setup required:
 * 1. Create account at https://app.revenuecat.com
 * 2. Configure products in App Store Connect / Google Play Console
 * 3. Add product IDs to RevenueCat dashboard
 * 4. Copy API keys to .env.local
 */

import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Purchases, {
  PurchasesOfferings,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
} from "react-native-purchases";
import { PRICING, type PremiumPlan } from "./premium";
import { Analytics } from "./analytics";

// RevenueCat API Keys - Store these in environment variables
const REVENUECAT_API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || "",
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || "",
  default: "",
});

// Product IDs - must match RevenueCat dashboard
export const PRODUCT_IDS = {
  monthly: Platform.select({
    ios: "com.dreamai.premium.monthly",
    android: "premium_monthly",
    default: "premium_monthly",
  }),
  yearly: Platform.select({
    ios: "com.dreamai.premium.yearly",
    android: "premium_yearly",
    default: "premium_yearly",
  }),
  lifetime: Platform.select({
    ios: "com.dreamai.premium.lifetime",
    android: "premium_lifetime",
    default: "premium_lifetime",
  }),
} as const;

// RevenueCat entitlement ID
const PREMIUM_ENTITLEMENT = "premium";

// Purchase result
export type PurchaseResult = {
  success: boolean;
  productId: string;
  transactionId?: string;
  error?: string;
  errorCode?: string;
};

// Subscription status
export type SubscriptionStatus = {
  isActive: boolean;
  plan: PremiumPlan | null;
  expiresAt: string | null;
  willRenew: boolean;
  source: "app_store" | "play_store" | "promotional" | "none";
};

// Storage keys for development mode
const STORAGE_KEYS = {
  subscriptionStatus: "dreamai_subscription_status",
  purchaseHistory: "dreamai_purchase_history",
  devMode: "dreamai_iap_dev_mode",
};

// Check if we're in development mode (no API key configured)
const isDevMode = !REVENUECAT_API_KEY || __DEV__;

/**
 * Initialize RevenueCat
 */
export async function initializeIAP(): Promise<void> {
  if (isDevMode) {
    console.log("[IAP] Running in development mode (mock purchases)");
    return;
  }

  try {
    // Configure RevenueCat
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);

    await Purchases.configure({
      apiKey: REVENUECAT_API_KEY!,
      appUserID: null, // Let RevenueCat generate anonymous ID
    });

    // Listen for customer info updates
    Purchases.addCustomerInfoUpdateListener((info) => {
      console.log("[IAP] Customer info updated:", info.entitlements.active);
    });

    console.log("[IAP] RevenueCat initialized");
  } catch (error) {
    console.error("[IAP] Initialization error:", error);
  }
}

/**
 * Get available offerings (products with prices)
 */
export async function getOfferings(): Promise<PurchasesOfferings | null> {
  if (isDevMode) {
    return null;
  }

  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.error("[IAP] Get offerings error:", error);
    return null;
  }
}

/**
 * Get available products with prices
 */
export async function getProducts(): Promise<
  Array<{
    id: string;
    plan: PremiumPlan;
    price: string;
    priceValue: number;
    currency: string;
    period: string;
    package?: PurchasesPackage;
  }>
> {
  if (isDevMode) {
    // Return configured prices for development
    return [
      {
        id: PRODUCT_IDS.monthly!,
        plan: "monthly",
        price: `${(PRICING.monthly.price / 100).toFixed(2)} €`,
        priceValue: PRICING.monthly.price / 100,
        currency: "EUR",
        period: PRICING.monthly.period,
      },
      {
        id: PRODUCT_IDS.yearly!,
        plan: "yearly",
        price: `${(PRICING.yearly.price / 100).toFixed(2)} €`,
        priceValue: PRICING.yearly.price / 100,
        currency: "EUR",
        period: PRICING.yearly.period,
      },
      {
        id: PRODUCT_IDS.lifetime!,
        plan: "lifetime",
        price: `${(PRICING.lifetime.price / 100).toFixed(2)} €`,
        priceValue: PRICING.lifetime.price / 100,
        currency: "EUR",
        period: PRICING.lifetime.period,
      },
    ];
  }

  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;

    if (!current) {
      console.warn("[IAP] No current offering found");
      return [];
    }

    const products: Array<{
      id: string;
      plan: PremiumPlan;
      price: string;
      priceValue: number;
      currency: string;
      period: string;
      package: PurchasesPackage;
    }> = [];

    // Map packages to our plan types
    const packageMapping: Record<string, PremiumPlan> = {
      "$rc_monthly": "monthly",
      "$rc_annual": "yearly",
      "$rc_lifetime": "lifetime",
    };

    for (const [identifier, plan] of Object.entries(packageMapping)) {
      const pkg = current.availablePackages.find(
        (p) => p.identifier === identifier
      );
      if (pkg) {
        products.push({
          id: pkg.product.identifier,
          plan,
          price: pkg.product.priceString,
          priceValue: pkg.product.price,
          currency: pkg.product.currencyCode,
          period: PRICING[plan].period,
          package: pkg,
        });
      }
    }

    return products;
  } catch (error) {
    console.error("[IAP] Get products error:", error);
    return [];
  }
}

/**
 * Purchase a subscription
 */
export async function purchaseSubscription(
  plan: PremiumPlan
): Promise<PurchaseResult> {
  const productId = PRODUCT_IDS[plan];

  if (!productId) {
    return {
      success: false,
      productId: "",
      error: "Tuntematon tuote",
      errorCode: "UNKNOWN_PRODUCT",
    };
  }

  // Development mode - simulate purchase
  if (isDevMode) {
    console.log(`[IAP] Dev mode: Simulating purchase of ${plan}`);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const transactionId = `dev_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;

    // Save mock subscription status
    const expiresAt = calculateExpiryDate(plan);
    await saveSubscriptionStatus({
      isActive: true,
      plan,
      expiresAt: expiresAt.toISOString(),
      willRenew: plan !== "lifetime",
      source: Platform.OS === "ios" ? "app_store" : "play_store",
    });

    Analytics.purchased(plan, PRICING[plan].price / 100);

    return {
      success: true,
      productId,
      transactionId,
    };
  }

  // Production - use RevenueCat
  try {
    const products = await getProducts();
    const product = products.find((p) => p.plan === plan);

    if (!product?.package) {
      return {
        success: false,
        productId,
        error: "Tuotetta ei löytynyt",
        errorCode: "PRODUCT_NOT_FOUND",
      };
    }

    const { customerInfo } = await Purchases.purchasePackage(product.package);

    // Check if premium entitlement is now active
    if (customerInfo.entitlements.active[PREMIUM_ENTITLEMENT]) {
      Analytics.purchased(plan, product.priceValue);

      return {
        success: true,
        productId,
        transactionId:
          customerInfo.entitlements.active[PREMIUM_ENTITLEMENT]
            .originalPurchaseDate,
      };
    }

    return {
      success: false,
      productId,
      error: "Tilaus ei aktivoitunut",
      errorCode: "ENTITLEMENT_NOT_ACTIVE",
    };
  } catch (error) {
    console.error("[IAP] Purchase error:", error);

    let errorMessage = "Osto epäonnistui";
    let errorCode = "UNKNOWN";

    // Check if error has RevenueCat error code
    const rcError = error as { code?: PURCHASES_ERROR_CODE; message?: string };
    if (rcError.code !== undefined) {
      errorCode = String(rcError.code);

      switch (rcError.code) {
        case PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR:
          errorMessage = "Osto peruutettu";
          errorCode = "USER_CANCELLED";
          break;
        case PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR:
          errorMessage = "Maksu odottaa vahvistusta";
          errorCode = "PAYMENT_PENDING";
          break;
        case PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR:
          errorMessage = "Sinulla on jo tämä tilaus";
          errorCode = "ALREADY_PURCHASED";
          break;
        case PURCHASES_ERROR_CODE.NETWORK_ERROR:
          errorMessage = "Verkkovirhe. Tarkista yhteys.";
          errorCode = "NETWORK_ERROR";
          break;
        case PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR:
          errorMessage = "Ongelma kaupassa. Yritä myöhemmin.";
          errorCode = "STORE_ERROR";
          break;
        default:
          errorMessage = rcError.message || "Osto epäonnistui";
      }
    }

    Analytics.purchaseFailed(plan, errorCode);

    return {
      success: false,
      productId,
      error: errorMessage,
      errorCode,
    };
  }
}

/**
 * Restore purchases
 */
export async function restorePurchases(): Promise<SubscriptionStatus> {
  if (isDevMode) {
    console.log("[IAP] Dev mode: Restoring from local storage");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return getSubscriptionStatus();
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    return mapCustomerInfoToStatus(customerInfo);
  } catch (error) {
    console.error("[IAP] Restore error:", error);
    return {
      isActive: false,
      plan: null,
      expiresAt: null,
      willRenew: false,
      source: "none",
    };
  }
}

/**
 * Get current subscription status
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  if (isDevMode) {
    // Development: check local storage
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.subscriptionStatus);

    if (!stored) {
      return {
        isActive: false,
        plan: null,
        expiresAt: null,
        willRenew: false,
        source: "none",
      };
    }

    const status: SubscriptionStatus = JSON.parse(stored);

    // Check if expired
    if (status.expiresAt && new Date(status.expiresAt) < new Date()) {
      const expiredStatus: SubscriptionStatus = {
        isActive: false,
        plan: null,
        expiresAt: null,
        willRenew: false,
        source: "none",
      };
      await saveSubscriptionStatus(expiredStatus);
      return expiredStatus;
    }

    return status;
  }

  // Production: check RevenueCat
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return mapCustomerInfoToStatus(customerInfo);
  } catch (error) {
    console.error("[IAP] Status error:", error);
    return {
      isActive: false,
      plan: null,
      expiresAt: null,
      willRenew: false,
      source: "none",
    };
  }
}

/**
 * Map RevenueCat CustomerInfo to our SubscriptionStatus
 */
function mapCustomerInfoToStatus(info: CustomerInfo): SubscriptionStatus {
  const premiumEntitlement = info.entitlements.active[PREMIUM_ENTITLEMENT];

  if (!premiumEntitlement) {
    return {
      isActive: false,
      plan: null,
      expiresAt: null,
      willRenew: false,
      source: "none",
    };
  }

  // Determine plan from product identifier
  let plan: PremiumPlan = "monthly";
  const productId = premiumEntitlement.productIdentifier;

  if (productId.includes("yearly") || productId.includes("annual")) {
    plan = "yearly";
  } else if (productId.includes("lifetime")) {
    plan = "lifetime";
  }

  // Determine source from store string
  let source: SubscriptionStatus["source"] = "none";
  const storeString = String(premiumEntitlement.store);
  if (storeString === "APP_STORE" || storeString === "MAC_APP_STORE") {
    source = "app_store";
  } else if (storeString === "PLAY_STORE") {
    source = "play_store";
  } else if (storeString === "PROMOTIONAL") {
    source = "promotional";
  }

  return {
    isActive: true,
    plan,
    expiresAt: premiumEntitlement.expirationDate,
    willRenew: !premiumEntitlement.willRenew ? false : true,
    source,
  };
}

/**
 * Save subscription status (for development mode)
 */
async function saveSubscriptionStatus(
  status: SubscriptionStatus
): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEYS.subscriptionStatus,
    JSON.stringify(status)
  );
}

/**
 * Calculate expiry date based on plan
 */
function calculateExpiryDate(plan: PremiumPlan): Date {
  const now = new Date();

  switch (plan) {
    case "monthly":
      return new Date(now.setMonth(now.getMonth() + 1));
    case "yearly":
      return new Date(now.setFullYear(now.getFullYear() + 1));
    case "lifetime":
      return new Date(now.setFullYear(now.getFullYear() + 100));
    default:
      return now;
  }
}

/**
 * Open subscription management (native store)
 */
export async function openSubscriptionManagement(): Promise<void> {
  const { Linking } = await import("react-native");

  if (Platform.OS === "ios") {
    await Linking.openURL("https://apps.apple.com/account/subscriptions");
  } else {
    await Linking.openURL(
      "https://play.google.com/store/account/subscriptions"
    );
  }
}

/**
 * Set user ID for RevenueCat (for cross-device sync)
 */
export async function setUserID(userId: string): Promise<void> {
  if (isDevMode) return;

  try {
    await Purchases.logIn(userId);
    console.log("[IAP] User ID set:", userId);
  } catch (error) {
    console.error("[IAP] Set user ID error:", error);
  }
}

/**
 * Clear user ID (for logout)
 */
export async function clearUserID(): Promise<void> {
  if (isDevMode) return;

  try {
    await Purchases.logOut();
    console.log("[IAP] User logged out");
  } catch (error) {
    console.error("[IAP] Logout error:", error);
  }
}

/**
 * Grant promotional access (for development/testing)
 */
export async function grantPromotionalAccess(
  plan: PremiumPlan,
  durationDays: number
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + durationDays);

  await saveSubscriptionStatus({
    isActive: true,
    plan,
    expiresAt: expiresAt.toISOString(),
    willRenew: false,
    source: "promotional",
  });

  console.log(
    `[IAP] Granted promotional ${plan} access for ${durationDays} days`
  );
}

/**
 * Clear subscription (for development/testing)
 */
export async function clearSubscription(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.subscriptionStatus);
  await AsyncStorage.removeItem(STORAGE_KEYS.purchaseHistory);
  console.log("[IAP] Subscription cleared");
}

/**
 * Check if running in development mode
 */
export function isIAPDevMode(): boolean {
  return isDevMode;
}
