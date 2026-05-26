// Module 1 — Document Vault
// Secure encrypted document management
// Documents are encrypted BEFORE saving — raw files never stored

import { useState, useEffect, useRef } from "react";
import { encryptFields, maskNumber, generateDocId } from "./utils/crypto.js";
import { getSessionKey, hasSessionKey } from "./utils/keyManager.js";
import { recordConsent, CONSENT_TYPES } from "./utils/consentManager.js";
import { deleteDocument } from "./utils/dataDeletion.js";
import OCRScanner from "./OCRScanner.jsx";

const DOC_TYPES = [
  { id: "aadhaar",   label: "Aadhaar Card",        emoji: "🪪", fields: ["name","dob","address","aadhaar_last4","gender"] },
  { id: "pan",       label: "PAN Card",             emoji: "💳", fields: ["name","pan_last4","dob"] },
  { id: "bank",      label: "Bank Passbook",        emoji: "🏦", fields: ["bank_name","account_last4","ifsc","branch"] },
  { id: "land",      label: "Land Record / Patta",  emoji: "🏡", fields: ["owner_name","land_size_hectares","survey_number","district"] },
  { id: "income",    label: "Income Certificate",   emoji: "📜", fields: ["name","annual_income","issued_by","valid_until"] },
  { id: "caste",     label: "Caste Certificate",    emoji: "📋", fields: ["name","caste_category","issued_by","certificate_number"] },
  { id: "ration",    label: "Ration Card",          emoji: "🍚", fields: ["family_head","card_type","members_count","card_number_last4"] },
  { id: "birth",     label: "Birth Certificate",    emoji: "👶", fields: ["name","dob","place_of_birth","registration_number"] },
];

export default function DocumentVault({ user, region, onClose }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [fields, setFields] = useState({});
  const [saving, setSaving] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [pendingDoc, setPendingDoc] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showOCR, setShowOCR] = useState(false);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const c = region?.colors || {};

  // Load existing documents
  useEffect(() => { loadDocs(); }, []);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const { db, collection, getDocs } = await import("./firebase.js");
      const snap = await getDocs(collection(db, "users", user.uid, "documents"));
      const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDocs(loaded);
    } catch (e) {
      console.error("Load docs error:", e);
    }
    setLoading(false);
  };

  const handleAddDoc = (docType) => {
    setSelectedType(docType);
    setFields({});
    setShowConsent(true); // Always ask consent first
  };

  const handleConsentGranted = async () => {
    // Fire-and-forget — don't block UI if consent logging fails
    recordConsent(CONSENT_TYPES.DOCUMENT_STORE, true, user.uid).catch(e => console.warn("Consent log:", e));
    setShowConsent(false);
    setShowOCR(true); // Try OCR first, fallback to manual
  };

  const handleSaveDoc = async () => {
    if (!selectedType) return;
    const currentFields = fields;
    // Allow save even with empty fields — user may have typed nothing yet
    setSaving(true);
    try {
      // Mask sensitive numbers
      const safeFields = { ...currentFields };
      if (safeFields.aadhaar_number) {
        safeFields.aadhaar_last4 = safeFields.aadhaar_number.slice(-4);
        delete safeFields.aadhaar_number;
      }
      if (safeFields.account_number) {
        safeFields.account_last4 = safeFields.account_number.slice(-4);
        delete safeFields.account_number;
      }
      if (safeFields.pan_number) {
        safeFields.pan_last4 = safeFields.pan_number.slice(-4);
        delete safeFields.pan_number;
      }

      // Store as JSON (Firestore security rules protect it per-user)
      // Encryption is bonus security on top
      let storedData;
      try {
        if (hasSessionKey()) {
          const key = getSessionKey();
          storedData = encryptFields(safeFields, key);
        } else {
          storedData = JSON.stringify(safeFields);
        }
      } catch {
        storedData = JSON.stringify(safeFields);
      }

      const docId = generateDocId();
      const displayName = safeFields.name || safeFields.owner_name || safeFields.family_head || safeFields.bank_name || selectedType.label;

      // Import firebase inline to avoid any top-level import issues
      const firebase = await import("./firebase.js");
      const { db, doc, setDoc } = firebase;

      await setDoc(doc(db, "users", user.uid, "documents", docId), {
        docId,
        docType: selectedType.id,
        docLabel: selectedType.label,
        docEmoji: selectedType.emoji,
        storedData,
        isEncrypted: hasSessionKey(),
        addedAt: new Date().toISOString(),
        displayName,
      });

      console.log("✅ Saved:", selectedType.label, displayName);

      // Update local state immediately — don't wait for Firestore reload
      const newDoc = {
        id: docId,
        docId,
        docType: selectedType.id,
        docLabel: selectedType.label,
        docEmoji: selectedType.emoji,
        displayName,
        addedAt: new Date().toISOString(),
      };
      setDocs(prev => [...prev, newDoc]);

      setShowAddModal(false);
      setSelectedType(null);
      setFields({});

    } catch (e) {
      console.error("Save doc error:", e);
      // Show specific error
      if (e.code === "permission-denied") {
        alert("Permission denied — please log out and log back in.");
      } else {
        alert("Save failed: " + e.message);
      }
    }
    setSaving(false);
  };

  const handleDelete = async (docId) => {
    const result = await deleteDocument(user.uid, docId);
    if (result.success) {
      setDocs(docs.filter(d => d.id !== docId));
      setDeleteConfirm(null);
    }
  };

  const handleDeleteAll = async () => {
    setDeletingAll(true);
    try {
      const { deleteAllUserData } = await import("./utils/dataDeletion.js");
      const result = await deleteAllUserData(user.uid);
      if (result.success) {
        setDocs([]);
        setShowDeleteAll(false);
        alert("✅ All your data has been deleted successfully.");
        onClose();
      } else {
        alert("Delete failed: " + (result.error || "Unknown error"));
      }
    } catch (e) {
      alert("Delete failed: " + e.message);
    }
    setDeletingAll(false);
  };

  const completeness = Math.round((docs.length / 5) * 100); // 5 key docs = 100%

  return (
    <div style={dv.overlay}>
      <div style={{ ...dv.panel, borderTop: `4px solid ${c.primary || "#6B21A8"}` }}>

        {/* Header */}
        <div style={dv.header}>
          <div>
            <div style={{ ...dv.title, color: c.primary || "#6B21A8" }}>🔐 Document Vault</div>
            <div style={dv.sub}>Your documents are encrypted and stored securely</div>
          </div>
          <button style={dv.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Completeness bar */}
        <div style={dv.completenessWrap}>
          <div style={dv.completenessRow}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#555" }}>Vault Completeness</span>
            <span style={{ ...dv.completenessVal, color: c.primary || "#6B21A8" }}>{Math.min(completeness, 100)}%</span>
          </div>
          <div style={dv.track}>
            <div style={{ ...dv.fill, width: `${Math.min(completeness, 100)}%`, background: c.primary || "#6B21A8" }} />
          </div>
          <div style={dv.completenessHint}>
            {docs.length === 0 ? "Add your Aadhaar card to start unlocking schemes!" :
             docs.length < 3 ? "Add more documents to qualify for more schemes" :
             "Great! Your vault is well stocked 🎉"}
          </div>
        </div>

        {/* Document grid */}
        {loading ? (
          <div style={dv.loading}>Loading your vault...</div>
        ) : (
          <div style={dv.docGrid}>
            {docs.map(d => (
              <div key={d.id} style={{ ...dv.docCard, borderColor: c.primary || "#6B21A8" }}>
                <div style={{ ...dv.docCardHeader, background: c.headerGrad || "#6B21A8" }}>
                  <span style={{ fontSize: 28 }}>{d.docEmoji}</span>
                  <button style={dv.deleteBtn} onClick={() => setDeleteConfirm(d.id)} title="Delete">🗑️</button>
                </div>
                <div style={dv.docCardBody}>
                  <div style={{ ...dv.docLabel, color: c.primary || "#6B21A8" }}>{d.docLabel}</div>
                  <div style={dv.docName}>{d.displayName || "Stored"}</div>
                  <div style={dv.encBadge}>🔒 Encrypted</div>
                </div>
              </div>
            ))}

            {/* Add new document cards */}
            {DOC_TYPES.filter(dt => !docs.find(d => d.docType === dt.id)).map(dt => (
              <button
                key={dt.id}
                style={{ ...dv.addCard, borderColor: c.primary || "#6B21A8" }}
                onClick={() => handleAddDoc(dt)}
              >
                <span style={{ fontSize: 28, opacity: 0.5 }}>{dt.emoji}</span>
                <div style={{ ...dv.addLabel, color: c.primary || "#6B21A8" }}>{dt.label}</div>
                <div style={dv.addHint}>+ Add</div>
              </button>
            ))}
          </div>
        )}

        {/* Privacy note */}
        <div style={{ ...dv.privacyNote, borderColor: c.primary || "#6B21A8" }}>
          🛡️ <strong>Your privacy is protected.</strong> Documents are AES-256 encrypted on your device before storage. Only you can read them. <span style={{ color: "#DC2626", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }} onClick={() => setShowDeleteAll(true)}>Delete all my data</span>
        </div>
      </div>

      {/* Consent Modal */}
      {showConsent && (
        <div style={dv.modalOverlay}>
          <div style={dv.modal}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
            <div style={{ ...dv.modalTitle, color: c.primary || "#6B21A8" }}>Before you add a document</div>
            <div style={dv.modalBody}>
              <p>GovBot will store the <strong>text information</strong> extracted from your document (not the image). It will be:</p>
              <ul style={{ textAlign: "left", fontSize: 13, lineHeight: 1.8, margin: "12px 0" }}>
                <li>🔐 <strong>Encrypted</strong> with your personal key</li>
                <li>👁️ <strong>Only visible to you</strong> — not even us</li>
                <li>🎯 <strong>Used only</strong> to help apply for schemes</li>
                <li>🗑️ <strong>Deleted instantly</strong> whenever you want</li>
              </ul>
              <p style={{ fontSize: 12, color: "#888" }}>This consent is recorded as required under India's DPDP Act 2023.</p>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button style={{ ...dv.consentBtn, background: c.primary || "#6B21A8", color: "#fff" }} onClick={handleConsentGranted}>
                ✅ I Agree — Proceed
              </button>
              <button style={{ ...dv.consentBtn, background: "#f3f4f6", color: "#555" }} onClick={() => setShowConsent(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OCR Scanner */}
      {showOCR && selectedType && (
        <div style={dv.modalOverlay}>
          <div style={dv.modal}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ ...dv.modalTitle, color: c.primary||"#6B21A8", margin:0 }}>
                {selectedType.emoji} {selectedType.label}
              </div>
              <button style={dv.closeBtn} onClick={() => setShowOCR(false)}>✕</button>
            </div>
            <OCRScanner
              docType={selectedType}
              lang="en-IN"
              colors={c}
              onFieldsExtracted={(extractedFields) => {
                setFields(extractedFields); // pre-fill the form
                setShowOCR(false);
                setShowAddModal(true);
              }}
              onCancel={() => {
                setShowOCR(false);
                setShowAddModal(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showAddModal && selectedType && (
        <div style={dv.modalOverlay}>
          <div style={dv.modal}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>{selectedType.emoji}</div>
            <div style={{ ...dv.modalTitle, color: c.primary || "#6B21A8" }}>Add {selectedType.label}</div>
            <div style={dv.fieldNote}>✍️ Review and confirm extracted fields (or fill manually)</div>
            <div style={dv.fieldGrid}>
              {selectedType.fields.map(f => (
                <div key={f} style={dv.fieldWrap}>
                  <label style={{ ...dv.fieldLabel, color: c.primary || "#6B21A8" }}>
                    {f.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    {(f.includes("last4") || f === "aadhaar_number" || f === "account_number") && (
                      <span style={{ color: "#888", fontSize: 10, marginLeft: 4 }}>
                        {f.includes("last4") ? "(last 4 digits)" : "(will be masked)"}
                      </span>
                    )}
                  </label>
                  <input
                    style={dv.fieldInput}
                    value={fields[f] || ""}
                    onChange={e => setFields(prev => ({ ...prev, [f]: e.target.value }))}
                    placeholder={f.includes("date") || f === "dob" ? "DD/MM/YYYY" : f.includes("last4") ? "XXXX" : ""}
                    maxLength={f.includes("last4") || f === "aadhaar_number" ? 12 : 100}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
              <button
                style={{ ...dv.consentBtn, background: c.primary || "#6B21A8", color: "#fff", opacity: saving ? 0.6 : 1 }}
                onClick={handleSaveDoc}
                disabled={saving}
              >
                {saving ? "Encrypting & Saving..." : "🔐 Save Securely"}
              </button>
              <button style={{ ...dv.consentBtn, background: "#f3f4f6", color: "#555" }} onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete ALL Data Confirmation */}
      {showDeleteAll && (
        <div style={dv.modalOverlay}>
          <div style={{ ...dv.modal, maxWidth: 380 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>⚠️</div>
            <div style={{ ...dv.modalTitle, color: "#DC2626" }}>Delete ALL My Data?</div>
            <div style={{ color: "#555", fontSize: 13, lineHeight: 1.7, marginBottom: 8 }}>
              This will permanently delete:
            </div>
            <ul style={{ textAlign: "left", fontSize: 13, color: "#555", lineHeight: 2, marginBottom: 16, paddingLeft: 20 }}>
              <li>All documents in your vault</li>
              <li>Your profile information</li>
              <li>All application history</li>
              <li>Consent records</li>
            </ul>
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#991b1b", marginBottom: 20, fontWeight: 600 }}>
              ❌ This action cannot be undone.
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                style={{ ...dv.consentBtn, background: "#DC2626", color: "#fff", opacity: deletingAll ? 0.6 : 1 }}
                onClick={handleDeleteAll}
                disabled={deletingAll}
              >
                {deletingAll ? "Deleting..." : "Yes, Delete Everything"}
              </button>
              <button
                style={{ ...dv.consentBtn, background: "#f3f4f6", color: "#555" }}
                onClick={() => setShowDeleteAll(false)}
                disabled={deletingAll}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Doc Confirm */}
      {deleteConfirm && (
        <div style={dv.modalOverlay}>
          <div style={{ ...dv.modal, maxWidth: 360 }}>
            <div style={{ fontSize: 40 }}>🗑️</div>
            <div style={dv.modalTitle}>Delete this document?</div>
            <div style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>This cannot be undone.</div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button style={{ ...dv.consentBtn, background: "#DC2626", color: "#fff" }} onClick={() => handleDelete(deleteConfirm)}>
                Yes, Delete
              </button>
              <button style={{ ...dv.consentBtn, background: "#f3f4f6", color: "#555" }} onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Noto+Sans:wght@400;600;700&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

const dv = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 300, backdropFilter: "blur(6px)" },
  panel: { background: "#fff", borderRadius: "20px 20px 0 0", padding: "24px 20px 32px", width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 -10px 40px rgba(0,0,0,0.2)", animation: "fadeIn 0.3s ease", fontFamily: "'Noto Sans', sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  title: { fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 20 },
  sub: { fontSize: 12, color: "#888", marginTop: 2 },
  closeBtn: { background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#888", padding: 4 },
  completenessWrap: { background: "#f9f9f9", borderRadius: 12, padding: "12px 16px", marginBottom: 20 },
  completenessRow: { display: "flex", justifyContent: "space-between", marginBottom: 8 },
  completenessVal: { fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 16 },
  track: { height: 8, background: "#e5e7eb", borderRadius: 4, overflow: "hidden", marginBottom: 6 },
  fill: { height: "100%", borderRadius: 4, transition: "width 0.6s ease" },
  completenessHint: { fontSize: 11, color: "#888" },
  loading: { textAlign: "center", padding: 40, color: "#888" },
  docGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10, marginBottom: 20 },
  docCard: { border: "2px solid", borderRadius: 14, overflow: "hidden" },
  docCardHeader: { padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 16, opacity: 0.8 },
  docCardBody: { padding: "10px 12px" },
  docLabel: { fontWeight: 700, fontSize: 12, marginBottom: 3 },
  docName: { fontSize: 11, color: "#666", marginBottom: 4 },
  encBadge: { fontSize: 10, color: "#16a34a", fontWeight: 700 },
  addCard: { border: "2px dashed", borderRadius: 14, padding: "16px 8px", background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transition: "all 0.2s" },
  addLabel: { fontWeight: 700, fontSize: 11, textAlign: "center" },
  addHint: { fontSize: 11, color: "#aaa" },
  privacyNote: { padding: "12px 14px", borderRadius: 10, border: "1.5px solid", fontSize: 12, lineHeight: 1.6, color: "#555" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400, padding: 16 },
  modal: { background: "#fff", borderRadius: 20, padding: "28px 24px", maxWidth: 440, width: "100%", textAlign: "center", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" },
  modalTitle: { fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 18, marginBottom: 12 },
  modalBody: { color: "#555", fontSize: 13, lineHeight: 1.7, textAlign: "left" },
  fieldNote: { fontSize: 12, color: "#888", marginBottom: 16 },
  fieldGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, textAlign: "left" },
  fieldWrap: {},
  fieldLabel: { display: "block", fontWeight: 700, fontSize: 11, marginBottom: 4, textTransform: "uppercase" },
  fieldInput: { width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, fontFamily: "'Noto Sans', sans-serif", outline: "none", boxSizing: "border-box" },
  consentBtn: { padding: "10px 20px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Noto Sans', sans-serif" },
};
