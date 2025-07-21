import { Page, expect } from "@playwright/test";
import { UserManager, TestUser, getFeaturesForRole } from "./user-management";
import { randomDelay } from "./test-utils";

export interface TestStep {
  name: string;
  action: (page: Page, user: TestUser) => Promise<void>;
  expectedResult?: string;
  timeout?: number;
  skipOnFailure?: boolean;
}

export interface TestFlow {
  name: string;
  description: string;
  userRole: keyof typeof import("./user-management").TEST_USERS;
  steps: TestStep[];
  setup?: (page: Page, user: TestUser) => Promise<void>;
  teardown?: (page: Page, user: TestUser) => Promise<void>;
}

export class TestOrchestrator {
  private page: Page;
  private userManager: UserManager;
  private currentFlow: TestFlow | null = null;

  constructor(page: Page) {
    this.page = page;
    this.userManager = new UserManager(page);
  }

  async executeFlow(flow: TestFlow): Promise<void> {
    this.currentFlow = flow;
    
    console.log(`🚀 Starting test flow: ${flow.name}`);
    console.log(`📋 Description: ${flow.description}`);
    
    let user: TestUser;
    
    try {
      // Login as the specified user
      user = await this.userManager.loginAs(flow.userRole);
      
      // Run setup if provided
      if (flow.setup) {
        console.log(`⚙️ Running setup for ${flow.name}`);
        await flow.setup(this.page, user);
      }
      
      // Execute each step sequentially
      for (let i = 0; i < flow.steps.length; i++) {
        const step = flow.steps[i];
        await this.executeStep(step, i + 1, user);
      }
      
      console.log(`✅ Test flow completed successfully: ${flow.name}`);
      
    } catch (error) {
      console.error(`❌ Test flow failed: ${flow.name}`, error);
      throw error;
    } finally {
      // Run teardown if provided
      if (flow.teardown && user!) {
        try {
          console.log(`🧹 Running teardown for ${flow.name}`);
          await flow.teardown(this.page, user);
        } catch (teardownError) {
          console.error(`⚠️ Teardown failed for ${flow.name}:`, teardownError);
        }
      }
      
      // Always attempt logout
      try {
        await this.userManager.logout();
      } catch (logoutError) {
        console.error(`⚠️ Logout failed:`, logoutError);
      }
    }
  }

  private async executeStep(step: TestStep, stepNumber: number, user: TestUser): Promise<void> {
    const timeout = step.timeout || 30000;
    
    console.log(`📝 Step ${stepNumber}: ${step.name}`);
    
    try {
      // Set a timeout for the step
      await Promise.race([
        step.action(this.page, user),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Step timeout after ${timeout}ms`)), timeout)
        )
      ]);
      
      // Wait for any async operations to complete
      await randomDelay();
      
      // Verify expected result if provided
      if (step.expectedResult) {
        await this.verifyExpectedResult(step.expectedResult);
      }
      
      console.log(`  ✅ Step ${stepNumber} completed: ${step.name}`);
      
    } catch (error) {
      console.error(`  ❌ Step ${stepNumber} failed: ${step.name}`, error);
      
      // Take screenshot on failure
      await this.page.screenshot({
        path: `test-results/step-failure-${stepNumber}-${Date.now()}.png`,
        fullPage: true
      });
      
      if (!step.skipOnFailure) {
        throw error;
      } else {
        console.log(`  ⚠️ Step ${stepNumber} failed but marked as skippable, continuing...`);
      }
    }
  }

  private async verifyExpectedResult(expectedResult: string): Promise<void> {
    // Try different ways to verify the expected result
    const checks = [
      // Check for text content
      () => expect(this.page.locator(`text=${expectedResult}`)).toBeVisible({ timeout: 5000 }),
      // Check for partial text match
      () => expect(this.page.locator(`text*=${expectedResult}`)).toBeVisible({ timeout: 5000 }),
      // Check for URL pattern
      () => expect(this.page).toHaveURL(new RegExp(expectedResult), { timeout: 5000 }),
      // Check for element with test id
      () => expect(this.page.locator(`[data-testid*="${expectedResult}"]`)).toBeVisible({ timeout: 5000 })
    ];
    
    let lastError: Error | null = null;
    
    for (const check of checks) {
      try {
        await check();
        return; // Success, exit early
      } catch (error) {
        lastError = error as Error;
        continue; // Try next check
      }
    }
    
    // If all checks failed, throw the last error
    if (lastError) {
      throw new Error(`Expected result verification failed: ${expectedResult}. Last error: ${lastError.message}`);
    }
  }

  async getCurrentUser(): Promise<TestUser | null> {
    return this.userManager.getCurrentUser();
  }

  async verifyFeatureAccess(userRole: string): Promise<void> {
    const features = getFeaturesForRole(userRole);
    console.log(`🔍 Verifying feature access for ${userRole} role (${features.length} features)`);
    
    for (const feature of features) {
      const hasAccess = await this.userManager.hasAccessToFeature(feature);
      console.log(`  ${hasAccess ? '✅' : '❌'} ${feature}`);
      
      if (!hasAccess) {
        throw new Error(`User with role ${userRole} should have access to ${feature}`);
      }
    }
  }
}

// Pre-defined common test steps
export const CommonSteps = {
  navigateToDashboard: (): TestStep => ({
    name: "Navigate to Dashboard",
    action: async (page: Page) => {
      await page.goto("/dashboard");
      await page.waitForLoadState("domcontentloaded");
    },
    expectedResult: "dashboard"
  }),

  verifyPageLoad: (pageName: string, path: string): TestStep => ({
    name: `Verify ${pageName} page loads`,
    action: async (page: Page) => {
      await page.goto(path);
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("body")).toBeVisible();
    },
    expectedResult: path.replace("/", "")
  }),

  fillForm: (formData: Record<string, string>): TestStep => ({
    name: "Fill form with test data",
    action: async (page: Page) => {
      for (const [selector, value] of Object.entries(formData)) {
        const element = page.locator(selector);
        await element.waitFor({ state: "visible", timeout: 10000 });
        await element.fill(value);
      }
    }
  }),

  clickSubmit: (buttonText: string = "Submit"): TestStep => ({
    name: `Click ${buttonText} button`,
    action: async (page: Page) => {
      const button = page.locator(`button:has-text("${buttonText}"), input[type="submit"][value="${buttonText}"]`);
      await button.waitFor({ state: "visible", timeout: 10000 });
      await button.click();
    }
  }),

  waitForResults: (timeout: number = 10000): TestStep => ({
    name: "Wait for results to load",
    action: async (page: Page) => {
      // Wait for loading indicators to disappear
      await page.locator(".loading, .spinner, [aria-busy='true']").waitFor({ 
        state: "hidden", 
        timeout 
      }).catch(() => {
        // Ignore if no loading indicators found
      });
      
      // Wait for results container to appear
      await page.locator(".results, .output, [data-testid*='result']").waitFor({ 
        state: "visible", 
        timeout 
      }).catch(() => {
        // Ignore if no results container found
      });
    },
    timeout
  }),

  takeScreenshot: (name: string): TestStep => ({
    name: `Take screenshot: ${name}`,
    action: async (page: Page) => {
      await page.screenshot({
        path: `test-results/flow-${name}-${Date.now()}.png`,
        fullPage: true
      });
    },
    skipOnFailure: true
  })
};
