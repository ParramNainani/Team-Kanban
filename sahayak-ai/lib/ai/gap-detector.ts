import schemesData from '../../data/schemes.json';
import { Scheme, UserProfile } from '../../types';

// Cast the imported robust JSON as an array of the strict Protocol
const schemes: Scheme[] = schemesData as Scheme[];

export function matchSchemes(profile: UserProfile): Scheme[] {
  if (!profile) return [];

  const { keywords, age, income, location } = profile;
  const lowerKeywords = (keywords || []).map(k => k.toLowerCase());

  // Strict Evaluation Engine
  const matchedSchemes = schemes.filter(scheme => {
    // 1. Keyword check - DOES it match the user's situation generally?
    const schemeTags = scheme.tags.map(t => t.toLowerCase());
    const hasIntentMatch = schemeTags.some(tag => lowerKeywords.includes(tag));
    
    // If it doesn't match the general situation, skip it immediately.
    // E.g., Don't give a student scheme to a farmer.
    if (!hasIntentMatch && lowerKeywords.length > 0) return false;

    // 2. Strict Criteria Check - DOES the user qualify demographically?
    const req = scheme.requiredCriteria;
    if (req) {
      if (req.location && req.location !== "any" && location) {
        if (req.location !== location.toLowerCase()) return false;
      }
      
      if (req.maxIncome !== undefined && income != null) {
        if (income > req.maxIncome) return false;
      }
      
      if (req.minAge !== undefined && age != null) {
        if (age < req.minAge) return false;
      }

      if (req.maxAge !== undefined && age != null) {
        if (age > req.maxAge) return false;
      }
    }

    return true; // Passed all disqualifying strict checks!
  });

  // Sort them by highest benefit amount, taking the Top 3
  return matchedSchemes
    .sort((a, b) => b.estimatedBenefit - a.estimatedBenefit)
    .slice(0, 3);
}
