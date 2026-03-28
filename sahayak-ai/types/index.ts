export interface Scheme {
  id: string;
  name: string;
  tags: string[];
  benefits: string;
  documents: string[];
  estimatedBenefit: number;
}

export interface ConversationResponse {
  reply: string;
  isComplete: boolean;
  keywords: string[];
  schemes?: Scheme[];
  totalBenefit?: number;
}

