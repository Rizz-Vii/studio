import { test, expect, Page } from "@playwright/test";

/**
 * Helper function to log in the user.
 * This centralizes the login logic for authenticated visual tests.
 * @param page The Playwright Page object.
 */
const login = async (page: Page) => {
  await page.goto("/login");
  await page
    .locator('[data-testid="email-input"]')
    .fill("test-agency@example.com");
  await page.locator('[data-testid="password-input"]').fill("testPassword123");
  await page.locator('[data-testid="login-button"]').click();
  // Wait for the dashboard URL to ensure login was successful and page has loaded
  await page.waitForURL("**/dashboard", { waitUntil: "networkidle" });
};

test.describe("Visual Regression Tests", () => {
  // Note: On the first run, Playwright will generate baseline screenshots.
  // Subsequent runs will compare against these baselines.
  // To update baselines, run tests with the --update-snapshots flag.

  const screenshotOptions = {
    fullPage: true,
    maxDiffPixels: 100, // Allow for minor anti-aliasing differences
  };

  // Test key public pages
  const publicPages = [
    { name: "home-page", path: "/" },
    { name: "login-page", path: "/login" },
    { name: "signup-page", path: "/signup" },
    { name: "pricing-page", path: "/pricing" },
  ];

  for (const pageInfo of publicPages) {
    test(`should match snapshot for public page: ${pageInfo.name}`, async ({
      page,
    }) => {
      await page.goto(pageInfo.path, { waitUntil: "networkidle" });
      await expect(page).toHaveScreenshot(
        `${pageInfo.name}.png`,
        screenshotOptions
      );
    });
  }

  // Test key authenticated pages
  const authenticatedPages = [
    { name: "dashboard-page", path: "/dashboard" },
    { name: "neuroseo-page", path: "/neuroseo" },
    { name: "account-page", path: "/account" },
  ];

  for (const pageInfo of authenticatedPages) {
    test(`should match snapshot for authenticated page: ${pageInfo.name}`, async ({
      page,
    }) => {
      await login(page);
      // If the page is not the dashboard, navigate to it after login
      if (pageInfo.path !== "/dashboard") {
        await page.goto(pageInfo.path, { waitUntil: "networkidle" });
      }
      await expect(page).toHaveScreenshot(
        `${pageInfo.name}.png`,
        screenshotOptions
      );
    });
  }

  // Test responsive layouts for key pages
  test.describe("Responsive Layouts", () => {
    const viewports = [
      { name: "mobile", width: 390, height: 844 },
      { name: "tablet", width: 768, height: 1024 },
    ];

    for (const viewport of viewports) {
      test(`should match home page snapshot on ${viewport.name}`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport);
        await page.goto("/", { waitUntil: "networkidle" });
        await expect(page).toHaveScreenshot(
          `home-page-${viewport.name}.png`,
          screenshotOptions
        );
      });

      test(`should match dashboard snapshot on ${viewport.name}`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport);
        await login(page);
        await expect(page).toHaveScreenshot(
          `dashboard-page-${viewport.name}.png`,
          screenshotOptions
        );
      });
    }
  });

  // Test specific component states
  test.describe("Component States", () => {
    test("should match snapshot for login form", async ({ page }) => {
      await page.goto("/login");
      const form = page.locator("form");
      await expect(form).toHaveScreenshot("login-form.png");
    });

    test("should match snapshot for button hover state on dashboard", async ({
      page,
    }) => {
      await login(page);
      const button = page.locator('button, [role="button"]').first();
      await button.hover();
      await page.waitForTimeout(300); // Wait for hover effect to render
      await expect(button).toHaveScreenshot("button-hover.png");
    });

    test("should match snapshot for main navigation on dashboard", async ({
      page,
    }) => {
      await login(page);
      const nav = page.locator('[data-testid="main-navigation"]');
      await expect(nav).toHaveScreenshot("main-navigation.png");
    });
  });
});
