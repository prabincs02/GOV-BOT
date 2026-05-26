// Module 6 — Session Timeout Manager
// Auto-locks the document vault after inactivity
// Protects users who forget to log out on shared devices

import { clearSessionKey } from "./keyManager.js";

const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes inactivity = lock vault
let _timeoutId = null;
let _onLockCallback = null;

/**
 * Start the inactivity timer
 * Call this after user logs in successfully
 * @param {function} onLock - callback when vault is locked
 */
export const startSessionTimer = (onLock) => {
  _onLockCallback = onLock;
  resetTimer();

  // Reset timer on any user activity
  ["mousemove", "keydown", "click", "touchstart", "scroll"].forEach((event) => {
    window.addEventListener(event, resetTimer, { passive: true });
  });
};

/**
 * Reset the inactivity timer (called on user activity)
 */
export const resetTimer = () => {
  if (_timeoutId) clearTimeout(_timeoutId);
  _timeoutId = setTimeout(lockVault, TIMEOUT_MS);
};

/**
 * Lock the vault — clears encryption key from memory
 */
export const lockVault = () => {
  clearSessionKey();
  if (_onLockCallback) _onLockCallback();
  stopSessionTimer();
};

/**
 * Stop the timer (call on logout)
 */
export const stopSessionTimer = () => {
  if (_timeoutId) clearTimeout(_timeoutId);
  ["mousemove", "keydown", "click", "touchstart", "scroll"].forEach((event) => {
    window.removeEventListener(event, resetTimer);
  });
};
