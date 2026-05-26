require("dotenv").config();
const express = require("express");
const cors = require("cors");
const googleTTS = require("google-tts-api");

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;
function getGoogleLang(lang) {
  if (!lang) return "en";
  return lang.split("-")[0];
}

const LANG_NAMES = {
  "ta-IN": "Tamil",
  "ml-IN": "Malayalam",
  "kn-IN": "Kannada",
  "te-IN": "Telugu",
  "hi-IN": "Hindi",
  "bn-IN": "Bengali",
  "gu-IN": "Gujarati",
  "en-IN": "English",
};

// Helper: call Groq with retry on rate limit
async function callGroq(messages, maxTokens = 1024, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: maxTokens, messages })
      });
      const data = await res.json();
      if (data.error) {
        const isRateLimit = data.error?.type === "tokens" || data.error?.code === "rate_limit_exceeded" || res.status === 429;
        if (isRateLimit && attempt < retries) {
          await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
          continue;
        }
        throw new Error(data.error.message || "Groq error");
      }
      const result = data.choices?.[0]?.message?.content || "";
      if (!result) throw new Error("Empty response from Groq");
      return result;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

// Helper: Google TTS to base64 mp3
async function synthesize(text, lang) {
  const gLang = getGoogleLang(lang);
  const safeText = text.replace(/[*#_~`]/g, "").trim();
  if (!safeText) return null;
  const chunks = await googleTTS.getAllAudioBase64(safeText, { lang: gLang, slow: false, host: 'https://translate.google.com', splitPunct: ',.?' });
  const bufs = chunks.map(c => Buffer.from(c.base64, "base64"));
  return Buffer.concat(bufs).toString("base64");
}

// Chat endpoint - generates reply + spoken summary + audio ALL in parallel
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, systemPrompt, lang, region: regionId } = req.body;

    // Guard: validate request body
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request: messages array required" });
    }

    const filtered = messages.filter(m => m.role === "user" || m.role === "assistant");
    const isEnglish = !lang || lang === "en-IN";
    const langName = LANG_NAMES[lang] || "English";

    // Step 1: Get chat reply from Groq — this is the critical step
    let reply;
    try {
      reply = await callGroq([{ role: "system", content: systemPrompt || "" }, ...filtered], 1024);
    } catch (groqErr) {
      console.error("❌ Groq chat error:", groqErr.message);
      // Return a friendly message instead of 500 — so the UI still works
      return res.json({
        reply: "Sorry, I'm having trouble connecting to my AI service right now. Please try again in a moment. 🙏",
        audio: null,
        voice: getGoogleLang(lang)
      });
    }

    // Step 2: Decide whether reply has schemes or is just conversation
    const hasSchemes = /\d+\.\s/.test(reply) || /PM-KISAN|Ayushman|Awas Yojana|Mudra|PMKVY|Ujjwala|Fasal Bima/i.test(reply);

    // Step 3: Generate spoken summary (non-critical — fallback to cleaned reply)
    let spokenSummary;
    try {
      if (!hasSchemes) {
        spokenSummary = reply.replace(/[*#_~`]/g, "").replace(/\n+/g, " ").trim().slice(0, 500);
      } else {
        const summaryPrompt = isEnglish
          ? `Summarize these government schemes for voice reading. For each: scheme name, benefit, who qualifies. Plain English, no markdown. Text: "${reply.slice(0, 800)}"`
          : `Summarize these schemes in ${langName} for voice. Keep scheme names in English. No markdown. Text: "${reply.slice(0, 800)}"`;
        spokenSummary = await callGroq([{ role: "user", content: summaryPrompt }], 500);
      }
    } catch (e) {
      console.warn("⚠️ Summary generation failed, using cleaned reply:", e.message);
      spokenSummary = reply.replace(/[*#_~`]/g, "").replace(/\n+/g, " ").trim().slice(0, 400);
    }

    // Step 4: TTS synthesis (non-critical — chat still works without audio)
    let audio = null;
    try {
      audio = await synthesize(spokenSummary, lang || "en-IN");
    } catch (e) {
      console.warn("⚠️ TTS failed (audio skipped):", e.message);
    }

    res.json({ reply, audio, voice: getGoogleLang(lang) });
  } catch (error) {
    console.error("❌ Unexpected chat error:", error.message, error.stack);
    res.status(500).json({ error: "Failed to get response", detail: error.message });
  }
});

// Smart TTS endpoint - summarizes then speaks in pure target language
app.post("/api/speak", async (req, res) => {
  try {
    const { text, lang } = req.body;
    const langName = LANG_NAMES[lang] || "English";
    const isEnglish = lang === "en-IN";

    // Step 1: Use Groq to generate a clean, pure-language spoken summary
    const summaryPrompt = isEnglish
      ? `You are a warm, helpful voice assistant for rural Indian citizens who may not be educated.
         
         Your job: Read out EVERY government scheme from the text below — do not skip any scheme.
         
         For EACH scheme follow this exact pattern:
         "[Scheme name]. This scheme gives [benefit/amount] to [who is eligible]. To apply, you need [1 key requirement]. [One important thing to remember]."
         
         Then after ALL schemes, end with one sentence summarizing total number of schemes found.
         
         Strict rules:
         - Cover every single scheme — do not miss any
         - No asterisks, no stars, no bullet points, no markdown
         - Plain spoken words only, like a helpful officer at a village panchayat
         - Simple short sentences a farmer can understand
         - Keep scheme names as they are (PM-KISAN, Aadhaar etc)
         
         Text: "${text}"`
      : `You are a warm, helpful voice assistant for rural Indian citizens who speak only ${langName}.
         
         Your job: Read out EVERY government scheme from the text below in pure ${langName} — do not skip any scheme.
         
         For EACH scheme follow this exact pattern in ${langName}:
         "[Scheme name உங்களுக்கு உதவும்]. இந்த திட்டத்தில் [benefit/amount] கிடைக்கும். [who is eligible] இதற்கு தகுதியானவர்கள். [One key requirement or important note]."
         
         Then end with one sentence in ${langName} saying how many schemes were found for them.
         
         Strict rules:
         - Cover EVERY single scheme — absolutely do not miss any
         - Use ONLY pure ${langName} words
         - Only keep scheme proper names in English: PM-KISAN, Aadhaar, Ayushman Bharat, PMKVY etc
         - No asterisks, no stars, no bullet points, no markdown, no special characters
         - Warm, simple tone like a village officer talking to an elderly farmer
         - Natural flowing ${langName} sentences
         
         Text: "${text}"`;

    const summaryRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 700,
        messages: [{ role: "user", content: summaryPrompt }]
      })
    });

    const summaryData = await summaryRes.json();
    const spokenText = summaryData.choices?.[0]?.message?.content || text.slice(0, 300);
    console.log(`🎙️ Speaking in ${langName}:`, spokenText.slice(0, 100));

    // Step 2, 3, 4: Call Google TTS
    const base64Audio = await synthesize(spokenText, lang);
    res.json({ audio: base64Audio, voice: getGoogleLang(lang), summary: spokenText });

  } catch (error) {
    console.error("TTS error:", error);
    res.status(500).json({ error: "TTS service error" });
  }
});


// Module 2 — Document field parser endpoint
// AI extracts structured fields from raw OCR text
app.post("/api/parse-document", async (req, res) => {
  try {
    const { ocrText, docType, prompt } = req.body;
    if (!ocrText) return res.status(400).json({ error: "No OCR text provided" });

    const systemMsg = `You are a document data extractor for Indian government documents.
Extract ONLY the requested fields from the OCR text provided.
Return ONLY a valid JSON object — no explanation, no markdown, no extra text.
If a field cannot be found, omit it from the JSON.
For Aadhaar numbers, extract ONLY the last 4 digits, never the full number.
For bank account numbers, extract ONLY the last 4 digits.`;

    const reply = await callGroq([
      { role: "system", content: systemMsg },
      { role: "user", content: `${prompt}\n\nOCR Text:\n${ocrText.slice(0, 2000)}` }
    ], 500);

    // Parse JSON from reply
    let fields = {};
    try {
      const cleaned = reply.replace(/```json|```/g, "").trim();
      fields = JSON.parse(cleaned);
    } catch {
      // Try to extract JSON from reply
      const match = reply.match(/\{[\s\S]*\}/);
      if (match) {
        try { fields = JSON.parse(match[0]); } catch { }
      }
    }

    console.log("📄 Parsed " + docType + " document: " + Object.keys(fields).join(", "));
    res.json({ fields, docType });
  } catch (error) {
    console.error("Document parse error:", error);
    res.status(500).json({ error: "Failed to parse document" });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", tts: "Google Free TTS", ai: "Groq Llama 3.3" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ GovBot backend on http://localhost:${PORT}`);
  console.log(`🤖 AI: Groq Llama 3.3`);
  console.log(`🎙️ TTS: Google Free TTS (pure language summaries)`);
});
