// Module 8 — Apply Now Flow
// Checks document readiness → guides upload → confirms → opens portal
// Covers both national schemes (SCHEME_RULES) and state schemes (STATE_PORTALS)

import { useState, useEffect } from "react";
import { SCHEME_RULES } from "./utils/eligibilityRules.js";
import { isEligibleFor } from "./utils/eligibilityChecker.js";

const DOC_LABELS = {
  aadhaar: { label: "Aadhaar Card",        emoji: "🪪" },
  pan:     { label: "PAN Card",            emoji: "💳" },
  bank:    { label: "Bank Passbook",       emoji: "🏦" },
  land:    { label: "Land Record",         emoji: "🏡" },
  income:  { label: "Income Certificate",  emoji: "📜" },
  caste:   { label: "Caste Certificate",   emoji: "📋" },
  ration:  { label: "Ration Card",         emoji: "🍚" },
  birth:   { label: "Birth Certificate",   emoji: "👶" },
};

// ── State scheme portal database ──────────────────────────────────────────────
// Maps fuzzy scheme name patterns → { portal, helpline, requiredDocs }
const STATE_PORTALS = [
  // Tamil Nadu
  { pattern: /kalaignar magalir|magalir urimai/i,        portal: "https://cmis.tn.gov.in",             helpline: "1800-425-1213", docs: ["aadhaar","bank"] },
  { pattern: /breakfast scheme|cm.?s breakfast/i,        portal: "https://www.tn.gov.in",              helpline: "044-28411415",  docs: ["aadhaar"] },
  { pattern: /amma unavagam/i,                           portal: "https://www.tn.gov.in",              helpline: "044-28411415",  docs: ["aadhaar"] },
  { pattern: /tn.*health insurance|comprehensive health/i,portal: "https://www.cmchistn.com",           helpline: "044-28592828",  docs: ["aadhaar","ration","income"] },
  { pattern: /moovalur|marriage assistance.*tn/i,        portal: "https://www.tn.gov.in/scheme",       helpline: "044-28411415",  docs: ["aadhaar","bank","birth","caste"] },
  { pattern: /annai theresa|maternity benefit.*tn/i,     portal: "https://www.tn.gov.in",              helpline: "104",           docs: ["aadhaar","bank"] },
  { pattern: /tn.*laptop|free laptop/i,                  portal: "https://www.tn.gov.in",              helpline: "044-28411415",  docs: ["aadhaar"] },
  { pattern: /tn.*solar|cm solar/i,                      portal: "https://www.teda.in",                helpline: "044-23452943",  docs: ["aadhaar","land","bank"] },
  { pattern: /pudhumai penn/i,                           portal: "https://pudhumaipenn.tn.gov.in",     helpline: "1800-425-1213", docs: ["aadhaar","bank"] },
  { pattern: /tn.*free bus|bus pass.*tn/i,               portal: "https://www.tn.gov.in",              helpline: "044-28592828",  docs: ["aadhaar"] },

  // Kerala
  { pattern: /karunya/i,                                 portal: "https://karunyakerala.org",          helpline: "0471-2330318",  docs: ["aadhaar","bank","income"] },
  { pattern: /aardram/i,                                 portal: "https://aardram.kerala.gov.in",      helpline: "104",           docs: ["aadhaar"] },
  { pattern: /snehapoorvam/i,                            portal: "https://swd.kerala.gov.in",          helpline: "0471-2303310",  docs: ["aadhaar","bank"] },
  { pattern: /kudumbashree/i,                            portal: "https://www.kudumbashree.org",       helpline: "0484-2316901",  docs: ["aadhaar","bank"] },
  { pattern: /life mission.*kerala|kerala.*life mission/i,portal: "https://lifemission.kerala.gov.in",helpline: "1800-425-1550", docs: ["aadhaar","bank","income"] },

  // Karnataka
  { pattern: /anna bhagya/i,                             portal: "https://ahara.kar.nic.in",           helpline: "1967",          docs: ["aadhaar","ration"] },
  { pattern: /gruha jyothi/i,                            portal: "https://gruhajyothi.karnataka.gov.in",helpline: "1912",         docs: ["aadhaar","bank"] },
  { pattern: /gruha lakshmi/i,                           portal: "https://gruhajyothi.karnataka.gov.in",helpline: "1800-425-9339",docs: ["aadhaar","bank"] },
  { pattern: /yuva nidhi/i,                              portal: "https://sevasindhu.karnataka.gov.in",helpline: "080-22230282",  docs: ["aadhaar","bank"] },
  { pattern: /shakti.*scheme|shakti.*bus/i,              portal: "https://sevasindhu.karnataka.gov.in",helpline: "080-22230282",  docs: ["aadhaar"] },
  { pattern: /rajiv gandhi housing.*karnataka/i,         portal: "https://ashraya.karnataka.gov.in",  helpline: "080-22228001",  docs: ["aadhaar","bank","income"] },
  { pattern: /arivu|education loan.*karnataka/i,         portal: "https://sevasindhu.karnataka.gov.in",helpline: "080-22230282",  docs: ["aadhaar","bank","income","caste"] },

  // Andhra Pradesh
  { pattern: /ysr rythu bharosa/i,                       portal: "https://apagrisnet.gov.in",          helpline: "1902",          docs: ["aadhaar","bank","land"] },
  { pattern: /ysr aarogyasri|aarogyasri.*ap/i,           portal: "https://aarogyasri.ap.gov.in",       helpline: "104",           docs: ["aadhaar","ration","income"] },
  { pattern: /ysr pension kanuka/i,                      portal: "https://navasakam.ap.gov.in",        helpline: "1100",          docs: ["aadhaar","bank"] },
  { pattern: /jagananna ammavodi/i,                      portal: "https://ammavodi.ap.gov.in",         helpline: "1902",          docs: ["aadhaar","bank"] },
  { pattern: /vidya deevena/i,                           portal: "https://jaganannavidyadeevena.ap.gov.in",helpline: "1902",      docs: ["aadhaar","bank","income"] },
  { pattern: /ysr cheyutha/i,                            portal: "https://cheyutha.ap.gov.in",         helpline: "1902",          docs: ["aadhaar","bank","caste"] },
  { pattern: /ysr housing|ap.*housing/i,                 portal: "https://housing.ap.gov.in",          helpline: "1902",          docs: ["aadhaar","bank","income"] },
  { pattern: /jagananna thodu/i,                         portal: "https://thodu.ap.gov.in",            helpline: "1902",          docs: ["aadhaar","bank"] },
  { pattern: /vasathi deevena/i,                         portal: "https://jaganannavidyadeevena.ap.gov.in",helpline: "1902",      docs: ["aadhaar","bank"] },

  // Telangana
  { pattern: /rythu bandhu/i,                            portal: "https://rythubandhu.telangana.gov.in",helpline: "1902",         docs: ["aadhaar","bank","land"] },
  { pattern: /rythu bima/i,                              portal: "https://rythubandhu.telangana.gov.in",helpline: "1902",         docs: ["aadhaar","bank","land"] },
  { pattern: /arogyasri.*telangana|ts.*arogyasri/i,      portal: "https://arogyasri.telangana.gov.in",helpline: "104",           docs: ["aadhaar","ration","income"] },
  { pattern: /kalyana lakshmi|shaadi mubarak/i,          portal: "https://telanganaepass.cgg.gov.in", helpline: "040-23390228",  docs: ["aadhaar","bank","birth","caste"] },
  { pattern: /kcr kit|mother.*child.*kit/i,              portal: "https://cheyutha.telangana.gov.in", helpline: "104",           docs: ["aadhaar","bank"] },
  { pattern: /double bedroom|2bhk.*telangana/i,          portal: "https://2bhk.telangana.gov.in",     helpline: "040-23390228",  docs: ["aadhaar","bank","income"] },

  // Maharashtra
  { pattern: /mahatma jyotirao phule|jan arogya.*maha/i, portal: "https://www.jeevandayee.gov.in",    helpline: "1800-233-2200", docs: ["aadhaar","ration","income"] },
  { pattern: /atal ahar/i,                               portal: "https://mahaonline.gov.in",         helpline: "1800-120-8040", docs: ["aadhaar"] },
  { pattern: /maharashtra gharkul/i,                     portal: "https://mahaonline.gov.in",         helpline: "022-22025050",  docs: ["aadhaar","bank","income","caste"] },
  { pattern: /shubh mangal|inter.?caste.*marriage/i,     portal: "https://mahaonline.gov.in",         helpline: "022-22025050",  docs: ["aadhaar","bank","birth","caste"] },
  { pattern: /rajarshi shahu.*scholarship/i,             portal: "https://mahadbt.maharashtra.gov.in",helpline: "022-49150800",  docs: ["aadhaar","bank","income","caste"] },

  // Gujarat
  { pattern: /mukhyamantri amrutam|ma yojana/i,          portal: "https://www.magujarat.com",         helpline: "1800-233-1022", docs: ["aadhaar","ration","income"] },
  { pattern: /kisan suryoday/i,                          portal: "https://www.gujaratenergy.gov.in",  helpline: "1800-233-3788", docs: ["aadhaar","bank","land"] },
  { pattern: /ikhedut/i,                                 portal: "https://ikhedut.gujarat.gov.in",    helpline: "1800-180-6127", docs: ["aadhaar","bank","land"] },

  // Generic fallbacks
  { pattern: /housing|awas|grih/i,                       portal: "https://pmayg.nic.in",              helpline: "1800-11-6446",  docs: ["aadhaar","bank","income"] },
  { pattern: /health|arogya|swasthya/i,                  portal: "https://pmjay.gov.in",              helpline: "14555",         docs: ["aadhaar","ration"] },
  { pattern: /scholarship|vidhyarthi|chatravritti/i,     portal: "https://scholarships.gov.in",       helpline: "0120-6619540",  docs: ["aadhaar","bank","income","caste"] },
  { pattern: /pension|vriddhavastha/i,                   portal: "https://nsap.nic.in",               helpline: "1800-11-1555",  docs: ["aadhaar","bank"] },
  { pattern: /farmer|kisan|kisaan|rythu|raitu|raithu/i,  portal: "https://pmkisan.gov.in",            helpline: "155261",        docs: ["aadhaar","bank","land"] },
];

// Look up a scheme by name — checks SCHEME_RULES first, then STATE_PORTALS
function findScheme(schemeName, schemeId) {
  // 1. Exact match in SCHEME_RULES
  const rule = SCHEME_RULES.find(s =>
    s.id === schemeId ||
    s.name.toLowerCase().includes((schemeName || "").toLowerCase()) ||
    (schemeName || "").toLowerCase().includes(s.name.toLowerCase())
  );
  if (rule) return { ...rule, isStateScheme: false };

  // 2. Fuzzy match in STATE_PORTALS
  const name = schemeName || "";
  const stateMatch = STATE_PORTALS.find(sp => sp.pattern.test(name));
  if (stateMatch) {
    return {
      name: schemeName,
      emoji: "🏛️",
      benefit: "",
      portal: stateMatch.portal,
      helpline: stateMatch.helpline,
      requiredDocs: stateMatch.docs,
      isStateScheme: true,
    };
  }

  return null;
}

export default function ApplyFlow({ schemeName, schemeId, user, region, vaultDocs, onClose, onGoToVault, onOpenTracker }) {
  const [step, setStep] = useState("check");
  const [scheme, setScheme] = useState(null);
  const [missingDocs, setMissingDocs] = useState([]);
  const [presentDocs, setPresentDocs] = useState([]);
  const c = region?.colors || {};

  useEffect(() => {
    const found = findScheme(schemeName, schemeId);
    if (found) {
      setScheme(found);
      checkDocs(found);
    } else {
      setStep("noscheme");
    }
  }, [schemeId, schemeName]);

  const checkDocs = (s) => {
    const owned = vaultDocs.map(d => d.docType);
    const missing = (s.requiredDocs || []).filter(d => !owned.includes(d));
    const present = (s.requiredDocs || []).filter(d => owned.includes(d));
    setMissingDocs(missing);
    setPresentDocs(present);
    setTimeout(() => setStep(missing.length === 0 ? "ready" : "missing"), 600);
  };

  if (!scheme && step !== "noscheme") {
    return (
      <div style={af.wrap}>
        <div style={af.checking}>
          <div style={{ fontSize: 32 }}>🔍</div>
          <div style={{ color: c.primary || "#6B21A8", fontWeight: 700, marginTop: 8 }}>Checking your documents...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={af.wrap}>
      <div style={{ ...af.card, borderTop: `3px solid ${c.primary || "#6B21A8"}` }}>

        {/* Header */}
        <div style={af.header}>
          <div>
            <div style={{ ...af.title, color: c.primary || "#6B21A8" }}>
              {scheme?.emoji} Apply — {scheme?.name || schemeName}
            </div>
            {scheme?.benefit && <div style={af.sub}>{scheme.benefit}</div>}
          </div>
          <button style={af.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* STEP: Checking */}
        {step === "check" && (
          <div style={af.center}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>⏳</div>
            <div style={{ color: "#888" }}>Checking your vault...</div>
          </div>
        )}

        {/* STEP: All docs ready */}
        {step === "ready" && (
          <div>
            <div style={{ ...af.successBanner, background: c.headerGrad || "#6B21A8" }}>
              <div style={{ fontSize: 36 }}>✅</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>You're ready to apply!</div>
                <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>All required documents are in your vault</div>
              </div>
            </div>

            <div style={af.docList}>
              <div style={af.sectionLabel}>📂 Documents ready:</div>
              {presentDocs.map(d => (
                <div key={d} style={af.docRow}>
                  <span>{DOC_LABELS[d]?.emoji} {DOC_LABELS[d]?.label}</span>
                  <span style={{ color: "#16a34a", fontWeight: 700 }}>✅ In vault</span>
                </div>
              ))}
            </div>

            <div style={af.previewBox}>
              <div style={af.sectionLabel}>📋 What will be submitted:</div>
              <div style={{ fontSize: 12, color: "#555", lineHeight: 1.8 }}>
                • Your name and Aadhaar details<br/>
                • Bank account for benefit transfer<br/>
                • Supporting documents from vault<br/>
                • Application will be submitted to: <strong>{scheme?.portal}</strong>
              </div>
            </div>

            <div style={af.actions}>
              <button
                style={{ ...af.applyBtn, background: c.primary || "#6B21A8" }}
                onClick={() => setStep("confirm")}
              >
                🚀 Proceed to Apply
              </button>
              <a href={scheme?.portal} target="_blank" rel="noopener noreferrer"
                style={{ ...af.portalLink, color: c.primary || "#6B21A8" }}>
                🌐 Visit official portal directly →
              </a>
            </div>
          </div>
        )}

        {/* STEP: Missing docs */}
        {step === "missing" && (
          <div>
            <div style={af.missingBanner}>
              <div style={{ fontSize: 30 }}>📋</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#92400e" }}>
                  {missingDocs.length} document{missingDocs.length > 1 ? "s" : ""} needed
                </div>
                <div style={{ fontSize: 12, color: "#a16207", marginTop: 2 }}>
                  Add these to your vault to apply online, or apply manually on the portal
                </div>
              </div>
            </div>

            {presentDocs.length > 0 && (
              <div style={af.docList}>
                <div style={af.sectionLabel}>✅ Already have:</div>
                {presentDocs.map(d => (
                  <div key={d} style={af.docRow}>
                    <span>{DOC_LABELS[d]?.emoji} {DOC_LABELS[d]?.label}</span>
                    <span style={{ color: "#16a34a", fontWeight: 700, fontSize: 12 }}>Ready</span>
                  </div>
                ))}
              </div>
            )}

            <div style={af.docList}>
              <div style={af.sectionLabel}>❌ Still needed:</div>
              {missingDocs.map(d => (
                <div key={d} style={{ ...af.docRow, background: "#fef9c3", borderRadius: 8, padding: "8px 12px", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{DOC_LABELS[d]?.emoji} {DOC_LABELS[d]?.label}</div>
                    <div style={{ fontSize: 11, color: "#78350f", marginTop: 2 }}>
                      {d === "aadhaar" && "Available at nearest Aadhaar centre or UIDAI.gov.in"}
                      {d === "bank" && "Collect from your bank branch — shows account details"}
                      {d === "income" && "Issue from Tehsildar / BDO / Taluk office"}
                      {d === "caste" && "Issue from Tahsildar / Mandal Revenue Officer"}
                      {d === "ration" && "Apply via Food Department or ration card portal"}
                      {d === "land" && "Available at Sub-Registrar or Revenue Department office"}
                      {d === "birth" && "Available at local Municipal/Gram Panchayat office"}
                      {d === "pan" && "Apply free at incometax.gov.in or nearest PAN centre"}
                    </div>
                  </div>
                  <span style={{ color: "#d97706", fontWeight: 700, fontSize: 11, flexShrink: 0, marginLeft: 8 }}>Missing</span>
                </div>
              ))}
            </div>

            <div style={af.actions}>
              <button
                style={{ ...af.applyBtn, background: c.primary || "#6B21A8" }}
                onClick={() => { onClose(); onGoToVault(); }}
              >
                🔐 Add Missing Docs to Vault
              </button>
              {/* Always show direct portal link even when docs are missing */}
              <a href={scheme?.portal} target="_blank" rel="noopener noreferrer"
                style={{ ...af.applyBtn, background: "#059669", textDecoration: "none", textAlign: "center" }}>
                🌐 Apply Directly on Official Portal →
              </a>
              {scheme?.helpline && (
                <div style={{ textAlign: "center", fontSize: 12, color: "#666" }}>
                  📞 Helpline: <strong>{scheme.helpline}</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP: Confirm before submit */}
        {step === "confirm" && (
          <div>
            <div style={af.confirmBox}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📤</div>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8 }}>Confirm Application</div>
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.8, marginBottom: 16 }}>
                You're about to open <strong>{scheme?.portal}</strong> to apply for <strong>{scheme?.name}</strong>.
                Your documents are ready in the vault.
              </div>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 20 }}>
                💡 We'll open the official government portal in a new tab. Carry your documents when visiting.
              </div>
            </div>
            <div style={af.actions}>
              <a
                href={scheme?.portal}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...af.applyBtn, background: c.primary || "#6B21A8", textDecoration: "none", textAlign: "center" }}
                onClick={() => setStep("submitted")}
              >
                ✅ Open Official Portal →
              </a>
              <button style={{ ...af.portalLink, background: "none", border: "none", cursor: "pointer", color: "#888" }}
                onClick={() => setStep("ready")}>
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* STEP: Submitted */}
        {step === "submitted" && (
          <div style={af.center}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: c.primary || "#6B21A8", marginBottom: 8 }}>
              Portal opened!
            </div>
            <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7, marginBottom: 16 }}>
              Complete your application on the portal.<br/>
              Keep your <strong>reference number</strong> safe after submitting.
            </div>
            {scheme?.helpline && (
              <div style={af.helpline}>📞 Helpline: <strong>{scheme.helpline}</strong></div>
            )}
            <div style={{ background: "#f8f4ff", borderRadius: 12, padding: "12px 14px", marginBottom: 16, width: "100%", boxSizing: "border-box" }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: c.primary || "#6B21A8", marginBottom: 4 }}>📋 Track your application</div>
              <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>Save your reference number and track status in the Application Tracker.</div>
            </div>
            <div style={{ display: "flex", gap: 8, width: "100%" }}>
              {onOpenTracker && (
                <button style={{ ...af.applyBtn, background: "#059669", flex: 1 }}
                  onClick={() => { onClose(); onOpenTracker(scheme?.name || schemeName); }}>
                  📋 Track It
                </button>
              )}
              <button style={{ ...af.applyBtn, background: c.primary || "#6B21A8", flex: 1 }} onClick={onClose}>
                Done ✓
              </button>
            </div>
          </div>
        )}

        {/* STEP: No scheme matched — generic helpful guide with all major portals */}
        {step === "noscheme" && (
          <div style={{ padding: "16px" }}>
            <div style={{ ...af.successBanner, background: "linear-gradient(135deg, #7c3aed, #6d28d9)", borderRadius: 12, marginBottom: 14 }}>
              <div style={{ fontSize: 32 }}>🏛️</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>How to Apply</div>
                <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>{schemeName}</div>
              </div>
            </div>

            <div style={{ background: "#f8f4ff", borderRadius: 12, padding: "14px", marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: "#6B21A8" }}>📋 General Application Steps:</div>
              {[
                { icon: "1️⃣", text: "Visit the official state/central government portal (links below)" },
                { icon: "2️⃣", text: "Carry Aadhaar card, bank passbook, and relevant documents" },
                { icon: "3️⃣", text: "Fill the application form with your personal and family details" },
                { icon: "4️⃣", text: "Submit documents and collect the acknowledgement slip" },
                { icon: "5️⃣", text: "Track your application status using the reference number" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 13 }}>
                  <span style={{ flexShrink: 0 }}>{s.icon}</span>
                  <span style={{ color: "#444", lineHeight: 1.5 }}>{s.text}</span>
                </div>
              ))}
            </div>

            {/* Quick-access portal links */}
            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: "#0369a1", marginBottom: 8 }}>🌐 Direct Portal Links</div>
              {[
                { label: "India Services Portal", url: "https://services.india.gov.in", icon: "🏛️" },
                { label: "UMANG App (200+ services)", url: "https://www.umang.gov.in", icon: "📱" },
                { label: "National Scholarship Portal", url: "https://scholarships.gov.in", icon: "🎓" },
                { label: "PM-KISAN (Farmers)", url: "https://pmkisan.gov.in", icon: "🌾" },
                { label: "Ayushman Bharat (Health)", url: "https://pmjay.gov.in", icon: "🏥" },
                { label: "PM Awas Yojana (Housing)", url: "https://pmayg.nic.in", icon: "🏠" },
                { label: "MUDRA Loans (Business)", url: "https://www.mudra.org.in", icon: "💼" },
                { label: "Common Service Centres", url: "https://www.csc.gov.in", icon: "🏪" },
              ].map((p, i) => (
                <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", fontSize: 12, color: "#0369a1", textDecoration: "none", borderBottom: i < 7 ? "1px solid #e0f2fe" : "none" }}>
                  <span>{p.icon}</span>
                  <span style={{ fontWeight: 600 }}>{p.label}</span>
                  <span style={{ marginLeft: "auto", opacity: 0.5 }}>→</span>
                </a>
              ))}
            </div>

            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: "#92400e", marginBottom: 6 }}>⏰ Application Windows</div>
              <div style={{ fontSize: 12, color: "#78350f", lineHeight: 1.7 }}>
                • <strong>State schemes</strong> — Usually open Apr–Jun and Oct–Dec<br/>
                • <strong>Agricultural schemes</strong> — Apply before sowing season (Jun–Jul)<br/>
                • <strong>Scholarship schemes</strong> — Open Aug–Nov for the academic year<br/>
                • <strong>Year-round schemes</strong> — PM-KISAN, Jan Dhan, MUDRA anytime
              </div>
            </div>

            <div style={af.actions}>
              <button style={{ ...af.portalLink, background: "none", border: "none", cursor: "pointer", color: "#888", marginTop: 4 }}
                onClick={onClose}>Close</button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

const af = {
  wrap: { marginTop: 12, fontFamily: "'Noto Sans', sans-serif" },
  card: { background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", animation: "fadeIn 0.3s ease" },
  header: { padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #f0f0f0" },
  title: { fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 16 },
  sub: { fontSize: 12, color: "#888", marginTop: 2 },
  closeBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#aaa" },
  center: { padding: "24px 16px", textAlign: "center" },
  checking: { padding: 24, textAlign: "center" },
  successBanner: { padding: "16px", display: "flex", alignItems: "center", gap: 14, color: "#fff" },
  missingBanner: { margin: 16, padding: "14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 },
  docList: { padding: "12px 16px" },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 8 },
  docRow: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, padding: "6px 0", borderBottom: "1px solid #f9f9f9" },
  previewBox: { margin: "0 16px 12px", padding: "12px 14px", background: "#f9f9f9", borderRadius: 10 },
  actions: { padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 10 },
  applyBtn: { padding: "12px", borderRadius: 12, border: "none", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Noto Sans', sans-serif", display: "block", width: "100%" },
  portalLink: { textAlign: "center", fontSize: 13, fontWeight: 700, textDecoration: "none", display: "block" },
  confirmBox: { padding: "20px 16px", textAlign: "center" },
  helpline: { fontSize: 13, color: "#888", marginBottom: 16 },
};
