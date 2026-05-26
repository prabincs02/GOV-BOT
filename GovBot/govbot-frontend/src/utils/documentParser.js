// Module 2 — Document Parser
// Uses AI (Groq via backend) to intelligently extract structured fields
// from raw OCR text — much smarter than regex alone

import { maskNumber } from "./crypto.js";

/**
 * Document type detection from raw OCR text
 * @param {string} text - raw OCR output
 * @returns {string} detected doc type id
 */
export const detectDocumentType = (text) => {
  const t = text.toLowerCase();
  if (t.includes("aadhaar") || t.includes("आधार") || t.includes("uidai") || t.includes("unique identification")) return "aadhaar";
  if (t.includes("permanent account") || t.includes("income tax") || t.includes("pan")) return "pan";
  if (t.includes("passbook") || t.includes("account no") || t.includes("ifsc") || t.includes("bank")) return "bank";
  if (t.includes("patta") || t.includes("land record") || t.includes("survey no") || t.includes("khata")) return "land";
  if (t.includes("income certificate") || t.includes("annual income")) return "income";
  if (t.includes("caste certificate") || t.includes("community certificate")) return "caste";
  if (t.includes("ration card") || t.includes("fair price")) return "ration";
  if (t.includes("birth certificate") || t.includes("date of birth") || t.includes("born on")) return "birth";
  return "unknown";
};

/**
 * Extract fields from OCR text using Groq AI
 * Much more accurate than regex for messy OCR output
 * @param {string} ocrText - raw OCR text
 * @param {string} docType - detected document type
 * @returns {Promise<object>} extracted fields
 */
export const parseDocumentFields = async (ocrText, docType) => {
  const fieldPrompts = {
    aadhaar: `Extract from this Aadhaar card OCR text: full name, date of birth (DOB), gender, address, and last 4 digits of Aadhaar number only. Return ONLY a JSON object with keys: name, dob, gender, address, aadhaar_last4. For aadhaar_last4 extract only the last 4 digits of the 12-digit number.`,
    pan: `Extract from this PAN card OCR text: full name, date of birth, and last 4 characters of PAN number. Return ONLY a JSON object with keys: name, dob, pan_last4.`,
    bank: `Extract from this bank passbook OCR text: account holder name, bank name, last 4 digits of account number, IFSC code, branch name. Return ONLY a JSON object with keys: bank_name, account_last4, ifsc, branch, name.`,
    land: `Extract from this land record/patta OCR text: owner name, land size in hectares or acres, survey number, district. Return ONLY a JSON object with keys: owner_name, land_size_hectares, survey_number, district.`,
    income: `Extract from this income certificate OCR text: person name, annual income amount in rupees, issuing authority, valid until date. Return ONLY a JSON object with keys: name, annual_income, issued_by, valid_until.`,
    caste: `Extract from this caste certificate OCR text: person name, caste or community category (SC/ST/OBC/General), issuing authority, certificate number. Return ONLY a JSON object with keys: name, caste_category, issued_by, certificate_number.`,
    ration: `Extract from this ration card OCR text: family head name, card type (APL/BPL/AAY), number of family members, last 4 digits of card number. Return ONLY a JSON object with keys: family_head, card_type, members_count, card_number_last4.`,
    birth: `Extract from this birth certificate OCR text: child name, date of birth, place of birth, registration number. Return ONLY a JSON object with keys: name, dob, place_of_birth, registration_number.`,
  };

  const prompt = fieldPrompts[docType] || `Extract all important personal information from this document OCR text. Return ONLY a JSON object with relevant key-value pairs.`;

  try {
    const response = await fetch("http://localhost:5000/api/parse-document", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ocrText, docType, prompt }),
    });
    const data = await response.json();
    if (data.fields) return sanitizeFields(data.fields, docType);
    return {};
  } catch (e) {
    console.error("Document parse error:", e);
    // Fallback to basic regex extraction
    return basicExtract(ocrText, docType);
  }
};

/**
 * Sanitize extracted fields — mask sensitive numbers, clean whitespace
 */
const sanitizeFields = (fields, docType) => {
  const safe = {};
  for (const [key, val] of Object.entries(fields)) {
    if (!val) continue;
    const strVal = String(val).trim();
    // Mask full ID numbers — only keep last 4
    if (key === "aadhaar_number" || key === "full_aadhaar") {
      safe.aadhaar_last4 = strVal.replace(/\s/g, "").slice(-4);
    } else if (key === "account_number" || key === "full_account") {
      safe.account_last4 = strVal.replace(/\s/g, "").slice(-4);
    } else {
      safe[key] = strVal;
    }
  }
  return safe;
};

/**
 * Fallback basic regex extraction when AI is unavailable
 */
const basicExtract = (text, docType) => {
  const fields = {};
  // Name pattern
  const nameMatch = text.match(/(?:name|नाम|பெயர்)\s*[:\-]?\s*([A-Z][A-Z\s]{2,40})/i);
  if (nameMatch) fields.name = nameMatch[1].trim();
  // DOB pattern
  const dobMatch = text.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/);
  if (dobMatch) fields.dob = dobMatch[1];
  // Last 4 digits of 12-digit number (Aadhaar pattern)
  if (docType === "aadhaar") {
    const aadhaarMatch = text.match(/\d{4}\s\d{4}\s(\d{4})/);
    if (aadhaarMatch) fields.aadhaar_last4 = aadhaarMatch[1];
  }
  return fields;
};

/**
 * Validate extracted fields make sense
 * Returns array of validation errors
 */
export const validateFields = (fields, docType) => {
  const errors = [];
  if (fields.dob) {
    const parts = fields.dob.split(/[\/\-]/);
    if (parts.length === 3) {
      const year = parseInt(parts[2]);
      if (year < 1900 || year > new Date().getFullYear()) {
        errors.push("Date of birth looks incorrect — please verify");
      }
    }
  }
  if (fields.aadhaar_last4 && fields.aadhaar_last4.length !== 4) {
    errors.push("Aadhaar number extract may be incorrect — please verify");
  }
  if (fields.annual_income) {
    const income = parseInt(fields.annual_income.replace(/[^\d]/g, ""));
    if (income > 10000000) errors.push("Income amount looks very high — please verify");
  }
  return errors;
};
