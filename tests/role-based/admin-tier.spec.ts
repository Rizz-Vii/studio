import { test, expect } from "@playwright/test";
import { TestOrchestrator } from "../utils/test-orchestrator";
import { adminUserFlows } from "../flows/role-based-flows";

test.describe("Admin Tier User Tests", () => {
  // Configure timeouts for sequential flows
  test.setTimeout(120000); // 2 minutes per test

  let orchestrator: TestOrchestrator;

  test.beforeEach(async ({ page }) => {
    orchestrator = new TestOrchestrator(page);

    // Set longer timeouts for complex flows
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(20000);

    console.log("🎭 Starting Admin Tier User Test Suite");
  });

  test.afterEach(async ({ page }) => {
    // Take final screenshot
    await page
      .screenshot({
        path: `test-results/admin-tier-final-${Date.now()}.png`,
        fullPage: true,
      })
      .catch(() => {
        // Ignore screenshot failures
      });

    console.log("🏁 Admin Tier User Test Completed");
  });

  test("Admin User - User Management Access", async ({ page }) => {
    const userManagementFlow = adminUserFlows.find((flow) =>
      flow.name.includes("User Management")
    );
    if (!userManagementFlow) {
      throw new Error("User Management flow not found for admin users");
    }

    await orchestrator.executeFlow(userManagementFlow);

    // Verify user management functionality
    await expect(
      page.locator('[data-testid="user-management-table"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="user-management-actions"]')
    ).toBeVisible();
  });

  test("Admin User - System Admin Features", async ({ page }) => {
    const systemAdminFlow = adminUserFlows.find((flow) =>
      flow.name.includes("System Admin")
    );
    if (!systemAdminFlow) {
      throw new Error("System Admin flow not found for admin users");
    }

    await orchestrator.executeFlow(systemAdminFlow);

    // Verify system admin functionality
    await expect(page.locator('[data-testid="system-metrics"]')).toBeVisible();
    await expect(page.locator('[data-testid="system-logs"]')).toBeVisible();
  });

  test("Admin User - Subscription Management", async ({ page }) => {
    const subscriptionFlow = adminUserFlows.find((flow) =>
      flow.name.includes("Subscription Management")
    );
    if (!subscriptionFlow) {
      throw new Error("Subscription Management flow not found for admin users");
    }

    await orchestrator.executeFlow(subscriptionFlow);

    // Verify subscription management functionality
    await expect(
      page.locator('[data-testid="subscription-management-table"]')
    ).toBeVisible();
  });

  test("Admin User - Change User Tier", async ({ page }) => {
    const changeTierFlow = adminUserFlows.find((flow) =>
      flow.name.includes("Change User Tier")
    );
    if (!changeTierFlow) {
      throw new Error("Change User Tier flow not found for admin users");
    }

    await orchestrator.executeFlow(changeTierFlow);

    // Verify user tier change functionality
    await expect(page.locator("text=Tier successfully updated")).toBeVisible();
  });

  test("Admin User - Access All Features", async ({ page }) => {
    // Login as admin user
    await orchestrator.executeFlow({
      name: "Admin Login",
      description: "Login as admin user",
      userRole: "admin",
      steps: [
        {
          name: "Navigate to login page",
          action: async (page) => {
            await page.goto("/login");
          },
        },
        {
          name: "Fill admin credentials",
          action: async (page) => {
            await page.fill(
              '[data-testid="email-input"]',
              "admin.enterprise@test.com"
            );
            await page.fill(
              '[data-testid="password-input"]',
              "adminPassword123!"
            );
          },
        },
        {
          name: "Submit login form",
          action: async (page) => {
            await page.click('[data-testid="login-button"]');
          },
        },
      ],
    });

    // Verify access to all features
    await page.goto("/dashboard");

    // Check access to all feature pages
    const featuresToCheck = [
      "/keyword-tool",
      "/content-analyzer",
      "/neuroseo",
      "/neuroseo/ai-visibility",
      "/competitors",
      "/user-management",
      "/system-admin",
    ];

    for (const feature of featuresToCheck) {
      await page.goto(feature);
      // Should not see access denied or upgrade messages
      const accessDenied = await page
        .locator(
          "text=/unauthorized|not allowed|access denied|upgrade|subscribe/i"
        )
        .count();
      expect(accessDenied).toBe(0);
      // Take screenshot of each feature for verification
      await page.screenshot({
        path: `test-results/admin-access-${feature.replace(/\//g, "-")}-${Date.now()}.png`,
      });
    }
  });
});
