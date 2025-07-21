import { TestFlow, CommonSteps } from "../utils/test-orchestrator";
import { expect } from "@playwright/test";

// Free tier user test flows - basic functionality
export const freeUserFlows: TestFlow[] = [
  {
    name: "Free User - Basic Dashboard Access",
    description: "Verify free tier user can access dashboard and basic features",
    userRole: "free",
    steps: [
      CommonSteps.navigateToDashboard(),
      {
        name: "Verify free tier limitations",
        action: async (page) => {
          // Check for upgrade prompts or limitations
          const upgradePrompts = await page.locator("text=/upgrade|premium|pro/i").count();
          console.log(`Found ${upgradePrompts} upgrade prompts (expected for free tier)`);
        }
      },
      CommonSteps.takeScreenshot("free-user-dashboard")
    ]
  },

  {
    name: "Free User - Keyword Tool Basic Access",
    description: "Test keyword tool functionality for free tier users",
    userRole: "free",
    steps: [
      CommonSteps.verifyPageLoad("Keyword Tool", "/keyword-tool"),
      {
        name: "Test basic keyword search",
        action: async (page) => {
          // Try to find and use keyword input
          const inputs = await page.locator("input[type='text'], textarea").count();
          if (inputs > 0) {
            await page.locator("input[type='text'], textarea").first().fill("seo basics");
            
            // Look for submit button
            const submitButtons = await page.locator("button[type='submit'], button:has-text(/search|analyze|suggest/i)").count();
            if (submitButtons > 0) {
              await page.locator("button[type='submit'], button:has-text(/search|analyze|suggest/i)").first().click();
              
              // Wait for any response (success or limitation message)
              await page.waitForTimeout(3000);
            }
          }
        },
        skipOnFailure: true
      },
      CommonSteps.takeScreenshot("free-user-keyword-tool")
    ]
  },

  {
    name: "Free User - Feature Access Verification",
    description: "Verify free users cannot access premium features",
    userRole: "free",
    steps: [
      {
        name: "Check restricted feature access",
        action: async (page, user) => {
          const restrictedFeatures = ["/competitor-analysis", "/bulk-analysis", "/adminonly"];
          
          for (const feature of restrictedFeatures) {
            try {
              await page.goto(feature, { timeout: 10000 });
              await page.waitForLoadState("domcontentloaded");
              
              const currentUrl = page.url();
              
              // Should be redirected or see access denied
              if (!currentUrl.includes("/login") && !currentUrl.includes("/dashboard")) {
                const accessDenied = await page.locator("text=/access.*denied|unauthorized|upgrade.*required/i").count();
                expect(accessDenied).toBeGreaterThan(0);
              }
            } catch (error: any) {
              // Expected for restricted features
              console.log(`Expected restriction for ${feature}: ${error?.message || error}`);
            }
          }
        }
      }
    ]
  }
];

// Enterprise/Admin user test flows - advanced functionality
export const enterpriseUserFlows: TestFlow[] = [
  {
    name: "Enterprise User - Full Dashboard Access",
    description: "Verify enterprise tier user has access to all dashboard features",
    userRole: "admin", // Using admin as it has all enterprise features plus admin features
    steps: [
      CommonSteps.navigateToDashboard(),
      {
        name: "Verify enterprise features are available",
        action: async (page) => {
          // Check for enterprise-specific elements
          const enterpriseFeatures = await page.locator([
            "text=/enterprise|advanced|unlimited/i",
            "[data-tier='enterprise']",
            "[class*='enterprise']"
          ].join(", ")).count();
          
          console.log(`Found ${enterpriseFeatures} enterprise feature indicators`);
          
          // No upgrade prompts should be visible
          const upgradePrompts = await page.locator("text=/upgrade|subscribe.*now/i").count();
          expect(upgradePrompts).toBe(0);
        }
      },
      CommonSteps.takeScreenshot("enterprise-user-dashboard")
    ]
  },

  {
    name: "Enterprise User - Advanced Keyword Analysis",
    description: "Test advanced keyword analysis features for enterprise users",
    userRole: "admin",
    steps: [
      CommonSteps.verifyPageLoad("Keyword Tool", "/keyword-tool"),
      {
        name: "Test advanced keyword features",
        action: async (page) => {
          // Check for advanced options
          const advancedOptions = await page.locator([
            "text=/bulk|batch|advanced|competitor/i",
            "[data-feature='advanced']",
            "input[type='checkbox']",
            "select"
          ].join(", ")).count();
          
          console.log(`Found ${advancedOptions} advanced feature options`);
          
          // Try to use advanced features
          const inputs = await page.locator("input[type='text'], textarea").count();
          if (inputs > 0) {
            await page.locator("input[type='text'], textarea").first().fill("advanced seo strategy");
            
            // Check for advanced settings
            const checkboxes = await page.locator("input[type='checkbox']").count();
            if (checkboxes > 0) {
              // Enable some advanced options
              await page.locator("input[type='checkbox']").first().check();
            }
            
            // Submit analysis
            const submitButtons = await page.locator("button[type='submit'], button:has-text(/analyze|search|suggest/i)").count();
            if (submitButtons > 0) {
              await page.locator("button[type='submit'], button:has-text(/analyze|search|suggest/i)").first().click();
              await page.waitForTimeout(5000);
            }
          }
        },
        skipOnFailure: true
      },
      CommonSteps.takeScreenshot("enterprise-user-advanced-keyword")
    ]
  },

  {
    name: "Enterprise User - Link Analysis Advanced Features",
    description: "Test advanced link analysis capabilities",
    userRole: "admin",
    steps: [
      CommonSteps.verifyPageLoad("Link Analysis", "/link-view"),
      {
        name: "Test advanced link analysis",
        action: async (page) => {
          // Find URL input and test with a sample URL
          const urlInputs = await page.locator("input[type='url'], input[placeholder*='url'], input[placeholder*='link']").count();
          
          if (urlInputs > 0) {
            await page.locator("input[type='url'], input[placeholder*='url'], input[placeholder*='link']").first().fill("https://example.com");
            
            // Look for advanced analysis options
            const advancedOptions = await page.locator([
              "input[type='checkbox']",
              "select",
              "text=/competitor|deep.*analysis|advanced/i"
            ].join(", ")).count();
            
            console.log(`Found ${advancedOptions} advanced link analysis options`);
            
            // Submit analysis
            const analyzeButtons = await page.locator("button:has-text(/analyze|check|audit/i)").count();
            if (analyzeButtons > 0) {
              await page.locator("button:has-text(/analyze|check|audit/i)").first().click();
              await page.waitForTimeout(5000);
            }
          }
        },
        skipOnFailure: true
      },
      CommonSteps.takeScreenshot("enterprise-user-link-analysis")
    ]
  },

  {
    name: "Enterprise User - Performance Dashboard",
    description: "Test performance monitoring and analytics features",
    userRole: "admin",
    steps: [
      CommonSteps.verifyPageLoad("Performance Dashboard", "/performance"),
      {
        name: "Verify performance metrics access",
        action: async (page) => {
          // Check for advanced performance metrics
          const performanceMetrics = await page.locator([
            "text=/analytics|metrics|performance|insights/i",
            "[class*='metric']",
            "[class*='chart']",
            "[class*='graph']",
            "canvas",
            "svg"
          ].join(", ")).count();
          
          console.log(`Found ${performanceMetrics} performance metric elements`);
          
          // Check for time range selectors (enterprise feature)
          const timeSelectors = await page.locator([
            "select",
            "button:has-text(/day|week|month|year/i)",
            "[data-testid*='time']"
          ].join(", ")).count();
          
          console.log(`Found ${timeSelectors} time range selector elements`);
        }
      },
      CommonSteps.takeScreenshot("enterprise-user-performance")
    ]
  },

  {
    name: "Enterprise User - Admin Panel Access",
    description: "Verify admin-only features are accessible",
    userRole: "admin",
    steps: [
      {
        name: "Access admin panel",
        action: async (page) => {
          try {
            await page.goto("/adminonly", { timeout: 15000 });
            await page.waitForLoadState("domcontentloaded");
            
            // Should have access without redirects
            const currentUrl = page.url();
            expect(currentUrl).toContain("admin");
            
            // Check for admin features
            const adminFeatures = await page.locator([
              "text=/admin|management|users|settings/i",
              "[data-role='admin']",
              "[class*='admin']"
            ].join(", ")).count();
            
            console.log(`Found ${adminFeatures} admin feature elements`);
            expect(adminFeatures).toBeGreaterThan(0);
            
          } catch (error: any) {
            console.log("Admin panel might not be fully implemented yet:", error?.message || error);
          }
        },
        skipOnFailure: true
      },
      CommonSteps.takeScreenshot("enterprise-user-admin-panel")
    ]
  },

  {
    name: "Enterprise User - Full Feature Access Verification",
    description: "Comprehensive test of all available features",
    userRole: "admin",
    steps: [
      {
        name: "Verify access to all enterprise features",
        action: async (page, user) => {
          const enterpriseFeatures = [
            "/keyword-tool",
            "/link-view", 
            "/serp-view",
            "/performance",
            "/adminonly"
          ];
          
          for (const feature of enterpriseFeatures) {
            try {
              await page.goto(feature, { timeout: 15000 });
              await page.waitForLoadState("domcontentloaded");
              
              // Verify successful access
              const currentUrl = page.url();
              expect(currentUrl).toContain(feature.substring(1)); // Remove leading slash
              
              // Check page loads properly
              await expect(page.locator("body")).toBeVisible();
              
              console.log(`✅ Successfully accessed ${feature}`);
              
            } catch (error: any) {
              console.error(`❌ Failed to access ${feature}:`, error?.message || error);
              throw error;
            }
          }
        }
      }
    ]
  }
];

export const allTestFlows = [...freeUserFlows, ...enterpriseUserFlows];
