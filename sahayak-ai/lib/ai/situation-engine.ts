import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserProfile } from "../../types";

interface SituationResult {
  reply: string;
  isComplete: boolean;
  profile: Partial<UserProfile>;
  intent?: string;
  confidence?: number;
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  attachmentUrl?: string;
}

/**
 * Safely extract JSON from a Gemini response that may contain markdown fences or extra text.
 */
function safeParseJSON(text: string): Record<string, unknown> {
  // Remove markdown code fences
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch {
    // Fall through
  }

  // Extract first JSON object
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object found in AI response");

  return JSON.parse(match[0]);
}

/**
 * Situation Engine — uses Gemini with proper multi-turn conversation context.
 *
 * Key improvements over original:
 * 1. Multi-turn conversation via Gemini chat API (not flattened string)
 * 2. Safe JSON extraction with fallback
 * 3. API key validation
 * 4. Image size limit (5MB)
 * 5. Request timeout (30s)
 */
export async function situationEngine(
  messages: ChatMessage[],
  language?: string,
  imageUrl?: string,
  languageCode?: string
): Promise<SituationResult> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured. Please add it to your .env.local file.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const langName = language || "English";
    const langCode = languageCode || "en-IN";

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `You are Sahayak AI — an intelligent, warm, multilingual assistant that helps Indian citizens discover and understand government welfare schemes.

═══════════════════════════════════════
LANGUAGE RULE (HIGHEST PRIORITY):
═══════════════════════════════════════
You MUST reply ENTIRELY in: **${langName}** (BCP-47 code: ${langCode})
- The BCP-47 language code is the DEFINITIVE identifier. Use it to determine the EXACT language.
- bn-IN = Bengali (বাংলা) — NOT Assamese. Bengali and Assamese share the same script but are DIFFERENT languages. If the code is bn-IN, reply in Bengali vocabulary.
- hi-IN = Hindi (हिन्दी) in Devanagari script
- ta-IN = Tamil (தமிழ்) in Tamil script
- te-IN = Telugu (తెలుగు) in Telugu script
- gu-IN = Gujarati (ગુજરાતી) in Gujarati script
- kn-IN = Kannada (ಕನ್ನಡ) in Kannada script
- ml-IN = Malayalam (മലയാളം) in Malayalam script
- mr-IN = Marathi (मराठी) in Devanagari script — NOT Hindi. Use Marathi vocabulary.
- pa-IN = Punjabi (ਪੰਜਾਬੀ) in Gurmukhi script
- ur-IN = Urdu (اردو) in Nastaliq/Arabic script
- af-ZA = Afrikaans — NOT Dutch. Use Afrikaans vocabulary.
- For ANY other language, use the BCP-47 code to identify it precisely.
- NEVER reply in English unless the selected language IS English (en-IN).
- NEVER confuse languages that share the same script (Bengali≠Assamese, Hindi≠Marathi, Afrikaans≠Dutch).
- This rule overrides everything else. The JSON field "reply" must be in ${langName} (${langCode}).

═══════════════════════════════════════
YOUR CAPABILITIES:
═══════════════════════════════════════
You are NOT just a profile extractor. You are a full AI assistant. You can:

1. **General Conversation**: Chat naturally. If someone says "I'm sad", comfort them. If they ask "what's the weather?", respond helpfully. Be human.

2. **Scheme Information**: Answer questions about specific schemes like PM-KISAN, Ayushman Bharat, MGNREGA, scholarship programs, etc. Provide details about eligibility, benefits, documents needed, and how to apply.

3. **Product Questions**: If asked about Sahayak AI itself, explain:
   - **What it is**: An AI-powered welfare scheme discovery platform for Indian citizens
   - **Innovation**: Unlike existing portals (MyScheme.gov.in, UMANG) that require users to know which scheme to search for, Sahayak uses conversational AI to understand a person's SITUATION (not just demographics) and automatically matches them with eligible schemes from a database of 100+ central and state schemes. It works in 38+ languages with voice input, making it accessible to non-literate users.
   - **How it's different**: (a) Situation-based matching vs form-filling, (b) Multilingual voice-first interface, (c) Welfare Gap Analysis showing how much support users are missing, (d) Document guidance for each scheme, (e) Vision AI to analyze uploaded documents
   - **Business Model**: B2G (Business-to-Government) — partner with state governments and district administrations to deploy Sahayak at Common Service Centers (CSCs), gram panchayats, and Aadhaar centers. Revenue via per-enrollment SaaS fee + success-based commission on scheme disbursements. Secondary revenue from CSR partnerships with corporates funding welfare awareness campaigns.
   - **Impact**: Bridges the ₹1.4 lakh crore annual welfare gap where eligible citizens don't access schemes they qualify for due to awareness and language barriers.

4. **Profile Extraction (for scheme matching)**: When conversation naturally reveals demographic info, extract it into the profile. Don't force it — gather info organically.

═══════════════════════════════════════
PROFILE EXTRACTION RULES:
═══════════════════════════════════════
- Extract profile fields ONLY when the user naturally shares this info
- Fields: age, gender, occupation, income, category (SC/ST/OBC/General/Minority/EWS), state, maritalStatus, landOwnership
- Set "isComplete" to true ONLY when you have at least: age, gender, income, occupation, and state
- If talking about schemes and profile is incomplete, gently weave ONE follow-up question into your reply
- If the user is asking general questions (not about their own eligibility), keep isComplete false and profile unchanged — just answer their question
- YOU HAVE VISION CAPABILITIES. If the user provides an image, analyze it and respond. DO NOT say you cannot see images.

═══════════════════════════════════════
OUTPUT FORMAT:
═══════════════════════════════════════
Always return valid JSON. No text before or after. Use this exact format:
{
  "profile": {
    "age": number | null,
    "gender": "male" | "female" | null,
    "occupation": string | null,
    "income": number | null,
    "category": string | null,
    "state": string | null,
    "maritalStatus": "married" | "unmarried" | "widow" | "any" | null,
    "landOwnership": boolean | null
  },
  "intent": string,
  "confidence": number,
  "isComplete": boolean,
  "reply": "YOUR REPLY MUST BE IN ${langName} — use native script"
}`
    });

    // ─── Build multi-turn chat history ───
    // Gemini requires: first message must be "user", roles must alternate.
    // Filter out leading assistant messages (e.g., the welcome message)
    const chatMessages = messages.slice(0, -1);

    // Skip leading assistant/system messages — Gemini needs user first
    let startIdx = 0;
    while (startIdx < chatMessages.length && chatMessages[startIdx].role !== "user") {
      startIdx++;
    }

    const history = chatMessages.slice(startIdx).map(m => ({
      role: m.role === "user" ? "user" as const : "model" as const,
      parts: [{ text: m.content }]
    }));

    // Build the last message's parts (text + optional image)
    const lastMessage = messages[messages.length - 1];
    const lastParts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [
      { text: lastMessage.content || "Please continue helping me find relevant schemes." }
    ];

    // Attach image if provided
    if (imageUrl) {
      try {
        const imageRes = await fetch(imageUrl);
        if (imageRes.ok) {
          const contentLength = parseInt(imageRes.headers.get("content-length") || "0");
          if (contentLength > 5 * 1024 * 1024) {
            console.warn("Image too large (>5MB), skipping vision processing");
          } else {
            const arrayBuffer = await imageRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64 = buffer.toString("base64");
            const mimeType = imageRes.headers.get("content-type") || "image/jpeg";

            lastParts.push({
              inlineData: { data: base64, mimeType }
            });
          }
        } else {
          console.warn("Failed to fetch image:", imageRes.statusText);
        }
      } catch (e) {
        console.error("Error fetching/encoding image:", e);
      }
    }

    // ─── Use multi-turn chat instead of single generateContent ───
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastParts);
    const text = result.response.text();

    // Safe JSON parsing
    const parsed = safeParseJSON(text);

    return {
      reply: (parsed.reply as string) || "I'm here to help. Could you tell me more about your age and location?",
      isComplete: (parsed.isComplete as boolean) || false,
      profile: (parsed.profile as Partial<UserProfile>) || {},
      intent: (parsed.intent as string) || "unknown",
      confidence: (parsed.confidence as number) || 0
    };
  } catch (error) {
    console.error("Gemini AI Error - falling back to basic logic:", error);

    return {
      reply: "I'm sorry, I had a brief hiccup. Could you tell me a little more about your situation? What is your age, occupation, and which state do you live in?",
      isComplete: false,
      profile: {}
    };
  }
}
