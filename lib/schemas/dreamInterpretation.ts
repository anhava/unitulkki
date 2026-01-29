import { z } from "zod";

/**
 * Structured Dream Interpretation Schema
 *
 * This schema defines the structure for AI-generated dream interpretations.
 * Each section is designed to be displayed as a separate UI card.
 */

// Individual symbol with its meaning
export const symbolSchema = z.object({
  symbol: z.string().describe("The dream symbol (object, person, place, action)"),
  meaning: z.string().describe("Psychological meaning of this symbol"),
  relevance: z.enum(["high", "medium", "low"]).describe("How significant this symbol is"),
});

// Emotional analysis
export const emotionalAnalysisSchema = z.object({
  primaryEmotion: z.string().describe("The dominant emotion in the dream"),
  secondaryEmotions: z.array(z.string()).describe("Other emotions present"),
  subconscious: z.string().describe("What subconscious feelings this might reflect"),
  jungianPerspective: z.string().optional().describe("Jungian psychology interpretation"),
});

// Life connection insight
export const lifeConnectionSchema = z.object({
  area: z.enum(["work", "relationships", "personal_growth", "health", "creativity", "spirituality", "family", "finances"])
    .describe("Life area this relates to"),
  insight: z.string().describe("How the dream connects to this life area"),
  actionSuggestion: z.string().optional().describe("Suggested action or reflection"),
});

// Premium insight (for monetization)
export const premiumInsightSchema = z.object({
  deepAnalysis: z.string().describe("Deeper psychological analysis"),
  archetypeConnection: z.string().optional().describe("Connection to Jungian archetypes"),
  recurringPatterns: z.string().optional().describe("If this matches common recurring dream patterns"),
});

// Main interpretation schema
export const dreamInterpretationSchema = z.object({
  // Basic interpretation (free tier)
  summary: z.string().describe("Brief 1-2 sentence summary of the dream's meaning"),

  mood: z.enum(["peaceful", "happy", "anxious", "sad", "confused", "nostalgic", "neutral", "excited", "fearful"])
    .describe("Overall mood/emotion of the dream"),

  symbols: z.array(symbolSchema)
    .min(1)
    .max(5)
    .describe("Key symbols identified in the dream and their meanings"),

  emotionalAnalysis: emotionalAnalysisSchema
    .describe("Analysis of the emotional content and subconscious themes"),

  lifeConnections: z.array(lifeConnectionSchema)
    .min(1)
    .max(3)
    .describe("How the dream might connect to the dreamer's waking life"),

  keyMessage: z.string()
    .describe("The main message or lesson from this dream"),

  reflectionQuestions: z.array(z.string())
    .min(1)
    .max(3)
    .describe("Questions for the dreamer to reflect on"),

  // Tags for categorization
  tags: z.array(z.string())
    .min(1)
    .max(5)
    .describe("Tags for categorizing this dream (e.g., flying, water, chase)"),

  // Premium content (for monetization)
  premium: premiumInsightSchema.optional()
    .describe("Deeper analysis available in premium tier"),

  // Confidence score
  confidence: z.enum(["high", "medium", "low"])
    .describe("How confident the interpretation is based on dream detail provided"),
});

// Type exports
export type Symbol = z.infer<typeof symbolSchema>;
export type EmotionalAnalysis = z.infer<typeof emotionalAnalysisSchema>;
export type LifeConnection = z.infer<typeof lifeConnectionSchema>;
export type PremiumInsight = z.infer<typeof premiumInsightSchema>;
export type DreamInterpretation = z.infer<typeof dreamInterpretationSchema>;

// Mood emoji mapping
export const moodEmojis: Record<DreamInterpretation["mood"], string> = {
  peaceful: "😌",
  happy: "😊",
  anxious: "😰",
  sad: "😢",
  confused: "😕",
  nostalgic: "🕰️",
  neutral: "🌙",
  excited: "🎉",
  fearful: "😨",
};

// Mood labels in Finnish
export const moodLabels: Record<DreamInterpretation["mood"], string> = {
  peaceful: "Rauhallinen",
  happy: "Iloinen",
  anxious: "Ahdistunut",
  sad: "Surullinen",
  confused: "Hämmentynyt",
  nostalgic: "Nostalginen",
  neutral: "Neutraali",
  excited: "Innostunut",
  fearful: "Pelottava",
};

// Life area icons and labels
export const lifeAreaConfig: Record<LifeConnection["area"], { icon: string; label: string; color: string }> = {
  work: { icon: "briefcase", label: "Työ", color: "#3B82F6" },
  relationships: { icon: "heart", label: "Ihmissuhteet", color: "#EC4899" },
  personal_growth: { icon: "trending-up", label: "Henkilökohtainen kasvu", color: "#10B981" },
  health: { icon: "activity", label: "Terveys", color: "#22C55E" },
  creativity: { icon: "palette", label: "Luovuus", color: "#F59E0B" },
  spirituality: { icon: "sun", label: "Henkisyys", color: "#8B5CF6" },
  family: { icon: "users", label: "Perhe", color: "#F97316" },
  finances: { icon: "dollar-sign", label: "Talous", color: "#14B8A6" },
};

// Relevance colors for symbols
export const relevanceColors: Record<Symbol["relevance"], string> = {
  high: "#EF4444",
  medium: "#F59E0B",
  low: "#6B7280",
};
