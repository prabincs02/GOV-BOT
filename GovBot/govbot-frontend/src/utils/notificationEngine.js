// Module 7 — Smart Notification Engine
// Generates intelligent alerts based on user profile, vault docs, applications & schemes

import { SCHEME_RULES } from "./eligibilityRules.js";

// ─── Scheme deadlines & seasonal windows ───────────────────────────────────
const SCHEME_DEADLINES = {
  pm_fasal_bima: {
    windows: [
      { name: "Kharif season", month: 6, endMonth: 7, label: "June–July" },
      { name: "Rabi season",   month: 11, endMonth: 12, label: "Nov–Dec" },
    ],
    urgent: "Crop insurance enrollment closes soon! Miss it and lose coverage for the entire season.",
  },
  pm_kisan: {
    windows: [{ name: "Installment", month: 0, endMonth: 11, label: "Year-round" }],
    tip: "PM-KISAN pays ₹2,000 every 4 months. Check your bank for the latest installment.",
  },
  nsp: {
    windows: [{ name: "Scholarship window", month: 9, endMonth: 11, label: "Oct–Nov" }],
    urgent: "National Scholarship Portal is open! Apply before November for this academic year.",
  },
  pmkvy: {
    windows: [{ name: "Enrollment", month: 0, endMonth: 11, label: "Year-round" }],
    tip: "PMKVY skill training batches start monthly. Enroll now to get certified.",
  },
};

// ─── Generate all notifications for a user ──────────────────────────────────
export function generateNotifications({ userProfile, vaultDocs, applications, selectedState }) {
  const notifications = [];
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-indexed

  if (!userProfile) return [];

  // ── 1. Profile completeness alerts ──────────────────────────────────────
  const profileFields = ["name","age","occupation","income","state","familySize"];
  const filledFields = profileFields.filter(f => userProfile[f]);
  const completeness = Math.round((filledFields.length / profileFields.length) * 100);

  if (completeness < 100) {
    const missing = profileFields.filter(f => !userProfile[f]);
    notifications.push({
      id: "profile_incomplete",
      type: "profile",
      priority: completeness < 50 ? "high" : "medium",
      icon: "👤",
      title: "Complete your profile",
      message: `Your profile is ${completeness}% complete. Add ${missing.join(", ")} to unlock more scheme recommendations.`,
      action: "openProfile",
      actionLabel: "Complete Profile →",
      resolved: false, // Will auto-disappear when profile is 100%
      createdAt: now.toISOString(),
    });
  }

  // ── 2. Missing document alerts ───────────────────────────────────────────
  const ownedDocs = (vaultDocs || []).map(d => d.docType);
  const criticalDocs = ["aadhaar", "bank"];
  const missingCritical = criticalDocs.filter(d => !ownedDocs.includes(d));

  if (missingCritical.length > 0) {
    notifications.push({
      id: "missing_critical_docs",
      type: "vault",
      priority: "high",
      icon: "📄",
      title: "Critical documents missing",
      message: `You're missing ${missingCritical.map(d => d === "aadhaar" ? "Aadhaar" : "Bank Passbook").join(" and ")}. These are required for almost every government scheme.`,
      action: "openVault",
      actionLabel: "Go to Vault →",
      neverAutoDismiss: true, // Only disappears when docs are actually uploaded
      createdAt: now.toISOString(),
    });
  }

  // ── 3. Eligible scheme alerts ────────────────────────────────────────────
  const eligibleSchemes = SCHEME_RULES.filter(scheme => {
    try {
      const r = scheme.rules;
      if (r.occupation && !r.occupation.includes(userProfile.occupation)) return false;
      if (r.maxAge && parseInt(userProfile.age) > r.maxAge) return false;
      if (r.minAge && parseInt(userProfile.age) < r.minAge) return false;
      if (r.disqualifiers && r.disqualifiers.includes(userProfile.occupation)) return false;
      return true;
    } catch { return false; }
  });

  const notApplied = eligibleSchemes.filter(s =>
    !(applications || []).some(a => a.schemeName?.toLowerCase().includes(s.name.toLowerCase()))
  );

  if (notApplied.length > 0) {
    notifications.push({
      id: "eligible_not_applied",
      type: "scheme",
      priority: "medium",
      icon: "🎯",
      title: `${notApplied.length} scheme${notApplied.length > 1 ? "s" : ""} you haven't applied for`,
      message: `You qualify for ${notApplied.slice(0,3).map(s => s.name).join(", ")}${notApplied.length > 3 ? ` and ${notApplied.length-3} more` : ""}. Don't miss out on these benefits!`,
      action: "openEligibility",
      actionLabel: "View Eligible Schemes →",
      createdAt: now.toISOString(),
    });
  }

  // ── 4. Seasonal deadline alerts ──────────────────────────────────────────
  Object.entries(SCHEME_DEADLINES).forEach(([schemeId, deadlineInfo]) => {
    const scheme = SCHEME_RULES.find(s => s.id === schemeId);
    if (!scheme) return;

    deadlineInfo.windows?.forEach(window => {
      const inWindow = currentMonth >= window.month - 1 && currentMonth <= window.endMonth;
      if (inWindow && deadlineInfo.urgent) {
        notifications.push({
          id: `deadline_${schemeId}`,
          type: "deadline",
          priority: "high",
          icon: "⏰",
          title: `${scheme.name} — ${window.name} open!`,
          message: deadlineInfo.urgent,
          action: "openApply",
          actionLabel: "Apply Now",
          schemeId,
          createdAt: now.toISOString(),
        });
      }
    });
  });

  // ── 5. Application follow-up alerts ──────────────────────────────────────
  (applications || []).forEach(app => {
    const daysSince = Math.floor((now - new Date(app.updatedAt || app.appliedDate)) / 86400000);

    if (app.status === "submitted" && daysSince > 14) {
      notifications.push({
        id: `followup_${app.id}`,
        type: "application",
        priority: "medium",
        icon: "📋",
        title: `Follow up on ${app.schemeName}`,
        message: `Your ${app.schemeName} application has been pending for ${daysSince} days. Time to check its status on the official portal.`,
        action: "openTracker",
        actionLabel: "Check Status",
        createdAt: now.toISOString(),
      });
    }

    if (app.status === "approved") {
      notifications.push({
        id: `approved_${app.id}`,
        type: "success",
        priority: "high",
        icon: "🎉",
        title: `${app.schemeName} approved!`,
        message: `Congratulations! Your application was approved. Check if the benefit amount has been credited to your bank account.`,
        action: "openTracker",
        actionLabel: "View Status",
        createdAt: now.toISOString(),
      });
    }
  });

  // ── 6. State-specific tips ────────────────────────────────────────────────
  if (selectedState) {
    notifications.push({
      id: `state_tip_${selectedState.replace(/\s/g,"_")}`,
      type: "tip",
      priority: "low",
      icon: "💡",
      title: `${selectedState} scheme tip`,
      message: `Did you know? ${selectedState} has additional state-level schemes on top of central government benefits. Ask Kavitha about ${selectedState}-specific schemes!`,
      action: "askChat",
      actionLabel: "Ask Kavitha 💬",
      actionData: `What are the special schemes available only in ${selectedState}?`,
      createdAt: now.toISOString(),
    });
  }

  // ── 7. PM-KISAN installment reminder (quarterly) ─────────────────────────
  if (userProfile.occupation === "farmer") {
    const installmentMonths = [3, 7, 11]; // April, Aug, Dec
    if (installmentMonths.includes(currentMonth)) {
      notifications.push({
        id: "pmkisan_installment",
        type: "reminder",
        priority: "medium",
        icon: "💰",
        title: "PM-KISAN installment due this month!",
        message: "The ₹2,000 PM-KISAN installment is typically released this month. Check your bank account or call 155261 to verify.",
        action: "askChat",
        actionLabel: "Ask Kavitha",
        actionData: "Has my PM-KISAN installment been released? How do I check?",
        createdAt: now.toISOString(),
      });
    }
  }

  // Sort: high → medium → low, then by date
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return notifications.sort((a, b) =>
    (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2)
  );
}

// ─── Browser push notification ────────────────────────────────────────────
export async function requestBrowserPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  const result = await Notification.requestPermission();
  return result;
}

export function sendBrowserNotification(title, body, icon = "🇮🇳") {
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "govbot-india",
    });
  } catch(e) { console.log("Browser notification failed:", e); }
}
