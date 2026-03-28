/**
 * Score how well keywords align with scheme tags.
 * For every keyword–tag pair, adds points (highest matching rule only per pair).
 */

/** Trim + lowercase; used for keywords, tags, and synonym entries. */
export function normalizeToken(text: string): string {
  return text.trim().toLowerCase();
}

/** Canonical term → related phrases (all compared after trim + lowercase). */
const synonymMap: Record<string, string[]> = {
  poor: ["low income", "bpl"],
  student: ["education", "school"],
  widow: ["female", "husband died"],
};

const SYNONYM_GROUPS: string[][] = Object.entries(synonymMap).map(([key, syns]) => [
  normalizeToken(key),
  ...syns.map((s) => normalizeToken(s)),
]);

/** True when both strings appear in the same synonym group (and are not identical). */
function isSynonymPair(a: string, b: string): boolean {
  if (a === b) return false;
  return SYNONYM_GROUPS.some((group) => group.includes(a) && group.includes(b));
}

function pointsForPair(keyword: string, tag: string): number {
  if (keyword === "" || tag === "") return 0;
  if (keyword === tag) return 20;
  if (keyword.includes(tag) || tag.includes(keyword)) return 10;
  if (isSynonymPair(keyword, tag)) return 5;
  return 0;
}

/**
 * +20 exact · +10 substring · +5 same synonym group (see synonymMap).
 */
export function calculateScore(keywords: string[], tags: string[]): number {
  let total = 0;

  for (const rawKeyword of keywords) {
    const keyword = normalizeToken(rawKeyword);
    for (const rawTag of tags) {
      const tag = normalizeToken(rawTag);
      total += pointsForPair(keyword, tag);
    }
  }

  return total;
}
