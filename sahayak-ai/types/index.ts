export interface SchemeCriteria {
  location?: 'rural' | 'urban' | 'any';
  maxIncome?: number;
  minAge?: number;
  maxAge?: number;
}

export interface Scheme {
  id: string;
  name: string;
  tags: string[];
  requiredCriteria: SchemeCriteria;
  benefits: string;
  documents: string[];
  estimatedBenefit: number;
}

export interface UserProfile {
  age?: number | null;
  income?: number | null;
  location?: 'rural' | 'urban' | null;
  keywords: string[];
}

export interface ConversationResponse {
  reply: string;
  isComplete: boolean;
  profile: UserProfile;
  schemes?: Scheme[];
  totalBenefit?: number;
}

