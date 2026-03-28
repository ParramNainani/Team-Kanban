import { NextResponse } from "next/server";
import { getRecommendedSchemes } from "../../../services/schemeService";
import { UserProfile } from "../../../types";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required profile fields
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Valid UserProfile object is required" }, { status: 400 });
    }

    const profile: UserProfile = {
      age: body.age ?? 25,
      gender: body.gender ?? "male",
      occupation: body.occupation ?? "any",
      income: body.income ?? 0,
      category: body.category ?? "All",
      state: body.state ?? "All",
      maritalStatus: body.maritalStatus ?? "any",
      landOwnership: body.landOwnership ?? false,
    };

    // Validate age is reasonable
    if (typeof profile.age !== "number" || profile.age < 0 || profile.age > 150) {
      return NextResponse.json({ error: "Invalid age value" }, { status: 400 });
    }

    const matchResult = getRecommendedSchemes(profile);

    return NextResponse.json({
      schemes: matchResult.schemes,
      totalBenefit: matchResult.totalEstimatedBenefit,
      recommendedCount: matchResult.recommendedCount,
      profile, // Echo back the processed profile
    });
  } catch (error) {
    console.error("Gap report API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
