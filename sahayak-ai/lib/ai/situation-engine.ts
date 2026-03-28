import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserProfile } from "../../types";

export async function situationEngine(message: string, language?: string): Promise<{ reply: string; isComplete: boolean; profile: Partial<UserProfile>; intent?: string; confidence?: number }> {
  try {
    const apiKey = process.env.GEMINI_API_KEY || "";
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `You are Sahayak AI, a friendly, empathetic assistant holding natural conversations while helping people in India discover welfare schemes.

Your job:
1. Act like a helpful companion. Acknowledge whatever the user says warmly (if they say they are sad, comfort them; if they ask a general question, answer it nicely) before asking about schemes.
2. Gradually extract their demographic profile (age, gender, occupation, income, category, state, maritalStatus, landOwnership) from the conversation. Don't be robotic.
3. Do NOT set "isComplete" to true UNLESS you have reliably extracted at least "age", "gender", "income", "occupation", and "state".
4. If "isComplete" is false, gently weave ONE follow-up question into your natural reply to target missing criteria.
5. If "isComplete" is true, your reply must state that you have found some schemes based on their profile, and they should review the list below.
6. CRITICAL: Reply naturally and ONLY in the specified language: ${language || "the user's spoken language"}.

Rules:
- Always return valid JSON.
- Do NOT include explanations outside JSON.
- Use this exact JSON format:
{
  "profile": {
    "age": number | null,
    "gender": "male" | "female" | null,
    "occupation": string | null,
    "income": number | null,
    "category": string | null,
    "state": string | null,
    "maritalStatus": string | null,
    "landOwnership": boolean | null
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
      profile: parsed.profile || {},
      intent: parsed.intent || "unknown",
      confidence: parsed.confidence || 0
    };
  } catch (error) {
    console.error("Gemini AI Error - falling back to basic logic:", error);
    
    return {
      reply: "Could you tell me a little more about your situation? What is your age, and do you live in a rural or urban area?",
      isComplete: false,
      profile: {}
    };
  }
}



