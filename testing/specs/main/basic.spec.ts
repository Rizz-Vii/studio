import { test, expect } from "@playwright/test";
import { createGracefulUtils } from "../../utils/graceful-test-utils";

test.describe("Basic Health Check", () => {
  test("can connect to the application", async ({ page }) => {
    const utils = createGracefulUtils(page);

    try {
      console.log("🏠 Starting application connection test...");

      // Graceful navigation with retries
      await utils.navigateGracefully("/", {
        maxRetries: 3,
        waitStrategy: "domcontentloaded",
        timeout: 45000,
      });

      // Wait for application to be ready
      await utils.waitForAppReady();

      // Basic check - wait for body to be visible with detailed logging
      console.log("🔍 Waiting for body to be visible...");

      // First check if body exists
      const bodyExists = await page.locator("body").count();
      console.log(`� Body element count: ${bodyExists}`);

      if (bodyExists > 0) {
        // Check body visibility status
        const bodyVisibility = await page.evaluate(() => {
          const body = document.body;
          const styles = window.getComputedStyle(body);
          return {
            visibility: styles.visibility,
            display: styles.display,
            opacity: styles.opacity,
            height: body.offsetHeight,
            width: body.offsetWidth,
          };
        });
        console.log("📊 Body styles:", bodyVisibility);
      }

      // Wait for body to be visible with display check first
      await page.waitForFunction(
        () => {
          const body = document.body;
          if (!body) return false;
          const styles = window.getComputedStyle(body);
          return styles.display !== "none" && body.offsetHeight > 0;
        },
        { timeout: 45000 }
      );

      await expect(page.locator("body")).toBeVisible({ timeout: 15000 });

      // Also check that content is actually loaded
      await page.waitForFunction(() => document.readyState === "complete", {
        timeout: 15000,
      });

      console.log("✅ Page body is visible and ready");

      // Check for the main navigation or header with graceful waiting
      console.log("🔍 Looking for navigation elements...");
      const navigationElement = await utils.waitForElementGracefully(
        "header.sticky",
        { timeout: 30000, retries: 3 }
      );

      expect(navigationElement).toBeTruthy();
      console.log("✅ Navigation element found successfully");

      // Take a screenshot for debugging
      await page.screenshot({
        path: "test-results/basic-health-check.png",
        fullPage: true,
      });
      console.log("✅ Basic health check completed successfully");
    } catch (error) {
      const errorToLog =
        error instanceof Error ? error : new Error(String(error));
      await utils.logErrorContext("basic-health-check", errorToLog);
      throw errorToLog;
    }
  });

  test("can access login page", async ({ page }) => {
    const utils = createGracefulUtils(page);

    try {
      console.log("🔐 Starting login page accessibility test...");

      await utils.navigateGracefully("/login", {
        maxRetries: 3,
        timeout: 45000,
      });

      await utils.waitForAppReady();

      // Check for login form elements with graceful waiting
      console.log("🔍 Looking for email field...");
      await utils.waitForElementGracefully("#email, input[type='email']", {
        timeout: 30000,
        retries: 3,
      });

      console.log("🔍 Looking for password field...");
      await utils.waitForElementGracefully(
        "#password, input[type='password'], input[id='password']",
        {
          timeout: 20000,
          retries: 3,
        }
      );

      console.log("🔍 Looking for login button...");
      await utils.waitForElementGracefully(
        "button[type='submit'], button:has-text('Login')",
        {
          timeout: 20000,
          retries: 3,
        }
      );

      console.log("✅ Login page accessibility test completed successfully");
    } catch (error) {
      const errorToLog =
        error instanceof Error ? error : new Error(String(error));
      await utils.logErrorContext("login-page-access", errorToLog);
      throw errorToLog;
    }
  });
});
