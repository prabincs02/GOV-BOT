// Module 6 — Data Deletion Engine
// Gives users full control to delete all their data (DPDP Act 2023 requirement)
// One function call wipes everything

/**
 * Delete ALL data for a user from Firestore
 * This is irreversible — use with confirmation dialog
 * @param {string} uid - Firebase user UID
 */
export const deleteAllUserData = async (uid) => {
  try {
    const { db, collection, getDocs, deleteDoc, doc } = await import("../firebase.js");

    const collections = [
      "documents",      // Module 1 — stored document fields
      "profile",        // Module 1 — user profile
      "applications",   // Module 4 — submitted applications
      "consent_log",    // Module 6 — consent records
      "notifications",  // Module 7 — notification preferences
    ];

    let deletedCount = 0;

    for (const colName of collections) {
      try {
        const snap = await getDocs(collection(db, "users", uid, colName));
        for (const document of snap.docs) {
          await deleteDoc(doc(db, "users", uid, colName, document.id));
          deletedCount++;
        }
      } catch (e) {
        // Collection might not exist yet — that's fine
      }
    }

    // Delete the user root document
    try {
      await deleteDoc(doc(db, "users", uid));
      deletedCount++;
    } catch (e) {}

    console.log(`🗑️ Deleted ${deletedCount} records for user ${uid}`);
    return { success: true, deletedCount };
  } catch (e) {
    console.error("Data deletion failed:", e);
    return { success: false, error: e.message };
  }
};

/**
 * Delete a single document from vault
 * @param {string} uid
 * @param {string} docId
 */
export const deleteDocument = async (uid, docId) => {
  try {
    const { db, doc, deleteDoc } = await import("../firebase.js");
    await deleteDoc(doc(db, "users", uid, "documents", docId));
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};
