import { NextResponse } from "next/server";
import { situationEngine } from "../../../lib/ai/situation-engine";
import { getRecommendedSchemes } from "../../../services/schemeService";
import { ConversationResponse, UserProfile } from "../../../types";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const { messages, language } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    // Convert messages array into a single text block so Gemini has context
    const conversationHistory = messages.map((m: { role: string; content: string }) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join("\n");

    const lastUserMessageWithAttachment = [...messages].reverse().find(m => m.role === 'user' && m.attachmentUrl);
    const imageUrl = lastUserMessageWithAttachment?.attachmentUrl;

    // Call the engine to process the message context
    const { reply, isComplete, profile } = await situationEngine(conversationHistory, language, imageUrl);
    if (!isComplete) {
      const response: ConversationResponse = { reply, isComplete, profile };
      return NextResponse.json(response);
    }

    // Since it is complete, cast the Partial profile to full UserProfile with defaults if needed
    const fullProfile: UserProfile = {
      age: profile.age || 0,
      gender: (profile.gender as "male" | "female") || "male",
      occupation: profile.occupation || "any",
      income: profile.income || 0,
      category: profile.category || "All",
      state: profile.state || "All",
      maritalStatus: profile.maritalStatus || "any",
      landOwnership: profile.landOwnership || false
    };

    // If complete, match the schemes strictly against the profile
    const matchResult = getRecommendedSchemes(fullProfile);

    // Calculate total benefit
    const totalBenefit = matchResult.totalEstimatedBenefit;
    const schemes = matchResult.schemes;

    // The AI's engine will now automatically format the reply if complete.
    let formattedReply = reply;

    if (schemes && schemes.length > 0) {
      try {
        const apiKey = process.env.GEMINI_API_KEY || "";
        if (apiKey) {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

          const schemeDetailsContext = schemes.map(s => 
            `Name: ${s.name}\nDescription: ${s.description}\nLinks: ${s.links?.length ? s.links.join(", ") : "Official Government Portal"}`
          ).join("\n\n");

          const prompt = `You are a friendly Indian welfare AI assistant named Sahayak. The user just matched with these government schemes based on their profile:\n\n${schemeDetailsContext}\n\nPlease generate a very warm, brief reply in the specified language constraint: **${language || "English"}**. \n\nFor EACH scheme, mention:\n1. What it is.\n2. The specific Documents Required to apply.\n3. EXACTLY Where to go to apply (the official portal/department name, and include the URLs provided in the context).\nDo NOT use JSON, output a nice conversational Markdown response that directly speaks to the user.`;

          const result = await model.generateContent(prompt);
          if (result && result.response) {
            formattedReply = result.response.text();
          }
        }
      } catch (e) {
        console.error("Secondary Gemini enrichment failed:", e);
      }
    }

    const response: ConversationResponse = {
      reply: formattedReply,
      isComplete,
      profile,
      schemes,
      totalBenefit,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
