export type SchemeSummary = {
  id: string;
  name: string;
  benefits: string;
  documents: string[];
  estimatedBenefit: number;
};

export type Message = {
  role: "user" | "assistant";
  content: string;
  schemes?: SchemeSummary[];
};
