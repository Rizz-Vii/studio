import { test as base, expect } from "@playwright/test";
import { login, saveAuthenticationState } from "../utils/auth-helper";
import testConfig from "../../test.config.json";
import fs from "fs";
import path from "path";

// Extend the test context with auth
export type TestFixtures = {
  authenticatedPage: any;
  adminPage: any;
};

// Ensure storage directory exists
const storageDir = path.join(process.cwd(), "tests", "state");
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

export const test = base.extend<TestFixtures>({
  // Setup authenticated page
  authenticatedPage: async (
    { page, context }: { page: import('@playwright/test').Page; context: import('@playwright/test').BrowserContext },
    use: (page: import('@playwright/test').Page) => Promise<void>
  ) => {
    const storageFile = path.join(storageDir, "auth-standard.json");

    try {
      // Try to use saved auth state
      if (fs.existsSync(storageFile)) {
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
      const user = testConfig.testUsers.standard;
      await login(page, "standard");
      await context.storageState({ path: storageFile });
    }

    await use(page);
  },

  adminPage: async (
    { page, context }: { page: import('@playwright/test').Page; context: import('@playwright/test').BrowserContext },
    use: (page: import('@playwright/test').Page) => Promise<void>
  ) => {
    const storageFile = path.join(storageDir, "auth-admin.json");

    try {
      if (fs.existsSync(storageFile)) {
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
      const user = testConfig.testUsers.admin;
      await login(page, "admin");
      await context.storageState({ path: storageFile });
    }

    await use(page);
  },
});

export { expect };
