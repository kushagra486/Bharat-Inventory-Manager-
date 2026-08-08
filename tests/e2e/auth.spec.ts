import { test, expect } from "@playwright/test";
import { signUpOwner, testEmail, TEST_PASSWORD } from "./helpers";

test("owner can sign up and lands on the dashboard", async ({ page }) => {
  await signUpOwner(page, { fullName: "E2E Owner", email: testEmail("owner-signup") });
  await expect(page).toHaveURL(/\/dashboard/);
});

test("forgot-password request succeeds without leaking whether the account exists", async ({ page }) => {
  await page.goto("/forgot-password");
  await page.fill("#email", testEmail("forgot-password"));
  await page.click('button[type="submit"]');

  await expect(page.locator("text=on its way")).toBeVisible({ timeout: 10_000 });
  await expect(page.locator(".text-destructive")).toHaveCount(0);
});

test("signed-in user is redirected away from /login", async ({ page }) => {
  const email = testEmail("redirect-check");
  await signUpOwner(page, { fullName: "E2E Redirect", email });
  await page.goto("/login");
  await expect(page).toHaveURL(/\/dashboard/);
});

test("wrong password is rejected", async ({ page }) => {
  const email = testEmail("wrong-password");
  await signUpOwner(page, { fullName: "E2E Wrong Password", email });
  await page.click('button:has-text("Sign out")');
  await page.waitForURL("**/login", { timeout: 10_000 });

  await page.fill("#email", email);
  await page.fill("#password", TEST_PASSWORD + "-wrong");
  await page.click('button:has-text("Sign in")');

  await expect(page.locator(".text-destructive")).toBeVisible({ timeout: 10_000 });
  await expect(page).toHaveURL(/\/login/);
});
