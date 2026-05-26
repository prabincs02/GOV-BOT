// Module 7 — Notification Center UI
// Bell icon with badge + slide-down panel showing all smart alerts

import { useState, useEffect, useRef } from "react";
import { generateNotifications, requestBrowserPermission, sendBrowserNotification } from "./utils/notificationEngine.js";

const PRIORITY_COLORS = {
  high:   { bg: "#fef2f2", border: "#fecaca", dot: "#dc2626", badge: "#dc2626" },
  medium: { bg: "#fffbeb", border: "#fde68a", dot: "#d97706", badge: "#d97706" },
  low:    { bg: "#f0fdf4", border: "#bbf7d0", dot: "#16a34a", badge: "#16a34a" },
};

const TYPE_ICONS = {
  profile:     "👤",
  vault:       "🔐",
  scheme:      "🎯",
  deadline:    "⏰",
  application: "📋",
  success:     "🎉",
  tip:         "💡",
  reminder:    "💰",
};

export default function NotificationCenter({
  userProfile, vaultDocs, applications, selectedState,
  region, onAction, unreadCount, setUnreadCount,
  activeTheme, themeStyles,
}) {
  const th = themeStyles || {};
  const isDark = activeTheme === "neon" || activeTheme === "glass";
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("govbot_dismissed_notifs_v2") || "{}");
      const now = Date.now();
      // Only keep non-expired dismissals
      return Object.keys(stored).filter(k => stored[k] > now);
    } catch { return []; }
  });
  const [browserPerm, setBrowserPerm] = useState(Notification?.permission || "default");
  const panelRef = useRef(null);       // wraps the bell button
  const panelDropRef = useRef(null);   // wraps the fixed dropdown panel
  const c = region?.colors || {};

  // Generate notifications whenever data changes
  useEffect(() => {
    const all = generateNotifications({ userProfile, vaultDocs, applications, selectedState });
    // neverAutoDismiss notifications always show if condition is still true
    const visible = all.filter(n => {
      if (n.neverAutoDismiss) return true; // always show — condition-driven
      return !dismissed.includes(n.id);
    });
    setNotifications(visible);
    const highCount = visible.filter(n => n.priority === "high" || n.priority === "medium").length;
    setUnreadCount?.(highCount);

    // Send browser notification for first high-priority unseen alert
    const firstHigh = visible.find(n => n.priority === "high");
    if (firstHigh && browserPerm === "granted") {
      sendBrowserNotification(`GovBot — ${firstHigh.title}`, firstHigh.message);
    }
  }, [userProfile, vaultDocs, applications, selectedState, dismissed]);

  // Close on outside click — check both bell button and fixed dropdown panel
  useEffect(() => {
    const handler = (e) => {
      const clickedBell = panelRef.current && panelRef.current.contains(e.target);
      const clickedPanel = panelDropRef.current && panelDropRef.current.contains(e.target);
      if (!clickedBell && !clickedPanel) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const dismiss = (id, expiresHours = 48) => {
    const expiry = Date.now() + (expiresHours * 60 * 60 * 1000);
    const stored = JSON.parse(localStorage.getItem("govbot_dismissed_notifs_v2") || "{}");
    stored[id] = expiry;
    try { localStorage.setItem("govbot_dismissed_notifs_v2", JSON.stringify(stored)); } catch {}
    setDismissed(Object.keys(stored).filter(k => stored[k] > Date.now()));
  };

  const dismissAll = () => {
    const stored = JSON.parse(localStorage.getItem("govbot_dismissed_notifs_v2") || "{}");
    const expiry = Date.now() + (24 * 60 * 60 * 1000); // 24h for bulk dismiss
    notifications.forEach(n => { stored[n.id] = expiry; });
    try { localStorage.setItem("govbot_dismissed_notifs_v2", JSON.stringify(stored)); } catch {}
    setDismissed(Object.keys(stored).filter(k => stored[k] > Date.now()));
    setOpen(false);
  };

  const handleAction = (notif) => {
    setOpen(false);
    // Only auto-dismiss non-recurring notifications
    // Recurring ones (tip, reminder) stay until manually dismissed
    if (!["tip","reminder"].includes(notif.type)) {
      dismiss(notif.id);
    }
    onAction?.(notif.action, notif.actionData || notif.schemeId);
  };

  const requestPermission = async () => {
    const result = await requestBrowserPermission();
    setBrowserPerm(result);
  };

  const highCount = notifications.filter(n => n.priority === "high").length;
  const badgeCount = notifications.length;

  return (
    <div style={{ position: "relative" }} ref={panelRef}>

      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 34, height: 34, borderRadius: 10, border: "none",
          background: open ? (th.headerBtnBg ? th.headerBtnBg.replace("0.2","0.35") : "rgba(255,255,255,0.35)") : (th.headerBtnBg || "rgba(255,255,255,0.2)"),
          border: th.headerBtnBorder || "none",
          color: th.headerTextColor || "#fff", fontSize: 16, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", transition: "background 0.2s",
        }}
        title="Notifications"
      >
        🔔
        {badgeCount > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            background: highCount > 0 ? "#dc2626" : "#d97706",
            color: "#fff", borderRadius: "50%",
            width: 16, height: 16, fontSize: 9, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1.5px solid #fff",
            fontFamily: "'Noto Sans', sans-serif",
          }}>
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        )}
      </button>

      {/* Notification panel — position:fixed so it escapes header overflow:hidden (festive/neon themes) */}
      {open && (
        <div ref={panelDropRef} style={{
          position: "fixed", top: 54, right: 12,
          width: 340, maxHeight: 480,
          background: isDark ? (activeTheme === "neon" ? "#0d0d1a" : "rgba(15,0,40,0.92)") : "#fff",
          backdropFilter: isDark ? "blur(20px)" : "none",
          WebkitBackdropFilter: isDark ? "blur(20px)" : "none",
          border: isDark ? `1px solid ${th.sideSectionBorder || "rgba(124,58,237,0.3)"}` : "1px solid #f0f0f0",
          borderRadius: 16,
          boxShadow: isDark ? `0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px ${th.cardBorder || "rgba(124,58,237,0.2)"}` : "0 8px 40px rgba(0,0,0,0.18)",
          overflow: "hidden", zIndex: 9999,
          display: "flex", flexDirection: "column",
          animation: "notifSlide 0.2s ease-out",
          fontFamily: "'Noto Sans', sans-serif",
        }}>

          {/* Panel header */}
          <div style={{
            background: th.headerBg || c.headerGrad || "linear-gradient(135deg,#6B21A8,#9333ea)",
            padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 14, fontFamily: "'Baloo 2', cursive" }}>
              🔔 Notifications {badgeCount > 0 && <span style={{ opacity: 0.8, fontWeight: 500, fontSize: 12 }}>({badgeCount})</span>}
            </div>
            {notifications.length > 0 && (
              <button onClick={dismissAll} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>
                Clear all
              </button>
            )}
          </div>

          {/* Browser permission banner */}
          {browserPerm === "default" && (
            <div style={{ background: "#f0fdf4", borderBottom: "1px solid #bbf7d0", padding: "10px 14px", display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 18 }}>🔔</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: "#166534" }}>Enable push notifications</div>
                <div style={{ fontSize: 11, color: "#555", marginTop: 1 }}>Get alerts even when GovBot is closed</div>
              </div>
              <button onClick={requestPermission} style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                Allow
              </button>
            </div>
          )}

          {/* Notification list */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: isDark ? "rgba(255,255,255,0.35)" : "#aaa" }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: isDark ? "rgba(255,255,255,0.7)" : "#333" }}>All caught up!</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>No new alerts right now.</div>
              </div>
            ) : (
              notifications.map((notif) => {
                const colors = PRIORITY_COLORS[notif.priority] || PRIORITY_COLORS.low;
                return (
                  <div key={notif.id} style={{
                    background: isDark ? (activeTheme === "neon" ? "rgba(124,58,237,0.08)" : "rgba(255,255,255,0.04)") : colors.bg,
                    borderBottom: isDark ? "1px solid rgba(124,58,237,0.15)" : `1px solid ${colors.border}`,
                    padding: "12px 14px",
                    display: "flex", gap: 10, alignItems: "flex-start",
                  }}>
                    {/* Priority dot + icon */}
                    <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginTop: 2 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors.dot }} />
                      <span style={{ fontSize: 20 }}>{notif.icon}</span>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: isDark ? "rgba(255,255,255,0.9)" : "#222", marginBottom: 3 }}>{notif.title}</div>
                      <div style={{ fontSize: 11, color: isDark ? "rgba(255,255,255,0.55)" : "#555", lineHeight: 1.5, marginBottom: 8 }}>{notif.message}</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => handleAction(notif)} style={{
                          background: notif.action === "askChat" ? "#059669" : (c.primary || "#6B21A8"),
                          color: "#fff", border: "none",
                          borderRadius: 7, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer",
                        }}
                          title={notif.action === "askChat" ? `Will send: "${notif.actionData}"` : ""}
                        >
                          {notif.actionLabel}
                        </button>
                        {!notif.neverAutoDismiss && (
                          <button onClick={() => dismiss(notif.id)} style={{
                            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", color: isDark ? "rgba(255,255,255,0.5)" : "#888", border: "none",
                            borderRadius: 7, padding: "4px 8px", fontSize: 11, cursor: "pointer",
                          }}>
                            Dismiss
                          </button>
                        )}
                        {notif.neverAutoDismiss && (
                          <span style={{ fontSize: 10, color: "#aaa", padding: "4px 6px" }}>
                            ✓ Auto-resolves when done
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer tip */}
          {notifications.length > 0 && (
            <div style={{ padding: "8px 14px", background: isDark ? "rgba(0,0,0,0.3)" : "#fafafa", borderTop: isDark ? "1px solid rgba(124,58,237,0.15)" : "1px solid #f0f0f0", fontSize: 10, color: isDark ? "rgba(255,255,255,0.35)" : "#aaa", textAlign: "center" }}>
              Alerts are based on your profile & applications
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes notifSlide { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
