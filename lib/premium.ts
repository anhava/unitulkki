/**
 * Premium tier configuration and types
 *
 * Based on industry research:
 * - Dreamly: $9.99/mo or $44.99/yr
 * - Oniri: $6.99/mo or $47.99/yr
 * - Industry average: $7-10/mo, $40-50/yr
 */

// Premium tier types
export type PremiumPlan = "monthly" | "yearly" | "lifetime";

export type PremiumFeature = {
  id: string;
  title: string;
  description: string;
  icon: string;
  freeLimit?: string;
  premiumValue: string;
};

// Pricing configuration (in cents for precision)
export const PRICING = {
  monthly: {
    price: 999, // $9.99
    period: "kuukausi",
    periodShort: "kk",
    savings: null,
  },
  yearly: {
    price: 4999, // $49.99
    period: "vuosi",
    periodShort: "v",
    savings: 50, // 50% savings vs monthly
    monthlyEquivalent: 417, // $4.17/month
  },
  lifetime: {
    price: 9999, // $99.99
    period: "ikuisesti",
    periodShort: "",
    savings: null,
  },
} as const;

// Format price for display
export function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}

// Premium features list
export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    id: "unlimited",
    title: "Rajattomat tulkinnat",
    description: "Tulkitse niin monta unta kuin haluat, ilman rajoituksia",
    icon: "infinity",
    freeLimit: "3 tulkintaa/kk",
    premiumValue: "Rajaton",
  },
  {
    id: "deep_analysis",
    title: "Syvempi analyysi",
    description: "Jungilainen arkkityyppianalyysi ja alitajunnan oivallukset",
    icon: "diamond",
    freeLimit: "Lukittu",
    premiumValue: "Täysi pääsy",
  },
  {
    id: "patterns",
    title: "Unikuvioiden seuranta",
    description: "Tunnista toistuvat teemat ja symbolit ajan mittaan",
    icon: "line-chart",
    freeLimit: "Ei saatavilla",
    premiumValue: "Täysi analyysi",
  },
  {
    id: "visualization",
    title: "Unien visualisointi",
    description: "Luo tekoälykuvia unistasi",
    icon: "paint-brush",
    freeLimit: "Ei saatavilla",
    premiumValue: "Rajaton",
  },
  {
    id: "export",
    title: "PDF-vienti",
    description: "Tallenna ja jaa tulkintasi kauniina PDF-dokumenttina",
    icon: "file-pdf-o",
    freeLimit: "Ei saatavilla",
    premiumValue: "Rajaton",
  },
  {
    id: "voice",
    title: "Äänitallenne",
    description: "Kerro unesi puhumalla heti herättyäsi",
    icon: "microphone",
    freeLimit: "Ei saatavilla",
    premiumValue: "Saatavilla",
  },
];

// Free tier limits
export const FREE_TIER_LIMITS = {
  interpretationsPerMonth: 3,
  hasDeepAnalysis: false,
  hasPatternTracking: false,
  hasVisualization: false,
  hasExport: false,
  hasVoiceInput: false,
};

// Premium benefits for paywall
export const PREMIUM_BENEFITS = [
  {
    emoji: "🔮",
    title: "Rajattomat tulkinnat",
    highlight: true,
  },
  {
    emoji: "🧠",
    title: "Syvempi psykologinen analyysi",
    highlight: true,
  },
  {
    emoji: "📊",
    title: "Unikuvioiden seuranta",
    highlight: false,
  },
  {
    emoji: "🎨",
    title: "AI-univisualisoinnit",
    highlight: false,
  },
  {
    emoji: "📄",
    title: "PDF-vienti",
    highlight: false,
  },
  {
    emoji: "🎙️",
    title: "Äänitallenne",
    highlight: false,
  },
];

// Trial configuration
export const TRIAL_CONFIG = {
  durationDays: 7,
  requiresPaymentUpfront: false, // Reverse trial - full access first
};
