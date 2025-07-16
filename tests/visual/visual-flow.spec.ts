import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login-page";
import { DashboardPage } from "../pages/dashboard-page";
import { validateWithLLM } from "../utils/test-utils";

test.describe("Visual Flows", () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateTo();
    await loginPage.login(
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!
    );
  });

  test("dashboard visual regression", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.navigateTo();
    await dashboard.validateLayout();

    // Take screenshot for visual comparison
    const screenshot = await page.screenshot();

    // Compare with baseline
    expect(screenshot).toMatchSnapshot("dashboard.png", {
      threshold: 0.02, // 2% threshold for differences
    });

    // Extract data for LLM validation
    const stats = await dashboard.extractStats();
    // Convert screenshot buffer to base64 for LLM validation
    const screenshotBase64 = screenshot.toString("base64");
    const validationResult = await validateWithLLM(stats, screenshotBase64);

    expect(validationResult.isValid).toBe(true);
    expect(validationResult.mismatches).toHaveLength(0);
  });
});
