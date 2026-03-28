import type { Scheme, UserProfile, MatchResult } from "../types/index";
import { matchSchemes } from "../lib/matcher";
import verifiedDataData from "../data/schemes_verified.json";

// Explicitly type the incoming verified data
interface VerifiedSchemeRaw {
  id: string;
  name: string;
  rawDescription: string;
  importantInfo: string;
  links: string[];
  fullText: string;
  source: string;
  confidenceScore: number;
  verified: boolean;
  confidenceLevel: string;
  verificationNotes: string[];
}

const verifiedData = verifiedDataData as unknown as VerifiedSchemeRaw[];

/**
 * Parse keywords from scheme text to infer a target occupation.
 * Returns relevant occupations or ["any"] as fallback.
 */
function inferOccupation(text: string): string[] {
  const lower = text.toLowerCase();
  const occupations: string[] = [];

  if (/\b(farmer|kisan|agriculture|crop|farming)\b/.test(lower)) occupations.push("farmer", "agricultural worker");
  if (/\b(student|scholarship|education|college|school|university)\b/.test(lower)) occupations.push("student");
  if (/\b(widow)\b/.test(lower)) occupations.push("any");
  if (/\b(worker|labour|laborer|daily wage|unskilled)\b/.test(lower)) occupations.push("unskilled worker", "laborer");
  if (/\b(pregnant|maternity|mother|lactating)\b/.test(lower)) occupations.push("any");
  if (/\b(entrepreneur|startup|msme|business|self.?employed)\b/.test(lower)) occupations.push("self-employed", "entrepreneur");
  if (/\b(pensioner|senior citizen|elderly|old age)\b/.test(lower)) occupations.push("any");

  return occupations.length > 0 ? occupations : ["any"];
}

/**
 * Parse keywords from scheme text to infer target gender.
 */
function inferGender(text: string): "male" | "female" | "any" {
  const lower = text.toLowerCase();
  if (/\b(women|woman|girl|female|widow|mother|pregnant|lactating|mahila)\b/.test(lower)) return "female";
  if (/\b(male only|men only|boys only)\b/.test(lower)) return "male";
  return "any";
}

/**
 * Parse keywords from scheme text to infer target category.
 */
function inferCategory(text: string): string[] {
  const lower = text.toLowerCase();
  const cats: string[] = [];
  if (/\b(sc|scheduled caste|dalit)\b/.test(lower)) cats.push("SC");
  if (/\b(st|scheduled tribe|tribal)\b/.test(lower)) cats.push("ST");
  if (/\b(obc|other backward)\b/.test(lower)) cats.push("OBC");
  if (/\b(minority|religious minority)\b/.test(lower)) cats.push("Minority");
  if (/\b(ews|economically weaker)\b/.test(lower)) cats.push("EWS");
  return cats.length > 0 ? cats : ["All"];
}

/**
 * Parse income limit from scheme text.
 */
function inferIncomeLimit(text: string): number {
  const lower = text.toLowerCase();
  // Look for patterns like "₹2 lakh", "2,50,000", "income limit 250000"
  const lakhMatch = lower.match(/(?:₹|rs\.?|income[^.]*?)(\d+(?:\.\d+)?)\s*(?:lakh|lac)/);
  if (lakhMatch) return parseFloat(lakhMatch[1]) * 100000;

  const directMatch = lower.match(/(?:₹|rs\.?)\s*(\d[\d,]*)/);
  if (directMatch) {
    const val = parseInt(directMatch[1].replace(/,/g, ""), 10);
    if (val > 10000) return val; // Likely annual income
  }

  // BPL / poor → low income
  if (/\b(bpl|below poverty|poor|economically weaker|ews)\b/.test(lower)) return 300000;

  return 1000000; // conservative default, not 9999999
}

/**
 * Estimate the benefit amount from scheme text
 */
function inferEstimatedBenefit(text: string): number {
  const lower = text.toLowerCase();
  // Look for patterns like "₹6,000", "₹5 lakh"
  const lakhMatch = lower.match(/(?:₹|rs\.?)\s*(\d+(?:\.\d+)?)\s*(?:lakh|lac)/);
  if (lakhMatch) return parseFloat(lakhMatch[1]) * 100000;

  const thousandMatch = lower.match(/(?:₹|rs\.?)\s*(\d[\d,]*)/);
  if (thousandMatch) {
    const val = parseInt(thousandMatch[1].replace(/,/g, ""), 10);
    if (val > 0) return val;
  }

  return 5000; // default
}

/**
 * Filter to only high-quality, real schemes — remove Wikipedia garbage
 */
function isQualityScheme(v: VerifiedSchemeRaw): boolean {
  // Must have reasonable confidence
  if (v.confidenceScore < 3 && v.confidenceLevel === "low") return false;

  // Must not be Wikipedia citations or template pages
  if (v.name.startsWith("Digital India: ^")) return false;
  if (v.name.startsWith("Template:")) return false;
  if (v.name.includes("Indian missions")) return false;

  // Must not be category listing pages
  if (v.rawDescription.startsWith("The following")) return false;
  if (v.rawDescription.length < 20) return false;

  // Must have some useful info
  if (!v.importantInfo && v.links.length === 0 && v.confidenceScore < 2) return false;

  return true;
}

const verifiedSchemesConverted: Scheme[] = verifiedData
  .filter(isQualityScheme)
  .map(v => {
    const combinedText = `${v.name} ${v.rawDescription} ${v.importantInfo} ${v.fullText}`;

    return {
      id: `verified_${v.id}`, // Prefix to avoid ID collisions with hardcoded schemes
      name: v.name.replace(/^Digital India:\s*/i, ""), // Clean the prefix
      description: v.rawDescription || v.fullText,
      eligibility: {
        ageRange: { min: 18, max: 65 }, // Reasonable default instead of 0-120
        gender: inferGender(combinedText),
        occupation: inferOccupation(combinedText),
        incomeLimit: inferIncomeLimit(combinedText),
        category: inferCategory(combinedText),
        state: ["All"],
        maritalStatus: "any" as const,
        landOwnership: null,
      },
      benefits: v.importantInfo && !v.importantInfo.startsWith("Eligibility: Check")
        ? v.importantInfo
        : "Refer to the scheme links to verify detailed benefits.",
      documents: ["Aadhaar Card", "Bank Account Details", "Income Certificate", "Passport Size Photos"],
      estimatedBenefit: inferEstimatedBenefit(combinedText),
      tags: [v.source, ...(v.verificationNotes || [])]
        .filter(t => t && !t.includes("low") && !t.includes("missing") && !t.includes("Short")),
      links: v.links,
    };
  });

/**
 * Sample schemes data with realistic Indian government welfare schemes
 * Each scheme includes structured eligibility criteria for accurate matching
 */
export const schemes: Scheme[] = [
  {
    id: "pm-kisan",
    name: "PM-KISAN",
    eligibility: {
      ageRange: { min: 18, max: 120 },
      gender: "any",
      occupation: ["farmer", "agricultural worker"],
      incomeLimit: 600000,
      category: ["All"],
      state: ["All"],
      maritalStatus: "any",
      landOwnership: true,
    },
    benefits: "₹6,000 per year in three equal installments for farmers with landholding up to 2 hectares",
    documents: ["Aadhaar Card", "Bank Account Details", "Land Records"],
    estimatedBenefit: 6000,
  },
  {
    id: "widow-pension",
    name: "National Widow Pension Scheme",
    eligibility: {
      ageRange: { min: 18, max: 120 },
      gender: "female",
      occupation: ["any"],
      incomeLimit: 200000,
      category: ["All"],
      state: ["All"],
      maritalStatus: "widow",
      landOwnership: null,
    },
    benefits: "₹2,000 per month financial assistance",
    documents: ["Widow Certificate", "Income Certificate", "Aadhaar Card"],
    estimatedBenefit: 24000,
  },
  {
    id: "ayushman-bharat",
    name: "Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana",
    eligibility: {
      ageRange: { min: 0, max: 120 },
      gender: "any",
      occupation: ["any"],
      incomeLimit: 500000,
      category: ["All"],
      state: ["All"],
      maritalStatus: "any",
      landOwnership: null,
    },
    benefits: "Cashless treatment up to ₹5 lakh per family per year for secondary and tertiary care hospitalization",
    documents: ["Ayushman Bharat Card", "Income Certificate"],
    estimatedBenefit: 500000,
  },
  {
    id: "student-scholarship",
    name: "National Scholarship Portal - Post Matric Scholarship",
    eligibility: {
      ageRange: { min: 17, max: 30 },
      gender: "any",
      occupation: ["student"],
      incomeLimit: 600000,
      category: ["SC", "ST", "OBC", "Minority"],
      state: ["All"],
      maritalStatus: "any",
      landOwnership: null,
    },
    benefits: "Tuition fee reimbursement and maintenance allowance up to ₹20,000 per year",
    documents: ["Caste Certificate", "Income Certificate", "Admission Letter", "Mark Sheets"],
    estimatedBenefit: 20000,
  },
  {
    id: "mnrega",
    name: "Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)",
    eligibility: {
      ageRange: { min: 18, max: 120 },
      gender: "any",
      occupation: ["unskilled worker", "farmer", "laborer", "any"],
      incomeLimit: 1000000,
      category: ["All"],
      state: ["All"],
      maritalStatus: "any",
      landOwnership: false,
    },
    benefits: "100 days of guaranteed wage employment per year at minimum wage rates",
    documents: ["Job Card", "Aadhaar Card", "Bank Account"],
    estimatedBenefit: 60000,
  },
  {
    id: "pm-ayushman-bharat-health",
    name: "Ayushman Bharat - Health and Wellness Centres",
    eligibility: {
      ageRange: { min: 0, max: 120 },
      gender: "any",
      occupation: ["any"],
      incomeLimit: 1000000,
      category: ["All"],
      state: ["All"],
      maritalStatus: "any",
      landOwnership: null,
    },
    benefits: "Free comprehensive primary healthcare services including consultations, medicines, and diagnostics",
    documents: ["Aadhaar Card", "Health Card"],
    estimatedBenefit: 5000,
  },
  {
    id: "digital-india-scholarship",
    name: "Pragati Scholarship for Girl Students",
    eligibility: {
      ageRange: { min: 17, max: 25 },
      gender: "female",
      occupation: ["student"],
      incomeLimit: 800000,
      category: ["All"],
      state: ["All"],
      maritalStatus: "unmarried",
      landOwnership: null,
    },
    benefits: "₹30,000 per year for tuition fees and ₹2,000 per month for incidentals",
    documents: ["Income Certificate", "Admission Letter", "Bank Account Details"],
    estimatedBenefit: 54000,
  },
  {
    id: "swachh-bharat-mission",
    name: "Swachh Bharat Mission - Individual Household Latrines",
    eligibility: {
      ageRange: { min: 18, max: 120 },
      gender: "any",
      occupation: ["any"],
      incomeLimit: 200000,
      category: ["All"],
      state: ["All"],
      maritalStatus: "any",
      landOwnership: true,
    },
    benefits: "Subsidy up to ₹12,000 for construction of individual household latrines",
    documents: ["Aadhaar Card", "Income Certificate", "Property Documents"],
    estimatedBenefit: 12000,
  },
];

/**
 * Get all available schemes (hardcoded + quality-filtered verified)
 */
export function getAllSchemes(): Scheme[] {
  return [...schemes, ...verifiedSchemesConverted];
}

/**
 * Get a scheme by ID
 */
export function getSchemeById(id: string): Scheme | undefined {
  return getAllSchemes().find((scheme) => scheme.id === id);
}

/**
 * Get recommended schemes for a user profile using threshold-based filtering
 * @param userProfile - User's demographic and economic profile
 * @returns MatchResult with recommended schemes, fallback indication, and metadata
 */
export function getRecommendedSchemes(userProfile: UserProfile): MatchResult {
  return matchSchemes(userProfile, getAllSchemes());
}