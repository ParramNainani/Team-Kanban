import type { MultilingualKeyword, SupportedLanguage } from "../types/index";

const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["en", "hi", "ta", "bn", "mr"];
const LIBRETRANSLATE_URL = process.env.LIBRETRANSLATE_URL ?? "https://libretranslate.com/translate";

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "from", "this", "that", "these", "those", "many", "have", "been", "your", "will", "into", "also", "such", "through", "including", "between", "under", "over", "into", "which", "where",
  "need", "please", "help",
]);

const SYNONYM_CANONICAL: Record<string, string> = {
  schlarship: "scholarship",
  scholarship: "scholarship",
  aggriculture: "agriculture",
  agriculture: "agriculture",
  busines: "business",
  business: "business",
  lone: "loan",
  loan: "loan",
  hlep: "help",
  help: "help",
  studnt: "student",
  student: "student",
  kisan: "farmer",
  कृषि: "farm",
  krishi: "farm",
  farmer: "farmer",
  farmers: "farmer",
  agricultural: "farm",
  farming: "farm",
  farmed: "farm",
  village: "rural",
  rural: "rural",
  school: "education",
  education: "education",
  studies: "study",
  study: "study",
  mahila: "women",
  महिला: "women",
  women: "women",
  छात्र: "student",
  rozgar: "employment",
  employment: "employment",
};

const LANGUAGE_SCRIPT_PATTERNS: Array<{ lang: SupportedLanguage; regex: RegExp }> = [
  { lang: "ta", regex: /[\u0B80-\u0BFF]/ },
  { lang: "bn", regex: /[\u0980-\u09FF]/ },
  { lang: "hi", regex: /[\u0900-\u097F]/ },
];

function safeTrim(value: string): string {
  return value.trim().replace(/[\s\n\r]+/g, " ");
}

function buildRequestBody(text: string, target: SupportedLanguage): string {
  return JSON.stringify({
    q: text,
    source: "auto",
    target,
    format: "text",
  });
}

async function translateText(text: string, targetLanguage: SupportedLanguage): Promise<string> {
  if (!text.trim()) {
    return text;
  }

  try {
    const response = await fetch(LIBRETRANSLATE_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: buildRequestBody(text, targetLanguage),
    });

    if (!response.ok) {
      return text;
    }

    const body = (await response.json()) as { translatedText?: string };
    return body.translatedText ? safeTrim(body.translatedText) : text;
  } catch {
    return text;
  }
}

function tokenize(text: string): string[] {
  return safeTrim(text)
    .toLowerCase()
    .replace(/[^0-9A-Za-z\u0900-\u097F\u0B80-\u0BFF\u0980-\u09FF\s]/g, " ")
    .split(/\s+/)
    .filter(
      (token) =>
        token.length >= 3 &&
        !STOP_WORDS.has(token) &&
        /[A-Za-z\u0900-\u097F\u0B80-\u0BFF\u0980-\u09FF]/.test(token)
    );
}

function lemmatizeToken(token: string): string {
  const normalized = token.toLowerCase();
  if (SYNONYM_CANONICAL[normalized]) {
    return SYNONYM_CANONICAL[normalized];
  }

  if (normalized.endsWith("ies")) {
    return `${normalized.slice(0, -3)}y`;
  }

  if (normalized.endsWith("ing") && normalized.length > 5) {
    return normalized.slice(0, -3);
  }

  if (normalized.endsWith("ed") && normalized.length > 4) {
    return normalized.slice(0, -2);
  }

  if (normalized.endsWith("es") && normalized.length > 4) {
    return normalized.slice(0, -2);
  }

  if (normalized.endsWith("s") && normalized.length > 3) {
    return normalized.slice(0, -1);
  }

  return normalized;
}

function buildTermFrequency(tokens: string[]): Map<string, number> {
  const frequencies = new Map<string, number>();
  for (const token of tokens) {
    frequencies.set(token, (frequencies.get(token) ?? 0) + 1);
  }
  return frequencies;
}

function mergeSynonyms(tokens: string[]): string[] {
  const seen = new Set<string>();
  const results: string[] = [];

  for (const token of tokens) {
    const canonical = SYNONYM_CANONICAL[token] ?? token;
    if (!seen.has(canonical)) {
      seen.add(canonical);
      results.push(canonical);
    }
  }

  return results;
}

export function detectLanguage(text: string): SupportedLanguage | "unknown" {
  const trimmed = safeTrim(text);
  if (!trimmed) {
    return "unknown";
  }

  for (const entry of LANGUAGE_SCRIPT_PATTERNS) {
    if (entry.regex.test(trimmed)) {
      return entry.lang;
    }
  }

  return "en";
}

export async function normalizeQuery(query: string): Promise<string> {
  const cleaned = safeTrim(query);
  const sourceLang = detectLanguage(cleaned);

  if (sourceLang !== "en" && sourceLang !== "unknown") {
    return translateText(cleaned, "en");
  }

  return cleaned;
}

export async function translateKeyword(keyword: string): Promise<MultilingualKeyword> {
  const sanitized = safeTrim(keyword);
  const translations = await Promise.all(
    SUPPORTED_LANGUAGES.map(async (lang) => {
      if (lang === "en") {
        return sanitized;
      }
      return translateText(sanitized, lang);
    })
  );

  return {
    en: sanitized,
    hi: translations[1],
    ta: translations[2],
    bn: translations[3],
    mr: translations[4],
  };
}

export async function expandQueryThroughTranslation(
  keywords: string[],
  sourceLanguage?: SupportedLanguage
): Promise<string[]> {
  const normalizedKeywords = keywords.map((keyword) => safeTrim(keyword)).filter(Boolean);
  const targetLanguage = sourceLanguage ?? detectLanguage(normalizedKeywords.join(" "));
  const multilingualSet = new Set<string>(normalizedKeywords.map((keyword) => keyword.toLowerCase()));

  const translations = await Promise.all(
    normalizedKeywords.map(async (keyword) => {
      const entry = await translateKeyword(keyword);
      return Object.values(entry).map((value) => value.toLowerCase());
    })
  );

  for (const translationArray of translations) {
    for (const value of translationArray) {
      multilingualSet.add(value);
    }
  }

  if (targetLanguage !== "en" && targetLanguage !== "unknown") {
    const englishTranslations = await Promise.all(
      normalizedKeywords.map((keyword) => translateText(keyword, "en"))
    );
    for (const value of englishTranslations) {
      multilingualSet.add(value.toLowerCase());
    }
  }

  return Array.from(multilingualSet);
}

export function refineKeywords(rawText: string): string[] {
  const tokens = tokenize(rawText);
  if (tokens.length === 0) {
    return [];
  }

  const frequencies = buildTermFrequency(tokens);
  const totalTokens = tokens.length;
  const candidateKeywords: Array<{ token: string; score: number }> = [];

  for (const [token, count] of Array.from(frequencies.entries())) {
    const lemma = lemmatizeToken(token);
    const normalized = lemma.toLowerCase();
    if (normalized.length < 3) {
      continue;
    }

    const tf = count / totalTokens;
    const tfidf = tf;

    if (tfidf >= 0.1) {
      candidateKeywords.push({ token: normalized, score: tfidf });
    }
  }

  if (candidateKeywords.length === 0) {
    const fallbackTokens = tokens
      .map((token) => lemmatizeToken(token.toLowerCase()))
      .map((token) => (SYNONYM_CANONICAL[token] ?? token));
    return Array.from(new Set(fallbackTokens)).slice(0, 5);
  }

  candidateKeywords.sort((a, b) => b.score - a.score);
  const ranked = candidateKeywords.map((entry) => entry.token);
  return mergeSynonyms(ranked);
}

function phraseToVector(text: string): Map<string, number> {
  const tokens = tokenize(text);
  const frequencies = buildTermFrequency(tokens);
  const vector = new Map<string, number>();
  let total = 0;

  for (const count of Array.from(frequencies.values())) {
    total += count;
  }

  for (const [token, count] of Array.from(frequencies.entries())) {
    vector.set(token, count / total);
  }

  return vector;
}

export function cosineSimilarity(left: string, right: string): number {
  const leftVector = phraseToVector(left);
  const rightVector = phraseToVector(right);
  if (leftVector.size === 0 || rightVector.size === 0) {
    return 0;
  }

  let dotProduct = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  const seen = Array.from(
    new Set<string>(
      Array.from(leftVector.keys()).concat(Array.from(rightVector.keys()))
    )
  );

  for (const token of seen) {
    const leftValue = leftVector.get(token) ?? 0;
    const rightValue = rightVector.get(token) ?? 0;
    dotProduct += leftValue * rightValue;
    leftMagnitude += leftValue ** 2;
    rightMagnitude += rightValue ** 2;
  }

  if (leftMagnitude <= 0 || rightMagnitude <= 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

export function semanticFallback(query: string, candidates: string[], threshold = 0.45): string | null {
  const scored = candidates
    .map((candidate) => ({ candidate, score: cosineSimilarity(query, candidate) }))
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0 || scored[0].score < threshold) {
    return null;
  }

  return scored[0].candidate;
}