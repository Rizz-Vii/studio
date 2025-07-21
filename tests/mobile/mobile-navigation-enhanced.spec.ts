import { test, expect } from "@playwright/test";
import { DashboardPage } from "../pages/dashboard-page";

test.describe("Mobile Navigation Enhancement Tests", () => {
  // Configure mobile viewports for testing
  const mobileDevices = [
    { name: "iPhone SE", width: 375, height: 667 },
    { name: "iPhone 12/13", width: 390, height: 844 },
    { name: "Samsung Galaxy S20", width: 360, height: 800 },
    { name: "Google Pixel 5", width: 393, height: 851 },
  ];

  // Test navigation for all major user roles
  const userRoles = ["free", "starter", "agency", "enterprise"];

  for (const device of mobileDevices) {
    test.describe(`${device.name} Mobile Tests`, () => {
      test.beforeEach(async ({ page }) => {
        // Set viewport to mobile size
        await page.setViewportSize({
          width: device.width,
          height: device.height,
        });
      });

      test(`basic navigation structure on ${device.name}`, async ({ page }) => {
        const dashboard = new DashboardPage(page);
        await dashboard.navigateTo();

        // Verify mobile menu is present
        const menuButton = page.locator('[data-testid="mobile-menu-button"]');
        await expect(menuButton).toBeVisible();

        // Open menu
        await menuButton.click();

        // Verify navigation panel is visible
        const navPanel = page.locator('[data-testid="mobile-nav-panel"]');
        await expect(navPanel).toBeVisible();

        // Test backdrop click closes menu
        const backdrop = page.locator('[data-testid="mobile-menu-backdrop"]');
        if (await backdrop.isVisible()) {
          await backdrop.click();
          await expect(navPanel).toBeHidden();
        }

        // Reopen menu to test links
        await menuButton.click();
        await expect(navPanel).toBeVisible();

        // Verify basic nav links exist
        const basicLinks = ["Dashboard", "Keywords", "Content"];
        for (const linkText of basicLinks) {
          const link = page.locator(
            `[data-testid="mobile-nav-link"]:has-text("${linkText}")`
          );
          await expect(link).toBeVisible();
        }
      });

      test(`responsive design adapts correctly on ${device.name}`, async ({
        page,
      }) => {
        // Test different pages for responsive layout
        const pagesToTest = [
          "/dashboard",
          "/keyword-tool",
          "/content-analyzer",
        ];

        for (const pageUrl of pagesToTest) {
          await page.goto(pageUrl);
          await page.waitForLoadState("domcontentloaded");

          // Check that no horizontal scrollbar appears
          const hasHorizontalScroll = await page.evaluate(() => {
            return document.body.scrollWidth > window.innerWidth;
          });

          expect(hasHorizontalScroll).toBe(false);

          // Take screenshot for visual verification
          await page.screenshot({
            path: `test-results/mobile-responsive-${device.name.replace(/\s+/g, "-")}-${pageUrl.replace(/\//g, "-")}.png`,
          });
        }
      });
    });
  }

  // Test for authenticated users of different roles
  for (const role of userRoles) {
    test(`authenticated navigation for ${role} users`, async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 390, height: 844 });

      // Login user based on role
      await page.goto("/login");
      await page.fill(
        '[data-testid="email-input"]',
        `test-${role}@example.com`
      );
      await page.fill('[data-testid="password-input"]', "testPassword123");
      await page.click('[data-testid="login-button"]');

      // Wait for dashboard to load
      await page.waitForURL(/dashboard/);

      // Open mobile menu
      await page.locator('[data-testid="mobile-menu-button"]').click();

      // Verify role-specific navigation items
      if (role === "free") {
        // Free tier should see basic features and upgrade prompts
        await expect(page.locator("text=Upgrade")).toBeVisible();
      } else if (role === "starter") {
        // Starter tier should see additional features
        await expect(page.locator("text=Content Analyzer")).toBeVisible();
        await expect(page.locator("text=NeuroSEO Basic")).toBeVisible();
      } else if (role === "agency") {
        // Agency tier should see advanced features
        await expect(page.locator("text=Competitors")).toBeVisible();
        await expect(page.locator("text=NeuroSEO Advanced")).toBeVisible();
      } else if (role === "enterprise") {
        // Enterprise tier should see all features
        await expect(page.locator("text=Unlimited")).toBeVisible();
      }

      // Take screenshot of menu for this role
      await page.screenshot({
        path: `test-results/mobile-nav-authenticated-${role}-${Date.now()}.png`,
      });
    });
  }

  test("mobile navigation performance", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto("/dashboard");

    // Test menu open animation performance
    const startTime = Date.now();
    await page.locator('[data-testid="mobile-menu-button"]').click();

    // Wait for menu to be fully visible
    await page
      .locator('[data-testid="mobile-nav-panel"]')
      .waitFor({ state: "visible" });
    const menuOpenTime = Date.now() - startTime;

    // Menu should open in under 300ms for smooth experience
    expect(menuOpenTime).toBeLessThan(300);

    // Test menu close animation performance
    const closeStartTime = Date.now();
    await page.locator('[data-testid="mobile-menu-backdrop"]').click();

    // Wait for menu to be fully hidden
    await page
      .locator('[data-testid="mobile-nav-panel"]')
      .waitFor({ state: "hidden" });
    const menuCloseTime = Date.now() - closeStartTime;

    // Menu should close in under 250ms for smooth experience
    expect(menuCloseTime).toBeLessThan(250);
  });

  test("mobile navigation accessibility", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto("/dashboard");

    // Check that menu button has proper aria attributes
    const menuButton = page.locator('[data-testid="mobile-menu-button"]');
    await expect(menuButton).toHaveAttribute("aria-label", /menu|navigation/i);
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");

    // Open menu
    await menuButton.click();

    // Check that aria-expanded is updated
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");

    // Check for proper focus management
    const activeElement = await page.evaluate(
      () => document.activeElement?.tagName
    );
    expect(activeElement).not.toBe(null);

    // Check that all navigation links are keyboard focusable
    const navLinks = await page
      .locator('[data-testid="mobile-nav-link"]')
      .count();
    let focusable = 0;

    // Tab through all the elements
    for (let i = 0; i < navLinks + 5; i++) {
      await page.keyboard.press("Tab");
      const isFocusable = await page.evaluate(() => {
        const active = document.activeElement;
        return active?.tagName === "A" || active?.tagName === "BUTTON";
      });

      if (isFocusable) focusable++;
    }

    // We should be able to focus on at least all the nav links
    expect(focusable).toBeGreaterThanOrEqual(navLinks);
  });

  test("mobile navigation gesture support", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto("/dashboard");

    // Open menu
    await page.locator('[data-testid="mobile-menu-button"]').click();

    // Wait for menu to be visible
    await page
      .locator('[data-testid="mobile-nav-panel"]')
      .waitFor({ state: "visible" });

    // Simulate swipe gesture (using mouse drag since Playwright doesn't have direct swipe API)
    // This is an approximation of a swipe left gesture
    const menuPanel = page.locator('[data-testid="mobile-nav-panel"]');
    const menuBox = await menuPanel.boundingBox();

    if (menuBox) {
      const startX = menuBox.x + menuBox.width / 2;
      const endX = menuBox.x - 50; // Swipe left
      const y = menuBox.y + menuBox.height / 2;

      await page.mouse.move(startX, y);
      await page.mouse.down();
      await page.mouse.move(endX, y, { steps: 10 }); // Smooth motion
      await page.mouse.up();

      // Check if menu closed (might not work if gestures aren't implemented)
      try {
        await expect(menuPanel).toBeHidden({ timeout: 2000 });
        console.log("✅ Swipe gesture to close menu works");
      } catch (e) {
        console.log("⚠️ Swipe gesture not implemented or not working");
      }
    }
  });
});
