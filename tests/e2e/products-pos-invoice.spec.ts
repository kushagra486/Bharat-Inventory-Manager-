import { test, expect } from "@playwright/test";
import { signUpOwner, testEmail, addProduct, ringUpSale } from "./helpers";

test("add a product, ring it up on the POS, and download a real invoice PDF", async ({ page }) => {
  await signUpOwner(page, { fullName: "E2E POS Owner", email: testEmail("pos-owner") });

  const productName = `E2E Rice ${Date.now()}`;
  await addProduct(page, { name: productName, price: "150" });
  await expect(page.locator(`text=${productName}`)).toBeVisible({ timeout: 10_000 });

  await ringUpSale(page, productName);
  await expect(page.locator("text=/Order .* completed/")).toBeVisible({ timeout: 10_000 });

  await page.goto("/dashboard/orders");
  await page.waitForTimeout(1000);

  const invoiceHref = await page.locator('a[href^="/api/invoices/"]').first().getAttribute("href");
  expect(invoiceHref).toBeTruthy();

  const response = await page.request.get(invoiceHref!);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("application/pdf");

  const body = await response.body();
  expect(body.subarray(0, 4).toString()).toBe("%PDF");
});

test("barcode scanner dialog opens from the products page", async ({ page, context }) => {
  // Camera hardware (real or fake) varies across CI runners and local
  // machines, so this only asserts the button/dialog wiring — that a real
  // getUserMedia() stream actually renders through ZXing was verified
  // manually against a fake camera device (see PR description).
  await context.grantPermissions(["camera"]);
  await signUpOwner(page, { fullName: "E2E Barcode Owner", email: testEmail("barcode-owner") });

  await page.goto("/dashboard/products");
  await page.click('[data-slot="dialog-trigger"]:has-text("Add product")');
  await page.waitForSelector("#barcode", { timeout: 10_000 });
  await page.click("#barcode ~ button");

  await expect(page.locator('[data-slot="dialog-title"]:has-text("Scan barcode")')).toBeVisible({
    timeout: 10_000,
  });
});
