/// <reference types="jest" />
/**
 * CRITICAL - Exclusion filter test suite.
 * Validates hard demographic and expiry filtering before scoring.
 */

import { applyExclusionFilter } from "../lib/filters";
import { schemes, userProfiles } from "./mocks/mockData";

describe("CRITICAL - Filters", () => {
  it("should exclude female-only schemes for a male user", () => {
    const user = userProfiles[0];
    const { acceptedSchemes, excludedSchemes } = applyExclusionFilter(user, schemes);

    expect(excludedSchemes.some((item) => item.scheme.id === "women-empowerment-fund")).toBe(true);
    expect(acceptedSchemes.some((scheme) => scheme.id === "women-empowerment-fund")).toBe(false);
  });

  it("should exclude male-only schemes for a female user", () => {
    const user = userProfiles[1];
    const { excludedSchemes } = applyExclusionFilter(user, schemes);

    expect(excludedSchemes.some((item) => item.scheme.id === "pm-kisan-loan")).toBe(true);
    expect(excludedSchemes.some((item) => item.reason === "Gender mismatch")).toBe(true);
  });

  it("should exclude users younger than the scheme minimum age", () => {
    const user = userProfiles[6];
    const { excludedSchemes } = applyExclusionFilter(user, schemes);

    expect(excludedSchemes.some((item) => item.scheme.id === "rural-employment-guarantee")).toBe(true);
    expect(excludedSchemes.find((item) => item.scheme.id === "rural-employment-guarantee")?.reason).toBe(
      "Age outside eligible range"
    );
  });

  it("should exclude users older than the scheme maximum age", () => {
    const user = userProfiles[7];
    const { excludedSchemes } = applyExclusionFilter(user, schemes);

    expect(excludedSchemes.some((item) => item.scheme.id === "startup-revival-loan")).toBe(true);
    expect(excludedSchemes.find((item) => item.scheme.id === "startup-revival-loan")?.reason).toBe(
      "Age outside eligible range"
    );
  });

  it("should exclude users with income above the scheme limit", () => {
    const user = userProfiles[2];
    const { excludedSchemes } = applyExclusionFilter(user, schemes);

    expect(excludedSchemes.some((item) => item.scheme.id === "village-savings-microgrant")).toBe(true);
    expect(excludedSchemes.find((item) => item.scheme.id === "village-savings-microgrant")?.reason).toBe(
      "Income exceeds scheme limit"
    );
  });

  it("should exclude schemes when user category does not match", () => {
    const user = userProfiles[0];
    const { excludedSchemes } = applyExclusionFilter(user, schemes);

    expect(excludedSchemes.some((item) => item.scheme.id === "village-savings-microgrant")).toBe(true);
    expect(excludedSchemes.find((item) => item.scheme.id === "village-savings-microgrant")?.reason).toBe(
      "Category mismatch"
    );
  });

  it("should exclude expired schemes by default and include them when requested", () => {
    const user = userProfiles[0];
    const defaultResult = applyExclusionFilter(user, schemes);
    const includeExpiredResult = applyExclusionFilter(user, schemes, { includeExpired: true });

    expect(defaultResult.excludedSchemes.some((item) => item.scheme.id === "male-health-cover")).toBe(true);
    expect(includeExpiredResult.acceptedSchemes.some((scheme) => scheme.id === "male-health-cover")).toBe(true);
  });

  it("should report a reason for a scheme that fails multiple eligibility conditions", () => {
    const user = userProfiles[6];
    const { excludedSchemes } = applyExclusionFilter(user, schemes);
    const failure = excludedSchemes.find((item) => item.scheme.id === "male-health-cover");

    expect(failure).toBeDefined();
    expect(typeof failure?.reason).toBe("string");
    expect(failure?.reason.length).toBeGreaterThan(0);
  });
});
