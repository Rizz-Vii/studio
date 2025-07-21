import { test, expect } from "@playwright/test";
import { UserManager, TEST_USERS } from "../utils/user-management";

/**
 * Optimized Role-Based Test Orchestrator
 *
 * This file runs fast, targeted tests for each user role in parallel workers.
 * Each worker tests one user role to avoid authentication conflicts.
 */

test.describe("Role-Based E2E Tests - Optimized", () => {
  let userManager: UserManager;

  test.beforeEach(async ({ page }) => {
    userManager = new UserManager(page);
  });

  test.afterEach(async ({ page }) => {
    try {
      await userManager.logout();
    } catch (error) {
      console.log("Cleanup logout failed (expected in some scenarios):", error);
    }
  });

  // Worker 1: Free Tier Testing
  test.describe("Free Tier Validation", () => {
    test("free user authentication and basic access", async ({ page }) => {
      console.log("🆓 Testing Free Tier User Experience");

      const user = await userManager.loginAs("free");
      expect(user.email).toBe("abbas_ali_rizvi@hotmail.com");
      expect(user.role).toBe("free");

      // Verify dashboard access
      await userManager.waitForDashboard();
      expect(page.url()).toContain("/dashboard");

      // Test allowed features
      console.log("✅ Testing allowed feature: keyword-tool");
      const keywordAccess =
        await userManager.hasAccessToFeature("/keyword-tool");
      expect(keywordAccess).toBe(true);

      // Test restricted features
      console.log("🚫 Testing restricted feature: link-view");
      const linkAccess = await userManager.hasAccessToFeature("/link-view");
      expect(linkAccess).toBe(false);

      console.log("✅ Free tier validation complete");
    });
  });

  // Worker 2: Starter Tier Testing
  test.describe("Starter Tier Validation", () => {
    test("starter user authentication and intermediate access", async ({
      page,
    }) => {
      console.log("🚀 Testing Starter Tier User Experience");

      const user = await userManager.loginAs("starter");
      expect(user.email).toBe("starter.user1@test.com");
      expect(user.role).toBe("starter");

      await userManager.waitForDashboard();

      // Test starter-specific features
      const starterFeatures = [
        "/keyword-tool",
        "/link-view",
        "/serp-view",
        "/performance",
      ];

      for (const feature of starterFeatures) {
        console.log(`✅ Testing starter access to: ${feature}`);
        const hasAccess = await userManager.hasAccessToFeature(feature);
        expect(hasAccess).toBe(true);
      }

      // Verify admin restriction
      console.log("🚫 Testing admin restriction");
      const adminAccess = await userManager.hasAccessToFeature("/adminonly");
      expect(adminAccess).toBe(false);

      console.log("✅ Starter tier validation complete");
    });
  });

  // Worker 3: Enterprise Tier Testing
  test.describe("Enterprise Tier Validation", () => {
    test("enterprise user authentication and advanced access", async ({
      page,
    }) => {
      console.log("🏢 Testing Enterprise Tier User Experience");

      const user = await userManager.loginAs("enterprise");
      expect(user.email).toBe("enterprise.user1@test.com");
      expect(user.role).toBe("enterprise");

      await userManager.waitForDashboard();

      // Test enterprise features (same as starter for now, but may expand)
      const enterpriseFeatures = [
        "/dashboard",
        "/keyword-tool",
        "/link-view",
        "/serp-view",
        "/performance",
      ];

      for (const feature of enterpriseFeatures) {
        console.log(`✅ Testing enterprise access to: ${feature}`);
        const hasAccess = await userManager.hasAccessToFeature(feature);
        expect(hasAccess).toBe(true);
      }

      // Verify admin restriction still applies
      const adminAccess = await userManager.hasAccessToFeature("/adminonly");
      expect(adminAccess).toBe(false);

      console.log("✅ Enterprise tier validation complete");
    });
  });

  // Worker 4: Admin Tier Testing
  test.describe("Admin Tier Validation", () => {
    test("admin user authentication and full system access", async ({
      page,
    }) => {
      console.log("👑 Testing Admin Tier User Experience");

      const user = await userManager.loginAs("admin");
      expect(user.email).toBe("admin.user1@test.com");
      expect(user.role).toBe("admin");

      await userManager.waitForDashboard();

      // Test all features including admin panel
      const adminFeatures = [
        "/dashboard",
        "/keyword-tool",
        "/link-view",
        "/serp-view",
        "/performance",
        "/adminonly",
      ];

      for (const feature of adminFeatures) {
        console.log(`✅ Testing admin access to: ${feature}`);
        const hasAccess = await userManager.hasAccessToFeature(feature);
        expect(hasAccess).toBe(true);
      }

      // Verify admin panel content
      await page.goto("/adminonly");
      await page.waitForLoadState("domcontentloaded");

      const isAdminPage = page.url().includes("/adminonly");
      expect(isAdminPage).toBe(true);

      console.log("✅ Admin tier validation complete");
    });
  });

  // Cross-tier validation tests
  test.describe("Cross-Tier Feature Validation", () => {
    test("universal features accessible to all tiers", async ({ page }) => {
      console.log("🔄 Testing cross-tier feature access");

      const universalFeatures = ["/dashboard", "/keyword-tool"];
      const testUsers = ["free", "starter", "enterprise", "admin"] as const;

      for (const userType of testUsers) {
        console.log(`Testing universal access for ${userType} user`);

        await userManager.loginAs(userType);
        await userManager.waitForDashboard();

        for (const feature of universalFeatures) {
          const hasAccess = await userManager.hasAccessToFeature(feature);
          expect(hasAccess).toBe(true);
        }

        await userManager.logout();

        // Small delay between user switches
        await page.waitForTimeout(1000);
      }

      console.log("✅ Cross-tier validation complete");
    });
  });

  // Authentication flow validation
  test.describe("Authentication Flow Validation", () => {
    test("login-logout cycle for each user type", async ({ page }) => {
      console.log("🔐 Testing authentication flows");

      const userTypes = ["free", "starter", "enterprise", "admin"] as const;

      for (const userType of userTypes) {
        console.log(`Testing auth flow for ${userType} user`);

        // Login
        const user = await userManager.loginAs(userType);
        expect(user.role).toBe(userType);

        // Verify authenticated state
        await userManager.waitForDashboard();
        expect(page.url()).toContain("/dashboard");

        // Logout
        await userManager.logout();

        // Verify logged out state
        await page.goto("/dashboard");
        await page.waitForURL("**/login", { timeout: 10000 });
        expect(page.url()).toContain("/login");

        console.log(`✅ Auth flow validated for ${userType}`);
      }

      console.log("✅ All authentication flows validated");
    });
  });

  // Performance and reliability tests
  test.describe("Performance and Reliability", () => {
    test("rapid feature access test", async ({ page }) => {
      console.log("⚡ Testing rapid feature access");

      await userManager.loginAs("starter");
      await userManager.waitForDashboard();

      const features = [
        "/dashboard",
        "/keyword-tool",
        "/link-view",
        "/serp-view",
      ];
      const startTime = Date.now();

      // Rapidly navigate between features
      for (const feature of features) {
        await page.goto(feature);
        await page.waitForLoadState("domcontentloaded");
        expect(page.url()).toContain(feature);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      console.log(`⚡ Feature navigation completed in ${totalTime}ms`);
      expect(totalTime).toBeLessThan(30000); // Should complete within 30 seconds

      console.log("✅ Performance test passed");
    });

    test("session persistence across page operations", async ({ page }) => {
      console.log("🔄 Testing session persistence");

      await userManager.loginAs("enterprise");
      await userManager.waitForDashboard();

      // Test various page operations
      await page.reload();
      await page.waitForLoadState("domcontentloaded");
      expect(page.url()).toContain("/dashboard");

      await page.goBack();
      await page.goForward();
      await page.waitForLoadState("domcontentloaded");

      // Navigate to feature and back
      await page.goto("/keyword-tool");
      await page.waitForLoadState("domcontentloaded");
      await page.goto("/dashboard");
      await page.waitForLoadState("domcontentloaded");

      // Should still be authenticated
      expect(page.url()).toContain("/dashboard");
      expect(page.url()).not.toContain("/login");

      console.log("✅ Session persistence validated");
    });
  });
});
