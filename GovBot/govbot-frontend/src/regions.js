export const ALL_REGION_STATES = {
  south: {
    "Tamil Nadu": {
      lang: "ta-IN", nativeName: "தமிழ்நாடு",
      greeting: "Vanakkam! நான் உங்கள் GovBot — Kavitha.",
      nativePrompt: "Please respond in pure Tamil language (தமிழ்). Keep scheme names like PM-KISAN in English.",
      englishPrompt: "Please respond in English.",
    },
    "Kerala": {
      lang: "ml-IN", nativeName: "കേരളം",
      greeting: "Namaskaram! ഞാൻ നിങ്ങളുടെ GovBot — Kavitha.",
      nativePrompt: "Please respond in pure Malayalam language (മലയാളം). Keep scheme names in English.",
      englishPrompt: "Please respond in English.",
    },
    "Karnataka": {
      lang: "kn-IN", nativeName: "ಕರ್ನಾಟಕ",
      greeting: "Namaskara! ನಾನು ನಿಮ್ಮ GovBot — Kavitha.",
      nativePrompt: "Please respond in pure Kannada language (ಕನ್ನಡ). Keep scheme names in English.",
      englishPrompt: "Please respond in English.",
    },
    "Andhra Pradesh": {
      lang: "te-IN", nativeName: "ఆంధ్రప్రదేశ్",
      greeting: "Namaskaram! నేను మీ GovBot — Kavitha.",
      nativePrompt: "Please respond in pure Telugu language (తెలుగు). Keep scheme names in English.",
      englishPrompt: "Please respond in English.",
    },
    "Telangana": {
      lang: "te-IN", nativeName: "తెలంగాణ",
      greeting: "Namaskaram! నేను మీ GovBot — Kavitha.",
      nativePrompt: "Please respond in pure Telugu language (తెలుగు). Keep scheme names in English.",
      englishPrompt: "Please respond in English.",
    },
  },
  north: {
    "Punjab": {
      lang: "pa-IN", nativeName: "ਪੰਜਾਬ",
      greeting: "Sat Sri Akal! ਮੈਂ ਤੁਹਾਡਾ GovBot ਹਾਂ — Gurpreet.",
      nativePrompt: "Please respond in pure Punjabi language (ਪੰਜਾਬੀ). Keep scheme names in English.",
      englishPrompt: "Please respond in English.",
    },
    "Uttar Pradesh": {
      lang: "hi-IN", nativeName: "उत्तर प्रदेश",
      greeting: "Namaste! Main aapka GovBot hoon — Gurpreet.",
      nativePrompt: "Please respond in pure Hindi language (हिंदी). Keep scheme names in English.",
      englishPrompt: "Please respond in English.",
    },
    "Delhi": {
      lang: "hi-IN", nativeName: "दिल्ली",
      greeting: "Namaste! Main aapka GovBot hoon — Gurpreet.",
      nativePrompt: "Please respond in pure Hindi language (हिंदी). Keep scheme names in English.",
      englishPrompt: "Please respond in English.",
    },
    "Haryana": {
      lang: "hi-IN", nativeName: "हरियाणा",
      greeting: "Namaste! Main aapka GovBot hoon — Gurpreet.",
      nativePrompt: "Please respond in pure Hindi language (हिंदी). Keep scheme names in English.",
      englishPrompt: "Please respond in English.",
    },
    "Himachal Pradesh": {
      lang: "hi-IN", nativeName: "हिमाचल प्रदेश",
      greeting: "Namaste! Main aapka GovBot hoon — Gurpreet.",
      nativePrompt: "Please respond in pure Hindi language (हिंदी). Keep scheme names in English.",
      englishPrompt: "Please respond in English.",
    },
    "Uttarakhand": {
      lang: "hi-IN", nativeName: "उत्तराखंड",
      greeting: "Namaste! Main aapka GovBot hoon — Gurpreet.",
      nativePrompt: "Please respond in pure Hindi language (हिंदी). Keep scheme names in English.",
      englishPrompt: "Please respond in English.",
    },
  },
  east: {
    "West Bengal": {
      lang: "bn-IN", nativeName: "পশ্চিমবঙ্গ",
      greeting: "Namaskar! Ami apnar GovBot — Priya.",
      nativePrompt: "Please respond in pure Bengali language (বাংলা). Keep scheme names in English.",
      englishPrompt: "Please respond in English.",
    },
    "Odisha": {
      lang: "or-IN", nativeName: "ଓଡ଼ିଶା",
      greeting: "Namaskar! Mun apanka GovBot — Priya.",
      nativePrompt: "Please respond in pure Odia language (ଓଡ଼ିଆ). Keep scheme names in English.",
      englishPrompt: "Please respond in English.",
    },
    "Bihar": {
      lang: "hi-IN", nativeName: "बिहार",
      greeting: "Pranam! Hum aapka GovBot hain — Priya.",
      nativePrompt: "Please respond in pure Hindi (Bhojpuri-influenced) language. Keep scheme names in English.",
      englishPrompt: "Please respond in English.",
    },
    "Jharkhand": {
      lang: "hi-IN", nativeName: "झारखंड",
      greeting: "Namaskar! Main aapka GovBot hoon — Priya.",
      nativePrompt: "Please respond in pure Hindi language (हिंदी). Keep scheme names in English.",
      englishPrompt: "Please respond in English.",
    },
  },
  west: {
    "Gujarat": {
      lang: "gu-IN", nativeName: "ગુજરાત",
      greeting: "Kem Cho! Hu tamaro GovBot chhu — Arjun.",
      nativePrompt: "Please respond in pure Gujarati language (ગુજરાતી). Keep scheme names in English.",
      englishPrompt: "Please respond in English.",
    },
    "Rajasthan": {
      lang: "hi-IN", nativeName: "राजस्थान",
      greeting: "Khamma Ghani! Main aapka GovBot hoon — Arjun.",
      nativePrompt: "Please respond in pure Hindi (Rajasthani-influenced) language. Keep scheme names in English.",
      englishPrompt: "Please respond in English.",
    },
    "Maharashtra": {
      lang: "mr-IN", nativeName: "महाराष्ट्र",
      greeting: "Namaskar! Mi tumcha GovBot ahe — Arjun.",
      nativePrompt: "Please respond in pure Marathi language (मराठी). Keep scheme names in English.",
      englishPrompt: "Please respond in English.",
    },
    "Goa": {
      lang: "en-IN", nativeName: "Goa",
      greeting: "Oi! I'm your GovBot — Arjun.",
      nativePrompt: "Please respond in simple English with Konkani words occasionally.",
      englishPrompt: "Please respond in English.",
    },
  },
};

// Backward compat alias
export const SOUTH_STATES = ALL_REGION_STATES.south;

export const REGIONS = {
  north: {
    id: "north",
    hasStateSelection: true,
    name: "North India",
    states: "Punjab • UP • Delhi • Haryana • Himachal",
    avatarImg: "https://api.dicebear.com/8.x/avataaars/svg?seed=Gurpreet&backgroundColor=b6e3f4&clothingColor=red&facialHairType=beardMedium&accessoriesType=sunglasses",
    avatarEmoji: "🧔‍♂️",
    avatarName: "Gurpreet Singh",
    avatarTitle: "Senior Welfare Officer",
    greeting: "Sat Sri Akal! / Namaste! Main aapka GovBot hoon.",
    subGreeting: "Apni jankari dijiye, aur main aapke liye sahi yojana dhundhega!",
    language: "hi-IN",
    voiceLang: "hi-IN",
    colors: {
      primary: "#B91C1C",
      secondary: "#F97316",
      accent: "#15803D",
      bg: "#FFF5F5",
      cardBg: "#fff",
      headerGrad: "linear-gradient(135deg, #991B1B 0%, #7F1D1D 100%)",
      userBubble: "linear-gradient(135deg, #B91C1C, #7F1D1D)",
      botBubble: "#FFF1F2",
      botBubbleBorder: "#FECDD3",
      sideNote: "linear-gradient(135deg, #15803D, #14532D)",
    },
    bgPattern: "radial-gradient(circle at 15% 15%, rgba(185,28,28,0.1) 0%, transparent 50%), radial-gradient(circle at 85% 85%, rgba(249,115,22,0.08) 0%, transparent 50%)",
    decoration: "🪔",
    borderPattern: "1.5px solid #FECDD3",
    emoji: "🕌",
    festive: ["🪔", "🎊", "🌸", "🏵️"],
    greetingBg: "linear-gradient(135deg, #7F1D1D 0%, #991B1B 50%, #B91C1C 100%)",
    pattern: "🌸🏵️🪔🎊",
  },
  south: {
    id: "south",
    name: "South India",
    states: "Tamil Nadu • Kerala • Karnataka • Andhra",
    avatarImg: "https://api.dicebear.com/8.x/avataaars/svg?seed=Kavitha&backgroundColor=c0aede&top=longHair&clothingColor=purple",
    avatarEmoji: "👩‍💼",
    avatarName: "Kavitha Menon",
    avatarTitle: "Regional Scheme Specialist",
    greeting: "Vanakkam! / Namaskara! Naan ungal GovBot.",
    subGreeting: "Ungal vivaragalai sollunga, naan ungalukkana thitta thoguvom!",
    language: "ta-IN",
    voiceLang: "ta-IN",
    hasStateSelection: true,
    colors: {
      primary: "#6B21A8",
      secondary: "#A855F7",
      accent: "#D97706",
      bg: "#FAF5FF",
      cardBg: "#fff",
      headerGrad: "linear-gradient(135deg, #581C87 0%, #3B0764 100%)",
      userBubble: "linear-gradient(135deg, #6B21A8, #3B0764)",
      botBubble: "#F5F3FF",
      botBubbleBorder: "#DDD6FE",
      sideNote: "linear-gradient(135deg, #D97706, #92400E)",
    },
    bgPattern: "radial-gradient(circle at 15% 15%, rgba(107,33,168,0.1) 0%, transparent 50%), radial-gradient(circle at 85% 85%, rgba(217,119,6,0.08) 0%, transparent 50%)",
    decoration: "🌺",
    borderPattern: "1.5px solid #DDD6FE",
    emoji: "🛕",
    festive: ["🌺", "🌼", "🪷", "🏵️"],
    greetingBg: "linear-gradient(135deg, #3B0764 0%, #581C87 50%, #6B21A8 100%)",
    pattern: "🌺🪷🌼🏵️",
  },
  east: {
    id: "east",
    hasStateSelection: true,
    name: "East India",
    states: "West Bengal • Odisha • Bihar • Jharkhand",
    avatarImg: "https://api.dicebear.com/8.x/avataaars/svg?seed=Priya&backgroundColor=ffd5dc&top=longHair&clothingColor=blue",
    avatarEmoji: "👩‍🏫",
    avatarName: "Priya Chatterjee",
    avatarTitle: "Community Welfare Guide",
    greeting: "Namaskar! Ami apnar GovBot.",
    subGreeting: "Apnar tathya din, ami apnar jonyo sothik prakalpa khuje debo!",
    language: "bn-IN",
    voiceLang: "bn-IN",
    colors: {
      primary: "#1D4ED8",
      secondary: "#DC2626",
      accent: "#D97706",
      bg: "#EFF6FF",
      cardBg: "#fff",
      headerGrad: "linear-gradient(135deg, #1E3A8A 0%, #1e40af 100%)",
      userBubble: "linear-gradient(135deg, #1D4ED8, #1E3A8A)",
      botBubble: "#EFF6FF",
      botBubbleBorder: "#BFDBFE",
      sideNote: "linear-gradient(135deg, #DC2626, #7F1D1D)",
    },
    bgPattern: "radial-gradient(circle at 15% 15%, rgba(29,78,216,0.1) 0%, transparent 50%), radial-gradient(circle at 85% 85%, rgba(220,38,38,0.07) 0%, transparent 50%)",
    decoration: "🎨",
    borderPattern: "1.5px solid #BFDBFE",
    emoji: "🏯",
    festive: ["🎨", "🌸", "🎭", "🌊"],
    greetingBg: "linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 50%, #2563EB 100%)",
    pattern: "🎨🌸🎭🌊",
  },
  west: {
    id: "west",
    hasStateSelection: true,
    name: "West India",
    states: "Gujarat • Rajasthan • Maharashtra • Goa",
    avatarImg: "https://api.dicebear.com/8.x/avataaars/svg?seed=Arjun&backgroundColor=ffdfbf&facialHairType=beardLight&clothingColor=orange",
    avatarEmoji: "👨‍⚖️",
    avatarName: "Arjun Desai",
    avatarTitle: "Government Scheme Advisor",
    greeting: "Kem Cho! / Namaskar! Maro naam GovBot chhe.",
    subGreeting: "Tamari mahiti apo, ane hun tamara mate sahi yojana shodhi kaadish!",
    language: "gu-IN",
    voiceLang: "gu-IN",
    colors: {
      primary: "#C2410C",
      secondary: "#D97706",
      accent: "#15803D",
      bg: "#FFF7ED",
      cardBg: "#fff",
      headerGrad: "linear-gradient(135deg, #9A3412 0%, #7C2D12 100%)",
      userBubble: "linear-gradient(135deg, #C2410C, #7C2D12)",
      botBubble: "#FFF7ED",
      botBubbleBorder: "#FED7AA",
      sideNote: "linear-gradient(135deg, #15803D, #14532D)",
    },
    bgPattern: "radial-gradient(circle at 15% 15%, rgba(194,65,12,0.1) 0%, transparent 50%), radial-gradient(circle at 85% 85%, rgba(217,119,6,0.1) 0%, transparent 50%)",
    decoration: "🪬",
    borderPattern: "1.5px solid #FED7AA",
    emoji: "🏰",
    festive: ["🪬", "🌻", "🎪", "🎠"],
    greetingBg: "linear-gradient(135deg, #7C2D12 0%, #9A3412 50%, #C2410C 100%)",
    pattern: "🪬🌻🎪🎠",
  },
};


// State-specific schemes database
export const STATE_SCHEMES = {
  "Tamil Nadu": `
STATE SCHEMES FOR TAMIL NADU:
- Kalaignar Magalir Urimai Thogai: Rs.1000/month cash for women heads of household
- Chief Minister's Breakfast Scheme: Free breakfast for school students (classes 1-5)
- Amma Unavagam: Subsidized meals for Rs.5 at government canteens
- TN Chief Minister's Comprehensive Health Insurance: Rs.5 lakh health cover for families earning < Rs.72,000/year
- Moovalur Ramamirtham Ammaiyar Ninaivu Marriage Assistance: Rs.50,000 for SC/ST/BC women's marriage
- Annai Theresa Maternity Benefit: Rs.18,000 for first two deliveries
- TN Free Laptop Scheme: Free laptop for Plus-2 students in government schools
- TN CM Solar Power Scheme: Subsidized solar panels for farmers
- Pudhumai Penn Scheme: Rs.1000/month for girl students in govt colleges
- TN Free Bus Pass: Free bus travel for students, women, and disabled persons
- TN Housing Board Scheme: Subsidized housing for economically weaker sections
- Anaithu Grama Anna Marumalarchi: Rural development and infrastructure scheme
- TN Skill Development Corporation: Free skill training for unemployed youth`,

  "Kerala": `
STATE SCHEMES FOR KERALA:
- Karunya Health Scheme: Financial aid up to Rs.2 lakh for serious illness treatment
- Aardram Mission: Upgraded primary health centres with improved services
- Snehapoorvam Scholarship: Rs.300-1000/month for orphan students
- Yuvakeralam: Employment and entrepreneurship scheme for youth
- Kerala Karshaka Kshemasena: Welfare scheme for farmers
- LIFE Mission (Livelihood Inclusion and Financial Empowerment): Affordable housing for homeless
- K-DISC Innovation Scheme: Support for startups and innovators
- Kerala Student Loan Scheme: Low interest education loans
- Kudumbashree: Women's self-help group and microfinance scheme
- Kerala Chief Minister's Distress Relief Fund: Emergency assistance for BPL families
- Thozhilswam: Guaranteed employment for BPL households
- Kerala Fishermen Welfare Scheme: Insurance and welfare for fishing community`,

  "Karnataka": `
STATE SCHEMES FOR KARNATAKA:
- Anna Bhagya: 10 kg free rice per month per family
- Gruha Jyothi: 200 units free electricity per month for domestic consumers
- Gruha Lakshmi: Rs.2000/month for woman head of household
- Yuva Nidhi: Rs.3000/month unemployment allowance for graduates, Rs.1500 for diploma holders
- Shakti Scheme: Free bus travel for women on KSRTC/BMTC buses
- Rajiv Gandhi Housing Scheme: Affordable homes for BPL families
- Karnataka Rajyotsava Award: Recognition and cash for contributors to Karnataka culture
- Devaraj Urs Backward Classes Development: Welfare for BC communities
- Kalyana Karnataka Package: Special development funds for backward regions
- Karnataka Vidya Vikasa: Scholarship for students from minority communities
- Arivu Education Loan Scheme: 3% interest education loans for minority students`,

  "Andhra Pradesh": `
STATE SCHEMES FOR ANDHRA PRADESH:
- YSR Rythu Bharosa: Rs.13,500/year financial assistance to farmers
- YSR Aarogyasri: Free healthcare up to Rs.5 lakh for BPL families
- YSR Pension Kanuka: Rs.2750-10,000/month for elderly, widows, disabled, single women
- YSR Jagananna Ammavodi: Rs.15,000/year to mothers of school-going children
- Jagananna Vidya Deevena: Fee reimbursement for students in government colleges
- YSR Cheyutha: Financial assistance for BC/SC/ST/minority women aged 45-60
- YSR Housing: Free 2-bedroom houses for homeless poor families
- Jagananna Thodu: Rs.10,000 working capital for street vendors
- YSR Sunna Vaddi: Zero interest loans for women's SHGs
- Jagananna Vasathi Deevena: Hostel expenses reimbursement for students`,

  "Telangana": `
STATE SCHEMES FOR TELANGANA:
- Rythu Bandhu: Rs.10,000/year per acre investment support to farmers
- Rythu Bima: Rs.5 lakh life insurance for farmers aged 18-59
- Arogyasri: Free healthcare for BPL families up to Rs.5 lakh
- Kalyana Lakshmi / Shaadi Mubarak: Rs.1,00,116 marriage assistance for SC/ST/minority girls
- TS-iPASS: Single window clearance for industries
- KCR Kit: Mother and child welfare kit worth Rs.12,000 for pregnant women
- Mission Bhagiratha: Safe drinking water to every household
- Double Bedroom Housing: Free 2BHK flats for homeless poor
- Telangana Disabled Welfare: Pension and assistive devices for disabled persons`,

  "Maharashtra": `
STATE SCHEMES FOR MAHARASHTRA:
- Mahatma Jyotirao Phule Jan Arogya Yojana: Free surgery and treatment up to Rs.1.5 lakh
- Atal Ahar Yojana: Rs.10 meal for construction workers
- Maharashtra Gharkul Yojana: Housing for SC/ST/OBC families
- Shubh Mangal Yojana: Rs.35,000 marriage assistance for inter-caste marriages
- Rajarshi Shahu Maharaj Scholarship: Scholarship for OBC students in higher education
- Maharashtra Women's Self-Reliance Scheme: Micro-loans for women entrepreneurs
- Balasaheb Thackeray Udyog Yojana: Employment for local youth`,

  "Gujarat": `
STATE SCHEMES FOR GUJARAT:
- Mukhyamantri Amrutam (MA) Yojana: Free healthcare for BPL families up to Rs.5 lakh
- Kisan Suryoday Yojana: Daytime electricity for farmers at affordable rates
- Namo Saraswati Yojana: Rs.25,000 scholarship for girl students in Science stream
- Namo Lakshmi Yojana: Rs.50,000 financial support for girls in standard 9-12
- BISAG Scholarship: For meritorious SC/ST/OBC students
- Gujarat Housing Board Scheme: Affordable housing for EWS/LIG families
- Mukhyamantri Yuva Swavalamban Yojana: Fee support for economically weak students`,

  "Rajasthan": `
STATE SCHEMES FOR RAJASTHAN:
- Mukhyamantri Chiranjeevi Yojana: Free healthcare up to Rs.25 lakh per family per year
- Indira Gandhi Urban Employment Guarantee: 100 days employment for urban families
- Mukhyamantri Kisan Mitra Urja Yojana: Electricity subsidy up to Rs.1000/month for farmers
- Palanhar Scheme: Rs.1500/month for orphan children up to age 18
- Anuprati Coaching Scheme: Free coaching for competitive exams for SC/ST/OBC/EWS
- Rajasthan Free Laptop Yojana: Free laptops for meritorious students
- Kalibai Bhil Medhavi Chhatra Scooty Yojana: Free scooter for girl students`,

  "West Bengal": `
STATE SCHEMES FOR WEST BENGAL:
- Lakshmir Bhandar: Rs.500-1000/month for general/SC/ST women heads of household
- Swasthya Sathi: Free health coverage up to Rs.5 lakh per family
- Kanyashree Prakalpa: Rs.25,000 one-time grant for girl students aged 18+
- Rupashree Prakalpa: Rs.25,000 marriage assistance for economically weak girls
- Krishak Bandhu: Rs.10,000/year per acre for farmers + Rs.2 lakh life insurance
- Sabuj Sathi: Free bicycle for students in classes 9-12 in government schools
- Yuvasree: Rs.1500/month unemployment allowance for educated youth`,

  "Madhya Pradesh": `
STATE SCHEMES FOR MADHYA PRADESH:
- Ladli Laxmi Yojana: Rs.1.43 lakh educational bond for girl child
- Mukhyamantri Kalyani Sahayata: Rs.600/month for widows
- MP Mukhyamantri Jankalyan (SAMBAL): Benefits for unorganized workers
- MP Housing Scheme: Affordable homes under PMAY for EWS families
- Mukhyamantri Medhavi Vidyarthi Yojana: Fee payment for meritorious students in private colleges
- Mukhyamantri Udyam Kranti Yojana: Loans up to Rs.50 lakh for entrepreneurs`,

  "Delhi": `
STATE SCHEMES FOR DELHI:
- Delhi Mukhyamantri Mahila Samman Yojana: Rs.1000/month for women above 18
- Delhi Free Electricity: 200 units free per month for domestic consumers
- Dilli Ki Yogshala: Free yoga classes across Delhi
- Delhi Student Travel Card: Free bus travel for students
- Aam Aadmi Mohalla Clinic: Free healthcare at neighbourhood clinics
- Delhi Rozgar Bazaar: Job portal connecting employers and unemployed youth`,
};

// Get state schemes string for prompt
export const getStateSchemes = (stateName) => {
  return STATE_SCHEMES[stateName] || `Also suggest state-specific schemes relevant to ${stateName} — welfare, agriculture, education, health and housing schemes offered by ${stateName} government.`;
};

export const SCHEMES_CONTEXT = (regionId, stateName = null, useNative = false) => {
  const region = REGIONS[regionId];
  const regionStates = ALL_REGION_STATES[regionId] || {};
  const stateInfo = stateName && regionStates[stateName] ? regionStates[stateName] : null;
  const langInstruction = stateInfo
    ? (useNative ? stateInfo.nativePrompt : stateInfo.englishPrompt)
    : `Respond in simple English with occasional local words from ${region.name}.`;
  const stateSchemes = stateName ? getStateSchemes(stateName) : "";

  return `You are GovBot — ${region.avatarName}, ${region.avatarTitle} from ${region.name}.
${langInstruction}

${stateName ? `
════════════════════════════════════
⚠️ MANDATORY STATE RULE — READ FIRST
════════════════════════════════════
The user is from ${stateName}. You MUST follow these rules WITHOUT EXCEPTION:

1. EVERY scheme list MUST contain at least 3 schemes from ${stateName} state government.
2. State schemes must be listed FIRST before any national schemes.
3. Label every state scheme with "🏛️ ${stateName}:" prefix in the scheme name.
4. If you don't show ${stateName} state schemes, you are FAILING your primary job.

${stateName} STATE SCHEMES (USE THESE — pick the most relevant ones):
${stateSchemes}
════════════════════════════════════
` : ""}

NATIONAL SCHEMES DATABASE (use AFTER state schemes):
🌾 Farmers: PM-KISAN (Rs.6000/yr), Kisan Credit Card, PM Fasal Bima Yojana, PM Krishi Sinchai, Soil Health Card
🏥 Health: Ayushman Bharat/PM-JAY (Rs.5 lakh), Janani Suraksha Yojana, PM Ujjwala (free LPG)
🏠 Housing: PMAY Gramin, PMAY Urban
🎓 Education: NSP Scholarship, PM Vidyalakshmi, Post-Matric Scholarship, PMKVY, Beti Bachao Beti Padhao
👴 Pension: Atal Pension Yojana, IGNOAPS Old Age Pension, NSAP, PM Jan Dhan
💼 Business: PM MUDRA (loan up to Rs.10 lakh), Startup India

⚠️ CRITICAL FORMAT RULES — NEVER BREAK THESE ⚠️

RULE 1 — SCHEME LIST FORMAT (always use when listing schemes):
1. 🏛️ ${stateName || "State"}: SCHEME NAME IN ENGLISH ONLY
   - Benefit: [benefit description — local language OK]
   - Who: [one-line eligibility — local language OK]

2. NATIONAL SCHEME NAME IN ENGLISH ONLY
   - Benefit: [amount]
   - Who: [eligibility]

Keep going to at least 8 schemes. State schemes first.

RULE 2 — SCHEME NAME LANGUAGE:
The scheme name on the "1." "2." etc lines must ALWAYS be in English (e.g. "TN CM Solar Power Scheme", "PM-KISAN").
Descriptions/bullets can be in the user's language.
NEVER translate scheme names to Tamil, Hindi, or any other script.

RULE 3 — MINIMUM 8 SCHEMES always. If you know only 6, add 2 more relevant ones.

RULE 4 — SUB-MENU FORMAT (when user selects a scheme by number OR asks about a specific scheme):
Always respond with this EXACT structure in English:
"You selected [EXACT SCHEME NAME]. What would you like to know?
1. Eligibility criteria
2. Required documents
3. Benefit amount details
4. How to apply
5. Helpline / website
6. Apply Now"
The 6 sub-menu options must ALWAYS be in English regardless of the user's language.

RULE 5 — Sub-option answers: use **bold** headings + "- " bullets. No numbered lists in answers.
After answering, always show the sub-menu again so user can ask about other aspects.

RULE 6 — CARD LAYOUT: Keep scheme bullet points SHORT (max 10 words each) so cards stay compact.

CONVERSATION RULES:
1. Greetings → ask what help they need, NO scheme lists yet
2. List schemes only AFTER knowing occupation/age/income/situation
3. Ask ONE question at a time
`;
};
