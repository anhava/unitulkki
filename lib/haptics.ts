import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HAPTICS_ENABLED_KEY = "@dreamai_haptics_enabled";

let hapticsEnabled = true;

// Initialize haptics setting from storage
export async function initHaptics(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(HAPTICS_ENABLED_KEY);
    hapticsEnabled = stored !== "false";
  } catch {
    hapticsEnabled = true;
  }
}

// Get current haptics setting
export async function getHapticsEnabled(): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(HAPTICS_ENABLED_KEY);
    return stored !== "false";
  } catch {
    return true;
  }
}

// Set haptics enabled/disabled
export async function setHapticsEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(HAPTICS_ENABLED_KEY, enabled ? "true" : "false");
    hapticsEnabled = enabled;
  } catch (error) {
    console.error("Error saving haptics setting:", error);
  }
}

// Light tap - for toggles, selections
export function lightTap(): void {
  if (hapticsEnabled) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

// Medium tap - for button presses
export function mediumTap(): void {
  if (hapticsEnabled) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
}

// Heavy tap - for important actions
export function heavyTap(): void {
  if (hapticsEnabled) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }
}

// Success feedback - for successful operations
export function successFeedback(): void {
  if (hapticsEnabled) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}

// Error feedback - for errors
export function errorFeedback(): void {
  if (hapticsEnabled) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
}

// Warning feedback - for warnings
export function warningFeedback(): void {
  if (hapticsEnabled) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }
}

// Selection change - for list selections, tab changes
export function selectionChange(): void {
  if (hapticsEnabled) {
    Haptics.selectionAsync();
  }
}

export default {
  init: initHaptics,
  getEnabled: getHapticsEnabled,
  setEnabled: setHapticsEnabled,
  light: lightTap,
  medium: mediumTap,
  heavy: heavyTap,
  success: successFeedback,
  error: errorFeedback,
  warning: warningFeedback,
  selection: selectionChange,
};
