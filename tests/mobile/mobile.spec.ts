import { test, expect } from "@playwright/test";
import { LinkViewPage } from "../pages/link-view-page";
import { randomDelay } from "../utils/test-utils";

test.describe("Mobile-specific Tests", () => {
  let linkView: LinkViewPage;

  test.beforeEach(async ({ page }) => {
    linkView = new LinkViewPage(page);
  });

  test("responsive navigation menu", async ({ page }) => {
    await linkView.navigateTo("/link-view");

    // Check if hamburger menu exists on mobile
    const menuButton = page.locator('[data-testid="mobile-menu-button"]');
    await expect(menuButton).toBeVisible();

    // Test menu interaction
    await menuButton.click();
    const nav = page.locator('nav[role="navigation"]');
    await expect(nav).toBeVisible();

    // Verify menu closes on backdrop click
    await page.locator('[data-testid="menu-backdrop"]').click();
    await expect(nav).toBeHidden();
  });

  test("touch interactions on link analysis", async ({ page }) => {
    await linkView.navigateTo("/link-view");

    // Test touch-based form interactions
    await linkView.linkInput.tap();
    await linkView.linkInput.fill("https://example.com");
    await linkView.analyzeButton.tap();

    await linkView.waitForLoadingComplete();
    await expect(linkView.resultsContainer).toBeVisible();
  });

  test("pinch-to-zoom on charts", async ({ page }) => {
    await linkView.navigateTo("/link-view");
    await linkView.analyzeDomain("https://example.com");

    const chart = page.locator('[data-testid="metrics-chart"]');
    await expect(chart).toBeVisible();

    // Verify chart supports touch gestures
    await expect(chart).toHaveAttribute(
      "style",
      /.*touch-action: pinch-zoom.*/
    );
  });

  test("swipe navigation in results", async ({ page }) => {
    await linkView.navigateTo("/link-view");
    await linkView.analyzeDomain("https://example.com");

    const resultsContainer = linkView.resultsContainer;

    // Test horizontal swipe between result tabs
    await page.touchscreen.tap(100, 200); // Start position
    await page.mouse.move(300, 200); // End position

    // Verify tab change
    await expect(page.locator('[data-testid="active-tab"]')).toHaveText(
      "Backlinks"
    );
  });

  test("mobile-friendly error messages", async ({ page }) => {
    await linkView.navigateTo("/link-view");

    // Submit invalid URL
    await linkView.analyzeDomain("invalid-url");

    // Check error message visibility and positioning
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();

    // Verify error message is positioned properly on mobile
    const position = await errorMessage.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return {
        top: rect.top,
        left: rect.left,
        width: rect.width,
      };
    });

    // Should be full width on mobile
    expect(position.left).toBe(0);
    expect(position.width).toBe(page.viewportSize()?.width);
  });

  test("offline mode functionality", async ({ page, context }) => {
    await linkView.navigateTo("/link-view");
    await linkView.analyzeDomain("https://example.com");

    // Simulate offline mode
    await context.setOffline(true);

    // Verify offline UI elements
    const offlineMessage = page.locator('[data-testid="offline-message"]');
    await expect(offlineMessage).toBeVisible();

    // Check cached data is still accessible
    await expect(linkView.resultsContainer).toBeVisible();

    // Return to online mode
    await context.setOffline(false);
    await randomDelay();

    // Verify return to normal operation
    await expect(offlineMessage).toBeHidden();
  });
});
