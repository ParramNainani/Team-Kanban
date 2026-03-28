import type { Scheme, UserProfile } from "../types/index";

export interface ExcludedScheme {
  scheme: Scheme;
  reason: string;
}

export interface ExclusionOptions {
  includeExpired?: boolean;
}

export interface ExclusionResult {
  acceptedSchemes: Scheme[];
  excludedSchemes: ExcludedScheme[];
}

function checkStateMatch(userState: string, schemeStates: string[]): boolean {
  return schemeStates.includes(userState) || schemeStates.includes("All");
}

function checkCategoryMatch(userCategory: string, schemeCategories: string[]): boolean {
  return schemeCategories.includes(userCategory) || schemeCategories.includes("All");
}

function checkGenderMatch(userGender: "male" | "female", schemeGender: "male" | "female" | "any"): boolean {
  return schemeGender === "any" || schemeGender === userGender;
}

export function applyExclusionFilter(
  user: UserProfile,
  schemes: Scheme[],
  options: ExclusionOptions = {}
): ExclusionResult {
  const acceptedSchemes: Scheme[] = [];
  const excludedSchemes: ExcludedScheme[] = [];

  for (const scheme of schemes) {
    if (!checkGenderMatch(user.gender, scheme.eligibility.gender)) {
      excludedSchemes.push({ scheme, reason: "Gender mismatch" });
      continue;
    }

    if (user.age < scheme.eligibility.ageRange.min || user.age > scheme.eligibility.ageRange.max) {
      excludedSchemes.push({ scheme, reason: "Age outside eligible range" });
      continue;
    }

    if (!checkCategoryMatch(user.category, scheme.eligibility.category)) {
      excludedSchemes.push({ scheme, reason: "Category mismatch" });
      continue;
    }

    if (user.income > scheme.eligibility.incomeLimit) {
      excludedSchemes.push({ scheme, reason: "Income exceeds scheme limit" });
      continue;
    }

    const expired = scheme.metadata?.expired ?? false;
    if (expired && !options.includeExpired) {
      excludedSchemes.push({ scheme, reason: "Scheme expired" });
      continue;
    }

    acceptedSchemes.push(scheme);
  }

  return { acceptedSchemes, excludedSchemes };
}
