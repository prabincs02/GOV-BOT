// Module 6 — Consent Manager
// Tracks explicit user consent before any document is stored or used
// Required under India's DPDP Act 2023

/**
 * Consent types in GovBot
 */
export const CONSENT_TYPES = {
  DOCUMENT_STORE: "document_store",       // storing documents
  DOCUMENT_USE_APPLY: "document_use_apply", // using docs to apply for schemes
  OCR_PROCESSING: "ocr_processing",       // running OCR on documents
  DATA_DELETION: "data_deletion",         // user requests deletion
};

/**
 * Consent log — stored in Firestore under users/{uid}/consent_log
 * We never modify this — only append
 */
export const buildConsentRecord = (type, granted, uid) => ({
  type,
  granted,         // true = user consented, false = user denied
  uid,
  timestamp: new Date().toISOString(),
  version: "1.0",  // consent policy version
});

/**
 * Save consent record to Firestore
 */
export const recordConsent = async (type, granted, uid) => {
  try {
    const { db, collection, addDoc } = await import("../firebase.js");
    const record = buildConsentRecord(type, granted, uid);
    await addDoc(collection(db, "users", uid, "consent_log"), record);
    return record;
  } catch (e) {
    console.error("Failed to record consent:", e);
  }
};

/**
 * Check if user has previously consented to a type
 */
export const hasConsented = async (type, uid) => {
  try {
    const { db, collection, query, where, getDocs, orderBy, limit } =
      await import("../firebase.js");
    const q = query(
      collection(db, "users", uid, "consent_log"),
      where("type", "==", type),
      where("granted", "==", true),
      orderBy("timestamp", "desc"),
      limit(1)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (e) {
    return false;
  }
};
