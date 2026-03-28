export type SchemeType = "central" | "state" | "private" | "NGO";
export type ApplicationMode = "online" | "offline" | "both";
export type SupportedLanguage = "en" | "hi" | "ta" | "bn" | "mr";
export type ExtractionConfidence = "structured" | "inferred" | "not found";
export type SortMode = "relevance" | "revenue" | "combined";

export interface MultilingualKeyword {
  en: string;
  hi: string;
  ta: string;
  bn: string;
  mr: string;
}

export interface SchemeMetadata {
  summary: string;
  deadline: Date | "Ongoing" | "Not Specified";
  launchDate: Date | null;
  officialPortal: string;
  contactInfo: string;
  lastUpdated: Date | null;
  expired: boolean;
}

export interface TermsParsed {
  generalTerms: string[];
  exclusions: string[];
  penaltyClauses: string[];
  renewalConditions: string[];
}

export interface Scheme {
  id: string;
  name: string;
  eligibility: {
    ageRange: { min: number; max: number };
    gender: "male" | "female" | "any";
    occupation: string[];
    incomeLimit: number;
    category: string[];
    state: string[];
    maritalStatus: "married" | "unmarried" | "widow" | "any";
    landOwnership: boolean | null;
  };
  benefits: string;
  documents: string[];
  estimatedBenefit: number;
  fullDescription?: string;
  shortSummary?: string;
  keyHighlights?: string[];
  targetBeneficiary?: string;
  fundingAmount?: string;
  schemeType?: SchemeType;
  applicationMode?: ApplicationMode;
  metadata?: SchemeMetadata;
  applicationSteps?: string[];
  documentsRequired?: string[];
  extractionConfidence?: ExtractionConfidence;
  termsRaw?: string;
  termsParsed?: TermsParsed;
  description?: string;
  category?: string;
  targetGroup?: string;
  tags?: string[];
}

export interface UserProfile {
  age: number;
  gender: "male" | "female";
  occupation: string;
  income: number;
  category: string;
  state: string;
  maritalStatus: string;
  landOwnership: boolean;
  query?: string;
  preferredLanguage?: SupportedLanguage;
}

export interface ConversationResponse {
  reply: string;
  isComplete: boolean;
  profile?: Partial<UserProfile>;
  schemes?: ScoredScheme[];
  totalBenefit?: number;
}

export interface ScoredScheme extends Scheme {
  score: number;
  relevanceScore: number;
  revenueScore: number;
  finalScore: number;
  isFallback: boolean;
}

export interface MatchResult {
  schemes: ScoredScheme[];
  totalEstimatedBenefit: number;
  recommendedCount: number;
  thresholdUsed: number;
  excludedSchemes: { scheme: Scheme; reason: string }[];
  sortMode: SortMode;
}

export interface SchemeSummary extends ScoredScheme {}
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  schemes?: SchemeSummary[];
  profile?: Partial<UserProfile>;
  isComplete?: boolean;
}
