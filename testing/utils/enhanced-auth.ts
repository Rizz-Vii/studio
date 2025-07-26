import { Page, expect } from "@playwright/test";
import { GracefulTestUtils } from "./graceful-test-utils";

/**
 * Enhanced Authentication Utilities - Centralized login management
 * Based on RankPilot testing strategy documentation
 */

export type UserTier = 'free' | 'starter' | 'agency' | 'enterprise' | 'admin';

export interface TestUser {
  email: string;
  password: string;
  tier: UserTier;
  displayName: string;
}

export const TEST_USERS: Record<UserTier, TestUser> = {
  free: {
    email: "abbas_ali_rizvi@hotmail.com",
    password: "123456",
    tier: "free",
    displayName: "Abbas Ali (Free)"
  },
  starter: {
    email: "starter@rankpilot.com", 
    password: "starter123",
    tier: "starter",
    displayName: "Starter User"
  },
  agency: {
    email: "enterprise@rankpilot.com",
    password: "enterprise123", 
    tier: "agency",
    displayName: "Agency User (Enterprise)"
  },
  enterprise: {
    email: "enterprise@rankpilot.com",
    password: "enterprise123",
    tier: "enterprise", 
    displayName: "Enterprise User"
  },
  admin: {
    email: "admin@rankpilot.com",
    password: "admin123",
    tier: "admin",
    displayName: "Admin User"
  }
};

// Fallback user for development
export const DEV_USER = {
  email: "abbas_ali_rizvi@hotmail.com",
  password: "123456", 
  tier: "free" as UserTier,
  displayName: "Abbas (Dev)"
};

export class EnhancedAuth {
  private gracefulUtils: GracefulTestUtils;

  constructor(private page: Page) {
    this.gracefulUtils = new GracefulTestUtils(page);
  }

  /**
   * Enhanced login with graceful error handling and tier-based routing
   */
  async loginAndGoToDashboard(user?: TestUser | UserTier): Promise<void> {
    const targetUser = this.resolveUser(user);
    
    try {
      console.log(`🔐 Logging in as ${targetUser.displayName} (${targetUser.tier})`);
      
      // Navigate to login page gracefully
      await this.gracefulUtils.navigateGracefully("/login", {
        waitStrategy: 'domcontentloaded',
        timeout: 60000
      });

      // Check if we need to wait for body to be visible (fix for display: none issue)
      await this.waitForBodyVisible();

      // Wait for login form elements
      await this.gracefulUtils.waitForElementGracefully("#email", {
        timeout: 30000,
        state: 'visible'
      });

      await this.gracefulUtils.waitForElementGracefully("#password", {
        timeout: 10000,
        state: 'visible' 
      });

      // Fill credentials with graceful error handling
      await this.page.fill("#email", targetUser.email);
      await this.page.fill("#password", targetUser.password);

      // Try dev mode login first if available
      const devLoginButton = this.page.locator('button:has-text("Login as Free User (Abbas)")');
      if (await devLoginButton.isVisible({ timeout: 5000 })) {
        console.log("🚀 Using dev mode quick login");
        await devLoginButton.click();
      } else {
        // Use standard login button
        const loginButton = this.page.locator('[data-testid="login-button"]')
          .or(this.page.locator('button[type="submit"]'))
          .or(this.page.locator('button:has-text("Login")'))
          .or(this.page.locator('button:has-text("Sign In")'));
          
        await loginButton.click();
      }

      // Wait for navigation to dashboard with enhanced timeout
      await this.page.waitForURL("**/dashboard", { 
        timeout: 60000,
        waitUntil: 'domcontentloaded'
      });

      // Verify dashboard loaded successfully
      await this.gracefulUtils.waitForElementGracefully('[data-testid="dashboard-content"]', {
        timeout: 30000
      });

      console.log(`✅ Successfully logged in as ${targetUser.displayName}`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Login failed for ${targetUser.displayName}:`, errorMessage);
      
      // Capture debug screenshot
      await this.page.screenshot({
        path: `test-results/login-failure-${targetUser.tier}-${Date.now()}.png`,
        fullPage: true
      });
      
      throw new Error(`Authentication failed for ${targetUser.tier} user: ${errorMessage}`);
    }
  }

  /**
   * Login without navigation - just handle auth
   */
  async loginOnly(user?: TestUser | UserTier): Promise<void> {
    const targetUser = this.resolveUser(user);
    
    console.log(`🔐 Logging in as ${targetUser.displayName} (${targetUser.tier})`);
    
    await this.gracefulUtils.navigateGracefully("/login");
    await this.waitForBodyVisible();
    
    await this.page.fill("#email", targetUser.email);
    await this.page.fill("#password", targetUser.password);
    
    const devLoginButton = this.page.locator('button:has-text("Login as Free User (Abbas)")');
    if (await devLoginButton.isVisible({ timeout: 5000 })) {
      await devLoginButton.click();
    } else {
      const loginButton = this.page.locator('[data-testid="login-button"]')
        .or(this.page.locator('button[type="submit"]'))
        .or(this.page.locator('button:has-text("Login")'));
      await loginButton.click();
    }
    
    // Wait for auth to complete (not navigation)
    await this.page.waitForTimeout(3000);
  }

  /**
   * Check if user is already authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      // Check for common authenticated indicators
      const authIndicators = [
        '[data-testid="user-menu"]',
        '[data-testid="logout-button"]', 
        'text=Dashboard',
        'text=Profile',
        '.user-avatar'
      ];

      for (const indicator of authIndicators) {
        if (await this.page.locator(indicator).isVisible({ timeout: 2000 })) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Navigate to a protected route with authentication check
   */
  async navigateToProtectedRoute(route: string, user?: TestUser | UserTier): Promise<void> {
    console.log(`🛡️ Navigating to protected route: ${route}`);
    
    // Check if already authenticated
    if (!(await this.isAuthenticated())) {
      await this.loginAndGoToDashboard(user);
    }
    
    // Navigate to the target route
    await this.gracefulUtils.navigateGracefully(route);
  }

  /**
   * Wait for body element to be visible (fixes display: none issue)
   */
  private async waitForBodyVisible(): Promise<void> {
    try {
      console.log("🔍 Checking body visibility...");
      
      // Wait for body to exist
      await this.page.waitForSelector('body', { timeout: 30000 });
      
      // Check if body has display: none and wait for it to become visible
      await this.page.waitForFunction(
        () => {
          const body = document.body;
          const style = window.getComputedStyle(body);
          return style.display !== 'none' && style.visibility !== 'hidden';
        },
        { timeout: 30000 }
      );
      
      console.log("✅ Body is now visible");
    } catch (error) {
      console.log("⚠️ Body visibility check failed, continuing anyway");
      await this.page.screenshot({
        path: `test-results/body-visibility-debug-${Date.now()}.png`,
        fullPage: true
      });
    }
  }

  /**
   * Resolve user input to TestUser object
   */
  private resolveUser(user?: TestUser | UserTier): TestUser {
    if (!user) {
      return DEV_USER;
    }
    
    if (typeof user === 'string') {
      return TEST_USERS[user] || DEV_USER;
    }
    
    return user;
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      console.log("🚪 Logging out...");
      
      // Try multiple logout methods
      const logoutSelectors = [
        '[data-testid="logout-button"]',
        'button:has-text("Logout")',
        'button:has-text("Sign Out")',
        '[data-testid="user-menu"] button:has-text("Logout")'
      ];

      for (const selector of logoutSelectors) {
        const element = this.page.locator(selector);
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          break;
        }
      }

      // Wait for redirect to login or home page
      await this.page.waitForURL(/\/(login|$)/, { timeout: 10000 });
      console.log("✅ Successfully logged out");
      
    } catch (error) {
      console.log("⚠️ Logout may have failed, continuing...");
    }
  }
}

/**
 * Convenience function for backwards compatibility
 */
export async function loginAndGoToDashboard(
  page: Page, 
  user?: TestUser | UserTier
): Promise<void> {
  const auth = new EnhancedAuth(page);
  await auth.loginAndGoToDashboard(user);
}
