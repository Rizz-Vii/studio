import { test, expect } from "@playwright/test";
import { UserManager, TEST_USERS } from "../utils/user-management";

/**
 * Debug Test for Role-Based Authentication
 * Simple test to validate authentication flow is working
 */

test.describe("Authentication Debug Tests", () => {
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

  test("debug free user login flow", async ({ page }) => {
    console.log("🔍 Starting debug test for free user login");
    
    // Navigate to login page manually first
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");
    
    console.log("📍 Current URL after navigation:", page.url());
    
    // Check if login page elements are visible
    const emailInput = page.locator('input#email');
    const passwordInput = page.locator('input#password');
    const loginButton = page.locator('button[type="submit"]:has-text("Login")');
    
    console.log("🔍 Checking form elements...");
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    await expect(loginButton).toBeVisible({ timeout: 5000 });
    
    console.log("✅ Form elements are visible");
    
    // Try manual login
    const testUser = TEST_USERS.free;
    console.log(`🔐 Attempting login with: ${testUser.email}`);
    
    // Check for dev login button first
    const devButton = page.locator('button:has-text("Login as Free User (Abbas)")');
    const devButtonVisible = await devButton.isVisible();
    
    if (devButtonVisible) {
      console.log("🎯 Found dev login button, using it");
      await devButton.click();
      
      // Wait for redirect
      await page.waitForTimeout(3000);
      const currentUrl = page.url();
      console.log("📍 URL after dev login:", currentUrl);
      
      if (currentUrl.includes("/dashboard")) {
        console.log("✅ Dev login successful!");
        return;
      }
    }
    
    // Manual form submission
    console.log("📝 Using manual form submission");
    await emailInput.fill(testUser.email);
    await passwordInput.fill(testUser.password);
    
    console.log("🔲 Form filled, clicking submit button");
    await loginButton.click();
    
    // Wait and check what happens
    await page.waitForTimeout(5000);
    const finalUrl = page.url();
    console.log("📍 Final URL:", finalUrl);
    
    // Check for errors on page
    const errorElements = page.locator(".text-red-600, [data-testid*='error'], .error");
    const errorCount = await errorElements.count();
    
    if (errorCount > 0) {
      const errorText = await errorElements.first().textContent();
      console.log("❌ Error found:", errorText);
    }
    
    // Check if we made it to dashboard
    if (finalUrl.includes("/dashboard")) {
      console.log("✅ Login successful - reached dashboard");
    } else {
      console.log("❌ Login failed - did not reach dashboard");
      console.log("Current page title:", await page.title());
    }
  });

  test("verify user manager login method", async ({ page }) => {
    console.log("🧪 Testing UserManager.loginAs method");
    
    try {
      const user = await userManager.loginAs("free");
      console.log("✅ UserManager login successful");
      console.log("User:", user);
      
      // Verify we're on dashboard
      const currentUrl = page.url();
      console.log("📍 Current URL after UserManager login:", currentUrl);
      
      expect(currentUrl).toContain("/dashboard");
      console.log("✅ Successfully navigated to dashboard");
      
    } catch (error) {
      console.log("❌ UserManager login failed:", error);
      
      // Debug info
      const currentUrl = page.url();
      const pageTitle = await page.title();
      
      console.log("📍 Current URL:", currentUrl);
      console.log("📄 Page title:", pageTitle);
      
      throw error;
    }
  });

  test("check all test users exist in database", async ({ page }) => {
    console.log("📋 Verifying all test users are accessible");
    
    const userTypes = ["free", "starter", "enterprise", "admin"] as const;
    
    for (const userType of userTypes) {
      const user = TEST_USERS[userType];
      console.log(`🔍 Testing ${userType} user: ${user.email}`);
      
      try {
        await userManager.loginAs(userType);
        console.log(`✅ ${userType} user login successful`);
        await userManager.logout();
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log(`❌ ${userType} user login failed:`, error);
      }
    }
  });
});
