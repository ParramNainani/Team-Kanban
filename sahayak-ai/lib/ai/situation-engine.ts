export function situationEngine(message: string): { reply: string; isComplete: boolean; keywords: string[] } {
  // Convert message to lowercase for simple matching
  const lowerMessage = message.toLowerCase();

  // Define the target keywords to look for
  const targetKeywords = ["widow", "student", "farmer", "unemployed", "low income"];
  const extractedKeywords: string[] = [];

  // Extract keywords
  for (const keyword of targetKeywords) {
    if (lowerMessage.includes(keyword)) {
      extractedKeywords.push(keyword);
    }
  }

  // If no keywords found
  if (extractedKeywords.length === 0) {
    return {
      reply: "Could you tell me a little more about your situation? For example, are you a student, a farmer, or currently unemployed?",
      isComplete: false,
      keywords: [],
    };
  }

  // If keywords found
  return {
    reply: "I understand your situation. Based on what you've shared, I found some support you may not be receiving.",
    isComplete: true,
    keywords: extractedKeywords,
  };
}
