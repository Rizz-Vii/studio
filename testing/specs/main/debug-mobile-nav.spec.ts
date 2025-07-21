import { test, expect } from "@playwright/test";

test.describe("Mobile Navigation Debug", () => {
  test("debug mobile nav rendering", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    // First try the home page (no auth required)
    await page.goto("http://localhost:3000", {
      waitUntil: "domcontentloaded",
    });

    // Wait for potential hydration
    await page.waitForTimeout(3000);

    console.log("🏠 Testing home page first...");

    // Debug: Check all buttons on the page
    const buttons = await page.locator("button").all();
    console.log(`📋 Total buttons found on home: ${buttons.length}`);

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const buttonVisible = await button.isVisible();
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute("aria-label");
      const dataTestId = await button.getAttribute("data-testid");
      const className = await button.getAttribute("class");

      console.log(
        `📋 Button ${i + 1}: visible=${buttonVisible}, text="${text}", aria-label="${ariaLabel}", data-testid="${dataTestId}"`
      );
      if (className?.includes("md:hidden")) {
        console.log(`   🔍 Mobile-only button class: ${className}`);
      }
    }

    // Check specifically for mobile menu
    const mobileMenuHome = page.locator('[data-testid="mobile-menu"]');
    const homeExists = await mobileMenuHome.count();
    const homeVisible =
      homeExists > 0 ? await mobileMenuHome.isVisible() : false;

    console.log(
      `📋 Mobile menu on home: exists=${homeExists > 0}, visible=${homeVisible}`
    );

    // Check for the MobileNav component in DOM
    const mobileNavContainer = page.locator("div.fixed.top-4.left-4");
    const containerExists = await mobileNavContainer.count();
    console.log(
      `📋 Mobile nav container on home: exists=${containerExists > 0}`
    );

    // Take screenshot for debugging
    await page.screenshot({
      path: "debug-mobile-nav-home.png",
      fullPage: true,
    });
  });
});
