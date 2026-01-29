import { perplexity } from "@ai-sdk/perplexity";
import { streamText, createUIMessageStreamResponse, UIMessage } from "ai";

// Dream interpretation system prompt - professional and empathetic
const SYSTEM_PROMPT = `Olet Unitulkki, ammattitaitoinen AI-unitulkki joka yhdistää modernin psykologian tietämystä ja symbolista tulkintaa.

Kun käyttäjä kertoo unensa, analysoi se seuraavasti:

## 🔮 Symbolien merkitykset
Tunnista unen keskeiset symbolit (esineet, hahmot, paikat, toiminnat) ja selitä niiden tyypilliset merkitykset unianalyysissä.

## 💭 Emotionaalinen tulkinta
Analysoi unen tunnelmaa ja tunteita. Mitä alitajuisia tunteita uni saattaa heijastaa? Käytä jungilaista ja modernia unitutkimusta.

## 🌟 Yhteydet elämäntilanteeseen
Anna konkreettisia ehdotuksia siitä, miten uni voisi liittyä käyttäjän nykyiseen elämäntilanteeseen, haasteisiin tai kehityskohtiin.

## ✨ Oivalluksia
Päätä 1-2 ajatuksella siitä, mitä uni voisi opettaa tai mitä kannattaa pohtia.

---
**Tärkeää:**
- Vastaa AINA suomeksi
- Ole empaattinen ja kunnioittava
- Muistuta, että unet ovat henkilökohtaisia - tulkinta on suuntaa-antava
- Pidä vastaukset selkeinä ja helposti luettavina
- Käytä emoji-otsikoita jäsentämään vastausta
- Vältä liian pitkiä vastauksia - keskity olennaiseen`;

// Type for incoming request - matches AI SDK 6 UIMessage format
type InterpretRequest = {
  messages?: UIMessage[];
  dream?: string;
  chatId?: string;
};

export async function POST(request: Request) {
  try {
    const body: InterpretRequest = await request.json();

    // Validate API key
    if (!process.env.PERPLEXITY_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "API-avainta ei ole määritetty",
          code: "MISSING_API_KEY"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Support both message array and simple dream string
    let messages: UIMessage[];

    if (body.messages && Array.isArray(body.messages)) {
      messages = body.messages;
    } else if (body.dream) {
      messages = [
        {
          id: crypto.randomUUID(),
          role: "user",
          content: `Tulkitse tämä uni: ${body.dream}`,
          parts: [{ type: "text", text: `Tulkitse tämä uni: ${body.dream}` }],
        } as UIMessage,
      ];
    } else {
      return new Response(
        JSON.stringify({
          error: "Pyyntö puuttuu: messages tai dream vaaditaan",
          code: "INVALID_REQUEST"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Convert UIMessage to model messages format
    // UIMessage uses parts array, extract text from text parts
    const modelMessages = messages.map(msg => {
      const textPart = msg.parts?.find(p => p.type === "text");
      const content = textPart && "text" in textPart ? textPart.text : "";
      return {
        role: msg.role as "user" | "assistant" | "system",
        content,
      };
    });

    // Stream the response using Perplexity's Sonar model
    // sonar-pro has web search capabilities for grounded responses
    const result = streamText({
      model: perplexity("sonar-pro"),
      system: SYSTEM_PROMPT,
      messages: modelMessages,
      // Perplexity-specific options
      providerOptions: {
        perplexity: {
          // Return citations for transparency
          return_citations: true,
        },
      },
      // Temperature for creative but coherent responses
      temperature: 0.7,
    });

    // Return streaming UI message response for useChat compatibility
    return createUIMessageStreamResponse({
      stream: result.toUIMessageStream(),
      headers: {
        "X-Content-Type": "text/event-stream",
      },
    });
  } catch (error) {
    console.error("Dream interpretation API error:", error);

    // Provide helpful error messages
    const errorMessage = error instanceof Error ? error.message : "Tuntematon virhe";

    return new Response(
      JSON.stringify({
        error: "Unitulkinta epäonnistui. Yritä uudelleen.",
        details: errorMessage,
        code: "INTERPRETATION_ERROR"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

// Health check endpoint
export async function GET() {
  const hasApiKey = !!process.env.PERPLEXITY_API_KEY;

  return new Response(
    JSON.stringify({
      status: hasApiKey ? "ready" : "missing_api_key",
      provider: "perplexity",
      model: "sonar-pro",
    }),
    {
      status: hasApiKey ? 200 : 503,
      headers: { "Content-Type": "application/json" }
    }
  );
}
