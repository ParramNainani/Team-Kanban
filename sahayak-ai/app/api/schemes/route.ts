import { NextResponse } from "next/server";
import { getAllSchemes } from "../../../services/schemeService";

export async function GET() {
  try {
    const schemes = getAllSchemes();
    return NextResponse.json({
      schemes,
      count: schemes.length,
    });
  } catch (error) {
    console.error("Schemes API error:", error);
    return NextResponse.json({ error: "Failed to load schemes" }, { status: 500 });
  }
}
