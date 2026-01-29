import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useCallback, useState, useMemo, useRef } from "react";
import { fetch as expoFetch } from "expo/fetch";
import { saveDream, type Dream } from "@/lib/storage";
import { CONFIG } from "@/lib/config";

// Error types for better handling
export type DreamError = {
  message: string;
  code?: string;
  details?: string;
};

// Helper to extract text content from UIMessage
function getMessageText(message: UIMessage): string {
  if (!message.parts) return "";
  const textPart = message.parts.find((p) => p.type === "text");
  return textPart && "text" in textPart ? textPart.text : "";
}

// Hook options
export type UseDreamInterpretationOptions = {
  onDreamSaved?: (dream: Dream) => void;
  autoSave?: boolean;
};

// Hook return type
export type UseDreamInterpretationReturn = {
  // Chat state
  messages: UIMessage[];
  input: string;
  isLoading: boolean;
  error: DreamError | null;

  // Actions
  handleInputChange: (text: string) => void;
  handleSubmit: () => Promise<void>;
  submitDream: (dream: string) => Promise<void>;
  clearChat: () => void;
  clearError: () => void;

  // Helpers
  getMessageText: (message: UIMessage) => string;

  // Metadata
  isReady: boolean;
  lastInterpretation: UIMessage | null;
  lastSavedDream: Dream | null;
};

/**
 * Custom hook for dream interpretation using Perplexity AI
 *
 * Provides a clean interface for:
 * - Sending dreams for interpretation
 * - Managing chat history
 * - Handling streaming responses
 * - Error management with toast notifications
 * - Automatic dream saving to storage
 */
export function useDreamInterpretation(
  options: UseDreamInterpretationOptions = {}
): UseDreamInterpretationReturn {
  const { onDreamSaved, autoSave = true } = options;

  const [dreamError, setDreamError] = useState<DreamError | null>(null);
  const [localInput, setLocalInput] = useState("");
  const [lastSavedDream, setLastSavedDream] = useState<Dream | null>(null);

  // Track the original dream content for saving
  const pendingDreamRef = useRef<string | null>(null);

  // Create transport with custom fetch for Expo
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${CONFIG.API_BASE_URL}/api/interpret`,
        fetch: expoFetch as unknown as typeof globalThis.fetch,
      }),
    []
  );

  const {
    messages,
    sendMessage,
    setMessages,
    status,
    error: chatError,
    clearError: clearChatError,
  } = useChat({
    transport,
    onError: (err) => {
      console.error("Dream interpretation error:", err);

      // Parse error message
      let errorMessage = "Unitulkinta epäonnistui. Yritä uudelleen.";
      let errorCode: string | undefined;

      try {
        // Try to parse JSON error response
        const parsed = JSON.parse(err.message);
        errorMessage = parsed.error || errorMessage;
        errorCode = parsed.code;
      } catch {
        // Use raw message if not JSON
        if (err.message) {
          errorMessage = err.message;
        }
      }

      setDreamError({
        message: errorMessage,
        code: errorCode,
        details: err.message,
      });
    },
    onFinish: async ({ message }) => {
      // Clear any previous errors on successful completion
      setDreamError(null);

      // Auto-save the dream if enabled and we have pending content
      if (autoSave && pendingDreamRef.current && message.role === "assistant") {
        try {
          const interpretation = getMessageText(message);
          if (interpretation) {
            const savedDream = await saveDream(
              pendingDreamRef.current,
              interpretation
            );
            setLastSavedDream(savedDream);
            onDreamSaved?.(savedDream);
            pendingDreamRef.current = null;
          }
        } catch (error) {
          console.error("Error saving dream:", error);
          // Don't set error state - interpretation succeeded, just saving failed
        }
      }
    },
  });

  // Determine loading state from status
  const isLoading = status === "submitted" || status === "streaming";

  // Handle input changes
  const handleInputChange = useCallback((text: string) => {
    setLocalInput(text);
  }, []);

  // Submit current input
  const handleSubmit = useCallback(async () => {
    const currentInput = localInput;
    if (!currentInput.trim() || isLoading) return;

    const dreamText = currentInput.trim();
    setLocalInput("");
    setDreamError(null);

    // Track pending dream for auto-save
    pendingDreamRef.current = dreamText;

    try {
      await sendMessage({
        text: `Tulkitse tämä uni: ${dreamText}`,
      });
    } catch (err) {
      console.error("Submit error:", err);
      pendingDreamRef.current = null;
    }
  }, [localInput, isLoading, sendMessage]);

  // Submit a specific dream text (bypasses input state)
  const submitDream = useCallback(
    async (dream: string) => {
      if (!dream || !dream.trim() || isLoading) return;

      const dreamText = dream.trim();
      setDreamError(null);

      // Track pending dream for auto-save
      pendingDreamRef.current = dreamText;

      try {
        await sendMessage({
          text: `Tulkitse tämä uni: ${dreamText}`,
        });
      } catch (err) {
        console.error("Submit dream error:", err);
        pendingDreamRef.current = null;
      }
    },
    [isLoading, sendMessage]
  );

  // Clear chat history
  const clearChat = useCallback(() => {
    setMessages([]);
    setLocalInput("");
    setDreamError(null);
  }, [setMessages]);

  // Clear error state
  const clearError = useCallback(() => {
    setDreamError(null);
    clearChatError();
  }, [clearChatError]);

  // Get the last AI interpretation
  const lastInterpretation = useMemo(() => {
    const assistantMessages = messages.filter((m) => m.role === "assistant");
    return assistantMessages[assistantMessages.length - 1] || null;
  }, [messages]);

  // Combined error state
  const error = useMemo(
    () =>
      dreamError ||
      (chatError
        ? {
            message: chatError.message || "Tuntematon virhe",
            details: chatError.message,
          }
        : null),
    [dreamError, chatError]
  );

  return {
    // Chat state
    messages,
    input: localInput,
    isLoading,
    error,

    // Actions
    handleInputChange,
    handleSubmit,
    submitDream,
    clearChat,
    clearError,

    // Helpers
    getMessageText,

    // Metadata
    isReady: !isLoading && !error,
    lastInterpretation,
    lastSavedDream,
  };
}

export default useDreamInterpretation;
