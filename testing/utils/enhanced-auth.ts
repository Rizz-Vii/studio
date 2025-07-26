import { Page, expect } from "@playwright/test";
import { GracefulTestUtils } from "./graceful-test-utils";
import {
  UNIFIED_TEST_USERS,
  DEV_USER,
  type UnifiedTestUser,
  type UserTier,
  resolveTestUser
} from "../config/unified-test-users";

/**
 * Enhanced Authentication Utilities - Unified Test User Management
 * Resolves conflicts between different test user configurations
 */

export type { UserTier, UnifiedTestUser };

// Export unified test users for backward compatibility
export const TEST_USERS = UNIFIED_TEST_USERS;

export class EnhancedAuth {
  private gracefulUtils: GracefulTestUtils;

  constructor(private page: Page) {
    this.gracefulUtils = new GracefulTestUtils(page);
  }

  /**
   * Enhanced login with unified test users and enhanced auth service integration
   */
  async loginAndGoToDashboard(user?: UnifiedTestUser | UserTier): Promise<void> {
    const targetUser = resolveTestUser(user);

    try {
      console.log(`🔐 Logging in as ${targetUser.displayName} (${targetUser.tier})`);

      // Navigate to login page gracefully
      await this.gracefulUtils.navigateGracefully("/login", {
        waitStrategy: 'domcontentloaded',
        timeout: 60000
      });

      // Wait for body to be visible before interacting
      await this.waitForBodyVisible();

      // Wait for login form elements and fill them
      const emailInput = await this.gracefulUtils.waitForElementGracefully('#email', {
        timeout: 30000
      });
      const passwordInput = await this.gracefulUtils.waitForElementGracefully('#password', {
        timeout: 30000
      });

      // Fill in login form
      if (emailInput && passwordInput) {
        await emailInput.fill(targetUser.email);
        await passwordInput.fill(targetUser.password);
      } else {
        throw new Error("Email or password input not found");
      }

      // Find and click the main login button using test ID
      const loginButton = this.page.locator('[data-testid="login-button"]');
      await loginButton.click();

      // Wait for navigation to expected path
      const expectedPath = targetUser.tier === 'admin' ? '**/adminonly' : '**/dashboard';

      // Wait for navigation with enhanced timeout for Firebase auth
      await this.page.waitForURL(expectedPath, {
        timeout: 90000,
        waitUntil: 'domcontentloaded'
      });

      // Verify page loaded successfully (dashboard or admin panel)
      const contentSelector = targetUser.tier === 'admin'
        ? '[data-testid="admin-content"], [data-testid="dashboard-content"], main, .main-content'
        : '[data-testid="dashboard-content"], main, .main-content';

      await this.gracefulUtils.waitForElementGracefully(contentSelector, {
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
  async loginOnly(user?: UnifiedTestUser | UserTier): Promise<void> {
    const targetUser = resolveTestUser(user);

    console.log(`🔐 Logging in as ${targetUser.displayName} (${targetUser.tier})`);

    await this.gracefulUtils.navigateGracefully("/login");
    await this.waitForBodyVisible();

    // Fill login form directly
    await this.page.fill("#email", targetUser.email);
    await this.page.fill("#password", targetUser.password);

    // Click the main login button using test ID
    const loginButton = this.page.locator('[data-testid="login-button"]');
    await loginButton.click();

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
  async navigateToProtectedRoute(route: string, user?: UnifiedTestUser | UserTier): Promise<void> {
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
   * Resolve user input to UnifiedTestUser object
   */
  private resolveUser(user?: UnifiedTestUser | UserTier): UnifiedTestUser {
    return resolveTestUser(user);
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
  user?: UnifiedTestUser | UserTier
): Promise<void> {
  const auth = new EnhancedAuth(page);
  await auth.loginAndGoToDashboard(user);
}
