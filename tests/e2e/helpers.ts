import type { Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const CREATED_EMAILS_FILE = path.join(__dirname, ".created-emails.json");
export const TEST_PASSWORD = "e2e-test-password-123";

/**
 * Every test account is emailed under this pattern so a human (or the
 * global teardown, when SUPABASE_SERVICE_ROLE_KEY is set) can find and
 * remove them without touching real user data.
 */
export function testEmail(prefix: string): string {
  const email = `e2e-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
  const existing: string[] = fs.existsSync(CREATED_EMAILS_FILE)
    ? JSON.parse(fs.readFileSync(CREATED_EMAILS_FILE, "utf-8"))
    : [];
  existing.push(email);
  fs.writeFileSync(CREATED_EMAILS_FILE, JSON.stringify(existing, null, 2));
  return email;
}

export async function signUpOwner(
  page: Page,
  { fullName, email, password = TEST_PASSWORD }: { fullName: string; email: string; password?: string },
) {
  await page.goto("/signup");
  await page.fill("#fullName", fullName);
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click('button:has-text("Sign up")');
  await page.waitForURL("**/dashboard", { timeout: 20_000 });
}

export async function signIn(page: Page, { email, password = TEST_PASSWORD }: { email: string; password?: string }) {
  await page.goto("/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click('button:has-text("Sign in")');
  await page.waitForURL("**/dashboard/**", { timeout: 20_000 });
}

export async function addProduct(
  page: Page,
  { name, quantity = "50", price = "100", expiryDate = "2030-01-01" }: { name: string; quantity?: string; price?: string; expiryDate?: string },
) {
  await page.goto("/dashboard/products");
  await page.click('[data-slot="dialog-trigger"]:has-text("Add product")');
  await page.waitForSelector("#name", { timeout: 10_000 });
  await page.fill("#name", name);
  await page.fill("#quantity", quantity);
  await page.fill("#price", price);
  await page.fill("#expiry_date", expiryDate);
  await page.click('[data-slot="dialog-content"] button:has-text("Add product")');
  await page.waitForTimeout(1000);
}

export async function ringUpSale(page: Page, productName: string) {
  await page.goto("/dashboard/sales");
  await page.waitForTimeout(500);
  await page.click(`text=${productName}`);
  await page.waitForTimeout(300);
  await page.click('button:has-text("Checkout")');
  await page.waitForTimeout(1500);
}
