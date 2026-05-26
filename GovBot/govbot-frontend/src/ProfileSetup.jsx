// Module 1 — Profile Setup Wizard
import { useState } from "react";

const THEMES_DATA = [
  { id: "festive", name: "Festive Indian", emoji: "🪷", desc: "Warm gradients, gold shimmer" },
  { id: "glass",   name: "Glassmorphism",  emoji: "🔮", desc: "Frosted glass, blur effects" },
  { id: "neon",    name: "Neon Glow",      emoji: "⚡", desc: "Electric accents, dark bg" },
  { id: "fintech", name: "Premium Fintech",emoji: "💎", desc: "Clean, minimal, sharp" },
];

const OCCUPATIONS = [
  { id: "farmer", label: "Farmer", emoji: "🌾" },
  { id: "student", label: "Student", emoji: "🎓" },
  { id: "business", label: "Business Owner", emoji: "💼" },
  { id: "labour", label: "Daily Wage Worker", emoji: "🔨" },
  { id: "senior", label: "Senior Citizen", emoji: "👴" },
  { id: "woman", label: "Homemaker / Woman", emoji: "👩" },
  { id: "govt", label: "Govt Employee", emoji: "🏛️" },
  { id: "other", label: "Other", emoji: "👤" },
];

const INCOME_RANGES = [
  { id: "0", label: "No income", sub: "₹0" },
  { id: "1", label: "Below poverty line", sub: "Under ₹1L/year" },
  { id: "2", label: "Low income", sub: "₹1L – ₹3L/year" },
  { id: "3", label: "Middle income", sub: "₹3L – ₹8L/year" },
  { id: "4", label: "Above ₹8L/year", sub: "Higher income" },
];

const CASTES = [
  { id: "general", label: "General" },
  { id: "obc", label: "OBC" },
  { id: "sc", label: "SC" },
  { id: "st", label: "ST" },
  { id: "minority", label: "Minority" },
];

export default function ProfileSetup({ user, region, onComplete, onClose, existingProfile, currentTheme, onThemeChange }) {
  const hasExisting = existingProfile && (existingProfile.name || existingProfile.occupation);
  // activeTab: "profile" | "appearance"
  const [activeTab, setActiveTab] = useState("profile");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    name: existingProfile?.name || user?.name || "",
    age: existingProfile?.age || "",
    occupation: existingProfile?.occupation || "",
    income: existingProfile?.income || "",
    landSize: existingProfile?.landSize || "",
    familySize: existingProfile?.familySize || "",
    hasAadhaar: existingProfile?.hasAadhaar ?? null,
    hasBankAccount: existingProfile?.hasBankAccount ?? null,
    caste: existingProfile?.caste || "",
    gender: existingProfile?.gender || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(currentTheme || "festive");
  const [themeSaved, setThemeSaved] = useState(false);

  const c = region?.colors || {};
  const totalSteps = 4;
  const update = (key, val) => setProfile(p => ({ ...p, [key]: val }));

  const saveProfile = async () => {
    setSaving(true);
    setError("");
    try {
      const { db, doc, setDoc } = await import("./firebase.js");
      const profileData = {
        ...profile,
        updatedAt: new Date().toISOString(),
        createdAt: existingProfile?.createdAt || new Date().toISOString(),
      };
      await setDoc(doc(db, "users", user.uid, "profile", "main"), profileData, { merge: true });
      await setDoc(doc(db, "users", user.uid), { profileComplete: true }, { merge: true });
      setSaved(true);
      setTimeout(() => {
        onComplete(profile);
        setSaved(false);
        setWizardOpen(false);
      }, 1000);
    } catch (e) {
      console.error("Profile save error:", e);
      setError("Save failed. Please try again.");
      setSaving(false);
    }
  };

  const applyTheme = async (themeId) => {
    setSelectedTheme(themeId);
    setThemeSaved(false);
    onThemeChange?.(themeId);
    try {
      const { db, doc, setDoc } = await import("./firebase.js");
      await setDoc(doc(db, "users", user.uid), { theme: themeId }, { merge: true });
    } catch (e) { console.warn("Theme save failed", e); }
    setThemeSaved(true);
    setTimeout(() => setThemeSaved(false), 2500);
  };

  const occLabel = OCCUPATIONS.find(o => o.id === profile.occupation);
  const incLabel = INCOME_RANGES.find(r => r.id === profile.income);
  const progress = ((step - 1) / totalSteps) * 100;
  const primary = c.primary || "#6B21A8";
  const grad = c.headerGrad || "linear-gradient(135deg,#581C87,#3B0764)";

  // ── WIZARD shown as inner overlay ──────────────────────────────────────────
  if (wizardOpen) {
    return (
      <div style={ps.overlay}>
        <div style={{ ...ps.card, borderTop: `4px solid ${primary}` }}>
          <div style={ps.header}>
            <div style={{ ...ps.avatarCircle, background: grad }}>{region?.avatarEmoji || "🤖"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ ...ps.title, color: primary }}>{hasExisting ? "Edit Your Profile" : "Set Up Your Profile"}</div>
              <div style={ps.sub}>{region?.avatarName || "GovBot"} will find your best schemes</div>
            </div>
            <button onClick={() => setWizardOpen(false)} style={ps.closeX} title="Close">✕</button>
          </div>
          <div style={ps.progressWrap}>
            <div style={ps.progressTrack}>
              <div style={{ ...ps.progressFill, width: `${progress}%`, background: primary }} />
            </div>
            <div style={{ ...ps.progressLabel, color: primary }}>Step {step} of {totalSteps}</div>
          </div>
          {error && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 12 }}>⚠️ {error}</div>}
          {saved && <div style={{ background: "#dcfce7", color: "#16a34a", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 12, textAlign: "center", fontWeight: 700 }}>✅ Profile saved!</div>}

          {step === 1 && (
            <div style={ps.stepWrap}>
              <div style={ps.stepTitle}>👋 Tell me about yourself</div>
              <div style={ps.field}>
                <label style={{ ...ps.label, color: primary }}>Your Full Name</label>
                <input style={ps.input} value={profile.name} onChange={e => update("name", e.target.value)} placeholder="e.g. Rajan Kumar" />
              </div>
              <div style={ps.field}>
                <label style={{ ...ps.label, color: primary }}>Your Age</label>
                <input style={ps.input} type="number" value={profile.age} onChange={e => update("age", e.target.value)} placeholder="e.g. 45" min="1" max="120" />
              </div>
              <div style={ps.field}>
                <label style={{ ...ps.label, color: primary }}>Family Size</label>
                <input style={ps.input} type="number" value={profile.familySize} onChange={e => update("familySize", e.target.value)} placeholder="Number of family members" min="1" max="30" />
              </div>
              <div style={ps.field}>
                <label style={{ ...ps.label, color: primary }}>Gender</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[{ id: "male", label: "👨 Male" }, { id: "female", label: "👩 Female" }, { id: "other", label: "🧑 Other" }].map(g => (
                    <button key={g.id} style={{ ...ps.incomeBtn, flex: 1, borderColor: profile.gender === g.id ? primary : "#e5e7eb", background: profile.gender === g.id ? (c.botBubble || "#f5f3ff") : "#fff" }}
                      onClick={() => update("gender", g.id)}>{g.label}</button>
                  ))}
                </div>
              </div>
              <button style={{ ...ps.nextBtn, background: primary, width: "100%", opacity: !profile.name || !profile.age ? 0.5 : 1 }}
                disabled={!profile.name || !profile.age} onClick={() => setStep(2)}>Next →</button>
            </div>
          )}
          {step === 2 && (
            <div style={ps.stepWrap}>
              <div style={ps.stepTitle}>💼 What do you do?</div>
              <div style={ps.grid2}>
                {OCCUPATIONS.map(o => (
                  <button key={o.id} style={{ ...ps.optionBtn, borderColor: profile.occupation === o.id ? primary : "#e5e7eb", background: profile.occupation === o.id ? (c.botBubble || "#f5f3ff") : "#fff" }}
                    onClick={() => update("occupation", o.id)}>
                    <span style={{ fontSize: 24 }}>{o.emoji}</span>
                    <span style={{ ...ps.optionLabel, color: profile.occupation === o.id ? primary : "#444" }}>{o.label}</span>
                  </button>
                ))}
              </div>
              <div style={ps.btnRow}>
                <button style={{ ...ps.backBtn, color: primary }} onClick={() => setStep(1)}>← Back</button>
                <button style={{ ...ps.nextBtn, background: primary, opacity: !profile.occupation ? 0.5 : 1 }}
                  disabled={!profile.occupation} onClick={() => setStep(3)}>Next →</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div style={ps.stepWrap}>
              <div style={ps.stepTitle}>💰 Income & Background</div>
              <div style={ps.field}>
                <label style={{ ...ps.label, color: primary }}>Annual Family Income</label>
                <div style={ps.incomeGrid}>
                  {INCOME_RANGES.map(r => (
                    <button key={r.id} style={{ ...ps.incomeBtn, borderColor: profile.income === r.id ? primary : "#e5e7eb", background: profile.income === r.id ? (c.botBubble || "#f5f3ff") : "#fff" }}
                      onClick={() => update("income", r.id)}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: profile.income === r.id ? primary : "#333" }}>{r.label}</div>
                      <div style={{ fontSize: 11, color: "#888" }}>{r.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div style={ps.field}>
                <label style={{ ...ps.label, color: primary }}>Caste Category</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {CASTES.map(ct => (
                    <button key={ct.id} style={{ ...ps.incomeBtn, padding: "7px 14px", borderColor: profile.caste === ct.id ? primary : "#e5e7eb", background: profile.caste === ct.id ? (c.botBubble || "#f5f3ff") : "#fff" }}
                      onClick={() => update("caste", ct.id)}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: profile.caste === ct.id ? primary : "#333" }}>{ct.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              {profile.occupation === "farmer" && (
                <div style={ps.field}>
                  <label style={{ ...ps.label, color: primary }}>Land Size (hectares)</label>
                  <input style={ps.input} type="number" value={profile.landSize} onChange={e => update("landSize", e.target.value)} placeholder="e.g. 1.5" step="0.1" min="0" />
                </div>
              )}
              <div style={ps.btnRow}>
                <button style={{ ...ps.backBtn, color: primary }} onClick={() => setStep(2)}>← Back</button>
                <button style={{ ...ps.nextBtn, background: primary, opacity: !profile.income ? 0.5 : 1 }}
                  disabled={!profile.income} onClick={() => setStep(4)}>Next →</button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div style={ps.stepWrap}>
              <div style={ps.stepTitle}>📄 Do you have these?</div>
              <div style={ps.docCheck}>
                {[
                  { key: "hasAadhaar", label: "Aadhaar Card", emoji: "🪪", desc: "12-digit national ID" },
                  { key: "hasBankAccount", label: "Bank Account", emoji: "🏦", desc: "Any bank with passbook" },
                ].map(d => (
                  <div key={d.key} style={ps.docRow}>
                    <div style={ps.docInfo}>
                      <span style={{ fontSize: 28 }}>{d.emoji}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{d.label}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>{d.desc}</div>
                      </div>
                    </div>
                    <div style={ps.yesno}>
                      {["yes", "no"].map(v => (
                        <button key={v} style={{ ...ps.ynBtn, background: profile[d.key] === (v === "yes") ? primary : "#f3f4f6", color: profile[d.key] === (v === "yes") ? "#fff" : "#555" }}
                          onClick={() => update(d.key, v === "yes")}>
                          {v === "yes" ? "✅ Yes" : "❌ No"}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ ...ps.note, borderColor: primary, color: primary }}>🔒 This stays private. Only you can see it.</div>
              <div style={ps.btnRow}>
                <button style={{ ...ps.backBtn, color: primary }} onClick={() => setStep(3)}>← Back</button>
                <button style={{ ...ps.nextBtn, background: saving ? "#9ca3af" : primary, minWidth: 140 }}
                  onClick={saveProfile} disabled={saving}>
                  {saving ? "Saving... ⏳" : "Save Profile ✓"}
                </button>
              </div>
            </div>
          )}
        </div>
        <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    );
  }

  // ── SUMMARY / APPEARANCE VIEW ────────────────────────────────────────────
  return (
    <div style={ps.overlay}>
      <div style={{ ...ps.card, borderTop: `4px solid ${primary}` }}>
        {/* Header */}
        <div style={ps.header}>
          <div style={{ ...ps.avatarCircle, background: grad }}>{region?.avatarEmoji || "🤖"}</div>
          <div style={{ flex: 1 }}>
            <div style={{ ...ps.title, color: primary }}>My Profile</div>
            <div style={ps.sub}>Your details used for scheme matching</div>
          </div>
          <button onClick={onClose} style={ps.closeX}>✕</button>
        </div>

        {/* Tab bar — completely separate from any navigation */}
        <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
          <button
            onClick={() => setActiveTab("profile")}
            style={{ flex: 1, padding: "8px", borderRadius: 10, border: "none", cursor: "pointer",
              fontWeight: 700, fontSize: 12, fontFamily: "'Noto Sans', sans-serif",
              background: activeTab === "profile" ? primary : "#f3f4f6",
              color: activeTab === "profile" ? "#fff" : "#666", transition: "all 0.2s" }}>
            👤 Profile
          </button>
          <button
            onClick={() => setActiveTab("appearance")}
            style={{ flex: 1, padding: "8px", borderRadius: 10, border: "none", cursor: "pointer",
              fontWeight: 700, fontSize: 12, fontFamily: "'Noto Sans', sans-serif",
              background: activeTab === "appearance" ? primary : "#f3f4f6",
              color: activeTab === "appearance" ? "#fff" : "#666", transition: "all 0.2s" }}>
            🎨 Appearance
          </button>
        </div>

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <div>
            <div style={ps.summaryGrid}>
              <div style={ps.summaryCard}><div style={ps.summaryLabel}>Name</div><div style={ps.summaryVal}>{profile.name || "—"}</div></div>
              <div style={ps.summaryCard}><div style={ps.summaryLabel}>Age</div><div style={ps.summaryVal}>{profile.age || "—"}</div></div>
              <div style={ps.summaryCard}><div style={ps.summaryLabel}>Occupation</div><div style={ps.summaryVal}>{occLabel ? `${occLabel.emoji} ${occLabel.label}` : "—"}</div></div>
              <div style={ps.summaryCard}><div style={ps.summaryLabel}>Income</div><div style={ps.summaryVal}>{incLabel ? incLabel.label : "—"}</div></div>
              <div style={ps.summaryCard}><div style={ps.summaryLabel}>Family Size</div><div style={ps.summaryVal}>{profile.familySize || "—"}</div></div>
              <div style={ps.summaryCard}><div style={ps.summaryLabel}>Caste</div><div style={ps.summaryVal}>{CASTES.find(ct => ct.id === profile.caste)?.label || "—"}</div></div>
              <div style={ps.summaryCard}><div style={ps.summaryLabel}>Aadhaar</div><div style={ps.summaryVal}>{profile.hasAadhaar === true ? "✅ Yes" : profile.hasAadhaar === false ? "❌ No" : "—"}</div></div>
              <div style={ps.summaryCard}><div style={ps.summaryLabel}>Bank Account</div><div style={ps.summaryVal}>{profile.hasBankAccount === true ? "✅ Yes" : profile.hasBankAccount === false ? "❌ No" : "—"}</div></div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button style={{ ...ps.nextBtn, background: primary, flex: 1 }}
                onClick={() => { setStep(1); setWizardOpen(true); }}>
                ✏️ Edit Profile
              </button>
              <button style={{ ...ps.nextBtn, background: "#f3f4f6", color: "#555", flex: 1 }}
                onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* ── APPEARANCE TAB ── */}
        {activeTab === "appearance" && (
          <div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 16, lineHeight: 1.6 }}>
              Pick a visual style. Your region's colour stays intact — the theme changes <strong>effects & layout</strong>.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
              {THEMES_DATA.map(theme => {
                const isSelected = selectedTheme === theme.id;
                const previewBg = { glass: "linear-gradient(135deg,#1a0533,#2d1060)", neon: "#050510", fintech: "#f4f2ff", festive: "linear-gradient(135deg,#fff7ff,#fdf4ff)" }[theme.id];
                const miniHeaderBg = { glass: "rgba(255,255,255,0.15)", neon: "#0d0d1a", fintech: "#fff", festive: grad }[theme.id];
                const miniCardBg = { glass: "rgba(255,255,255,0.1)", neon: "#0d0d1a", fintech: "#fff", festive: "#fff" }[theme.id];
                const miniCardBorder = { glass: "1px solid rgba(255,255,255,0.15)", neon: "1px solid rgba(124,58,237,0.3)", fintech: "1px solid #e5e7eb", festive: "1px solid rgba(107,33,168,0.15)" }[theme.id];
                const miniBarColor = { glass: "rgba(255,255,255,0.5)", neon: "#7c3aed", fintech: primary, festive: primary }[theme.id];
                return (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    style={{ border: isSelected ? `2px solid ${primary}` : "2px solid transparent",
                      borderRadius: 14, padding: 0, cursor: "pointer", overflow: "hidden",
                      boxShadow: isSelected ? `0 0 0 3px ${primary}30` : "0 1px 4px rgba(0,0,0,0.08)",
                      transition: "all 0.2s", background: "none", textAlign: "left" }}>
                    {/* Mini preview */}
                    <div style={{ background: previewBg, padding: "10px 10px 8px" }}>
                      <div style={{ background: miniHeaderBg, borderRadius: 6, padding: "4px 8px", marginBottom: 6,
                        display: "flex", gap: 4, alignItems: "center",
                        border: theme.id === "neon" ? "1px solid rgba(124,58,237,0.3)" : "none",
                        boxShadow: theme.id === "fintech" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                        backdropFilter: theme.id === "glass" ? "blur(8px)" : "none" }}>
                        <span style={{ fontSize: 11 }}>👩</span>
                        <div style={{ flex: 1, height: 3, borderRadius: 2, background: theme.id === "fintech" ? "#e5e7eb" : "rgba(255,255,255,0.35)" }} />
                        <div style={{ width: 18, height: 3, borderRadius: 2, background: theme.id === "neon" ? "#7c3aed" : "rgba(255,255,255,0.5)" }} />
                      </div>
                      <div style={{ background: miniCardBg, border: miniCardBorder, borderRadius: 8, padding: "6px 8px",
                        backdropFilter: theme.id === "glass" ? "blur(8px)" : "none" }}>
                        <div style={{ height: 3, width: "65%", borderRadius: 2, marginBottom: 4, background: miniBarColor,
                          boxShadow: theme.id === "neon" ? "0 0 6px #7c3aed" : "none" }} />
                        <div style={{ height: 2, width: "85%", borderRadius: 2, background: theme.id === "neon" ? "rgba(255,255,255,0.2)" : "#ddd" }} />
                        <div style={{ height: 2, width: "50%", borderRadius: 2, marginTop: 3, background: theme.id === "neon" ? "rgba(255,255,255,0.1)" : "#eee" }} />
                      </div>
                    </div>
                    {/* Label row */}
                    <div style={{ background: isSelected ? primary : "#f8f7ff", padding: "8px 10px", display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontSize: 16 }}>{theme.emoji}</span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 11, color: isSelected ? "#fff" : "#333", fontFamily: "'Baloo 2', cursive" }}>{theme.name}</div>
                        <div style={{ fontSize: 9, color: isSelected ? "rgba(255,255,255,0.75)" : "#999" }}>{theme.desc}</div>
                      </div>
                      {isSelected && <span style={{ marginLeft: "auto", color: "#fff", fontSize: 13 }}>✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              style={{ ...ps.nextBtn, background: themeSaved ? "#16a34a" : primary, width: "100%", transition: "background 0.3s", fontSize: 13 }}
              onClick={() => applyTheme(selectedTheme)}>
              {themeSaved ? "✅ Theme Applied!" : `Apply ${THEMES_DATA.find(t => t.id === selectedTheme)?.name || ""} Theme`}
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

const ps = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, backdropFilter: "blur(6px)", padding: 16 },
  card: { background: "#fff", borderRadius: 20, padding: "24px 22px", maxWidth: 480, width: "100%", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 30px 80px rgba(0,0,0,0.3)", animation: "fadeIn 0.35s ease", fontFamily: "'Noto Sans', sans-serif" },
  header: { display: "flex", gap: 12, alignItems: "center", marginBottom: 18, position: "relative" },
  avatarCircle: { width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 },
  title: { fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 17 },
  sub: { fontSize: 12, color: "#888", marginTop: 2 },
  closeX: { position: "absolute", top: -4, right: -4, background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#aaa", lineHeight: 1, padding: "4px 8px" },
  progressWrap: { marginBottom: 20 },
  progressTrack: { height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden", marginBottom: 6 },
  progressFill: { height: "100%", borderRadius: 3, transition: "width 0.4s ease" },
  progressLabel: { fontSize: 11, fontWeight: 700, textAlign: "right" },
  stepWrap: { animation: "fadeIn 0.25s ease" },
  stepTitle: { fontFamily: "'Baloo 2', cursive", fontWeight: 700, fontSize: 16, marginBottom: 16, color: "#222" },
  field: { marginBottom: 14 },
  label: { display: "block", fontWeight: 700, fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" },
  input: { width: "100%", padding: "10px 14px", borderRadius: 10, border: "2px solid #e5e7eb", fontSize: 14, fontFamily: "'Noto Sans', sans-serif", outline: "none", boxSizing: "border-box" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 },
  optionBtn: { padding: "10px 8px", borderRadius: 12, border: "2px solid", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, transition: "all 0.15s" },
  optionLabel: { fontSize: 11, fontWeight: 700, textAlign: "center" },
  incomeGrid: { display: "flex", flexDirection: "column", gap: 7 },
  incomeBtn: { padding: "9px 12px", borderRadius: 10, border: "2px solid", cursor: "pointer", textAlign: "left", transition: "all 0.15s" },
  docCheck: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 },
  docRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "#f9f9f9", borderRadius: 12 },
  docInfo: { display: "flex", alignItems: "center", gap: 10 },
  yesno: { display: "flex", gap: 6 },
  ynBtn: { padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, transition: "all 0.15s" },
  note: { padding: "9px 12px", borderRadius: 10, border: "1.5px solid", fontSize: 12, fontWeight: 600, marginBottom: 16 },
  btnRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  nextBtn: { padding: "11px 24px", borderRadius: 12, border: "none", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Baloo 2', cursive", transition: "opacity 0.2s" },
  backBtn: { background: "none", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", padding: "11px 0" },
  summaryGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  summaryCard: { background: "#f8f4ff", borderRadius: 10, padding: "10px 12px" },
  summaryLabel: { fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", marginBottom: 3 },
  summaryVal: { fontSize: 13, fontWeight: 700, color: "#222" },
};
