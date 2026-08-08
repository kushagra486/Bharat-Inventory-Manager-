import { test, expect } from "@playwright/test";
import { signUpOwner, testEmail } from "./helpers";
import { extractLabelFields } from "../../src/lib/ocr-extract";

test.describe("label field extraction (pure logic, no browser needed)", () => {
  test("pulls name, price, expiry and batch off a typical Indian retail label", () => {
    const fields = extractLabelFields(
      "TATA SALT\nIodized Salt\nNet Wt: 1kg\nMRP: Rs. 28.00\nBatch No: TS2024A1\nEXP: 12/2026",
    );
    expect(fields.name).toBe("TATA SALT");
    expect(fields.price).toBe("28.00");
    expect(fields.expiryDate).toBe("2026-12-01");
    expect(fields.batchNumber).toBe("TS2024A1");
  });

  test("handles a DD/MM/YYYY expiry and a ₹ price with no MRP label", () => {
    const fields = extractLabelFields("Amul Butter\n500g\n₹255\nExpiry Date: 15/03/2026\nBatch: AB4521");
    expect(fields.name).toBe("Amul Butter");
    expect(fields.price).toBe("255");
    expect(fields.expiryDate).toBe("2026-03-15");
    expect(fields.batchNumber).toBe("AB4521");
  });

  test("handles a worded 'Best Before' date", () => {
    const fields = extractLabelFields("Parle-G Biscuits\nMRP ₹10.00\nBest Before: 08 Jan 2027");
    expect(fields.expiryDate).toBe("2027-01-08");
  });

  test("returns nulls instead of guessing when a field isn't present", () => {
    const fields = extractLabelFields("Some Product\nNo price or date here");
    expect(fields.price).toBeNull();
    expect(fields.expiryDate).toBeNull();
    expect(fields.batchNumber).toBeNull();
  });
});

test("label scanner dialog opens from the add-product form", async ({ page, context }) => {
  // Camera hardware varies across environments — this checks the button
  // wires up to the right dialog. OCR accuracy itself is covered by the
  // pure-logic tests above, which don't depend on any camera or model load.
  await context.grantPermissions(["camera"]);
  await signUpOwner(page, { fullName: "E2E OCR Owner", email: testEmail("ocr-owner") });

  await page.goto("/dashboard/products");
  await page.click('[data-slot="dialog-trigger"]:has-text("Add product")');
  await page.waitForSelector("#name", { timeout: 10_000 });
  await page.click('button:has-text("Scan label to fill in")');

  await expect(page.locator('[data-slot="dialog-title"]:has-text("Scan product label")')).toBeVisible({
    timeout: 10_000,
  });
});
