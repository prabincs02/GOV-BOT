import { useState } from "react";
import { ALL_REGION_STATES } from "./regions.js";

export default function StateSelector({ region, onSelect }) {
  const [selectedState, setSelectedState] = useState(null);
  const c = region.colors;
  const states = ALL_REGION_STATES[region.id] || {};

  const handleLangChoice = (useNative) => {
    onSelect(selectedState, useNative);
  };

  return (
    <div style={ss.overlay}>
      <div style={{ ...ss.modal, border: `2px solid ${c.botBubbleBorder}` }}>
        {!selectedState ? (
          <>
            <div style={ss.icon}>{region.emoji}</div>
            <div style={{ ...ss.title, color: c.primary }}>Which state are you from?</div>
            <div style={ss.subtitle}>I'll personalise your experience based on your state!</div>
            <div style={ss.stateGrid}>
              {Object.entries(states).map(([state, info]) => (
                <button
                  key={state}
                  style={{ ...ss.stateBtn, borderColor: c.primary }}
                  onClick={() => setSelectedState(state)}
                >
                  <div style={{ ...ss.stateName, color: c.primary }}>{state}</div>
                  <div style={ss.stateNative}>{info.nativeName}</div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={ss.icon}>🗣️</div>
            <div style={{ ...ss.title, color: c.primary }}>
              {states[selectedState]?.nativeName} selected!
            </div>
            <div style={ss.subtitle}>
              Would you like to chat in your native language or English?
            </div>
            <div style={ss.langRow}>
              <button
                style={{ ...ss.langBtn, background: c.headerGrad, color: "#fff", border: "none" }}
                onClick={() => handleLangChoice(true)}
              >
                <div style={ss.langEmoji}>🗣️</div>
                <div style={ss.langName}>{states[selectedState]?.nativeName}</div>
                <div style={{ ...ss.langSub, color: "rgba(255,255,255,0.8)" }}>Native Language</div>
              </button>
              <button
                style={{ ...ss.langBtn, background: "#f8fafc", border: `2px solid ${c.primary}` }}
                onClick={() => handleLangChoice(false)}
              >
                <div style={ss.langEmoji}>🇬🇧</div>
                <div style={{ ...ss.langName, color: c.primary }}>English</div>
                <div style={{ ...ss.langSub, color: "#888" }}>International</div>
              </button>
            </div>
            <button style={{ ...ss.backBtn, color: c.primary }} onClick={() => setSelectedState(null)}>
              ← Change State
            </button>
          </>
        )}
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&display=swap');
        @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

const ss = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 100, backdropFilter: "blur(4px)",
  },
  modal: {
    background: "#fff", borderRadius: 24, padding: "32px 28px",
    maxWidth: 480, width: "92%", textAlign: "center",
    boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
    animation: "slideUp 0.4s ease", maxHeight: "85vh", overflowY: "auto",
  },
  icon: { fontSize: 44, marginBottom: 10 },
  title: { fontFamily: "'Baloo 2', cursive", fontSize: 22, fontWeight: 800, marginBottom: 6 },
  subtitle: { color: "#888", fontSize: 13, marginBottom: 20, lineHeight: 1.5 },
  stateGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  stateBtn: {
    padding: "12px 14px", borderRadius: 12, background: "#fafafa",
    border: "2px solid", cursor: "pointer", textAlign: "center",
    transition: "all 0.2s", fontFamily: "'Noto Sans', sans-serif",
  },
  stateName: { fontWeight: 700, fontSize: 13, marginBottom: 3 },
  stateNative: { fontSize: 13, color: "#888" },
  langRow: { display: "flex", gap: 14, justifyContent: "center", marginBottom: 16 },
  langBtn: {
    flex: 1, padding: "20px 14px", borderRadius: 16, cursor: "pointer",
    textAlign: "center", transition: "all 0.2s",
    fontFamily: "'Noto Sans', sans-serif",
  },
  langEmoji: { fontSize: 30, marginBottom: 8 },
  langName: { fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 15, marginBottom: 2 },
  langSub: { fontSize: 11 },
  backBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 },
};
