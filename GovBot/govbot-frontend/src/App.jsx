import { useState, useRef, useEffect } from "react";
import AuthPage from "./AuthPage.jsx";
import SchemeMenu from "./SchemeMenu.jsx";
import ProfileSetup from "./ProfileSetup.jsx";
import EligibilityReport from "./EligibilityReport.jsx";
import ApplyFlow from "./ApplyFlow.jsx";
import Dashboard from "./Dashboard.jsx";
import StatusTimeline from "./StatusTimeline.jsx";
import NotificationCenter from "./NotificationCenter.jsx";
import { getThemeStyles, DEFAULT_THEME } from "./utils/themeEngine.js";
import RichMessage from "./RichMessage.jsx";
import { getEligibilitySummary } from "./utils/eligibilityChecker.js";
import DocumentVault from "./DocumentVault.jsx";
import { setSessionKey, clearSessionKey } from "./utils/keyManager.js";
import { onAuthStateChanged } from "firebase/auth";
import { startSessionTimer, stopSessionTimer } from "./utils/sessionTimeout.js";
import GreetingPage from "./GreetingPage.jsx";
import StateSelector from "./StateSelector.jsx";
import { REGIONS, SCHEMES_CONTEXT, ALL_REGION_STATES } from "./regions.js";

const suggestedQuestions = [
  "I am a farmer, what schemes can I get?",
  "What scholarships are available for students?",
  "I am 65 years old, any pension scheme?",
  "Free health insurance for my family?",
  "Schemes for starting small business?",
];

export default function App() {
  const [user, setUser] = useState(null);
  const [phase, setPhase] = useState("loading"); // loading | auth | greeting | stateSelect | chat
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [showEligibility, setShowEligibility] = useState(false);
  const [suggestedQuestion, setSuggestedQuestion] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [applyScheme, setApplyScheme] = useState(null); // { name, id }
  const [lastSchemeName, setLastSchemeName] = useState("");
  const [lastCategory, setLastCategory] = useState("");
  const [convId, setConvId] = useState(() => Date.now());
  const [userVaultDocs, setUserVaultDocs] = useState([]);
  const [userApplications, setUserApplications] = useState([]);
  const [profileComplete, setProfileComplete] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showTracker, setShowTracker] = useState(false);
  const [notifUnread, setNotifUnread] = useState(0);
  const [activeTheme, setActiveTheme] = useState(DEFAULT_THEME);
  const [selectedState, setSelectedState] = useState(null);
  const [useNativeLang, setUseNativeLang] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const abortControllerRef = useRef(null);
  const sessionIdRef = useRef(0);
  const lastCategoryRef = useRef(""); // incremented on refresh to block stale audio

  const region = user ? REGIONS[user.region] : null;
  const themeStyles = (region && typeof getThemeStyles === "function") ? getThemeStyles(activeTheme, region.colors) : {};
  const isDarkTheme = activeTheme === "glass" || activeTheme === "neon";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Restore session on page refresh
  useEffect(() => {
    import("./firebase.js").then(({ auth, db, doc, getDoc }) => {
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (!firebaseUser) {
          setPhase("auth"); // No user logged in
          return;
        }
        if (firebaseUser && !user) {
          // Restore user session
          try {
            const snap = await getDoc(doc(db, "users", firebaseUser.uid));
            const data = snap.exists() ? snap.data() : {};
            const restored = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || data.name || "User",
              email: firebaseUser.email,
              region: data.region || "south",
            };
            setUser(restored);
            if (data.profileComplete) setProfileComplete(true);
            if (data.selectedState) setSelectedState(data.selectedState);
            // Load profile + docs
            const [profileSnap, docsSnap] = await Promise.all([
              getDoc(doc(db, "users", firebaseUser.uid, "profile", "main")),
              import("./firebase.js").then(({ collection, getDocs }) =>
                getDocs(collection(db, "users", firebaseUser.uid, "documents"))
              ),
            ]);
            if (profileSnap.exists()) {
              const pd = profileSnap.data();
              setUserProfile(pd);
              if (pd.theme) setActiveTheme(pd.theme);
            }
            setUserVaultDocs(docsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
            // Load applications for notification engine
            import("./firebase.js").then(({ collection: col, getDocs: gd }) =>
              gd(col(db, "users", firebaseUser.uid, "applications"))
            ).then(snap => setUserApplications(snap.docs.map(d => ({ id: d.id, ...d.data() })))).catch(() => {});
            // Go straight to chat if region known
            if (data.region) {
              const restoredState = data.selectedState || null;
              const restoredNative = data.useNativeLang || false;
              setSelectedState(restoredState);
              setUseNativeLang(restoredNative);
              // Restore greeting message so chat isn't blank
              const r = REGIONS[data.region] || REGIONS["south"];
              const rs = ALL_REGION_STATES[data.region] || {};
              const stateData = restoredState && rs[restoredState];
              const nativeName = stateData ? stateData.nativeName : "";
              const greeting = restoredState
                ? `${r.greeting.split("!")[0]}! I'm ${r.avatarName}.\n\nI see you're from ${restoredState}! ${restoredNative ? `I'll speak in your native language — ${nativeName}! 🙏` : "Let's chat in English!"}\n\nTell me about yourself and I'll find the best government schemes for you! ${r.festive.join(" ")}`
                : `${r.greeting}\n\n${r.subGreeting}\n\n${r.festive.join(" ")}`;
              setMessages([{ role: "assistant", content: greeting }]);
              setPhase("chat");
            } else {
              setPhase("greeting"); // Has account but no region yet
            }
          } catch(e) { console.error("Session restore error:", e); }
        }
      });
    });
  }, []);

  const handleLogin = async (userData, password) => {
    setUser(userData);
    // Set encryption key from password
    if (password) {
      setSessionKey(password, userData.uid);
      startSessionTimer(() => { clearSessionKey(); });
    }
    // Check if profile is complete
    try {
      const { db, doc, getDoc } = await import("./firebase.js");
      const snap = await getDoc(doc(db, "users", userData.uid));
      if (snap.exists() && snap.data().profileComplete) {
        setProfileComplete(true);
      }
    } catch(e) {}
    // Load profile and docs for eligibility engine
    try {
      const { db, doc, getDoc, collection, getDocs } = await import("./firebase.js");
      const [profileSnap, docsSnap] = await Promise.all([
        getDoc(doc(db, "users", userData.uid, "profile", "main")),
        getDocs(collection(db, "users", userData.uid, "documents")),
      ]);
      if (profileSnap.exists()) setUserProfile(profileSnap.data());
      setUserVaultDocs(docsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      // Load applications for notification engine
      try {
        const { collection: col, getDocs: gd } = await import("./firebase.js");
        const appsSnap = await gd(col(db, "users", userData.uid, "applications"));
        setUserApplications(appsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch(e) {}
    } catch(e) {}
    setPhase("greeting");
  };

  // Auto-send when user clicks "Ask about scheme" from eligibility report
  useEffect(() => {
    if (suggestedQuestion && phase === "chat") {
      setInput(suggestedQuestion);
      setSuggestedQuestion("");
    }
  }, [suggestedQuestion, phase]);

  const handleGreetingDone = () => {
    if (REGIONS[user.region]?.hasStateSelection) {
      setPhase("stateSelect");
    } else {
      startChat(null, false);
    }
  };

  const handleProfileSetupNeeded = () => {
    if (!profileComplete) setShowProfileSetup(true);
  };

  const startChat = (state, native) => {
    setSelectedState(state);
    setUseNativeLang(native);
    // Persist state/lang choice so refresh can restore it
    if (user) {
      import("./firebase.js").then(({ db, doc, setDoc }) => {
        setDoc(doc(db, "users", user.uid), { selectedState: state || null, useNativeLang: native || false }, { merge: true }).catch(() => {});
      });
    }
    const r = REGIONS[user.region];
    const stateInfo = state && r.hasStateSelection ? { state, native } : null;
    const regionStates = ALL_REGION_STATES[user.region] || {};
    const stateData = state && regionStates[state];
    const nativeName = stateData ? stateData.nativeName : "";
    const greeting = stateInfo
      ? `${r.greeting.split("!")[0]}! I'm ${r.avatarName}.\n\nI see you're from ${state}! ${native ? `I'll speak in your native language — ${nativeName}! 🙏` : "Let's chat in English!"}\n\nTell me about yourself and I'll find the best government schemes for you! ${r.festive.join(" ")}`
      : `${r.greeting}\n\n${r.subGreeting}\n\n${r.festive.join(" ")}`;

    setMessages([{ role: "assistant", content: greeting }]);
    setPhase("chat");
  };

  const audioRef = useRef(null);
  const audioEnabledRef = useRef(true); // always reflects latest audioEnabled

  // Single source of truth for current language
  const getLang = () => {
    const rs = ALL_REGION_STATES[user?.region] || {};
    if (selectedState && rs[selectedState] && useNativeLang) return rs[selectedState].lang;
    return useNativeLang ? (region?.voiceLang || "en-IN") : "en-IN";
  };

  const speak = async (text) => {
    if (!audioEnabledRef.current) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setSpeaking(true);
    try {
      const clean = text.replace(/[*#_~`]/g, "").trim();
      const res = await fetch("http://localhost:5000/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: clean.slice(0, 600), lang: getLang(), region: user?.region || "south" })
      });
      const data = await res.json();
      if (data.audio) {
        const audio = new Audio("data:audio/mp3;base64," + data.audio);
        audioRef.current = audio;
        audio.onended = () => setSpeaking(false);
        audio.onerror = () => setSpeaking(false);
        audio.play();
      } else { setSpeaking(false); }
    } catch (e) { console.error("TTS error:", e); setSpeaking(false); }
  };

  const stopSpeaking = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setSpeaking(false);
  };

  const toggleAudio = () => {
    const next = !audioEnabled;
    audioEnabledRef.current = next;
    if (!next) { stopSpeaking(); }
    setAudioEnabled(next);
  };

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Please use Chrome for voice input."); return; }
    const r = new SR();
    r.lang = region.voiceLang;
    r.interimResults = false;
    recognitionRef.current = r;
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.onresult = (e) => setInput(e.results[0][0].transcript);
    r.start();
  };

  const stopVoice = () => { if (recognitionRef.current) recognitionRef.current.stop(); setListening(false); };

  const sendMessage = async (text) => {
    const userText = (text || input || "").trim();
    if (!userText) return;
    // Stop any currently playing audio immediately when user sends a new message
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setSpeaking(false);
    const mySession = sessionIdRef.current; // capture current session
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const lang = getLang();

    try {
      // Cancel any previous in-flight request
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          systemPrompt: SCHEMES_CONTEXT(user.region, selectedState, useNativeLang) + getEligibilitySummary(userProfile || {}, userVaultDocs),
          lang,
          region: user.region,
        }),
      });
      const data = await response.json();
      const reply = data.reply || "Sorry, I could not get a response.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
      // Extract scheme name from "You selected SCHEME NAME" pattern — works for ALL schemes
      // Multiple patterns: 'You selected X', bold name, or contextual heading
      const selectedMatch = reply.match(/You selected ([^.\n]+?)[.\n]/i)
        || reply.match(/(?:about|for) \*\*([^*\n]{4,60}?)\*\*/i)
        || reply.match(/(?:Eligibility|Documents|Benefits|Helpline|Apply).{0,20}for ([A-Z][^\n.?]{4,60}?)(?: Scheme| Yojana|[.\n?]|$)/i);
      if (selectedMatch) {
        const extracted = selectedMatch[1].trim().replace(/[*_]/g, "");
        setLastSchemeName(extracted);
      }

      // Only play if: audio is enabled (use ref for fresh value), same session, not aborted
      if (audioEnabledRef.current && data.audio && mySession === sessionIdRef.current) {
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        setSpeaking(true);
        const audio = new Audio("data:audio/mp3;base64," + data.audio);
        audioRef.current = audio;
        audio.onended = () => setSpeaking(false);
        audio.onerror = () => setSpeaking(false);
        audio.play();
      }
    } catch (err) {
      if (err?.name === "AbortError") return; // Intentionally cancelled — do nothing
      setMessages([...newMessages, { role: "assistant", content: "Sorry, connection error. Make sure the backend is running!" }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const handleRegionChange = async (newRegion) => {
    // FIX: Stop any playing audio immediately before switching region
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; audioRef.current = null; }
    setSpeaking(false);
    try {
      const { db, doc, setDoc } = await import("./firebase.js");
      await setDoc(doc(db, "users", user.uid), { ...user, region: newRegion }, { merge: true });
    } catch {}
    setUser({ ...user, region: newRegion });
    setShowRegionPicker(false);
    setMessages([]);
    setSelectedState(null);
    setUseNativeLang(false);
    // Load profile and docs for eligibility engine
    try {
      const { db, doc, getDoc, collection, getDocs } = await import("./firebase.js");
      const [profileSnap, docsSnap] = await Promise.all([
        getDoc(doc(db, "users", user.uid, "profile", "main")),
        getDocs(collection(db, "users", user.uid, "documents")),
      ]);
      if (profileSnap.exists()) setUserProfile(profileSnap.data());
      setUserVaultDocs(docsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      // Load applications for notification engine
      try {
        const { collection: col, getDocs: gd } = await import("./firebase.js");
        const appsSnap = await gd(col(db, "users", user.uid, "applications"));
        setUserApplications(appsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch(e) {}
    } catch(e) {}
    setPhase("greeting");
  };

  const handleLogout = () => {
    stopSpeaking();
    setLoggingOut(true);
    setTimeout(() => {
      setUser(null);
      setMessages([]);
      setInput("");
      setLoggingOut(false);
      setPhase("auth");
    }, 2200);
  };

  // Logout animation overlay
  if (loggingOut) return (
    <div style={{ minHeight: "100vh", overflow: "hidden", position: "relative", background: "linear-gradient(180deg, #1e0533 0%, #4c1d95 40%, #7c3aed 100%)" }}>
      {/* Stars falling */}
      {[...Array(20)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${Math.random() * 100}%`,
          top: `-${Math.random() * 20}%`,
          fontSize: `${10 + Math.random() * 20}px`,
          animation: `fall ${0.8 + Math.random() * 1.2}s ease-in forwards`,
          animationDelay: `${Math.random() * 0.5}s`,
          opacity: 0.8,
        }}>{["⭐","🌟","✨","💫","🌸","🏛️"][Math.floor(Math.random()*6)]}</div>
      ))}
      {/* Main content rising up then falling */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", animation: "riseAndFall 1.2s ease-in-out forwards" }}>
        <div style={{ fontSize: 80, marginBottom: 16, filter: "drop-shadow(0 0 30px rgba(255,255,255,0.5))" }}>🏛️</div>
        <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 8, textShadow: "0 0 20px rgba(255,255,255,0.5)" }}>
          Goodbye, {user?.name?.split(" ")[0]}!
        </div>
        <div style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", marginBottom: 24 }}>See you soon 🙏</div>
        <div style={{ display: "flex", gap: 12, fontSize: 28, animation: "wave 0.6s ease infinite" }}>
          👋🌸✨
        </div>
      </div>
      <style>{`
        @keyframes fall { from{transform:translateY(0) rotate(0)} to{transform:translateY(110vh) rotate(720deg)} }
        @keyframes riseAndFall { 0%{transform:translateY(0) scale(1);opacity:1} 30%{transform:translateY(-40px) scale(1.05);opacity:1} 100%{transform:translateY(100vh) scale(0.5);opacity:0} }
      `}</style>
    </div>
  );

  // Render phases
  if (phase === "loading") return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)" }}>
      <div style={{ textAlign: "center", color: "#fff" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🏛️</div>
        <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>GovBot India</div>
        <div style={{ fontSize: 14, opacity: 0.8 }}>Loading your session...</div>
      </div>
    </div>
  );
  if (phase === "auth") return <AuthPage onLogin={handleLogin} />;
  if (phase === "greeting") return <GreetingPage user={user} region={user.region} onDone={handleGreetingDone} />;
  if (phase === "stateSelect") return (
    <div style={{ minHeight: "100vh", background: region.greetingBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <StateSelector region={region} onSelect={startChat} />
    </div>
  );

  const c = region.colors;

  return (
    <div style={{ ...styles.root, background: themeStyles.pageBg || c.bg || "linear-gradient(160deg, #fdf4ff, #f5f3ff)" }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: region.bgPattern, pointerEvents: "none", zIndex: 0 }} />

      {/* Region Picker Modal */}
      {showRegionPicker && (
        <div style={styles.modalOverlay}>
          <div style={styles.regionModal}>
            <div style={styles.regionModalTitle}>🗺️ Change Your Region</div>
            <div style={styles.regionModalSub}>Your avatar, theme & language will update!</div>
            <div style={styles.regionModalGrid}>
              {Object.values(REGIONS).map((r) => (
                <button key={r.id}
                  style={{ ...styles.regionModalCard, borderColor: r.colors.primary, background: user.region === r.id ? r.colors.headerGrad : "#fff", color: user.region === r.id ? "#fff" : "#333" }}
                  onClick={() => handleRegionChange(r.id)}>
                  <div style={{ fontSize: 28 }}>{r.avatarEmoji}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, marginTop: 4 }}>{r.name}</div>
                  {user.region === r.id && <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>✓ Current</div>}
                </button>
              ))}
            </div>
            <button style={styles.closeModalBtn} onClick={() => setShowRegionPicker(false)}>✕ Cancel</button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={activeTheme === "neon" ? "header-neon-sweep" : activeTheme === "festive" ? "header-festive" : ""} style={{ ...styles.header, background: themeStyles.headerBg || c.headerGrad, backdropFilter: themeStyles.headerBackdrop || "none", WebkitBackdropFilter: themeStyles.headerBackdrop || "none", boxShadow: themeStyles.headerShadow || "none" }}>
        <div style={styles.headerInner}>
          <div style={styles.logoArea}>
            <div style={{ ...styles.avatarCircle, background: themeStyles.headerBtnBg || "rgba(255,255,255,0.2)", border: themeStyles.headerBtnBorder || "2px solid rgba(255,255,255,0.35)" }}>{region.avatarEmoji}</div>
            <div>
              <div style={{ ...styles.logoTitle, color: themeStyles.headerTextColor || "#fff" }}>GovBot — {region.name}</div>
              <div style={{ ...styles.logoSub, color: themeStyles.headerTextColor ? (themeStyles.isDark === false && themeStyles.headerTextColor !== "#fff" ? themeStyles.headerTextColor + "99" : "rgba(255,255,255,0.7)") : "rgba(255,255,255,0.7)" }}>{selectedState ? `📍 ${selectedState}` : region.states}</div>
            </div>
          </div>
          <div style={styles.headerRight}>
            {/* Audio toggle */}
            <button style={{ ...styles.headerIconBtn, background: audioEnabled ? (themeStyles.headerBtnBg || "rgba(255,255,255,0.2)") : "rgba(255,0,0,0.3)", color: themeStyles.headerTextColor || "#fff", border: themeStyles.headerBtnBorder || "none" }}
              onClick={toggleAudio} title={audioEnabled ? "Mute voice" : "Unmute voice"}>
              {audioEnabled ? "🔊" : "🔇"}
            </button>
<button style={{ ...styles.headerIconBtn, background: themeStyles.headerBtnBg || "rgba(255,255,255,0.2)", color: themeStyles.headerTextColor || "#fff", border: themeStyles.headerBtnBorder || "none" }}
              onClick={() => setShowEligibility(true)} title="My Eligible Schemes">
              🎯
            </button>
            <button style={{ ...styles.headerIconBtn, background: themeStyles.headerBtnBg || "rgba(255,255,255,0.2)", color: themeStyles.headerTextColor || "#fff", border: themeStyles.headerBtnBorder || "none" }}
              onClick={() => setShowVault(true)} title="Document Vault">
              🔐
            </button>
            <button style={{ ...styles.headerIconBtn, background: themeStyles.headerBtnBg || "rgba(255,255,255,0.2)", color: themeStyles.headerTextColor || "#fff", border: themeStyles.headerBtnBorder || "none" }}
              onClick={() => setShowTracker(true)} title="Application Tracker">
              📋
            </button>
            <NotificationCenter
              userProfile={userProfile}
              vaultDocs={userVaultDocs}
              applications={userApplications}
              selectedState={selectedState}
              region={region}
              unreadCount={notifUnread}
              setUnreadCount={setNotifUnread}
              activeTheme={activeTheme}
              themeStyles={themeStyles}
              onAction={(action, data) => {
                if (action === "openProfile") setShowProfileSetup(true);
                if (action === "openVault") setShowVault(true);
                if (action === "openEligibility") setShowEligibility(true);
                if (action === "openTracker") setShowTracker(true);
                if (action === "openApply" && data) setApplyScheme(data);
                if (action === "askChat" && data) {
                  // Directly send the message to chat — don't just fill input
                  sendMessage(data);
                }
              }}
            />
            {speaking && (
              <button style={{ ...styles.headerIconBtn, background: themeStyles.headerBtnBg || "rgba(255,255,255,0.2)", color: themeStyles.headerTextColor || "#fff", border: themeStyles.headerBtnBorder || "none", animation: "pulse 1s infinite" }}
                onClick={stopSpeaking} title="Stop speaking">⏹</button>
            )}
            <button style={{ ...styles.regionChangeBtn, background: themeStyles.headerBtnBg || "rgba(255,255,255,0.15)", color: themeStyles.headerTextColor || "#fff", border: themeStyles.headerBtnBorder || "1px solid rgba(255,255,255,0.3)" }} onClick={() => setShowRegionPicker(true)}>
              🗺️ Change Region
            </button>
            {selectedState && (
              <button style={{ ...styles.regionChangeBtn, background: themeStyles.headerBtnBg || "rgba(255,255,255,0.12)", color: themeStyles.headerTextColor || "#fff", border: themeStyles.headerBtnBorder || "1px solid rgba(255,255,255,0.3)" }}
                onClick={() => { setPhase("stateSelect"); setMessages([]); }}
                title="Change state or language">
                📍 {selectedState} {useNativeLang ? "🗣️" : "🇬🇧"} ↺
              </button>
            )}
            <button style={{ ...styles.profileChip, background: themeStyles.headerChipBg || "rgba(255,255,255,0.2)", color: themeStyles.headerChipColor || "#fff", border: themeStyles.headerChipBorder || "1.5px solid rgba(255,255,255,0.35)" }} onClick={() => setShowProfileSetup(true)} title="Edit Profile">
              👤 {user.name}
            </button>
            <div style={{ ...styles.headerBadge, background: themeStyles.headerBtnBg || "rgba(255,255,255,0.15)", color: themeStyles.headerTextColor || "#fff" }}><span style={styles.dot} />Live</div>
            <button style={{ ...styles.logoutBtn, background: themeStyles.headerBtnBg || "rgba(255,255,255,0.15)", color: themeStyles.headerTextColor || "#fff", border: themeStyles.headerBtnBorder || "1px solid rgba(255,255,255,0.3)" }} onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      {/* Festive strip */}
      <div style={{ ...styles.festiveBanner, background: themeStyles.festiveStripBg || c.headerGrad, display: activeTheme === "fintech" ? "none" : "flex" }}>
        {[...region.festive, ...region.festive, ...region.festive].map((f, i) => (
          <span key={i} style={{ fontSize: 15, margin: "0 4px" }}>{f}</span>
        ))}
        <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: 600, margin: "0 8px" }}>
          {region.avatarName} • {region.avatarTitle}
        </span>
        {[...region.festive, ...region.festive, ...region.festive].map((f, i) => (
          <span key={"b"+i} style={{ fontSize: 15, margin: "0 4px" }}>{f}</span>
        ))}
      </div>

      <div style={styles.layout}>
        {/* Sidebar */}
        <aside style={{ ...styles.sidebar, background: themeStyles.sidebarBg || "transparent" }}>
          <div style={{ ...styles.avatarCard, background: themeStyles.sidebarCardBg || c.headerGrad, backdropFilter: themeStyles.sidebarCardBackdrop || "none" }}>
            <div style={{ fontSize: 52, marginBottom: 4 }}>{region.avatarEmoji}</div>
            <div style={styles.avatarCardName}>{region.avatarName}</div>
            <div style={styles.avatarCardRole}>{region.avatarTitle}</div>
            {selectedState && <div style={styles.stateTag}>📍 {selectedState}</div>}
            {useNativeLang && <div style={styles.langTag}>🗣️ Native Language Mode</div>}

            {/* Sidebar action buttons */}
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              {/* Audio toggle - full width */}
              <button
                style={{ background: audioEnabled ? "rgba(255,255,255,0.22)" : "rgba(220,38,38,0.5)", border: "none", color: "#fff", borderRadius: 10, padding: "7px 0", cursor: "pointer", fontSize: 12, fontWeight: 700, width: "100%", fontFamily: "'Noto Sans', sans-serif" }}
                onClick={toggleAudio}>
                {audioEnabled ? "🔊 Audio On" : "🔇 Audio Off"}
              </button>
              {/* Stop speaking - full width, only when speaking */}
              {speaking && (
                <button
                  style={{ background: "rgba(250,200,0,0.35)", border: "none", color: "#fff", borderRadius: 10, padding: "7px 0", cursor: "pointer", fontSize: 12, fontWeight: 700, width: "100%", fontFamily: "'Noto Sans', sans-serif" }}
                  onClick={stopSpeaking}>
                  ⏹ Stop Speaking
                </button>
              )}
              {/* 2×2 icon grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {[
                  { icon: "📊", label: "Dashboard",  action: () => setShowDashboard(true) },
                  { icon: "🎯", label: "Eligibility", action: () => setShowEligibility(true) },
                  { icon: "🔐", label: "Vault",       action: () => setShowVault(true) },
                  { icon: "📋", label: "Tracker",     action: () => setShowTracker(true) },
                ].map(({ icon, label, action }) => (
                  <button key={label} onClick={action}
                    style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 10, padding: "8px 4px", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontFamily: "'Noto Sans', sans-serif" }}>
                    <span style={{ fontSize: 18 }}>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ ...styles.sideSection, border: themeStyles.sideSectionBorder || region.borderPattern, background: themeStyles.sideSectionBg || "#fff", boxShadow: isDarkTheme ? "none" : "0 2px 10px rgba(0,0,0,0.05)" }}>
            <div style={{ ...styles.sideTitle, color: themeStyles.sideTitleColor || c.primary }}>📋 Categories</div>
            {["🌾 Agriculture", "🎓 Education", "🏥 Health", "🏠 Housing", "👴 Senior Citizens", "💼 Business"].map((cat) => (
              <button key={cat} style={{ ...styles.catBtn, color: themeStyles.catBtnColor || "#444" }}
                onClick={() => sendMessage(`Tell me about ${cat.split(" ").slice(1).join(" ")} schemes`)}>
                {cat}
              </button>
            ))}
          </div>

          <div style={{ ...styles.sideSection, border: themeStyles.sideSectionBorder || region.borderPattern, background: themeStyles.sideSectionBg || "#fff", boxShadow: isDarkTheme ? "none" : "0 2px 10px rgba(0,0,0,0.05)" }}>
            <div style={{ ...styles.sideTitle, color: themeStyles.sideTitleColor || c.primary }}>⚡ Quick Questions</div>
            {suggestedQuestions.map((q) => (
              <button key={q} style={{ ...styles.quickBtn, background: themeStyles.quickBtnBg || c.botBubble, border: themeStyles.quickBtnBorder || `1px solid ${c.botBubbleBorder}`, color: themeStyles.quickBtnColor || "#555" }}
                onClick={() => sendMessage(q)}>{q}</button>
            ))}
          </div>

          <div style={{ ...styles.sideNote, background: themeStyles.sideNoteBg || c.sideNote }}>
            <div style={styles.sideNoteTitle}>{region.decoration} Tip</div>
            Tell {region.avatarName.split(" ")[0]} your age, income & location for the best scheme matches!
          </div>
        </aside>

        {/* Chat */}
        <main style={{ ...styles.chatArea, background: themeStyles.chatBg || "#fff", boxShadow: themeStyles.chatAreaShadow || (isDarkTheme ? "none" : "0 4px 24px rgba(0,0,0,0.07)") }}>
          <div style={{ ...styles.messages, background: themeStyles.msgScrollBg || "transparent" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ ...styles.msgRow, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                {msg.role === "assistant" && (
                  <div className={activeTheme === "neon" ? "avatar-neon" : (activeTheme === "festive" || activeTheme === "glass") ? "avatar-breathe" : ""} style={{ ...styles.avatar, background: themeStyles.avatarBg || c.headerGrad, border: themeStyles.avatarBorder || 'none', boxShadow: themeStyles.avatarShadow || 'none' }}>{region.avatarEmoji}</div>
                )}
                <div style={msg.role === "user"
                  ? { ...styles.userBubble, background: themeStyles.userBubbleBg || c.userBubble, border: themeStyles.userBubbleBorder || "none", borderRadius: themeStyles.userBubbleRadius || 18, color: themeStyles.userBubbleColor || "#fff", boxShadow: themeStyles.userBubbleShadow || "none" }
                  : { ...styles.botBubble, background: themeStyles.botBubbleBg || c.botBubble, border: themeStyles.botBubbleBorder || `1px solid ${c.botBubbleBorder}`, backdropFilter: themeStyles.botBubbleBackdrop || "none", borderRadius: themeStyles.botBubbleRadius || 18, color: themeStyles.botBubbleColor || "#222", boxShadow: themeStyles.botBubbleShadow || "none" }}>
                  <RichMessage content={msg.content || ""} colors={c} themeStyles={themeStyles} />
                  {msg.role === "assistant" && (
                    <button style={{ ...styles.speakBtn, color: c.primary }}
                      onClick={() => speak(msg.content)} title="Read aloud">🔊</button>
                  )}
                  {msg.role === "assistant" && (
                    <SchemeMenu
                      content={msg.content || ""}
                      colors={c}
                      themeStyles={themeStyles}
                      lastScheme={lastSchemeName}
                      onApply={(name) => setApplyScheme({ name, id: null })}
                      onSelect={(text) => sendMessage(text)}
                      isDarkTheme={isDarkTheme}
                      themeId={activeTheme}
                      useNativeLang={useNativeLang}
                      onSchemeSelected={(name) => {
                        setLastSchemeName(name);
                        const cat = /school|college|student|scholarship|laptop|education|vidya|pudhumai|penn/i.test(name) ? "Education"
                          : /farmer|kisan|agriculture|fasal|crop|krishi|solar|pm-kisan/i.test(name) ? "Agriculture"
                          : /health|ayushman|medical|hospital|janani/i.test(name) ? "Health"
                          : /house|awas|housing|shelter/i.test(name) ? "Housing"
                          : /senior|elderly|pension|old age/i.test(name) ? "Senior Citizens"
                          : /business|mudra|loan|msme|startup/i.test(name) ? "Business"
                          : "Government";
                        setLastCategory(cat);
                        lastCategoryRef.current = cat;
                      }}
                      onBackToList={() => {
                        // Derive category fresh from the current scheme name at click time
                        const sn = lastSchemeName || "";
                        const cat = /school|college|student|scholarship|laptop|education|vidya|pudhumai|penn/i.test(sn) ? "Education"
                          : /farmer|kisan|agriculture|fasal|crop|krishi|solar/i.test(sn) ? "Agriculture"
                          : /health|ayushman|medical|hospital|janani|arogya/i.test(sn) ? "Health"
                          : /house|awas|housing|shelter|gramin/i.test(sn) ? "Housing"
                          : /senior|elderly|pension|old age|vayoshri/i.test(sn) ? "Senior Citizens"
                          : /business|mudra|loan|msme|startup/i.test(sn) ? "Business"
                          : "government";
                        sendMessage(`Show me all ${cat} schemes${selectedState ? ` in ${selectedState}` : ""}`);
                      }}
                    />
                  )}
                </div>
                {msg.role === "user" && (
                  <div style={{ ...styles.userAvatar, background: themeStyles.avatarBg || c.headerGrad }}>👤</div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ ...styles.msgRow, justifyContent: "flex-start" }}>
                <div className={activeTheme === "neon" ? "avatar-neon" : (activeTheme === "festive" || activeTheme === "glass") ? "avatar-breathe" : ""} style={{ ...styles.avatar, background: themeStyles.avatarBg || c.headerGrad, border: themeStyles.avatarBorder || 'none', boxShadow: themeStyles.avatarShadow || 'none' }}>{region.avatarEmoji}</div>
                <div className={activeTheme === "neon" ? "neon-bot-bubble" : ""} style={{ ...styles.botBubble, background: themeStyles.botBubbleBg || c.botBubble, border: themeStyles.botBubbleBorder || `1px solid ${c.botBubbleBorder}`, backdropFilter: themeStyles.botBubbleBackdrop || "none", borderRadius: themeStyles.botBubbleRadius || 18, color: themeStyles.botBubbleColor || "#222" }}>
                  <div style={styles.typing}>
                    {[0, 200, 400].map(d => <span key={d} style={{ ...styles.typingDot, background: c.primary, animationDelay: `${d}ms` }} />)}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ ...styles.inputArea, borderTop: `1px solid ${c.botBubbleBorder}`, background: themeStyles.inputAreaBg || (isDarkTheme ? "#111" : "#fafafa") }}>
            {listening && (
              <div style={{ ...styles.listeningBanner, background: c.headerGrad }}>
                🎙️ Listening in {selectedState || region.name} dialect... speak now!
              </div>
            )}
            <div style={styles.inputRow}>
              <button
                onClick={() => {
                  const r = REGIONS[user.region];
                  const rs = ALL_REGION_STATES[user.region] || {};
                  const stateData = selectedState && rs[selectedState];
                  const nativeName = stateData ? stateData.nativeName : "";
                  const greeting = selectedState
                    ? `${r.greeting.split("!")[0]}! I'm ${r.avatarName}.\n\nI see you're from ${selectedState}! ${useNativeLang ? `I'll speak in your native language — ${nativeName}! 🙏` : "Let's chat in English!"}\n\nTell me about yourself and I'll find the best government schemes for you! ${r.festive.join(" ")}`
                    : `${r.greeting}\n\n${r.subGreeting}\n\n${r.festive.join(" ")}`;
                  // Increment sessionId — any in-flight fetch will see mismatch and NOT play audio
                  sessionIdRef.current += 1;
                  // Abort in-flight request
                  if (abortControllerRef.current) { abortControllerRef.current.abort(); abortControllerRef.current = null; }
                  // Kill any currently playing audio immediately
                  if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; audioRef.current = null; }
                  setSpeaking(false);
                  setLoading(false);
                  setMessages([{ role: "assistant", content: greeting }]);
                  setInput("");
                  setLastSchemeName("");
                  setLastCategory("");
                }}
                style={{ ...styles.refreshBtn, border: `1.5px solid ${c.botBubbleBorder}`, color: c.primary }}
                title="New conversation"
              >🔄</button>
              <textarea
                style={{ ...styles.textarea, border: themeStyles.inputBorder || `2px solid ${c.botBubbleBorder}`, background: themeStyles.inputBg || "#fff", color: themeStyles.inputColor || "#333" }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={`Ask ${region.avatarName.split(" ")[0]} about government schemes...`}
                rows={2}
              />
              <button style={{ ...styles.voiceBtn, background: listening ? "#DC2626" : c.accent }}
                onClick={listening ? stopVoice : startVoice} title="Voice input">
                {listening ? "⏹" : "🎙️"}
              </button>
              <button
                style={{ ...styles.sendBtn, background: c.userBubble, opacity: loading || !input.trim() ? 0.5 : 1 }}
                onClick={() => sendMessage()} disabled={loading || !input.trim()}>
                ➤
              </button>
            </div>
            <div style={styles.inputHint}>
              🔒 Secure •
              {audioEnabled ? " 🔊 Audio On" : " 🔇 Audio Off"} •
              🎙️ Voice enabled •
              🤖 Powered by Groq AI
            </div>
          </div>
        </main>
      </div>

      {/* Apply Flow — inline in chat */}
      {applyScheme && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 350, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 520, maxHeight: "85vh", overflowY: "auto" }}>
            <ApplyFlow
              schemeName={applyScheme.name}
              schemeId={applyScheme.id}
              user={user}
              region={region}
              vaultDocs={userVaultDocs}
              onClose={() => setApplyScheme(null)}
              onGoToVault={() => { setApplyScheme(null); setShowVault(true); }}
            onOpenTracker={(name) => { setApplyScheme(null); setShowTracker(true); }}
            />
          </div>
        </div>
      )}

      {/* Eligibility Report */}
      {showEligibility && (
        <EligibilityReport
          user={user}
          region={region}
          onClose={() => setShowEligibility(false)}
          onEditProfile={() => setShowProfileSetup(true)}
          onAskAboutScheme={(schemeName) => {
            const question = `Tell me more about ${schemeName} — how do I apply?`;
            setShowEligibility(false);
            setTimeout(() => sendMessage(question), 100);
          }}
        />
      )}

      {/* Profile Setup — shown after first login */}
      {showProfileSetup && (
        <ProfileSetup
          user={user}
          region={region}
          existingProfile={userProfile}
          currentTheme={activeTheme}
          onThemeChange={(t) => setActiveTheme(t)}
          onClose={() => setShowProfileSetup(false)}
          onComplete={(profile) => {
            setProfileComplete(true);
            setShowProfileSetup(false);
            setUserProfile(profile);
          }}
        />
      )}

      {/* Dashboard */}
      {showDashboard && (
        <Dashboard
          user={user}
          region={region}
          userProfile={userProfile}
          vaultDocs={userVaultDocs}
          onClose={() => setShowDashboard(false)}
          onEditProfile={() => { setShowDashboard(false); setShowProfileSetup(true); }}
          onOpenVault={() => { setShowDashboard(false); setShowVault(true); }}
          onAskScheme={(name) => { setShowDashboard(false); setTimeout(() => sendMessage(`Tell me about ${name} — how do I apply?`), 100); }}
          onOpenTracker={() => { setShowDashboard(false); setShowTracker(true); }}
        />
      )}

      {/* Application Status Tracker */}
      {showTracker && (
        <StatusTimeline
          user={user}
          region={region}
          onClose={() => setShowTracker(false)}
          onAskStatus={(name) => {
            setShowTracker(false);
            setTimeout(() => sendMessage(`What is the current status of my ${name} application? What should I do next?`), 100);
          }}
        />
      )}

      {/* Document Vault */}
      {showVault && (
        <DocumentVault
          user={user}
          region={region}
          onClose={() => setShowVault(false)}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Noto+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Noto Sans', sans-serif; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: ${c.primary}; border-radius: 3px; }
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes wave { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-20deg)} 75%{transform:rotate(20deg)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }

        /* ── FESTIVE: gold shimmer strip on header top ── */
        @keyframes gold-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes scroll-flowers { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes card-shimmer { 0%,100%{transform:translateX(-80px);opacity:0} 50%{transform:translateX(80px);opacity:1} }

        /* ── NEON: sweep line + pulse ── */
        @keyframes neon-sweep { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        @keyframes neon-pulse { 0%,100%{box-shadow:0 0 8px rgba(124,58,237,0.5)} 50%{box-shadow:0 0 22px rgba(124,58,237,1),0 0 45px rgba(124,58,237,0.35)} }

        /* ── GLASS / FESTIVE: breathe ── */
        @keyframes breathe { 0%,100%{box-shadow:0 4px 12px ${c.primary}66} 50%{box-shadow:0 4px 22px ${c.primary}cc,0 0 0 5px ${c.primary}22} }

        /* ── Neon glow avatar ── */
        .avatar-neon { animation: neon-pulse 2s ease-in-out infinite !important; }
        .avatar-breathe { animation: breathe 3s ease-in-out infinite !important; }

        /* ── Neon header sweep line ── */
        .header-neon-sweep::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, ${c.primary}, #06b6d4, ${c.primary}, transparent);
          animation: neon-sweep 3s linear infinite;
          pointer-events: none;
        }
        .header-neon-sweep { position: relative; overflow: hidden; }

        /* ── Festive header: gold shimmer top line ── */
        .header-festive::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #ffd700, #ff9500, #ff6b6b, #ff9500, #ffd700);
          background-size: 200% 100%;
          animation: gold-shimmer 2s linear infinite;
          pointer-events: none;
        }
        .header-festive { position: relative; overflow: hidden; }

        /* ── Festive card: gold shimmer sweep on header ── */
        .card-festive-header { position: relative; overflow: hidden; }
        .card-festive-header::after {
          content: '';
          position: absolute;
          top: 0; right: -20px;
          width: 60px; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,215,0,0.18), transparent);
          animation: card-shimmer 2.5s ease-in-out infinite;
          pointer-events: none;
        }

        /* ── Neon bot bubble: glowing top line ── */
        .neon-bot-bubble { position: relative; }
        .neon-bot-bubble::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, ${c.primary}, transparent);
          border-radius: 4px 16px 0 0;
          pointer-events: none;
        }

        /* ── Neon card: glowing border on hover ── */
        .neon-scheme-card { position: relative; }
        .neon-scheme-card::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 16px;
          background: linear-gradient(135deg, ${c.primary}, #06b6d4, ${c.primary});
          opacity: 0;
          transition: opacity 0.3s;
          z-index: -1;
          pointer-events: none;
        }
        .neon-scheme-card:hover::before { opacity: 0.5; }

        /* ── Fintech card hover ── */
        .fintech-card-hover:hover { box-shadow: 0 8px 24px rgba(107,33,168,0.12) !important; }

        /* ── Festive card hover bounce ── */
        @keyframes card-bounce { 0%{transform:translateY(0) rotate(0)} 100%{transform:translateY(-4px) rotate(0.5deg)} }
      `}</style>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", position: "relative", overflow: "hidden", fontFamily: "'Noto Sans', sans-serif" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" },
  regionModal: { background: "#fff", borderRadius: 20, padding: "32px 28px", maxWidth: 400, width: "90%", textAlign: "center", boxShadow: "0 30px 80px rgba(0,0,0,0.3)", animation: "slideDown 0.3s ease" },
  regionModalTitle: { fontFamily: "'Baloo 2', cursive", fontSize: 22, fontWeight: 800, color: "#1a1a2e", marginBottom: 6 },
  regionModalSub: { color: "#888", fontSize: 13, marginBottom: 20 },
  regionModalGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 },
  regionModalCard: { padding: "14px 10px", borderRadius: 12, cursor: "pointer", border: "2px solid", transition: "all 0.2s", fontFamily: "'Noto Sans', sans-serif" },
  closeModalBtn: { background: "#f1f5f9", border: "none", borderRadius: 10, padding: "8px 20px", cursor: "pointer", fontSize: 13, color: "#666", fontFamily: "'Noto Sans', sans-serif" },
  header: { padding: "0 20px", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", position: "relative", zIndex: 200 },
  headerInner: { maxWidth: 1200, margin: "0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" },
  logoArea: { display: "flex", alignItems: "center", gap: 10 },
  avatarCircle: { width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: "2px solid rgba(255,255,255,0.35)" },
  logoTitle: { fontFamily: "'Baloo 2', cursive", fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1.1 },
  logoSub: { fontSize: 10, color: "rgba(255,255,255,0.7)", letterSpacing: "0.3px" },
  headerRight: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" },
  headerIconBtn: { width: 34, height: 34, borderRadius: 10, border: "none", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  regionChangeBtn: { background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "'Noto Sans', sans-serif", fontWeight: 600 },
  userChip: { background: "rgba(255,255,255,0.15)", color: "#fff", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 },
  profileChip: { background: "rgba(255,255,255,0.2)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.35)", padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: 700, fontFamily: "'Noto Sans', sans-serif", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" },
  headerBadge: { display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.15)", color: "#fff", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 },
  dot: { width: 7, height: 7, borderRadius: "50%", background: "#90EE90", display: "inline-block", boxShadow: "0 0 6px #90EE90" },
  logoutBtn: { background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", padding: "4px 10px", borderRadius: 20, fontSize: 11, cursor: "pointer", fontFamily: "'Noto Sans', sans-serif" },
  refreshBtn: { width: 36, height: 36, borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  festiveBanner: { padding: "5px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 0, overflow: "hidden", whiteSpace: "nowrap" },
  layout: { maxWidth: 1200, margin: "0 auto", display: "flex", gap: 16, padding: "14px 20px", height: "calc(100vh - 95px)", position: "relative", zIndex: 1 },
  sidebar: { width: 240, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" },
  avatarCard: { borderRadius: 14, padding: "12px 14px", textAlign: "center", color: "#fff" },
  avatarCardName: { fontFamily: "'Baloo 2', cursive", fontSize: 14, fontWeight: 800, marginBottom: 1 },
  avatarCardRole: { fontSize: 11, opacity: 0.8, marginBottom: 4 },
  stateTag: { display: "inline-block", background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "2px 10px", fontSize: 11, color: "#fff", marginTop: 4, fontWeight: 600 },
  stateTagOLD: { background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: "3px 10px", fontSize: 11, fontWeight: 600, display: "inline-block", marginBottom: 4 },
  langTag: { background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "3px 10px", fontSize: 10, display: "inline-block", marginBottom: 8 },
  audioControls: { display: "flex", gap: 6, justifyContent: "center", marginTop: 4 },
  audioBtn: { border: "none", color: "#fff", borderRadius: 10, padding: "4px 10px", cursor: "pointer", fontSize: 11, fontFamily: "'Noto Sans', sans-serif", fontWeight: 600 },
  sideSection: { background: "#fff", borderRadius: 12, padding: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
  sideTitle: { fontFamily: "'Baloo 2', cursive", fontWeight: 700, fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" },
  catBtn: { width: "100%", textAlign: "left", background: "none", border: "none", padding: "5px 8px", borderRadius: 7, cursor: "pointer", fontSize: 12, color: "#444", fontFamily: "'Noto Sans', sans-serif", display: "block", marginBottom: 1 },
  quickBtn: { width: "100%", textAlign: "left", padding: "6px 9px", borderRadius: 7, cursor: "pointer", fontSize: 11, color: "#555", fontFamily: "'Noto Sans', sans-serif", marginBottom: 5, lineHeight: 1.4, border: "none" },
  sideNote: { borderRadius: 12, padding: 12, color: "#fff", fontSize: 11, lineHeight: 1.6 },
  sideNoteTitle: { fontWeight: 700, fontSize: 12, marginBottom: 4 },
  chatArea: { flex: 1, display: "flex", flexDirection: "column", borderRadius: 18, overflow: "hidden" },
  messages: { flex: 1, overflowY: "auto", padding: "18px", display: "flex", flexDirection: "column", gap: 12 },
  msgRow: { display: "flex", alignItems: "flex-end", gap: 9, animation: "fadeIn 0.3s ease" },
  avatar: { width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" },
  userAvatar: { width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 },
  botBubble: { borderRadius: "16px 16px 16px 4px", padding: "11px 14px", maxWidth: "72%", fontSize: 13.5, lineHeight: 1.7, color: "#333", position: "relative" },
  userBubble: { borderRadius: "16px 16px 4px 16px", padding: "11px 14px", maxWidth: "72%", fontSize: 13.5, lineHeight: 1.7, color: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" },
  speakBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 13, marginLeft: 4, opacity: 0.6, verticalAlign: "middle" },
  typing: { display: "flex", gap: 4, alignItems: "center", padding: "3px 0" },
  typingDot: { width: 7, height: 7, borderRadius: "50%", display: "inline-block", animation: "bounce 1.2s infinite" },
  inputArea: { padding: "12px 16px", background: "#FAFAFA" },
  listeningBanner: { color: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, marginBottom: 8, textAlign: "center", animation: "pulse 1.2s infinite" },
  inputRow: { display: "flex", gap: 8, alignItems: "flex-end" },
  textarea: { flex: 1, borderRadius: 11, padding: "10px 13px", fontSize: 13.5, fontFamily: "'Noto Sans', sans-serif", resize: "none", outline: "none", lineHeight: 1.5, color: "#333", background: "#fff" },
  voiceBtn: { width: 44, height: 44, borderRadius: 11, border: "none", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  sendBtn: { width: 44, height: 44, borderRadius: 11, border: "none", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  inputHint: { textAlign: "center", fontSize: 10.5, color: "#aaa", marginTop: 6 },
};
