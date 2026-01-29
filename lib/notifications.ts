/**
 * Push Notifications for DreamAI
 *
 * Features:
 * - Morning alarm to log dreams
 * - Configurable notification time
 * - Action buttons (Log dream, Snooze)
 * - Deep link to dream input screen
 * - Local notifications (no server needed)
 */

import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { router } from "expo-router";

// Storage keys
const STORAGE_KEYS = {
  notificationsEnabled: "dreamai_notifications_enabled",
  notificationTime: "dreamai_notification_time",
  notificationId: "dreamai_notification_id",
  snoozeCount: "dreamai_snooze_count",
};

// Default notification time (8:00 AM)
const DEFAULT_NOTIFICATION_HOUR = 8;
const DEFAULT_NOTIFICATION_MINUTE = 0;

// Snooze duration in minutes
const SNOOZE_DURATION_MINUTES = 5;

// Notification category ID for action buttons
const ALARM_CATEGORY_ID = "dream_alarm";

// Notification channel ID for Android
const ALARM_CHANNEL_ID = "dream-alarm";

// Notification content
const NOTIFICATION_CONTENT = {
  title: "⏰ Aamuherätys - Unitulkki",
  body: "Kirjaa unesi nyt kun se on vielä tuoreessa muistissa!",
  snoozeTitle: "⏰ Torkku - Unitulkki",
  snoozeBody: "Herätys! Kirjaa unesi.",
};

// Configure notification behavior - high priority for alarms
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data;
    const isAlarm = data?.type === "dream_alarm" || data?.type === "snooze";

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: isAlarm,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    if (existingStatus === "granted") {
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
}

/**
 * Check if notifications are permitted
 */
export async function hasNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

/**
 * Schedule daily morning alarm
 */
export async function scheduleMorningReminder(
  hour: number = DEFAULT_NOTIFICATION_HOUR,
  minute: number = DEFAULT_NOTIFICATION_MINUTE
): Promise<string | null> {
  try {
    // Cancel existing reminder first
    await cancelMorningReminder();

    // Check permission
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log("[Notifications] Permission not granted");
      return null;
    }

    // Ensure notification categories and channels are configured
    await initializeNotifications();

    // Schedule the alarm notification
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: NOTIFICATION_CONTENT.title,
        body: NOTIFICATION_CONTENT.body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        vibrate: [0, 500, 200, 500, 200, 500],
        data: { type: "dream_alarm" },
        categoryIdentifier: ALARM_CATEGORY_ID,
        ...(Platform.OS === "android" && { channelId: ALARM_CHANNEL_ID }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    // Save settings
    await AsyncStorage.setItem(STORAGE_KEYS.notificationsEnabled, "true");
    await AsyncStorage.setItem(
      STORAGE_KEYS.notificationTime,
      JSON.stringify({ hour, minute })
    );
    await AsyncStorage.setItem(STORAGE_KEYS.notificationId, id);

    console.log(`[Notifications] Alarm scheduled for ${hour}:${minute.toString().padStart(2, "0")}`);
    return id;
  } catch (error) {
    console.error("[Notifications] Scheduling error:", error);
    return null;
  }
}

/**
 * Cancel morning reminder
 */
export async function cancelMorningReminder(): Promise<void> {
  try {
    const existingId = await AsyncStorage.getItem(STORAGE_KEYS.notificationId);
    
    if (existingId) {
      await Notifications.cancelScheduledNotificationAsync(existingId);
      await AsyncStorage.removeItem(STORAGE_KEYS.notificationId);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.notificationsEnabled, "false");
  } catch (error) {
    console.error("Error canceling notification:", error);
  }
}

/**
 * Get notification settings
 */
export async function getNotificationSettings(): Promise<{
  enabled: boolean;
  hour: number;
  minute: number;
}> {
  try {
    const enabled = await AsyncStorage.getItem(STORAGE_KEYS.notificationsEnabled);
    const timeStr = await AsyncStorage.getItem(STORAGE_KEYS.notificationTime);

    let hour = DEFAULT_NOTIFICATION_HOUR;
    let minute = DEFAULT_NOTIFICATION_MINUTE;

    if (timeStr) {
      const parsed = JSON.parse(timeStr);
      hour = parsed.hour ?? DEFAULT_NOTIFICATION_HOUR;
      minute = parsed.minute ?? DEFAULT_NOTIFICATION_MINUTE;
    }

    return {
      enabled: enabled === "true",
      hour,
      minute,
    };
  } catch (error) {
    console.error("Error getting notification settings:", error);
    return {
      enabled: false,
      hour: DEFAULT_NOTIFICATION_HOUR,
      minute: DEFAULT_NOTIFICATION_MINUTE,
    };
  }
}

/**
 * Update notification time
 */
export async function updateNotificationTime(
  hour: number,
  minute: number
): Promise<void> {
  const settings = await getNotificationSettings();
  
  if (settings.enabled) {
    await scheduleMorningReminder(hour, minute);
  } else {
    // Just save the time preference
    await AsyncStorage.setItem(
      STORAGE_KEYS.notificationTime,
      JSON.stringify({ hour, minute })
    );
  }
}

/**
 * Toggle notifications on/off
 */
export async function toggleNotifications(enabled: boolean): Promise<boolean> {
  if (enabled) {
    const settings = await getNotificationSettings();
    const id = await scheduleMorningReminder(settings.hour, settings.minute);
    return id !== null;
  } else {
    await cancelMorningReminder();
    return true;
  }
}

/**
 * Send immediate test notification (simulates the alarm)
 */
export async function sendTestNotification(): Promise<void> {
  const hasPermission = await requestNotificationPermissions();

  if (!hasPermission) {
    throw new Error("Ilmoituslupa vaaditaan");
  }

  // Ensure categories and channels are configured
  await initializeNotifications();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "⏰ Testiherätys - Unitulkki",
      body: "Näin herätys näyttää! Napauta avataksesi sovelluksen.",
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
      vibrate: [0, 500, 200, 500],
      data: { type: "test_alarm" },
      categoryIdentifier: ALARM_CATEGORY_ID,
      ...(Platform.OS === "android" && { channelId: ALARM_CHANNEL_ID }),
    },
    trigger: null, // Immediate
  });
}

/**
 * Format time for display
 */
export function formatNotificationTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

/**
 * Get all scheduled notifications (for debugging)
 */
export async function getScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  return Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Configure Android notification channel for alarms
 */
export async function configureAndroidChannel(): Promise<void> {
  if (Platform.OS === "android") {
    // Delete old channel if it exists
    try {
      await Notifications.deleteNotificationChannelAsync("morning-reminder");
    } catch {
      // Channel doesn't exist, that's fine
    }

    // Create high-priority alarm channel
    await Notifications.setNotificationChannelAsync(ALARM_CHANNEL_ID, {
      name: "Uniherätys",
      importance: Notifications.AndroidImportance.MAX, // MAX for alarm-style
      vibrationPattern: [0, 500, 200, 500, 200, 500], // Longer vibration for alarm
      lightColor: "#8B5CF6",
      sound: "default",
      description: "Aamuherätys unen kirjaamiseen",
      bypassDnd: true, // Bypass Do Not Disturb
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      enableVibrate: true,
      enableLights: true,
    });
  }
}

/**
 * Configure notification categories with action buttons
 */
export async function configureNotificationCategories(): Promise<void> {
  await Notifications.setNotificationCategoryAsync(ALARM_CATEGORY_ID, [
    {
      identifier: "LOG_DREAM",
      buttonTitle: "Kirjaa uni",
      options: {
        opensAppToForeground: true,
      },
    },
    {
      identifier: "SNOOZE",
      buttonTitle: "Torkku 5 min",
      options: {
        opensAppToForeground: false,
      },
    },
    {
      identifier: "DISMISS",
      buttonTitle: "Hylkää",
      options: {
        isDestructive: true,
        opensAppToForeground: false,
      },
    },
  ]);
}

/**
 * Handle notification response (when user taps notification or action button)
 */
export function handleNotificationResponse(
  response: Notifications.NotificationResponse
): void {
  const actionId = response.actionIdentifier;
  const data = response.notification.request.content.data;

  console.log("[Notifications] Response received:", actionId, data);

  if (actionId === "SNOOZE") {
    // Schedule snooze notification
    scheduleSnoozeNotification();
    return;
  }

  if (actionId === "DISMISS") {
    // Just dismiss, clear snooze count
    AsyncStorage.setItem(STORAGE_KEYS.snoozeCount, "0");
    return;
  }

  // Default action (tap on notification) or LOG_DREAM button
  // Navigate to home screen for dream input
  AsyncStorage.setItem(STORAGE_KEYS.snoozeCount, "0");

  // Use setTimeout to ensure navigation happens after app is ready
  setTimeout(() => {
    try {
      router.replace("/(tabs)");
    } catch (error) {
      console.log("[Notifications] Navigation error:", error);
    }
  }, 100);
}

/**
 * Schedule a snooze notification
 */
async function scheduleSnoozeNotification(): Promise<void> {
  try {
    // Increment snooze count
    const currentCount = await AsyncStorage.getItem(STORAGE_KEYS.snoozeCount);
    const snoozeCount = parseInt(currentCount || "0", 10) + 1;
    await AsyncStorage.setItem(STORAGE_KEYS.snoozeCount, snoozeCount.toString());

    // Calculate snooze time
    const snoozeTime = new Date();
    snoozeTime.setMinutes(snoozeTime.getMinutes() + SNOOZE_DURATION_MINUTES);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: NOTIFICATION_CONTENT.snoozeTitle,
        body: `${NOTIFICATION_CONTENT.snoozeBody} (Torkku ${snoozeCount})`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        vibrate: [0, 500, 200, 500],
        data: { type: "snooze", snoozeCount },
        categoryIdentifier: ALARM_CATEGORY_ID,
        ...(Platform.OS === "android" && { channelId: ALARM_CHANNEL_ID }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: snoozeTime,
      },
    });

    console.log(`[Notifications] Snooze scheduled for ${snoozeTime.toLocaleTimeString()}`);
  } catch (error) {
    console.error("[Notifications] Snooze scheduling error:", error);
  }
}

/**
 * Add notification response listener - call this in app root
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Add notification received listener
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Initialize all notification configuration
 * Call this once when app starts
 */
export async function initializeNotifications(): Promise<void> {
  await configureAndroidChannel();
  await configureNotificationCategories();
}
