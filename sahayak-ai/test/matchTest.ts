import { matchSchemes } from "../lib/matcher";
import { getAllSchemes } from "../services/schemeService";
import type { UserProfile } from "../types/index";

function formatRupee(amount: number): string {
  return `₹${amount}`;
}

async function run() {
  try {
    // Create a sample user profile
    const user: UserProfile = {
      age: 45,
      gender: "female",
      occupation: "farmer",
      income: 150000, // ₹1.5 lakh annual income
      category: "General",
      state: "Maharashtra",
      maritalStatus: "widow",
      landOwnership: true,
    };

    console.log("USER PROFILE:");
    console.log(`  Age: ${user.age}`);
    console.log(`  Gender: ${user.gender}`);
    console.log(`  Occupation: ${user.occupation}`);
    console.log(`  Income: ${formatRupee(user.income)}`);
    console.log(`  Category: ${user.category}`);
    console.log(`  State: ${user.state}`);
    console.log(`  Marital Status: ${user.maritalStatus}`);
    console.log(`  Land Ownership: ${user.landOwnership}`);
    console.log("");

    // Get schemes from service
    const schemes = getAllSchemes();

    // Run matching
    const result = matchSchemes(user, schemes);

    console.log(`\nThreshold: ${result.thresholdUsed}/15 (${Math.round((result.thresholdUsed / 15) * 100)}%)`);
    console.log(`Recommended Schemes: ${result.recommendedCount}`);
    console.log(`Fallback Used: ${result.schemes.some(s => s.isFallback) ? 'Yes' : 'No'}`);
    console.log("");

    console.log("MATCH RESULTS:");
    console.log("-".repeat(60));
    if (result.schemes.length === 0) {
      console.log("No matching schemes found for this user profile.");
    } else {
      result.schemes.forEach((scheme, index) => {
        console.log(
          `${index + 1}. ${scheme.name} - ${formatRupee(scheme.estimatedBenefit)} (Score: ${scheme.score})`
        );
      });
    }
    console.log("-".repeat(60));
    console.log(`Total Matched Schemes: ${result.schemes.length}`);
    console.log(`Total Estimated Benefit: ${formatRupee(result.totalEstimatedBenefit)}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Test failed:", message);
  }
}

void run();
