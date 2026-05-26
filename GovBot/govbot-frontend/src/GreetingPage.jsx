import { useEffect, useState } from "react";
import { REGIONS } from "./regions.js";

export default function GreetingPage({ user, region, onDone }) {
  const [step, setStep] = useState(0);
  const r = REGIONS[region];

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setStep(3), 2200),
      setTimeout(() => setStep(4), 3200),
      setTimeout(() => onDone(), 4800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const particles = Array.from({ length: 24 }, (_, i) => ({
    emoji: r.festive[i % r.festive.length],
    left: `${(i * 17 + 5) % 95}%`,
    delay: `${(i * 0.18).toFixed(2)}s`,
    duration: `${2.5 + (i % 4) * 0.5}s`,
    size: `${16 + (i % 3) * 8}px`,
  }));

  return (
    <div style={{ ...gs.root, background: r.greetingBg }}>
      {/* Animated particles */}
      {particles.map((p, i) => (
        <div key={i} style={{ ...gs.particle, left: p.left, fontSize: p.size, animationDuration: p.duration, animationDelay: p.delay }}>
          {p.emoji}
        </div>
      ))}

      {/* Mandala / decorative rings */}
      <div style={gs.ring1} />
      <div style={gs.ring2} />
      <div style={gs.ring3} />

      {/* Content */}
      <div style={gs.content}>
        {/* Avatar */}
        <div style={{ ...gs.avatarWrap, opacity: step >= 1 ? 1 : 0, transform: step >= 1 ? "scale(1) translateY(0)" : "scale(0.5) translateY(40px)" }}>
          <div style={{ ...gs.avatarGlow, boxShadow: `0 0 60px ${r.colors.primary}88` }} />
          <div style={gs.avatarCircle}>
            <span style={gs.avatarEmoji}>{r.avatarEmoji}</span>
          </div>
          <div style={gs.avatarRing} />
        </div>

        {/* Welcome text */}
        <div style={{ ...gs.welcomeText, opacity: step >= 2 ? 1 : 0, transform: step >= 2 ? "translateY(0)" : "translateY(30px)" }}>
          {r.greeting.split("!")[0]}! 🙏
        </div>

        {/* Name */}
        <div style={{ ...gs.userName, opacity: step >= 3 ? 1 : 0, transform: step >= 3 ? "translateY(0)" : "translateY(20px)" }}>
          Welcome, <span style={gs.nameHighlight}>{user.name}</span>
        </div>

        {/* Region badge */}
        <div style={{ ...gs.regionBadge, opacity: step >= 3 ? 1 : 0 }}>
          <span style={gs.regionEmoji}>{r.emoji}</span>
          <span>{r.name}</span>
          <span style={gs.avatarTag}>• {r.avatarName} will guide you</span>
        </div>

        {/* Sub greeting */}
        <div style={{ ...gs.subText, opacity: step >= 4 ? 1 : 0 }}>
          {r.subGreeting}
        </div>

        {/* Loading bar */}
        <div style={gs.loadingTrack}>
          <div style={{ ...gs.loadingBar, width: step >= 4 ? "100%" : step >= 3 ? "75%" : step >= 2 ? "50%" : step >= 1 ? "25%" : "0%" }} />
        </div>
        <div style={gs.loadingText}>Loading your experience...</div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Noto+Sans:wght@400;500&display=swap');
        @keyframes float {
          0% { transform: translateY(110vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-10vh) rotate(360deg); opacity: 0; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

const gs = {
  root: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative", overflow: "hidden", fontFamily: "'Noto Sans', sans-serif",
  },
  particle: {
    position: "absolute", bottom: "-10%",
    animation: "float linear infinite",
    zIndex: 1, userSelect: "none", pointerEvents: "none",
  },
  ring1: {
    position: "absolute", width: 600, height: 600, borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.08)",
    top: "50%", left: "50%", transform: "translate(-50%,-50%)",
    animation: "spin-slow 30s linear infinite",
  },
  ring2: {
    position: "absolute", width: 400, height: 400, borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.12)",
    top: "50%", left: "50%", transform: "translate(-50%,-50%)",
    animation: "spin-slow 20s linear infinite reverse",
  },
  ring3: {
    position: "absolute", width: 200, height: 200, borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.15)",
    top: "50%", left: "50%", transform: "translate(-50%,-50%)",
    animation: "spin-slow 10s linear infinite",
  },
  content: {
    position: "relative", zIndex: 10, textAlign: "center",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
  },
  avatarWrap: {
    position: "relative", transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
    marginBottom: 8,
  },
  avatarGlow: {
    position: "absolute", width: 140, height: 140, borderRadius: "50%",
    top: "50%", left: "50%", transform: "translate(-50%,-50%)",
    animation: "glow-pulse 2s ease-in-out infinite",
  },
  avatarCircle: {
    width: 120, height: 120, borderRadius: "50%",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(10px)",
    border: "3px solid rgba(255,255,255,0.3)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 60, position: "relative", zIndex: 2,
  },
  avatarEmoji: { lineHeight: 1 },
  avatarRing: {
    position: "absolute", width: 130, height: 130, borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.4)",
    top: "50%", left: "50%", transform: "translate(-50%,-50%)",
    animation: "pulse-ring 2s ease-out infinite",
  },
  welcomeText: {
    fontFamily: "'Baloo 2', cursive", fontSize: 32, fontWeight: 800,
    color: "#fff", transition: "all 0.7s ease", textShadow: "0 2px 20px rgba(0,0,0,0.3)",
  },
  userName: {
    fontFamily: "'Baloo 2', cursive", fontSize: 22, color: "rgba(255,255,255,0.9)",
    transition: "all 0.7s ease",
  },
  nameHighlight: { color: "#FFD700", fontWeight: 800 },
  regionBadge: {
    background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.25)", borderRadius: 30,
    padding: "8px 20px", display: "flex", alignItems: "center", gap: 8,
    color: "#fff", fontSize: 14, fontWeight: 600, transition: "all 0.5s ease",
  },
  regionEmoji: { fontSize: 20 },
  avatarTag: { opacity: 0.8, fontSize: 12 },
  subText: {
    color: "rgba(255,255,255,0.75)", fontSize: 14, maxWidth: 340,
    lineHeight: 1.6, transition: "all 0.5s ease", textAlign: "center",
  },
  loadingTrack: {
    width: 200, height: 4, background: "rgba(255,255,255,0.2)",
    borderRadius: 2, overflow: "hidden", marginTop: 16,
  },
  loadingBar: {
    height: "100%", background: "rgba(255,255,255,0.8)",
    borderRadius: 2, transition: "width 0.6s ease",
  },
  loadingText: { color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 4 },
};
