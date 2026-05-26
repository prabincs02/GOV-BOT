// Module 6 — AES-256 Encryption Utility
// All encryption/decryption happens ON THE DEVICE before any data leaves

import CryptoJS from "crypto-js";

/**
 * Encrypt any text/data with AES-256
 * @param {string} data - plain text or JSON string to encrypt
 * @param {string} key - encryption key (derived from user password)
 * @returns {string} encrypted ciphertext
 */
export const encryptData = (data, key) => {
  try {
    const text = typeof data === "object" ? JSON.stringify(data) : String(data);
    const encrypted = CryptoJS.AES.encrypt(text, key).toString();
    return encrypted;
  } catch (e) {
    console.error("Encryption failed:", e);
    throw new Error("Failed to encrypt data");
  }
};

/**
 * Decrypt AES-256 encrypted data
 * @param {string} ciphertext - encrypted string
 * @param {string} key - same key used to encrypt
 * @returns {string|object} decrypted data
 */
export const decryptData = (ciphertext, key) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) throw new Error("Wrong key or corrupted data");
    // Try to parse as JSON, else return as string
    try { return JSON.parse(decrypted); } catch { return decrypted; }
  } catch (e) {
    console.error("Decryption failed:", e);
    throw new Error("Failed to decrypt — wrong password or corrupted data");
  }
};

/**
 * Encrypt a specific field object (e.g. extracted Aadhaar fields)
 * @param {object} fields - { name, dob, address, last4 }
 * @param {string} key - encryption key
 * @returns {string} encrypted string
 */
export const encryptFields = (fields, key) => {
  return encryptData(fields, key);
};

/**
 * Decrypt field object
 * @param {string} ciphertext
 * @param {string} key
 * @returns {object} decrypted fields
 */
export const decryptFields = (ciphertext, key) => {
  return decryptData(ciphertext, key);
};

/**
 * Mask sensitive numbers — only keep last 4 digits
 * e.g. "1234 5678 9012" → "XXXX XXXX 9012"
 * @param {string} number
 * @returns {string} masked number
 */
export const maskNumber = (number) => {
  if (!number) return "";
  const clean = number.replace(/\s/g, "");
  if (clean.length <= 4) return clean;
  const last4 = clean.slice(-4);
  const masked = "X".repeat(clean.length - 4);
  // Format with spaces every 4 chars
  const full = masked + last4;
  return full.match(/.{1,4}/g)?.join(" ") || full;
};

/**
 * Hash a value for comparison without storing plaintext
 * Used to verify document identity without exposing content
 * @param {string} value
 * @returns {string} SHA-256 hash
 */
export const hashValue = (value) => {
  return CryptoJS.SHA256(value).toString();
};

/**
 * Generate a random secure ID for documents
 * @returns {string} random ID
 */
export const generateDocId = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, "0")).join("");
};
