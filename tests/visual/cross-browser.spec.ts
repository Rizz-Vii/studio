import { test, expect } from "@playwright/test";
import { LinkViewPage } from "../pages/link-view-page";
import { randomDelay } from "../utils/test-utils";

test.describe("Cross-browser Visual Tests", () => {
  let linkView: LinkViewPage;

  test.beforeEach(async ({ page }) => {
    linkView = new LinkViewPage(page);
    await randomDelay();
  });

  test("link analysis form layout", async ({ page }) => {
    await linkView.navigateTo("/link-view");

    // Mask dynamic elements
    await page.evaluate(() => {
      const timestamp = document.querySelector('[data-testid="timestamp"]');
      if (timestamp) timestamp.innerHTML = "TIMESTAMP";
    });

    await expect(page).toHaveScreenshot("link-analysis-form.png", {
      mask: [
        page.locator('[data-testid="user-avatar"]'),
        page.locator('[data-testid="notification-badge"]'),
      ],
      animations: "disabled",
    });
  });

  test("analysis results visualization", async ({ page, browserName }) => {
    await linkView.navigateTo("/link-view");
    await linkView.analyzeDomain("https://example.com");

    // Wait for all charts to render
    await page.waitForSelector('[data-testid="chart-container"] canvas');
    await page.waitForLoadState("networkidle");

    // Normalize dynamic content
    await page.evaluate(() => {
      const dates = document.querySelectorAll('[data-testid="date-field"]');
      dates.forEach((date) => (date.innerHTML = "DATE"));
    });

    // Take screenshot with browser-specific name
    await expect(page).toHaveScreenshot(`analysis-results-${browserName}.png`, {
      mask: [page.locator('[data-testid="realtime-updates"]')],
      animations: "disabled",
      threshold: 0.2,
    });
  });

  test("form validation styling", async ({ page, browserName }) => {
    await linkView.navigateTo("/link-view");

    // Trigger form errors
    await linkView.analyzeButton.click();

    // Wait for error styles to apply
    await page.waitForSelector('[aria-invalid="true"]');

    await expect(page).toHaveScreenshot(`form-validation-${browserName}.png`, {
      animations: "disabled",
    });
  });

  test("dark mode appearance", async ({ page, browserName }) => {
    await linkView.navigateTo("/link-view");

    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });

    await randomDelay();

    // Capture dark mode layout
    await expect(page).toHaveScreenshot(`dark-mode-${browserName}.png`, {
      animations: "disabled",
      threshold: 0.2,
    });
  });

  test("loading state visualization", async ({ page, browserName }) => {
    await linkView.navigateTo("/link-view");

    // Slow down API response
    await page.route("**/api/analyze-link", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });

    // Trigger loading state
    await linkView.analyzeDomain("https://example.com");

    // Capture loading state
    await expect(page).toHaveScreenshot(`loading-state-${browserName}.png`, {
      animations: "disabled",
    });
  });

  test("responsive breakpoint layouts", async ({ page, browserName }) => {
    const breakpoints = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1280, height: 720, name: "desktop" },
    ];

    for (const bp of breakpoints) {
      await page.setViewportSize(bp);
      await linkView.navigateTo("/link-view");
      await randomDelay();

      await expect(page).toHaveScreenshot(
        `responsive-${bp.name}-${browserName}.png`,
        {
          animations: "disabled",
          threshold: 0.2,
        }
      );
    }
  });
});
