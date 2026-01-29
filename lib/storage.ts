import AsyncStorage from "@react-native-async-storage/async-storage";

// Dream type definition
export type Dream = {
  id: string;
  content: string; // Original dream description
  interpretation: string; // AI interpretation
  createdAt: string; // ISO date string
  tags?: string[]; // Optional tags extracted from interpretation
  mood?: string; // Optional mood indicator
};

// Storage key
const DREAMS_STORAGE_KEY = "@dreamai_dreams";

/**
 * Generate a unique ID for dreams
 */
function generateId(): string {
  return `dream_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Extract tags from dream interpretation
 * Looks for common dream symbols and themes
 */
function extractTags(content: string, interpretation: string): string[] {
  const tags: string[] = [];
  const text = `${content} ${interpretation}`.toLowerCase();

  // Common dream themes/symbols to detect
  const themes: Record<string, string[]> = {
    lentäminen: ["lennän", "lensin", "lentää", "flying", "taivaalla"],
    vesi: ["meri", "järvi", "uida", "vesi", "aalto", "joki"],
    putoaminen: ["putoan", "putosin", "putoaminen", "falling"],
    jahtaaminen: ["jahtaa", "seuraa", "pakenin", "chase", "juoksen"],
    perhe: ["äiti", "isä", "vanhemmat", "sisarus", "family"],
    työ: ["työ", "toimisto", "pomo", "kokous", "work"],
    koulu: ["koulu", "tentti", "opiskelu", "luokka", "school"],
    eläimet: ["koira", "kissa", "lintu", "käärme", "eläin"],
    kuolema: ["kuollut", "kuolema", "hautajaiset", "death"],
    rakkaus: ["rakkaus", "suudelma", "rakastaa", "love"],
  };

  for (const [tag, keywords] of Object.entries(themes)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      tags.push(tag);
    }
  }

  // Limit to 3 most relevant tags
  return tags.slice(0, 3);
}

/**
 * Detect mood from interpretation
 */
function detectMood(interpretation: string): string {
  const text = interpretation.toLowerCase();

  if (
    text.includes("ahdist") ||
    text.includes("pelko") ||
    text.includes("huoli")
  ) {
    return "anxious";
  }
  if (
    text.includes("ilo") ||
    text.includes("onnelli") ||
    text.includes("positiiv")
  ) {
    return "happy";
  }
  if (text.includes("suru") || text.includes("menetys") || text.includes("ikävä")) {
    return "sad";
  }
  if (text.includes("rauha") || text.includes("tyyne") || text.includes("vapau")) {
    return "peaceful";
  }
  if (
    text.includes("hämment") ||
    text.includes("sekav") ||
    text.includes("epävarmuus")
  ) {
    return "confused";
  }
  if (text.includes("nostalgi") || text.includes("muisto") || text.includes("menneis")) {
    return "nostalgic";
  }

  return "neutral";
}

/**
 * Save a new dream to storage
 */
export async function saveDream(
  content: string,
  interpretation: string
): Promise<Dream> {
  try {
    // Create dream object
    const dream: Dream = {
      id: generateId(),
      content,
      interpretation,
      createdAt: new Date().toISOString(),
      tags: extractTags(content, interpretation),
      mood: detectMood(interpretation),
    };

    // Get existing dreams
    const existingDreams = await getDreams();

    // Add new dream at the beginning
    const updatedDreams = [dream, ...existingDreams];

    // Save to storage
    await AsyncStorage.setItem(
      DREAMS_STORAGE_KEY,
      JSON.stringify(updatedDreams)
    );

    return dream;
  } catch (error) {
    console.error("Error saving dream:", error);
    throw new Error("Unen tallennus epäonnistui");
  }
}

/**
 * Get all dreams from storage
 */
export async function getDreams(): Promise<Dream[]> {
  try {
    const data = await AsyncStorage.getItem(DREAMS_STORAGE_KEY);

    if (!data) {
      return [];
    }

    const dreams: Dream[] = JSON.parse(data);

    // Sort by date (newest first)
    return dreams.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("Error getting dreams:", error);
    return [];
  }
}

/**
 * Get a single dream by ID
 */
export async function getDreamById(id: string): Promise<Dream | null> {
  try {
    const dreams = await getDreams();
    return dreams.find((d) => d.id === id) || null;
  } catch (error) {
    console.error("Error getting dream:", error);
    return null;
  }
}

/**
 * Delete a dream from storage
 */
export async function deleteDream(id: string): Promise<void> {
  try {
    const dreams = await getDreams();
    const filteredDreams = dreams.filter((d) => d.id !== id);

    await AsyncStorage.setItem(
      DREAMS_STORAGE_KEY,
      JSON.stringify(filteredDreams)
    );
  } catch (error) {
    console.error("Error deleting dream:", error);
    throw new Error("Unen poisto epäonnistui");
  }
}

/**
 * Update a dream (e.g., add/remove tags)
 */
export async function updateDream(
  id: string,
  updates: Partial<Omit<Dream, "id" | "createdAt">>
): Promise<Dream | null> {
  try {
    const dreams = await getDreams();
    const index = dreams.findIndex((d) => d.id === id);

    if (index === -1) {
      return null;
    }

    const updatedDream = { ...dreams[index], ...updates };
    dreams[index] = updatedDream;

    await AsyncStorage.setItem(DREAMS_STORAGE_KEY, JSON.stringify(dreams));

    return updatedDream;
  } catch (error) {
    console.error("Error updating dream:", error);
    throw new Error("Unen päivitys epäonnistui");
  }
}

/**
 * Clear all dreams (for development/testing)
 */
export async function clearAllDreams(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DREAMS_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing dreams:", error);
    throw new Error("Unien tyhjennys epäonnistui");
  }
}

/**
 * Get dream statistics
 */
export async function getDreamStats(): Promise<{
  total: number;
  thisWeek: number;
  thisMonth: number;
  topTags: { tag: string; count: number }[];
  moodDistribution: Record<string, number>;
}> {
  try {
    const dreams = await getDreams();
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Count dreams by time period
    const thisWeek = dreams.filter(
      (d) => new Date(d.createdAt) >= weekAgo
    ).length;
    const thisMonth = dreams.filter(
      (d) => new Date(d.createdAt) >= monthAgo
    ).length;

    // Count tags
    const tagCounts: Record<string, number> = {};
    for (const dream of dreams) {
      for (const tag of dream.tags || []) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }

    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    // Count moods
    const moodDistribution: Record<string, number> = {};
    for (const dream of dreams) {
      const mood = dream.mood || "neutral";
      moodDistribution[mood] = (moodDistribution[mood] || 0) + 1;
    }

    return {
      total: dreams.length,
      thisWeek,
      thisMonth,
      topTags,
      moodDistribution,
    };
  } catch (error) {
    console.error("Error getting stats:", error);
    return {
      total: 0,
      thisWeek: 0,
      thisMonth: 0,
      topTags: [],
      moodDistribution: {},
    };
  }
}
