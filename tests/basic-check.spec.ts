import { test, expect } from "@playwright/test";

test.describe("Basic Tests", () => {
  // Increase test timeout
  test.setTimeout(120000);

  test.beforeEach(async ({ page }) => {
    // Increase navigation timeout
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(30000);
  });

  test("home page loads", async ({ page }) => {
    console.log("Attempting to load homepage...");
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    console.log(`Loaded URL: ${page.url()}`);

    // Verify page loads
    await expect(page.locator("body")).toBeVisible();
    console.log("Body element is visible");

    // Take a screenshot
    await page.screenshot({
      path: "test-results/homepage-basic-check.png",
      fullPage: true,
    });

    console.log("Test completed successfully");
  });
});
