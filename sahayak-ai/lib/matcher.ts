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
 * Set at 80% of maximum possible score to ensure high quality matches.
 */
export const RECOMMENDATION_THRESHOLD = Math.round(computeMaxScore() * 0.80);

/**
 * Check if user's occupation matches scheme's eligible occupations
 */
function checkOccupationMatch(userOccupation: string, schemeOccupations: string[]): boolean {
  return schemeOccupations.includes(userOccupation) || schemeOccupations.includes("any");
}

/**
 * Check if user's category matches scheme's eligible categories
 */
function checkCategoryMatch(userCategory: string, schemeCategories: string[]): boolean {
  return schemeCategories.includes(userCategory) || schemeCategories.includes("All");
}

/**
 * Check if user's state matches scheme's applicable states
 */
function checkStateMatch(userState: string, schemeStates: string[]): boolean {
  return schemeStates.includes(userState) || schemeStates.includes("All");
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
  if (schemeLandOwnership === null) {
    return true; // Not applicable, so always pass
  }
  return schemeLandOwnership === userLandOwnership;
}

/**
 * Check hard disqualification rules - if any fail, return true (disqualified)
 */
function isDisqualified(user: UserProfile, scheme: Scheme): boolean {
  // Income check - user income must be <= scheme limit
  if (user.income > scheme.eligibility.incomeLimit) {
    return true;
  }

  // Age check - user age must be within range
  if (user.age < scheme.eligibility.ageRange.min || user.age > scheme.eligibility.ageRange.max) {
    return true;
  }

  // Category check - user category must be included
  if (!checkCategoryMatch(user.category, scheme.eligibility.category)) {
    return true;
  }

  // Occupation check - user occupation MUST match (unless scheme allows "any")
  if (!checkOccupationMatch(user.occupation, scheme.eligibility.occupation)) {
    return true;
  }
  return false;
}

/**
 * Calculate matching score for a user against a scheme */
function calculateScore(user: UserProfile, scheme: Scheme): number {
  // Check hard disqualifications first
  if (isDisqualified(user, scheme)) {
    return 0;
  }

  let score = 0;

  // Occupation match (+3)
  if (checkOccupationMatch(user.occupation, scheme.eligibility.occupation)) {
    score += 3;
  }

  // Income within limit (+3) - already checked in disqualification, but add score
  if (user.income <= scheme.eligibility.incomeLimit) {
    score += 3;
  }

  // Age within range (+2) - already checked in disqualification, but add score
  if (user.age >= scheme.eligibility.ageRange.min && user.age <= scheme.eligibility.ageRange.max) {
    score += 2;
  }

  // Category match (+2) - already checked in disqualification, but add score
  if (checkCategoryMatch(user.category, scheme.eligibility.category)) {
    score += 2;
  }

  // State match (+2)
  if (checkStateMatch(user.state, scheme.eligibility.state)) {
    score += 2;
  }

  // Gender match (+1)
  if (checkGenderMatch(user.gender, scheme.eligibility.gender)) {
    score += 1;
  }

  // Marital status match (+1)
  if (checkMaritalStatusMatch(user.maritalStatus, scheme.eligibility.maritalStatus)) {
    score += 1;
  }

  // Land ownership match (+1)
  if (checkLandOwnershipMatch(user.landOwnership, scheme.eligibility.landOwnership)) {
    score += 1;
  }

  // Keyword relevance match (+5 max) based on unstructured data
  const searchString = `${scheme.name} ${scheme.description || ""} ${scheme.benefits}`.toLowerCase();
  
  if (user.occupation && user.occupation !== 'any') {
    if (searchString.includes(user.occupation.toLowerCase())) {
      score += 2;
    }
  }
  
  if (user.state && user.state !== 'All') {
    if (searchString.includes(user.state.toLowerCase())) {
      score += 2;
    }
  }
  
  if (user.category && user.category !== 'All') {
    if (searchString.includes(user.category.toLowerCase())) {
      score += 1;
    }
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
    isFallback: false, // Will be updated based on threshold logic
  }));

  // Filter out disqualified schemes (score = 0)
  const eligibleSchemes = scoredSchemes.filter((scheme) => scheme.score > 0);

  // Sort by score descending
  const sortedSchemes = eligibleSchemes.sort((a, b) => b.score - a.score);

  // Filter schemes that meet the recommendation threshold
  const recommendedSchemes = sortedSchemes.filter((scheme) => scheme.score >= RECOMMENDATION_THRESHOLD);

  let finalSchemes: ScoredScheme[];
  let recommendedCount: number;

  if (recommendedSchemes.length > 0) {
    // Use only recommended schemes
    finalSchemes = recommendedSchemes.slice(0, 5); // Take top 5
    recommendedCount = finalSchemes.length;
  } else {
    // Fallback: return highest scored scheme
    finalSchemes = sortedSchemes.length > 0 ? [sortedSchemes[0]] : [];
    if (finalSchemes.length > 0) {
      finalSchemes[0].isFallback = true;
    }
    recommendedCount = 0;
  }

  // Calculate total estimated benefit
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