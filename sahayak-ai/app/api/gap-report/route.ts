import { NextResponse } from "next/server";
import { matchSchemes } from "../../../lib/ai/gap-detector"; // Assuming this is exported from gap-detector.ts

export async function POST(request: Request) {
  try {
    const { keywords } = await request.json();

    if (!Array.isArray(keywords)) {
      return NextResponse.json({ error: "Keywords array is required" }, { status: 400 });
    }

    // Process the keywords against the local json
    const schemes = matchSchemes(keywords);

    // Calculate sum of benefits
    const totalBenefit = schemes.reduce((sum, scheme) => sum + scheme.estimatedBenefit, 0);

    return NextResponse.json({
      schemes,
      totalBenefit,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
