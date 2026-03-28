import { NextResponse } from "next/server";
import { situationEngine } from "../../../lib/ai/situation-engine";
import { matchSchemes } from "../../../lib/ai/gap-detector"; // Assuming this is exported from gap-detector.ts
import { ConversationResponse } from "../../../types";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Call the engine to process the message
    const { reply, isComplete, keywords } = await situationEngine(message);

    // If we need more info, return the reply only
    if (!isComplete) {
      const response: ConversationResponse = { reply, isComplete, keywords };
      return NextResponse.json(response);
    }

    // If complete, match the schemes
    const schemes = matchSchemes(keywords);

    // Calculate total benefit
    const totalBenefit = schemes.reduce((sum, scheme) => sum + scheme.estimatedBenefit, 0);

    const response: ConversationResponse = {
      reply,
      isComplete,
      keywords,
      schemes,
      totalBenefit,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
