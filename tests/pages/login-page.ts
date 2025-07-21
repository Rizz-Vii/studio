import { Page, Locator, expect } from "@playwright/test";
import { randomDelay } from "../utils/test-utils";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input#email');
    this.passwordInput = page.locator('input#password');
    // Use the submit button by text content to be more specific
    this.loginButton = page.locator('button[type="submit"]:has-text("Login")');
    this.errorMessage = page.locator(".text-red-600");
  }

  async navigateTo(path?: string) {
    await this.page.goto(path || "/login");
    await randomDelay();
  }

  async login(email: string, password: string) {
    console.log(`Attempting login for ${email}`);
    
    // Wait for page to load completely
    await this.page.waitForLoadState("domcontentloaded");
    
    try {
      // For Abbas (free user), try dev login button first
      if (email === "abbas_ali_rizvi@hotmail.com" && password === "123456") {
        const devButton = this.page.locator('button:has-text("Login as Free User (Abbas)")');
        
        try {
          await devButton.waitFor({ state: "visible", timeout: 3000 });
          console.log("Using development login button for Abbas");
          await devButton.click();
          
          // Wait for navigation with more time
          await this.page.waitForURL("**/dashboard", { timeout: 20000 });
          console.log("✅ Development login successful");
          return;
        } catch (devError) {
          console.log("Dev button not available, trying manual login");
        }
      }
      
      // Manual form login
      console.log("Using manual form login");
      
      // Wait for and fill form fields
      await this.emailInput.waitFor({ state: "visible", timeout: 10000 });
      await this.emailInput.clear();
      await this.emailInput.fill(email);
      
      await this.passwordInput.waitFor({ state: "visible", timeout: 5000 });
      await this.passwordInput.clear();
      await this.passwordInput.fill(password);
      
      // Submit form
      await this.loginButton.waitFor({ state: "visible", timeout: 5000 });
      await this.loginButton.click();
      
      // Wait for navigation or error with longer timeout
      try {
        await this.page.waitForURL("**/dashboard", { timeout: 20000 });
        console.log("✅ Manual login successful");
      } catch (navigationError) {
        console.error("Navigation failed:", navigationError);
        
        // Check for authentication errors on page
        const errorVisible = await this.errorMessage.isVisible();
        if (errorVisible) {
          const errorText = await this.errorMessage.textContent();
          throw new Error(`Authentication failed: ${errorText}`);
        }
        
        const currentUrl = this.page.url();
        console.error(`Current URL after login attempt: ${currentUrl}`);
        throw new Error(`Login failed - no navigation to dashboard. Current URL: ${currentUrl}`);
      }
      
    } catch (error) {
      console.error("Login process failed:", error);
      throw error;
    }
  }

  async expectError(message?: string) {
    // Wait for error message with longer timeout
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
    
    // If specific message is provided, check it
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }
}
