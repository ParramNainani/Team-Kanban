/**
 * Full Pipeline Test - Eligibility-Based Matching
 * Tests the new structured eligibility matching system
 */

import { matchSchemes } from "../lib/matcher";
import { getAllSchemes } from "../services/schemeService";
import type { UserProfile } from "../types/index";

function formatRupee(amount: number): string {
  return `₹${amount}`;
}

async function run() {
  try {
    console.log("=" + "=".repeat(59));
    console.log("FULL PIPELINE TEST: Eligibility-Based Scheme Matching");
    console.log("=" + "=".repeat(59));

    // STEP 1: Create test user profile
    const user: UserProfile = {
      age: 35,
      gender: "female",
      occupation: "farmer",
      income: 400000, // ₹4 lakh annual income
      category: "OBC",
      state: "Uttar Pradesh",
      maritalStatus: "widow",
      landOwnership: true,
    };

    console.log("\n[STEP 1] User Profile:");
    console.log(`  Age: ${user.age} years`);
    console.log(`  Gender: ${user.gender}`);
    console.log(`  Occupation: ${user.occupation}`);
    console.log(`  Annual Income: ${formatRupee(user.income)}`);
    console.log(`  Category: ${user.category}`);
    console.log(`  State: ${user.state}`);
    console.log(`  Marital Status: ${user.maritalStatus}`);
    console.log(`  Land Ownership: ${user.landOwnership ? "Yes" : "No"}`);

    // STEP 2: Get available schemes
    const schemes = getAllSchemes();
    console.log(`\n[STEP 2] Available Schemes: ${schemes.length}`);

    // STEP 3: Run eligibility-based matching
    console.log("\n[STEP 3] Running Eligibility-Based Matching...");
    const result = matchSchemes(user, schemes);

    console.log(`  Recommendation Threshold: ${result.thresholdUsed}/15 (${Math.round((result.thresholdUsed / 15) * 100)}%)`);
    console.log(`  Schemes Meeting Threshold: ${result.recommendedCount}`);

    // STEP 4: Display results
    console.log("\n[STEP 4] MATCH RESULTS:");
    console.log("-".repeat(80));

    if (result.schemes.length === 0) {
      console.log("  ❌ No schemes match this user's eligibility criteria.");
      console.log("  Possible reasons:");
      console.log("  - Income too high for available schemes");
      console.log("  - Age outside eligible ranges");
      console.log("  - Category not eligible for schemes");
    } else {
      console.log("  ✅ Found matching schemes:");
      console.log("");

      result.schemes.forEach((scheme, index) => {
        console.log(`  ${index + 1}. ${scheme.name}`);
        console.log(`     Score: ${scheme.score}/13`);
        console.log(`     Benefit: ${formatRupee(scheme.estimatedBenefit)}`);
        console.log(`     Documents: ${scheme.documents.join(", ")}`);
        console.log("");
      });
    }

    console.log("-".repeat(80));
    console.log(`\n  Total Matched Schemes: ${result.schemes.length}`);
    console.log(`  Total Estimated Annual Benefit: ${formatRupee(result.totalEstimatedBenefit)}`);

    console.log("\n" + "=".repeat(60));
    console.log("✅ Eligibility-based matching test completed");
    console.log("=".repeat(60));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("\n❌ Pipeline failed:", message);
    if (error instanceof Error) {
      console.error("Stack:", error.stack);
    }
    process.exit(1);
  }
}

void run();
