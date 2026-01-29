/**
 * Unitulkki i18n - Internationalization
 *
 * Finnish-first approach with i18n-ready structure for future expansion.
 *
 * Strategy:
 * - Blue ocean: Only Finnish AI dream interpreter in market
 * - ASO advantage: "unitulkki" ranks easier than "dream interpreter"
 * - Finnish AI = competitive moat
 */

import { fi } from "./locales/fi";
import { en } from "./locales/en";

export type Locale = "fi" | "en";

export const translations = {
  fi,
  en,
} as const;

// Default locale is Finnish (blue ocean strategy)
let currentLocale: Locale = "fi";

/**
 * Get current locale
 */
export function getLocale(): Locale {
  return currentLocale;
}

/**
 * Set current locale
 */
export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

/**
 * Get translation for a key
 */
export function t<K extends keyof typeof fi>(key: K): string {
  return translations[currentLocale][key] ?? translations.fi[key] ?? key;
}

/**
 * Get all translations for current locale
 */
export function getTranslations() {
  return translations[currentLocale];
}

export { fi, en };
