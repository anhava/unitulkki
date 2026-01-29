
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = (formData as any).get("file") as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "Ei äänitiedostoa", code: "NO_AUDIO_FILE" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "OpenAI API-avain puuttuu",
          code: "MISSING_API_KEY",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create a new FormData for the OpenAI API
    const openaiFormData = new FormData();
    openaiFormData.append("file", file);
    openaiFormData.append("model", "whisper-1");
    openaiFormData.append("language", "fi");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: openaiFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI Whisper API error:", errorData);
      throw new Error(errorData.error?.message || "Transkriptio epäonnistui");
    }

    const data = await response.json();

    return Response.json({
      text: data.text,
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return new Response(
      JSON.stringify({
        error: "Puheentunnistus epäonnistui. Yritä uudelleen.",
        details: error instanceof Error ? error.message : "Tuntematon virhe",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
