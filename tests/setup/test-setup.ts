import { test as base, expect, Page, BrowserContext } from "@playwright/test";
import { login, saveAuthenticationState } from "../utils/auth-helper.js";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { defaultConfig, type TestConfig } from "../config/test-config";

// Extend the test context with auth
export type TestFixtures = {
  authenticatedPage: Page;
  adminPage: Page;
  config: TestConfig;
};

// Ensure storage directory exists
const storageDir = join(process.cwd(), "tests", "state");
if (!existsSync(storageDir)) {
  mkdirSync(storageDir, { recursive: true });
}

export const test = base.extend<TestFixtures>({
  // Provide config to all tests
  config: async ({}, use) => {
    await use(defaultConfig);
  },

  // Setup authenticated page
  authenticatedPage: async ({ page, context, config }, use) => {
    const storageFile = join(storageDir, "auth-standard.json");

    try {
      // Try to use saved auth state
      if (existsSync(storageFile)) {
        await context.storageState({ path: storageFile });
        await page.goto("/dashboard"); // Verify auth still works
        const isLoggedIn = await page.evaluate(() => {
          return !window.location.href.includes("/login");
        });
        if (!isLoggedIn) throw new Error("Saved auth expired");
      } else {
        throw new Error("No saved auth state");
      }
    } catch {
      // If no saved state or expired, do fresh login
      const credentials = config.testUsers.standard;
      await login(page, credentials);
      await context.storageState({ path: storageFile });
    }

    await use(page);
  },

  adminPage: async ({ page, context, config }, use) => {
    const storageFile = join(storageDir, "auth-admin.json");

    try {
      if (existsSync(storageFile)) {
        await context.storageState({ path: storageFile });
        await page.goto("/dashboard");
        const isLoggedIn = await page.evaluate(() => {
          return !window.location.href.includes("/login");
        });
        if (!isLoggedIn) throw new Error("Saved auth expired");
      } else {
        throw new Error("No saved auth state");
      }
    } catch {
      const credentials = config.testUsers.admin;
      await login(page, credentials);
      await context.storageState({ path: storageFile });
    }

    await use(page);
  },
});

export { expect };
