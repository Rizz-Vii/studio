import { test, expect } from "@playwright/test";
import { defaultConfig } from "../config/test-config";

// Helper to wait for all network activity and animations to settle
async function waitForStableState(page) {
  await page.waitForLoadState("networkidle");
  // Wait for any CSS animations to complete
  await page.waitForFunction(() => {
    return !document.querySelector(
      '.animate-spin, .animate-pulse, [class*="motion-"]'
    );
  });
  // Additional wait to ensure theme transitions complete
  await page.waitForTimeout(300);
}

// Helper to mask dynamic content
const dynamicContentMask = [
  // Timestamps and dates
  ".timestamp",
  '[data-testid*="date"]',
  // User-specific content
  ".user-email",
  ".user-name",
  // Dynamic metrics/numbers
  ".metric-value",
  ".count",
  // Loading indicators
  ".loading",
  ".spinner",
];

test.describe("Visual Regression Tests", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("public pages maintain visual consistency", async ({ page }) => {
    // Homepage
    await page.goto("/");
    await waitForStableState(page);
    await expect(page).toHaveScreenshot("homepage.png", {
      mask: dynamicContentMask,
      timeout: 5000,
    });

    // Login page
    await page.goto("/login");
    await waitForStableState(page);
    await expect(page).toHaveScreenshot("login.png", {
      mask: dynamicContentMask,
      timeout: 5000,
    });
  });

  test("authenticated pages render correctly", async ({ page }) => {
    // Login
    await page.goto("/login");
    const credentials = defaultConfig.testUsers.standard;
    await page.getByLabel("Email").fill(credentials.email);
    await page.getByLabel("Password").fill(credentials.password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("/dashboard");

    // Dashboard
    await waitForStableState(page);
    await expect(page).toHaveScreenshot("dashboard.png", {
      mask: dynamicContentMask,
      timeout: 5000,
    });

    // Link View
    await page.goto("/link-view");
    await waitForStableState(page);
    await expect(page).toHaveScreenshot("link-view.png", {
      mask: dynamicContentMask,
      timeout: 5000,
    });

    // SERP View
    await page.goto("/serp-view");
    await waitForStableState(page);
    await expect(page).toHaveScreenshot("serp-view.png", {
      mask: dynamicContentMask,
      timeout: 5000,
    });
  });

  test("theme switching works correctly", async ({ page }) => {
    await page.goto("/");

    // Light theme (default)
    await waitForStableState(page);
    await expect(page).toHaveScreenshot("theme-light.png", {
      mask: dynamicContentMask,
      timeout: 5000,
    });

    // Switch to dark theme
    await page.getByRole("button", { name: /toggle theme/i }).click();
    await waitForStableState(page);
    await expect(page).toHaveScreenshot("theme-dark.png", {
      mask: dynamicContentMask,
      timeout: 5000,
    });
  });

  test("responsive design breakpoints", async ({ page }) => {
    await page.goto("/");

    // Desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await waitForStableState(page);
    await expect(page).toHaveScreenshot("responsive-desktop.png", {
      mask: dynamicContentMask,
      timeout: 5000,
    });

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await waitForStableState(page);
    await expect(page).toHaveScreenshot("responsive-tablet.png", {
      mask: dynamicContentMask,
      timeout: 5000,
    });

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await waitForStableState(page);
    await expect(page).toHaveScreenshot("responsive-mobile.png", {
      mask: dynamicContentMask,
      timeout: 5000,
    });
  });
});
