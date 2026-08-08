import { test, expect } from "@playwright/test";
import { signUpOwner, testEmail } from "./helpers";

test("mic button renders in AI chat without a hydration error", async ({ page, context }) => {
  await context.grantPermissions(["microphone"]);
  const pageErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));

  await signUpOwner(page, { fullName: "E2E Voice Owner", email: testEmail("voice-owner") });

  await page.goto("/dashboard/settings");
  await page.waitForTimeout(1500);
  await page.goto("/dashboard/ai");
  await page.waitForTimeout(1500);

  const hydrationErrors = pageErrors.filter((e) => e.includes("Hydration failed"));
  expect(hydrationErrors).toEqual([]);

  const micButton = page.locator('button[aria-label="Ask by voice"]');
  await expect(micButton).toBeVisible({ timeout: 10_000 });
});
