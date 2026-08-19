import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const fixtures = path.join(process.cwd(), "e2e", "fixtures");
const samplePdf = path.join(fixtures, "sample.pdf");
const samplePdfB = path.join(fixtures, "sample-b.pdf");
const invalidFile = path.join(fixtures, "invalid.txt");

test.describe("VanillaPDF smoke tests", () => {
  test("home page loads with 4 tool cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /UNLEASH THE/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Open Merge PDF/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Open Split PDF/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Open PDF to Image/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Open Compress PDF/i })).toBeVisible();
  });

  test("navigates to merge tool", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Open Merge PDF" }).click();
    await expect(page).toHaveURL(/\/tools\/merge/);
    await expect(page.getByRole("heading", { name: "Merge PDF" })).toBeVisible();
  });

  test("shows 404 for invalid tool", async ({ page }) => {
    await page.goto("/tools/fake");
    await expect(page.getByRole("heading", { name: "Tool Not Found!" })).toBeVisible();
  });

  test("merge happy path", async ({ page }) => {
    await page.goto("/tools/merge");
    const fileInput = page.getByTestId("pdf-file-input");
    await fileInput.setInputFiles([samplePdf, samplePdfB]);
    await expect(page.getByText(/Selected Files \(2\)/)).toBeVisible();
    await page.getByRole("button", { name: "Combine Files" }).click();
    await expect(page.getByRole("heading", { name: "Mission Accomplished!" })).toBeVisible({
      timeout: 30000,
    });
  });

  test("split validation error for invalid range", async ({ page }) => {
    await page.goto("/tools/split");
    await page.getByTestId("pdf-file-input").setInputFiles(samplePdf);
    await expect(page.getByText(/Total pages:/)).toBeVisible();
    await page.locator("#page-range").fill("99-100");
    await page.getByRole("button", { name: "Split Now" }).click();
    await expect(page.getByRole("heading", { name: "Critical Failure!" })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText(/Invalid range/i)).toBeVisible();
  });

  test("rejects non-PDF files", async ({ page }) => {
    await page.goto("/tools/merge");
    await page.getByTestId("pdf-file-input").setInputFiles(invalidFile);
    await expect(page.getByText(/not a valid PDF/i)).toBeVisible();
  });

  test("about page loads", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: /THE LEGEND/i })).toBeVisible();
  });

  test("mobile nav opens", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.getByRole("button", { name: "Toggle menu" }).click();
    await expect(page.getByRole("link", { name: "About" })).toBeVisible();
  });
});

test.beforeAll(() => {
  fs.copyFileSync(samplePdf, samplePdfB);
  fs.writeFileSync(invalidFile, "this is not a pdf");
});
