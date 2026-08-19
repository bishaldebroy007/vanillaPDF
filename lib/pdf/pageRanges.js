export function parsePageRanges(input, maxPages) {
  if (!input.trim()) return null; // empty means all pages individually
  const ranges = [];
  const parts = input.split(",").map((s) => s.trim());
  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-");
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (isNaN(start) || isNaN(end) || start < 1 || end > maxPages || start > end) {
        throw new Error(`Invalid range "${part}". Pages must be between 1 and ${maxPages}.`);
      }
      for (let i = start; i <= end; i++) {
        if (!ranges.includes(i - 1)) ranges.push(i - 1);
      }
    } else {
      const page = parseInt(part, 10);
      if (isNaN(page) || page < 1 || page > maxPages) {
        throw new Error(`Invalid page "${part}". Must be between 1 and ${maxPages}.`);
      }
      if (!ranges.includes(page - 1)) ranges.push(page - 1);
    }
  }
  return ranges.sort((a, b) => a - b);
}
