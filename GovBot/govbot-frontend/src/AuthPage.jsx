import { useState } from "react";
import { REGIONS } from "./regions.js";

export default function AuthPage({ onLogin }) { // onLogin(userData, password)
  const [mode, setMode] = useState("login"); // login | signup | region
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password) { setError("Please fill all fields"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const { auth, createUserWithEmailAndPassword, updateProfile } = await import("./firebase.js");
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(cred.user, { displayName: form.name });
      setNewUser(cred.user);
      setMode("region");
    } catch (err) {
      setError(err.message.replace("Firebase: ", "").replace(/\(auth.*\)/, ""));
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) { setError("Please fill all fields"); return; }
    setLoading(true);
    try {
      const { auth, signInWithEmailAndPassword, db, doc, getDoc } = await import("./firebase.js");
      const cred = await signInWithEmailAndPassword(auth, form.email, form.password);
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      const region = snap.exists() ? snap.data().region : "north";
      onLogin({ uid: cred.user.uid, name: cred.user.displayName, email: cred.user.email, region }, form.password);
    } catch (err) {
      setError("Invalid email or password.");
    }
    setLoading(false);
  };

  const handleRegionSelect = async (regionId) => {
    setSelectedRegion(regionId);
    setLoading(true);
    try {
      const { db, doc, setDoc } = await import("./firebase.js");
      await setDoc(doc(db, "users", newUser.uid), {
        name: newUser.displayName,
        email: newUser.email,
        region: regionId,
        createdAt: new Date().toISOString(),
      });
      onLogin({ uid: newUser.uid, name: newUser.displayName, email: newUser.email, region: regionId }, form.password);
    } catch (err) {
      setError("Error saving region. Please try again.");
    }
    setLoading(false);
  };

  if (mode === "region") {
    return (
      <div style={styles.root}>
        <div style={styles.authBg} />
        <div style={styles.regionBox}>
          <div style={styles.regionTitle}>🇮🇳 Choose Your Region</div>
          <div style={styles.regionSubtitle}>
            Your avatar, language & interface will match your region's culture!
          </div>
          <div style={styles.regionGrid}>
            {Object.values(REGIONS).map((r) => (
              <button
                key={r.id}
                style={{
                  ...styles.regionCard,
                  background: selectedRegion === r.id ? r.colors.headerGrad : "#fff",
                  color: selectedRegion === r.id ? "#fff" : "#333",
                  border: `3px solid ${r.colors.primary}`,
                  transform: selectedRegion === r.id ? "scale(1.05)" : "scale(1)",
                }}
                onClick={() => handleRegionSelect(r.id)}
                disabled={loading}
              >
                <div style={styles.regionEmoji}>{r.emoji}</div>
                <div style={styles.regionAvatar}>{r.avatar}</div>
                <div style={styles.regionCardName}>{r.name}</div>
                <div style={{ ...styles.regionCardStates, color: selectedRegion === r.id ? "rgba(255,255,255,0.8)" : "#888" }}>{r.states}</div>
                <div style={styles.regionAvatarName}>{r.avatarName} will guide you</div>
                <div style={styles.regionFestive}>{r.festive.join(" ")}</div>
              </button>
            ))}
          </div>
          {error && <div style={styles.error}>{error}</div>}
          {loading && <div style={styles.loadingText}>Setting up your experience... ✨</div>}
        </div>
        <style>{fonts}</style>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <div style={styles.authBg} />

      <div style={styles.authContainer}>
        {/* Left Panel */}
        <div style={styles.leftPanel}>
          <div style={styles.leftContent}>
            <div style={styles.brandIcon}>🏛️</div>
            <div style={styles.brandName}>GovBot India</div>
            <div style={styles.brandTagline}>Your AI guide to government schemes</div>
            <div style={styles.regionPreview}>
              {Object.values(REGIONS).map((r) => (
                <div key={r.id} style={{ ...styles.previewChip, background: r.colors.headerGrad }}>
                  {r.avatar} {r.name.split(" ")[0]}
                </div>
              ))}
            </div>
            <div style={styles.leftFeatures}>
              {["🎙️ Voice assistant in your language", "🎨 Regional cultural themes", "🏆 Personalized scheme finder", "🔒 Secure & private"].map(f => (
                <div key={f} style={styles.featureItem}>{f}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div style={styles.rightPanel}>
          <div style={styles.formBox}>
            <div style={styles.formTitle}>
              {mode === "login" ? "Welcome Back! 🙏" : "Join GovBot India 🇮🇳"}
            </div>
            <div style={styles.formSubtitle}>
              {mode === "login" ? "Sign in to continue to your regional experience" : "Create your account and pick your region"}
            </div>

            <form onSubmit={mode === "login" ? handleLogin : handleSignup} style={styles.form}>
              {mode === "signup" && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" style={styles.input} />
                </div>
              )}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@email.com" style={styles.input} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" style={styles.input} />
              </div>

              {error && <div style={styles.error}>{error}</div>}

              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
              </button>
            </form>

            <div style={styles.switchMode}>
              {mode === "login" ? (
                <>Don't have an account? <span style={styles.switchLink} onClick={() => { setMode("signup"); setError(""); }}>Sign Up</span></>
              ) : (
                <>Already have an account? <span style={styles.switchLink} onClick={() => { setMode("login"); setError(""); }}>Sign In</span></>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{fonts}</style>
    </div>
  );
}

const fonts = `
  @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Noto+Sans:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
`;

const styles = {
  root: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0f0f", position: "relative", fontFamily: "'Noto Sans', sans-serif" },
  authBg: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "radial-gradient(circle at 20% 30%, rgba(230,57,70,0.15) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(106,5,114,0.15) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(21,101,192,0.1) 0%, transparent 60%)",
    pointerEvents: "none",
  },
  authContainer: { display: "flex", width: "100%", maxWidth: 900, minHeight: 580, borderRadius: 24, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.5)", position: "relative", zIndex: 1 },
  leftPanel: { width: "45%", background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", padding: 48, display: "flex", alignItems: "center" },
  leftContent: { color: "#fff" },
  brandIcon: { fontSize: 48, marginBottom: 12 },
  brandName: { fontFamily: "'Baloo 2', cursive", fontSize: 28, fontWeight: 800, marginBottom: 6 },
  brandTagline: { fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 28, lineHeight: 1.5 },
  regionPreview: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 },
  previewChip: { borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600, color: "#fff" },
  leftFeatures: { display: "flex", flexDirection: "column", gap: 10 },
  featureItem: { fontSize: 13, color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 8 },
  rightPanel: { flex: 1, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 48 },
  formBox: { width: "100%" },
  formTitle: { fontFamily: "'Baloo 2', cursive", fontSize: 26, fontWeight: 800, color: "#1a1a2e", marginBottom: 6 },
  formSubtitle: { fontSize: 13, color: "#888", marginBottom: 28, lineHeight: 1.5 },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  inputGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#444" },
  input: { border: "2px solid #eee", borderRadius: 10, padding: "12px 16px", fontSize: 14, fontFamily: "'Noto Sans', sans-serif", outline: "none", transition: "border 0.2s", color: "#333" },
  error: { background: "#fff0f0", border: "1px solid #ffcdd2", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#c62828" },
  submitBtn: { background: "linear-gradient(135deg, #E63946, #C1121F)", color: "#fff", border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Baloo 2', cursive", marginTop: 4 },
  switchMode: { textAlign: "center", marginTop: 20, fontSize: 13, color: "#888" },
  switchLink: { color: "#E63946", fontWeight: 700, cursor: "pointer" },
  // Region selection
  regionBox: { background: "#fff", borderRadius: 24, padding: 40, maxWidth: 860, width: "95%", position: "relative", zIndex: 1, boxShadow: "0 30px 80px rgba(0,0,0,0.4)" },
  regionTitle: { fontFamily: "'Baloo 2', cursive", fontSize: 30, fontWeight: 800, textAlign: "center", color: "#1a1a2e", marginBottom: 8 },
  regionSubtitle: { textAlign: "center", color: "#888", fontSize: 14, marginBottom: 32, lineHeight: 1.6 },
  regionGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  regionCard: { padding: 24, borderRadius: 16, cursor: "pointer", textAlign: "center", transition: "all 0.2s", background: "#fff" },
  regionEmoji: { fontSize: 28, marginBottom: 4 },
  regionAvatar: { fontSize: 40, marginBottom: 8 },
  regionCardName: { fontFamily: "'Baloo 2', cursive", fontSize: 18, fontWeight: 800, marginBottom: 4 },
  regionCardStates: { fontSize: 11, marginBottom: 8, lineHeight: 1.4 },
  regionAvatarName: { fontSize: 12, fontWeight: 600, opacity: 0.8, marginBottom: 6 },
  regionFestive: { fontSize: 18 },
  loadingText: { textAlign: "center", marginTop: 16, color: "#888", fontSize: 14 },
};
