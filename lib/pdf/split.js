import { PDFDocument } from "pdf-lib";
import { wrapPdfError } from "./errors.js";
import { parsePageRanges } from "./pageRanges.js";

export async function splitPdf(arrayBuffer, pageRangeInput) {
  try {
    const pdf = await PDFDocument.load(arrayBuffer);
    const totalPages = pdf.getPageCount();
    const pageIndices = parsePageRanges(pageRangeInput, totalPages);

    if (pageIndices === null) {
      const results = [];
      for (let i = 0; i < totalPages; i++) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(copiedPage);
        results.push({
          name: `split_page_${i + 1}.pdf`,
          data: await newPdf.save(),
        });
      }
      return { mode: "individual", files: results };
    }

    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdf, pageIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));
    return {
      mode: "extract",
      files: [{ name: "extracted_pages.pdf", data: await newPdf.save() }],
    };
  } catch (err) {
    if (err.message?.includes("Invalid range") || err.message?.includes("Invalid page")) {
      throw err;
    }
    throw wrapPdfError(err);
  }
}
