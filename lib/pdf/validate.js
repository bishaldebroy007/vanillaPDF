export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const PDF_MAGIC = "%PDF-";

export function sanitizeFileName(name) {
  return name.replace(/[<>"'&]/g, "_").slice(0, 200);
}

export async function validatePdf(file) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File "${sanitizeFileName(file.name)}" exceeds the 100MB size limit.`
    );
  }
  const headerBytes = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  const header = new TextDecoder("latin1").decode(headerBytes);
  if (!header.includes(PDF_MAGIC)) {
    throw new Error(
      `File "${sanitizeFileName(file.name)}" is not a valid PDF file.`
    );
  }
}
