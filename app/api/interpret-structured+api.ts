import { perplexity } from "@ai-sdk/perplexity";
import { generateObject } from "ai";
import { dreamInterpretationSchema } from "@/lib/schemas/dreamInterpretation";

// Structured dream interpretation system prompt
const SYSTEM_PROMPT = `Olet Unitulkki, ammattitaitoinen AI-unitulkki joka yhdistää modernin psykologian tietämystä ja symbolista tulkintaa.

Analysoi käyttäjän uni ja palauta strukturoitu tulkinta JSON-muodossa.

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

export async function POST(request: Request) {
  try {
    const body: InterpretRequest = await request.json();

    // Validate API key
    if (!process.env.PERPLEXITY_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "API-avainta ei ole määritetty",
          code: "MISSING_API_KEY",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate dream content
    if (!body.dream || !body.dream.trim()) {
      return new Response(
        JSON.stringify({
          error: "Unta ei annettu",
          code: "MISSING_DREAM",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const dreamText = body.dream.trim();

    // Generate structured output using Perplexity
    const result = await generateObject({
      model: perplexity("sonar-pro"),
      system: SYSTEM_PROMPT,
      prompt: `Analysoi tämä uni ja palauta strukturoitu tulkinta:\n\n"${dreamText}"`,
      schema: dreamInterpretationSchema,
      temperature: 0.7,
    });

    // Return the generated object as JSON
    return Response.json(result.object);

  } catch (error) {
    console.error("Structured interpretation API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Tuntematon virhe";

    return new Response(
      JSON.stringify({
        error: "Unitulkinta epäonnistui. Yritä uudelleen.",
        details: errorMessage,
        code: "INTERPRETATION_ERROR",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Health check
export async function GET() {
  const hasApiKey = !!process.env.PERPLEXITY_API_KEY;

  return new Response(
    JSON.stringify({
      status: hasApiKey ? "ready" : "missing_api_key",
      provider: "perplexity",
      model: "sonar-pro",
      type: "structured",
    }),
    {
      status: hasApiKey ? 200 : 503,
      headers: { "Content-Type": "application/json" },
    }
  );
}
