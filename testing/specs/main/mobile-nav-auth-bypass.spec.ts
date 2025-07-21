import { test, expect } from "@playwright/test";

test.describe("Mobile Navigation - Authenticated Routes", () => {
  test("mobile nav on dashboard with manual auth bypass", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    console.log("🔐 Testing mobile nav on authenticated route...");

    // Navigate to login first
    await page.goto("http://localhost:3000/login", {
      waitUntil: "domcontentloaded",
    });

    // Fill in login form (we'll bypass actual auth by directly navigating)
    console.log("📋 Attempting to bypass auth...");

    // Option 1: Try to bypass useProtectedRoute by mocking or direct navigation
    await page.addInitScript(() => {
      // Mock localStorage to simulate logged-in user
      localStorage.setItem(
        "auth-user",
        JSON.stringify({
          uid: "test-user",
          email: "test@example.com",
          role: "user",
        })
      );
    });

    // Navigate directly to dashboard
    await page.goto("http://localhost:3000/dashboard", {
      waitUntil: "domcontentloaded",
      timeout: 10000,
    });

    // Wait for potential hydration and auth check
    await page.waitForTimeout(3000);

    console.log("📋 Checking for mobile navigation on dashboard...");

    // Check for the fixed mobile nav container
    const mobileNavContainer = page.locator("div.fixed.top-4.left-4");
    const containerExists = await mobileNavContainer.count();
    console.log(`📋 Mobile nav container: exists=${containerExists > 0}`);

    if (containerExists > 0) {
      const containerVisible = await mobileNavContainer.isVisible();
      console.log(`📋 Mobile nav container visible: ${containerVisible}`);

      // Check for hamburger menu inside
      const hamburger = mobileNavContainer.locator(
        '[data-testid="mobile-menu"]'
      );
      const hamburgerExists = await hamburger.count();
      const hamburgerVisible =
        hamburgerExists > 0 ? await hamburger.isVisible() : false;

      console.log(
        `📋 Hamburger menu: exists=${hamburgerExists > 0}, visible=${hamburgerVisible}`
      );

      if (hamburgerExists > 0 && hamburgerVisible) {
        console.log("🎯 SUCCESS: Mobile navigation found and visible!");

        // Test clicking the hamburger
        await hamburger.click();
        await page.waitForTimeout(1000);

        // Check for drawer
        const drawer = page.locator('[data-testid="drawer"]');
        const drawerVisible = await drawer.isVisible();
        console.log(`📋 Drawer opens: ${drawerVisible}`);
      }
    }

    // Check all buttons to see what's actually there
    const buttons = await page.locator("button").all();
    console.log(`📋 Total buttons on dashboard: ${buttons.length}`);

    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const button = buttons[i];
      const visible = await button.isVisible();
      const text = await button.textContent();
      const testId = await button.getAttribute("data-testid");
      const className = await button.getAttribute("class");

      console.log(
        `📋 Button ${i + 1}: "${text?.slice(0, 20)}" testId="${testId}" visible=${visible}`
      );
      if (className?.includes("md:hidden")) {
        console.log(`   🔍 Mobile-only button found!`);
      }
    }

    // Take screenshot for debugging
    await page.screenshot({
      path: "debug-auth-mobile-nav.png",
      fullPage: true,
    });
  });
});
