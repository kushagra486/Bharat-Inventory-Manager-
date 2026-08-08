import { test, expect } from "@playwright/test";
import { signUpOwner, testEmail, addProduct, ringUpSale } from "./helpers";

test("delivery column renders and stays inert for in-store orders", async ({ page }) => {
  await signUpOwner(page, { fullName: "E2E Delivery Owner", email: testEmail("delivery-owner") });

  const productName = `E2E Delivery Item ${Date.now()}`;
  await addProduct(page, { name: productName, price: "50" });
  await ringUpSale(page, productName);

  await page.goto("/dashboard/orders");
  await page.waitForTimeout(1000);

  // In-store (POS) orders have no customer account to deliver to, so the
  // Delivery column should show a dash rather than a status control.
  const deliveryCell = page.locator("tbody tr").first().locator("td").nth(7);
  await expect(deliveryCell).toHaveText("—");
});
