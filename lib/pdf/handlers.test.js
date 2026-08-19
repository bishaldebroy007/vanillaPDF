import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { mergePdfs } from "./merge.js";
import { splitPdf } from "./split.js";
import { compressPdf } from "./compress.js";
import { isPasswordProtectedError, wrapPdfError, throwIfAborted } from "./errors.js";

async function createPdf(pageCount = 1, { title } = {}) {
  const pdf = await PDFDocument.create();
  if (title) pdf.setTitle(title);
  for (let i = 0; i < pageCount; i++) {
    pdf.addPage();
  }
  return pdf.save();
}

describe("mergePdfs", () => {
  it("merges two single-page PDFs into one with two pages", async () => {
    const buf1 = await createPdf(1);
    const buf2 = await createPdf(1);
    const merged = await mergePdfs([buf1, buf2]);
    const result = await PDFDocument.load(merged);
    expect(result.getPageCount()).toBe(2);
  });
});

describe("splitPdf", () => {
  it("splits all pages individually when range is empty", async () => {
    const buf = await createPdf(3);
    const result = await splitPdf(buf, "");
    expect(result.mode).toBe("individual");
    expect(result.files).toHaveLength(3);
    for (const file of result.files) {
      const pdf = await PDFDocument.load(file.data);
      expect(pdf.getPageCount()).toBe(1);
    }
  });

  it("extracts a page range into a single PDF", async () => {
    const buf = await createPdf(5);
    const result = await splitPdf(buf, "2-4");
    expect(result.mode).toBe("extract");
    expect(result.files).toHaveLength(1);
    const pdf = await PDFDocument.load(result.files[0].data);
    expect(pdf.getPageCount()).toBe(3);
  });
});

describe("compressPdf", () => {
  it("strips metadata from PDF", async () => {
    const buf = await createPdf(1, { title: "Secret Title" });
    const compressed = await compressPdf(buf);
    const pdf = await PDFDocument.load(compressed);
    expect(pdf.getTitle()).toBe("");
    expect(compressed).toBeDefined();
    expect(compressed.length).toBeGreaterThan(0);
  });
});

describe("wrapPdfError", () => {
  it("detects password-protected errors", () => {
    expect(isPasswordProtectedError(new Error("Password required"))).toBe(true);
    expect(isPasswordProtectedError(new Error("Document is encrypted"))).toBe(true);
    expect(isPasswordProtectedError(new Error("random failure"))).toBe(false);
  });

  it("wraps password errors with user-friendly message", () => {
    const wrapped = wrapPdfError(new Error("Password required"));
    expect(wrapped.message).toMatch(/password-protected/i);
  });
});

describe("throwIfAborted", () => {
  it("throws AbortError when the signal is aborted", () => {
    const controller = new AbortController();
    controller.abort();
    expect(() => throwIfAborted(controller.signal)).toThrow(/cancelled/);
  });

  it("does nothing when the signal is active", () => {
    const controller = new AbortController();
    expect(() => throwIfAborted(controller.signal)).not.toThrow();
  });
});
