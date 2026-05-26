// Module 6 — Key Manager
// Derives encryption key from user's password using PBKDF2
// The key NEVER gets stored — it's re-derived every session from the password
// Even if Firebase is hacked, data is useless without the user's password

import CryptoJS from "crypto-js";

const KEY_ITERATIONS = 10000; // PBKDF2 iterations — higher = more secure
const KEY_SIZE = 256 / 32;    // 256-bit key

/**
 * Derive a strong encryption key from user's password + their UID (salt)
 * Same password + same UID always produces the same key
 * Different user = different key even with same password
 * @param {string} password - user's login password
 * @param {string} uid - Firebase user UID (used as salt)
 * @returns {string} derived key string
 */
export const deriveKey = (password, uid) => {
  const salt = CryptoJS.enc.Utf8.parse(uid + "_govbot_salt_v1");
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: KEY_SIZE,
    iterations: KEY_ITERATIONS,
  });
  return key.toString();
};

/**
 * Store the derived key in memory only (never in localStorage)
 * Cleared when user logs out or page refreshes
 */
let _sessionKey = null;
let _sessionUid = null;

export const setSessionKey = (password, uid) => {
  _sessionKey = deriveKey(password, uid);
  _sessionUid = uid;
};

export const getSessionKey = () => {
  if (!_sessionKey) throw new Error("No session key — user must log in again");
  return _sessionKey;
};

export const hasSessionKey = () => !!_sessionKey;

export const clearSessionKey = () => {
  _sessionKey = null;
  _sessionUid = null;
};

/**
 * Check if current session key matches what we expect
 * Used to verify password before sensitive operations
 * @param {string} password
 * @param {string} uid
 * @returns {boolean}
 */
export const verifyKey = (password, uid) => {
  const testKey = deriveKey(password, uid);
  return testKey === _sessionKey;
};
