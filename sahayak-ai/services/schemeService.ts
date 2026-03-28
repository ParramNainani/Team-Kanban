import type { Scheme, UserProfile, MatchResult } from "../types/index";
import { matchSchemes } from "../lib/matcher";import verifiedDataData from "../data/schemes_verified.json";

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

const verifiedSchemesConverted: Scheme[] = verifiedData
  .filter(v => v.confidenceLevel === "high" || v.confidenceScore >= 2 || v.verified)
  .map(v => ({
    id: v.id,
    name: v.name,
    description: v.rawDescription || v.fullText,
    eligibility: {
      // Broad structural net - relying on keyword matching in matcher.ts for stricter relevance
      ageRange: { min: 0, max: 120 },
      gender: "any",
      occupation: ["any"],
      incomeLimit: 9999999,
      category: ["All"],
      state: ["All"],
      maritalStatus: "any",
      landOwnership: null,
    },
    benefits: v.importantInfo && !v.importantInfo.startsWith("Eligibility: Check") ? v.importantInfo : "Refer to the scheme links to verify detailed benefits.",
    documents: ["Aadhaar Card", "Bank Account Details", "Income Certificate", "Passport Size Photos"],
    estimatedBenefit: 5000,
    tags: [v.source, ...(v.verificationNotes || [])].filter(t => t && !t.includes("low") && !t.includes("missing")),
    links: v.links,
  }));
/**
 * Sample schemes data with realistic Indian government welfare schemes
 * Each scheme includes structured eligibility criteria for accurate matching
 */
export const schemes: Scheme[] = [
  {
    id: "pm-kisan",
    name: "PM-KISAN",
    eligibility: {
      ageRange: { min: 18, max: 120 }, // Farmers of any age
      gender: "any",
      occupation: ["farmer", "agricultural worker"],
      incomeLimit: 600000, // ₹6 lakh annual income limit
      category: ["All"], // All categories eligible
      state: ["All"], // All states
      maritalStatus: "any",
      landOwnership: true, // Must own land
    },
    benefits: "₹6,000 per year in three equal installments for farmers with landholding up to 2 hectares",
    documents: ["Aadhaar Card", "Bank Account Details", "Land Records"],
    estimatedBenefit: 6000,
  },
  {
    id: "widow-pension",
    name: "National Widow Pension Scheme",
    eligibility: {
      ageRange: { min: 18, max: 120 }, // Widows above 18
      gender: "female",
      occupation: ["any"], // Any occupation
      incomeLimit: 200000, // ₹2 lakh annual income limit
      category: ["All"],
      state: ["All"],
      maritalStatus: "widow",
      landOwnership: null, // Not applicable
    },
    benefits: "₹2,000 per month financial assistance",
    documents: ["Widow Certificate", "Income Certificate", "Aadhaar Card"],
    estimatedBenefit: 24000, // Annual benefit
  },
  {
    id: "ayushman-bharat",
    name: "Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana",
    eligibility: {
      ageRange: { min: 0, max: 120 }, // All ages
      gender: "any",
      occupation: ["any"],
      incomeLimit: 500000, // ₹5 lakh annual income limit for rural, ₹8 lakh for urban (using conservative limit)
      category: ["All"],
      state: ["All"],
      maritalStatus: "any",
      landOwnership: null,
    },
    benefits: "Cashless treatment up to ₹5 lakh per family per year for secondary and tertiary care hospitalization",
    documents: ["Ayushman Bharat Card", "Income Certificate"],
    estimatedBenefit: 500000, // Maximum coverage
  },
  {
    id: "student-scholarship",
    name: "National Scholarship Portal - Post Matric Scholarship",
    eligibility: {
      ageRange: { min: 17, max: 30 }, // Students pursuing higher education
      gender: "any",
      occupation: ["student"],
      incomeLimit: 600000, // ₹6 lakh parental income limit
      category: ["SC", "ST", "OBC", "Minority"], // Reserved categories
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
      ageRange: { min: 18, max: 120 }, // Adult rural workers
      gender: "any",
      occupation: ["unskilled worker", "farmer", "laborer"],
      incomeLimit: 1000000, // No strict income limit, using high threshold
      category: ["All"],
      state: ["All"], // Available in rural areas of all states
      maritalStatus: "any",
      landOwnership: false, // Preferable for landless or marginal farmers
    },
    benefits: "100 days of guaranteed wage employment per year at minimum wage rates",
    documents: ["Job Card", "Aadhaar Card", "Bank Account"],
    estimatedBenefit: 60000, // Assuming 100 days at ₹200/day minimum wage
  },
  {
    id: "pm-ayushman-bharat-health",
    name: "Ayushman Bharat - Health and Wellness Centres",
    eligibility: {
      ageRange: { min: 0, max: 120 }, // All ages
      gender: "any",
      occupation: ["any"],
      incomeLimit: 1000000, // No income limit for basic healthcare
      category: ["All"],
      state: ["All"],
      maritalStatus: "any",
      landOwnership: null,
    },
    benefits: "Free comprehensive primary healthcare services including consultations, medicines, and diagnostics",
    documents: ["Aadhaar Card", "Health Card"],
    estimatedBenefit: 5000, // Estimated annual value of free services
  },
  {
    id: "digital-india-scholarship",
    name: "Pragati Scholarship for Girl Students",
    eligibility: {
      ageRange: { min: 17, max: 25 }, // Girl students in technical education
      gender: "female",
      occupation: ["student"],
      incomeLimit: 800000, // ₹8 lakh parental income limit
      category: ["All"],
      state: ["All"],
      maritalStatus: "unmarried", // Unmarried girls
      landOwnership: null,
    },
    benefits: "₹30,000 per year for tuition fees and ₹2,000 per month for incidentals",
    documents: ["Income Certificate", "Admission Letter", "Bank Account Details"],
    estimatedBenefit: 54000, // Annual scholarship amount
  },
  {
    id: "swachh-bharat-mission",
    name: "Swachh Bharat Mission - Individual Household Latrines",
    eligibility: {
      ageRange: { min: 18, max: 120 },
      gender: "any",
      occupation: ["any"],
      incomeLimit: 200000, // ₹2 lakh income limit for subsidy
      category: ["All"],
      state: ["All"],
      maritalStatus: "any",
      landOwnership: true, // Must own house/plot
    },
    benefits: "Subsidy up to ₹12,000 for construction of individual household latrines",
    documents: ["Aadhaar Card", "Income Certificate", "Property Documents"],
    estimatedBenefit: 12000,
  },
];

/**
 * Get all available schemes
 */
export function getAllSchemes(): Scheme[] {
  return [...schemes, ...verifiedSchemesConverted];
}

/**
 * Get a scheme by ID
 */
export function getSchemeById(id: string): Scheme | undefined {
  return [...schemes, ...verifiedSchemesConverted].find((scheme) => scheme.id === id);
}

/**
 * Get recommended schemes for a user profile using threshold-based filtering   
 * @param userProfile - User's demographic and economic profile
 * @returns MatchResult with recommended schemes, fallback indication, and metadata
 */
export function getRecommendedSchemes(userProfile: UserProfile): MatchResult {  
  return matchSchemes(userProfile, [...schemes, ...verifiedSchemesConverted]);
}