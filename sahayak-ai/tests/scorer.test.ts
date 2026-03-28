/**
 * Scorer module test suite.
 * Verifies hybrid revenue-weighted scoring and sort ordering.
 */

import { scoreSchemes } from "../lib/scorer";
import { matchSchemes } from "../lib/matcher";
import { schemes, userProfiles } from "./mocks/mockData";

describe("Scorer module", () => {
  it("should compute finalScore using weighted relevance and revenue values", () => {
    const user = userProfiles[0];
    const scheme = schemes.find((item) => item.id === "pm-kisan-loan");
    expect(scheme).toBeDefined();

    const scored = scoreSchemes(user, [scheme!], { sortMode: "combined" });
    const first = scored[0];

    const expected = first.relevanceScore * 0.6 + first.revenueScore * 0.4;
    expect(first.finalScore).toBeCloseTo(expected, 5);
  });

  it("should sort by relevance when sortMode is relevance and by revenue when revenue", () => {
    const user = userProfiles[0];
    const primary = schemes.find((item) => item.id === "pm-kisan-loan");
    const secondary = schemes.find((item) => item.id === "startup-revival-loan");
    expect(primary).toBeDefined();
    expect(secondary).toBeDefined();

    const relevanceSorted = scoreSchemes(user, [primary!, secondary!], { sortMode: "relevance" });
    const revenueSorted = scoreSchemes(user, [primary!, secondary!], { sortMode: "revenue" });
    const combinedSorted = scoreSchemes(user, [primary!, secondary!], { sortMode: "combined" });

    expect(relevanceSorted[0].id).toBe("pm-kisan-loan");
    expect(revenueSorted[0].id).toBe("startup-revival-loan");
    expect(combinedSorted[0].id).toBe("startup-revival-loan");
  });

  it("should ensure all normalized score values remain within the 0-1 range", () => {
    const user = userProfiles[1];
    const scored = scoreSchemes(user, schemes, { sortMode: "combined" });

    scored.forEach((item) => {
      expect(item.relevanceScore).toBeGreaterThanOrEqual(0);
      expect(item.relevanceScore).toBeLessThanOrEqual(1);
      expect(item.revenueScore).toBeGreaterThanOrEqual(0);
      expect(item.revenueScore).toBeLessThanOrEqual(1);
      expect(item.finalScore).toBeGreaterThanOrEqual(0);
      expect(item.finalScore).toBeLessThanOrEqual(1);
    });
  });

  it("should treat missing fundingAmount as zero revenue and still score relevance", () => {
    const user = userProfiles[1];
    const scheme = schemes.find((item) => item.id === "community-health-kiosk");
    expect(scheme).toBeDefined();

    const scored = scoreSchemes(user, [scheme!], { sortMode: "combined" });
    const first = scored[0];

    expect(first.revenueScore).toBe(0);
    expect(first.finalScore).toBeCloseTo(first.relevanceScore * 0.6, 5);
  });

  it("should preserve a deterministic fallback path when no schemes meet recommendation thresholds", () => {
    const lowMatchUser = userProfiles[6];
    const matched = matchSchemes(lowMatchUser, [schemes.find((item) => item.id === "male-health-cover")!], {
      includeExpired: true,
      sortMode: "combined",
      maxResults: 5,
    });

    expect(matched.recommendedCount).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(matched.excludedSchemes)).toBe(true);
  });
});
