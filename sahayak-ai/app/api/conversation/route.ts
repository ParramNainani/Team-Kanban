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

    // Auto-generate a markdown table for the reply
    let formattedReply = reply;
    if (schemes.length > 0) {
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
      keywords,
      schemes,
      totalBenefit,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
