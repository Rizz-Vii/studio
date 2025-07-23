import { test, expect } from "@playwright/test";
import { TestOrchestrator } from "../utils/test-orchestrator";
import { agencyUserFlows } from "../flows/role-based-flows";

test.describe("Agency Tier User Tests", () => {
  // Configure timeouts for sequential flows
  test.setTimeout(120000); // 2 minutes per test

  let orchestrator: TestOrchestrator;

  test.beforeEach(async ({ page }) => {
    orchestrator = new TestOrchestrator(page);

    // Set longer timeouts for complex flows
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(20000);

    console.log("🎭 Starting Agency Tier User Test Suite");
  });

  test.afterEach(async ({ page }) => {
    // Take final screenshot
    await page
      .screenshot({
        path: `test-results/agency-tier-final-${Date.now()}.png`,
        fullPage: true,
      })
      .catch(() => {
        // Ignore screenshot failures
      });

    console.log("🏁 Agency Tier User Test Completed");
  });

  test("Agency User - Dashboard Advanced Features", async ({ page }) => {
    const dashboardFlow = agencyUserFlows.find((flow) =>
      flow.name.includes("Dashboard")
    );
    if (!dashboardFlow) {
      throw new Error("Dashboard flow not found for agency users");
    }

    await orchestrator.executeFlow(dashboardFlow);

    // Verify agency-specific dashboard elements
    await expect(page.locator("text=Competitors")).toBeVisible();
    await expect(page.locator("text=NeuroSEO Advanced")).toBeVisible();
  });

  test("Agency User - Competitors Analysis Access", async ({ page }) => {
    const competitorsFlow = agencyUserFlows.find((flow) =>
      flow.name.includes("Competitors")
    );
    if (!competitorsFlow) {
      throw new Error("Competitors flow not found for agency users");
    }

    await orchestrator.executeFlow(competitorsFlow);

    // Verify competitors analysis functionality
    await expect(
      page.locator('[data-testid="competitors-analysis-results"]')
    ).toBeVisible();
  });

  test("Agency User - NeuroSEO Advanced Features", async ({ page }) => {
    const neuroSeoAdvancedFlow = agencyUserFlows.find((flow) =>
      flow.name.includes("NeuroSEO Advanced")
    );
    if (!neuroSeoAdvancedFlow) {
      throw new Error("NeuroSEO Advanced flow not found for agency users");
    }

    await orchestrator.executeFlow(neuroSeoAdvancedFlow);

    // Verify NeuroSEO Advanced features
    await expect(
      page.locator('[data-testid="neural-crawler-results"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="semantic-map-results"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="ai-visibility-results"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="trust-block-results"]')
    ).toBeVisible();
  });

  test("Agency User - Mobile Responsiveness", async ({ page, context }) => {
    // Login as agency user
    await orchestrator.userManager.loginAs("agency");

    // Resize viewport to mobile size
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12 dimensions

    // Navigate to dashboard
    await page.goto("/dashboard");

    // Check mobile navigation
    const menuButton = page.locator('[data-testid="mobile-menu-button"]');
    await expect(menuButton).toBeVisible();

    // Open menu and verify agency-specific items
    await menuButton.click();
    await expect(page.locator("text=Competitors")).toBeVisible();
    await expect(page.locator("text=NeuroSEO Advanced")).toBeVisible();
  });

  test("Agency User - Access Restrictions", async ({ page }) => {
    // Login as agency user
    await orchestrator.userManager.loginAs("agency");

    // Try to access enterprise-only feature
    await page.goto("/unlimited-neuroseo");

    // Should be redirected or see upgrade prompt
    await expect(
      page.locator("text=/upgrade|premium|subscribe/i")
    ).toBeVisible();

    // Try to access admin-only feature
    await page.goto("/user-management");

    // Should be redirected or see unauthorized message
    await expect(
      page.locator("text=/unauthorized|not allowed|access denied/i")
    ).toBeVisible();
  });
});
