import { getAllSchemes } from "../../services/schemeService";
import type { MatchResult, Scheme, ScoredScheme } from "../../types/index";
import { calculateScore, normalizeToken } from "../utils/scoring";

/**
 * Keyword map for tag generation.
 * Each tag maps to an array of keywords that should trigger its inclusion.
 */
const keywordMap: Record<string, string[]> = {
  widow: ["widow", "widows"],
  student: ["student", "education", "school", "college", "university"],
  farmer: ["farmer", "agriculture", "farming", "crop"],
  "low income": ["low income", "bpl", "poor", "below poverty", "economically weaker"],
  elderly: ["senior citizen", "above 60", "60+", "aged", "elderly", "pensioner"],
  unemployed: ["jobless", "unemployed", "job seeker", "without employment"],
  female: ["female", "women", "woman", "girl", "girls", "ladies"],
  healthcare: ["hospital", "medical", "health", "healthcare", "medicine"],
  pension: ["pension", "retire", "retirement"],
  "financial support": ["money", "financial", "cash", "₹", "support", "benefit", "amount"],
  welfare: ["welfare", "social welfare"],
  adult: ["adult", "18 years", "above 18"],
  disability: ["disability", "disabled", "handicap", "special needs"],
  sc: ["scheduled caste", "sc", "dalit"],
  st: ["scheduled tribe", "st", "tribal"],
  obc: ["obc", "other backward"],
  minority: ["minority", "religious minority"],
};

/**
 * Generate tags for a welfare scheme based on its properties.
 * Combines eligibility, benefits, category, and description to extract relevant tags.
 *
 * @param scheme - Scheme object with name, eligibility, benefits, category, description, etc.
 * @returns Array of normalized, deduplicated tags
 */
export function generateTags(scheme: any): string[] {
  const tags: Set<string> = new Set();

  // Combine all relevant text fields into one searchable block
  const textBlock = [
    scheme.name || "",
    scheme.eligibility || "",
    scheme.benefits || "",
    scheme.category || "",
    scheme.description || "",
    scheme.targetGroup || "",
  ]
    .join(" ")
    .toLowerCase();

  // Loop through keyword map and check for matches
  for (const [tag, keywords] of Object.entries(keywordMap)) {
    for (const keyword of keywords) {
      if (textBlock.includes(keyword.toLowerCase())) {
        tags.add(tag);
        break; // Found a match for this tag, move to next tag
      }
    }
  }

  // Convert set to sorted array for consistent output
  return Array.from(tags).sort();
}

/** Ready keyword list for scoring: normalized tokens, no empties. */
function prepareKeywords(keywords: string[]): string[] {
  return keywords.map(normalizeToken).filter((k) => k !== "");
}

/**
 * Walk items in order; keep first occurrence of each `id` until `limit` items.
 */
function takeUniqueById<T extends { id: string }>(items: T[], limit: number): T[] {
  const seenIds = new Set<string>();
  const taken: T[] = [];

  for (const item of items) {
    if (seenIds.has(item.id)) continue;
    seenIds.add(item.id);
    taken.push(item);
    if (taken.length >= limit) break;
  }

  return taken;
}

function toSchemeOnly(row: ScoredScheme): Scheme {
  const { score: _score, ...scheme } = row;
  return scheme;
}

function sumEstimatedBenefit(schemes: Scheme[]): number {
  return schemes.reduce((sum, scheme) => sum + scheme.estimatedBenefit, 0);
}

/**
 * Score every scheme against the keyword list, then return the best few matches
 * with aggregate benefit.
 * NOTE: This is the legacy tag-based matcher. Use lib/matcher.ts for new eligibility-based matching.
 */
export function matchSchemes(keywords: string[]): MatchResult {
  const catalog = getAllSchemes();
  const keywordTokens = prepareKeywords(keywords);

  if (process.env.DEBUG_MATCH === "1") {
    console.log("[gap-detector] keyword tokens:", keywordTokens);
  }

  const ranked: ScoredScheme[] = catalog.map((scheme) => {
    // For backward compatibility, generate tags from eligibility data
    const generatedTags = generateTags(scheme);
    const score = calculateScore(keywordTokens, generatedTags);
    if (process.env.DEBUG_MATCH === "1") {
      console.log(
        `[gap-detector] scheme: ${scheme.name} | tags: [${generatedTags.join(", ")}] | score: ${score}`,
      );
    }
    return { ...scheme, score, isFallback: false };
  });

  const matched = ranked.filter((row) => row.score > 0);
  const byScoreDesc = [...matched].sort((a, b) => b.score - a.score);
  const topMatches = takeUniqueById(byScoreDesc, 5);

  const schemesOut: ScoredScheme[] =
    topMatches.length === 0
      ? takeUniqueById(catalog.map(s => ({ ...s, score: 0, isFallback: false })), 3)
      : topMatches;

  return {
    schemes: schemesOut,
    totalEstimatedBenefit: sumEstimatedBenefit(schemesOut),
    recommendedCount: schemesOut.length, // Legacy: all returned schemes are "recommended"
    thresholdUsed: 0, // Legacy: no threshold used
  };
}