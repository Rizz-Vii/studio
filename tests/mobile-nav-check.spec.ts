import { test, expect } from "@playwright/test";

test.describe("Mobile Navigation - Code Check", () => {
  test("check mobile nav implementation", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    console.log("🔍 Checking MobileNav component implementation...");

    // Go to home page to check if mobile navigation exists at all
    await page.goto("http://localhost:3000", {
      waitUntil: "domcontentloaded",
    });

    // Wait for hydration
    await page.waitForTimeout(2000);

    // Check if the app layout is being used on any page
    console.log("📋 Checking for mobile navigation patterns...");

    // Look for any hamburger-style icons or mobile menu indicators
    const hamburgerPatterns = [
      '[data-testid="mobile-menu"]',
      'button[aria-label*="menu"]',
      'button[aria-label*="navigation"]',
      'button[aria-label*="toggle"]',
      '[class*="hamburger"]',
      '[class*="menu-button"]',
      'svg[class*="menu"]',
      'svg[class*="bars"]',
    ];

    for (const pattern of hamburgerPatterns) {
      const elements = await page.locator(pattern).count();
      if (elements > 0) {
        console.log(
          `📋 Found ${elements} elements matching pattern: ${pattern}`
        );
        const element = page.locator(pattern).first();
        const visible = await element.isVisible();
        console.log(`   - Visible: ${visible}`);
      }
    }

    // Take screenshot
    await page.screenshot({
      path: "debug-mobile-patterns.png",
      fullPage: true,
    });
  });
});
