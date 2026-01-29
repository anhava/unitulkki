// Global configuration
export const CONFIG = {
  // Base URL for the backend API
  // In production (native), this must point to the hosted backend
  // In development, it falls back to empty string (relative for web) or localhost
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || "https://api.unitulkki.site",
};
