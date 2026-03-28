import type { UserProfile, Scheme, ScoredScheme, MatchResult } from "../types/index";
import { generateTags } from "./ai/gap-detector";

/**
 * Compute the maximum possible score for scheme matching.
 * Sum of all eligibility weights:
 * - occupation: 3
 * - income: 3
 * - age: 2
 * - category: 2
 * - state: 2
 * - gender: 1
 * - maritalStatus: 1
 * - landOwnership: 1
 * - keyword relevance matches: 5 (max)
 * Total: 20
 */
export function computeMaxScore(): number {
  return 3 + 3 + 2 + 2 + 2 + 1 + 1 + 1 + 5; // 20
}

/**
 * Minimum score required for a scheme to be recommended.
 * Set at 60% of maximum possible score — lowered from 80% to allow
 * more diverse results while still filtering irrelevant ones.
 */
export const RECOMMENDATION_THRESHOLD = Math.round(computeMaxScore() * 0.60);

/** Occupation synonym groups for fuzzy matching */
const OCCUPATION_SYNONYMS: Record<string, string[]> = {
  farmer: ["farmer", "agricultural worker", "cultivator", "kisan", "agriculture"],
  student: ["student", "scholar", "learner", "pupil"],
  laborer: ["laborer", "labour", "unskilled worker", "daily wage worker", "worker", "construction worker"],
  "self-employed": ["self-employed", "entrepreneur", "business owner", "shopkeeper", "vendor", "msme"],
  teacher: ["teacher", "instructor", "educator", "professor", "lecturer"],
  housewife: ["housewife", "homemaker", "home maker"],
  retired: ["retired", "pensioner", "senior"],
};

/**
 * Check if user's occupation matches scheme's eligible occupations
 * Uses fuzzy matching with synonym groups
 */
function checkOccupationMatch(userOccupation: string, schemeOccupations: string[]): boolean {
  if (schemeOccupations.includes("any")) return true;

  const userLower = userOccupation.toLowerCase().trim();

  // Direct match
  if (schemeOccupations.some(o => o.toLowerCase() === userLower)) return true;

  // Fuzzy synonym match
  for (const [, synonyms] of Object.entries(OCCUPATION_SYNONYMS)) {
    const userInGroup = synonyms.some(s => userLower.includes(s) || s.includes(userLower));
    if (userInGroup) {
      const schemeInGroup = schemeOccupations.some(o =>
        synonyms.some(s => o.toLowerCase().includes(s) || s.includes(o.toLowerCase()))
      );
      if (schemeInGroup) return true;
    }
  }

  // Substring match as last resort
  return schemeOccupations.some(o =>
    userLower.includes(o.toLowerCase()) || o.toLowerCase().includes(userLower)
  );
}

/**
 * Check if user's category matches scheme's eligible categories
 */
function checkCategoryMatch(userCategory: string, schemeCategories: string[]): boolean {
  if (schemeCategories.includes("All")) return true;
  const userLower = userCategory.toLowerCase();
  return schemeCategories.some(c => c.toLowerCase() === userLower);
}

/** State name normalization map */
const STATE_ALIASES: Record<string, string[]> = {
  "uttar pradesh": ["up", "uttar pradesh"],
  "madhya pradesh": ["mp", "madhya pradesh"],
  "andhra pradesh": ["ap", "andhra pradesh"],
  "tamil nadu": ["tn", "tamil nadu", "tamilnadu"],
  "west bengal": ["wb", "west bengal"],
  "maharashtra": ["mh", "maharashtra"],
  "karnataka": ["ka", "karnataka"],
  "rajasthan": ["rj", "rajasthan"],
  "bihar": ["bihar", "br"],
  "gujarat": ["gj", "gujarat"],
  "punjab": ["pb", "punjab"],
  "haryana": ["hr", "haryana"],
  "jharkhand": ["jh", "jharkhand"],
  "odisha": ["or", "odisha", "orissa"],
  "kerala": ["kl", "kerala"],
  "telangana": ["ts", "telangana"],
};

/**
 * Check if user's state matches scheme's applicable states (with alias support)
 */
function checkStateMatch(userState: string, schemeStates: string[]): boolean {
  if (schemeStates.includes("All")) return true;

  const userLower = userState.toLowerCase().trim();

  // Direct match
  if (schemeStates.some(s => s.toLowerCase() === userLower)) return true;

  // Alias match
  for (const [, aliases] of Object.entries(STATE_ALIASES)) {
    const userInGroup = aliases.includes(userLower);
    if (userInGroup) {
      return schemeStates.some(s => aliases.includes(s.toLowerCase()));
    }
  }

  return false;
}

/**
 * Check if user's gender matches scheme's allowed gender
 */
function checkGenderMatch(userGender: "male" | "female", schemeGender: "male" | "female" | "any"): boolean {
  return schemeGender === "any" || schemeGender === userGender;
}

/**
 * Check if user's marital status matches scheme's allowed status
 */
function checkMaritalStatusMatch(userStatus: string, schemeStatus: "married" | "unmarried" | "widow" | "any"): boolean {
  return schemeStatus === "any" || schemeStatus === userStatus;
}

/**
 * Check if user's land ownership matches scheme requirements
 */
function checkLandOwnershipMatch(userLandOwnership: boolean, schemeLandOwnership: boolean | null): boolean {
  if (schemeLandOwnership === null) return true; // Not applicable
  return schemeLandOwnership === userLandOwnership;
}

/**
 * Check hard disqualification rules - if any fail, return true (disqualified)
 */
function isDisqualified(user: UserProfile, scheme: Scheme): boolean {
  // Income check
  if (user.income > scheme.eligibility.incomeLimit) return true;

  // Age check — only disqualify if age is known (> 0)
  if (user.age > 0 && (user.age < scheme.eligibility.ageRange.min || user.age > scheme.eligibility.ageRange.max)) {
    return true;
  }

  // Gender check — hard disqualification
  if (!checkGenderMatch(user.gender, scheme.eligibility.gender)) return true;

  // Category check
  if (!checkCategoryMatch(user.category, scheme.eligibility.category)) return true;

  return false;
}

/**
 * Calculate matching score for a user against a scheme
 */
function calculateScore(user: UserProfile, scheme: Scheme): number {
  if (isDisqualified(user, scheme)) return 0;

  let score = 0;

  // Occupation match (+3)
  if (checkOccupationMatch(user.occupation, scheme.eligibility.occupation)) score += 3;

  // Income within limit (+3) — graduated scoring
  if (user.income <= scheme.eligibility.incomeLimit) {
    const ratio = user.income / scheme.eligibility.incomeLimit;
    score += ratio < 0.5 ? 3 : ratio < 0.8 ? 2 : 1; // Better match for lower income
  }

  // Age within range (+2)
  if (user.age >= scheme.eligibility.ageRange.min && user.age <= scheme.eligibility.ageRange.max) score += 2;

  // Category match (+2)
  if (checkCategoryMatch(user.category, scheme.eligibility.category)) score += 2;

  // State match (+2)
  if (checkStateMatch(user.state, scheme.eligibility.state)) score += 2;

  // Gender match (+1)
  if (checkGenderMatch(user.gender, scheme.eligibility.gender)) score += 1;

  // Marital status match (+1)
  if (checkMaritalStatusMatch(user.maritalStatus, scheme.eligibility.maritalStatus)) score += 1;

  // Land ownership match (+1)
  if (checkLandOwnershipMatch(user.landOwnership, scheme.eligibility.landOwnership)) score += 1;

  // Keyword relevance match (+5 max) based on unstructured data
  const searchString = `${scheme.name} ${scheme.description || ""} ${scheme.benefits}`.toLowerCase();

  if (user.occupation && user.occupation !== "any") {
    // Also check synonyms in text
    const userOccLower = user.occupation.toLowerCase();
    const synonymGroup = Object.values(OCCUPATION_SYNONYMS).find(group =>
      group.some(s => userOccLower.includes(s) || s.includes(userOccLower))
    );
    if (synonymGroup) {
      if (synonymGroup.some(s => searchString.includes(s))) score += 2;
    } else if (searchString.includes(userOccLower)) {
      score += 2;
    }
  }

  if (user.state && user.state !== "All") {
    const userStateLower = user.state.toLowerCase();
    if (searchString.includes(userStateLower)) score += 2;
    else {
      // Check aliases
      const aliases = Object.values(STATE_ALIASES).find(a => a.includes(userStateLower));
      if (aliases?.some(a => searchString.includes(a))) score += 2;
    }
  }

  if (user.category && user.category !== "All") {
    if (searchString.includes(user.category.toLowerCase())) score += 1;
  }

  return score;
}

/**
 * Match schemes for a user profile based on structured eligibility criteria
 * @param user - User profile with demographic and economic information
 * @param schemes - Array of available schemes with eligibility criteria
 * @returns MatchResult with scored and ranked schemes using threshold-based filtering
 */
export function matchSchemes(user: UserProfile, schemes: Scheme[]): MatchResult {
  // Calculate scores for all schemes
  const scoredSchemes: ScoredScheme[] = schemes.map((scheme) => ({
    tags: generateTags(scheme),
    ...scheme,
    score: calculateScore(user, scheme),
    isFallback: false,
  }));

  // Filter out disqualified schemes (score = 0)
  const eligibleSchemes = scoredSchemes.filter((scheme) => scheme.score > 0);

  // Sort by score descending, then by estimatedBenefit as tiebreaker
  const sortedSchemes = eligibleSchemes.sort((a, b) =>
    b.score - a.score || b.estimatedBenefit - a.estimatedBenefit
  );

  // Filter schemes that meet the recommendation threshold
  const recommendedSchemes = sortedSchemes.filter((scheme) => scheme.score >= RECOMMENDATION_THRESHOLD);

  let finalSchemes: ScoredScheme[];
  let recommendedCount: number;

  if (recommendedSchemes.length > 0) {
    finalSchemes = recommendedSchemes.slice(0, 8); // Allow up to 8 matches
    recommendedCount = finalSchemes.length;
  } else if (sortedSchemes.length > 0) {
    // Fallback: return top 3 highest scored
    finalSchemes = sortedSchemes.slice(0, 3).map(s => ({ ...s, isFallback: true }));
    recommendedCount = 0;
  } else {
    finalSchemes = [];
    recommendedCount = 0;
  }

  const totalEstimatedBenefit = finalSchemes.reduce(
    (total, scheme) => total + scheme.estimatedBenefit,
    0
  );

  return {
    schemes: finalSchemes,
    totalEstimatedBenefit,
    recommendedCount,
    thresholdUsed: RECOMMENDATION_THRESHOLD,
  };
}