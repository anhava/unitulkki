/**
 * Dream Pattern Analysis
 * 
 * Premium feature: Analyzes recurring themes, symbols, and emotional patterns
 * across the user's dream history to provide insights about their subconscious.
 */

import { getDreams, type Dream } from "./storage";

// Pattern types
export type SymbolPattern = {
  symbol: string;
  count: number;
  percentage: number;
  trend: "increasing" | "decreasing" | "stable";
  lastSeen: string;
  examples: string[];
};

export type MoodPattern = {
  mood: string;
  moodLabel: string;
  count: number;
  percentage: number;
  emoji: string;
};

export type TimePattern = {
  period: string;
  dreamCount: number;
  averagePerWeek: number;
  mostActiveDay?: string;
};

export type DreamPatternAnalysis = {
  totalDreams: number;
  analyzedPeriodDays: number;
  symbols: SymbolPattern[];
  moods: MoodPattern[];
  timePatterns: TimePattern;
  recurringThemes: string[];
  insights: string[];
  generatedAt: string;
};

// Mood labels and emojis
const MOOD_CONFIG: Record<string, { label: string; emoji: string }> = {
  anxious: { label: "Ahdistunut", emoji: "😰" },
  happy: { label: "Iloinen", emoji: "😊" },
  sad: { label: "Surullinen", emoji: "😢" },
  peaceful: { label: "Rauhallinen", emoji: "😌" },
  confused: { label: "Hämmentynyt", emoji: "😕" },
  nostalgic: { label: "Nostalginen", emoji: "🥹" },
  neutral: { label: "Neutraali", emoji: "😐" },
};

// Finnish symbol labels
const SYMBOL_LABELS: Record<string, string> = {
  lentäminen: "Lentäminen",
  vesi: "Vesi",
  putoaminen: "Putoaminen",
  jahtaaminen: "Jahtaaminen",
  perhe: "Perhe",
  työ: "Työ",
  koulu: "Koulu",
  eläimet: "Eläimet",
  kuolema: "Kuolema",
  rakkaus: "Rakkaus",
};

/**
 * Calculate trend based on recent vs older occurrences
 */
function calculateTrend(
  dreams: Dream[],
  symbol: string
): "increasing" | "decreasing" | "stable" {
  if (dreams.length < 4) return "stable";

  const midpoint = Math.floor(dreams.length / 2);
  const olderDreams = dreams.slice(midpoint);
  const recentDreams = dreams.slice(0, midpoint);

  const olderCount = olderDreams.filter((d) =>
    d.tags?.includes(symbol)
  ).length;
  const recentCount = recentDreams.filter((d) =>
    d.tags?.includes(symbol)
  ).length;

  // Normalize by count
  const olderRate = olderCount / olderDreams.length;
  const recentRate = recentCount / recentDreams.length;

  if (recentRate > olderRate * 1.3) return "increasing";
  if (recentRate < olderRate * 0.7) return "decreasing";
  return "stable";
}

/**
 * Get day name in Finnish
 */
function getDayName(dayIndex: number): string {
  const days = [
    "Sunnuntai",
    "Maanantai",
    "Tiistai",
    "Keskiviikko",
    "Torstai",
    "Perjantai",
    "Lauantai",
  ];
  return days[dayIndex];
}

/**
 * Generate insights based on patterns
 */
function generateInsights(
  symbols: SymbolPattern[],
  moods: MoodPattern[],
  dreams: Dream[]
): string[] {
  const insights: string[] = [];

  // Most common symbol insight
  if (symbols.length > 0) {
    const topSymbol = symbols[0];
    if (topSymbol.percentage > 30) {
      insights.push(
        `${SYMBOL_LABELS[topSymbol.symbol] || topSymbol.symbol} esiintyy ${topSymbol.percentage}% unistasi - tämä saattaa heijastaa keskeistä teemaa elämässäsi.`
      );
    }
  }

  // Increasing trend insight
  const increasingSymbols = symbols.filter((s) => s.trend === "increasing");
  if (increasingSymbols.length > 0) {
    insights.push(
      `${SYMBOL_LABELS[increasingSymbols[0].symbol] || increasingSymbols[0].symbol}-unet ovat lisääntyneet viime aikoina.`
    );
  }

  // Mood distribution insight
  const dominantMood = moods[0];
  if (dominantMood && dominantMood.percentage > 40) {
    insights.push(
      `${dominantMood.moodLabel} tunnetila hallitsee ${dominantMood.percentage}% unistasi.`
    );
  }

  // Dream frequency insight
  if (dreams.length >= 7) {
    const firstDream = new Date(dreams[dreams.length - 1].createdAt);
    const lastDream = new Date(dreams[0].createdAt);
    const daysDiff = Math.ceil(
      (lastDream.getTime() - firstDream.getTime()) / (1000 * 60 * 60 * 24)
    );
    const avgPerWeek = (dreams.length / daysDiff) * 7;

    if (avgPerWeek >= 3) {
      insights.push(
        `Kirjaat keskimäärin ${avgPerWeek.toFixed(1)} unta viikossa - erinomainen unipäiväkirjarutiini!`
      );
    }
  }

  // Add motivational insight if few dreams
  if (dreams.length < 5) {
    insights.push(
      "Jatka unien kirjaamista - tarkemmat kuviot näkyvät kun unia kertyy enemmän."
    );
  }

  return insights.slice(0, 4); // Max 4 insights
}

/**
 * Analyze dream patterns - Premium feature
 */
export async function analyzeDreamPatterns(): Promise<DreamPatternAnalysis> {
  const dreams = await getDreams();

  if (dreams.length === 0) {
    return {
      totalDreams: 0,
      analyzedPeriodDays: 0,
      symbols: [],
      moods: [],
      timePatterns: {
        period: "Ei dataa",
        dreamCount: 0,
        averagePerWeek: 0,
      },
      recurringThemes: [],
      insights: ["Aloita kirjaamalla ensimmäinen unesi!"],
      generatedAt: new Date().toISOString(),
    };
  }

  // Calculate period
  const oldestDream = new Date(dreams[dreams.length - 1].createdAt);
  const newestDream = new Date(dreams[0].createdAt);
  const periodDays = Math.max(
    1,
    Math.ceil(
      (newestDream.getTime() - oldestDream.getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  // Symbol analysis
  const symbolCounts: Record<string, { count: number; lastSeen: string; examples: string[] }> = {};
  
  for (const dream of dreams) {
    for (const tag of dream.tags || []) {
      if (!symbolCounts[tag]) {
        symbolCounts[tag] = { count: 0, lastSeen: dream.createdAt, examples: [] };
      }
      symbolCounts[tag].count++;
      if (symbolCounts[tag].examples.length < 2) {
        symbolCounts[tag].examples.push(
          dream.content.substring(0, 50) + (dream.content.length > 50 ? "..." : "")
        );
      }
    }
  }

  const symbols: SymbolPattern[] = Object.entries(symbolCounts)
    .map(([symbol, data]) => ({
      symbol,
      count: data.count,
      percentage: Math.round((data.count / dreams.length) * 100),
      trend: calculateTrend(dreams, symbol),
      lastSeen: data.lastSeen,
      examples: data.examples,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Mood analysis
  const moodCounts: Record<string, number> = {};
  for (const dream of dreams) {
    const mood = dream.mood || "neutral";
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
  }

  const moods: MoodPattern[] = Object.entries(moodCounts)
    .map(([mood, count]) => ({
      mood,
      moodLabel: MOOD_CONFIG[mood]?.label || mood,
      count,
      percentage: Math.round((count / dreams.length) * 100),
      emoji: MOOD_CONFIG[mood]?.emoji || "😐",
    }))
    .sort((a, b) => b.count - a.count);

  // Time patterns
  const dayCounts: Record<number, number> = {};
  for (const dream of dreams) {
    const day = new Date(dream.createdAt).getDay();
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  }

  const mostActiveDay = Object.entries(dayCounts).sort(
    ([, a], [, b]) => b - a
  )[0];

  const timePatterns: TimePattern = {
    period: `${periodDays} päivää`,
    dreamCount: dreams.length,
    averagePerWeek: Math.round((dreams.length / periodDays) * 7 * 10) / 10,
    mostActiveDay: mostActiveDay ? getDayName(parseInt(mostActiveDay[0])) : undefined,
  };

  // Recurring themes (symbols that appear > 20%)
  const recurringThemes = symbols
    .filter((s) => s.percentage >= 20)
    .map((s) => SYMBOL_LABELS[s.symbol] || s.symbol);

  // Generate insights
  const insights = generateInsights(symbols, moods, dreams);

  return {
    totalDreams: dreams.length,
    analyzedPeriodDays: periodDays,
    symbols,
    moods,
    timePatterns,
    recurringThemes,
    insights,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Get symbol trend icon
 */
export function getTrendIcon(trend: SymbolPattern["trend"]): string {
  switch (trend) {
    case "increasing":
      return "↑";
    case "decreasing":
      return "↓";
    default:
      return "→";
  }
}

/**
 * Get symbol label in Finnish
 */
export function getSymbolLabel(symbol: string): string {
  return SYMBOL_LABELS[symbol] || symbol;
}
