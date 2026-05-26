// Module 9 — Profile Dashboard
// Full-screen dashboard: profile ring, vault grid, eligible schemes, quick actions
import { useState, useEffect } from "react";
import { checkEligibility } from "./utils/eligibilityChecker.js";

const OCCUPATION_LABELS = {
  farmer: { label: "Farmer", emoji: "🌾" },
  student: { label: "Student", emoji: "🎓" },
  business: { label: "Business Owner", emoji: "💼" },
  labour: { label: "Daily Wage Worker", emoji: "🔨" },
  senior: { label: "Senior Citizen", emoji: "👴" },
  woman: { label: "Homemaker", emoji: "👩" },
  govt: { label: "Govt Employee", emoji: "🏛️" },
  other: { label: "Other", emoji: "👤" },
};

const INCOME_LABELS = {
  "0": "No income",
  "1": "Below poverty line",
  "2": "Low income (₹1L–₹3L)",
  "3": "Middle income (₹3L–₹8L)",
  "4": "Above ₹8L/year",
};

const DOC_ICONS = {
  aadhaar: "🪪", pan: "💳", bank: "🏦", land: "🏡",
  income: "📜", caste: "📋", ration: "🍚", birth: "👶",
};

const DOC_NAMES = {
  aadhaar: "Aadhaar", pan: "PAN Card", bank: "Bank Passbook",
  land: "Land Record", income: "Income Cert", caste: "Caste Cert",
  ration: "Ration Card", birth: "Birth Cert",
};

export default function Dashboard({ user, region, userProfile, vaultDocs, onClose, onEditProfile, onOpenVault, onAskScheme, onOpenTracker }) {
  const [tab, setTab] = useState("overview"); // overview | schemes | vault | activity
  const [eligibility, setEligibility] = useState(null);
  const c = region?.colors || {};

  useEffect(() => {
    if (userProfile) {
      const result = checkEligibility(userProfile, vaultDocs || []);
      setEligibility(result);
    }
  }, [userProfile, vaultDocs]);

  // Profile completeness calculation
  const profileFields = ["name", "age", "occupation", "income", "familySize", "gender", "caste", "hasAadhaar", "hasBankAccount"];
  const filledFields = profileFields.filter(f => userProfile?.[f] !== undefined && userProfile?.[f] !== "" && userProfile?.[f] !== null);
  const completeness = Math.round((filledFields.length / profileFields.length) * 100);
  const docCompleteness = Math.min(100, Math.round(((vaultDocs?.length || 0) / 5) * 100));

  const occ = OCCUPATION_LABELS[userProfile?.occupation];
  const eligibleCount = eligibility?.eligible?.length || 0;
  const totalBenefit = eligibility?.totalBenefit || 0;

  const circumference = 2 * Math.PI * 44;
  const profileArc = circumference * (1 - completeness / 100);

  return (
    <div style={db.overlay}>
      <div style={{ ...db.panel, background: c.bg || "#faf5ff" }}>

        {/* Header */}
        <div style={{ ...db.header, background: c.headerGrad }}>
          <div style={db.headerLeft}>
            <div style={{ fontSize: 36 }}>{region?.avatarEmoji || "🤖"}</div>
            <div>
              <div style={db.headerTitle}>My Dashboard</div>
              <div style={db.headerSub}>{user?.name} • {region?.name}</div>
            </div>
          </div>
          <button onClick={onClose} style={db.closeBtn}>✕</button>
        </div>

        {/* Tab bar */}
        <div style={{ ...db.tabBar, borderBottom: `2px solid ${c.primary}20` }}>
          {[
            { id: "overview", label: "📊 Overview" },
            { id: "schemes", label: "🎯 Schemes" },
            { id: "vault", label: "🔐 Vault" },
            { id: "activity", label: "📋 Activity" },
          ].map(t => (
            <button key={t.id} style={{ ...db.tab, color: tab === t.id ? c.primary : "#888", borderBottom: tab === t.id ? `2px solid ${c.primary}` : "2px solid transparent", fontWeight: tab === t.id ? 700 : 500 }}
              onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>

        <div style={db.body}>

          {/* ── OVERVIEW TAB ── */}
          {tab === "overview" && (
            <div>
              {/* Top stat cards */}
              <div style={db.statsRow}>
                <div style={{ ...db.statCard, background: `linear-gradient(135deg, ${c.primary}, ${c.primary}cc)` }}>
                  <div style={db.statNum}>{eligibleCount}</div>
                  <div style={db.statLabel}>Eligible Schemes</div>
                </div>
                <div style={{ ...db.statCard, background: "linear-gradient(135deg, #059669, #047857)" }}>
                  <div style={db.statNum}>₹{totalBenefit >= 1000 ? Math.round(totalBenefit/1000) + "K" : totalBenefit}</div>
                  <div style={db.statLabel}>Est. Annual Benefit</div>
                </div>
                <div style={{ ...db.statCard, background: "linear-gradient(135deg, #d97706, #b45309)" }}>
                  <div style={db.statNum}>{vaultDocs?.length || 0}</div>
                  <div style={db.statLabel}>Documents Saved</div>
                </div>
              </div>

              {/* Profile completeness ring */}
              <div style={db.card}>
                <div style={db.cardTitle}>👤 Profile Completeness</div>
                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <svg width="100" height="100" style={{ flexShrink: 0 }}>
                    <circle cx="50" cy="50" r="44" fill="none" stroke="#f0f0f0" strokeWidth="8" />
                    <circle cx="50" cy="50" r="44" fill="none" stroke={c.primary || "#6B21A8"} strokeWidth="8"
                      strokeDasharray={circumference} strokeDashoffset={profileArc}
                      strokeLinecap="round" transform="rotate(-90 50 50)"
                      style={{ transition: "stroke-dashoffset 1s ease" }} />
                    <text x="50" y="55" textAnchor="middle" fontSize="18" fontWeight="800" fill={c.primary || "#6B21A8"}>{completeness}%</text>
                  </svg>
                  <div style={{ flex: 1 }}>
                    {profileFields.map(f => {
                      const filled = userProfile?.[f] !== undefined && userProfile?.[f] !== "" && userProfile?.[f] !== null;
                      const labels = { name: "Name", age: "Age", occupation: "Occupation", income: "Income", familySize: "Family Size", gender: "Gender", caste: "Caste", hasAadhaar: "Aadhaar Status", hasBankAccount: "Bank Account" };
                      return (
                        <div key={f} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                          <span style={{ fontSize: 12 }}>{filled ? "✅" : "⬜"}</span>
                          <span style={{ fontSize: 12, color: filled ? "#333" : "#aaa" }}>{labels[f]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {completeness < 100 && (
                  <button style={{ ...db.actionBtn, background: c.primary, marginTop: 14, width: "100%" }} onClick={onEditProfile}>
                    ✏️ Complete Profile ({100 - completeness}% remaining)
                  </button>
                )}
              </div>

              {/* Profile info */}
              {userProfile && (
                <div style={db.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={db.cardTitle}>🪪 My Info</div>
                    <button style={{ ...db.actionBtn, background: c.primary, padding: "5px 14px", fontSize: 12 }} onClick={onEditProfile}>Edit</button>
                  </div>
                  <div style={db.infoGrid}>
                    {[
                      { label: "Name", val: userProfile.name },
                      { label: "Age", val: userProfile.age ? `${userProfile.age} years` : null },
                      { label: "Occupation", val: occ ? `${occ.emoji} ${occ.label}` : null },
                      { label: "Income", val: INCOME_LABELS[userProfile.income] },
                      { label: "Family Size", val: userProfile.familySize ? `${userProfile.familySize} members` : null },
                      { label: "Caste", val: userProfile.caste?.toUpperCase() },
                      { label: "Aadhaar", val: userProfile.hasAadhaar === true ? "✅ Yes" : userProfile.hasAadhaar === false ? "❌ No" : null },
                      { label: "Bank Acc", val: userProfile.hasBankAccount === true ? "✅ Yes" : userProfile.hasBankAccount === false ? "❌ No" : null },
                    ].filter(i => i.val).map((item, i) => (
                      <div key={i} style={db.infoCell}>
                        <div style={db.infoLabel}>{item.label}</div>
                        <div style={db.infoVal}>{item.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!userProfile && (
                <div style={{ ...db.card, textAlign: "center", padding: 32 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Profile not set up yet</div>
                  <div style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>Set up your profile to see eligible schemes and benefits</div>
                  <button style={{ ...db.actionBtn, background: c.primary }} onClick={onEditProfile}>Set Up Profile →</button>
                </div>
              )}
            </div>
          )}

          {/* ── SCHEMES TAB ── */}
          {tab === "schemes" && (
            <div>
              {!eligibility ? (
                <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                  <div>Complete your profile to see eligible schemes</div>
                  <button style={{ ...db.actionBtn, background: c.primary, marginTop: 16 }} onClick={onEditProfile}>Set Up Profile</button>
                </div>
              ) : (
                <div>
                  {/* Summary banner */}
                  <div style={{ ...db.schemeBanner, background: c.headerGrad }}>
                    <div style={db.bannerStat}><span style={db.bannerNum}>{eligibility.eligible.length}</span><span style={db.bannerLbl}>Eligible</span></div>
                    <div style={db.bannerDivider} />
                    <div style={db.bannerStat}><span style={db.bannerNum}>{eligibility.partial.length}</span><span style={db.bannerLbl}>Need Docs</span></div>
                    <div style={db.bannerDivider} />
                    <div style={db.bannerStat}><span style={db.bannerNum}>₹{totalBenefit >= 1000 ? Math.round(totalBenefit/1000) + "K" : totalBenefit}</span><span style={db.bannerLbl}>Est./year</span></div>
                  </div>

                  {/* Eligible schemes */}
                  {eligibility.eligible.length > 0 && (
                    <div>
                      <div style={db.sectionHead}>✅ You're Eligible For</div>
                      {eligibility.eligible.map((s, i) => (
                        <div key={i} style={{ ...db.schemeCard, borderLeft: `4px solid ${c.primary}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <div style={{ ...db.schemeName, color: c.primary }}>{s.emoji} {s.name}</div>
                              <div style={db.schemeBenefit}>💰 {s.benefit}</div>
                              {s.reasons?.slice(0, 2).map((r, j) => <div key={j} style={db.schemeReason}>✓ {r}</div>)}
                            </div>
                            <button style={{ ...db.actionBtn, background: c.primary, fontSize: 11, padding: "5px 10px", flexShrink: 0 }}
                              onClick={() => { onAskScheme(s.name); onClose(); }}>Ask →</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Partial/Need docs */}
                  {eligibility.partial.length > 0 && (
                    <div>
                      <div style={db.sectionHead}>📋 Upload Docs to Unlock</div>
                      {eligibility.partial.map((s, i) => (
                        <div key={i} style={{ ...db.schemeCard, borderLeft: "4px solid #d97706", background: "#fffbeb" }}>
                          <div style={{ ...db.schemeName, color: "#92400e" }}>{s.emoji} {s.name}</div>
                          <div style={db.schemeBenefit}>💰 {s.benefit}</div>
                          {s.missingDocs?.slice(0, 2).map((d, j) => (
                            <div key={j} style={{ fontSize: 12, color: "#d97706", marginTop: 2 }}>📎 Need: {d}</div>
                          ))}
                          <button style={{ ...db.actionBtn, background: "#d97706", fontSize: 11, padding: "5px 10px", marginTop: 8 }}
                            onClick={onOpenVault}>Upload Docs →</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── VAULT TAB ── */}
          {tab === "vault" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={db.sectionHead}>🔐 Document Vault</div>
                <button style={{ ...db.actionBtn, background: c.primary }} onClick={onOpenVault}>+ Add Doc</button>
              </div>

              {/* Doc completeness bar */}
              <div style={db.card}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Vault Completeness</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: c.primary }}>{docCompleteness}%</span>
                </div>
                <div style={{ height: 8, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${docCompleteness}%`, background: c.primary, borderRadius: 4, transition: "width 0.8s ease" }} />
                </div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 6 }}>{vaultDocs?.length || 0} of 5 recommended documents added</div>
              </div>

              {vaultDocs?.length === 0 ? (
                <div style={{ textAlign: "center", padding: 32 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>No documents yet</div>
                  <div style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>Scan your Aadhaar, PAN, bank passbook etc. to unlock more schemes</div>
                  <button style={{ ...db.actionBtn, background: c.primary }} onClick={onOpenVault}>📷 Scan Document</button>
                </div>
              ) : (
                <div style={db.vaultGrid}>
                  {vaultDocs.map((doc, i) => (
                    <div key={i} style={{ ...db.vaultCard, borderColor: c.primary + "30" }}>
                      <div style={{ fontSize: 32, marginBottom: 6 }}>{DOC_ICONS[doc.docType] || "📄"}</div>
                      <div style={{ fontWeight: 700, fontSize: 12, color: c.primary }}>{DOC_NAMES[doc.docType] || doc.docType}</div>
                      <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>🔒 Encrypted</div>
                      {doc.name && <div style={{ fontSize: 11, color: "#555", marginTop: 3, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: 90 }}>{doc.name}</div>}
                    </div>
                  ))}
                  <div style={{ ...db.vaultCard, border: `2px dashed ${c.primary}40`, cursor: "pointer", background: "transparent" }} onClick={onOpenVault}>
                    <div style={{ fontSize: 28, color: c.primary, marginBottom: 6 }}>+</div>
                    <div style={{ fontSize: 11, color: c.primary, fontWeight: 700 }}>Add Doc</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ACTIVITY TAB ── */}
          {tab === "activity" && (
            <div>
              {/* Quick actions */}
              <div style={db.sectionHead}>⚡ Quick Actions</div>
              <div style={db.quickGrid}>
                {[
                  { icon: "🎯", label: "View Eligible Schemes", action: () => setTab("schemes"), color: c.primary },
                  { icon: "🔐", label: "Document Vault", action: onOpenVault, color: "#7c3aed" },
                  { icon: "✏️", label: "Edit Profile", action: onEditProfile, color: "#059669" },
                  { icon: "💬", label: "Ask Kavitha", action: onClose, color: "#d97706" },
                ].map((q, i) => (
                  <button key={i} style={{ ...db.quickBtn, borderColor: q.color + "40" }} onClick={q.action}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: q.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{q.icon}</div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: q.color, textAlign: "center", lineHeight: 1.3 }}>{q.label}</span>
                  </button>
                ))}
              </div>

              {/* My stats summary */}
              <div style={db.sectionHead}>📊 My Summary</div>
              <div style={db.card}>
                {[
                  { label: "Profile Completeness", val: `${completeness}%`, icon: "👤", color: c.primary },
                  { label: "Documents in Vault", val: `${vaultDocs?.length || 0} files`, icon: "🔐", color: "#7c3aed" },
                  { label: "Eligible Schemes", val: `${eligibleCount} schemes`, icon: "🎯", color: "#059669" },
                  { label: "Est. Annual Benefit", val: `₹${totalBenefit >= 1000 ? Math.round(totalBenefit/1000) + "K" : totalBenefit || 0}`, icon: "💰", color: "#d97706" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 3 ? "1px solid #f5f5f5" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{item.icon}</span>
                      <span style={{ fontSize: 13, color: "#555" }}>{item.label}</span>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 14, color: item.color }}>{item.val}</span>
                  </div>
                ))}
              </div>

              {/* Application tracker coming soon */}
              <div style={db.sectionHead}>📋 Applications</div>
              <div style={{ ...db.card, background: "linear-gradient(135deg, #f8f4ff, #ede9fe)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ fontSize: 32 }}>📋</div>
                  <div>
                    <div style={{ fontWeight: 800, color: c.primary, fontSize: 14 }}>Application Tracker</div>
                    <div style={{ color: "#888", fontSize: 12 }}>Track all your scheme applications</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#666", lineHeight: 1.8, marginBottom: 14 }}>
                  • Log applications after applying on portals<br/>
                  • Update status as it progresses<br/>
                  • Direct links to check official status
                </div>
                {onOpenTracker && (
                  <button style={{ ...db.actionBtn, background: c.primary, width: "100%", justifyContent: "center" }}
                    onClick={onOpenTracker}>
                    📋 Open Application Tracker →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Noto+Sans:wght@400;600;700&display=swap');
        @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

const db = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(6px)" },
  panel: { width: "100%", maxWidth: 560, height: "92vh", borderRadius: "20px 20px 0 0", display: "flex", flexDirection: "column", overflow: "hidden", animation: "slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)", boxShadow: "0 -20px 60px rgba(0,0,0,0.3)", fontFamily: "'Noto Sans', sans-serif" },
  header: { padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  headerTitle: { fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 18, color: "#fff" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 1 },
  closeBtn: { background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  tabBar: { display: "flex", background: "#fff", flexShrink: 0 },
  tab: { flex: 1, padding: "12px 4px", background: "none", border: "none", cursor: "pointer", fontSize: 12, fontFamily: "'Noto Sans', sans-serif", transition: "all 0.2s" },
  body: { flex: 1, overflowY: "auto", padding: "16px 16px 24px" },
  statsRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 },
  statCard: { borderRadius: 14, padding: "14px 10px", textAlign: "center", color: "#fff" },
  statNum: { fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 22, lineHeight: 1 },
  statLabel: { fontSize: 10, opacity: 0.85, marginTop: 3, fontWeight: 600 },
  card: { background: "#fff", borderRadius: 14, padding: "16px", marginBottom: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" },
  cardTitle: { fontWeight: 700, fontSize: 14, marginBottom: 12, color: "#333" },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  infoCell: { background: "#f8f4ff", borderRadius: 8, padding: "8px 10px" },
  infoLabel: { fontSize: 10, color: "#aaa", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 },
  infoVal: { fontSize: 13, fontWeight: 700, color: "#222" },
  actionBtn: { padding: "9px 18px", borderRadius: 10, border: "none", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Noto Sans', sans-serif" },
  schemeBanner: { borderRadius: 14, padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-around", marginBottom: 14, color: "#fff" },
  bannerStat: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3 },
  bannerNum: { fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 22 },
  bannerLbl: { fontSize: 11, opacity: 0.85 },
  bannerDivider: { width: 1, height: 36, background: "rgba(255,255,255,0.3)" },
  sectionHead: { fontWeight: 700, fontSize: 13, color: "#555", marginBottom: 10, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" },
  schemeCard: { background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  schemeName: { fontWeight: 700, fontSize: 14, marginBottom: 3 },
  schemeBenefit: { fontSize: 12, color: "#555", marginBottom: 4 },
  schemeReason: { fontSize: 11, color: "#16a34a" },
  vaultGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 },
  vaultCard: { background: "#fff", border: "1.5px solid", borderRadius: 12, padding: "14px 8px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  quickGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  quickBtn: { background: "#fff", border: "1.5px solid", borderRadius: 12, padding: "16px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "transform 0.15s" },
};
