// Module 5 — Application Status Tracker
// Shows timeline of user's applications with live status updates
import { useState, useEffect } from "react";

const STATUS_STEPS = {
  submitted:  { label: "Submitted",    icon: "📤", color: "#6B21A8", done: true },
  processing: { label: "Processing",   icon: "⏳", color: "#d97706", done: false },
  approved:   { label: "Approved",     icon: "✅", color: "#16a34a", done: true },
  rejected:   { label: "Rejected",     icon: "❌", color: "#dc2626", done: true },
  pending:    { label: "Pending Docs", icon: "📋", color: "#ea580c", done: false },
  disbursed:  { label: "Disbursed",    icon: "💰", color: "#059669", done: true },
};

const SCHEME_PORTALS = {
  pm_kisan:       { checkUrl: "https://pmkisan.gov.in/BeneficiaryStatus.aspx", label: "PM-KISAN Portal" },
  ayushman_bharat:{ checkUrl: "https://mera.pmjay.gov.in/search/login",         label: "Ayushman Portal" },
  pm_awas_urban:  { checkUrl: "https://pmaymis.gov.in/",                         label: "PM Awas Portal" },
  pm_awas_gramin: { checkUrl: "https://pmayg.nic.in/netiay/home.aspx",           label: "PMAY Gramin Portal" },
  nsp:            { checkUrl: "https://scholarships.gov.in/",                    label: "NSP Portal" },
  mudra:          { checkUrl: "https://www.mudra.org.in/",                       label: "MUDRA Portal" },
  pmkvy:          { checkUrl: "https://www.pmkvyofficial.org/",                  label: "PMKVY Portal" },
};

export default function StatusTimeline({ user, region, onClose, onAskStatus }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newApp, setNewApp] = useState({ schemeName: "", refNumber: "", appliedDate: "", schemeId: "" });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");
  const c = region?.colors || {};

  useEffect(() => { loadApplications(); }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const { db, collection, getDocs, query, orderBy } = await import("./firebase.js");
      const q = query(collection(db, "users", user.uid, "applications"), orderBy("appliedDate", "desc"));
      const snap = await getDocs(q);
      setApplications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Load apps error:", e);
      setApplications([]);
    }
    setLoading(false);
  };

  const saveApplication = async () => {
    if (!newApp.schemeName || !newApp.appliedDate) return;
    setSaving(true);
    try {
      const { db, collection, addDoc } = await import("./firebase.js");
      const appData = {
        ...newApp,
        status: "submitted",
        submittedAt: new Date().toISOString(),
        appliedDate: newApp.appliedDate,
        statusHistory: [
          { status: "submitted", date: new Date().toISOString(), note: "Application logged in GovBot" }
        ],
        updatedAt: new Date().toISOString(),
      };
      await addDoc(collection(db, "users", user.uid, "applications"), appData);
      setNewApp({ schemeName: "", refNumber: "", appliedDate: "", schemeId: "" });
      setAdding(false);
      await loadApplications();
    } catch (e) {
      console.error("Save error:", e);
    }
    setSaving(false);
  };

  const updateStatus = async (appId, newStatus, note = "") => {
    try {
      const { db, doc, setDoc, getDoc } = await import("./firebase.js");
      const ref = doc(db, "users", user.uid, "applications", appId);
      const snap = await getDoc(ref);
      const existing = snap.data();
      const history = existing.statusHistory || [];
      history.push({ status: newStatus, date: new Date().toISOString(), note });
      await setDoc(ref, { status: newStatus, statusHistory: history, updatedAt: new Date().toISOString() }, { merge: true });
      await loadApplications();
    } catch (e) {
      console.error("Update error:", e);
    }
  };

  const deleteApplication = async (appId) => {
    if (!window.confirm("Remove this application from tracker?")) return;
    try {
      const { db, doc, deleteDoc } = await import("./firebase.js");
      await deleteDoc(doc(db, "users", user.uid, "applications", appId));
      await loadApplications();
    } catch (e) { console.error("Delete error:", e); }
  };

  const filtered = filter === "all" ? applications
    : applications.filter(a => {
        if (filter === "active") return ["submitted","processing","pending"].includes(a.status);
        if (filter === "done") return ["approved","disbursed","rejected"].includes(a.status);
        return true;
      });

  const counts = {
    active: applications.filter(a => ["submitted","processing","pending"].includes(a.status)).length,
    approved: applications.filter(a => ["approved","disbursed"].includes(a.status)).length,
    rejected: applications.filter(a => a.status === "rejected").length,
  };

  const formatDate = (d) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
    catch { return d; }
  };

  const daysSince = (d) => {
    if (!d) return null;
    const diff = Date.now() - new Date(d).getTime();
    const days = Math.floor(diff / 86400000);
    return days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days} days ago`;
  };

  return (
    <div style={st.overlay}>
      <div style={{ ...st.panel, background: c.bg || "#faf5ff" }}>

        {/* Header */}
        <div style={{ ...st.header, background: c.headerGrad }}>
          <div style={st.headerLeft}>
            <div style={{ fontSize: 28 }}>📋</div>
            <div>
              <div style={st.headerTitle}>Application Tracker</div>
              <div style={st.headerSub}>{applications.length} applications tracked</div>
            </div>
          </div>
          <button onClick={onClose} style={st.closeBtn}>✕</button>
        </div>

        {/* Summary strip */}
        <div style={{ ...st.summaryRow, background: c.headerGrad + "22" }}>
          {[
            { label: "Active", val: counts.active, color: "#d97706" },
            { label: "Approved", val: counts.approved, color: "#16a34a" },
            { label: "Rejected", val: counts.rejected, color: "#dc2626" },
            { label: "Total", val: applications.length, color: c.primary },
          ].map((s, i) => (
            <div key={i} style={st.summaryCard}>
              <div style={{ ...st.summaryNum, color: s.color }}>{s.val}</div>
              <div style={st.summaryLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={st.filterRow}>
          {[
            { id: "all", label: "All" },
            { id: "active", label: "🔄 Active" },
            { id: "done", label: "✅ Completed" },
          ].map(f => (
            <button key={f.id}
              style={{ ...st.filterBtn, background: filter === f.id ? c.primary : "#f3f4f6", color: filter === f.id ? "#fff" : "#555", fontWeight: filter === f.id ? 700 : 500 }}
              onClick={() => setFilter(f.id)}>{f.label}</button>
          ))}
          <button style={{ ...st.filterBtn, background: c.primary, color: "#fff", marginLeft: "auto", fontWeight: 700 }}
            onClick={() => setAdding(true)}>+ Add</button>
        </div>

        <div style={st.body}>

          {/* Add new application form */}
          {adding && (
            <div style={st.addCard}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, color: c.primary }}>➕ Track New Application</div>
              <div style={st.addField}>
                <label style={st.addLabel}>Scheme Name *</label>
                <input style={st.addInput} placeholder="e.g. PM-KISAN, Ayushman Bharat"
                  value={newApp.schemeName} onChange={e => setNewApp(p => ({ ...p, schemeName: e.target.value }))} />
              </div>
              <div style={st.addField}>
                <label style={st.addLabel}>Reference / Application Number</label>
                <input style={st.addInput} placeholder="e.g. PMKISAN-2024-123456"
                  value={newApp.refNumber} onChange={e => setNewApp(p => ({ ...p, refNumber: e.target.value }))} />
              </div>
              <div style={st.addField}>
                <label style={st.addLabel}>Date Applied *</label>
                <input style={st.addInput} type="date"
                  value={newApp.appliedDate} onChange={e => setNewApp(p => ({ ...p, appliedDate: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button style={{ ...st.saveBtn, background: c.primary, flex: 2, opacity: (!newApp.schemeName || !newApp.appliedDate) ? 0.5 : 1 }}
                  disabled={!newApp.schemeName || !newApp.appliedDate || saving}
                  onClick={saveApplication}>{saving ? "Saving..." : "✓ Save Application"}</button>
                <button style={{ ...st.saveBtn, background: "#f3f4f6", color: "#555", flex: 1 }}
                  onClick={() => setAdding(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={st.empty}><div style={{ fontSize: 32 }}>⏳</div><div>Loading applications...</div></div>
          )}

          {/* Empty state */}
          {!loading && applications.length === 0 && !adding && (
            <div style={st.empty}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>No applications tracked yet</div>
              <div style={{ color: "#888", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
                After applying for a scheme, add it here to track its status over time.
              </div>
              <button style={{ ...st.saveBtn, background: c.primary }} onClick={() => setAdding(true)}>
                ➕ Track Your First Application
              </button>
            </div>
          )}

          {/* Application cards */}
          {!loading && filtered.map((app) => {
            const statusInfo = STATUS_STEPS[app.status] || STATUS_STEPS.submitted;
            const portal = SCHEME_PORTALS[app.schemeId];
            const history = app.statusHistory || [];
            return (
              <div key={app.id} style={{ ...st.appCard, borderLeft: `4px solid ${statusInfo.color}` }}>

                {/* Card header */}
                <div style={st.cardHeader}>
                  <div style={{ flex: 1 }}>
                    <div style={st.appName}>{app.schemeName}</div>
                    {app.refNumber && (
                      <div style={st.refNum}>🔖 Ref: {app.refNumber}</div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <div style={{ ...st.statusBadge, background: statusInfo.color + "15", color: statusInfo.color }}>
                      {statusInfo.icon} {statusInfo.label}
                    </div>
                    <div style={{ fontSize: 10, color: "#aaa" }}>{daysSince(app.appliedDate)}</div>
                  </div>
                </div>

                {/* Timeline strip */}
                <div style={st.timeline}>
                  {["submitted","processing","approved","disbursed"].map((s, i) => {
                    const isActive = app.status === s;
                    const isDone = history.some(h => h.status === s);
                    const isCurrent = ["submitted","processing"].includes(app.status) && s === "submitted" && !isDone;
                    return (
                      <div key={s} style={{ display: "flex", alignItems: "center", flex: i < 3 ? 1 : 0 }}>
                        <div style={{
                          ...st.dot,
                          background: isDone || isActive ? statusInfo.color : "#e5e7eb",
                          border: isActive ? `2px solid ${statusInfo.color}` : "2px solid transparent",
                          boxShadow: isActive ? `0 0 0 3px ${statusInfo.color}20` : "none",
                        }}>
                          {isDone ? "✓" : isActive ? "●" : ""}
                        </div>
                        {i < 3 && <div style={{ ...st.line, background: isDone ? statusInfo.color : "#e5e7eb" }} />}
                      </div>
                    );
                  })}
                </div>
                <div style={st.timelineLabels}>
                  {["Submitted","Processing","Approved","Disbursed"].map(l => (
                    <div key={l} style={st.timelineLabel}>{l}</div>
                  ))}
                </div>

                {/* Date + actions */}
                <div style={st.cardFooter}>
                  <span style={{ fontSize: 11, color: "#aaa" }}>Applied: {formatDate(app.appliedDate)}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    {/* Status update buttons */}
                    {app.status === "submitted" && (
                      <button style={{ ...st.actionBtn, background: "#dbeafe", color: "#1d4ed8" }}
                        onClick={() => updateStatus(app.id, "processing", "Status updated")}>Processing →</button>
                    )}
                    {app.status === "processing" && (
                      <>
                        <button style={{ ...st.actionBtn, background: "#dcfce7", color: "#16a34a" }}
                          onClick={() => updateStatus(app.id, "approved", "Application approved")}>✅ Approved</button>
                        <button style={{ ...st.actionBtn, background: "#fee2e2", color: "#dc2626" }}
                          onClick={() => updateStatus(app.id, "rejected", "Application rejected")}>❌ Rejected</button>
                      </>
                    )}
                    {app.status === "approved" && (
                      <button style={{ ...st.actionBtn, background: "#dcfce7", color: "#059669" }}
                        onClick={() => updateStatus(app.id, "disbursed", "Amount disbursed to bank")}>💰 Disbursed</button>
                    )}
                    {/* Check status link */}
                    {portal && (
                      <a href={portal.checkUrl} target="_blank" rel="noopener noreferrer"
                        style={{ ...st.actionBtn, background: c.primary + "15", color: c.primary, textDecoration: "none" }}>
                        🔍 Check
                      </a>
                    )}
                    {/* Ask in chat */}
                    {onAskStatus && (
                      <button style={{ ...st.actionBtn, background: "#f3f4f6", color: "#555" }}
                        onClick={() => { onAskStatus(app.schemeName); onClose(); }}>
                        💬 Ask
                      </button>
                    )}
                    <button style={{ ...st.actionBtn, background: "#fee2e2", color: "#dc2626" }}
                      onClick={() => deleteApplication(app.id)}>🗑️</button>
                  </div>
                </div>

                {/* Latest status note */}
                {history.length > 0 && history[history.length - 1].note && (
                  <div style={st.lastNote}>
                    📝 {history[history.length - 1].note} — {formatDate(history[history.length - 1].date)}
                  </div>
                )}
              </div>
            );
          })}

          {/* Tip box */}
          {!loading && applications.length > 0 && (
            <div style={st.tipBox}>
              <div style={{ fontWeight: 700, fontSize: 12, color: c.primary, marginBottom: 6 }}>💡 How to track status</div>
              <div style={{ fontSize: 11, color: "#666", lineHeight: 1.7 }}>
                1. Click <strong>Check</strong> to visit the official portal and verify status<br/>
                2. Update the status here manually after checking<br/>
                3. Click <strong>Ask</strong> to ask Kavitha about your application in chat<br/>
                4. Reference number is needed for official status checks
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

const st = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(6px)" },
  panel: { width: "100%", maxWidth: 560, height: "92vh", borderRadius: "20px 20px 0 0", display: "flex", flexDirection: "column", overflow: "hidden", animation: "slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)", boxShadow: "0 -20px 60px rgba(0,0,0,0.3)", fontFamily: "'Noto Sans', sans-serif" },
  header: { padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  headerTitle: { fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 18, color: "#fff" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 1 },
  closeBtn: { background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", fontSize: 14, cursor: "pointer" },
  summaryRow: { display: "flex", padding: "12px 16px", gap: 8, flexShrink: 0 },
  summaryCard: { flex: 1, textAlign: "center", background: "#fff", borderRadius: 10, padding: "8px 4px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" },
  summaryNum: { fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 20 },
  summaryLabel: { fontSize: 10, color: "#888", fontWeight: 600, textTransform: "uppercase" },
  filterRow: { display: "flex", gap: 6, padding: "10px 16px", flexShrink: 0, alignItems: "center" },
  filterBtn: { padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontFamily: "'Noto Sans', sans-serif" },
  body: { flex: 1, overflowY: "auto", padding: "12px 16px 24px" },
  addCard: { background: "#fff", borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" },
  addField: { marginBottom: 10 },
  addLabel: { display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 4 },
  addInput: { width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid #e5e7eb", fontSize: 13, fontFamily: "'Noto Sans', sans-serif", boxSizing: "border-box", outline: "none" },
  saveBtn: { padding: "10px 16px", borderRadius: 10, border: "none", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Baloo 2', cursive" },
  empty: { textAlign: "center", padding: "40px 20px", color: "#888" },
  appCard: { background: "#fff", borderRadius: 14, padding: "14px", marginBottom: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.07)" },
  cardHeader: { display: "flex", gap: 10, marginBottom: 12 },
  appName: { fontWeight: 800, fontSize: 14, color: "#222" },
  refNum: { fontSize: 11, color: "#888", marginTop: 3 },
  statusBadge: { padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 },
  timeline: { display: "flex", alignItems: "center", marginBottom: 4 },
  dot: { width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", flexShrink: 0, transition: "all 0.3s" },
  line: { flex: 1, height: 3, borderRadius: 2, transition: "background 0.3s" },
  timelineLabels: { display: "flex", justifyContent: "space-between", marginBottom: 10 },
  timelineLabel: { fontSize: 9, color: "#aaa", fontWeight: 600, textAlign: "center", flex: 1 },
  cardFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 },
  actionBtn: { padding: "4px 10px", borderRadius: 8, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3 },
  lastNote: { marginTop: 8, fontSize: 11, color: "#888", background: "#f9f9f9", padding: "6px 10px", borderRadius: 8, fontStyle: "italic" },
  tipBox: { background: "#f8f4ff", borderRadius: 12, padding: "12px 14px", marginTop: 4 },
};
