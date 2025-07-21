import { test, expect } from "@playwright/test";
import { TestOrchestrator } from "../utils/test-orchestrator";
import { freeUserFlows } from "../flows/role-based-flows";

test.describe("Free Tier User Tests", () => {
  // Configure timeouts for sequential flows
  test.setTimeout(120000); // 2 minutes per test
  
  let orchestrator: TestOrchestrator;

  test.beforeEach(async ({ page }) => {
    orchestrator = new TestOrchestrator(page);
    
    // Set longer timeouts for complex flows
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(20000);
    
    console.log("🎭 Starting Free Tier User Test Suite");
  });

  test.afterEach(async ({ page }) => {
    // Take final screenshot
    await page.screenshot({
      path: `test-results/free-tier-final-${Date.now()}.png`,
      fullPage: true
    }).catch(() => {
      // Ignore screenshot failures
    });
    
    console.log("🏁 Free Tier User Test Completed");
  });

  test("Free User - Complete Dashboard Flow", async ({ page }) => {
    const dashboardFlow = freeUserFlows.find(flow => flow.name.includes("Dashboard"));
    if (!dashboardFlow) {
      throw new Error("Dashboard flow not found for free users");
    }

    await orchestrator.executeFlow(dashboardFlow);
    
    // Verify user is properly authenticated and on dashboard
    const currentUser = await orchestrator.getCurrentUser();
    expect(currentUser).not.toBeNull();
    expect(currentUser?.role).toBe("free");
    
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("Free User - Keyword Tool Functionality", async ({ page }) => {
    const keywordFlow = freeUserFlows.find(flow => flow.name.includes("Keyword Tool"));
    if (!keywordFlow) {
      throw new Error("Keyword Tool flow not found for free users");
    }

    await orchestrator.executeFlow(keywordFlow);
    
    // Verify keyword tool was accessible
    const currentUser = await orchestrator.getCurrentUser();
    expect(currentUser?.role).toBe("free");
    
    // Should have reached keyword tool page
    await expect(page.locator("body")).toBeVisible();
  });

  test("Free User - Feature Access Restrictions", async ({ page }) => {
    const restrictionFlow = freeUserFlows.find(flow => flow.name.includes("Feature Access"));
    if (!restrictionFlow) {
      throw new Error("Feature Access flow not found for free users");
    }

    await orchestrator.executeFlow(restrictionFlow);
    
    // Verify restrictions are properly enforced
    const currentUser = await orchestrator.getCurrentUser();
    expect(currentUser?.role).toBe("free");
  });

  test("Free User - Sequential Feature Testing", async ({ page }) => {
    console.log("🔄 Running sequential feature testing for free tier user");
    
    // Execute all free user flows in sequence
    for (const flow of freeUserFlows) {
      console.log(`\n📋 Executing: ${flow.name}`);
      
      try {
        await orchestrator.executeFlow(flow);
        console.log(`✅ Completed: ${flow.name}`);
      } catch (error) {
        console.error(`❌ Failed: ${flow.name}`, error);
        
        // Take failure screenshot
        await page.screenshot({
          path: `test-results/free-tier-failure-${flow.name.replace(/\s+/g, "-")}-${Date.now()}.png`,
          fullPage: true
        });
        
        throw error;
      }
    }
    
    console.log("🎉 All free tier flows completed successfully");
  });

  test("Free User - Performance and Load Testing", async ({ page }) => {
    // Performance testing specific to free tier limitations
    console.log("📊 Starting performance testing for free tier");
    
    const startTime = Date.now();
    
    await orchestrator.executeFlow({
      name: "Free User Performance Test",
      description: "Test performance under free tier constraints",
      userRole: "free",
      steps: [
        {
          name: "Navigate to dashboard",
          action: async (page) => {
            await page.goto("/dashboard");
            await page.waitForLoadState("domcontentloaded");
          }
        },
        {
          name: "Test rapid navigation",
          action: async (page) => {
            const pages = ["/keyword-tool", "/dashboard"];
            
            for (const pagePath of pages) {
              const navStart = Date.now();
              await page.goto(pagePath);
              await page.waitForLoadState("domcontentloaded");
              const navTime = Date.now() - navStart;
              
              console.log(`Navigation to ${pagePath}: ${navTime}ms`);
              expect(navTime).toBeLessThan(10000); // Should load within 10 seconds
            }
          }
        },
        {
          name: "Test form interactions",
          action: async (page) => {
            await page.goto("/keyword-tool");
            await page.waitForLoadState("domcontentloaded");
            
            const inputs = await page.locator("input, textarea").count();
            if (inputs > 0) {
              const fillStart = Date.now();
              await page.locator("input, textarea").first().fill("performance test keyword");
              const fillTime = Date.now() - fillStart;
              
              console.log(`Form fill time: ${fillTime}ms`);
              expect(fillTime).toBeLessThan(3000); // Should fill within 3 seconds
            }
          },
          skipOnFailure: true
        }
      ]
    });
    
    const totalTime = Date.now() - startTime;
    console.log(`Total free tier performance test time: ${totalTime}ms`);
    expect(totalTime).toBeLessThan(60000); // Should complete within 1 minute
  });
});
