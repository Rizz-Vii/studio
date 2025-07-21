import { Page } from "@playwright/test";
import { LoginPage } from "../pages/login-page";
import { randomDelay } from "./test-utils";
import { UserRole, SubscriptionTier } from "@/lib/access-control";

export interface TestUser {
  email: string;
  password: string;
  role: UserRole;
  tier: SubscriptionTier;
  displayName: string;
  description: string;
}

/**
 * Test users based on actual Firebase database analysis
 * These correspond to real users created by populate-dummy-data.ts
 * 
 * Database Structure:
 * - role: "admin" | "user" (system permissions)
 * - subscriptionTier: "free" | "starter" | "agency" | "enterprise" (feature access)
 * - subscriptionStatus: "active" | "free" | etc.
 */
export const TEST_USERS: Record<string, TestUser> = {
  // Production user (real customer)
  production: {
    email: "abbas_ali_rizvi@hotmail.com", // Real user ID: vGZSfZA7yPOOCgUGtAS2ywvwP8l1
    password: "123456",
    role: "user",
    tier: "free",
    displayName: "Abbas Ali (Production)",
    description: "Real production user - Free tier with basic access"
  },

  // Test users created by populate-dummy-data.ts
  free: {
    email: "free.user1@test.com", // Test user ID: test-free-user-1
    password: "testPassword123",
    role: "user", 
    tier: "free",
    displayName: "Free Test User",
    description: "Free tier user with limited features (5 audits/month)"
  },

  starter: {
    email: "starter.user1@test.com", // Test user ID: test-starter-user-1
    password: "testPassword123",
    role: "user",
    tier: "starter", 
    displayName: "Starter Test User",
    description: "Starter tier user with intermediate features (50 audits/month)"
  },

  agency: {
    email: "agency.user1@test.com", // Test user ID: test-agency-user-1
    password: "testPassword123",
    role: "user",
    tier: "agency",
    displayName: "Agency Test User", 
    description: "Agency tier user with unlimited features and API access"
  },

  enterprise: {
    email: "enterprise.user1@test.com", // Test user ID: test-enterprise-user-1
    password: "testPassword123",
    role: "user",
    tier: "enterprise",
    displayName: "Enterprise Test User",
    description: "Enterprise tier user with all features and dedicated support"
  },

  // Admin users
  adminFree: {
    email: "admin.free@test.com", // Test user ID: test-admin-free
    password: "testPassword123", 
    role: "admin",
    tier: "free",
    displayName: "Admin (Free Tier)",
    description: "Administrator with system access but free subscription"
  },

  adminEnterprise: {
    email: "admin.enterprise@test.com", // Test user ID: test-admin-enterprise
    password: "testPassword123",
    role: "admin", 
    tier: "enterprise",
    displayName: "Admin (Enterprise)",
    description: "Administrator with full system and feature access"
  }
};

export class UserManager {
  private currentUser: TestUser | null = null;
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async loginAs(userType: keyof typeof TEST_USERS): Promise<TestUser> {
    const user = TEST_USERS[userType];
    if (!user) {
      throw new Error(`Unknown user type: ${userType}`);
    }

    console.log(`🔐 Logging in as ${user.displayName} (Role: ${user.role}, Tier: ${user.tier})`);
    
    const loginPage = new LoginPage(this.page);
    await loginPage.navigateTo();
    
    try {
      await loginPage.login(user.email, user.password);
      this.currentUser = user;
      
      // Wait for authentication to complete
      await randomDelay();
      
      console.log(`✅ Successfully logged in as ${user.displayName}`);
      return user;
    } catch (error) {
      console.error(`❌ Failed to login as ${user.displayName}:`, error);
      throw error;
    }
  }

  getCurrentUser(): TestUser | null {
    return this.currentUser;
  }

  async logout(): Promise<void> {
    if (!this.currentUser) return;
    
    console.log(`🔐 Logging out ${this.currentUser.displayName}`);
    
    try {
      // Navigate to logout or clear session
      await this.page.goto("/logout", { timeout: 10000 });
      await randomDelay();
      this.currentUser = null;
      console.log("✅ Successfully logged out");
    } catch (error) {
      console.error("❌ Failed to logout:", error);
      throw error;
    }
  }

  /**
   * Basic feature access logic for testing
   */
  private checkFeatureAccess(userAccess: { role: UserRole; tier: SubscriptionTier; status: string }, featureName: string): boolean {
    // Admin-only features
    const adminFeatures = ["admin_panel", "user_management", "system_settings"];
    if (adminFeatures.includes(featureName) && userAccess.role !== "admin") {
      return false;
    }

    // Tier-based features
    const tierHierarchy = { free: 0, starter: 1, agency: 2, enterprise: 3 };
    const featureTiers: Record<string, SubscriptionTier> = {
      "link_analysis": "starter",
      "serp_analysis": "starter", 
      "performance_metrics": "starter",
      "export_pdf": "starter",
      "competitor_analysis": "agency",
      "bulk_operations": "agency",
      "white_label": "agency",
      "api_access": "agency",
      "priority_support": "agency",
      "export_csv": "agency",
      "custom_integrations": "enterprise",
      "dedicated_support": "enterprise",
      "enterprise_sla": "enterprise",
      "advanced_security": "enterprise"
    };

    const requiredTier = featureTiers[featureName];
    if (requiredTier) {
      const userLevel = tierHierarchy[userAccess.tier];
      const requiredLevel = tierHierarchy[requiredTier];
      return userLevel >= requiredLevel;
    }

    // Default: allow access for basic features
    return true;
  }

  /**
   * Get expected feature access for current user
   */
  getExpectedFeatures(): string[] {
    if (!this.currentUser) return [];

    const userAccess = {
      role: this.currentUser.role,
      tier: this.currentUser.tier,
      status: "active" as const
    };

    const allFeatures = [
      "dashboard", "keyword_analysis",
      "link_analysis", "serp_analysis", "performance_metrics", "export_pdf",
      "competitor_analysis", "bulk_operations", "white_label", "api_access", "priority_support", "export_csv",
      "custom_integrations", "dedicated_support", "enterprise_sla", "advanced_security",
      "admin_panel", "user_management", "system_settings"
    ];

    return allFeatures.filter(feature => this.checkFeatureAccess(userAccess, feature));
  }

  async verifyUserRole(expectedRole: string): Promise<boolean> {
    try {
      // Check if user has access to role-specific features
      const currentUrl = this.page.url();
      
      // Check for role indicators in the UI
      const roleIndicators = await this.page.locator([
        `[data-testid*="role-${expectedRole}"]`,
        `[data-role="${expectedRole}"]`,
        `.role-${expectedRole}`,
        `text=/welcome.*${expectedRole}/i`
      ].join(", ")).count();
      
      return roleIndicators > 0;
    } catch (error) {
      console.error("Failed to verify user role:", error);
      return false;
    }
  }

  async waitForDashboard(): Promise<void> {
    await this.page.waitForURL("/dashboard", { timeout: 30000 });
    await this.page.waitForLoadState("domcontentloaded");
    await randomDelay();
  }

  async hasAccessToFeature(featurePath: string): Promise<boolean> {
    try {
      await this.page.goto(featurePath, { timeout: 15000 });
      await this.page.waitForLoadState("domcontentloaded");
      
      // Check if we're redirected to unauthorized page or login
      const currentUrl = this.page.url();
      
      if (currentUrl.includes("/login") || currentUrl.includes("/unauthorized")) {
        return false;
      }
      
      // Check for error messages or access denied indicators
      const accessDenied = await this.page.locator([
        "text=/access.*denied/i",
        "text=/unauthorized/i",
        "text=/upgrade.*required/i",
        "text=/premium.*feature/i"
      ].join(", ")).count();
      
      return accessDenied === 0;
    } catch (error) {
      console.error(`Failed to check access to ${featurePath}:`, error);
      return false;
    }
  }
}

// Feature access matrix based on subscription tiers
export const FEATURE_ACCESS: Record<string, string[]> = {
  free: [
    "/dashboard",
    "/keyword-tool", // Basic keyword analysis
  ],
  starter: [
    "/dashboard",
    "/keyword-tool",
    "/link-view", // Link analysis
    "/serp-view", // SERP analysis
    "/performance", // Basic performance metrics
  ],
  agency: [
    "/dashboard",
    "/keyword-tool",
    "/link-view",
    "/serp-view", 
    "/performance",
    // "/competitor-analysis", // Not implemented yet
    // "/bulk-analysis", // Not implemented yet
  ],
  enterprise: [
    "/dashboard",
    "/keyword-tool",
    "/link-view",
    "/serp-view",
    "/performance",
    // "/competitor-analysis", // Not implemented yet
    // "/bulk-analysis", // Not implemented yet
    // "/white-label", // Not implemented yet
    // "/api-access", // Not implemented yet
  ],
  admin: [
    "/dashboard",
    "/keyword-tool",
    "/link-view",
    "/serp-view",
    "/performance",
    "/adminonly", // Admin panel (exists)
    // "/user-management", // Not implemented yet
  ]
};

export function getFeaturesForRole(role: string): string[] {
  return FEATURE_ACCESS[role] || [];
}

export function canAccessFeature(userRole: string, featurePath: string): boolean {
  const userFeatures = getFeaturesForRole(userRole);
  return userFeatures.includes(featurePath);
}
