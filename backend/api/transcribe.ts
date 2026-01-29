import type { VercelRequest, VercelResponse } from "@vercel/node";
import formidable from "formidable-serverless";
import fs from "fs";
import OpenAI from "openai";

// Initialize OpenAI client with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Important: Disable Vercel's default body parser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

interface FormidableFile {
  filepath: string;
  originalFilename?: string;
  mimetype?: string;
  size?: number;
}

interface ParseResult {
  fields: Record<string, string | string[]>;
  files: Record<string, FormidableFile | FormidableFile[]>;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS for mobile app requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST", "OPTIONS"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const form = new formidable.IncomingForm();

  try {
    const { files } = await new Promise<ParseResult>((resolve, reject) => {
      form.parse(req as any, (err: Error | null, fields: any, files: any) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const file = files.file as FormidableFile | undefined;

    if (!file) {
      return res.status(400).json({
        error: "Ei äänitiedostoa",
        code: "NO_AUDIO_FILE"
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OpenAI API-avain puuttuu",
        code: "MISSING_API_KEY",
      });
    }

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(file.filepath),
      model: "whisper-1",
      language: "fi",
    });

    // Clean up the temporary file created by formidable
    if (fs.existsSync(file.filepath)) {
      fs.unlinkSync(file.filepath);
    }

    return res.status(200).json({
      text: transcription.text,
    });

  } catch (error) {
    console.error("Transcription error:", error);

    // Ensure temporary files are cleaned up even on error
    const formWithFiles = form as any;
    if (formWithFiles.openedFiles) {
      formWithFiles.openedFiles.forEach((tempFile: FormidableFile) => {
        if (fs.existsSync(tempFile.filepath)) {
          fs.unlinkSync(tempFile.filepath);
        }
      });
    }

    return res.status(500).json({
      error: "Puheentunnistus epäonnistui. Yritä uudelleen.",
      details: error instanceof Error ? error.message : "Tuntematon virhe",
      code: "TRANSCRIPTION_ERROR",
    });
  }
}
