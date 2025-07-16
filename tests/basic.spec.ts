import { test, expect } from "@playwright/test";

test.describe("Basic Health Check", () => {
  test("can connect to the application", async ({ page }) => {
    // Navigate to the home page
    await page.goto("/");

    // Wait for the page to load
    await page.waitForLoadState("domcontentloaded");

    // Basic check - make sure we get a valid page (check for any content)
    await expect(page.locator("body")).toBeVisible();

    // Check for the main navigation or header
    const hasNavigation =
      (await page.locator("nav, header, [role='navigation']").count()) > 0;
    expect(hasNavigation).toBeTruthy();

    // Take a screenshot for debugging
    await page.screenshot({ path: "test-results/basic-health-check.png" });
  });

  test("can access login page", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    // Check for login form elements
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /login/i })).toBeVisible();
  });
});
