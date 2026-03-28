/**
 * Parser module test suite.
 * Validates metadata extraction, procedural sections, and terms parsing.
 */

import {
  parseSchemeMetadata,
  extractProceduralSections,
  parseTermsAndConditions,
} from "../lib/parser";
import { parserMocks } from "./mocks/mockData";

describe("Parser module", () => {
  it("should extract an explicit summary when one is present", () => {
    const metadata = parseSchemeMetadata(parserMocks.summaryWithSummary);

    expect(metadata.summary).toContain("Program Summary");
    expect(metadata.officialPortal).toBe("https://example.gov");
  });

  it("should generate a fallback summary when one is missing", () => {
    const metadata = parseSchemeMetadata(parserMocks.summaryMissing);

    expect(metadata.summary).toContain("An education support program");
    expect(metadata.deadline).toBe("Not Specified");
  });

  it("should parse a long-form deadline string into a Date", () => {
    const metadata = parseSchemeMetadata(parserMocks.summaryWithSummary);

    expect(metadata.deadline).toBeInstanceOf(Date);
    expect((metadata.deadline as Date).getFullYear()).toBe(2026);
    expect((metadata.deadline as Date).getMonth()).toBe(2);
    expect((metadata.deadline as Date).getDate()).toBe(31);
  });

  it("should parse a two-digit deadline string into the correct Date", () => {
    const metadata = parseSchemeMetadata(parserMocks.deadlineTwoDigit);

    expect(metadata.deadline).toBeInstanceOf(Date);
    expect((metadata.deadline as Date).getFullYear()).toBe(2026);
    expect((metadata.deadline as Date).getMonth()).toBe(2);
    expect((metadata.deadline as Date).getDate()).toBe(31);
  });

  it("should preserve Ongoing deadlines as a string", () => {
    const metadata = parseSchemeMetadata(parserMocks.deadlineOngoing);

    expect(metadata.deadline).toBe("Ongoing");
  });

  it("should return 'Not Specified' when a deadline is missing", () => {
    const metadata = parseSchemeMetadata(parserMocks.emptyDocument);

    expect(metadata.deadline).toBe("Not Specified");
  });

  it("should mark past deadlines as expired", () => {
    const metadata = parseSchemeMetadata(parserMocks.deadlinePast);

    expect(metadata.expired).toBe(true);
  });

  it("should parse numbered application steps from a structured section", () => {
    const procedural = extractProceduralSections(parserMocks.summaryMissing);

    expect(procedural.applicationSteps).toEqual([
      "Fill the form.",
      "Submit supporting documents.",
    ]);
    expect(procedural.extractionConfidence).toBe("structured");
  });

  it("should return an empty applicationSteps array when no structured section exists", () => {
    const procedural = extractProceduralSections(parserMocks.deadlineOngoing);

    expect(procedural.applicationSteps).toEqual([]);
    expect(procedural.documentsRequired).toEqual([]);
  });

  it("should parse a documents list when it is present", () => {
    const procedural = extractProceduralSections(parserMocks.summaryMissing);

    expect(procedural.documentsRequired).toEqual([
      "Aadhaar Card",
      "Income Certificate",
    ]);
  });

  it("should return an empty documentsRequired array when documents are missing", () => {
    const procedural = extractProceduralSections(parserMocks.summaryWithSummary);

    expect(procedural.documentsRequired).toEqual([]);
  });

  it("should detect exclusions and penalties in terms and conditions", () => {
    const terms = parseTermsAndConditions(parserMocks.termsExample);

    expect(terms.termsParsed.exclusions.length).toBeGreaterThan(0);
    expect(terms.termsParsed.penaltyClauses.length).toBeGreaterThan(0);
    expect(terms.termsParsed.renewalConditions.length).toBeGreaterThan(0);
  });

  it("should return empty parsed terms when no T&C section exists", () => {
    const terms = parseTermsAndConditions(parserMocks.summaryMissing);

    expect(terms.termsRaw).toBe("");
    expect(terms.termsParsed.generalTerms).toEqual([]);
    expect(terms.termsParsed.exclusions).toEqual([]);
    expect(terms.termsParsed.penaltyClauses).toEqual([]);
    expect(terms.termsParsed.renewalConditions).toEqual([]);
  });

  it("should safely return defaults for an empty document", () => {
    const metadata = parseSchemeMetadata(parserMocks.emptyDocument);
    const procedural = extractProceduralSections(parserMocks.emptyDocument);
    const terms = parseTermsAndConditions(parserMocks.emptyDocument);

    expect(metadata.summary).toBe("Not Specified");
    expect(metadata.deadline).toBe("Not Specified");
    expect(procedural.applicationSteps).toEqual([]);
    expect(procedural.documentsRequired).toEqual([]);
    expect(terms.termsParsed.generalTerms).toEqual([]);
  });
});
