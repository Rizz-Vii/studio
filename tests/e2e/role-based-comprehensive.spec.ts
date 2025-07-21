import { test, expect } from "@playwright/test";
import { UserManager, TEST_USERS, getFeaturesForRole } from "../utils/user-management";
import { randomDelay } from "../utils/test-utils";

/**
 * Comprehensive End-to-End Tests for Role-Based Access Control
 * 
 * Tests each user role's access to features based on their subscription tier:
 * - Free: Basic dashboard and keyword tool
 * - Starter: Includes link analysis, SERP analysis, performance metrics
 * - Enterprise: Advanced features + API access
 * - Admin: Full access + admin panel
 */

test.describe("Role-Based Access Control - Comprehensive E2E", () => {
  let userManager: UserManager;

  test.beforeEach(async ({ page }) => {
    userManager = new UserManager(page);
  });

  test.afterEach(async ({ page }) => {
    try {
      await userManager.logout();
    } catch (error) {
      console.log("Cleanup logout failed:", error);
    }
  });

  test.describe("Free Tier User Tests", () => {
    test("free user can access allowed features only", async ({ page }) => {
      const user = await userManager.loginAs("free");
      expect(user.role).toBe("free");

      // Wait for dashboard to load
      await userManager.waitForDashboard();

      const allowedFeatures = getFeaturesForRole("free");
      const restrictedFeatures = ["/link-view", "/serp-view", "/performance", "/adminonly"];

      // Test allowed features
      for (const feature of allowedFeatures) {
        console.log(`🔍 Testing free user access to: ${feature}`);
        const hasAccess = await userManager.hasAccessToFeature(feature);
        expect(hasAccess).toBe(true);
        await randomDelay();
      }

      // Test restricted features
      for (const feature of restrictedFeatures) {
        console.log(`🚫 Testing free user restriction from: ${feature}`);
        const hasAccess = await userManager.hasAccessToFeature(feature);
        expect(hasAccess).toBe(false);
        await randomDelay();
      }
    });

    test("free user sees upgrade prompts on restricted features", async ({ page }) => {
      await userManager.loginAs("free");
      await userManager.waitForDashboard();

      // Try to access premium feature
      await page.goto("/link-view");
      
      // Check for upgrade prompts
      const upgradePrompts = page.locator([
        "text=/upgrade/i",
        "text=/premium/i",
        "text=/subscribe/i",
        "[data-testid*='upgrade']"
      ].join(", "));

      const promptCount = await upgradePrompts.count();
      expect(promptCount).toBeGreaterThan(0);
    });
  });

  test.describe("Starter Tier User Tests", () => {
    test("starter user can access intermediate features", async ({ page }) => {
      const user = await userManager.loginAs("starter");
      expect(user.role).toBe("starter");

      await userManager.waitForDashboard();

      const allowedFeatures = getFeaturesForRole("starter");
      const restrictedFeatures = ["/adminonly"];

      // Test allowed features
      for (const feature of allowedFeatures) {
        console.log(`🔍 Testing starter user access to: ${feature}`);
        const hasAccess = await userManager.hasAccessToFeature(feature);
        expect(hasAccess).toBe(true);
        await randomDelay();
      }

      // Test restricted features
      for (const feature of restrictedFeatures) {
        console.log(`🚫 Testing starter user restriction from: ${feature}`);
        const hasAccess = await userManager.hasAccessToFeature(feature);
        expect(hasAccess).toBe(false);
        await randomDelay();
      }
    });

    test("starter user can perform link analysis", async ({ page }) => {
      await userManager.loginAs("starter");
      await userManager.waitForDashboard();

      // Navigate to link analysis
      await page.goto("/link-view");
      await page.waitForLoadState("domcontentloaded");

      // Check that the link analysis form is accessible
      const linkForm = page.locator('form, [data-testid*="link"], input[type="url"]');
      const formExists = await linkForm.count() > 0;
      expect(formExists).toBe(true);

      // Test form interaction (if form is present)
      const urlInput = page.locator('input[type="url"], input[placeholder*="url"], input[placeholder*="link"]').first();
      if (await urlInput.count() > 0) {
        await urlInput.fill("https://example.com");
        expect(await urlInput.inputValue()).toBe("https://example.com");
      }
    });

    test("starter user can access SERP analysis", async ({ page }) => {
      await userManager.loginAs("starter");
      await userManager.waitForDashboard();

      await page.goto("/serp-view");
      await page.waitForLoadState("domcontentloaded");

      // Check that SERP analysis is accessible
      const serpContent = page.locator([
        'h1:has-text("SERP")',
        '[data-testid*="serp"]',
        'text=/search.*results/i',
        'form'
      ].join(", "));

      const contentExists = await serpContent.count() > 0;
      expect(contentExists).toBe(true);
    });
  });

  test.describe("Enterprise Tier User Tests", () => {
    test("enterprise user has advanced feature access", async ({ page }) => {
      const user = await userManager.loginAs("enterprise");
      expect(user.role).toBe("enterprise");

      await userManager.waitForDashboard();

      const allowedFeatures = getFeaturesForRole("enterprise");
      
      // Test all allowed features
      for (const feature of allowedFeatures) {
        console.log(`🔍 Testing enterprise user access to: ${feature}`);
        const hasAccess = await userManager.hasAccessToFeature(feature);
        expect(hasAccess).toBe(true);
        await randomDelay();
      }

      // Enterprise should NOT have admin access
      const hasAdminAccess = await userManager.hasAccessToFeature("/adminonly");
      expect(hasAdminAccess).toBe(false);
    });

    test("enterprise user can access all starter features plus advanced tools", async ({ page }) => {
      await userManager.loginAs("enterprise");
      await userManager.waitForDashboard();

      // Test core features
      const coreFeatures = ["/dashboard", "/keyword-tool", "/link-view", "/serp-view", "/performance"];
      
      for (const feature of coreFeatures) {
        await page.goto(feature);
        await page.waitForLoadState("domcontentloaded");
        
        const currentUrl = page.url();
        expect(currentUrl).toContain(feature);
        
        // Should not be redirected to login or unauthorized
        expect(currentUrl).not.toContain("/login");
        expect(currentUrl).not.toContain("/unauthorized");
      }
    });
  });

  test.describe("Admin User Tests", () => {
    test("admin user has full system access", async ({ page }) => {
      const user = await userManager.loginAs("admin");
      expect(user.role).toBe("admin");

      await userManager.waitForDashboard();

      const allowedFeatures = getFeaturesForRole("admin");
      
      // Test all allowed features including admin panel
      for (const feature of allowedFeatures) {
        console.log(`🔍 Testing admin user access to: ${feature}`);
        const hasAccess = await userManager.hasAccessToFeature(feature);
        expect(hasAccess).toBe(true);
        await randomDelay();
      }
    });

    test("admin user can access admin panel", async ({ page }) => {
      await userManager.loginAs("admin");
      await userManager.waitForDashboard();

      // Navigate to admin panel
      await page.goto("/adminonly");
      await page.waitForLoadState("domcontentloaded");

      // Check for admin-specific content
      const adminContent = page.locator([
        'h1:has-text("Admin")',
        '[data-testid*="admin"]',
        'text=/admin.*panel/i',
        'text=/user.*management/i'
      ].join(", "));

      const adminExists = await adminContent.count() > 0;
      expect(adminExists).toBe(true);

      // Verify URL is admin panel
      const currentUrl = page.url();
      expect(currentUrl).toContain("/adminonly");
    });

    test("admin user sees admin navigation elements", async ({ page }) => {
      await userManager.loginAs("admin");
      await userManager.waitForDashboard();

      // Check for admin-specific navigation
      const adminNav = page.locator([
        'a[href*="admin"]',
        'text=/admin.*panel/i',
        '[data-testid*="admin-nav"]',
        'nav a:has-text("Admin")'
      ].join(", "));

      const navExists = await adminNav.count() > 0;
      expect(navExists).toBe(true);
    });
  });

  test.describe("Cross-Role Feature Validation", () => {
    test("keyword tool is accessible to all roles", async ({ page }) => {
      const roles = ["free", "starter", "enterprise", "admin"] as const;
      
      for (const role of roles) {
        console.log(`🔍 Testing keyword tool access for ${role} user`);
        
        await userManager.loginAs(role);
        await userManager.waitForDashboard();

        const hasAccess = await userManager.hasAccessToFeature("/keyword-tool");
        expect(hasAccess).toBe(true);

        await userManager.logout();
        await randomDelay();
      }
    });

    test("dashboard is accessible to all authenticated users", async ({ page }) => {
      const roles = ["free", "starter", "enterprise", "admin"] as const;
      
      for (const role of roles) {
        console.log(`🔍 Testing dashboard access for ${role} user`);
        
        await userManager.loginAs(role);
        await userManager.waitForDashboard();

        // Verify we're on the dashboard
        const currentUrl = page.url();
        expect(currentUrl).toContain("/dashboard");

        // Check for dashboard content
        const dashboardContent = page.locator([
          'h1',
          '[data-testid*="dashboard"]',
          'text=/welcome/i',
          'main'
        ].join(", "));

        const contentExists = await dashboardContent.count() > 0;
        expect(contentExists).toBe(true);

        await userManager.logout();
        await randomDelay();
      }
    });
  });

  test.describe("Feature Access Boundaries", () => {
    test("users cannot access features above their tier", async ({ page }) => {
      // Free user trying to access starter features
      await userManager.loginAs("free");
      await userManager.waitForDashboard();

      const restrictedForFree = ["/link-view", "/serp-view", "/performance"];
      for (const feature of restrictedForFree) {
        const hasAccess = await userManager.hasAccessToFeature(feature);
        expect(hasAccess).toBe(false);
      }

      await userManager.logout();
      await randomDelay();

      // Starter user trying to access admin features
      await userManager.loginAs("starter");
      await userManager.waitForDashboard();

      const hasAdminAccess = await userManager.hasAccessToFeature("/adminonly");
      expect(hasAdminAccess).toBe(false);
    });

    test("role hierarchy is properly enforced", async ({ page }) => {
      // Test that higher tiers have access to lower tier features
      const roleHierarchy = [
        { role: "admin", shouldAccessAll: true },
        { role: "enterprise", shouldAccess: ["free", "starter", "enterprise"] },
        { role: "starter", shouldAccess: ["free", "starter"] },
        { role: "free", shouldAccess: ["free"] }
      ];

      for (const { role, shouldAccess } of roleHierarchy) {
        await userManager.loginAs(role as keyof typeof TEST_USERS);
        await userManager.waitForDashboard();

        // Test access to features from each tier they should have access to
        if (Array.isArray(shouldAccess)) {
          for (const tierToTest of shouldAccess) {
            const features = getFeaturesForRole(tierToTest);
            for (const feature of features) {
              if (feature !== "/adminonly") { // Skip admin-only for non-admin users
                const hasAccess = await userManager.hasAccessToFeature(feature);
                expect(hasAccess).toBe(true);
              }
            }
          }
        }

        await userManager.logout();
        await randomDelay();
      }
    });
  });

  test.describe("Session and Authentication", () => {
    test("user sessions persist across page reloads", async ({ page }) => {
      await userManager.loginAs("starter");
      await userManager.waitForDashboard();

      // Reload page
      await page.reload();
      await page.waitForLoadState("domcontentloaded");

      // Should still be on dashboard, not redirected to login
      const currentUrl = page.url();
      expect(currentUrl).toContain("/dashboard");
      expect(currentUrl).not.toContain("/login");
    });

    test("logout properly clears session", async ({ page }) => {
      await userManager.loginAs("starter");
      await userManager.waitForDashboard();

      // Logout
      await userManager.logout();

      // Try to access protected resource
      await page.goto("/dashboard");
      
      // Should be redirected to login
      await page.waitForURL("**/login", { timeout: 10000 });
      const currentUrl = page.url();
      expect(currentUrl).toContain("/login");
    });
  });
});
