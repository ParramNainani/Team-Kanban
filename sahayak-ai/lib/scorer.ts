import type { Scheme, ScoredScheme, SortMode, UserProfile } from "../types/index";

const MAX_RAW_SCORE = 15;

function parseFundingAmount(amount: string | undefined): number {
  if (!amount) {
    return 0;
  }

  const cleaned = amount
    .toLowerCase()
    .replace(/[₹,\s]/g, "")
    .replace(/rs\.?/g, "")
    .trim();

  if (!cleaned) {
    return 0;
  }

  const valueMatch = cleaned.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (!valueMatch) {
    return 0;
  }

  const numericValue = Number(valueMatch[1]);
  if (Number.isNaN(numericValue)) {
    return 0;
  }

  if (cleaned.includes("crore")) {
    return numericValue * 10000000;
  }
  if (cleaned.includes("lakh") || cleaned.includes("lac")) {
    return numericValue * 100000;
  }
  if (cleaned.includes("thousand") || /k\b/.test(cleaned)) {
    return numericValue * 1000;
  }

  return Number(cleaned);
}

function normalizeValue(value: number, max: number): number {
  if (max <= 0) {
    return 0;
  }
  return Math.min(Math.max(value / max, 0), 1);
}

function checkOccupationMatch(userOccupation: string, schemeOccupations: string[]): boolean {
  return schemeOccupations.includes(userOccupation) || schemeOccupations.includes("any");
}

function checkCategoryMatch(userCategory: string, schemeCategories: string[]): boolean {
  return schemeCategories.includes(userCategory) || schemeCategories.includes("All");
}

function checkStateMatch(userState: string, schemeStates: string[]): boolean {
  return schemeStates.includes(userState) || schemeStates.includes("All");
}

function checkGenderMatch(userGender: "male" | "female", schemeGender: "male" | "female" | "any"): boolean {
  return schemeGender === "any" || schemeGender === userGender;
}

function checkMaritalStatusMatch(
  userStatus: string,
  schemeStatus: "married" | "unmarried" | "widow" | "any"
): boolean {
  return schemeStatus === "any" || schemeStatus === userStatus;
}

function checkLandOwnershipMatch(userLandOwnership: boolean, schemeLandOwnership: boolean | null): boolean {
  if (schemeLandOwnership === null) {
    return true;
  }
  return schemeLandOwnership === userLandOwnership;
}

export function calculateRawMatchScore(user: UserProfile, scheme: Scheme): number {
  let score = 0;

  if (checkOccupationMatch(user.occupation, scheme.eligibility.occupation)) {
    score += 3;
  }

  if (user.income <= scheme.eligibility.incomeLimit) {
    score += 3;
  }

  if (user.age >= scheme.eligibility.ageRange.min && user.age <= scheme.eligibility.ageRange.max) {
    score += 2;
  }

  if (checkCategoryMatch(user.category, scheme.eligibility.category)) {
    score += 2;
  }

  if (checkStateMatch(user.state, scheme.eligibility.state)) {
    score += 2;
  }

  if (checkGenderMatch(user.gender, scheme.eligibility.gender)) {
    score += 1;
  }

  if (checkMaritalStatusMatch(user.maritalStatus, scheme.eligibility.maritalStatus)) {
    score += 1;
  }

  if (checkLandOwnershipMatch(user.landOwnership, scheme.eligibility.landOwnership)) {
    score += 1;
  }

  return score;
}

export function scoreSchemes(
  user: UserProfile,
  schemes: Scheme[],
  options: { sortMode?: SortMode } = {}
): ScoredScheme[] {
  const rawScores = schemes.map((scheme) => calculateRawMatchScore(user, scheme));
  const relevanceScores = rawScores.map((score) => normalizeValue(score, MAX_RAW_SCORE));

  const fundingValues = schemes.map((scheme) => parseFundingAmount(scheme.fundingAmount));
  const maxFundingValue = Math.max(...fundingValues, 0);

  const scored: ScoredScheme[] = schemes.map((scheme, index) => {
    const rawScore = rawScores[index];
    const relevanceScore = relevanceScores[index];
    const revenueScore = normalizeValue(fundingValues[index], maxFundingValue);
    const finalScore = relevanceScore * 0.6 + revenueScore * 0.4;

    return {
      ...scheme,
      score: rawScore,
      relevanceScore,
      revenueScore,
      finalScore,
      isFallback: false,
    };
  });

  const sortMode = options.sortMode ?? "combined";
  return scored.sort((a, b) => {
    if (sortMode === "relevance") {
      return b.relevanceScore - a.relevanceScore;
    }
    if (sortMode === "revenue") {
      return b.revenueScore - a.revenueScore;
    }
    return b.finalScore - a.finalScore;
  });
}
