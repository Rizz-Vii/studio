import { test, expect } from "@playwright/test";

test.describe("Mobile Navigation - Authenticated", () => {
  test.use({ storageState: "tests/auth.json" });

  test("mobile nav with authentication", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    // Go to dashboard (authenticated)
    await page.goto("http://localhost:3000/dashboard", {
      waitUntil: "domcontentloaded",
    });

    // Wait for potential hydration and React components to load
    await page.waitForTimeout(4000);

    console.log("🔐 Testing authenticated dashboard...");

    // Debug: Check all buttons on the page
    const buttons = await page.locator("button").all();
    console.log(`📋 Total buttons found: ${buttons.length}`);

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const buttonVisible = await button.isVisible();
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute("aria-label");
      const dataTestId = await button.getAttribute("data-testid");
      const className = await button.getAttribute("class");

      console.log(
        `📋 Button ${i + 1}: visible=${buttonVisible}, text="${text?.slice(0, 20)}...", aria-label="${ariaLabel}", data-testid="${dataTestId}"`
      );
      if (className?.includes("md:hidden")) {
        console.log(`   🔍 Mobile-only button class: ${className}`);
      }
      if (dataTestId === "mobile-menu") {
        console.log(`   🎯 FOUND MOBILE MENU BUTTON!`);
      }
    }

    // Check specifically for mobile menu
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    const exists = await mobileMenu.count();
    const visible = exists > 0 ? await mobileMenu.isVisible() : false;

    console.log(`📋 Mobile menu: exists=${exists > 0}, visible=${visible}`);

    if (exists > 0) {
      const boundingBox = await mobileMenu.boundingBox();
      console.log(`📋 Mobile menu position:`, boundingBox);

      // Try to click it
      console.log(`📋 Attempting to click mobile menu...`);
      await mobileMenu.click();
      await page.waitForTimeout(1000);

      // Check if drawer opened
      const drawer = page.locator('[data-testid="mobile-drawer"]');
      const drawerVisible = await drawer.isVisible();
      console.log(`📋 Mobile drawer visible after click: ${drawerVisible}`);
    }

    // Check for the MobileNav component in DOM
    const mobileNavContainer = page.locator("div.fixed.top-4.left-4");
    const containerExists = await mobileNavContainer.count();
    console.log(`📋 Mobile nav container: exists=${containerExists > 0}`);

    if (containerExists > 0) {
      const containerVisible = await mobileNavContainer.isVisible();
      console.log(`📋 Mobile nav container visible: ${containerVisible}`);
    }

    // Check for any elements with "mobile" in class or data attributes
    const mobileElements = await page
      .locator('[class*="mobile"], [data-*="mobile"]')
      .all();
    console.log(
      `📋 Elements with 'mobile' in attributes: ${mobileElements.length}`
    );

    // Take screenshot for debugging
    await page.screenshot({
      path: "debug-mobile-nav-auth.png",
      fullPage: true,
    });
  });
});
