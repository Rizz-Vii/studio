import { test, expect } from "@playwright/test";
import { randomDelay } from "../utils/test-utils";

test.describe("Visual Regression Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await randomDelay();
  });

  test("dashboard layout matches baseline", async ({ page }) => {
    // Wait for all content to load
    await page.waitForLoadState("networkidle");

    // Take screenshot for comparison
    await expect(page).toHaveScreenshot("dashboard.png", {
      mask: [
        page.locator('[data-testid="timestamp"]'), // Mask dynamic content
        page.locator('[data-testid="user-avatar"]'),
      ],
      threshold: 0.2, // Allow small variations
    });
  });
});
