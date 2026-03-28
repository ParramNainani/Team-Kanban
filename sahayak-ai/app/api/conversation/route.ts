import { NextResponse } from "next/server";
import { situationEngine } from "../../../lib/ai/situation-engine";
import { getRecommendedSchemes } from "../../../services/schemeService";
import { ConversationResponse, UserProfile } from "../../../types";

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    // Convert messages array into a single text block so Gemini has context
    const conversationHistory = messages.map((m: { role: string; content: string }) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join("\n");

    // Call the engine to process the message context
    const { reply, isComplete, profile } = await situationEngine(conversationHistory);

    // If we need more info, return the reply only
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

    // Auto-generate a markdown table for the reply
    let formattedReply = reply;
    if (schemes && schemes.length > 0) {
      formattedReply += "\n\nI have found some schemes that you might be eligible for based on the details provided. Please review them below:";
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
