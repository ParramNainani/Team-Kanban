export interface Scheme {
  id: string;
  name: string;
  eligibility: {
    ageRange: { min: number; max: number }; // user age must fall within this range
    gender: "male" | "female" | "any";      // allowed gender
    occupation: string[];                  // eligible occupations
    incomeLimit: number;                   // maximum annual income (INR)
    category: string[];                    // caste/category eligibility
    state: string[];                       // applicable states ("All" allowed)
    maritalStatus: "married" | "unmarried" | "widow" | "any";
    landOwnership: boolean | null;         // null = not applicable
  };
  benefits: string;
  documents: string[];
  estimatedBenefit: number;
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
