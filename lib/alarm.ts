import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Storage keys
const ALARM_STORAGE_KEYS = {
  alarms: "dreamai_alarms",
  nextAlarmId: "dreamai_next_alarm_id",
};

// Alarm types
export interface Alarm {
  id: string;
  hour: number;
  minute: number;
  days: number[]; // 0-6 (Sunday-Saturday)
  enabled: boolean;
  label: string;
  sound: string;
  vibration: boolean;
  notificationIds?: string[]; // IDs of scheduled notifications for this alarm
}

// Notification configuration for alarms
const ALARM_NOTIFICATION_CONTENT = {
  title: "⏰ Herätys - Unitulkki",
  body: "Aamu! Kirjaa unesi nyt kun se on vielä tuoreessa muistissa.",
  sound: true,
  priority: Notifications.AndroidNotificationPriority.HIGH,
  sticky: true, // Keep notification visible
  autoDismiss: false, // Don't auto-dismiss
};

// Configure high-priority notification handler for alarms
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 */
export async function requestAlarmPermissions(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      // Android requires explicit scheduling permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          android: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowVibration: true,
          },
        });
        return status === 'granted';
      }
      return true;
    } else {
      // iOS
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    }
  } catch (error) {
    console.error("Error requesting alarm permissions:", error);
    return false;
  }
}

/**
 * Create a new alarm
 */
export async function createAlarm(alarm: Omit<Alarm, 'id'>): Promise<Alarm | null> {
  try {
    const alarms = await getAlarms();
    const id = `alarm_${Date.now()}`;
    
    // Create alarm with auto-generated ID
    const newAlarm: Alarm = {
      ...alarm,
      id,
    };
    
    // Get scheduled notification IDs
    const notificationIds = [];
    
    // Schedule for each enabled day
    if (alarm.days.length > 0) {
      for (const day of alarm.days) {
        try {
          const notificationId = await scheduleAlarmNotification({
            ...newAlarm,
            day,
          });
          if (notificationId) {
            notificationIds.push(`${id}_${day}`);
          }
        } catch (error) {
          console.error(`Error scheduling alarm for day ${day}:`, error);
        }
      }
    } else {
      // Schedule for today/tomorrow if no specific days
      const notificationId = await scheduleAlarmNotification(newAlarm);
      if (notificationId) {
        notificationIds.push(`${id}_daily`);
      }
    }
    
    if (notificationIds.length === 0) {
      console.error("Failed to schedule any alarm notifications");
      return null;
    }
    
    // Save alarm with notification IDs
    const alarmsWithNotifications = [...alarms, {
      ...newAlarm,
      notificationIds,
    }];
    
    await saveAlarms(alarmsWithNotifications);
    return newAlarm;
    
  } catch (error) {
    console.error("Error creating alarm:", error);
    return null;
  }
}

/**
 * Schedule a single alarm notification
 */
async function scheduleAlarmNotification(
  alarm: Alarm & { day?: number }
): Promise<string | null> {
  try {
    const hasPermission = await requestAlarmPermissions();
    if (!hasPermission) {
      console.error("Alarm permissions not granted");
      return null;
    }

    // Cancel any existing notifications for this alarm
    if (alarm.notificationIds) {
      for (const notificationId of alarm.notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }
    }

    // Create notification trigger
    const now = new Date();
    const triggerDate = new Date(now);
    triggerDate.setHours(alarm.hour, alarm.minute, 0, 0);
    
    // If time has already passed today, schedule for tomorrow
    if (triggerDate <= now) {
      triggerDate.setDate(triggerDate.getDate() + 1);
    }

    // Schedule the notification
    const trigger: Notifications.NotificationTriggerInput = alarm.day !== undefined
      ? {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: alarm.day + 1, // Expo uses 1-7 for Sunday-Saturday
          hour: alarm.hour,
          minute: alarm.minute,
        }
      : {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: alarm.hour,
          minute: alarm.minute,
        };

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: ALARM_NOTIFICATION_CONTENT.title,
        body: ALARM_NOTIFICATION_CONTENT.body,
        sound: alarm.sound || 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        vibrate: alarm.vibration !== false ? [0, 250, 250, 250] : undefined,
        sticky: ALARM_NOTIFICATION_CONTENT.sticky,
        autoDismiss: ALARM_NOTIFICATION_CONTENT.autoDismiss,
        data: {
          type: 'alarm',
          alarmId: alarm.id,
          alarmLabel: alarm.label,
        },
        categoryIdentifier: 'ALARM_CATEGORY',
      },
      trigger,
    });

    return notificationId;
  } catch (error) {
    console.error("Error scheduling alarm notification:", error);
    return null;
  }
}

/**
 * Get all saved alarms
 */
export async function getAlarms(): Promise<Alarm[]> {
  try {
    const alarmsJson = await AsyncStorage.getItem(ALARM_STORAGE_KEYS.alarms);
    return alarmsJson ? JSON.parse(alarmsJson) : [];
  } catch (error) {
    console.error("Error getting alarms:", error);
    return [];
  }
}

/**
 * Save all alarms
 */
async function saveAlarms(alarms: Alarm[]): Promise<void> {
  await AsyncStorage.setItem(ALARM_STORAGE_KEYS.alarms, JSON.stringify(alarms));
}

/**
 * Update an existing alarm
 */
export async function updateAlarm(id: string, updates: Partial<Alarm>): Promise<Alarm | null> {
  try {
    const alarms = await getAlarms();
    const alarmIndex = alarms.findIndex(a => a.id === id);
    
    if (alarmIndex === -1) {
      console.error("Alarm not found");
      return null;
    }
    
    // Cancel existing notifications
    const existingAlarm = alarms[alarmIndex];
    if (existingAlarm.notificationIds) {
      for (const notificationId of existingAlarm.notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }
    }
    
    // Update alarm
    const updatedAlarm: Alarm = {
      ...existingAlarm,
      ...updates,
      id, // Preserve ID
    };
    
    await createAlarm(updatedAlarm);
    
    // Remove old alarm and add updated one
    alarms[alarmIndex] = updatedAlarm;
    await saveAlarms(alarms);
    
    return updatedAlarm;
  } catch (error) {
    console.error("Error updating alarm:", error);
    return null;
  }
}

/**
 * Delete an alarm
 */
export async function deleteAlarm(id: string): Promise<boolean> {
  try {
    const alarms = await getAlarms();
    const alarm = alarms.find(a => a.id === id);
    
    if (alarm?.notificationIds) {
      // Cancel all notifications
      for (const notificationId of alarm.notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }
    }
    
    const updatedAlarms = alarms.filter(a => a.id !== id);
    await saveAlarms(updatedAlarms);
    
    return true;
  } catch (error) {
    console.error("Error deleting alarm:", error);
    return false;
  }
}

/**
 * Get next upcoming alarm
 */
export async function getNextAlarm(): Promise<Alarm | null> {
  try {
    const alarms = await getAlarms();
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    // Get enabled alarms for today or future days
    const upcomingAlarms = alarms
      .filter(alarm => alarm.enabled)
      .map(alarm => {
        const alarmTime = alarm.hour * 60 + alarm.minute;
        
        // Check if alarm is scheduled for today
        const isToday = alarm.days.includes(currentDay);
        
        if (isToday && alarmTime > currentTime) {
          return { alarm, timeUntil: alarmTime - currentTime };
        }
        
        // Check if alarm is scheduled for future days
        for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
          const futureDay = (currentDay + dayOffset) % 7;
          if (alarm.days.includes(futureDay)) {
            return { alarm, timeUntil: alarmTime - currentTime + dayOffset * 24 * 60 };
          }
        }
        
        return null;
      })
      .filter((item): item is { alarm: Alarm; timeUntil: number } => item !== null)
      .sort((a, b) => a.timeUntil - b.timeUntil);
    
    return upcomingAlarms[0]?.alarm || null;
  } catch (error) {
    console.error("Error getting next alarm:", error);
    return null;
  }
}

/**
 * Get all scheduled notifications (for debugging)
 */
export async function getScheduledAlarms(): Promise<Alarm[]> {
  try {
    const alarms = await getAlarms();
    return alarms.filter(alarm => alarm.enabled);
  } catch (error) {
    console.error("Error getting scheduled alarms:", error);
    return [];
  }
}

/**
 * Stop/Dismiss alarm (call this when user stops alarm)
 */
export async function dismissAlarm(alarmId: string): Promise<void> {
  try {
    // Cancel sticky notification
    await Notifications.dismissAllNotificationsAsync();
    
    // Update alarm state if needed
    // For MVP, we just dismiss the notification
  } catch (error) {
    console.error("Error dismissing alarm:", error);
  }
}

/**
 * Snooze alarm (call this when user snoozes alarm)
 */
export async function snoozeAlarm(alarmId: string, snoozeMinutes: number = 5): Promise<void> {
  try {
    await dismissAlarm(alarmId);
    
    // Schedule snooze notification
    const now = new Date();
    const snoozeTime = new Date(now.getTime() + snoozeMinutes * 60 * 1000);
    
    // Determine Finnish time zone offset
    const timezoneOffset = now.getTimezoneOffset(); // in minutes
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏰ Torkku - Unitulkki",
        body: `Heräys ${snoozeMinutes} minuutin päästä!`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: snoozeTime.getHours(),
        minute: snoozeTime.getMinutes(),
      },
    });
  } catch (error) {
    console.error("Error snoozing alarm:", error);
  }
}

/**
 * Check if user has set up any alarms
 */
export async function hasActiveAlarms(): Promise<boolean> {
  const alarms = await getAlarms();
  return alarms.length > 0 && alarms.some(alarm => alarm.enabled);
}