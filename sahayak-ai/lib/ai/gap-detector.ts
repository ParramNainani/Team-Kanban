import schemesData from '../../data/schemes.json';
import { Scheme } from '../../types';

// Cast the imported robust JSON as an array of the strict Protocol
const schemes: Scheme[] = schemesData as Scheme[];

export function matchSchemes(keywords: string[]): Scheme[] {
  if (!keywords || keywords.length === 0) {
    return [];
  }

  // Normalize keywords for easier matching
  const lowerKeywords = keywords.map(k => k.toLowerCase());

  // Filter schemes that contain AT LEAST one matching keyword in their tags
  const matchedSchemes = schemes.filter(scheme => {
    // Normalise Scheme tags
    const schemeTags = scheme.tags.map(t => t.toLowerCase());
    // Find intersection 
    return schemeTags.some(tag => lowerKeywords.includes(tag));
  });

  // Sort them by highest benefit amount, taking the Top 3
  return matchedSchemes
    .sort((a, b) => b.estimatedBenefit - a.estimatedBenefit)
    .slice(0, 3);
}
