// routes/chat.ts
import { Router, Request, Response } from "express";
import axios, { AxiosError } from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();

/**
 * Configuration
 */
const LIBRETRANSLATE_URL: string =
  process.env.LIBRETRANSLATE_URL || "https://libretranslate.de/translate";
const GEMINI_KEY: string | undefined = process.env.GEMINI_API_KEY;
const AXIOS_TIMEOUT = Number(process.env.AXIOS_TIMEOUT_MS) || 10000;

if (!GEMINI_KEY) {
  throw new Error("GEMINI_API_KEY is required in environment variables");
}

// axios instance
const http = axios.create({
  timeout: AXIOS_TIMEOUT,
  headers: { "Content-Type": "application/json" },
});

// Init Gemini
const genAI = new GoogleGenerativeAI(GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Request body type
 */
interface ChatRequestBody {
  message: string;
  lang?: string;
}

interface LibreTranslateResponse {
  translatedText: string;
}

async function retry<T>(fn: () => Promise<T>, attempts = 2, delayMs = 300): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts) {
        await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, i)));
      }
    }
  }
  throw lastError;
}

function isValidLang(lang: string): boolean {
  if (!lang) return false;
  if (lang.toLowerCase() === "auto") return true;
  return /^[a-z]{2,3}$/i.test(lang);
}

router.post("/chat", async (req: Request<{}, {}, ChatRequestBody>, res: Response) => {
  try {
    const { message, lang = "en" } = req.body ?? {};

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "Message is required and must be a non-empty string." });
    }

    const langNormalized = isValidLang(lang) ? lang.toLowerCase() : "en";

    // 1) Translate -> English
    let translated: string = message;
    if (langNormalized !== "en") {
      try {
        const translateResp = await retry(() =>
          http.post<LibreTranslateResponse>(LIBRETRANSLATE_URL, {
            q: message,
            source: langNormalized,
            target: "en",
            format: "text",
          })
        );
        translated = translateResp.data.translatedText;
      } catch (err) {
        const e = err as AxiosError;
        console.error("Translation -> EN failed:", e.message);
        return res.status(502).json({ error: "Translation to English failed." });
      }
    }

    // 2) Call Gemini
    let reply: string;
    try {
      const prompt = `
You are a medical assistant that helps patients understand symptoms. 
Do NOT provide a diagnosis. 
Instead, suggest possible conditions, next steps, and urgent red flags.
    
Patient: ${translated}
`;

      const result = await model.generateContent(prompt);
      reply = result.response.text() || "⚠️ No response from AI.";
    } catch (err) {
      console.error("Gemini request failed:", err);
      return res.status(502).json({ error: "AI service failed." });
    }

    // 3) Back-translate if needed
    if (langNormalized !== "en") {
      try {
        const backResp = await retry(() =>
          http.post<LibreTranslateResponse>(LIBRETRANSLATE_URL, {
            q: reply,
            source: "en",
            target: langNormalized,
            format: "text",
          })
        );
        reply = backResp.data.translatedText;
      } catch (err) {
        const e = err as AxiosError;
        console.error("Back-translation failed:", e.message);
        return res.status(502).json({ error: "Back-translation failed." });
      }
    }

    return res.json({ reply });
  } catch (err) {
    console.error("Unhandled error in /chat:", err);
    return res.status(500).json({ error: "Chatbot failed unexpectedly." });
  }
});

export default router;
