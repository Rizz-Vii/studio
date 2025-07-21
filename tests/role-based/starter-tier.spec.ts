import { test, expect } from "@playwright/test";
import { TestOrchestrator } from "../utils/test-orchestrator";
import { starterUserFlows } from "../flows/role-based-flows";

test.describe("Starter Tier User Tests", () => {
  // Configure timeouts for sequential flows
  test.setTimeout(120000); // 2 minutes per test

  let orchestrator: TestOrchestrator;

  test.beforeEach(async ({ page }) => {
    orchestrator = new TestOrchestrator(page);

    // Set longer timeouts for complex flows
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(20000);

    console.log("🎭 Starting Starter Tier User Test Suite");
  });

  test.afterEach(async ({ page }) => {
    // Take final screenshot
    await page
      .screenshot({
        path: `test-results/starter-tier-final-${Date.now()}.png`,
        fullPage: true,
      })
      .catch(() => {
        // Ignore screenshot failures
      });

    console.log("🏁 Starter Tier User Test Completed");
  });

  test("Starter User - Complete Dashboard Flow", async ({ page }) => {
    const dashboardFlow = starterUserFlows.find((flow) =>
      flow.name.includes("Dashboard")
    );
    if (!dashboardFlow) {
      throw new Error("Dashboard flow not found for starter users");
    }

    await orchestrator.executeFlow(dashboardFlow);

    // Verify dashboard specific elements for starter tier
    await expect(page.locator("text=Content Analyzer")).toBeVisible();
    await expect(page.locator("text=NeuroSEO Basic")).toBeVisible();
  });

  test("Starter User - Content Analyzer Access", async ({ page }) => {
    const contentAnalyzerFlow = starterUserFlows.find((flow) =>
      flow.name.includes("Content Analyzer")
    );
    if (!contentAnalyzerFlow) {
      throw new Error("Content Analyzer flow not found for starter users");
    }

    await orchestrator.executeFlow(contentAnalyzerFlow);

    // Verify content analyzer functionality
    await expect(
      page.locator('[data-testid="content-analyzer-results"]')
    ).toBeVisible();
  });

  test("Starter User - NeuroSEO Basic Features", async ({ page }) => {
    const neuroSeoFlow = starterUserFlows.find((flow) =>
      flow.name.includes("NeuroSEO Basic")
    );
    if (!neuroSeoFlow) {
      throw new Error("NeuroSEO Basic flow not found for starter users");
    }

    await orchestrator.executeFlow(neuroSeoFlow);

    // Verify NeuroSEO Basic features
    await expect(
      page.locator('[data-testid="neural-crawler-results"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="semantic-map-results"]')
    ).toBeVisible();
  });

  test("Starter User - Access Restrictions", async ({ page }) => {
    // Login as starter user
    await orchestrator.userManager.loginAs("starter");

    // Try to access agency-only feature
    await page.goto("/competitors");

    // Should be redirected or see upgrade prompt
    await expect(
      page.locator("text=/upgrade|premium|subscribe/i")
    ).toBeVisible();

    // Try to access enterprise-only feature
    await page.goto("/unlimited-neuroseo");

    // Should be redirected or see upgrade prompt
    await expect(
      page.locator("text=/upgrade|premium|subscribe/i")
    ).toBeVisible();
  });
});
