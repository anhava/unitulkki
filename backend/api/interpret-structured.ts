import type { VercelRequest, VercelResponse } from "@vercel/node";
import { openai } from "@ai-sdk/openai";
import { streamObject, jsonSchema } from "ai";
import type { DreamInterpretation } from "../lib/schemas/dreamInterpretation";

// JSON Schema for dream interpretation with strict mode
const dreamInterpretationJsonSchema = jsonSchema<DreamInterpretation>({
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string", description: "Brief 1-2 sentence summary of the dream's meaning" },
    mood: {
      type: "string",
      enum: ["peaceful", "happy", "anxious", "sad", "confused", "nostalgic", "neutral", "excited", "fearful"],
      description: "Overall mood/emotion of the dream"
    },
    symbols: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          symbol: { type: "string", description: "The dream symbol" },
          meaning: { type: "string", description: "Psychological meaning" },
          relevance: { type: "string", enum: ["high", "medium", "low"] }
        },
        required: ["symbol", "meaning", "relevance"]
      }
    },
    emotionalAnalysis: {
      type: "object",
      additionalProperties: false,
      properties: {
        primaryEmotion: { type: "string" },
        secondaryEmotions: { type: "array", items: { type: "string" } },
        subconscious: { type: "string" },
        jungianPerspective: { type: "string" }
      },
      required: ["primaryEmotion", "secondaryEmotions", "subconscious", "jungianPerspective"]
    },
    lifeConnections: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          area: {
            type: "string",
            enum: ["work", "relationships", "personal_growth", "health", "creativity", "spirituality", "family", "finances"]
          },
          insight: { type: "string" },
          actionSuggestion: { type: "string" }
        },
        required: ["area", "insight", "actionSuggestion"]
      }
    },
    keyMessage: { type: "string", description: "The main message or lesson from this dream" },
    reflectionQuestions: {
      type: "array",
      items: { type: "string" }
    },
    tags: {
      type: "array",
      items: { type: "string" }
    },
    confidence: { type: "string", enum: ["high", "medium", "low"] }
  },
  required: ["summary", "mood", "symbols", "emotionalAnalysis", "lifeConnections", "keyMessage", "reflectionQuestions", "tags", "confidence"]
});

// Structured dream interpretation system prompt
const SYSTEM_PROMPT = `Olet Unitulkki, ammattitaitoinen AI-unitulkki joka yhdistää modernin psykologian tietämystä ja symbolista tulkintaa.

Analysoi käyttäjän uni ja palauta strukturoitu tulkinta.

TÄRKEÄÄ:
- Vastaa AINA suomeksi (paitsi teknisiä kenttiä kuten mood, area jne.)
- Ole empaattinen ja kunnioittava
- Tunnista 1-5 keskeistä symbolia
- Anna 1-3 yhteyttä elämäntilanteeseen
- Pidä vastaukset tiivistettynä mutta merkityksellisinä
- Muistuta, että tulkinta on suuntaa-antava

Käytä jungilaista psykologiaa ja modernia unitutkimusta analyysissäsi.`;

// Type for incoming request
type InterpretRequest = {
  dream: string;
  language?: "fi" | "en";
  includePremium?: boolean;
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS for mobile app requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    const hasApiKey = !!process.env.OPENAI_API_KEY;
    return res.status(hasApiKey ? 200 : 503).json({
      status: hasApiKey ? "ready" : "missing_api_key",
      provider: "openai",
      model: "gpt-4o-mini",
      type: "structured-stream",
    });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST", "GET", "OPTIONS"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const body: InterpretRequest = req.body;

    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "API-avainta ei ole määritetty",
        code: "MISSING_API_KEY",
      });
    }

    // Validate dream content
    if (!body.dream || !body.dream.trim()) {
      return res.status(400).json({
        error: "Unta ei annettu",
        code: "MISSING_DREAM",
      });
    }

    const dreamText = body.dream.trim();

    // Use streamObject for progressive streaming
    const result = streamObject({
      model: openai("gpt-4o-mini", { structuredOutputs: true }),
      system: SYSTEM_PROMPT,
      prompt: `Analysoi tämä uni ja palauta strukturoitu tulkinta:\n\n"${dreamText}"`,
      schema: dreamInterpretationJsonSchema,
      temperature: 0.7,
    });

    // Set streaming headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Stream partial objects to client
    for await (const partialObject of result.partialObjectStream) {
      // Send each partial update as SSE
      res.write(`data: ${JSON.stringify(partialObject)}\n\n`);
    }

    // Send completion signal
    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (error) {
    console.error("Structured interpretation API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Tuntematon virhe";

    // If headers already sent (streaming started), we can't send JSON error
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.end();
    } else {
      return res.status(500).json({
        error: "Unitulkinta epäonnistui. Yritä uudelleen.",
        details: errorMessage,
        code: "INTERPRETATION_ERROR",
      });
    }
  }
}
