import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserProfile } from "../../types";

export async function situationEngine(message: string): Promise<{ reply: string; isComplete: boolean; profile: UserProfile; intent?: string; confidence?: number }> {
  try {
    const apiKey = process.env.GEMINI_API_KEY || "";
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `You are an AI assistant helping identify welfare eligibility in India. We need high accuracy.

Your job:
1. Extract the user's situation and specific demographics: age, annual income, location (rural or urban).
2. Extract relevant keywords (Target: widow, student, farmer, unemployed, elderly, disabled, pregnant).
3. Decide if enough information is available to accurately match schemes. 
   CRITICAL: Do NOT set "isComplete" to true UNLESS you have extracted at least "age", "location" (rural/urban), and an idea of their "income".
4. If "isComplete" is false, ask ONE friendly follow-up question specifically targeting the missing criteria.
5. Respond in a supportive, human tone.

Rules:
- Always return valid JSON.
- Do NOT include explanations outside JSON.
- Use this JSON format exactly:
{
  "profile": {
    "keywords": string[], // e.g. ["farmer", "widow"]
    "age": number | null,
    "income": number | null,
    "location": "rural" | "urban" | null
  },
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
      reply: parsed.reply || "I'm here to help. Could you tell me more about your age and location?",
      isComplete: parsed.isComplete || false,
      profile: parsed.profile || { keywords: [], age: null, income: null, location: null },
      intent: parsed.intent || "unknown",
      confidence: parsed.confidence || 0
    };
  } catch (error) {
    console.error("Gemini AI Error - falling back to basic logic:");
    
    // Fallback to basic keyword logic
    const lowerMessage = message.toLowerCase();
    const targetKeywords = ["widow", "student", "farmer", "unemployed", "elderly", "disabled", "pregnant"];
    const extractedKeywords: string[] = [];

    for (const keyword of targetKeywords) {
      if (lowerMessage.includes(keyword)) {
        extractedKeywords.push(keyword);
      }
    }

    return {
      reply: "Could you tell me a little more about your situation? What is your age, and do you live in a rural or urban area?",
      isComplete: false,
      profile: { keywords: extractedKeywords, age: null, income: null, location: null }
    };
  }
}
