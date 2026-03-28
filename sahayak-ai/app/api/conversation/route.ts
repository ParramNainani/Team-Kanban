import { NextResponse } from "next/server";
import { situationEngine } from "../../../lib/ai/situation-engine";
import { getRecommendedSchemes } from "../../../services/schemeService";
import { ConversationResponse, UserProfile } from "../../../types";

// Vercel serverless config — Gemini API can take 10-30s
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { messages, language, languageCode } = await request.json();

    // ─── Input validation ───
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    if (messages.length > 100) {
      return NextResponse.json({ error: "Too many messages" }, { status: 400 });
    }

    // Find last image attachment
    const lastUserMessageWithAttachment = [...messages]
      .reverse()
      .find((m: { role: string; attachmentUrl?: string }) => m.role === "user" && m.attachmentUrl);
    const imageUrl = lastUserMessageWithAttachment?.attachmentUrl;

    // ─── Call the engine with full message history (multi-turn) ───
    const { reply, isComplete, profile } = await situationEngine(messages, language, imageUrl, languageCode);

    if (!isComplete) {
      const response: ConversationResponse = { reply, isComplete, profile };
      return NextResponse.json(response);
    }

    // ─── Profile is complete — match schemes ───
    // Use nullish coalescing (??) not logical OR (||) to properly handle falsy values
    const fullProfile: UserProfile = {
      age: profile.age ?? 25,
      gender: (profile.gender as "male" | "female") ?? "male",
      occupation: profile.occupation ?? "any",
      income: profile.income ?? 0,
      category: profile.category ?? "All",
      state: profile.state ?? "All",
      maritalStatus: (profile.maritalStatus as UserProfile["maritalStatus"]) ?? "any",
      landOwnership: profile.landOwnership ?? false,
    };

    const matchResult = getRecommendedSchemes(fullProfile);
    const totalBenefit = matchResult.totalEstimatedBenefit;
    const schemes = matchResult.schemes;

    // ─── Single response — no second Gemini call ───
    // The AI reply from situationEngine + scheme cards is sufficient
    // Removing the second LLM call saves 3-8s latency and eliminates a failure point
    const response: ConversationResponse = {
      reply,
      isComplete,
      profile,
      schemes,
      totalBenefit,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Conversation API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
