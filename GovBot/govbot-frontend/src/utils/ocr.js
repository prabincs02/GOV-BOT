// Module 2 — OCR Engine
// Wraps Tesseract.js for Indian document text extraction
// Supports: English, Hindi, Tamil, Telugu, Malayalam, Kannada, Bengali, Gujarati

import { preprocessImage } from "./imageProcessor.js";

// Language map for Tesseract
const TESSERACT_LANGS = {
  "en-IN": "eng",
  "hi-IN": "hin+eng",
  "ta-IN": "tam+eng",
  "te-IN": "tel+eng",
  "ml-IN": "mal+eng",
  "kn-IN": "kan+eng",
  "bn-IN": "ben+eng",
  "gu-IN": "guj+eng",
  "pa-IN": "pan+eng",
};

/**
 * Extract text from an image file using Tesseract OCR
 * @param {File} file - image file
 * @param {string} lang - language code (e.g. "ta-IN")
 * @param {function} onProgress - progress callback (0-100)
 * @returns {Promise<{text: string, confidence: number}>}
 */
export const extractText = async (file, lang = "en-IN", onProgress = null) => {
  try {
    // Step 1: Preprocess image for better accuracy
    if (onProgress) onProgress(5, "Preparing image...");
    const processedDataUrl = await preprocessImage(file);

    // Step 2: Load Tesseract dynamically
    if (onProgress) onProgress(15, "Loading OCR engine...");
    const Tesseract = await import("tesseract.js");

    const tesLang = TESSERACT_LANGS[lang] || "eng";

    // Step 3: Run OCR
    if (onProgress) onProgress(20, "Reading document...");
    const result = await Tesseract.recognize(
      processedDataUrl,
      tesLang,
      {
        logger: (m) => {
          if (m.status === "recognizing text" && onProgress) {
            const pct = Math.round(20 + m.progress * 70);
            onProgress(pct, "Reading document...");
          }
        },
      }
    );

    if (onProgress) onProgress(95, "Processing results...");

    return {
      text: result.data.text,
      confidence: result.data.confidence,
      words: result.data.words,
    };
  } catch (e) {
    console.error("OCR error:", e);
    throw new Error("Could not read the document. Please try a clearer photo.");
  }
};

/**
 * Quick confidence check — is this image readable?
 * @param {File} file
 * @returns {Promise<boolean>}
 */
export const isImageReadable = async (file) => {
  try {
    const result = await extractText(file, "en-IN");
    return result.confidence > 40; // 40% confidence minimum
  } catch {
    return false;
  }
};
