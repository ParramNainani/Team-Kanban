/** Core type definitions for Sahayak AI */

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
  description?: string;
  category?: string;
  targetGroup?: string;
  documents: string[];
  estimatedBenefit: number;
  tags?: string[];
  links?: string[];
}

export interface UserProfile {
  age: number;
  gender: "male" | "female";
  occupation: string;
  income: number;
  category: string;
  state: string;
  maritalStatus: "married" | "unmarried" | "widow" | "any";
  landOwnership: boolean;
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
  isFallback: boolean;
}

export interface MatchResult {
  schemes: ScoredScheme[];
  totalEstimatedBenefit: number;
  recommendedCount: number;
  thresholdUsed: number;
}

/** Chat message with optional attached data */
export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  schemes?: ScoredScheme[];
  profile?: Partial<UserProfile>;
  isComplete?: boolean;
  attachmentUrl?: string;
}
