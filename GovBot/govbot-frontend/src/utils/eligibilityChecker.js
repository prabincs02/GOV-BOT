// Module 3 — Eligibility Checker Engine
// Matches user profile against scheme rules
// Returns scored, ranked list of eligible schemes with reasons

import { SCHEME_RULES } from "./eligibilityRules.js";

/**
 * Main eligibility check — run this against user profile
 * @param {object} profile — from Firestore users/{uid}/profile/main
 * @param {array} vaultDocs — from Firestore users/{uid}/documents
 * @returns {object} { eligible, partial, ineligible, missingDocSchemes }
 */
export const checkEligibility = (profile, vaultDocs = []) => {
  const results = SCHEME_RULES.map(scheme => {
    const check = checkScheme(scheme, profile, vaultDocs);
    return { ...scheme, ...check };
  });

  return {
    eligible:           results.filter(r => r.status === "eligible").sort((a, b) => b.score - a.score),
    partial:            results.filter(r => r.status === "partial").sort((a, b) => b.score - a.score),
    ineligible:         results.filter(r => r.status === "ineligible"),
    missingDocSchemes:  results.filter(r => r.status === "partial" && r.missingDocs.length > 0),
    totalEligible:      results.filter(r => r.status === "eligible").length,
    totalBenefit:       estimateTotalBenefit(results.filter(r => r.status === "eligible")),
  };
};

/**
 * Check a single scheme against profile
 */
const checkScheme = (scheme, profile, vaultDocs) => {
  const rules = scheme.rules;
  const reasons = [];        // why eligible
  const blockers = [];       // why not eligible
  const missingDocs = [];    // docs needed but not in vault
  let score = 0;

  const age = parseInt(profile.age) || 0;
  const income = profile.income || "0";
  const occupation = profile.occupation || "";
  const gender = (profile.gender || "").toLowerCase();
  const hasAadhaar = profile.hasAadhaar === true;
  const hasBank = profile.hasBankAccount === true;
  const landSize = parseFloat(profile.landSize) || 0;

  // ── Occupation check ──
  if (rules.occupation) {
    if (rules.occupation.includes(occupation)) {
      score += 25;
      reasons.push(`Your occupation (${occupation}) qualifies`);
    } else {
      blockers.push(`This scheme is for: ${rules.occupation.join(", ")}`);
    }
  }

  // ── Age checks ──
  if (rules.minAge && age < rules.minAge) {
    blockers.push(`Minimum age required: ${rules.minAge} years (you: ${age})`);
  } else if (rules.minAge) {
    score += 10;
  }

  if (rules.maxAge && age > rules.maxAge) {
    blockers.push(`Maximum age: ${rules.maxAge} years (you: ${age})`);
  } else if (rules.maxAge) {
    score += 10;
  }

  // ── Income check ──
  if (rules.maxIncome) {
    if (parseInt(income) <= parseInt(rules.maxIncome)) {
      score += 20;
      reasons.push("Your income level qualifies");
    } else {
      blockers.push("Income above scheme limit");
    }
  }

  // ── Gender check ──
  if (rules.gender) {
    if (rules.gender.some(g => gender.includes(g))) {
      score += 15;
      reasons.push("Gender eligibility ✓");
    } else if (gender) {
      blockers.push("This scheme is for women");
    }
  }

  // ── Land size check (farmers) ──
  if (rules.maxLandHectares !== undefined) {
    if (landSize <= rules.maxLandHectares || landSize === 0) {
      score += 10;
      reasons.push(`Land size qualifies (≤${rules.maxLandHectares} hectares)`);
    } else {
      blockers.push(`Land above limit: ${rules.maxLandHectares} hectares max`);
    }
  }

  // ── Aadhaar check ──
  if (rules.hasAadhaar === true) {
    if (hasAadhaar) {
      score += 15;
    } else {
      blockers.push("Aadhaar card required");
    }
  }

  // ── Bank account check ──
  if (rules.hasBankAccount === true) {
    if (hasBank) {
      score += 10;
    } else {
      blockers.push("Bank account required");
    }
  }

  // Special: PM Jan Dhan is for people WITHOUT bank account
  if (rules.hasBankAccount === false) {
    if (!hasBank) {
      score += 20;
      reasons.push("You don't have a bank account — this scheme gives you one free!");
    } else {
      blockers.push("You already have a bank account");
    }
  }

  // ── Disqualifiers ──
  if (rules.disqualifiers && rules.disqualifiers.includes(occupation)) {
    blockers.push("Government employees are not eligible");
  }

  // ── Caste check ──
  if (rules.casteCategories) {
    const casteDocs = vaultDocs.filter(d => d.docType === "caste");
    if (casteDocs.length > 0) {
      score += 15;
      reasons.push("Caste certificate available");
    } else {
      missingDocs.push("caste");
    }
  }

  // ── Document vault check ──
  const ownedDocTypes = vaultDocs.map(d => d.docType);
  for (const reqDoc of scheme.requiredDocs) {
    if (!ownedDocTypes.includes(reqDoc)) {
      missingDocs.push(reqDoc);
    } else {
      score += 5;
    }
  }

  // ── Determine status ──
  let status;
  if (blockers.length > 0) {
    status = "ineligible";
    score = Math.max(0, score - blockers.length * 20);
  } else if (missingDocs.length > 0) {
    status = "partial";   // eligible but missing docs
    score += scheme.points * 3;
  } else {
    status = "eligible";
    score += scheme.points * 5;
    reasons.push("All requirements met ✅");
  }

  return { status, score, reasons, blockers, missingDocs };
};

/**
 * Rough estimate of total annual benefit from eligible schemes
 */
const estimateTotalBenefit = (eligibleSchemes) => {
  const benefitMap = {
    "pm_kisan": 6000,
    "ayushman_bharat": 500000,
    "pm_jan_dhan": 200000,
    "nsap_pension": 6000,
    "atal_pension": 60000,
    "pm_jeevan_jyoti": 200000,
    "pm_suraksha_bima": 200000,
    "ujjwala": 1600,
    "pm_mudra": 500000,
    "nsp_scholarship": 10000,
  };
  let total = 0;
  for (const s of eligibleSchemes) {
    total += benefitMap[s.id] || 0;
  }
  return total;
};

/**
 * Get top N scheme recommendations for chat context
 * Returns a concise string for AI system prompt injection
 */
export const getEligibilitySummary = (profile, vaultDocs = []) => {
  const { eligible, partial, totalEligible } = checkEligibility(profile, vaultDocs);
  const top5 = [...eligible, ...partial].slice(0, 5);

  if (top5.length === 0) return "";

  const lines = top5.map((s, i) =>
    `${i + 1}. ${s.name} — ${s.benefit}${s.status === "partial" ? " [needs: " + s.missingDocs.join(", ") + "]" : ""}`
  );

  return `\n\nUSER ELIGIBILITY (${totalEligible} schemes found):\n${lines.join("\n")}`;
};

/**
 * Quick check — is user eligible for a specific scheme by id?
 */
export const isEligibleFor = (schemeId, profile, vaultDocs = []) => {
  const scheme = SCHEME_RULES.find(s => s.id === schemeId);
  if (!scheme) return false;
  const result = checkScheme(scheme, profile, vaultDocs);
  return result.status === "eligible";
};
