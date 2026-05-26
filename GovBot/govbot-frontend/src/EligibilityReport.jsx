// Module 3 — Eligibility Report UI
// Shows which schemes the user qualifies for based on their profile + vault docs
// Accessed via 🎯 button in header

import { useState, useEffect } from "react";
import { checkEligibility } from "./utils/eligibilityChecker.js";
import { SCHEME_CATEGORIES } from "./utils/eligibilityRules.js";

export default function EligibilityReport({ user, region, onClose, onAskAboutScheme, onEditProfile }) {
  const [loading, setLoading]       = useState(true);
  const [profile, setProfile]       = useState(null);
  const [vaultDocs, setVaultDocs]   = useState([]);
  const [results, setResults]       = useState(null);
  const [activeTab, setActiveTab]   = useState("eligible");
  const [expanded, setExpanded]     = useState(null);
  const c = region?.colors || {};

  useEffect(() => { loadAndCheck(); }, []);

  const loadAndCheck = async () => {
    setLoading(true);
    try {
      const { db, doc, getDoc, collection, getDocs } = await import("./firebase.js");

      // Load profile
      const profileSnap = await getDoc(doc(db, "users", user.uid, "profile", "main"));
      const profileData = profileSnap.exists() ? profileSnap.data() : {};

      // Load vault docs
      const docsSnap = await getDocs(collection(db, "users", user.uid, "documents"));
      const docs = docsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      setProfile(profileData);
      setVaultDocs(docs);

      const eligResult = checkEligibility(profileData, docs);
      setResults(eligResult);
    } catch (e) {
      console.error("Eligibility check failed:", e);
      setResults({ eligible: [], partial: [], ineligible: [], totalEligible: 0, totalBenefit: 0 });
    }
    setLoading(false);
  };

  const formatBenefit = (n) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n}`;
  };

  const DOC_LABELS = {
    aadhaar: "Aadhaar Card 🪪",
    pan: "PAN Card 💳",
    bank: "Bank Passbook 🏦",
    land: "Land Record 🏡",
    income: "Income Certificate 📜",
    caste: "Caste Certificate 📋",
    ration: "Ration Card 🍚",
    birth: "Birth Certificate 👶",
  };

  const tabCounts = results ? {
    eligible: results.eligible.length,
    partial: results.partial.length,
  } : { eligible: 0, partial: 0 };

  const displayList = results ? (activeTab === "eligible" ? results.eligible : results.partial) : [];

  return (
    <div style={er.overlay}>
      <div style={{ ...er.panel, borderTop: `4px solid ${c.primary || "#6B21A8"}` }}>

        {/* Header */}
        <div style={er.header}>
          <div>
            <div style={{ ...er.title, color: c.primary || "#6B21A8" }}>🎯 Your Eligible Schemes</div>
            <div style={er.sub}>Based on your profile and documents</div>
          </div>
          <button style={er.closeBtn} onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div style={er.loading}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ color: c.primary || "#6B21A8", fontWeight: 700 }}>Checking your eligibility...</div>
            <div style={{ color: "#888", fontSize: 12, marginTop: 6 }}>Matching your profile against 20+ schemes</div>
          </div>
        ) : (
          <>
            {/* Summary banner */}
            {results && (
              <div style={{ ...er.banner, background: c.headerGrad || "#6B21A8" }}>
                <div style={er.bannerItem}>
                  <div style={er.bannerNum}>{results.totalEligible}</div>
                  <div style={er.bannerLabel}>Eligible Now</div>
                </div>
                <div style={er.bannerDivider} />
                <div style={er.bannerItem}>
                  <div style={er.bannerNum}>{results.partial.length}</div>
                  <div style={er.bannerLabel}>Need 1 Doc</div>
                </div>
                <div style={er.bannerDivider} />
                <div style={er.bannerItem}>
                  <div style={er.bannerNum}>{formatBenefit(results.totalBenefit)}</div>
                  <div style={er.bannerLabel}>Est. Total Benefit</div>
                </div>
              </div>
            )}

            {/* No profile warning */}
            {!profile?.occupation && (
              <div style={er.warningBox}>
                <div>⚠️ <strong>Profile incomplete</strong> — fill in your details to see matching schemes.</div>
                <button
                  style={{ marginTop: 10, padding: "8px 16px", borderRadius: 10, border: "none",
                    background: "#d97706", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                  onClick={() => { onClose(); if(onEditProfile) onEditProfile(); }}
                >
                  👤 Complete My Profile →
                </button>
              </div>
            )}

            {/* Tabs */}
            <div style={er.tabs}>
              {[
                { id: "eligible", label: `✅ Eligible (${tabCounts.eligible})` },
                { id: "partial",  label: `📋 Need Docs (${tabCounts.partial})` },
              ].map(t => (
                <button
                  key={t.id}
                  style={{
                    ...er.tab,
                    borderBottom: activeTab === t.id ? `3px solid ${c.primary || "#6B21A8"}` : "3px solid transparent",
                    color: activeTab === t.id ? (c.primary || "#6B21A8") : "#888",
                    fontWeight: activeTab === t.id ? 700 : 500,
                  }}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Scheme list */}
            <div style={er.list}>
              {displayList.length === 0 ? (
                <div style={er.empty}>
                  {activeTab === "eligible"
                    ? "Complete your profile to see eligible schemes"
                    : "No schemes with missing documents"}
                </div>
              ) : displayList.map(scheme => (
                <div key={scheme.id} style={er.schemeCard}>
                  {/* Card header */}
                  <button
                    style={er.cardHeader}
                    onClick={() => setExpanded(expanded === scheme.id ? null : scheme.id)}
                  >
                    <div style={er.cardLeft}>
                      <span style={{ fontSize: 28 }}>{scheme.emoji}</span>
                      <div>
                        <div style={{ ...er.schemeName, color: c.primary || "#6B21A8" }}>{scheme.name}</div>
                        <div style={er.schemeBenefit}>{scheme.benefit}</div>
                      </div>
                    </div>
                    <div style={{ ...er.statusBadge,
                      background: scheme.status === "eligible" ? "#dcfce7" : "#fef9c3",
                      color: scheme.status === "eligible" ? "#15803d" : "#854d0e",
                    }}>
                      {scheme.status === "eligible" ? "✅ Ready" : "📋 Docs"}
                    </div>
                  </button>

                  {/* Expanded details */}
                  {expanded === scheme.id && (
                    <div style={er.cardBody}>
                      <div style={er.descText}>{scheme.description}</div>

                      {scheme.reasons.length > 0 && (
                        <div style={er.section}>
                          <div style={{ ...er.sectionTitle, color: "#15803d" }}>✅ Why you qualify:</div>
                          {scheme.reasons.map((r, i) => <div key={i} style={er.reasonItem}>• {r}</div>)}
                        </div>
                      )}

                      {scheme.missingDocs.length > 0 && (
                        <div style={er.section}>
                          <div style={{ ...er.sectionTitle, color: "#d97706" }}>📋 Still needed:</div>
                          {scheme.missingDocs.map(d => (
                            <div key={d} style={er.missingDocItem}>
                              📎 {DOC_LABELS[d] || d} — add to vault to apply
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={er.cardActions}>
                        <button
                          style={{ ...er.askBtn, background: c.primary || "#6B21A8" }}
                          onClick={() => {
                            onAskAboutScheme(scheme.name);
                            onClose();
                          }}
                        >
                          💬 Ask {region?.avatarName?.split(" ")[0] || "GovBot"} about this
                        </button>
                        <button
                          onClick={() => {
                            if (scheme.portal) {
                              window.open(scheme.portal, "_blank", "noopener,noreferrer");
                            }
                          }}
                          disabled={!scheme.portal}
                          style={{ ...er.portalLink, color: c.primary || "#6B21A8", background: "none", border: `1px solid ${c.primary || "#6B21A8"}22`, borderRadius: 8, padding: "6px 12px", cursor: scheme.portal ? "pointer" : "not-allowed", opacity: scheme.portal ? 1 : 0.4 }}
                        >
                          🌐 Official portal →
                        </button>
                      </div>

                      {scheme.helpline && (
                        <div style={er.helpline}>📞 Helpline: <strong>{scheme.helpline}</strong></div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Refresh note */}
            <div style={er.refreshNote}>
              💡 Add more documents to your vault to unlock more schemes
            </div>
          </>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Noto+Sans:wght@400;600;700&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

const er = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 300, backdropFilter: "blur(6px)" },
  panel: { background: "#fff", borderRadius: "20px 20px 0 0", padding: "24px 20px 32px", width: "100%", maxWidth: 560, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 -10px 40px rgba(0,0,0,0.2)", animation: "fadeIn 0.3s ease", fontFamily: "'Noto Sans', sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  title: { fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 20 },
  sub: { fontSize: 12, color: "#888", marginTop: 2 },
  closeBtn: { background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#888" },
  loading: { textAlign: "center", padding: "40px 20px" },
  banner: { borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-around", marginBottom: 20, color: "#fff" },
  bannerItem: { textAlign: "center" },
  bannerNum: { fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 24 },
  bannerLabel: { fontSize: 11, opacity: 0.85, marginTop: 2 },
  bannerDivider: { width: 1, height: 40, background: "rgba(255,255,255,0.3)" },
  warningBox: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#92400e", marginBottom: 16, lineHeight: 1.6 },
  tabs: { display: "flex", borderBottom: "1px solid #f0f0f0", marginBottom: 16, gap: 4 },
  tab: { flex: 1, padding: "10px 0", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontFamily: "'Noto Sans', sans-serif", transition: "all 0.2s" },
  list: { display: "flex", flexDirection: "column", gap: 10 },
  empty: { textAlign: "center", color: "#888", padding: "32px 0", fontSize: 14 },
  schemeCard: { border: "1.5px solid #e5e7eb", borderRadius: 14, overflow: "hidden" },
  cardHeader: { width: "100%", background: "none", border: "none", cursor: "pointer", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 },
  cardLeft: { display: "flex", alignItems: "center", gap: 12, textAlign: "left", flex: 1 },
  schemeName: { fontWeight: 700, fontSize: 14, marginBottom: 2 },
  schemeBenefit: { fontSize: 12, color: "#555", lineHeight: 1.4 },
  statusBadge: { padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0 },
  cardBody: { padding: "0 16px 16px", borderTop: "1px solid #f0f0f0", animation: "fadeIn 0.2s ease" },
  descText: { fontSize: 13, color: "#666", lineHeight: 1.6, margin: "12px 0" },
  section: { marginBottom: 12 },
  sectionTitle: { fontWeight: 700, fontSize: 12, marginBottom: 6 },
  reasonItem: { fontSize: 12, color: "#555", lineHeight: 1.8 },
  missingDocItem: { fontSize: 12, color: "#d97706", lineHeight: 1.8, fontWeight: 600 },
  cardActions: { display: "flex", gap: 12, alignItems: "center", marginTop: 14, flexWrap: "wrap" },
  askBtn: { padding: "8px 16px", borderRadius: 10, border: "none", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" },
  portalLink: { fontSize: 12, fontWeight: 700, textDecoration: "none" },
  helpline: { fontSize: 12, color: "#888", marginTop: 8 },
  refreshNote: { textAlign: "center", fontSize: 12, color: "#aaa", marginTop: 20, padding: "12px 0" },
};
