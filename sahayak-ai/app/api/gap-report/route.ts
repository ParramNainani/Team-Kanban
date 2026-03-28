import { NextResponse } from "next/server";
import { matchSchemes } from "../../../lib/ai/gap-detector"; 
import { UserProfile } from "../../../types";

export async function POST(request: Request) {
  try {
    const profile: UserProfile = await request.json();

    if (!profile || !Array.isArray(profile.keywords)) {
      return NextResponse.json({ error: "Valid UserProfile object with keywords array is required" }, { status: 400 });
    }

    // Process the strict profile against the constraints
    const schemes = matchSchemes(profile);

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
