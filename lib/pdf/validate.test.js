import { describe, it, expect } from "vitest";
import { sanitizeFileName, validatePdf, MAX_FILE_SIZE } from "./validate.js";

describe("sanitizeFileName", () => {
  it("replaces dangerous characters", () => {
    expect(sanitizeFileName("report<script>.pdf")).toBe("report_script_.pdf");
  });

  it("truncates long names to 200 chars", () => {
    const long = "a".repeat(300);
    expect(sanitizeFileName(long)).toHaveLength(200);
  });

  it("leaves normal names unchanged", () => {
    expect(sanitizeFileName("invoice.pdf")).toBe("invoice.pdf");
  });
});

describe("validatePdf", () => {
  function makeFile({ name = "test.pdf", content = "%PDF-1.4", size } = {}) {
    const blob = new Blob([content], { type: "application/pdf" });
    const file = new File([blob], name, { type: "application/pdf" });
    if (size !== undefined) {
      Object.defineProperty(file, "size", { value: size });
    }
    return file;
  }

  it("accepts a valid PDF", async () => {
    await expect(validatePdf(makeFile())).resolves.toBeUndefined();
  });

  it("rejects files over size limit", async () => {
    await expect(
      validatePdf(makeFile({ size: MAX_FILE_SIZE + 1 }))
    ).rejects.toThrow(/exceeds the 100MB size limit/);
  });

  it("rejects non-PDF magic bytes", async () => {
    await expect(validatePdf(makeFile({ content: "NOTPDF" }))).rejects.toThrow(
      /not a valid PDF/
    );
  });

  it("accepts PDFs with leading whitespace", async () => {
    await expect(
      validatePdf(makeFile({ content: "\n  %PDF-1.7 rest" }))
    ).resolves.toBeUndefined();
  });

  it("includes sanitized filename in error", async () => {
    await expect(
      validatePdf(makeFile({ name: "foo<script>.pdf", content: "NOTPDF" }))
    ).rejects.toThrow(/foo_script_.pdf/);
  });
});
