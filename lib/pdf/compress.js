import { PDFDocument } from "pdf-lib";
import { wrapPdfError } from "./errors.js";

export async function compressPdf(arrayBuffer) {
  try {
    const pdf = await PDFDocument.load(arrayBuffer);
    pdf.setTitle("");
    pdf.setAuthor("");
    pdf.setSubject("");
    pdf.setKeywords([]);
    pdf.setProducer("");
    pdf.setCreator("");

    const pdfBytes = await pdf.save({ useObjectStreams: true });
    return pdfBytes;
  } catch (err) {
    throw wrapPdfError(err);
  }
}
