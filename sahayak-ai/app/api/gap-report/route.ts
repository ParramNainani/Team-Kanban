import { NextResponse } from "next/server";
import { getRecommendedSchemes } from "../../../services/schemeService";
import { UserProfile } from "../../../types";

export async function POST(request: Request) {
  try {
    const profile: UserProfile = await request.json();

    if (!profile) {
      return NextResponse.json({ error: "Valid UserProfile object is required" }, { status: 400 });
    }

    // Process the strict profile against the constraints
    const matchResult = getRecommendedSchemes(profile);

    // Calculate sum of benefits
    const totalBenefit = matchResult.totalEstimatedBenefit;
    const schemes = matchResult.schemes;

    return NextResponse.json({
      schemes,
      totalBenefit,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
