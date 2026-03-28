import type {
  ExtractionConfidence,
  Scheme,
  SchemeMetadata,
  TermsParsed,
  SchemeType,
  ApplicationMode,
} from "../types/index";

const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

function safeText(text: string): string {
  return text.replace(/[\r\t]+/g, " ").trim();
}

function parseDateString(dateToken: string): Date | null {
  const normalized = dateToken.trim().replace(/[\n\r]+/g, " ");
  const isoMatch = normalized.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const slashMatch = normalized.match(/(\d{1,2})[\/](\d{1,2})[\/](\d{2,4})/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    let numericYear = Number(year);
    if (numericYear < 100) {
      numericYear += numericYear < 70 ? 2000 : 1900;
    }
    return new Date(numericYear, Number(month) - 1, Number(day));
  }

  const longMatch = normalized.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (longMatch) {
    const [, dayText, monthText, yearText] = longMatch;
    const monthIndex = MONTH_NAMES.indexOf(monthText.toLowerCase());
    if (monthIndex >= 0) {
      return new Date(Number(yearText), monthIndex, Number(dayText));
    }
  }

  return null;
}

function extractSection(rawText: string, anchors: string[]): string {
  const lines = safeText(rawText).split(/\n+/);
  const lowered = lines.map((line) => line.toLowerCase());
  const startIndex = lowered.findIndex((line) => anchors.some((anchor) => line.includes(anchor)));

  if (startIndex === -1) {
    return "";
  }

  const sectionLines: string[] = [];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) {
      break;
    }
    if (/^(terms|eligibility|documents required|how to apply|application process|contact|notes)/i.test(line)) {
      break;
    }
    sectionLines.push(line);
  }

  return sectionLines.join("\n");
}

function parseDateFromAnchor(rawText: string, anchors: string[]): Date | "Ongoing" | null {
  for (const anchor of anchors) {
    const regex = new RegExp(`${anchor}[:\s-]*(?<date>[^\n]+)`, "i");
    const match = rawText.match(regex);
    if (match?.groups?.date) {
      const extracted = match.groups.date.trim();
      if (/ongoing/i.test(extracted)) {
        return "Ongoing";
      }
      const lower = extracted.toLowerCase();
      if (lower.includes("ongoing")) {
        return "Ongoing";
      }
      const parsed = parseDateString(extracted);
      if (parsed) {
        return parsed;
      }
    }
  }

  return null;
}

function findFirstUrl(rawText: string): string {
  const match = rawText.match(/https?:\/\/[\w-./?&=]+/i);
  return match ? match[0] : "";
}

function findContactInfo(rawText: string): string {
  const emailMatch = rawText.match(/[\w.-]+@[\w.-]+\.[A-Za-z]{2,}/);
  if (emailMatch) {
    return emailMatch[0];
  }

  const phoneMatch = rawText.match(/(?:\+91|0)?[6-9]\d{9}/);
  if (phoneMatch) {
    return phoneMatch[0];
  }

  return "";
}

function splitSentences(rawText: string): string[] {
  const cleaned = safeText(rawText);
  return cleaned
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function extractListItems(sectionText: string): string[] {
  const lines = sectionText.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const items: string[] = [];

  for (const line of lines) {
    const bulletMatch = line.match(/^(?:[-*•]|\d+[.)])\s*(.+)$/);
    if (bulletMatch) {
      items.push(bulletMatch[1].trim());
    }
  }

  return items;
}

function buildShortSummary(fullDescription: string): string {
  const sentences = splitSentences(fullDescription);
  if (sentences.length === 0) {
    return fullDescription.slice(0, 200).trim();
  }

  return sentences.slice(0, 2).join(" ").trim();
}

function parseGeneralPurposeItems(rawText: string, labelPatterns: string[]): string[] {
  const section = extractSection(rawText, labelPatterns);
  const items = extractListItems(section);
  if (items.length > 0) {
    return items;
  }

  return splitSentences(section);
}

export function parseSchemeMetadata(rawText: string): SchemeMetadata {
  const summary = splitSentences(rawText).slice(0, 2).join(" ");
  const extractedDeadline = parseDateFromAnchor(rawText, ["last date", "apply before", "closing date", "deadline"]);
  const launchDate = parseDateFromAnchor(rawText, ["launch date", "launched on", "started on"]);
  const lastUpdated = parseDateFromAnchor(rawText, ["last updated", "updated on"]);
  const officialPortal = findFirstUrl(rawText);
  const contactInfo = findContactInfo(rawText);

  return {
    summary: summary || "Not Specified",
    deadline:
      extractedDeadline === "Ongoing"
        ? "Ongoing"
        : extractedDeadline instanceof Date
        ? extractedDeadline
        : "Not Specified",
    launchDate: launchDate === "Ongoing" ? null : launchDate,
    officialPortal,
    contactInfo,
    lastUpdated: lastUpdated === "Ongoing" ? null : lastUpdated,
    expired: extractedDeadline instanceof Date ? extractedDeadline < new Date() : false,
  };
}

export function extractProceduralSections(rawText: string): {
  applicationSteps: string[];
  documentsRequired: string[];
  extractionConfidence: ExtractionConfidence;
} {
  const applicationSection = extractSection(rawText, ["application process", "how to apply", "submit your application"]);
  const documentsSection = extractSection(rawText, ["documents required", "required documents", "attach"]);

  const applicationSteps = extractListItems(applicationSection);
  const documentsRequired = extractListItems(documentsSection);
  const applicationConfidence:
    | ExtractionConfidence =
    applicationSteps.length > 0 || documentsRequired.length > 0
      ? "structured"
      : rawText.trim().length > 0
      ? "inferred"
      : "not found";

  return {
    applicationSteps: applicationSection
      ? applicationSteps.length > 0
        ? applicationSteps
        : splitSentences(applicationSection)
      : [],
    documentsRequired: documentsSection
      ? documentsRequired.length > 0
        ? documentsRequired
        : splitSentences(documentsSection).filter((sentence) => /document|id proof|address proof/i.test(sentence))
      : [],
    extractionConfidence: applicationConfidence,
  };
}

export function parseTermsAndConditions(rawText: string): {
  termsRaw: string;
  termsParsed: TermsParsed;
} {
  const section = extractSection(rawText, ["terms and conditions", "rules", "eligibility conditions"]);
  const termsRaw = section || "";
  const sentences = splitSentences(termsRaw);

  const exclusions: string[] = [];
  const penaltyClauses: string[] = [];
  const renewalConditions: string[] = [];
  const generalTerms: string[] = [];

  for (const sentence of sentences) {
    const normalized = sentence.toLowerCase();
    if (/only for|except|not eligible|excluding|exclusions?/i.test(normalized)) {
      exclusions.push(sentence);
      continue;
    }

    if (/penalty|fine|late fee|penal/i.test(normalized)) {
      penaltyClauses.push(sentence);
      continue;
    }

    if (/renew|renewal|extension|continue|valid for/i.test(normalized)) {
      renewalConditions.push(sentence);
      continue;
    }

    generalTerms.push(sentence);
  }

  return {
    termsRaw: safeText(termsRaw),
    termsParsed: {
      generalTerms,
      exclusions,
      penaltyClauses,
      renewalConditions,
    },
  };
}

export function constructSchemeFromRaw(raw: {
  id: string;
  name: string;
  eligibility: Scheme["eligibility"];
  benefits: string;
  documents: string[];
  estimatedBenefit: number;
  fullDescription: string;
  keyHighlights?: string[];
  targetBeneficiary?: string;
  fundingAmount?: string;
  schemeType?: SchemeType;
  applicationMode?: ApplicationMode;
  rawText?: string;
}): Scheme {
  const fullDescription = raw.fullDescription;
  const shortSummary = buildShortSummary(fullDescription);
  const metadata: SchemeMetadata = raw.rawText ? parseSchemeMetadata(raw.rawText) : {
    summary: shortSummary,
    deadline: "Not Specified",
    launchDate: null,
    officialPortal: "",
    contactInfo: "",
    lastUpdated: null,
    expired: false,
  };

  const procedural = raw.rawText ? extractProceduralSections(raw.rawText) : {
    applicationSteps: [],
    documentsRequired: raw.documents,
    extractionConfidence: "not found" as ExtractionConfidence,
  };

  const terms = raw.rawText ? parseTermsAndConditions(raw.rawText) : {
    termsRaw: "",
    termsParsed: { generalTerms: [], exclusions: [], penaltyClauses: [], renewalConditions: [] },
  };

  return {
    id: raw.id,
    name: raw.name,
    eligibility: raw.eligibility,
    benefits: raw.benefits,
    documents: raw.documents,
    estimatedBenefit: raw.estimatedBenefit,
    fullDescription,
    shortSummary,
    keyHighlights: raw.keyHighlights ?? [],
    targetBeneficiary: raw.targetBeneficiary ?? "General Public",
    fundingAmount: raw.fundingAmount ?? "Not Specified",
    schemeType: raw.schemeType ?? "central",
    applicationMode: raw.applicationMode ?? "online",
    metadata,
    applicationSteps: procedural.applicationSteps,
    documentsRequired: procedural.documentsRequired,
    extractionConfidence: procedural.extractionConfidence,
    termsRaw: terms.termsRaw,
    termsParsed: terms.termsParsed,
  };
}
