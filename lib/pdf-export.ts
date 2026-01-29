/**
 * PDF Export for Dreams
 * 
 * Premium feature: Export dreams and interpretations as beautifully formatted PDFs
 */

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { type Dream } from "./storage";

// PDF styling
const PDF_STYLES = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #1a1a2e;
      line-height: 1.6;
      padding: 40px;
      background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #8B5CF6;
    }
    
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #8B5CF6;
      margin-bottom: 8px;
    }
    
    .header .subtitle {
      font-size: 14px;
      color: #666;
    }
    
    .dream-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 4px 20px rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.1);
      page-break-inside: avoid;
    }
    
    .dream-date {
      font-size: 12px;
      color: #8B5CF6;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    
    .dream-content {
      background: linear-gradient(135deg, #f8f4ff 0%, #f0f4ff 100%);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      border-left: 4px solid #8B5CF6;
    }
    
    .dream-content h3 {
      font-size: 14px;
      font-weight: 600;
      color: #8B5CF6;
      margin-bottom: 8px;
    }
    
    .dream-content p {
      font-size: 14px;
      color: #333;
      font-style: italic;
    }
    
    .interpretation {
      padding: 16px 0;
    }
    
    .interpretation h3 {
      font-size: 14px;
      font-weight: 600;
      color: #06B6D4;
      margin-bottom: 12px;
    }
    
    .interpretation-text {
      font-size: 13px;
      color: #444;
      white-space: pre-wrap;
    }
    
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }
    
    .tag {
      background: linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%);
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 500;
    }
    
    .mood-indicator {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 500;
      margin-left: 8px;
    }
    
    .mood-anxious { background: #FEE2E2; color: #991B1B; }
    .mood-happy { background: #D1FAE5; color: #065F46; }
    .mood-sad { background: #DBEAFE; color: #1E40AF; }
    .mood-peaceful { background: #E0E7FF; color: #3730A3; }
    .mood-confused { background: #FEF3C7; color: #92400E; }
    .mood-nostalgic { background: #FCE7F3; color: #9D174D; }
    .mood-neutral { background: #F3F4F6; color: #374151; }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #888;
      font-size: 11px;
    }
    
    .footer .logo {
      font-size: 16px;
      margin-bottom: 8px;
    }
    
    @media print {
      body {
        background: white;
        padding: 20px;
      }
      .dream-card {
        box-shadow: none;
        border: 1px solid #ddd;
      }
    }
  </style>
`;

// Mood labels
const MOOD_LABELS: Record<string, string> = {
  anxious: "Ahdistunut",
  happy: "Iloinen",
  sad: "Surullinen",
  peaceful: "Rauhallinen",
  confused: "Hämmentynyt",
  nostalgic: "Nostalginen",
  neutral: "Neutraali",
};

// Tag labels
const TAG_LABELS: Record<string, string> = {
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
 * Format date in Finnish
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fi-FI", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Generate HTML for a single dream
 */
function generateDreamHtml(dream: Dream): string {
  const tags = (dream.tags || [])
    .map((tag) => `<span class="tag">${TAG_LABELS[tag] || tag}</span>`)
    .join("");

  const moodClass = `mood-${dream.mood || "neutral"}`;
  const moodLabel = MOOD_LABELS[dream.mood || "neutral"] || "Neutraali";

  return `
    <div class="dream-card">
      <div class="dream-date">
        ${formatDate(dream.createdAt)}
        <span class="mood-indicator ${moodClass}">${moodLabel}</span>
      </div>
      
      <div class="dream-content">
        <h3>🌙 Uni</h3>
        <p>${escapeHtml(dream.content)}</p>
      </div>
      
      <div class="interpretation">
        <h3>✨ Tulkinta</h3>
        <div class="interpretation-text">${escapeHtml(dream.interpretation)}</div>
      </div>
      
      ${tags ? `<div class="tags">${tags}</div>` : ""}
    </div>
  `;
}

/**
 * Generate full PDF HTML
 */
function generatePdfHtml(dreams: Dream[], title: string = "Unipäiväkirja"): string {
  const dreamsHtml = dreams.map(generateDreamHtml).join("");
  const exportDate = new Date().toLocaleDateString("fi-FI", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <!DOCTYPE html>
    <html lang="fi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      ${PDF_STYLES}
    </head>
    <body>
      <div class="header">
        <h1>🌙 ${title}</h1>
        <p class="subtitle">Viety ${exportDate} • ${dreams.length} unta</p>
      </div>
      
      ${dreamsHtml}
      
      <div class="footer">
        <div class="logo">🌙✨🔮</div>
        <p>Luotu DreamAI-sovelluksella</p>
        <p>dreamai.app</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Export single dream as PDF
 */
export async function exportDreamAsPdf(dream: Dream): Promise<void> {
  try {
    const html = generatePdfHtml([dream], "Unitulkinta");
    
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    // Share the PDF directly
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Jaa unitulkinta",
        UTI: "com.adobe.pdf",
      });
    }
  } catch (error) {
    console.error("Error exporting dream:", error);
    throw new Error("PDF-vienti epäonnistui");
  }
}

/**
 * Export multiple dreams as PDF
 */
export async function exportDreamsAsPdf(
  dreams: Dream[],
  title: string = "Unipäiväkirja"
): Promise<void> {
  try {
    if (dreams.length === 0) {
      throw new Error("Ei vietäviä unia");
    }

    const html = generatePdfHtml(dreams, title);

    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    // Share the PDF directly
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Jaa unipäiväkirja",
        UTI: "com.adobe.pdf",
      });
    }
  } catch (error) {
    console.error("Error exporting dreams:", error);
    throw new Error("PDF-vienti epäonnistui");
  }
}

/**
 * Check if sharing is available
 */
export async function isSharingAvailable(): Promise<boolean> {
  return Sharing.isAvailableAsync();
}
