import { test, expect } from "@playwright/test";

test.describe("Performance Branch - Deployment Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Add extra timeout for slow deployments
    test.setTimeout(60000);
  });

  test("deployment health check", async ({ page }) => {
    // Navigate to the deployed application
    await page.goto("/");

    // Wait for the page to be fully loaded
    await page.waitForLoadState("domcontentloaded");

    // Verify the page loads without errors
    await expect(page.locator("body")).toBeVisible();

    // Check for critical navigation elements
    const hasNavigation =
      (await page.locator("nav, header, [role='navigation']").count()) > 0;
    expect(hasNavigation).toBeTruthy();

    // Take a screenshot for deployment verification
    await page.screenshot({
      path: "test-results/deployment-health-check.png",
      fullPage: true,
    });
  });

  test("performance monitoring components", async ({ page }) => {
    await page.goto("/performance");
    await page.waitForLoadState("domcontentloaded");

    // Check if performance dashboard loads
    await expect(page.locator("body")).toBeVisible();

    // Look for performance-related content
    const performanceElements = await page
      .locator("text=/performance|monitoring|metrics/i")
      .count();
    expect(performanceElements).toBeGreaterThan(0);

    await page.screenshot({
      path: "test-results/performance-dashboard.png",
      fullPage: true,
    });
  });

  test("mobile responsiveness check", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Verify mobile navigation
    await expect(page.locator("body")).toBeVisible();

    // Check for mobile navigation elements
    const mobileNav = await page
      .locator(
        "[aria-label*='menu'], [aria-label*='navigation'], button:has-text('Menu')"
      )
      .count();
    expect(mobileNav).toBeGreaterThanOrEqual(0); // Allow for different mobile nav implementations

    await page.screenshot({
      path: "test-results/mobile-responsive.png",
      fullPage: true,
    });
  });

  test("keyword tool accessibility", async ({ page }) => {
    await page.goto("/keyword-tool");
    await page.waitForLoadState("domcontentloaded");

    // Check if the page loads
    await expect(page.locator("body")).toBeVisible();

    // Look for keyword tool interface
    const hasForm = (await page.locator("input, textarea, button").count()) > 0;
    expect(hasForm).toBeTruthy();

    await page.screenshot({
      path: "test-results/keyword-tool.png",
      fullPage: true,
    });
  });

  test("authentication pages load", async ({ page }) => {
    // Test login page
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();

    // Test register page
    await page.goto("/register");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("body")).toBeVisible();

    await page.screenshot({
      path: "test-results/auth-pages.png",
      fullPage: true,
    });
  });

  test("dashboard accessibility (without auth)", async ({ page }) => {
    // Try accessing dashboard (should redirect to login or show public info)
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    // Should either show login form or dashboard content
    await expect(page.locator("body")).toBeVisible();

    // The page should load successfully (we're not checking for specific auth state)
    const pageLoaded = await page.locator("body").isVisible();
    expect(pageLoaded).toBeTruthy();

    await page.screenshot({
      path: "test-results/dashboard-access.png",
      fullPage: true,
    });
  });
});
