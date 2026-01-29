import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage key
const STREAK_STORAGE_KEY = "@dreamai_streak";

export type StreakData = {
  currentStreak: number;
  longestStreak: number;
  lastDreamDate: string | null; // ISO date string (YYYY-MM-DD)
  totalDreams: number;
};

/**
 * Get today's date as YYYY-MM-DD
 */
function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get yesterday's date as YYYY-MM-DD
 */
function getYesterday(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
}

/**
 * Initialize default streak data
 */
function getDefaultStreak(): StreakData {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastDreamDate: null,
    totalDreams: 0,
  };
}

/**
 * Get streak data from storage
 */
export async function getStreakData(): Promise<StreakData> {
  try {
    const data = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
    if (!data) {
      return getDefaultStreak();
    }

    const streakData: StreakData = JSON.parse(data);

    // Check if streak is still valid (must have logged yesterday or today)
    const today = getToday();
    const yesterday = getYesterday();

    if (
      streakData.lastDreamDate !== today &&
      streakData.lastDreamDate !== yesterday
    ) {
      // Streak broken - reset current but keep longest
      return {
        ...streakData,
        currentStreak: 0,
      };
    }

    return streakData;
  } catch (error) {
    console.error("Error getting streak data:", error);
    return getDefaultStreak();
  }
}

/**
 * Record a new dream and update streak
 */
export async function recordDream(): Promise<StreakData> {
  try {
    const streakData = await getStreakData();
    const today = getToday();
    const yesterday = getYesterday();

    let newStreak: StreakData;

    if (streakData.lastDreamDate === today) {
      // Already logged today - just increment total
      newStreak = {
        ...streakData,
        totalDreams: streakData.totalDreams + 1,
      };
    } else if (
      streakData.lastDreamDate === yesterday ||
      streakData.currentStreak === 0
    ) {
      // Continuing streak or starting new streak
      const newCurrentStreak = streakData.currentStreak + 1;
      newStreak = {
        currentStreak: newCurrentStreak,
        longestStreak: Math.max(streakData.longestStreak, newCurrentStreak),
        lastDreamDate: today,
        totalDreams: streakData.totalDreams + 1,
      };
    } else {
      // Streak was broken but we're starting fresh today
      newStreak = {
        currentStreak: 1,
        longestStreak: Math.max(streakData.longestStreak, 1),
        lastDreamDate: today,
        totalDreams: streakData.totalDreams + 1,
      };
    }

    await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(newStreak));
    return newStreak;
  } catch (error) {
    console.error("Error recording dream:", error);
    throw new Error("Uniputken päivitys epäonnistui");
  }
}

/**
 * Check if user has already logged a dream today
 */
export async function hasLoggedToday(): Promise<boolean> {
  const streakData = await getStreakData();
  return streakData.lastDreamDate === getToday();
}

/**
 * Get encouraging message based on streak
 */
export function getStreakMessage(streak: number): string {
  if (streak === 0) {
    return "Aloita uniputkesi tänään!";
  } else if (streak === 1) {
    return "Loistava alku! Jatka huomenna.";
  } else if (streak < 7) {
    return `${streak} päivää peräkkäin!`;
  } else if (streak === 7) {
    return "Viikon uniputki! Hienoa!";
  } else if (streak < 14) {
    return `${streak} päivän putki! Mahtavaa!`;
  } else if (streak === 14) {
    return "Kaksi viikkoa! Olet mestari!";
  } else if (streak < 30) {
    return `${streak} päivää! Uskomaton!`;
  } else if (streak === 30) {
    return "Kuukauden putki! Legenda!";
  } else {
    return `${streak} päivää! Olet todellinen uneksija!`;
  }
}

/**
 * Get milestone info for current streak
 */
export function getNextMilestone(streak: number): { target: number; label: string } | null {
  if (streak < 7) {
    return { target: 7, label: "Viikon putki" };
  } else if (streak < 14) {
    return { target: 14, label: "2 viikon putki" };
  } else if (streak < 30) {
    return { target: 30, label: "Kuukauden putki" };
  } else if (streak < 100) {
    return { target: 100, label: "100 päivän putki" };
  }
  return null;
}

/**
 * Clear streak data (for development/testing)
 */
export async function clearStreakData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STREAK_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing streak data:", error);
  }
}
