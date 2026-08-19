import { PDFDocument } from "pdf-lib";
import { wrapPdfError } from "./errors.js";

export async function mergePdfs(fileBuffers) {
  try {
    const mergedPdf = await PDFDocument.create();
    for (const arrayBuffer of fileBuffers) {
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    return mergedPdf.save();
  } catch (err) {
    throw wrapPdfError(err);
  }
}
