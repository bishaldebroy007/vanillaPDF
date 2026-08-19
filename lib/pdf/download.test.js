import { describe, it, expect } from "vitest";
import { formatSize } from "./download.js";

describe("formatSize", () => {
  it("formats bytes", () => {
    expect(formatSize(512)).toBe("512 B");
  });

  it("formats kilobytes", () => {
    expect(formatSize(2048)).toBe("2.0 KB");
  });

  it("formats megabytes", () => {
    expect(formatSize(2097152)).toBe("2.00 MB");
  });
});
