/// <reference types="jest" />
/**
 * NLP module test suite.
 * Verifies multilingual keyword normalization, refinement, and external API integration.
 */

import { refineKeywords, translateKeyword, normalizeQuery } from "../lib/nlp";
import { cleanKeywords, noisyKeywords } from "./mocks/mockData";

describe("NLP pipeline", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should correct common misspellings and return normalized tokens", () => {
    const result = refineKeywords("schlarship aggriculture");

    expect(result).toEqual(expect.arrayContaining(["scholarship", "agriculture"]));
  });

  it("should map synonyms and regional terms to canonical forms", () => {
    const result = refineKeywords("kisan mahila छात्र");

    expect(result).toEqual(expect.arrayContaining(["farmer", "women", "student"]));
  });

  it("should strip noise characters from keywords", () => {
    const result = refineKeywords("  farmer  loan##scheme!! ");

    expect(result).toEqual(expect.arrayContaining(["farmer", "loan", "scheme"]));
  });

  it("should filter out stop words while preserving meaningful keywords", () => {
    const result = refineKeywords("the is kisan");

    expect(result).toContain("farmer");
    expect(result).not.toContain("the");
    expect(result).not.toContain("is");
  });

  it("should lemmatize tokens into canonical base forms", () => {
    const result = refineKeywords("farming farmed studies");

    expect(result).toEqual(expect.arrayContaining(["farm", "study"]));
  });

  it("should return an empty list for empty or noise-only input", () => {
    expect(refineKeywords("")).toEqual([]);
    expect(refineKeywords("need help please")).toEqual([]);
    expect(refineKeywords("12345")).toEqual([]);
  });

  it("should translate a keyword with mocked external API responses", async () => {
    const mockedResponse = { ok: true, json: async () => ({ translatedText: "कर्जा" }) };
    (global.fetch as jest.Mock).mockResolvedValue(mockedResponse);

    const result = await translateKeyword("loan");

    expect(result.en).toBe("loan");
    expect(result.hi).toBe("कर्जा");
    expect(global.fetch).toHaveBeenCalled();
  });

  it("should normalize a Hindi query by translating it to English", async () => {
    const mockedResponse = { ok: true, json: async () => ({ translatedText: "farmer loan" }) };
    (global.fetch as jest.Mock).mockResolvedValue(mockedResponse);

    const normalized = await normalizeQuery("किसान ऋण");

    expect(normalized).toBe("farmer loan");
    expect(global.fetch).toHaveBeenCalled();
  });
});
