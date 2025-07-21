import { test as base, Page, expect } from "@playwright/test";
import { LoginCredentials } from "../utils/test-utils";

// Default test credentials
export const TestCredentials = {
  standard: {
    email: "abbas_ali_rizvi@hotmail.com",
    password: "123456"
  },
  admin: {
    email: "admin@example.com",
    password: "adminPassword123"
  }
};

// Helper function for authentication
export async function loginUser(page: Page, credentials = TestCredentials.standard) {
  try {
    await page.goto("/login");
    console.log("Login page loaded");
    
    // Wait for form elements to be available
    await page.waitForSelector('#email', { timeout: 10000 });
    await page.waitForSelector('#password', { timeout: 5000 });
    
    // Fill in credentials
    await page.fill('#email', credentials.email);
    await page.fill('#password', credentials.password);
    
    console.log("Filled credentials, clicking submit button...");
    
    // Check if dev login buttons are available (in development mode)
    const devLoginButton = page.locator('button:has-text("Login as Free User (Abbas)")');
    const hasDevButton = await devLoginButton.count() > 0;
    
    if (hasDevButton) {
      // Use Dev mode quick login button
      await devLoginButton.click();
    } else {
      // Use standard login form
      await page.click('button[type="submit"]');
    }
    
    // Wait for navigation to complete
    await page.waitForURL("/dashboard", { timeout: 30000 });
    
    console.log("Login successful, now at dashboard!");
    return true;
  } catch (error) {
    console.error("Login failed:", error);
    console.log(`Current URL: ${page.url()}`);
    await page.screenshot({ path: `test-results/login-failure-${Date.now()}.png` });
    throw error;
  }
}

// Create a test fixture that handles authentication
export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    // Increase timeouts
    page.setDefaultNavigationTimeout(45000);
    page.setDefaultTimeout(30000);
    
    // Login
    await loginUser(page);
    
    // Use the authenticated page in the test
    await use(page);
  }
});

// Authentication utilities
export const authUtils = {
  isLoggedIn: async (page: Page): Promise<boolean> => {
    // Check for elements that indicate user is logged in
    const userMenuCount = await page.locator('[data-testid="user-menu"], .user-avatar, .user-profile').count();
    return userMenuCount > 0;
  },
  
  logout: async (page: Page): Promise<void> => {
    // Find and click logout button/link
    await page.click('[data-testid="logout-button"], button:has-text("Logout"), button:has-text("Sign out")');
    await page.waitForURL("/login", { timeout: 10000 });
  }
};
