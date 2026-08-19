import { describe, it, expect } from "vitest";
import { parsePageRanges } from "./pageRanges.js";

describe("parsePageRanges", () => {
  it("returns null for empty input", () => {
    expect(parsePageRanges("", 10)).toBeNull();
    expect(parsePageRanges("   ", 10)).toBeNull();
  });

  it("parses a single page", () => {
    expect(parsePageRanges("3", 10)).toEqual([2]);
  });

  it("parses an inclusive range", () => {
    expect(parsePageRanges("2-5", 10)).toEqual([1, 2, 3, 4]);
  });

  it("parses multiple parts", () => {
    expect(parsePageRanges("1,3,5-7", 10)).toEqual([0, 2, 4, 5, 6]);
  });

  it("deduplicates overlapping ranges", () => {
    expect(parsePageRanges("1-3,2-4", 10)).toEqual([0, 1, 2, 3]);
  });

  it("handles page 1 on single-page doc", () => {
    expect(parsePageRanges("1", 1)).toEqual([0]);
  });

  it("throws for page below min", () => {
    expect(() => parsePageRanges("0", 10)).toThrow(/Invalid page/);
  });

  it("throws for page above max", () => {
    expect(() => parsePageRanges("11", 10)).toThrow(/Invalid page/);
  });

  it("throws for inverted range", () => {
    expect(() => parsePageRanges("5-2", 10)).toThrow(/Invalid range/);
  });

  it("throws for non-numeric input", () => {
    expect(() => parsePageRanges("abc", 10)).toThrow(/Invalid page/);
  });

  it("throws for empty segment", () => {
    expect(() => parsePageRanges("1,,3", 10)).toThrow(/Invalid page/);
  });

  it("handles max boundary", () => {
    expect(parsePageRanges("10", 10)).toEqual([9]);
  });
});
