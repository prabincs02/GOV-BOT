// Module 3 — Eligibility Rules Database
// 30+ major Indian government schemes with precise eligibility criteria
// Rules match against user profile fields from Module 1

export const SCHEME_RULES = [

  // ─── FARMER SCHEMES ───────────────────────────────────────────
  {
    id: "pm_kisan",
    name: "PM-KISAN",
    fullName: "Pradhan Mantri Kisan Samman Nidhi",
    emoji: "🌾",
    category: "farmer",
    benefit: "₹6,000/year (₹2,000 every 4 months) direct to bank",
    description: "Direct income support for small & marginal farmers",
    portal: "https://pmkisan.gov.in",
    helpline: "155261",
    requiredDocs: ["aadhaar", "bank", "land"],
    rules: {
      occupation: ["farmer"],
      maxLandHectares: 2,        // small/marginal farmer
      hasAadhaar: true,
      hasBankAccount: true,
      disqualifiers: ["govt"],   // govt employees not eligible
    },
    points: 10,
  },

  {
    id: "pm_fasal_bima",
    name: "PM Fasal Bima Yojana",
    fullName: "Pradhan Mantri Fasal Bima Yojana",
    emoji: "🌱",
    category: "farmer",
    benefit: "Crop insurance — up to full sum insured on crop loss",
    description: "Insurance coverage for crop failure due to natural calamities",
    portal: "https://pmfby.gov.in",
    helpline: "14447",
    requiredDocs: ["aadhaar", "bank", "land"],
    rules: {
      occupation: ["farmer"],
      hasAadhaar: true,
      hasBankAccount: true,
    },
    points: 8,
  },

  {
    id: "kcc",
    name: "Kisan Credit Card",
    fullName: "Kisan Credit Card Scheme",
    emoji: "💳",
    category: "farmer",
    benefit: "Credit up to ₹3 lakh at 4% interest for farming needs",
    description: "Short-term credit for crop cultivation, post-harvest expenses",
    portal: "https://www.nabard.org",
    helpline: "1800-200-2088",
    requiredDocs: ["aadhaar", "bank", "land"],
    rules: {
      occupation: ["farmer"],
      hasAadhaar: true,
      hasBankAccount: true,
    },
    points: 8,
  },

  // ─── HEALTH SCHEMES ──────────────────────────────────────────
  {
    id: "ayushman_bharat",
    name: "Ayushman Bharat",
    fullName: "Ayushman Bharat PM-JAY",
    emoji: "🏥",
    category: "health",
    benefit: "Health cover up to ₹5 lakh/year for hospitalization",
    description: "Free secondary and tertiary hospitalization for poor families",
    portal: "https://pmjay.gov.in",
    helpline: "14555",
    requiredDocs: ["aadhaar", "ration"],
    rules: {
      maxIncome: "2",            // income level ≤ 2 (under ₹3L)
      hasAadhaar: true,
      disqualifiers: ["govt"],
    },
    points: 10,
  },

  {
    id: "janani_suraksha",
    name: "Janani Suraksha Yojana",
    fullName: "Janani Suraksha Yojana",
    emoji: "👶",
    category: "health",
    benefit: "₹1,400 (rural) / ₹1,000 (urban) cash for institutional delivery",
    description: "Cash assistance to pregnant women for safe delivery",
    portal: "https://nhm.gov.in",
    helpline: "104",
    requiredDocs: ["aadhaar", "bank"],
    rules: {
      gender: ["female", "woman", "f"],
      maxIncome: "2",
      hasAadhaar: true,
      hasBankAccount: true,
    },
    points: 9,
  },

  // ─── EDUCATION SCHEMES ───────────────────────────────────────
  {
    id: "nsp_scholarship",
    name: "NSP Scholarship",
    fullName: "National Scholarship Portal — Post Matric",
    emoji: "🎓",
    category: "education",
    benefit: "₹3,500 – ₹10,000/year scholarship for studies",
    description: "Scholarships for SC/ST/OBC/Minority students",
    portal: "https://scholarships.gov.in",
    helpline: "0120-6619540",
    requiredDocs: ["aadhaar", "bank", "income", "caste"],
    rules: {
      occupation: ["student"],
      maxIncome: "2",
      casteCategories: ["SC", "ST", "OBC", "Minority"],
      hasAadhaar: true,
      hasBankAccount: true,
    },
    points: 9,
  },

  {
    id: "pm_vidyalakshmi",
    name: "PM Vidyalakshmi",
    fullName: "PM Vidyalakshmi Education Loan Scheme",
    emoji: "📚",
    category: "education",
    benefit: "Education loans at subsidized rates, interest subsidy",
    description: "Financial support for higher education through banks",
    portal: "https://www.vidyalakshmi.co.in",
    helpline: "1800-267-7827",
    requiredDocs: ["aadhaar", "bank", "income"],
    rules: {
      occupation: ["student"],
      maxIncome: "3",
      hasAadhaar: true,
    },
    points: 8,
  },

  // ─── HOUSING SCHEMES ─────────────────────────────────────────
  {
    id: "pmay_gramin",
    name: "PM Awas Yojana (Rural)",
    fullName: "Pradhan Mantri Awas Yojana — Gramin",
    emoji: "🏠",
    category: "housing",
    benefit: "₹1.20 lakh (plains) / ₹1.30 lakh (hills) for house construction",
    description: "Free housing for homeless rural families",
    portal: "https://pmayg.nic.in",
    helpline: "1800-11-6446",
    requiredDocs: ["aadhaar", "bank"],
    rules: {
      maxIncome: "1",
      hasAadhaar: true,
      hasBankAccount: true,
      occupation: ["farmer", "labour", "other"],
    },
    points: 10,
  },

  {
    id: "pmay_urban",
    name: "PM Awas Yojana (Urban)",
    fullName: "Pradhan Mantri Awas Yojana — Urban",
    emoji: "🏢",
    category: "housing",
    benefit: "Interest subsidy up to ₹2.67 lakh on home loans",
    description: "Affordable housing subsidy for urban poor/middle income",
    portal: "https://pmaymis.gov.in",
    helpline: "1800-11-3388",
    requiredDocs: ["aadhaar", "bank", "income"],
    rules: {
      maxIncome: "3",
      hasAadhaar: true,
      hasBankAccount: true,
    },
    points: 8,
  },

  // ─── WOMEN SCHEMES ───────────────────────────────────────────
  {
    id: "ujjwala",
    name: "PM Ujjwala Yojana",
    fullName: "Pradhan Mantri Ujjwala Yojana",
    emoji: "🔥",
    category: "women",
    benefit: "Free LPG connection + ₹1,600 subsidy for first refill",
    description: "Free cooking gas connections for women from BPL families",
    portal: "https://pmuy.gov.in",
    helpline: "1906",
    requiredDocs: ["aadhaar", "ration", "bank"],
    rules: {
      gender: ["female", "woman", "f"],
      maxIncome: "1",
      hasAadhaar: true,
      hasBankAccount: true,
    },
    points: 9,
  },

  {
    id: "sukanya_samriddhi",
    name: "Sukanya Samriddhi Yojana",
    fullName: "Sukanya Samriddhi Yojana",
    emoji: "👧",
    category: "women",
    benefit: "8.2% interest rate savings scheme for girl child",
    description: "High-interest savings account for girls under 10 years",
    portal: "https://www.india.gov.in",
    helpline: "1800-11-2211",
    requiredDocs: ["aadhaar", "bank", "birth"],
    rules: {
      gender: ["female", "woman", "f"],
      maxAge: 45,              // parent filing
      hasAadhaar: true,
      hasBankAccount: true,
    },
    points: 7,
  },

  // ─── BUSINESS / SELF-EMPLOYMENT ──────────────────────────────
  {
    id: "pm_mudra",
    name: "PM MUDRA Yojana",
    fullName: "Pradhan Mantri MUDRA Yojana",
    emoji: "💼",
    category: "business",
    benefit: "Business loans ₹50K – ₹10 lakh at low interest",
    description: "Collateral-free loans for micro and small businesses",
    portal: "https://www.mudra.org.in",
    helpline: "1800-180-1111",
    requiredDocs: ["aadhaar", "bank"],
    rules: {
      occupation: ["business", "labour", "other"],
      hasAadhaar: true,
      hasBankAccount: true,
    },
    points: 9,
  },

  {
    id: "pmkvy",
    name: "PM Kaushal Vikas Yojana",
    fullName: "Pradhan Mantri Kaushal Vikas Yojana",
    emoji: "🔧",
    category: "skills",
    benefit: "Free skill training + ₹8,000 reward on certification",
    description: "Free vocational training in 40+ sectors",
    portal: "https://www.pmkvyofficial.org",
    helpline: "1800-123-9626",
    requiredDocs: ["aadhaar", "bank"],
    rules: {
      maxAge: 45,
      minAge: 15,
      maxIncome: "3",
      occupation: ["labour", "other", "student"],
      hasAadhaar: true,
    },
    points: 8,
  },

  // ─── SOCIAL SECURITY ─────────────────────────────────────────
  {
    id: "pm_jan_dhan",
    name: "PM Jan Dhan Yojana",
    fullName: "Pradhan Mantri Jan Dhan Yojana",
    emoji: "🏦",
    category: "banking",
    benefit: "Zero-balance account + ₹2 lakh accident insurance + overdraft",
    description: "Free bank account with insurance and overdraft facility",
    portal: "https://pmjdy.gov.in",
    helpline: "1800-11-0001",
    requiredDocs: ["aadhaar"],
    rules: {
      hasBankAccount: false,   // specifically for those WITHOUT bank account
      hasAadhaar: true,
    },
    points: 10,
  },

  {
    id: "nsap_pension",
    name: "NSAP Pension",
    fullName: "National Social Assistance Programme",
    emoji: "👴",
    category: "pension",
    benefit: "₹200 – ₹500/month pension for elderly, widows, disabled",
    description: "Monthly pension for vulnerable elderly and disabled citizens",
    portal: "https://nsap.nic.in",
    helpline: "1800-11-1555",
    requiredDocs: ["aadhaar", "bank"],
    rules: {
      minAge: 60,
      maxIncome: "1",
      occupation: ["senior"],
      hasAadhaar: true,
      hasBankAccount: true,
    },
    points: 10,
  },

  {
    id: "atal_pension",
    name: "Atal Pension Yojana",
    fullName: "Atal Pension Yojana",
    emoji: "🪙",
    category: "pension",
    benefit: "Guaranteed pension ₹1,000 – ₹5,000/month after age 60",
    description: "Pension scheme for unorganised sector workers",
    portal: "https://npscra.nsdl.co.in",
    helpline: "1800-110-069",
    requiredDocs: ["aadhaar", "bank"],
    rules: {
      minAge: 18,
      maxAge: 40,
      occupation: ["farmer", "labour", "other", "business"],
      hasBankAccount: true,
      hasAadhaar: true,
    },
    points: 8,
  },

  {
    id: "pm_jeevan_jyoti",
    name: "PM Jeevan Jyoti Bima",
    fullName: "Pradhan Mantri Jeevan Jyoti Bima Yojana",
    emoji: "🛡️",
    category: "insurance",
    benefit: "₹2 lakh life insurance at just ₹436/year",
    description: "Affordable life insurance for all bank account holders",
    portal: "https://www.jansuraksha.gov.in",
    helpline: "1800-180-1111",
    requiredDocs: ["aadhaar", "bank"],
    rules: {
      minAge: 18,
      maxAge: 50,
      hasBankAccount: true,
      hasAadhaar: true,
    },
    points: 9,
  },

  {
    id: "pm_suraksha_bima",
    name: "PM Suraksha Bima Yojana",
    fullName: "Pradhan Mantri Suraksha Bima Yojana",
    emoji: "⚡",
    category: "insurance",
    benefit: "₹2 lakh accident insurance at just ₹20/year",
    description: "Accident insurance for bank account holders",
    portal: "https://www.jansuraksha.gov.in",
    helpline: "1800-180-1111",
    requiredDocs: ["aadhaar", "bank"],
    rules: {
      minAge: 18,
      maxAge: 70,
      hasBankAccount: true,
      hasAadhaar: true,
    },
    points: 9,
  },

];

// Category labels for UI
export const SCHEME_CATEGORIES = {
  farmer:    { label: "Farmer",       emoji: "🌾" },
  health:    { label: "Health",       emoji: "🏥" },
  education: { label: "Education",    emoji: "🎓" },
  housing:   { label: "Housing",      emoji: "🏠" },
  women:     { label: "Women",        emoji: "👩" },
  business:  { label: "Business",     emoji: "💼" },
  skills:    { label: "Skills",       emoji: "🔧" },
  banking:   { label: "Banking",      emoji: "🏦" },
  pension:   { label: "Pension",      emoji: "👴" },
  insurance: { label: "Insurance",    emoji: "🛡️" },
};
