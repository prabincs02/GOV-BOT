// Module 2 — OCR Scanner UI
// Camera/file capture → preprocess → OCR → AI parse → show fields for confirmation
// Replaces manual field entry in DocumentVault with smart auto-fill

import { useState, useRef } from "react";
import { extractText } from "./utils/ocr.js";
import { detectDocumentType, parseDocumentFields, validateFields } from "./utils/documentParser.js";

export default function OCRScanner({ docType, lang, onFieldsExtracted, onCancel, colors }) {
  const [stage, setStage] = useState("capture"); // capture | processing | review | error
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [extractedFields, setExtractedFields] = useState({});
  const [editedFields, setEditedFields] = useState({});
  const [warnings, setWarnings] = useState([]);
  const [detectedType, setDetectedType] = useState(null);
  const fileRef = useRef(null);
  const c = colors || {};

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setStage("processing");
    setProgress(0);

    try {
      // Step 1: OCR
      const { text, confidence } = await extractText(file, lang || "en-IN", (pct, msg) => {
        setProgress(pct);
        setProgressMsg(msg);
      });

      setProgress(90);
      setProgressMsg("Understanding document...");

      // Step 2: Detect doc type
      const detected = detectDocumentType(text);
      setDetectedType(detected);
      const finalType = docType?.id || detected;

      // Step 3: AI parse fields
      const fields = await parseDocumentFields(text, finalType);

      // Step 4: Validate
      const warns = validateFields(fields, finalType);

      setProgress(100);
      setProgressMsg("Done!");

      if (Object.keys(fields).length === 0) {
        setStage("error");
        return;
      }

      setExtractedFields(fields);
      setEditedFields(fields);
      setWarnings(warns);
      setStage("review");

    } catch (e) {
      console.error("OCR failed:", e);
      setStage("error");
    }
  };

  const handleConfirm = () => {
    onFieldsExtracted(editedFields);
  };

  const updateField = (key, val) => {
    setEditedFields(prev => ({ ...prev, [key]: val }));
  };

  // Detect if device is likely mobile (has rear camera)
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  return (
    <div style={sc.wrap}>
      {/* STAGE: Capture */}
      {stage === "capture" && (
        <div style={sc.captureBox}>
          <div style={sc.scanIcon}>📄</div>
          <div style={{ ...sc.title, color: c.primary || "#6B21A8" }}>
            Scan {docType?.label || "Document"}
          </div>
          <div style={sc.sub}>
            {isMobile
              ? "Take a clear photo or upload from gallery."
              : "Upload a photo or scan of the document."}
            <br />Make sure the document is flat and well-lit.
          </div>

          <div style={sc.btnGroup}>
            {/* Camera — only show on mobile */}
            {isMobile && (
              <button
                style={{ ...sc.captureBtn, background: c.primary || "#6B21A8" }}
                onClick={() => { fileRef.current.setAttribute("capture", "environment"); fileRef.current.click(); }}
              >
                📷 Use Camera
              </button>
            )}
            {/* File upload — always shown, primary on desktop */}
            <button
              style={{ ...sc.captureBtn, background: isMobile ? "#f3f4f6" : (c.primary || "#6B21A8"), color: isMobile ? "#333" : "#fff" }}
              onClick={() => { fileRef.current.removeAttribute("capture"); fileRef.current.click(); }}
            >
              {isMobile ? "🖼️ Upload from Gallery" : "🖼️ Upload Document Image"}
            </button>
          </div>

          {!isMobile && (
            <div style={{ ...sc.tip, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534" }}>
              💻 <strong>On laptop?</strong> Scan the document with your phone camera, then transfer the image here — or use a scanner app.
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />

          <div style={sc.tip}>
            💡 <strong>Tip:</strong> Good lighting = better accuracy. Avoid shadows on the document.
          </div>

          <button style={sc.cancelLink} onClick={onCancel}>
            Skip — Enter manually instead
          </button>
        </div>
      )}

      {/* STAGE: Processing */}
      {stage === "processing" && (
        <div style={sc.processingBox}>
          {previewUrl && (
            <img src={previewUrl} alt="Document" style={sc.preview} />
          )}
          <div style={{ ...sc.title, color: c.primary || "#6B21A8", marginTop: 16 }}>
            Reading your document...
          </div>
          <div style={sc.progressTrack}>
            <div style={{ ...sc.progressFill, width: `${progress}%`, background: c.primary || "#6B21A8" }} />
          </div>
          <div style={sc.progressMsg}>{progressMsg}</div>
          <div style={sc.steps}>
            {[
              { pct: 15, label: "🔧 Enhancing image" },
              { pct: 40, label: "🔍 Reading text (OCR)" },
              { pct: 80, label: "🤖 AI extracting fields" },
              { pct: 95, label: "✅ Validating data" },
            ].map(s => (
              <div key={s.pct} style={{ ...sc.stepItem, opacity: progress >= s.pct ? 1 : 0.3 }}>
                {s.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STAGE: Review extracted fields */}
      {stage === "review" && (
        <div style={sc.reviewBox}>
          <div style={{ ...sc.title, color: c.primary || "#6B21A8" }}>
            ✅ Fields extracted! Please verify:
          </div>

          {warnings.length > 0 && (
            <div style={sc.warningBox}>
              {warnings.map((w, i) => <div key={i}>⚠️ {w}</div>)}
            </div>
          )}

          <div style={sc.fieldGrid}>
            {Object.entries(editedFields).map(([key, val]) => (
              <div key={key} style={sc.fieldWrap}>
                <label style={{ ...sc.fieldLabel, color: c.primary || "#6B21A8" }}>
                  {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </label>
                <input
                  style={sc.fieldInput}
                  value={val}
                  onChange={e => updateField(key, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div style={sc.privNote}>
            🔒 These fields will be encrypted before saving. Original photo is not stored.
          </div>

          <div style={sc.reviewBtns}>
            <button
              style={{ ...sc.confirmBtn, background: c.primary || "#6B21A8" }}
              onClick={handleConfirm}
            >
              ✅ Looks Good — Save
            </button>
            <button
              style={{ ...sc.retryBtn }}
              onClick={() => { setStage("capture"); setPreviewUrl(null); }}
            >
              🔄 Scan Again
            </button>
          </div>
        </div>
      )}

      {/* STAGE: Error */}
      {stage === "error" && (
        <div style={sc.errorBox}>
          <div style={{ fontSize: 48 }}>😕</div>
          <div style={sc.title}>Couldn't read the document clearly</div>
          <div style={sc.sub}>
            This can happen with blurry or low-light photos.
            Try again with better lighting, or enter details manually.
          </div>
          <div style={sc.reviewBtns}>
            <button
              style={{ ...sc.confirmBtn, background: c.primary || "#6B21A8" }}
              onClick={() => setStage("capture")}
            >
              📷 Try Again
            </button>
            <button style={sc.retryBtn} onClick={onCancel}>
              ✍️ Enter Manually
            </button>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Noto+Sans:wght@400;600;700&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
}

const sc = {
  wrap: { fontFamily: "'Noto Sans', sans-serif" },
  captureBox: { textAlign: "center", padding: "8px 0" },
  scanIcon: { fontSize: 52, marginBottom: 12 },
  title: { fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 18, marginBottom: 8 },
  sub: { color: "#888", fontSize: 13, lineHeight: 1.6, marginBottom: 20 },
  btnGroup: { display: "flex", gap: 12, justifyContent: "center", marginBottom: 16 },
  captureBtn: { padding: "12px 20px", borderRadius: 12, border: "none", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Noto Sans', sans-serif" },
  tip: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#92400e", marginBottom: 16 },
  cancelLink: { background: "none", border: "none", color: "#888", fontSize: 12, cursor: "pointer", textDecoration: "underline" },
  processingBox: { textAlign: "center", padding: "8px 0" },
  preview: { width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 12, border: "2px solid #e5e7eb" },
  progressTrack: { height: 8, background: "#f0f0f0", borderRadius: 4, overflow: "hidden", margin: "16px 0 8px" },
  progressFill: { height: "100%", borderRadius: 4, transition: "width 0.4s ease" },
  progressMsg: { fontSize: 13, color: "#888", marginBottom: 16 },
  steps: { display: "flex", flexDirection: "column", gap: 6, textAlign: "left" },
  stepItem: { fontSize: 12, color: "#555", transition: "opacity 0.4s" },
  reviewBox: { padding: "4px 0" },
  warningBox: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#92400e", marginBottom: 16, lineHeight: 1.8 },
  fieldGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 },
  fieldWrap: {},
  fieldLabel: { display: "block", fontWeight: 700, fontSize: 11, marginBottom: 4, textTransform: "uppercase" },
  fieldInput: { width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, fontFamily: "'Noto Sans', sans-serif", outline: "none", boxSizing: "border-box" },
  privNote: { fontSize: 11, color: "#16a34a", fontWeight: 700, marginBottom: 16 },
  reviewBtns: { display: "flex", gap: 10, flexDirection: "column" },
  confirmBtn: { padding: "12px", borderRadius: 12, border: "none", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" },
  retryBtn: { padding: "10px", borderRadius: 12, border: "2px solid #e5e7eb", background: "#fff", color: "#555", fontWeight: 700, fontSize: 13, cursor: "pointer" },
  errorBox: { textAlign: "center", padding: "16px 0" },
};
