import { test, expect } from "@playwright/test";
import { signUpOwner, testEmail, TEST_PASSWORD } from "./helpers";

test("owner can invite staff, and the invited staff account is POS-only", async ({ page, browser }) => {
  const ownerEmail = testEmail("staff-owner");
  await signUpOwner(page, { fullName: "E2E Staff Owner", email: ownerEmail });

  await page.goto("/dashboard/settings");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(300);

  await page.click('[data-slot="dialog-trigger"]:has-text("Invite staff")');
  await page.waitForSelector("#fullName", { timeout: 10_000 });
  await page.fill("#fullName", "E2E Staff Member");
  await page.click('button:has-text("Generate invite code")');
  await page.waitForTimeout(1000);

  const inviteCode = (await page.locator("button.font-mono").first().textContent())?.trim();
  expect(inviteCode).toBeTruthy();

  const staffContext = await browser.newContext();
  const staffPage = await staffContext.newPage();
  const staffEmail = testEmail("staff-member");

  await staffPage.goto("/staff-signup");
  await staffPage.fill("#fullName", "E2E Staff Member");
  await staffPage.fill("#email", staffEmail);
  await staffPage.fill("#password", TEST_PASSWORD);
  await staffPage.fill("#inviteCode", inviteCode!);
  await staffPage.click('button:has-text("Join shop")');

  await expect(staffPage).toHaveURL(/\/dashboard\/sales/, { timeout: 20_000 });

  // Staff can't reach owner-only pages.
  await staffPage.goto("/dashboard/settings");
  await staffPage.waitForTimeout(500);
  await expect(staffPage).not.toHaveURL(/\/dashboard\/settings/);

  await staffContext.close();
});
