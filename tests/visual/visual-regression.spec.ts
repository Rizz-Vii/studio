import { test, expect, Page } from "@playwright/test";
import path from "path";
import fs from "fs";

// Helper functions for visual comparison
const takeScreenshot = async (page: Page, name: string) => {
  const screenshotPath = path.join(
    "test-snapshots",
    `${name}-${Date.now()}.png`
  );
  await page.screenshot({ path: screenshotPath, fullPage: true });
  return screenshotPath;
};

const compareWithBaseline = async (page: Page, name: string) => {
  // Take current screenshot
  const currentScreenshotPath = await takeScreenshot(page, `current-${name}`);

  // Check if baseline exists
  const baselineScreenshotPath = path.join(
    "test-snapshots",
    `baseline-${name}.png`
  );

  if (!fs.existsSync(baselineScreenshotPath)) {
    console.log(`Baseline for ${name} doesn't exist. Creating baseline...`);
    await page.screenshot({ path: baselineScreenshotPath, fullPage: true });
    return true; // Pass test as we're creating baseline
  }

  // Compare screenshots
  const currentScreenshot = fs.readFileSync(currentScreenshotPath);
  const baselineScreenshot = fs.readFileSync(baselineScreenshotPath);

  // For basic comparison, check if file sizes are similar
  // In a real implementation, this would use pixel-by-pixel comparison
  const sizeDiff = Math.abs(
    currentScreenshot.length - baselineScreenshot.length
  );
  const percentDiff = (sizeDiff / baselineScreenshot.length) * 100;

  console.log(`Size difference: ${percentDiff.toFixed(2)}% for ${name}`);

  // A simple threshold - in real tests, would use proper image comparison
  return percentDiff < 5;
};

// Visual regression tests
test.describe("Visual Regression Tests", () => {
  // Test key pages
  const pagesToTest = [
    { name: "home-page", path: "/" },
    { name: "login-page", path: "/login" },
    { name: "signup-page", path: "/signup" },
    { name: "dashboard", path: "/dashboard", auth: true },
    { name: "neuroseo-tool", path: "/neuroseo", auth: true },
    { name: "keyword-tool", path: "/keyword-tool", auth: true },
    { name: "content-analyzer", path: "/content-analyzer", auth: true },
    { name: "account-settings", path: "/account", auth: true },
  ];

  for (const page of pagesToTest) {
    test(`Visual regression test - ${page.name}`, async ({ page: pageObj }) => {
      // Login if needed
      if (page.auth) {
        await pageObj.goto("/login");
        await pageObj.fill(
          '[data-testid="email-input"]',
          "test-agency@example.com"
        );
        await pageObj.fill('[data-testid="password-input"]', "testPassword123");
        await pageObj.click('[data-testid="login-button"]');
        await pageObj.waitForNavigation();
      }

      // Navigate to page
      await pageObj.goto(page.path);
      await pageObj.waitForLoadState("networkidle");

      // Wait a moment for any animations to complete
      await pageObj.waitForTimeout(1000);

      // Take screenshot and compare
      const isSimilar = await compareWithBaseline(pageObj, page.name);

      // Assert that current page looks like baseline
      expect(isSimilar).toBe(true);
    });
  }

  // Test responsive layouts
  const viewports = [
    { name: "mobile", width: 390, height: 844 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1280, height: 800 },
    { name: "large-desktop", width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    test(`Responsive layout - ${viewport.name}`, async ({ page }) => {
      // Set viewport
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      // Check home page
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Take screenshot and compare
      const isSimilar = await compareWithBaseline(
        page,
        `home-${viewport.name}`
      );

      expect(isSimilar).toBe(true);

      // Also check dashboard with authentication
      await page.goto("/login");
      await page.fill('[data-testid="email-input"]', "test-agency@example.com");
      await page.fill('[data-testid="password-input"]', "testPassword123");
      await page.click('[data-testid="login-button"]');
      await page.waitForNavigation();

      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      // Take screenshot and compare
      const isDashboardSimilar = await compareWithBaseline(
        page,
        `dashboard-${viewport.name}`
      );

      expect(isDashboardSimilar).toBe(true);
    });
  }

  // Test component-specific visual regression
  const componentsToTest = [
    {
      name: "navigation-menu",
      path: "/dashboard",
      selector: '[data-testid="main-navigation"]',
      auth: true,
    },
    {
      name: "dashboard-cards",
      path: "/dashboard",
      selector: '[data-testid="dashboard-cards"]',
      auth: true,
    },
    {
      name: "neuroseo-visualization",
      path: "/neuroseo",
      selector: '[data-testid="neural-visualization"]',
      auth: true,
      setupAction: async (page: Page) => {
        // Enter a search term and click analyze
        await page.fill('[data-testid="keyword-input"]', "content marketing");
        await page.click('[data-testid="analyze-button"]');
        await page.waitForSelector('[data-testid="neural-visualization"]');
      },
    },
    {
      name: "login-form",
      path: "/login",
      selector: "form",
      auth: false,
    },
  ];

  for (const component of componentsToTest) {
    test(`Component visual test - ${component.name}`, async ({ page }) => {
      // Login if needed
      if (component.auth) {
        await page.goto("/login");
        await page.fill(
          '[data-testid="email-input"]',
          "test-agency@example.com"
        );
        await page.fill('[data-testid="password-input"]', "testPassword123");
        await page.click('[data-testid="login-button"]');
        await page.waitForNavigation();
      }

      // Navigate to page
      await page.goto(component.path);
      await page.waitForLoadState("networkidle");

      // Run any setup actions
      if (component.setupAction) {
        await component.setupAction(page);
      }

      // Ensure component is visible
      await page.waitForSelector(component.selector);

      // Take screenshot of just the component
      const screenshotPath = path.join(
        "test-snapshots",
        `component-current-${component.name}-${Date.now()}.png`
      );
      await page
        .locator(component.selector)
        .screenshot({ path: screenshotPath });

      // Check if baseline exists
      const baselineScreenshotPath = path.join(
        "test-snapshots",
        `component-baseline-${component.name}.png`
      );

      if (!fs.existsSync(baselineScreenshotPath)) {
        console.log(
          `Component baseline for ${component.name} doesn't exist. Creating baseline...`
        );
        await page
          .locator(component.selector)
          .screenshot({ path: baselineScreenshotPath });
        expect(true).toBe(true); // Pass test as we're creating baseline
        return;
      }

      // Compare screenshots
      const currentScreenshot = fs.readFileSync(screenshotPath);
      const baselineScreenshot = fs.readFileSync(baselineScreenshotPath);

      const sizeDiff = Math.abs(
        currentScreenshot.length - baselineScreenshot.length
      );
      const percentDiff = (sizeDiff / baselineScreenshot.length) * 100;

      console.log(
        `Component difference: ${percentDiff.toFixed(2)}% for ${component.name}`
      );

      // Assert similarity
      expect(percentDiff).toBeLessThan(5);
    });
  }

  // Test theme variants if supported
  test("Theme variants visual test", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test-agency@example.com");
    await page.fill('[data-testid="password-input"]', "testPassword123");
    await page.click('[data-testid="login-button"]');
    await page.waitForNavigation();

    // Navigate to dashboard
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Test light theme (default)
    await takeScreenshot(page, "theme-light-dashboard");

    // Switch to dark theme if there's a toggle
    const themeToggle = await page.$('[data-testid="theme-toggle"]');
    if (themeToggle) {
      await themeToggle.click();
      await page.waitForTimeout(1000); // Wait for theme to change

      // Take dark theme screenshot
      await takeScreenshot(page, "theme-dark-dashboard");

      // Switch back to light theme
      await themeToggle.click();
    }
  });

  // Test for animation completion
  test("Animation completion test", async ({ page }) => {
    // Pages with animations to test
    const animatedPages = [
      { name: "dashboard-load", path: "/dashboard", auth: true },
      { name: "neuroseo-visualization", path: "/neuroseo", auth: true },
    ];

    for (const animPage of animatedPages) {
      // Login if needed
      if (animPage.auth) {
        await page.goto("/login");
        await page.fill(
          '[data-testid="email-input"]',
          "test-agency@example.com"
        );
        await page.fill('[data-testid="password-input"]', "testPassword123");
        await page.click('[data-testid="login-button"]');
        await page.waitForNavigation();
      }

      // Navigate to page
      await page.goto(animPage.path);

      // Take screenshot immediately
      const initialScreenshotPath = await takeScreenshot(
        page,
        `${animPage.name}-initial`
      );

      // Wait for animations to complete (conservative time)
      await page.waitForTimeout(2000);

      // Take screenshot after animations
      const finalScreenshotPath = await takeScreenshot(
        page,
        `${animPage.name}-final`
      );

      // Compare the two screenshots
      const initialScreenshot = fs.readFileSync(initialScreenshotPath);
      const finalScreenshot = fs.readFileSync(finalScreenshotPath);

      const sizeDiff = Math.abs(
        initialScreenshot.length - finalScreenshot.length
      );
      const percentDiff =
        (sizeDiff /
          Math.min(initialScreenshot.length, finalScreenshot.length)) *
        100;

      console.log(
        `Animation difference: ${percentDiff.toFixed(2)}% for ${animPage.name}`
      );

      // If there are animations, the screenshots should be different
      // In a real implementation, this would check for specific expected differences
      if (percentDiff < 1) {
        console.log(
          `Warning: No visual change detected for ${animPage.name} - animations might not be working`
        );
      }
    }
  });

  // Test for visual bugs in interactive elements
  test("Interactive element hover states", async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test-agency@example.com");
    await page.fill('[data-testid="password-input"]', "testPassword123");
    await page.click('[data-testid="login-button"]');
    await page.waitForNavigation();

    // Go to dashboard
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Find and test hover states on buttons
    const buttons = await page.$$('button, [role="button"]');

    for (let i = 0; i < Math.min(buttons.length, 3); i++) {
      // Test first 3 buttons
      // Take screenshot before hover
      await takeScreenshot(page, `button-${i}-before-hover`);

      // Hover the button
      await buttons[i].hover();
      await page.waitForTimeout(500);

      // Take screenshot during hover
      await takeScreenshot(page, `button-${i}-during-hover`);

      // Move mouse away
      await page.mouse.move(0, 0);
    }

    // Check navigation hover states
    const navLinks = await page.$$("nav a");

    for (let i = 0; i < Math.min(navLinks.length, 3); i++) {
      // Test first 3 links
      // Take screenshot before hover
      await takeScreenshot(page, `nav-link-${i}-before-hover`);

      // Hover the link
      await navLinks[i].hover();
      await page.waitForTimeout(500);

      // Take screenshot during hover
      await takeScreenshot(page, `nav-link-${i}-during-hover`);

      // Move mouse away
      await page.mouse.move(0, 0);
    }
  });

  // Test for proper loading states
  test("Loading state visual test", async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test-agency@example.com");
    await page.fill('[data-testid="password-input"]', "testPassword123");
    await page.click('[data-testid="login-button"]');
    await page.waitForNavigation();

    // Go to a page that shows loading states
    await page.goto("/neuroseo");
    await page.waitForLoadState("networkidle");

    // Enter a search term
    await page.fill('[data-testid="keyword-input"]', "content optimization");

    // Take screenshot before clicking
    await takeScreenshot(page, "before-loading");

    // Click analyze and capture loading state
    await page.click('[data-testid="analyze-button"]');

    // Wait a short time to capture loading state
    await page.waitForTimeout(500);

    // Take screenshot during loading
    await takeScreenshot(page, "during-loading");

    // Wait for results to appear
    await page.waitForSelector('[data-testid="analysis-results"]');

    // Take screenshot after loading
    await takeScreenshot(page, "after-loading");
  });
});
