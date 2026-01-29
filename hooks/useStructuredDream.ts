import { useCallback, useState, useRef } from "react";
import {
  dreamInterpretationSchema,
  type DreamInterpretation,
} from "@/lib/schemas/dreamInterpretation";
import { saveDream, type Dream } from "@/lib/storage";
import { CONFIG } from "@/lib/config";

// API URL - use configured base URL
const API_URL = CONFIG.API_BASE_URL;

// Error type
export type DreamError = {
  message: string;
  code?: string;
};

// Hook options
export type UseStructuredDreamOptions = {
  onDreamSaved?: (dream: Dream) => void;
  autoSave?: boolean;
};

// Deep partial type for streaming objects
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

// Hook return type
export type UseStructuredDreamReturn = {
  // State
  interpretation: DeepPartial<DreamInterpretation> | undefined;
  isLoading: boolean;
  error: DreamError | null;
  dreamContent: string;

  // Actions
  interpretDream: (dream: string) => void;
  reset: () => void;
  cancelInterpretation: () => void;

  // Computed
  isComplete: boolean;
  progress: number;
  lastSavedDream: Dream | null;
};

/**
 * Calculate real progress based on which fields are populated
 */
function calculateProgress(partial: DeepPartial<DreamInterpretation> | undefined): number {
  if (!partial) return 0;

  let filled = 0;
  const total = 8; // Total required fields

  if (partial.summary) filled++;
  if (partial.mood) filled++;
  if (partial.symbols && partial.symbols.length > 0) filled++;
  if (partial.emotionalAnalysis?.primaryEmotion) filled++;
  if (partial.lifeConnections && partial.lifeConnections.length > 0) filled++;
  if (partial.keyMessage) filled++;
  if (partial.reflectionQuestions && partial.reflectionQuestions.length > 0) filled++;
  if (partial.tags && partial.tags.length > 0) filled++;

  // Return percentage, minimum 10% when loading
  return Math.max(10, Math.round((filled / total) * 100));
}

/**
 * Hook for structured dream interpretation with real-time streaming
 * Uses SSE to receive progressive object updates from the API
 */
export function useStructuredDream(
  options: UseStructuredDreamOptions = {}
): UseStructuredDreamReturn {
  const { onDreamSaved, autoSave = true } = options;

  const [dreamContent, setDreamContent] = useState("");
  const [interpretation, setInterpretation] = useState<DeepPartial<DreamInterpretation> | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<DreamError | null>(null);
  const [lastSavedDream, setLastSavedDream] = useState<Dream | null>(null);
  const [progress, setProgress] = useState(0);

  // Ref to abort controller for cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cancel ongoing interpretation
  const cancelInterpretation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  }, []);

  // Submit a dream for interpretation with streaming
  const interpretDream = useCallback(
    async (dream: string) => {
      if (!dream.trim() || isLoading) return;

      // Cancel any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setDreamContent(dream.trim());
      setError(null);
      setIsLoading(true);
      setProgress(5);
      setInterpretation(undefined);

      let finalInterpretation: DeepPartial<DreamInterpretation> | undefined;

      try {
        const response = await fetch(`${API_URL}/api/interpret-structured`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ dream: dream.trim() }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "API-kutsu epäonnistui");
        }

        // Check if response is SSE stream
        const contentType = response.headers.get("content-type");

        if (contentType?.includes("text/event-stream")) {
          // Handle SSE streaming
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) {
            throw new Error("Vastausta ei voitu lukea");
          }

          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Process complete SSE messages
            const lines = buffer.split("\n");
            buffer = lines.pop() || ""; // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim();

                if (data === "[DONE]") {
                  // Streaming complete
                  break;
                }

                try {
                  const partialObject = JSON.parse(data);

                  // Check for error in stream
                  if (partialObject.error) {
                    throw new Error(partialObject.error);
                  }

                  // Update interpretation with partial data
                  finalInterpretation = partialObject;
                  setInterpretation(partialObject);
                  setProgress(calculateProgress(partialObject));
                } catch (parseError) {
                  // Skip invalid JSON lines
                  console.warn("Failed to parse SSE data:", data);
                }
              }
            }
          }
        } else {
          // Fallback: Handle regular JSON response (backwards compatibility)
          const data = await response.json();
          finalInterpretation = data;
          setInterpretation(data);
          setProgress(100);
        }

        // Final validation
        if (finalInterpretation) {
          const parsed = dreamInterpretationSchema.safeParse(finalInterpretation);
          if (parsed.success) {
            setInterpretation(parsed.data);
          }
        }

        setProgress(100);

        // Save dream if autoSave is enabled
        if (autoSave && dream && finalInterpretation) {
          try {
            const interpretationText = formatInterpretationForStorage(
              finalInterpretation as DreamInterpretation
            );
            const savedDream = await saveDream(dream.trim(), interpretationText);
            setLastSavedDream(savedDream);
            onDreamSaved?.(savedDream);
          } catch (err) {
            console.error("Error saving dream:", err);
          }
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("Interpretation error:", err);
        setError({
          message: err instanceof Error ? err.message : "Unitulkinta epäonnistui",
          code: "INTERPRETATION_ERROR",
        });
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [isLoading, autoSave, onDreamSaved]
  );

  // Reset state
  const reset = useCallback(() => {
    cancelInterpretation();
    setDreamContent("");
    setInterpretation(undefined);
    setError(null);
    setProgress(0);
    setLastSavedDream(null);
  }, [cancelInterpretation]);

  // Check if interpretation is complete
  const isComplete = !!(
    interpretation?.summary &&
    interpretation?.mood &&
    interpretation?.symbols &&
    interpretation.symbols.length > 0 &&
    interpretation?.keyMessage
  );

  return {
    interpretation,
    isLoading,
    error,
    dreamContent,
    interpretDream,
    reset,
    cancelInterpretation,
    isComplete,
    progress,
    lastSavedDream,
  };
}

/**
 * Format structured interpretation for text storage
 */
function formatInterpretationForStorage(interpretation: DreamInterpretation): string {
  const sections: string[] = [];

  if (interpretation.summary) {
    sections.push(`**Yhteenveto:** ${interpretation.summary}`);
  }

  if (interpretation.symbols?.length) {
    sections.push(
      `\n**Symbolit:**\n${interpretation.symbols
        .map((s) => `- **${s.symbol}**: ${s.meaning}`)
        .join("\n")}`
    );
  }

  if (interpretation.emotionalAnalysis) {
    const ea = interpretation.emotionalAnalysis;
    sections.push(
      `\n**Tunnemaailma:**\n` +
        `Päätunne: ${ea.primaryEmotion}\n` +
        `${ea.subconscious}`
    );
  }

  if (interpretation.lifeConnections?.length) {
    sections.push(
      `\n**Yhteydet elämään:**\n${interpretation.lifeConnections
        .map((lc) => `- ${lc.insight}`)
        .join("\n")}`
    );
  }

  if (interpretation.keyMessage) {
    sections.push(`\n**Avainviesti:** ${interpretation.keyMessage}`);
  }

  if (interpretation.reflectionQuestions?.length) {
    sections.push(
      `\n**Pohdittavaa:**\n${interpretation.reflectionQuestions
        .map((q) => `- ${q}`)
        .join("\n")}`
    );
  }

  return sections.join("\n");
}

export default useStructuredDream;
