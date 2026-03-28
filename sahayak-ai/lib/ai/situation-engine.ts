import { GoogleGenerativeAI } from "@google/generative-ai";

export async function situationEngine(message: string): Promise<{ reply: string; isComplete: boolean; keywords: string[]; intent?: string; confidence?: number }> {
  try {
    const apiKey = process.env.GEMINI_API_KEY || "";
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `You are an AI assistant helping identify welfare eligibility.

Your job:
1. Understand the user's situation
2. Extract relevant keywords (Target: widow, student, farmer, unemployed, low income, elderly, disabled, pregnant)
3. Decide if enough information is available
4. Ask ONE follow-up question if needed
5. Respond in a supportive, human tone

Rules:
- Always return valid JSON
- Do NOT include explanations outside JSON
- Keep reply short and empathetic
- Use this JSON format exactly:
{
  "keywords": string[],
  "intent": string,
  "confidence": number,
  "isComplete": boolean,
  "reply": string
}`
    });

    const result = await model.generateContent(message);
    const text = result.response.text();
    
    // Safely parse JSON, removing markdown code blocks if the model includes them
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(jsonStr);

    return {
      reply: parsed.reply || "I'm here to help. Could you tell me more?",
      isComplete: parsed.isComplete || false,
      keywords: parsed.keywords || [],
      intent: parsed.intent || "unknown",
      confidence: parsed.confidence || 0
    };
  } catch (error) {
    console.error("Gemini AI Error - falling back to basic logic:", error);
    
    // Fallback to basic keyword logic if parsing or API fails
    const lowerMessage = message.toLowerCase();
    const targetKeywords = ["widow", "student", "farmer", "unemployed", "low income", "elderly", "disabled", "pregnant"];
    const extractedKeywords: string[] = [];

    for (const keyword of targetKeywords) {
      if (lowerMessage.includes(keyword)) {
        extractedKeywords.push(keyword);
      }
    }

    if (extractedKeywords.length === 0) {
      return {
        reply: "Could you tell me a little more about your situation? For example, are you a student, a farmer, or currently unemployed?",
        isComplete: false,
        keywords: [],
      };
    }

    return {
      reply: "I understand your situation. Based on what you've shared, I found some support you may not be receiving.",
      isComplete: true,
      keywords: extractedKeywords,
    };
  }
}
