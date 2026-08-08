import { test, expect } from "@playwright/test";
import { signUpOwner, testEmail, addProduct } from "./helpers";

test("customer checkout with UPI shows a real QR code and deep link", async ({ page, browser }) => {
  const shopName = `E2E Kirana ${Date.now()}`;
  const productName = `E2E Atta ${Date.now()}`;

  await signUpOwner(page, { fullName: "E2E Marketplace Owner", email: testEmail("marketplace-owner") });

  await page.goto("/dashboard/settings");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await page.fill("#business_name", shopName);
  await page.fill("#upi_id", "e2etest@okhdfcbank");
  await page.click('button:has-text("Save changes")');
  await page.waitForTimeout(2000);

  await addProduct(page, { name: productName, price: "80" });

  const customerContext = await browser.newContext(
    process.env.PW_LOCAL_PROXY
      ? { proxy: { server: process.env.PW_LOCAL_PROXY, bypass: "localhost,127.0.0.1" } }
      : {},
  );
  const customerPage = await customerContext.newPage();
  const customerEmail = testEmail("marketplace-customer");

  await customerPage.goto("/shop");
  await customerPage.waitForTimeout(1000);
  await customerPage.locator('button:has-text("Create account")').first().click();
  await customerPage.fill('input[placeholder="Your name"]', "E2E Customer");
  await customerPage.fill('input[placeholder="Email address"]', customerEmail);
  await customerPage.fill('input[placeholder="Phone number"]', "9999999999");
  await customerPage.fill('input[placeholder="Password"]', "e2e-test-password-123");
  await customerPage.click('button[type="submit"]:has-text("Create account")');
  await customerPage.waitForTimeout(3000);

  const needsEmailConfirmation = await customerPage.locator("text=Check your email").count();
  test.skip(
    needsEmailConfirmation > 0,
    "This Supabase project has email confirmation enabled, so a fresh signup has no session to " +
      "check out with. Disable 'Confirm email' under Auth settings for the project this suite runs " +
      "against (a test/staging project, not production) to exercise this flow.",
  );

  // Stay in the same SPA session rather than reloading — a fresh navigation
  // re-reads the session from cookies server-side, which can race the
  // client-side signup's cookie write under proxied/high-latency networks.
  await customerPage.locator(`a:has-text("${shopName}")`).first().click();
  await customerPage.waitForURL(/\/shop\/.+/, { timeout: 10_000 });
  await customerPage.waitForTimeout(800);

  await customerPage.locator('button:has-text("ADD")').first().click();
  await customerPage.locator('nav button:has-text("Cart")').click();
  await customerPage.waitForTimeout(500);

  await customerPage.fill('input[placeholder="Your name"]', "E2E Customer");
  await customerPage.fill('input[placeholder="Phone number"]', "9999999999");
  await customerPage.locator('button:has-text("upi")').first().click();
  await customerPage.locator('button:has-text("Checkout")').first().click();
  await customerPage.waitForTimeout(2500);

  await expect(customerPage.locator('img[alt="UPI QR code"]')).toBeVisible({ timeout: 10_000 });
  await expect(customerPage.locator('a:has-text("Open UPI app")')).toHaveAttribute(
    "href",
    /^upi:\/\/pay\?.*pa=e2etest%40okhdfcbank/,
  );

  await customerContext.close();
});
