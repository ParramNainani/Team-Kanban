import { NextResponse } from "next/server";
import { situationEngine } from "../../../lib/ai/situation-engine";
import { getRecommendedSchemes } from "../../../services/schemeService";
import { ConversationResponse, UserProfile } from "../../../types";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Call the engine to process the message
    const { reply, isComplete, profile } = await situationEngine(message);

    // If we need more info, return the reply only
    if (!isComplete) {
      const response: ConversationResponse = { reply, isComplete, profile };
      return NextResponse.json(response);
    }

    // Since it is complete, cast the Partial profile to full UserProfile with defaults if needed
    const fullProfile: UserProfile = {
      age: profile.age || 0,
      gender: profile.gender || "any" as any,
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
      formattedReply += "\n\nHere are the schemes you are eligible for:\n\n";
      formattedReply += "| Scheme Name | Estimated Benefit | Key Benefits |\n";
      formattedReply += "| --- | --- | --- |\n";
      
      schemes.forEach((scheme) => {
        formattedReply += `| ${scheme.name} | Rs. ${scheme.estimatedBenefit} | ${scheme.benefits} |\n`;
      });
      
      formattedReply += `\n**Total Potential Benefit:** Rs. ${totalBenefit}\n`;
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
